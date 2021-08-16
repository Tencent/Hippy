export interface NodeTextData {
    nodeTitle: string;
    nodeId?: string;
    nodeClasses?: string[];
}
export declare class NodeText extends HTMLElement {
    static litTagName: import("../../../ui/lit-html/static.js").Static;
    private readonly shadow;
    private nodeTitle;
    private nodeId?;
    private nodeClasses?;
    set data(data: NodeTextData);
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-node-text': NodeText;
    }
}
