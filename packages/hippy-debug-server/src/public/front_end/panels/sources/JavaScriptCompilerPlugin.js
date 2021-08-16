// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Snippets from '../snippets/snippets.js';
import { Plugin } from './Plugin.js';
export class JavaScriptCompilerPlugin extends Plugin {
    _textEditor;
    _uiSourceCode;
    _compiling;
    _recompileScheduled;
    _timeout;
    _message;
    _disposed;
    constructor(textEditor, uiSourceCode) {
        super();
        this._textEditor = textEditor;
        this._uiSourceCode = uiSourceCode;
        this._compiling = false;
        this._recompileScheduled = false;
        this._timeout = null;
        this._message = null;
        this._disposed = false;
        this._textEditor.addEventListener(UI.TextEditor.Events.TextChanged, this._scheduleCompile, this);
        if (this._uiSourceCode.hasCommits() || this._uiSourceCode.isDirty()) {
            this._scheduleCompile();
        }
    }
    static accepts(uiSourceCode) {
        if (uiSourceCode.extension() === 'js') {
            return true;
        }
        if (Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(uiSourceCode)) {
            return true;
        }
        for (const debuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel)) {
            if (Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptFile(uiSourceCode, debuggerModel)) {
                return true;
            }
        }
        return false;
    }
    _scheduleCompile() {
        if (this._compiling) {
            this._recompileScheduled = true;
            return;
        }
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._timeout = window.setTimeout(this._compile.bind(this), CompileDelay);
    }
    _findRuntimeModel() {
        const debuggerModels = SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel);
        for (let i = 0; i < debuggerModels.length; ++i) {
            const scriptFile = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptFile(this._uiSourceCode, debuggerModels[i]);
            if (scriptFile) {
                return debuggerModels[i].runtimeModel();
            }
        }
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        return mainTarget ? mainTarget.model(SDK.RuntimeModel.RuntimeModel) : null;
    }
    async _compile() {
        const runtimeModel = this._findRuntimeModel();
        if (!runtimeModel) {
            return;
        }
        const currentExecutionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (!currentExecutionContext) {
            return;
        }
        const code = this._textEditor.text();
        if (code.length > 1024 * 100) {
            return;
        }
        const scripts = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptsForResource(this._uiSourceCode);
        const isModule = scripts.reduce((v, s) => v || s.isModule === true, false);
        if (isModule) {
            return;
        }
        this._compiling = true;
        const result = await runtimeModel.compileScript(code, '', false, currentExecutionContext.id);
        this._compiling = false;
        if (this._recompileScheduled) {
            this._recompileScheduled = false;
            this._scheduleCompile();
            return;
        }
        if (this._message) {
            this._uiSourceCode.removeMessage(this._message);
        }
        if (this._disposed || !result || !result.exceptionDetails) {
            return;
        }
        const exceptionDetails = result.exceptionDetails;
        const text = SDK.RuntimeModel.RuntimeModel.simpleTextFromException(exceptionDetails);
        this._message = this._uiSourceCode.addLineMessage(Workspace.UISourceCode.Message.Level.Error, text, exceptionDetails.lineNumber, exceptionDetails.columnNumber);
        this._compilationFinishedForTest();
    }
    _compilationFinishedForTest() {
    }
    dispose() {
        this._textEditor.removeEventListener(UI.TextEditor.Events.TextChanged, this._scheduleCompile, this);
        if (this._message) {
            this._uiSourceCode.removeMessage(this._message);
        }
        this._disposed = true;
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
    }
}
export const CompileDelay = 1000;
//# sourceMappingURL=JavaScriptCompilerPlugin.js.map