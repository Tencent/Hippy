import '../../legacy/legacy.js';
export interface MarkdownLinkData {
    key: string;
    title: string;
}
/**
 * Component to render link from parsed markdown.
 * Parsed links from markdown are not directly rendered, instead they have to be added to the <key, link> map in MarkdownLinksMap.ts.
 * This makes sure that all links are accounted for and no bad links are introduced to devtools via markdown.
 */
export declare class MarkdownLink extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private linkText;
    private linkUrl;
    set data(data: MarkdownLinkData);
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-markdown-link': MarkdownLink;
    }
}
