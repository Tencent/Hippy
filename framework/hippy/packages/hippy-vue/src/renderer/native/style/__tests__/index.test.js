import test, { before } from 'ava';
import { fromAstNodes, SelectorsMap } from '../index';
import ElementNode from '../../../element-node';
import TEST_AST from './test-css-ast.json';

let cssMap;

before(() => {
  const rules = fromAstNodes(TEST_AST);
  cssMap = new SelectorsMap(rules);
});

test('IdSelector test', (t) => {
  const node = new ElementNode('div');
  node.setAttribute('id', 'id');
  const matchedCSS = cssMap.query(node);
  t.is(matchedCSS.selectors.length, 7);
});

test('ClassSelector test', (t) => {
  const node = new ElementNode('div');
  node.setAttribute('class', 'class');
  const matchedCSS = cssMap.query(node);
  t.is(matchedCSS.selectors.length, 5);
});

test('TypeSelector test', (t) => {
  const node = new ElementNode('tag');
  node.setStyle('color', 'red');
  const matchedCSS = cssMap.query(node);
  t.is(matchedCSS.selectors.length, 4);
});

test('AppendSelector test', (t) => {
  const APPEND_AST = [{
    selectors: [
      '#id',
      '*',
    ],
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
  }];
  const appendRules = fromAstNodes(APPEND_AST);
  cssMap.append(appendRules);
  const node = new ElementNode('div');
  node.setAttribute('id', 'id');
  const matchedCSS = cssMap.query(node);
  t.is(matchedCSS.selectors.length, 9);
});
