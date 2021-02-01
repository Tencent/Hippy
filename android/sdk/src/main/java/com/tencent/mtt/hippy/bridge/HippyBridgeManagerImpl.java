/*
 * Tencent is pleased to support the open source community by making Hippy
 * available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.bridge;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
import com.tencent.mtt.hippy.adapter.thirdparty.HippyThirdPartyAdapter;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.GrowByteBuffer;
import com.tencent.mtt.hippy.utils.UIThreadUtils;

import java.util.ArrayList;

public class HippyBridgeManagerImpl implements HippyBridgeManager, HippyBridge.BridgeCallback, Handler.Callback
{
	static final int		MSG_CODE_INIT_BRIDGE				= 10;
	static final int		MSG_CODE_RUN_BUNDLE					= 11;
	static final int		MSG_CODE_CALL_FUNCTION				= 12;
	static final int		MSG_CODE_DESTROY_BRIDGE				= 13;

	static final int		FUNCTION_ACTION_LOAD_INSTANCE		= 1;
	static final int		FUNCTION_ACTION_RESUME_INSTANCE		= 2;
	static final int		FUNCTION_ACTION_PAUSE_INSTANCE		= 3;
	static final int		FUNCTION_ACTION_DESTROY_INSTANCE	= 4;
	static final int		FUNCTION_ACTION_CALLBACK			= 5;
	static final int		FUNCTION_ACTION_CALL_JSMODULE		= 6;
	public static final int	BRIDGE_TYPE_SINGLE_THREAD			= 2;
	public static final int	BRIDGE_TYPE_NORMAL					= 1;
	public static final int	BRIDGE_TYPE_REMOTE_DEBUG			= 0;

	private static final boolean	USE_NEW_COMM_TYPE			= false;

	HippyEngineContext		mContext;
	HippyBundleLoader		mCoreBundleLoader;
	HippyBridge				mHippyBridge;
	volatile boolean		mIsInit								= false;
	Handler					mHandler;
	int						mBridgeType							= BRIDGE_TYPE_NORMAL;
	boolean					mEnableHippyBuffer					= false;
	ArrayList<String>		mLoadedBundleInfo					= null;
	private GrowByteBuffer  mGrowByteBuffer;
	private StringBuilder   mStringBuilder;
	private boolean         mIsDevModule                        = false;
	private String          mDebugServerHost;
	private int				mGroupId;
	private HippyThirdPartyAdapter mThirdPartyAdapter;
	HippyEngine.ModuleListener mLoadModuleListener;

	public HippyBridgeManagerImpl(HippyEngineContext context, HippyBundleLoader coreBundleLoader, int bridgeType,
			boolean enableHippyBuffer, boolean isDevModule, String debugServerHost, int groupId, HippyThirdPartyAdapter thirdPartyAdapter)
	{
		this.mContext = context;
		this.mCoreBundleLoader = coreBundleLoader;
		this.mBridgeType = bridgeType;
		this.mEnableHippyBuffer = enableHippyBuffer;
		this.mIsDevModule = isDevModule;
		this.mDebugServerHost = debugServerHost;
		this.mGroupId = groupId;
		mThirdPartyAdapter = thirdPartyAdapter;

		if (USE_NEW_COMM_TYPE)
		{
			mGrowByteBuffer = new GrowByteBuffer(1024);
		}
		else
		{
			mStringBuilder = new StringBuilder(1024);
		}
	}

	@Override
	public boolean handleMessage(Message msg)
	{
		try
		{
			switch (msg.what)
			{
				case MSG_CODE_INIT_BRIDGE:
				{
					mContext.getStartTimeMonitor().startEvent(HippyEngineMonitorEvent.ENGINE_LOAD_EVENT_INIT_BRIDGE);
					final com.tencent.mtt.hippy.common.Callback<Boolean> callback = (com.tencent.mtt.hippy.common.Callback<Boolean>) msg.obj;
					try
					{
						mHippyBridge = new HippyBridgeImpl(mContext, HippyBridgeManagerImpl.this,
								mBridgeType == BRIDGE_TYPE_SINGLE_THREAD, !mEnableHippyBuffer, this.mIsDevModule, this.mDebugServerHost);

						mHippyBridge.initJSBridge(getGlobalConfigs(), new NativeCallback(mHandler) {
							@Override
							public void Call(long value, Message msg, String action) {

								if (mThirdPartyAdapter != null) {
                  					mThirdPartyAdapter.onRuntimeInit(value);
								}
								mContext.getStartTimeMonitor().startEvent(HippyEngineMonitorEvent.ENGINE_LOAD_EVENT_LOAD_COMMONJS);
								boolean flag = true;
								if (mCoreBundleLoader != null) {

									mCoreBundleLoader.load(mHippyBridge, new NativeCallback(mHandler) {
										@Override
										public void Call(long value, Message msg, String action) {
											mIsInit = value == 1;
											RuntimeException exception = null;
											if (!mIsInit) {
												exception = new RuntimeException("load coreJsBundle failed,check your core jsBundle");
											}
											callback.callback(mIsInit, exception);
										}
									});
								} else {
									flag = true;
									mIsInit = flag;
									callback.callback(mIsInit, null);
								}
							}
						}, mGroupId);
					}
					catch (Throwable e)
					{
						mIsInit = false;
						callback.callback(false, e);
					}
					return true;
				}
				case MSG_CODE_RUN_BUNDLE:
				{
					HippyRootView rootView = null;
					if (msg.arg2 > 0)
					{
						rootView = mContext.getInstance(msg.arg2);
						if (rootView != null && rootView.getTimeMonitor() != null)
						{
							rootView.getTimeMonitor().startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_LOAD_BUNDLE);
						}
					}
					HippyBundleLoader loader = (HippyBundleLoader) msg.obj;
					if (!mIsInit || loader == null)
					{
						notifyModuleLoaded(HippyEngine.STATUS_WRONG_STATE, "load module error. HippyBridge mIsInit:" + mIsInit + ", loader:" + loader, null);
						return true;
					}
					final String bundleUniKey = loader.getBundleUniKey();
					if (loader != null && mLoadedBundleInfo != null && !TextUtils.isEmpty(bundleUniKey) && mLoadedBundleInfo.contains(bundleUniKey))
					{
						notifyModuleLoaded(HippyEngine.STATUS_VARIABLE_UNINIT, "load module error. loader.getBundleUniKey=null",null);
						return true;
					}

					final HippyRootView localRootView = rootView;
					if (!TextUtils.isEmpty(bundleUniKey)) {
						loader.load(mHippyBridge, new NativeCallback(mHandler) {
							@Override
							public void Call(long value, Message msg, String action) {
								boolean success = value == 1 ? true : false;
								if (success) {
									if (mLoadedBundleInfo == null) {
										mLoadedBundleInfo = new ArrayList<>();
									}
									mLoadedBundleInfo.add(bundleUniKey);
									if(localRootView != null)
										notifyModuleLoaded(HippyEngine.STATUS_OK, null, localRootView);
									else
										notifyModuleLoaded(HippyEngine.STATUS_WRONG_STATE, "load module error. loader.load failed. check the file.", null);
								} else {
									notifyModuleLoaded(HippyEngine.STATUS_WRONG_STATE, "load module error. loader.load failed. check the file.", null);
								}
							}
						});
					} else {
						notifyModuleLoaded(HippyEngine.STATUS_VARIABLE_UNINIT, "load module error. loader.getBundleUniKey=null",null);
					}

					return true;
				}
				case MSG_CODE_CALL_FUNCTION:
				{
					String action = null;

					if (!mIsInit)
					{
						return true;
					}

					switch (msg.arg2)
					{
						case FUNCTION_ACTION_LOAD_INSTANCE:
							if (msg.obj instanceof HippyMap)
							{
								int instanceId = ((HippyMap) msg.obj).getInt("id");
								HippyRootView rootView = mContext.getInstance(instanceId);
								if (rootView != null && rootView.getTimeMonitor() != null)
								{
									rootView.getTimeMonitor().startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_RUN_BUNDLE);
								}
							}
							action = "loadInstance";
							break;
						case FUNCTION_ACTION_RESUME_INSTANCE:
							action = "resumeInstance";
							break;
						case FUNCTION_ACTION_PAUSE_INSTANCE:
							action = "pauseInstance";
							break;
						case FUNCTION_ACTION_DESTROY_INSTANCE:
							action = "destroyInstance";
							break;
						case FUNCTION_ACTION_CALLBACK:
							action = "callBack";
							break;
						case FUNCTION_ACTION_CALL_JSMODULE:
							action = "callJsModule";
							break;
					}

					if (USE_NEW_COMM_TYPE)
					{
						// 新的通信方式
						ArgumentUtils.covertObject2JsonByte(mGrowByteBuffer, msg.obj);

						if (TextUtils.equals(action, "loadInstance"))
						{
							mHippyBridge.callFunction(action, mGrowByteBuffer.getValue(), 0, mGrowByteBuffer.length(), new NativeCallback(mHandler, Message.obtain(msg), action) {
								@Override
								public void Call(long value, Message msg, String action) {
									if (msg.obj instanceof HippyMap)
									{
										int instanceId = ((HippyMap) msg.obj).getInt("id");
										HippyRootView rootView = mContext.getInstance(instanceId);
										if (rootView != null && rootView.getTimeMonitor() != null)
										{
											rootView.getTimeMonitor().startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_CREATE_VIEW);
										}
									}
								}
							});
						}
						else
						{
							mHippyBridge.callFunction(action, mGrowByteBuffer.getValue(), 0, mGrowByteBuffer.length(), null);
						}
					}
					else
					{
						// 老的通信方式
                        mStringBuilder.setLength(0);
						String json = ArgumentUtils.objectToJsonOpt(msg.obj, mStringBuilder);

						if (TextUtils.equals(action, "loadInstance"))
						{
							mHippyBridge.callFunction(action, json, new NativeCallback(mHandler, Message.obtain(msg), action) {
								@Override
								public void Call(long value, Message msg, String action) {
									if (msg.obj instanceof HippyMap)
									{
										int instanceId = ((HippyMap) msg.obj).getInt("id");
										HippyRootView rootView = mContext.getInstance(instanceId);
										if (rootView != null && rootView.getTimeMonitor() != null)
										{
											rootView.getTimeMonitor().startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_CREATE_VIEW);
										}
									}
								}
							});
						}
						else
						{
							mHippyBridge.callFunction(action, json, null);
						}
					}
					return true;
				}
				case MSG_CODE_DESTROY_BRIDGE:
				{
					if (mThirdPartyAdapter != null) {
						mThirdPartyAdapter.onRuntimeDestroy();
					}

					final com.tencent.mtt.hippy.common.Callback<Boolean> destroyCallback = (com.tencent.mtt.hippy.common.Callback<Boolean>) msg.obj;
					mHippyBridge.destroy(new NativeCallback(mHandler) {
						@Override
						public void Call(long value, Message msg, String action) {
							Boolean success = value == 1 ? true : false;
							mHippyBridge.onDestroy();
							if (destroyCallback != null) {
								RuntimeException exception = null;
								if (!success) {
									exception = new RuntimeException("destroy core failed!!! msg.what=" + msg.what);
								}

								destroyCallback.callback(success, exception);
							}
						}
					});
					return true;
				}
			}
		}
		catch (Throwable e)
		{
		}
		return false;
	}

	@Override
	public void initBridge(Callback<Boolean> callback)
	{
		mHandler = new Handler(mContext.getThreadExecutor().getJsThread().getLooper(), this);
		Message message = mHandler.obtainMessage(MSG_CODE_INIT_BRIDGE, callback);
		mHandler.sendMessage(message);
	}

	@Override
	public void runBundle(int id, HippyBundleLoader loader, HippyEngine.ModuleListener listener,HippyRootView hippyRootView)
	{
		if (!mIsInit)
		{
			mLoadModuleListener = listener;
			notifyModuleLoaded(HippyEngine.STATUS_WRONG_STATE, "load module error. HippyBridge not initialized",hippyRootView);
			return;
		}
		mLoadModuleListener = listener;
		Message message = mHandler.obtainMessage(MSG_CODE_RUN_BUNDLE, 0, id, loader);
		mHandler.sendMessage(message);
	}

  public void notifyModuleJsException(final HippyJsException exception)
  {
    if (UIThreadUtils.isOnUiThread()) {
      if(mLoadModuleListener != null && mLoadModuleListener.onJsException(exception)) {
        mLoadModuleListener = null;
      }
    }
    else
    {
      UIThreadUtils.runOnUiThread(new Runnable()
      {
        @Override
        public void run()
        {
          if(mLoadModuleListener != null && mLoadModuleListener.onJsException(exception)) {
            mLoadModuleListener = null;
          }
        }
      });
    }
  }

  private void notifyModuleLoaded(final int statusCode, final String msg,final HippyRootView hippyRootView)
  {
    if (UIThreadUtils.isOnUiThread()) {
      if(mLoadModuleListener != null) {
        mLoadModuleListener.onInitialized(statusCode, msg,hippyRootView);
        //mLoadModuleListener = null;
      }
    }
    else
    {
      UIThreadUtils.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          if(mLoadModuleListener != null) {
            mLoadModuleListener.onInitialized(statusCode, msg, hippyRootView);
            //mLoadModuleListener = null;
          }
        }
      });
    }
  }

	@Override
	public void loadInstance(String name, int id, HippyMap params)
	{
		if (!mIsInit)
		{
			return;
		}

		HippyMap map = new HippyMap();
		map.pushString("name", name);
		map.pushInt("id", id);
		map.pushMap("params", params);
		Message message = mHandler.obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_LOAD_INSTANCE, map);
		mHandler.sendMessage(message);
	}

	@Override
	public void resumeInstance(int id)
	{
		if (!mIsInit)
		{
			return;
		}
		Message message = mHandler.obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_RESUME_INSTANCE, id);
		mHandler.sendMessage(message);
	}

	@Override
	public void pauseInstance(int id)
	{
		if (!mIsInit)
		{
			return;
		}
		Message message = mHandler.obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_PAUSE_INSTANCE, id);
		mHandler.sendMessage(message);
	}

	@Override
	public void destroyInstance(int id)
	{
		if (!mIsInit)
		{
			return;
		}
		Message message = mHandler.obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_DESTROY_INSTANCE, id);
		mHandler.sendMessage(message);
	}

	@Override
	public void execCallback(Object params)
	{
		if (!mIsInit)
		{
			return;
		}

		Message message = mHandler.obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_CALLBACK, params);
		mHandler.sendMessage(message);
	}

	@Override
	public void destroyBridge(Callback<Boolean> callback) {
		mHandler = new Handler(mContext.getThreadExecutor().getJsThread().getLooper(), this);
		Message message = mHandler.obtainMessage(MSG_CODE_DESTROY_BRIDGE, callback);
		mHandler.sendMessage(message);
	}

	@Override
	public void destroy() {
		mIsInit = false;
		mLoadModuleListener = null;
		if (mHandler != null) {
			mHandler.removeMessages(MSG_CODE_INIT_BRIDGE);
			mHandler.removeMessages(MSG_CODE_RUN_BUNDLE);
			mHandler.removeMessages(MSG_CODE_CALL_FUNCTION);
		}
	}

	@Override
	public void callJavaScriptModule(String moduleName, String methodName, Object param)
	{
		if (!mIsInit)
		{
			return;
		}
		HippyMap map = new HippyMap();
		map.pushString("moduleName", moduleName);
		map.pushString("methodName", methodName);
		map.pushObject("params", param);

		Message message = mHandler.obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_CALL_JSMODULE, map);
		mHandler.sendMessage(message);
	}

	@Override
	public void callNatives(String moduleName, String moduleFunc, String callId, HippyArray params)
	{
		if (mIsInit && mContext != null && mContext.getModuleManager() != null)
		{
			HippyModuleManager manager = mContext.getModuleManager();
			if (manager != null)
			{
				HippyCallNativeParams callNativeParams = HippyCallNativeParams.obtain(moduleName, moduleFunc, callId, params);
				manager.callNatives(callNativeParams);
			}
		}
	}

	@Override
	public void reportException(String exception, String stackTrace)
	{
		if (mContext != null)
		{
			mContext.handleException(new HippyJsException(exception, stackTrace));
		}
	}

    String getGlobalConfigs() {
		Context context = mContext.getGlobalConfigs().getContext();
		assert(context != null);

		HippyMap globalParams = new HippyMap();
		HippyMap dimensionMap = DimensionsUtil.getDimensions(-1, -1, context, false);

		if (mContext.getGlobalConfigs() != null && mContext.getGlobalConfigs().getDeviceAdapter() != null) {
			mContext.getGlobalConfigs().getDeviceAdapter().reviseDimensionIfNeed(context, dimensionMap, false,
					false);
		}
		globalParams.pushMap("Dimensions", dimensionMap);

		String packageName = "";
		String versionName = "";
		try {
			PackageManager packageManager = context.getPackageManager();
			PackageInfo packageInfo = packageManager.getPackageInfo(
					context.getPackageName(), 0);
			packageName = packageInfo.packageName;
			versionName = packageInfo.versionName;
		} catch (Exception e) {
			e.printStackTrace();
		}

		String pageUrl = "";
		String appName = "";
		String appVersion = "";
		if (mThirdPartyAdapter != null) {
			appName = mThirdPartyAdapter.getPackageName();
			appVersion = mThirdPartyAdapter.getAppVersion();
			pageUrl = mThirdPartyAdapter.getPageUrl();
		}

		HippyMap platformParams = new HippyMap();
		platformParams.pushString("OS", "android");
		platformParams.pushString("PackageName", (packageName == null) ? "" : packageName);
		platformParams.pushString("VersionName", (versionName == null) ? "" : versionName);
		platformParams.pushInt("APILevel", Build.VERSION.SDK_INT);
		platformParams.pushBoolean("NightMode", getNightMode());
		globalParams.pushMap("Platform", platformParams);

		HippyMap tkd = new HippyMap();
		tkd.pushString("url", (pageUrl == null) ? "" : pageUrl);
		tkd.pushString("appName", (appName == null) ? "" : appName);
		tkd.pushString("appVersion", (appVersion == null) ? "" : appVersion);
		globalParams.pushMap("tkd", tkd);

		return ArgumentUtils.objectToJson(globalParams);
	}

  private boolean getNightMode() {
    int currentNightMode = mContext.getGlobalConfigs().getContext().getResources().getConfiguration().uiMode
      & Configuration.UI_MODE_NIGHT_MASK;
    switch (currentNightMode) {
      case Configuration.UI_MODE_NIGHT_UNDEFINED:
        // We don't know what mode we're in, assume notnight
        return false;
      case Configuration.UI_MODE_NIGHT_NO:
        // Night mode is not active, we're in day time
        return false;
      case Configuration.UI_MODE_NIGHT_YES:
        // Night mode is active, we're at night!
        return true;
      default:
        return false;
    }
  }

	@Override
	public HippyThirdPartyAdapter getThirdPartyAdapter() {
		return mThirdPartyAdapter;
	}
}
