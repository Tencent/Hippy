export interface MarkdownImageData {
    key: string;
    title: string;
}
/**
 * Component to render images from parsed markdown.
 * Parsed images from markdown are not directly rendered, instead they have to be added to the MarkdownImagesMap.ts.
 * This makes sure that all icons/images are accounted for in markdown.
 */
export declare class MarkdownImage extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private imageData?;
    private imageTitle?;
    constructor();
    set data(data: MarkdownImageData);
    private getIconComponent;
    private getImageComponent;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-markdown-image': MarkdownImage;
    }
}
