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

import { nextTick } from '@vue/runtime-core';

import { registerElement } from '../../../src/runtime/component';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { Native } from '../../../src/runtime/native/index';
import {
  renderInsertChildNativeNode,
  renderRemoveChildNativeNode,
  renderUpdateChildNativeNode,
} from '../../../src/runtime/render';
import { setHippyCachedInstance } from '../../../src/util/instance';

/**
 * render/index.ts unit test case
 */
describe('runtime/render.ts', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    jest.resetModules();

    registerElement('div', { component: { name: 'View' } });
    const root = new HippyElement('div');
    root.id = 'testRoot';

    setHippyCachedInstance({
      rootView: 'testRoot',
      rootViewId: 1,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance: {
        $el: root,
      },
    });
  });

  describe('test renderInsertChildNativeNode', () => {
    it('should call createNode method.', async () => {
      const createNodeSpy = jest.spyOn(
        Native.hippyNativeDocument,
        'createNode',
      );
      const nativeNodes = [
        {
          id: 2,
          pId: 1,
          index: 0,
          tagName: 'div',
        },
        {
          id: 3,
          pId: 1,
          index: 1,
          tagName: 'div',
        },
      ];
      renderInsertChildNativeNode(nativeNodes);
      await nextTick();

      expect(createNodeSpy).toHaveBeenCalled();
    });
  });

  describe('test renderUpdateChildNativeNode', () => {
    it('should call updateNode method in Android platform.', async () => {
      const updateNodeSpy = jest.spyOn(
        Native.hippyNativeDocument,
        'updateNode',
      );
      jest.spyOn(Native, 'isIOS').mockReturnValue(false);
      const nativeNodes = [
        {
          id: 2,
          pId: 1,
          index: 0,
          tagName: 'div',
        },
        {
          id: 3,
          pId: 1,
          index: 1,
          tagName: 'div',
        },
      ];
      renderUpdateChildNativeNode(nativeNodes);
      await nextTick();

      expect(updateNodeSpy).toHaveBeenCalled();
    });
    it('should call updateNode method in iOS platform.', async () => {
      const updateNodeSpy = jest.spyOn(
        Native.hippyNativeDocument,
        'updateNode',
      );
      jest.spyOn(Native, 'isIOS').mockReturnValue(true);
      const nativeNodes = [
        {
          id: 2,
          pId: 1,
          index: 0,
          tagName: 'div',
        },
        {
          id: 3,
          pId: 1,
          index: 1,
          tagName: 'div',
        },
      ];
      renderUpdateChildNativeNode(nativeNodes);
      await nextTick();

      expect(updateNodeSpy).toHaveBeenCalled();
    });
  });

  describe('test renderRemoveChildNativeNode', () => {
    it('should call deleteNode method in Android platform.', async () => {
      const deleteNodeSpy = jest.spyOn(
        Native.hippyNativeDocument,
        'deleteNode',
      );
      jest.spyOn(Native, 'isIOS').mockReturnValue(false);
      const nativeNodes = [
        {
          id: 2,
          pId: 1,
          index: 0,
          tagName: 'div',
        },
        {
          id: 3,
          pId: 1,
          index: 1,
          tagName: 'div',
        },
      ];
      renderRemoveChildNativeNode(nativeNodes);
      await nextTick();

      expect(deleteNodeSpy).toHaveBeenCalled();
    });
    it('should call deleteNode method in iOS platform.', async () => {
      const deleteNodeSpy = jest.spyOn(
        Native.hippyNativeDocument,
        'deleteNode',
      );
      jest.spyOn(Native, 'isIOS').mockReturnValue(true);
      const nativeNodes = [
        {
          id: 2,
          pId: 1,
          index: 0,
          tagName: 'div',
        },
        {
          id: 3,
          pId: 1,
          index: 1,
          tagName: 'div',
        },
      ];
      renderRemoveChildNativeNode(nativeNodes);
      await nextTick();

      expect(deleteNodeSpy).toHaveBeenCalled();
    });
  });
});
