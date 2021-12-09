import test, { before } from 'ava';
import { getCssMap } from '../../index';
import { GLOBAL_DISPOSE_STYLE_NAME, GLOBAL_STYLE_NAME } from '../../../../runtime/constants';
import ElementNode from '../../../element-node';
import TEST_AST from './test-css-ast.json';
import TEST_AST_CHUNK_2 from './test-css-ast-chunk-2.json';

const DISPOSE_CHUNK_HASH = 'chunk-2';
const CHUNK_2_STYLE_PROPERTY_SUFFIX = 'chunk-2';
let cssMap;

before(() => {
  global[GLOBAL_STYLE_NAME] = TEST_AST.concat(TEST_AST_CHUNK_2);
  cssMap = getCssMap();
  global[GLOBAL_DISPOSE_STYLE_NAME] = [DISPOSE_CHUNK_HASH];
  getCssMap();
});

test('SelectorsMap delete API test', (t) => {
  const noChunk2RuleSet = cssMap.ruleSets.every(ruleSet => ruleSet.hash !== DISPOSE_CHUNK_HASH);
  t.is(noChunk2RuleSet, true);
  t.is(cssMap.ruleSets.length, TEST_AST.length);
});

test('IdSelector dispose test', (t) => {
  const node = new ElementNode('div');
  node.setAttribute('id', 'id');
  t.is(isDisposeStyleExcluded(node), true);
});

test('ClassSelector dispose test', (t) => {
  const node = new ElementNode('div');
  node.setAttribute('class', 'class');
  t.is(isDisposeStyleExcluded(node), true);
});

test('TypeSelector dispose test', (t) => {
  const node = new ElementNode('tag');
  t.is(isDisposeStyleExcluded(node), true);
});

function isDisposeStyleExcluded(node) {
  const matchedCSS = cssMap.query(node);
  const style = getMatchStyle(matchedCSS);
  return Object.keys(style).every(key => !(key.includes(CHUNK_2_STYLE_PROPERTY_SUFFIX)));
}

function getMatchStyle(selectorsMatched) {
  const style = {};
  selectorsMatched.selectors.forEach((matchedSelector) => {
    matchedSelector.ruleSet.declarations.forEach((cssStyle) => {
      style[cssStyle.property] = cssStyle.value;
    });
  });
  return style;
}
