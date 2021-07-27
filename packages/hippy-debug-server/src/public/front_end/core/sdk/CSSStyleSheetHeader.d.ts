import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import type * as Protocol from '../../generated/protocol.js';
import type { CSSModel } from './CSSModel.js';
import { DeferredDOMNode } from './DOMModel.js';
import type { FrameAssociated } from './FrameAssociated.js';
import type { PageResourceLoadInitiator } from './PageResourceLoader.js';
export declare class CSSStyleSheetHeader implements TextUtils.ContentProvider.ContentProvider, FrameAssociated {
    _cssModel: CSSModel;
    id: string;
    frameId: string;
    sourceURL: string;
    hasSourceURL: boolean;
    origin: Protocol.CSS.StyleSheetOrigin;
    title: string;
    disabled: boolean;
    isInline: boolean;
    isMutable: boolean;
    isConstructed: boolean;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
    contentLength: number;
    ownerNode: DeferredDOMNode | undefined;
    sourceMapURL: string | undefined;
    _originalContentProvider: TextUtils.StaticContentProvider.StaticContentProvider | null;
    constructor(cssModel: CSSModel, payload: Protocol.CSS.CSSStyleSheetHeader);
    originalContentProvider(): TextUtils.ContentProvider.ContentProvider;
    setSourceMapURL(sourceMapURL?: string): void;
    cssModel(): CSSModel;
    isAnonymousInlineStyleSheet(): boolean;
    resourceURL(): string;
    _viaInspectorResourceURL(): string;
    lineNumberInSource(lineNumberInStyleSheet: number): number;
    columnNumberInSource(lineNumberInStyleSheet: number, columnNumberInStyleSheet: number): number | undefined;
    /**
     * Checks whether the position is in this style sheet. Assumes that the
     * position's columnNumber is consistent with line endings.
     */
    containsLocation(lineNumber: number, columnNumber: number): boolean;
    contentURL(): string;
    contentType(): Common.ResourceType.ResourceType;
    contentEncoded(): Promise<boolean>;
    requestContent(): Promise<TextUtils.ContentProvider.DeferredContent>;
    searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    isViaInspector(): boolean;
    createPageResourceLoadInitiator(): PageResourceLoadInitiator;
}
