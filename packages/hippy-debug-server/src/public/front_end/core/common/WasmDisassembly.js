// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class WasmDisassembly {
    _offsets;
    _functionBodyOffsets;
    constructor(offsets, functionBodyOffsets) {
        this._offsets = offsets;
        this._functionBodyOffsets = functionBodyOffsets;
    }
    get lineNumbers() {
        return this._offsets.length;
    }
    bytecodeOffsetToLineNumber(bytecodeOffset) {
        let l = 0, r = this._offsets.length - 1;
        while (l <= r) {
            const m = Math.floor((l + r) / 2);
            const offset = this._offsets[m];
            if (offset < bytecodeOffset) {
                l = m + 1;
            }
            else if (offset > bytecodeOffset) {
                r = m - 1;
            }
            else {
                return m;
            }
        }
        return l;
    }
    lineNumberToBytecodeOffset(lineNumber) {
        return this._offsets[lineNumber];
    }
    /**
     * returns an iterable enumerating all the non-breakable line numbers in the disassembly
     */
    *nonBreakableLineNumbers() {
        let lineNumber = 0;
        let functionIndex = 0;
        while (lineNumber < this.lineNumbers) {
            if (functionIndex < this._functionBodyOffsets.length) {
                const offset = this.lineNumberToBytecodeOffset(lineNumber);
                if (offset >= this._functionBodyOffsets[functionIndex].start) {
                    lineNumber = this.bytecodeOffsetToLineNumber(this._functionBodyOffsets[functionIndex++].end);
                    continue;
                }
            }
            yield lineNumber++;
        }
    }
}
//# sourceMappingURL=WasmDisassembly.js.map