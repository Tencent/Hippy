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

import test from 'ava';
import parseSelector from '../parser';

test('Id selector parser', (t) => {
  t.deepEqual(parseSelector('#test'), {
    end: 5,
    start: undefined,
    value: [
      [
        [
          {
            type: '#',
            identifier: 'test',
          },
        ],
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});

test('Class selector parser', (t) => {
  t.deepEqual(parseSelector('.row'), {
    end: 4,
    start: undefined,
    value: [
      [
        [
          {
            type: '.',
            identifier: 'row',
          },
        ],
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});

test('Union combinator selector parser', (t) => {
  t.deepEqual(parseSelector('.button-demo-1.is-pressing'), {
    end: 26,
    start: undefined,
    value: [
      [
        [
          {
            type: '.',
            identifier: 'button-demo-1',
          },
          {
            type: '.',
            identifier: 'is-pressing',
          },
        ],
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});

test('Space combinator selector parser', (t) => {
  t.deepEqual(parseSelector('#demo-img .image'), {
    end: 16,
    start: undefined,
    value: [
      [
        [
          {
            type: '#',
            identifier: 'demo-img',
          },
        ],
        ' ', // FIXME: Strange space
      ],
      [
        [
          {
            type: '.',
            identifier: 'image',
          },
        ],
        undefined, // FIXME: Strange undefined
      ],
    ],
  });
});
