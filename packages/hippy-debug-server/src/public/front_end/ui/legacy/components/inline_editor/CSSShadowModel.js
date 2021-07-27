// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
export class CSSShadowModel {
    _isBoxShadow;
    _inset;
    _offsetX;
    _offsetY;
    _blurRadius;
    _spreadRadius;
    _color;
    _format;
    _important;
    constructor(isBoxShadow) {
        this._isBoxShadow = isBoxShadow;
        this._inset = false;
        this._offsetX = CSSLength.zero();
        this._offsetY = CSSLength.zero();
        this._blurRadius = CSSLength.zero();
        this._spreadRadius = CSSLength.zero();
        this._color = Common.Color.Color.parse('black');
        this._format = ["X" /* OffsetX */, "Y" /* OffsetY */];
        this._important = false;
    }
    static parseTextShadow(text) {
        return CSSShadowModel._parseShadow(text, false);
    }
    static parseBoxShadow(text) {
        return CSSShadowModel._parseShadow(text, true);
    }
    static _parseShadow(text, isBoxShadow) {
        const shadowTexts = [];
        // Split by commas that aren't inside of color values to get the individual shadow values.
        const splits = TextUtils.TextUtils.Utils.splitStringByRegexes(text, [Common.Color.Regex, /,/g]);
        let currentIndex = 0;
        for (let i = 0; i < splits.length; i++) {
            if (splits[i].regexIndex === 1) {
                const comma = splits[i];
                shadowTexts.push(text.substring(currentIndex, comma.position));
                currentIndex = comma.position + 1;
            }
        }
        shadowTexts.push(text.substring(currentIndex, text.length));
        const shadows = [];
        for (let i = 0; i < shadowTexts.length; i++) {
            const shadow = new CSSShadowModel(isBoxShadow);
            shadow._format = [];
            let nextPartAllowed = true;
            const regexes = [/!important/gi, /inset/gi, Common.Color.Regex, CSSLength.Regex];
            const results = TextUtils.TextUtils.Utils.splitStringByRegexes(shadowTexts[i], regexes);
            for (let j = 0; j < results.length; j++) {
                const result = results[j];
                if (result.regexIndex === -1) {
                    // Don't allow anything other than inset, color, length values, and whitespace.
                    if (/\S/.test(result.value)) {
                        return [];
                    }
                    // All parts must be separated by whitespace.
                    nextPartAllowed = true;
                }
                else {
                    if (!nextPartAllowed) {
                        return [];
                    }
                    nextPartAllowed = false;
                    if (result.regexIndex === 0) {
                        shadow._important = true;
                        shadow._format.push("M" /* Important */);
                    }
                    else if (result.regexIndex === 1) {
                        shadow._inset = true;
                        shadow._format.push("I" /* Inset */);
                    }
                    else if (result.regexIndex === 2) {
                        const color = Common.Color.Color.parse(result.value);
                        if (!color) {
                            return [];
                        }
                        shadow._color = color;
                        shadow._format.push("C" /* Color */);
                    }
                    else if (result.regexIndex === 3) {
                        const length = CSSLength.parse(result.value);
                        if (!length) {
                            return [];
                        }
                        const previousPart = shadow._format.length > 0 ? shadow._format[shadow._format.length - 1] : '';
                        if (previousPart === "X" /* OffsetX */) {
                            shadow._offsetY = length;
                            shadow._format.push("Y" /* OffsetY */);
                        }
                        else if (previousPart === "Y" /* OffsetY */) {
                            shadow._blurRadius = length;
                            shadow._format.push("B" /* BlurRadius */);
                        }
                        else if (previousPart === "B" /* BlurRadius */) {
                            shadow._spreadRadius = length;
                            shadow._format.push("S" /* SpreadRadius */);
                        }
                        else {
                            shadow._offsetX = length;
                            shadow._format.push("X" /* OffsetX */);
                        }
                    }
                }
            }
            if (invalidCount(shadow, "X" /* OffsetX */, 1, 1) || invalidCount(shadow, "Y" /* OffsetY */, 1, 1) ||
                invalidCount(shadow, "C" /* Color */, 0, 1) || invalidCount(shadow, "B" /* BlurRadius */, 0, 1) ||
                invalidCount(shadow, "I" /* Inset */, 0, isBoxShadow ? 1 : 0) ||
                invalidCount(shadow, "S" /* SpreadRadius */, 0, isBoxShadow ? 1 : 0) ||
                invalidCount(shadow, "M" /* Important */, 0, 1)) {
                return [];
            }
            shadows.push(shadow);
        }
        return shadows;
        function invalidCount(shadow, part, min, max) {
            let count = 0;
            for (let i = 0; i < shadow._format.length; i++) {
                if (shadow._format[i] === part) {
                    count++;
                }
            }
            return count < min || count > max;
        }
    }
    setInset(inset) {
        this._inset = inset;
        if (this._format.indexOf("I" /* Inset */) === -1) {
            this._format.unshift("I" /* Inset */);
        }
    }
    setOffsetX(offsetX) {
        this._offsetX = offsetX;
    }
    setOffsetY(offsetY) {
        this._offsetY = offsetY;
    }
    setBlurRadius(blurRadius) {
        this._blurRadius = blurRadius;
        if (this._format.indexOf("B" /* BlurRadius */) === -1) {
            const yIndex = this._format.indexOf("Y" /* OffsetY */);
            this._format.splice(yIndex + 1, 0, "B" /* BlurRadius */);
        }
    }
    setSpreadRadius(spreadRadius) {
        this._spreadRadius = spreadRadius;
        if (this._format.indexOf("S" /* SpreadRadius */) === -1) {
            this.setBlurRadius(this._blurRadius);
            const blurIndex = this._format.indexOf("B" /* BlurRadius */);
            this._format.splice(blurIndex + 1, 0, "S" /* SpreadRadius */);
        }
    }
    setColor(color) {
        this._color = color;
        if (this._format.indexOf("C" /* Color */) === -1) {
            this._format.push("C" /* Color */);
        }
    }
    isBoxShadow() {
        return this._isBoxShadow;
    }
    inset() {
        return this._inset;
    }
    offsetX() {
        return this._offsetX;
    }
    offsetY() {
        return this._offsetY;
    }
    blurRadius() {
        return this._blurRadius;
    }
    spreadRadius() {
        return this._spreadRadius;
    }
    color() {
        return this._color;
    }
    asCSSText() {
        const parts = [];
        for (let i = 0; i < this._format.length; i++) {
            const part = this._format[i];
            if (part === "I" /* Inset */ && this._inset) {
                parts.push('inset');
            }
            else if (part === "X" /* OffsetX */) {
                parts.push(this._offsetX.asCSSText());
            }
            else if (part === "Y" /* OffsetY */) {
                parts.push(this._offsetY.asCSSText());
            }
            else if (part === "B" /* BlurRadius */) {
                parts.push(this._blurRadius.asCSSText());
            }
            else if (part === "S" /* SpreadRadius */) {
                parts.push(this._spreadRadius.asCSSText());
            }
            else if (part === "C" /* Color */) {
                parts.push(this._color.asString(this._color.format()));
            }
            else if (part === "M" /* Important */ && this._important) {
                parts.push('!important');
            }
        }
        return parts.join(' ');
    }
}
export class CSSLength {
    amount;
    unit;
    constructor(amount, unit) {
        this.amount = amount;
        this.unit = unit;
    }
    static parse(text) {
        const lengthRegex = new RegExp('^(?:' + CSSLength.Regex.source + ')$', 'i');
        const match = text.match(lengthRegex);
        if (!match) {
            return null;
        }
        if (match.length > 2 && match[2]) {
            return new CSSLength(parseFloat(match[1]), match[2]);
        }
        return CSSLength.zero();
    }
    static zero() {
        return new CSSLength(0, '');
    }
    asCSSText() {
        return this.amount + this.unit;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static Regex = (function () {
        const number = '([+-]?(?:[0-9]*[.])?[0-9]+(?:[eE][+-]?[0-9]+)?)';
        const unit = '(ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmax|vmin|vw)';
        const zero = '[+-]?(?:0*[.])?0+(?:[eE][+-]?[0-9]+)?';
        return new RegExp(number + unit + '|' + zero, 'gi');
    })();
}
//# sourceMappingURL=CSSShadowModel.js.map