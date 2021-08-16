export declare class FormattedContentBuilder {
    private indentString;
    private lastOriginalPosition;
    private formattedContent;
    private formattedContentLength;
    private lastFormattedPosition;
    private nestingLevel;
    private newLines;
    private enforceSpaceBetweenWords;
    private softSpace;
    private hardSpaces;
    private cachedIndents;
    mapping: {
        original: number[];
        formatted: number[];
    };
    constructor(indentString: string);
    setEnforceSpaceBetweenWords(value: boolean): boolean;
    addToken(token: string, offset: number): void;
    addSoftSpace(): void;
    addHardSpace(): void;
    addNewLine(noSquash?: boolean): void;
    increaseNestingLevel(): void;
    decreaseNestingLevel(): void;
    content(): string;
    private appendFormatting;
    private indent;
    private addText;
    private addMappingIfNeeded;
}
