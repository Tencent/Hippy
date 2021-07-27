// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { DeferredDOMNode } from './DOMModel.js';
import { ResourceTreeModel } from './ResourceTreeModel.js';
const UIStrings = {
    /**
    *@description Error message for when a CSS file can't be loaded
    */
    couldNotFindTheOriginalStyle: 'Could not find the original style sheet.',
    /**
    *@description Error message to display when a source CSS file could not be retrieved.
    */
    thereWasAnErrorRetrievingThe: 'There was an error retrieving the source styles.',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/CSSStyleSheetHeader.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CSSStyleSheetHeader {
    _cssModel;
    id;
    frameId;
    sourceURL;
    hasSourceURL;
    origin;
    title;
    disabled;
    isInline;
    isMutable;
    isConstructed;
    startLine;
    startColumn;
    endLine;
    endColumn;
    contentLength;
    ownerNode;
    sourceMapURL;
    _originalContentProvider;
    constructor(cssModel, payload) {
        this._cssModel = cssModel;
        this.id = payload.styleSheetId;
        this.frameId = payload.frameId;
        this.sourceURL = payload.sourceURL;
        this.hasSourceURL = Boolean(payload.hasSourceURL);
        this.origin = payload.origin;
        this.title = payload.title;
        this.disabled = payload.disabled;
        this.isInline = payload.isInline;
        this.isMutable = payload.isMutable;
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.isConstructed = payload.isConstructed;
        this.startLine = payload.startLine;
        this.startColumn = payload.startColumn;
        this.endLine = payload.endLine;
        this.endColumn = payload.endColumn;
        this.contentLength = payload.length;
        if (payload.ownerNode) {
            this.ownerNode = new DeferredDOMNode(cssModel.target(), payload.ownerNode);
        }
        this.sourceMapURL = payload.sourceMapURL;
        this._originalContentProvider = null;
    }
    originalContentProvider() {
        if (!this._originalContentProvider) {
            const lazyContent = (async () => {
                const originalText = await this._cssModel.originalStyleSheetText(this);
                if (originalText === null) {
                    return { content: null, error: i18nString(UIStrings.couldNotFindTheOriginalStyle), isEncoded: false };
                }
                return { content: originalText, isEncoded: false };
            });
            this._originalContentProvider =
                new TextUtils.StaticContentProvider.StaticContentProvider(this.contentURL(), this.contentType(), lazyContent);
        }
        return this._originalContentProvider;
    }
    setSourceMapURL(sourceMapURL) {
        this.sourceMapURL = sourceMapURL;
    }
    cssModel() {
        return this._cssModel;
    }
    isAnonymousInlineStyleSheet() {
        return !this.resourceURL() && !this._cssModel.sourceMapManager().sourceMapForClient(this);
    }
    resourceURL() {
        return this.isViaInspector() ? this._viaInspectorResourceURL() : this.sourceURL;
    }
    _viaInspectorResourceURL() {
        const model = this._cssModel.target().model(ResourceTreeModel);
        console.assert(Boolean(model));
        if (!model) {
            return '';
        }
        const frame = model.frameForId(this.frameId);
        if (!frame) {
            return '';
        }
        console.assert(Boolean(frame));
        const parsedURL = new Common.ParsedURL.ParsedURL(frame.url);
        let fakeURL = 'inspector://' + parsedURL.host + parsedURL.folderPathComponents;
        if (!fakeURL.endsWith('/')) {
            fakeURL += '/';
        }
        fakeURL += 'inspector-stylesheet';
        return fakeURL;
    }
    lineNumberInSource(lineNumberInStyleSheet) {
        return this.startLine + lineNumberInStyleSheet;
    }
    columnNumberInSource(lineNumberInStyleSheet, columnNumberInStyleSheet) {
        return (lineNumberInStyleSheet ? 0 : this.startColumn) + columnNumberInStyleSheet;
    }
    /**
     * Checks whether the position is in this style sheet. Assumes that the
     * position's columnNumber is consistent with line endings.
     */
    containsLocation(lineNumber, columnNumber) {
        const afterStart = (lineNumber === this.startLine && columnNumber >= this.startColumn) || lineNumber > this.startLine;
        const beforeEnd = lineNumber < this.endLine || (lineNumber === this.endLine && columnNumber <= this.endColumn);
        return afterStart && beforeEnd;
    }
    contentURL() {
        return this.resourceURL();
    }
    contentType() {
        return Common.ResourceType.resourceTypes.Stylesheet;
    }
    contentEncoded() {
        return Promise.resolve(false);
    }
    async requestContent() {
        try {
            const cssText = await this._cssModel.getStyleSheetText(this.id);
            return { content: cssText, isEncoded: false };
        }
        catch (err) {
            return {
                content: null,
                error: i18nString(UIStrings.thereWasAnErrorRetrievingThe),
                isEncoded: false,
            };
        }
    }
    async searchInContent(query, caseSensitive, isRegex) {
        const requestedContent = await this.requestContent();
        if (requestedContent.content === null) {
            return [];
        }
        return TextUtils.TextUtils.performSearchInContent(requestedContent.content, query, caseSensitive, isRegex);
    }
    isViaInspector() {
        return this.origin === 'inspector';
    }
    createPageResourceLoadInitiator() {
        return { target: null, frameId: this.frameId, initiatorUrl: this.hasSourceURL ? '' : this.sourceURL };
    }
}
//# sourceMappingURL=CSSStyleSheetHeader.js.map