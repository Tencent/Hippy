/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as ARIAUtils from './ARIAUtils.js';
import { Icon } from './Icon.js';
import { KeyboardShortcut, Modifiers } from './KeyboardShortcut.js';
import { bindCheckbox } from './SettingsUI.js';
import { Events, TextPrompt } from './TextPrompt.js';
import { ToolbarSettingToggle } from './Toolbar.js'; // eslint-disable-line no-unused-vars
import { Tooltip } from './Tooltip.js';
import { CheckboxLabel, createTextChild } from './UIUtils.js';
import { HBox } from './Widget.js';
const UIStrings = {
    /**
    *@description Text to filter result items
    */
    filter: 'Filter',
    /**
    *@description Text that appears when hover over the filter bar in the Network tool
    */
    egSmalldUrlacomb: 'e.g. `/small[\d]+/ url:a.com/b`',
    /**
    *@description Text that appears when hover over the All button in the Network tool
    *@example {Ctrl + } PH1
    */
    sclickToSelectMultipleTypes: '{PH1}Click to select multiple types',
    /**
    *@description Text for everything
    */
    allStrings: 'All',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/FilterBar.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FilterBar extends HBox {
    _enabled;
    _stateSetting;
    _filterButton;
    _filters;
    _alwaysShowFilters;
    _showingWidget;
    constructor(name, visibleByDefault) {
        super();
        this.registerRequiredCSS('ui/legacy/filter.css', { enableLegacyPatching: false });
        this._enabled = true;
        this.element.classList.add('filter-bar');
        this._stateSetting =
            Common.Settings.Settings.instance().createSetting('filterBar-' + name + '-toggled', Boolean(visibleByDefault));
        this._filterButton = new ToolbarSettingToggle(this._stateSetting, 'largeicon-filter', i18nString(UIStrings.filter));
        this._filters = [];
        this._updateFilterBar();
        this._stateSetting.addChangeListener(this._updateFilterBar.bind(this));
    }
    filterButton() {
        return this._filterButton;
    }
    addFilter(filter) {
        this._filters.push(filter);
        this.element.appendChild(filter.element());
        filter.addEventListener(FilterUI.Events.FilterChanged, this._filterChanged, this);
        this._updateFilterButton();
    }
    setEnabled(enabled) {
        this._enabled = enabled;
        this._filterButton.setEnabled(enabled);
        this._updateFilterBar();
    }
    forceShowFilterBar() {
        this._alwaysShowFilters = true;
        this._updateFilterBar();
    }
    showOnce() {
        this._stateSetting.set(true);
    }
    _filterChanged(_event) {
        this._updateFilterButton();
        this.dispatchEventToListeners(FilterBar.Events.Changed);
    }
    wasShown() {
        super.wasShown();
        this._updateFilterBar();
    }
    _updateFilterBar() {
        if (!this.parentWidget() || this._showingWidget) {
            return;
        }
        if (this.visible()) {
            this._showingWidget = true;
            this.showWidget();
            this._showingWidget = false;
        }
        else {
            this.hideWidget();
        }
    }
    focus() {
        for (let i = 0; i < this._filters.length; ++i) {
            if (this._filters[i] instanceof TextFilterUI) {
                const textFilterUI = this._filters[i];
                textFilterUI.focus();
                break;
            }
        }
    }
    _updateFilterButton() {
        let isActive = false;
        for (const filter of this._filters) {
            isActive = isActive || filter.isActive();
        }
        this._filterButton.setDefaultWithRedColor(isActive);
        this._filterButton.setToggleWithRedColor(isActive);
    }
    clear() {
        this.element.removeChildren();
        this._filters = [];
        this._updateFilterButton();
    }
    setting() {
        return this._stateSetting;
    }
    visible() {
        return this._alwaysShowFilters || (this._stateSetting.get() && this._enabled);
    }
}
(function (FilterBar) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Events;
    (function (Events) {
        Events["Changed"] = "Changed";
    })(Events = FilterBar.Events || (FilterBar.Events = {}));
})(FilterBar || (FilterBar = {}));
export var FilterUI;
(function (FilterUI) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Events;
    (function (Events) {
        Events["FilterChanged"] = "FilterChanged";
    })(Events = FilterUI.Events || (FilterUI.Events = {}));
})(FilterUI || (FilterUI = {}));
export class TextFilterUI extends Common.ObjectWrapper.ObjectWrapper {
    _filterElement;
    _filterInputElement;
    _prompt;
    _proxyElement;
    _suggestionProvider;
    constructor() {
        super();
        this._filterElement = document.createElement('div');
        this._filterElement.className = 'filter-text-filter';
        const container = this._filterElement.createChild('div', 'filter-input-container');
        this._filterInputElement = container.createChild('span', 'filter-input-field');
        this._prompt = new TextPrompt();
        this._prompt.initialize(this._completions.bind(this), ' ', true);
        this._proxyElement = this._prompt.attach(this._filterInputElement);
        Tooltip.install(this._proxyElement, i18nString(UIStrings.egSmalldUrlacomb));
        this._prompt.setPlaceholder(i18nString(UIStrings.filter));
        this._prompt.addEventListener(Events.TextChanged, this._valueChanged.bind(this));
        this._suggestionProvider = null;
        const clearButton = container.createChild('div', 'filter-input-clear-button');
        clearButton.appendChild(Icon.create('mediumicon-gray-cross-hover', 'filter-cancel-button'));
        clearButton.addEventListener('click', () => {
            this.clear();
            this.focus();
        });
        this._updateEmptyStyles();
    }
    _completions(expression, prefix, force) {
        if (this._suggestionProvider) {
            return this._suggestionProvider(expression, prefix, force);
        }
        return Promise.resolve([]);
    }
    isActive() {
        return Boolean(this._prompt.text());
    }
    element() {
        return this._filterElement;
    }
    value() {
        return this._prompt.textWithCurrentSuggestion();
    }
    setValue(value) {
        this._prompt.setText(value);
        this._valueChanged();
    }
    focus() {
        this._filterInputElement.focus();
    }
    setSuggestionProvider(suggestionProvider) {
        this._prompt.clearAutocomplete();
        this._suggestionProvider = suggestionProvider;
    }
    _valueChanged() {
        this.dispatchEventToListeners(FilterUI.Events.FilterChanged, null);
        this._updateEmptyStyles();
    }
    _updateEmptyStyles() {
        this._filterElement.classList.toggle('filter-text-empty', !this._prompt.text());
    }
    clear() {
        this.setValue('');
    }
}
export class NamedBitSetFilterUI extends Common.ObjectWrapper.ObjectWrapper {
    _filtersElement;
    _typeFilterElementTypeNames;
    _allowedTypes;
    _typeFilterElements;
    _setting;
    constructor(items, setting) {
        super();
        this._filtersElement = document.createElement('div');
        this._filtersElement.classList.add('filter-bitset-filter');
        ARIAUtils.markAsListBox(this._filtersElement);
        ARIAUtils.markAsMultiSelectable(this._filtersElement);
        Tooltip.install(this._filtersElement, i18nString(UIStrings.sclickToSelectMultipleTypes, {
            PH1: KeyboardShortcut.shortcutToString('', Modifiers.CtrlOrMeta),
        }));
        this._typeFilterElementTypeNames = new WeakMap();
        this._allowedTypes = new Set();
        this._typeFilterElements = [];
        this._addBit(NamedBitSetFilterUI.ALL_TYPES, i18nString(UIStrings.allStrings));
        this._typeFilterElements[0].tabIndex = 0;
        this._filtersElement.createChild('div', 'filter-bitset-filter-divider');
        for (let i = 0; i < items.length; ++i) {
            this._addBit(items[i].name, items[i].label(), items[i].title);
        }
        if (setting) {
            this._setting = setting;
            setting.addChangeListener(this._settingChanged.bind(this));
            this._settingChanged();
        }
        else {
            this._toggleTypeFilter(NamedBitSetFilterUI.ALL_TYPES, false /* allowMultiSelect */);
        }
    }
    reset() {
        this._toggleTypeFilter(NamedBitSetFilterUI.ALL_TYPES, false /* allowMultiSelect */);
    }
    isActive() {
        return !this._allowedTypes.has(NamedBitSetFilterUI.ALL_TYPES);
    }
    element() {
        return this._filtersElement;
    }
    accept(typeName) {
        return this._allowedTypes.has(NamedBitSetFilterUI.ALL_TYPES) || this._allowedTypes.has(typeName);
    }
    _settingChanged() {
        const allowedTypesFromSetting = this._setting.get();
        this._allowedTypes = new Set();
        for (const element of this._typeFilterElements) {
            const typeName = this._typeFilterElementTypeNames.get(element);
            if (typeName && allowedTypesFromSetting[typeName]) {
                this._allowedTypes.add(typeName);
            }
        }
        this._update();
    }
    _update() {
        if (this._allowedTypes.size === 0 || this._allowedTypes.has(NamedBitSetFilterUI.ALL_TYPES)) {
            this._allowedTypes = new Set();
            this._allowedTypes.add(NamedBitSetFilterUI.ALL_TYPES);
        }
        for (const element of this._typeFilterElements) {
            const typeName = this._typeFilterElementTypeNames.get(element);
            const active = this._allowedTypes.has(typeName || '');
            element.classList.toggle('selected', active);
            ARIAUtils.setSelected(element, active);
        }
        this.dispatchEventToListeners(FilterUI.Events.FilterChanged, null);
    }
    _addBit(name, label, title) {
        const typeFilterElement = this._filtersElement.createChild('span', name);
        typeFilterElement.tabIndex = -1;
        this._typeFilterElementTypeNames.set(typeFilterElement, name);
        createTextChild(typeFilterElement, label);
        ARIAUtils.markAsOption(typeFilterElement);
        if (title) {
            typeFilterElement.title = title;
        }
        typeFilterElement.addEventListener('click', this._onTypeFilterClicked.bind(this), false);
        typeFilterElement.addEventListener('keydown', this._onTypeFilterKeydown.bind(this), false);
        this._typeFilterElements.push(typeFilterElement);
    }
    _onTypeFilterClicked(event) {
        const e = event;
        let toggle;
        if (Host.Platform.isMac()) {
            toggle = e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;
        }
        else {
            toggle = e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
        }
        if (e.target) {
            const element = e.target;
            const typeName = this._typeFilterElementTypeNames.get(element);
            this._toggleTypeFilter(typeName, toggle);
        }
    }
    _onTypeFilterKeydown(ev) {
        const event = ev;
        const element = event.target;
        if (!element) {
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            if (this._keyFocusNextBit(element, true /* selectPrevious */)) {
                event.consume(true);
            }
        }
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            if (this._keyFocusNextBit(element, false /* selectPrevious */)) {
                event.consume(true);
            }
        }
        else if (isEnterOrSpaceKey(event)) {
            this._onTypeFilterClicked(event);
        }
    }
    _keyFocusNextBit(target, selectPrevious) {
        const index = this._typeFilterElements.indexOf(target);
        if (index === -1) {
            return false;
        }
        const nextIndex = selectPrevious ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= this._typeFilterElements.length) {
            return false;
        }
        const nextElement = this._typeFilterElements[nextIndex];
        nextElement.tabIndex = 0;
        target.tabIndex = -1;
        nextElement.focus();
        return true;
    }
    _toggleTypeFilter(typeName, allowMultiSelect) {
        if (allowMultiSelect && typeName !== NamedBitSetFilterUI.ALL_TYPES) {
            this._allowedTypes.delete(NamedBitSetFilterUI.ALL_TYPES);
        }
        else {
            this._allowedTypes = new Set();
        }
        if (this._allowedTypes.has(typeName)) {
            this._allowedTypes.delete(typeName);
        }
        else {
            this._allowedTypes.add(typeName);
        }
        if (this._setting) {
            // Settings do not support `Sets` so convert it back to the Map-like object.
            const updatedSetting = {};
            for (const type of this._allowedTypes) {
                updatedSetting[type] = true;
            }
            this._setting.set(updatedSetting);
        }
        else {
            this._update();
        }
    }
    static ALL_TYPES = 'all';
}
export class CheckboxFilterUI extends Common.ObjectWrapper.ObjectWrapper {
    _filterElement;
    _activeWhenChecked;
    _label;
    _checkboxElement;
    constructor(className, title, activeWhenChecked, setting) {
        super();
        this._filterElement = document.createElement('div');
        this._filterElement.classList.add('filter-checkbox-filter');
        this._activeWhenChecked = Boolean(activeWhenChecked);
        this._label = CheckboxLabel.create(title);
        this._filterElement.appendChild(this._label);
        this._checkboxElement = this._label.checkboxElement;
        if (setting) {
            bindCheckbox(this._checkboxElement, setting);
        }
        else {
            this._checkboxElement.checked = true;
        }
        this._checkboxElement.addEventListener('change', this._fireUpdated.bind(this), false);
    }
    isActive() {
        return this._activeWhenChecked === this._checkboxElement.checked;
    }
    checked() {
        return this._checkboxElement.checked;
    }
    setChecked(checked) {
        this._checkboxElement.checked = checked;
    }
    element() {
        return this._filterElement;
    }
    labelElement() {
        return this._label;
    }
    _fireUpdated() {
        this.dispatchEventToListeners(FilterUI.Events.FilterChanged, null);
    }
    setColor(backgroundColor, borderColor) {
        this._label.backgroundColor = backgroundColor;
        this._label.borderColor = borderColor;
    }
}
//# sourceMappingURL=FilterBar.js.map