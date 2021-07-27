// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
const globalValues = new Set(['inherit', 'initial', 'unset']);
const tagRegexp = /[\x20-\x7E]{4}/;
const numRegexp = /[+-]?(?:\d*\.)?\d+(?:[eE]\d+)?/;
const fontVariationSettingsRegexp = new RegExp(`(?:'(${tagRegexp.source})')|(?:"(${tagRegexp.source})")\\s+(${numRegexp.source})`);
/**
 * Extracts information about font variation settings assuming
 * value is valid according to the spec: https://drafts.csswg.org/css-fonts-4/#font-variation-settings-def
 */
export function parseFontVariationSettings(value) {
    if (globalValues.has(value.trim()) || value.trim() === 'normal') {
        return [];
    }
    const results = [];
    for (const setting of splitByComma(stripComments(value))) {
        const match = setting.match(fontVariationSettingsRegexp);
        if (match) {
            results.push({
                tag: match[1] || match[2],
                value: parseFloat(match[3]),
            });
        }
    }
    return results;
}
// "str" or 'str'
const fontFamilyRegexp = /^"(.+)"|'(.+)'$/;
/**
 * Extracts font families assuming the value is valid according to
 * the spec: https://drafts.csswg.org/css-fonts-4/#font-family-prop
 */
export function parseFontFamily(value) {
    if (globalValues.has(value.trim())) {
        return [];
    }
    const results = [];
    for (const family of splitByComma(stripComments(value))) {
        const match = family.match(fontFamilyRegexp);
        if (match) {
            // Either the 1st or 2nd group matches if the value is in quotes
            results.push(match[1] || match[2]);
        }
        else {
            // Value without without quotes.
            results.push(family);
        }
    }
    return results;
}
/**
 * Splits a list of values by comma and trims parts
 */
export function splitByComma(value) {
    return value.split(',').map(part => part.trim());
}
export function stripComments(value) {
    return value.replaceAll(/(\/\*(?:.|\s)*?\*\/)/g, '');
}
//# sourceMappingURL=CSSPropertyParser.js.map