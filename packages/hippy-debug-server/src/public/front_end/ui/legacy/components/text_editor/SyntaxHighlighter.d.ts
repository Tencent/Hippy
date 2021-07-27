export declare class SyntaxHighlighter {
    _mimeType: string;
    _stripExtraWhitespace: boolean;
    constructor(mimeType: string, stripExtraWhitespace: boolean);
    createSpan(content: string, className: string): Element;
    syntaxHighlightNode(node: Element): Promise<void>;
}
