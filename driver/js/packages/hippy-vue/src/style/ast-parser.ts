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

import { CallbackType, NeedToTyped } from '../types/native';
import { getBeforeLoadStyle, isDev } from '../util';
import { CssAttribute } from './css-selectors-map';
import { SimpleSelectorSequence } from './group/simple-selector-sequence';
import parseSelector, { ParsedSelectorValueType, SelectorType } from './parser';
import { RuleSet } from './ruleset';
import { AttributeSelector } from './selector/attribute-selector';
import { ClassSelector } from './selector/class-selector';
import { IdSelector } from './selector/ids-selector';
import { InvalidSelector } from './selector/invalid-selector';
import { PseudoClassSelector } from './selector/pseudo-class-selector';
import { Selector } from './selector/selector';
import { SimpleSelector } from './selector/simple-selector';
import { TypeSelector } from './selector/type-selector';
import { UniversalSelector } from './selector/universal-selector';

// ast 核心解析逻辑处理


export function isDeclaration(node: NeedToTyped) {
  return node.type === 'declaration';
}

export function createDeclaration(beforeLoadStyle: CallbackType) {
  return (decl: NeedToTyped) => {
    const newDecl = beforeLoadStyle(decl);
    if (isDev()) {
      if (!newDecl) {
        throw new Error('beforeLoadStyle hook must returns the processed style object');
      }
    }
    return newDecl;
  };
}

export function createSimpleSelectorFromAst(ast: any) {
  switch (ast.type) {
    case '*': return new UniversalSelector();
    case '#': return new IdSelector(ast.identifier);
    case '': return new TypeSelector(ast.identifier.replace(/-/, '').toLowerCase());
    case '.': return new ClassSelector(ast.identifier);
    case ':': return new PseudoClassSelector(ast.identifier);
    case '[]': return ast.test ? new AttributeSelector(ast.property, ast.test, ast.value) : new AttributeSelector(ast.property);
    default: return new InvalidSelector(new Error('createSimpleSelectorFromAst type is null'));;
  }
}

export function createSimpleSelectorSequenceFromAst(ast?: SelectorType[]) {
  if (!ast || ast.length === 0) {
    return new InvalidSelector(new Error('Empty simple selector sequence.'));
  }
  if (ast.length === 1) {
    return createSimpleSelectorFromAst(ast[0]);
  }

  return new SimpleSelectorSequence(ast.map(createSimpleSelectorFromAst));
}

export function createSelectorFromAst(ast: ParsedSelectorValueType) {
  if (ast.length === 0) {
    return new InvalidSelector(new Error('Empty selector.'));
  }
  if (ast.length === 1) {
    return createSimpleSelectorSequenceFromAst(ast[0][0]);
  }
  const simpleSelectorSequences: SimpleSelector[] = [];
  for (let i = 0; i < ast.length; i += 1) {
    const simpleSelectorSequence = createSimpleSelectorSequenceFromAst(ast[i][0]);
    const combinator = ast[i][1];
    if (combinator) {
      simpleSelectorSequence.combinator = combinator as string;
    }
    simpleSelectorSequences.push(simpleSelectorSequence);
  }
  return new Selector(simpleSelectorSequences);
}

export function createSelector(text: string) {
  try {
    const parsedSelector = parseSelector(text);
    if (!parsedSelector) {
      return new InvalidSelector(new Error('Empty selector'));
    }
    // parsedSelector.value is ast, like:
    // [[[{type: '#', identifier: 'root'}, {type: '[]', property: 'data-v-5ef48958'}], undefined]]
    return createSelectorFromAst(parsedSelector.value);
  } catch (e) {
    return new InvalidSelector(e as Error);
  }
}

export function fromAstNodes(astRules: CssAttribute[] = []): RuleSet[] {
  const beforeLoadStyle = getBeforeLoadStyle();

  return astRules.map((rule) => {
    const declarations = rule.declarations
      .filter(isDeclaration)
      .map(createDeclaration(beforeLoadStyle));
    const selectors = rule.selectors.map(createSelector);
    return new RuleSet(selectors, declarations, rule.hash);
  });
}

