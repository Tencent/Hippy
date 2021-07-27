// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @fileoverview using private properties isn't a Closure violation in tests.
 */
self.ElementsTestRunner = self.ElementsTestRunner || {};

function flattenRuleRanges(rule) {
  const ranges = [];
  const medias = rule.media || [];

  for (let i = 0; i < medias.length; ++i) {
    const media = medias[i];

    if (!media.range) {
      continue;
    }

    ranges.push({range: media.range, name: 'media #' + i});
  }

  for (let i = 0; i < rule.selectors.length; ++i) {
    const selector = rule.selectors[i];

    if (!selector.range) {
      continue;
    }

    ranges.push({range: selector.range, name: 'selector #' + i});
  }

  if (rule.style.range) {
    ranges.push({range: rule.style.range, name: 'style range'});
  }


  const properties = rule.style.allProperties();

  for (let i = 0; i < properties.length; ++i) {
    const property = properties[i];

    if (!property.range) {
      continue;
    }

    ranges.push({range: property.range, name: 'property >>' + property.text + '<<'});
  }

  return ranges;
}

function compareRuleRanges(lazyRule, originalRule) {
  if (lazyRule.selectorText !== originalRule.selectorText) {
    TestRunner.addResult(
        'Error: rule selectors are not equal: ' + lazyRule.selectorText + ' != ' + originalRule.selectorText);
    return false;
  }

  const flattenLazy = flattenRuleRanges(lazyRule);
  const flattenOriginal = flattenRuleRanges(originalRule);

  if (flattenLazy.length !== flattenOriginal.length) {
    TestRunner.addResult(
        'Error: rule range amount is not equal: ' + flattenLazy.length + ' != ' + flattenOriginal.length);
    return false;
  }

  for (let i = 0; i < flattenLazy.length; ++i) {
    const lazyRange = flattenLazy[i];
    const originalRange = flattenOriginal[i];

    if (lazyRange.name !== originalRange.name) {
      TestRunner.addResult('Error: rule names are not equal: ' + lazyRange.name + ' != ' + originalRange.name);
      return false;
    }

    if (!lazyRange.range.equal(originalRange.range)) {
      TestRunner.addResult(
          'Error: ranges \'' + lazyRange.name + '\' are not equal: ' + lazyRange.range.toString() +
          ' != ' + originalRange.range.toString());

      return false;
    }
  }

  TestRunner.addResult(flattenLazy.length + ' rule ranges are equal.');
  return true;
}

ElementsTestRunner.validateRuleRanges = function(selector, rules, callback) {
  ElementsTestRunner.selectNodeAndWaitForStyles('other', onOtherSelected);

  function onOtherSelected() {
    ElementsTestRunner.selectNodeAndWaitForStyles(selector, onContainerSelected);
  }

  function onContainerSelected() {
    const fetchedRules = ElementsTestRunner.getMatchedRules();

    if (fetchedRules.length !== rules.length) {
      TestRunner.addResult(String.sprintf(
          'Error: rules sizes are not equal! Expected: %d, actual: %d', fetchedRules.length, rules.length));
      TestRunner.completeTest();
      return;
    }

    for (let i = 0; i < fetchedRules.length; ++i) {
      if (!compareRuleRanges(rules[i], fetchedRules[i])) {
        TestRunner.completeTest();
        return;
      }
    }

    callback();
  }
};

ElementsTestRunner.getMatchedRules = function() {
  const rules = [];

  for (const block of UI.panels.elements._stylesWidget._sectionBlocks) {
    for (const section of block.sections) {
      const rule = section.style().parentRule;

      if (rule) {
        rules.push(rule);
      }
    }
  }

  return rules;
};
