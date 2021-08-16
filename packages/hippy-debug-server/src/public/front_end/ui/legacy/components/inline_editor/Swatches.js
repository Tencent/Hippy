// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../../../core/common/common.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
import { ColorSwatch } from './ColorSwatch.js';
export class BezierSwatch extends HTMLSpanElement {
    _iconElement;
    _textElement;
    constructor() {
        super();
        const root = UI.Utils.createShadowRootWithCoreStyles(this, {
            cssFile: 'ui/legacy/components/inline_editor/bezierSwatch.css',
            enableLegacyPatching: false,
            delegatesFocus: undefined,
        });
        this._iconElement = UI.Icon.Icon.create('smallicon-bezier', 'bezier-swatch-icon');
        root.appendChild(this._iconElement);
        this._textElement = this.createChild('span');
        root.createChild('slot');
    }
    static create() {
        let constructor = BezierSwatch._constructor;
        if (!constructor) {
            constructor = UI.Utils.registerCustomElement('span', 'bezier-swatch', BezierSwatch);
            BezierSwatch._constructor = constructor;
        }
        return constructor();
    }
    bezierText() {
        return this._textElement.textContent || '';
    }
    setBezierText(text) {
        this._textElement.textContent = text;
    }
    hideText(hide) {
        this._textElement.hidden = hide;
    }
    iconElement() {
        return this._iconElement;
    }
    static _constructor = null;
}
export class CSSShadowSwatch extends HTMLSpanElement {
    _iconElement;
    _contentElement;
    _colorSwatch;
    _model;
    constructor() {
        super();
        const root = UI.Utils.createShadowRootWithCoreStyles(this, {
            cssFile: 'ui/legacy/components/inline_editor/cssShadowSwatch.css',
            enableLegacyPatching: false,
            delegatesFocus: undefined,
        });
        this._iconElement = UI.Icon.Icon.create('smallicon-shadow', 'shadow-swatch-icon');
        root.appendChild(this._iconElement);
        root.createChild('slot');
        this._contentElement = this.createChild('span');
    }
    static create() {
        let constructor = CSSShadowSwatch._constructor;
        if (!constructor) {
            constructor = UI.Utils.registerCustomElement('span', 'css-shadow-swatch', CSSShadowSwatch);
            CSSShadowSwatch._constructor = constructor;
        }
        return constructor();
    }
    model() {
        return this._model;
    }
    setCSSShadow(model) {
        this._model = model;
        this._contentElement.removeChildren();
        const results = TextUtils.TextUtils.Utils.splitStringByRegexes(model.asCSSText(), [/!important/g, /inset/g, Common.Color.Regex]);
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.regexIndex === 2) {
                if (!this._colorSwatch) {
                    this._colorSwatch = new ColorSwatch();
                    const value = this._colorSwatch.createChild('span');
                    this._colorSwatch.addEventListener('formatchanged', (event) => {
                        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        value.textContent = event.data.text;
                    });
                }
                this._colorSwatch.renderColor(model.color());
                const value = this._colorSwatch.querySelector('span');
                if (value) {
                    value.textContent = model.color().asString();
                }
                this._contentElement.appendChild(this._colorSwatch);
            }
            else {
                this._contentElement.appendChild(document.createTextNode(result.value));
            }
        }
    }
    hideText(hide) {
        this._contentElement.hidden = hide;
    }
    iconElement() {
        return this._iconElement;
    }
    colorSwatch() {
        return this._colorSwatch;
    }
    static _constructor = null;
}
//# sourceMappingURL=Swatches.js.map