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
import { HippyWModuleManager } from './HippyWModuleManager'
import { LogUtils } from '../../support/utils/LogUtils'
import { HippyModuleUtils } from '../modules/HippyModuleUtils'
import { HippyWModuleContext } from './HippyWModuleContext'
import { HippyWModuleBase } from './native/HippyWModuleBase'
import { HippyModulePromise } from '../modules/HippyModulePromise'
import { HippyWModulePromiseImpl } from './HippyWModulePromiseImpl'
import { HippyArray } from '../../support/common/HippyTypes'
import { HippyWCallNativeParams } from './HippyWCallNativeParams'

export type HippyWModuleCreator = (ctx: HippyWModuleContext) => HippyWModuleBase

export class HippyWModuleManagerImpl implements HippyWModuleManager {
  private ctx: HippyWModuleContext;
  private nativeModuleCreatorRegisterMap: Map<string, HippyWModuleCreator>;
  private cachedNativeModuleMap: Map<string, HippyWModuleBase> = new Map();
  private mEnableV8Serialization: boolean;

  constructor(ctx: HippyWModuleContext, moduleCreatorMap: Map<string, HippyWModuleCreator>, enableV8Serialization: boolean) {
    this.ctx = ctx;
    this.nativeModuleCreatorRegisterMap = moduleCreatorMap;
    this.mEnableV8Serialization = enableV8Serialization;
  }

  public callNatives(params: HippyWCallNativeParams): void {
    const buffer = params.buffer;
    const moduleName = params.moduleName;
    const moduleFunc = params.moduleFunc;

    // callNative 参数反序列化
    let moduleParam = HippyModuleUtils.bytesToArgument(buffer, this.mEnableV8Serialization);
    LogUtils.i('hippy', 'WModuleManager callNatives moduleParam: ' + moduleParam);
    let module = this.getNativeModule(moduleName, false)
    if (module) {
      const promise: HippyModulePromise = new HippyWModulePromiseImpl(
        this.ctx,
        params.scopeId,
        params.moduleName,
        params.moduleFunc,
        params.callId
      );
      module.call(moduleFunc, moduleParam, promise)
    }
  }

  public destroy(): void {
    this.cachedNativeModuleMap.forEach((module: HippyWModuleBase) => {
      module.destroy();
    })
    this.cachedNativeModuleMap.clear();
  }

  public getNativeModule(name: string, isTurbo: boolean): HippyWModuleBase | null {
    if (this.cachedNativeModuleMap.has(name)) {
      return this.cachedNativeModuleMap.get(name) as HippyWModuleBase
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

  getModuleNames(): HippyArray {
    let array = Array.from(this.nativeModuleCreatorRegisterMap.keys())
    return array
  }

}
