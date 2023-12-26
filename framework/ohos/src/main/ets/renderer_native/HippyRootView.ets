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
import window from '@ohos.window';
import { HippyEngine } from '../hippy_framework';
import { HippyException } from '../support/common/HippyException';
import { HippyRecord } from '../support/common/HippyTypes';
import { LogUtils } from '../support/utils/LogUtils';
import { HRRenderViewCreator } from './components/HippyRenderRegisterMap';
import { HippyRender, HippyRenderView } from './HippyRenderView';
import { WrappedHippyCustomRenderViewBuilder } from './HippyRenderViewBuilder';
import { IHippyRenderExceptionListener } from './IHippyRenderExceptionListener';
import { NativeRender } from './NativeRender';
import { NativeRenderContext } from './NativeRenderContext';
import { HRSize } from './utils/HRTypes';
import { NodeContent } from '@ohos.arkui.node';

export class HippyRootView {
  renderView: HippyRenderView | null = null
  pagerName: string
  pagerData: HippyRecord
  rootSlot: NodeContent | null = null
  private ctx: NativeRenderContext
  renderViewSize: HRSize = new HRSize(0, 0)
  private lazyRenderViewTasks: Array<() => void> = []

  constructor(instanceId: number,
              rootId: number,
              customRenderViewCreatorMap: Map<string, HRRenderViewCreator> | null,
              nativeRender: NativeRender,
              wrappedCustomRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null,
              pagerName: string,
              pagerData: HippyRecord,
  ) {
    this.ctx = new NativeRenderContext(instanceId, rootId, customRenderViewCreatorMap, nativeRender, wrappedCustomRenderViewBuilder)
    this.pagerName = pagerName
    this.pagerData = pagerData
    this.initRenderView()
  }

  onDestroy() {
    this.renderView?.onDestroy()
    this.renderView = null
  }

  private initRenderView() {
    this.renderView = new HippyRenderView(this.ctx, this.pagerName, this.pagerData, this.renderViewSize)
    this.performAllRenderViewTasks()
  }

  getRootId(): number {
    return this.ctx.getRootId()
  }

  setRootSlot(rootSlot: NodeContent) {
    this.rootSlot = rootSlot;
  }

  onViewSizeChanged(size: HRSize, force = false) {
    if (!force && this.renderViewSize.width == size.width && this.renderViewSize.height == size.height) {
      return
    }
    this.renderViewSize = size
    if (this.renderView) {
      this.renderView.onSizeChanged(size.width, size.height)
    }
  }

  pageDidAppear() {
    this.performRenderViewTask(() => {
      if (this.renderView) {
        this.renderView.pageDidAppear()
      }
    })
  }

  pageDidDisappear() {
    this.performRenderViewTask(() => {
      if (this.renderView) {
        this.renderView.pageDidDisappear()
      }
    })
  }

  private performRenderViewTask(task: () => void) {
    if (this.renderView) {
      task()
    } else {
      this.lazyRenderViewTasks.push(task)
    }
  }

  private performAllRenderViewTasks() {
    for (let index = 0; index < this.lazyRenderViewTasks.length; index++) {
      const task = this.lazyRenderViewTasks[index];
      task()
    }
    this.lazyRenderViewTasks = []
  }

}

export class HippyRootViewWrapper {
  private rootView: HippyRootView | null = null
  private rootViewDidCreateCallback: ((rootView: HippyRootView) => void) | null = null

  setRootView(rootView: HippyRootView): void {
    this.rootView = rootView
    if (this.rootViewDidCreateCallback) {
      this.rootViewDidCreateCallback(this.rootView)
    }
  }

  getRootView(): HippyRootView | null {
    return this.rootView
  }

  setRootViewDidCreateCallback(callback: (rootView: HippyRootView) => void) {
    if (this.rootView) {
      callback(this.rootView)
    } else {
      this.rootViewDidCreateCallback = callback
    }
  }
}

class HippyRenderExceptionListener implements IHippyRenderExceptionListener {
  uiListener: ((exception: HippyException) => void) | null = null
  nativeRender: NativeRender | null = null

  onRenderException(exception: HippyException): void {
    exception = HippyException.safeBuild(exception)
    this.uiListener?.(exception)
    if (this.nativeRender) {
      this.nativeRender.handleRenderException(exception)
    }
  }
}

@Component
export struct HippyRoot {
  hippyEngine: HippyEngine | null = null
  rootViewWrapper: HippyRootViewWrapper | null = null
  initViewSize: HRSize = new HRSize(0, 0)
  onRenderException: ((exception: HippyException) => void) | null = null

  @State rootView: HippyRootView | null = null

  private rootSlot = new NodeContent()
  private renderInstanceId: number = -1
  private renderExceptionListener = new HippyRenderExceptionListener()
  private enableArkCApi: boolean = false

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

    this.renderInstanceId = this.hippyEngine.getNativeRenderProvider()!.getInstanceId()
    this.enableArkCApi = this.hippyEngine.getHippyEngineContext()!.getGlobalConfigs().enableArkCApi()

    this.renderExceptionListener.uiListener = this.onRenderException
    this.renderExceptionListener.nativeRender = this.hippyEngine.getNativeRenderProvider()!.getNativeRenderImpl()

    this.rootViewWrapper.setRootViewDidCreateCallback((rootView: HippyRootView) => {
      this.rootView = rootView
      if (this.initViewSize.width > 0) {
        this.rootView.onViewSizeChanged(this.initViewSize)
      }
      this.rootView.setRootSlot(this.rootSlot);

      let libHippy = this.hippyEngine?.getHippyEngineContext()?.getLibHippy()
      libHippy?.NativeRenderProvider_BindNativeRoot(this.rootSlot, this.renderInstanceId, this.rootView.getRootId(), 0)
    })
  }

  aboutToDisappear(): void {
    if (this.rootView) {
      let libHippy = this.hippyEngine?.getHippyEngineContext()?.getLibHippy()
      libHippy?.NativeRenderProvider_UnbindNativeRoot(this.renderInstanceId, this.rootView.getRootId(), 0)
    }
  }

  build() {
    Column() {
      if (this.rootView) {
        if (this.enableArkCApi) {
          ContentSlot(this.rootSlot)
        } else {
          HippyRender({
            renderView: this.rootView.renderView!,
            children: this.rootView.renderView!.children,
          })
            .width('100%')
            .height('100%')
            .onAppear(() => {
              LogUtils.d("hippy", "did hippy render")
            })
        }
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
