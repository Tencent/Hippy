import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import type { Action } from './ActionRegistration.js';
import type { ActionRegistry } from './ActionRegistry.js';
import { KeyboardShortcut } from './KeyboardShortcut.js';
export declare class ShortcutRegistry {
    _actionRegistry: ActionRegistry;
    _actionToShortcut: Platform.MapUtilities.Multimap<string, KeyboardShortcut>;
    _keyMap: ShortcutTreeNode;
    _activePrefixKey: ShortcutTreeNode | null;
    _activePrefixTimeout: number | null;
    _consumePrefix: (() => Promise<void>) | null;
    _devToolsDefaultShortcutActions: Set<string>;
    _disabledDefaultShortcutsForAction: Platform.MapUtilities.Multimap<string, KeyboardShortcut>;
    _keybindSetSetting: Common.Settings.Setting<string>;
    _userShortcutsSetting: Common.Settings.Setting<KeyboardShortcut[]>;
    constructor(actionRegistry: ActionRegistry);
    static instance(opts?: {
        forceNew: boolean | null;
        actionRegistry: ActionRegistry | null;
    }): ShortcutRegistry;
    static removeInstance(): void;
    _applicableActions(key: number, handlers?: {
        [x: string]: () => Promise<boolean>;
    } | undefined): Action[];
    shortcutsForAction(action: string): KeyboardShortcut[];
    actionsForDescriptors(descriptors: {
        key: number;
        name: string;
    }[]): string[];
    globalShortcutKeys(): number[];
    keysForActions(actionIds: string[]): number[];
    shortcutTitleForAction(actionId: string): string | undefined;
    handleShortcut(event: KeyboardEvent, handlers?: {
        [x: string]: () => Promise<boolean>;
    }): void;
    actionHasDefaultShortcut(actionId: string): boolean;
    addShortcutListener(element: Element, handlers: {
        [x: string]: () => Promise<boolean>;
    }): (arg0: Event) => void;
    handleKey(key: number, domKey: string, event?: KeyboardEvent, handlers?: {
        [x: string]: () => Promise<boolean>;
    }): Promise<void>;
    registerUserShortcut(shortcut: KeyboardShortcut): void;
    removeShortcut(shortcut: KeyboardShortcut): void;
    disabledDefaultsForAction(actionId: string): Set<KeyboardShortcut>;
    _addShortcutToSetting(shortcut: KeyboardShortcut): void;
    _removeShortcutFromSetting(shortcut: KeyboardShortcut): void;
    _registerShortcut(shortcut: KeyboardShortcut): void;
    _registerBindings(): void;
    _isDisabledDefault(shortcutDescriptors: {
        key: number;
        name: string;
    }[], action: string): boolean;
}
export declare class ShortcutTreeNode {
    _key: number;
    _actions: string[];
    _chords: Map<number, ShortcutTreeNode>;
    _depth: number;
    constructor(key: number, depth?: number);
    addAction(action: string): void;
    key(): number;
    chords(): Map<number, ShortcutTreeNode>;
    hasChords(): boolean;
    addKeyMapping(keys: number[], action: string): void;
    getNode(key: number): ShortcutTreeNode | null;
    actions(): string[];
    clear(): void;
}
export declare class ForwardedShortcut {
    static instance: ForwardedShortcut;
}
export declare const ForwardedActions: Set<string>;
export declare const KeyTimeout = 1000;
export declare const DefaultShortcutSetting = "devToolsDefault";
