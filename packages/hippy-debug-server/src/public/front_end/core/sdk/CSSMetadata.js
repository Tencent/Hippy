/*
 * Copyright (C) 2010 Nikita Vasilyev. All rights reserved.
 * Copyright (C) 2010 Joseph Pecoraro. All rights reserved.
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as SupportedCSSProperties from '../../generated/SupportedCSSProperties.js';
import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
export class CSSMetadata {
    _values;
    _longhands;
    _shorthands;
    _inherited;
    _svgProperties;
    _propertyValues;
    _aliasesFor;
    _valuesSet;
    _nameValuePresets;
    _nameValuePresetsIncludingSVG;
    constructor(properties, aliasesFor) {
        this._values = [];
        this._longhands = new Map();
        this._shorthands = new Map();
        this._inherited = new Set();
        this._svgProperties = new Set();
        this._propertyValues = new Map();
        this._aliasesFor = aliasesFor;
        for (let i = 0; i < properties.length; ++i) {
            const property = properties[i];
            const propertyName = property.name;
            if (!CSS.supports(propertyName, 'initial')) {
                continue;
            }
            this._values.push(propertyName);
            if (property.inherited) {
                this._inherited.add(propertyName);
            }
            if (property.svg) {
                this._svgProperties.add(propertyName);
            }
            const longhands = properties[i].longhands;
            if (longhands) {
                this._longhands.set(propertyName, longhands);
                for (let j = 0; j < longhands.length; ++j) {
                    const longhandName = longhands[j];
                    let shorthands = this._shorthands.get(longhandName);
                    if (!shorthands) {
                        shorthands = [];
                        this._shorthands.set(longhandName, shorthands);
                    }
                    shorthands.push(propertyName);
                }
            }
        }
        this._values.sort(CSSMetadata._sortPrefixesToEnd);
        this._valuesSet = new Set(this._values);
        // Reads in auto-generated property names and values from blink/public/renderer/core/css/css_properties.json5
        // treats _generatedPropertyValues as basis
        const propertyValueSets = new Map();
        for (const [propertyName, basisValueObj] of Object.entries(SupportedCSSProperties.generatedPropertyValues)) {
            propertyValueSets.set(propertyName, new Set(basisValueObj.values));
        }
        // and add manually maintained map of extra prop-value pairs
        for (const [propertyName, extraValueObj] of Object.entries(_extraPropertyValues)) {
            if (propertyValueSets.has(propertyName)) {
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                Platform.SetUtilities.addAll(propertyValueSets.get(propertyName), extraValueObj.values);
            }
            else {
                propertyValueSets.set(propertyName, new Set(extraValueObj.values));
            }
        }
        // finally add common keywords to value sets and convert property values
        // into arrays since callers expect arrays
        for (const [propertyName, values] of propertyValueSets) {
            for (const commonKeyword of CommonKeywords) {
                if (!values.has(commonKeyword) && CSS.supports(propertyName, commonKeyword)) {
                    values.add(commonKeyword);
                }
            }
            this._propertyValues.set(propertyName, [...values]);
        }
        this._nameValuePresets = [];
        this._nameValuePresetsIncludingSVG = [];
        for (const name of this._valuesSet) {
            const values = this._specificPropertyValues(name)
                .filter(value => CSS.supports(name, value))
                .sort(CSSMetadata._sortPrefixesToEnd);
            const presets = values.map(value => `${name}: ${value}`);
            if (!this.isSVGProperty(name)) {
                this._nameValuePresets.push(...presets);
            }
            this._nameValuePresetsIncludingSVG.push(...presets);
        }
    }
    static _sortPrefixesToEnd(a, b) {
        const aIsPrefixed = a.startsWith('-webkit-');
        const bIsPrefixed = b.startsWith('-webkit-');
        if (aIsPrefixed && !bIsPrefixed) {
            return 1;
        }
        if (!aIsPrefixed && bIsPrefixed) {
            return -1;
        }
        return a < b ? -1 : (a > b ? 1 : 0);
    }
    allProperties() {
        return this._values;
    }
    nameValuePresets(includeSVG) {
        return includeSVG ? this._nameValuePresetsIncludingSVG : this._nameValuePresets;
    }
    isSVGProperty(name) {
        name = name.toLowerCase();
        return this._svgProperties.has(name);
    }
    longhands(shorthand) {
        return this._longhands.get(shorthand) || null;
    }
    shorthands(longhand) {
        return this._shorthands.get(longhand) || null;
    }
    isColorAwareProperty(propertyName) {
        return _colorAwareProperties.has(propertyName.toLowerCase()) || this.isCustomProperty(propertyName.toLowerCase());
    }
    isFontFamilyProperty(propertyName) {
        return propertyName.toLowerCase() === 'font-family';
    }
    isAngleAwareProperty(propertyName) {
        const lowerCasedName = propertyName.toLowerCase();
        // TODO: @Yisi, parse hsl(), hsla(), hwb() and lch()
        // See also https://drafts.csswg.org/css-color/#hue-syntax
        return _colorAwareProperties.has(lowerCasedName) || _angleAwareProperties.has(lowerCasedName);
    }
    isGridAreaDefiningProperty(propertyName) {
        propertyName = propertyName.toLowerCase();
        return propertyName === 'grid' || propertyName === 'grid-template' || propertyName === 'grid-template-areas';
    }
    isLengthProperty(propertyName) {
        propertyName = propertyName.toLowerCase();
        if (propertyName === 'line-height') {
            return false;
        }
        return _distanceProperties.has(propertyName) || propertyName.startsWith('margin') ||
            propertyName.startsWith('padding') || propertyName.indexOf('width') !== -1 ||
            propertyName.indexOf('height') !== -1;
    }
    isBezierAwareProperty(propertyName) {
        propertyName = propertyName.toLowerCase();
        return _bezierAwareProperties.has(propertyName) || this.isCustomProperty(propertyName);
    }
    isFontAwareProperty(propertyName) {
        propertyName = propertyName.toLowerCase();
        return _fontAwareProperties.has(propertyName) || this.isCustomProperty(propertyName);
    }
    isCustomProperty(propertyName) {
        return propertyName.startsWith('--');
    }
    isShadowProperty(propertyName) {
        propertyName = propertyName.toLowerCase();
        return propertyName === 'box-shadow' || propertyName === 'text-shadow' || propertyName === '-webkit-box-shadow';
    }
    isStringProperty(propertyName) {
        propertyName = propertyName.toLowerCase();
        // TODO(crbug.com/1033910): Generalize this to all CSS properties
        // that accept <string> values.
        return propertyName === 'content';
    }
    canonicalPropertyName(name) {
        if (this.isCustomProperty(name)) {
            return name;
        }
        name = name.toLowerCase();
        const aliasFor = this._aliasesFor.get(name);
        if (aliasFor) {
            return aliasFor;
        }
        if (!name || name.length < 9 || name.charAt(0) !== '-') {
            return name;
        }
        const match = name.match(/(?:-webkit-)(.+)/);
        if (!match || !this._valuesSet.has(match[1])) {
            return name;
        }
        return match[1];
    }
    isCSSPropertyName(propertyName) {
        propertyName = propertyName.toLowerCase();
        if ((propertyName.startsWith('--') && propertyName.length > 2) || propertyName.startsWith('-moz-') ||
            propertyName.startsWith('-ms-') || propertyName.startsWith('-o-') || propertyName.startsWith('-webkit-')) {
            return true;
        }
        return this._valuesSet.has(propertyName);
    }
    isPropertyInherited(propertyName) {
        propertyName = propertyName.toLowerCase();
        return propertyName.startsWith('--') || this._inherited.has(this.canonicalPropertyName(propertyName)) ||
            this._inherited.has(propertyName);
    }
    _specificPropertyValues(propertyName) {
        const unprefixedName = propertyName.replace(/^-webkit-/, '');
        const propertyValues = this._propertyValues;
        // _propertyValues acts like cache; missing properties are added with possible common keywords
        let keywords = propertyValues.get(propertyName) || propertyValues.get(unprefixedName);
        if (!keywords) {
            keywords = [];
            for (const commonKeyword of CommonKeywords) {
                if (CSS.supports(propertyName, commonKeyword)) {
                    keywords.push(commonKeyword);
                }
            }
            propertyValues.set(propertyName, keywords);
        }
        return keywords;
    }
    propertyValues(propertyName) {
        const acceptedKeywords = ['inherit', 'initial', 'revert', 'unset'];
        propertyName = propertyName.toLowerCase();
        acceptedKeywords.push(...this._specificPropertyValues(propertyName));
        if (this.isColorAwareProperty(propertyName)) {
            acceptedKeywords.push('currentColor');
            for (const color in Common.Color.Nicknames) {
                acceptedKeywords.push(color);
            }
        }
        return acceptedKeywords.sort(CSSMetadata._sortPrefixesToEnd);
    }
    propertyUsageWeight(property) {
        return Weight.get(property) || Weight.get(this.canonicalPropertyName(property)) || 0;
    }
    getValuePreset(key, value) {
        const values = _valuePresets.get(key);
        let text = values ? values.get(value) : null;
        if (!text) {
            return null;
        }
        let startColumn = text.length;
        let endColumn = text.length;
        if (text) {
            startColumn = text.indexOf('|');
            endColumn = text.lastIndexOf('|');
            endColumn = startColumn === endColumn ? endColumn : endColumn - 1;
            text = text.replace(/\|/g, '');
        }
        return { text, startColumn, endColumn };
    }
}
export const VariableRegex = /(var\(\s*--.*?\))/g;
export const CustomVariableRegex = /(var\(*--[\w\d]+-([\w]+-[\w]+)\))/g;
export const URLRegex = /url\(\s*('.+?'|".+?"|[^)]+)\s*\)/g;
/**
 * Matches an instance of a grid area 'row' definition.
 * 'grid-template-areas', e.g.
 *    "a a ."
 *
 * 'grid', 'grid-template', e.g.
 *    [track-name] "a a ." minmax(50px, auto) [track-name]
 */
export const GridAreaRowRegex = /((?:\[[\w\- ]+\]\s*)*(?:"[^"]+"|'[^']+'))[^'"\[]*\[?[^'"\[]*/;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _instance = null;
export function cssMetadata() {
    if (!_instance) {
        const supportedProperties = SupportedCSSProperties.generatedProperties;
        _instance = new CSSMetadata(supportedProperties, SupportedCSSProperties.generatedAliasesFor);
    }
    return _instance;
}
/**
 * The pipe character '|' indicates where text selection should be set.
 */
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _imageValuePresetMap = new Map([
    ['linear-gradient', 'linear-gradient(|45deg, black, transparent|)'],
    ['radial-gradient', 'radial-gradient(|black, transparent|)'],
    ['repeating-linear-gradient', 'repeating-linear-gradient(|45deg, black, transparent 100px|)'],
    ['repeating-radial-gradient', 'repeating-radial-gradient(|black, transparent 100px|)'],
    ['url', 'url(||)'],
]);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _filterValuePresetMap = new Map([
    ['blur', 'blur(|1px|)'],
    ['brightness', 'brightness(|0.5|)'],
    ['contrast', 'contrast(|0.5|)'],
    ['drop-shadow', 'drop-shadow(|2px 4px 6px black|)'],
    ['grayscale', 'grayscale(|1|)'],
    ['hue-rotate', 'hue-rotate(|45deg|)'],
    ['invert', 'invert(|1|)'],
    ['opacity', 'opacity(|0.5|)'],
    ['saturate', 'saturate(|0.5|)'],
    ['sepia', 'sepia(|1|)'],
    ['url', 'url(||)'],
]);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _valuePresets = new Map([
    ['filter', _filterValuePresetMap],
    ['backdrop-filter', _filterValuePresetMap],
    ['background', _imageValuePresetMap],
    ['background-image', _imageValuePresetMap],
    ['-webkit-mask-image', _imageValuePresetMap],
    [
        'transform',
        new Map([
            ['scale', 'scale(|1.5|)'],
            ['scaleX', 'scaleX(|1.5|)'],
            ['scaleY', 'scaleY(|1.5|)'],
            ['scale3d', 'scale3d(|1.5, 1.5, 1.5|)'],
            ['rotate', 'rotate(|45deg|)'],
            ['rotateX', 'rotateX(|45deg|)'],
            ['rotateY', 'rotateY(|45deg|)'],
            ['rotateZ', 'rotateZ(|45deg|)'],
            ['rotate3d', 'rotate3d(|1, 1, 1, 45deg|)'],
            ['skew', 'skew(|10deg, 10deg|)'],
            ['skewX', 'skewX(|10deg|)'],
            ['skewY', 'skewY(|10deg|)'],
            ['translate', 'translate(|10px, 10px|)'],
            ['translateX', 'translateX(|10px|)'],
            ['translateY', 'translateY(|10px|)'],
            ['translateZ', 'translateZ(|10px|)'],
            ['translate3d', 'translate3d(|10px, 10px, 10px|)'],
            ['matrix', 'matrix(|1, 0, 0, 1, 0, 0|)'],
            ['matrix3d', 'matrix3d(|1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1|)'],
            ['perspective', 'perspective(|10px|)'],
        ]),
    ],
]);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _distanceProperties = new Set([
    'background-position',
    'border-spacing',
    'bottom',
    'font-size',
    'height',
    'left',
    'letter-spacing',
    'max-height',
    'max-width',
    'min-height',
    'min-width',
    'right',
    'text-indent',
    'top',
    'width',
    'word-spacing',
    'grid-row-gap',
    'grid-column-gap',
    'row-gap',
]);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _bezierAwareProperties = new Set([
    'animation',
    'animation-timing-function',
    'transition',
    'transition-timing-function',
    '-webkit-animation',
    '-webkit-animation-timing-function',
    '-webkit-transition',
    '-webkit-transition-timing-function',
]);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _fontAwareProperties = new Set(['font-size', 'line-height', 'font-weight', 'font-family', 'letter-spacing']);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _colorAwareProperties = new Set([
    'accent-color',
    'background',
    'background-color',
    'background-image',
    'border',
    'border-color',
    'border-image',
    'border-image-source',
    'border-bottom',
    'border-bottom-color',
    'border-left',
    'border-left-color',
    'border-right',
    'border-right-color',
    'border-top',
    'border-top-color',
    'box-shadow',
    'caret-color',
    'color',
    'column-rule',
    'column-rule-color',
    'content',
    'fill',
    'list-style-image',
    'outline',
    'outline-color',
    'stroke',
    'text-decoration-color',
    'text-shadow',
    '-webkit-border-after',
    '-webkit-border-after-color',
    '-webkit-border-before',
    '-webkit-border-before-color',
    '-webkit-border-end',
    '-webkit-border-end-color',
    '-webkit-border-start',
    '-webkit-border-start-color',
    '-webkit-box-reflect',
    '-webkit-box-shadow',
    '-webkit-column-rule-color',
    '-webkit-mask',
    '-webkit-mask-box-image',
    '-webkit-mask-box-image-source',
    '-webkit-mask-image',
    '-webkit-tap-highlight-color',
    '-webkit-text-decoration-color',
    '-webkit-text-emphasis',
    '-webkit-text-emphasis-color',
    '-webkit-text-fill-color',
    '-webkit-text-stroke',
    '-webkit-text-stroke-color',
]);
// In addition to `_colorAwareProperties`, the following properties contain CSS <angle> units.
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _angleAwareProperties = new Set([
    '-webkit-border-image',
    'transform',
    '-webkit-transform',
    'rotate',
    'filter',
    '-webkit-filter',
    'backdrop-filter',
    'offset',
    'offset-rotate',
    'font-style',
]);
// manually maintained list of property values to add into autocomplete list
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _extraPropertyValues = {
    'background-repeat': { values: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'space', 'round'] },
    'content': { values: ['normal', 'close-quote', 'no-close-quote', 'no-open-quote', 'open-quote'] },
    'baseline-shift': { values: ['baseline'] },
    'max-height': { values: ['min-content', 'max-content', '-webkit-fill-available', 'fit-content'] },
    'color': { values: ['black'] },
    'background-color': { values: ['white'] },
    'box-shadow': { values: ['inset'] },
    'text-shadow': { values: ['0 0 black'] },
    '-webkit-writing-mode': { values: ['horizontal-tb', 'vertical-rl', 'vertical-lr'] },
    'writing-mode': { values: ['lr', 'rl', 'tb', 'lr-tb', 'rl-tb', 'tb-rl'] },
    'page-break-inside': { values: ['avoid'] },
    'cursor': { values: ['-webkit-zoom-in', '-webkit-zoom-out', '-webkit-grab', '-webkit-grabbing'] },
    'border-width': { values: ['medium', 'thick', 'thin'] },
    'border-style': { values: ['hidden', 'inset', 'groove', 'ridge', 'outset', 'dotted', 'dashed', 'solid', 'double'] },
    'size': { values: ['a3', 'a4', 'a5', 'b4', 'b5', 'landscape', 'ledger', 'legal', 'letter', 'portrait'] },
    'overflow': { values: ['hidden', 'visible', 'overlay', 'scroll'] },
    'overscroll-behavior': { values: ['contain'] },
    'text-rendering': { values: ['optimizeSpeed', 'optimizeLegibility', 'geometricPrecision'] },
    'text-align': { values: ['-webkit-auto', '-webkit-match-parent'] },
    'clip-path': { values: ['circle', 'ellipse', 'inset', 'polygon', 'url'] },
    'color-interpolation': { values: ['sRGB', 'linearRGB'] },
    'word-wrap': { values: ['normal', 'break-word'] },
    'font-weight': { values: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
    '-webkit-text-emphasis': { values: ['circle', 'filled', 'open', 'dot', 'double-circle', 'triangle', 'sesame'] },
    'color-rendering': { values: ['optimizeSpeed', 'optimizeQuality'] },
    '-webkit-text-combine': { values: ['horizontal'] },
    'text-orientation': { values: ['sideways-right'] },
    'outline': {
        values: ['inset', 'groove', 'ridge', 'outset', 'dotted', 'dashed', 'solid', 'double', 'medium', 'thick', 'thin'],
    },
    'font': {
        values: [
            'caption',
            'icon',
            'menu',
            'message-box',
            'small-caption',
            '-webkit-mini-control',
            '-webkit-small-control',
            '-webkit-control',
            'status-bar',
        ],
    },
    'dominant-baseline': { values: ['text-before-edge', 'text-after-edge', 'use-script', 'no-change', 'reset-size'] },
    '-webkit-text-emphasis-position': { values: ['over', 'under'] },
    'alignment-baseline': { values: ['before-edge', 'after-edge', 'text-before-edge', 'text-after-edge', 'hanging'] },
    'page-break-before': { values: ['left', 'right', 'always', 'avoid'] },
    'border-image': { values: ['repeat', 'stretch', 'space', 'round'] },
    'text-decoration': { values: ['blink', 'line-through', 'overline', 'underline', 'wavy', 'double', 'solid', 'dashed', 'dotted'] },
    // List taken from https://drafts.csswg.org/css-fonts-4/#generic-font-families
    'font-family': {
        values: [
            'serif',
            'sans-serif',
            'cursive',
            'fantasy',
            'monospace',
            'system-ui',
            'emoji',
            'math',
            'fangsong',
            'ui-serif',
            'ui-sans-serif',
            'ui-monospace',
            'ui-rounded',
            '-webkit-body',
            '-webkit-pictograph',
        ],
    },
    'zoom': { values: ['normal'] },
    'max-width': { values: ['min-content', 'max-content', '-webkit-fill-available', 'fit-content'] },
    '-webkit-font-smoothing': { values: ['antialiased', 'subpixel-antialiased'] },
    'border': {
        values: [
            'hidden',
            'inset',
            'groove',
            'ridge',
            'outset',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    'font-variant': {
        values: [
            'small-caps',
            'normal',
            'common-ligatures',
            'no-common-ligatures',
            'discretionary-ligatures',
            'no-discretionary-ligatures',
            'historical-ligatures',
            'no-historical-ligatures',
            'contextual',
            'no-contextual',
            'all-small-caps',
            'petite-caps',
            'all-petite-caps',
            'unicase',
            'titling-caps',
            'lining-nums',
            'oldstyle-nums',
            'proportional-nums',
            'tabular-nums',
            'diagonal-fractions',
            'stacked-fractions',
            'ordinal',
            'slashed-zero',
            'jis78',
            'jis83',
            'jis90',
            'jis04',
            'simplified',
            'traditional',
            'full-width',
            'proportional-width',
            'ruby',
        ],
    },
    'vertical-align': { values: ['top', 'bottom', '-webkit-baseline-middle'] },
    'page-break-after': { values: ['left', 'right', 'always', 'avoid'] },
    '-webkit-text-emphasis-style': { values: ['circle', 'filled', 'open', 'dot', 'double-circle', 'triangle', 'sesame'] },
    'transform': {
        values: [
            'scale', 'scaleX', 'scaleY', 'scale3d', 'rotate', 'rotateX', 'rotateY',
            'rotateZ', 'rotate3d', 'skew', 'skewX', 'skewY', 'translate', 'translateX',
            'translateY', 'translateZ', 'translate3d', 'matrix', 'matrix3d', 'perspective',
        ],
    },
    'align-content': {
        values: [
            'normal',
            'baseline',
            'space-between',
            'space-around',
            'space-evenly',
            'stretch',
            'center',
            'start',
            'end',
            'flex-start',
            'flex-end',
        ],
    },
    'justify-content': {
        values: [
            'normal',
            'space-between',
            'space-around',
            'space-evenly',
            'stretch',
            'center',
            'start',
            'end',
            'flex-start',
            'flex-end',
            'left',
            'right',
        ],
    },
    'place-content': {
        values: [
            'normal',
            'space-between',
            'space-around',
            'space-evenly',
            'stretch',
            'center',
            'start',
            'end',
            'flex-start',
            'flex-end',
            'baseline',
        ],
    },
    'align-items': {
        values: ['normal', 'stretch', 'baseline', 'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end'],
    },
    'justify-items': {
        values: [
            'normal',
            'stretch',
            'baseline',
            'center',
            'start',
            'end',
            'self-start',
            'self-end',
            'flex-start',
            'flex-end',
            'left',
            'right',
            'legacy',
        ],
    },
    'place-items': {
        values: ['normal', 'stretch', 'baseline', 'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end'],
    },
    'align-self': {
        values: ['normal', 'stretch', 'baseline', 'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end'],
    },
    'justify-self': {
        values: [
            'normal',
            'stretch',
            'baseline',
            'center',
            'start',
            'end',
            'self-start',
            'self-end',
            'flex-start',
            'flex-end',
            'left',
            'right',
        ],
    },
    'place-self': {
        values: ['normal', 'stretch', 'baseline', 'center', 'start', 'end', 'self-start', 'self-end', 'flex-start', 'flex-end'],
    },
    'perspective-origin': { values: ['left', 'center', 'right', 'top', 'bottom'] },
    'transform-origin': { values: ['left', 'center', 'right', 'top', 'bottom'] },
    'transition-timing-function': { values: ['cubic-bezier', 'steps'] },
    'animation-timing-function': { values: ['cubic-bezier', 'steps'] },
    '-webkit-backface-visibility': { values: ['visible', 'hidden'] },
    '-webkit-column-break-after': { values: ['always', 'avoid'] },
    '-webkit-column-break-before': { values: ['always', 'avoid'] },
    '-webkit-column-break-inside': { values: ['avoid'] },
    '-webkit-column-span': { values: ['all'] },
    '-webkit-column-gap': { values: ['normal'] },
    'filter': {
        values: [
            'url',
            'blur',
            'brightness',
            'contrast',
            'drop-shadow',
            'grayscale',
            'hue-rotate',
            'invert',
            'opacity',
            'saturate',
            'sepia',
        ],
    },
    'backdrop-filter': {
        values: [
            'url',
            'blur',
            'brightness',
            'contrast',
            'drop-shadow',
            'grayscale',
            'hue-rotate',
            'invert',
            'opacity',
            'saturate',
            'sepia',
        ],
    },
    'mix-blend-mode': { values: ['unset'] },
    'background-blend-mode': { values: ['unset'] },
    'grid-template-columns': { values: ['min-content', 'max-content'] },
    'grid-template-rows': { values: ['min-content', 'max-content'] },
    'grid-auto-flow': { values: ['dense'] },
    'background': {
        values: [
            'repeat',
            'repeat-x',
            'repeat-y',
            'no-repeat',
            'top',
            'bottom',
            'left',
            'right',
            'center',
            'fixed',
            'local',
            'scroll',
            'space',
            'round',
            'border-box',
            'content-box',
            'padding-box',
            'linear-gradient',
            'radial-gradient',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'url',
        ],
    },
    'background-image': { values: ['linear-gradient', 'radial-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient', 'url'] },
    'background-position': { values: ['top', 'bottom', 'left', 'right', 'center'] },
    'background-position-x': { values: ['left', 'right', 'center'] },
    'background-position-y': { values: ['top', 'bottom', 'center'] },
    'background-repeat-x': { values: ['repeat', 'no-repeat'] },
    'background-repeat-y': { values: ['repeat', 'no-repeat'] },
    'border-bottom': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    'border-left': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    'border-right': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    'border-top': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    'buffered-rendering': { values: ['static', 'dynamic'] },
    'color-interpolation-filters': { values: ['srgb', 'linearrgb'] },
    'column-rule': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    'flex-flow': { values: ['nowrap', 'row', 'row-reverse', 'column', 'column-reverse', 'wrap', 'wrap-reverse'] },
    'height': { values: ['-webkit-fill-available'] },
    'inline-size': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'list-style': {
        values: [
            'outside',
            'inside',
            'disc',
            'circle',
            'square',
            'decimal',
            'decimal-leading-zero',
            'arabic-indic',
            'bengali',
            'cambodian',
            'khmer',
            'devanagari',
            'gujarati',
            'gurmukhi',
            'kannada',
            'lao',
            'malayalam',
            'mongolian',
            'myanmar',
            'oriya',
            'persian',
            'urdu',
            'telugu',
            'tibetan',
            'thai',
            'lower-roman',
            'upper-roman',
            'lower-greek',
            'lower-alpha',
            'lower-latin',
            'upper-alpha',
            'upper-latin',
            'cjk-earthly-branch',
            'cjk-heavenly-stem',
            'ethiopic-halehame',
            'ethiopic-halehame-am',
            'ethiopic-halehame-ti-er',
            'ethiopic-halehame-ti-et',
            'hangul',
            'hangul-consonant',
            'korean-hangul-formal',
            'korean-hanja-formal',
            'korean-hanja-informal',
            'hebrew',
            'armenian',
            'lower-armenian',
            'upper-armenian',
            'georgian',
            'cjk-ideographic',
            'simp-chinese-formal',
            'simp-chinese-informal',
            'trad-chinese-formal',
            'trad-chinese-informal',
            'hiragana',
            'katakana',
            'hiragana-iroha',
            'katakana-iroha',
        ],
    },
    'max-block-size': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'max-inline-size': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'min-block-size': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'min-height': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'min-inline-size': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'min-width': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    'object-position': { values: ['top', 'bottom', 'left', 'right', 'center'] },
    'shape-outside': { values: ['border-box', 'content-box', 'padding-box', 'margin-box'] },
    '-webkit-appearance': {
        values: [
            'checkbox',
            'radio',
            'push-button',
            'square-button',
            'button',
            'inner-spin-button',
            'listbox',
            'media-slider',
            'media-sliderthumb',
            'media-volume-slider',
            'media-volume-sliderthumb',
            'menulist',
            'menulist-button',
            'meter',
            'progress-bar',
            'slider-horizontal',
            'slider-vertical',
            'sliderthumb-horizontal',
            'sliderthumb-vertical',
            'searchfield',
            'searchfield-cancel-button',
            'textfield',
            'textarea',
        ],
    },
    '-webkit-border-after': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    '-webkit-border-after-style': { values: ['hidden', 'inset', 'groove', 'outset', 'ridge', 'dotted', 'dashed', 'solid', 'double'] },
    '-webkit-border-after-width': { values: ['medium', 'thick', 'thin'] },
    '-webkit-border-before': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    '-webkit-border-before-style': { values: ['hidden', 'inset', 'groove', 'outset', 'ridge', 'dotted', 'dashed', 'solid', 'double'] },
    '-webkit-border-before-width': { values: ['medium', 'thick', 'thin'] },
    '-webkit-border-end': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    '-webkit-border-end-style': { values: ['hidden', 'inset', 'groove', 'outset', 'ridge', 'dotted', 'dashed', 'solid', 'double'] },
    '-webkit-border-end-width': { values: ['medium', 'thick', 'thin'] },
    '-webkit-border-start': {
        values: [
            'hidden',
            'inset',
            'groove',
            'outset',
            'ridge',
            'dotted',
            'dashed',
            'solid',
            'double',
            'medium',
            'thick',
            'thin',
        ],
    },
    '-webkit-border-start-style': { values: ['hidden', 'inset', 'groove', 'outset', 'ridge', 'dotted', 'dashed', 'solid', 'double'] },
    '-webkit-border-start-width': { values: ['medium', 'thick', 'thin'] },
    '-webkit-logical-height': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    '-webkit-logical-width': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    '-webkit-margin-collapse': { values: ['collapse', 'separate', 'discard'] },
    '-webkit-mask-box-image': { values: ['repeat', 'stretch', 'space', 'round'] },
    '-webkit-mask-box-image-repeat': { values: ['repeat', 'stretch', 'space', 'round'] },
    '-webkit-mask-clip': { values: ['text', 'border', 'border-box', 'content', 'content-box', 'padding', 'padding-box'] },
    '-webkit-mask-composite': {
        values: [
            'clear',
            'copy',
            'source-over',
            'source-in',
            'source-out',
            'source-atop',
            'destination-over',
            'destination-in',
            'destination-out',
            'destination-atop',
            'xor',
            'plus-lighter',
        ],
    },
    '-webkit-mask-image': { values: ['linear-gradient', 'radial-gradient', 'repeating-linear-gradient', 'repeating-radial-gradient', 'url'] },
    '-webkit-mask-origin': { values: ['border', 'border-box', 'content', 'content-box', 'padding', 'padding-box'] },
    '-webkit-mask-position': { values: ['top', 'bottom', 'left', 'right', 'center'] },
    '-webkit-mask-position-x': { values: ['left', 'right', 'center'] },
    '-webkit-mask-position-y': { values: ['top', 'bottom', 'center'] },
    '-webkit-mask-repeat': { values: ['repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'space', 'round'] },
    '-webkit-mask-size': { values: ['contain', 'cover'] },
    '-webkit-max-logical-height': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    '-webkit-max-logical-width': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    '-webkit-min-logical-height': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    '-webkit-min-logical-width': { values: ['-webkit-fill-available', 'min-content', 'max-content', 'fit-content'] },
    '-webkit-perspective-origin-x': { values: ['left', 'right', 'center'] },
    '-webkit-perspective-origin-y': { values: ['top', 'bottom', 'center'] },
    '-webkit-text-decorations-in-effect': { values: ['blink', 'line-through', 'overline', 'underline'] },
    '-webkit-text-stroke': { values: ['medium', 'thick', 'thin'] },
    '-webkit-text-stroke-width': { values: ['medium', 'thick', 'thin'] },
    '-webkit-transform-origin-x': { values: ['left', 'right', 'center'] },
    '-webkit-transform-origin-y': { values: ['top', 'bottom', 'center'] },
    'width': { values: ['-webkit-fill-available'] },
};
// Weight of CSS properties based on their usage from https://www.chromestatus.com/metrics/css/popularity
const Weight = new Map([
    ['align-content', 57],
    ['align-items', 129],
    ['align-self', 55],
    ['animation', 175],
    ['animation-delay', 114],
    ['animation-direction', 113],
    ['animation-duration', 137],
    ['animation-fill-mode', 132],
    ['animation-iteration-count', 124],
    ['animation-name', 139],
    ['animation-play-state', 104],
    ['animation-timing-function', 141],
    ['backface-visibility', 123],
    ['background', 260],
    ['background-attachment', 119],
    ['background-clip', 165],
    ['background-color', 259],
    ['background-image', 246],
    ['background-origin', 107],
    ['background-position', 237],
    ['background-position-x', 108],
    ['background-position-y', 93],
    ['background-repeat', 234],
    ['background-size', 203],
    ['border', 263],
    ['border-bottom', 233],
    ['border-bottom-color', 190],
    ['border-bottom-left-radius', 186],
    ['border-bottom-right-radius', 185],
    ['border-bottom-style', 150],
    ['border-bottom-width', 179],
    ['border-collapse', 209],
    ['border-color', 226],
    ['border-image', 89],
    ['border-image-outset', 50],
    ['border-image-repeat', 49],
    ['border-image-slice', 58],
    ['border-image-source', 32],
    ['border-image-width', 52],
    ['border-left', 221],
    ['border-left-color', 174],
    ['border-left-style', 142],
    ['border-left-width', 172],
    ['border-radius', 224],
    ['border-right', 223],
    ['border-right-color', 182],
    ['border-right-style', 130],
    ['border-right-width', 178],
    ['border-spacing', 198],
    ['border-style', 206],
    ['border-top', 231],
    ['border-top-color', 192],
    ['border-top-left-radius', 187],
    ['border-top-right-radius', 189],
    ['border-top-style', 152],
    ['border-top-width', 180],
    ['border-width', 214],
    ['bottom', 227],
    ['box-shadow', 213],
    ['box-sizing', 216],
    ['caption-side', 96],
    ['clear', 229],
    ['clip', 173],
    ['clip-rule', 5],
    ['color', 256],
    ['content', 219],
    ['counter-increment', 111],
    ['counter-reset', 110],
    ['cursor', 250],
    ['direction', 176],
    ['display', 262],
    ['empty-cells', 99],
    ['fill', 140],
    ['fill-opacity', 82],
    ['fill-rule', 22],
    ['filter', 160],
    ['flex', 133],
    ['flex-basis', 66],
    ['flex-direction', 85],
    ['flex-flow', 94],
    ['flex-grow', 112],
    ['flex-shrink', 61],
    ['flex-wrap', 68],
    ['float', 252],
    ['font', 211],
    ['font-family', 254],
    ['font-kerning', 18],
    ['font-size', 264],
    ['font-stretch', 77],
    ['font-style', 220],
    ['font-variant', 161],
    ['font-weight', 257],
    ['height', 266],
    ['image-rendering', 90],
    ['justify-content', 127],
    ['left', 248],
    ['letter-spacing', 188],
    ['line-height', 244],
    ['list-style', 215],
    ['list-style-image', 145],
    ['list-style-position', 149],
    ['list-style-type', 199],
    ['margin', 267],
    ['margin-bottom', 241],
    ['margin-left', 243],
    ['margin-right', 238],
    ['margin-top', 253],
    ['mask', 20],
    ['max-height', 205],
    ['max-width', 225],
    ['min-height', 217],
    ['min-width', 218],
    ['object-fit', 33],
    ['opacity', 251],
    ['order', 117],
    ['orphans', 146],
    ['outline', 222],
    ['outline-color', 153],
    ['outline-offset', 147],
    ['outline-style', 151],
    ['outline-width', 148],
    ['overflow', 255],
    ['overflow-wrap', 105],
    ['overflow-x', 184],
    ['overflow-y', 196],
    ['padding', 265],
    ['padding-bottom', 230],
    ['padding-left', 235],
    ['padding-right', 232],
    ['padding-top', 240],
    ['page', 8],
    ['page-break-after', 120],
    ['page-break-before', 69],
    ['page-break-inside', 121],
    ['perspective', 92],
    ['perspective-origin', 103],
    ['pointer-events', 183],
    ['position', 261],
    ['quotes', 158],
    ['resize', 168],
    ['right', 245],
    ['shape-rendering', 38],
    ['size', 64],
    ['speak', 118],
    ['src', 170],
    ['stop-color', 42],
    ['stop-opacity', 31],
    ['stroke', 98],
    ['stroke-dasharray', 36],
    ['stroke-dashoffset', 3],
    ['stroke-linecap', 30],
    ['stroke-linejoin', 21],
    ['stroke-miterlimit', 12],
    ['stroke-opacity', 34],
    ['stroke-width', 87],
    ['table-layout', 171],
    ['tab-size', 46],
    ['text-align', 260],
    ['text-anchor', 35],
    ['text-decoration', 247],
    ['text-indent', 207],
    ['text-overflow', 204],
    ['text-rendering', 155],
    ['text-shadow', 208],
    ['text-transform', 202],
    ['top', 258],
    ['touch-action', 80],
    ['transform', 181],
    ['transform-origin', 162],
    ['transform-style', 86],
    ['transition', 193],
    ['transition-delay', 134],
    ['transition-duration', 135],
    ['transition-property', 131],
    ['transition-timing-function', 122],
    ['unicode-bidi', 156],
    ['unicode-range', 136],
    ['vertical-align', 236],
    ['visibility', 242],
    ['-webkit-appearance', 191],
    ['-webkit-backface-visibility', 154],
    ['-webkit-background-clip', 164],
    ['-webkit-background-origin', 40],
    ['-webkit-background-size', 163],
    ['-webkit-border-end', 9],
    ['-webkit-border-horizontal-spacing', 81],
    ['-webkit-border-image', 75],
    ['-webkit-border-radius', 212],
    ['-webkit-border-start', 10],
    ['-webkit-border-start-color', 16],
    ['-webkit-border-start-width', 13],
    ['-webkit-border-vertical-spacing', 43],
    ['-webkit-box-align', 101],
    ['-webkit-box-direction', 51],
    ['-webkit-box-flex', 128],
    ['-webkit-box-ordinal-group', 91],
    ['-webkit-box-orient', 144],
    ['-webkit-box-pack', 106],
    ['-webkit-box-reflect', 39],
    ['-webkit-box-shadow', 210],
    ['-webkit-column-break-inside', 60],
    ['-webkit-column-count', 84],
    ['-webkit-column-gap', 76],
    ['-webkit-column-rule', 25],
    ['-webkit-column-rule-color', 23],
    ['-webkit-columns', 44],
    ['-webkit-column-span', 29],
    ['-webkit-column-width', 47],
    ['-webkit-filter', 159],
    ['-webkit-font-feature-settings', 59],
    ['-webkit-font-smoothing', 177],
    ['-webkit-highlight', 1],
    ['-webkit-line-break', 45],
    ['-webkit-line-clamp', 126],
    ['-webkit-margin-after', 67],
    ['-webkit-margin-before', 70],
    ['-webkit-margin-collapse', 14],
    ['-webkit-margin-end', 65],
    ['-webkit-margin-start', 100],
    ['-webkit-margin-top-collapse', 78],
    ['-webkit-mask', 19],
    ['-webkit-mask-box-image', 72],
    ['-webkit-mask-image', 88],
    ['-webkit-mask-position', 54],
    ['-webkit-mask-repeat', 63],
    ['-webkit-mask-size', 79],
    ['-webkit-padding-after', 15],
    ['-webkit-padding-before', 28],
    ['-webkit-padding-end', 48],
    ['-webkit-padding-start', 73],
    ['-webkit-print-color-adjust', 83],
    ['-webkit-rtl-ordering', 7],
    ['-webkit-tap-highlight-color', 169],
    ['-webkit-text-emphasis-color', 11],
    ['-webkit-text-fill-color', 71],
    ['-webkit-text-security', 17],
    ['-webkit-text-stroke', 56],
    ['-webkit-text-stroke-color', 37],
    ['-webkit-text-stroke-width', 53],
    ['-webkit-user-drag', 95],
    ['-webkit-user-modify', 62],
    ['-webkit-user-select', 194],
    ['-webkit-writing-mode', 4],
    ['white-space', 228],
    ['widows', 115],
    ['width', 268],
    ['will-change', 74],
    ['word-break', 166],
    ['word-spacing', 157],
    ['word-wrap', 197],
    ['writing-mode', 41],
    ['z-index', 239],
    ['zoom', 200],
]);
// Common keywords to CSS properties
const CommonKeywords = ['auto', 'none'];
//# sourceMappingURL=CSSMetadata.js.map