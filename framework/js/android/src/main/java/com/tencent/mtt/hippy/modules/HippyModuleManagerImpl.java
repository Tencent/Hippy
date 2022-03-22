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
import android.os.Message;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.bridge.HippyCallNativeParams;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModuleInvocationHandler;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.compatible.Deserializer;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeDirectReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.lang.reflect.Proxy;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings({"unchecked", "unused", "rawtypes"})
public class HippyModuleManagerImpl implements HippyModuleManager, Handler.Callback {

    private static final int MSG_CODE_DO_DESERIALIZATION = 0;
    private static final int MSG_CODE_DO_CALL_NATIVES = 1;
    private static final int MSG_CODE_DESTROY_MODULE = 2;
    private static final int MSG_CODE_ON_DESTROY = 3;
    private final ConcurrentHashMap<String, HippyNativeModuleInfo> mNativeModuleInfo;
    //Only multi-threaded read
    private final HashMap<Class<? extends HippyJavaScriptModule>, HippyJavaScriptModule> mJsModules;
    private final HippyEngineContext mContext;
    private boolean isDestroyed = false;
    private volatile Handler mModuleThreadHandler;
    private volatile Handler mBridgeThreadHandler;
    private final HippyModuleANRMonitor mANRMonitor;
    private final boolean mEnableV8Serialization;
    private BinaryReader mSafeHeapReader;
    private BinaryReader mSafeDirectReader;
    @Nullable
    private Deserializer mCompatibleDeserializer;
    @Nullable
    private com.tencent.mtt.hippy.serialization.recommend.Deserializer mRecommendDeserializer;

    public HippyModuleManagerImpl(HippyEngineContext context, List<HippyAPIProvider> packages,
            boolean enableV8Serialization) {
        mContext = context;
        mEnableV8Serialization = enableV8Serialization;
        mANRMonitor = new HippyModuleANRMonitor(mContext);
        mNativeModuleInfo = new ConcurrentHashMap<>();
        mJsModules = new HashMap<>();
        if (enableV8Serialization) {
            mCompatibleDeserializer = new Deserializer(null, new InternalizedStringTable());
            mRecommendDeserializer = new com.tencent.mtt.hippy.serialization.recommend.Deserializer(
                    null, new InternalizedStringTable());
        }
        initModules(context, packages);
    }

    private void initModules(@NonNull HippyEngineContext context, List<HippyAPIProvider> packages) {
        for (HippyAPIProvider pckg : packages) {
            Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> nativeModules = pckg
                    .getNativeModules(context);
            if (nativeModules != null && nativeModules.size() > 0) {
                Set<Class<? extends HippyNativeModuleBase>> keys = nativeModules.keySet();
                for (Class cls : keys) {
                    HippyNativeModuleInfo moduleInfo = new HippyNativeModuleInfo(cls,
                            nativeModules.get(cls));
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
            }
            List<Class<? extends HippyJavaScriptModule>> jsModules = pckg.getJavaScriptModules();
            if (jsModules != null && jsModules.size() > 0) {
                for (Class cls : jsModules) {
                    String name = getJavaScriptModuleName(cls);
                    //noinspection SuspiciousMethodCalls
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

    private void onDestroy() {
        if (mCompatibleDeserializer != null) {
            mCompatibleDeserializer.getStringTable().release();
        }
        if (mRecommendDeserializer != null) {
            mRecommendDeserializer.getStringTable().release();
        }
    }

    @Override
    public void destroy() {
        isDestroyed = true;
        if (mModuleThreadHandler != null) {
            mModuleThreadHandler.removeMessages(MSG_CODE_DO_CALL_NATIVES);
        }
        if (mBridgeThreadHandler != null) {
            mBridgeThreadHandler.removeMessages(MSG_CODE_DO_DESERIALIZATION);
            Message msg = mBridgeThreadHandler.obtainMessage(MSG_CODE_ON_DESTROY);
            mBridgeThreadHandler.sendMessage(msg);
        }
        if (mANRMonitor != null) {
            mANRMonitor.checkMonitor();
        }
        Iterator<Entry<String, HippyNativeModuleInfo>> iterator = mNativeModuleInfo.entrySet()
                .iterator();
        Map.Entry<String, HippyNativeModuleInfo> entry;
        HippyNativeModuleInfo moduleInfo;
        while (iterator.hasNext()) {
            entry = iterator.next();
            if (entry == null) {
                continue;
            }
            moduleInfo = entry.getValue();
            if (moduleInfo != null && moduleInfo.shouldDestroy()) {
                moduleInfo.onDestroy();
                if (mModuleThreadHandler != null) {
                    Message msg = mModuleThreadHandler
                            .obtainMessage(MSG_CODE_DESTROY_MODULE, moduleInfo);
                    mModuleThreadHandler.sendMessage(msg);
                }
            }
        }
        mNativeModuleInfo.clear();
    }

    @Override
    public void callNatives(@NonNull HippyCallNativeParams params) {
        if (isDestroyed) {
            return;
        }
        Handler handler = getBridgeThreadHandler();
        Message msg = handler.obtainMessage(MSG_CODE_DO_DESERIALIZATION, params);
        handler.sendMessage(msg);
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

    private HippyArray parseJsonData(ByteBuffer buffer) {
        byte[] bytes;
        if (buffer.isDirect()) {
            bytes = new byte[buffer.limit()];
            buffer.get(bytes);
        } else {
            bytes = buffer.array();
        }
        return ArgumentUtils.parseToArray(new String(bytes));
    }

    @Nullable
    private Object parseV8SerializeData(ByteBuffer buffer, boolean useJSValueType) {
        PrimitiveValueDeserializer deserializer =
                useJSValueType ? mRecommendDeserializer : mCompatibleDeserializer;
        final BinaryReader binaryReader;
        if (buffer.isDirect()) {
            if (mSafeDirectReader == null) {
                mSafeDirectReader = new SafeDirectReader();
            }
            binaryReader = mSafeDirectReader;
        } else {
            if (mSafeHeapReader == null) {
                mSafeHeapReader = new SafeHeapReader();
            }
            binaryReader = mSafeHeapReader;
        }
        binaryReader.reset(buffer);
        deserializer.setReader(binaryReader);
        deserializer.reset();
        deserializer.readHeader();
        return deserializer.readValue();
    }

    private Object bytesToArgument(ByteBuffer buffer, boolean useJSValueType) {
        Object result = null;
        if (buffer != null) {
            try {
                if (mEnableV8Serialization) {
                    result = parseV8SerializeData(buffer, useJSValueType);
                } else {
                    result = parseJsonData(buffer);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    private void doErrorCallBack(@NonNull HippyCallNativeParams params, @Nullable String msg) {
        PromiseImpl promise = new PromiseImpl(mContext, params.moduleName, params.moduleFunc,
                params.callId);
        promise.doCallback(PromiseImpl.PROMISE_CODE_NORMAN_ERROR, msg);
    }

    private void doDeserialization(@NonNull Message from) {
        HippyCallNativeParams params = null;
        try {
            params = (HippyCallNativeParams) from.obj;
            HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(params.moduleName);
            if (moduleInfo == null) {
                doErrorCallBack(params, "module can not be found");
                return;
            }
            moduleInfo.initialize();
            HippyNativeModuleInfo.HippyNativeMethod method = moduleInfo
                    .findMethod(params.moduleFunc);
            if (method == null || method.isSync()) {
                doErrorCallBack(params, "module function can not be found");
                return;
            }
            params.paramsValue = bytesToArgument(params.paramsBuffer, method.useJSValueType());
            Handler handler = getModuleThreadHandler();
            Message to = handler.obtainMessage(MSG_CODE_DO_CALL_NATIVES, params);
            handler.sendMessage(to);
        } catch (Throwable e) {
            doErrorCallBack(params, e.getMessage());
            mContext.getGlobalConfigs().getExceptionHandler()
                    .handleNativeException(new RuntimeException(e), true);
        }
    }

    private void doCallNatives(@NonNull HippyCallNativeParams params) {
        try {
            HippyNativeModuleInfo moduleInfo = mNativeModuleInfo.get(params.moduleName);
            if (moduleInfo == null) {
                doErrorCallBack(params, "module can not be found");
                return;
            }
            HippyNativeModuleInfo.HippyNativeMethod method = moduleInfo
                    .findMethod(params.moduleFunc);
            if (method != null) {
                PromiseImpl promise = new PromiseImpl(mContext, params.moduleName, params.moduleFunc,
                        params.callId);
                method.invoke(moduleInfo.getInstance(), params.paramsValue, promise);
            }
        } catch (Throwable e) {
            doErrorCallBack(params, e.getMessage());
            mContext.getGlobalConfigs().getExceptionHandler()
                    .handleNativeException(new RuntimeException(e), true);
        } finally {
            params.onDispose();
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

    private Handler getBridgeThreadHandler() {
        if (mBridgeThreadHandler == null) {
            synchronized (HippyModuleManagerImpl.class) {
                if (mBridgeThreadHandler == null) {
                    mBridgeThreadHandler = new Handler(
                            mContext.getThreadExecutor().getModuleThread().getLooper(), this);
                }
            }
        }
        return mBridgeThreadHandler;
    }

    private Handler getModuleThreadHandler() {
        if (mModuleThreadHandler == null) {
            synchronized (HippyModuleManagerImpl.class) {
                if (mModuleThreadHandler == null) {
                    mModuleThreadHandler = new Handler(
                            mContext.getThreadExecutor().getModuleThread().getLooper(), this);
                }
            }
        }
        return mModuleThreadHandler;
    }


    @Override
    public boolean handleMessage(Message msg) {
        switch (msg.what) {
            case MSG_CODE_DO_DESERIALIZATION: {
                doDeserialization(msg);
                return true;
            }
            case MSG_CODE_DO_CALL_NATIVES: {
                HippyCallNativeParams params = null;
                int id = -1;
                try {
                    params = (HippyCallNativeParams) msg.obj;
                    id = mANRMonitor.startMonitor(params.moduleName, params.moduleFunc);
                    doCallNatives(params);
                } catch (Throwable e) {
                    e.printStackTrace();
                } finally {
                    if (params != null) {
                        params.onDispose();
                    }
                    if (id >= 0) {
                        mANRMonitor.endMonitor(id);
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
            case MSG_CODE_ON_DESTROY:
                onDestroy();
                break;
            default:
                break;
        }
        return false;
    }

    public ConcurrentHashMap<String, HippyNativeModuleInfo> getNativeModuleInfo() {
        return mNativeModuleInfo;
    }
}
