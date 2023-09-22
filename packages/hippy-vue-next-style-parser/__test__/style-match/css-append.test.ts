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

import { insertStyleForSsrNodes } from '../../src/style-match/css-append';
import type { StyleNode } from '../../src';

/**
 * style-match/append.ts unit test case
 */
describe('style-match/index.ts', () => {
  it('insertStyleForSsrNodes should work correctly', () => {
    const nodeList = [
      { id: 1, pId: 0, index: 0, name: 'View', props: { style: { flex: 1 }, attributes: { id: 'root', class: 'rootClass' } }, tagName: 'div' },
      { id: 2, pId: 1, index: 0, name: 'View', props: { attributes: { id: 'wrapper', class: 'wrapperClass' } }, tagName: 'div' },
      { id: 3, pId: 2, index: 0, name: 'ListView', props: {}, tagName: 'ul' },
      { id: 4, pId: 3, index: 0, name: 'ListViewItem', props: { }, tagName: 'li' },
      { id: 5, pId: 4, index: 0, name: 'Image', props: { }, tagName: 'img' },
      { id: 6, pId: 4, index: 0, name: 'Text', props: { }, tagName: 'span' },
      { id: 7, pId: 4, index: 0, name: 'ViewPagerItem', props: { }, tagName: 'swiper-item' },
      { id: 8, pId: 4, index: 0, name: 'Modal', props: { style: { 'margin-left': '10px' } }, tagName: 'dialog' },
      { id: 9, pId: 4, index: 0, name: 'TextInput', props: { style: { caretColor: 'gray', underlineColorAndroid: 'gray', placeholderTextColor: 'gray' } }, tagName: 'input' },
      { id: 11, pId: 4, index: 0, name: 'View', props: { style: {
        overflowX: 'scroll',
        textShadowOffset: {
          x: 1,
          y: 1,
        },
        // support declare textShadowOffsetX & textShadowOffsetY separately
        textShadowOffsetX: 1,
        textShadowOffsetY: 1,
        textShadowRadius: 3,
        textShadowColor: 'grey',
      } }, tagName: 'div' },
    ];
    const styleContent = [
      // root class
      [
        ['.rootClass'],
        [
          [
            'width',
            '1rem',
          ],
          [
            'backgroundColor',
            'gray',
          ],
        ],
      ],
      [
        ['#root'],
        [
          [
            'height',
            '1rem',
          ],
        ],
      ],
      // wrapper class
      [
        ['.wrapperClass'],
        [
          [
            'display',
            'flex',
          ],
          [
            'overflowY',
            'scroll',
          ],
        ],
      ],
      [
        ['span'],
        [
          ['fontWeight', 123],
          ['backgroundImage', 'url("https://hippyjs.org")'],
          ['width', '24px'],
        ],
      ],
    ];
    const nativeNodes = insertStyleForSsrNodes(nodeList as unknown as StyleNode[], styleContent);
    // default style and css style check
    expect(nativeNodes[0].props.style).toEqual({ width: 50, backgroundColor: 4286611584, height: 50, flex: 1 });
    expect(nativeNodes[0].props.inlineStyle).toEqual({ flex: 1 });
    expect(nativeNodes[1].props.style).toEqual({ display: 'flex', overflowY: 'scroll' });
    expect(nativeNodes[2].props.style).toEqual({ flex: 1, collapsable: false });
    expect(nativeNodes[4].props.style).toEqual({ backgroundColor: 0 });
    expect(nativeNodes[5].props.style).toEqual({ color: 4278190080, backgroundImage: 'https://hippyjs.org', fontWeight: '123', width: 24 });
    expect(nativeNodes[6].props.style).toEqual({ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 });
    expect(nativeNodes[7].props.style).toEqual({ position: 'absolute', marginLeft: 10 });
    expect(nativeNodes[8].props.style).toEqual({
      padding: 0,
      color: 4278190080,
      caretColor: 4286611584,
      placeholderTextColor: 4286611584,
      underlineColorAndroid: 4286611584,
    });

    expect(nativeNodes[9].props.style).toEqual({ overflowX: 'scroll', flexDirection: 'row', textShadowColor: 4286611584,
      textShadowOffset: {
        height: 1,
        width: 1,
        x: 1,
        y: 1,
      },
      textShadowRadius: 3,
    });
    expect(nativeNodes[9].props.horizontal).toBeTruthy();
  });
});
