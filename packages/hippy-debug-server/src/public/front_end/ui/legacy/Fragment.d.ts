export declare class Fragment {
    _element: Element;
    _elementsById: Map<string, Element>;
    constructor(element: Element);
    element(): Element;
    $(elementId: string): Element;
    static build(strings: TemplateDefinition, ...values: any[]): Fragment;
    static cached(strings: TemplateDefinition, ...values: any[]): Fragment;
    static _template(strings: TemplateDefinition): _Template;
    static _render(template: _Template, values: any[]): Fragment;
    static _nodeForValue(value: any): Node;
}
export declare const _textMarker = "{{template-text}}";
export declare const _attributeMarker: (index: number) => string;
export declare const html: (strings: TemplateDefinition, ...vararg: any[]) => Element;
export declare type TemplateDefinition = string[] | TemplateStringsArray;
export interface _Bind {
    elementId?: string;
    attr?: {
        index: number;
        names: string[];
        values: string[];
    };
    replaceNodeIndex?: number;
}
export interface _Template {
    template: HTMLTemplateElement;
    binds: _Bind[];
}
