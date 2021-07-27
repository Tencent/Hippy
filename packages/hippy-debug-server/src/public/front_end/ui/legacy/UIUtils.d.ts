import * as Common from '../../core/common/common.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import { Size } from './Geometry.js';
import { Icon } from './Icon.js';
import type { ToolbarButton } from './Toolbar.js';
import type { TreeOutline } from './Treeoutline.js';
export declare const highlightedSearchResultClassName = "highlighted-search-result";
export declare const highlightedCurrentSearchResultClassName = "current-search-result";
export declare function installDragHandle(element: Element, elementDragStart: ((arg0: MouseEvent) => boolean) | null, elementDrag: (arg0: MouseEvent) => void, elementDragEnd: ((arg0: MouseEvent) => void) | null, cursor: string | null, hoverCursor?: string | null, startDelay?: number): void;
export declare function elementDragStart(targetElement: Element, elementDragStart: ((arg0: MouseEvent) => boolean) | null, elementDrag: (arg0: MouseEvent) => void, elementDragEnd: ((arg0: MouseEvent) => void) | null, cursor: string | null, event: Event): void;
export declare function isBeingEdited(node?: Node | null): boolean;
export declare function isEditing(): boolean;
export declare function markBeingEdited(element: Element, value: boolean): boolean;
export declare const StyleValueDelimiters = " \u00A0\t\n\"':;,/()";
export declare function getValueModificationDirection(event: Event): string | null;
export declare function createReplacementString(wordString: string, event: Event, customNumberHandler?: ((arg0: string, arg1: number, arg2: string) => string)): string | null;
export declare function handleElementValueModifications(event: Event, element: Element, finishHandler?: ((arg0: string, arg1: string) => void), suggestionHandler?: ((arg0: string) => boolean), customNumberHandler?: ((arg0: string, arg1: number, arg2: string) => string)): boolean;
export declare function formatLocalized(format: string, substitutions: ArrayLike<any> | null): Element;
export declare function openLinkExternallyLabel(): string;
export declare function copyLinkAddressLabel(): string;
export declare function copyFileNameLabel(): string;
export declare function anotherProfilerActiveLabel(): string;
export declare function asyncStackTraceLabel(description: string | undefined): string;
export declare function installComponentRootStyles(element: Element): void;
export declare class ElementFocusRestorer {
    _element: HTMLElement | null;
    _previous: HTMLElement | null;
    constructor(element: Element);
    restore(): void;
}
export declare function highlightSearchResult(element: Element, offset: number, length: number, domChanges?: any[]): Element | null;
export declare function highlightSearchResults(element: Element, resultRanges: TextUtils.TextRange.SourceRange[], changes?: HighlightChange[]): Element[];
export declare function runCSSAnimationOnce(element: Element, className: string): void;
export declare function highlightRangesWithStyleClass(element: Element, resultRanges: TextUtils.TextRange.SourceRange[], styleClass: string, changes?: HighlightChange[]): Element[];
export declare function applyDomChanges(domChanges: any[]): void;
export declare function revertDomChanges(domChanges: any[]): void;
export declare function measurePreferredSize(element: Element, containerElement?: Element | null): Size;
export declare function startBatchUpdate(): void;
export declare function endBatchUpdate(): void;
export declare function invokeOnceAfterBatchUpdate(object: Object, method: () => void): void;
export declare function animateFunction(window: Window, func: Function, params: {
    from: number;
    to: number;
}[], duration: number, animationComplete?: (() => any)): () => void;
export declare class LongClickController extends Common.ObjectWrapper.ObjectWrapper {
    _element: Element;
    _callback: (arg0: Event) => void;
    _editKey: (arg0: Event) => boolean;
    _longClickData: {
        mouseUp: (arg0: Event) => void;
        mouseDown: (arg0: Event) => void;
        reset: () => void;
    } | undefined;
    _longClickInterval: number | undefined;
    constructor(element: Element, callback: (arg0: Event) => void, isEditKeyFunc?: (arg0: Event) => boolean);
    reset(): void;
    _enable(): void;
    dispose(): void;
    static TIME_MS: number;
}
export declare function initializeUIUtils(document: Document, themeSetting: Common.Settings.Setting<string>): void;
export declare function beautifyFunctionName(name: string): string;
export declare const createTextChild: (element: Element | DocumentFragment, text: string) => Text;
export declare const createTextChildren: (element: Element | DocumentFragment, ...childrenText: string[]) => void;
export declare function createTextButton(text: string, eventHandler?: ((arg0: Event) => any), className?: string, primary?: boolean, alternativeEvent?: string): HTMLButtonElement;
export declare function createInput(className?: string, type?: string): HTMLInputElement;
export declare function createSelect(name: string, options: string[] | Map<string, string[]>[] | Set<string>): HTMLSelectElement;
export declare function createLabel(title: string, className?: string, associatedControl?: Element): Element;
export declare function createRadioLabel(name: string, title: string, checked?: boolean): DevToolsRadioButton;
export declare function createIconLabel(title: string, iconClass: string): HTMLElement;
export declare function createSlider(min: number, max: number, tabIndex: number): Element;
export declare function setTitle(element: HTMLElement, title: string, actionId?: string | undefined): void;
export declare class CheckboxLabel extends HTMLSpanElement {
    _shadowRoot: DocumentFragment;
    checkboxElement: HTMLInputElement;
    textElement: Element;
    constructor();
    static create(title?: string, checked?: boolean, subtitle?: string): CheckboxLabel;
    set backgroundColor(color: string);
    set checkColor(color: string);
    set borderColor(color: string);
    static _lastId: number;
    static _constructor: (() => Element) | null;
}
export declare class DevToolsIconLabel extends HTMLSpanElement {
    _iconElement: Icon;
    constructor();
    set type(type: string);
}
export declare class DevToolsRadioButton extends HTMLSpanElement {
    radioElement: HTMLInputElement;
    labelElement: HTMLLabelElement;
    constructor();
    radioClickHandler(): void;
}
export declare class DevToolsSlider extends HTMLSpanElement {
    sliderElement: HTMLInputElement;
    constructor();
    set value(amount: number);
    get value(): number;
}
export declare class DevToolsSmallBubble extends HTMLSpanElement {
    _textElement: Element;
    constructor();
    set type(type: string);
}
export declare class DevToolsCloseButton extends HTMLDivElement {
    _buttonElement: HTMLElement;
    _hoverIcon: Icon;
    _activeIcon: Icon;
    constructor();
    set gray(gray: boolean);
    setAccessibleName(name: string): void;
    setTabbable(tabbable: boolean): void;
}
export declare function bindInput(input: HTMLInputElement, apply: (arg0: string) => void, validate: (arg0: string) => {
    valid: boolean;
    errorMessage: (string | undefined);
}, numeric: boolean, modifierMultiplier?: number): (arg0: string) => void;
export declare function trimText(context: CanvasRenderingContext2D, text: string, maxWidth: number, trimFunction: (arg0: string, arg1: number) => string): string;
export declare function trimTextMiddle(context: CanvasRenderingContext2D, text: string, maxWidth: number): string;
export declare function trimTextEnd(context: CanvasRenderingContext2D, text: string, maxWidth: number): string;
export declare function measureTextWidth(context: CanvasRenderingContext2D, text: string): number;
/**
 * Adds a 'utm_source=devtools' as query parameter to the url.
 */
export declare function addReferrerToURL(url: string): string;
/**
 * We want to add a referrer query param to every request to
 * 'web.dev' or 'developers.google.com'.
 */
export declare function addReferrerToURLIfNecessary(url: string): string;
export declare function loadImage(url: string): Promise<HTMLImageElement | null>;
export declare function loadImageFromData(data: string | null): Promise<HTMLImageElement | null>;
export declare function createFileSelectorElement(callback: (arg0: File) => any): HTMLInputElement;
export declare const MaxLengthForDisplayedURLs = 150;
export declare class MessageDialog {
    static show(message: string, where?: Element | Document): Promise<void>;
}
export declare class ConfirmDialog {
    static show(message: string, where?: Element | Document): Promise<boolean>;
}
export declare function createInlineButton(toolbarButton: ToolbarButton): Element;
export declare abstract class Renderer {
    abstract render(object: Object, options?: Options): Promise<{
        node: Node;
        tree: TreeOutline | null;
    } | null>;
    static render(object: Object, options?: Options): Promise<{
        node: Node;
        tree: TreeOutline | null;
    } | null>;
}
export declare function formatTimestamp(timestamp: number, full: boolean): string;
export interface Options {
    title?: string | Element;
    editable?: boolean;
}
export interface HighlightChange {
    node: Element;
    type: string;
    oldText?: string;
    newText?: string;
    nextSibling?: Node;
    parent?: Node;
}
export declare const isScrolledToBottom: (element: Element) => boolean;
export declare function createSVGChild(element: Element, childType: string, className?: string): Element;
export declare const enclosingNodeOrSelfWithNodeNameInArray: (initialNode: Node, nameArray: string[]) => Node | null;
export declare const enclosingNodeOrSelfWithNodeName: (node: Node, nodeName: string) => Node | null;
export declare const deepElementFromPoint: (document: Document | ShadowRoot | null | undefined, x: number, y: number) => Node | null;
export declare const deepElementFromEvent: (ev: Event) => Node | null;
export declare function registerRenderer(registration: RendererRegistration): void;
export declare function getApplicableRegisteredRenderers(object: Object): RendererRegistration[];
export interface RendererRegistration {
    loadRenderer: () => Promise<Renderer>;
    contextTypes: () => Array<unknown>;
}
