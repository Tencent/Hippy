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

import { parseSelector } from '../../src/style-match/parser';

/**
 * style-match/parser.ts unit test case
 */
describe('style-match/parser.ts', () => {
  // id selector parser
  it('id selector should parser correctly', async () => {
    const parsedValue = {
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
          undefined,
        ],
      ],
    };

    expect(parseSelector('#test', undefined)).toStrictEqual(parsedValue);
  });

  // class selector parser
  it('class selector should parser correctly', async () => {
    const parsedValue = {
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
          undefined,
        ],
      ],
    };

    expect(parseSelector('.row', undefined)).toStrictEqual(parsedValue);
  });

  // union combinator selector parser
  it('union combinator selector should parser correctly', async () => {
    const parsedValue = {
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
          undefined,
        ],
      ],
    };

    expect(parseSelector('.button-demo-1.is-pressing', undefined)).toStrictEqual(parsedValue);
  });

  // space selector parser
  it('space selector should parser correctly', async () => {
    const parsedValue = {
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
          ' ',
        ],
        [
          [
            {
              type: '.',
              identifier: 'image',
            },
          ],
          undefined,
        ],
      ],
    };

    expect(parseSelector('#demo-img .image', undefined)).toStrictEqual(parsedValue);
  });
});
