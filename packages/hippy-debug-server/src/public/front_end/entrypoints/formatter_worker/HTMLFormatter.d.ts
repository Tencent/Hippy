import { CSSFormatter } from './CSSFormatter.js';
import type { FormattedContentBuilder } from './FormattedContentBuilder.js';
import { JavaScriptFormatter } from './JavaScriptFormatter.js';
export declare class HTMLFormatter {
    _builder: FormattedContentBuilder;
    _jsFormatter: JavaScriptFormatter;
    _cssFormatter: CSSFormatter;
    _text?: string;
    _lineEndings?: number[];
    _model?: HTMLModel;
    constructor(builder: FormattedContentBuilder);
    format(text: string, lineEndings: number[]): void;
    _formatTokensTill(element: FormatterElement, offset: number): void;
    _walk(element: FormatterElement): void;
    _beforeOpenTag(element: FormatterElement): void;
    _afterOpenTag(element: FormatterElement): void;
    _beforeCloseTag(element: FormatterElement): void;
    _afterCloseTag(_element: FormatterElement): void;
    _formatToken(element: FormatterElement, token: Token): void;
    _scriptTagIsJavaScript(element: FormatterElement): boolean;
    static readonly SupportedJavaScriptMimeTypes: Set<string>;
}
export declare class HTMLModel {
    _state: ParseState;
    _document: FormatterElement;
    _stack: FormatterElement[];
    _tokens: Token[];
    _tokenIndex: number;
    _attributes: Map<string, string>;
    _attributeName: string;
    _tagName: string;
    _isOpenTag: boolean;
    _tagStartOffset?: number | null;
    _tagEndOffset?: number | null;
    constructor(text: string);
    _build(text: string): void;
    _updateDOM(token: Token): void;
    _onStartTag(token: Token): void;
    _onEndTag(token: Token): void;
    _onTagComplete(tag: Tag): void;
    _popElement(closeTag: Tag): void;
    _pushElement(openTag: Tag): void;
    peekToken(): Token | null;
    nextToken(): Token | null;
    document(): FormatterElement;
}
declare const enum ParseState {
    Initial = "Initial",
    Tag = "Tag",
    AttributeName = "AttributeName",
    AttributeValue = "AttributeValue"
}
declare class Token {
    value: string;
    type: Set<string>;
    startOffset: number;
    endOffset: number;
    constructor(value: string, type: Set<string>, startOffset: number, endOffset: number);
}
declare class Tag {
    name: string;
    startOffset: number;
    endOffset: number;
    attributes: Map<string, string>;
    isOpenTag: boolean;
    selfClosingTag: boolean;
    constructor(name: string, startOffset: number, endOffset: number, attributes: Map<string, string>, isOpenTag: boolean, selfClosingTag: boolean);
}
declare class FormatterElement {
    name: string;
    children: FormatterElement[];
    parent: FormatterElement | null;
    openTag: Tag | null;
    closeTag: Tag | null;
    constructor(name: string);
}
export {};
