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

import { nodeOps } from '../src/node-ops';
import { registerElement } from '../src/runtime/component';
import { setHippyCachedInstance } from '../src/util/instance';

/**
 * node-ops.ts unit test case
 */
describe('node-ops.ts', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    setHippyCachedInstance({ rootViewId: 19, rootContainer: 'root' });
  });

  it('nodeOps should contain special functions', async () => {
    expect(nodeOps.insert).toBeDefined();
    expect(nodeOps.remove).toBeDefined();
    expect(nodeOps.setText).toBeDefined();
    expect(nodeOps.setElementText).toBeDefined();
    expect(nodeOps.createComment).toBeDefined();
    expect(nodeOps.createElement).toBeDefined();
    expect(nodeOps.createText).toBeDefined();
    expect(nodeOps.parentNode).toBeDefined();
    expect(nodeOps.nextSibling).toBeDefined();
  });

  it('createElement function should return value correctly', async () => {
    const element = nodeOps.createElement('div');

    expect(element.constructor.name).toEqual('HippyElement');
    expect(element.tagName).toEqual('div');
  });

  it('createComment function should return value correctly', async () => {
    const element = nodeOps.createComment('comment');

    expect(element.constructor.name).toEqual('HippyCommentElement');
    expect(element.text).toEqual('comment');
  });

  it('createTextNode function should return value correctly', async () => {
    const element = nodeOps.createText('text');

    expect(element.constructor.name).toEqual('HippyText');
    expect(element.text).toEqual('text');
  });

  it('insert node without anchor', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');

    nodeOps.insert(child, parent);

    expect(parent.childNodes.length).toEqual(1);
    expect(parent.childNodes[0]).toEqual(child);
  });

  it('insert node with anchor', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const anchor = nodeOps.createElement('p');
    const another = nodeOps.createElement('p');

    // first insert anchor
    nodeOps.insert(anchor, parent);
    expect(parent.childNodes.length).toEqual(1);
    expect(parent.childNodes[0]).toEqual(anchor);

    // second insert child
    nodeOps.insert(child, parent, anchor);
    expect(parent.childNodes.length).toEqual(2);
    expect(parent.childNodes[0]).toEqual(child);
    expect(parent.childNodes[1]).toEqual(anchor);

    // null anchor
    nodeOps.insert(another, parent, null);
    expect(parent.childNodes.length).toEqual(3);
    expect(parent.lastChild).toEqual(another);
  });

  it('insert a text node', async () => {
    const text = 'hello';
    const parent = nodeOps.createElement('div');
    const textNode = nodeOps.createText(text);

    nodeOps.insert(textNode, parent);
    // text node not exists in hippy native, actually is the text property of parent node
    expect(parent.getAttribute('text')).toEqual(text);
  });

  it('insert success when child has another parent', async () => {
    const parent = nodeOps.createElement('div');
    const parent2 = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child, parent2, null);

    expect(parent2.childNodes[0]).toEqual(child);
    expect(parent.childNodes.length).toEqual(0);
  });

  it('insert error when anchor node have another parent', async () => {
    const parent = nodeOps.createElement('div');
    const parent2 = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child2, parent, child);
    expect(() => nodeOps.insert(child2, parent2, child)).toThrow(Error);
  });

  it('insert error when child with anchor has another parent', async () => {
    const parent = nodeOps.createElement('div');
    const parent2 = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child2, parent2);

    expect(() => nodeOps.insert(child2, parent, child)).toThrow(Error);
  });

  it('remove child should work correctly', async () => {
    registerElement('div', {
      component: {
        name: 'View',
      },
    });

    const parent = nodeOps.createElement('div');
    const child1 = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');
    const child3 = nodeOps.createElement('div');

    nodeOps.insert(child1, parent);
    nodeOps.insert(child2, parent);
    nodeOps.insert(child3, parent);

    nodeOps.remove(child2);
    expect(parent.childNodes.length).toEqual(2);
    nodeOps.remove(child3);
    expect(parent.childNodes.length).toEqual(1);
  });

  it('remove child do nothing when no parent', async () => {
    const child = nodeOps.createElement('div');
    expect(nodeOps.remove(child)).toBeUndefined();
  });

  it('remove a text node should only remove attribute', async () => {
    const text = 'hello';
    const parent = nodeOps.createElement('div');
    const textNode = nodeOps.createText(text);

    nodeOps.insert(textNode, parent);
    expect(parent.getAttribute('text')).toEqual(text);

    nodeOps.remove(textNode);
    expect(parent.getAttribute('text')).toEqual('');
  });

  it('parentNode should set correctly', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');

    nodeOps.insert(child, parent);

    expect(nodeOps.parentNode(child)).toEqual(parent);

    const parent2 = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');
    nodeOps.insert(child2, parent2);
    expect(nodeOps.parentNode(child2)).toEqual(parent2);
  });

  it('nextSibling should set correctly', async () => {
    const parent = nodeOps.createElement('div');
    const child = nodeOps.createElement('div');
    const child2 = nodeOps.createElement('div');

    nodeOps.insert(child, parent);
    nodeOps.insert(child2, parent, child);
    expect(nodeOps.nextSibling(child2)).toEqual(child);
  });

  it('setText function should work correctly for text node', async () => {
    const parent = nodeOps.createElement('div');
    const textNode = nodeOps.createText('');
    const text = 'hello';

    nodeOps.insert(textNode, parent);
    nodeOps.setText(textNode, text);
    expect(textNode.text).toEqual(text);
  });

  it('setElementText function should work correctly for element node', async () => {
    const element = nodeOps.createElement('div');
    const text = 'hello';

    nodeOps.setElementText(element, text);
    expect(element.getAttribute('text')).toEqual(text);
  });

  it('setElementText function should work correctly for input element node', async () => {
    const inputElement = nodeOps.createElement('textarea');
    const text = 'hello';

    nodeOps.setElementText(inputElement, text);
    expect(inputElement.getAttribute('value')).toEqual(text);
  });

  it('setScopeId method should work correct', () => {
    const element = nodeOps.createElement('div');
    element.setStyleScope('style-scoped-id-1');
    expect(element.styleScopeId).toEqual(['style-scoped-id-1']);
    element.setStyleScope({});
    expect(element.styleScopeId).toEqual(['style-scoped-id-1', '[object Object]']);
    element.setStyleScope(123456);
    expect(element.styleScopeId).toEqual(['style-scoped-id-1', '[object Object]', '123456']);
  });
});
