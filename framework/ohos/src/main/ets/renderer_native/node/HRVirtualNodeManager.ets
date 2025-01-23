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
import { HippyMap } from '../../support/common/HippyTypes'
import { HRVirtualNode } from './HRVirtualNode'

export class HRVirtualNodeManager {
  private virtualNodes: Map<number, HRVirtualNode>

  constructor() {
    this.virtualNodes = new Map<number, HRVirtualNode>()
  }

  createVirtualNode(rootId: number, id: number, pid: number, index: number, props: HippyMap): HRVirtualNode {
    let node = new HRVirtualNode()
    node.rootId = rootId
    node.id = id
    node.pid = pid
    node.index = index
    node.props = props
    return node
  }

  addVirtualNode(id: number, node: HRVirtualNode) {
    this.virtualNodes.set(id, node)
  }

  removeVirtualNode(id: number) {
    this.virtualNodes.delete(id)
  }

  getVirtualNode(id: number): HRVirtualNode | null {
    let node = this.virtualNodes.get(id)
    return node ? node : null
  }

  getVirtualChildrenNode(id: number): HRVirtualNode[] {
    let ret: HRVirtualNode[] = [];
    this.virtualNodes.forEach((value: HRVirtualNode, key: number) => {
      if (value.pid == id) {
        ret.push(value);
      }
    })
    return ret;
  }
}
