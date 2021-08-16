// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
let ignoreListManagerInstance;
export class IgnoreListManager {
    _debuggerWorkspaceBinding;
    _listeners;
    _isIgnoreListedURLCache;
    constructor(debuggerWorkspaceBinding) {
        this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.GlobalObjectCleared, this._clearCacheIfNeeded.bind(this), this);
        Common.Settings.Settings.instance()
            .moduleSetting('skipStackFramesPattern')
            .addChangeListener(this._patternChanged.bind(this));
        Common.Settings.Settings.instance()
            .moduleSetting('skipContentScripts')
            .addChangeListener(this._patternChanged.bind(this));
        this._listeners = new Set();
        this._isIgnoreListedURLCache = new Map();
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DebuggerModel.DebuggerModel, this);
    }
    static instance(opts = { forceNew: null, debuggerWorkspaceBinding: null }) {
        const { forceNew, debuggerWorkspaceBinding } = opts;
        if (!ignoreListManagerInstance || forceNew) {
            if (!debuggerWorkspaceBinding) {
                throw new Error(`Unable to create settings: targetManager, workspace, and debuggerWorkspaceBinding must be provided: ${new Error().stack}`);
            }
            ignoreListManagerInstance = new IgnoreListManager(debuggerWorkspaceBinding);
        }
        return ignoreListManagerInstance;
    }
    addChangeListener(listener) {
        this._listeners.add(listener);
    }
    removeChangeListener(listener) {
        this._listeners.delete(listener);
    }
    modelAdded(debuggerModel) {
        this._setIgnoreListPatterns(debuggerModel);
        const sourceMapManager = debuggerModel.sourceMapManager();
        sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapAttached, this._sourceMapAttached, this);
        sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapDetached, this._sourceMapDetached, this);
    }
    modelRemoved(debuggerModel) {
        this._clearCacheIfNeeded();
        const sourceMapManager = debuggerModel.sourceMapManager();
        sourceMapManager.removeEventListener(SDK.SourceMapManager.Events.SourceMapAttached, this._sourceMapAttached, this);
        sourceMapManager.removeEventListener(SDK.SourceMapManager.Events.SourceMapDetached, this._sourceMapDetached, this);
    }
    _clearCacheIfNeeded() {
        if (this._isIgnoreListedURLCache.size > 1024) {
            this._isIgnoreListedURLCache.clear();
        }
    }
    _getSkipStackFramesPatternSetting() {
        return /** @type {!Common.Settings.RegExpSetting} */ Common.Settings.Settings.instance().moduleSetting('skipStackFramesPattern');
    }
    _setIgnoreListPatterns(debuggerModel) {
        const regexPatterns = this._getSkipStackFramesPatternSetting().getAsArray();
        const patterns = [];
        for (const item of regexPatterns) {
            if (!item.disabled && item.pattern) {
                patterns.push(item.pattern);
            }
        }
        return debuggerModel.setBlackboxPatterns(patterns);
    }
    isIgnoreListedUISourceCode(uiSourceCode) {
        const projectType = uiSourceCode.project().type();
        const isContentScript = projectType === Workspace.Workspace.projectTypes.ContentScripts;
        if (isContentScript && Common.Settings.Settings.instance().moduleSetting('skipContentScripts').get()) {
            return true;
        }
        const url = this._uiSourceCodeURL(uiSourceCode);
        return url ? this.isIgnoreListedURL(url) : false;
    }
    isIgnoreListedURL(url, isContentScript) {
        if (this._isIgnoreListedURLCache.has(url)) {
            return Boolean(this._isIgnoreListedURLCache.get(url));
        }
        if (isContentScript && Common.Settings.Settings.instance().moduleSetting('skipContentScripts').get()) {
            return true;
        }
        const regex = this._getSkipStackFramesPatternSetting().asRegExp();
        const isIgnoreListed = (regex && regex.test(url)) || false;
        this._isIgnoreListedURLCache.set(url, isIgnoreListed);
        return isIgnoreListed;
    }
    _sourceMapAttached(event) {
        const script = event.data.client;
        const sourceMap = event.data.sourceMap;
        this._updateScriptRanges(script, sourceMap);
    }
    _sourceMapDetached(event) {
        const script = event.data.client;
        this._updateScriptRanges(script, null);
    }
    async _updateScriptRanges(script, sourceMap) {
        let hasIgnoreListedMappings = false;
        if (!IgnoreListManager.instance().isIgnoreListedURL(script.sourceURL, script.isContentScript())) {
            hasIgnoreListedMappings = sourceMap ? sourceMap.sourceURLs().some(url => this.isIgnoreListedURL(url)) : false;
        }
        if (!hasIgnoreListedMappings) {
            if (scriptToRange.get(script) && await script.setBlackboxedRanges([])) {
                scriptToRange.delete(script);
            }
            await this._debuggerWorkspaceBinding.updateLocations(script);
            return;
        }
        if (!sourceMap) {
            return;
        }
        const mappings = sourceMap.mappings();
        const newRanges = [];
        if (mappings.length > 0) {
            let currentIgnoreListed = false;
            if (mappings[0].lineNumber !== 0 || mappings[0].columnNumber !== 0) {
                newRanges.push({ lineNumber: 0, columnNumber: 0 });
                currentIgnoreListed = true;
            }
            for (const mapping of mappings) {
                if (mapping.sourceURL && currentIgnoreListed !== this.isIgnoreListedURL(mapping.sourceURL)) {
                    newRanges.push({ lineNumber: mapping.lineNumber, columnNumber: mapping.columnNumber });
                    currentIgnoreListed = !currentIgnoreListed;
                }
            }
        }
        const oldRanges = scriptToRange.get(script) || [];
        if (!isEqual(oldRanges, newRanges) && await script.setBlackboxedRanges(newRanges)) {
            scriptToRange.set(script, newRanges);
        }
        this._debuggerWorkspaceBinding.updateLocations(script);
        function isEqual(rangesA, rangesB) {
            if (rangesA.length !== rangesB.length) {
                return false;
            }
            for (let i = 0; i < rangesA.length; ++i) {
                if (rangesA[i].lineNumber !== rangesB[i].lineNumber || rangesA[i].columnNumber !== rangesB[i].columnNumber) {
                    return false;
                }
            }
            return true;
        }
    }
    _uiSourceCodeURL(uiSourceCode) {
        return uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Debugger ? null : uiSourceCode.url();
    }
    canIgnoreListUISourceCode(uiSourceCode) {
        const url = this._uiSourceCodeURL(uiSourceCode);
        return url ? Boolean(this._urlToRegExpString(url)) : false;
    }
    ignoreListUISourceCode(uiSourceCode) {
        const url = this._uiSourceCodeURL(uiSourceCode);
        if (url) {
            this._ignoreListURL(url);
        }
    }
    unIgnoreListUISourceCode(uiSourceCode) {
        const url = this._uiSourceCodeURL(uiSourceCode);
        if (url) {
            this._unIgnoreListURL(url);
        }
    }
    ignoreListContentScripts() {
        Common.Settings.Settings.instance().moduleSetting('skipContentScripts').set(true);
    }
    unIgnoreListContentScripts() {
        Common.Settings.Settings.instance().moduleSetting('skipContentScripts').set(false);
    }
    _ignoreListURL(url) {
        const regexPatterns = this._getSkipStackFramesPatternSetting().getAsArray();
        const regexValue = this._urlToRegExpString(url);
        if (!regexValue) {
            return;
        }
        let found = false;
        for (let i = 0; i < regexPatterns.length; ++i) {
            const item = regexPatterns[i];
            if (item.pattern === regexValue) {
                item.disabled = false;
                found = true;
                break;
            }
        }
        if (!found) {
            regexPatterns.push({ pattern: regexValue, disabled: undefined });
        }
        this._getSkipStackFramesPatternSetting().setAsArray(regexPatterns);
    }
    _unIgnoreListURL(url) {
        let regexPatterns = this._getSkipStackFramesPatternSetting().getAsArray();
        const regexValue = IgnoreListManager.instance()._urlToRegExpString(url);
        if (!regexValue) {
            return;
        }
        regexPatterns = regexPatterns.filter(function (item) {
            return item.pattern !== regexValue;
        });
        for (let i = 0; i < regexPatterns.length; ++i) {
            const item = regexPatterns[i];
            if (item.disabled) {
                continue;
            }
            try {
                const regex = new RegExp(item.pattern);
                if (regex.test(url)) {
                    item.disabled = true;
                }
            }
            catch (e) {
            }
        }
        this._getSkipStackFramesPatternSetting().setAsArray(regexPatterns);
    }
    async _patternChanged() {
        this._isIgnoreListedURLCache.clear();
        const promises = [];
        for (const debuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel)) {
            promises.push(this._setIgnoreListPatterns(debuggerModel));
            const sourceMapManager = debuggerModel.sourceMapManager();
            for (const script of debuggerModel.scripts()) {
                promises.push(this._updateScriptRanges(script, sourceMapManager.sourceMapForClient(script)));
            }
        }
        await Promise.all(promises);
        const listeners = Array.from(this._listeners);
        for (const listener of listeners) {
            listener();
        }
        this._patternChangeFinishedForTests();
    }
    _patternChangeFinishedForTests() {
        // This method is sniffed in tests.
    }
    _urlToRegExpString(url) {
        const parsedURL = new Common.ParsedURL.ParsedURL(url);
        if (parsedURL.isAboutBlank() || parsedURL.isDataURL()) {
            return '';
        }
        if (!parsedURL.isValid) {
            return '^' + Platform.StringUtilities.escapeForRegExp(url) + '$';
        }
        let name = parsedURL.lastPathComponent;
        if (name) {
            name = '/' + name;
        }
        else if (parsedURL.folderPathComponents) {
            name = parsedURL.folderPathComponents + '/';
        }
        if (!name) {
            name = parsedURL.host;
        }
        if (!name) {
            return '';
        }
        const scheme = parsedURL.scheme;
        let prefix = '';
        if (scheme && scheme !== 'http' && scheme !== 'https') {
            prefix = '^' + scheme + '://';
            if (scheme === 'chrome-extension') {
                prefix += parsedURL.host + '\\b';
            }
            prefix += '.*';
        }
        return prefix + Platform.StringUtilities.escapeForRegExp(name) + (url.endsWith(name) ? '$' : '\\b');
    }
}
const scriptToRange = new WeakMap();
//# sourceMappingURL=IgnoreListManager.js.map