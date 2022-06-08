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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.bridge.HippyCallNativeParams;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModuleInvocationHandler;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.lang.reflect.Proxy;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings({"unchecked", "unused", "rawtypes"})
public class HippyModuleManagerImpl implements HippyModuleManager, Handler.Callback {

    private static final int MSG_CODE_CALL_NATIVES = 1;
    private static final int MSG_CODE_DESTROY_MODULE = 2;
    private final ConcurrentHashMap<String, HippyNativeModuleInfo> mNativeModuleInfo;
    //Only multi-threaded read
    private final HashMap<Class<? extends HippyJavaScriptModule>, HippyJavaScriptModule> mJsModules;
    private final HippyEngineContext mContext;
    private boolean isDestroyed = false;
    private volatile Handler mUIThreadHandler;
    private volatile Handler mBridgeThreadHandler;
    private volatile Handler mDomThreadHandler;

    public HippyModuleManagerImpl(HippyEngineContext context, List<HippyAPIProvider> packages) {
        this.mContext = context;
        mNativeModuleInfo = new ConcurrentHashMap<>();
        mJsModules = new HashMap<>();
        addModules(packages);
    }

    /**
     * Add native modules and java script modules defined in {@link HippyAPIProvider}.
     *
     * @param apiProviders API providers need to be added.
     */
    public synchronized void addModules(List<HippyAPIProvider> apiProviders) {
        if (apiProviders == null) {
            return;
        }
        for (HippyAPIProvider provider : apiProviders) {
            Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>>
                    nativeModules = provider.getNativeModules(mContext);
            if (nativeModules != null && nativeModules.size() > 0) {
                Set<Class<? extends HippyNativeModuleBase>> keys = nativeModules.keySet();
                for (Class cls : keys) {
                    addNativeModule(cls, nativeModules.get(cls));
                }
            }

            List<Class<? extends HippyJavaScriptModule>> jsModules = provider
                    .getJavaScriptModules();
            if (jsModules != null && jsModules.size() > 0) {
                for (Class cls : jsModules) {
                    String name = getJavaScriptModuleName(cls);
                    // noinspection SuspiciousMethodCalls
                    if (mJsModules.containsKey(name)) {
                        throw new RuntimeException(
                                "There is already a javascript module named : " + name);
                    }
                    mJsModules.put(cls, null);
                }
            }
        }
    }

    @Override
    public synchronized <T extends HippyNativeModuleBase> void addNativeModule(Class<T> cls,
            Provider<T> provider) {
        if (provider == null) {
            return;
        }
        HippyNativeModuleInfo moduleInfo = new HippyNativeModuleInfo(cls, provider);
        String[] names = moduleInfo.getNames();
        if (names != null && names.length > 0) {
            for (String name : names) {
                if (!mNativeModuleInfo.containsKey(name)) {
                    mNativeModuleInfo.put(name, moduleInfo);
                }
            }
        }

        if (!mNativeModuleInfo.containsKey(moduleInfo.getName())) {
            mNativeModuleInfo.put(moduleInfo.getName(), moduleInfo);
        }
    }

    @Override
    public void destroy() {
        if (mBridgeThreadHandler != null) {
            mBridgeThreadHandler.removeMessages(MSG_CODE_CALL_NATIVES);
        }
        if (mDomThreadHandler != null) {
            mDomThreadHandler.removeMessages(MSG_CODE_CALL_NATIVES);
        }
        if (mUIThreadHandler != null) {
            mUIThreadHandler.removeMessages(MSG_CODE_CALL_NATIVES);
        }

        //Must be thrown bridge thread to complete
        isDestroyed = true;
        Iterator<Map.Entry<String, HippyNativeModuleInfo>> iterator = mNativeModuleInfo.entrySet()
                .iterator();
        Map.Entry<String, HippyNativeModuleInfo> entry;
        HippyNativeModuleInfo moduleInfo;
        while (iterator.hasNext()) {
            entry = iterator.next();
            if (entry != null) {
                moduleInfo = entry.getValue();
                if (moduleInfo != null && moduleInfo.shouldDestroy()) {
                    moduleInfo.onDestroy();
                    if (moduleInfo.getThread() == HippyNativeModule.Thread.DOM) {
                        if (mDomThreadHandler != null) {
                            Message msg = mDomThreadHandler
                                    .obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
                            mDomThreadHandler.sendMessage(msg);
                        }
                    } else if (moduleInfo.getThread() == HippyNativeModule.Thread.MAIN) {
                        if (mUIThreadHandler != null) {
                            Message msg = mUIThreadHandler
                                    .obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
                            mUIThreadHandler.sendMessage(msg);
                        }
                    } else {
                        if (mBridgeThreadHandler != null) {
                            Message msg = mBridgeThreadHandler
                                    .obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
                            mBridgeThreadHandler.sendMessage(msg);
                        }
                    }
                }
            }
        }
        mNativeModuleInfo.clear();
    }

    @Override
    public void callNatives(HippyCallNativeParams params) {
        if (isDestroyed) {
            return;
        }
        HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(params.moduleName);
        if (moduleInfo == null) {
            PromiseImpl promise = new PromiseImpl(mContext, params.moduleName, params.moduleFunc,
                    params.callId);
            promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, "module can not be found");
            return;
        }

        if (moduleInfo.getThread() == HippyNativeModule.Thread.DOM) {
            Handler handler = getDomThreadHandler();
            Message msg = handler.obtainMessage(MSG_CODE_CALL_NATIVES, params);
            handler.sendMessage(msg);
        } else if (moduleInfo.getThread() == HippyNativeModule.Thread.MAIN) {
            Handler handler = getUIThreadHandler();
            Message msg = handler.obtainMessage(MSG_CODE_CALL_NATIVES, params);
            handler.sendMessage(msg);
        } else {
            Handler handler = getBridgeThreadHandler();
            Message msg = handler.obtainMessage(MSG_CODE_CALL_NATIVES, params);
            handler.sendMessage(msg);
        }
    }

    @Override
    public synchronized <T extends HippyJavaScriptModule> T getJavaScriptModule(Class<T> cls) {
        HippyJavaScriptModule module = mJsModules.get(cls);
        if (module != null) {
            return (T) module;
        }
        ClassLoader clsLoader = cls.getClassLoader();
        if (clsLoader == null) {
            return null;
        }
        HippyJavaScriptModule moduleProxy = (HippyJavaScriptModule) Proxy
                .newProxyInstance(clsLoader, new Class[]{cls},
                        new HippyJavaScriptModuleInvocationHandler(mContext,
                                getJavaScriptModuleName(cls)));
        mJsModules.remove(cls);
        mJsModules.put(cls, moduleProxy);
        return (T) moduleProxy;
    }

    @Override
    public synchronized <T extends HippyNativeModuleBase> T getNativeModule(Class<T> cls) {
        HippyNativeModule annotation = cls.getAnnotation(HippyNativeModule.class);
        if (annotation != null) {
            String name = annotation.name();
            HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(name);
            if (moduleInfo != null) {
                return (T) moduleInfo.getInstance();
            }
        }
        return null;
    }

    @Nullable
    public HippyNativeModuleInfo getModuleInfo(@NonNull String moduleName) {
        return mNativeModuleInfo.get(moduleName);
    }

    void doCallNatives(@NonNull HippyCallNativeParams params) {
        PromiseImpl promise = new PromiseImpl(mContext, params.moduleName, params.moduleFunc,
                params.callId);
        try {
            HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(params.moduleName);
            if (moduleInfo == null) {
                promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR,
                        "module can not be found");
                return;
            }
            moduleInfo.initialize();
            HippyNativeModuleInfo.HippyNativeMethod method = moduleInfo
                    .findMethod(params.moduleFunc);
            if (method == null || method.isSync()) {
                promise
                        .doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR,
                                "module function can not be found");
                return;
            }
            method.invoke(moduleInfo.getInstance(), params.params, promise);
        } catch (Throwable e) {
            promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, e.getMessage());
            mContext.getGlobalConfigs().getExceptionHandler()
                    .handleNativeException(new RuntimeException(e), true);
        }
    }

    private String getJavaScriptModuleName(Class cls) {
        String name = cls.getSimpleName();
        int dollarSignIndex = name.lastIndexOf('$');
        if (dollarSignIndex != -1) {
            name = name.substring(dollarSignIndex + 1);
        }
        return name;
    }

    private Handler getDomThreadHandler() {
        if (mDomThreadHandler == null) {
            synchronized (HippyModuleManagerImpl.class) {
                if (mDomThreadHandler == null) {
                    mDomThreadHandler = new Handler(
                            mContext.getThreadExecutor().getDomThread().getLooper(),
                            this);
                }
            }
        }
        return mDomThreadHandler;
    }

    private Handler getUIThreadHandler() {
        if (mUIThreadHandler == null) {
            synchronized (HippyModuleManagerImpl.class) {
                if (mUIThreadHandler == null) {
                    mUIThreadHandler = new Handler(Looper.getMainLooper(), this);
                }
            }
        }
        return mUIThreadHandler;
    }

    private Handler getBridgeThreadHandler() {
        if (mBridgeThreadHandler == null) {
            synchronized (HippyModuleManagerImpl.class) {
                if (mBridgeThreadHandler == null) {
                    mBridgeThreadHandler = new Handler(
                            mContext.getThreadExecutor().getJsBridgeThread().getLooper(), this);
                }
            }
        }
        return mBridgeThreadHandler;
    }

    private boolean onInterceptCallNative(@Nullable HippyCallNativeParams params) {
        HippyEngineMonitorAdapter adapter = mContext.getGlobalConfigs().getEngineMonitorAdapter();
        if (adapter == null || params == null) {
            return false;
        }
        return adapter.onInterceptCallNative(mContext.getComponentName(), params);
    }

    private void onCallNativeFinished(@Nullable HippyCallNativeParams params) {
        HippyEngineMonitorAdapter adapter = mContext.getGlobalConfigs().getEngineMonitorAdapter();
        if (adapter == null || params == null) {
            return;
        }
        adapter.onCallNativeFinished(mContext.getComponentName(), params);
    }

    @Override
    public boolean handleMessage(Message msg) {

        switch (msg.what) {
            case MSG_CODE_CALL_NATIVES: {
                HippyCallNativeParams params = null;
                int id = -1;
                try {
                    params = (HippyCallNativeParams) msg.obj;
                    boolean shouldInterceptCallNative = onInterceptCallNative(params);
                    if (!shouldInterceptCallNative) {
                        doCallNatives(params);
                    }
                } catch (Throwable e) {
                    e.printStackTrace();
                } finally {
                    onCallNativeFinished(params);
                    if (params != null) {
                        params.onDispose();
                    }
                }
                return true;
            }
            case MSG_CODE_DESTROY_MODULE: {
                try {
                    HippyNativeModuleInfo moduleInfo = (HippyNativeModuleInfo) msg.obj;
                    moduleInfo.destroy();
                } catch (Throwable e) {
                    LogUtils.d("HippyModuleManagerImpl", "handleMessage: " + e.getMessage());
                }
                return true;
            }
        }
        return false;
    }

    public ConcurrentHashMap<String, HippyNativeModuleInfo> getNativeModuleInfo() {
        return mNativeModuleInfo;
    }
}
