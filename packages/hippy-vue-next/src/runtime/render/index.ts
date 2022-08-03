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

/**
 * Render模块，提供Native的render方法
 */
import { nextTick } from '@vue/runtime-core';

import { trace } from '../../util';
import { getHippyCachedInstance } from '../../util/instance';
import { Native } from '../native';
import type { NativeNode } from '../native/native-node';

/** Native节点操作方法 */
enum NodeOperateType {
  CREATE,
  UPDATE,
  DELETE,
}

/** 批处理Native节点接口类型 */
interface BatchNativeNode {
  // 节点操作类型
  type: NodeOperateType;
  // 节点列表
  nodes: NativeNode[];
}

// 终端是否正在处理节点操作
let IS_HANDLING = false;

// 待处理的批处理节点列表
let BATCH_NATIVE_NODES: BatchNativeNode[] = [];

/**
 * 将batchNodes节点转换，相同type且相邻的nodes组合到一起
 *
 * @param batchNodes - 待处理的批量native节点
 */
function chunkNodes(batchNodes: BatchNativeNode[]): BatchNativeNode[] {
  // 处理格式形如：
  // [ { type: 1, nodes: [1] }, { type: 1, nodes: [2] }, { type: 2, nodes: [3] }, { type: 1, nodes: [4] },  ]
  // 变为：
  // [ { type: 1, nodes: [1, 2] }, { type: 2, nodes: [3] }, { type: 1, nodes: [4] },  ]
  const result: BatchNativeNode[] = [];

  for (const batchNode of batchNodes) {
    const { type, nodes } = batchNode;
    const chunk = result[result.length - 1];

    if (!chunk || chunk.type !== type) {
      result.push({
        type,
        nodes,
      });
    } else {
      chunk.nodes = chunk.nodes.concat(nodes);
    }
  }

  return result;
}

/**
 * 将Native Node调用Native接口最终渲染到终端界面上
 *
 * @param nativeNodes - 待处理native节点
 * @param operateType - 操作类型
 */
function renderToNative(
  nativeNodes: NativeNode[],
  operateType: NodeOperateType,
) {
  // 首先将节点插入待处理列表
  BATCH_NATIVE_NODES.push({
    type: operateType,
    nodes: nativeNodes,
  });

  // 再判断当前是否已经在处理，如果终端还在处理，则先行返回
  if (IS_HANDLING) {
    return;
  }
  IS_HANDLING = true;

  // 如果节点已经处理完成，则将锁打开，下次即可直接处理
  if (BATCH_NATIVE_NODES.length === 0) {
    IS_HANDLING = false;
    return;
  }

  // 打开终端处理开关
  Native.hippyNativeDocument.startBatch();
  // 进入终端节点操作逻辑，等待vue的节点操作完成之后再处理
  nextTick().then(() => {
    // 将相邻的相同类型的节点组合到一起，减少操作次数
    const chunks = chunkNodes(BATCH_NATIVE_NODES);

    // 获取Native root view的id
    const { rootViewId } = getHippyCachedInstance();
    // 根据类型对节点进行批量操作，上屏
    chunks.forEach((chunk) => {
      switch (chunk.type) {
        case NodeOperateType.CREATE:
          trace('createNode', Date.now(), chunk.nodes);
          Native.hippyNativeDocument.createNode(rootViewId, chunk.nodes);
          break;
        case NodeOperateType.UPDATE:
          trace('updateNode', Date.now(), chunk.nodes);
          // iOS目前还不能一次性更新批量节点，这个需要终端修复，目前尚未
          if (Native.isIOS()) {
            chunk.nodes.forEach((node) => {
              Native.hippyNativeDocument.updateNode(rootViewId, [node]);
            });
          } else {
            Native.hippyNativeDocument.updateNode(rootViewId, chunk.nodes);
          }
          break;
        case NodeOperateType.DELETE:
          trace('deleteNode', Date.now(), chunk.nodes);
          // iOS目前还不能一次性删除批量节点，待修复
          if (Native.isIOS()) {
            chunk.nodes.forEach((node) => {
              Native.hippyNativeDocument.deleteNode(rootViewId, [node]);
            });
          } else {
            Native.hippyNativeDocument.deleteNode(rootViewId, chunk.nodes);
          }
          break;
        default:
          break;
      }
    });

    // 节点操作处理完之后，调用native关闭批量处理开关
    Native.hippyNativeDocument.endBatch();

    // 复位批处理开关
    IS_HANDLING = false;
    // 清空待处理节点
    BATCH_NATIVE_NODES = [];
  });
}

/**
 * 将待渲染待native节点插入native
 *
 * @param nativeNodes - 待插入 native 节点
 */
export function renderInsertChildNativeNode(nativeNodes: NativeNode[]): void {
  renderToNative(nativeNodes, NodeOperateType.CREATE);
}

/**
 * 将待移除native节点从native移除
 *
 * @param deleteNodes - 待移除 native 节点
 */
export function renderRemoveChildNativeNode(deleteNodes: NativeNode[]): void {
  renderToNative(deleteNodes, NodeOperateType.DELETE);
}

/**
 * 将待更新native节点更新
 *
 * @param updateNodes - 待更新 native 节点
 */
export function renderUpdateChildNativeNode(updateNodes: NativeNode[]): void {
  renderToNative(updateNodes, NodeOperateType.UPDATE);
}
