// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import { getRegisteredActionExtensions } from './ActionRegistration.js'; // eslint-disable-line no-unused-vars
import { Context } from './Context.js';
import { Dialog } from './Dialog.js';
import { KeyboardShortcut, Modifiers, Type } from './KeyboardShortcut.js'; // eslint-disable-line no-unused-vars
import { isEditing } from './UIUtils.js';
let shortcutRegistryInstance;
export class ShortcutRegistry {
    _actionRegistry;
    _actionToShortcut;
    _keyMap;
    _activePrefixKey;
    _activePrefixTimeout;
    _consumePrefix;
    _devToolsDefaultShortcutActions;
    _disabledDefaultShortcutsForAction;
    _keybindSetSetting;
    _userShortcutsSetting;
    constructor(actionRegistry) {
        this._actionRegistry = actionRegistry;
        this._actionToShortcut = new Platform.MapUtilities.Multimap();
        this._keyMap = new ShortcutTreeNode(0, 0);
        this._activePrefixKey = null;
        this._activePrefixTimeout = null;
        this._consumePrefix = null;
        this._devToolsDefaultShortcutActions = new Set();
        this._disabledDefaultShortcutsForAction = new Platform.MapUtilities.Multimap();
        this._keybindSetSetting = Common.Settings.Settings.instance().moduleSetting('activeKeybindSet');
        this._keybindSetSetting.addChangeListener(event => {
            Host.userMetrics.keybindSetSettingChanged(event.data);
            this._registerBindings();
        });
        this._userShortcutsSetting = Common.Settings.Settings.instance().moduleSetting('userShortcuts');
        this._userShortcutsSetting.addChangeListener(this._registerBindings, this);
        this._registerBindings();
    }
    static instance(opts = { forceNew: null, actionRegistry: null }) {
        const { forceNew, actionRegistry } = opts;
        if (!shortcutRegistryInstance || forceNew) {
            if (!actionRegistry) {
                throw new Error('Missing actionRegistry for shortcutRegistry');
            }
            shortcutRegistryInstance = new ShortcutRegistry(actionRegistry);
        }
        return shortcutRegistryInstance;
    }
    static removeInstance() {
        shortcutRegistryInstance = undefined;
    }
    _applicableActions(key, handlers = {}) {
        let actions = [];
        const keyMap = this._activePrefixKey || this._keyMap;
        const keyNode = keyMap.getNode(key);
        if (keyNode) {
            actions = keyNode.actions();
        }
        const applicableActions = this._actionRegistry.applicableActions(actions, Context.instance());
        if (keyNode) {
            for (const actionId of Object.keys(handlers)) {
                if (keyNode.actions().indexOf(actionId) >= 0) {
                    const action = this._actionRegistry.action(actionId);
                    if (action) {
                        applicableActions.push(action);
                    }
                }
            }
        }
        return applicableActions;
    }
    shortcutsForAction(action) {
        return [...this._actionToShortcut.get(action)];
    }
    actionsForDescriptors(descriptors) {
        let keyMapNode = this._keyMap;
        for (const { key } of descriptors) {
            if (!keyMapNode) {
                return [];
            }
            keyMapNode = keyMapNode.getNode(key);
        }
        return keyMapNode ? keyMapNode.actions() : [];
    }
    globalShortcutKeys() {
        const keys = [];
        for (const node of this._keyMap.chords().values()) {
            const actions = node.actions();
            const applicableActions = this._actionRegistry.applicableActions(actions, Context.instance());
            if (applicableActions.length || node.hasChords()) {
                keys.push(node.key());
            }
        }
        return keys;
    }
    keysForActions(actionIds) {
        const keys = actionIds.flatMap(action => [...this._actionToShortcut.get(action)].flatMap(shortcut => shortcut.descriptors.map(descriptor => descriptor.key)));
        return [...(new Set(keys))];
    }
    shortcutTitleForAction(actionId) {
        for (const shortcut of this._actionToShortcut.get(actionId)) {
            return shortcut.title();
        }
        return undefined;
    }
    handleShortcut(event, handlers) {
        this.handleKey(KeyboardShortcut.makeKeyFromEvent(event), event.key, event, handlers);
    }
    actionHasDefaultShortcut(actionId) {
        return this._devToolsDefaultShortcutActions.has(actionId);
    }
    addShortcutListener(element, handlers) {
        // We only want keys for these specific actions to get handled this
        // way; all others should be allowed to bubble up.
        const allowlistKeyMap = new ShortcutTreeNode(0, 0);
        const shortcuts = Object.keys(handlers).flatMap(action => [...this._actionToShortcut.get(action)]);
        shortcuts.forEach(shortcut => {
            allowlistKeyMap.addKeyMapping(shortcut.descriptors.map(descriptor => descriptor.key), shortcut.action);
        });
        const listener = (event) => {
            const key = KeyboardShortcut.makeKeyFromEvent(event);
            const keyMap = this._activePrefixKey ? allowlistKeyMap.getNode(this._activePrefixKey.key()) : allowlistKeyMap;
            if (!keyMap) {
                return;
            }
            if (keyMap.getNode(key)) {
                this.handleShortcut(event, handlers);
            }
        };
        element.addEventListener('keydown', listener);
        return listener;
    }
    async handleKey(key, domKey, event, handlers) {
        const keyModifiers = key >> 8;
        const hasHandlersOrPrefixKey = Boolean(handlers) || Boolean(this._activePrefixKey);
        const keyMapNode = this._keyMap.getNode(key);
        const maybeHasActions = (this._applicableActions(key, handlers)).length > 0 || (keyMapNode && keyMapNode.hasChords());
        if ((!hasHandlersOrPrefixKey && isPossiblyInputKey()) || !maybeHasActions ||
            KeyboardShortcut.isModifier(KeyboardShortcut.keyCodeAndModifiersFromKey(key).keyCode)) {
            return;
        }
        if (event) {
            event.consume(true);
        }
        if (!hasHandlersOrPrefixKey && Dialog.hasInstance()) {
            return;
        }
        if (this._activePrefixTimeout) {
            clearTimeout(this._activePrefixTimeout);
            const handled = await maybeExecuteActionForKey.call(this);
            this._activePrefixKey = null;
            this._activePrefixTimeout = null;
            if (handled) {
                return;
            }
            if (this._consumePrefix) {
                await this._consumePrefix();
            }
        }
        if (keyMapNode && keyMapNode.hasChords()) {
            this._activePrefixKey = keyMapNode;
            this._consumePrefix = async () => {
                this._activePrefixKey = null;
                this._activePrefixTimeout = null;
                await maybeExecuteActionForKey.call(this);
            };
            this._activePrefixTimeout = window.setTimeout(this._consumePrefix, KeyTimeout);
        }
        else {
            await maybeExecuteActionForKey.call(this);
        }
        function isPossiblyInputKey() {
            if (!event || !isEditing() || /^F\d+|Control|Shift|Alt|Meta|Escape|Win|U\+001B$/.test(domKey)) {
                return false;
            }
            if (!keyModifiers) {
                return true;
            }
            const modifiers = Modifiers;
            // Undo/Redo will also cause input, so textual undo should take precedence over DevTools undo when editing.
            if (Host.Platform.isMac()) {
                if (KeyboardShortcut.makeKey('z', modifiers.Meta) === key) {
                    return true;
                }
                if (KeyboardShortcut.makeKey('z', modifiers.Meta | modifiers.Shift) === key) {
                    return true;
                }
            }
            else {
                if (KeyboardShortcut.makeKey('z', modifiers.Ctrl) === key) {
                    return true;
                }
                if (KeyboardShortcut.makeKey('y', modifiers.Ctrl) === key) {
                    return true;
                }
                if (!Host.Platform.isWin() && KeyboardShortcut.makeKey('z', modifiers.Ctrl | modifiers.Shift) === key) {
                    return true;
                }
            }
            if ((keyModifiers & (modifiers.Ctrl | modifiers.Alt)) === (modifiers.Ctrl | modifiers.Alt)) {
                return Host.Platform.isWin();
            }
            return !hasModifier(modifiers.Ctrl) && !hasModifier(modifiers.Alt) && !hasModifier(modifiers.Meta);
        }
        function hasModifier(mod) {
            return Boolean(keyModifiers & mod);
        }
        /** ;
         */
        async function maybeExecuteActionForKey() {
            const actions = this._applicableActions(key, handlers);
            if (!actions.length) {
                return false;
            }
            for (const action of actions) {
                let handled;
                if (handlers && handlers[action.id()]) {
                    handled = await handlers[action.id()]();
                }
                if (!handlers) {
                    handled = await action.execute();
                }
                if (handled) {
                    Host.userMetrics.keyboardShortcutFired(action.id());
                    return true;
                }
            }
            return false;
        }
    }
    registerUserShortcut(shortcut) {
        for (const otherShortcut of this._disabledDefaultShortcutsForAction.get(shortcut.action)) {
            if (otherShortcut.descriptorsMatch(shortcut.descriptors) &&
                otherShortcut.hasKeybindSet(this._keybindSetSetting.get())) {
                // this user shortcut is the same as a disabled default shortcut,
                // so we should just enable the default
                this.removeShortcut(otherShortcut);
                return;
            }
        }
        for (const otherShortcut of this._actionToShortcut.get(shortcut.action)) {
            if (otherShortcut.descriptorsMatch(shortcut.descriptors) &&
                otherShortcut.hasKeybindSet(this._keybindSetSetting.get())) {
                // don't allow duplicate shortcuts
                return;
            }
        }
        this._addShortcutToSetting(shortcut);
    }
    removeShortcut(shortcut) {
        if (shortcut.type === Type.DefaultShortcut || shortcut.type === Type.KeybindSetShortcut) {
            this._addShortcutToSetting(shortcut.changeType(Type.DisabledDefault));
        }
        else {
            this._removeShortcutFromSetting(shortcut);
        }
    }
    disabledDefaultsForAction(actionId) {
        return this._disabledDefaultShortcutsForAction.get(actionId);
    }
    _addShortcutToSetting(shortcut) {
        const userShortcuts = this._userShortcutsSetting.get();
        userShortcuts.push(shortcut);
        this._userShortcutsSetting.set(userShortcuts);
    }
    _removeShortcutFromSetting(shortcut) {
        const userShortcuts = this._userShortcutsSetting.get();
        const index = userShortcuts.findIndex(shortcut.equals, shortcut);
        if (index !== -1) {
            userShortcuts.splice(index, 1);
            this._userShortcutsSetting.set(userShortcuts);
        }
    }
    _registerShortcut(shortcut) {
        this._actionToShortcut.set(shortcut.action, shortcut);
        this._keyMap.addKeyMapping(shortcut.descriptors.map(descriptor => descriptor.key), shortcut.action);
    }
    _registerBindings() {
        this._actionToShortcut.clear();
        this._keyMap.clear();
        const keybindSet = this._keybindSetSetting.get();
        this._disabledDefaultShortcutsForAction.clear();
        this._devToolsDefaultShortcutActions.clear();
        const forwardedKeys = [];
        if (Root.Runtime.experiments.isEnabled('keyboardShortcutEditor')) {
            const userShortcuts = this._userShortcutsSetting.get();
            for (const userShortcut of userShortcuts) {
                const shortcut = KeyboardShortcut.createShortcutFromSettingObject(userShortcut);
                if (shortcut.type === Type.DisabledDefault) {
                    this._disabledDefaultShortcutsForAction.set(shortcut.action, shortcut);
                }
                else {
                    if (ForwardedActions.has(shortcut.action)) {
                        forwardedKeys.push(...shortcut.descriptors.map(descriptor => KeyboardShortcut.keyCodeAndModifiersFromKey(descriptor.key)));
                    }
                    this._registerShortcut(shortcut);
                }
            }
        }
        for (const actionExtension of getRegisteredActionExtensions()) {
            const actionId = actionExtension.id();
            const bindings = actionExtension.bindings();
            for (let i = 0; bindings && i < bindings.length; ++i) {
                const keybindSets = bindings[i].keybindSets;
                if (!platformMatches(bindings[i].platform) || !keybindSetsMatch(keybindSets)) {
                    continue;
                }
                const keys = bindings[i].shortcut.split(/\s+/);
                const shortcutDescriptors = keys.map(KeyboardShortcut.makeDescriptorFromBindingShortcut);
                if (shortcutDescriptors.length > 0) {
                    if (this._isDisabledDefault(shortcutDescriptors, actionId)) {
                        this._devToolsDefaultShortcutActions.add(actionId);
                        continue;
                    }
                    if (ForwardedActions.has(actionId)) {
                        forwardedKeys.push(...shortcutDescriptors.map(shortcut => KeyboardShortcut.keyCodeAndModifiersFromKey(shortcut.key)));
                    }
                    if (!keybindSets) {
                        this._devToolsDefaultShortcutActions.add(actionId);
                        this._registerShortcut(new KeyboardShortcut(shortcutDescriptors, actionId, Type.DefaultShortcut));
                    }
                    else {
                        if (keybindSets.includes("devToolsDefault" /* DEVTOOLS_DEFAULT */)) {
                            this._devToolsDefaultShortcutActions.add(actionId);
                        }
                        this._registerShortcut(new KeyboardShortcut(shortcutDescriptors, actionId, Type.KeybindSetShortcut, new Set(keybindSets)));
                    }
                }
            }
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setWhitelistedShortcuts(JSON.stringify(forwardedKeys));
        function platformMatches(platformsString) {
            if (!platformsString) {
                return true;
            }
            const platforms = platformsString.split(',');
            let isMatch = false;
            const currentPlatform = Host.Platform.platform();
            for (let i = 0; !isMatch && i < platforms.length; ++i) {
                isMatch = platforms[i] === currentPlatform;
            }
            return isMatch;
        }
        function keybindSetsMatch(keybindSets) {
            if (!keybindSets) {
                return true;
            }
            return keybindSets.includes(keybindSet);
        }
    }
    _isDisabledDefault(shortcutDescriptors, action) {
        const disabledDefaults = this._disabledDefaultShortcutsForAction.get(action);
        for (const disabledDefault of disabledDefaults) {
            if (disabledDefault.descriptorsMatch(shortcutDescriptors)) {
                return true;
            }
        }
        return false;
    }
}
export class ShortcutTreeNode {
    _key;
    _actions;
    _chords;
    _depth;
    constructor(key, depth = 0) {
        this._key = key;
        this._actions = [];
        this._chords = new Map();
        this._depth = depth;
    }
    addAction(action) {
        this._actions.push(action);
    }
    key() {
        return this._key;
    }
    chords() {
        return this._chords;
    }
    hasChords() {
        return this._chords.size > 0;
    }
    addKeyMapping(keys, action) {
        if (keys.length < this._depth) {
            return;
        }
        if (keys.length === this._depth) {
            this.addAction(action);
        }
        else {
            const key = keys[this._depth];
            if (!this._chords.has(key)) {
                this._chords.set(key, new ShortcutTreeNode(key, this._depth + 1));
            }
            this._chords.get(key).addKeyMapping(keys, action);
        }
    }
    getNode(key) {
        return this._chords.get(key) || null;
    }
    actions() {
        return this._actions;
    }
    clear() {
        this._actions = [];
        this._chords = new Map();
    }
}
export class ForwardedShortcut {
    static instance = new ForwardedShortcut();
}
export const ForwardedActions = new Set([
    'main.toggle-dock',
    'debugger.toggle-breakpoints-active',
    'debugger.toggle-pause',
    'commandMenu.show',
    'console.show',
]);
export const KeyTimeout = 1000;
export const DefaultShortcutSetting = 'devToolsDefault';
//# sourceMappingURL=ShortcutRegistry.js.map