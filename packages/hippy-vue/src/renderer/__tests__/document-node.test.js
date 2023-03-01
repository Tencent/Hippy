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

/* eslint-disable no-underscore-dangle */

// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for DocumentNode for coverage.

import test, { before } from 'ava';
import DocumentNode from '../document-node';

before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('Document.createElement test', (t) => {
  const testNode1 = DocumentNode.createElement('div');
  t.is(testNode1.toString(), 'ElementNode(div)');
  const testNode2 = DocumentNode.createElement('input');
  t.is(testNode2.toString(), 'InputNode(input)');
  const testNode3 = DocumentNode.createElement('textarea');
  t.is(testNode3.toString(), 'InputNode(textarea)');
  const testNode4 = DocumentNode.createElement('ul');
  t.is(testNode4.toString(), 'ListNode(ul)');
  const testNode5 = DocumentNode.createElement('li');
  t.is(testNode5.toString(), 'ElementNode(li)');
});

test('Document.createTextNode test', (t) => {
  const testNode = DocumentNode.createTextNode('aaa');
  t.is(testNode.toString(), 'TextNode');
  t.is(testNode.text, 'aaa');
});

test('Document.createComment test', (t) => {
  const testNode = DocumentNode.createComment('aaa');
  t.is(testNode.toString(), 'CommentNode(comment)');
  t.is(testNode.text, 'aaa');
});

test('Document.createEvent test', (t) => {
  const testNode = DocumentNode.createEvent('addEvent');
  t.is(testNode.type, 'addEvent');
});
