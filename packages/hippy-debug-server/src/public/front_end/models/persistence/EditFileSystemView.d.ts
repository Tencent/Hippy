import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { PlatformFileSystem } from './PlatformFileSystem.js';
export declare class EditFileSystemView extends UI.Widget.VBox implements UI.ListWidget.Delegate<string> {
    _fileSystemPath: string;
    _excludedFolders: string[];
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _excludedFoldersList: UI.ListWidget.ListWidget<string>;
    _muteUpdate?: boolean;
    _excludedFolderEditor?: UI.ListWidget.Editor<string>;
    constructor(fileSystemPath: string);
    dispose(): void;
    _getFileSystem(): PlatformFileSystem;
    _update(): void;
    _addExcludedFolderButtonClicked(): void;
    renderItem(item: string, editable: boolean): Element;
    removeItemRequested(_item: string, index: number): void;
    commitEdit(item: string, editor: UI.ListWidget.Editor<string>, isNew: boolean): void;
    beginEdit(item: string): UI.ListWidget.Editor<string>;
    _createExcludedFolderEditor(): UI.ListWidget.Editor<string>;
    _normalizePrefix(prefix: string): string;
}
