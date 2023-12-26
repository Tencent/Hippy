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
  HippyMap, HippyRenderCallback, HippyValue } from '../../support/common/HippyTypes'
import { LogUtils } from '../../support/utils/LogUtils'
import HippyRenderBaseView from '../components/base/HippyRenderBaseView'
import { HippyCustomComponentView } from '../components/custom/HippyCustomComponentView'
import { HRRenderViewCreator } from '../components/HippyRenderRegisterMap'
import { HRWebView } from '../components/web/HRWebView'
import { HippyRenderView } from '../HippyRenderView'
import { NativeRenderContext } from '../NativeRenderContext'
import { HRMeasureMode, HRMeasureResult } from '../utils/HRMeasure'
import { HRPadding, HRRect } from '../utils/HRTypes'
import { HRCreateMutation,
  HRDeleteMutation,
  HRMove2Mutation,
  HRMoveMutation,
  HRMoveNodeInfo,
  HRMutation, HRMutationType,
  HRUpdateEventListenerMutation,
  HRUpdateLayoutMutation,
  HRUpdateMutation } from './HRMutation'

export type HippyEndBatchCallback = () => void

export class HRViewManager {
  private readonly TAG = "HRViewManager"
  private ctx: NativeRenderContext
  private rootTag: number
  private rootRenderView: HippyRenderView | null = null
  private viewRegistry: Map<number, HippyRenderBaseView> = new Map()
  private viewCreatorRegisterMap: Map<string, HRRenderViewCreator> | null = null
  private mutations: HRMutation[] = []
  private endBatchCallbacks: HippyEndBatchCallback[] = []

  constructor(rootView: HippyRenderView) {
    this.ctx = rootView.ctx
    this.rootTag = rootView.ctx.getRootId()
    this.rootRenderView = rootView
    this.viewRegistry.set(this.rootTag, rootView)
  }

  getRootTag(): number {
    return this.rootTag
  }

  getRootRenderView(): HippyRenderView | null {
    return this.rootRenderView
  }

  getRenderView(tag: number): HippyRenderBaseView | null {
    let view = this.viewRegistry.get(tag)
    return view ? view : null
  }

  preCreateRenderView(tag: number, viewName: string): void {
    this.createRenderView(tag, viewName)
  }

  addMutations(m: HRMutation): void {
    this.mutations.push(m)
  }

  applyMutations(): void {
    for(let m of this.mutations) {
      this.applyMutation(m)
    }
    this.mutations.splice(0, this.mutations.length)
  }

  private applyMutation(mutation: HRMutation) {
    if (mutation.type === HRMutationType.CREATE) {
      let m = mutation as HRCreateMutation
      this.createRenderView(m.tag as number, m.viewName as string)
      this.insertSubRenderView(m.parentTag as number, m.tag as number, m.index as number)
      this.updateProps(m.tag as number, m.props as HippyMap, null)
    } else if (mutation.type === HRMutationType.UPDATE) {
      let m = mutation as HRUpdateMutation
      this.updateProps(m.tag as number, m.props as HippyMap, m.deleteProps)
    } else if (mutation.type === HRMutationType.MOVE) {
      let m = mutation as HRMoveMutation
      this.moveRenderView(m.nodeInfos as Array<HRMoveNodeInfo>, m.parentTag as number)
    } else if (mutation.type === HRMutationType.MOVE2) {
      let m = mutation as HRMove2Mutation
      this.move2RenderView(m.tagArray as Array<number>, m.toParentTag as number, m.fromParentTag as number, m.index as number)
    } else if (mutation.type === HRMutationType.DELETE) {
      let m = mutation as HRDeleteMutation
      this.removeRenderView(m.tag as number)
    } else if (mutation.type === HRMutationType.UPDATE_LAYOUT) {
      let m = mutation as HRUpdateLayoutMutation
      this.setRenderViewFrame(m.tag as number,
        new HRRect(m.left as number, m.top as number, m.width as number, m.height as number),
        m.paddingLeft ? new HRPadding(m.paddingLeft as number, m.paddingTop as number, m.paddingRight as number, m.paddingBottom as number) : null)
    } else if (mutation.type === HRMutationType.UPDATE_EVENT_LISTENER) {
      let m = mutation as HRUpdateEventListenerMutation
      this.updateProps(m.tag as number, m.props as HippyMap, null)
      this.updateEventListener(m.tag as number, m.props as HippyMap)
    }
  }

  private createRenderView(tag: number, viewName: string): void {
    let existRenderView = this.viewRegistry.get(tag)
    if (existRenderView) {
      return
    }
    let renderView = this.createRenderViewFromCreator(viewName)
    if (renderView) {
      renderView.tag = tag
      renderView.viewType = viewName
      this.viewRegistry.set(tag, renderView)
    } else {
      LogUtils.d(this.TAG, "createRenderView: failed:  " + viewName)
    }
  }

  private removeRenderView(tag: number): void {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      renderView.removeFromParentView()
      this.removeFromRegistry(renderView)
    }
  }

  private removeFromRegistry(renderView: HippyRenderBaseView): void {
    for (let i = 0; i < renderView.children.length; i++) {
      const subView = renderView.children[i]
      this.removeFromRegistry(subView)
    }
    this.viewRegistry.delete(renderView.tag)
  }

  private insertSubRenderView(parentTag: number, childTag: number, index: number): void {
    let parentView = this.viewRegistry.get(parentTag)
    let childView = this.viewRegistry.get(childTag)
    if (parentView && childView) {
      parentView.addSubRenderView(childView, index)
    } else {
      LogUtils.d(this.TAG, "insertSubRenderView parentTag:" +
        parentTag + ", child:" + childTag)
    }
  }

  private moveRenderView(nodeInfoArray: Array<HRMoveNodeInfo>, parentTag: number): void {
    let parent = this.viewRegistry.get(parentTag)
    if (!parent) {
      LogUtils.w(this.TAG, "moveNode: get parent failed!")
      return
    }

    nodeInfoArray.sort((a: HRMoveNodeInfo, b: HRMoveNodeInfo) => a.index - b.index)
    for (let i = 0; i < nodeInfoArray.length; i++) {
      let info = nodeInfoArray[i]
      let child = this.viewRegistry.get(info.tag)
      if (child) {
        child.removeFromParentView()
        parent.addSubRenderView(child, info.index)
      }
    }
  }

  private move2RenderView(tagArray: Array<number>, newParentTag: number, oldParentTag: number, index: number): void {
    let oldParent = this.viewRegistry.get(oldParentTag)
    let newParent = this.viewRegistry.get(newParentTag)
    if (!oldParent || !newParent) {
      LogUtils.w(this.TAG, "moveRenderView: oldParent=" + oldParentTag + ", newParent=" + newParentTag)
      return
    }
    for (let i = 0; i < tagArray.length; i++) {
      let child = this.viewRegistry.get(tagArray[i])
      if (child) {
        child.removeFromParentView()
        newParent.addSubRenderView(child, i + index)
      }
    }
  }

  private updateProps(tag: number, props: HippyMap, deleteProps: Array<string> | null) {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      let theView = renderView as HippyRenderBaseView
      if (props.size > 0) {
        props.forEach((value: HippyAny, key: string) => {
          // value maybe empty string / false / 0
          if (key && value != null && value != undefined) {
            theView.setProp(key, value)
          }
        })
      }
      if (deleteProps && deleteProps.length > 0) {
        deleteProps.forEach((value: string) => {
          if (value) {
            theView.setProp(value, null)
          }
        })
      }
    }
  }

  private updateEventListener(nodeId: number, props: HippyMap) {
    let renderView = this.viewRegistry.get(nodeId)
    if (renderView) {
      renderView.updateEventListener(props)
    }
  }

  public checkRegisteredEvent(nodeId: number, eventName: string): boolean {
    let renderView = this.viewRegistry.get(nodeId)
    if (renderView) {
      return renderView.checkRegisteredEvent(eventName)
    }
    return false
  }

  private setRenderViewFrame(tag: number, frame: HRRect, padding: HRPadding | null): void {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      renderView.setRenderViewFrame(frame, padding)
    }
  }

  callViewMethod(tag: number, method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      renderView.call(method, params, callback)
    }
  }

  callCustomMeasure(tag: number, width: number, widthMode: HRMeasureMode, height: number, heightMode: HRMeasureMode): HRMeasureResult {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      return (renderView as HippyCustomComponentView).customMeasure(width, widthMode, height, heightMode)
    }
    return new HRMeasureResult(0, 0)
  }

  willDestroy(): void {

  }

  onDestroy(): void {

  }

  private createRenderViewFromCreator(viewName: string): HippyRenderBaseView | null {
    if (this.viewCreatorRegisterMap == null && this.rootRenderView) {
      this.viewCreatorRegisterMap = this.rootRenderView.getRenderViewCreatorRegisterMap()
    }
    if (this.viewCreatorRegisterMap) {
      let creator = this.viewCreatorRegisterMap.get(viewName)
      if (creator) {
        return creator(this.ctx)
      }
    }
    return null
  }

  addEndBatchCallback(cb: HippyEndBatchCallback): void {
    if (this.endBatchCallbacks.indexOf(cb) < 0) {
      this.endBatchCallbacks.push(cb)
    }
  }

  removeEndBatchCallback(cb: HippyEndBatchCallback): void {
    const pos = this.endBatchCallbacks.indexOf(cb)
    if (pos >= 0) {
      this.endBatchCallbacks.splice(pos, 1)
    }
  }

  notifyEndBatchCallbacks(): void {
    this.endBatchCallbacks.forEach(cb => {
      cb()
    })
  }

  // for c-api
  createRenderViewForCApi(tag: number, viewName: string): HippyRenderBaseView | null {
    let renderView: HippyRenderBaseView | null = null
    if (viewName == "WebView") {
      renderView = new HRWebView(this.ctx);
    } else {
      let customCreatorMap = this.ctx.getCustomRenderViewCreatorMap()
      if (customCreatorMap && customCreatorMap.size > 0) {
        let creator = customCreatorMap.get(viewName)
        if (creator) {
          renderView = creator(this.ctx)
        }
      }
    }

    if (renderView) {
      renderView.tag = tag
      renderView.viewType = viewName
      this.viewRegistry.set(tag, renderView)
      return renderView
    } else {
      LogUtils.d(this.TAG, "createRenderViewForCApi: failed:  " + viewName)
    }

    return null
  }

  // for c-api
  removeRenderViewForCApi(tag: number): void {
    this.removeRenderView(tag)
  }

  // for c-api
  updatePropsForCApi(tag: number, props: HippyMap, deleteProps: Array<string>): void {
    this.updateProps(tag, props, deleteProps)
  }

  // for c-api
  updateEventListenerForCApi(tag: number, props: HippyMap): void {
    this.updateEventListener(tag, props)
  }

  // for c-api
  setRenderViewFrameForCApi(tag: number, frame: HRRect, padding: HRPadding | null): void {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      renderView.setRenderViewFrame(frame, padding)
    }
  }

  // for c-api
  callRenderViewMethodForCApi(tag: number, method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    this.callViewMethod(tag, method, params, callback)
  }

  // for c-api
  onChildInsertedForCApi(tag: number, childTag: number, childViewName: string, childIndex: number): void {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      renderView.onChildInserted(childTag, childViewName, childIndex)
    }
  }

  // for c-api
  onChildRemovedForCApi(tag: number, childTag: number, childViewName: string, childIndex: number): void {
    let renderView = this.viewRegistry.get(tag)
    if (renderView) {
      renderView.onChildRemoved(childTag, childViewName, childIndex)
    }
  }

}
