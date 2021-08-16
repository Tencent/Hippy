import type * as Formatter from '../../models/formatter/formatter.js';
import * as Acorn from '../../third_party/acorn/acorn.js';
export interface Chunk {
    chunk: any[];
    isLastChunk: boolean;
}
export declare type ChunkCallback = (arg0: Chunk) => void;
export declare function createTokenizer(mimeType: string): (arg0: string, arg1: (arg0: string, arg1: string | null, arg2: number, arg3: number) => (Object | undefined | void)) => any;
export declare const AbortTokenization: {};
export declare function evaluatableJavaScriptSubstring(content: string): string;
export declare function javaScriptIdentifiers(content: string): {
    name: (string | undefined);
    offset: number;
}[];
export declare function format(mimeType: string, text: string, indentString?: string): Formatter.FormatterWorkerPool.FormatResult;
export declare function findLastFunctionCall(content: string): {
    baseExpression: string;
    receiver: string;
    argumentIndex: number;
    functionName: string;
} | null;
export declare function argumentsList(content: string): string[];
export declare function findLastExpression(content: string): string | null;
export declare function _lastCompleteExpression(content: string, suffix: string, types: Set<string>): {
    baseNode: Acorn.ESTree.Node;
    baseExpression: string;
} | null;
