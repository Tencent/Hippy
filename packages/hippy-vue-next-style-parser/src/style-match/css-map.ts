/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import type { CssAttribute } from './css-selectors-match';
import { SelectorsMap } from './css-selectors-match';
import { parseSelector } from './parser';
import { HIPPY_GLOBAL_STYLE_NAME, HIPPY_GLOBAL_DISPOSE_STYLE_NAME } from './';

// style load hook
const beforeLoadStyleHook: Function = (declaration: Function): Function => declaration;

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
    case '*':
      return new UniversalSelector();
    case '#':
      return new IdSelector(ast.identifier);
    case '':
      return new TypeSelector(ast.identifier.replace(/-/, '').toLowerCase());
    case '.':
      return new ClassSelector(ast.identifier);
    case ':':
      return new PseudoClassSelector(ast.identifier);
    case '[]':
      return ast.test
        ? new AttributeSelector(ast.property, ast.test, ast.value)
        : new AttributeSelector(ast.property);
    default:
      return null;
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
  const simpleSelectorSequences: any[] = [];

  for (const currentAst of ast) {
    const simpleSelectorSequence = createSimpleSelectorSequenceFromAst(currentAst[0]);
    const combinator = currentAst[1];
    if (combinator && simpleSelectorSequence) {
      simpleSelectorSequence.combinator = combinator;
    }
    simpleSelectorSequences.push(simpleSelectorSequence);
  }

  return new Selector(simpleSelectorSequences);
}

function createSelector(sel) {
  try {
    const parsedSelector = parseSelector(sel, 0);
    if (!parsedSelector) {
      return new InvalidSelector(new Error('Empty selector'));
    }
    return createSelectorFromAst(parsedSelector.value);
  } catch (e) {
    return new InvalidSelector(e as Error);
  }
}

/**
 * transform css ast to style rule set
 *
 * @param astRules - css ast list
 * @param beforeLoadStyle
 */
export function fromAstNodes(
  astRules: CssAttribute[] = [],
  beforeLoadStyle?: Function,
): RuleSet[] {
  return astRules.map((rule) => {
    const declarations = rule.declarations
      .filter(isDeclaration)
      // use default hook when there is no hook passed in
      .map(createDeclaration(beforeLoadStyle ?? beforeLoadStyleHook));
    const selectors = rule.selectors.map(createSelector);

    return new RuleSet(selectors, declarations, rule.hash);
  });
}

/**
 * transform css ast from server side to style rule set
 *
 * @param ssrAstRules - css ast rule list from server
 * @param beforeLoadStyle
 */
export function fromSsrAstNodes(
  ssrAstRules: CssAttribute[] = [],
  beforeLoadStyle?: Function,
): RuleSet[] {
  return ssrAstRules.map((rule) => {
    // style from server was simplified. index '0' means attribute 'selectors', index '1' means
    // 'declarations'
    // ex: [['.class'], [['width', '100px']]] => { selectors: ['.class'], 'declarations': [['width', '100px']] }
    let selectors = rule[0];
    let declarations = rule[1];
    // we need to revert simplified key to raw key
    declarations = declarations
      .map((declaration) => {
        const [property, value] = declaration;
        return {
          type: 'declaration',
          property,
          value,
        };
      })
      // use default hook when there is no hook passed in
      .map(createDeclaration(beforeLoadStyle ?? beforeLoadStyleHook));
    // create style class
    selectors = selectors.map(createSelector);
    // ssr style no hash
    return new RuleSet(selectors, declarations, '');
  });
}

// global css map
let globalCssMap: SelectorsMap;

/**
 * judge css map is empty, undefined or no ruleset is empty
 *
 * @param cssMap
 */
function isEmptyCssMap(cssMap?: SelectorsMap): boolean {
  return !cssMap || !cssMap?.ruleSets?.length;
}

/**
 * get css map
 *
 * @param styles - style list
 * @param beforeLoadStyle - before load style hook
 * @public
 */
export function getCssMap(
  styles?: any[],
  beforeLoadStyle?: Function,
): SelectorsMap {
  // have styles params means ssr, so we used styles as global css map
  if (styles) {
    if (!isEmptyCssMap(globalCssMap)) {
      return globalCssMap;
    }
    // get ssr ast nodes
    const cssRules = fromSsrAstNodes(styles, beforeLoadStyle);
    globalCssMap = new SelectorsMap(cssRules);

    return globalCssMap;
  }
  // no styles params means csr, we used global css map as before
  const styleCssMap = global[HIPPY_GLOBAL_STYLE_NAME];

  /**
   * To support dynamic import, globalCssMap can be loaded from different js file.
   * globalCssMap should be created/appended if global[GLOBAL_STYLE_NAME] exists;
   */
  if (isEmptyCssMap(globalCssMap) || styleCssMap) {
    /**
     *  Here is a secret startup option: beforeStyleLoadHook.
     *  Usage for process the styles while styles loading.
     */
    const cssRules = fromAstNodes(styleCssMap, beforeLoadStyle);
    if (globalCssMap) {
      globalCssMap.append(cssRules);
    } else {
      globalCssMap = new SelectorsMap(cssRules);
    }

    // after the global style processing is complete, remove the value of this object
    global[HIPPY_GLOBAL_STYLE_NAME] = undefined;
  }

  // if there are currently expired styles, hot update style processing
  if (global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME]) {
    // the new css style will be generated with hash id, so it can be removed by id
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME].forEach((id) => {
      // remove outdated styles
      globalCssMap.delete(id);
    });

    // remove saved expired styles
    global[HIPPY_GLOBAL_DISPOSE_STYLE_NAME] = undefined;
  }

  return globalCssMap;
}
