import * as Common from '../../core/common/common.js';
import * as Diff from '../../third_party/diff/diff.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Workspace from '../../models/workspace/workspace.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import { ChangesSidebar } from './ChangesSidebar.js';
import { ChangesTextEditor } from './ChangesTextEditor.js';
export declare class ChangesView extends UI.Widget.VBox {
    _emptyWidget: UI.EmptyWidget.EmptyWidget;
    _workspaceDiff: WorkspaceDiff.WorkspaceDiff.WorkspaceDiffImpl;
    _changesSidebar: ChangesSidebar;
    _selectedUISourceCode: Workspace.UISourceCode.UISourceCode | null;
    _diffRows: Row[];
    _maxLineDigits: number;
    _editor: ChangesTextEditor;
    _toolbar: UI.Toolbar.Toolbar;
    _diffStats: UI.Toolbar.ToolbarText;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ChangesView;
    _selectedUISourceCodeChanged(): void;
    _revert(): void;
    _click(event: Event): void;
    _revealUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode | null): void;
    wasShown(): void;
    _refreshDiff(): void;
    _hideDiff(message: string): void;
    _renderDiffRows(diff: Diff.Diff.DiffArray | null): void;
    _lineFormatter(lineNumber: number): string;
}
export declare const enum RowType {
    Deletion = "deletion",
    Addition = "addition",
    Equal = "equal",
    Spacer = "spacer"
}
export declare class DiffUILocationRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean;
    }): DiffUILocationRevealer;
    reveal(diffUILocation: Object, omitFocus?: boolean | undefined): Promise<void>;
}
export interface Token {
    text: string;
    className: string;
}
export interface Row {
    baselineLineNumber: number;
    currentLineNumber: number;
    tokens: Token[];
    type: RowType;
}
