import * as LitHtml from '../../lit-html/lit-html.js';
/**
 * Provides a hook to get a callback when a LitHtml node is rendered into the DOM:
 * @example
 *
 * ```
 * <p on-render=${nodeRenderedCallback(node => ...)}>
 * ```
 */
declare class NodeRenderedCallback extends LitHtml.Directive.Directive {
    constructor(partInfo: LitHtml.Directive.PartInfo);
    update(part: LitHtml.Directive.ElementPart, [callback]: LitHtml.Directive.DirectiveParameters<this>): void;
    render(_callback: (domNode: Element) => void): void;
}
export declare const nodeRenderedCallback: (_callback: (domNode: Element) => void) => LitHtml.Directive.DirectiveResult<typeof NodeRenderedCallback>;
export {};
