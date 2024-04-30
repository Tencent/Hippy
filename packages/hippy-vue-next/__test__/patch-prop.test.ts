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

import { patchProp } from '../src/patch-prop';
import { nodeOps } from '../src/node-ops';
import '../src/runtime/event/hippy-event-dispatcher';
import { preCacheNode } from '../src/util/node-cache';
import { registerElement, type ElementComponent } from '../src/runtime/component';

/**
 * patch-prop.ts unit test case
 */
describe('patch-prop.ts', () => {
  it('patch class prop', () => {
    const element = nodeOps.createElement('div');
    patchProp(element, 'class', '', 'wrapper', false, undefined, null);
    expect(element.classList).toEqual(new Set().add('wrapper'));
    patchProp(element, 'class', 'wrapper', '', false, undefined, null);
    expect(element.classList).toEqual(new Set());
    patchProp(element, 'class', '', 'header', false, undefined, null);
    expect(element.classList).toEqual(new Set().add('header'));
    patchProp(element, 'class', '', null, false, undefined, null);
    expect(element.classList).toEqual(new Set());
  });

  it('patch style prop', () => {
    const element = nodeOps.createElement('div');
    expect(element.style).toEqual({ display: undefined });
    patchProp(element, 'style', {}, { width: '100px', height: 200 }, false, undefined, null);
    expect(element.style).toEqual({
      width: 100,
      height: 200,
      display: undefined,
    });
    patchProp(element, 'style', {}, { width: undefined, height: undefined }, false, undefined, null);
    expect(element.style).toEqual({
      display: undefined,
    });

    patchProp(element, 'style', {}, undefined, false, undefined, null);
    expect(element.style).toEqual({});

    // style could not be string
    expect(() => patchProp(element, 'style', {}, 'new style', false, undefined, null)).toThrow(Error);

    patchProp(element, 'style', { width: 100 }, { height: 100 }, false, undefined, null);
    expect(element.style).toEqual({
      height: 100,
    });

    patchProp(element, 'style', { width: 100 }, { height: 100, width: null }, false, undefined, null);
    expect(element.style).toEqual({
      height: 100,
    });

    patchProp(element, 'style', { width: 100 }, {}, false, undefined, null);
    expect(element.style).toEqual({});

    patchProp(element, 'style', { width: 100 }, null, false, undefined, null);
    expect(element.style).toEqual({});
  });

  it('patch event prop', () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    // div component
    const div: ElementComponent = {
      component: {
        name: 'View',
      },
    };
    registerElement('div', div);
    const element = nodeOps.createElement('div');
    preCacheNode(element, element.nodeId);
    const noop = () => {};
    patchProp(element, 'onClick', null, noop, false, undefined, null);
    let listeners = element.getEventListenerList();
    expect(listeners?.click?.[0].callback).toBeDefined();
    patchProp(element, 'onClick', null, null, false, undefined, null);
    listeners = element.getEventListenerList();
    expect(listeners?.click).toBeUndefined();

    let sign = 0;
    patchProp(element, 'onClickOnce', null, () => {
      sign += 1;
    }, false, undefined, null);
    listeners = element.getEventListenerList();
    expect(listeners?.click?.[0].callback).toBeDefined();
    const clickEvent = {
      id: element.nodeId,
      name: 'onClick',
    };
    eventDispatcher.receiveNativeGesture(clickEvent);
    expect(sign).toEqual(1);
    eventDispatcher.receiveNativeGesture(clickEvent);
    expect(sign).toEqual(1);

    // test custom event
    patchProp(element, 'on:Drop', null, noop, false, undefined, null);
    listeners = element.getEventListenerList();
    expect(listeners?.drop?.[0].callback).toBeDefined();
  });

  it('patch attribute prop', () => {
    const element = nodeOps.createElement('div');
    patchProp(element, 'source', '', 'inner', false, undefined, null);
    expect(element.attributes.source).toEqual('inner');
    patchProp(element, 'source', 'inner', '', false, undefined, null);
    expect(element.attributes.source).toEqual('');
    patchProp(element, 'source', 'inner', null, false, undefined, null);
    expect(element.attributes.source).toBeUndefined();
  });
});
