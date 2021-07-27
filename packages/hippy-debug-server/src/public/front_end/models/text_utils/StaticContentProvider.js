// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { performSearchInContent } from './TextUtils.js';
export class StaticContentProvider {
    _contentURL;
    _contentType;
    _lazyContent;
    constructor(contentURL, contentType, lazyContent) {
        this._contentURL = contentURL;
        this._contentType = contentType;
        this._lazyContent = lazyContent;
    }
    static fromString(contentURL, contentType, content) {
        const lazyContent = () => Promise.resolve({ content, isEncoded: false });
        return new StaticContentProvider(contentURL, contentType, lazyContent);
    }
    contentURL() {
        return this._contentURL;
    }
    contentType() {
        return this._contentType;
    }
    contentEncoded() {
        return Promise.resolve(false);
    }
    requestContent() {
        return this._lazyContent();
    }
    async searchInContent(query, caseSensitive, isRegex) {
        const { content } = await this._lazyContent();
        return content ? performSearchInContent(content, query, caseSensitive, isRegex) : [];
    }
}
//# sourceMappingURL=StaticContentProvider.js.map