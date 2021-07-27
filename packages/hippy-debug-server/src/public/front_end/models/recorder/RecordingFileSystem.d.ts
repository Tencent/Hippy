import * as Common from '../../core/common/common.js';
import * as Persistence from '../persistence/persistence.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
export declare class RecordingFileSystem extends Persistence.PlatformFileSystem.PlatformFileSystem {
    _lastRecordingIdentifierSetting: Common.Settings.Setting<number>;
    _recordingsSetting: Common.Settings.Setting<Recording[]>;
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
export declare function isRecordingUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
export declare function isRecordingProject(project: Workspace.Workspace.Project): boolean;
export declare function findRecordingsProject(): Workspace.Workspace.Project;
export interface Recording {
    name: string;
    content: string;
}
