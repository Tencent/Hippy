import * as Common from '../../core/common/common.js';
import * as Diff from '../../third_party/diff/diff.js';
import * as Workspace from '../workspace/workspace.js';
export declare class WorkspaceDiffImpl extends Common.ObjectWrapper.ObjectWrapper {
    _uiSourceCodeDiffs: WeakMap<Workspace.UISourceCode.UISourceCode, UISourceCodeDiff>;
    _loadingUISourceCodes: Map<Workspace.UISourceCode.UISourceCode, Promise<[string | null, string | null]>>;
    _modifiedUISourceCodes: Set<Workspace.UISourceCode.UISourceCode>;
    constructor(workspace: Workspace.Workspace.WorkspaceImpl);
    requestDiff(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<Diff.Diff.DiffArray | null>;
    subscribeToDiffChange(uiSourceCode: Workspace.UISourceCode.UISourceCode, callback: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObj?: Object): void;
    unsubscribeFromDiffChange(uiSourceCode: Workspace.UISourceCode.UISourceCode, callback: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObj?: Object): void;
    modifiedUISourceCodes(): Workspace.UISourceCode.UISourceCode[];
    isUISourceCodeModified(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    _uiSourceCodeDiff(uiSourceCode: Workspace.UISourceCode.UISourceCode): UISourceCodeDiff;
    _uiSourceCodeChanged(event: Common.EventTarget.EventTargetEvent): void;
    _uiSourceCodeAdded(event: Common.EventTarget.EventTargetEvent): void;
    _uiSourceCodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _projectRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _removeUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _markAsUnmodified(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _markAsModified(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _uiSourceCodeProcessedForTest(): void;
    _updateModifiedState(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
    requestOriginalContentForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<string | null>;
    revertToOriginal(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
}
export declare class UISourceCodeDiff extends Common.ObjectWrapper.ObjectWrapper {
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _requestDiffPromise: Promise<Diff.Diff.DiffArray | null> | null;
    _pendingChanges: number | null;
    _dispose: boolean;
    constructor(uiSourceCode: Workspace.UISourceCode.UISourceCode);
    _uiSourceCodeChanged(): void;
    requestDiff(): Promise<Diff.Diff.DiffArray | null>;
    _originalContent(): Promise<string | null>;
    _innerRequestDiff(): Promise<Diff.Diff.DiffArray | null>;
}
export declare enum Events {
    DiffChanged = "DiffChanged",
    ModifiedStatusChanged = "ModifiedStatusChanged"
}
export declare function workspaceDiff(): WorkspaceDiffImpl;
export declare class DiffUILocation {
    uiSourceCode: Workspace.UISourceCode.UISourceCode;
    constructor(uiSourceCode: Workspace.UISourceCode.UISourceCode);
}
export declare const UpdateTimeout = 200;
