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
import { ErrorEvent, MessageEvents, worker } from "@kit.ArkTS";
import { HippyLibrary } from "../../../hippy_library/HippyLibrary";
import { LogUtils } from "../../../support/utils/LogUtils";

export type HippyNativeModuleWorkerCreator = (workerName: string) => worker.ThreadWorker | null
export type HippyNativeModuleWorkersReadyListener = () => void

const HIPPY_INVALID_TIMER_ID = -1;
const HIPPY_BASE_WORKER_NAME = "HippyBaseWorker";

export class HippyModuleWorkerInfo {
  mRefCounter: number = 0;
  mModuleThreadWorker: worker.ThreadWorker | null = null;
  mStopTimerId: number = HIPPY_INVALID_TIMER_ID;
}

let notifyMainThreadFromWorker = (
  workerName: string): void => {
  LogUtils.i('hippy worker', 'Worker notify main thread params, ' + workerName);
  HippyModuleWorkerManager.onWorkerReady(workerName);
}

// 模块Worker由多个HippyEngine共享，并通过workerName识别为同一个worker，因为：
// 1 为了节省线程资源，本身Worker里模块功能独立，没必要存在多份；
// 2 js调用时，从name到模块的映射不区分HippyEngine，不同worker里的moduleName不应该相同。
// 模块Worker延迟销毁，为了避免频繁创建和销毁Worker。
export class HippyModuleWorkerManager {
  private static mHasInitWModuleManager: boolean = false;
  private static mWorkerInfoMap: Map<string, HippyModuleWorkerInfo> = new Map<string, HippyModuleWorkerInfo>();
  private static mNotReadyWorkerNames: Set<string> = new Set<string>();
  private static mWorkerReadyListeners: Set<HippyNativeModuleWorkersReadyListener> = new Set<HippyNativeModuleWorkersReadyListener>();

  public static initBaseNativeModuleWorkers(libHippy: HippyLibrary) {
    let map = new Map<string, HippyNativeModuleWorkerCreator>();
    map.set(HIPPY_BASE_WORKER_NAME, (workerName): worker.ThreadWorker | null => HippyModuleWorkerManager.startCoreNativeModuleWorker());
    HippyModuleWorkerManager.initNativeModuleWorkers(libHippy, map);
  }

  public static releaseBaseNativeModuleWorkers() {
    let names = new Set<string>();
    names.add(HIPPY_BASE_WORKER_NAME);
    HippyModuleWorkerManager.releaseNativeModuleWorkers(names);
  }

  public static initNativeModuleWorkers(libHippy: HippyLibrary, workerCreatorMap: Map<string, HippyNativeModuleWorkerCreator> | null) {
    if (!HippyModuleWorkerManager.mHasInitWModuleManager) {
      libHippy.WorkerManager_InitWModuleManager(notifyMainThreadFromWorker);
      HippyModuleWorkerManager.mHasInitWModuleManager = true;
    }

    workerCreatorMap?.forEach((value, key) => {
      let info = HippyModuleWorkerManager.getWorkerInfo(key);
      if (info.mRefCounter == 0) {
        if (info.mStopTimerId >= 0) {
          clearTimeout(info.mStopTimerId);
          info.mStopTimerId = HIPPY_INVALID_TIMER_ID;
        } else {
          HippyModuleWorkerManager.mNotReadyWorkerNames.add(key);
          info.mModuleThreadWorker = value(key);
        }
      }
      ++info.mRefCounter;
    })
  }

  public static releaseNativeModuleWorkers(workerNames: Set<string> | null) {
    workerNames?.forEach((value) => {
      let info = HippyModuleWorkerManager.getWorkerInfo(value);
      if (info.mRefCounter > 0) {
        --info.mRefCounter;
        if (info.mRefCounter == 0) {
          info.mStopTimerId = setTimeout(() => {
            info.mStopTimerId = HIPPY_INVALID_TIMER_ID;
            HippyModuleWorkerManager.stopNativeModuleWorker(info.mModuleThreadWorker);
          }, 5000);
        }
      }
    })
  }

  private static getWorkerInfo(workerName: string): HippyModuleWorkerInfo {
    let info = HippyModuleWorkerManager.mWorkerInfoMap.get(workerName);
    if (info) {
      return info;
    }
    info = new HippyModuleWorkerInfo();
    HippyModuleWorkerManager.mWorkerInfoMap.set(workerName, info);
    return info;
  }

  public static onWorkerReady(workerName: string) {
    HippyModuleWorkerManager.mNotReadyWorkerNames.delete(workerName);
    if (HippyModuleWorkerManager.mNotReadyWorkerNames.size == 0) {
      for (let listener of HippyModuleWorkerManager.mWorkerReadyListeners) {
        listener();
      }
      HippyModuleWorkerManager.mWorkerReadyListeners.clear();
    }
  }

  public static checkWorkersReady(listener: HippyNativeModuleWorkersReadyListener) {
    if (HippyModuleWorkerManager.mNotReadyWorkerNames.size == 0) {
      listener();
      return;
    }
    HippyModuleWorkerManager.mWorkerReadyListeners.add(listener);
  }

  private static startCoreNativeModuleWorker(): worker.ThreadWorker | null {
    let w = new worker.ThreadWorker("../worker/HippyBaseModuleWorker.ets", {name: HIPPY_BASE_WORKER_NAME});
    if (!w) {
      LogUtils.e('hippy', 'create module thread worker failed.');
      return null;
    }
    w.onexit = (code) => {
      LogUtils.w('hippy', 'module thread worker terminated: ' + code);
    }
    w.onerror = (err: ErrorEvent) => {
      LogUtils.e('hippy', 'module thread worker error: ' + err.message);
    }
    w.onmessage = (e: MessageEvents): void => {
      // data：worker线程发送的信息
      // let data: string = e.data;
    }
    return w;
  }

  private static stopNativeModuleWorker(w: worker.ThreadWorker | null) {
    if (w) {
      w.postMessage('DoExit');
      w.terminate();
    }
  }

}
