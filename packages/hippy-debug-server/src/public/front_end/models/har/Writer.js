// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import { Log } from './Log.js';
const UIStrings = {
    /**
    *@description Title of progress in harwriter of the network panel
    */
    collectingContent: 'Collecting content…',
    /**
    *@description Text to indicate DevTools is writing to a file
    */
    writingFile: 'Writing file…',
};
const str_ = i18n.i18n.registerUIStrings('models/har/Writer.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class Writer {
    static async write(stream, requests, progress) {
        const compositeProgress = new Common.Progress.CompositeProgress(progress);
        const content = await Writer._harStringForRequests(requests, compositeProgress);
        if (progress.isCanceled()) {
            return;
        }
        await Writer._writeToStream(stream, compositeProgress, content);
    }
    static async _harStringForRequests(requests, compositeProgress) {
        const progress = compositeProgress.createSubProgress();
        progress.setTitle(i18nString(UIStrings.collectingContent));
        progress.setTotalWork(requests.length);
        // Sort by issueTime because this is recorded as startedDateTime in HAR logs.
        requests.sort((reqA, reqB) => reqA.issueTime() - reqB.issueTime());
        const harLog = await Log.build(requests);
        const promises = [];
        for (let i = 0; i < requests.length; i++) {
            const promise = requests[i].contentData();
            promises.push(promise.then(contentLoaded.bind(null, harLog.entries[i])));
        }
        await Promise.all(promises);
        progress.done();
        if (progress.isCanceled()) {
            return '';
        }
        return JSON.stringify({ log: harLog }, null, _jsonIndent);
        function isValidCharacter(codePoint) {
            // Excludes non-characters (U+FDD0..U+FDEF, and all codepoints ending in
            // 0xFFFE or 0xFFFF) from the set of valid code points.
            return codePoint < 0xD800 || (codePoint >= 0xE000 && codePoint < 0xFDD0) ||
                (codePoint > 0xFDEF && codePoint <= 0x10FFFF && (codePoint & 0xFFFE) !== 0xFFFE);
        }
        function needsEncoding(content) {
            for (let i = 0; i < content.length; i++) {
                if (!isValidCharacter(content.charCodeAt(i))) {
                    return true;
                }
            }
            return false;
        }
        function contentLoaded(entry, contentData) {
            progress.worked();
            let encoded = contentData.encoded;
            if (contentData.content !== null) {
                let content = contentData.content;
                if (content && !encoded && needsEncoding(content)) {
                    content = Platform.StringUtilities.toBase64(content);
                    encoded = true;
                }
                entry.response.content.text = content;
            }
            if (encoded) {
                entry.response.content.encoding = 'base64';
            }
        }
    }
    static async _writeToStream(stream, compositeProgress, fileContent) {
        const progress = compositeProgress.createSubProgress();
        progress.setTitle(i18nString(UIStrings.writingFile));
        progress.setTotalWork(fileContent.length);
        for (let i = 0; i < fileContent.length && !progress.isCanceled(); i += _chunkSize) {
            const chunk = fileContent.substr(i, _chunkSize);
            await stream.write(chunk);
            progress.worked(chunk.length);
        }
        progress.done();
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _jsonIndent = 2;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _chunkSize = 100000;
//# sourceMappingURL=Writer.js.map