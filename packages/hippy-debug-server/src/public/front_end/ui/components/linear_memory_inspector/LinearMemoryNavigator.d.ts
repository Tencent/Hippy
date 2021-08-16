export declare const enum Navigation {
    Backward = "Backward",
    Forward = "Forward"
}
export declare class AddressInputChangedEvent extends Event {
    data: {
        address: string;
        mode: Mode;
    };
    constructor(address: string, mode: Mode);
}
export declare class PageNavigationEvent extends Event {
    data: Navigation;
    constructor(navigation: Navigation);
}
export declare class HistoryNavigationEvent extends Event {
    data: Navigation;
    constructor(navigation: Navigation);
}
export declare class RefreshRequestedEvent extends Event {
    constructor();
}
export interface LinearMemoryNavigatorData {
    address: string;
    mode: Mode;
    canGoBackInHistory: boolean;
    canGoForwardInHistory: boolean;
    valid: boolean;
    error: string | undefined;
}
export declare const enum Mode {
    Edit = "Edit",
    Submitted = "Submitted",
    InvalidSubmit = "InvalidSubmit"
}
export declare class LinearMemoryNavigator extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private address;
    private error;
    private valid;
    private canGoBackInHistory;
    private canGoForwardInHistory;
    set data(data: LinearMemoryNavigatorData);
    private render;
    private createAddressInput;
    private onAddressChange;
    private createButton;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-linear-memory-inspector-navigator': LinearMemoryNavigator;
    }
}
