// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description A context menu item in the Console View of the Console panel
    */
    default: 'Default',
    /**
    *@description Text in Network Throttling Selector of the Network panel
    */
    custom: 'Custom',
    /**
    *@description Text for everything
    */
    all: 'All',
    /**
    *@description Text for errors
    */
    error: 'Error',
    /**
    *@description Text to indicate an item is a warning
    */
    warning: 'Warning',
    /**
    *@description Sdk console message message level info of level Labels in Console View of the Console panel
    */
    info: 'Info',
    /**
    *@description Debug log level
    */
    debug: 'Debug',
    /**
    *@description Label for selecting between the set of log levels to show.
    */
    logLevel: 'Log level:',
    /**
    *@description Default text for user-text-entry for searching log messages.
    */
    filterLogMessages: 'Filter log messages',
};
const str_ = i18n.i18n.registerUIStrings('panels/media/PlayerMessagesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class MessageLevelSelector extends Common.ObjectWrapper.ObjectWrapper {
    _items;
    _view;
    _itemMap;
    _hiddenLevels;
    _bitFieldValue;
    _savedBitFieldValue;
    _defaultTitle;
    _customTitle;
    _allTitle;
    elementsForItems;
    constructor(items, view) {
        super();
        this._items = items;
        this._view = view;
        this._itemMap = new Map();
        this._hiddenLevels = [];
        this._bitFieldValue = 7 /* Default */;
        this._savedBitFieldValue = 7 /* Default */;
        this._defaultTitle = i18nString(UIStrings.default);
        this._customTitle = i18nString(UIStrings.custom);
        this._allTitle = i18nString(UIStrings.all);
        this.elementsForItems = new WeakMap();
    }
    defaultTitle() {
        return this._defaultTitle;
    }
    setDefault(dropdown) {
        dropdown.selectItem(this._items.at(0));
    }
    populate() {
        this._items.insert(this._items.length, {
            title: this._defaultTitle,
            overwrite: true,
            stringValue: '',
            value: 7 /* Default */,
            selectable: undefined,
        });
        this._items.insert(this._items.length, {
            title: this._allTitle,
            overwrite: true,
            stringValue: '',
            value: 15 /* All */,
            selectable: undefined,
        });
        this._items.insert(this._items.length, {
            title: i18nString(UIStrings.error),
            overwrite: false,
            stringValue: 'error',
            value: 1 /* Error */,
            selectable: undefined,
        });
        this._items.insert(this._items.length, {
            title: i18nString(UIStrings.warning),
            overwrite: false,
            stringValue: 'warning',
            value: 2 /* Warning */,
            selectable: undefined,
        });
        this._items.insert(this._items.length, {
            title: i18nString(UIStrings.info),
            overwrite: false,
            stringValue: 'info',
            value: 4 /* Info */,
            selectable: undefined,
        });
        this._items.insert(this._items.length, {
            title: i18nString(UIStrings.debug),
            overwrite: false,
            stringValue: 'debug',
            value: 8 /* Debug */,
            selectable: undefined,
        });
    }
    _updateCheckMarks() {
        this._hiddenLevels = [];
        for (const [key, item] of this._itemMap) {
            if (!item.overwrite) {
                const elementForItem = this.elementsForItems.get(item);
                if (elementForItem && elementForItem.firstChild) {
                    elementForItem.firstChild.remove();
                }
                if (elementForItem && key & this._bitFieldValue) {
                    UI.UIUtils.createTextChild(elementForItem.createChild('div'), '✓');
                }
                else {
                    this._hiddenLevels.push(item.stringValue);
                }
            }
        }
    }
    titleFor(item) {
        // This would make a lot more sense to have in |itemSelected|, but this
        // method gets called first.
        if (item.overwrite) {
            this._bitFieldValue = item.value;
        }
        else {
            this._bitFieldValue ^= item.value;
        }
        if (this._bitFieldValue === 7 /* Default */) {
            return this._defaultTitle;
        }
        if (this._bitFieldValue === 15 /* All */) {
            return this._allTitle;
        }
        const potentialMatch = this._itemMap.get(this._bitFieldValue);
        if (potentialMatch) {
            return potentialMatch.title;
        }
        return this._customTitle;
    }
    createElementForItem(item) {
        const element = document.createElement('div');
        const shadowRoot = UI.Utils.createShadowRootWithCoreStyles(element, { cssFile: 'panels/media/playerMessagesView.css', enableLegacyPatching: false, delegatesFocus: undefined });
        const container = shadowRoot.createChild('div', 'media-messages-level-dropdown-element');
        const checkBox = container.createChild('div', 'media-messages-level-dropdown-checkbox');
        const text = container.createChild('span', 'media-messages-level-dropdown-text');
        UI.UIUtils.createTextChild(text, item.title);
        this.elementsForItems.set(item, checkBox);
        this._itemMap.set(item.value, item);
        this._updateCheckMarks();
        this._view.regenerateMessageDisplayCss(this._hiddenLevels);
        return element;
    }
    isItemSelectable(_item) {
        return true;
    }
    itemSelected(_item) {
        this._updateCheckMarks();
        this._view.regenerateMessageDisplayCss(this._hiddenLevels);
    }
    highlightedItemChanged(_from, _to, _fromElement, _toElement) {
    }
}
export class PlayerMessagesView extends UI.Widget.VBox {
    _headerPanel;
    _bodyPanel;
    _messageLevelSelector;
    constructor() {
        super();
        this.registerRequiredCSS('panels/media/playerMessagesView.css', { enableLegacyPatching: false });
        this._headerPanel = this.contentElement.createChild('div', 'media-messages-header');
        this._bodyPanel = this.contentElement.createChild('div', 'media-messages-body');
        this._buildToolbar();
    }
    _buildToolbar() {
        const toolbar = new UI.Toolbar.Toolbar('media-messages-toolbar', this._headerPanel);
        toolbar.appendText(i18nString(UIStrings.logLevel));
        toolbar.appendToolbarItem(this._createDropdown());
        toolbar.appendSeparator();
        toolbar.appendToolbarItem(this._createFilterInput());
    }
    _createDropdown() {
        const items = new UI.ListModel.ListModel();
        this._messageLevelSelector = new MessageLevelSelector(items, this);
        const dropDown = new UI.SoftDropDown.SoftDropDown(items, this._messageLevelSelector);
        dropDown.setRowHeight(18);
        this._messageLevelSelector.populate();
        this._messageLevelSelector.setDefault(dropDown);
        const dropDownItem = new UI.Toolbar.ToolbarItem(dropDown.element);
        dropDownItem.element.classList.add('toolbar-has-dropdown');
        dropDownItem.setEnabled(true);
        dropDownItem.setTitle(this._messageLevelSelector.defaultTitle());
        return dropDownItem;
    }
    _createFilterInput() {
        const filterInput = new UI.Toolbar.ToolbarInput(i18nString(UIStrings.filterLogMessages));
        filterInput.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged, (data) => {
            this._filterByString(data);
        }, this);
        return filterInput;
    }
    regenerateMessageDisplayCss(hiddenLevels) {
        const messages = this._bodyPanel.getElementsByClassName('media-messages-message-container');
        for (const message of messages) {
            if (this._matchesHiddenLevels(message, hiddenLevels)) {
                message.classList.add('media-messages-message-unselected');
            }
            else {
                message.classList.remove('media-messages-message-unselected');
            }
        }
    }
    _matchesHiddenLevels(element, hiddenLevels) {
        for (const level of hiddenLevels) {
            if (element.classList.contains('media-message-' + level)) {
                return true;
            }
        }
        return false;
    }
    _filterByString(userStringData) {
        const userString = userStringData.data;
        const messages = this._bodyPanel.getElementsByClassName('media-messages-message-container');
        for (const message of messages) {
            if (userString === '') {
                message.classList.remove('media-messages-message-filtered');
            }
            else if (message.textContent && message.textContent.includes(userString)) {
                message.classList.remove('media-messages-message-filtered');
            }
            else {
                message.classList.add('media-messages-message-filtered');
            }
        }
    }
    addMessage(message) {
        const container = this._bodyPanel.createChild('div', 'media-messages-message-container media-message-' + message.level);
        UI.UIUtils.createTextChild(container, message.message);
    }
}
//# sourceMappingURL=PlayerMessagesView.js.map