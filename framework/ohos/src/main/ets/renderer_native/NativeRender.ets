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
import { HippyRootView } from '.';
import { CallResultCallback,
  EventListenerCallback,
  HippyRenderViewInfo } from '../hippy_library/HippyLibrary';
import { HippyException } from '../support/common/HippyException';
import { HippyExecutor } from '../support/common/HippyExecutor';
import { HippyArray, HippyRecord } from '../support/common/HippyTypes';
import { VfsManager } from '../vfs/VfsManager';
import HippyRenderBaseView from './components/base/HippyRenderBaseView';
import { ImageDecoderAdapter } from './components/image/ImageDecoderAdapter';
import { ImageLoaderAdapter } from './components/image/ImageLoaderAdapter';
import { FontAdapter } from './components/richtext/FontAdapter';
import { FrameworkProxy } from './FrameworkProxy'
import { WrappedHippyBizViewBuilder } from './HippyBizViewBuilder';
import {
  WrappedHippyCustomRenderViewBuilder } from './HippyRenderViewBuilder';
import { HRManager } from './uimanager/HRManager';
import { HippyEndBatchCallback } from './uimanager/HRViewManager';
import { HRPosition, HRRect } from './utils/HRTypes';

export interface NativeRender {
  createRootView(pageName: string, pageData: HippyRecord, wrappedCustomRenderViewBuilder: WrappedHippyCustomRenderViewBuilder | null): HippyRootView

  destroyRoot(rootId: number): void

  isEnableArkCApi(): boolean

  getRenderManager(): HRManager

  getBundlePath(): string

  getImageLoader(): ImageLoaderAdapter | null

  // TODO(eksea)
  // getImageDecoderAdapter(): ImageDecoderAdapter | null

  getVfsManager(): VfsManager | null

  // TODO(eksea)
  // getFontAdapter(): FontAdapter | null

  // TODO(eksea)
  // getBackgroundExecutor(): HippyExecutor | null

  getEngineId(): number

  onSizeChanged(rootId: number, width: number, height: number, oldWidth: number, oldHeight: number): void

  onSizeChanged2(rootId: number, nodeId: number, width: number, height: number, isSync: boolean): void

  updateDimension(width: number, height: number, shouldUseScreenDisplay: boolean, systemUiVisibilityChanged: boolean): void

  handleRenderException(exception: HippyException): void

  addEndBatchCallback(rootId: number, cb: HippyEndBatchCallback): void

  removeEndBatchCallback(rootId: number, cb: HippyEndBatchCallback): void

  getRenderView(rootId: number, nodeId: number): HippyRenderBaseView | null

  getViewParent(rootId: number, nodeId: number): HippyRenderViewInfo | null
  getViewChildren(rootId: number, nodeId: number): Array<HippyRenderViewInfo> | null
  callViewMethod(rootId: number, nodeId: number, method: string, params: HippyArray, callback: CallResultCallback | null): void
  setViewEventListener(rootId: number, nodeId: number, callback: EventListenerCallback | null): void
  getViewFrameInRoot(rootId: number, nodeId: number): HRRect | null
  addBizViewInRoot(rootId: number, position: HRPosition, viewBuilder: WrappedHippyBizViewBuilder, view: Object): number
  removeBizViewInRoot(rootId: number, customViewId: number): void

}
