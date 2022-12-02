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
/* eslint-disable no-underscore-dangle */

import test, { before } from 'ava';
import ListItemNode from '../list-item-node';
import Native from '../../runtime/native';
import DocumentNode from '../document-node';

before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('ListItemNode.polyfillNativeEvents test', (t) => {
  const listItemNode = new ListItemNode('li');
  // ios
  Native.Platform = 'ios';
  let called = false;
  const callback = (event) => {
    called = true;
    return event;
  };
  t.is(called, false);
  t.is(listItemNode.removeEventListener('disappear', callback), null);
  listItemNode.addEventListener('disappear', callback);
  t.true(!!listItemNode._emitter);
  t.not(listItemNode._emitter.getEventListeners().disappear, undefined);
  const event1 = DocumentNode.createEvent('disappear');
  listItemNode.dispatchEvent(event1);
  t.is(called, true);
  listItemNode.removeEventListener('disappear', callback);

  // android
  Native.Platform = 'android';
  called = false;
  t.is(called, false);
  t.is(listItemNode._emitter.getEventListeners().disappear, undefined);
  listItemNode.addEventListener('disappear', callback);
  const event2 = DocumentNode.createEvent('disAppear');
  listItemNode.dispatchEvent(event2);
  t.is(called, true);
  t.true(!!listItemNode._emitter);
  t.not(listItemNode._emitter.getEventListeners().disAppear, undefined);
});
