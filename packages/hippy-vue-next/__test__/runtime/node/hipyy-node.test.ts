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

import { getNodeById } from '../../../src/util/node-cache';
import { registerElement } from '../../../src/runtime/component';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { HippyNode, NodeType } from '../../../src/runtime/node/hippy-node';
import { setHippyCachedInstance } from '../../../src/util/instance';

/**
 * hippy-node.ts unit test case
 */
describe('runtime/node/hippy-node', () => {
  describe('test the default value of class members.', () => {
    it('should be 1.', () => {
      const hippyNode = new HippyNode(NodeType.ElementNode);
      expect(hippyNode.nodeId).toEqual(1);
      const textNode = new HippyNode(NodeType.TextNode);
      expect(textNode.isNeedInsertToNative).toBeFalsy();
      const commentNode = new HippyNode(NodeType.CommentNode);
      expect(commentNode.isNeedInsertToNative).toBeFalsy();
      const documentNode = new HippyNode(NodeType.DocumentNode);
      expect(documentNode.isNeedInsertToNative).toBeFalsy();
    });

    it('should not to be added to native node tree by default.', () => {
      const hippyNode = new HippyNode(NodeType.ElementNode);
      expect(hippyNode.isNeedInsertToNative).toBeTruthy();
    });

    it('should be null.', () => {
      const hippyNode = new HippyNode(NodeType.ElementNode);
      expect(hippyNode.parentNode).toBeNull();
      expect(hippyNode.prevSibling).toBeNull();
      expect(hippyNode.nextSibling).toBeNull();
      expect(hippyNode.firstChild).toBeNull();
      expect(hippyNode.lastChild).toBeNull();
      expect(hippyNode.component).toBeNull();
    });

    it('should be empty array [].', () => {
      const hippyNode = new HippyNode(NodeType.ElementNode);
      expect(hippyNode.childNodes.length).toBe(0);
    });

    it('ssr node init value test', () => {
      const hippyNode = new HippyNode(NodeType.ElementNode, { id: 1001, index: 0, name: 'View', props: {} });
      expect(hippyNode.nodeId).toEqual(1001);
      expect(hippyNode.isMounted).toBeTruthy();
    });
  });

  describe('test the node operation methods.', () => {
    beforeAll(() => {
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

    describe('append child node.', () => {
      it('no child to move should throw error', () => {
        const node = new HippyNode(NodeType.ElementNode);
        expect(() => node.appendChild(null as unknown as HippyNode)).toThrow(Error);
      });

      it('should update the tree level properties after appending element.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodePre = new HippyElement('div');
        const childHippyNodeNext = new HippyElement('div');
        parentHippyNode.appendChild(childHippyNodePre);
        parentHippyNode.appendChild(childHippyNodeNext);
        expect(childHippyNodePre.parentNode === parentHippyNode
            && childHippyNodeNext.parentNode === parentHippyNode).toBeTruthy();
        expect(parentHippyNode.childNodes.length).toBe(2);
        expect(parentHippyNode.firstChild === childHippyNodePre).toBeTruthy();
        expect(parentHippyNode.lastChild === childHippyNodeNext).toBeTruthy();
        expect(childHippyNodePre.nextSibling === childHippyNodeNext).toBeTruthy();
        expect(childHippyNodeNext.prevSibling === childHippyNodePre).toBeTruthy();
      });

      it('hydrate node will precache directly', () => {
        const ssrNode = new HippyNode(NodeType.ElementNode, { id: 1001, index: 0, name: 'View', props: {} });
        const childSsrNode = new HippyNode(NodeType.ElementNode, { id: 1002, index: 0, name: 'View', props: {} });
        ssrNode.appendChild(childSsrNode, true);
        let cachedNode = getNodeById(1002);
        expect(childSsrNode).toEqual(cachedNode);
        cachedNode = getNodeById(1001);
        expect(cachedNode).toBeNull();
      });
    });

    describe('insert before child node.', () => {
      it('no child to insert should throw error', () => {
        const node = new HippyNode(NodeType.ElementNode);
        expect(() => node.insertBefore(null as unknown as HippyNode, null)).toThrow(Error);
      });

      it('should update the tree level properties after insert node.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodePre = new HippyElement('div');
        const childHippyNodeNext = new HippyElement('div');
        parentHippyNode.appendChild(childHippyNodeNext);
        parentHippyNode.insertBefore(childHippyNodePre, childHippyNodeNext);
        expect(childHippyNodePre.parentNode).toEqual(parentHippyNode);
        expect(childHippyNodeNext.parentNode === parentHippyNode).toBeTruthy();
        expect(parentHippyNode.childNodes.length).toEqual(2);
        expect(parentHippyNode.firstChild === childHippyNodePre).toBeTruthy();
        expect(parentHippyNode.lastChild === childHippyNodeNext).toBeTruthy();
        expect(childHippyNodePre.nextSibling === childHippyNodeNext).toBeTruthy();
        expect(childHippyNodeNext.prevSibling === childHippyNodePre).toBeTruthy();
        // insert no anchor node
        const childHippyNodeLast = new HippyElement('div');
        parentHippyNode.insertBefore(childHippyNodeLast, null);
        expect(parentHippyNode.childNodes[2]).toEqual(childHippyNodeLast);
        expect(childHippyNodeLast.prevSibling).toEqual(childHippyNodeNext);
        expect(childHippyNodeLast.nextSibling).toBeNull();
        const differentParentNode = new HippyElement('div');
        const differentChildNode = new HippyElement('div');
        differentParentNode.appendChild(differentChildNode);
        // should throw error
        expect(() => parentHippyNode.insertBefore(differentChildNode, childHippyNodeLast)).toThrow();
      });
    });

    describe('move child node.', () => {
      it('no child to move should throw error', () => {
        const node = new HippyNode(NodeType.ElementNode);
        expect(() => node.moveChild(null as unknown as HippyNode, null)).toThrow(Error);
      });

      it('invalid parent node should throw error', () => {
        const childNode = new HippyNode(NodeType.ElementNode);
        const parentHippyNode = new HippyNode(NodeType.ElementNode);
        const newParentNode = new HippyNode(NodeType.ElementNode);
        const anchorNode = new HippyNode(NodeType.ElementNode);
        const newAnchorNode = new HippyNode(NodeType.ElementNode);

        newParentNode.appendChild(newAnchorNode);
        parentHippyNode.appendChild(childNode);
        parentHippyNode.appendChild(anchorNode);
        expect(() => newParentNode.moveChild(childNode, anchorNode)).toThrow(Error);
        expect(() => newParentNode.moveChild(childNode, newAnchorNode)).toThrow(Error);
      });

      it('should update the tree level properties after move node.', () => {
        const parentHippyNode = new HippyNode(NodeType.ElementNode);
        const childHippyNodeFirst = new HippyNode(NodeType.ElementNode);
        const childHippyNodeMiddle = new HippyNode(NodeType.ElementNode);
        const childHippyNodeLast = new HippyNode(NodeType.ElementNode);
        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeMiddle);
        parentHippyNode.appendChild(childHippyNodeLast);
        // remove last child to the front of first child
        parentHippyNode.moveChild(childHippyNodeLast, childHippyNodeFirst);

        expect(parentHippyNode.firstChild === childHippyNodeLast).toBeTruthy();
        expect(parentHippyNode.lastChild === childHippyNodeMiddle).toBeTruthy();
        expect(childHippyNodeFirst.prevSibling === childHippyNodeLast).toBeTruthy();
        expect(childHippyNodeLast.nextSibling === childHippyNodeFirst).toBeTruthy();

        // no need move when two nodes are same
        parentHippyNode.moveChild(childHippyNodeLast, childHippyNodeLast);
        expect(parentHippyNode.lastChild).toEqual(childHippyNodeMiddle);

        // no anchor will append
        const noAnchorNode = new HippyNode(NodeType.ElementNode);
        parentHippyNode.moveChild(noAnchorNode, null);
        expect(parentHippyNode.lastChild).toEqual(noAnchorNode);
        expect(noAnchorNode.nextSibling).toBeNull();
        expect(noAnchorNode.prevSibling).toEqual(childHippyNodeMiddle);
      });
    });

    describe('remove child node.', () => {
      it('no child to remove should throw error', () => {
        const node = new HippyNode(NodeType.ElementNode);
        expect(() => node.removeChild(null as unknown as HippyNode)).toThrow(Error);
      });

      it('no parent should throw error', () => {
        const childNode = new HippyNode(NodeType.ElementNode);
        expect(() => childNode.removeChild(childNode)).toThrow(Error);
      });

      it('parent not this should remove real parent \' child', () => {
        const childNode = new HippyNode(NodeType.ElementNode);
        const realChildNode = new HippyNode(NodeType.ElementNode);
        const parentNode = new HippyNode(NodeType.ElementNode);
        const realParentNode = new HippyNode(NodeType.ElementNode);
        parentNode.appendChild(childNode);
        realParentNode.appendChild(realChildNode);
        expect(parentNode.childNodes.length).toEqual(1);
        expect(realParentNode.childNodes.length).toEqual(1);
        parentNode.removeChild(realChildNode);
        expect(parentNode.childNodes.length).toEqual(1);
        expect(realParentNode.childNodes.length).toEqual(0);
      });

      it('no need insert to native node should not remove', () => {
        const childNode = new HippyElement('div');
        const parentNode = new HippyElement('div');
        parentNode.appendChild(childNode);
        expect(parentNode.childNodes[0]).toEqual(childNode);
        childNode.isNeedInsertToNative = false;
        parentNode.removeChild(childNode);
        expect(parentNode.childNodes[0]).toEqual(childNode);
      });

      it('should update the tree level properties after remove node.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodeFirst = new HippyElement('div');
        const childHippyNodeMiddle = new HippyElement('div');
        const childHippyNodeLast = new HippyElement('div');
        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeMiddle);
        parentHippyNode.appendChild(childHippyNodeLast);
        expect(childHippyNodeFirst.nextSibling).toEqual(childHippyNodeMiddle);
        expect(childHippyNodeLast.prevSibling).toEqual(childHippyNodeMiddle);
        parentHippyNode.removeChild(childHippyNodeMiddle);

        expect(parentHippyNode.childNodes.length).toEqual(2);
        expect(childHippyNodeFirst.nextSibling).toEqual(childHippyNodeLast);
        expect(childHippyNodeLast.prevSibling).toEqual(childHippyNodeFirst);
        expect(childHippyNodeMiddle.nextSibling).toBeNull();
        expect(childHippyNodeMiddle.prevSibling).toBeNull();
      });
    });

    describe('find child nodes that satisfy the condition.', () => {
      it('could not find node should return null', () => {
        const parentHippyNode = new HippyNode(NodeType.ElementNode);
        expect(parentHippyNode.findChild(() => {})).toBeNull();
      });

      it('should find out the node.', () => {
        const parentHippyNode = new HippyNode(NodeType.ElementNode);
        const childHippyNodeFirst = new HippyNode(NodeType.ElementNode);
        const childHippyNodeMiddle = new HippyNode(NodeType.ElementNode);
        const childHippyNodeLast = new HippyNode(NodeType.ElementNode);

        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeMiddle);
        parentHippyNode.appendChild(childHippyNodeLast);

        const aimNode = parentHippyNode.findChild(node => node.nodeId === childHippyNodeLast.nodeId);
        expect(aimNode === childHippyNodeLast).toBeTruthy();
        expect(parentHippyNode.findChild(node => node.nodeId === parentHippyNode.nodeId)).toEqual(parentHippyNode);
        expect(parentHippyNode.findChild(node => node.nodeId === 0)).toBeNull();
      });
    });

    describe('traverse child nodes.', () => {
      it('should traverse each child node.', () => {
        const parentHippyNode = new HippyElement('div');
        parentHippyNode.id = 'node-1';
        const childHippyNodeFirst = new HippyElement('div');
        childHippyNodeFirst.id = 'node-2';
        const childHippyNodeSecond = new HippyElement('div');
        childHippyNodeSecond.id = 'node-3';
        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeSecond);

        const nodeIdList: number[] = [];
        parentHippyNode.eachNode(node => nodeIdList.push(node.id));
        expect(nodeIdList.join(',') === 'node-1,node-2,node-3').toBeTruthy();
      });
    });

    describe('root node id check', () => {
      it('return is or not root node', () => {
        const node = new HippyNode(NodeType.ElementNode);
        expect(node.isRootNode()).toBeFalsy();
      });
    });
    describe('child nodes count check', () => {
      it('hasChildNodes should return true when has child', () => {
        const node = new HippyNode(NodeType.ElementNode);
        expect(node.hasChildNodes()).toBeFalsy();
        const childNodeOne = new HippyNode(NodeType.ElementNode);
        node.appendChild(childNodeOne);
        expect(node.hasChildNodes()).toBeTruthy();
        const childNodeTwo = new HippyNode(NodeType.ElementNode);
        childNodeOne.appendChild(childNodeTwo);
        expect(childNodeOne.hasChildNodes()).toBeTruthy();
      });
    });
  });
});
