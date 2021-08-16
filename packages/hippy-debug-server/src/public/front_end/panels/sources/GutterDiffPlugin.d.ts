import * as Workspace from '../../models/workspace/workspace.js';
import * as WorkspaceDiff from '../../models/workspace_diff/workspace_diff.js';
import type * as Diff from '../../third_party/diff/diff.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import type * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js';
import type * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
export declare class GutterDiffPlugin extends Plugin {
    _textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _decorations: GutterDecoration[];
    _workspaceDiff: WorkspaceDiff.WorkspaceDiff.WorkspaceDiffImpl;
    constructor(textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, uiSourceCode: Workspace.UISourceCode.UISourceCode);
    static accepts(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    _updateDecorations(removed: GutterDecoration[], added: GutterDecoration[]): void;
    _update(): void;
    _innerUpdate(lineDiff: Diff.Diff.DiffArray | null): void;
    _decorationsByLine(): Map<number, GutterDecoration>;
    _calculateDecorationsDiff(decorations: Map<number, {
        lineNumber: number;
        type: SourceFrame.SourceCodeDiff.EditType;
    }>): {
        added: {
            lineNumber: number;
            type: SourceFrame.SourceCodeDiff.EditType;
        }[];
        removed: GutterDecoration[];
        equal: GutterDecoration[];
    };
    _decorationsSetForTest(_decorations: Map<number, {
        lineNumber: number;
        type: SourceFrame.SourceCodeDiff.EditType;
    }>): void;
    populateLineGutterContextMenu(contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number): Promise<void>;
    populateTextAreaContextMenu(contextMenu: UI.ContextMenu.ContextMenu, _lineNumber: number, _columnNumber: number): Promise<void>;
    static _appendRevealDiffContextMenu(contextMenu: UI.ContextMenu.ContextMenu, uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    dispose(): void;
}
export declare class GutterDecoration {
    _textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor;
    _position: TextEditor.CodeMirrorTextEditor.TextEditorPositionHandle;
    _className: string;
    type: SourceFrame.SourceCodeDiff.EditType;
    constructor(textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, lineNumber: number, type: SourceFrame.SourceCodeDiff.EditType);
    lineNumber(): number;
    install(): void;
    remove(): void;
}
export declare const DiffGutterType: string;
export declare class ContextMenuProvider implements UI.ContextMenu.Provider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ContextMenuProvider;
    appendApplicableItems(_event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
}
