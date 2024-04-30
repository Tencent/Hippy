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

import { registerElement } from '../../../src/runtime/component';
import type { NeedToTyped } from '../../../src/types';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { HippyEvent } from '../../../src/runtime/event/hippy-event';

/**
 * hippy-event-target.ts unit test case
 */
describe('runtime/event/hippy-event-target.ts', () => {
  beforeAll(() => {
    registerElement('div', { component: { name: 'View' } });
  });

  it('hippy-event-target child should contain special function', async () => {
    const divElement = new HippyElement('div');
    expect(divElement).toHaveProperty('addEventListener');
    expect(divElement).toHaveProperty('removeEventListener');
    expect(divElement).toHaveProperty('getEventListenerList');
    expect(divElement).toHaveProperty('emitEvent');
    expect(divElement).toHaveProperty('dispatchEvent');
  });

  it('hippy-event-target should contain right event listener count', async () => {
    const divElement = new HippyElement('div');

    const callback1 = () => {};
    divElement.addEventListener('click', callback1);

    const listenerList: NeedToTyped = divElement.getEventListenerList();
    expect(listenerList).toHaveProperty('click');
    expect(listenerList.click.length).toEqual(1);

    const callback2 = () => {};
    divElement.addEventListener('click', callback2);
    expect(listenerList.click.length).toEqual(2);

    const callback3 = () => {};
    divElement.addEventListener('change', callback3);
    expect(listenerList).toHaveProperty('change');
    expect(listenerList.click.length).toEqual(2);
    expect(listenerList.change.length).toEqual(1);

    divElement.removeEventListener('click', callback1);
    expect(listenerList.click.length).toEqual(1);
    divElement.removeEventListener('click', callback2);
    expect(listenerList.click).toEqual(undefined);
  });

  it('hippy-event-target should emit event correct', async () => {
    const divElement = new HippyElement('div');
    let sign = 0;

    const callback = () => {
      sign = 1;
    };

    divElement.addEventListener('click', callback);

    // emit event
    const event = new HippyEvent('click');
    divElement.emitEvent(event);

    expect(sign).toEqual(1);
  });

  it('hippy-event-target should dispatch event correct', async () => {
    const divElement = new HippyElement('div');
    let sign = 0;

    const callback = () => {
      sign = 1;
    };

    divElement.addEventListener('click', callback);

    // dispatch event
    const event = new HippyEvent('click');
    divElement.dispatchEvent(event);

    expect(sign).toEqual(1);
  });
});
