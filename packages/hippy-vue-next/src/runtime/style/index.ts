import { getBeforeLoadStyle } from '../../util';

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
import { parseSelector } from './parser';

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

export { SelectorsMap } from './css-selectors-match';
