import * as Common from '../../core/common/common.js';
import { Constraints } from './Geometry.js';
export declare class WidgetElement extends HTMLDivElement {
    __widget: Widget | null;
    __widgetCounter: number | null;
    constructor();
}
export declare class Widget extends Common.ObjectWrapper.ObjectWrapper {
    element: WidgetElement;
    contentElement: HTMLDivElement;
    _shadowRoot: ShadowRoot | undefined;
    _isWebComponent: boolean | undefined;
    _visible: boolean;
    _isRoot: boolean;
    _isShowing: boolean;
    _children: Widget[];
    _hideOnDetach: boolean;
    _notificationDepth: number;
    _invalidationsSuspended: number;
    _defaultFocusedChild: Widget | null;
    _parentWidget: Widget | null;
    _defaultFocusedElement?: Element | null;
    _cachedConstraints?: Constraints;
    _constraints?: Constraints;
    _invalidationsRequested?: boolean;
    _externallyManaged?: boolean;
    constructor(isWebComponent?: boolean, delegatesFocus?: boolean);
    static _incrementWidgetCounter(parentElement: WidgetElement, childElement: WidgetElement): void;
    static _decrementWidgetCounter(parentElement: WidgetElement, childElement: WidgetElement): void;
    static __assert(condition: any, message: string): void;
    markAsRoot(): void;
    parentWidget(): Widget | null;
    children(): Widget[];
    childWasDetached(_widget: Widget): void;
    isShowing(): boolean;
    shouldHideOnDetach(): boolean;
    setHideOnDetach(): void;
    _inNotification(): boolean;
    _parentIsShowing(): boolean;
    _callOnVisibleChildren(method: (this: Widget) => void): void;
    _processWillShow(): void;
    _processWasShown(): void;
    _processWillHide(): void;
    _processWasHidden(): void;
    _processOnResize(): void;
    _notify(notification: (this: Widget) => void): void;
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    onLayout(): void;
    ownerViewDisposed(): Promise<void>;
    show(parentElement: Element, insertBefore?: Node | null): void;
    _attach(parentWidget: Widget): void;
    showWidget(): void;
    _showWidget(parentElement: WidgetElement, insertBefore?: Node | null): void;
    hideWidget(): void;
    _hideWidget(removeFromDOM: boolean): void;
    detach(overrideHideOnDetach?: boolean): void;
    detachChildWidgets(): void;
    elementsToRestoreScrollPositionsFor(): Element[];
    storeScrollPositions(): void;
    restoreScrollPositions(): void;
    doResize(): void;
    doLayout(): void;
    registerRequiredCSS(cssFile: string, options: {
        enableLegacyPatching: false;
    }): void;
    printWidgetHierarchy(): void;
    _collectWidgetHierarchy(prefix: string, lines: string[]): void;
    setDefaultFocusedElement(element: Element | null): void;
    setDefaultFocusedChild(child: Widget): void;
    focus(): void;
    hasFocus(): boolean;
    calculateConstraints(): Constraints;
    constraints(): Constraints;
    setMinimumAndPreferredSizes(width: number, height: number, preferredWidth: number, preferredHeight: number): void;
    setMinimumSize(width: number, height: number): void;
    _hasNonZeroConstraints(): boolean;
    suspendInvalidations(): void;
    resumeInvalidations(): void;
    invalidateConstraints(): void;
    markAsExternallyManaged(): void;
}
export declare class VBox extends Widget {
    constructor(isWebComponent?: boolean, delegatesFocus?: boolean);
    calculateConstraints(): Constraints;
}
export declare class HBox extends Widget {
    constructor(isWebComponent?: boolean);
    calculateConstraints(): Constraints;
}
export declare class VBoxWithResizeCallback extends VBox {
    _resizeCallback: () => void;
    constructor(resizeCallback: () => void);
    onResize(): void;
}
export declare class WidgetFocusRestorer {
    _widget: Widget | null;
    _previous: HTMLElement | null;
    constructor(widget: Widget);
    restore(): void;
}
