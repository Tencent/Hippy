// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../components/helpers/helpers.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
const UIStrings = {
    /**
    *@description Text displayed in a tooltip shown when hovering over a var() CSS function in the Styles pane when the custom property in this function does not exist. The parameter is the name of the property.
    *@example {--my-custom-property-name} PH1
    */
    sIsNotDefined: '{PH1} is not defined',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/inline_editor/CSSVarSwatch.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html, Directives } = LitHtml;
const VARIABLE_FUNCTION_REGEX = /(var\()(\s*--[^,)]+)(.*)/;
export class CSSVarSwatch extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    text = '';
    computedValue = null;
    fromFallback = false;
    onLinkActivate = () => undefined;
    constructor() {
        super();
        this.tabIndex = -1;
        this.addEventListener('focus', () => {
            const link = this.shadow.querySelector('[role="link"]');
            if (link) {
                link.focus();
            }
        });
    }
    set data(data) {
        this.text = data.text;
        this.computedValue = data.computedValue;
        this.fromFallback = data.fromFallback;
        this.onLinkActivate = (variableName, event) => {
            if (event instanceof MouseEvent && event.button !== 0) {
                return;
            }
            if (event instanceof KeyboardEvent && !isEnterOrSpaceKey(event)) {
                return;
            }
            data.onLinkActivate(variableName);
            event.consume(true);
        };
        this.render();
    }
    parseVariableFunctionParts() {
        // When the value of CSS var() is greater than two spaces, only one is
        // always displayed, and the actual number of spaces is displayed when
        // editing is clicked.
        const result = this.text.replace(/\s{2,}/g, ' ').match(VARIABLE_FUNCTION_REGEX);
        if (!result) {
            return null;
        }
        return {
            pre: result[1],
            name: result[2],
            post: result[3],
        };
    }
    get variableName() {
        const match = this.text.match(/--[^,)]+/);
        if (match) {
            return match[0];
        }
        return '';
    }
    renderLink(variableName) {
        const isDefined = this.computedValue && !this.fromFallback;
        const classes = Directives.classMap({
            'css-var-link': true,
            'undefined': !isDefined,
        });
        const title = isDefined ? this.computedValue : i18nString(UIStrings.sIsNotDefined, { PH1: variableName });
        // The this.variableName's space must be removed, otherwise it cannot be triggered when clicked.
        const onActivate = isDefined ? this.onLinkActivate.bind(this, this.variableName.trim()) : null;
        return html `<span class="${classes}" title="${title}" @mousedown=${onActivate} @keydown=${onActivate} role="link" tabindex="-1">${variableName}</span>`;
    }
    render() {
        const functionParts = this.parseVariableFunctionParts();
        if (!functionParts) {
            render('', this.shadow, { host: this });
            return;
        }
        const link = this.renderLink(functionParts.name);
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `<style>
      .css-var-link:not(.undefined) {
        cursor: pointer;
        text-underline-offset: 2px;
        color: var(--color-link);
      }

      .css-var-link:hover:not(.undefined) {
        text-decoration: underline;
      }

      .css-var-link:focus:not(:focus-visible) {
        outline: none;
      }

      .css-var-link.undefined {
        /* stylelint-disable-next-line plugin/use_theme_colors */
        color: hsl(0deg 0% 46%);
      }
      </style><span title="${this.computedValue || ''}">${functionParts.pre}${link}${functionParts.post}</span>`, this.shadow, { host: this });
        // clang-format on
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-css-var-swatch', CSSVarSwatch);
//# sourceMappingURL=CSSVarSwatch.js.map