import * as SDK from '../../core/sdk/sdk.js';
import { ElementsSidebarPane } from './ElementsSidebarPane.js';
export declare class MetricsSidebarPane extends ElementsSidebarPane {
    originalPropertyData: SDK.CSSProperty.CSSProperty | null;
    previousPropertyDataCandidate: SDK.CSSProperty.CSSProperty | null;
    _inlineStyle: SDK.CSSStyleDeclaration.CSSStyleDeclaration | null;
    _highlightMode: string;
    _boxElements: {
        element: HTMLElement;
        name: string;
        backgroundColor: string;
    }[];
    _isEditingMetrics?: boolean;
    constructor();
    doUpdate(): Promise<void>;
    onCSSModelChanged(): void;
    /**
     * Toggle the visibility of the Metrics pane. This toggle allows external
     * callers to control the visibility of this pane, but toggling this on does
     * not guarantee the pane will always show up, because the pane's visibility
     * is also controlled by the internal condition that style cannot be empty.
     */
    toggleVisibility(isVisible: boolean): void;
    _getPropertyValueAsPx(style: Map<string, string>, propertyName: string): number;
    _getBox(computedStyle: Map<string, string>, componentName: string): {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    _highlightDOMNode(showHighlight: boolean, mode: string, event: Event): void;
    _updateMetrics(style: Map<string, string>): void;
    startEditing(targetElement: Element, box: string, styleProperty: string, computedStyle: Map<string, string>): void;
    _handleKeyDown(context: {
        box: string;
        styleProperty: string;
        computedStyle: Map<string, string>;
        keyDownHandler: (arg0: Event) => void;
    }, event: Event): void;
    editingEnded(element: Element, context: {
        keyDownHandler: (arg0: Event) => void;
    }): void;
    editingCancelled(element: Element, context: {
        box: string;
        styleProperty: string;
        computedStyle: Map<string, string>;
        keyDownHandler: (arg0: Event) => void;
    }): void;
    _applyUserInput(element: Element, userInput: string, previousContent: string, context: {
        box: string;
        styleProperty: string;
        computedStyle: Map<string, string>;
        keyDownHandler: (arg0: Event) => void;
    }, commitEditor: boolean): void;
    _editingCommitted(element: Element, userInput: string, previousContent: string, context: {
        box: string;
        styleProperty: string;
        computedStyle: Map<string, string>;
        keyDownHandler: (arg0: Event) => void;
    }): void;
}
