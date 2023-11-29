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
import ListNode from '../list-node';

before(() => {
  // @ts-expect-error TS(7017): Element implicitly has an 'any' type because type ... Remove this comment to see the full error message
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

test('ListNode.polyfillNativeEvents test', (t) => {
  const listNode = new ListNode('ul');
  let called = false;
  const callback = (event: any) => {
    called = true;
    return event;
  };
  t.is(called, false);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  t.is(listNode.removeEventListener('loadMore', callback), null);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  listNode.addEventListener('loadMore', callback);
  t.true(!!listNode._emitter);
  t.not(listNode._emitter.getEventListeners().loadMore, undefined);

  called = false;
  t.is(called, false);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  listNode.removeEventListener('loadMore', callback);
  // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
  listNode.addEventListener('endReached', callback);
  t.true(!!listNode._emitter);
  t.not(listNode._emitter.getEventListeners().endReached, undefined);
});
