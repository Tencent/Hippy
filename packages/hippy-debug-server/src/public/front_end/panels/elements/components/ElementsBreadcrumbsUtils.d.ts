export interface DOMNode {
    parentNode: DOMNode | null;
    id: number;
    nodeType: number;
    pseudoType?: string;
    shadowRootType: string | null;
    nodeName: string;
    nodeNameNicelyCased: string;
    legacyDomNode: unknown;
    highlightNode: () => void;
    clearHighlight: () => void;
    getAttribute: (attr: string) => string | undefined;
}
export declare type UserScrollPosition = 'start' | 'middle' | 'end';
export interface Crumb {
    title: CrumbTitle;
    selected: boolean;
    node: DOMNode;
    originalNode: unknown;
}
export interface CrumbTitle {
    main: string;
    extras: {
        id?: string;
        classes?: string[];
    };
}
export declare const crumbsToRender: (crumbs: readonly DOMNode[], selectedNode: Readonly<DOMNode> | null) => Crumb[];
export declare class NodeSelectedEvent extends Event {
    data: unknown;
    constructor(node: DOMNode);
}
export declare const determineElementTitle: (domNode: DOMNode) => CrumbTitle;
