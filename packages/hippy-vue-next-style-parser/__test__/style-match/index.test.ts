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

import { HIPPY_GLOBAL_DISPOSE_STYLE_NAME, HIPPY_GLOBAL_STYLE_NAME } from '../../../hippy-vue-next/src/config';
import { HippyElement } from '../../../hippy-vue-next/src/runtime/element/hippy-element';
import { SelectorsMap, type StyleNode } from '../../src/style-match';
import { SimpleSelectorSequence } from '../../src/style-match/css-selectors';
import { getCssMap, fromAstNodes, fromSsrAstNodes } from '../../src/style-match/css-map';
import { registerElement } from '../../../hippy-vue-next/src/runtime/component';
import { setHippyCachedInstance } from '../../../hippy-vue-next/src/util/instance';

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
    selectors: ['div > tag'],
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
    selectors: ['div tag'],
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
    selectors: ['div > tag+newtag'],
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
    selectors: ['#id[attr|="ortest"]'],
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
 * style-match/index.ts unit test case
 */
describe('style-match/index.ts', () => {
  let cssMap;

  beforeAll(() => {
    global[HIPPY_GLOBAL_STYLE_NAME] = testAst;
    cssMap = getCssMap();
    registerElement('div', { component: { name: 'View' } });
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

  it('id selector should match element correctly', async () => {
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');

    const matchedCss = cssMap.query(divElement);

    expect(matchedCss.selectors.length).toEqual(13);
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

    let matchedCss = cssMap.query(tagElement);
    expect(matchedCss.selectors.length).toEqual(5);

    const divElement = new HippyElement('div');
    divElement.appendChild(tagElement);
    matchedCss = cssMap.query(tagElement);
    expect(matchedCss.selectors.length).toEqual(7);

    const newTagElement = new HippyElement('newtag');
    newTagElement.setStyle('color', 'red');
    divElement.appendChild(newTagElement);
    matchedCss = cssMap.query(tagElement);
    expect(matchedCss.selectors.length).toEqual(7);
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
    expect(matchedCss.selectors.length).toEqual(15);
  });

  it('global style dispose should work correctly', () => {
    // set need dispose hash for style ast
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME] = ['chunk-2'];
    cssMap = getCssMap();

    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');

    const matchedCss = cssMap.query(divElement);
    expect(matchedCss.selectors.length).toEqual(13);
  });

  it('style scoped should work correctly', () => {
    const scopedId = 'data-v-9270b1a8';
    const appendAst = [
      {
        hash: 'chunk-1',
        selectors: [`.wrapper[${scopedId}]`],
        declarations: [
          {
            type: 'declaration',
            property: 'display',
            value: 'flex',
          },
        ],
      },
    ];

    const appendRules = fromAstNodes(appendAst);
    cssMap.append(appendRules);

    const divElement = new HippyElement('div');
    divElement.setAttribute('class', 'wrapper');
    // set scoped id determine attribute
    divElement.setAttribute(scopedId, true);

    let matchedSelectors = cssMap.query(divElement);
    expect(matchedSelectors.selectors.length).toEqual(4);
    let matched = 0;
    matchedSelectors.selectors.forEach((matchedSelector) => {
      if (matchedSelector.match(divElement)) {
        matched += 1;
      }
    });
    expect(matched).toEqual(4);
    divElement.removeAttribute(scopedId);

    // set an unmatched scoped id
    divElement.setAttribute(`${scopedId}-123`, true);
    matchedSelectors = cssMap.query(divElement);
    expect(matchedSelectors.selectors.length).toEqual(4);
    matched = 0;
    matchedSelectors.selectors.forEach((matchedSelector) => {
      if (matchedSelector.match(divElement)) {
        matched += 1;
      }
    });
    expect(matched).toEqual(3);
  });

  it('universal attribute selector should match element correctly', () => {
    // nothing
    const ast = [{
      hash: 'chunk-1',
      selectors: ['#id[attr*="es"]'],
      declarations: [
        {
          type: 'declaration',
          property: 'AttributeSelector',
          value: 'AttributeSelector',
        },
      ],
    }];

    const cssRules = fromAstNodes(ast);
    const cssMap = new SelectorsMap(cssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id1');
    let matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(0);
    divElement.setAttribute('id', 'id');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'test');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
    expect(matched.selectors[0] instanceof SimpleSelectorSequence).toBeTruthy();
  });

  it('equal attribute selector should match element correctly', () => {
    // nothing
    const ast = [{
      hash: 'chunk-1',
      selectors: ['#id[attr="test"]'],
      declarations: [
        {
          type: 'declaration',
          property: 'AttributeSelector',
          value: 'AttributeSelector',
        },
      ],
    }];

    const cssRules = fromAstNodes(ast);
    const cssMap = new SelectorsMap(cssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');
    divElement.setAttribute('attr', 'tes');
    let matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'test');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
  });

  it('start with attribute selector should match element correctly', () => {
    // nothing
    const ast = [{
      hash: 'chunk-1',
      selectors: ['#id[attr^="tes"]'],
      declarations: [
        {
          type: 'declaration',
          property: 'AttributeSelector',
          value: 'AttributeSelector',
        },
      ],
    }];

    const cssRules = fromAstNodes(ast);
    const cssMap = new SelectorsMap(cssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');
    divElement.setAttribute('attr', 'est');
    let matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'tes321321');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
  });

  it('end with attribute selector should match element correctly', () => {
    // nothing
    const ast = [{
      hash: 'chunk-1',
      selectors: ['#id[attr$="est"]'],
      declarations: [
        {
          type: 'declaration',
          property: 'AttributeSelector',
          value: 'AttributeSelector',
        },
      ],
    }];

    const cssRules = fromAstNodes(ast);
    const cssMap = new SelectorsMap(cssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');
    divElement.setAttribute('attr', 'abtes');
    let matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'abtest');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
  });

  it('include attribute selector should match element correctly', () => {
    // nothing
    const ast = [{
      hash: 'chunk-1',
      selectors: ['#id[attr~="world"]'],
      declarations: [
        {
          type: 'declaration',
          property: 'AttributeSelector',
          value: 'AttributeSelector',
        },
      ],
    }];

    const cssRules = fromAstNodes(ast);
    const cssMap = new SelectorsMap(cssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');
    divElement.setAttribute('attr', 'testworld');
    let matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'test world');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
  });

  it('dash attribute selector should match element correctly', () => {
    // nothing
    const ast = [{
      hash: 'chunk-1',
      selectors: ['#id[attr|="dash"]'],
      declarations: [
        {
          type: 'declaration',
          property: 'AttributeSelector',
          value: 'AttributeSelector',
        },
      ],
    }];

    const cssRules = fromAstNodes(ast);
    const cssMap = new SelectorsMap(cssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');
    divElement.setAttribute('attr', 'das');
    let matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'dash');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
    divElement.setAttribute('attr', 'dash-world');
    matched = cssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
  });

  it('getCssMap should work correctly with ssr ast', () => {
    // remove exist css map
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME] = ['chunk-1'];
    getCssMap();
    // add ssr css map
    const ssrTestAst = [[
      ['.class', '*'],
      [
        [
          'ClassSelector',
          'ClassSelector',
        ],
        [
          'UniversalSelector',
          'UniversalSelector',
        ],
      ],
    ],
    [
      [
        '*',
      ],
      [
        [
          'UniversalSelector-chunk-2',
          'UniversalSelector-chunk-2',
        ],
      ],
    ]];
    const ssrCssMap = getCssMap(ssrTestAst);
    const divElement = new HippyElement('div');
    divElement.setAttribute('class', 'class');

    const matchedCss = ssrCssMap.query(divElement as unknown as StyleNode);
    expect(matchedCss.selectors.length).toEqual(3);
  });

  it('fromSsrAstNodes should work correctly', () => {
    const ssrAst = [[
      ['#id[attr|="dash"]'],
      [
        [
          'AttributeSelector',
          'AttributeSelector',
        ],
      ],
    ]];

    const ssrCssRules = fromSsrAstNodes(ssrAst);
    const ssrCssMap = new SelectorsMap(ssrCssRules);
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');
    divElement.setAttribute('attr', 'das');
    let matched = ssrCssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeFalsy();
    divElement.setAttribute('attr', 'dash');
    matched = ssrCssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
    divElement.setAttribute('attr', 'dash-world');
    matched = ssrCssMap.query(divElement as unknown as StyleNode);
    expect(matched.selectors.length).toEqual(1);
    expect(matched.selectors[0].match(divElement)).toBeTruthy();
  });
});
