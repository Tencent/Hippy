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
 * runtime/style/index unit test
 *
 */
import { HIPPY_GLOBAL_DISPOSE_STYLE_NAME, HIPPY_GLOBAL_STYLE_NAME } from '../../../src/config';
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { fromAstNodes } from '../../../src/runtime/style';
import { getCssMap } from '../../../src/runtime/style/css-map';

// AST used for test
const testAst = [
  {
    hash: 'chunk-1',
    selectors: [],
    declarations: [],
  },
  {
    hash: 'chunk-1',
    selectors: ['*'],
    declarations: [
      {
        type: 'declaration',
        property: 'UniversalSelector',
        value: 'UniversalSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id'],
    declarations: [
      {
        type: 'declaration',
        property: 'IdSelector',
        value: 'IdSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['tag'],
    declarations: [
      {
        type: 'declaration',
        property: 'TypeSelector',
        value: 'TypeSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['.class'],
    declarations: [
      {
        type: 'declaration',
        property: 'ClassSelector',
        value: 'ClassSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id:hover'],
    declarations: [
      {
        type: 'declaration',
        property: 'PseudoClassSelector',
        value: 'PseudoClassSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id[attr="test"]'],
    declarations: [
      {
        type: 'declaration',
        property: 'AttributeSelector',
        value: 'AttributeSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id[attr^="tes"]'],
    declarations: [
      {
        type: 'declaration',
        property: 'AttributeSelector',
        value: 'AttributeSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id[attr$="est"]'],
    declarations: [
      {
        type: 'declaration',
        property: 'AttributeSelector',
        value: 'AttributeSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id[attr*="es"]'],
    declarations: [
      {
        type: 'declaration',
        property: 'AttributeSelector',
        value: 'AttributeSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id[attr^="atestb"]'],
    declarations: [
      {
        type: 'declaration',
        property: 'AttributeSelector',
        value: 'AttributeSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['#id', '*'],
    declarations: [
      {
        type: 'declaration',
        property: 'IdSelector',
        value: 'IdSelector',
      },
      {
        type: 'declaration',
        property: 'UniversalSelector',
        value: 'UniversalSelector',
      },
    ],
  },
  {
    hash: 'chunk-1',
    selectors: ['.class', '*'],
    declarations: [
      {
        type: 'declaration',
        property: 'ClassSelector',
        value: 'ClassSelector',
      },
      {
        type: 'declaration',
        property: 'UniversalSelector',
        value: 'UniversalSelector',
      },
    ],
  },
  {
    hash: 'chunk-2',
    selectors: [],
    declarations: [],
  },
  {
    hash: 'chunk-2',
    selectors: [
      '*',
    ],
    declarations: [
      {
        type: 'declaration',
        property: 'UniversalSelector-chunk-2',
        value: 'UniversalSelector-chunk-2',
      },
    ],
  },
];

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/style/index.ts', () => {
  let cssMap;

  beforeAll(() => {
    global[HIPPY_GLOBAL_STYLE_NAME] = testAst;
    cssMap = getCssMap();
  });

  it('id selector should match element correctly', async () => {
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');

    const matchedCss = cssMap.query(divElement);

    expect(matchedCss.selectors.length).toEqual(12);
  });

  it('class selector should match element correctly', async () => {
    const divElement = new HippyElement('div');
    divElement.setAttribute('class', 'class');

    const matchedCss = cssMap.query(divElement);
    expect(matchedCss.selectors.length).toEqual(6);
  });

  it('type selector should match element correctly', async () => {
    const tagElement = new HippyElement('tag');
    tagElement.setStyle('color', 'red');

    const matchedCss = cssMap.query(tagElement);
    expect(matchedCss.selectors.length).toEqual(5);
  });

  it('append selector should match element correctly', async () => {
    const appendAst = [
      {
        hash: 'chunk-1',
        selectors: ['#id', '*'],
        declarations: [
          {
            type: 'declaration',
            property: 'IdSelector',
            value: 'IdSelector',
          },
          {
            type: 'declaration',
            property: 'UniversalSelector',
            value: 'UniversalSelector',
          },
        ],
      },
    ];

    const appendRules = fromAstNodes(appendAst);
    cssMap.append(appendRules);

    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');

    const matchedCss = cssMap.query(divElement);
    expect(matchedCss.selectors.length).toEqual(14);
  });

  it('global style dispose should work correctly', () => {
    // set need dispose hash for style ast
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME] = ['chunk-2'];
    cssMap = getCssMap();

    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');

    const matchedCss = cssMap.query(divElement);
    // chunk-2 removed, two selectors removed
    expect(matchedCss.selectors.length).toEqual(12);
  });
});
