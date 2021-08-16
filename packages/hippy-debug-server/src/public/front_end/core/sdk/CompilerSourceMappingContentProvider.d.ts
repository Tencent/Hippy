import * as TextUtils from '../../models/text_utils/text_utils.js';
import type * as Common from '../common/common.js';
import type { PageResourceLoadInitiator } from './PageResourceLoader.js';
export declare class CompilerSourceMappingContentProvider implements TextUtils.ContentProvider.ContentProvider {
    _sourceURL: string;
    _contentType: Common.ResourceType.ResourceType;
    _initiator: PageResourceLoadInitiator;
    constructor(sourceURL: string, contentType: Common.ResourceType.ResourceType, initiator: PageResourceLoadInitiator);
    contentURL(): string;
    contentType(): Common.ResourceType.ResourceType;
    contentEncoded(): Promise<boolean>;
    requestContent(): Promise<TextUtils.ContentProvider.DeferredContent>;
    searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
}
