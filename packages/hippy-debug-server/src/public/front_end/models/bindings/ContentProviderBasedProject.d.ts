import type * as Common from '../../core/common/common.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
interface UISourceCodeData {
    mimeType: string;
    metadata: Workspace.UISourceCode.UISourceCodeMetadata | null;
}
export declare class ContentProviderBasedProject extends Workspace.Workspace.ProjectStore implements Workspace.Workspace.Project {
    _contentProviders: Map<string, TextUtils.ContentProvider.ContentProvider>;
    _isServiceProject: boolean;
    _uiSourceCodeToData: WeakMap<Workspace.UISourceCode.UISourceCode, UISourceCodeData>;
    constructor(workspace: Workspace.Workspace.WorkspaceImpl, id: string, type: Workspace.Workspace.projectTypes, displayName: string, isServiceProject: boolean);
    requestFileContent(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<TextUtils.ContentProvider.DeferredContent>;
    isServiceProject(): boolean;
    requestMetadata(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<Workspace.UISourceCode.UISourceCodeMetadata | null>;
    canSetFileContent(): boolean;
    setFileContent(_uiSourceCode: Workspace.UISourceCode.UISourceCode, _newContent: string, _isBase64: boolean): Promise<void>;
    fullDisplayName(uiSourceCode: Workspace.UISourceCode.UISourceCode): string;
    mimeType(uiSourceCode: Workspace.UISourceCode.UISourceCode): string;
    canRename(): boolean;
    rename(uiSourceCode: Workspace.UISourceCode.UISourceCode, newName: string, callback: (arg0: boolean, arg1?: string | undefined, arg2?: string | undefined, arg3?: Common.ResourceType.ResourceType | undefined) => void): void;
    excludeFolder(_path: string): void;
    canExcludeFolder(_path: string): boolean;
    createFile(_path: string, _name: string | null, _content: string, _isBase64?: boolean): Promise<Workspace.UISourceCode.UISourceCode | null>;
    canCreateFile(): boolean;
    deleteFile(_uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    remove(): void;
    performRename(path: string, newName: string, callback: (arg0: boolean, arg1?: string | undefined) => void): void;
    searchInFileContent(uiSourceCode: Workspace.UISourceCode.UISourceCode, query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    findFilesMatchingSearchRequest(searchConfig: Workspace.Workspace.ProjectSearchConfig, filesMathingFileQuery: string[], progress: Common.Progress.Progress): Promise<string[]>;
    indexContent(progress: Common.Progress.Progress): void;
    addUISourceCodeWithProvider(uiSourceCode: Workspace.UISourceCode.UISourceCode, contentProvider: TextUtils.ContentProvider.ContentProvider, metadata: Workspace.UISourceCode.UISourceCodeMetadata | null, mimeType: string): void;
    addContentProvider(url: string, contentProvider: TextUtils.ContentProvider.ContentProvider, mimeType: string): Workspace.UISourceCode.UISourceCode;
    removeFile(path: string): void;
    reset(): void;
    dispose(): void;
}
export {};
