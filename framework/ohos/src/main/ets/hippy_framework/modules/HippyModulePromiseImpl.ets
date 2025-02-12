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
import {
  HippyAny,
  HippyArray, HippyMap, HippyValue } from '../../support/common/HippyTypes';
import { TextUtils } from '../../support/utils/TextUtils';
import { HippyEngineContext } from '../HippyEngineContext';
import { HippyModulePromise } from './HippyModulePromise';
import { inspector } from '@kit.ArkUI';


export class HippyModulePromiseImpl implements HippyModulePromise {
  public static TAG: string = "HippyModulePromiseImpl";
  public static CALL_ID_NO_CALLBACK = "-1";
  public static PROMISE_CODE_SUCCESS = 0;
  public static PROMISE_CODE_NORMAN_ERROR = 1;
  public static PROMISE_CODE_OTHER_ERROR = 2;
  public context: HippyEngineContext;
  public mModuleName: string;
  public mModuleFunc: string;
  public mCallId: string;

  public constructor(
    context: HippyEngineContext,
    moduleName: string,
    moduleFunc: string,
    callId: string) {
    this.context = context;
    this.mModuleName = moduleName;
    this.mModuleFunc = moduleFunc;
    this.mCallId = callId;
  }

  resolve(value: HippyAny): void {
    this.doCallback(HippyModulePromiseImpl.PROMISE_CODE_SUCCESS, value);
  }

  reject(error: HippyAny): void {
    this.doCallback(HippyModulePromiseImpl.PROMISE_CODE_OTHER_ERROR, error);
  }

  isCallback(): boolean {
    return !TextUtils.equals(this.mCallId, HippyModulePromiseImpl.CALL_ID_NO_CALLBACK);
  }

  getCallId(): string {
    return this.mCallId;
  }

  public doCallback(code: number, resultObject: HippyAny): void {
    if (this.context == null || !this.isCallback()) {
      return;
    }

    const resultMap: Map<string, HippyAny> = new Map<string, HippyAny>();
    resultMap.set("result", code);
    resultMap.set("moduleName", this.mModuleName);
    resultMap.set("moduleFunc", this.mModuleFunc);
    resultMap.set("callId", this.mCallId);
    resultMap.set("params", resultObject);
    this.context.getBridgeManager()?.execPromiseCallback(resultMap);
  }
}
