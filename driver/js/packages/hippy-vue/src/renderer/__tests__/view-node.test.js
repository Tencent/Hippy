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

// Most nodes test is executed in node-ops.test.js
// here just test the lacked testing for ViewNode for coverage.

import test, { before } from 'ava';
import ViewNode from '../view-node';

before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('firstChild test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  parentNode.appendChild(childNode);
  parentNode.insertBefore(childNode2, childNode);
  t.is(parentNode.firstChild, childNode2);
});

test('set isMounted test', (t) => {
  const node = new ViewNode();
  t.is(node.isMounted, false);
  node.isMounted = true;
  t.is(node.isMounted, true);
});

test('append exist child test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  parentNode.appendChild(childNode);
  parentNode.appendChild(childNode2);
  parentNode.appendChild(childNode);
  t.is(parentNode.lastChild, childNode);
  parentNode.appendChild(childNode);
  parentNode.appendChild(childNode);
  t.is(parentNode.lastChild, childNode);
  t.is(parentNode.childNodes.length, 3);
});

test('findChild test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  childNode2.metaTest = 123;
  parentNode.appendChild(childNode);
  childNode.appendChild(childNode2);
  const targetNode = parentNode.findChild(node => node.metaTest === 123);
  t.is(targetNode, childNode2);
  const targetNode2 = parentNode.findChild(node => node.metaTest === 234);
  t.is(targetNode2, null);
});

test('traverseChildren test', (t) => {
  const parentNode = new ViewNode();
  const childNode = new ViewNode();
  const childNode2 = new ViewNode();
  childNode2.metaTest = 123;
  parentNode.appendChild(childNode);
  childNode.appendChild(childNode2);
  parentNode.traverseChildren((node) => {
    t.true([parentNode, childNode, childNode2].indexOf(node) > -1);
  });
});
