// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js';
export class ContrastInfo extends Common.ObjectWrapper.ObjectWrapper {
    _isNull;
    _contrastRatio;
    _contrastRatioAPCA;
    _contrastRatioThresholds;
    _contrastRationAPCAThreshold;
    _fgColor;
    _bgColor;
    _colorFormat;
    constructor(contrastInfo) {
        super();
        this._isNull = true;
        this._contrastRatio = null;
        this._contrastRatioAPCA = null;
        this._contrastRatioThresholds = null;
        this._contrastRationAPCAThreshold = 0;
        this._fgColor = null;
        this._bgColor = null;
        if (!contrastInfo) {
            return;
        }
        if (!contrastInfo.computedFontSize || !contrastInfo.computedFontWeight || !contrastInfo.backgroundColors ||
            contrastInfo.backgroundColors.length !== 1) {
            return;
        }
        this._isNull = false;
        this._contrastRatioThresholds =
            Common.ColorUtils.getContrastThreshold(contrastInfo.computedFontSize, contrastInfo.computedFontWeight);
        this._contrastRationAPCAThreshold =
            Common.ColorUtils.getAPCAThreshold(contrastInfo.computedFontSize, contrastInfo.computedFontWeight);
        const bgColorText = contrastInfo.backgroundColors[0];
        const bgColor = Common.Color.Color.parse(bgColorText);
        if (bgColor) {
            this._setBgColorInternal(bgColor);
        }
    }
    isNull() {
        return this._isNull;
    }
    setColor(fgColor, colorFormat) {
        this._fgColor = fgColor;
        this._colorFormat = colorFormat;
        this._updateContrastRatio();
        this.dispatchEventToListeners("ContrastInfoUpdated" /* ContrastInfoUpdated */);
    }
    colorFormat() {
        return this._colorFormat;
    }
    color() {
        return this._fgColor;
    }
    contrastRatio() {
        return this._contrastRatio;
    }
    contrastRatioAPCA() {
        return this._contrastRatioAPCA;
    }
    contrastRatioAPCAThreshold() {
        return this._contrastRationAPCAThreshold;
    }
    setBgColor(bgColor) {
        this._setBgColorInternal(bgColor);
        this.dispatchEventToListeners("ContrastInfoUpdated" /* ContrastInfoUpdated */);
    }
    _setBgColorInternal(bgColor) {
        this._bgColor = bgColor;
        if (!this._fgColor) {
            return;
        }
        const fgRGBA = this._fgColor.rgba();
        // If we have a semi-transparent background color over an unknown
        // background, draw the line for the "worst case" scenario: where
        // the unknown background is the same color as the text.
        if (bgColor.hasAlpha()) {
            const blendedRGBA = Common.ColorUtils.blendColors(bgColor.rgba(), fgRGBA);
            this._bgColor = new Common.Color.Color(blendedRGBA, Common.Color.Format.RGBA);
        }
        this._contrastRatio = Common.ColorUtils.contrastRatio(fgRGBA, this._bgColor.rgba());
        this._contrastRatioAPCA = Common.ColorUtils.contrastRatioAPCA(this._fgColor.rgba(), this._bgColor.rgba());
    }
    bgColor() {
        return this._bgColor;
    }
    _updateContrastRatio() {
        if (!this._bgColor || !this._fgColor) {
            return;
        }
        this._contrastRatio = Common.ColorUtils.contrastRatio(this._fgColor.rgba(), this._bgColor.rgba());
        this._contrastRatioAPCA = Common.ColorUtils.contrastRatioAPCA(this._fgColor.rgba(), this._bgColor.rgba());
    }
    contrastRatioThreshold(level) {
        if (!this._contrastRatioThresholds) {
            return null;
        }
        return this._contrastRatioThresholds[level];
    }
}
//# sourceMappingURL=ContrastInfo.js.map