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
import resmgr from "@ohos.resourceManager";
import { HippyLibrary } from '../../hippy_library/HippyLibrary';
import { BinaryWriter } from '../../serialization/writer/BinaryWriter';
import { LogUtils } from '../../support/utils/LogUtils';
import { BridgeCallback } from '../bridge/HippyBridge';
import { HippyCallNativeParams } from '../bridge/HippyCallNativeParams';
import { HippyModuleManager } from '../modules/HippyModuleManager';
import { Serializer } from '../serialization/Serializer';
import { NativeCallback } from './NativeCallback';

export class V8InitParams {
  public initialHeapSize: number = 0
  public maximumHeapSize: number = 0
}

export class JsDriver {
  private libHippy: HippyLibrary
  public instanceId: number = -1
  private moduleManager: HippyModuleManager | null = null
  private bridgeCallback: BridgeCallback | null = null

  constructor(libHippy: HippyLibrary, moduleManager: HippyModuleManager) {
    this.libHippy = libHippy
    this.moduleManager = moduleManager;
  }

  initialize(
    domManagerId: number,
    vfsId: number,
    isDevModule: boolean,
    callback: NativeCallback,
    globalConfig: string,
    mEnableV8Serialization: boolean,
    groupId: number,
    devtoolsId: number,
    isReload: boolean,
  ) {
    this.instanceId = this.onCreate(
      globalConfig,
      false, // TODO useLowMemoryMode
      mEnableV8Serialization,
      isDevModule,
      callback,
      groupId,
      domManagerId,
      null, // TODO v8InitParams
      vfsId,
      devtoolsId,
      isReload
    )
  }

  onCreate(
    globalConfig: string,
    useLowMemoryMode: boolean,
    enableV8Serialization: boolean,
    isDevModule: boolean,
    callback: NativeCallback,
    groupId: number,
    domManagerId: number,
    v8InitParams: V8InitParams | null,
    vfsId: number,
    devtoolsId: number,
    isReload: boolean
  ): number {
    let v8ParamArray: Array<number> | null = null
    if (v8InitParams) {
      v8ParamArray = new Array<number>()
      v8ParamArray[0] = v8InitParams.initialHeapSize
      v8ParamArray[1] = v8InitParams.maximumHeapSize
    }
    return this.libHippy?.JsDriver_CreateJsDriver(
      this,
      globalConfig,
      useLowMemoryMode,
      enableV8Serialization,
      isDevModule,
      callback,
      groupId,
      domManagerId,
      v8ParamArray,
      vfsId,
      devtoolsId,
      isReload
    )
  }

  onDestroy(
    useLowMemoryMode: boolean,
    isReload: boolean,
    callback: NativeCallback
  ) {
    this.libHippy?.JsDriver_DestroyJsDriver(
      this.instanceId,
      useLowMemoryMode,
      isReload,
      callback
    )
  }

  getInstanceId(): number {
    return this.instanceId;
  }


  setBridgeCallback(bridgeCallback: BridgeCallback) {
    this.bridgeCallback = bridgeCallback
  }

  loadInstance(
    buffer: Uint8Array,
    callback: NativeCallback
  ) {
    this.libHippy?.JsDriver_LoadInstance(this.instanceId, buffer.buffer as ArrayBuffer)
  }

  unloadInstance(
    buffer: Uint8Array
  ) {
    this.libHippy?.JsDriver_UnloadInstance(this.instanceId, buffer.buffer as ArrayBuffer)
  }

  runScriptFromUri(
    uri: string,
    isRawFile: boolean,
    assetManager: resmgr.ResourceManager,
    resModuleName: string,
    canUseCodeCache: boolean,
    codeCacheDir: string,
    vfsId: number,
    callback: NativeCallback
  ): boolean {
    return this.libHippy?.JsDriver_RunScriptFromUri(
      this.instanceId,
      uri,
      isRawFile,
      assetManager,
      resModuleName,
      canUseCodeCache,
      codeCacheDir,
      vfsId,
      callback
    )
  }

  attachToRoot(
    rootId: number
  ) {
    this.libHippy?.JsDriver_SetRootNode(this.instanceId, rootId)
  }

  onNativeInitEnd(
    startTime: number,
    endTime: number
  ) {
    this.libHippy?.JsDriver_OnNativeInitEnd(this.instanceId, BigInt(startTime), BigInt(endTime))
  }

  onResourceLoadEnd(
    uri: string,
    startTime: number,
    endTime: number,
    retCode: number,
    errorMsg: string
  ) {
    this.libHippy?.JsDriver_OnResourceLoadEnd(this.instanceId, uri, BigInt(startTime), BigInt(endTime), retCode, errorMsg)
  }

  callFunction(
    action: string,
    callback: NativeCallback,
    buffer: Uint8Array
  ) {
    this.libHippy?.JsDriver_CallFunction(this.instanceId, action, callback, buffer.buffer as ArrayBuffer)
  }

  // call from c++
  public callNatives(
    moduleName: string,
    moduleFunc: string,
    callId: string,
    buffer: ArrayBuffer
  ) {
    LogUtils.i('hippy', 'JsDriver callNatives params, '
     + moduleName + ' - '
     + moduleFunc + ' - '
     + callId + ' - '
     + buffer);

    if (this.moduleManager) {
      const callNativeParams = new HippyCallNativeParams(moduleName, moduleFunc, callId, buffer)
      this.moduleManager.callNatives(callNativeParams);
    }

    LogUtils.i('hippy', 'JsDriver callNatives end');
  }

  // call from c++
  public reportException(message: string, stackTrace: string) {
    if (message && stackTrace && this.bridgeCallback) {
      this.bridgeCallback.reportException(message, stackTrace)
    }
  }

}
