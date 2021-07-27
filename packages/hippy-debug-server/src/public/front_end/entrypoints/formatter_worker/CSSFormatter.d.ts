import type { FormattedContentBuilder } from './FormattedContentBuilder.js';
export declare class CSSFormatter {
    _builder: FormattedContentBuilder;
    _toOffset: number;
    _fromOffset: number;
    _lineEndings: number[];
    _lastLine: number;
    _state: {
        eatWhitespace: (boolean | undefined);
        seenProperty: (boolean | undefined);
        inPropertyValue: (boolean | undefined);
        afterClosingBrace: (boolean | undefined);
    };
    constructor(builder: FormattedContentBuilder);
    format(text: string, lineEndings: number[], fromOffset: number, toOffset: number): void;
    _tokenCallback(token: string, type: string | null, startPosition: number): void;
}
