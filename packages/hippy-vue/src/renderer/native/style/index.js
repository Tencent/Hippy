/* eslint-disable import/prefer-default-export */

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
import { isFunction } from '../../../util';

function isDeclaration(node) {
  return node.type === 'declaration';
}

function processDeclarationProperty(property) {
  return property;
}

function createDeclaration(decl) {
  return {
    property: processDeclarationProperty(decl.property),
    value: decl.value,
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

function fromAstNodes(astRules = [], beforeStyleLoadHook) {
  let createDeclarationWrapper = createDeclaration;
  // Wrap the createDeclaration if beforeStyleLoadHook defined in Vue startup options.
  // For process the the style declaration property and value.
  if (isFunction(beforeStyleLoadHook)) {
    createDeclarationWrapper = (decl) => {
      const newDecl = beforeStyleLoadHook(decl);
      if (process.env.NODE_ENV !== 'production') {
        if (!newDecl) {
          throw new Error('beforeLoadStyle hook must returns the processed style object');
        }
      }
      return newDecl;
    };
  }

  return astRules.map((rule) => {
    const declarations = rule.declarations.filter(isDeclaration).map(createDeclarationWrapper);
    const selectors = rule.selectors.map(createSelector);
    const ruleSet = new RuleSet(selectors, declarations);
    return ruleSet;
  });
}

export { SelectorsMap } from './css-selectors-match';
export {
  fromAstNodes,
};
