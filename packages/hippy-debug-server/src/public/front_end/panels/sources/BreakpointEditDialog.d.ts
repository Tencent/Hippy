import * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class BreakpointEditDialog extends UI.Widget.Widget {
    _onFinish: (arg0: {
        committed: boolean;
        condition: string;
    }) => Promise<void>;
    _finished: boolean;
    _editor: TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditor | null;
    _isLogpoint: boolean;
    _typeSelector: UI.Toolbar.ToolbarComboBox;
    constructor(editorLineNumber: number, oldCondition: string, preferLogpoint: boolean, onFinish: (arg0: {
        committed: boolean;
        condition: string;
    }) => Promise<void>);
    focusEditor(): void;
    static _conditionForLogpoint(condition: string): string;
    _onTypeChanged(): void;
    _updatePlaceholder(): void;
    _finishEditing(committed: boolean): void;
    _onKeyDown(event: Event): Promise<void>;
}
export declare const LogpointPrefix = "/** DEVTOOLS_LOGPOINT */ console.log(";
export declare const LogpointSuffix = ")";
export declare const BreakpointType: {
    Breakpoint: string;
    Conditional: string;
    Logpoint: string;
};
