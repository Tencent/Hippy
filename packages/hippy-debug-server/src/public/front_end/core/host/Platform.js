/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
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
/* eslint-disable @typescript-eslint/naming-convention */
import { InspectorFrontendHostInstance } from './InspectorFrontendHost.js';
let _platform;
export function platform() {
    if (!_platform) {
        _platform = InspectorFrontendHostInstance.platform();
    }
    return _platform;
}
let _isMac;
export function isMac() {
    if (typeof _isMac === 'undefined') {
        _isMac = platform() === 'mac';
    }
    return _isMac;
}
let _isWin;
export function isWin() {
    if (typeof _isWin === 'undefined') {
        _isWin = platform() === 'windows';
    }
    return _isWin;
}
let _isCustomDevtoolsFrontend;
export function isCustomDevtoolsFrontend() {
    if (typeof _isCustomDevtoolsFrontend === 'undefined') {
        _isCustomDevtoolsFrontend = window.location.toString().startsWith('devtools://devtools/custom/');
    }
    return _isCustomDevtoolsFrontend;
}
let _fontFamily;
export function fontFamily() {
    if (_fontFamily) {
        return _fontFamily;
    }
    switch (platform()) {
        case 'linux':
            _fontFamily = 'Roboto, Ubuntu, Arial, sans-serif';
            break;
        case 'mac':
            _fontFamily = '\'Lucida Grande\', sans-serif';
            break;
        case 'windows':
            _fontFamily = '\'Segoe UI\', Tahoma, sans-serif';
            break;
    }
    return _fontFamily;
}
//# sourceMappingURL=Platform.js.map