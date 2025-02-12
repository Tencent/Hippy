/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
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
import displaySync from '@ohos.graphics.displaySync';
import HashMap from '@ohos.util.HashMap';
import ArrayList from '@ohos.util.ArrayList';
import { HREventUtils } from './HREventUtils';

export type HippyDisplaySyncCallback = (frameInfo: displaySync.IntervalInfo) => void

export class HRDisplaySyncUtils {
  static readonly DO_FRAME = "frameUpdate"
  private static sEnablePostFrame = false
  private static sListeners: HashMap<number, ArrayList<number>> | null = null
  private static sBackDisplaySync: displaySync.DisplaySync | null = null
  private static sCallback: HippyDisplaySyncCallback | null = null

  private static handleDoFrameCallback(): void {
    HRDisplaySyncUtils.sListeners?.forEach((value: ArrayList<number>, key: number) => {
      let rendererId = key
      let rootList = value
      if (!rootList || !(rootList instanceof ArrayList)) {
        return
      }
      for (let rootId of rootList) {
        HREventUtils.sendRootEvent(rendererId, rootId, HRDisplaySyncUtils.DO_FRAME, null)
      }
    })
  }

  private static startPostFrame(): void {
    if (!HRDisplaySyncUtils.sBackDisplaySync) {
      HRDisplaySyncUtils.sBackDisplaySync = displaySync.create()
      HRDisplaySyncUtils.sCallback = (frameInfo: displaySync.IntervalInfo) => {
        HRDisplaySyncUtils.handleDoFrameCallback()
      }
      let range : ExpectedFrameRateRange = {
        expected: 60,
        min:0,
        max:120
      }
      HRDisplaySyncUtils.sBackDisplaySync.setExpectedFrameRateRange(range)
    }

    HRDisplaySyncUtils.sBackDisplaySync.on("frame", HRDisplaySyncUtils.sCallback)
    HRDisplaySyncUtils.sBackDisplaySync.start()
  }

  private static stopPostFrame(): void {
    HRDisplaySyncUtils.sBackDisplaySync?.stop()
    HRDisplaySyncUtils.sBackDisplaySync?.off("frame", HRDisplaySyncUtils.sCallback)
    HRDisplaySyncUtils.sBackDisplaySync = null
  }

  // Register frame callback listener, should call in ui thread.
  public static registerDoFrameListener(uiContext: UIContext, rendererId: number, rootId: number): void {
    uiContext.runScopedTask(() => {
      if (HRDisplaySyncUtils.sListeners == null) {
        HRDisplaySyncUtils.sListeners = new HashMap<number, ArrayList<number>>()
      }
      let roots = HRDisplaySyncUtils.sListeners.get(rendererId)
      if (roots == null) {
        roots = new ArrayList<number>()
        roots.add(rootId)
        HRDisplaySyncUtils.sListeners.set(rendererId, roots)
      } else {
        roots.add(rootId)
      }
      if (!HRDisplaySyncUtils.sEnablePostFrame) {
        HRDisplaySyncUtils.sEnablePostFrame = true
        HRDisplaySyncUtils.startPostFrame()
      }
    })
  }

  // Unregister frame callback listener, should call in ui thread.
  public static unregisterDoFrameListener(uiContext: UIContext, rendererId: number, rootId: number): void {
    uiContext.runScopedTask(() => {
      if (HRDisplaySyncUtils.sListeners == null) {
        return
      }
      let roots = HRDisplaySyncUtils.sListeners.get(rendererId)
      if (roots != null) {
        roots.remove(rootId)
        if (roots.isEmpty()) {
          HRDisplaySyncUtils.sListeners.remove(rendererId)
        }
      } else {
        HRDisplaySyncUtils.sListeners.remove(rendererId)
      }
      if (HRDisplaySyncUtils.sListeners.isEmpty()) {
        HRDisplaySyncUtils.sEnablePostFrame = false
        HRDisplaySyncUtils.stopPostFrame()
      }
    })
  }

}
