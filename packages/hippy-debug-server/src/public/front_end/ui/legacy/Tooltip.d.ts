export declare class Tooltip {
    element: HTMLElement;
    _shadowRoot: ShadowRoot;
    _tooltipElement: HTMLElement;
    _anchorElement?: Element;
    _tooltipLastOpened?: number;
    _tooltipLastClosed?: number;
    constructor(doc: Document);
    static installHandler(doc: Document): void;
    static install(element: Element, tooltipContent: string | Element | null, actionId?: string, options?: TooltipOptions | null): void;
    static getContent(element: Document | Element): string;
    static addNativeOverrideContainer(element: Element): void;
    _mouseMove(event: Event): void;
    _keyDown(event: Event): void;
    _reposition(anchorElement: Element, event: MouseEvent): void;
    _anchorTooltipAtElement(): boolean;
    _show(anchorElement: Element, event: MouseEvent): void;
    _shouldUseNativeTooltips(): boolean;
    _hide(removeInstant: boolean): void;
    _reset(): void;
}
export interface TooltipOptions {
    anchorTooltipAtElement?: boolean;
}
export declare const TooltipSymbol: symbol;
