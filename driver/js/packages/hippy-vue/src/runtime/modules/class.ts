/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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
/* eslint-disable no-param-reassign */

// @ts-expect-error TS(2307): Cannot find module 'web/util/index' or its corresp... Remove this comment to see the full error message
import { genClassForVnode, concat, stringifyClass } from 'web/util/index';

function updateClass(oldVNode: any, vNode: any) {
  const { elm, data } = vNode;
  const oldData = oldVNode.data;
  if (
    !data.staticClass
    && !data.class
    && (!oldData || (!oldData.staticClass && !oldData.class))
  ) {
    return;
  }
  let cls = genClassForVnode(vNode);
  // handle transition classes
  const transitionClass = elm._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }
  // set the class
  if (cls !== elm._prevClass) {
    elm.setAttribute('class', cls);
    elm._prevClass = cls;
  }
}

export function setClass(vNode: any, customElem: any, options = {}) {
  if (!vNode || !vNode.data) {
    return;
  }
  const { data } = vNode;
  if (!data.staticClass && !data.class) {
    return;
  }
  let { elm } = vNode;
  if (customElem) {
    elm = customElem;
  }
  if (!elm) return;
  let cls = genClassForVnode(vNode);
  // handle transition classes
  const transitionClass = elm._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }
  // set the class
  if (cls !== elm._prevClass) {
    elm.setAttribute('class', cls, { notToNative: !!(options as any).notToNative });
    elm._prevClass = cls;
  }
}

export default {
  create: updateClass,
  update: updateClass,
};
