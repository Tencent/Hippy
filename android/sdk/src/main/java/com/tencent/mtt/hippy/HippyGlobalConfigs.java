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

import com.tencent.mtt.hippy.adapter.DefaultLogAdapter;
import com.tencent.mtt.hippy.adapter.HippyLogAdapter;
import com.tencent.mtt.hippy.adapter.device.DefaultDeviceAdapter;
import com.tencent.mtt.hippy.adapter.device.HippyDeviceAdapter;
import com.tencent.mtt.hippy.adapter.exception.DefaultExceptionHandler;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.adapter.executor.DefaultExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.executor.HippyExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.font.DefaultFontScaleAdapter;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.adapter.http.DefaultHttpAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.adapter.monitor.DefaultEngineMonitorAdapter;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.adapter.sharedpreferences.DefaultSharedPreferencesAdapter;
import com.tencent.mtt.hippy.adapter.sharedpreferences.HippySharedPreferencesAdapter;
import com.tencent.mtt.hippy.adapter.soloader.DefaultSoLoaderAdapter;
import com.tencent.mtt.hippy.adapter.soloader.HippySoLoaderAdapter;
import com.tencent.mtt.hippy.adapter.storage.DefaultStorageAdapter;
import com.tencent.mtt.hippy.adapter.storage.HippyStorageAdapter;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.adapter.platform.DefaultHippyPlatformAdapter;
import com.tencent.mtt.hippy.adapter.platform.HippyPlatformAdapter;

@SuppressWarnings({"deprecation", "unused"})
public class HippyGlobalConfigs {

  /**
   * SharedPreferences
   */
  private final HippySharedPreferencesAdapter mSharedPreferencesAdapter;

  private Context mContext;

  /**
   * Crash Handler
   */
  private final HippyExceptionHandlerAdapter mExceptionHandler;

  /**
   * Http request adapter
   */
  private final HippyHttpAdapter mHttpAdapter;

  /**
   * Image loader adapter
   */
  private final HippyImageLoader mImageLoaderAdapter;

  /**
   * Storage adapter
   */
  private final HippyStorageAdapter mStorageAdapter;

  /**
   * Executor Supplier adapter
   */
  private final HippyExecutorSupplierAdapter mExecutorSupplierAdapter;

  /**
   * Engine Monitor adapter
   */
  private final HippyEngineMonitorAdapter mEngineMonitorAdapter;


  /**
   * font scale adapter
   */
  private final HippyFontScaleAdapter mFontScaleAdapter;


  private final HippySoLoaderAdapter mSoLoaderAdapter;

  /**
   * device adapter
   */
  private final HippyDeviceAdapter mDeviceAdapter;


  private final HippyLogAdapter mLogAdapter;

  private boolean mEnableTurbo;

  /**
   * platform adater
   */
  private HippyPlatformAdapter mHippyPlatformAdapter;

  public HippyGlobalConfigs(HippyEngine.EngineInitParams params) {
    this.mContext = params.context;
    this.mSharedPreferencesAdapter = params.sharedPreferencesAdapter;
    this.mExceptionHandler = params.exceptionHandler;
    this.mHttpAdapter = params.httpAdapter;
    this.mImageLoaderAdapter = params.imageLoader;
    this.mStorageAdapter = params.storageAdapter;
    this.mExecutorSupplierAdapter = params.executorSupplier;
    this.mEngineMonitorAdapter = params.engineMonitor;
    this.mFontScaleAdapter = params.fontScaleAdapter;
    this.mSoLoaderAdapter = params.soLoader;
    this.mDeviceAdapter = params.deviceAdapter;
    this.mLogAdapter = params.logAdapter;
    this.mEnableTurbo = params.enableTurbo;
    this.mHippyPlatformAdapter = params.platformAdapter;
  }

  private HippyGlobalConfigs(Context context,
      HippySharedPreferencesAdapter sharedPreferencesAdapter,
      HippyExceptionHandlerAdapter exceptionHandler, HippyHttpAdapter httpAdapter,
      HippyImageLoader imageLoaderAdapter,
      HippyExecutorSupplierAdapter executorSupplierAdapter, HippyStorageAdapter storageAdapter,
      HippyEngineMonitorAdapter engineMonitorAdapter,
      HippyFontScaleAdapter hippyFontScaleAdapter, HippySoLoaderAdapter hippySoLoaderAdapter,
      HippyDeviceAdapter hippyDeviceAdapter,
      HippyLogAdapter hippyLogAdapter,
      HippyPlatformAdapter hippyPlatformAdapter) {
    this.mContext = context;
    this.mSharedPreferencesAdapter = sharedPreferencesAdapter;
    this.mExceptionHandler = exceptionHandler;
    this.mHttpAdapter = httpAdapter;
    this.mImageLoaderAdapter = imageLoaderAdapter;
    this.mStorageAdapter = storageAdapter;
    this.mExecutorSupplierAdapter = executorSupplierAdapter;
    this.mEngineMonitorAdapter = engineMonitorAdapter;
    this.mFontScaleAdapter = hippyFontScaleAdapter;
    this.mSoLoaderAdapter = hippySoLoaderAdapter;
    this.mDeviceAdapter = hippyDeviceAdapter;
    this.mLogAdapter = hippyLogAdapter;
    this.mHippyPlatformAdapter = hippyPlatformAdapter;
  }

  public void destroyIfNeed() {
    try {
      if (mHttpAdapter != null) {
        mHttpAdapter.destroyIfNeed();
      }
      if (mStorageAdapter != null) {
        mStorageAdapter.destroyIfNeed();
      }
      if (mExecutorSupplierAdapter != null) {
        mExecutorSupplierAdapter.destroyIfNeed();
      }
      if (mImageLoaderAdapter != null) {
        mImageLoaderAdapter.destroyIfNeed();
      }
      mContext = null;
    } catch (Throwable e) {
      LogUtils.d("HippyGlobalConfigs", "destroyIfNeed: " + e.getMessage());
    }
  }

  public HippyLogAdapter getLogAdapter() {
    return mLogAdapter;
  }

  public HippySoLoaderAdapter getSoLoaderAdapter() {
    return mSoLoaderAdapter;
  }

  public HippySharedPreferencesAdapter getSharedPreferencesAdapter() {
    return mSharedPreferencesAdapter;
  }

  public HippyExceptionHandlerAdapter getExceptionHandler() {
    return mExceptionHandler;
  }

  public HippyFontScaleAdapter getFontScaleAdapter() {
    return mFontScaleAdapter;
  }

  public HippyDeviceAdapter getDeviceAdapter() {
    return mDeviceAdapter;
  }

  public HippyHttpAdapter getHttpAdapter() {
    return mHttpAdapter;
  }

  public Context getContext() {
    return mContext;
  }

  public HippyImageLoader getImageLoaderAdapter() {
    return mImageLoaderAdapter;
  }

  public HippyStorageAdapter getStorageAdapter() {
    return mStorageAdapter;
  }

  public HippyExecutorSupplierAdapter getExecutorSupplierAdapter() {
    return mExecutorSupplierAdapter;
  }

  public HippyEngineMonitorAdapter getEngineMonitorAdapter() {
    return mEngineMonitorAdapter;
  }

  public HippyPlatformAdapter getHippyPlatformAdapter() {
    return mHippyPlatformAdapter;
  }

  @Deprecated
  public void toDebug(HippyEngine.EngineInitParams params) {
    params.context = mContext;
    params.sharedPreferencesAdapter = mSharedPreferencesAdapter;
    params.exceptionHandler = mExceptionHandler;
    params.httpAdapter = mHttpAdapter;
    params.imageLoader = mImageLoaderAdapter;
    params.storageAdapter = mStorageAdapter;
    params.executorSupplier = mExecutorSupplierAdapter;
    params.engineMonitor = mEngineMonitorAdapter;
    params.fontScaleAdapter = mFontScaleAdapter;
    params.soLoader = mSoLoaderAdapter;
    params.deviceAdapter = mDeviceAdapter;
    params.logAdapter = mLogAdapter;
    params.enableTurbo = true;
    params.platformAdapter = mHippyPlatformAdapter;
  }

  @SuppressWarnings({"unused"})
  public static class Builder {

    private HippySharedPreferencesAdapter mSharedPreferencesAdapter;

    private Context mContext;

    private HippyExceptionHandlerAdapter mExceptionHandler;

    private HippyHttpAdapter mHttpAdapter;

    private HippyImageLoader mImageLoaderAdapter;

    private HippyStorageAdapter mStorageAdapter;

    private HippyExecutorSupplierAdapter mExecutorSupplierAdapter;

    private HippyEngineMonitorAdapter mEngineMonitorAdapter;


    private HippyFontScaleAdapter mFontScaleAdapter;

    private HippySoLoaderAdapter mSoLoaderAdapter;

    private HippyDeviceAdapter mDeviceAdapter;

    private HippyLogAdapter mLogAdapter;

    private HippyPlatformAdapter mHippyPlatformAdapter;

    public HippyLogAdapter getLogAdapter() {
      return mLogAdapter;
    }

    public Builder setLogAdapter(HippyLogAdapter mLogAdapter) {
      this.mLogAdapter = mLogAdapter;
      return this;
    }

    public Builder setSharedPreferencesAdapter(HippySharedPreferencesAdapter adapter) {
      this.mSharedPreferencesAdapter = adapter;
      return this;
    }

    public Builder setSoLoaderAdapter(HippySoLoaderAdapter mSoLoaderAdapter) {
      this.mSoLoaderAdapter = mSoLoaderAdapter;
      return this;
    }

    public Builder setDeviceAdapter(HippyDeviceAdapter mDeviceAdapter) {
      this.mDeviceAdapter = mDeviceAdapter;
      return this;
    }

    public Builder setContext(Context context) {
      this.mContext = context;
      return this;
    }


    public Builder setExceptionHandler(HippyExceptionHandlerAdapter exceptionHandler) {
      this.mExceptionHandler = exceptionHandler;
      return this;
    }

    public Builder setFontScaleAdapter(HippyFontScaleAdapter hippyFontScaleAdapter) {
      this.mFontScaleAdapter = hippyFontScaleAdapter;
      return this;
    }

    public Builder setHttpAdapter(HippyHttpAdapter httpAdapter) {
      this.mHttpAdapter = httpAdapter;
      return this;
    }

    public Builder setImageLoaderAdapter(HippyImageLoader adapter) {
      this.mImageLoaderAdapter = adapter;
      return this;
    }

    public Builder setStorageAdapter(HippyStorageAdapter adapter) {
      this.mStorageAdapter = adapter;
      return this;
    }

    public Builder setExecutorSupplierAdapter(HippyExecutorSupplierAdapter adapter) {
      this.mExecutorSupplierAdapter = adapter;
      return this;
    }

    public Builder setEngineMonitorAdapter(HippyEngineMonitorAdapter adapter) {
      this.mEngineMonitorAdapter = adapter;
      return this;
    }

    public Builder setHippyPlatformAdapter(HippyPlatformAdapter hippyPlatformAdapter) {
      this.mHippyPlatformAdapter = hippyPlatformAdapter;
      return this;
    }

    @Deprecated
    public HippyGlobalConfigs build() {
      if (mContext == null) {
        throw new IllegalArgumentException("HippyGlobalConfigs Context must is not null!");
      }
      if (mSharedPreferencesAdapter == null) {
        mSharedPreferencesAdapter = new DefaultSharedPreferencesAdapter(
          mContext.getApplicationContext());
      }
      if (mExceptionHandler == null) {
        mExceptionHandler = new DefaultExceptionHandler();
      }
      if (mHttpAdapter == null) {
        mHttpAdapter = new DefaultHttpAdapter();
      }
      if (mExecutorSupplierAdapter == null) {
        mExecutorSupplierAdapter = new DefaultExecutorSupplierAdapter();
      }
      if (mStorageAdapter == null) {
        mStorageAdapter = new DefaultStorageAdapter(mContext.getApplicationContext(),
            mExecutorSupplierAdapter.getDBExecutor());
      }
      if (mEngineMonitorAdapter == null) {
        mEngineMonitorAdapter = new DefaultEngineMonitorAdapter();
      }

      if (mFontScaleAdapter == null) {
        mFontScaleAdapter = new DefaultFontScaleAdapter();
      }
      if (mSoLoaderAdapter == null) {
        mSoLoaderAdapter = new DefaultSoLoaderAdapter();
      }
      if (mDeviceAdapter == null) {
        mDeviceAdapter = new DefaultDeviceAdapter();
      }
      if (mLogAdapter == null) {
        mLogAdapter = new DefaultLogAdapter();
      }
      if (mHippyPlatformAdapter == null) {
        mHippyPlatformAdapter = new DefaultHippyPlatformAdapter();
      }
      if (mImageLoaderAdapter == null) {
        throw new IllegalArgumentException(
            "HippyGlobalConfigs ImageLoaderAdapter must is not null!");
      }

      @SuppressWarnings("UnnecessaryLocalVariable") HippyGlobalConfigs configs = new HippyGlobalConfigs(
          mContext, mSharedPreferencesAdapter, mExceptionHandler,
          mHttpAdapter, mImageLoaderAdapter, mExecutorSupplierAdapter, mStorageAdapter,
          mEngineMonitorAdapter, mFontScaleAdapter,
          mSoLoaderAdapter, mDeviceAdapter, mLogAdapter, mHippyPlatformAdapter);
      return configs;
    }
  }

  public boolean enableTurbo() {
    return mEnableTurbo;
  }
}
