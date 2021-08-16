export declare class TextRange {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    constructor(startLine: number, startColumn: number, endLine: number, endColumn: number);
    static createFromLocation(line: number, column: number): TextRange;
    static fromObject(serializedTextRange: {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    }): TextRange;
    static comparator(range1: TextRange, range2: TextRange): number;
    static fromEdit(oldRange: TextRange, newText: string): TextRange;
    isEmpty(): boolean;
    immediatelyPrecedes(range?: TextRange): boolean;
    immediatelyFollows(range?: TextRange): boolean;
    follows(range: TextRange): boolean;
    get linesCount(): number;
    collapseToEnd(): TextRange;
    collapseToStart(): TextRange;
    normalize(): TextRange;
    clone(): TextRange;
    serializeToObject(): {
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    };
    compareTo(other: TextRange): number;
    compareToPosition(lineNumber: number, columnNumber: number): number;
    equal(other: TextRange): boolean;
    relativeTo(line: number, column: number): TextRange;
    relativeFrom(line: number, column: number): TextRange;
    rebaseAfterTextEdit(originalRange: TextRange, editedRange: TextRange): TextRange;
    toString(): string;
    containsLocation(lineNumber: number, columnNumber: number): boolean;
}
export declare class SourceRange {
    offset: number;
    length: number;
    constructor(offset: number, length: number);
}
export declare class SourceEdit {
    sourceURL: string;
    oldRange: TextRange;
    newText: string;
    constructor(sourceURL: string, oldRange: TextRange, newText: string);
    static comparator(edit1: SourceEdit, edit2: SourceEdit): number;
    newRange(): TextRange;
}
