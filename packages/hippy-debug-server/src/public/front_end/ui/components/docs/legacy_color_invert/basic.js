// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as Common from '../../../../core/common/common.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const form = document.querySelector('form');
if (!form) {
    throw new Error('could not find form');
}
form.addEventListener('submit', event => {
    event.preventDefault();
    const property = form.querySelector('#css-property')?.value;
    const value = form.querySelector('#css-value')?.value;
    if (!property || !value) {
        return;
    }
    const output = legacyInvertVariableForDarkMode(property, value);
    const outputElem = document.querySelector('#output');
    if (outputElem) {
        outputElem.innerText = output;
    }
});
function patchHSLA(hsla, colorUsage) {
    const hue = hsla[0];
    const sat = hsla[1];
    let lit = hsla[2];
    const alpha = hsla[3];
    const minCap = colorUsage === 'background' ? 0.14 : 0;
    const maxCap = colorUsage === 'foreground' ? 0.9 : 1;
    lit = 1 - lit;
    if (lit < minCap * 2) {
        lit = minCap + lit / 2;
    }
    else if (lit > 2 * maxCap - 1) {
        lit = maxCap - 1 / 2 + lit / 2;
    }
    hsla[0] = Platform.NumberUtilities.clamp(hue, 0, 1);
    hsla[1] = Platform.NumberUtilities.clamp(sat, 0, 1);
    hsla[2] = Platform.NumberUtilities.clamp(lit, 0, 1);
    hsla[3] = Platform.NumberUtilities.clamp(alpha, 0, 1);
}
function patchColor(colorAsText, colorUsage) {
    const color = Common.Color.Color.parse(colorAsText);
    if (!color) {
        return colorAsText;
    }
    const hsla = color.hsla();
    patchHSLA(hsla, colorUsage);
    const rgba = [];
    Common.Color.Color.hsl2rgb(hsla, rgba);
    const outColor = new Common.Color.Color(rgba, color.format());
    let outText = outColor.asString(null);
    if (!outText) {
        outText = outColor.asString(outColor.hasAlpha() ? Common.Color.Format.RGBA : Common.Color.Format.RGB);
    }
    return outText || colorAsText;
}
function legacyInvertVariableForDarkMode(cssProperty, cssValue) {
    let colorUsage = 'unknown';
    if (cssProperty.indexOf('background') === 0 || cssProperty.indexOf('border') === 0) {
        colorUsage = 'background';
    }
    if (cssProperty.indexOf('background') === -1) {
        colorUsage = 'foreground';
    }
    const items = cssValue.replace(Common.Color.Regex, '\0$1\0').split('\0');
    const output = [];
    for (const item of items) {
        if (!item) {
            continue;
        }
        const newColor = patchColor(item, colorUsage);
        output.push(newColor);
    }
    return output.join(' ');
}
//# sourceMappingURL=basic.js.map