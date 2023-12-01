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

import test, { before } from 'ava';
import { fromAstNodes, SelectorsMap } from '../index';
import ElementNode from '../../renderer/element-node';
import TEST_AST from './test-css-ast.json';

let cssMap: NeedToTyped;

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
    hash: 'chunk-1',
    selectors: [
      '#id',
      '*',
      '#id[attr="test"]',
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
      {
        type: 'declaration',
        property: 'AttributeSelector',
        value: 'AttributeSelector',
      },
    ],
  }];
  const appendRules = fromAstNodes(APPEND_AST);
  cssMap.append(appendRules);
  const node = new ElementNode('div');
  node.setAttribute('id', 'id');
  const matchedCSS = cssMap.query(node);
  t.is(matchedCSS.selectors.length, 10);
});
