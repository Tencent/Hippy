// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text that shows there is no recording
    */
    noRecordings: '(no recordings)',
    /**
    *@description Label prefix for an audio context selection
    *@example {realtime (1e03ec)} PH1
    */
    audioContextS: 'Audio context: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/web_audio/AudioContextSelector.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class AudioContextSelector extends Common.ObjectWrapper.ObjectWrapper {
    _placeholderText;
    _items;
    _dropDown;
    _toolbarItem;
    _selectedContext;
    constructor() {
        super();
        this._placeholderText = i18nString(UIStrings.noRecordings);
        this._items = new UI.ListModel.ListModel();
        this._dropDown = new UI.SoftDropDown.SoftDropDown(this._items, this);
        this._dropDown.setPlaceholderText(this._placeholderText);
        this._toolbarItem = new UI.Toolbar.ToolbarItem(this._dropDown.element);
        this._toolbarItem.setEnabled(false);
        this._toolbarItem.setTitle(i18nString(UIStrings.audioContextS, { PH1: this._placeholderText }));
        this._items.addEventListener(UI.ListModel.Events.ItemsReplaced, this._onListItemReplaced, this);
        this._toolbarItem.element.classList.add('toolbar-has-dropdown');
        this._selectedContext = null;
    }
    _onListItemReplaced() {
        const hasItems = Boolean(this._items.length);
        this._toolbarItem.setEnabled(hasItems);
        if (!hasItems) {
            this._toolbarItem.setTitle(i18nString(UIStrings.audioContextS, { PH1: this._placeholderText }));
        }
    }
    contextCreated(event) {
        const context = event.data;
        this._items.insert(this._items.length, context);
        // Select if this is the first item.
        if (this._items.length === 1) {
            this._dropDown.selectItem(context);
        }
    }
    contextDestroyed(event) {
        const contextId = event.data;
        const contextIndex = this._items.findIndex((context) => context.contextId === contextId);
        if (contextIndex > -1) {
            this._items.remove(contextIndex);
        }
    }
    contextChanged(event) {
        const changedContext = event.data;
        const contextIndex = this._items.findIndex((context) => context.contextId === changedContext.contextId);
        if (contextIndex > -1) {
            this._items.replace(contextIndex, changedContext);
            // If the changed context is currently selected by user. Re-select it
            // because the actual element is replaced with a new one.
            if (this._selectedContext && this._selectedContext.contextId === changedContext.contextId) {
                this._dropDown.selectItem(changedContext);
            }
        }
    }
    createElementForItem(item) {
        const element = document.createElement('div');
        const shadowRoot = UI.Utils.createShadowRootWithCoreStyles(element, { cssFile: 'panels/web_audio/audioContextSelector.css', enableLegacyPatching: false, delegatesFocus: undefined });
        const title = shadowRoot.createChild('div', 'title');
        UI.UIUtils.createTextChild(title, Platform.StringUtilities.trimEndWithMaxLength(this.titleFor(item), 100));
        return element;
    }
    selectedContext() {
        if (!this._selectedContext) {
            return null;
        }
        return this._selectedContext;
    }
    highlightedItemChanged(from, to, fromElement, toElement) {
        if (fromElement) {
            fromElement.classList.remove('highlighted');
        }
        if (toElement) {
            toElement.classList.add('highlighted');
        }
    }
    isItemSelectable(_item) {
        return true;
    }
    itemSelected(item) {
        if (!item) {
            return;
        }
        // It's possible that no context is selected yet.
        if (!this._selectedContext || this._selectedContext.contextId !== item.contextId) {
            this._selectedContext = item;
            this._toolbarItem.setTitle(i18nString(UIStrings.audioContextS, { PH1: this.titleFor(item) }));
        }
        this.dispatchEventToListeners("ContextSelected" /* ContextSelected */, item);
    }
    reset() {
        this._items.replaceAll([]);
    }
    titleFor(context) {
        return `${context.contextType} (${context.contextId.substr(-6)})`;
    }
    toolbarItem() {
        return this._toolbarItem;
    }
}
//# sourceMappingURL=AudioContextSelector.js.map