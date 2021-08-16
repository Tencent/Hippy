import * as UI from '../../ui/legacy/legacy.js';
export declare class KeybindsSettingsTab extends UI.Widget.VBox implements UI.ListControl.ListDelegate<KeybindsItem> {
    _items: UI.ListModel.ListModel<KeybindsItem>;
    _list: UI.ListControl.ListControl<string | UI.ActionRegistration.Action>;
    _editingItem: UI.ActionRegistration.Action | null;
    _editingRow: ShortcutListItem | null;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): KeybindsSettingsTab;
    createElementForItem(item: KeybindsItem): Element;
    commitChanges(item: UI.ActionRegistration.Action, editedShortcuts: Map<UI.KeyboardShortcut.KeyboardShortcut, UI.KeyboardShortcut.Descriptor[] | null>): void;
    /**
     * This method will never be called.
     */
    heightForItem(_item: KeybindsItem): number;
    isItemSelectable(_item: KeybindsItem): boolean;
    selectedItemChanged(from: KeybindsItem | null, to: KeybindsItem | null, fromElement: HTMLElement | null, toElement: HTMLElement | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    startEditing(action: UI.ActionRegistration.Action): void;
    stopEditing(action: UI.ActionRegistration.Action): void;
    _createListItems(): KeybindsItem[];
    onEscapeKeyPressed(event: Event): void;
    update(): void;
    willHide(): void;
}
export declare class ShortcutListItem {
    _isEditing: boolean;
    _settingsTab: KeybindsSettingsTab;
    _item: UI.ActionRegistration.Action;
    element: HTMLDivElement;
    _editedShortcuts: Map<UI.KeyboardShortcut.KeyboardShortcut, UI.KeyboardShortcut.Descriptor[] | null>;
    _shortcutInputs: Map<UI.KeyboardShortcut.KeyboardShortcut, Element>;
    _shortcuts: UI.KeyboardShortcut.KeyboardShortcut[];
    _elementToFocus: HTMLElement | null;
    _confirmButton: HTMLButtonElement | null;
    _addShortcutLinkContainer: Element | null;
    _errorMessageElement: Element | null;
    _secondKeyTimeout: number | null;
    constructor(item: UI.ActionRegistration.Action, settingsTab: KeybindsSettingsTab, isEditing?: boolean);
    focus(): void;
    _update(): void;
    _createEmptyInfo(): void;
    _setupEditor(): void;
    _addShortcut(): void;
    _createShortcutRow(shortcut: UI.KeyboardShortcut.KeyboardShortcut, index?: number): void;
    _createEditButton(): Element;
    _createIconButton(label: string, iconName: string, className: string, listener: () => void): HTMLButtonElement;
    _onShortcutInputKeyDown(shortcut: UI.KeyboardShortcut.KeyboardShortcut, shortcutInput: HTMLInputElement, event: Event): void;
    _descriptorForEvent(event: KeyboardEvent): UI.KeyboardShortcut.Descriptor;
    _shortcutInputTextForDescriptors(descriptors: UI.KeyboardShortcut.Descriptor[]): string;
    _resetShortcutsToDefaults(): void;
    onEscapeKeyPressed(event: Event): void;
    _validateInputs(): void;
}
export declare type KeybindsItem = string | UI.ActionRegistration.Action;
