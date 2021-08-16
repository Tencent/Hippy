import * as Diff from '../../../../third_party/diff/diff.js';
import type * as TextEditor from '../text_editor/text_editor.js';
import type { SourcesTextEditor } from './SourcesTextEditor.js';
export declare class SourceCodeDiff {
    _textEditor: SourcesTextEditor;
    _animatedLines: TextEditor.CodeMirrorTextEditor.TextEditorPositionHandle[];
    _animationTimeout: number | null;
    constructor(textEditor: SourcesTextEditor);
    highlightModifiedLines(oldContent: string | null, newContent: string | null): void;
    _updateHighlightedLines(newLines: TextEditor.CodeMirrorTextEditor.TextEditorPositionHandle[]): void;
    static computeDiff(diff: Diff.Diff.DiffArray): {
        type: EditType;
        from: number;
        to: number;
    }[];
}
export declare enum EditType {
    Insert = "Insert",
    Delete = "Delete",
    Modify = "Modify"
}
