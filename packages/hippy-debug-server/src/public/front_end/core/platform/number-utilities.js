// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as StringUtilities from './string-utilities.js';
export const clamp = (num, min, max) => {
    let clampedNumber = num;
    if (num < min) {
        clampedNumber = min;
    }
    else if (num > max) {
        clampedNumber = max;
    }
    return clampedNumber;
};
export const mod = (m, n) => {
    return ((m % n) + n) % n;
};
export const bytesToString = (bytes) => {
    if (bytes < 1000) {
        return StringUtilities.vsprintf('%.0f\xA0B', [bytes]);
    }
    const kilobytes = bytes / 1000;
    if (kilobytes < 100) {
        return StringUtilities.vsprintf('%.1f\xA0kB', [kilobytes]);
    }
    if (kilobytes < 1000) {
        return StringUtilities.vsprintf('%.0f\xA0kB', [kilobytes]);
    }
    const megabytes = kilobytes / 1000;
    if (megabytes < 100) {
        return StringUtilities.vsprintf('%.1f\xA0MB', [megabytes]);
    }
    return StringUtilities.vsprintf('%.0f\xA0MB', [megabytes]);
};
export const toFixedIfFloating = (value) => {
    if (!value || Number.isNaN(Number(value))) {
        return value;
    }
    const number = Number(value);
    return number % 1 ? number.toFixed(3) : String(number);
};
/**
 * Rounds a number (including float) down.
 */
export const floor = (value, precision = 0) => {
    const mult = Math.pow(10, precision);
    return Math.floor(value * mult) / mult;
};
/**
 * Computes the great common divisor for two numbers.
 * If the numbers are floats, they will be rounded to an integer.
 */
export const greatestCommonDivisor = (a, b) => {
    a = Math.round(a);
    b = Math.round(b);
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a;
};
const commonRatios = new Map([
    ['8∶5', '16∶10'],
]);
export const aspectRatio = (width, height) => {
    const divisor = greatestCommonDivisor(width, height);
    if (divisor !== 0) {
        width /= divisor;
        height /= divisor;
    }
    const result = `${width}∶${height}`;
    return commonRatios.get(result) || result;
};
export const withThousandsSeparator = function (num) {
    let str = String(num);
    const re = /(\d+)(\d{3})/;
    while (str.match(re)) {
        str = str.replace(re, '$1\xA0$2');
    } // \xa0 is a non-breaking space
    return str;
};
//# sourceMappingURL=number-utilities.js.map