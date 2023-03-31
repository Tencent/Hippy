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

import type { NeedToTyped } from '../../../src/types';
import { EventBus } from '../../../src/runtime/event/event-bus';

/**
 * event-bus.ts unit test case
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
    sign = 1;
    const plusOne = () => {
      sign += 1;
    };
    const plusTwo = () => {
      sign += 2;
    };
    EventBus.$on('add', plusOne);
    EventBus.$on('add', plusTwo);
    EventBus.$emit('add');
    expect(sign).toEqual(4);
    EventBus.$emit('add');
    expect(sign).toEqual(7);
    EventBus.$off('add', plusTwo);
    EventBus.$emit('add');
    expect(sign).toEqual(8);
    EventBus.$off('add', plusOne);
    EventBus.$emit('add');
    expect(sign).toEqual(8);


    sign = 1;
    EventBus.$on(['click', 'input'], () => {
      sign += 1;
    });
    EventBus.$emit('click');
    expect(sign).toEqual(2);
    EventBus.$emit('input');
    expect(sign).toEqual(3);
    EventBus.$emit('input');
    EventBus.$emit('click');
    expect(sign).toEqual(5);
    EventBus.$off(['click', 'input']);
    EventBus.$emit('input');
    EventBus.$emit('click');
    EventBus.$emit('input');
    EventBus.$emit('click');
    expect(sign).toEqual(5);

    sign = 1;
    EventBus.$once('change', () => {
      sign += 1;
    });
    EventBus.$emit('change');
    expect(sign).toEqual(2);
    EventBus.$emit('change');
    EventBus.$emit('change');
    EventBus.$emit('change');
    expect(sign).toEqual(2);

    sign = 1;
    EventBus.$on('addOne', () => {
      sign += 1;
    });
    EventBus.$on('addTwo', () => {
      sign += 2;
    });
    EventBus.$on('addThree', () => {
      sign += 3;
    });
    EventBus.$emit('addOne');
    EventBus.$emit('addTwo');
    EventBus.$emit('addThree');
    expect(sign).toEqual(7);
    EventBus.$off();
    EventBus.$emit('addOne');
    EventBus.$emit('addTwo');
    EventBus.$emit('addThree');
    expect(sign).toEqual(7);

    sign = 1;
    EventBus.$on('emitEvent', (paramsOne?: number, paramsTwo?: number) => {
      if (typeof paramsOne !== 'undefined') {
        sign += paramsOne;
      }

      if (typeof paramsTwo !== 'undefined') {
        sign += paramsTwo;
      }
    });

    EventBus.$emit('emitEvent');
    expect(sign).toEqual(1);
    EventBus.$emit('emitEvent', 1);
    expect(sign).toEqual(2);
    EventBus.$emit('emitEvent', 0, 1);
    expect(sign).toEqual(3);
    EventBus.$emit('emitEvent', 1, 1);
    expect(sign).toEqual(5);
    EventBus.$off();
    EventBus.$emit('emitEvent', 1, 1);
    expect(sign).toEqual(5);

    class Context {
      public test: string;

      constructor() {
        this.test = 'world';
      }
    }
    const context = new Context();
    let str = 'hello ';
    EventBus.$on('contextEvent', function (this: NeedToTyped) {
      str += this.test;
    }, context);
    EventBus.$emit('contextEvent');
    expect(str).toEqual('hello world');
  });
});
