/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as TextRange from './TextRange.js';
export function toPos(range) {
    return {
        start: new CodeMirror.Pos(range.startLine, range.startColumn),
        end: new CodeMirror.Pos(range.endLine, range.endColumn),
    };
}
export function toRange(start, end) {
    return new TextRange.TextRange(start.line, start.ch, end.line, end.ch);
}
export function changeObjectToEditOperation(changeObject) {
    const oldRange = toRange(changeObject.from, changeObject.to);
    const newRange = oldRange.clone();
    const linesAdded = changeObject.text.length;
    if (linesAdded === 0) {
        newRange.endLine = newRange.startLine;
        newRange.endColumn = newRange.startColumn;
    }
    else if (linesAdded === 1) {
        newRange.endLine = newRange.startLine;
        newRange.endColumn = newRange.startColumn + changeObject.text[0].length;
    }
    else {
        newRange.endLine = newRange.startLine + linesAdded - 1;
        newRange.endColumn = changeObject.text[linesAdded - 1].length;
    }
    return { oldRange: oldRange, newRange: newRange };
}
export function pullLines(codeMirror, linesCount) {
    const lines = [];
    // @ts-expect-error CodeMirror types do not specify eachLine.
    codeMirror.eachLine(0, linesCount, onLineHandle);
    return lines;
    function onLineHandle(lineHandle) {
        lines.push(lineHandle.text);
    }
}
let tokenizerFactoryInstance;
export class TokenizerFactory {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!tokenizerFactoryInstance || forceNew) {
            tokenizerFactoryInstance = new TokenizerFactory();
        }
        return tokenizerFactoryInstance;
    }
    // https://crbug.com/1151919 * = CodeMirror.Mode
    getMode(mimeType) {
        return CodeMirror.getMode({ indentUnit: 2 }, mimeType);
    }
    // https://crbug.com/1151919 * = CodeMirror.Mode
    createTokenizer(mimeType, mode) {
        const cmMode = mode || CodeMirror.getMode({ indentUnit: 2 }, mimeType);
        const state = CodeMirror.startState(cmMode);
        function tokenize(line, callback) {
            const stream = new CodeMirror.StringStream(line);
            while (!stream.eol()) {
                const style = cmMode.token(stream, state);
                const value = stream.current();
                callback(value, style, stream.start, stream.start + value.length);
                stream.start = stream.pos;
            }
        }
        return tokenize;
    }
}
//# sourceMappingURL=CodeMirrorUtils.js.map