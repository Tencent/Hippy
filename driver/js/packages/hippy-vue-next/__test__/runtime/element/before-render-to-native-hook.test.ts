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

import { isFunction } from '@vue/shared';
import { HippyNode, NodeType } from '../../../src/runtime/node/hippy-node';
import { HippyElement } from '../../../src/runtime/element/hippy-element';

/**
 * before-render-to-native-hook.ts unit test case
 */
describe('beforeRenderToNative hook', () => {
  beforeAll(() => {
    global.__GLOBAL__ = {
      nodeId: 101,
    };
  });

  it('HippyElement API', async () => {
    try {
      const node = new HippyElement('div');

      expect(isFunction(node.appendChild)).toBeTruthy();
      expect(isFunction(node.insertBefore)).toBeTruthy();
      expect(isFunction(node.moveChild)).toBeTruthy();
      expect(isFunction(node.removeChild)).toBeTruthy();

      expect(node.classList instanceof Set).toBeTruthy();
      expect(node.style instanceof Object).toBeTruthy();
      expect(node.attributes instanceof Object).toBeTruthy();
    } catch (e) {
      console.error('HippyElement APIs have breaking changes, please update const variable \'BEFORE_RENDER_TO_NATIVE_HOOK_VERSION\' to disable this hook');
      throw e;
    }
  });

  it('HippyNode API', async () => {
    try {
      const node = new HippyNode(NodeType.ElementNode);

      expect(isFunction(node.appendChild)).toBeTruthy();
      expect(isFunction(node.insertBefore)).toBeTruthy();
      expect(isFunction(node.moveChild)).toBeTruthy();
      expect(isFunction(node.removeChild)).toBeTruthy();

      const childNode1 = new HippyNode(NodeType.ElementNode);
      const childNode2 = new HippyNode(NodeType.ElementNode);
      node.appendChild(childNode1);
      node.appendChild(childNode2);
      expect(node.firstChild === childNode1).toBeTruthy();
      expect(node.lastChild === childNode2).toBeTruthy();
    } catch (e) {
      console.error('HippyNode APIs have breaking changes, please update const variable \'BEFORE_RENDER_TO_NATIVE_HOOK_VERSION\' to disable this hook');
      throw e;
    }
  });
});
