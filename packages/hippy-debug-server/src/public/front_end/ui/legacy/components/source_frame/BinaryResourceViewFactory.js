// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TextUtils from '../../../../models/text_utils/text_utils.js'; // eslint-disable-line no-unused-vars
import { ResourceSourceFrame } from './ResourceSourceFrame.js';
export class BinaryResourceViewFactory {
    _base64content;
    _contentUrl;
    _resourceType;
    _arrayPromise;
    _hexPromise;
    _utf8Promise;
    constructor(base64content, contentUrl, resourceType) {
        this._base64content = base64content;
        this._contentUrl = contentUrl;
        this._resourceType = resourceType;
        this._arrayPromise = null;
        this._hexPromise = null;
        this._utf8Promise = null;
    }
    async _fetchContentAsArray() {
        if (!this._arrayPromise) {
            this._arrayPromise = new Promise(async (resolve) => {
                const fetchResponse = await fetch('data:;base64,' + this._base64content);
                resolve(new Uint8Array(await fetchResponse.arrayBuffer()));
            });
        }
        return await this._arrayPromise;
    }
    async hex() {
        if (!this._hexPromise) {
            const content = await this._fetchContentAsArray();
            const hexString = BinaryResourceViewFactory.uint8ArrayToHexString(content);
            return { content: hexString, isEncoded: false };
        }
        return this._hexPromise;
    }
    async base64() {
        return { content: this._base64content, isEncoded: true };
    }
    async utf8() {
        if (!this._utf8Promise) {
            this._utf8Promise = new Promise(async (resolve) => {
                const content = await this._fetchContentAsArray();
                const utf8String = new TextDecoder('utf8').decode(content);
                resolve({ content: utf8String, isEncoded: false });
            });
        }
        return this._utf8Promise;
    }
    createBase64View() {
        return new ResourceSourceFrame(TextUtils.StaticContentProvider.StaticContentProvider.fromString(this._contentUrl, this._resourceType, this._base64content), 
        /* autoPrettyPrint */ false, { lineNumbers: false, lineWrapping: true });
    }
    createHexView() {
        const hexViewerContentProvider = new TextUtils.StaticContentProvider.StaticContentProvider(this._contentUrl, this._resourceType, async () => {
            const contentAsArray = await this._fetchContentAsArray();
            const content = BinaryResourceViewFactory.uint8ArrayToHexViewer(contentAsArray);
            return { content, isEncoded: false };
        });
        return new ResourceSourceFrame(hexViewerContentProvider, 
        /* autoPrettyPrint */ false, { lineNumbers: false, lineWrapping: false });
    }
    createUtf8View() {
        const utf8fn = this.utf8.bind(this);
        const utf8ContentProvider = new TextUtils.StaticContentProvider.StaticContentProvider(this._contentUrl, this._resourceType, utf8fn);
        return new ResourceSourceFrame(utf8ContentProvider, 
        /* autoPrettyPrint */ false, { lineNumbers: true, lineWrapping: true });
    }
    static uint8ArrayToHexString(uint8Array) {
        let output = '';
        for (let i = 0; i < uint8Array.length; i++) {
            output += BinaryResourceViewFactory.numberToHex(uint8Array[i], 2);
        }
        return output;
    }
    static numberToHex(number, padding) {
        let hex = number.toString(16);
        while (hex.length < padding) {
            hex = '0' + hex;
        }
        return hex;
    }
    static uint8ArrayToHexViewer(array) {
        let output = '';
        let line = 0;
        while ((line * 16) < array.length) {
            const lineArray = array.slice(line * 16, (line + 1) * 16);
            // line number
            output += BinaryResourceViewFactory.numberToHex(line, 8) + ':';
            // hex
            let hexColsPrinted = 0;
            for (let i = 0; i < lineArray.length; i++) {
                if (i % 2 === 0) {
                    output += ' ';
                    hexColsPrinted++;
                }
                output += BinaryResourceViewFactory.numberToHex(lineArray[i], 2);
                hexColsPrinted += 2;
            }
            // hex-ascii padding
            while (hexColsPrinted < 42) {
                output += ' ';
                hexColsPrinted++;
            }
            // ascii
            for (let i = 0; i < lineArray.length; i++) {
                const code = lineArray[i];
                if (code >= 32 && code <= 126) {
                    // printable ascii character
                    output += String.fromCharCode(code);
                }
                else {
                    // non-printable
                    output += '.';
                }
            }
            output += '\n';
            line++;
        }
        return output;
    }
}
//# sourceMappingURL=BinaryResourceViewFactory.js.map