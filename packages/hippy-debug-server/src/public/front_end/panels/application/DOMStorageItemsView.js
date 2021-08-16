// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Nokia Inc.  All rights reserved.
 * Copyright (C) 2013 Samsung Electronics. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DOMStorage } from './DOMStorageModel.js';
import { StorageItemsView } from './StorageItemsView.js';
const UIStrings = {
    /**
    *@description Text in DOMStorage Items View of the Application panel
    */
    domStorage: 'DOM Storage',
    /**
    *@description Text in DOMStorage Items View of the Application panel
    */
    key: 'Key',
    /**
    *@description Text for the value of something
    */
    value: 'Value',
    /**
    *@description Data grid name for DOM Storage Items data grids
    */
    domStorageItems: 'DOM Storage Items',
    /**
    *@description Text in DOMStorage Items View of the Application panel
    */
    selectAValueToPreview: 'Select a value to preview',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/DOMStorageItemsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class DOMStorageItemsView extends StorageItemsView {
    _domStorage;
    _dataGrid;
    _splitWidget;
    _previewPanel;
    _preview;
    _previewValue;
    _eventListeners;
    constructor(domStorage) {
        super(i18nString(UIStrings.domStorage), 'domStoragePanel');
        this._domStorage = domStorage;
        this.element.classList.add('storage-view', 'table');
        const columns = [
            { id: 'key', title: i18nString(UIStrings.key), sortable: false, editable: true, longText: true, weight: 50 },
            { id: 'value', title: i18nString(UIStrings.value), sortable: false, editable: true, longText: true, weight: 50 },
        ];
        this._dataGrid = new DataGrid.DataGrid.DataGridImpl({
            displayName: i18nString(UIStrings.domStorageItems),
            columns,
            editCallback: this._editingCallback.bind(this),
            deleteCallback: this._deleteCallback.bind(this),
            refreshCallback: this.refreshItems.bind(this),
        });
        this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, event => {
            this._previewEntry(event.data);
        });
        this._dataGrid.addEventListener(DataGrid.DataGrid.Events.DeselectedNode, _event => {
            this._previewEntry(null);
        });
        this._dataGrid.setStriped(true);
        this._dataGrid.setName('DOMStorageItemsView');
        this._splitWidget = new UI.SplitWidget.SplitWidget(
        /* isVertical: */ false, /* secondIsSidebar: */ true, 'domStorageSplitViewState');
        this._splitWidget.show(this.element);
        this._previewPanel = new UI.Widget.VBox();
        this._previewPanel.setMinimumSize(0, 50);
        const resizer = this._previewPanel.element.createChild('div', 'preview-panel-resizer');
        const dataGridWidget = this._dataGrid.asWidget();
        dataGridWidget.setMinimumSize(0, 50);
        this._splitWidget.setMainWidget(dataGridWidget);
        this._splitWidget.setSidebarWidget(this._previewPanel);
        this._splitWidget.installResizer(resizer);
        this._preview = null;
        this._previewValue = null;
        this._showPreview(null, null);
        this._eventListeners = [];
        this.setStorage(domStorage);
    }
    setStorage(domStorage) {
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
        this._domStorage = domStorage;
        this._eventListeners = [
            this._domStorage.addEventListener(DOMStorage.Events.DOMStorageItemsCleared, this._domStorageItemsCleared, this),
            this._domStorage.addEventListener(DOMStorage.Events.DOMStorageItemRemoved, this._domStorageItemRemoved, this),
            this._domStorage.addEventListener(DOMStorage.Events.DOMStorageItemAdded, this._domStorageItemAdded, this),
            this._domStorage.addEventListener(DOMStorage.Events.DOMStorageItemUpdated, this._domStorageItemUpdated, this),
        ];
        this.refreshItems();
    }
    _domStorageItemsCleared() {
        if (!this.isShowing() || !this._dataGrid) {
            return;
        }
        this._dataGrid.rootNode().removeChildren();
        this._dataGrid.addCreationNode(false);
        this.setCanDeleteSelected(false);
    }
    _domStorageItemRemoved(event) {
        if (!this.isShowing() || !this._dataGrid) {
            return;
        }
        const storageData = event.data;
        const rootNode = this._dataGrid.rootNode();
        const children = rootNode.children;
        for (let i = 0; i < children.length; ++i) {
            const childNode = children[i];
            if (childNode.data.key === storageData.key) {
                rootNode.removeChild(childNode);
                this.setCanDeleteSelected(children.length > 1);
                return;
            }
        }
    }
    _domStorageItemAdded(event) {
        if (!this.isShowing() || !this._dataGrid) {
            return;
        }
        const storageData = event.data;
        const rootNode = this._dataGrid.rootNode();
        const children = rootNode.children;
        for (let i = 0; i < children.length; ++i) {
            if (children[i].data.key === storageData.key) {
                return;
            }
        }
        const childNode = new DataGrid.DataGrid.DataGridNode({ key: storageData.key, value: storageData.value }, false);
        rootNode.insertChild(childNode, children.length - 1);
    }
    _domStorageItemUpdated(event) {
        if (!this.isShowing() || !this._dataGrid) {
            return;
        }
        const storageData = event.data;
        const childNode = this._dataGrid.rootNode().children.find((child) => child.data.key === storageData.key);
        if (!childNode || childNode.data.value === storageData.value) {
            return;
        }
        childNode.data.value = storageData.value;
        childNode.refresh();
        if (!childNode.selected) {
            return;
        }
        this._previewEntry(childNode);
        this.setCanDeleteSelected(true);
    }
    _showDOMStorageItems(items) {
        const rootNode = this._dataGrid.rootNode();
        let selectedKey = null;
        for (const node of rootNode.children) {
            if (!node.selected) {
                continue;
            }
            selectedKey = node.data.key;
            break;
        }
        rootNode.removeChildren();
        let selectedNode = null;
        const filteredItems = (item) => `${item[0]} ${item[1]}`;
        for (const item of this.filter(items, filteredItems)) {
            const key = item[0];
            const value = item[1];
            const node = new DataGrid.DataGrid.DataGridNode({ key: key, value: value }, false);
            node.selectable = true;
            rootNode.appendChild(node);
            if (!selectedNode || key === selectedKey) {
                selectedNode = node;
            }
        }
        if (selectedNode) {
            selectedNode.selected = true;
        }
        this._dataGrid.addCreationNode(false);
        this.setCanDeleteSelected(Boolean(selectedNode));
    }
    deleteSelectedItem() {
        if (!this._dataGrid || !this._dataGrid.selectedNode) {
            return;
        }
        this._deleteCallback(this._dataGrid.selectedNode);
    }
    refreshItems() {
        this._domStorage.getItems().then(items => items && this._showDOMStorageItems(items));
    }
    deleteAllItems() {
        this._domStorage.clear();
        // explicitly clear the view because the event won't be fired when it has no items
        this._domStorageItemsCleared();
    }
    _editingCallback(editingNode, columnIdentifier, oldText, newText) {
        const domStorage = this._domStorage;
        if (columnIdentifier === 'key') {
            if (typeof oldText === 'string') {
                domStorage.removeItem(oldText);
            }
            domStorage.setItem(newText, editingNode.data.value || '');
            this._removeDupes(editingNode);
        }
        else {
            domStorage.setItem(editingNode.data.key || '', newText);
        }
    }
    _removeDupes(masterNode) {
        const rootNode = this._dataGrid.rootNode();
        const children = rootNode.children;
        for (let i = children.length - 1; i >= 0; --i) {
            const childNode = children[i];
            if ((childNode.data.key === masterNode.data.key) && (masterNode !== childNode)) {
                rootNode.removeChild(childNode);
            }
        }
    }
    _deleteCallback(node) {
        if (!node || node.isCreationNode) {
            return;
        }
        if (this._domStorage) {
            this._domStorage.removeItem(node.data.key);
        }
    }
    _showPreview(preview, value) {
        if (this._preview && this._previewValue === value) {
            return;
        }
        if (this._preview) {
            this._preview.detach();
        }
        if (!preview) {
            preview = new UI.EmptyWidget.EmptyWidget(i18nString(UIStrings.selectAValueToPreview));
        }
        this._previewValue = value;
        this._preview = preview;
        preview.show(this._previewPanel.contentElement);
    }
    async _previewEntry(entry) {
        const value = entry && entry.data && entry.data.value;
        if (entry && entry.data && entry.data.value) {
            const protocol = this._domStorage.isLocalStorage ? 'localstorage' : 'sessionstorage';
            const url = `${protocol}://${entry.key}`;
            const provider = TextUtils.StaticContentProvider.StaticContentProvider.fromString(url, Common.ResourceType.resourceTypes.XHR, value);
            const preview = await SourceFrame.PreviewFactory.PreviewFactory.createPreview(provider, 'text/plain');
            // Selection could've changed while the preview was loaded
            if (entry.selected) {
                this._showPreview(preview, value);
            }
        }
        else {
            this._showPreview(null, value);
        }
    }
}
//# sourceMappingURL=DOMStorageItemsView.js.map