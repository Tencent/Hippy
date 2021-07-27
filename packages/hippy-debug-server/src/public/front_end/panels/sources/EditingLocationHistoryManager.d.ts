import * as Common from '../../core/common/common.js';
import type * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import type { SourcesView } from './SourcesView.js';
import type { UISourceCodeFrame } from './UISourceCodeFrame.js';
export declare class EditingLocationHistoryManager {
    _sourcesView: SourcesView;
    _historyManager: Common.SimpleHistoryManager.SimpleHistoryManager;
    _currentSourceFrameCallback: () => UISourceCodeFrame | null;
    constructor(sourcesView: SourcesView, currentSourceFrameCallback: () => UISourceCodeFrame | null);
    trackSourceFrameCursorJumps(sourceFrame: UISourceCodeFrame): void;
    _onJumpHappened(event: Common.EventTarget.EventTargetEvent): void;
    rollback(): void;
    rollover(): void;
    updateCurrentState(): void;
    pushNewState(): void;
    _updateActiveState(selection: TextUtils.TextRange.TextRange): void;
    _pushActiveState(selection: TextUtils.TextRange.TextRange): void;
    removeHistoryForSourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
}
export declare const HistoryDepth = 20;
export declare class EditingLocationHistoryEntry implements Common.SimpleHistoryManager.HistoryEntry {
    _sourcesView: SourcesView;
    _editingLocationManager: EditingLocationHistoryManager;
    _projectId: string;
    _url: string;
    _positionHandle: any;
    constructor(sourcesView: SourcesView, editingLocationManager: EditingLocationHistoryManager, sourceFrame: UISourceCodeFrame, selection: TextUtils.TextRange.TextRange);
    merge(entry: EditingLocationHistoryEntry): void;
    _positionFromSelection(selection: TextUtils.TextRange.TextRange): {
        lineNumber: number;
        columnNumber: number;
    };
    valid(): boolean;
    reveal(): void;
}
