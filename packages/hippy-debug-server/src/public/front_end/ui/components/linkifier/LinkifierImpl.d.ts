export interface LinkifierData {
    url: string;
    lineNumber?: number;
    columnNumber?: number;
}
export declare class LinkifierClick extends Event {
    data: LinkifierData;
    constructor(data: LinkifierData);
}
export declare class Linkifier extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private url;
    private lineNumber?;
    private columnNumber?;
    set data(data: LinkifierData);
    private onLinkActivation;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-linkifier': Linkifier;
    }
}
