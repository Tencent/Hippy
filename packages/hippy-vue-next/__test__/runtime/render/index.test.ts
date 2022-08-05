/**
 * runtime/native 终端接口模块
 */

import { nextTick } from '@vue/runtime-core';

import { registerHippyTag } from '../../../src/runtime/component';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { Native } from '../../../src/runtime/native/index';
import {
  renderInsertChildNativeNode,
  renderRemoveChildNativeNode,
  renderUpdateChildNativeNode,
} from '../../../src/runtime/render';
import { setHippyCachedInstance } from '../../../src/util/instance';

/**
 * @author mitnickliu
 * @priority P0
 * @casetype unit
 */
describe('runtime/render.ts', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    jest.resetModules();

    registerHippyTag('div', { name: 'View' });
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

      expect(createNodeSpy).toBeCalled();
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

      expect(updateNodeSpy).toBeCalled();
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

      expect(updateNodeSpy).toBeCalled();
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

      expect(deleteNodeSpy).toBeCalled();
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

      expect(deleteNodeSpy).toBeCalled();
    });
  });
});
