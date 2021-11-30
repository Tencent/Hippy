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

import { getBeforeLoadStyle } from '../../../util';
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

function isDeclaration(node) {
  return node.type === 'declaration';
}

function createDeclaration(beforeLoadStyle) {
  return (decl) => {
    const newDecl = beforeLoadStyle(decl);
    if (process.env.NODE_ENV !== 'production') {
      if (!newDecl) {
        throw new Error('beforeLoadStyle hook must returns the processed style object');
      }
    }
    return newDecl;
  };
}

function createSimpleSelectorFromAst(ast) {
  switch (ast.type) {
    case '*': return new UniversalSelector();
    case '#': return new IdSelector(ast.identifier);
    case '': return new TypeSelector(ast.identifier.replace(/-/, '').toLowerCase());
    case '.': return new ClassSelector(ast.identifier);
    case ':': return new PseudoClassSelector(ast.identifier);
    case '[]': return ast.test ? new AttributeSelector(ast.property, ast.test, ast.value) : new AttributeSelector(ast.property);
    default: return null;
  }
}

function createSimpleSelectorSequenceFromAst(ast) {
  if (ast.length === 0) {
    return new InvalidSelector(new Error('Empty simple selector sequence.'));
  }
  if (ast.length === 1) {
    return createSimpleSelectorFromAst(ast[0]);
  }

  return new SimpleSelectorSequence(ast.map(createSimpleSelectorFromAst));
}

function createSelectorFromAst(ast) {
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
      simpleSelectorSequence.combinator = combinator;
    }
    simpleSelectorSequences.push(simpleSelectorSequence);
  }
  return new Selector(simpleSelectorSequences);
}

function createSelector(sel) {
  try {
    const parsedSelector = parseSelector(sel);
    if (!parsedSelector) {
      return new InvalidSelector(new Error('Empty selector'));
    }
    return createSelectorFromAst(parsedSelector.value);
  } catch (e) {
    return new InvalidSelector(e);
  }
}

function fromAstNodes(astRules = []) {
  const beforeLoadStyle = getBeforeLoadStyle();

  return astRules.map((rule) => {
    const declarations = rule.declarations
      .filter(isDeclaration)
      .map(createDeclaration(beforeLoadStyle));
    const selectors = rule.selectors.map(createSelector);
    return new RuleSet(selectors, declarations);
  });
}

export { SelectorsMap } from './css-selectors-match';
export {
  fromAstNodes,
};
