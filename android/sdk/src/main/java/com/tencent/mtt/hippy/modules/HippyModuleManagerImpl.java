/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.modules;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;

import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.bridge.HippyCallNativeParams;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModuleInvocationHandler;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;

import java.lang.reflect.Proxy;
import java.util.*;

/**
 * FileName: HippyModuleManagerImpl
 * Description：
 * History：
 */
public class HippyModuleManagerImpl implements HippyModuleManager, Handler.Callback
{

	private static final int														MSG_CODE_CALL_NATIVES	= 1;
	private static final int														MSG_CODE_DESTROY_MODULE	= 2;
	//Only multi-threaded read
	private HashMap<String, HippyNativeModuleInfo>									mNativeModuleInfo;
	//Only multi-threaded read
	private HashMap<Class<? extends HippyJavaScriptModule>, HippyJavaScriptModule>	mJsModules;
	private HippyEngineContext														mContext;
	private boolean																	isDestroyed				= false;
	private volatile Handler														mUIThreadHandler;
	private volatile Handler														mBridgeThreadHandler;
	private volatile Handler														mDomThreadHandler;
	private HippyModuleANRMonitor													mANRMonitor;

	public HippyModuleManagerImpl(HippyEngineContext context, List<HippyAPIProvider> packages)
	{
		this.mContext = context;
		mANRMonitor = new HippyModuleANRMonitor(mContext);
		mNativeModuleInfo = new HashMap<>();
		mJsModules = new HashMap<>();
		for (HippyAPIProvider pckg : packages)
		{
			Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> nativeModules = pckg.getNativeModules(context);
			if (nativeModules != null && nativeModules.size() > 0)
			{
				Set<Class<? extends HippyNativeModuleBase>> keys = nativeModules.keySet();
				for (Class cls : keys)
				{
					HippyNativeModuleInfo moduleInfo = new HippyNativeModuleInfo(cls, nativeModules.get(cls));
					if (mNativeModuleInfo.containsKey(moduleInfo.getName()))
					{
						throw new RuntimeException("There is already a native module named : " + moduleInfo.getName());
					}
					mNativeModuleInfo.put(moduleInfo.getName(), moduleInfo);
				}
			}


			List<Class<? extends HippyJavaScriptModule>> jsModules = pckg.getJavaScriptModules();
			if (jsModules != null && jsModules.size() > 0)
			{
				for (Class cls : jsModules)
				{
					String name = getJavaScriptModuleName(cls);
					if (mJsModules.containsKey(name))
					{
						throw new RuntimeException("There is already a javascript module named : " + name);
					}
					mJsModules.put(cls, null);
				}
			}

		}
	}

	@Override
	public void destroy()
	{
		if (mBridgeThreadHandler != null)
		{
			mBridgeThreadHandler.removeMessages(MSG_CODE_CALL_NATIVES);
		}
		if (mDomThreadHandler != null)
		{
			mDomThreadHandler.removeMessages(MSG_CODE_CALL_NATIVES);
		}
		if (mUIThreadHandler != null)
		{
			mUIThreadHandler.removeMessages(MSG_CODE_CALL_NATIVES);
		}

		if (mANRMonitor != null)
		{
			mANRMonitor.checkMonitor();
		}

		//Must be thrown bridge thread to complete
		isDestroyed = true;
		Iterator<Map.Entry<String, HippyNativeModuleInfo>> iterator = mNativeModuleInfo.entrySet().iterator();
		Map.Entry<String, HippyNativeModuleInfo> entry;
		HippyNativeModuleInfo moduleInfo;
		while (iterator.hasNext())
		{
			entry = iterator.next();
			if (entry != null)
			{
				moduleInfo = entry.getValue();
				if (moduleInfo != null)
				{
					if (moduleInfo.getThread() == HippyNativeModule.Thread.DOM)
					{
						if (mDomThreadHandler != null)
						{
							Message msg = mDomThreadHandler.obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
							mDomThreadHandler.sendMessage(msg);
						}
					}
					else if (moduleInfo.getThread() == HippyNativeModule.Thread.MAIN)
					{
						if (mUIThreadHandler != null)
						{
							Message msg = mUIThreadHandler.obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
							mUIThreadHandler.sendMessage(msg);
						}
					}
					else
					{
						if (mBridgeThreadHandler != null)
						{
							Message msg = mBridgeThreadHandler.obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
							mBridgeThreadHandler.sendMessage(msg);
						}
					}
				}
			}
		}
		mNativeModuleInfo.clear();
	}

	@Override
	public void callNatives(HippyCallNativeParams params)
	{
		if (isDestroyed)
		{
			return;
		}
		HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(params.mModuleName);
		if (moduleInfo == null)
		{
			PromiseImpl promise = new PromiseImpl(mContext, params.mModuleName, params.mModuleFunc, params.mCallId);
			promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, "module can not be found");
			return;
		}

		if (moduleInfo.getThread() == HippyNativeModule.Thread.DOM)
		{
			Handler handler = getDomThreadHandler();
			Message msg = handler.obtainMessage(MSG_CODE_CALL_NATIVES, params);
			handler.sendMessage(msg);
		}
		else if (moduleInfo.getThread() == HippyNativeModule.Thread.MAIN)
		{
			Handler handler = getUIThreadHandler();
			Message msg = handler.obtainMessage(MSG_CODE_CALL_NATIVES, params);
			handler.sendMessage(msg);
		}
		else
		{
			Handler handler = getBridgeThreadHandler();
			Message msg = handler.obtainMessage(MSG_CODE_CALL_NATIVES, params);
			handler.sendMessage(msg);
		}
	}

	@Override
	public synchronized <T extends HippyJavaScriptModule> T getJavaScriptModule(Class<T> cls)
	{
		HippyJavaScriptModule module = mJsModules.get(cls);
		if (module != null)
		{
			return (T) module;
		}
		ClassLoader clsLoader = cls.getClassLoader();
		if(clsLoader == null)
		{
			return null;
		}
		HippyJavaScriptModule moduleProxy = (HippyJavaScriptModule) Proxy.newProxyInstance(clsLoader, new Class[] { cls },
				new HippyJavaScriptModuleInvocationHandler(mContext, getJavaScriptModuleName(cls)));
		mJsModules.remove(cls);
		mJsModules.put(cls, moduleProxy);
		return (T) moduleProxy;
	}

	@Override
	public synchronized <T extends HippyNativeModuleBase> T getNativeModule(Class<T> cls)
	{
		HippyNativeModule annotation = (HippyNativeModule) cls.getAnnotation(HippyNativeModule.class);
		if (annotation != null)
		{
			String name = annotation.name();
			HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(name);
			if (moduleInfo != null)
			{
				return (T) moduleInfo.getInstance();
			}
		}
		return null;
	}

	void doCallNatives(String moduleName, String moduleFunc, String callId, HippyArray params)
	{
		if (mContext != null) {
			HippyEngineMonitorAdapter monitorAdapter = mContext.getGlobalConfigs().getEngineMonitorAdapter();
			if (monitorAdapter != null) {
				monitorAdapter.reportDoCallNatives(moduleName, moduleFunc);
			}
		}

		PromiseImpl promise = new PromiseImpl(mContext, moduleName, moduleFunc, callId);
		try
		{
			HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(moduleName);
			if (moduleInfo == null)
			{
				promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, "module can not be found");
				return;
			}

			moduleInfo.initialize();
			HippyNativeModuleInfo.HippyNativeMethod method = moduleInfo.findMethod(moduleFunc);
			if (method == null)
			{
				promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, "module function can not be found");
				return;
			}
			method.invoke(mContext, moduleInfo.getInstance(), params, promise);
		}
		catch (Throwable e)
		{
			promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, e.getMessage());
		}
	}

	private String getJavaScriptModuleName(Class cls)
	{
		String name = cls.getSimpleName();
		int dollarSignIndex = name.lastIndexOf('$');
		if (dollarSignIndex != -1)
		{
			name = name.substring(dollarSignIndex + 1);
		}
		return name;
	}

	private Handler getDomThreadHandler()
	{
		if (mDomThreadHandler == null)
		{
			synchronized (HippyModuleManagerImpl.class)
			{
				if (mDomThreadHandler == null)
				{
					mDomThreadHandler = new Handler(mContext.getThreadExecutor().getDomThread().getLooper(), this);
				}
			}
		}
		return mDomThreadHandler;
	}

	private Handler getUIThreadHandler()
	{
		if (mUIThreadHandler == null)
		{
			synchronized (HippyModuleManagerImpl.class)
			{
				if (mUIThreadHandler == null)
				{
					mUIThreadHandler = new Handler(Looper.getMainLooper(), this);
				}
			}
		}
		return mUIThreadHandler;
	}

	private Handler getBridgeThreadHandler()
	{
		if (mBridgeThreadHandler == null)
		{
			synchronized (HippyModuleManagerImpl.class)
			{
				if (mBridgeThreadHandler == null)
				{
					mBridgeThreadHandler = new Handler(mContext.getThreadExecutor().getJsBridgeThread().getLooper(), this);
				}
			}
		}
		return mBridgeThreadHandler;
	}

	@Override
	public boolean handleMessage(Message msg)
	{

		switch (msg.what)
		{
			case MSG_CODE_CALL_NATIVES:
			{
				HippyCallNativeParams param = null;
				int id = -1;
				try
				{
					param = (HippyCallNativeParams) msg.obj;
					HippyArray array = param.mParams;
					id = mANRMonitor.startMonitor(param.mModuleName, param.mModuleFunc);
					doCallNatives(param.mModuleName, param.mModuleFunc, param.mCallId, array);
				}
				catch (Throwable e)
				{
				}
				finally
				{
					if (param != null)
					{
						param.onDispose();
					}

					if (id >= 0) {
						mANRMonitor.endMonitor(id);
					}
				}
				return true;
			}
			case MSG_CODE_DESTROY_MODULE:
			{
				try
				{
					HippyNativeModuleInfo moduleInfo = (HippyNativeModuleInfo) msg.obj;
					moduleInfo.destroy();
				}
				catch (Throwable e)
				{

				}
				return true;
			}
		}
		return false;
	}
}
