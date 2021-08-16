import { GlassPane } from './GlassPane.js';
import { ElementFocusRestorer } from './UIUtils.js';
export declare class SoftContextMenu {
    _items: SoftContextMenuDescriptor[];
    _itemSelectedCallback: (arg0: number) => void;
    _parentMenu: SoftContextMenu | undefined;
    _highlightedMenuItemElement: HTMLElement | null;
    detailsForElementMap: WeakMap<HTMLElement, ElementMenuDetails>;
    _document?: Document;
    _glassPane?: GlassPane;
    _contextMenuElement?: HTMLElement;
    _focusRestorer?: ElementFocusRestorer;
    _hideOnUserGesture?: ((event: Event) => void);
    _activeSubMenuElement?: HTMLElement;
    _subMenu?: SoftContextMenu;
    constructor(items: SoftContextMenuDescriptor[], itemSelectedCallback: (arg0: number) => void, parentMenu?: SoftContextMenu);
    show(document: Document, anchorBox: AnchorBox): void;
    discard(): void;
    _createMenuItem(item: SoftContextMenuDescriptor): HTMLElement;
    _createSubMenu(item: SoftContextMenuDescriptor): HTMLElement;
    _createSeparator(): HTMLElement;
    _menuItemMouseDown(event: Event): void;
    _menuItemMouseUp(event: Event): void;
    _root(): SoftContextMenu;
    _triggerAction(menuItemElement: HTMLElement, event: Event): void;
    _showSubMenu(menuItemElement: HTMLElement): void;
    _menuItemMouseOver(event: Event): void;
    _menuItemMouseLeave(event: MouseEvent): void;
    _highlightMenuItem(menuItemElement: HTMLElement | null, scheduleSubMenu: boolean): void;
    _highlightPrevious(): void;
    _highlightNext(): void;
    _menuKeyDown(event: Event): void;
}
export interface SoftContextMenuDescriptor {
    type: string;
    id?: number;
    label?: string;
    enabled?: boolean;
    checked?: boolean;
    subItems?: SoftContextMenuDescriptor[];
    element?: Element;
    shortcut?: string;
}
interface ElementMenuDetails {
    customElement?: HTMLElement;
    isSeparator?: boolean;
    subMenuTimer?: number;
    subItems?: SoftContextMenuDescriptor[];
    actionId?: number;
}
export {};
