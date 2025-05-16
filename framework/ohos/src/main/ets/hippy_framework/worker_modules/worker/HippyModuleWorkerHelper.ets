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
import { worker, MessageEvents, ErrorEvent } from '@kit.ArkTS';
import libHippy from 'libhippy.so';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HippyWCallNativeParams } from '../HippyWCallNativeParams';
import { HippyWModuleContext } from '../HippyWModuleContext';
import { HippyWModuleCreator, HippyWModuleManagerImpl } from '../HippyWModuleManagerImpl';

let manager: HippyWModuleManagerImpl | null = null;

let callNatives = (
  scopeId: number,
  moduleName: string,
  moduleFunc: string,
  callId: string,
  buffer: ArrayBuffer): void => {
  LogUtils.i('hippy worker', 'Worker callNatives params, '
    + scopeId + ' - '
    + moduleName + ' - '
    + moduleFunc + ' - '
    + callId + ' - '
    + buffer);

  if (manager) {
    const callNativeParams = new HippyWCallNativeParams(scopeId, moduleName, moduleFunc, callId, buffer);
    manager.callNatives(callNativeParams);
  }

  LogUtils.i('hippy worker', 'Worker callNatives end');
}

export function doStartHippyModuleWorker(moduleCreatorMap: Map<string, HippyWModuleCreator>): void {
  let ctx = new HippyWModuleContext(libHippy);
  manager = new HippyWModuleManagerImpl(ctx, moduleCreatorMap, false);

  // 创建worker线程中与宿主线程通信的对象
  const workerPort = worker.workerPort
  const workerName = workerPort.name

  libHippy.Worker_RegisterWModules(workerName, callNatives, manager.getModuleNames());

  // worker线程接收宿主线程信息
  workerPort.onmessage = (e: MessageEvents): void => {
    // data：宿主线程发送的信息
    let data: string = e.data;
    if (data == 'DoExit') {
      libHippy.Worker_UnregisterWModules(manager!.getModuleNames())
      LogUtils.i('hippy worker', 'Worker exited, name: ' + workerName);
    }
  }

  // worker线程发生error的回调
  workerPort.onerror = (err: ErrorEvent) => {
    LogUtils.e('hippy worker', 'HippyBaseModuleWorker.ets onerror, name: ' + workerName + ', err: ' + err.message);
  }
}
