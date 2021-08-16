import type * as SDK from '../../core/sdk/sdk.js';
import type * as Workspace from '../../models/workspace/workspace.js';
import type * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
export declare class ScriptOriginPlugin extends Plugin {
    _textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    constructor(textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, uiSourceCode: Workspace.UISourceCode.UISourceCode);
    static accepts(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    rightToolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    static _script(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<SDK.Script.Script | null>;
}
export declare const linkifier: Components.Linkifier.Linkifier;
