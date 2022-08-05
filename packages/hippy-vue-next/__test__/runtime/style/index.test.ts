/**
 * runtime/style/index 样式综合处理模块单测
 *
 */
import { HippyElement } from '../../../src/runtime/element/hippy-element';
import { fromAstNodes, SelectorsMap } from '../../../src/runtime/style';

// 测试用AST
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
];

/**
 * @author birdguo
 * @priority P0
 * @casetype unit
 */
describe('runtime/style/index.ts', () => {
  let cssMap;

  // 每个用例执行前先
  beforeAll(() => {
    const rules = fromAstNodes(testAst);
    cssMap = new SelectorsMap(rules);
  });

  it('id selector should match element correctly', async () => {
    const divElement = new HippyElement('div');
    divElement.setAttribute('id', 'id');

    const matchedCss = cssMap.query(divElement);

    expect(matchedCss.selectors.length).toEqual(7);
  });

  it('class selector should match element correctly', async () => {
    const divElement = new HippyElement('div');
    divElement.setAttribute('class', 'class');

    const matchedCss = cssMap.query(divElement);
    expect(matchedCss.selectors.length).toEqual(5);
  });

  it('type selector should match element correctly', async () => {
    const tagElement = new HippyElement('tag');
    tagElement.setStyle('color', 'red');

    const matchedCss = cssMap.query(tagElement);
    expect(matchedCss.selectors.length).toEqual(4);
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
    expect(matchedCss.selectors.length).toEqual(9);
  });
});
