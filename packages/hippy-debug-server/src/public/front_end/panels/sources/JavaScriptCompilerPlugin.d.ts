import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../../models/workspace/workspace.js';
import type * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import { Plugin } from './Plugin.js';
export declare class JavaScriptCompilerPlugin extends Plugin {
    _textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _compiling: boolean;
    _recompileScheduled: boolean;
    _timeout: number | null;
    _message: Workspace.UISourceCode.Message | null;
    _disposed: boolean;
    constructor(textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, uiSourceCode: Workspace.UISourceCode.UISourceCode);
    static accepts(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    _scheduleCompile(): void;
    _findRuntimeModel(): SDK.RuntimeModel.RuntimeModel | null;
    _compile(): Promise<void>;
    _compilationFinishedForTest(): void;
    dispose(): void;
}
export declare const CompileDelay = 1000;
