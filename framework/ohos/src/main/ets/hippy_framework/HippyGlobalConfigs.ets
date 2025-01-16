/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { LogUtils } from '../support/utils/LogUtils';
import { HippyDeviceAdapter } from './adapter/device/HippyDeviceAdapter';
import { HippyExceptionHandlerAdapter } from './adapter/exception/HippyExceptionHandlerAdapter';
import { HippyExecutorSupplierAdapter } from './adapter/executor/HippyExecutorSupplierAdapter';
import { HippyFileAdapter } from './adapter/file/HippyFileAdapter';
import { HippyFontScaleAdapter } from './adapter/font/HippyFontScaleAdapter';
import { HippyHttpAdapter } from './adapter/http/HippyHttpAdapter';
import { HippyLogAdapter } from './adapter/log/HippyLogAdapter';
import { HippyEngineMonitorAdapter } from './adapter/monitor/HippyEngineMonitorAdapter';
import { HippySoLoaderAdapter } from './adapter/soloader/HippySoLoaderAdapter';
import { HippyStorageAdapter } from './adapter/storage/HippyStorageAdapter';
import { PreferencesStorageAdapter } from './adapter/storage/PreferencesStorageAdapter';
import { EngineInitParams } from './HippyEngine';

export class HippyGlobalConfigs {
  private mContext: Context | null;
  private mIsLoadFromRawfile: boolean;
  private mResModuleName: string;
  /**
   * SharedPreferences
   */
  private mPreferencesStorageAdapter: PreferencesStorageAdapter | null;
  /**
   * Crash Handler
   */
  private mExceptionHandler: HippyExceptionHandlerAdapter | null;
  /**
   * Http request adapter
   */
  private mHttpAdapter: HippyHttpAdapter | null;
  /**
   * file request adapter
   */
  private mFileAdapter: HippyFileAdapter | null;
  /**
   * Storage adapter
   */
  private mStorageAdapter: HippyStorageAdapter | null;
  /**
   * Executor Supplier adapter
   */
  private mExecutorSupplierAdapter: HippyExecutorSupplierAdapter | null;
  /**
   * Engine Monitor adapter
   */
  private mEngineMonitorAdapter: HippyEngineMonitorAdapter | null;
  /**
   * font scale adapter
   */
  private mFontScaleAdapter: HippyFontScaleAdapter | null;
  /**
   * font so loader adapter
   */
  private mSoLoaderAdapter: HippySoLoaderAdapter | null;
  /**
   * device adapter
   */
  private mDeviceAdapter: HippyDeviceAdapter | null;
  private mLogAdapter: HippyLogAdapter | null;
  private mEnableTurbo: boolean;
  private mEnableArkCApi: boolean;
  private mDomManagerConcurrentNum: number;

  constructor(params: EngineInitParams) {
    this.mContext = params.context;
    this.mIsLoadFromRawfile = params.isLoadFromRawfile;
    this.mResModuleName = params.resModuleName;
    this.mPreferencesStorageAdapter = params.preferencesStorageAdapter;
    this.mExceptionHandler = params.exceptionHandler;
    this.mHttpAdapter = params.httpAdapter;
    this.mFileAdapter = params.fileAdapter;
    this.mStorageAdapter = params.storageAdapter;
    this.mExecutorSupplierAdapter = params.executorSupplier;
    this.mEngineMonitorAdapter = params.engineMonitor;
    this.mFontScaleAdapter = params.fontScaleAdapter;
    this.mSoLoaderAdapter = params.soLoader;
    this.mDeviceAdapter = params.deviceAdapter;
    this.mLogAdapter = params.logAdapter;
    this.mEnableTurbo = params.enableTurbo;
    this.mEnableArkCApi = params.enableArkCApi;
    this.mDomManagerConcurrentNum = params.domManagerConcurrentNum;
  }

  public destroyIfNeed() {
    try {
      if (this.mStorageAdapter != null) {
        this.mStorageAdapter.destroyIfNeed();
      }
      if (this.mExecutorSupplierAdapter != null) {
        this.mExecutorSupplierAdapter.destroyIfNeed();
      }
      this.mContext = null;
    } catch (e) {
      LogUtils.d("HippyGlobalConfigs", "destroyIfNeed: " + e.getMessage());
    }
  }

  public isLoadFromRawfile(): boolean {
    return this.mIsLoadFromRawfile;
  }

  public getResModuleName(): string {
    return this.mResModuleName;
  }

  public getLogAdapter(): HippyLogAdapter | null {
    return this.mLogAdapter;
  }

  public getSoLoaderAdapter(): HippySoLoaderAdapter | null {
    return this.mSoLoaderAdapter;
  }

  public getSharedPreferencesAdapter(): PreferencesStorageAdapter | null {
    return this.mPreferencesStorageAdapter;
  }

  public getExceptionHandler(): HippyExceptionHandlerAdapter | null {
    return this.mExceptionHandler;
  }

  public getFontScaleAdapter(): HippyFontScaleAdapter | null {
    return this.mFontScaleAdapter;
  }

  public getDeviceAdapter(): HippyDeviceAdapter | null {
    return this.mDeviceAdapter;
  }

  public getHttpAdapter(): HippyHttpAdapter | null {
    return this.mHttpAdapter;
  }

  public getFileAdapter(): HippyFileAdapter | null {
    return this.mFileAdapter;
  }

  public getContext(): Context | null {
    return this.mContext;
  }

  public getStorageAdapter(): HippyStorageAdapter | null {
    return this.mStorageAdapter;
  }

  public getExecutorSupplierAdapter(): HippyExecutorSupplierAdapter | null {
    return this.mExecutorSupplierAdapter;
  }

  public getEngineMonitorAdapter(): HippyEngineMonitorAdapter | null {
    return this.mEngineMonitorAdapter;
  }

  public enableTurbo(): boolean {
    return this.mEnableTurbo;
  }

  public enableArkCApi(): boolean {
    return this.mEnableArkCApi;
  }

  public getDomManagerConcurrentNum(): number {
    return this.mDomManagerConcurrentNum;
  }
}
