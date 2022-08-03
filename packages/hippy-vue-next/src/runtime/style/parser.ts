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

/** selector 的类型 */
import { type NeedToTyped } from '@hippy-shared/index';

export interface SelectorType {
  type: string;
  identifier?: string;
  property?: string;
  test?: string;
  value?: string;
}

/** combinator的pair的值类型 */
export type PairValueType = [SelectorType[] | undefined, undefined | string];

/** parse 之后得到的选择器的值类型 */
export type ParsedSelectorValueType = (SelectorType[][] | PairValueType)[];

/** combinator类型 */
export interface CombinatorType {
  start: number;
  end: number;
  value: string;
}

/** 选择器parse完成后的类型 */
export interface SelectorParsedType {
  start: number | undefined;
  end: number | undefined;
  // value是一个二维数组，默认第一个index为0是选择器的类型，其值也是一个数组，类型是SelectorType
  // PairValueType则是combinator类型的情况下，index为1的类型
  /* 形如普通选择器：
  [
    [
      [ { type:'', identifier: '' } ], [ { type:'', identifier: '' } ]
    ]
  ]
  或是combinator
  [
    [
      [ { type:'' } ], 'combinator' ]
    ]
  ]
   */
  value: ParsedSelectorValueType;
}

// Check the Regexp is support sticky flag.
const REGEXP_SUPPORTING_STICKY_FLAG = (() => {
  try {
    return !!new RegExp('foo', 'y');
  } catch (err) {
    return false;
  }
})();

// Regexp strings
const REGEXP_STRINGS = {
  whiteSpaceRegEx: '\\s*',
  universalSelectorRegEx: '\\*',
  simpleIdentifierSelectorRegEx: '(#|\\.|:|\\b)([_-\\w][_-\\w\\d]*)',
  attributeSelectorRegEx:
    '\\[\\s*([_-\\w][_-\\w\\d]*)\\s*(?:(=|\\^=|\\$=|\\*=|\\~=|\\|=)\\s*(?:([_-\\w][_-\\w\\d]*)|"((?:[^\\\\"]|\\\\(?:"|n|r|f|\\\\|0-9a-f))*)"|\'((?:[^\\\\\']|\\\\(?:\'|n|r|f|\\\\|0-9a-f))*)\')\\s*)?\\]',
  combinatorRegEx: '\\s*(\\+|~|>)?\\s*',
};

// RegExp instance cache
const REGEXPS = {};

// Execute the RegExp
function execRegExp(regexpKey, text, start) {
  let flags = '';

  // Check the sticky flag supporting, and cache the RegExp instance.
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    flags = 'gy';
  }
  if (!REGEXPS[regexpKey]) {
    REGEXPS[regexpKey] = new RegExp(REGEXP_STRINGS[regexpKey], flags);
  }
  const regexp = REGEXPS[regexpKey];
  let result;
  // Fallback to split the text if sticky is not supported.
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    regexp.lastIndex = start;
    result = regexp.exec(text);
  } else {
    // eslint-disable-next-line no-param-reassign
    text = text.slice(start, text.length);
    result = regexp.exec(text);
    if (!result) {
      return {
        result: null,
        regexp,
      };
    }
    // add start index to prevent infinite loop caused by class name like .aa_bb.aa
    regexp.lastIndex = start + result[0].length;
  }
  return {
    result,
    regexp,
  };
}

function parseUniversalSelector(text, start) {
  const { result, regexp } = execRegExp('universalSelectorRegEx', text, start);
  if (!result) {
    return null;
  }
  const end = regexp.lastIndex;
  return {
    value: {
      type: '*',
    },
    start,
    end,
  };
}

function parseSimpleIdentifierSelector(text, start) {
  const { result, regexp } = execRegExp(
    'simpleIdentifierSelectorRegEx',
    text,
    start,
  );
  if (!result) {
    return null;
  }
  const end = regexp.lastIndex;
  const type = result[1];
  const identifier = result[2];
  const value = { type, identifier };
  return {
    value,
    start,
    end,
  };
}

function parseAttributeSelector(text, start) {
  const { result, regexp } = execRegExp('attributeSelectorRegEx', text, start);
  if (!result) {
    return null;
  }
  const end = regexp.lastIndex;
  const property = result[1];
  if (result[2]) {
    const test = result[2];
    const value = result[3] || result[4] || result[5];
    return {
      value: {
        type: '[]',
        property,
        test,
        value,
      },
      start,
      end,
    };
  }
  return {
    value: {
      type: '[]',
      property,
    },
    start,
    end,
  };
}

function parseSimpleSelector(text, start) {
  return (
    parseUniversalSelector(text, start)
    ?? parseSimpleIdentifierSelector(text, start)
    ?? parseAttributeSelector(text, start)
  );
}

function parseSimpleSelectorSequence(text, start) {
  let simpleSelector = parseSimpleSelector(text, start);
  if (!simpleSelector) {
    return null;
  }
  let { end } = simpleSelector;
  // 这里simpleSelector的value可能为任意类型
  const value: NeedToTyped[] = [];
  while (simpleSelector) {
    value.push(simpleSelector.value);
    ({ end } = simpleSelector);
    simpleSelector = parseSimpleSelector(text, end);
  }
  return {
    start,
    end,
    value,
  };
}

function parseCombinator(text, start) {
  const { result, regexp } = execRegExp('combinatorRegEx', text, start);
  if (!result) {
    return null;
  }
  let end;
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    end = regexp.lastIndex;
  } else {
    end = start;
  }
  const value = result[1] || ' ';
  return {
    start,
    end,
    value,
  };
}

/**
 * 对选择器进行parse
 * selector parse之后：
 * 1、end值是选择器结束的位置索引
 * 2、start是指定开始的位置
 * 3、value则是选择器的值，包括type：如id选择器，类选择器等。
 * identifier 该type的标识
 *
 * @param text - 选择器内容
 * @param start - 开始位置
 */
function parseSelector(
  text: string,
  start: number | undefined,
): SelectorParsedType {
  let end = start;
  const { result, regexp } = execRegExp('whiteSpaceRegEx', text, start);
  if (result) {
    end = regexp.lastIndex;
  }
  const value: ParsedSelectorValueType = [];
  let combinator: CombinatorType | null;
  let expectSimpleSelector = true;
  let pair: PairValueType = [undefined, undefined];
  let cssText;
  if (REGEXP_SUPPORTING_STICKY_FLAG) {
    cssText = [text];
  } else {
    cssText = text.split(' ');
  }
  cssText.forEach((newText) => {
    if (!REGEXP_SUPPORTING_STICKY_FLAG) {
      if (newText === '') {
        return;
      }
      end = 0;
    }
    do {
      const simpleSelectorSequence = parseSimpleSelectorSequence(newText, end);
      if (!simpleSelectorSequence) {
        if (expectSimpleSelector) {
          return;
        }
        break;
      }
      ({ end } = simpleSelectorSequence);
      if (combinator) {
        pair[1] = combinator.value;
      }
      pair = [simpleSelectorSequence.value, undefined];
      value.push(pair);

      combinator = parseCombinator(newText, end);
      if (combinator) {
        ({ end } = combinator);
      }
      expectSimpleSelector = !!(combinator && combinator.value !== ' ');
    } while (combinator);
  });
  return {
    start,
    end,
    value,
  };
}

export { parseSelector };
