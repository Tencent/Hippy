// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
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
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
    *@description Text that appears on a button for the font resource type filter.
    */
    font: 'Font',
    /**
    *@description Aria accessible name in Font View of the Sources panel
    *@example {https://example.com} PH1
    */
    previewOfFontFromS: 'Preview of font from {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/source_frame/FontView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FontView extends UI.View.SimpleView {
    _url;
    _mimeType;
    _contentProvider;
    _mimeTypeLabel;
    fontPreviewElement;
    _dummyElement;
    fontStyleElement;
    _inResize;
    constructor(mimeType, contentProvider) {
        super(i18nString(UIStrings.font));
        this.registerRequiredCSS('ui/legacy/components/source_frame/fontView.css', { enableLegacyPatching: false });
        this.element.classList.add('font-view');
        this._url = contentProvider.contentURL();
        UI.ARIAUtils.setAccessibleName(this.element, i18nString(UIStrings.previewOfFontFromS, { PH1: this._url }));
        this._mimeType = mimeType;
        this._contentProvider = contentProvider;
        this._mimeTypeLabel = new UI.Toolbar.ToolbarText(mimeType);
    }
    async toolbarItems() {
        return [this._mimeTypeLabel];
    }
    _onFontContentLoaded(uniqueFontName, deferredContent) {
        const { content } = deferredContent;
        const url = content ? TextUtils.ContentProvider.contentAsDataURL(content, this._mimeType, true) : this._url;
        if (!this.fontStyleElement) {
            return;
        }
        this.fontStyleElement.textContent =
            Platform.StringUtilities.sprintf('@font-face { font-family: "%s"; src: url(%s); }', uniqueFontName, url);
        this.updateFontPreviewSize();
    }
    _createContentIfNeeded() {
        if (this.fontPreviewElement) {
            return;
        }
        const uniqueFontName = 'WebInspectorFontPreview' + (++_fontId);
        this.fontStyleElement = document.createElement('style');
        this._contentProvider.requestContent().then(deferredContent => {
            this._onFontContentLoaded(uniqueFontName, deferredContent);
        });
        this.element.appendChild(this.fontStyleElement);
        const fontPreview = document.createElement('div');
        for (let i = 0; i < _fontPreviewLines.length; ++i) {
            if (i > 0) {
                fontPreview.createChild('br');
            }
            UI.UIUtils.createTextChild(fontPreview, _fontPreviewLines[i]);
        }
        this.fontPreviewElement = fontPreview.cloneNode(true);
        if (!this.fontPreviewElement) {
            return;
        }
        UI.ARIAUtils.markAsHidden(this.fontPreviewElement);
        this.fontPreviewElement.style.overflow = 'hidden';
        this.fontPreviewElement.style.setProperty('font-family', uniqueFontName);
        this.fontPreviewElement.style.setProperty('visibility', 'hidden');
        this._dummyElement = fontPreview;
        this._dummyElement.style.visibility = 'hidden';
        this._dummyElement.style.zIndex = '-1';
        this._dummyElement.style.display = 'inline';
        this._dummyElement.style.position = 'absolute';
        this._dummyElement.style.setProperty('font-family', uniqueFontName);
        this._dummyElement.style.setProperty('font-size', _measureFontSize + 'px');
        this.element.appendChild(this.fontPreviewElement);
    }
    wasShown() {
        this._createContentIfNeeded();
        this.updateFontPreviewSize();
    }
    onResize() {
        if (this._inResize) {
            return;
        }
        this._inResize = true;
        try {
            this.updateFontPreviewSize();
        }
        finally {
            this._inResize = null;
        }
    }
    _measureElement() {
        if (!this._dummyElement) {
            throw new Error('No font preview loaded');
        }
        this.element.appendChild(this._dummyElement);
        const result = { width: this._dummyElement.offsetWidth, height: this._dummyElement.offsetHeight };
        this.element.removeChild(this._dummyElement);
        return result;
    }
    updateFontPreviewSize() {
        if (!this.fontPreviewElement || !this.isShowing()) {
            return;
        }
        this.fontPreviewElement.style.removeProperty('visibility');
        const dimension = this._measureElement();
        const height = dimension.height;
        const width = dimension.width;
        // Subtract some padding. This should match the paddings in the CSS plus room for the scrollbar.
        const containerWidth = this.element.offsetWidth - 50;
        const containerHeight = this.element.offsetHeight - 30;
        if (!height || !width || !containerWidth || !containerHeight) {
            this.fontPreviewElement.style.removeProperty('font-size');
            return;
        }
        const widthRatio = containerWidth / width;
        const heightRatio = containerHeight / height;
        const finalFontSize = Math.floor(_measureFontSize * Math.min(widthRatio, heightRatio)) - 2;
        this.fontPreviewElement.style.setProperty('font-size', finalFontSize + 'px', undefined);
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
let _fontId = 0;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
const _fontPreviewLines = ['ABCDEFGHIJKLM', 'NOPQRSTUVWXYZ', 'abcdefghijklm', 'nopqrstuvwxyz', '1234567890'];
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
const _measureFontSize = 50;
//# sourceMappingURL=FontView.js.map