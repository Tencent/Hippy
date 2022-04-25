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

import TDFInspector = ProtocolTdf.TDFInspector;

export const parseRenderNodeProperty = (properties: ProtocolTdf.TDFInspector.RenderNodeProperty[]) => {
  const parsedRenderNode: any = {};
  properties.forEach((property) => {
    let value;
    try {
      value = JSON.parse(property.value);
    } catch (e) {
      value = property.value;
    }
    parsedRenderNode[property.name] = value;
  });
  return parsedRenderNode;
};

/**
 * get domNode/renderNode by position
 * @param param0 event position
 * @param domTree/renderTree root node
 * @param param2 ratio
 * @returns selected node list
 */
export const getNodesByPosition = <T extends TDFInspector.RTree | TDFInspector.ITree>(
  { x, y }: TDFInspector.Point,
  node: T,
  { rootWidth, rootHeight, imgWidth, imgHeight }: TDFInspector.RatioOption,
) => {
  const horizonRatio = rootWidth / imgWidth;
  const verticalRatio = rootHeight / imgHeight;
  const screenX = x * horizonRatio;
  const screenY = y * verticalRatio;
  const validNodes: T[] = [];

  traverseTree(node, (node) => {
    if (isPointInBounds({ x: screenX, y: screenY }, node.bounds)) {
      validNodes.push(node);
    }
  });
  return validNodes;
};

const isPointInBounds = ({ x, y }: TDFInspector.Point, { top, left, bottom, right }: TDFInspector.INodeBounds) =>
  x >= left && x <= right && y >= top && y <= bottom;

// const isLeaf = (node: TDFInspector.RTree | TDFInspector.ITree) => !node.child?.length;

const traverseTree = (node: TreeNode, fn) => {
  fn(node);
  if (node.child) node.child.forEach((childNode) => traverseTree(childNode, fn));
};

interface TreeNode {
  child: TreeNode[];
}
