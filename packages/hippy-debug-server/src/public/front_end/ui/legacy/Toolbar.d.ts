import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import type { Action } from './ActionRegistration.js';
import { ContextMenu } from './ContextMenu.js';
import { Icon } from './Icon.js';
import type { Suggestion } from './SuggestBox.js';
import { TextPrompt } from './TextPrompt.js';
export declare class Toolbar {
    _items: ToolbarItem[];
    element: HTMLElement;
    _enabled: boolean;
    _shadowRoot: ShadowRoot;
    _contentElement: Element;
    _insertionPoint: Element;
    constructor(className: string, parentElement?: Element);
    static createLongPressActionButton(action: Action, toggledOptions: ToolbarButton[], untoggledOptions: ToolbarButton[]): ToolbarButton;
    static createActionButton(action: Action, options?: ToolbarButtonOptions | undefined): ToolbarButton;
    static createActionButtonForId(actionId: string, options?: ToolbarButtonOptions | undefined): ToolbarButton;
    gripElementForResize(): Element;
    makeWrappable(growVertically?: boolean): void;
    makeVertical(): void;
    makeBlueOnHover(): void;
    makeToggledGray(): void;
    renderAsLinks(): void;
    empty(): boolean;
    setEnabled(enabled: boolean): void;
    appendToolbarItem(item: ToolbarItem): void;
    appendSeparator(): void;
    appendSpacer(): void;
    appendText(text: string): void;
    removeToolbarItems(): void;
    setColor(color: string): void;
    setToggledColor(color: string): void;
    _hideSeparatorDupes(): void;
    appendItemsAtLocation(location: string): Promise<void>;
}
export interface ToolbarButtonOptions {
    showLabel: boolean;
    userActionCode?: Host.UserMetrics.Action;
}
export declare class ToolbarItem extends Common.ObjectWrapper.ObjectWrapper {
    element: HTMLElement;
    _visible: boolean;
    _enabled: boolean;
    toolbar: Toolbar | null;
    _title?: string;
    constructor(element: Element);
    setTitle(title: string, actionId?: string | undefined): void;
    setEnabled(value: boolean): void;
    _applyEnabledState(enabled: boolean): void;
    /** x
       */
    visible(): boolean;
    setVisible(x: boolean): void;
    setRightAligned(alignRight: boolean): void;
}
export declare class ToolbarText extends ToolbarItem {
    constructor(text?: string);
    text(): string;
    setText(text: string): void;
}
export declare class ToolbarButton extends ToolbarItem {
    _glyphElement: Icon;
    _textElement: HTMLElement;
    _title: string;
    _text?: string;
    _glyph?: string;
    /**
     * TODO(crbug.com/1126026): remove glyph parameter in favor of icon.
     */
    constructor(title: string, glyphOrIcon?: string | HTMLElement, text?: string);
    focus(): void;
    setText(text: string): void;
    setGlyph(glyph: string): void;
    setBackgroundImage(iconURL: string): void;
    setSecondary(): void;
    setDarkText(): void;
    turnIntoSelect(shrinkable?: boolean | undefined): void;
    _clicked(event: Event): void;
    _mouseDown(event: Event): void;
}
export declare namespace ToolbarButton {
    enum Events {
        Click = "Click",
        MouseDown = "MouseDown"
    }
}
export declare class ToolbarInput extends ToolbarItem {
    _prompt: TextPrompt;
    _proxyElement: Element;
    constructor(placeholder: string, accessiblePlaceholder?: string, growFactor?: number, shrinkFactor?: number, tooltip?: string, completions?: ((arg0: string, arg1: string, arg2?: boolean | undefined) => Promise<Suggestion[]>), dynamicCompletions?: boolean);
    _applyEnabledState(enabled: boolean): void;
    setValue(value: string, notify?: boolean): void;
    value(): string;
    _onKeydownCallback(event: Event): void;
    _onChangeCallback(): void;
    _updateEmptyStyles(): void;
}
export declare namespace ToolbarInput {
    enum Event {
        TextChanged = "TextChanged",
        EnterPressed = "EnterPressed"
    }
}
export declare class ToolbarToggle extends ToolbarButton {
    _toggled: boolean;
    _untoggledGlyph: string | undefined;
    _toggledGlyph: string | undefined;
    constructor(title: string, glyph?: string, toggledGlyph?: string);
    toggled(): boolean;
    setToggled(toggled: boolean): void;
    setDefaultWithRedColor(withRedColor: boolean): void;
    setToggleWithRedColor(toggleWithRedColor: boolean): void;
}
export declare class ToolbarMenuButton extends ToolbarButton {
    _contextMenuHandler: (arg0: ContextMenu) => void;
    _useSoftMenu: boolean;
    _triggerTimeout?: number;
    _lastTriggerTime?: number;
    constructor(contextMenuHandler: (arg0: ContextMenu) => void, useSoftMenu?: boolean);
    _mouseDown(event: Event): void;
    _trigger(event: Event): void;
    _clicked(event: Event): void;
}
export declare class ToolbarSettingToggle extends ToolbarToggle {
    _defaultTitle: string;
    _setting: Common.Settings.Setting<boolean>;
    _willAnnounceState: boolean;
    constructor(setting: Common.Settings.Setting<boolean>, glyph: string, title: string);
    _settingChanged(): void;
    _clicked(event: Event): void;
}
export declare class ToolbarSeparator extends ToolbarItem {
    constructor(spacer?: boolean);
}
export interface Provider {
    item(): ToolbarItem | null;
}
export interface ItemsProvider {
    toolbarItems(): ToolbarItem[];
}
export declare class ToolbarComboBox extends ToolbarItem {
    _selectElement: HTMLSelectElement;
    constructor(changeHandler: ((arg0: Event) => void) | null, title: string, className?: string);
    selectElement(): HTMLSelectElement;
    size(): number;
    options(): HTMLOptionElement[];
    addOption(option: Element): void;
    createOption(label: string, value?: string): Element;
    _applyEnabledState(enabled: boolean): void;
    removeOption(option: Element): void;
    removeOptions(): void;
    selectedOption(): HTMLOptionElement | null;
    select(option: Element): void;
    setSelectedIndex(index: number): void;
    selectedIndex(): number;
    setMaxWidth(width: number): void;
    setMinWidth(width: number): void;
}
export interface Option {
    value: string;
    label: string;
}
export declare class ToolbarSettingComboBox extends ToolbarComboBox {
    _options: Option[];
    _setting: Common.Settings.Setting<string>;
    _muteSettingListener?: boolean;
    constructor(options: Option[], setting: Common.Settings.Setting<string>, accessibleName: string);
    setOptions(options: Option[]): void;
    value(): string;
    _settingChanged(): void;
    _valueChanged(_event: Event): void;
}
export declare class ToolbarCheckbox extends ToolbarItem {
    inputElement: HTMLInputElement;
    constructor(text: string, tooltip?: string, listener?: ((arg0: MouseEvent) => void));
    checked(): boolean;
    setChecked(value: boolean): void;
    _applyEnabledState(enabled: boolean): void;
}
export declare class ToolbarSettingCheckbox extends ToolbarCheckbox {
    constructor(setting: Common.Settings.Setting<boolean>, tooltip?: string, alternateTitle?: string);
}
export declare function registerToolbarItem(registration: ToolbarItemRegistration): void;
export interface ToolbarItemRegistration {
    order?: number;
    location: ToolbarItemLocation;
    separator?: boolean;
    showLabel?: boolean;
    actionId?: string;
    condition?: string;
    loadItem?: (() => Promise<Provider>);
}
export declare enum ToolbarItemLocation {
    FILES_NAVIGATION_TOOLBAR = "files-navigator-toolbar",
    MAIN_TOOLBAR_RIGHT = "main-toolbar-right",
    MAIN_TOOLBAR_LEFT = "main-toolbar-left",
    STYLES_SIDEBARPANE_TOOLBAR = "styles-sidebarpane-toolbar"
}
