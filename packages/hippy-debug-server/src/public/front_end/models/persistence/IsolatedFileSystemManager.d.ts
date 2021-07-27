import * as Common from '../../core/common/common.js';
import { IsolatedFileSystem } from './IsolatedFileSystem.js';
import type { PlatformFileSystem } from './PlatformFileSystem.js';
export declare class IsolatedFileSystemManager extends Common.ObjectWrapper.ObjectWrapper {
    _fileSystems: Map<string, PlatformFileSystem>;
    _callbacks: Map<number, (arg0: Array<string>) => void>;
    _progresses: Map<number, Common.Progress.Progress>;
    _workspaceFolderExcludePatternSetting: Common.Settings.RegExpSetting;
    _fileSystemRequestResolve: ((arg0: IsolatedFileSystem | null) => void) | null;
    _fileSystemsLoadedPromise: Promise<IsolatedFileSystem[]>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): IsolatedFileSystemManager;
    _requestFileSystems(): Promise<IsolatedFileSystem[]>;
    addFileSystem(type?: string): Promise<IsolatedFileSystem | null>;
    removeFileSystem(fileSystem: PlatformFileSystem): void;
    waitForFileSystems(): Promise<IsolatedFileSystem[]>;
    _innerAddFileSystem(fileSystem: FileSystem, dispatchEvent: boolean): Promise<IsolatedFileSystem | null>;
    addPlatformFileSystem(fileSystemURL: string, fileSystem: PlatformFileSystem): void;
    _onFileSystemAdded(event: Common.EventTarget.EventTargetEvent): void;
    _onFileSystemRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _onFileSystemFilesChanged(event: Common.EventTarget.EventTargetEvent): void;
    fileSystems(): PlatformFileSystem[];
    fileSystem(fileSystemPath: string): PlatformFileSystem | null;
    workspaceFolderExcludePatternSetting(): Common.Settings.RegExpSetting;
    registerCallback(callback: (arg0: Array<string>) => void): number;
    registerProgress(progress: Common.Progress.Progress): number;
    _onIndexingTotalWorkCalculated(event: Common.EventTarget.EventTargetEvent): void;
    _onIndexingWorked(event: Common.EventTarget.EventTargetEvent): void;
    _onIndexingDone(event: Common.EventTarget.EventTargetEvent): void;
    _onSearchCompleted(event: Common.EventTarget.EventTargetEvent): void;
}
export declare enum Events {
    FileSystemAdded = "FileSystemAdded",
    FileSystemRemoved = "FileSystemRemoved",
    FileSystemFilesChanged = "FileSystemFilesChanged",
    ExcludedFolderAdded = "ExcludedFolderAdded",
    ExcludedFolderRemoved = "ExcludedFolderRemoved"
}
export interface FileSystem {
    type: string;
    fileSystemName: string;
    rootURL: string;
    fileSystemPath: string;
}
