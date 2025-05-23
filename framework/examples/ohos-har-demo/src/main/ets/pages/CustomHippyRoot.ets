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
import { HippyEngine, HippyRootViewWrapper, HippyRootView, HippyException } from 'hippy';
import { NodeContent } from '@kit.ArkUI';
import { HRSize } from 'hippy/src/main/ets/renderer_native/utils/HRTypes';

@Component
export struct CustomHippyRoot {
  @Link hippyEngine: HippyEngine | null
  rootViewWrapper: HippyRootViewWrapper | null = null
  initViewSize: HRSize = new HRSize(0, 0)
  onRenderException: ((exception: HippyException) => void) | null = null

  @State rootView: HippyRootView | null = null

  private rootSlot = new NodeContent()

  aboutToAppear(): void {
    if (!AppStorage.has('UIContextForHippy')) {
      AppStorage.setOrCreate<UIContext>('UIContextForHippy', this.getUIContext())
    }

    if (!this.hippyEngine || !this.hippyEngine.getNativeRenderProvider()) {
      this.onRenderException?.(new HippyException("Error, hippyEngine is null."))
      return
    }

    if (!this.rootViewWrapper) {
      this.onRenderException?.(new HippyException("Error, rootViewWrapper is null."))
      return
    }

    this.rootViewWrapper.setRootViewDidCreateCallback((rootView: HippyRootView) => {
      this.rootView = rootView
      if (this.initViewSize.width > 0) {
        this.rootView.onViewSizeChanged(this.initViewSize)
      }
      this.rootView.setRootSlot(this.rootSlot);
      if (this.hippyEngine) {
        let libHippy = this.hippyEngine?.getHippyEngineContext()?.getLibHippy()
        let renderInstanceId = this.hippyEngine?.getNativeRenderProvider()!.getInstanceId()
        libHippy?.NativeRenderProvider_BindNativeRoot(this.rootSlot, renderInstanceId, this.rootView.getRootId(), 0)
      }
    })

    this.rootViewWrapper.setRootViewWillDestroyCallback((rootView: HippyRootView) => {
      if (rootView) {
        if (this.hippyEngine) {
          let libHippy = this.hippyEngine?.getHippyEngineContext()?.getLibHippy()
          let renderInstanceId = this.hippyEngine?.getNativeRenderProvider()!.getInstanceId()
          libHippy?.NativeRenderProvider_UnbindNativeRoot(renderInstanceId, rootView.getRootId(), 0)
        }
        this.initViewSize = rootView.renderViewSize
      }
    })
  }

  aboutToDisappear(): void {
    if (this.rootView && this.hippyEngine) {
      let libHippy = this.hippyEngine?.getHippyEngineContext()?.getLibHippy()
      let renderInstanceId = this.hippyEngine?.getNativeRenderProvider()!.getInstanceId()
      libHippy?.NativeRenderProvider_UnbindNativeRoot(renderInstanceId, this.rootView.getRootId(), 0)
    }
  }

  build() {
    Column() {
      if (this.rootView) {
        ContentSlot(this.rootSlot)
      }
    }
    .width('100%')
    .height('100%')
    .onAreaChange((oldValue: Area, newValue: Area) => {
      let size = new HRSize(newValue.width as number, newValue.height as number)
      if (this.rootView) {
        this.rootView.onViewSizeChanged(size)
      } else {
        this.initViewSize = size
      }
    })
  }
}
