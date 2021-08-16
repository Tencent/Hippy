// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
export const DefaultCategoryOrder = [
    "Layout" /* Layout */,
    "Text" /* Text */,
    "Appearance" /* Appearance */,
    "Animation" /* Animation */,
    "CSS Variables" /* CSSVariables */,
    "Grid" /* Grid */,
    "Flex" /* Flex */,
    "Table" /* Table */,
    "Generated Content" /* GeneratedContent */,
    "Other" /* Other */,
];
// These categories are manually updated for now. In the future
// we can try to find a way to automatically categorize them
// or find an authoritative source for the categorization:
// https://crbug.com/1117405
const CategorizedProperties = new Map([
    [
        "Layout" /* Layout */,
        [
            'display', 'margin', 'padding', 'height', 'width', 'position',
            'top', 'right', 'bottom', 'left', 'z-index', 'float',
            'clear', 'overflow', 'resize', 'clip', 'visibility', 'box-sizing',
            'align-content', 'align-items', 'align-self', 'flex', 'flex-basis', 'flex-direction',
            'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap', 'justify-content', 'order',
            'inline-size', 'block-size', 'min-inline-size', 'min-block-size', 'max-inline-size', 'max-block-size',
            'min-width', 'max-width', 'min-height', 'max-height',
        ],
    ],
    [
        "Text" /* Text */,
        [
            'font',
            'font-family',
            'font-size',
            'font-size-adjust',
            'font-stretch',
            'font-style',
            'font-variant',
            'font-weight',
            'font-smoothing',
            'direction',
            'tab-size',
            'text-align',
            'text-align-last',
            'text-decoration',
            'text-decoration-color',
            'text-decoration-line',
            'text-decoration-style',
            'text-indent',
            'text-justify',
            'text-overflow',
            'text-shadow',
            'text-transform',
            'text-size-adjust',
            'line-height',
            'vertical-align',
            'letter-spacing',
            'word-spacing',
            'white-space',
            'word-break',
            'word-wrap',
        ],
    ],
    [
        "Appearance" /* Appearance */,
        [
            'color',
            'outline',
            'outline-color',
            'outline-offset',
            'outline-style',
            'Outline-width',
            'border',
            'border-image',
            'background',
            'cursor',
            'box-shadow',
            '≈',
            'tap-highlight-color',
        ],
    ],
    [
        "Animation" /* Animation */,
        [
            'animation',
            'animation-delay',
            'animation-direction',
            'animation-duration',
            'animation-fill-mode',
            'animation-iteration-count',
            'animation-name',
            'animation-play-state',
            'animation-timing-function',
            'transition',
            'transition-delay',
            'transition-duration',
            'transition-property',
            'transition-timing-function',
        ],
    ],
    [
        "Grid" /* Grid */,
        [
            'grid',
            'grid-column',
            'grid-row',
            'order',
            'place-items',
            'place-content',
            'place-self',
        ],
    ],
    [
        "Flex" /* Flex */,
        [
            'flex',
            'order',
            'place-items',
            'place-content',
            'place-self',
        ],
    ],
    [
        "Table" /* Table */,
        [
            'border-collapse',
            'border-spacing',
            'caption-side',
            'empty-cells',
            'table-layout',
        ],
    ],
    [
        "Generated Content" /* GeneratedContent */,
        [
            'content',
            'quotes',
            'counter-reset',
            'counter-increment',
        ],
    ],
]);
const CategoriesByPropertyName = new Map();
for (const [category, styleNames] of CategorizedProperties) {
    for (const styleName of styleNames) {
        if (!CategoriesByPropertyName.has(styleName)) {
            CategoriesByPropertyName.set(styleName, []);
        }
        const categories = CategoriesByPropertyName.get(styleName);
        categories.push(category);
    }
}
const matchCategoriesByPropertyName = (propertyName) => {
    if (CategoriesByPropertyName.has(propertyName)) {
        return CategoriesByPropertyName.get(propertyName);
    }
    if (propertyName.startsWith('--')) {
        return ["CSS Variables" /* CSSVariables */];
    }
    return [];
};
/**
 * Categorize a given property name to one or more categories.
 *
 * It matches against the static CategoriesByPropertyName first. It then
 * matches against several dynamic rules. It then tries to use the canonical
 * name's shorthands for matching. If nothing matches, it returns the "Other"
 * category.
 */
export const categorizePropertyName = (propertyName) => {
    const cssMetadata = SDK.CSSMetadata.cssMetadata();
    const canonicalName = cssMetadata.canonicalPropertyName(propertyName);
    const categories = matchCategoriesByPropertyName(canonicalName);
    if (categories.length > 0) {
        return categories;
    }
    const shorthands = cssMetadata.shorthands(canonicalName);
    if (shorthands) {
        for (const shorthand of shorthands) {
            const shorthandCategories = matchCategoriesByPropertyName(shorthand);
            if (shorthandCategories.length > 0) {
                return shorthandCategories;
            }
        }
    }
    return ["Other" /* Other */];
};
//# sourceMappingURL=PropertyNameCategories.js.map