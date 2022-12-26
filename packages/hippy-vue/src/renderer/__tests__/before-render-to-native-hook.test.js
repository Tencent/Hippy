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
import ElementNode from '../element-node';
import * as util from '../../util';

before(() => {
  global.__GLOBAL__ = {
    nodeId: 101,
  };
});

const logWhenFail = async (t, cb, err) => {
  const tryTest = await t.try((t) => {
    cb(t);
  });

  if (!tryTest.passed) {
    t.log(err);
  }
  tryTest.commit();
};

test('ElementNode API', async (t) => {
  await logWhenFail(t, (t) => {
    const node = new ElementNode('div');

    t.true(util.isFunction(node.appendChild));
    t.true(util.isFunction(node.insertBefore));
    t.true(util.isFunction(node.moveChild));
    t.true(util.isFunction(node.removeChild));

    t.true(node.classList instanceof Set);
    t.true(node.style instanceof Object);
    t.true(node.attributes instanceof Object);
  }, 'ElementNode APIs have breaking changes, please update const variable \'BEFORE_RENDER_TO_NATIVE_HOOK_VERSION\' to disable this hook');
});

test('ViewNode API', async (t) => {
  await logWhenFail(t, (t) => {
    const node = new ViewNode();

    t.true(util.isFunction(node.appendChild));
    t.true(util.isFunction(node.insertBefore));
    t.true(util.isFunction(node.moveChild));
    t.true(util.isFunction(node.removeChild));

    const childNode1 = new ViewNode();
    const childNode2 = new ViewNode();
    node.appendChild(childNode1);
    node.appendChild(childNode2);
    t.true(node.firstChild === childNode1);
    t.true(node.lastChild === childNode2);
  }, 'ViewNode APIs have breaking changes, please update const variable \'BEFORE_RENDER_TO_NATIVE_HOOK_VERSION\' to disable this hook');
});
