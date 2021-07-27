import type * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Root from '../../core/root/root.js';
import type { SoftContextMenuDescriptor } from './SoftContextMenu.js';
import { SoftContextMenu } from './SoftContextMenu.js';
export declare class Item {
    _type: string;
    _label: string | undefined;
    _disabled: boolean | undefined;
    _checked: boolean | undefined;
    _contextMenu: ContextMenu | null;
    _id: number | undefined;
    _customElement?: Element;
    _shortcut?: string;
    constructor(contextMenu: ContextMenu | null, type: string, label?: string, disabled?: boolean, checked?: boolean);
    id(): number;
    type(): string;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    _buildDescriptor(): SoftContextMenuDescriptor | Host.InspectorFrontendHostAPI.ContextMenuDescriptor;
    setShortcut(shortcut: string): void;
}
export declare class Section {
    _contextMenu: ContextMenu | null;
    _items: Item[];
    constructor(contextMenu: ContextMenu | null);
    appendItem(label: string, handler: () => void, disabled?: boolean): Item;
    appendCustomItem(element: Element): Item;
    appendSeparator(): Item;
    appendAction(actionId: string, label?: string, optional?: boolean): void;
    appendSubMenuItem(label: string, disabled?: boolean): SubMenu;
    appendCheckboxItem(label: string, handler: () => void, checked?: boolean, disabled?: boolean): Item;
}
export declare class SubMenu extends Item {
    _sections: Map<string, Section>;
    _sectionList: Section[];
    constructor(contextMenu: ContextMenu | null, label?: string, disabled?: boolean);
    _init(): void;
    section(name?: string): Section;
    headerSection(): Section;
    newSection(): Section;
    revealSection(): Section;
    clipboardSection(): Section;
    editSection(): Section;
    debugSection(): Section;
    viewSection(): Section;
    defaultSection(): Section;
    saveSection(): Section;
    footerSection(): Section;
    _buildDescriptor(): SoftContextMenuDescriptor | Host.InspectorFrontendHostAPI.ContextMenuDescriptor;
    appendItemsAtLocation(location: string): void;
    static _uniqueSectionName: number;
}
export declare class ContextMenu extends SubMenu {
    _contextMenu: this;
    _defaultSection: Section;
    _pendingPromises: Promise<Provider[]>[];
    _pendingTargets: Object[];
    _event: MouseEvent;
    _useSoftMenu: boolean;
    _x: number;
    _y: number;
    _handlers: Map<number, () => void>;
    _id: number;
    _softMenu?: SoftContextMenu;
    constructor(event: Event, useSoftMenu?: boolean, x?: number, y?: number);
    static initialize(): void;
    static installHandler(doc: Document): void;
    _nextId(): number;
    show(): Promise<void>;
    discard(): void;
    _innerShow(): void;
    setX(x: number): void;
    setY(y: number): void;
    _setHandler(id: number, handler: () => void): void;
    _buildMenuDescriptors(): (SoftContextMenuDescriptor | Host.InspectorFrontendHostAPI.ContextMenuDescriptor)[];
    _onItemSelected(event: Common.EventTarget.EventTargetEvent): void;
    _itemSelected(id: number): void;
    _menuCleared(): void;
    containsTarget(target: Object): boolean;
    appendApplicableItems(target: Object): void;
    static _pendingMenu: ContextMenu | null;
    static _useSoftMenu: boolean;
    static readonly _groupWeights: string[];
}
export interface Provider {
    appendApplicableItems(event: Event, contextMenu: ContextMenu, target: Object): void;
}
export declare function registerProvider(registration: ProviderRegistration): void;
export declare function registerItem(registration: ContextMenuItemRegistration): void;
export declare function maybeRemoveItem(registration: ContextMenuItemRegistration): boolean;
export declare enum ItemLocation {
    DEVICE_MODE_MENU_SAVE = "deviceModeMenu/save",
    MAIN_MENU = "mainMenu",
    MAIN_MENU_DEFAULT = "mainMenu/default",
    MAIN_MENU_FOOTER = "mainMenu/footer",
    MAIN_MENU_HELP_DEFAULT = "mainMenuHelp/default",
    NAVIGATOR_MENU_DEFAULT = "navigatorMenu/default",
    TIMELINE_MENU_OPEN = "timelineMenu/open"
}
export interface ProviderRegistration {
    contextTypes: () => unknown[];
    loadProvider: () => Promise<Provider>;
    experiment?: Root.Runtime.ExperimentName;
}
export interface ContextMenuItemRegistration {
    location: ItemLocation;
    actionId: string;
    order?: number;
    experiment?: Root.Runtime.ExperimentName;
}
