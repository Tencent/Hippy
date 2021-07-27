// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../components/helpers/helpers.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
const UIStrings = {
    /**
    *@description Icon element title in Color Swatch of the inline editor in the Styles tab
    */
    shiftclickToChangeColorFormat: 'Shift-click to change color format',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/inline_editor/ColorSwatch.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const getStyleSheets = ComponentHelpers.GetStylesheet.getStyleSheets;
export class FormatChangedEvent extends Event {
    data;
    constructor(format, text) {
        super('formatchanged', {});
        this.data = { format, text };
    }
}
export class ColorSwatch extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    tooltip = i18nString(UIStrings.shiftclickToChangeColorFormat);
    text = null;
    color = null;
    format = null;
    constructor() {
        super();
        this.shadow.adoptedStyleSheets = [
            ...getStyleSheets('ui/legacy/components/inline_editor/colorSwatch.css', { enableLegacyPatching: false }),
        ];
    }
    static isColorSwatch(element) {
        return element.localName === 'devtools-color-swatch';
    }
    getColor() {
        return this.color;
    }
    getFormat() {
        return this.format;
    }
    get anchorBox() {
        const swatch = this.shadow.querySelector('.color-swatch');
        return swatch ? swatch.boxInWindow() : null;
    }
    /**
     * Render this swatch given a color object or text to be parsed as a color.
     * @param color The color object or string to use for this swatch.
     * @param formatOrUseUserSetting Either the format to be used as a string, or true to auto-detect the user-set format.
     * @param tooltip The tooltip to use on the swatch.
     */
    renderColor(color, formatOrUseUserSetting, tooltip) {
        if (typeof color === 'string') {
            this.color = Common.Color.Color.parse(color);
            this.text = color;
            if (!this.color) {
                this.renderTextOnly();
                return;
            }
        }
        else {
            this.color = color;
        }
        if (typeof formatOrUseUserSetting === 'boolean' && formatOrUseUserSetting) {
            this.format = Common.Settings.detectColorFormat(this.color);
        }
        else if (typeof formatOrUseUserSetting === 'string') {
            this.format = formatOrUseUserSetting;
        }
        else {
            this.format = this.color.format();
        }
        this.text = this.color.asString(this.format);
        if (tooltip) {
            this.tooltip = tooltip;
        }
        this.render();
    }
    renderTextOnly() {
        // Non-color values can be passed to the component (like 'none' from border style).
        LitHtml.render(this.text, this.shadow, { host: this });
    }
    render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        // Note that we use a <slot> with a default value here to display the color text. Consumers of this component are
        // free to append any content to replace what is being shown here.
        // Note also that whitespace between nodes is removed on purpose to avoid pushing these elements apart. Do not
        // re-format the HTML code.
        LitHtml.render(LitHtml.html `<span class="color-swatch" title="${this.tooltip}"><span class="color-swatch-inner"
        style="background-color: ${this.text};"
        @click=${this.onClick}
        @mousedown=${this.consume}
        @dblclick=${this.consume}></span></span><slot><span>${this.text}</span></slot>`, this.shadow, { host: this });
        // clang-format on
    }
    onClick(e) {
        e.stopPropagation();
        if (e.shiftKey) {
            this.toggleNextFormat();
            return;
        }
        this.dispatchEvent(new Event('swatch-click'));
    }
    consume(e) {
        e.stopPropagation();
    }
    toggleNextFormat() {
        if (!this.color || !this.format) {
            return;
        }
        let currentValue;
        do {
            this.format = nextColorFormat(this.color, this.format);
            currentValue = this.color.asString(this.format);
        } while (currentValue === this.text);
        if (currentValue) {
            this.text = currentValue;
            this.render();
            this.dispatchEvent(new FormatChangedEvent(this.format, this.text));
        }
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-color-swatch', ColorSwatch);
function nextColorFormat(color, curFormat) {
    // The format loop is as follows:
    // * original
    // * rgb(a)
    // * hsl(a)
    // * nickname (if the color has a nickname)
    // * shorthex (if has short hex)
    // * hex
    const cf = Common.Color.Format;
    switch (curFormat) {
        case cf.Original:
            return !color.hasAlpha() ? cf.RGB : cf.RGBA;
        case cf.RGB:
        case cf.RGBA:
            return !color.hasAlpha() ? cf.HSL : cf.HSLA;
        case cf.HSL:
        case cf.HSLA:
            if (color.nickname()) {
                return cf.Nickname;
            }
            return color.detectHEXFormat();
        case cf.ShortHEX:
            return cf.HEX;
        case cf.ShortHEXA:
            return cf.HEXA;
        case cf.HEXA:
        case cf.HEX:
            return cf.Original;
        case cf.Nickname:
            return color.detectHEXFormat();
        default:
            return cf.RGBA;
    }
}
//# sourceMappingURL=ColorSwatch.js.map