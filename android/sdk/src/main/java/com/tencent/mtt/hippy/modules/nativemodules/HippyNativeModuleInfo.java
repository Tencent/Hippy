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

package com.tencent.mtt.hippy.modules.nativemodules;

import android.text.TextUtils;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.annotation.HippyNativeModule.Thread;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.PromiseImpl;
import com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class HippyNativeModuleInfo {

    private static final String TAG = "HippyNativeModuleInfo";
    private String mName;
    private String[] mNames;
    private HippyNativeModule.Thread mThread = Thread.BRIDGE;
    private final Provider<? extends HippyNativeModuleBase> mProvider;
    private final Class<?> mClass;
    @Nullable
    private Map<String, HippyNativeMethod> mMethods;
    private HippyNativeModuleBase mInstance;
    private boolean mInit = false;
    private boolean mIsDestroyed = false;

    public HippyNativeModuleInfo(@NonNull Class<?> cls,
            Provider<? extends HippyNativeModuleBase> provider) {
        HippyNativeModule annotation = cls.getAnnotation(HippyNativeModule.class);
        mClass = cls;
        mProvider = provider;
        if (annotation != null) {
            mName = annotation.name();
            mNames = annotation.names();
            mThread = annotation.thread();
            initImmediately(annotation);
        }
    }

    private void initImmediately(@NonNull HippyNativeModule annotation) {
        if (annotation.init()) {
            try {
                initialize();
            } catch (Throwable e) {
                e.printStackTrace();
            }
        }
    }

    public boolean shouldDestroy() {
        return !mIsDestroyed;
    }

    public void onDestroy() {
        mIsDestroyed = true;
    }

    public String getName() {
        return mName;
    }

    public String[] getNames() {
        return mNames;
    }

    public HippyNativeModuleBase getInstance() {
        return mInstance;
    }

    public HippyNativeModule.Thread getThread() {
        return mThread;
    }

    private void checkModuleMethods() {
        if (mMethods != null) {
            return;
        }
        synchronized (this) {
            if (mMethods != null) {
                return;
            }
            mMethods = new ConcurrentHashMap<>();
            Method[] targetMethods = mClass.getMethods();
            for (Method targetMethod : targetMethods) {
                HippyMethod hippyMethod = targetMethod.getAnnotation(HippyMethod.class);
                if (hippyMethod == null) {
                    continue;
                }
                String methodName = hippyMethod.name();
                if (TextUtils.isEmpty(methodName)) {
                    methodName = targetMethod.getName();
                }
                if (mMethods.containsKey(methodName)) {
                    LogUtils.e(TAG,
                            "Register the same method twice, moduleName=" + mName + ", methodName="
                                    + methodName);
                    continue;
                }
                mMethods.put(methodName, new HippyNativeMethod(targetMethod, hippyMethod.isSync(),
                        hippyMethod.useJSValueType()));
            }
        }
    }

    public void initialize() {
        if (mInit) {
            return;
        }
        checkModuleMethods();
        mInstance = mProvider.get();
        mInstance.initialize();
        mInit = true;
    }

    public void destroy() {
        if (mInstance != null) {
            mInstance.destroy();
        }
    }

    @Nullable
    public HippyNativeMethod findMethod(String moduleFunc) {
        checkModuleMethods();
        return mMethods.get(moduleFunc);
    }

    public static class HippyNativeMethod {

        @NonNull
        private final Method mMethod;
        @Nullable
        private final Type[] mParamTypes;
        private final boolean mIsSync;
        private final boolean mUseJSValueType;

        public HippyNativeMethod(@NonNull Method method, boolean isSync, boolean useJSValueType) {
            mMethod = method;
            mIsSync = isSync;
            mUseJSValueType = useJSValueType;
            mParamTypes = method.getGenericParameterTypes();
        }

        public boolean isSync() {
            return mIsSync;
        }

        public boolean useJSValueType() {
            return mUseJSValueType;
        }

        public void invoke(Object receiver, @Nullable Object args,
                PromiseImpl promise) throws Exception {
            Object[] params = null;
            if (args != null) {
                params = prepareArguments(args, promise);
            }
            mMethod.invoke(receiver, params);
            if (promise.needResolveBySelf()) {
                promise.resolve("");
            }
        }

        private boolean checkArgumentType(@NonNull Object args) {
            if (mUseJSValueType && args instanceof JSDenseArray) {
                return true;
            }
            return !mUseJSValueType && args instanceof HippyArray;
        }

        @Nullable
        private Object[] prepareArguments(@NonNull Object args, PromiseImpl promise)
                throws IllegalArgumentException {
            if (mParamTypes == null || mParamTypes.length <= 0) {
                return null;
            }
            if (!checkArgumentType(args)) {
                throw new IllegalArgumentException("The data type of parameters mismatch!");
            }
            Object[] params = new Object[mParamTypes.length];
            int index = 0;
            int size = mUseJSValueType ? ((JSDenseArray) args).size() : ((HippyArray) args).size();
            for (int i = 0; i < mParamTypes.length; i++) {
                Type paramCls = mParamTypes[i];
                if (paramCls == Promise.class) {
                    params[i] = promise;
                    promise.setNeedResolveBySelf(false);
                } else {
                    if (size <= index) {
                        throw new IllegalArgumentException(
                                "The number of parameters does not match");
                    }
                    if (mUseJSValueType) {
                        params[i] = ((JSDenseArray) args).get(index);
                    } else {
                        params[i] = ArgumentUtils.parseArgument(paramCls, (HippyArray) args, index);
                    }
                    index++;
                }
            }
            return params;
        }
    }
}
