import { XElement } from './XElement.js';
export declare class XWidget extends XElement {
    _visible: boolean;
    _shadowRoot: DocumentFragment | null;
    _defaultFocusedElement: Element | null;
    _elementsToRestoreScrollPositionsFor: Element[];
    _onShownCallback: (() => void) | null;
    _onHiddenCallback: (() => void) | null;
    _onResizedCallback: (() => void) | null;
    constructor();
    isShowing(): boolean;
    registerRequiredCSS(cssFile: string, options: {
        enableLegacyPatching: false;
    }): void;
    setOnShown(callback: (() => void) | null): void;
    setOnHidden(callback: (() => void) | null): void;
    setOnResized(callback: (() => void) | null): void;
    setElementsToRestoreScrollPositionsFor(elements: Element[]): void;
    restoreScrollPositions(): void;
    static _storeScrollPosition(event: Event): void;
    setDefaultFocusedElement(element: Element | null): void;
    focus(): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
