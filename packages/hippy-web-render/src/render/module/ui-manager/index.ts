/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

import { HIPPY_COMPONENT_METHOD } from '../node-def';
import { callBackMeasureInWindowToHippy } from '../../common';
import { UIManagerModuleCreateNode } from './create-node';
import { UIManagerModuleUpdateNode } from './update-node';
import { UIManagerModuleDeleteNode } from './delete-node';
const ActionMap = {
  startBatch: () => {
  },
  createNode: UIManagerModuleCreateNode,
  deleteNode: UIManagerModuleDeleteNode,
  updateNode: UIManagerModuleUpdateNode,
  flushBatch: () => {
  },
  endBatch: () => {
  },
  callUIFunction: (_rootViewId: string, params: Array<any>, callBackId: any) => {
    const realParams = params[0];
    if (!realParams || realParams.length < 3) {
      return;
    }
    const nodeId = realParams[0];
    const functionName = realParams[1];
    const paramList = realParams[2];
    if (!nodeId || document.getElementById(nodeId) === null) {
      return;
    }
    const el = document.getElementById(nodeId);
    if (!el || !el[HIPPY_COMPONENT_METHOD]) {
      return;
    }
    if (el) {
      el[HIPPY_COMPONENT_METHOD][functionName]?.call(el, callBackId, paramList);
    }
  },
  measureInWindow: (_rootViewId: string, params: Array<any>, callBackId: any) => {
    const measureNodeId = params[0];
    if (!measureNodeId) {
      return;
    }
    const element = document.getElementById(measureNodeId);
    if (element) {
      const rect = element.getBoundingClientRect();
      callBackMeasureInWindowToHippy(
        callBackId,
        {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          statusBarHeight: 0,
        },
        true,
      );
    }
  },
};
export function UIManagerModuleDispatch(action, rootViewId: string, params: any, callBackId: any) {
  ActionMap[action](rootViewId, params, callBackId);
}
