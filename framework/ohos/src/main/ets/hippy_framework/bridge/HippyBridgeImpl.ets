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
import fs from '@ohos.file.fs';
import { BridgeCallback, HippyBridge } from './HippyBridge';
import { JsDriver } from '../connector/JsDriver';
import { NativeCallback } from '../connector/NativeCallback';
import { HippyEngineContext } from '../HippyEngineContext';
import { V8InitParams } from '../HippyEngine';
import { HippyBridgeManagerImpl } from './HippyBridgeManagerImpl';
import { LogUtils } from '../../support/utils/LogUtils';

export class HippyBridgeImpl implements HippyBridge {

  public static TAG: string = "HippyBridgeImpl";
  private static mCodeCacheRootDir: string | null = null;
  private mEngineContext: HippyEngineContext | null;
  private mBridgeCallback: BridgeCallback | null;
  private mEnableV8Serialization: boolean;
  private mIsDevModule: boolean;
  private mDebugServerHost: string;
  private mV8InitParams: V8InitParams | null;
  private mJsDriver: JsDriver;

  public constructor(
    engineContext: HippyEngineContext,
    callback: BridgeCallback,
    enableV8Serialization: boolean,
    isDevModule: boolean,
    debugServerHost: string,
    v8InitParams: V8InitParams | null,
    jsDriver: JsDriver) {
    this.mEngineContext = engineContext;
    this.mBridgeCallback = callback;
    this.mEnableV8Serialization = enableV8Serialization;
    this.mIsDevModule = isDevModule;
    this.mDebugServerHost = debugServerHost;
    this.mV8InitParams = v8InitParams;
    this.mJsDriver = jsDriver;

    // mJsDriver.setBridgeProxy(this);
    if (HippyBridgeImpl.mCodeCacheRootDir == null) {
      let context = this.mEngineContext.getGlobalConfigs().getContext();
      let baseFile: string | undefined;
      if (context?.getApplicationContext() != null) {
        baseFile = context?.getApplicationContext().filesDir;
      } else {
        baseFile = context?.filesDir;
      }
      let childDir = baseFile + "/hippy";
      let rs = fs.accessSync(childDir);
      if (!rs) {
        fs.mkdirSync(childDir);
      } else {
        const stat: fs.Stat = fs.statSync(childDir);
        if (!stat || !stat.isDirectory()) {
          fs.mkdirSync(childDir, true);
        }
      }
      HippyBridgeImpl.mCodeCacheRootDir = childDir + "/codecache/";
    }
  }

  initJSBridge(globalConfig: string, callback: NativeCallback, groupId: number, isReload: boolean): void {
    this.initJSEngine(globalConfig, callback, groupId, isReload);
  }

  initJSEngine(globalConfig: string, callback: NativeCallback, groupId: number, isReload: boolean) {
    if (!this.mEngineContext) {
      return;
    }
    this.mJsDriver.initialize(
      this.mEngineContext.getDomManagerId(),
      this.mEngineContext.getVfsId(),
      this.mIsDevModule,
      callback,
      globalConfig,
      this.mEnableV8Serialization,
      groupId,
      this.mEngineContext.getDevtoolsId(),
      isReload,
    )
  }

  getHippyEngineContext(): HippyEngineContext | null {
    return this.mEngineContext
  }

  runScriptFromUri(uri: string, canUseCodeCache: boolean, codeCacheTag: string, callback: NativeCallback): boolean {
    if (!this.mEngineContext) {
      return false;
    }
    const context = this.mEngineContext.getGlobalConfigs().getContext();
    if (context === null) {
      return false;
    }
    const assetManager = context.resourceManager;
    let codeCacheDir = "";
    if (codeCacheTag != "" && HippyBridgeImpl.mCodeCacheRootDir as string != "") {
      codeCacheDir = HippyBridgeImpl.mCodeCacheRootDir + codeCacheTag;
      try {
        let rs = fs.accessSync(codeCacheDir);
        if (!rs) {
          fs.mkdirSync(codeCacheDir, true);
        } else {
          const stat: fs.Stat = fs.statSync(codeCacheDir);
          if (!stat || !stat.isDirectory()) {
            fs.mkdirSync(codeCacheDir, true);
          }
        }
      } catch (e) {
        canUseCodeCache = false;
        codeCacheDir = "";
      }
    } else {
      canUseCodeCache = false;
    }
    let isRawfile = this.mEngineContext.getGlobalConfigs().isLoadFromRawfile();
    let resModuleName = this.mEngineContext.getGlobalConfigs().getResModuleName();
    return this.mJsDriver.runScriptFromUri(uri, isRawfile, assetManager, resModuleName, canUseCodeCache, codeCacheDir,
      this.mEngineContext.getVfsId(), callback);
  }

  onDestroy(): void {
    this.mEngineContext = null;
    this.mBridgeCallback = null;
  }

  destroy(callback: NativeCallback, isReload: boolean): void {
    this.mJsDriver.onDestroy(false, isReload, callback);
  }

  getV8RuntimeId(): number {
    return this.mJsDriver.getInstanceId();
  }

  callFunction(functionId: number, callback: NativeCallback, buffer: Uint8Array) {
    const functionName = this.getCallFunctionName(functionId)
    if (functionId == HippyBridgeManagerImpl.FUNCTION_ACTION_LOAD_INSTANCE) {
      this.mJsDriver.loadInstance(buffer, callback);
    } else if (functionId == HippyBridgeManagerImpl.FUNCTION_ACTION_DESTROY_INSTANCE) {
      this.mJsDriver.unloadInstance(buffer);
    } else {
      this.mJsDriver.callFunction(functionName, callback, buffer);
    }
  }

  private getCallFunctionName(functionId: number): string {
    let action = '';
    switch (functionId) {
      case HippyBridgeManagerImpl.FUNCTION_ACTION_LOAD_INSTANCE: {
        action = "loadInstance";
        break;
      }
      case HippyBridgeManagerImpl.FUNCTION_ACTION_RESUME_INSTANCE: {
        action = "resumeInstance";
        break;
      }
      case HippyBridgeManagerImpl.FUNCTION_ACTION_PAUSE_INSTANCE: {
        action = "pauseInstance";
        break;
      }
      case HippyBridgeManagerImpl.FUNCTION_ACTION_DESTROY_INSTANCE: {
        action = "destroyInstance";
        break;
      }
      case HippyBridgeManagerImpl.FUNCTION_ACTION_CALLBACK: {
        action = "callBack";
        break;
      }
      case HippyBridgeManagerImpl.FUNCTION_ACTION_CALL_JS_MODULE: {
        action = "callJsModule";
        break;
      }
      case HippyBridgeManagerImpl.FUNCTION_ACTION_ON_WEBSOCKET_MESSAGE: {
        action = "onWebsocketMsg";
        break;
      }
      default:
        LogUtils.w(HippyBridgeImpl.TAG, "getCallFunctionName: Unknown function id=" + functionId);

    }
    return action;
  }
}
