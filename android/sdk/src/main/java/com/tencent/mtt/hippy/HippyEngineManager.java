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
package com.tencent.mtt.hippy;

import android.content.Context;
import android.text.TextUtils;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyFileBundleLoader;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@SuppressWarnings({"unused", "DeprecatedIsStillUsed", "deprecation"})
@Deprecated
public abstract class HippyEngineManager extends HippyEngine {

  @SuppressWarnings("rawtypes")
  final HashMap mExtendDatas = new HashMap();

  @SuppressWarnings("BooleanMethodIsAlwaysInverted")
  public abstract boolean onBackPress(DeviceEventModule.InvokeDefaultBackPress invokeImp);

  public void addEngineEventListener(EngineListener listener) {
    if (listener != null) {
      listen(listener);
    }
  }

  public void removeEngineEventListener(EngineListener listener) {
    mEventListeners.remove(listener);
  }

  public void initEngineInBackground() {
    initEngine(null);
  }

  public EngineState getCurrentEngineState() {
    return mCurrentState;
  }

  public abstract HippyRootView loadInstance(HippyRootViewParams params);

  public abstract HippyRootView loadInstance(HippyRootViewParams params, ModuleListener listener);

  public abstract HippyRootView loadInstance(HippyRootViewParams params, ModuleListener listener,
      HippyRootView.OnLoadCompleteListener onLoadCompleteListener);

  public void destroyInstance(HippyRootView rootView) {
    destroyModule(rootView);
  }

  public abstract HippyInstanceContext preCreateInstanceContext(Context context);

  public abstract HippyEngineContext getCurrentEngineContext();

  public void putExtendData(String key, Object value) {
    //noinspection unchecked
    mExtendDatas.put(key, value);
  }

  public Object getExtendData(String key) {
    return mExtendDatas.get(key);
  }

  public void removeExtendData(String key) {
    mExtendDatas.remove(key);
  }

  static class Builder {

    private HippyGlobalConfigs mGlobalConfigs;
    private HippyBundleLoader mCoreBundleLoader;
    private HippyBundleLoader mPreloadBundleLoader;
    private List<HippyAPIProvider> mPackages;
    private boolean mSupportDev = false;
    private String mDebugJs;
    private boolean enableV8Serialization = true;
    private int mGroupId = -1;

    Builder() {
    }

    @SuppressWarnings("SameParameterValue")
    Builder setSupportDev(boolean supportDev) {
      this.mSupportDev = supportDev;
      return this;
    }

    Builder setHippyGlobalConfigs(HippyGlobalConfigs configs) {
      this.mGlobalConfigs = configs;
      return this;
    }

    @SuppressWarnings("SameParameterValue")
    Builder setCoreBundleLoader(HippyBundleLoader coreBundleLoader) {
      this.mCoreBundleLoader = coreBundleLoader;
      return this;
    }

    Builder setPreloadBundleLoader(HippyBundleLoader loader) {
      this.mPreloadBundleLoader = loader;
      return this;
    }

    Builder setPackages(List<HippyAPIProvider> packages) {
      this.mPackages = packages;
      return this;
    }

    Builder setDebugJs(String debugJs) {
      this.mDebugJs = debugJs;
      return this;
    }

    Builder setEnableV8Serialization(boolean enable) {
      this.enableV8Serialization = enable;
      return this;
    }

    @SuppressWarnings("UnusedReturnValue")
    Builder setGroupId(int groupId) {
      mGroupId = groupId;
      return this;
    }

    HippyEngineManager build() {
      if (mCoreBundleLoader == null && !mSupportDev) {
        throw new RuntimeException("In non-debug mode, it must be set core bundle loader!");
      }
      if (mSupportDev && TextUtils.isEmpty(mDebugJs)) {
        throw new RuntimeException("In debug mode, it must be set debug js!");
      }
      if (mPackages == null) {
        mPackages = new ArrayList<>();
      }

      EngineInitParams params = new EngineInitParams();
      mGlobalConfigs.toDebug(params);
      params.debugMode = mSupportDev;
      if (mCoreBundleLoader instanceof HippyAssetBundleLoader) {
        params.coreJSAssetsPath = mCoreBundleLoader.getRawPath();
      } else if (mCoreBundleLoader instanceof HippyFileBundleLoader) {
        params.coreJSFilePath = mCoreBundleLoader.getRawPath();
      } else if (mCoreBundleLoader != null) {
        throw new RuntimeException(
            "Hippy: CoreBundleLoader is neither a HippyAssetBundleLoader nor a HippyFileBundleLoader!");
      }
      params.providers = mPackages;
      params.enableV8Serialization = enableV8Serialization;
      if (mCoreBundleLoader != null) {
        params.codeCacheTag = mCoreBundleLoader.getCodeCacheTag();
      }
      params.groupId = mGroupId;
      params.check();

      HippyEngineManager hippyEngineManager;
      if (mGroupId == -1) {
        hippyEngineManager = new HippyNormalEngineManager(params, mPreloadBundleLoader);
      } else {
        hippyEngineManager = new HippySingleThreadEngineManager(params, mPreloadBundleLoader);
      }

      return hippyEngineManager;
    }
  }
}
