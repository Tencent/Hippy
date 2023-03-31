/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
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

import { HippyElement } from '../../src/runtime/element/hippy-element';
import {
  recursivelyUnCacheNode,
  requestIdleCallback,
  cancelIdleCallback,
  preCacheNode,
  getNodeById,
  unCacheNodeOnIdle,
} from '../../src/util/node-cache';

/**
 * node-cache.ts unit test case
 */
describe('util/index.ts', () => {
  jest.useFakeTimers();
  it('check node cache operation', async () => {
    const node = new HippyElement('div');
    const childNode = new HippyElement('div');
    node.nodeId = 12;
    childNode.nodeId = 13;
    node.childNodes = [childNode];
    preCacheNode(node, 12);
    preCacheNode(childNode, 13);
    let cachedNode = getNodeById(12);
    expect(node).toEqual(cachedNode);

    let cachedChildNode = getNodeById(13);
    expect(childNode).toEqual(cachedChildNode);

    recursivelyUnCacheNode(node);
    cachedNode = getNodeById(12);
    expect(cachedNode).toEqual(null);

    cachedChildNode = getNodeById(13);
    expect(cachedChildNode).toEqual(null);

    const id = requestIdleCallback(() => {});
    cancelIdleCallback(id);

    const otherNode = new HippyElement('div');
    otherNode.nodeId = 14;
    preCacheNode(otherNode, 14);
    cachedNode = getNodeById(14);
    expect(otherNode).toEqual(cachedNode);
    unCacheNodeOnIdle(otherNode);
    // Fast-forward until all timers have been executed
    jest.runAllTimers();
    cachedNode = getNodeById(14);
    expect(cachedNode).toEqual(null);
  });
});
