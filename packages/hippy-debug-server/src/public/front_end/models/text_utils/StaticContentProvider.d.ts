import type * as Common from '../../core/common/common.js';
import type { ContentProvider, DeferredContent, SearchMatch } from './ContentProvider.js';
export declare class StaticContentProvider implements ContentProvider {
    _contentURL: string;
    _contentType: Common.ResourceType.ResourceType;
    _lazyContent: () => Promise<DeferredContent>;
    constructor(contentURL: string, contentType: Common.ResourceType.ResourceType, lazyContent: () => Promise<DeferredContent>);
    static fromString(contentURL: string, contentType: Common.ResourceType.ResourceType, content: string): StaticContentProvider;
    contentURL(): string;
    contentType(): Common.ResourceType.ResourceType;
    contentEncoded(): Promise<boolean>;
    requestContent(): Promise<DeferredContent>;
    searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<SearchMatch[]>;
}
