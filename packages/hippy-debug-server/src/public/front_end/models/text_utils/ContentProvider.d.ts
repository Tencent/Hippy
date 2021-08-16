import type * as Common from '../../core/common/common.js';
export declare abstract class ContentProvider {
    abstract contentURL(): string;
    abstract contentType(): Common.ResourceType.ResourceType;
    abstract contentEncoded(): Promise<boolean>;
    abstract requestContent(): Promise<DeferredContent>;
    abstract searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<SearchMatch[]>;
}
export declare class SearchMatch {
    lineNumber: number;
    lineContent: string;
    constructor(lineNumber: number, lineContent: string);
}
export declare const contentAsDataURL: (content: string | null, mimeType: string, contentEncoded: boolean, charset?: string | null | undefined, limitSize?: boolean) => string | null;
export declare type DeferredContent = {
    content: string;
    isEncoded: boolean;
} | {
    content: null;
    error: string;
    isEncoded: boolean;
};
