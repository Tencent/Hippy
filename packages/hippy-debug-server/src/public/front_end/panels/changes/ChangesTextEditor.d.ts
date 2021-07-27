import * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js';
import type * as UI from '../../ui/legacy/legacy.js';
import type { Row } from './ChangesView.js';
export declare class ChangesTextEditor extends TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditor {
    constructor(options: UI.TextEditor.Options);
    updateDiffGutter(diffRows: Row[]): void;
}
export declare class DevToolsAccessibleDiffTextArea extends TextEditor.CodeMirrorTextEditor.DevToolsAccessibleTextArea {
    reset(typing?: boolean): void;
}
