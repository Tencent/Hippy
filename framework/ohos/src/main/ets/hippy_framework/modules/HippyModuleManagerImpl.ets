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
import { HippyException } from '../../support/common/HippyException'
import { HippyEngineContext } from '../HippyEngineContext'
import { HippyNativeModuleBase } from "./native/HippyNativeModuleBase"
import { AudioPlayerModule } from "./native/audio/AudioPlayerModule"
import { ConsoleModule } from "./native/console/ConsoleModule"
import { StorageModule } from "./native/storage/StorageModule"
import { DevMenuModule } from "./native/debug/DevMenuModule"
import { DeviceEventModule } from "./native/deviceevent/DeviceEventModule"
import { ExceptionModule } from "./native/exception/ExceptionModule"
import { ImageLoaderModule } from "./native/image/ImageLoaderModule"
import { NetInfoModule } from "./native/netinfo/NetInfoModule"
import { NetworkModule } from "./native/network/NetworkModule"
import { WebSocketModule } from "./native/network/WebSocketModule"
import { UtilsModule } from "./native/utils/UtilsModule"
import { HippyModuleManager } from './HippyModuleManager'
import { HippyCallNativeParams } from '../bridge/HippyCallNativeParams'
import { LogUtils } from '../../support/utils/LogUtils'
import { HippyJavaScriptModuleBase } from './javascript/HippyJavaScriptModuleBase'
import { Dimensions } from './javascript/Dimensions'
import { EventDispatcher } from './javascript/EventDispatcher'
import { HippyAny, HippyArray, HippyValue } from '../../support/common/HippyTypes'
import { TextUtils } from '../../support/utils/TextUtils'
import { HippyModulePromise } from './HippyModulePromise'
import { HippyModulePromiseImpl } from './HippyModulePromiseImpl'
import { BinaryReader } from '../../serialization/reader/BinaryReader'
import { Deserializer } from '../serialization/Deserializer'
import { ViewManagerModule } from './native/viewmanager/ViewManagerModule'
import { HippyModuleUtils } from './HippyModuleUtils'

export type HippyNativeModuleCreator = (ctx: HippyEngineContext) => HippyNativeModuleBase

export type HippyJSModuleCreator = (ctx: HippyEngineContext) => HippyJavaScriptModuleBase

export function hippyNativeModuleCreatorRegisterMap(): Map<string, HippyNativeModuleCreator> {
  let registerMap: Map<string, HippyNativeModuleCreator> = new Map()
  registerMap.set(AudioPlayerModule.NAME, (ctx): HippyNativeModuleBase => new AudioPlayerModule(ctx))
  registerMap.set(ConsoleModule.NAME, (ctx): HippyNativeModuleBase => new ConsoleModule(ctx))
  registerMap.set(StorageModule.NAME, (ctx): HippyNativeModuleBase => new StorageModule(ctx))
  registerMap.set(DevMenuModule.NAME, (ctx): HippyNativeModuleBase => new DevMenuModule(ctx))
  registerMap.set(DeviceEventModule.NAME, (ctx): HippyNativeModuleBase => new DeviceEventModule(ctx))
  registerMap.set(ExceptionModule.NAME, (ctx): HippyNativeModuleBase => new ExceptionModule(ctx))
  registerMap.set(ImageLoaderModule.NAME, (ctx): HippyNativeModuleBase => new ImageLoaderModule(ctx))
  registerMap.set(NetInfoModule.NAME, (ctx): HippyNativeModuleBase => new NetInfoModule(ctx))
  registerMap.set(NetworkModule.NAME, (ctx): HippyNativeModuleBase => new NetworkModule(ctx))
  registerMap.set(WebSocketModule.NAME, (ctx): HippyNativeModuleBase => new WebSocketModule(ctx))
  registerMap.set(UtilsModule.NAME, (ctx): HippyNativeModuleBase => new UtilsModule(ctx))
  registerMap.set(ViewManagerModule.NAME, (ctx): HippyNativeModuleBase => new ViewManagerModule(ctx))
  return registerMap
}

export function hippyJSModuleCreatorRegisterMap(): Map<string, HippyJSModuleCreator> {
  let registerMap: Map<string, HippyJSModuleCreator> = new Map()
  registerMap.set(Dimensions.MODULE_NAME, (ctx): HippyJavaScriptModuleBase => new Dimensions(ctx))
  registerMap.set(EventDispatcher.MODULE_NAME, (ctx): HippyJavaScriptModuleBase => new EventDispatcher(ctx))
  return registerMap
}

export class HippyModuleManagerImpl implements HippyModuleManager {
  private ctx: HippyEngineContext;
  private nativeModuleCreatorRegisterMap: Map<string, HippyNativeModuleCreator>;
  private jsModuleCreatorRegisterMap: Map<string, HippyJSModuleCreator>;
  private cachedNativeModuleMap: Map<string, HippyNativeModuleBase> = new Map();
  private cachedJSModuleMap: Map<string, HippyJavaScriptModuleBase> = new Map();
  private mEnableV8Serialization: boolean;

  constructor(ctx: HippyEngineContext, enableV8Serialization: boolean) {
    this.ctx = ctx;
    this.nativeModuleCreatorRegisterMap = hippyNativeModuleCreatorRegisterMap();
    this.jsModuleCreatorRegisterMap = hippyJSModuleCreatorRegisterMap();
    this.mEnableV8Serialization = enableV8Serialization;
  }

  getJavaScriptModule(name: string): HippyJavaScriptModuleBase | null {
    if (this.cachedJSModuleMap.has(name)) {
      return this.cachedJSModuleMap.get(name) as HippyJavaScriptModuleBase
    } else {
      let creator = this.jsModuleCreatorRegisterMap.get(name)
      if (creator) {
        let module = creator(this.ctx)
        this.cachedJSModuleMap.set(name, module)
        return module
      } else {
        return null
      }
    }
  }

  public callNatives(params: HippyCallNativeParams): void {
    const buffer = params.buffer;
    const moduleName = params.moduleName;
    const moduleFunc = params.moduleFunc;

    // callNative 参数反序列化
    let moduleParam = HippyModuleUtils.bytesToArgument(buffer, this.mEnableV8Serialization);
    LogUtils.i('hippy', 'JsDriver callNatives moduleParam: ' + moduleParam);
    let module = this.getNativeModule(moduleName, false)
    if (module) {
      const promise: HippyModulePromise = new HippyModulePromiseImpl(
        this.ctx,
        params.moduleName,
        params.moduleFunc,
        params.callId
      );
      module.call(moduleFunc, moduleParam, promise)
    }
  }

  public destroy(): void {
    this.cachedNativeModuleMap.forEach((module: HippyNativeModuleBase) => {
      module.destroy();
    })
    this.cachedNativeModuleMap.clear();
    this.cachedJSModuleMap.clear();
  }

  public addModules(customNativeModules: Map<string, HippyNativeModuleCreator> | null): void {
    if (customNativeModules) {
      customNativeModules.forEach((value, key) => {
        this.nativeModuleCreatorRegisterMap?.set(key, value)
      })
    }
  }

  public getNativeModule(name: string, isTurbo: boolean): HippyNativeModuleBase | null {
    if (this.cachedNativeModuleMap.has(name)) {
      return this.cachedNativeModuleMap.get(name) as HippyNativeModuleBase
    } else {
      let creator = this.nativeModuleCreatorRegisterMap.get(name)
      if (creator) {
        let module = creator(this.ctx)
        if (module.isTurbo() !== isTurbo) {
          LogUtils.e('hippy', name + ' module is not turbo module')
          return null;
        }
        this.cachedNativeModuleMap.set(name, module)
        return module
      } else {
        LogUtils.e('hippy', name + ' module is null')
        return null
      }
    }
  }



}
