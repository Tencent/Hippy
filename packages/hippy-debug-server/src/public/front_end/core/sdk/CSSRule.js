// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TextUtils from '../../models/text_utils/text_utils.js';
import { CSSMedia } from './CSSMedia.js';
import { CSSStyleDeclaration, Type } from './CSSStyleDeclaration.js';
export class CSSRule {
    _cssModel;
    styleSheetId;
    sourceURL;
    origin;
    style;
    constructor(cssModel, payload) {
        this._cssModel = cssModel;
        this.styleSheetId = payload.styleSheetId;
        if (this.styleSheetId) {
            const styleSheetHeader = this._getStyleSheetHeader(this.styleSheetId);
            this.sourceURL = styleSheetHeader.sourceURL;
        }
        this.origin = payload.origin;
        this.style = new CSSStyleDeclaration(this._cssModel, this, payload.style, Type.Regular);
    }
    rebase(edit) {
        if (this.styleSheetId !== edit.styleSheetId) {
            return;
        }
        this.style.rebase(edit);
    }
    resourceURL() {
        if (!this.styleSheetId) {
            return '';
        }
        const styleSheetHeader = this._getStyleSheetHeader(this.styleSheetId);
        return styleSheetHeader.resourceURL();
    }
    isUserAgent() {
        return this.origin === "user-agent" /* UserAgent */;
    }
    isInjected() {
        return this.origin === "injected" /* Injected */;
    }
    isViaInspector() {
        return this.origin === "inspector" /* Inspector */;
    }
    isRegular() {
        return this.origin === "regular" /* Regular */;
    }
    cssModel() {
        return this._cssModel;
    }
    _getStyleSheetHeader(styleSheetId) {
        const styleSheetHeader = this._cssModel.styleSheetHeaderForId(styleSheetId);
        console.assert(styleSheetHeader !== null);
        return /** @type {!CSSStyleSheetHeader} */ styleSheetHeader;
    }
}
class CSSValue {
    text;
    range;
    constructor(payload) {
        this.text = payload.text;
        if (payload.range) {
            this.range = TextUtils.TextRange.TextRange.fromObject(payload.range);
        }
    }
    rebase(edit) {
        if (!this.range) {
            return;
        }
        this.range = this.range.rebaseAfterTextEdit(edit.oldRange, edit.newRange);
    }
}
export class CSSStyleRule extends CSSRule {
    selectors;
    media;
    wasUsed;
    constructor(cssModel, payload, wasUsed) {
        // TODO(crbug.com/1011811): Replace with spread operator or better types once Closure is gone.
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this._reinitializeSelectors(payload.selectorList);
        this.media = payload.media ? CSSMedia.parseMediaArrayPayload(cssModel, payload.media) : [];
        this.wasUsed = wasUsed || false;
    }
    static createDummyRule(cssModel, selectorText) {
        const dummyPayload = {
            selectorList: {
                text: '',
                selectors: [{ text: selectorText, value: undefined }],
            },
            style: {
                styleSheetId: '0',
                range: new TextUtils.TextRange.TextRange(0, 0, 0, 0),
                shorthandEntries: [],
                cssProperties: [],
            },
            origin: "inspector" /* Inspector */,
        };
        return new CSSStyleRule(cssModel, dummyPayload);
    }
    _reinitializeSelectors(selectorList) {
        this.selectors = [];
        for (let i = 0; i < selectorList.selectors.length; ++i) {
            this.selectors.push(new CSSValue(selectorList.selectors[i]));
        }
    }
    setSelectorText(newSelector) {
        const styleSheetId = this.styleSheetId;
        if (!styleSheetId) {
            throw 'No rule stylesheet id';
        }
        const range = this.selectorRange();
        if (!range) {
            throw 'Rule selector is not editable';
        }
        return this._cssModel.setSelectorText(styleSheetId, range, newSelector);
    }
    selectorText() {
        return this.selectors.map(selector => selector.text).join(', ');
    }
    selectorRange() {
        const firstRange = this.selectors[0].range;
        const lastRange = this.selectors[this.selectors.length - 1].range;
        if (!firstRange || !lastRange) {
            return null;
        }
        return new TextUtils.TextRange.TextRange(firstRange.startLine, firstRange.startColumn, lastRange.endLine, lastRange.endColumn);
    }
    lineNumberInSource(selectorIndex) {
        const selector = this.selectors[selectorIndex];
        if (!selector || !selector.range || !this.styleSheetId) {
            return 0;
        }
        const styleSheetHeader = this._getStyleSheetHeader(this.styleSheetId);
        return styleSheetHeader.lineNumberInSource(selector.range.startLine);
    }
    columnNumberInSource(selectorIndex) {
        const selector = this.selectors[selectorIndex];
        if (!selector || !selector.range || !this.styleSheetId) {
            return undefined;
        }
        const styleSheetHeader = this._getStyleSheetHeader(this.styleSheetId);
        return styleSheetHeader.columnNumberInSource(selector.range.startLine, selector.range.startColumn);
    }
    rebase(edit) {
        if (this.styleSheetId !== edit.styleSheetId) {
            return;
        }
        const range = this.selectorRange();
        if (range && range.equal(edit.oldRange)) {
            this._reinitializeSelectors(edit.payload);
        }
        else {
            for (let i = 0; i < this.selectors.length; ++i) {
                this.selectors[i].rebase(edit);
            }
        }
        for (const media of this.media) {
            media.rebase(edit);
        }
        super.rebase(edit);
    }
}
export class CSSKeyframesRule {
    _cssModel;
    _animationName;
    _keyframes;
    constructor(cssModel, payload) {
        this._cssModel = cssModel;
        this._animationName = new CSSValue(payload.animationName);
        this._keyframes = payload.keyframes.map(keyframeRule => new CSSKeyframeRule(cssModel, keyframeRule));
    }
    name() {
        return this._animationName;
    }
    keyframes() {
        return this._keyframes;
    }
}
export class CSSKeyframeRule extends CSSRule {
    _keyText;
    constructor(cssModel, payload) {
        // TODO(crbug.com/1011811): Replace with spread operator or better types once Closure is gone.
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this._reinitializeKey(payload.keyText);
    }
    key() {
        return this._keyText;
    }
    _reinitializeKey(payload) {
        this._keyText = new CSSValue(payload);
    }
    rebase(edit) {
        if (this.styleSheetId !== edit.styleSheetId || !this._keyText.range) {
            return;
        }
        if (edit.oldRange.equal(this._keyText.range)) {
            this._reinitializeKey(edit.payload);
        }
        else {
            this._keyText.rebase(edit);
        }
        super.rebase(edit);
    }
    setKeyText(newKeyText) {
        const styleSheetId = this.styleSheetId;
        if (!styleSheetId) {
            throw 'No rule stylesheet id';
        }
        const range = this._keyText.range;
        if (!range) {
            throw 'Keyframe key is not editable';
        }
        return this._cssModel.setKeyframeKey(styleSheetId, range, newKeyText);
    }
}
//# sourceMappingURL=CSSRule.js.map