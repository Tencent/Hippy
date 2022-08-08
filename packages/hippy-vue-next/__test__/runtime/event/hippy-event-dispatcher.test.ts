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

/**
 * runtime/event/hippy-event-dispatcher unit test
 * event-dispatcher is mounted on global.__GLOBAL__，which can be mocked to trigger native events
 */

import '../../../src/runtime/event/hippy-event-dispatcher';
import { createRenderer } from '@vue/runtime-core';

import type { NeedToTyped } from '../../../src/config';
import { nodeOps } from '../../../src/node-ops';
import { patchProp } from '../../../src/patch-prop';
import type { TagComponent } from '../../../src/runtime/component/index';
import { registerHippyTag } from '../../../src/runtime/component/index';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { EventBus } from '../../../src/runtime/event/event-bus';
import {
  setHippyCachedInstanceParams,
  setHippyCachedInstance,
} from '../../../src/util/instance';
import { preCacheNode } from '../../../src/util/node-cache';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/event/hippy-event-dispatcher.ts', () => {
  it('HippyEvent instance should have required function', async () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    expect(eventDispatcher).toHaveProperty('receiveNativeEvent');
    expect(eventDispatcher).toHaveProperty('receiveNativeGesture');
    expect(eventDispatcher).toHaveProperty('receiveUIComponentEvent');
  });

  it('hippy-event-dispatcher should dispatch native gesture event and ui event correctly', async () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    const divElement = new HippyElement('div');

    const divComponent: TagComponent = {
      name: 'div',
      eventNamesMap: new Map().set('click', 'onClick'),
      defaultNativeStyle: {},
      defaultNativeProps: {},
      nativeProps: {},
      attributeMaps: {},
    };

    registerHippyTag('div', divComponent);

    let sign = 0;

    setHippyCachedInstance({
      rootViewId: 0,
      superProps: {},
      app: createRenderer({
        patchProp,
        ...nodeOps,
      }).createApp({
        template: '<div></div>',
      }),
      ratioBaseWidth: 750,
    });

    // set app instance
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setHippyCachedInstanceParams('instance', {
      $el: divElement,
    });

    // pre cache node
    preCacheNode(divElement, divElement.nodeId);

    // click event
    divElement.addEventListener('click', () => {
      sign = 1;
    });
    const nativeEvent = {
      id: divElement.nodeId,
      name: 'onClick',
    };
    eventDispatcher.receiveNativeGesture(nativeEvent);
    expect(sign).toEqual(1);

    // endReached event
    divElement.addEventListener('endReached', () => {
      sign = 3;
    });
    let nativeUIEvent: NeedToTyped = [divElement.nodeId, 'endReached'];
    eventDispatcher.receiveUIComponentEvent(nativeUIEvent);
    expect(sign).toEqual(3);

    // layout event
    divElement.addEventListener('layout', (result) => {
      sign = result.top;
    });
    nativeUIEvent = [
      divElement.nodeId,
      'onLayout',
      {
        layout: {
          y: 10,
        },
      },
    ];
    eventDispatcher.receiveUIComponentEvent(nativeUIEvent);
    expect(sign).toEqual(10);
  });

  it('hippy-event-dispatcher should dispatch native event correctly', async () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;

    let sign = 0;

    EventBus.$on('pageVisible', () => {
      sign = 1;
    });
    eventDispatcher.receiveNativeEvent(['pageVisible', null]);
    expect(sign).toEqual(1);
  });
});
