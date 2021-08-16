import * as Common from '../../core/common/common.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ChangesSidebar extends UI.Widget.Widget {
    _treeoutline: UI.TreeOutline.TreeOutlineInShadow;
    _treeElements: Map<Workspace.UISourceCode.UISourceCode, UISourceCodeTreeElement>;
    _workspaceDiff: WorkspaceDiff.WorkspaceDiff.WorkspaceDiffImpl;
    constructor(workspaceDiff: WorkspaceDiff.WorkspaceDiff.WorkspaceDiffImpl);
    selectUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode, omitFocus?: boolean | undefined): void;
    selectedUISourceCode(): Workspace.UISourceCode.UISourceCode | null;
    _selectionChanged(): void;
    _uiSourceCodeMofiedStatusChanged(event: Common.EventTarget.EventTargetEvent): void;
    _removeUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _addUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
}
export declare const enum Events {
    SelectedUISourceCodeChanged = "SelectedUISourceCodeChanged"
}
export declare class UISourceCodeTreeElement extends UI.TreeOutline.TreeElement {
    uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    constructor(uiSourceCode: Workspace.UISourceCode.UISourceCode);
    _updateTitle(): void;
    dispose(): void;
}
