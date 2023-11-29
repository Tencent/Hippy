/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

import { getBeforeLoadStyle, isDev } from '../../../util';
import parseSelector from './parser';
import {
  RuleSet,
  InvalidSelector,
  UniversalSelector,
  IdSelector,
  TypeSelector,
  ClassSelector,
  PseudoClassSelector,
  AttributeSelector,
  SimpleSelectorSequence,
  Selector,
} from './css-selectors';

function isDeclaration(node: any) {
  return node.type === 'declaration';
}

function createDeclaration(beforeLoadStyle: any) {
  return (decl: any) => {
    const newDecl = beforeLoadStyle(decl);
    if (isDev()) {
      if (!newDecl) {
        throw new Error('beforeLoadStyle hook must returns the processed style object');
      }
    }
    return newDecl;
  };
}

function createSimpleSelectorFromAst(ast: any) {
  switch (ast.type) {
    case '*': return new UniversalSelector();
    case '#': return new IdSelector(ast.identifier);
    case '': return new TypeSelector(ast.identifier.replace(/-/, '').toLowerCase());
    case '.': return new ClassSelector(ast.identifier);
    case ':': return new PseudoClassSelector(ast.identifier);
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 1.
    case '[]': return ast.test ? new AttributeSelector(ast.property, ast.test, ast.value) : new AttributeSelector(ast.property);
    default: return null;
  }
}

function createSimpleSelectorSequenceFromAst(ast: any) {
  if (ast.length === 0) {
    return new InvalidSelector(new Error('Empty simple selector sequence.'));
  }
  if (ast.length === 1) {
    return createSimpleSelectorFromAst(ast[0]);
  }

  return new SimpleSelectorSequence(ast.map(createSimpleSelectorFromAst));
}

function createSelectorFromAst(ast: any) {
  if (ast.length === 0) {
    return new InvalidSelector(new Error('Empty selector.'));
  }
  if (ast.length === 1) {
    return createSimpleSelectorSequenceFromAst(ast[0][0]);
  }
  const simpleSelectorSequences = [];
  for (let i = 0; i < ast.length; i += 1) {
    const simpleSelectorSequence = createSimpleSelectorSequenceFromAst(ast[i][0]);
    const combinator = ast[i][1];
    if (combinator) {
      // @ts-expect-error TS(2531): Object is possibly 'null'.
      simpleSelectorSequence.combinator = combinator;
    }
    simpleSelectorSequences.push(simpleSelectorSequence);
  }
  return new Selector(simpleSelectorSequences);
}

function createSelector(sel: any) {
  try {
    // @ts-expect-error TS(2554): Expected 2 arguments, but got 1.
    const parsedSelector = parseSelector(sel);
    if (!parsedSelector) {
      return new InvalidSelector(new Error('Empty selector'));
    }
    // parsedSelector.value is ast, like:
    // [[[{type: '#', identifier: 'root'}, {type: '[]', property: 'data-v-5ef48958'}], undefined]]
    return createSelectorFromAst(parsedSelector.value);
  } catch (e) {
    return new InvalidSelector(e);
  }
}

function fromAstNodes(astRules = []) {
  const beforeLoadStyle = getBeforeLoadStyle();
  return astRules.map((rule) => {
    const declarations = (rule as any).declarations
      .filter(isDeclaration)
      .map(createDeclaration(beforeLoadStyle));
    const selectors = (rule as any).selectors.map(createSelector);
    return new RuleSet(selectors, declarations, (rule as any).hash);
  });
}

export { SelectorsMap } from './css-selectors-match';
export {
  fromAstNodes,
};
