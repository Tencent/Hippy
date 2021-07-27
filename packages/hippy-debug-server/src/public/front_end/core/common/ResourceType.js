// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2012 Google Inc.  All rights reserved.
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
import * as i18n from '../i18n/i18n.js';
import { ParsedURL } from './ParsedURL.js';
const UIStrings = {
    /**
    *@description Text that appears in a tooltip the xhr and fetch resource types filter.
    */
    xhrAndFetch: '`XHR` and `Fetch`',
    /**
    *@description Text that appears in a tooltip for the JavaScript types filter.
    */
    scripts: 'Scripts',
    /**
    *@description Text that appears on a button for the JavaScript resource type filter.
    */
    js: 'JS',
    /**
    *@description Text that appears in a tooltip for the css types filter.
    */
    stylesheets: 'Stylesheets',
    /**
    *@description Text that appears on a button for the css resource type filter.
    */
    css: 'CSS',
    /**
    *@description Text that appears in a tooltip for the image types filter.
    */
    images: 'Images',
    /**
    *@description Text that appears on a button for the image resource type filter.
    */
    img: 'Img',
    /**
    *@description Text that appears on a button for the media resource type filter.
    */
    media: 'Media',
    /**
    *@description Text that appears in a tooltip for the resource types filter.
    */
    fonts: 'Fonts',
    /**
    *@description Text that appears on a button for the font resource type filter.
    */
    font: 'Font',
    /**
    *@description Text for documents, a type of resources
    */
    documents: 'Documents',
    /**
    *@description Text that appears on a button for the document resource type filter.
    */
    doc: 'Doc',
    /**
    *@description Text that appears in a tooltip for the websocket types filter.
    */
    websockets: 'WebSockets',
    /**
    *@description Text that appears on a button for the websocket resource type filter.
    */
    ws: 'WS',
    /**
    *@description Text that appears in a tooltip for the WebAssembly types filter.
    */
    webassembly: 'WebAssembly',
    /**
    *@description Text that appears on a button for the WebAssembly resource type filter.
    */
    wasm: 'Wasm',
    /**
    *@description Text that appears on a button for the manifest resource type filter.
    */
    manifest: 'Manifest',
    /**
    *@description Text for other types of items
    */
    other: 'Other',
    /**
    *@description Name of a network resource type
    */
    document: 'Document',
    /**
    *@description Name of a network resource type
    */
    stylesheet: 'Stylesheet',
    /**
    *@description Text in Image View of the Sources panel
    */
    image: 'Image',
    /**
    *@description Label for a group of JavaScript files
    */
    script: 'Script',
    /**
    *@description Name of a network resource type
    */
    texttrack: 'TextTrack',
    /**
    *@description Name of a network resource type
    */
    fetch: 'Fetch',
    /**
    *@description Name of a network resource type
    */
    eventsource: 'EventSource',
    /**
    *@description Name of a network resource type
    */
    websocket: 'WebSocket',
    /**
    *@description Name of a network resource type
    */
    webtransport: 'WebTransport',
    /**
    *@description Name of a network resource type
    */
    signedexchange: 'SignedExchange',
    /**
    *@description Name of a network resource type
    */
    ping: 'Ping',
    /**
    *@description Name of a network resource type
    */
    cspviolationreport: 'CSPViolationReport',
    /**
    *@description Name of a network initiator type
    */
    preflight: 'Preflight',
    /**
    *@description Name of a network initiator type
    */
    webbundle: 'WebBundle',
};
const str_ = i18n.i18n.registerUIStrings('core/common/ResourceType.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class ResourceType {
    _name;
    _title;
    _category;
    _isTextType;
    constructor(name, title, category, isTextType) {
        this._name = name;
        this._title = title;
        this._category = category;
        this._isTextType = isTextType;
    }
    static fromMimeType(mimeType) {
        if (!mimeType) {
            return resourceTypes.Other;
        }
        if (mimeType.startsWith('text/html')) {
            return resourceTypes.Document;
        }
        if (mimeType.startsWith('text/css')) {
            return resourceTypes.Stylesheet;
        }
        if (mimeType.startsWith('image/')) {
            return resourceTypes.Image;
        }
        if (mimeType.startsWith('text/')) {
            return resourceTypes.Script;
        }
        if (mimeType.includes('font')) {
            return resourceTypes.Font;
        }
        if (mimeType.includes('script')) {
            return resourceTypes.Script;
        }
        if (mimeType.includes('octet')) {
            return resourceTypes.Other;
        }
        if (mimeType.includes('application')) {
            return resourceTypes.Script;
        }
        return resourceTypes.Other;
    }
    static fromMimeTypeOverride(mimeType) {
        if (mimeType === 'application/wasm') {
            return resourceTypes.Wasm;
        }
        if (mimeType === 'application/webbundle') {
            return resourceTypes.WebBundle;
        }
        return null;
    }
    static fromURL(url) {
        return _resourceTypeByExtension.get(ParsedURL.extractExtension(url)) || null;
    }
    static fromName(name) {
        for (const resourceTypeId in resourceTypes) {
            const resourceType = resourceTypes[resourceTypeId];
            if (resourceType.name() === name) {
                return resourceType;
            }
        }
        return null;
    }
    static mimeFromURL(url) {
        const name = ParsedURL.extractName(url);
        if (_mimeTypeByName.has(name)) {
            return _mimeTypeByName.get(name);
        }
        const ext = ParsedURL.extractExtension(url).toLowerCase();
        return _mimeTypeByExtension.get(ext);
    }
    static mimeFromExtension(ext) {
        return _mimeTypeByExtension.get(ext);
    }
    name() {
        return this._name;
    }
    title() {
        return this._title();
    }
    category() {
        return this._category;
    }
    isTextType() {
        return this._isTextType;
    }
    isScript() {
        return this._name === 'script' || this._name === 'sm-script';
    }
    hasScripts() {
        return this.isScript() || this.isDocument();
    }
    isStyleSheet() {
        return this._name === 'stylesheet' || this._name === 'sm-stylesheet';
    }
    isDocument() {
        return this._name === 'document';
    }
    isDocumentOrScriptOrStyleSheet() {
        return this.isDocument() || this.isScript() || this.isStyleSheet();
    }
    isImage() {
        return this._name === 'image';
    }
    isFromSourceMap() {
        return this._name.startsWith('sm-');
    }
    toString() {
        return this._name;
    }
    canonicalMimeType() {
        if (this.isDocument()) {
            return 'text/html';
        }
        if (this.isScript()) {
            return 'text/javascript';
        }
        if (this.isStyleSheet()) {
            return 'text/css';
        }
        return '';
    }
}
export class ResourceCategory {
    title;
    shortTitle;
    constructor(title, shortTitle) {
        this.title = title;
        this.shortTitle = shortTitle;
    }
}
export const resourceCategories = {
    XHR: new ResourceCategory(i18nLazyString(UIStrings.xhrAndFetch), i18n.i18n.lockedLazyString('Fetch/XHR')),
    Script: new ResourceCategory(i18nLazyString(UIStrings.scripts), i18nLazyString(UIStrings.js)),
    Stylesheet: new ResourceCategory(i18nLazyString(UIStrings.stylesheets), i18nLazyString(UIStrings.css)),
    Image: new ResourceCategory(i18nLazyString(UIStrings.images), i18nLazyString(UIStrings.img)),
    Media: new ResourceCategory(i18nLazyString(UIStrings.media), i18nLazyString(UIStrings.media)),
    Font: new ResourceCategory(i18nLazyString(UIStrings.fonts), i18nLazyString(UIStrings.font)),
    Document: new ResourceCategory(i18nLazyString(UIStrings.documents), i18nLazyString(UIStrings.doc)),
    WebSocket: new ResourceCategory(i18nLazyString(UIStrings.websockets), i18nLazyString(UIStrings.ws)),
    Wasm: new ResourceCategory(i18nLazyString(UIStrings.webassembly), i18nLazyString(UIStrings.wasm)),
    Manifest: new ResourceCategory(i18nLazyString(UIStrings.manifest), i18nLazyString(UIStrings.manifest)),
    Other: new ResourceCategory(i18nLazyString(UIStrings.other), i18nLazyString(UIStrings.other)),
};
/**
 * This enum is a superset of all types defined in WebCore::InspectorPageAgent::resourceTypeJson
 * For DevTools-only types that are based on MIME-types that are backed by other request types
 * (for example Wasm that is based on Fetch), additional types are added here.
 * For these types, make sure to update `fromMimeTypeOverride` to implement the custom logic.
 */
export const resourceTypes = {
    Document: new ResourceType('document', i18nLazyString(UIStrings.document), resourceCategories.Document, true),
    Stylesheet: new ResourceType('stylesheet', i18nLazyString(UIStrings.stylesheet), resourceCategories.Stylesheet, true),
    Image: new ResourceType('image', i18nLazyString(UIStrings.image), resourceCategories.Image, false),
    Media: new ResourceType('media', i18nLazyString(UIStrings.media), resourceCategories.Media, false),
    Font: new ResourceType('font', i18nLazyString(UIStrings.font), resourceCategories.Font, false),
    Script: new ResourceType('script', i18nLazyString(UIStrings.script), resourceCategories.Script, true),
    TextTrack: new ResourceType('texttrack', i18nLazyString(UIStrings.texttrack), resourceCategories.Other, true),
    XHR: new ResourceType('xhr', i18n.i18n.lockedLazyString('XHR'), resourceCategories.XHR, true),
    Fetch: new ResourceType('fetch', i18nLazyString(UIStrings.fetch), resourceCategories.XHR, true),
    EventSource: new ResourceType('eventsource', i18nLazyString(UIStrings.eventsource), resourceCategories.XHR, true),
    WebSocket: new ResourceType('websocket', i18nLazyString(UIStrings.websocket), resourceCategories.WebSocket, false),
    // TODO(yoichio): Consider creating new category WT or WS/WT with WebSocket.
    WebTransport: new ResourceType('webtransport', i18nLazyString(UIStrings.webtransport), resourceCategories.WebSocket, false),
    Wasm: new ResourceType('wasm', i18nLazyString(UIStrings.wasm), resourceCategories.Wasm, false),
    Manifest: new ResourceType('manifest', i18nLazyString(UIStrings.manifest), resourceCategories.Manifest, true),
    SignedExchange: new ResourceType('signed-exchange', i18nLazyString(UIStrings.signedexchange), resourceCategories.Other, false),
    Ping: new ResourceType('ping', i18nLazyString(UIStrings.ping), resourceCategories.Other, false),
    CSPViolationReport: new ResourceType('csp-violation-report', i18nLazyString(UIStrings.cspviolationreport), resourceCategories.Other, false),
    Other: new ResourceType('other', i18nLazyString(UIStrings.other), resourceCategories.Other, false),
    Preflight: new ResourceType('preflight', i18nLazyString(UIStrings.preflight), resourceCategories.Other, true),
    SourceMapScript: new ResourceType('sm-script', i18nLazyString(UIStrings.script), resourceCategories.Script, true),
    SourceMapStyleSheet: new ResourceType('sm-stylesheet', i18nLazyString(UIStrings.stylesheet), resourceCategories.Stylesheet, true),
    WebBundle: new ResourceType('webbundle', i18nLazyString(UIStrings.webbundle), resourceCategories.Other, false),
};
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _mimeTypeByName = new Map([
    // CoffeeScript
    ['Cakefile', 'text/x-coffeescript'],
]);
// clang-format off
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _resourceTypeByExtension = new Map([
    ['js', resourceTypes.Script],
    ['mjs', resourceTypes.Script],
    ['css', resourceTypes.Stylesheet],
    ['xsl', resourceTypes.Stylesheet],
    ['avif', resourceTypes.Image],
    ['avifs', resourceTypes.Image],
    ['bmp', resourceTypes.Image],
    ['gif', resourceTypes.Image],
    ['ico', resourceTypes.Image],
    ['jpeg', resourceTypes.Image],
    ['jpg', resourceTypes.Image],
    ['jxl', resourceTypes.Image],
    ['png', resourceTypes.Image],
    ['svg', resourceTypes.Image],
    ['tif', resourceTypes.Image],
    ['tiff', resourceTypes.Image],
    ['webp', resourceTypes.Media],
    ['otf', resourceTypes.Font],
    ['ttc', resourceTypes.Font],
    ['ttf', resourceTypes.Font],
    ['woff', resourceTypes.Font],
    ['woff2', resourceTypes.Font],
    ['wasm', resourceTypes.Wasm],
]);
// clang-format on
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _mimeTypeByExtension = new Map([
    // Web extensions
    ['js', 'text/javascript'],
    ['mjs', 'text/javascript'],
    ['css', 'text/css'],
    ['html', 'text/html'],
    ['htm', 'text/html'],
    ['xml', 'application/xml'],
    ['xsl', 'application/xml'],
    ['wasm', 'application/wasm'],
    // HTML Embedded Scripts, ASP], JSP
    ['asp', 'application/x-aspx'],
    ['aspx', 'application/x-aspx'],
    ['jsp', 'application/x-jsp'],
    // C/C++
    ['c', 'text/x-c++src'],
    ['cc', 'text/x-c++src'],
    ['cpp', 'text/x-c++src'],
    ['h', 'text/x-c++src'],
    ['m', 'text/x-c++src'],
    ['mm', 'text/x-c++src'],
    // CoffeeScript
    ['coffee', 'text/x-coffeescript'],
    // Dart
    ['dart', 'text/javascript'],
    // TypeScript
    ['ts', 'text/typescript'],
    ['tsx', 'text/typescript-jsx'],
    // JSON
    ['json', 'application/json'],
    ['gyp', 'application/json'],
    ['gypi', 'application/json'],
    // C#
    ['cs', 'text/x-csharp'],
    // Java
    ['java', 'text/x-java'],
    // Less
    ['less', 'text/x-less'],
    // PHP
    ['php', 'text/x-php'],
    ['phtml', 'application/x-httpd-php'],
    // Python
    ['py', 'text/x-python'],
    // Shell
    ['sh', 'text/x-sh'],
    // SCSS
    ['scss', 'text/x-scss'],
    // Video Text Tracks.
    ['vtt', 'text/vtt'],
    // LiveScript
    ['ls', 'text/x-livescript'],
    // Markdown
    ['md', 'text/markdown'],
    // ClojureScript
    ['cljs', 'text/x-clojure'],
    ['cljc', 'text/x-clojure'],
    ['cljx', 'text/x-clojure'],
    // Stylus
    ['styl', 'text/x-styl'],
    // JSX
    ['jsx', 'text/jsx'],
    // Image
    ['avif', 'image/avif'],
    ['avifs', 'image/avif-sequence'],
    ['bmp', 'image/bmp'],
    ['gif', 'image/gif'],
    ['ico', 'image/ico'],
    ['jpeg', 'image/jpeg'],
    ['jpg', 'image/jpeg'],
    ['jxl', 'image/jxl'],
    ['png', 'image/png'],
    ['svg', 'image/svg+xml'],
    ['tif', 'image/tif'],
    ['tiff', 'image/tiff'],
    ['webp', 'image/webp'],
    // Font
    ['otf', 'font/otf'],
    ['ttc', 'font/collection'],
    ['ttf', 'font/ttf'],
    ['woff', 'font/woff'],
    ['woff2', 'font/woff2'],
]);
//# sourceMappingURL=ResourceType.js.map