import { SearchMatch } from './ContentProvider.js';
export declare const Utils: {
    readonly _keyValueFilterRegex: RegExp;
    readonly _regexFilterRegex: RegExp;
    readonly _textFilterRegex: RegExp;
    readonly _SpaceCharRegex: RegExp;
    /**
     * @enum {string}
     */
    readonly Indent: {
        TwoSpaces: '  ';
        FourSpaces: '    ';
        EightSpaces: '        ';
        TabCharacter: '\t';
    };
    isStopChar: (char: string) => boolean;
    isWordChar: (char: string) => boolean;
    isSpaceChar: (char: string) => boolean;
    isWord: (word: string) => boolean;
    isOpeningBraceChar: (char: string) => boolean;
    isClosingBraceChar: (char: string) => boolean;
    isBraceChar: (char: string) => boolean;
    textToWords: (text: string, isWordChar: (arg0: string) => boolean, wordCallback: (arg0: string) => void) => void;
    lineIndent: (line: string) => string;
    isUpperCase: (text: string) => boolean;
    isLowerCase: (text: string) => boolean;
    splitStringByRegexes(text: string, regexes: RegExp[]): {
        value: string;
        position: number;
        regexIndex: number;
        captureGroups: Array<string | undefined>;
    }[];
};
export declare class FilterParser {
    _keys: string[];
    constructor(keys: string[]);
    static cloneFilter(filter: ParsedFilter): ParsedFilter;
    parse(query: string): ParsedFilter[];
}
export declare class BalancedJSONTokenizer {
    _callback: (arg0: string) => void;
    _index: number;
    _balance: number;
    _buffer: string;
    _findMultiple: boolean;
    _closingDoubleQuoteRegex: RegExp;
    _lastBalancedIndex?: number;
    constructor(callback: (arg0: string) => void, findMultiple?: boolean);
    write(chunk: string): boolean;
    _reportBalanced(): void;
    remainder(): string;
}
export interface TokenizerFactory {
    createTokenizer(mimeType: string, mode?: CodeMirror.Mode<any>): (arg0: string, arg1: (arg0: string, arg1: string | null, arg2: number, arg3: number) => void) => void;
}
export declare function isMinified(text: string): boolean;
export declare const performSearchInContent: (content: string, query: string, caseSensitive: boolean, isRegex: boolean) => SearchMatch[];
export interface ParsedFilter {
    key?: string;
    text?: string | null;
    regex?: RegExp;
    negative: boolean;
}
