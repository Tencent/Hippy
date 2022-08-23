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
 * runtime/event/event-bus unit test
 */
import { EventBus } from '../../../src/runtime/event/event-bus';

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/event/event-bus.ts', () => {
  it('event bus on & off function should work correctly', () => {
    let sign = 1;
    EventBus.$on('change', () => {
      sign += 1;
    });
    EventBus.$emit('change');
    expect(sign).toEqual(2);
    EventBus.$emit('change');
    expect(sign).toEqual(3);
    EventBus.$off('change');
    EventBus.$emit('change');
    EventBus.$emit('change');
    EventBus.$emit('change');
    expect(sign).toEqual(3);

    EventBus.$once('change', () => {
      sign += 1;
    });
    EventBus.$emit('change');
    expect(sign).toEqual(4);
    EventBus.$emit('change');
    EventBus.$emit('change');
    EventBus.$emit('change');
    expect(sign).toEqual(4);
  });
});
