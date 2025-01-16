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
import { HippyAny, HippyMap, HippyRenderCallback } from '../../../support/common/HippyTypes'
import { LogUtils } from '../../../support/utils/LogUtils'
import { NativeRenderContext } from '../../NativeRenderContext'
import { HRValueUtils } from '../../utils/HRValueUtils'
import HippyRenderBaseView from '../base/HippyRenderBaseView'

export type HippyHeadRefreshFinishCallback = () => void

@Observed
export class HRWaterfallView extends HippyRenderBaseView {
  private readonly TAG = "HRWaterfallView"
  public edgeEffect: EdgeEffect = EdgeEffect.None;
  public padding: Padding = { top: 0, right: 0, bottom: 0, left: 0 };
  public scrollEventThrottle: number = 30
  public preloadItemNumber: number = 0
  public interItemSpacing: number = 0
  public columnSpacing: number = 0
  public columnsTemplate: string = '1fr 1fr'

  public uiCtx: UIContext | null = null
  public scroller: Scroller = new Scroller()

  public onHeadRefreshFinishCallback: HippyHeadRefreshFinishCallback | null = null

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny | HippyRenderCallback): boolean {
    LogUtils.d(this.TAG, `setProp: propKey:${propKey} , value:${propValue}`)
    switch (propKey) {
      case 'bounces':
        let b = HRValueUtils.getBoolean(propValue as HippyAny, false);
        this.edgeEffect = b ? EdgeEffect.Spring : EdgeEffect.None;
        return true
      case 'contentInset':
        let data: HippyMap = HRValueUtils.getMap(propValue as HippyAny) as HippyMap;
        if (data) {
          this.padding.top = HRValueUtils.getNumber(data.get('top'));
          this.padding.right = HRValueUtils.getNumber(data.get('right'));
          this.padding.bottom = HRValueUtils.getNumber(data.get('bottom'));
          this.padding.left = HRValueUtils.getNumber(data.get('left'));
        }
        return true
      case 'scrollEventThrottle':
        this.scrollEventThrottle = HRValueUtils.getNumber2(propValue as HippyAny, 30);
        return true
      case 'preloadItemNumber':
        this.preloadItemNumber = HRValueUtils.getNumber(propValue as HippyAny);
        return true
      case 'interItemSpacing':
        this.interItemSpacing = HRValueUtils.getNumber(propValue as HippyAny);
        return true
      case 'columnSpacing':
        this.columnSpacing = HRValueUtils.getNumber(propValue as HippyAny);
        return true
      case 'numberOfColumns':
        let template = '1fr'
        for (let i = 1; i < HRValueUtils.getNumber2(propValue as HippyAny, 2); i++) {
          template += ' 1fr'
        }
        this.columnsTemplate = template
        return true
      default:
        break;
    }

    return super.setProp(propKey, propValue as HippyAny)
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    this.uiCtx?.runScopedTask(() => {
      LogUtils.d(this.TAG, "call: method " + method + ", params: " + params)
      switch (method) {
        case "scrollToIndex":
          {
            // let xIndex = HRValueUtils.getNumber(params[0])
            let yIndex = HRValueUtils.getNumber(params[1])
            let animated = HRValueUtils.getBoolean(params[2], false)
            this.scroller.scrollToIndex(yIndex, animated)
          }
          break;
        case "scrollToContentOffset":
          {
            let xOffset = HRValueUtils.getNumber(params[0])
            let yOffset = HRValueUtils.getNumber(params[1])
            let animated = HRValueUtils.getBoolean(params[2], false)
            this.scroller.scrollTo({
              xOffset: xOffset,
              yOffset: yOffset,
              animation: animated
            })
          }
          break;
        case 'scrollToTop':
          {
            this.scroller.scrollToIndex(0)
          }
          break;
        default:
          break;
      }
    })
  }

  onHeadRefreshFinish() {
    if (this.onHeadRefreshFinishCallback) {
      this.onHeadRefreshFinishCallback()
    }
  }
}
