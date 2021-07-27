import * as Common from '../../core/common/common.js';
import * as Persistence from '../../models/persistence/persistence.js';
import type * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
export declare class SnippetFileSystem extends Persistence.PlatformFileSystem.PlatformFileSystem {
    _lastSnippetIdentifierSetting: Common.Settings.Setting<number>;
    _snippetsSetting: Common.Settings.Setting<Snippet[]>;
    constructor();
    initialFilePaths(): string[];
    createFile(_path: string, _name: string | null): Promise<string | null>;
    deleteFile(path: string): Promise<boolean>;
    requestFileContent(path: string): Promise<TextUtils.ContentProvider.DeferredContent>;
    setFileContent(path: string, content: string, _isBase64: boolean): Promise<boolean>;
    renameFile(path: string, newName: string, callback: (arg0: boolean, arg1?: string | undefined) => void): void;
    searchInPath(query: string, _progress: Common.Progress.Progress): Promise<string[]>;
    mimeFromPath(_path: string): string;
    contentType(_path: string): Common.ResourceType.ResourceType;
    tooltipForURL(url: string): string;
    supportsAutomapping(): boolean;
}
export declare function evaluateScriptSnippet(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
export declare function isSnippetsUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
export declare function isSnippetsProject(project: Workspace.Workspace.Project): boolean;
export declare function findSnippetsProject(): Workspace.Workspace.Project;
export interface Snippet {
    name: string;
    content: string;
}
