import * as TextRange from './TextRange.js';
import type * as TextUtils from './TextUtils.js';
export declare function toPos(range: TextRange.TextRange): {
    start: any;
    end: any;
};
export declare function toRange(start: any, end: any): TextRange.TextRange;
export declare function changeObjectToEditOperation(changeObject: any): {
    oldRange: TextRange.TextRange;
    newRange: TextRange.TextRange;
};
export declare function pullLines(codeMirror: typeof CodeMirror, linesCount: number): string[];
export declare type Tokenizer = (line: string, callback: (value: string, style: string | null, start: number, end: number) => void) => void;
export declare class TokenizerFactory implements TextUtils.TokenizerFactory {
    static instance(opts?: {
        forceNew: boolean | null;
    }): TokenizerFactory;
    getMode(mimeType: string): any;
    createTokenizer(mimeType: string, mode?: any): Tokenizer;
}
