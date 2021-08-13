/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { DirectiveClass, DirectiveResult, PartInfo } from './directive.js';
import { DirectiveParent, Part, TemplateResult } from './lit-html.js';

/**
 * Tests if a value is a primitive value.
 *
 * See https://tc39.github.io/ecma262/#sec-typeof-operator
 */
export declare const isPrimitive: (value: unknown) => value is string | number | bigint | boolean | symbol | null | undefined;
export declare const TemplateResultType: {
    readonly HTML: 1;
    readonly SVG: 2;
};
export declare type TemplateResultType = typeof TemplateResultType[keyof typeof TemplateResultType];
/**
 * Tests if a value is a TemplateResult.
 */
export declare const isTemplateResult: (value: unknown, type?: 1 | 2 | undefined) => value is TemplateResult<1 | 2>;
/**
 * Tests if a value is a DirectiveResult.
 */
export declare const isDirectiveResult: (value: unknown) => value is DirectiveResult<DirectiveClass>;
/**
 * Retrieves the Directive class for a DirectiveResult
 */
export declare const getDirectiveClass: (value: unknown) => DirectiveClass | undefined;
/**
 * Tests whether a part has only a single-expression with no strings to
 * interpolate between.
 *
 * Only AttributePart and PropertyPart can have multiple expressions.
 * Multi-expression parts have a `strings` property and single-expression
 * parts do not.
 */
export declare const isSingleExpression: (part: PartInfo) => boolean;
/**
 * Inserts a ChildPart into the given container ChildPart's DOM, either at the
 * end of the container ChildPart, or before the optional `refPart`.
 *
 * This does not add the part to the containerPart's committed value. That must
 * be done by callers.
 *
 * @param containerPart Part within which to add the new ChildPart
 * @param refPart Part before which to add the new ChildPart; when omitted the
 *     part added to the end of the `containerPart`
 * @param part Part to insert, or undefined to create a new part
 */
export declare const insertPart: (containerPart: import("./lit-html.js").ChildPart, refPart?: import("./lit-html.js").ChildPart | undefined, part?: import("./lit-html.js").ChildPart | undefined) => import("./lit-html.js").ChildPart;
/**
 * Sets the value of a Part.
 *
 * Note that this should only be used to set/update the value of user-created
 * parts (i.e. those created using `insertPart`); it should not be used
 * by directives to set the value of the directive's container part. Directives
 * should return a value from `update`/`render` to update their part state.
 *
 * For directives that require setting their part value asynchronously, they
 * should extend `AsyncDirective` and call `this.setValue()`.
 *
 * @param part Part to set
 * @param value Value to set
 * @param index For `AttributePart`s, the index to set
 * @param directiveParent Used internally; should not be set by user
 */
export declare const setChildPartValue: <T extends import("./lit-html.js").ChildPart>(part: T, value: unknown, directiveParent?: DirectiveParent) => T;
/**
 * Sets the committed value of a ChildPart directly without triggering the
 * commit stage of the part.
 *
 * This is useful in cases where a directive needs to update the part such
 * that the next update detects a value change or not. When value is omitted,
 * the next update will be guaranteed to be detected as a change.
 *
 * @param part
 * @param value
 */
export declare const setCommittedValue: (part: Part, value?: unknown) => unknown;
/**
 * Returns the committed value of a ChildPart.
 *
 * The committed value is used for change detection and efficient updates of
 * the part. It can differ from the value set by the template or directive in
 * cases where the template value is transformed before being commited.
 *
 * - `TemplateResult`s are committed as a `TemplateInstance`
 * - Iterables are committed as `Array<ChildPart>`
 * - All other types are committed as the template value or value returned or
 *   set by a directive.
 *
 * @param part
 */
export declare const getCommittedValue: (part: import("./lit-html.js").ChildPart) => unknown;
/**
 * Removes a ChildPart from the DOM, including any of its content.
 *
 * @param part The Part to remove
 */
export declare const removePart: (part: import("./lit-html.js").ChildPart) => void;
export declare const clearPart: (part: import("./lit-html.js").ChildPart) => void;
//# sourceMappingURL=directive-helpers.d.ts.map