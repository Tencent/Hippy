import { DOMNode, NodeSelectedEvent } from './ElementsBreadcrumbsUtils.js';
export { DOMNode };
export interface ElementsBreadcrumbsData {
    selectedNode: DOMNode | null;
    crumbs: DOMNode[];
}
export interface ElementsBreadcrumbs extends HTMLElement {
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
    options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: 'breadcrumbsnodeselected', callback: (event: NodeSelectedEvent) => void): void;
}
export declare class ElementsBreadcrumbs extends HTMLElement {
    private readonly shadow;
    private readonly resizeObserver;
    private crumbsData;
    private selectedDOMNode;
    private overflowing;
    private userScrollPosition;
    private isObservingResize;
    private userHasManuallyScrolled;
    set data(data: ElementsBreadcrumbsData);
    disconnectedCallback(): void;
    private onCrumbClick;
    private checkForOverflowOnResize;
    private update;
    private onCrumbMouseMove;
    private onCrumbMouseLeave;
    private onCrumbFocus;
    private onCrumbBlur;
    private engageResizeObserver;
    /**
     * This method runs after render and checks if the crumbs are too large for
     * their container and therefore we need to render the overflow buttons at
     * either end which the user can use to scroll back and forward through the crumbs.
     * If it finds that we are overflowing, it sets the instance variable and
     * triggers a re-render. If we are not overflowing, this method returns and
     * does nothing.
     */
    private checkForOverflow;
    private onCrumbsWindowScroll;
    private updateScrollState;
    private onOverflowClick;
    private renderOverflowButton;
    private render;
    private ensureSelectedNodeIsVisible;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-elements-breadcrumbs': ElementsBreadcrumbs;
    }
}
