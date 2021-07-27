// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2009 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../platform/platform.js';
import { blendColors, contrastRatioAPCA, desiredLuminanceAPCA, luminance, luminanceAPCA, rgbaToHsla } from './ColorUtils.js';
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _rgbaToNickname;
export class Color {
    _hsla;
    _rgba;
    _originalText;
    _originalTextIsValid;
    _format;
    constructor(rgba, format, originalText) {
        this._hsla = undefined;
        this._rgba = rgba;
        this._originalText = originalText || null;
        this._originalTextIsValid = Boolean(this._originalText);
        this._format = format;
        if (typeof this._rgba[3] === 'undefined') {
            this._rgba[3] = 1;
        }
        for (let i = 0; i < 4; ++i) {
            if (this._rgba[i] < 0) {
                this._rgba[i] = 0;
                this._originalTextIsValid = false;
            }
            if (this._rgba[i] > 1) {
                this._rgba[i] = 1;
                this._originalTextIsValid = false;
            }
        }
    }
    static parse(text) {
        // Simple - #hex, nickname
        const value = text.toLowerCase().replace(/\s+/g, '');
        const simple = /^(?:#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(\w+))$/i;
        let match = value.match(simple);
        if (match) {
            if (match[1]) { // hex
                let hex = match[1].toLowerCase();
                let format;
                if (hex.length === 3) {
                    format = Format.ShortHEX;
                    hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
                }
                else if (hex.length === 4) {
                    format = Format.ShortHEXA;
                    hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2) +
                        hex.charAt(3) + hex.charAt(3);
                }
                else if (hex.length === 6) {
                    format = Format.HEX;
                }
                else {
                    format = Format.HEXA;
                }
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                let a = 1;
                if (hex.length === 8) {
                    a = parseInt(hex.substring(6, 8), 16) / 255;
                }
                return new Color([r / 255, g / 255, b / 255, a], format, text);
            }
            if (match[2]) { // nickname
                const nickname = match[2].toLowerCase();
                if (nickname in Nicknames) {
                    const rgba = Nicknames[nickname];
                    const color = Color.fromRGBA(rgba);
                    color._format = Format.Nickname;
                    color._originalText = text;
                    return color;
                }
                return null;
            }
            return null;
        }
        // rgb/rgba(), hsl/hsla()
        match = text.toLowerCase().match(/^\s*(?:(rgba?)|(hsla?))\((.*)\)\s*$/);
        if (match) {
            const components = match[3].trim();
            let values = components.split(/\s*,\s*/);
            if (values.length === 1) {
                values = components.split(/\s+/);
                if (values[3] === '/') {
                    values.splice(3, 1);
                    if (values.length !== 4) {
                        return null;
                    }
                }
                else if ((values.length > 2 && values[2].indexOf('/') !== -1) ||
                    (values.length > 3 && values[3].indexOf('/') !== -1)) {
                    const alpha = values.slice(2, 4).join('');
                    values = values.slice(0, 2).concat(alpha.split(/\//)).concat(values.slice(4));
                }
                else if (values.length >= 4) {
                    return null;
                }
            }
            if (values.length !== 3 && values.length !== 4 || values.indexOf('') > -1) {
                return null;
            }
            const hasAlpha = (values[3] !== undefined);
            if (match[1]) { // rgb/rgba
                const rgba = [
                    Color._parseRgbNumeric(values[0]),
                    Color._parseRgbNumeric(values[1]),
                    Color._parseRgbNumeric(values[2]),
                    hasAlpha ? Color._parseAlphaNumeric(values[3]) : 1,
                ];
                if (rgba.indexOf(null) > -1) {
                    return null;
                }
                return new Color(rgba, hasAlpha ? Format.RGBA : Format.RGB, text);
            }
            if (match[2]) { // hsl/hsla
                const hsla = [
                    Color._parseHueNumeric(values[0]),
                    Color._parseSatLightNumeric(values[1]),
                    Color._parseSatLightNumeric(values[2]),
                    hasAlpha ? Color._parseAlphaNumeric(values[3]) : 1,
                ];
                if (hsla.indexOf(null) > -1) {
                    return null;
                }
                const rgba = [];
                Color.hsl2rgb(hsla, rgba);
                return new Color(rgba, hasAlpha ? Format.HSLA : Format.HSL, text);
            }
        }
        return null;
    }
    static fromRGBA(rgba) {
        return new Color([rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3]], Format.RGBA);
    }
    static fromHSVA(hsva) {
        const rgba = [];
        Color.hsva2rgba(hsva, rgba);
        return new Color(rgba, Format.HSLA);
    }
    static _parsePercentOrNumber(value) {
        // @ts-ignore: isNaN can accept strings
        if (isNaN(value.replace('%', ''))) {
            return null;
        }
        const parsed = parseFloat(value);
        if (value.indexOf('%') !== -1) {
            if (value.indexOf('%') !== value.length - 1) {
                return null;
            }
            return parsed / 100;
        }
        return parsed;
    }
    static _parseRgbNumeric(value) {
        const parsed = Color._parsePercentOrNumber(value);
        if (parsed === null) {
            return null;
        }
        if (value.indexOf('%') !== -1) {
            return parsed;
        }
        return parsed / 255;
    }
    static _parseHueNumeric(value) {
        const angle = value.replace(/(deg|g?rad|turn)$/, '');
        // @ts-ignore: isNaN can accept strings
        if (isNaN(angle) || value.match(/\s+(deg|g?rad|turn)/)) {
            return null;
        }
        const number = parseFloat(angle);
        if (value.indexOf('turn') !== -1) {
            return number % 1;
        }
        if (value.indexOf('grad') !== -1) {
            return (number / 400) % 1;
        }
        if (value.indexOf('rad') !== -1) {
            return (number / (2 * Math.PI)) % 1;
        }
        return (number / 360) % 1;
    }
    static _parseSatLightNumeric(value) {
        // @ts-ignore: isNaN can accept strings
        if (value.indexOf('%') !== value.length - 1 || isNaN(value.replace('%', ''))) {
            return null;
        }
        const parsed = parseFloat(value);
        return Math.min(1, parsed / 100);
    }
    static _parseAlphaNumeric(value) {
        return Color._parsePercentOrNumber(value);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _hsva2hsla(hsva, out_hsla) {
        const h = hsva[0];
        let s = hsva[1];
        const v = hsva[2];
        const t = (2 - s) * v;
        if (v === 0 || s === 0) {
            s = 0;
        }
        else {
            s *= v / (t < 1 ? t : 2 - t);
        }
        out_hsla[0] = h;
        out_hsla[1] = s;
        out_hsla[2] = t / 2;
        out_hsla[3] = hsva[3];
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static hsl2rgb(hsl, out_rgb) {
        const h = hsl[0];
        let s = hsl[1];
        const l = hsl[2];
        function hue2rgb(p, q, h) {
            if (h < 0) {
                h += 1;
            }
            else if (h > 1) {
                h -= 1;
            }
            if ((h * 6) < 1) {
                return p + (q - p) * h * 6;
            }
            if ((h * 2) < 1) {
                return q;
            }
            if ((h * 3) < 2) {
                return p + (q - p) * ((2 / 3) - h) * 6;
            }
            return p;
        }
        if (s < 0) {
            s = 0;
        }
        let q;
        if (l <= 0.5) {
            q = l * (1 + s);
        }
        else {
            q = l + s - (l * s);
        }
        const p = 2 * l - q;
        const tr = h + (1 / 3);
        const tg = h;
        const tb = h - (1 / 3);
        out_rgb[0] = hue2rgb(p, q, tr);
        out_rgb[1] = hue2rgb(p, q, tg);
        out_rgb[2] = hue2rgb(p, q, tb);
        out_rgb[3] = hsl[3];
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static hsva2rgba(hsva, out_rgba) {
        Color._hsva2hsla(hsva, _tmpHSLA);
        Color.hsl2rgb(_tmpHSLA, out_rgba);
        for (let i = 0; i < _tmpHSLA.length; i++) {
            _tmpHSLA[i] = 0;
        }
    }
    /**
     * Compute a desired luminance given a given luminance and a desired contrast
     * ratio.
     */
    static desiredLuminance(luminance, contrast, lighter) {
        function computeLuminance() {
            if (lighter) {
                return (luminance + 0.05) * contrast - 0.05;
            }
            return (luminance + 0.05) / contrast - 0.05;
        }
        let desiredLuminance = computeLuminance();
        if (desiredLuminance < 0 || desiredLuminance > 1) {
            lighter = !lighter;
            desiredLuminance = computeLuminance();
        }
        return desiredLuminance;
    }
    /**
     * Approach a value of the given component of `candidateHSVA` such that the
     * calculated luminance of `candidateHSVA` approximates `desiredLuminance`.
     */
    static approachColorValue(candidateHSVA, bgRGBA, index, desiredLuminance, candidateLuminance) {
        const epsilon = 0.0002;
        let x = candidateHSVA[index];
        let multiplier = 1;
        let dLuminance = candidateLuminance(candidateHSVA) - desiredLuminance;
        let previousSign = Math.sign(dLuminance);
        for (let guard = 100; guard; guard--) {
            if (Math.abs(dLuminance) < epsilon) {
                candidateHSVA[index] = x;
                return x;
            }
            const sign = Math.sign(dLuminance);
            if (sign !== previousSign) {
                // If `x` overshoots the correct value, halve the step size.
                multiplier /= 2;
                previousSign = sign;
            }
            else if (x < 0 || x > 1) {
                // If there is no overshoot and `x` is out of bounds, there is no
                // acceptable value for `x`.
                return null;
            }
            // Adjust `x` by a multiple of `dLuminance` to decrease step size as
            // the computed luminance converges on `desiredLuminance`.
            x += multiplier * (index === 2 ? -dLuminance : dLuminance);
            candidateHSVA[index] = x;
            dLuminance = candidateLuminance(candidateHSVA) - desiredLuminance;
        }
        return null;
    }
    static findFgColorForContrast(fgColor, bgColor, requiredContrast) {
        const candidateHSVA = fgColor.hsva();
        const bgRGBA = bgColor.rgba();
        const candidateLuminance = (candidateHSVA) => {
            return luminance(blendColors(Color.fromHSVA(candidateHSVA).rgba(), bgRGBA));
        };
        const bgLuminance = luminance(bgColor.rgba());
        const fgLuminance = candidateLuminance(candidateHSVA);
        const fgIsLighter = fgLuminance > bgLuminance;
        const desiredLuminance = Color.desiredLuminance(bgLuminance, requiredContrast, fgIsLighter);
        const saturationComponentIndex = 1;
        const valueComponentIndex = 2;
        if (Color.approachColorValue(candidateHSVA, bgRGBA, valueComponentIndex, desiredLuminance, candidateLuminance)) {
            return Color.fromHSVA(candidateHSVA);
        }
        candidateHSVA[valueComponentIndex] = 1;
        if (Color.approachColorValue(candidateHSVA, bgRGBA, saturationComponentIndex, desiredLuminance, candidateLuminance)) {
            return Color.fromHSVA(candidateHSVA);
        }
        return null;
    }
    static findFgColorForContrastAPCA(fgColor, bgColor, requiredContrast) {
        const candidateHSVA = fgColor.hsva();
        const bgRGBA = bgColor.rgba();
        const candidateLuminance = (candidateHSVA) => {
            return luminanceAPCA(Color.fromHSVA(candidateHSVA).rgba());
        };
        const bgLuminance = luminanceAPCA(bgColor.rgba());
        const fgLuminance = candidateLuminance(candidateHSVA);
        const fgIsLighter = fgLuminance >= bgLuminance;
        const desiredLuminance = desiredLuminanceAPCA(bgLuminance, requiredContrast, fgIsLighter);
        const saturationComponentIndex = 1;
        const valueComponentIndex = 2;
        if (Color.approachColorValue(candidateHSVA, bgRGBA, valueComponentIndex, desiredLuminance, candidateLuminance)) {
            const candidate = Color.fromHSVA(candidateHSVA);
            if (Math.abs(contrastRatioAPCA(bgColor.rgba(), candidate.rgba())) >= requiredContrast) {
                return candidate;
            }
        }
        candidateHSVA[valueComponentIndex] = 1;
        if (Color.approachColorValue(candidateHSVA, bgRGBA, saturationComponentIndex, desiredLuminance, candidateLuminance)) {
            const candidate = Color.fromHSVA(candidateHSVA);
            if (Math.abs(contrastRatioAPCA(bgColor.rgba(), candidate.rgba())) >= requiredContrast) {
                return candidate;
            }
        }
        return null;
    }
    format() {
        return this._format;
    }
    /** HSLA with components within [0..1]
       */
    hsla() {
        if (this._hsla) {
            return this._hsla;
        }
        this._hsla = rgbaToHsla(this._rgba);
        return this._hsla;
    }
    canonicalHSLA() {
        const hsla = this.hsla();
        return [Math.round(hsla[0] * 360), Math.round(hsla[1] * 100), Math.round(hsla[2] * 100), hsla[3]];
    }
    /** HSVA with components within [0..1]
       */
    hsva() {
        const hsla = this.hsla();
        const h = hsla[0];
        let s = hsla[1];
        const l = hsla[2];
        s *= l < 0.5 ? l : 1 - l;
        return [h, s !== 0 ? 2 * s / (l + s) : 0, (l + s), hsla[3]];
    }
    hasAlpha() {
        return this._rgba[3] !== 1;
    }
    detectHEXFormat() {
        let canBeShort = true;
        for (let i = 0; i < 4; ++i) {
            const c = Math.round(this._rgba[i] * 255);
            if (c % 17) {
                canBeShort = false;
                break;
            }
        }
        const hasAlpha = this.hasAlpha();
        const cf = Format;
        if (canBeShort) {
            return hasAlpha ? cf.ShortHEXA : cf.ShortHEX;
        }
        return hasAlpha ? cf.HEXA : cf.HEX;
    }
    asString(format) {
        if (format === this._format && this._originalTextIsValid) {
            return this._originalText;
        }
        if (!format) {
            format = this._format;
        }
        function toRgbValue(value) {
            return Math.round(value * 255);
        }
        function toHexValue(value) {
            const hex = Math.round(value * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }
        function toShortHexValue(value) {
            return (Math.round(value * 255) / 17).toString(16);
        }
        switch (format) {
            case Format.Original: {
                return this._originalText;
            }
            case Format.RGB:
            case Format.RGBA: {
                const start = Platform.StringUtilities.sprintf('rgb(%d %d %d', toRgbValue(this._rgba[0]), toRgbValue(this._rgba[1]), toRgbValue(this._rgba[2]));
                if (this.hasAlpha()) {
                    return start + Platform.StringUtilities.sprintf(' / %d%)', Math.round(this._rgba[3] * 100));
                }
                return start + ')';
            }
            case Format.HSL:
            case Format.HSLA: {
                const hsla = this.hsla();
                const start = Platform.StringUtilities.sprintf('hsl(%ddeg %d% %d%', Math.round(hsla[0] * 360), Math.round(hsla[1] * 100), Math.round(hsla[2] * 100));
                if (this.hasAlpha()) {
                    return start + Platform.StringUtilities.sprintf(' / %d%)', Math.round(hsla[3] * 100));
                }
                return start + ')';
            }
            case Format.HEXA: {
                return Platform.StringUtilities
                    .sprintf('#%s%s%s%s', toHexValue(this._rgba[0]), toHexValue(this._rgba[1]), toHexValue(this._rgba[2]), toHexValue(this._rgba[3]))
                    .toLowerCase();
            }
            case Format.HEX: {
                if (this.hasAlpha()) {
                    return null;
                }
                return Platform.StringUtilities
                    .sprintf('#%s%s%s', toHexValue(this._rgba[0]), toHexValue(this._rgba[1]), toHexValue(this._rgba[2]))
                    .toLowerCase();
            }
            case Format.ShortHEXA: {
                const hexFormat = this.detectHEXFormat();
                if (hexFormat !== Format.ShortHEXA && hexFormat !== Format.ShortHEX) {
                    return null;
                }
                return Platform.StringUtilities
                    .sprintf('#%s%s%s%s', toShortHexValue(this._rgba[0]), toShortHexValue(this._rgba[1]), toShortHexValue(this._rgba[2]), toShortHexValue(this._rgba[3]))
                    .toLowerCase();
            }
            case Format.ShortHEX: {
                if (this.hasAlpha()) {
                    return null;
                }
                if (this.detectHEXFormat() !== Format.ShortHEX) {
                    return null;
                }
                return Platform.StringUtilities
                    .sprintf('#%s%s%s', toShortHexValue(this._rgba[0]), toShortHexValue(this._rgba[1]), toShortHexValue(this._rgba[2]))
                    .toLowerCase();
            }
            case Format.Nickname: {
                return this.nickname();
            }
        }
        return this._originalText;
    }
    rgba() {
        return this._rgba.slice();
    }
    canonicalRGBA() {
        const rgba = new Array(4);
        for (let i = 0; i < 3; ++i) {
            rgba[i] = Math.round(this._rgba[i] * 255);
        }
        rgba[3] = this._rgba[3];
        return rgba;
    }
    /** nickname
       */
    nickname() {
        if (!_rgbaToNickname) {
            _rgbaToNickname = new Map();
            for (const nickname in Nicknames) {
                let rgba = Nicknames[nickname];
                if (rgba.length !== 4) {
                    rgba = rgba.concat(1);
                }
                _rgbaToNickname.set(String(rgba), nickname);
            }
        }
        return _rgbaToNickname.get(String(this.canonicalRGBA())) || null;
    }
    toProtocolRGBA() {
        const rgba = this.canonicalRGBA();
        const result = { r: rgba[0], g: rgba[1], b: rgba[2], a: undefined };
        if (rgba[3] !== 1) {
            result.a = rgba[3];
        }
        return result;
    }
    invert() {
        const rgba = [];
        rgba[0] = 1 - this._rgba[0];
        rgba[1] = 1 - this._rgba[1];
        rgba[2] = 1 - this._rgba[2];
        rgba[3] = this._rgba[3];
        return new Color(rgba, Format.RGBA);
    }
    setAlpha(alpha) {
        const rgba = this._rgba.slice();
        rgba[3] = alpha;
        return new Color(rgba, Format.RGBA);
    }
    blendWith(fgColor) {
        const rgba = blendColors(fgColor._rgba, this._rgba);
        return new Color(rgba, Format.RGBA);
    }
    blendWithAlpha(alpha) {
        const rgba = this._rgba.slice();
        rgba[3] *= alpha;
        return new Color(rgba, Format.RGBA);
    }
    setFormat(format) {
        this._format = format;
    }
}
export const Regex = /((?:rgb|hsl)a?\([^)]+\)|#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3,4}|\b[a-zA-Z]+\b(?!-))/g;
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Format;
(function (Format) {
    Format["Original"] = "original";
    Format["Nickname"] = "nickname";
    Format["HEX"] = "hex";
    Format["ShortHEX"] = "shorthex";
    Format["HEXA"] = "hexa";
    Format["ShortHEXA"] = "shorthexa";
    Format["RGB"] = "rgb";
    Format["RGBA"] = "rgba";
    Format["HSL"] = "hsl";
    Format["HSLA"] = "hsla";
})(Format || (Format = {}));
export const Nicknames = {
    'aliceblue': [240, 248, 255],
    'antiquewhite': [250, 235, 215],
    'aqua': [0, 255, 255],
    'aquamarine': [127, 255, 212],
    'azure': [240, 255, 255],
    'beige': [245, 245, 220],
    'bisque': [255, 228, 196],
    'black': [0, 0, 0],
    'blanchedalmond': [255, 235, 205],
    'blue': [0, 0, 255],
    'blueviolet': [138, 43, 226],
    'brown': [165, 42, 42],
    'burlywood': [222, 184, 135],
    'cadetblue': [95, 158, 160],
    'chartreuse': [127, 255, 0],
    'chocolate': [210, 105, 30],
    'coral': [255, 127, 80],
    'cornflowerblue': [100, 149, 237],
    'cornsilk': [255, 248, 220],
    'crimson': [237, 20, 61],
    'cyan': [0, 255, 255],
    'darkblue': [0, 0, 139],
    'darkcyan': [0, 139, 139],
    'darkgoldenrod': [184, 134, 11],
    'darkgray': [169, 169, 169],
    'darkgrey': [169, 169, 169],
    'darkgreen': [0, 100, 0],
    'darkkhaki': [189, 183, 107],
    'darkmagenta': [139, 0, 139],
    'darkolivegreen': [85, 107, 47],
    'darkorange': [255, 140, 0],
    'darkorchid': [153, 50, 204],
    'darkred': [139, 0, 0],
    'darksalmon': [233, 150, 122],
    'darkseagreen': [143, 188, 143],
    'darkslateblue': [72, 61, 139],
    'darkslategray': [47, 79, 79],
    'darkslategrey': [47, 79, 79],
    'darkturquoise': [0, 206, 209],
    'darkviolet': [148, 0, 211],
    'deeppink': [255, 20, 147],
    'deepskyblue': [0, 191, 255],
    'dimgray': [105, 105, 105],
    'dimgrey': [105, 105, 105],
    'dodgerblue': [30, 144, 255],
    'firebrick': [178, 34, 34],
    'floralwhite': [255, 250, 240],
    'forestgreen': [34, 139, 34],
    'fuchsia': [255, 0, 255],
    'gainsboro': [220, 220, 220],
    'ghostwhite': [248, 248, 255],
    'gold': [255, 215, 0],
    'goldenrod': [218, 165, 32],
    'gray': [128, 128, 128],
    'grey': [128, 128, 128],
    'green': [0, 128, 0],
    'greenyellow': [173, 255, 47],
    'honeydew': [240, 255, 240],
    'hotpink': [255, 105, 180],
    'indianred': [205, 92, 92],
    'indigo': [75, 0, 130],
    'ivory': [255, 255, 240],
    'khaki': [240, 230, 140],
    'lavender': [230, 230, 250],
    'lavenderblush': [255, 240, 245],
    'lawngreen': [124, 252, 0],
    'lemonchiffon': [255, 250, 205],
    'lightblue': [173, 216, 230],
    'lightcoral': [240, 128, 128],
    'lightcyan': [224, 255, 255],
    'lightgoldenrodyellow': [250, 250, 210],
    'lightgreen': [144, 238, 144],
    'lightgray': [211, 211, 211],
    'lightgrey': [211, 211, 211],
    'lightpink': [255, 182, 193],
    'lightsalmon': [255, 160, 122],
    'lightseagreen': [32, 178, 170],
    'lightskyblue': [135, 206, 250],
    'lightslategray': [119, 136, 153],
    'lightslategrey': [119, 136, 153],
    'lightsteelblue': [176, 196, 222],
    'lightyellow': [255, 255, 224],
    'lime': [0, 255, 0],
    'limegreen': [50, 205, 50],
    'linen': [250, 240, 230],
    'magenta': [255, 0, 255],
    'maroon': [128, 0, 0],
    'mediumaquamarine': [102, 205, 170],
    'mediumblue': [0, 0, 205],
    'mediumorchid': [186, 85, 211],
    'mediumpurple': [147, 112, 219],
    'mediumseagreen': [60, 179, 113],
    'mediumslateblue': [123, 104, 238],
    'mediumspringgreen': [0, 250, 154],
    'mediumturquoise': [72, 209, 204],
    'mediumvioletred': [199, 21, 133],
    'midnightblue': [25, 25, 112],
    'mintcream': [245, 255, 250],
    'mistyrose': [255, 228, 225],
    'moccasin': [255, 228, 181],
    'navajowhite': [255, 222, 173],
    'navy': [0, 0, 128],
    'oldlace': [253, 245, 230],
    'olive': [128, 128, 0],
    'olivedrab': [107, 142, 35],
    'orange': [255, 165, 0],
    'orangered': [255, 69, 0],
    'orchid': [218, 112, 214],
    'palegoldenrod': [238, 232, 170],
    'palegreen': [152, 251, 152],
    'paleturquoise': [175, 238, 238],
    'palevioletred': [219, 112, 147],
    'papayawhip': [255, 239, 213],
    'peachpuff': [255, 218, 185],
    'peru': [205, 133, 63],
    'pink': [255, 192, 203],
    'plum': [221, 160, 221],
    'powderblue': [176, 224, 230],
    'purple': [128, 0, 128],
    'rebeccapurple': [102, 51, 153],
    'red': [255, 0, 0],
    'rosybrown': [188, 143, 143],
    'royalblue': [65, 105, 225],
    'saddlebrown': [139, 69, 19],
    'salmon': [250, 128, 114],
    'sandybrown': [244, 164, 96],
    'seagreen': [46, 139, 87],
    'seashell': [255, 245, 238],
    'sienna': [160, 82, 45],
    'silver': [192, 192, 192],
    'skyblue': [135, 206, 235],
    'slateblue': [106, 90, 205],
    'slategray': [112, 128, 144],
    'slategrey': [112, 128, 144],
    'snow': [255, 250, 250],
    'springgreen': [0, 255, 127],
    'steelblue': [70, 130, 180],
    'tan': [210, 180, 140],
    'teal': [0, 128, 128],
    'thistle': [216, 191, 216],
    'tomato': [255, 99, 71],
    'turquoise': [64, 224, 208],
    'violet': [238, 130, 238],
    'wheat': [245, 222, 179],
    'white': [255, 255, 255],
    'whitesmoke': [245, 245, 245],
    'yellow': [255, 255, 0],
    'yellowgreen': [154, 205, 50],
    'transparent': [0, 0, 0, 0],
};
const LAYOUT_LINES_HIGHLIGHT_COLOR = [127, 32, 210];
export const PageHighlight = {
    Content: Color.fromRGBA([111, 168, 220, .66]),
    ContentLight: Color.fromRGBA([111, 168, 220, .5]),
    ContentOutline: Color.fromRGBA([9, 83, 148]),
    Padding: Color.fromRGBA([147, 196, 125, .55]),
    PaddingLight: Color.fromRGBA([147, 196, 125, .4]),
    Border: Color.fromRGBA([255, 229, 153, .66]),
    BorderLight: Color.fromRGBA([255, 229, 153, .5]),
    Margin: Color.fromRGBA([246, 178, 107, .66]),
    MarginLight: Color.fromRGBA([246, 178, 107, .5]),
    EventTarget: Color.fromRGBA([255, 196, 196, .66]),
    Shape: Color.fromRGBA([96, 82, 177, 0.8]),
    ShapeMargin: Color.fromRGBA([96, 82, 127, .6]),
    CssGrid: Color.fromRGBA([0x4b, 0, 0x82, 1]),
    LayoutLine: Color.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, 1]),
    GridBorder: Color.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, 1]),
    GapBackground: Color.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, .3]),
    GapHatch: Color.fromRGBA([...LAYOUT_LINES_HIGHLIGHT_COLOR, .8]),
    GridAreaBorder: Color.fromRGBA([26, 115, 232, 1]),
};
export const SourceOrderHighlight = {
    ParentOutline: Color.fromRGBA([224, 90, 183, 1]),
    ChildOutline: Color.fromRGBA([0, 120, 212, 1]),
};
export class Generator {
    _hueSpace;
    _satSpace;
    _lightnessSpace;
    _alphaSpace;
    _colors;
    constructor(hueSpace, satSpace, lightnessSpace, alphaSpace) {
        this._hueSpace = hueSpace || { min: 0, max: 360, count: undefined };
        this._satSpace = satSpace || 67;
        this._lightnessSpace = lightnessSpace || 80;
        this._alphaSpace = alphaSpace || 1;
        this._colors = new Map();
    }
    setColorForID(id, color) {
        this._colors.set(id, color);
    }
    colorForID(id) {
        let color = this._colors.get(id);
        if (!color) {
            color = this._generateColorForID(id);
            this._colors.set(id, color);
        }
        return color;
    }
    _generateColorForID(id) {
        const hash = Platform.StringUtilities.hashCode(id);
        const h = this._indexToValueInSpace(hash, this._hueSpace);
        const s = this._indexToValueInSpace(hash >> 8, this._satSpace);
        const l = this._indexToValueInSpace(hash >> 16, this._lightnessSpace);
        const a = this._indexToValueInSpace(hash >> 24, this._alphaSpace);
        const start = `hsl(${h}deg ${s}% ${l}%`;
        if (a !== 1) {
            return `${start} / ${Math.floor(a * 100)}%)`;
        }
        return `${start})`;
    }
    _indexToValueInSpace(index, space) {
        if (typeof space === 'number') {
            return space;
        }
        const count = space.count || space.max - space.min;
        index %= count;
        return space.min + Math.floor(index / (count - 1) * (space.max - space.min));
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _tmpHSLA = [0, 0, 0, 0];
//# sourceMappingURL=Color.js.map