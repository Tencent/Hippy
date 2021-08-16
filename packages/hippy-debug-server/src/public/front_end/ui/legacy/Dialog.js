/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import * as ARIAUtils from './ARIAUtils.js';
import { GlassPane, PointerEventsBehavior } from './GlassPane.js';
import { InspectorView } from './InspectorView.js';
import { KeyboardShortcut, Keys } from './KeyboardShortcut.js';
import { WidgetFocusRestorer } from './Widget.js';
export class Dialog extends GlassPane {
    _tabIndexBehavior;
    _tabIndexMap;
    _focusRestorer;
    _closeOnEscape;
    _targetDocument;
    _targetDocumentKeyDownHandler;
    _escapeKeyCallback;
    constructor() {
        super();
        this.registerRequiredCSS('ui/legacy/dialog.css', { enableLegacyPatching: false });
        this.contentElement.tabIndex = 0;
        this.contentElement.addEventListener('focus', () => this.widget().focus(), false);
        this.widget().setDefaultFocusedElement(this.contentElement);
        this.setPointerEventsBehavior(PointerEventsBehavior.BlockedByGlassPane);
        this.setOutsideClickCallback(event => {
            this.hide();
            event.consume(true);
        });
        ARIAUtils.markAsModalDialog(this.contentElement);
        this._tabIndexBehavior = OutsideTabIndexBehavior.DisableAllOutsideTabIndex;
        this._tabIndexMap = new Map();
        this._focusRestorer = null;
        this._closeOnEscape = true;
        this._targetDocumentKeyDownHandler = this._onKeyDown.bind(this);
        this._escapeKeyCallback = null;
    }
    static hasInstance() {
        return Boolean(Dialog._instance);
    }
    show(where) {
        const document = (where instanceof Document ? where : (where || InspectorView.instance().element).ownerDocument);
        this._targetDocument = document;
        this._targetDocument.addEventListener('keydown', this._targetDocumentKeyDownHandler, true);
        if (Dialog._instance) {
            Dialog._instance.hide();
        }
        Dialog._instance = this;
        this._disableTabIndexOnElements(document);
        super.show(document);
        this._focusRestorer = new WidgetFocusRestorer(this.widget());
    }
    hide() {
        if (this._focusRestorer) {
            this._focusRestorer.restore();
        }
        super.hide();
        if (this._targetDocument) {
            this._targetDocument.removeEventListener('keydown', this._targetDocumentKeyDownHandler, true);
        }
        this._restoreTabIndexOnElements();
        this.dispatchEventToListeners('hidden');
        Dialog._instance = null;
    }
    setCloseOnEscape(close) {
        this._closeOnEscape = close;
    }
    setEscapeKeyCallback(callback) {
        this._escapeKeyCallback = callback;
    }
    addCloseButton() {
        const closeButton = this.contentElement.createChild('div', 'dialog-close-button', 'dt-close-button');
        closeButton.gray = true;
        closeButton.addEventListener('click', () => this.hide(), false);
    }
    setOutsideTabIndexBehavior(tabIndexBehavior) {
        this._tabIndexBehavior = tabIndexBehavior;
    }
    _disableTabIndexOnElements(document) {
        if (this._tabIndexBehavior === OutsideTabIndexBehavior.PreserveTabIndex) {
            return;
        }
        let exclusionSet = null;
        if (this._tabIndexBehavior === OutsideTabIndexBehavior.PreserveMainViewTabIndex) {
            exclusionSet = this._getMainWidgetTabIndexElements(InspectorView.instance().ownerSplit());
        }
        this._tabIndexMap.clear();
        let node = document;
        for (; node; node = node.traverseNextNode(document)) {
            if (node instanceof HTMLElement) {
                const element = node;
                const tabIndex = element.tabIndex;
                if (tabIndex >= 0 && (!exclusionSet || !exclusionSet.has(element))) {
                    this._tabIndexMap.set(element, tabIndex);
                    element.tabIndex = -1;
                }
            }
        }
    }
    _getMainWidgetTabIndexElements(splitWidget) {
        const elementSet = new Set();
        if (!splitWidget) {
            return elementSet;
        }
        const mainWidget = splitWidget.mainWidget();
        if (!mainWidget || !mainWidget.element) {
            return elementSet;
        }
        let node = mainWidget.element;
        for (; node; node = node.traverseNextNode(mainWidget.element)) {
            if (!(node instanceof HTMLElement)) {
                continue;
            }
            const element = node;
            const tabIndex = element.tabIndex;
            if (tabIndex < 0) {
                continue;
            }
            elementSet.add(element);
        }
        return elementSet;
    }
    _restoreTabIndexOnElements() {
        for (const element of this._tabIndexMap.keys()) {
            element.tabIndex = this._tabIndexMap.get(element);
        }
        this._tabIndexMap.clear();
    }
    _onKeyDown(event) {
        const keyboardEvent = event;
        if (keyboardEvent.keyCode === Keys.Esc.code && KeyboardShortcut.hasNoModifiers(event)) {
            if (this._escapeKeyCallback) {
                this._escapeKeyCallback(event);
            }
            if (event.handled) {
                return;
            }
            if (this._closeOnEscape) {
                event.consume(true);
                this.hide();
            }
        }
    }
    static _instance = null;
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var OutsideTabIndexBehavior;
(function (OutsideTabIndexBehavior) {
    OutsideTabIndexBehavior["DisableAllOutsideTabIndex"] = "DisableAllTabIndex";
    OutsideTabIndexBehavior["PreserveMainViewTabIndex"] = "PreserveMainViewTabIndex";
    OutsideTabIndexBehavior["PreserveTabIndex"] = "PreserveTabIndex";
})(OutsideTabIndexBehavior || (OutsideTabIndexBehavior = {}));
//# sourceMappingURL=Dialog.js.map