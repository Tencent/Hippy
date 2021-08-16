import * as UI from '../../ui/legacy/legacy.js';
import { EditFileSystemView } from './EditFileSystemView.js';
import type { PlatformFileSystem } from './PlatformFileSystem.js';
export declare class WorkspaceSettingsTab extends UI.Widget.VBox {
    containerElement: HTMLElement;
    _fileSystemsListContainer: HTMLElement;
    _elementByPath: Map<string, Element>;
    _mappingViewByPath: Map<string, EditFileSystemView>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): WorkspaceSettingsTab;
    _createFolderExcludePatternInput(): Element;
    _addItem(fileSystem: PlatformFileSystem): void;
    _renderFileSystem(fileSystem: PlatformFileSystem): Element;
    _removeFileSystemClicked(fileSystem: PlatformFileSystem): void;
    _addFileSystemClicked(): void;
    _fileSystemAdded(fileSystem: PlatformFileSystem): void;
    _fileSystemRemoved(fileSystem: PlatformFileSystem): void;
}
