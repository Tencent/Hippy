export declare class KeyboardShortcut {
    descriptors: Descriptor[];
    action: string;
    type: Type;
    keybindSets: Set<string>;
    constructor(descriptors: Descriptor[], action: string, type: Type, keybindSets?: Set<string>);
    title(): string;
    isDefault(): boolean;
    changeType(type: Type): KeyboardShortcut;
    changeKeys(descriptors: Descriptor[]): KeyboardShortcut;
    descriptorsMatch(descriptors: Descriptor[]): boolean;
    hasKeybindSet(keybindSet: string): boolean;
    equals(shortcut: KeyboardShortcut): boolean;
    static createShortcutFromSettingObject(settingObject: {
        action: string;
        descriptors: Array<Descriptor>;
        type: Type;
    }): KeyboardShortcut;
    /**
     * Creates a number encoding keyCode in the lower 8 bits and modifiers mask in the higher 8 bits.
     * It is useful for matching pressed keys.
     */
    static makeKey(keyCode: string | number, modifiers?: number): number;
    static makeKeyFromEvent(keyboardEvent: KeyboardEvent): number;
    static makeKeyFromEventIgnoringModifiers(keyboardEvent: KeyboardEvent): number;
    static eventHasCtrlOrMeta(event: KeyboardEvent | MouseEvent): boolean;
    static hasNoModifiers(event: Event): boolean;
    static makeDescriptor(key: string | Key, modifiers?: number): Descriptor;
    static makeDescriptorFromBindingShortcut(shortcut: string): Descriptor;
    static shortcutToString(key: string | Key, modifiers?: number): string;
    static _keyName(key: string | Key): string;
    static _makeKeyFromCodeAndModifiers(keyCode: number, modifiers: number | null): number;
    static keyCodeAndModifiersFromKey(key: number): {
        keyCode: number;
        modifiers: number;
    };
    static isModifier(key: number): boolean;
    static _modifiersToString(modifiers: number | undefined): string;
}
/**
 * Constants for encoding modifier key set as a bit mask.
 * see #_makeKeyFromCodeAndModifiers
 */
export declare const Modifiers: {
    [x: string]: number;
};
export declare const Keys: {
    [x: string]: Key;
};
export declare enum Type {
    UserShortcut = "UserShortcut",
    DefaultShortcut = "DefaultShortcut",
    DisabledDefault = "DisabledDefault",
    UnsetShortcut = "UnsetShortcut",
    KeybindSetShortcut = "KeybindSetShortcut"
}
export declare const KeyBindings: {
    [x: string]: Key;
};
export interface Key {
    code: number;
    name: string | {
        [x: string]: string;
    };
    shiftKey?: boolean;
}
export interface Descriptor {
    key: number;
    name: string;
}
