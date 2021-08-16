import type * as Common from '../../core/common/common.js';
import type * as Workspace from '../../models/workspace/workspace.js';
export declare class SearchConfig implements Workspace.Workspace.ProjectSearchConfig {
    _query: string;
    _ignoreCase: boolean;
    _isRegex: boolean;
    _fileQueries?: QueryTerm[];
    _queries?: string[];
    _fileRegexQueries?: RegexQuery[];
    constructor(query: string, ignoreCase: boolean, isRegex: boolean);
    static fromPlainObject(object: {
        query: string;
        ignoreCase: boolean;
        isRegex: boolean;
    }): SearchConfig;
    query(): string;
    ignoreCase(): boolean;
    isRegex(): boolean;
    toPlainObject(): {
        query: string;
        ignoreCase: boolean;
        isRegex: boolean;
    };
    _parse(): void;
    filePathMatchesFileQuery(filePath: string): boolean;
    queries(): string[];
    _parseUnquotedQuery(query: string): string;
    _parseQuotedQuery(query: string): string;
    _parseFileQuery(query: string): QueryTerm | null;
}
export declare const FilePatternRegex: RegExp;
export declare class QueryTerm {
    text: string;
    isNegative: boolean;
    constructor(text: string, isNegative: boolean);
}
/**
 * @interface
 */
export interface SearchResult {
    label(): string;
    description(): string;
    matchesCount(): number;
    matchLabel(index: number): string;
    matchLineContent(index: number): string;
    matchRevealable(index: number): Object;
}
/**
 * @interface
 */
export interface SearchScope {
    performSearch(searchConfig: SearchConfig, progress: Common.Progress.Progress, searchResultCallback: (arg0: SearchResult) => void, searchFinishedCallback: (arg0: boolean) => void): void | Promise<void>;
    performIndexing(progress: Common.Progress.Progress): void;
    stopSearch(): void;
}
export interface RegexQuery {
    regex: RegExp;
    isNegative: boolean;
}
