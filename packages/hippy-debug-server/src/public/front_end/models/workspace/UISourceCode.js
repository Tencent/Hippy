/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../text_utils/text_utils.js';
import { Events as WorkspaceImplEvents, projectTypes } from './WorkspaceImpl.js';
const UIStrings = {
    /**
    *@description Text for the index of something
    */
    index: '(index)',
    /**
    *@description Text in UISource Code of the DevTools local workspace
    */
    thisFileWasChangedExternally: 'This file was changed externally. Would you like to reload it?',
};
const str_ = i18n.i18n.registerUIStrings('models/workspace/UISourceCode.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class UISourceCode extends Common.ObjectWrapper.ObjectWrapper {
    _project;
    _url;
    _origin;
    _parentURL;
    _name;
    _contentType;
    _requestContentPromise;
    _decorations;
    _hasCommits;
    _messages;
    _contentLoaded;
    _content;
    _forceLoadOnCheckContent;
    _checkingContent;
    _lastAcceptedContent;
    _workingCopy;
    _workingCopyGetter;
    _disableEdit;
    _contentEncoded;
    constructor(project, url, contentType) {
        super();
        this._project = project;
        this._url = url;
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(url);
        if (parsedURL) {
            this._origin = parsedURL.securityOrigin();
            this._parentURL = this._origin + parsedURL.folderPathComponents;
            this._name = parsedURL.lastPathComponent;
            if (parsedURL.queryParams) {
                this._name += '?' + parsedURL.queryParams;
            }
        }
        else {
            this._origin = '';
            this._parentURL = '';
            this._name = url;
        }
        this._contentType = contentType;
        this._requestContentPromise = null;
        this._decorations = null;
        this._hasCommits = false;
        this._messages = null;
        this._contentLoaded = false;
        this._content = null;
        this._forceLoadOnCheckContent = false;
        this._checkingContent = false;
        this._lastAcceptedContent = null;
        this._workingCopy = null;
        this._workingCopyGetter = null;
        this._disableEdit = false;
    }
    requestMetadata() {
        return this._project.requestMetadata(this);
    }
    name() {
        return this._name;
    }
    mimeType() {
        return this._project.mimeType(this);
    }
    url() {
        return this._url;
    }
    parentURL() {
        return this._parentURL;
    }
    origin() {
        return this._origin;
    }
    fullDisplayName() {
        return this._project.fullDisplayName(this);
    }
    displayName(skipTrim) {
        if (!this._name) {
            return i18nString(UIStrings.index);
        }
        let name = this._name;
        try {
            if (this.project().type() === projectTypes.FileSystem) {
                name = unescape(name);
            }
            else {
                name = decodeURI(name);
            }
        }
        catch (error) {
        }
        return skipTrim ? name : Platform.StringUtilities.trimEndWithMaxLength(name, 100);
    }
    canRename() {
        return this._project.canRename();
    }
    rename(newName) {
        let fulfill;
        const promise = new Promise(x => {
            fulfill = x;
        });
        this._project.rename(this, newName, innerCallback.bind(this));
        return promise;
        function innerCallback(success, newName, newURL, newContentType) {
            if (success) {
                this._updateName(newName, newURL, newContentType);
            }
            fulfill(success);
        }
    }
    remove() {
        this._project.deleteFile(this);
    }
    _updateName(name, url, contentType) {
        const oldURL = this._url;
        this._url = this._url.substring(0, this._url.length - this._name.length) + name;
        this._name = name;
        if (url) {
            this._url = url;
        }
        if (contentType) {
            this._contentType = contentType;
        }
        this.dispatchEventToListeners(Events.TitleChanged, this);
        this.project().workspace().dispatchEventToListeners(WorkspaceImplEvents.UISourceCodeRenamed, { oldURL: oldURL, uiSourceCode: this });
    }
    contentURL() {
        return this.url();
    }
    contentType() {
        return this._contentType;
    }
    async contentEncoded() {
        await this.requestContent();
        return this._contentEncoded || false;
    }
    project() {
        return this._project;
    }
    requestContent() {
        if (this._requestContentPromise) {
            return this._requestContentPromise;
        }
        if (this._contentLoaded) {
            return Promise.resolve(this._content);
        }
        this._requestContentPromise = this._requestContentImpl();
        return this._requestContentPromise;
    }
    async _requestContentImpl() {
        try {
            const content = await this._project.requestFileContent(this);
            if (!this._contentLoaded) {
                this._contentLoaded = true;
                this._content = content;
                this._contentEncoded = content.isEncoded;
            }
        }
        catch (err) {
            this._contentLoaded = true;
            this._content = { content: null, error: err ? String(err) : '', isEncoded: false };
        }
        return this._content;
    }
    async checkContentUpdated() {
        if (!this._contentLoaded && !this._forceLoadOnCheckContent) {
            return;
        }
        if (!this._project.canSetFileContent() || this._checkingContent) {
            return;
        }
        this._checkingContent = true;
        const updatedContent = await this._project.requestFileContent(this);
        if ('error' in updatedContent) {
            return;
        }
        this._checkingContent = false;
        if (updatedContent.content === null) {
            const workingCopy = this.workingCopy();
            this._contentCommitted('', false);
            this.setWorkingCopy(workingCopy);
            return;
        }
        if (this._lastAcceptedContent === updatedContent.content) {
            return;
        }
        if (this._content && 'content' in this._content && this._content.content === updatedContent.content) {
            this._lastAcceptedContent = null;
            return;
        }
        if (!this.isDirty() || this._workingCopy === updatedContent.content) {
            this._contentCommitted(updatedContent.content, false);
            return;
        }
        await Common.Revealer.reveal(this);
        // Make sure we are in the next frame before stopping the world with confirm
        await new Promise(resolve => setTimeout(resolve, 0));
        const shouldUpdate = window.confirm(i18nString(UIStrings.thisFileWasChangedExternally));
        if (shouldUpdate) {
            this._contentCommitted(updatedContent.content, false);
        }
        else {
            this._lastAcceptedContent = updatedContent.content;
        }
    }
    forceLoadOnCheckContent() {
        this._forceLoadOnCheckContent = true;
    }
    _commitContent(content) {
        if (this._project.canSetFileContent()) {
            this._project.setFileContent(this, content, false);
        }
        this._contentCommitted(content, true);
    }
    _contentCommitted(content, committedByUser) {
        this._lastAcceptedContent = null;
        this._content = { content, isEncoded: false };
        this._contentLoaded = true;
        this._requestContentPromise = null;
        this._hasCommits = true;
        this._innerResetWorkingCopy();
        const data = { uiSourceCode: this, content, encoded: this._contentEncoded };
        this.dispatchEventToListeners(Events.WorkingCopyCommitted, data);
        this._project.workspace().dispatchEventToListeners(WorkspaceImplEvents.WorkingCopyCommitted, data);
        if (committedByUser) {
            this._project.workspace().dispatchEventToListeners(WorkspaceImplEvents.WorkingCopyCommittedByUser, data);
        }
    }
    addRevision(content) {
        this._commitContent(content);
    }
    hasCommits() {
        return this._hasCommits;
    }
    workingCopy() {
        if (this._workingCopyGetter) {
            this._workingCopy = this._workingCopyGetter();
            this._workingCopyGetter = null;
        }
        if (this.isDirty()) {
            return this._workingCopy;
        }
        return (this._content && 'content' in this._content && this._content.content) || '';
    }
    resetWorkingCopy() {
        this._innerResetWorkingCopy();
        this._workingCopyChanged();
    }
    _innerResetWorkingCopy() {
        this._workingCopy = null;
        this._workingCopyGetter = null;
    }
    setWorkingCopy(newWorkingCopy) {
        this._workingCopy = newWorkingCopy;
        this._workingCopyGetter = null;
        this._workingCopyChanged();
    }
    setContent(content, isBase64) {
        this._contentEncoded = isBase64;
        if (this._project.canSetFileContent()) {
            this._project.setFileContent(this, content, isBase64);
        }
        this._contentCommitted(content, true);
    }
    setWorkingCopyGetter(workingCopyGetter) {
        this._workingCopyGetter = workingCopyGetter;
        this._workingCopyChanged();
    }
    _workingCopyChanged() {
        this._removeAllMessages();
        this.dispatchEventToListeners(Events.WorkingCopyChanged, this);
        this._project.workspace().dispatchEventToListeners(WorkspaceImplEvents.WorkingCopyChanged, { uiSourceCode: this });
    }
    removeWorkingCopyGetter() {
        if (!this._workingCopyGetter) {
            return;
        }
        this._workingCopy = this._workingCopyGetter();
        this._workingCopyGetter = null;
    }
    commitWorkingCopy() {
        if (this.isDirty()) {
            this._commitContent(this.workingCopy());
        }
    }
    isDirty() {
        return this._workingCopy !== null || this._workingCopyGetter !== null;
    }
    extension() {
        return Common.ParsedURL.ParsedURL.extractExtension(this._name);
    }
    content() {
        return (this._content && 'content' in this._content && this._content.content) || '';
    }
    loadError() {
        return (this._content && 'error' in this._content && this._content.error) || null;
    }
    searchInContent(query, caseSensitive, isRegex) {
        const content = this.content();
        if (!content) {
            return this._project.searchInFileContent(this, query, caseSensitive, isRegex);
        }
        return Promise.resolve(TextUtils.TextUtils.performSearchInContent(content, query, caseSensitive, isRegex));
    }
    contentLoaded() {
        return this._contentLoaded;
    }
    uiLocation(lineNumber, columnNumber) {
        return new UILocation(this, lineNumber, columnNumber);
    }
    messages() {
        return this._messages ? new Set(this._messages) : new Set();
    }
    addLineMessage(level, text, lineNumber, columnNumber, clickHandler) {
        const range = TextUtils.TextRange.TextRange.createFromLocation(lineNumber, columnNumber || 0);
        const message = new Message(level, text, clickHandler, range);
        this.addMessage(message);
        return message;
    }
    addMessage(message) {
        if (!this._messages) {
            this._messages = new Set();
        }
        this._messages.add(message);
        this.dispatchEventToListeners(Events.MessageAdded, message);
    }
    removeMessage(message) {
        if (this._messages && this._messages.delete(message)) {
            this.dispatchEventToListeners(Events.MessageRemoved, message);
        }
    }
    _removeAllMessages() {
        if (!this._messages) {
            return;
        }
        for (const message of this._messages) {
            this.dispatchEventToListeners(Events.MessageRemoved, message);
        }
        this._messages = null;
    }
    addLineDecoration(lineNumber, type, data) {
        this.addDecoration(TextUtils.TextRange.TextRange.createFromLocation(lineNumber, 0), type, data);
    }
    addDecoration(range, type, data) {
        const marker = new LineMarker(range, type, data);
        if (!this._decorations) {
            this._decorations = new Platform.MapUtilities.Multimap();
        }
        this._decorations.set(type, marker);
        this.dispatchEventToListeners(Events.LineDecorationAdded, marker);
    }
    removeDecorationsForType(type) {
        if (!this._decorations) {
            return;
        }
        const markers = this._decorations.get(type);
        this._decorations.deleteAll(type);
        markers.forEach(marker => {
            this.dispatchEventToListeners(Events.LineDecorationRemoved, marker);
        });
    }
    allDecorations() {
        return this._decorations ? this._decorations.valuesArray() : [];
    }
    removeAllDecorations() {
        if (!this._decorations) {
            return;
        }
        const decorationList = this._decorations.valuesArray();
        this._decorations.clear();
        decorationList.forEach(marker => this.dispatchEventToListeners(Events.LineDecorationRemoved, marker));
    }
    decorationsForType(type) {
        return this._decorations ? this._decorations.get(type) : null;
    }
    disableEdit() {
        this._disableEdit = true;
    }
    editDisabled() {
        return this._disableEdit;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["WorkingCopyChanged"] = "WorkingCopyChanged";
    Events["WorkingCopyCommitted"] = "WorkingCopyCommitted";
    Events["TitleChanged"] = "TitleChanged";
    Events["MessageAdded"] = "MessageAdded";
    Events["MessageRemoved"] = "MessageRemoved";
    Events["LineDecorationAdded"] = "LineDecorationAdded";
    Events["LineDecorationRemoved"] = "LineDecorationRemoved";
})(Events || (Events = {}));
export class UILocation {
    uiSourceCode;
    lineNumber;
    columnNumber;
    constructor(uiSourceCode, lineNumber, columnNumber) {
        this.uiSourceCode = uiSourceCode;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }
    linkText(skipTrim) {
        let linkText = this.uiSourceCode.displayName(skipTrim);
        if (this.uiSourceCode.mimeType() === 'application/wasm') {
            // For WebAssembly locations, we follow the conventions described in
            // github.com/WebAssembly/design/blob/master/Web.md#developer-facing-display-conventions
            if (typeof this.columnNumber === 'number') {
                linkText += `:0x${this.columnNumber.toString(16)}`;
            }
        }
        else if (typeof this.lineNumber === 'number') {
            linkText += ':' + (this.lineNumber + 1);
        }
        return linkText;
    }
    id() {
        if (typeof this.columnNumber === 'number') {
            return this.uiSourceCode.project().id() + ':' + this.uiSourceCode.url() + ':' + this.lineNumber + ':' +
                this.columnNumber;
        }
        return this.lineId();
    }
    lineId() {
        return this.uiSourceCode.project().id() + ':' + this.uiSourceCode.url() + ':' + this.lineNumber;
    }
    toUIString() {
        return this.uiSourceCode.url() + ':' + (this.lineNumber + 1);
    }
    static comparator(location1, location2) {
        return location1.compareTo(location2);
    }
    compareTo(other) {
        if (this.uiSourceCode.url() !== other.uiSourceCode.url()) {
            return this.uiSourceCode.url() > other.uiSourceCode.url() ? 1 : -1;
        }
        if (this.lineNumber !== other.lineNumber) {
            return this.lineNumber - other.lineNumber;
        }
        // We consider `undefined` less than an actual column number, since
        // UI location without a column number corresponds to the whole line.
        if (this.columnNumber === other.columnNumber) {
            return 0;
        }
        if (typeof this.columnNumber !== 'number') {
            return -1;
        }
        if (typeof other.columnNumber !== 'number') {
            return 1;
        }
        return this.columnNumber - other.columnNumber;
    }
}
/**
 * A message associated with a range in a `UISourceCode`. The range will be
 * underlined starting at the range's start and ending at the line end (the
 * end of the range is currently disregarded).
 * An icon is going to appear at the end of the line according to the
 * `level` of the Message. This is only the model; displaying is handled
 * where UISourceCode displaying is handled.
 */
export class Message {
    _level;
    _text;
    _range;
    _clickHandler;
    constructor(level, text, clickHandler, range) {
        this._level = level;
        this._text = text;
        this._range = range ?? new TextUtils.TextRange.TextRange(0, 0, 0, 0);
        this._clickHandler = clickHandler;
    }
    level() {
        return this._level;
    }
    text() {
        return this._text;
    }
    clickHandler() {
        return this._clickHandler;
    }
    lineNumber() {
        return this._range.startLine;
    }
    columnNumber() {
        return this._range.startColumn;
    }
    isEqual(another) {
        return this.text() === another.text() && this.level() === another.level() && this._range.equal(another._range);
    }
}
(function (Message) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Level;
    (function (Level) {
        Level["Error"] = "Error";
        Level["Issue"] = "Issue";
        Level["Warning"] = "Warning";
    })(Level = Message.Level || (Message.Level = {}));
})(Message || (Message = {}));
export class LineMarker {
    _range;
    _type;
    _data;
    constructor(range, type, data) {
        this._range = range;
        this._type = type;
        this._data = data;
    }
    range() {
        return this._range;
    }
    type() {
        return this._type;
    }
    data() {
        return this._data;
    }
}
export class UISourceCodeMetadata {
    modificationTime;
    contentSize;
    constructor(modificationTime, contentSize) {
        this.modificationTime = modificationTime;
        this.contentSize = contentSize;
    }
}
//# sourceMappingURL=UISourceCode.js.map