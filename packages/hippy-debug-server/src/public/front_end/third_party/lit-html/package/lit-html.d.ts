/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/// <reference types="trusted-types" />
import type { Directive } from './directive.js';
/**
 * Used to sanitize any value before it is written into the DOM. This can be
 * used to implement a security policy of allowed and disallowed values in
 * order to prevent XSS attacks.
 *
 * One way of using this callback would be to check attributes and properties
 * against a list of high risk fields, and require that values written to such
 * fields be instances of a class which is safe by construction. Closure's Safe
 * HTML Types is one implementation of this technique (
 * https://github.com/google/safe-html-types/blob/master/doc/safehtml-types.md).
 * The TrustedTypes polyfill in API-only mode could also be used as a basis
 * for this technique (https://github.com/WICG/trusted-types).
 *
 * @param node The HTML node (usually either a #text node or an Element) that
 *     is being written to. Note that this is just an exemplar node, the write
 *     may take place against another instance of the same class of node.
 * @param name The name of an attribute or property (for example, 'href').
 * @param type Indicates whether the write that's about to be performed will
 *     be to a property or a node.
 * @return A function that will sanitize this class of writes.
 */
export declare type SanitizerFactory = (node: Node, name: string, type: 'property' | 'attribute') => ValueSanitizer;
/**
 * A function which can sanitize values that will be written to a specific kind
 * of DOM sink.
 *
 * See SanitizerFactory.
 *
 * @param value The value to sanitize. Will be the actual value passed into
 *     the lit-html template literal, so this could be of any type.
 * @return The value to write to the DOM. Usually the same as the input value,
 *     unless sanitization is needed.
 */
export declare type ValueSanitizer = (value: unknown) => unknown;
/** TemplateResult types */
declare const HTML_RESULT = 1;
declare const SVG_RESULT = 2;
declare type ResultType = typeof HTML_RESULT | typeof SVG_RESULT;
declare const ATTRIBUTE_PART = 1;
declare const CHILD_PART = 2;
declare const ELEMENT_PART = 6;
declare const COMMENT_PART = 7;
/**
 * The return type of the template tag functions.
 */
export declare type TemplateResult<T extends ResultType = ResultType> = {
    _$litType$: T;
    strings: TemplateStringsArray;
    values: unknown[];
};
export declare type HTMLTemplateResult = TemplateResult<typeof HTML_RESULT>;
export declare type SVGTemplateResult = TemplateResult<typeof SVG_RESULT>;
export interface CompiledTemplateResult {
    _$litType$: CompiledTemplate;
    values: unknown[];
}
export interface CompiledTemplate extends Omit<Template, 'el'> {
    el?: HTMLTemplateElement;
    h: TrustedHTML;
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
export declare const html: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult<1>;
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */
export declare const svg: (strings: TemplateStringsArray, ...values: unknown[]) => TemplateResult<2>;
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
export declare const noChange: unique symbol;
/**
 * A sentinel value that signals a ChildPart to fully clear its content.
 */
export declare const nothing: unique symbol;
export interface RenderOptions {
    /**
     * An object to use as the `this` value for event listeners. It's often
     * useful to set this to the host component rendering a template.
     */
    host?: object;
    /**
     * A DOM node before which to render content in the container.
     */
    renderBefore?: ChildNode | null;
    /**
     * Node used for cloning the template (`importNode` will be called on this
     * node). This controls the `ownerDocument` of the rendered DOM, along with
     * any inherited context. Defaults to the global `document`.
     */
    creationScope?: {
        importNode(node: Node, deep?: boolean): Node;
    };
}
/**
 * Renders a value, usually a lit-html TemplateResult, to the container.
 * @param value
 * @param container
 * @param options
 */
export declare const render: {
    (value: unknown, container: HTMLElement | DocumentFragment, options?: RenderOptions | undefined): ChildPart;
    setSanitizer: (newSanitizer: SanitizerFactory) => void;
    createSanitizer: SanitizerFactory;
    _testOnlyClearSanitizerFactoryDoNotCallOrElse: () => void;
};
export interface DirectiveParent {
    _$parent?: DirectiveParent;
    __directive?: Directive;
    __directives?: Array<Directive | undefined>;
}
/** @internal */
export type { Template };
declare class Template {
    /** @internal */
    el: HTMLTemplateElement;
    /** @internal */
    parts: Array<TemplatePart>;
    constructor({ strings, _$litType$: type }: TemplateResult, options?: RenderOptions);
    static createElement(html: TrustedHTML, _options?: RenderOptions): HTMLTemplateElement;
}
export interface Disconnectable {
    _$parent?: Disconnectable;
    _$disconnetableChildren?: Set<Disconnectable>;
}
declare function resolveDirective(part: ChildPart | AttributePart | ElementPart, value: unknown, parent?: DirectiveParent, attributeIndex?: number): unknown;
/**
 * An updateable instance of a Template. Holds references to the Parts used to
 * update the template instance.
 */
declare class TemplateInstance {
    /** @internal */
    _$template: Template;
    /** @internal */
    _parts: Array<Part | undefined>;
    /** @internal */
    _$parent: Disconnectable;
    /** @internal */
    _$disconnetableChildren?: Set<Disconnectable>;
    constructor(template: Template, parent: ChildPart);
    _clone(options: RenderOptions | undefined): Node;
    _update(values: Array<unknown>): void;
}
declare type AttributeTemplatePart = {
    readonly type: typeof ATTRIBUTE_PART;
    readonly index: number;
    readonly name: string;
    /** @internal */
    readonly ctor: typeof AttributePart;
    /** @internal */
    readonly strings: ReadonlyArray<string>;
};
declare type NodeTemplatePart = {
    readonly type: typeof CHILD_PART;
    readonly index: number;
};
declare type ElementTemplatePart = {
    readonly type: typeof ELEMENT_PART;
    readonly index: number;
};
declare type CommentTemplatePart = {
    readonly type: typeof COMMENT_PART;
    readonly index: number;
};
/**
 * A TemplatePart represents a dynamic part in a template, before the template
 * is instantiated. When a template is instantiated Parts are created from
 * TemplateParts.
 */
declare type TemplatePart = NodeTemplatePart | AttributeTemplatePart | ElementTemplatePart | CommentTemplatePart;
export declare type Part = ChildPart | AttributePart | PropertyPart | BooleanAttributePart | ElementPart | EventPart;
export type { ChildPart };
declare class ChildPart {
    readonly type = 2;
    readonly options: RenderOptions | undefined;
    _$committedValue: unknown;
    /** @internal */
    __directive?: Directive;
    /** @internal */
    _$startNode: ChildNode;
    /** @internal */
    _$endNode: ChildNode | null;
    private _textSanitizer;
    /** @internal */
    _$parent: Disconnectable | undefined;
    /** @internal */
    _$disconnetableChildren?: Set<Disconnectable>;
    /** @internal */
    _$setChildPartConnected?(isConnected: boolean, removeFromParent?: boolean, from?: number): void;
    /** @internal */
    _$reparentDisconnectables?(parent: Disconnectable): void;
    constructor(startNode: ChildNode, endNode: ChildNode | null, parent: TemplateInstance | ChildPart | undefined, options: RenderOptions | undefined);
    /**
     * Sets the connection state for any `AsyncDirectives` contained
     * within this part and runs their `disconnected` or `reconnected`, according
     * to the `isConnected` argument.
     */
    setConnected(isConnected: boolean): void;
    /**
     * The parent node into which the part renders its content.
     *
     * A ChildPart's content consists of a range of adjacent child nodes of
     * `.parentNode`, possibly bordered by 'marker nodes' (`.startNode` and
     * `.endNode`).
     *
     * - If both `.startNode` and `.endNode` are non-null, then the part's content
     * consists of all siblings between `.startNode` and `.endNode`, exclusively.
     *
     * - If `.startNode` is non-null but `.endNode` is null, then the part's
     * content consists of all siblings following `.startNode`, up to and
     * including the last child of `.parentNode`. If `.endNode` is non-null, then
     * `.startNode` will always be non-null.
     *
     * - If both `.endNode` and `.startNode` are null, then the part's content
     * consists of all child nodes of `.parentNode`.
     */
    get parentNode(): Node;
    /**
     * The part's leading marker node, if any. See `.parentNode` for more
     * information.
     */
    get startNode(): Node | null;
    /**
     * The part's trailing marker node, if any. See `.parentNode` for more
     * information.
     */
    get endNode(): Node | null;
    _$setValue(value: unknown, directiveParent?: DirectiveParent): void;
    private _insert;
    private _commitNode;
    private _commitText;
    private _commitTemplateResult;
    /** @internal */
    _$getTemplate(result: TemplateResult): Template;
    private _commitIterable;
    /**
     * Removes the nodes contained within this Part from the DOM.
     *
     * @param start Start node to clear from, for clearing a subset of the part's
     *     DOM (used when truncating iterables)
     * @param from  When `start` is specified, the index within the iterable from
     *     which ChildParts are being removed, used for disconnecting directives in
     *     those Parts.
     *
     * @internal
     */
    _$clear(start?: ChildNode | null, from?: number): void;
}
export type { AttributePart };
declare class AttributePart {
    readonly type: 1 | 3 | 4 | 5;
    readonly element: HTMLElement;
    readonly name: string;
    readonly options: RenderOptions | undefined;
    /**
     * If this attribute part represents an interpolation, this contains the
     * static strings of the interpolation. For single-value, complete bindings,
     * this is undefined.
     */
    readonly strings?: ReadonlyArray<string>;
    /** @internal */
    _$committedValue: unknown | Array<unknown>;
    /** @internal */
    __directives?: Array<Directive | undefined>;
    /** @internal */
    _$parent: Disconnectable | undefined;
    /** @internal */
    _$disconnetableChildren?: Set<Disconnectable>;
    protected _sanitizer: ValueSanitizer | undefined;
    /** @internal */
    _setDirectiveConnected?: (directive: Directive | undefined, isConnected: boolean, removeFromParent?: boolean) => void;
    get tagName(): string;
    constructor(element: HTMLElement, name: string, strings: ReadonlyArray<string>, parent: Disconnectable | undefined, options: RenderOptions | undefined);
    /**
     * Sets the value of this part by resolving the value from possibly multiple
     * values and static strings and committing it to the DOM.
     * If this part is single-valued, `this._strings` will be undefined, and the
     * method will be called with a single value argument. If this part is
     * multi-value, `this._strings` will be defined, and the method is called
     * with the value array of the part's owning TemplateInstance, and an offset
     * into the value array from which the values should be read.
     * This method is overloaded this way to eliminate short-lived array slices
     * of the template instance values, and allow a fast-path for single-valued
     * parts.
     *
     * @param value The part value, or an array of values for multi-valued parts
     * @param valueIndex the index to start reading values from. `undefined` for
     *   single-valued parts
     * @param noCommit causes the part to not commit its value to the DOM. Used
     *   in hydration to prime attribute parts with their first-rendered value,
     *   but not set the attribute, and in SSR to no-op the DOM operation and
     *   capture the value for serialization.
     *
     * @internal
     */
    _$setValue(value: unknown | Array<unknown>, directiveParent?: DirectiveParent, valueIndex?: number, noCommit?: boolean): void;
    /** @internal */
    _commitValue(value: unknown): void;
}
export type { PropertyPart };
declare class PropertyPart extends AttributePart {
    readonly type = 3;
    /** @internal */
    _commitValue(value: unknown): void;
}
export type { BooleanAttributePart };
declare class BooleanAttributePart extends AttributePart {
    readonly type = 4;
    /** @internal */
    _commitValue(value: unknown): void;
}
/**
 * An AttributePart that manages an event listener via add/removeEventListener.
 *
 * This part works by adding itself as the event listener on an element, then
 * delegating to the value passed to it. This reduces the number of calls to
 * add/removeEventListener if the listener changes frequently, such as when an
 * inline function is used as a listener.
 *
 * Because event options are passed when adding listeners, we must take case
 * to add and remove the part as a listener when the event options change.
 */
export type { EventPart };
declare class EventPart extends AttributePart {
    readonly type = 5;
    /** @internal */
    _$setValue(newListener: unknown, directiveParent?: DirectiveParent): void;
    handleEvent(event: Event): void;
}
export type { ElementPart };
declare class ElementPart {
    element: Element;
    readonly type = 6;
    /** @internal */
    __directive?: Directive;
    _$committedValue: undefined;
    /** @internal */
    _$parent: Disconnectable | undefined;
    /** @internal */
    _$disconnetableChildren?: Set<Disconnectable>;
    /** @internal */
    _setDirectiveConnected?: (directive: Directive | undefined, isConnected: boolean, removeFromParent?: boolean) => void;
    options: RenderOptions | undefined;
    constructor(element: Element, parent: Disconnectable, options: RenderOptions | undefined);
    _$setValue(value: unknown): void;
}
/**
 * END USERS SHOULD NOT RELY ON THIS OBJECT.
 *
 * Private exports for use by other Lit packages, not intended for use by
 * external users.
 *
 * We currently do not make a mangled rollup build of the lit-ssr code. In order
 * to keep a number of (otherwise private) top-level exports  mangled in the
 * client side code, we export a _Σ object containing those members (or
 * helper methods for accessing private fields of those members), and then
 * re-export them for use in lit-ssr. This keeps lit-ssr agnostic to whether the
 * client-side code is being used in `dev` mode or `prod` mode.
 *
 * This has a unique name, to disambiguate it from private exports in
 * lit-element, which re-exports all of lit-html.
 *
 * @private
 */
export declare const _Σ: {
    _boundAttributeSuffix: string;
    _marker: string;
    _markerMatch: string;
    _HTML_RESULT: number;
    _getTemplateHtml: (strings: TemplateStringsArray, type: ResultType) => [TrustedHTML, Array<string | undefined>];
    _TemplateInstance: typeof TemplateInstance;
    _isIterable: (value: unknown) => value is Iterable<unknown>;
    _resolveDirective: typeof resolveDirective;
    _ChildPart: typeof ChildPart;
    _AttributePart: typeof AttributePart;
    _BooleanAttributePart: typeof BooleanAttributePart;
    _EventPart: typeof EventPart;
    _PropertyPart: typeof PropertyPart;
    _ElementPart: typeof ElementPart;
};
//# sourceMappingURL=lit-html.d.ts.map