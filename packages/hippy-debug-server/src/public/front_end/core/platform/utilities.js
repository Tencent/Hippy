// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
/* The long term goal here is to remove all functions in this file and
 * replace them with ES Module functions rather than prototype
 * extensions but in the mean time if an old func in here depends on one
 * that has been migrated, it will need to be imported.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import { caseInsensetiveComparator, regexSpecialCharacters, sprintf } from './string-utilities.js';
// Still used in the test runners that can't use ES modules :(
String.sprintf = sprintf;
// @ts-ignore https://crbug.com/1050549
String.regexSpecialCharacters = regexSpecialCharacters;
// @ts-ignore https://crbug.com/1050549
String.caseInsensetiveComparator = caseInsensetiveComparator;
self.createPlainTextSearchRegex = function (query, flags) {
    // This should be kept the same as the one in StringUtil.cpp.
    let regex = '';
    for (let i = 0; i < query.length; ++i) {
        const c = query.charAt(i);
        if (regexSpecialCharacters().indexOf(c) !== -1) {
            regex += '\\';
        }
        regex += c;
    }
    return new RegExp(regex, flags || '');
};
export function runOnWindowLoad(callback) {
    function windowLoaded() {
        window.removeEventListener('DOMContentLoaded', windowLoaded, false);
        callback();
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        callback();
    }
    else {
        window.addEventListener('DOMContentLoaded', windowLoaded, false);
    }
}
export function assertNever(type, message) {
    throw new Error(message);
}
//# sourceMappingURL=utilities.js.map