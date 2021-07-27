// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import { Keys } from './KeyboardShortcut.js';
import { registerCustomElement } from './utils/register-custom-element.js';
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _constructor = null;
export class HistoryInput extends HTMLInputElement {
    _history;
    _historyPosition;
    constructor() {
        super();
        this._history = [''];
        this._historyPosition = 0;
        this.addEventListener('keydown', this._onKeyDown.bind(this), false);
        this.addEventListener('input', this._onInput.bind(this), false);
    }
    static create() {
        if (!_constructor) {
            _constructor = registerCustomElement('input', 'history-input', HistoryInput);
        }
        return _constructor();
    }
    _onInput(_event) {
        if (this._history.length === this._historyPosition + 1) {
            this._history[this._history.length - 1] = this.value;
        }
    }
    _onKeyDown(ev) {
        const event = ev;
        if (event.keyCode === Keys.Up.code) {
            this._historyPosition = Math.max(this._historyPosition - 1, 0);
            this.value = this._history[this._historyPosition];
            this.dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
            event.consume(true);
        }
        else if (event.keyCode === Keys.Down.code) {
            this._historyPosition = Math.min(this._historyPosition + 1, this._history.length - 1);
            this.value = this._history[this._historyPosition];
            this.dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
            event.consume(true);
        }
        else if (event.keyCode === Keys.Enter.code) {
            this._saveToHistory();
        }
    }
    _saveToHistory() {
        if (this._history.length > 1 && this._history[this._history.length - 2] === this.value) {
            return;
        }
        this._history[this._history.length - 1] = this.value;
        this._historyPosition = this._history.length - 1;
        this._history.push('');
    }
}
//# sourceMappingURL=HistoryInput.js.map