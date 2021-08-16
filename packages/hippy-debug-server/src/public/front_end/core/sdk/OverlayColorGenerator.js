// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
/**
 * Used to cycle through a list of predetermined colors for the overlays.
 * This helps users differentiate between overlays when several are shown at the
 * same time.
 */
export class OverlayColorGenerator {
    _colors;
    _index;
    constructor() {
        const { Color, Format } = Common.Color;
        this._colors = [
            // F59794
            new Color([0.9607843137254902, 0.592156862745098, 0.5803921568627451, 1], Format.RGBA),
            // F0BF4C
            new Color([0.9411764705882353, 0.7490196078431373, 0.2980392156862745, 1], Format.RGBA),
            // D4ED31
            new Color([0.8313725490196079, 0.9294117647058824, 0.19215686274509805, 1], Format.RGBA),
            // 9EEB47
            new Color([0.6196078431372549, 0.9215686274509803, 0.2784313725490196, 1], Format.RGBA),
            // 5BD1D7
            new Color([0.3568627450980392, 0.8196078431372549, 0.8431372549019608, 1], Format.RGBA),
            // BCCEFB
            new Color([0.7372549019607844, 0.807843137254902, 0.984313725490196, 1], Format.RGBA),
            // C6BEEE
            new Color([0.7764705882352941, 0.7450980392156863, 0.9333333333333333, 1], Format.RGBA),
            // D094EA
            new Color([0.8156862745098039, 0.5803921568627451, 0.9176470588235294, 1], Format.RGBA),
            // EB94CF
            new Color([0.9215686274509803, 0.5803921568627451, 0.8117647058823529, 1], Format.RGBA),
        ];
        this._index = 0;
    }
    /**
     * Generate the next color in the spectrum
     */
    next() {
        const color = this._colors[this._index];
        this._index++;
        if (this._index >= this._colors.length) {
            this._index = 0;
        }
        return color;
    }
}
//# sourceMappingURL=OverlayColorGenerator.js.map