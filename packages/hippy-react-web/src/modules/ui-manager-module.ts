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

type MeasureReturns = (
  x: number,
  y: number,
  width: number,
  height: number,
  left: number,
  top: number
) => void;

function getRect(node: HTMLElement) {
  let targetNode = node as any;
  const height = targetNode.offsetHeight;
  const width = targetNode.offsetWidth;
  let left = targetNode.offsetLeft;
  let top = targetNode.offsetTop;
  targetNode = targetNode.offsetParent;

  while (targetNode && targetNode.nodeType === 1 /* Node.ELEMENT_NODE */) {
    left += targetNode.offsetLeft - targetNode.scrollLeft;
    top += targetNode.offsetTop - targetNode.scrollTop;
    targetNode = targetNode.offsetParent;
  }
  return {
    height,
    left,
    top,
    width,
  };
}

const UIManager = {
  measure(node: HTMLElement, callback: MeasureReturns) {
    const relativeNode = node.parentNode as HTMLElement;
    if (node && relativeNode) {
      setTimeout(() => {
        const relativeRect = getRect(relativeNode);
        const {
          height, left, top, width,
        } = getRect(node);
        const x = left - relativeRect.left;
        const y = top - relativeRect.top;
        callback(x, y, width, height, left, top);
      }, 0);
    }
  },
};

export default UIManager;
