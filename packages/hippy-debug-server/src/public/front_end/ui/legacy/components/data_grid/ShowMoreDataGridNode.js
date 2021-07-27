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
import * as i18n from '../../../../core/i18n/i18n.js';
import { DataGridNode } from './DataGrid.js';
const UIStrings = {
    /**
    * @description Shown in a table when there are too many results to show directly. The user can
    * click this button to show more results. This will result in the UI showing X more results before
    * the current position.
    * @example {5} PH1
    */
    showDBefore: 'Show {PH1} before',
    /**
    * @description Shown in a table when there are too many results to show directly. The user can
    * click this button to show more results. This will result in the UI showing X more results after
    * the current position.
    * @example {5} PH1
    */
    showDAfter: 'Show {PH1} after',
    /**
    *@description In a data grid, for a list of items with omitted items, display all omitted items
    *@example {50} PH1
    */
    showAllD: 'Show all {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/data_grid/ShowMoreDataGridNode.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ShowMoreDataGridNode extends DataGridNode {
    _callback;
    _startPosition;
    _endPosition;
    _chunkSize;
    showNext;
    showAll;
    showLast;
    selectable;
    _hasCells;
    constructor(callback, startPosition, endPosition, chunkSize) {
        super({ summaryRow: true }, false);
        this._callback = callback;
        this._startPosition = startPosition;
        this._endPosition = endPosition;
        this._chunkSize = chunkSize;
        this.showNext = document.createElement('button');
        this.showNext.classList.add('text-button');
        this.showNext.type = 'button';
        this.showNext.addEventListener('click', this._showNextChunk.bind(this), false);
        this.showNext.textContent = i18nString(UIStrings.showDBefore, { PH1: this._chunkSize });
        this.showAll = document.createElement('button');
        this.showAll.classList.add('text-button');
        this.showAll.type = 'button';
        this.showAll.addEventListener('click', this._showAll.bind(this), false);
        this.showLast = document.createElement('button');
        this.showLast.classList.add('text-button');
        this.showLast.type = 'button';
        this.showLast.addEventListener('click', this._showLastChunk.bind(this), false);
        this.showLast.textContent = i18nString(UIStrings.showDAfter, { PH1: this._chunkSize });
        this._updateLabels();
        this.selectable = false;
    }
    _showNextChunk() {
        this._callback(this._startPosition, this._startPosition + this._chunkSize);
    }
    _showAll() {
        this._callback(this._startPosition, this._endPosition);
    }
    _showLastChunk() {
        this._callback(this._endPosition - this._chunkSize, this._endPosition);
    }
    _updateLabels() {
        const totalSize = this._endPosition - this._startPosition;
        if (totalSize > this._chunkSize) {
            this.showNext.classList.remove('hidden');
            this.showLast.classList.remove('hidden');
        }
        else {
            this.showNext.classList.add('hidden');
            this.showLast.classList.add('hidden');
        }
        this.showAll.textContent = i18nString(UIStrings.showAllD, { PH1: totalSize });
    }
    createCells(element) {
        this._hasCells = false;
        super.createCells(element);
    }
    createCell(columnIdentifier) {
        const cell = this.createTD(columnIdentifier);
        cell.classList.add('show-more');
        if (!this._hasCells) {
            this._hasCells = true;
            if (this.depth && this.dataGrid) {
                cell.style.setProperty('padding-left', (this.depth * this.dataGrid.indentWidth) + 'px');
            }
            cell.appendChild(this.showNext);
            cell.appendChild(this.showAll);
            cell.appendChild(this.showLast);
        }
        return cell;
    }
    setStartPosition(from) {
        this._startPosition = from;
        this._updateLabels();
    }
    setEndPosition(to) {
        this._endPosition = to;
        this._updateLabels();
    }
    nodeSelfHeight() {
        return 40;
    }
    dispose() {
    }
}
//# sourceMappingURL=ShowMoreDataGridNode.js.map