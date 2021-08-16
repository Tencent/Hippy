import * as Common from '../../core/common/common.js';
import * as Workspace from '../workspace/workspace.js';
import { PathEncoder } from './PersistenceImpl.js';
export declare class Automapping {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _onStatusAdded: (arg0: AutomappingStatus) => Promise<void>;
    _onStatusRemoved: (arg0: AutomappingStatus) => Promise<void>;
    _statuses: Set<AutomappingStatus>;
    _fileSystemUISourceCodes: Map<string, Workspace.UISourceCode.UISourceCode>;
    _sweepThrottler: Common.Throttler.Throttler;
    _sourceCodeToProcessingPromiseMap: WeakMap<Workspace.UISourceCode.UISourceCode, Promise<void>>;
    _sourceCodeToAutoMappingStatusMap: WeakMap<Workspace.UISourceCode.UISourceCode, AutomappingStatus>;
    _sourceCodeToMetadataMap: WeakMap<Workspace.UISourceCode.UISourceCode, Workspace.UISourceCode.UISourceCodeMetadata | null>;
    _filesIndex: FilePathIndex;
    _projectFoldersIndex: FolderIndex;
    _activeFoldersIndex: FolderIndex;
    _interceptors: ((arg0: Workspace.UISourceCode.UISourceCode) => boolean)[];
    constructor(workspace: Workspace.Workspace.WorkspaceImpl, onStatusAdded: (arg0: AutomappingStatus) => Promise<void>, onStatusRemoved: (arg0: AutomappingStatus) => Promise<void>);
    addNetworkInterceptor(interceptor: (arg0: Workspace.UISourceCode.UISourceCode) => boolean): void;
    scheduleRemap(): void;
    _scheduleSweep(): void;
    _onSweepHappenedForTest(): void;
    _onProjectRemoved(project: Workspace.Workspace.Project): void;
    _onProjectAdded(project: Workspace.Workspace.Project): void;
    _onUISourceCodeAdded(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _onUISourceCodeRemoved(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _onUISourceCodeRenamed(event: Common.EventTarget.EventTargetEvent): void;
    _computeNetworkStatus(networkSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _prevalidationFailedForTest(_binding: AutomappingStatus): void;
    _onBindingFailedForTest(): void;
    _clearNetworkStatus(networkSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _createBinding(networkSourceCode: Workspace.UISourceCode.UISourceCode): Promise<AutomappingStatus | null>;
    _pullMetadatas(uiSourceCodes: Workspace.UISourceCode.UISourceCode[]): Promise<void>;
    _filterWithMetadata(files: Workspace.UISourceCode.UISourceCode[], networkMetadata: Workspace.UISourceCode.UISourceCodeMetadata): Workspace.UISourceCode.UISourceCode[];
}
declare class FilePathIndex {
    _encoder: PathEncoder;
    _reversedIndex: Common.Trie.Trie;
    constructor(encoder: PathEncoder);
    addPath(path: string): void;
    removePath(path: string): void;
    similarFiles(networkPath: string): string[];
}
declare class FolderIndex {
    _encoder: PathEncoder;
    _index: Common.Trie.Trie;
    _folderCount: Map<string, number>;
    constructor(encoder: PathEncoder);
    addFolder(path: string): boolean;
    removeFolder(path: string): boolean;
    closestParentFolder(path: string): string;
}
export declare class AutomappingStatus {
    network: Workspace.UISourceCode.UISourceCode;
    fileSystem: Workspace.UISourceCode.UISourceCode;
    exactMatch: boolean;
    constructor(network: Workspace.UISourceCode.UISourceCode, fileSystem: Workspace.UISourceCode.UISourceCode, exactMatch: boolean);
}
export {};
