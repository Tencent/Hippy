import type * as Common from '../../core/common/common.js';
import * as Formatter from '../../models/formatter/formatter.js';
import type * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { EditorAction, SourcesView } from './SourcesView.js';
export declare class InplaceFormatterEditorAction implements EditorAction {
    _button: UI.Toolbar.ToolbarButton;
    _sourcesView: SourcesView;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): InplaceFormatterEditorAction;
    _editorSelected(event: Common.EventTarget.EventTargetEvent): void;
    _editorClosed(event: Common.EventTarget.EventTargetEvent): void;
    _updateButton(uiSourceCode: Workspace.UISourceCode.UISourceCode | null): void;
    button(sourcesView: SourcesView): UI.Toolbar.ToolbarButton;
    _isFormattable(uiSourceCode: Workspace.UISourceCode.UISourceCode | null): boolean;
    _formatSourceInPlace(_event: Common.EventTarget.EventTargetEvent): void;
    _contentLoaded(uiSourceCode: Workspace.UISourceCode.UISourceCode, content: string): void;
    /**
     * Post-format callback
     */
    _formattingComplete(uiSourceCode: Workspace.UISourceCode.UISourceCode, formattedContent: string, formatterMapping: Formatter.ScriptFormatter.FormatterSourceMapping): void;
}
