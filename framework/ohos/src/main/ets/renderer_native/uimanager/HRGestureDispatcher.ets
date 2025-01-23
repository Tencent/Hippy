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
import { HRNodeProps } from '../dom_node/HRNodeProps'
import { NativeRenderContext } from '../NativeRenderContext'
import { HREventUtils } from '../utils/HREventUtils'

export class HRGestureDispatcher {
  static readonly TAG = "HRGestureDispatcher"
  static readonly KEY_PAGE_X = "page_x"
  static readonly KEY_PAGE_Y = "page_y"

  static handleAttachedToWindow(ctx: NativeRenderContext, nodeId: number) {
    HREventUtils.sendComponentEvent(ctx, nodeId, HRNodeProps.ON_ATTACHED_TO_WINDOW, null)
  }

  static handleDetachedFromWindow(ctx: NativeRenderContext, nodeId: number) {
    HREventUtils.sendComponentEvent(ctx, nodeId, HRNodeProps.ON_DETACHED_FROM_WINDOW, null)
  }

  static handleClickEvent(ctx: NativeRenderContext, nodeId: number, eventName: string) {
    HREventUtils.sendGestureEvent(ctx, nodeId, eventName, null)
  }

  static handleTouchEvent(ctx: NativeRenderContext, nodeId: number, windowX: number, windowY: number, eventName: string) {
    let params = new Map<string, number>()
    params.set(HRGestureDispatcher.KEY_PAGE_X, windowX)
    params.set(HRGestureDispatcher.KEY_PAGE_Y, windowY)
    HREventUtils.sendGestureEvent(ctx, nodeId, eventName, params)
  }
}
