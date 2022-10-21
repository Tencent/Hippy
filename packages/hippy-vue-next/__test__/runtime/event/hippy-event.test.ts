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
 * runtime/event/hippy-event unit test
 */
import { HippyEvent } from '../../../src/runtime/event/hippy-event';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/event/hippy-event.ts', () => {
  it('HippyEvent instance should have required function', async () => {
    const now = Date.now();
    const event = new HippyEvent('click');

    expect(event.type).toEqual('click');
    expect(event.timeStamp >= now).toBeTruthy();
  });

  it('when stopPropagation, bubbles will be false', async () => {
    const event = new HippyEvent('click');

    event.stopPropagation();
    expect(event.bubbles).toBeFalsy();
  });

  it('when preventDefault, event canceled props is true', () => {
    const event = new HippyEvent('click');
    expect(event.canceled).toBeFalsy();
    event.preventDefault();
    expect(event.canceled).toBeTruthy();
  });
});
