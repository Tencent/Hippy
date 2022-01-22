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
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.PromiseImpl;
import com.tencent.mtt.hippy.utils.ArgumentUtils;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({"unused"})
public final class HippyNativeModuleInfo {

  private final String mName;

  private final String[] mNames;

  private final HippyNativeModule.Thread mThread;

  private final Provider<? extends HippyNativeModuleBase> mProvider;

  private final Class<?> mClass;

  private Map<String, HippyNativeMethod> mMethods;

  private HippyNativeModuleBase mInstance;

  private boolean mInit = false;

  private boolean mIsDestroyed = false;

  public HippyNativeModuleInfo(Class<?> cls, Provider<? extends HippyNativeModuleBase> provider) {
    HippyNativeModule annotation = cls.getAnnotation(HippyNativeModule.class);
    assert annotation != null;
    this.mName = annotation.name();
    this.mNames = annotation.names();
    this.mClass = cls;
    this.mThread = annotation.thread();
    mProvider = provider;
    initImmediately(annotation);

  }

  private void initImmediately(HippyNativeModule annotation) {
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

  public Map<String, HippyNativeMethod> getMethods() {
    return mMethods;
  }

  public void initialize() {
    if (mInit) {
      return;
    }
    mMethods = new HashMap<>();
    Method[] targetMethods = mClass.getMethods();
    for (Method targetMethod : targetMethods) {
      HippyMethod hippyMethod = targetMethod.getAnnotation(HippyMethod.class);
      if (hippyMethod != null) {
        String methodName = hippyMethod.name();
        if (TextUtils.isEmpty(methodName)) {
          methodName = targetMethod.getName();
        }
        if (mMethods.containsKey(methodName)) {
          throw new RuntimeException(
              "Java Module " + mName + " method name already registered: " + methodName);
        }
        mMethods.put(methodName, new HippyNativeMethod(targetMethod, hippyMethod.isSync()));
      }
    }

    mInstance = mProvider.get();
    mInstance.initialize();
    mInit = true;
  }

  public void destroy() {
    if (mInstance != null) {
      mInstance.destroy();
    }
  }

  public HippyNativeMethod findMethod(String moduleFunc) {
    if (mMethods == null) {
      return null;
    }
    return mMethods.get(moduleFunc);
  }


  public static class HippyNativeMethod {

    private final Method mMethod;

    private final Type[] mParamTypes;

    private boolean mIsSync;

    public HippyNativeMethod(Method method, boolean isSync) {
      this.mMethod = method;
      this.mIsSync = isSync;
      this.mParamTypes = method.getGenericParameterTypes();
    }

    public void invoke(HippyEngineContext context, Object receiver, HippyArray args,
        PromiseImpl promise) throws Exception {
      Object[] params = prepareArguments(context, mParamTypes, args, promise);
      mMethod.invoke(receiver, params);
      if (promise.needResolveBySelf()) {
        promise.resolve("");
      }
    }

    private Object[] prepareArguments(HippyEngineContext context, Type[] paramClss, HippyArray args,
        PromiseImpl promise) {
      if (paramClss == null || paramClss.length <= 0) {
        return new Object[0];
      }
      Object[] params = new Object[paramClss.length];
      if (args == null) {
        throw new RuntimeException("method argument list not match");
      }
      Type paramCls;
      int index = 0;

      for (int i = 0; i < paramClss.length; i++) {
        paramCls = paramClss[i];
        if (paramCls == Promise.class) {
          params[i] = promise;
          promise.setNeedResolveBySelf(false);
        } else {
          if (args.size() <= index) {
            throw new RuntimeException("method argument list not match");
          }
          params[i] = ArgumentUtils.parseArgument(paramCls, args, index);
          index++;
        }

      }
      return params;
    }

    public boolean isSync() {
      return mIsSync;
    }

  }

}
