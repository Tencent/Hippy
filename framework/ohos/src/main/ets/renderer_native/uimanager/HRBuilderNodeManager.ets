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
import { BuilderNode, FrameNode } from '@kit.ArkUI'
import HippyRenderBaseView from '../components/base/HippyRenderBaseView'

export class HRBuilderNodeManager {
  private customViewBuilderNodeMap: Map<number, BuilderNode<[HippyRenderBaseView]>>
  private bizViewBuilderNodeMap: Map<number, BuilderNode<[HippyRenderBaseView]>>

  constructor() {
    this.customViewBuilderNodeMap = new Map<number, BuilderNode<[HippyRenderBaseView]>>()
    this.bizViewBuilderNodeMap = new Map<number, BuilderNode<[HippyRenderBaseView]>>()
  }

  addCustomViewBuilderNode(tag: number, builderNode: BuilderNode<[HippyRenderBaseView]>): void {
    this.customViewBuilderNodeMap.set(tag, builderNode)
  }

  removeCustomViewBuilderNode(tag: number): void {
    let builderNode = this.customViewBuilderNodeMap.get(tag)
    if (builderNode) {
      builderNode.dispose()
      this.customViewBuilderNodeMap.delete(tag)
    }
  }

  addBizViewBuilderNode(bizViewId: number, builderNode: BuilderNode<[HippyRenderBaseView]>): void {
    this.bizViewBuilderNodeMap.set(bizViewId, builderNode)
  }

  removeBizViewBuilderNode(bizViewId: number): void {
    let builderNode = this.bizViewBuilderNodeMap.get(bizViewId)
    if (builderNode) {
      builderNode.dispose()
      this.bizViewBuilderNodeMap.delete(bizViewId)
    }
  }

  removeAllBuilderNodes(): void {
    let customViewKeys = this.customViewBuilderNodeMap.keys()
    for (let key of customViewKeys) {
      let builderNode = this.customViewBuilderNodeMap.get(key)
      if (builderNode) {
        builderNode.dispose()
      }
    }
    this.customViewBuilderNodeMap.clear()

    let bizViewKeys = this.bizViewBuilderNodeMap.keys()
    for (let key of bizViewKeys) {
      let builderNode = this.bizViewBuilderNodeMap.get(key)
      if (builderNode) {
        builderNode.dispose()
      }
    }
    this.bizViewBuilderNodeMap.clear()
  }

}
