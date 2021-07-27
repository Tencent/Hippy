import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import type { SourceMapping } from './CSSWorkspaceBinding.js';
export declare class StylesSourceMapping implements SourceMapping {
    _cssModel: SDK.CSSModel.CSSModel;
    _project: ContentProviderBasedProject;
    _styleFiles: Map<string, StyleFile>;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor(cssModel: SDK.CSSModel.CSSModel, workspace: Workspace.Workspace.WorkspaceImpl);
    rawLocationToUILocation(rawLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
    _acceptsHeader(header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): boolean;
    _styleSheetAdded(event: Common.EventTarget.EventTargetEvent): void;
    _styleSheetRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _styleSheetChanged(event: Common.EventTarget.EventTargetEvent): void;
    dispose(): void;
}
export declare class StyleFile implements TextUtils.ContentProvider.ContentProvider {
    _cssModel: SDK.CSSModel.CSSModel;
    _project: ContentProviderBasedProject;
    _headers: Set<SDK.CSSStyleSheetHeader.CSSStyleSheetHeader>;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _throttler: Common.Throttler.Throttler;
    _terminated: boolean;
    _isAddingRevision?: boolean;
    _isUpdatingHeaders?: boolean;
    constructor(cssModel: SDK.CSSModel.CSSModel, project: ContentProviderBasedProject, header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader);
    addHeader(header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): void;
    removeHeader(header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): void;
    _styleSheetChanged(header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): void;
    _workingCopyCommitted(_event: Common.EventTarget.EventTargetEvent): void;
    _workingCopyChanged(_event: Common.EventTarget.EventTargetEvent): void;
    _mirrorContent(fromProvider: TextUtils.ContentProvider.ContentProvider, majorChange: boolean): Promise<void>;
    _styleFileSyncedForTest(): void;
    dispose(): void;
    contentURL(): string;
    contentType(): Common.ResourceType.ResourceType;
    contentEncoded(): Promise<boolean>;
    requestContent(): Promise<TextUtils.ContentProvider.DeferredContent>;
    searchInContent(query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    static readonly updateTimeout = 200;
}
