// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in Network Manage Custom Headers View of the Network panel
    */
    manageHeaderColumns: 'Manage Header Columns',
    /**
    *@description Placeholder text content in Network Manage Custom Headers View of the Network panel
    */
    noCustomHeaders: 'No custom headers',
    /**
    *@description Text of add button in Network Manage Custom Headers View of the Network panel
    */
    addCustomHeader: 'Add custom header…',
    /**
    *@description Text in Network Manage Custom Headers View of the Network panel
    */
    headerName: 'Header Name',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkManageCustomHeadersView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class NetworkManageCustomHeadersView extends UI.Widget.VBox {
    _list;
    _columnConfigs;
    _addHeaderColumnCallback;
    _changeHeaderColumnCallback;
    _removeHeaderColumnCallback;
    _editor;
    constructor(columnData, addHeaderColumnCallback, changeHeaderColumnCallback, removeHeaderColumnCallback) {
        super(true);
        this.registerRequiredCSS('panels/network/networkManageCustomHeadersView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('custom-headers-wrapper');
        this.contentElement.createChild('div', 'header').textContent = i18nString(UIStrings.manageHeaderColumns);
        this._list = new UI.ListWidget.ListWidget(this);
        this._list.element.classList.add('custom-headers-list');
        this._list.registerRequiredCSS('panels/network/networkManageCustomHeadersView.css', { enableLegacyPatching: false });
        const placeholder = document.createElement('div');
        placeholder.classList.add('custom-headers-list-list-empty');
        placeholder.textContent = i18nString(UIStrings.noCustomHeaders);
        this._list.setEmptyPlaceholder(placeholder);
        this._list.show(this.contentElement);
        this.contentElement.appendChild(UI.UIUtils.createTextButton(i18nString(UIStrings.addCustomHeader), this._addButtonClicked.bind(this), 'add-button'));
        this._columnConfigs = new Map();
        columnData.forEach(columnData => this._columnConfigs.set(columnData.title.toLowerCase(), columnData));
        this._addHeaderColumnCallback = addHeaderColumnCallback;
        this._changeHeaderColumnCallback = changeHeaderColumnCallback;
        this._removeHeaderColumnCallback = removeHeaderColumnCallback;
        this.contentElement.tabIndex = 0;
    }
    wasShown() {
        this._headersUpdated();
    }
    _headersUpdated() {
        this._list.clear();
        this._columnConfigs.forEach(headerData => this._list.appendItem({ header: headerData.title }, headerData.editable));
    }
    _addButtonClicked() {
        this._list.addNewItem(this._columnConfigs.size, { header: '' });
    }
    renderItem(item, _editable) {
        const element = document.createElement('div');
        element.classList.add('custom-headers-list-item');
        const header = element.createChild('div', 'custom-header-name');
        header.textContent = item.header;
        UI.Tooltip.Tooltip.install(header, item.header);
        return element;
    }
    removeItemRequested(item, _index) {
        this._removeHeaderColumnCallback(item.header);
        this._columnConfigs.delete(item.header.toLowerCase());
        this._headersUpdated();
    }
    commitEdit(item, editor, isNew) {
        const headerId = editor.control('header').value.trim();
        let success;
        if (isNew) {
            success = this._addHeaderColumnCallback(headerId);
        }
        else {
            success = this._changeHeaderColumnCallback(item.header, headerId);
        }
        if (success && !isNew) {
            this._columnConfigs.delete(item.header.toLowerCase());
        }
        if (success) {
            this._columnConfigs.set(headerId.toLowerCase(), { title: headerId, editable: true });
        }
        this._headersUpdated();
    }
    beginEdit(item) {
        const editor = this._createEditor();
        editor.control('header').value = item.header;
        return editor;
    }
    _createEditor() {
        if (this._editor) {
            return this._editor;
        }
        const editor = new UI.ListWidget.Editor();
        this._editor = editor;
        const content = editor.contentElement();
        const titles = content.createChild('div', 'custom-headers-edit-row');
        titles.createChild('div', 'custom-headers-header').textContent = i18nString(UIStrings.headerName);
        const fields = content.createChild('div', 'custom-headers-edit-row');
        fields.createChild('div', 'custom-headers-header')
            .appendChild(editor.createInput('header', 'text', 'x-custom-header', validateHeader.bind(this)));
        return editor;
        function validateHeader(item, _index, _input) {
            let valid = true;
            const headerId = editor.control('header').value.trim().toLowerCase();
            if (this._columnConfigs.has(headerId) && item.header !== headerId) {
                valid = false;
            }
            return { valid, errorMessage: undefined };
        }
    }
}
//# sourceMappingURL=NetworkManageCustomHeadersView.js.map