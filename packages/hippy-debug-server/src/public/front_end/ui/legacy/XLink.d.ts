import type { ContextMenu, Provider } from './ContextMenu.js';
import { XElement } from './XElement.js';
export declare class XLink extends XElement {
    tabIndex: number;
    target: string;
    rel: string;
    _href: string | null;
    _clickable: boolean;
    _onClick: (arg0: Event) => void;
    _onKeyDown: (arg0: Event) => void;
    static create(url: string, linkText?: string, className?: string, preventClick?: boolean): HTMLElement;
    constructor();
    static get observedAttributes(): string[];
    get href(): string | null;
    attributeChangedCallback(attr: string, oldValue: string | null, newValue: string | null): void;
    _updateClick(): void;
}
export declare class ContextMenuProvider implements Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ContextMenuProvider;
    appendApplicableItems(event: Event, contextMenu: ContextMenu, target: Object): void;
}
