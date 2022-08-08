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

import { registerHippyTag } from '../../../src/runtime/component';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { HippyNode, NodeType } from '../../../src/runtime/node/hippy-node';
import { setHippyCachedInstance } from '../../../src/util/instance';

describe('runtime/node/hippy-node', () => {
  describe('test the default value of class members.', () => {
    it('should be 1.', () => {
      const hippyNode = new HippyNode(NodeType.ElementNode);
      expect(hippyNode.nodeId).toEqual(1);
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
  });

  describe('test the node operation methods.', () => {
    beforeAll(() => {
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

    describe('append child node.', () => {
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
    });

    describe('insert before child node.', () => {
      it('should update the tree level properties after insert node.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodePre = new HippyElement('div');
        const childHippyNodeNext = new HippyElement('div');
        parentHippyNode.appendChild(childHippyNodeNext);
        parentHippyNode.insertBefore(childHippyNodePre, childHippyNodeNext);
        expect(childHippyNodePre.parentNode === parentHippyNode
            && childHippyNodeNext.parentNode === parentHippyNode).toBeTruthy();
        expect(parentHippyNode.childNodes.length).toBe(2);
        expect(parentHippyNode.firstChild === childHippyNodePre).toBeTruthy();
        expect(parentHippyNode.lastChild === childHippyNodeNext).toBeTruthy();
        expect(childHippyNodePre.nextSibling === childHippyNodeNext).toBeTruthy();
        expect(childHippyNodeNext.prevSibling === childHippyNodePre).toBeTruthy();
      });
    });

    describe('move child node.', () => {
      it('should update the tree level properties after move node.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodeFirst = new HippyElement('div');
        const childHippyNodeMiddle = new HippyElement('div');
        const childHippyNodeLast = new HippyElement('div');
        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeMiddle);
        parentHippyNode.appendChild(childHippyNodeLast);
        // 把最后一个子节点移动到第一个子节点之前，就成为了第一个子节点
        parentHippyNode.moveChild(childHippyNodeLast, childHippyNodeFirst);

        expect(parentHippyNode.firstChild === childHippyNodeLast).toBeTruthy();
        expect(parentHippyNode.lastChild === childHippyNodeMiddle).toBeTruthy();
        expect(childHippyNodeFirst.prevSibling === childHippyNodeLast).toBeTruthy();
        expect(childHippyNodeLast.nextSibling === childHippyNodeFirst).toBeTruthy();
      });
    });

    describe('remove child node.', () => {
      it('should update the tree level properties after remove node.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodeFirst = new HippyElement('div');
        const childHippyNodeMiddle = new HippyElement('div');
        const childHippyNodeLast = new HippyElement('div');
        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeMiddle);
        parentHippyNode.appendChild(childHippyNodeLast);
        parentHippyNode.removeChild(childHippyNodeFirst);

        expect(parentHippyNode.childNodes.length).toEqual(2);
        expect(parentHippyNode.firstChild === childHippyNodeMiddle).toBeTruthy();
        expect(childHippyNodeMiddle.prevSibling).toBeNull();
      });
    });

    describe('find child nodes that satisfy the condition.', () => {
      it('should find out the node.', () => {
        const parentHippyNode = new HippyElement('div');
        const childHippyNodeFirst = new HippyElement('div');
        const childHippyNodeMiddle = new HippyElement('div');
        const childHippyNodeLast = new HippyElement('div');
        childHippyNodeLast.id = 'lastNode';
        parentHippyNode.appendChild(childHippyNodeFirst);
        parentHippyNode.appendChild(childHippyNodeMiddle);
        parentHippyNode.appendChild(childHippyNodeLast);

        const aimNode = parentHippyNode.findChild(node => node.id === 'lastNode');
        expect(aimNode === childHippyNodeLast).toBeTruthy();
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
  });
});
