/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
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
// Ideally, we would rely on platform support for parsing a cookie, since
// this would save us from any potential inconsistency. However, exposing
// platform cookie parsing logic would require quite a bit of additional
// plumbing, and at least some platforms lack support for parsing Cookie,
// which is in a format slightly different from Set-Cookie and is normally
// only required on the server side.
/* eslint-disable rulesdir/no_underscored_properties */
import { Cookie, Type } from './Cookie.js';
export class CookieParser {
    _domain;
    _cookies;
    _input;
    _originalInputLength;
    _lastCookie;
    _lastCookieLine;
    _lastCookiePosition;
    constructor(domain) {
        if (domain) {
            // Handle domain according to
            // https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-5.3.3
            this._domain = domain.toLowerCase().replace(/^\./, '');
        }
        this._cookies = [];
        this._originalInputLength = 0;
    }
    static parseSetCookie(header, domain) {
        return (new CookieParser(domain)).parseSetCookie(header);
    }
    cookies() {
        return this._cookies;
    }
    parseSetCookie(setCookieHeader) {
        if (!this._initialize(setCookieHeader)) {
            return null;
        }
        for (let kv = this._extractKeyValue(); kv; kv = this._extractKeyValue()) {
            if (this._lastCookie) {
                this._lastCookie.addAttribute(kv.key, kv.value);
            }
            else {
                this._addCookie(kv, Type.Response);
            }
            if (this._advanceAndCheckCookieDelimiter()) {
                this._flushCookie();
            }
        }
        this._flushCookie();
        return this._cookies;
    }
    _initialize(headerValue) {
        this._input = headerValue;
        if (typeof headerValue !== 'string') {
            return false;
        }
        this._cookies = [];
        this._lastCookie = null;
        this._lastCookieLine = '';
        this._originalInputLength = this._input.length;
        return true;
    }
    _flushCookie() {
        if (this._lastCookie) {
            // if we have a last cookie we know that these valeus all exist, hence the typecasts
            this._lastCookie.setSize(this._originalInputLength - this._input.length - this._lastCookiePosition);
            this._lastCookie.setCookieLine(this._lastCookieLine.replace('\n', ''));
        }
        this._lastCookie = null;
        this._lastCookieLine = '';
    }
    _extractKeyValue() {
        if (!this._input || !this._input.length) {
            return null;
        }
        // Note: RFCs offer an option for quoted values that may contain commas and semicolons.
        // Many browsers/platforms do not support this, however (see http://webkit.org/b/16699
        // and http://crbug.com/12361). The logic below matches latest versions of IE, Firefox,
        // Chrome and Safari on some old platforms. The latest version of Safari supports quoted
        // cookie values, though.
        const keyValueMatch = /^[ \t]*([^\s=;]+)[ \t]*(?:=[ \t]*([^;\n]*))?/.exec(this._input);
        if (!keyValueMatch) {
            console.error('Failed parsing cookie header before: ' + this._input);
            return null;
        }
        const result = new KeyValue(keyValueMatch[1], keyValueMatch[2] && keyValueMatch[2].trim(), this._originalInputLength - this._input.length);
        this._lastCookieLine += keyValueMatch[0];
        this._input = this._input.slice(keyValueMatch[0].length);
        return result;
    }
    _advanceAndCheckCookieDelimiter() {
        if (!this._input) {
            return false;
        }
        const match = /^\s*[\n;]\s*/.exec(this._input);
        if (!match) {
            return false;
        }
        this._lastCookieLine += match[0];
        this._input = this._input.slice(match[0].length);
        return match[0].match('\n') !== null;
    }
    _addCookie(keyValue, type) {
        if (this._lastCookie) {
            this._lastCookie.setSize(keyValue.position - this._lastCookiePosition);
        }
        // Mozilla bug 169091: Mozilla, IE and Chrome treat single token (w/o "=") as
        // specifying a value for a cookie with empty name.
        this._lastCookie = typeof keyValue.value === 'string' ? new Cookie(keyValue.key, keyValue.value, type) :
            new Cookie('', keyValue.key, type);
        if (this._domain) {
            this._lastCookie.addAttribute('domain', this._domain);
        }
        this._lastCookiePosition = keyValue.position;
        this._cookies.push(this._lastCookie);
    }
}
class KeyValue {
    key;
    value;
    position;
    constructor(key, value, position) {
        this.key = key;
        this.value = value;
        this.position = position;
    }
}
//# sourceMappingURL=CookieParser.js.map