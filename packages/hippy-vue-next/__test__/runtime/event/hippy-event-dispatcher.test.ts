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

import '../../../src/runtime/event/hippy-event-dispatcher';
import { createRenderer } from '@vue/runtime-core';
import { Native } from '../../../src/runtime/native';

import type { NeedToTyped } from '../../../src/types';
import { nodeOps } from '../../../src/node-ops';
import { patchProp } from '../../../src/patch-prop';
import type { ElementComponent } from '../../../src/runtime/component/index';
import { registerElement } from '../../../src/runtime/component/index';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { EventBus } from '../../../src/runtime/event/event-bus';
import {
  setHippyCachedInstanceParams,
  setHippyCachedInstance,
} from '../../../src/util/instance';
import { preCacheNode } from '../../../src/util/node-cache';
import { EventsUnionType } from '../../../src/runtime/event/hippy-event';
import BuiltInComponent from '../../../src/built-in-component';

/**
 * hippy-event-dispatcher.ts unit test case
 */
describe('runtime/event/hippy-event-dispatcher.ts', () => {
  beforeAll(() => {
    BuiltInComponent.install();
    const root = new HippyElement('div');
    root.id = 'testRoot';
    setHippyCachedInstance({
      rootView: 'testRoot',
      rootContainer: 'root',
      rootViewId: 1,
      ratioBaseWidth: 750,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      instance: {
        $el: root,
      },
    });
  });

  it('HippyEvent instance should have required function', async () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    expect(eventDispatcher).toHaveProperty('receiveNativeEvent');
    expect(eventDispatcher).toHaveProperty('receiveNativeGesture');
    expect(eventDispatcher).toHaveProperty('receiveUIComponentEvent');
  });

  it('hippy-event-dispatcher should dispatch native gesture event and ui event correctly', async () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    const divElement = new HippyElement('div');

    const divComponent: ElementComponent = {
      component: {
        name: 'div',
        eventNamesMap: new Map().set('click', 'onClick'),
        defaultNativeStyle: {},
        defaultNativeProps: {},
        nativeProps: {},
        attributeMaps: {},
      },
    };

    registerElement('div', divComponent);

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

    const clickCb = () => {
      sign = 1;
    };
    // click event
    divElement.addEventListener('click', clickCb);
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

    // scroll event
    divElement.addEventListener('scroll', () => {
      sign = 4;
    });

    const scrollEvent: NeedToTyped = [divElement.nodeId, 'scroll'];
    eventDispatcher.receiveUIComponentEvent(scrollEvent);
    expect(sign).toEqual(4);

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
    // dispatch click event again
    eventDispatcher.receiveNativeGesture(nativeEvent);
    expect(sign).toEqual(1);
    // remove click event
    divElement.removeEventListener('click', clickCb);
    // dispatch ui event
    eventDispatcher.receiveUIComponentEvent(nativeUIEvent);
    expect(sign).toEqual(10);
    // dispatch click when click event removed
    eventDispatcher.receiveNativeGesture(nativeEvent);
    expect(sign).toEqual(10);

    // span component
    const li: ElementComponent = {
      component: {
        name: 'ListViewItem',
      },
    };
    registerElement('li', li);
    const listItemElement = new HippyElement('li');
    // pre cache node
    preCacheNode(listItemElement, listItemElement.nodeId);
    // android will convert disappear to disAppear
    Native.Platform = 'android';
    const listCb = () => {
      sign = 5;
    };
    listItemElement.addEventListener('disappear', listCb);
    let disappearEvent = [
      listItemElement.nodeId,
      'onDisAppear',
    ];
    // dispatch disappear event
    eventDispatcher.receiveUIComponentEvent(disappearEvent);
    expect(sign).toEqual(5);
    listItemElement.removeEventListener('disappear', listCb);
    // ios still use disappear
    Native.Platform = 'ios';
    listItemElement.addEventListener('disappear', listCb);
    disappearEvent = [
      listItemElement.nodeId,
      'onDisappear',
    ];
    // dispatch disappear event
    eventDispatcher.receiveUIComponentEvent(disappearEvent);
    expect(sign).toEqual(5);

    // nothing happen when there is no listener
    const noListenerElement = new HippyElement('li');
    // pre cache node
    preCacheNode(noListenerElement, noListenerElement.nodeId);
    const noListenerEvent = {
      id: noListenerElement.nodeId,
      name: 'onClick',
    };
    // dispatch click event
    eventDispatcher.receiveNativeGesture(noListenerEvent);
  });

  it('hippy-event-dispatcher should dispatch native event correctly', async () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;

    let sign = 0;

    EventBus.$on('pageVisible', () => {
      sign = 1;
    });
    // invalid native event
    eventDispatcher.receiveNativeEvent(['pageVisible']);
    expect(sign).toEqual(0);
    eventDispatcher.receiveNativeEvent();
    expect(sign).toEqual(0);

    eventDispatcher.receiveNativeEvent(['pageVisible', null]);
    expect(sign).toEqual(1);
  });

  it('can not find node should not trigger anything', () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    const divElement = new HippyElement('div');
    const clickEvent = {
      id: divElement.nodeId,
      name: 'onClick',
    };
    let sign = 1;
    divElement.addEventListener('click', () => {
      sign += 1;
    });
    // dispatch click event, but can not find node, should not trigger anything
    eventDispatcher.receiveNativeGesture(clickEvent);
    expect(sign).toEqual(1);
  });

  it('no event should not trigger anything', () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    const divElement = new HippyElement('div');
    let sign = 1;
    divElement.addEventListener('click', () => {
      sign += 1;
    });
    // dispatch click event, but no event object, should not trigger anything
    eventDispatcher.receiveNativeGesture();
    expect(sign).toEqual(1);
  });

  it('processEventData can process event before dispatch', () => {
    const { EventDispatcher: eventDispatcher } = global.__GLOBAL__.jsModuleList;
    const div: ElementComponent = {
      component: {
        name: 'View',
        processEventData(evtData: EventsUnionType, nativeEventParams: NeedToTyped) {
          const { handler: event, __evt: nativeEventName } = evtData;

          switch (nativeEventName) {
            case 'onScroll':
              event.offsetX = nativeEventParams.contentOffset?.x;
              event.offsetY = nativeEventParams.contentOffset?.y;
              break;
            default:
              break;
          }
          return event;
        },
      },
    };
    let sign = 0;
    registerElement('list', div);

    const divElement = new HippyElement('list');
    preCacheNode(divElement, divElement.nodeId);
    // scroll event
    divElement.addEventListener('scroll', (event) => {
      sign = event.offsetY;
    });
    const scrollEvent: NeedToTyped = [divElement.nodeId, 'onScroll', {
      contentOffset: {
        x: 1,
        y: 2,
      },
    }];
    eventDispatcher.receiveUIComponentEvent(scrollEvent);
    expect(sign).toEqual(2);
  });
});
