/* eslint-disable consistent-return */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-else-return */
/* eslint-disable no-param-reassign */

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
  attributeSelectorRegEx: '\\[\\s*([_-\\w][_-\\w\\d]*)\\s*(?:(=|\\^=|\\$=|\\*=|\\~=|\\|=)\\s*(?:([_-\\w][_-\\w\\d]*)|"((?:[^\\\\"]|\\\\(?:"|n|r|f|\\\\|0-9a-f))*)"|\'((?:[^\\\\\']|\\\\(?:\'|n|r|f|\\\\|0-9a-f))*)\')\\s*)?\\]',
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
  const { result, regexp } = execRegExp('simpleIdentifierSelectorRegEx', text, start);
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
  return parseUniversalSelector(text, start)
    || parseSimpleIdentifierSelector(text, start)
    || parseAttributeSelector(text, start);
}

function parseSimpleSelectorSequence(text, start) {
  let simpleSelector = parseSimpleSelector(text, start);
  if (!simpleSelector) {
    return null;
  }
  let { end } = simpleSelector;
  const value = [];
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

function parseSelectorWithRegExpGY(text, start) {
  let end = start;
  const { result, regexp } = execRegExp('whiteSpaceRegEx', text, start);
  if (result) {
    end = regexp.lastIndex;
  }
  const value = [];
  let combinator;
  let expectSimpleSelector = true;
  let pair = [];
  do {
    const simpleSelectorSequence = parseSimpleSelectorSequence(text, end);
    if (!simpleSelectorSequence) {
      if (expectSimpleSelector) {
        return null;
      } else {
        break;
      }
    }
    ({ end } = simpleSelectorSequence);
    if (combinator) {
      pair[1] = combinator.value;
    }
    pair = [simpleSelectorSequence.value, undefined];
    value.push(pair);

    combinator = parseCombinator(text, end);
    if (combinator) {
      ({ end } = combinator);
    }
    expectSimpleSelector = combinator && combinator.value !== ' ';
  } while (combinator);
  return {
    start,
    end,
    value,
  };
}

function parseSelectorWithoutRegExpGY(cssText, start) {
  let end = start;
  const { result, regexp } = execRegExp('whiteSpaceRegEx', cssText, start);
  if (result) {
    end = regexp.lastIndex;
  }
  const value = [];
  let combinator;
  let expectSimpleSelector = true;
  let pair = [];
  cssText.split(' ').forEach((text) => {
    if (text === '') {
      return;
    }
    end = 0;
    do {
      const simpleSelectorSequence = parseSimpleSelectorSequence(text, end);
      if (!simpleSelectorSequence) {
        if (expectSimpleSelector) {
          return null;
        } else {
          break;
        }
      }
      ({ end } = simpleSelectorSequence);
      if (combinator) {
        pair[1] = combinator.value;
      }
      pair = [simpleSelectorSequence.value, undefined];
      value.push(pair);

      combinator = parseCombinator(text, end);
      if (combinator) {
        ({ end } = combinator);
      }
      expectSimpleSelector = combinator && combinator.value !== ' ';
    } while (combinator);
  });
  return {
    start,
    end,
    value,
  };
}

let parseSelector;
if (REGEXP_SUPPORTING_STICKY_FLAG) {
  parseSelector = parseSelectorWithRegExpGY;
} else {
  parseSelector = parseSelectorWithoutRegExpGY;
}

export default parseSelector;
