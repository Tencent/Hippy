// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Workspace from '../../models/workspace/workspace.js';
const UIStrings = {
    /**
    *@description Default snippet name when a new snippet is created in the Sources panel
    *@example {1} PH1
    */
    scriptSnippet: 'Script snippet #{PH1}',
    /**
    *@description Text to show something is linked to another
    *@example {example.url} PH1
    */
    linkedTo: 'Linked to {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/snippets/ScriptSnippetFileSystem.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function escapeSnippetName(name) {
    return escape(name);
}
function unescapeSnippetName(name) {
    return unescape(name);
}
export class SnippetFileSystem extends Persistence.PlatformFileSystem.PlatformFileSystem {
    _lastSnippetIdentifierSetting;
    _snippetsSetting;
    constructor() {
        super('snippet://', 'snippets');
        this._lastSnippetIdentifierSetting =
            Common.Settings.Settings.instance().createSetting('scriptSnippets_lastIdentifier', 0);
        this._snippetsSetting = Common.Settings.Settings.instance().createSetting('scriptSnippets', []);
    }
    initialFilePaths() {
        const savedSnippets = this._snippetsSetting.get();
        return savedSnippets.map(snippet => escapeSnippetName(snippet.name));
    }
    async createFile(_path, _name) {
        const nextId = this._lastSnippetIdentifierSetting.get() + 1;
        this._lastSnippetIdentifierSetting.set(nextId);
        const snippetName = i18nString(UIStrings.scriptSnippet, { PH1: nextId });
        const snippets = this._snippetsSetting.get();
        snippets.push({ name: snippetName, content: '' });
        this._snippetsSetting.set(snippets);
        return escapeSnippetName(snippetName);
    }
    async deleteFile(path) {
        const name = unescapeSnippetName(path.substring(1));
        const allSnippets = this._snippetsSetting.get();
        const snippets = allSnippets.filter(snippet => snippet.name !== name);
        if (allSnippets.length !== snippets.length) {
            this._snippetsSetting.set(snippets);
            return true;
        }
        return false;
    }
    async requestFileContent(path) {
        const name = unescapeSnippetName(path.substring(1));
        const snippets = this._snippetsSetting.get();
        const snippet = snippets.find(snippet => snippet.name === name);
        if (snippet) {
            return { content: snippet.content, isEncoded: false };
        }
        return { content: null, isEncoded: false, error: `A snippet with name '${name}' was not found` };
    }
    async setFileContent(path, content, _isBase64) {
        const name = unescapeSnippetName(path.substring(1));
        const snippets = this._snippetsSetting.get();
        const snippet = snippets.find(snippet => snippet.name === name);
        if (snippet) {
            snippet.content = content;
            this._snippetsSetting.set(snippets);
            return true;
        }
        return false;
    }
    renameFile(path, newName, callback) {
        const name = unescapeSnippetName(path.substring(1));
        const snippets = this._snippetsSetting.get();
        const snippet = snippets.find(snippet => snippet.name === name);
        newName = newName.trim();
        if (!snippet || newName.length === 0 || snippets.find(snippet => snippet.name === newName)) {
            callback(false);
            return;
        }
        snippet.name = newName;
        this._snippetsSetting.set(snippets);
        callback(true, newName);
    }
    async searchInPath(query, _progress) {
        const re = new RegExp(Platform.StringUtilities.escapeForRegExp(query), 'i');
        const allSnippets = this._snippetsSetting.get();
        const matchedSnippets = allSnippets.filter(snippet => snippet.content.match(re));
        return matchedSnippets.map(snippet => `snippet:///${escapeSnippetName(snippet.name)}`);
    }
    mimeFromPath(_path) {
        return 'text/javascript';
    }
    contentType(_path) {
        return Common.ResourceType.resourceTypes.Script;
    }
    tooltipForURL(url) {
        return i18nString(UIStrings.linkedTo, { PH1: unescapeSnippetName(url.substring(this.path().length)) });
    }
    supportsAutomapping() {
        return true;
    }
}
export async function evaluateScriptSnippet(uiSourceCode) {
    if (!uiSourceCode.url().startsWith('snippet://')) {
        return;
    }
    const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
    if (!executionContext) {
        return;
    }
    const runtimeModel = executionContext.runtimeModel;
    await uiSourceCode.requestContent();
    uiSourceCode.commitWorkingCopy();
    const expression = uiSourceCode.workingCopy();
    Common.Console.Console.instance().show();
    const url = uiSourceCode.url();
    const result = await executionContext.evaluate({
        expression: `${expression}\n//# sourceURL=${url}`,
        objectGroup: 'console',
        silent: false,
        includeCommandLineAPI: true,
        returnByValue: false,
        generatePreview: true,
        replMode: true,
    }, false, true);
    if ('exceptionDetails' in result && result.exceptionDetails) {
        SDK.ConsoleModel.ConsoleModel.instance().addMessage(SDK.ConsoleModel.ConsoleMessage.fromException(runtimeModel, result.exceptionDetails, /* messageType */ undefined, /* timestamp */ undefined, url));
        return;
    }
    if (!('object' in result) || !result.object) {
        return;
    }
    const scripts = executionContext.debuggerModel.scriptsForSourceURL(url);
    if (scripts.length < 1) {
        return;
    }
    const scriptId = scripts[scripts.length - 1].scriptId;
    SDK.ConsoleModel.ConsoleModel.instance().addMessage(new SDK.ConsoleModel.ConsoleMessage(runtimeModel, "javascript" /* Javascript */, "info" /* Info */, '', SDK.ConsoleModel.FrontendMessageType.Result, url, undefined, undefined, [result.object], undefined, undefined, executionContext.id, scriptId));
}
export function isSnippetsUISourceCode(uiSourceCode) {
    return uiSourceCode.url().startsWith('snippet://');
}
export function isSnippetsProject(project) {
    return project.type() === Workspace.Workspace.projectTypes.FileSystem &&
        Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemType(project) === 'snippets';
}
export function findSnippetsProject() {
    const workspaceProject = Workspace.Workspace.WorkspaceImpl.instance()
        .projectsForType(Workspace.Workspace.projectTypes.FileSystem)
        .find(project => Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding.fileSystemType(project) ===
        'snippets');
    if (!workspaceProject) {
        throw new Error('Unable to find workspace project for the snippets file system');
    }
    return workspaceProject;
}
//# sourceMappingURL=ScriptSnippetFileSystem.js.map