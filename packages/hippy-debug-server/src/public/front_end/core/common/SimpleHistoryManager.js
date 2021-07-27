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
export class SimpleHistoryManager {
    _entries;
    _activeEntryIndex;
    _coalescingReadonly;
    _historyDepth;
    constructor(historyDepth) {
        this._entries = [];
        this._activeEntryIndex = -1;
        // Lock is used to make sure that reveal() does not
        // make any changes to the history while we are
        // rolling back or rolling over.
        this._coalescingReadonly = 0;
        this._historyDepth = historyDepth;
    }
    _readOnlyLock() {
        ++this._coalescingReadonly;
    }
    _releaseReadOnlyLock() {
        --this._coalescingReadonly;
    }
    _getPreviousValidIndex() {
        if (this.empty()) {
            return -1;
        }
        let revealIndex = this._activeEntryIndex - 1;
        while (revealIndex >= 0 && !this._entries[revealIndex].valid()) {
            --revealIndex;
        }
        if (revealIndex < 0) {
            return -1;
        }
        return revealIndex;
    }
    _getNextValidIndex() {
        let revealIndex = this._activeEntryIndex + 1;
        while (revealIndex < this._entries.length && !this._entries[revealIndex].valid()) {
            ++revealIndex;
        }
        if (revealIndex >= this._entries.length) {
            return -1;
        }
        return revealIndex;
    }
    _readOnly() {
        return Boolean(this._coalescingReadonly);
    }
    filterOut(filterOutCallback) {
        if (this._readOnly()) {
            return;
        }
        const filteredEntries = [];
        let removedBeforeActiveEntry = 0;
        for (let i = 0; i < this._entries.length; ++i) {
            if (!filterOutCallback(this._entries[i])) {
                filteredEntries.push(this._entries[i]);
            }
            else if (i <= this._activeEntryIndex) {
                ++removedBeforeActiveEntry;
            }
        }
        this._entries = filteredEntries;
        this._activeEntryIndex = Math.max(0, this._activeEntryIndex - removedBeforeActiveEntry);
    }
    empty() {
        return !this._entries.length;
    }
    active() {
        return this.empty() ? null : this._entries[this._activeEntryIndex];
    }
    push(entry) {
        if (this._readOnly()) {
            return;
        }
        if (!this.empty()) {
            this._entries.splice(this._activeEntryIndex + 1);
        }
        this._entries.push(entry);
        if (this._entries.length > this._historyDepth) {
            this._entries.shift();
        }
        this._activeEntryIndex = this._entries.length - 1;
    }
    canRollback() {
        return this._getPreviousValidIndex() >= 0;
    }
    canRollover() {
        return this._getNextValidIndex() >= 0;
    }
    rollback() {
        const revealIndex = this._getPreviousValidIndex();
        if (revealIndex === -1) {
            return false;
        }
        this._readOnlyLock();
        this._activeEntryIndex = revealIndex;
        this._entries[revealIndex].reveal();
        this._releaseReadOnlyLock();
        return true;
    }
    rollover() {
        const revealIndex = this._getNextValidIndex();
        if (revealIndex === -1) {
            return false;
        }
        this._readOnlyLock();
        this._activeEntryIndex = revealIndex;
        this._entries[revealIndex].reveal();
        this._releaseReadOnlyLock();
        return true;
    }
}
//# sourceMappingURL=SimpleHistoryManager.js.map