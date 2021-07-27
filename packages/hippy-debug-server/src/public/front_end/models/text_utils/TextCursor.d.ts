export declare class TextCursor {
    _lineEndings: number[];
    _offset: number;
    _lineNumber: number;
    _columnNumber: number;
    constructor(lineEndings: number[]);
    advance(offset: number): void;
    offset(): number;
    resetTo(offset: number): void;
    lineNumber(): number;
    columnNumber(): number;
}
