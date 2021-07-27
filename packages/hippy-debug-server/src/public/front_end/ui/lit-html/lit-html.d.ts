import * as LitHtml from '../../third_party/lit-html/lit-html.js';
import * as Static from './static.js';
export { Directive, TemplateResult } from '../../third_party/lit-html/lit-html.js';
declare const render: {
    (value: unknown, container: HTMLElement | DocumentFragment, options?: LitHtml.RenderOptions | undefined): LitHtml.Directive.ChildPart;
    setSanitizer: (newSanitizer: LitHtml.SanitizerFactory) => void;
    createSanitizer: LitHtml.SanitizerFactory;
    _testOnlyClearSanitizerFactoryDoNotCallOrElse: () => void;
}, svg: (strings: TemplateStringsArray, ...values: unknown[]) => LitHtml.TemplateResult<2>, Directives: typeof LitHtml.Directives, nothing: symbol, noChange: symbol;
declare const html: typeof Static.html, literal: typeof Static.literal, flattenTemplate: typeof Static.flattenTemplate;
export { render, Directives, nothing, noChange, svg, html, literal, flattenTemplate, };
