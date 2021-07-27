import type * as Common from '../../core/common/common.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { EditorAction, SourcesView } from './SourcesView.js';
export declare class ScriptFormatterEditorAction implements EditorAction {
    _pathsToFormatOnLoad: Set<string>;
    _sourcesView: SourcesView;
    _button: UI.Toolbar.ToolbarButton;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ScriptFormatterEditorAction;
    _editorSelected(event: Common.EventTarget.EventTargetEvent): void;
    _editorClosed(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _updateButton(uiSourceCode: Workspace.UISourceCode.UISourceCode | null): void;
    button(sourcesView: SourcesView): UI.Toolbar.ToolbarButton;
    _isFormattableScript(uiSourceCode: Workspace.UISourceCode.UISourceCode | null): boolean;
    isCurrentUISourceCodeFormattable(): boolean;
    _onFormatScriptButtonClicked(_event: Common.EventTarget.EventTargetEvent): void;
    toggleFormatScriptSource(): void;
    _showFormatted(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
}
