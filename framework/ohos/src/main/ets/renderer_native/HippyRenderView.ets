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
import window from '@ohos.window'
import { HippyAny, HippyRecord } from '../support/common/HippyTypes';
import HippyRenderBaseView, { HippyObservedArray } from './components/base/HippyRenderBaseView';
import {
  hippyRenderViewCreatorRegisterMap,
  HRRenderViewCreator } from './components/HippyRenderRegisterMap';
import { NativeRenderContext } from './NativeRenderContext';
import { HRSize } from './utils/HRTypes';
import { HRDisplaySyncUtils } from './utils/HRDisplaySyncUtils';
import { buildHippyRenderView } from './HippyRenderViewBuilder';

@Observed
export class HippyRenderView extends HippyRenderBaseView {
  tag: number
  pagerName: string
  pagerData: HippyRecord
  private renderViewSize: HRSize
  private lazyCoreTasks: Array<() => void> = []
  uiContext: UIContext | null = null

  constructor(ctx: NativeRenderContext, pageName: string, pageData: HippyRecord, initViewSize: HRSize) {
    super(ctx)
    this.tag = ctx.getRootId()
    this.pagerName = pageName
    this.pagerData = pageData
    this.renderViewSize = initViewSize

    let renderManger = ctx.getNativeRender().getRenderManager()
    renderManger.initViewManager(this)
  }

  onDestroy(): void {

  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    if (propKey != null && typeof propValue == 'boolean') {
      this.handleRootEvent(propKey, propValue)
    }
    return super.setProp(propKey, propValue as HippyAny)
  }

  private handleRootEvent(event: string, enable: boolean) {
    if (event == HRDisplaySyncUtils.DO_FRAME.toLowerCase()) {
      if (this.uiContext) {
        if (enable) {
          HRDisplaySyncUtils.registerDoFrameListener(this.uiContext, this.ctx.getInstanceId(), this.tag)
        } else {
          HRDisplaySyncUtils.unregisterDoFrameListener(this.uiContext, this.ctx.getInstanceId(), this.tag)
        }
      }
    }
  }

  onSizeChanged(width: number, height: number) {
    let nativeRender = this.ctx.getNativeRender()
    nativeRender.updateDimension(width, height, false, false)
    nativeRender.onSizeChanged(this.tag, width, height, this.renderViewSize.width, this.renderViewSize.height)

    this.renderViewSize = new HRSize(width, height)
  }

  pageDidAppear(): void {

  }

  pageDidDisappear(): void {

  }

  aboutToDisappear(): void {
    if (this.uiContext) {
      HRDisplaySyncUtils.unregisterDoFrameListener(this.uiContext, this.ctx.getInstanceId(), this.tag)
    }
  }

  destroy(): void {

  }

  addSubRenderView(subRenderView: HippyRenderBaseView): void {
    super.addSubRenderView(subRenderView, -1)
  }

  getRenderViewCreatorRegisterMap(): Map<string, HRRenderViewCreator> {
    let viewRegisterMap = hippyRenderViewCreatorRegisterMap()
    let customCreatorMap = this.ctx.getCustomRenderViewCreatorMap()
    if (customCreatorMap) {
      customCreatorMap.forEach((value, key) => {
        viewRegisterMap.set(key, value)
      })
    }
    return viewRegisterMap
  }

}

@Component
export struct HippyRender {
  private readonly TAG = "HippyRender"
  @ObjectLink renderView: HippyRenderView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  aboutToAppear() {
    this.renderView.uiContext = this.getUIContext()
  }

  aboutToDisappear(): void {
    this.renderView.aboutToDisappear()
    this.renderView.uiContext = null
  }

  build() {
    Stack() {
      ForEach(this.children, (item: HippyRenderBaseView) => {
        buildHippyRenderView(item, null)
      }, (item: HippyRenderBaseView) => item.tag + '')
    }
    .width('100%')
    .height('100%')
  }

}
