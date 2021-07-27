export declare const escapeCharacters: (inputString: string, charsToEscape: string) => string;
export declare const enum FormatterType {
    STRING = "string",
    SPECIFIER = "specifier"
}
export interface FormatterToken {
    type: FormatterType;
    value?: string | {
        description: string;
    };
    specifier?: string;
    precision?: number;
    substitutionIndex?: number;
}
export declare const tokenizeFormatString: (formatString: string, formatters: Record<string, Function>) => FormatterToken[];
export declare type FormatterFunction<T> = (input: string | {
    description: string;
} | undefined | T, token: FormatterToken) => unknown;
export declare const format: <T, U>(formatString: string, substitutions: ArrayLike<U> | null, formatters: Record<string, FormatterFunction<U>>, initialValue: T, append: (initialValue: T, newString?: string | undefined) => T, tokenizedFormat?: FormatterToken[] | undefined) => {
    formattedResult: T;
    unusedSubstitutions: ArrayLike<U> | null;
};
export declare const standardFormatters: {
    d: (substitution: unknown) => number;
    f: (substitution: unknown, token: FormatterToken) => string;
    s: (substitution: unknown) => string;
};
export declare const vsprintf: (formatString: string, substitutions: unknown[]) => string;
export declare const sprintf: (format: string, ...varArg: unknown[]) => string;
export declare const toBase64: (inputString: string) => string;
export declare const findIndexesOfSubString: (inputString: string, searchString: string) => number[];
export declare const findLineEndingIndexes: (inputString: string) => number[];
export declare const isWhitespace: (inputString: string) => boolean;
export declare const trimURL: (url: string, baseURLDomain?: string | undefined) => string;
export declare const collapseWhitespace: (inputString: string) => string;
export declare const reverse: (inputString: string) => string;
export declare const replaceControlCharacters: (inputString: string) => string;
export declare const countWtf8Bytes: (inputString: string) => number;
export declare const stripLineBreaks: (inputStr: string) => string;
export declare const toTitleCase: (inputStr: string) => string;
export declare const removeURLFragment: (inputStr: string) => string;
export declare const regexSpecialCharacters: () => string;
export declare const filterRegex: (query: string) => RegExp;
export declare const createSearchRegex: (query: string, caseSensitive: boolean, isRegex: boolean) => RegExp;
export declare const caseInsensetiveComparator: (a: string, b: string) => number;
export declare const hashCode: (string?: string | undefined) => number;
export declare const compare: (a: string, b: string) => number;
export declare const trimMiddle: (str: string, maxLength: number) => string;
export declare const trimEndWithMaxLength: (str: string, maxLength: number) => string;
export declare const escapeForRegExp: (str: string) => string;
export declare const naturalOrderComparator: (a: string, b: string) => number;
export declare const base64ToSize: (content: string | null) => number;
