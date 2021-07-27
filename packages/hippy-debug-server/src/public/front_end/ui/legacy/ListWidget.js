// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as ARIAUtils from './ARIAUtils.js';
import { Toolbar, ToolbarButton } from './Toolbar.js';
import { Tooltip } from './Tooltip.js';
import { createInput, createTextButton, ElementFocusRestorer } from './UIUtils.js';
import { VBox } from './Widget.js';
const UIStrings = {
    /**
    *@description Text on a button to start editing text
    */
    editString: 'Edit',
    /**
    *@description Label for an item to remove something
    */
    removeString: 'Remove',
    /**
    *@description Text to save something
    */
    saveString: 'Save',
    /**
    *@description Text to add something
    */
    addString: 'Add',
    /**
    *@description Text to cancel something
    */
    cancelString: 'Cancel',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/ListWidget.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ListWidget extends VBox {
    _delegate;
    _list;
    _lastSeparator;
    _focusRestorer;
    _items;
    _editable;
    _elements;
    _editor;
    _editItem;
    _editElement;
    _emptyPlaceholder;
    constructor(delegate, delegatesFocus = true) {
        super(true, delegatesFocus);
        this.registerRequiredCSS('ui/legacy/listWidget.css', { enableLegacyPatching: false });
        this._delegate = delegate;
        this._list = this.contentElement.createChild('div', 'list');
        this._lastSeparator = false;
        this._focusRestorer = null;
        this._items = [];
        this._editable = [];
        this._elements = [];
        this._editor = null;
        this._editItem = null;
        this._editElement = null;
        this._emptyPlaceholder = null;
        this._updatePlaceholder();
    }
    clear() {
        this._items = [];
        this._editable = [];
        this._elements = [];
        this._lastSeparator = false;
        this._list.removeChildren();
        this._updatePlaceholder();
        this._stopEditing();
    }
    appendItem(item, editable) {
        if (this._lastSeparator && this._items.length) {
            const element = document.createElement('div');
            element.classList.add('list-separator');
            this._list.appendChild(element);
        }
        this._lastSeparator = false;
        this._items.push(item);
        this._editable.push(editable);
        const element = this._list.createChild('div', 'list-item');
        element.appendChild(this._delegate.renderItem(item, editable));
        if (editable) {
            element.classList.add('editable');
            element.tabIndex = 0;
            element.appendChild(this._createControls(item, element));
        }
        this._elements.push(element);
        this._updatePlaceholder();
    }
    appendSeparator() {
        this._lastSeparator = true;
    }
    removeItem(index) {
        if (this._editItem === this._items[index]) {
            this._stopEditing();
        }
        const element = this._elements[index];
        const previous = element.previousElementSibling;
        const previousIsSeparator = previous && previous.classList.contains('list-separator');
        const next = element.nextElementSibling;
        const nextIsSeparator = next && next.classList.contains('list-separator');
        if (previousIsSeparator && (nextIsSeparator || !next)) {
            previous.remove();
        }
        if (nextIsSeparator && !previous) {
            next.remove();
        }
        element.remove();
        this._elements.splice(index, 1);
        this._items.splice(index, 1);
        this._editable.splice(index, 1);
        this._updatePlaceholder();
    }
    addNewItem(index, item) {
        this._startEditing(item, null, this._elements[index] || null);
    }
    setEmptyPlaceholder(element) {
        this._emptyPlaceholder = element;
        this._updatePlaceholder();
    }
    _createControls(item, element) {
        const controls = document.createElement('div');
        controls.classList.add('controls-container');
        controls.classList.add('fill');
        controls.createChild('div', 'controls-gradient');
        const buttons = controls.createChild('div', 'controls-buttons');
        const toolbar = new Toolbar('', buttons);
        const editButton = new ToolbarButton(i18nString(UIStrings.editString), 'largeicon-edit');
        editButton.addEventListener(ToolbarButton.Events.Click, onEditClicked.bind(this));
        toolbar.appendToolbarItem(editButton);
        const removeButton = new ToolbarButton(i18nString(UIStrings.removeString), 'largeicon-trash-bin');
        removeButton.addEventListener(ToolbarButton.Events.Click, onRemoveClicked.bind(this));
        toolbar.appendToolbarItem(removeButton);
        return controls;
        function onEditClicked() {
            const index = this._elements.indexOf(element);
            const insertionPoint = this._elements[index + 1] || null;
            this._startEditing(item, element, insertionPoint);
        }
        function onRemoveClicked() {
            const index = this._elements.indexOf(element);
            this.element.focus();
            this._delegate.removeItemRequested(this._items[index], index);
        }
    }
    wasShown() {
        super.wasShown();
        this._stopEditing();
    }
    _updatePlaceholder() {
        if (!this._emptyPlaceholder) {
            return;
        }
        if (!this._elements.length && !this._editor) {
            this._list.appendChild(this._emptyPlaceholder);
        }
        else {
            this._emptyPlaceholder.remove();
        }
    }
    _startEditing(item, element, insertionPoint) {
        if (element && this._editElement === element) {
            return;
        }
        this._stopEditing();
        this._focusRestorer = new ElementFocusRestorer(this.element);
        this._list.classList.add('list-editing');
        this._editItem = item;
        this._editElement = element;
        if (element) {
            element.classList.add('hidden');
        }
        const index = element ? this._elements.indexOf(element) : -1;
        this._editor = this._delegate.beginEdit(item);
        this._updatePlaceholder();
        this._list.insertBefore(this._editor.element, insertionPoint);
        this._editor.beginEdit(item, index, element ? i18nString(UIStrings.saveString) : i18nString(UIStrings.addString), this._commitEditing.bind(this), this._stopEditing.bind(this));
    }
    _commitEditing() {
        const editItem = this._editItem;
        const isNew = !this._editElement;
        const editor = this._editor;
        this._stopEditing();
        if (editItem) {
            this._delegate.commitEdit(editItem, editor, isNew);
        }
    }
    _stopEditing() {
        this._list.classList.remove('list-editing');
        if (this._focusRestorer) {
            this._focusRestorer.restore();
        }
        if (this._editElement) {
            this._editElement.classList.remove('hidden');
        }
        if (this._editor && this._editor.element.parentElement) {
            this._editor.element.remove();
        }
        this._editor = null;
        this._editItem = null;
        this._editElement = null;
        this._updatePlaceholder();
    }
}
export class Editor {
    element;
    _contentElement;
    _commitButton;
    _cancelButton;
    _errorMessageContainer;
    _controls;
    _controlByName;
    _validators;
    _commit;
    _cancel;
    _item;
    _index;
    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('editor-container');
        this.element.addEventListener('keydown', onKeyDown.bind(null, isEscKey, this._cancelClicked.bind(this)), false);
        this.element.addEventListener('keydown', onKeyDown.bind(null, event => event.key === 'Enter', this._commitClicked.bind(this)), false);
        this._contentElement = this.element.createChild('div', 'editor-content');
        const buttonsRow = this.element.createChild('div', 'editor-buttons');
        this._commitButton = createTextButton('', this._commitClicked.bind(this), '', true /* primary */);
        buttonsRow.appendChild(this._commitButton);
        this._cancelButton = createTextButton(i18nString(UIStrings.cancelString), this._cancelClicked.bind(this), '', true /* primary */, 'mousedown');
        this._cancelButton.addEventListener('keydown', onKeyDown.bind(null, event => event.key === 'Enter', this._cancelClicked.bind(this)), false);
        buttonsRow.appendChild(this._cancelButton);
        this._errorMessageContainer = this.element.createChild('div', 'list-widget-input-validation-error');
        ARIAUtils.markAsAlert(this._errorMessageContainer);
        function onKeyDown(predicate, callback, event) {
            if (predicate(event)) {
                event.consume(true);
                callback();
            }
        }
        this._controls = [];
        this._controlByName = new Map();
        this._validators = [];
        this._commit = null;
        this._cancel = null;
        this._item = null;
        this._index = -1;
    }
    contentElement() {
        return this._contentElement;
    }
    createInput(name, type, title, validator) {
        const input = createInput('', type);
        input.placeholder = title;
        input.addEventListener('input', this._validateControls.bind(this, false), false);
        input.addEventListener('blur', this._validateControls.bind(this, false), false);
        ARIAUtils.setAccessibleName(input, title);
        this._controlByName.set(name, input);
        this._controls.push(input);
        this._validators.push(validator);
        return input;
    }
    createSelect(name, options, validator, title) {
        const select = document.createElement('select');
        select.classList.add('chrome-select');
        for (let index = 0; index < options.length; ++index) {
            const option = select.createChild('option');
            option.value = options[index];
            option.textContent = options[index];
        }
        if (title) {
            Tooltip.install(select, title);
            ARIAUtils.setAccessibleName(select, title);
        }
        select.addEventListener('input', this._validateControls.bind(this, false), false);
        select.addEventListener('blur', this._validateControls.bind(this, false), false);
        this._controlByName.set(name, select);
        this._controls.push(select);
        this._validators.push(validator);
        return select;
    }
    control(name) {
        return /** @type {!HTMLInputElement|!HTMLSelectElement} */ this._controlByName.get(name);
    }
    _validateControls(forceValid) {
        let allValid = true;
        this._errorMessageContainer.textContent = '';
        for (let index = 0; index < this._controls.length; ++index) {
            const input = this._controls[index];
            const { valid, errorMessage } = this._validators[index].call(null, this._item, this._index, input);
            input.classList.toggle('error-input', !valid && !forceValid);
            if (valid || forceValid) {
                ARIAUtils.setInvalid(input, false);
            }
            else {
                ARIAUtils.setInvalid(input, true);
            }
            if (!forceValid && errorMessage && !this._errorMessageContainer.textContent) {
                this._errorMessageContainer.textContent = errorMessage;
            }
            allValid = allValid && valid;
        }
        this._commitButton.disabled = !allValid;
    }
    beginEdit(item, index, commitButtonTitle, commit, cancel) {
        this._commit = commit;
        this._cancel = cancel;
        this._item = item;
        this._index = index;
        this._commitButton.textContent = commitButtonTitle;
        this.element.scrollIntoViewIfNeeded(false);
        if (this._controls.length) {
            this._controls[0].focus();
        }
        this._validateControls(true);
    }
    _commitClicked() {
        if (this._commitButton.disabled) {
            return;
        }
        const commit = this._commit;
        this._commit = null;
        this._cancel = null;
        this._item = null;
        this._index = -1;
        if (commit) {
            commit();
        }
    }
    _cancelClicked() {
        const cancel = this._cancel;
        this._commit = null;
        this._cancel = null;
        this._item = null;
        this._index = -1;
        if (cancel) {
            cancel();
        }
    }
}
//# sourceMappingURL=ListWidget.js.map