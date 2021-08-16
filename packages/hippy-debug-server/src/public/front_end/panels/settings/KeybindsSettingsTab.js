// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text for keyboard shortcuts
    */
    shortcuts: 'Shortcuts',
    /**
    *@description Text appearing before a select control offering users their choice of keyboard shortcut presets.
    */
    matchShortcutsFromPreset: 'Match shortcuts from preset',
    /**
    *@description Screen reader label for list of keyboard shortcuts in settings
    */
    keyboardShortcutsList: 'Keyboard shortcuts list',
    /**
    *@description Screen reader label for an icon denoting a shortcut that has been changed from its default
    */
    shortcutModified: 'Shortcut modified',
    /**
    *@description Screen reader label for an empty shortcut cell in custom shortcuts settings tab
    */
    noShortcutForAction: 'No shortcut for action',
    /**
    *@description Link text in the settings pane to add another shortcut for an action
    */
    addAShortcut: 'Add a shortcut',
    /**
    *@description Label for a button in the settings pane that confirms changes to a keyboard shortcut
    */
    confirmChanges: 'Confirm changes',
    /**
    *@description Label for a button in the settings pane that discards changes to the shortcut being edited
    */
    discardChanges: 'Discard changes',
    /**
    *@description Label for a button in the settings pane that removes a keyboard shortcut.
    */
    removeShortcut: 'Remove shortcut',
    /**
    *@description Label for a button in the settings pane that edits a keyboard shortcut
    */
    editShortcut: 'Edit shortcut',
    /**
    *@description Message shown in settings when the user inputs a modifier-only shortcut such as Ctrl+Shift.
    */
    shortcutsCannotContainOnly: 'Shortcuts cannot contain only modifier keys.',
    /**
    *@description Messages shown in shortcuts settings when the user inputs a shortcut that is already in use.
    *@example {Performance} PH1
    *@example {Start/stop recording} PH2
    */
    thisShortcutIsInUseByS: 'This shortcut is in use by {PH1}: {PH2}.',
    /**
    *@description Message shown in settings when to restore default shortcuts.
    */
    RestoreDefaultShortcuts: 'Restore default shortcuts',
    /**
    *@description Message shown in settings to show the full list of keyboard shortcuts.
    */
    FullListOfDevtoolsKeyboard: 'Full list of DevTools keyboard shortcuts and gestures',
    /**
     *@description Label for a button in the shortcut editor that resets all shortcuts for the current action.
    */
    ResetShortcutsForAction: 'Reset shortcuts for action',
};
const str_ = i18n.i18n.registerUIStrings('panels/settings/KeybindsSettingsTab.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let keybindsSettingsTabInstance;
export class KeybindsSettingsTab extends UI.Widget.VBox {
    _items;
    _list;
    _editingItem;
    _editingRow;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/settings/keybindsSettingsTab.css', { enableLegacyPatching: false });
        const header = this.contentElement.createChild('header');
        header.createChild('h1').textContent = i18nString(UIStrings.shortcuts);
        const keybindsSetSetting = Common.Settings.Settings.instance().moduleSetting('activeKeybindSet');
        const userShortcutsSetting = Common.Settings.Settings.instance().moduleSetting('userShortcuts');
        userShortcutsSetting.addChangeListener(this.update, this);
        keybindsSetSetting.addChangeListener(this.update, this);
        const keybindsSetSelect = UI.SettingsUI.createControlForSetting(keybindsSetSetting, i18nString(UIStrings.matchShortcutsFromPreset));
        if (keybindsSetSelect) {
            keybindsSetSelect.classList.add('keybinds-set-select');
            this.contentElement.appendChild(keybindsSetSelect);
        }
        this._items = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._items, this, UI.ListControl.ListMode.NonViewport);
        this._items.replaceAll(this._createListItems());
        UI.ARIAUtils.markAsList(this._list.element);
        this.registerRequiredCSS('panels/settings/keybindsSettingsTab.css', { enableLegacyPatching: false });
        this.contentElement.appendChild(this._list.element);
        UI.ARIAUtils.setAccessibleName(this._list.element, i18nString(UIStrings.keyboardShortcutsList));
        const footer = this.contentElement.createChild('div');
        footer.classList.add('keybinds-footer');
        const docsLink = UI.XLink.XLink.create('https://developer.chrome.com/docs/devtools/shortcuts/', i18nString(UIStrings.FullListOfDevtoolsKeyboard));
        docsLink.classList.add('docs-link');
        footer.appendChild(docsLink);
        footer.appendChild(UI.UIUtils.createTextButton(i18nString(UIStrings.RestoreDefaultShortcuts), () => {
            userShortcutsSetting.set([]);
            keybindsSetSetting.set(UI.ShortcutRegistry.DefaultShortcutSetting);
        }));
        this._editingItem = null;
        this._editingRow = null;
        this.update();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!keybindsSettingsTabInstance || forceNew) {
            keybindsSettingsTabInstance = new KeybindsSettingsTab();
        }
        return keybindsSettingsTabInstance;
    }
    createElementForItem(item) {
        let itemElement = document.createElement('div');
        if (typeof item === 'string') {
            UI.ARIAUtils.setLevel(itemElement, 1);
            itemElement.classList.add('keybinds-category-header');
            itemElement.textContent = item;
        }
        else {
            const listItem = new ShortcutListItem(item, this, item === this._editingItem);
            itemElement = listItem.element;
            UI.ARIAUtils.setLevel(itemElement, 2);
            if (item === this._editingItem) {
                this._editingRow = listItem;
            }
        }
        itemElement.classList.add('keybinds-list-item');
        UI.ARIAUtils.markAsListitem(itemElement);
        itemElement.tabIndex = item === this._list.selectedItem() && item !== this._editingItem ? 0 : -1;
        return itemElement;
    }
    commitChanges(item, editedShortcuts) {
        for (const [originalShortcut, newDescriptors] of editedShortcuts) {
            if (originalShortcut.type !== UI.KeyboardShortcut.Type.UnsetShortcut) {
                UI.ShortcutRegistry.ShortcutRegistry.instance().removeShortcut(originalShortcut);
                if (!newDescriptors) {
                    Host.userMetrics.actionTaken(Host.UserMetrics.Action.ShortcutRemoved);
                }
            }
            if (newDescriptors) {
                UI.ShortcutRegistry.ShortcutRegistry.instance().registerUserShortcut(originalShortcut.changeKeys(newDescriptors)
                    .changeType(UI.KeyboardShortcut.Type.UserShortcut));
                if (originalShortcut.type === UI.KeyboardShortcut.Type.UnsetShortcut) {
                    Host.userMetrics.actionTaken(Host.UserMetrics.Action.UserShortcutAdded);
                }
                else {
                    Host.userMetrics.actionTaken(Host.UserMetrics.Action.ShortcutModified);
                }
            }
        }
        this.stopEditing(item);
    }
    /**
     * This method will never be called.
     */
    heightForItem(_item) {
        return 0;
    }
    isItemSelectable(_item) {
        return true;
    }
    selectedItemChanged(from, to, fromElement, toElement) {
        if (fromElement) {
            fromElement.tabIndex = -1;
        }
        if (toElement) {
            if (to === this._editingItem && this._editingRow) {
                this._editingRow.focus();
            }
            else {
                toElement.tabIndex = 0;
                if (this._list.element.hasFocus()) {
                    toElement.focus();
                }
            }
            this.setDefaultFocusedElement(toElement);
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return true;
    }
    startEditing(action) {
        if (this._editingItem) {
            this.stopEditing(this._editingItem);
        }
        UI.UIUtils.markBeingEdited(this._list.element, true);
        this._editingItem = action;
        this._list.refreshItem(action);
    }
    stopEditing(action) {
        UI.UIUtils.markBeingEdited(this._list.element, false);
        this._editingItem = null;
        this._editingRow = null;
        this._list.refreshItem(action);
        this.focus();
    }
    _createListItems() {
        const actions = UI.ActionRegistry.ActionRegistry.instance().actions().sort((actionA, actionB) => {
            if (actionA.category() < actionB.category()) {
                return -1;
            }
            if (actionA.category() > actionB.category()) {
                return 1;
            }
            if (actionA.id() < actionB.id()) {
                return -1;
            }
            if (actionA.id() > actionB.id()) {
                return 1;
            }
            return 0;
        });
        const items = [];
        let currentCategory;
        actions.forEach(action => {
            if (currentCategory !== action.category()) {
                items.push(action.category());
            }
            items.push(action);
            currentCategory = action.category();
        });
        return items;
    }
    onEscapeKeyPressed(event) {
        const deepActiveElement = document.deepActiveElement();
        if (this._editingRow && deepActiveElement && deepActiveElement.nodeName === 'INPUT') {
            this._editingRow.onEscapeKeyPressed(event);
        }
    }
    update() {
        if (this._editingItem) {
            this.stopEditing(this._editingItem);
        }
        this._list.refreshAllItems();
        if (!this._list.selectedItem()) {
            this._list.selectItem(this._items.at(0));
        }
    }
    willHide() {
        if (this._editingItem) {
            this.stopEditing(this._editingItem);
        }
    }
}
export class ShortcutListItem {
    _isEditing;
    _settingsTab;
    _item;
    element;
    _editedShortcuts;
    _shortcutInputs;
    _shortcuts;
    _elementToFocus;
    _confirmButton;
    _addShortcutLinkContainer;
    _errorMessageElement;
    _secondKeyTimeout;
    constructor(item, settingsTab, isEditing) {
        this._isEditing = Boolean(isEditing);
        this._settingsTab = settingsTab;
        this._item = item;
        this.element = document.createElement('div');
        this._editedShortcuts = new Map();
        this._shortcutInputs = new Map();
        this._shortcuts = UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction(item.id());
        this._elementToFocus = null;
        this._confirmButton = null;
        this._addShortcutLinkContainer = null;
        this._errorMessageElement = null;
        this._secondKeyTimeout = null;
        this._update();
    }
    focus() {
        if (this._elementToFocus) {
            this._elementToFocus.focus();
        }
    }
    _update() {
        this.element.removeChildren();
        this._elementToFocus = null;
        this._shortcutInputs.clear();
        this.element.classList.toggle('keybinds-editing', this._isEditing);
        this.element.createChild('div', 'keybinds-action-name keybinds-list-text').textContent = this._item.title();
        this._shortcuts.forEach(this._createShortcutRow, this);
        if (this._shortcuts.length === 0) {
            this._createEmptyInfo();
        }
        if (this._isEditing) {
            this._setupEditor();
        }
    }
    _createEmptyInfo() {
        if (UI.ShortcutRegistry.ShortcutRegistry.instance().actionHasDefaultShortcut(this._item.id())) {
            const icon = UI.Icon.Icon.create('largeicon-shortcut-changed', 'keybinds-modified');
            UI.ARIAUtils.setAccessibleName(icon, i18nString(UIStrings.shortcutModified));
            this.element.appendChild(icon);
        }
        if (!this._isEditing) {
            const emptyElement = this.element.createChild('div', 'keybinds-shortcut keybinds-list-text');
            UI.ARIAUtils.setAccessibleName(emptyElement, i18nString(UIStrings.noShortcutForAction));
            if (Root.Runtime.experiments.isEnabled('keyboardShortcutEditor')) {
                this.element.appendChild(this._createEditButton());
            }
        }
    }
    _setupEditor() {
        this._addShortcutLinkContainer = this.element.createChild('div', 'keybinds-shortcut devtools-link');
        const addShortcutLink = this._addShortcutLinkContainer.createChild('span', 'devtools-link');
        addShortcutLink.textContent = i18nString(UIStrings.addAShortcut);
        addShortcutLink.tabIndex = 0;
        UI.ARIAUtils.markAsLink(addShortcutLink);
        self.onInvokeElement(addShortcutLink, this._addShortcut.bind(this));
        if (!this._elementToFocus) {
            this._elementToFocus = addShortcutLink;
        }
        this._errorMessageElement = this.element.createChild('div', 'keybinds-info keybinds-error hidden');
        UI.ARIAUtils.markAsAlert(this._errorMessageElement);
        this.element.appendChild(this._createIconButton(i18nString(UIStrings.ResetShortcutsForAction), 'largeicon-undo', '', this._resetShortcutsToDefaults.bind(this)));
        this._confirmButton = this._createIconButton(i18nString(UIStrings.confirmChanges), 'largeicon-checkmark', 'keybinds-confirm-button', () => this._settingsTab.commitChanges(this._item, this._editedShortcuts));
        this.element.appendChild(this._confirmButton);
        this.element.appendChild(this._createIconButton(i18nString(UIStrings.discardChanges), 'largeicon-delete', 'keybinds-cancel-button', () => this._settingsTab.stopEditing(this._item)));
        this.element.addEventListener('keydown', event => {
            if (isEscKey(event)) {
                this._settingsTab.stopEditing(this._item);
                event.consume(true);
            }
        });
    }
    _addShortcut() {
        const shortcut = new UI.KeyboardShortcut.KeyboardShortcut([], this._item.id(), UI.KeyboardShortcut.Type.UnsetShortcut);
        this._shortcuts.push(shortcut);
        this._update();
        const shortcutInput = this._shortcutInputs.get(shortcut);
        if (shortcutInput) {
            shortcutInput.focus();
        }
    }
    _createShortcutRow(shortcut, index) {
        if (this._editedShortcuts.has(shortcut) && !this._editedShortcuts.get(shortcut)) {
            return;
        }
        let icon;
        if (shortcut.type !== UI.KeyboardShortcut.Type.UnsetShortcut && !shortcut.isDefault()) {
            icon = UI.Icon.Icon.create('largeicon-shortcut-changed', 'keybinds-modified');
            UI.ARIAUtils.setAccessibleName(icon, i18nString(UIStrings.shortcutModified));
            this.element.appendChild(icon);
        }
        const shortcutElement = this.element.createChild('div', 'keybinds-shortcut keybinds-list-text');
        if (this._isEditing) {
            const shortcutInput = shortcutElement.createChild('input', 'harmony-input');
            shortcutInput.spellcheck = false;
            shortcutInput.maxLength = 0;
            this._shortcutInputs.set(shortcut, shortcutInput);
            if (!this._elementToFocus) {
                this._elementToFocus = shortcutInput;
            }
            shortcutInput.value = shortcut.title();
            const userDescriptors = this._editedShortcuts.get(shortcut);
            if (userDescriptors) {
                shortcutInput.value = this._shortcutInputTextForDescriptors(userDescriptors);
            }
            shortcutInput.addEventListener('keydown', this._onShortcutInputKeyDown.bind(this, shortcut, shortcutInput));
            shortcutInput.addEventListener('blur', () => {
                if (this._secondKeyTimeout !== null) {
                    clearTimeout(this._secondKeyTimeout);
                    this._secondKeyTimeout = null;
                }
            });
            shortcutElement.appendChild(this._createIconButton(i18nString(UIStrings.removeShortcut), 'largeicon-trash-bin', 'keybinds-delete-button', () => {
                const index = this._shortcuts.indexOf(shortcut);
                if (!shortcut.isDefault()) {
                    this._shortcuts.splice(index, 1);
                }
                this._editedShortcuts.set(shortcut, null);
                this._update();
                this.focus();
                this._validateInputs();
            }));
        }
        else {
            const keys = shortcut.descriptors.flatMap(descriptor => descriptor.name.split(' + '));
            keys.forEach(key => {
                shortcutElement.createChild('span', 'keybinds-key').textContent = key;
            });
            if (Root.Runtime.experiments.isEnabled('keyboardShortcutEditor') && index === 0) {
                this.element.appendChild(this._createEditButton());
            }
        }
    }
    _createEditButton() {
        return this._createIconButton(i18nString(UIStrings.editShortcut), 'largeicon-edit', 'keybinds-edit-button', () => this._settingsTab.startEditing(this._item));
    }
    _createIconButton(label, iconName, className, listener) {
        const button = document.createElement('button');
        button.appendChild(UI.Icon.Icon.create(iconName));
        button.addEventListener('click', listener);
        UI.ARIAUtils.setAccessibleName(button, label);
        if (className) {
            button.classList.add(className);
        }
        return button;
    }
    _onShortcutInputKeyDown(shortcut, shortcutInput, event) {
        if (event.key !== 'Tab') {
            const eventDescriptor = this._descriptorForEvent(event);
            const userDescriptors = this._editedShortcuts.get(shortcut) || [];
            this._editedShortcuts.set(shortcut, userDescriptors);
            const isLastKeyOfShortcut = userDescriptors.length === 2 && UI.KeyboardShortcut.KeyboardShortcut.isModifier(userDescriptors[1].key);
            const shouldClearOldShortcut = userDescriptors.length === 2 && !isLastKeyOfShortcut;
            if (shouldClearOldShortcut) {
                userDescriptors.splice(0, 2);
            }
            if (this._secondKeyTimeout) {
                clearTimeout(this._secondKeyTimeout);
                this._secondKeyTimeout = null;
                userDescriptors.push(eventDescriptor);
            }
            else if (isLastKeyOfShortcut) {
                userDescriptors[1] = eventDescriptor;
            }
            else if (!UI.KeyboardShortcut.KeyboardShortcut.isModifier(eventDescriptor.key)) {
                userDescriptors[0] = eventDescriptor;
                this._secondKeyTimeout = window.setTimeout(() => {
                    this._secondKeyTimeout = null;
                }, UI.ShortcutRegistry.KeyTimeout);
            }
            else {
                userDescriptors[0] = eventDescriptor;
            }
            shortcutInput.value = this._shortcutInputTextForDescriptors(userDescriptors);
            this._validateInputs();
            event.consume(true);
        }
    }
    _descriptorForEvent(event) {
        const userKey = UI.KeyboardShortcut.KeyboardShortcut.makeKeyFromEvent(event);
        const codeAndModifiers = UI.KeyboardShortcut.KeyboardShortcut.keyCodeAndModifiersFromKey(userKey);
        let key = UI.KeyboardShortcut.Keys[event.key] || UI.KeyboardShortcut.KeyBindings[event.key];
        if (!key && !/^[a-z]$/i.test(event.key)) {
            const keyCode = event.code;
            // if we still don't have a key name, let's try the code before falling back to the raw key
            key = UI.KeyboardShortcut.Keys[keyCode] || UI.KeyboardShortcut.KeyBindings[keyCode];
            if (keyCode.startsWith('Digit')) {
                key = keyCode.slice(5);
            }
            else if (keyCode.startsWith('Key')) {
                key = keyCode.slice(3);
            }
        }
        return UI.KeyboardShortcut.KeyboardShortcut.makeDescriptor(key || event.key, codeAndModifiers.modifiers);
    }
    _shortcutInputTextForDescriptors(descriptors) {
        return descriptors.map(descriptor => descriptor.name).join(' ');
    }
    _resetShortcutsToDefaults() {
        this._editedShortcuts.clear();
        for (const shortcut of this._shortcuts) {
            if (shortcut.type === UI.KeyboardShortcut.Type.UnsetShortcut) {
                const index = this._shortcuts.indexOf(shortcut);
                this._shortcuts.splice(index, 1);
            }
            else if (shortcut.type === UI.KeyboardShortcut.Type.UserShortcut) {
                this._editedShortcuts.set(shortcut, null);
            }
        }
        const disabledDefaults = UI.ShortcutRegistry.ShortcutRegistry.instance().disabledDefaultsForAction(this._item.id());
        disabledDefaults.forEach(shortcut => {
            this._shortcuts.push(shortcut);
            this._editedShortcuts.set(shortcut, shortcut.descriptors);
        });
        this._update();
        this.focus();
    }
    onEscapeKeyPressed(event) {
        const activeElement = document.deepActiveElement();
        for (const [shortcut, shortcutInput] of this._shortcutInputs.entries()) {
            if (activeElement === shortcutInput) {
                this._onShortcutInputKeyDown(shortcut, shortcutInput, event);
            }
        }
    }
    _validateInputs() {
        const confirmButton = this._confirmButton;
        const errorMessageElement = this._errorMessageElement;
        if (!confirmButton || !errorMessageElement) {
            return;
        }
        confirmButton.disabled = false;
        errorMessageElement.classList.add('hidden');
        this._shortcutInputs.forEach((shortcutInput, shortcut) => {
            const userDescriptors = this._editedShortcuts.get(shortcut);
            if (!userDescriptors) {
                return;
            }
            if (userDescriptors.some(descriptor => UI.KeyboardShortcut.KeyboardShortcut.isModifier(descriptor.key))) {
                confirmButton.disabled = true;
                shortcutInput.classList.add('error-input');
                UI.ARIAUtils.setInvalid(shortcutInput, true);
                errorMessageElement.classList.remove('hidden');
                errorMessageElement.textContent = i18nString(UIStrings.shortcutsCannotContainOnly);
                return;
            }
            const conflicts = UI.ShortcutRegistry.ShortcutRegistry.instance()
                .actionsForDescriptors(userDescriptors)
                .filter(actionId => actionId !== this._item.id());
            if (conflicts.length) {
                confirmButton.disabled = true;
                shortcutInput.classList.add('error-input');
                UI.ARIAUtils.setInvalid(shortcutInput, true);
                errorMessageElement.classList.remove('hidden');
                const action = UI.ActionRegistry.ActionRegistry.instance().action(conflicts[0]);
                if (!action) {
                    return;
                }
                const actionTitle = action.title();
                const actionCategory = action.category();
                errorMessageElement.textContent =
                    i18nString(UIStrings.thisShortcutIsInUseByS, { PH1: actionCategory, PH2: actionTitle });
                return;
            }
            shortcutInput.classList.remove('error-input');
            UI.ARIAUtils.setInvalid(shortcutInput, false);
        });
    }
}
//# sourceMappingURL=KeybindsSettingsTab.js.map