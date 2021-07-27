// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Bindings from '../bindings/bindings.js'; // eslint-disable-line no-unused-vars
export class LanguageExtensionEndpoint extends Bindings.DebuggerLanguagePlugins.DebuggerLanguagePlugin {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _commands;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _events;
    _supportedScriptTypes;
    _port;
    _nextRequestId;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _pendingRequests;
    constructor(name, supportedScriptTypes, port) {
        super(name);
        // @ts-expect-error TODO(crbug.com/1011811): Fix after extensionAPI is migrated.
        this._commands = Extensions.extensionAPI.LanguageExtensionPluginCommands;
        // @ts-expect-error TODO(crbug.com/1011811): Fix after extensionAPI is migrated.
        this._events = Extensions.extensionAPI.LanguageExtensionPluginEvents;
        this._supportedScriptTypes = supportedScriptTypes;
        this._port = port;
        this._port.onmessage = this._onResponse.bind(this);
        this._nextRequestId = 0;
        this._pendingRequests = new Map();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _sendRequest(method, parameters) {
        return new Promise((resolve, reject) => {
            const requestId = this._nextRequestId++;
            this._pendingRequests.set(requestId, { resolve, reject });
            this._port.postMessage({ requestId, method, parameters });
        });
    }
    _onResponse({ data }) {
        if ('event' in data) {
            const { event } = data;
            switch (event) {
                case this._events.UnregisteredLanguageExtensionPlugin: {
                    for (const { reject } of this._pendingRequests.values()) {
                        reject(new Error('Language extension endpoint disconnected'));
                    }
                    this._pendingRequests.clear();
                    this._port.close();
                    const { pluginManager } = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance();
                    if (pluginManager) {
                        pluginManager.removePlugin(this);
                    }
                    break;
                }
            }
            return;
        }
        const { requestId, result, error } = data;
        if (!this._pendingRequests.has(requestId)) {
            console.error(`No pending request ${requestId}`);
            return;
        }
        const { resolve, reject } = this._pendingRequests.get(requestId);
        this._pendingRequests.delete(requestId);
        if (error) {
            reject(new Error(error.message));
        }
        else {
            resolve(result);
        }
    }
    handleScript(script) {
        const language = script.scriptLanguage();
        return language !== null && script.debugSymbols !== null && language === this._supportedScriptTypes.language &&
            this._supportedScriptTypes.symbol_types.includes(script.debugSymbols.type);
    }
    /** Notify the plugin about a new script
       */
    addRawModule(rawModuleId, symbolsURL, rawModule) {
        return /** @type {!Promise<!Array<string>>} */ this._sendRequest(this._commands.AddRawModule, { rawModuleId, symbolsURL, rawModule });
    }
    /**
     * Notifies the plugin that a script is removed.
     */
    removeRawModule(rawModuleId) {
        return /** @type {!Promise<void>} */ this._sendRequest(this._commands.RemoveRawModule, { rawModuleId });
    }
    /** Find locations in raw modules from a location in a source file
       */
    sourceLocationToRawLocation(sourceLocation) {
        return /** @type {!Promise<!Array<!Bindings.DebuggerLanguagePlugins.RawLocationRange>>} */ this._sendRequest(this._commands.SourceLocationToRawLocation, { sourceLocation });
    }
    /** Find locations in source files from a location in a raw module
       */
    rawLocationToSourceLocation(rawLocation) {
        return /** @type {!Promise<!Array<!Bindings.DebuggerLanguagePlugins.SourceLocation>>} */ this._sendRequest(this._commands.RawLocationToSourceLocation, { rawLocation });
    }
    getScopeInfo(type) {
        return /** @type {!Promise<!Bindings.DebuggerLanguagePlugins.ScopeInfo>} */ this._sendRequest(this._commands.GetScopeInfo, { type });
    }
    /** List all variables in lexical scope at a given location in a raw module
       */
    listVariablesInScope(rawLocation) {
        return /** @type {!Promise<!Array<!Bindings.DebuggerLanguagePlugins.Variable>>} */ this._sendRequest(this._commands.ListVariablesInScope, { rawLocation });
    }
    /** List all function names (including inlined frames) at location
       */
    getFunctionInfo(rawLocation) {
        return /** @type {!Promise<!{frames: !Array<!Bindings.DebuggerLanguagePlugins.FunctionInfo>}>} */ this._sendRequest(this._commands.GetFunctionInfo, { rawLocation });
    }
    /** Find locations in raw modules corresponding to the inline function
       *  that rawLocation is in.
       */
    getInlinedFunctionRanges(rawLocation) {
        return /** @type {!Promise<!Array<!Bindings.DebuggerLanguagePlugins.RawLocationRange>>} */ this._sendRequest(this._commands.GetInlinedFunctionRanges, { rawLocation });
    }
    /** Find locations in raw modules corresponding to inline functions
       *  called by the function or inline frame that rawLocation is in.
       */
    getInlinedCalleesRanges(rawLocation) {
        return /** @type {!Promise<!Array<!Bindings.DebuggerLanguagePlugins.RawLocationRange>>} */ this._sendRequest(this._commands.GetInlinedCalleesRanges, { rawLocation });
    }
    getTypeInfo(expression, context) {
        return /** @type {!Promise<?{typeInfos: !Array<!Bindings.DebuggerLanguagePlugins.TypeInfo>, base: !Bindings.DebuggerLanguagePlugins.EvalBase}>} */ this
            ._sendRequest(this._commands.GetTypeInfo, { expression, context });
    }
    getFormatter(expressionOrField, context) {
        return /** @type {!Promise<!{js: string}>} */ this._sendRequest(this._commands.GetFormatter, { expressionOrField, context });
    }
    getInspectableAddress(field) {
        return /** @type {!Promise<!{js: string}>}} */ this._sendRequest(this._commands.GetInspectableAddress, { field });
    }
    async getMappedLines(rawModuleId, sourceFileURL) {
        return /** {!Promise<!Array<number>|undefined>} */ (this._sendRequest(this._commands.GetMappedLines, { rawModuleId, sourceFileURL }));
    }
    dispose() {
    }
}
//# sourceMappingURL=LanguageExtensionEndpoint.js.map