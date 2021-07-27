import type * as Common from '../../core/common/common.js';
import type * as TextUtils from '../text_utils/text_utils.js';
export declare class PlatformFileSystem {
    _path: string;
    _type: string;
    constructor(path: string, type: string);
    getMetadata(_path: string): Promise<{
        modificationTime: Date;
        size: number;
    } | null>;
    initialFilePaths(): string[];
    initialGitFolders(): string[];
    path(): string;
    embedderPath(): string;
    type(): string;
    createFile(_path: string, _name: string | null): Promise<string | null>;
    deleteFile(_path: string): Promise<boolean>;
    requestFileBlob(_path: string): Promise<Blob | null>;
    requestFileContent(_path: string): Promise<TextUtils.ContentProvider.DeferredContent>;
    setFileContent(_path: string, _content: string, _isBase64: boolean): void;
    renameFile(_path: string, _newName: string, callback: (arg0: boolean, arg1?: string | undefined) => void): void;
    addExcludedFolder(_path: string): void;
    removeExcludedFolder(_path: string): void;
    fileSystemRemoved(): void;
    isFileExcluded(_folderPath: string): boolean;
    excludedFolders(): Set<string>;
    searchInPath(_query: string, _progress: Common.Progress.Progress): Promise<string[]>;
    indexContent(progress: Common.Progress.Progress): void;
    mimeFromPath(_path: string): string;
    canExcludeFolder(_path: string): boolean;
    contentType(_path: string): Common.ResourceType.ResourceType;
    tooltipForURL(_url: string): string;
    supportsAutomapping(): boolean;
}
