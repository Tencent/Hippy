import type * as Workspace from '../../models/workspace/workspace.js';
import type * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
export declare class RecorderPlugin extends Plugin {
    _textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    constructor(textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, uiSourceCode: Workspace.UISourceCode.UISourceCode);
    static accepts(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    leftToolbarItems(): UI.Toolbar.ToolbarItem[];
}
