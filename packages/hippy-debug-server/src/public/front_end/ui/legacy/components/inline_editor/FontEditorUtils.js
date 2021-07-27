// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../../../core/sdk/sdk.js';
import * as CssOverviewModule from '../../../../panels/css_overview/css_overview.js';
// The following regexes are used within in the StylesSidebarPropertyRenderer class
// and will parse both invalid and valid values.
// ^[^- ][a-zA-Z-]+ matches property key values (e.g. smaller, x-large, initial)
// -?\+?(?:[0-9]+\.[0-9]+|\.[0-9]+|[0-9]+) matches numeric property values (e.g. -.23, 3.3, 55)
// [a-zA-Z%]{0,4} matches the units of numeric property values (e.g. px, vmin, or blank units)
export const FontPropertiesRegex = /^[^- ][a-zA-Z-]+|-?\+?(?:[0-9]+\.[0-9]+|\.[0-9]+|[0-9]+)[a-zA-Z%]{0,4}/;
// "[\w \,-]+",? ? matches double quoted values and the trailing comma/space (e.g. "Tahoma", )
// ('[\w \,-]+',? ?) matches single quoted values and the trailing comma/space (e.g. 'Segoe UI', )
// ([\w \,-]+,? ?) matches non quoted values and the trailing comma/space (e.g. Helvetica)
// (?: ...)+ will match 1 or more of the groups above such that it would match a value with fallbacks (e.g. "Tahoma", 'Segoe UI', Helvetica)
export const FontFamilyRegex = /(?:"[\w \,-]+",? ?|'[\w \,-]+',? ?|[\w \,-]+,? ?)+/;
// The following regexes are used within the Font Editor and will only parse valid property values.
// Example Input/Outputs:
// font-size: "20px" -> (20)(px)
// line-height: "0.5em" -> (0.5)(em)
// font-weight: "300" -> (300);
// letter-spacing: -.625rem -> (-.625)(rem)
const fontSizeRegex = /(^[\+\d\.]+)([a-zA-Z%]+)/;
const lineHeightRegex = /(^[\+\d\.]+)([a-zA-Z%]*)/;
const fontWeightRegex = /(^[\+\d\.]+)/;
const letterSpacingRegex = /([\+-0-9\.]+)([a-zA-Z%]+)/;
const fontSizeUnits = new Set(['px', 'em', 'rem', '%', 'vh', 'vw']);
const lineHeightUnits = new Set(['', 'px', 'em', '%']);
const letterSpacingUnits = new Set(['em', 'rem', 'px']);
const fontSizeKeyValuesArray = [
    '',
    'xx-small',
    'x-small',
    'smaller',
    'small',
    'medium',
    'large',
    'larger',
    'x-large',
    'xx-large',
];
const lineHeightKeyValuesArray = ['', 'normal'];
const fontWeightKeyValuesArray = ['', 'lighter', 'normal', 'bold', 'bolder'];
const letterSpacingKeyValuesArray = ['', 'normal'];
export const GlobalValues = ['inherit', 'initial', 'unset'];
fontSizeKeyValuesArray.push(...GlobalValues);
lineHeightKeyValuesArray.push(...GlobalValues);
fontWeightKeyValuesArray.push(...GlobalValues);
letterSpacingKeyValuesArray.push(...GlobalValues);
const fontSizeKeyValues = new Set(fontSizeKeyValuesArray);
const lineHeightKeyValues = new Set(lineHeightKeyValuesArray);
const fontWeightKeyValues = new Set(fontWeightKeyValuesArray);
const letterSpacingKeyValues = new Set(letterSpacingKeyValuesArray);
const fontSizeRangeMap = new Map([
    // Common Units
    ['px', { min: 0, max: 72, step: 1 }],
    ['em', { min: 0, max: 4.5, step: .1 }],
    ['rem', { min: 0, max: 4.5, step: .1 }],
    ['%', { min: 0, max: 450, step: 1 }],
    ['vh', { min: 0, max: 10, step: .1 }],
    ['vw', { min: 0, max: 10, step: .1 }],
    // Extra Units
    ['vmin', { min: 0, max: 10, step: .1 }],
    ['vmax', { min: 0, max: 10, step: .1 }],
    ['cm', { min: 0, max: 2, step: .1 }],
    ['mm', { min: 0, max: 20, step: .1 }],
    ['in', { min: 0, max: 1, step: .01 }],
    ['pt', { min: 0, max: 54, step: 1 }],
    ['pc', { min: 0, max: 4.5, step: .1 }],
]);
const lineHeightRangeMap = new Map([
    // Common Units
    ['', { min: 0, max: 2, step: .1 }],
    ['em', { min: 0, max: 2, step: .1 }],
    ['%', { min: 0, max: 200, step: 1 }],
    ['px', { min: 0, max: 32, step: 1 }],
    // Extra Units
    ['rem', { min: 0, max: 2, step: .1 }],
    ['vh', { min: 0, max: 4.5, step: .1 }],
    ['vw', { min: 0, max: 4.5, step: .1 }],
    ['vmin', { min: 0, max: 4.5, step: .1 }],
    ['vmax', { min: 0, max: 4.5, step: .1 }],
    ['cm', { min: 0, max: 1, step: .1 }],
    ['mm', { min: 0, max: 8.5, step: .1 }],
    ['in', { min: 0, max: .5, step: .1 }],
    ['pt', { min: 0, max: 24, step: 1 }],
    ['pc', { min: 0, max: 2, step: .1 }],
]);
const fontWeightRangeMap = new Map([
    ['', { min: 100, max: 700, step: 100 }],
]);
const letterSpacingRangeMap = new Map([
    // Common Units
    ['px', { min: -10, max: 10, step: .01 }],
    ['em', { min: -0.625, max: 0.625, step: .001 }],
    ['rem', { min: -0.625, max: 0.625, step: .001 }],
    // Extra Units
    ['%', { min: -62.5, max: 62.5, step: .1 }],
    ['vh', { min: -1.5, max: 1.5, step: .01 }],
    ['vw', { min: -1.5, max: 1.5, step: .01 }],
    ['vmin', { min: -1.5, max: 1.5, step: .01 }],
    ['vmax', { min: -1.5, max: 1.5, step: .01 }],
    ['cm', { min: -0.25, max: .025, step: .001 }],
    ['mm', { min: -2.5, max: 2.5, step: .01 }],
    ['in', { min: -0.1, max: 0.1, step: .001 }],
    ['pt', { min: -7.5, max: 7.5, step: .01 }],
    ['pc', { min: -0.625, max: 0.625, step: .001 }],
]);
export const FontSizeStaticParams = {
    regex: fontSizeRegex,
    units: fontSizeUnits,
    keyValues: fontSizeKeyValues,
    rangeMap: fontSizeRangeMap,
    defaultUnit: 'px',
};
export const LineHeightStaticParams = {
    regex: lineHeightRegex,
    units: lineHeightUnits,
    keyValues: lineHeightKeyValues,
    rangeMap: lineHeightRangeMap,
    defaultUnit: '',
};
export const FontWeightStaticParams = {
    regex: fontWeightRegex,
    units: null,
    keyValues: fontWeightKeyValues,
    rangeMap: fontWeightRangeMap,
    defaultUnit: null,
};
export const LetterSpacingStaticParams = {
    regex: letterSpacingRegex,
    units: letterSpacingUnits,
    keyValues: letterSpacingKeyValues,
    rangeMap: letterSpacingRangeMap,
    defaultUnit: 'em',
};
export const SystemFonts = [
    'Arial',
    'Bookman',
    'Candara',
    'Comic Sans MS',
    'Courier New',
    'Garamond',
    'Georgia',
    'Helvetica',
    'Impact',
    'Palatino',
    'Roboto',
    'Times New Roman',
    'Verdana',
];
export const GenericFonts = [
    'serif',
    'sans-serif',
    'monspace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-serif',
    'ui-sans-serif',
    'ui-monospace',
    'ui-rounded',
    'emoji',
    'math',
    'fangsong',
];
export async function generateComputedFontArray() {
    const modelArray = SDK.TargetManager.TargetManager.instance().models(CssOverviewModule.CSSOverviewModel.CSSOverviewModel);
    if (modelArray) {
        const cssOverviewModel = modelArray[0];
        if (cssOverviewModel) {
            const { fontInfo } = await cssOverviewModel.getNodeStyleStats();
            const computedFontArray = Array.from(fontInfo.keys());
            return computedFontArray;
        }
    }
    return [];
}
export function getRoundingPrecision(step) {
    switch (step) {
        case 1:
            return 0;
        case .1:
            return 1;
        case .01:
            return 2;
        case .001:
            return 3;
        default:
            return 0;
    }
}
//# sourceMappingURL=FontEditorUtils.js.map