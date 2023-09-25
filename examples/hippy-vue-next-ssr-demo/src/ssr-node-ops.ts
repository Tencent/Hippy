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
import type { SsrNode } from '@hippy/vue-next-server-renderer';
import { IS_IOS } from './env';

/**
 * offer ssr node operates, without hippy-vue-next runtime
 */

/* eslint-disable no-param-reassign */

// key of ssr uniqueId
export const SSR_UNIQUE_ID_KEY = 'hippyUniqueId';

// SSR render tree type
interface SsrTreeNode {
  id: number;
  pId?: number;
  node: SsrNode;
  children: SsrTreeNode[];
}

// native operate node type
interface OperateNodeType {
  create: SsrNode[];
  update: SsrNode[];
  delete: SsrNode[];
  newNodeList: SsrNode[];
}

/**
 * Encapsulate the JSON.parse method and handle the catch block uniformly
 *
 * @param jsonStr - input json string
 */
function jsonParse(jsonStr: string): NeedToTyped {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return {};
  }
}

/**
 * get the cache data
 *
 * @param key - cache key
 */
async function getStorageItem(key: string): Promise<NeedToTyped> {
  return jsonParse(await global.Hippy.asyncStorage.getItem(key));
}

/**
 * set cache data
 *
 * @param key - cache key
 * @param data - cache data
 */
async function setStorageItem(key: string, data: NeedToTyped): Promise<void> {
  await global.Hippy.asyncStorage.setItem(key, JSON.stringify(data));
}

/**
 * set global uniqueId，ensure uniqueId is the max one, won't repeat with rendered nodes
 *
 * @param svrUniqueId - server returned unique ID
 * @param cachedUniqueId - cached unique ID
 */
export function setGlobalUniqueId(svrUniqueId = 0, cachedUniqueId = 0): void {
  global[SSR_UNIQUE_ID_KEY] = svrUniqueId > cachedUniqueId ? svrUniqueId : cachedUniqueId;
}

/**
 * get uniqueId
 */
function getUniqueId(): number {
  if (!global[SSR_UNIQUE_ID_KEY]) global[SSR_UNIQUE_ID_KEY] = 0;
  global[SSR_UNIQUE_ID_KEY] += 1;

  // The id does not use numbers that are multiples of 10
  // because id multiples of 10 is used by native
  if (global[SSR_UNIQUE_ID_KEY] % 10 === 0) {
    global[SSR_UNIQUE_ID_KEY] += 1;
  }

  return global[SSR_UNIQUE_ID_KEY];
}

/**
 * determine two object is equal
 *
 * @param object - to compare object
 * @param other - compare object
 */
function equalObjects(object: {}, other: {}): boolean {
  const objProps = Object.keys(object);
  const objLength = objProps.length;
  const othProps = Object.keys(other);
  const othLength = othProps.length;

  if (objLength !== othLength) {
    return false;
  }

  let key;
  let index = objLength;
  while (index -= 1) {
    key = objProps[index];
    if (!Object.prototype.hasOwnProperty.call(other, key)) {
      return false;
    }
  }

  let result = true;
  index += 1;
  while (index < objLength) {
    key = objProps[index];
    const objValue = object[key];
    const othValue = other[key];
    const objType = typeof objValue;
    const othType = typeof othValue;
    if (objType !== othType) {
      result = false;
      break;
    }

    // Recursively compare objects (susceptible to call stack limits).
    if (
      !(
        objValue === othValue
        || (objType === 'object'
          && objValue !== null
          && equalObjects(objValue, othValue))
      )
    ) {
      result = false;
      break;
    }
    index += 1;
  }
  return result;
}

/**
 * filter don't render nodes
 *
 * @param nodes - native node list
 */
function filterUnUsedNodes(nodes: SsrNode[]): SsrNode[] {
  // comment node and text node do not have tagName no need render
  return nodes.filter(v => v.name !== 'comment' && v.tagName);
}

/**
 * compare node is same, without id and pId attr
 *
 * @param lNode - to compare node
 * @param rNode - compare node
 */
function isSameNode(lNode: SsrNode, rNode: SsrNode): {
  isSameType: boolean;
  isSameNode: boolean;
} {
  const result = { isSameType: false, isSameNode: false };
  if (lNode.name !== rNode.name || lNode.tagName !== rNode.tagName) {
    return result;
  }
  // name or tagName is same, type is same
  result.isSameType = true;

  // this feature used to optimize image render, if img has noRenderSsrCache props,
  // we use default base64 image to instead img src when used cache. so we need
  // update img when insert cgi ssr node
  if (rNode.tagName === 'img' && rNode.props.noRenderSsrCache === true) {
    result.isSameNode = false;
    return result;
  }

  // if the index and props is same, the node is same
  if (lNode.index === rNode.index && equalObjects(lNode.props, rNode.props)) {
    result.isSameNode = true;
  }
  return result;
}

/**
 * plat node tree to node list
 *
 * @param tree - ssr node tree
 * @param list - ssr node list
 * @param parentId - parent node id
 */
function treeToList(tree: SsrTreeNode, list: SsrNode[] = [], parentId = 0): SsrNode[] {
  if (parentId) {
    tree.pId = parentId;
    tree.id = getUniqueId();
  }
  list.push({ ...tree.node, id: tree.id, pId: tree.pId });
  const { children } = tree;
  children.forEach((v) => {
    treeToList(v, list, parentId ? tree.id : 0);
  });
  return list;
}

/**
 * convert node list to node tree
 *
 * @param node - ssr node tree
 * @param list - ssr node list
 */
function listToTree(node: SsrNode, list: SsrNode[]): SsrTreeNode {
  let childrens = list
    .filter(v => v.pId === node.id)
    .sort((v, k) => v.index - k.index);
  const commentNodes = childrens.filter(v => v.name === 'comment');
  if (commentNodes.length) {
    // comment node index rule is different, re insert comment nodes by sequence
    childrens = childrens.filter(v => v.name !== 'comment');
    for (let i = commentNodes.length - 1; i >= 0; i--) {
      childrens.splice(commentNodes[i].index, 0, commentNodes[i]);
    }
  }
  const childrenNodes: NeedToTyped[] = [];
  childrens.forEach((v) => {
    childrenNodes.push(listToTree(v, list));
  });
  return {
    id: node.id,
    pId: node.pId,
    node,
    children: childrenNodes,
  };
}

/**
 * add diff nodes
 *
 * @param chunkNodes - all nodes
 * @param type - operate type
 * @param list - to add node list
 */
function addDiffNodes(chunkNodes: OperateNodeType, type: string, list: SsrNode[]): OperateNodeType {
  if (type === 'create') {
    chunkNodes.newNodeList = chunkNodes.newNodeList.concat(list);
    chunkNodes.create = chunkNodes.create.concat(list.filter(v => v.name !== 'comment'));
  }
  if (type === 'update') {
    chunkNodes.newNodeList = chunkNodes.newNodeList.concat(list);
    chunkNodes.update = chunkNodes.update.concat(list.filter(v => v.name !== 'comment'));
  }
  if (type === 'delete') {
    chunkNodes.delete = chunkNodes.delete.concat(list.filter(v => v.name !== 'comment'));
  }
  return chunkNodes;
}

/**
 * diff node tree
 *
 * @param cacheTree - cached node tree
 * @param serverTree - server returned node tree
 * @param chunkNodes - operate node chunk
 */
function diffNodeTree(cacheTree: SsrTreeNode, serverTree: SsrTreeNode, chunkNodes: OperateNodeType): OperateNodeType {
  const oldChildren = cacheTree.children;
  const { children } = serverTree;
  const commonLen = Math.min(oldChildren.length, children.length);

  // handle parent node first
  const cRes = isSameNode(cacheTree.node, serverTree.node);
  if (cRes.isSameNode) {
    chunkNodes.newNodeList.push(cacheTree.node);
  } else if (cRes.isSameType) {
    // node type is same, node id use cached, update other props
    const newNode = {
      ...serverTree.node,
      id: cacheTree.id,
      pId: cacheTree.pId,
    };
    chunkNodes = addDiffNodes(chunkNodes, 'update', [newNode]);
  } else {
    // node type id different, delete cached node, insert new node
    const newId = getUniqueId();
    const newNode = { ...serverTree.node, id: newId, pId: cacheTree.pId };
    chunkNodes = addDiffNodes(chunkNodes, 'delete', [cacheTree.node]);
    chunkNodes = addDiffNodes(chunkNodes, 'create', [newNode]);
    // child node also rebuild, delete old node's children
    oldChildren.forEach((v) => {
      chunkNodes = addDiffNodes(chunkNodes, 'delete', treeToList(v));
    });
    // child node also rebuild, create new node's children
    children.forEach((v) => {
      chunkNodes = addDiffNodes(chunkNodes, 'create', treeToList(v, [], newId));
    });
    return chunkNodes;
  }
  // compare common length children first
  for (let i = 0; i < commonLen; i++) {
    chunkNodes = diffNodeTree(oldChildren[i], children[i], chunkNodes);
  }
  // then, if old children still have, just delete
  if (oldChildren.length > commonLen) {
    oldChildren.slice(commonLen).forEach((v) => {
      chunkNodes = addDiffNodes(chunkNodes, 'delete', treeToList(v));
    });
  }
  // old children do not have but new children have, just create
  if (children.length > commonLen) {
    children.slice(commonLen).forEach((v) => {
      chunkNodes = addDiffNodes(
        chunkNodes,
        'create',
        treeToList(v, [], cacheTree.id),
      );
    });
  }
  return chunkNodes;
}

/**
 * compare cache tree and server tree, refresh native node tree, because cache node is rendered.
 * so native node id is cached first, but props is server first
 *
 * @param cacheList - cached node list
 * @param serverList - server returned node list
 */
export function diffSsrNodes(
  cacheList: SsrNode[],
  serverList: SsrNode[],
): OperateNodeType {
  const chunkNodes: OperateNodeType = {
    // merged node list
    newNodeList: [],
    create: [],
    update: [],
    delete: [],
  };
  const cacheTree = listToTree(cacheList[0], cacheList);
  const serverTree = listToTree(serverList[0], serverList);
  return diffNodeTree(cacheTree, serverTree, chunkNodes);
}

/**
 * insert native nodes
 *
 * @param rootViewId - native root id
 * @param nodes - prepare insert nodes
 */
export function insertNativeNodes(
  rootViewId: number,
  nodes: SsrNode[],
): void {
  global.Hippy.document.startBatch();
  global.Hippy.document.createNode(rootViewId, filterUnUsedNodes(nodes));
  global.Hippy.document.endBatch();
}

/**
 * delete native nodes
 *
 * @param rootViewId - native root id
 * @param nodes - prepare delete nodes
 */
export function deleteNativeNodes(
  rootViewId: number,
  nodes: SsrNode[],
): void {
  global.Hippy.document.startBatch();
  if (IS_IOS) {
    nodes.forEach((node) => {
      global.Hippy.document.deleteNode(rootViewId, [node]);
    });
  } else {
    global.Hippy.document.deleteNode(rootViewId, filterUnUsedNodes(nodes));
  }
  global.Hippy.document.endBatch();
}

/**
 * update native nodes
 *
 * @param rootViewId - native root id
 * @param nodes - prepare update nodes
 */
export function updateNativeNodes(
  rootViewId: number,
  nodes: SsrNode[],
): void {
  global.Hippy.document.startBatch();
  if (IS_IOS) {
    nodes.forEach((node) => {
      global.Hippy.document.updateNode(rootViewId, [node]);
    });
  } else {
    global.Hippy.document.updateNode(rootViewId, nodes);
  }
  global.Hippy.document.endBatch();
}

/**
 * handle diff nodes, include create, update, and delete. create, update, delete must by sequence.
 * because delete op may delete new node, but node do not create
 *
 * @param rootViewId - native root id
 * @param unHandleNodes - un handled nodes
 */
export function handleDifferentNodes(
  rootViewId: number,
  unHandleNodes: OperateNodeType,
): void {
  if (unHandleNodes.create.length) {
    insertNativeNodes(rootViewId, unHandleNodes.create);
  }
  if (unHandleNodes.update.length) {
    updateNativeNodes(rootViewId, unHandleNodes.update);
  }
  if (unHandleNodes.delete.length) {
    deleteNativeNodes(rootViewId, unHandleNodes.delete);
  }
}

/**
 * use cache to render native nodes
 *
 * @param rootViewId - native root id
 * @param cacheKey - cached key
 *
 * @public
 */
export async function renderNativeNodesByCache(
  rootViewId: number,
  cacheKey: string,
): Promise<[SsrNode[], SsrNode[], number]> {
  const cacheData = await getStorageItem(cacheKey);

  // cache exist and valid
  if (cacheData?.list?.length) {
    const cacheNodes = cacheData.list;
    // deep copy origin cached nodes, because node insert to native will change some props that
    // should cause hydrate mismatch, so we need cache origin nodes
    const backNodes = JSON.parse(JSON.stringify(cacheNodes));
    // root Node should be child of native rootView, so set root node's pId(parent Id) to
    // rootViewId(native view id)
    cacheNodes[0].pId = rootViewId;
    backNodes[0].pId = rootViewId;
    // use cache nodes to render
    insertNativeNodes(rootViewId, cacheNodes);
    // return all list
    return [cacheNodes, backNodes, cacheData.uniqueId];
  }
  // no cache data or exception, return empty
  return [[], [], 0];
}

/**
 * render ssrNodes to native, cache rendered nodes when useCache is true.
 * return value is boolean, false should clear cached nodes
 *
 * @param rootViewId - native root id
 * @param ssrNodes - server render nodes
 * @param uniqueId - server render unique id
 * @param cacheNodes - cached nodes
 * @param backNodes - backup cached nodes, use to diff
 * @param cacheUniqueId - cached unique id
 * @param useCache - use cache or not
 * @param cacheKey - cache key
 *
 * @public
 */
export async function renderSsrNodes(
  rootViewId: number,
  ssrNodes: SsrNode[],
  uniqueId: number,
  useCache?: boolean,
  cacheKey?: string,
  cacheNodes?: SsrNode[],
  backNodes?: SsrNode[],
  cacheUniqueId?: number,
): Promise<boolean> {
  if (ssrNodes.length) {
    // deep copy to cached, because node insert to native will change node props that
    // cause mismatch
    const ssrCacheNodes = JSON.parse(JSON.stringify(ssrNodes));
    // handle global uniqueId，compare with uniqueId, use the max one
    setGlobalUniqueId(uniqueId, cacheUniqueId);
    if (cacheNodes?.length && backNodes?.length) {
      // used cache, we should diff nodes
      try {
        // find different nodes, use origin server node list diff with origin cached node list
        const chunkNodes = diffSsrNodes(backNodes, ssrNodes);
        // update different nodes
        handleDifferentNodes(rootViewId, chunkNodes);
        // save rendered nodes to hydrate
        global.hippySSRNodes = chunkNodes.newNodeList;
      } catch (e) {
        // diff exception happens
        return false;
      }
    } else {
      // no cache, insert ssrNodes directly
      insertNativeNodes(rootViewId, ssrNodes);
      // save rendered nodes to hydrate
      global.hippySSRNodes = ssrNodes;
    }
    if (useCache && cacheKey) {
      await setStorageItem(cacheKey, {
        // current global unique Id
        uniqueId: global[SSR_UNIQUE_ID_KEY] ?? 0,
        list: ssrCacheNodes,
      });
    }
  }
  return true;
}
