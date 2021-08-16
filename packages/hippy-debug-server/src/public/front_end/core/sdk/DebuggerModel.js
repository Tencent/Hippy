/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as i18n from '../i18n/i18n.js';
import * as Platform from '../platform/platform.js';
import * as Root from '../root/root.js';
import { ScopeRef } from './RemoteObject.js'; // eslint-disable-line no-unused-vars
import { Events as ResourceTreeModelEvents, ResourceTreeModel } from './ResourceTreeModel.js'; // eslint-disable-line no-unused-vars
import { RuntimeModel } from './RuntimeModel.js'; // eslint-disable-line no-unused-vars
import { Script } from './Script.js';
import { Capability, Type } from './Target.js';
import { SDKModel } from './SDKModel.js'; // eslint-disable-line no-unused-vars
import { SourceMapManager } from './SourceMapManager.js';
const UIStrings = {
    /**
    *@description Title of a section in the debugger showing local JavaScript variables.
    */
    local: 'Local',
    /**
    *@description Text that refers to closure as a programming term
    */
    closure: 'Closure',
    /**
    *@description Noun that represents a section or block of code in the Debugger Model. Shown in the Sources tab, while paused on a breakpoint.
    */
    block: 'Block',
    /**
    *@description Label for a group of JavaScript files
    */
    script: 'Script',
    /**
    *@description Title of a section in the debugger showing JavaScript variables from the a 'with'
    *block. Block here means section of code, 'with' refers to a JavaScript programming concept.
    */
    withBlock: '`With` Block',
    /**
    *@description Title of a section in the debugger showing JavaScript variables from the global scope.
    */
    global: 'Global',
    /**
    *@description Text for a JavaScript module, the programming concept
    */
    module: 'Module',
    /**
    *@description Text describing the expression scope in WebAssembly
    */
    expression: 'Expression',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/DebuggerModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export function sortAndMergeRanges(locationRanges) {
    if (locationRanges.length === 0) {
        return [];
    }
    locationRanges.sort(LocationRange.comparator);
    let prev = locationRanges[0];
    const merged = [];
    for (let i = 1; i < locationRanges.length; ++i) {
        const current = locationRanges[i];
        if (prev.overlap(current)) {
            const largerEnd = prev.end.compareTo(current.end) > 0 ? prev.end : current.end;
            prev = new LocationRange(prev.scriptId, prev.start, largerEnd);
        }
        else {
            merged.push(prev);
            prev = current;
        }
    }
    merged.push(prev);
    return merged;
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var StepMode;
(function (StepMode) {
    StepMode["StepInto"] = "StepInto";
    StepMode["StepOut"] = "StepOut";
    StepMode["StepOver"] = "StepOver";
})(StepMode || (StepMode = {}));
export class DebuggerModel extends SDKModel {
    _agent;
    _runtimeModel;
    _sourceMapManager;
    _sourceMapIdToScript;
    _debuggerPausedDetails;
    _scripts;
    _scriptsBySourceURL;
    _discardableScripts;
    _continueToLocationCallback;
    _selectedCallFrame;
    _debuggerEnabled;
    _debuggerId;
    _skipAllPausesTimeout;
    _beforePausedCallback;
    _computeAutoStepRangesCallback;
    _expandCallFramesCallback;
    _evaluateOnCallFrameCallback;
    _ignoreDebuggerPausedEvents;
    _breakpointResolvedEventTarget;
    _autoStepOver;
    _isPausing;
    constructor(target) {
        super(target);
        target.registerDebuggerDispatcher(new DebuggerDispatcher(this));
        this._agent = target.debuggerAgent();
        this._runtimeModel = target.model(RuntimeModel);
        this._sourceMapManager = new SourceMapManager(target);
        this._sourceMapIdToScript = new Map();
        this._debuggerPausedDetails = null;
        this._scripts = new Map();
        this._scriptsBySourceURL = new Map();
        this._discardableScripts = [];
        this._continueToLocationCallback = null;
        this._selectedCallFrame = null;
        this._debuggerEnabled = false;
        this._debuggerId = null;
        this._skipAllPausesTimeout = 0;
        this._beforePausedCallback = null;
        this._computeAutoStepRangesCallback = null;
        this._expandCallFramesCallback = null;
        this._evaluateOnCallFrameCallback = null;
        this._ignoreDebuggerPausedEvents = false;
        this._breakpointResolvedEventTarget = new Common.ObjectWrapper.ObjectWrapper();
        this._autoStepOver = false;
        this._isPausing = false;
        Common.Settings.Settings.instance()
            .moduleSetting('pauseOnExceptionEnabled')
            .addChangeListener(this._pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('pauseOnCaughtException')
            .addChangeListener(this._pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('disableAsyncStackTraces')
            .addChangeListener(this._asyncStackTracesStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('breakpointsActive')
            .addChangeListener(this._breakpointsActiveChanged, this);
        if (!target.suspended()) {
            this._enableDebugger();
        }
        this._sourceMapManager.setEnabled(Common.Settings.Settings.instance().moduleSetting('jsSourceMapsEnabled').get());
        Common.Settings.Settings.instance()
            .moduleSetting('jsSourceMapsEnabled')
            .addChangeListener(event => this._sourceMapManager.setEnabled(event.data));
        const resourceTreeModel = target.model(ResourceTreeModel);
        if (resourceTreeModel) {
            resourceTreeModel.addEventListener(ResourceTreeModelEvents.FrameNavigated, this._onFrameNavigated, this);
        }
    }
    static _sourceMapId(executionContextId, sourceURL, sourceMapURL) {
        if (!sourceMapURL) {
            return null;
        }
        return executionContextId + ':' + sourceURL + ':' + sourceMapURL;
    }
    sourceMapManager() {
        return this._sourceMapManager;
    }
    runtimeModel() {
        return this._runtimeModel;
    }
    debuggerEnabled() {
        return Boolean(this._debuggerEnabled);
    }
    ignoreDebuggerPausedEvents(ignore) {
        this._ignoreDebuggerPausedEvents = ignore;
    }
    async _enableDebugger() {
        if (this._debuggerEnabled) {
            return;
        }
        this._debuggerEnabled = true;
        // Set a limit for the total size of collected script sources retained by debugger.
        // 10MB for remote frontends, 100MB for others.
        const isRemoteFrontend = Root.Runtime.Runtime.queryParam('remoteFrontend') || Root.Runtime.Runtime.queryParam('ws');
        const maxScriptsCacheSize = isRemoteFrontend ? 10e6 : 100e6;
        const enablePromise = this._agent.invoke_enable({ maxScriptsCacheSize });
        enablePromise.then(this._registerDebugger.bind(this));
        this._pauseOnExceptionStateChanged();
        this._asyncStackTracesStateChanged();
        if (!Common.Settings.Settings.instance().moduleSetting('breakpointsActive').get()) {
            this._breakpointsActiveChanged();
        }
        if (_scheduledPauseOnAsyncCall) {
            this._pauseOnAsyncCall(_scheduledPauseOnAsyncCall);
        }
        this.dispatchEventToListeners(Events.DebuggerWasEnabled, this);
        await enablePromise;
    }
    async syncDebuggerId() {
        const isRemoteFrontend = Root.Runtime.Runtime.queryParam('remoteFrontend') || Root.Runtime.Runtime.queryParam('ws');
        const maxScriptsCacheSize = isRemoteFrontend ? 10e6 : 100e6;
        const enablePromise = this._agent.invoke_enable({ maxScriptsCacheSize });
        enablePromise.then(this._registerDebugger.bind(this));
        return enablePromise;
    }
    _onFrameNavigated() {
        if (DebuggerModel._shouldResyncDebuggerId) {
            return;
        }
        DebuggerModel._shouldResyncDebuggerId = true;
    }
    _registerDebugger(response) {
        if (response.getError()) {
            return;
        }
        const { debuggerId } = response;
        _debuggerIdToModel.set(debuggerId, this);
        this._debuggerId = debuggerId;
        this.dispatchEventToListeners(Events.DebuggerIsReadyToPause, this);
    }
    isReadyToPause() {
        return Boolean(this._debuggerId);
    }
    static async modelForDebuggerId(debuggerId) {
        if (DebuggerModel._shouldResyncDebuggerId) {
            await DebuggerModel.resyncDebuggerIdForModels();
            DebuggerModel._shouldResyncDebuggerId = false;
        }
        return _debuggerIdToModel.get(debuggerId) || null;
    }
    static async resyncDebuggerIdForModels() {
        const dbgModels = _debuggerIdToModel.values();
        for (const dbgModel of dbgModels) {
            if (dbgModel.debuggerEnabled()) {
                await dbgModel.syncDebuggerId();
            }
        }
    }
    async _disableDebugger() {
        if (!this._debuggerEnabled) {
            return;
        }
        this._debuggerEnabled = false;
        await this._asyncStackTracesStateChanged();
        await this._agent.invoke_disable();
        this._isPausing = false;
        this.globalObjectCleared();
        this.dispatchEventToListeners(Events.DebuggerWasDisabled);
        if (typeof this._debuggerId === 'string') {
            _debuggerIdToModel.delete(this._debuggerId);
        }
    }
    _skipAllPauses(skip) {
        if (this._skipAllPausesTimeout) {
            clearTimeout(this._skipAllPausesTimeout);
            this._skipAllPausesTimeout = 0;
        }
        this._agent.invoke_setSkipAllPauses({ skip });
    }
    skipAllPausesUntilReloadOrTimeout(timeout) {
        if (this._skipAllPausesTimeout) {
            clearTimeout(this._skipAllPausesTimeout);
        }
        this._agent.invoke_setSkipAllPauses({ skip: true });
        // If reload happens before the timeout, the flag will be already unset and the timeout callback won't change anything.
        this._skipAllPausesTimeout = window.setTimeout(this._skipAllPauses.bind(this, false), timeout);
    }
    _pauseOnExceptionStateChanged() {
        let state;
        if (!Common.Settings.Settings.instance().moduleSetting('pauseOnExceptionEnabled').get()) {
            state = "none" /* None */;
        }
        else if (Common.Settings.Settings.instance().moduleSetting('pauseOnCaughtException').get()) {
            state = "all" /* All */;
        }
        else {
            state = "uncaught" /* Uncaught */;
        }
        this._agent.invoke_setPauseOnExceptions({ state });
    }
    _asyncStackTracesStateChanged() {
        const maxAsyncStackChainDepth = 32;
        const enabled = !Common.Settings.Settings.instance().moduleSetting('disableAsyncStackTraces').get() && this._debuggerEnabled;
        const maxDepth = enabled ? maxAsyncStackChainDepth : 0;
        return this._agent.invoke_setAsyncCallStackDepth({ maxDepth });
    }
    _breakpointsActiveChanged() {
        this._agent.invoke_setBreakpointsActive({ active: Common.Settings.Settings.instance().moduleSetting('breakpointsActive').get() });
    }
    setComputeAutoStepRangesCallback(callback) {
        this._computeAutoStepRangesCallback = callback;
    }
    async _computeAutoStepSkipList(mode) {
        let ranges = [];
        if (this._computeAutoStepRangesCallback && this._debuggerPausedDetails) {
            const [callFrame] = this._debuggerPausedDetails.callFrames;
            ranges = await this._computeAutoStepRangesCallback.call(null, mode, callFrame);
        }
        const skipList = ranges.map(location => new LocationRange(location.start.scriptId, new ScriptPosition(location.start.lineNumber, location.start.columnNumber), new ScriptPosition(location.end.lineNumber, location.end.columnNumber)));
        return sortAndMergeRanges(skipList).map(x => x.payload());
    }
    async stepInto() {
        const skipList = await this._computeAutoStepSkipList(StepMode.StepInto);
        this._agent.invoke_stepInto({ breakOnAsyncCall: false, skipList });
    }
    async stepOver() {
        // Mark that in case of auto-stepping, we should be doing
        // step-over instead of step-in.
        this._autoStepOver = true;
        const skipList = await this._computeAutoStepSkipList(StepMode.StepOver);
        this._agent.invoke_stepOver({ skipList });
    }
    async stepOut() {
        const skipList = await this._computeAutoStepSkipList(StepMode.StepOut);
        if (skipList.length !== 0) {
            this._agent.invoke_stepOver({ skipList });
        }
        else {
            this._agent.invoke_stepOut();
        }
    }
    scheduleStepIntoAsync() {
        this._computeAutoStepSkipList(StepMode.StepInto).then(skipList => {
            this._agent.invoke_stepInto({ breakOnAsyncCall: true, skipList });
        });
    }
    resume() {
        this._agent.invoke_resume({ terminateOnResume: false });
        this._isPausing = false;
    }
    pause() {
        this._isPausing = true;
        this._skipAllPauses(false);
        this._agent.invoke_pause();
    }
    _pauseOnAsyncCall(parentStackTraceId) {
        return this._agent.invoke_pauseOnAsyncCall({ parentStackTraceId: parentStackTraceId });
    }
    async setBreakpointByURL(url, lineNumber, columnNumber, condition) {
        // Convert file url to node-js path.
        let urlRegex;
        if (this.target().type() === Type.Node && url.startsWith('file://')) {
            const platformPath = Common.ParsedURL.ParsedURL.urlToPlatformPath(url, Host.Platform.isWin());
            urlRegex =
                `${Platform.StringUtilities.escapeForRegExp(platformPath)}|${Platform.StringUtilities.escapeForRegExp(url)}`;
        }
        // Adjust column if needed.
        let minColumnNumber = 0;
        const scripts = this._scriptsBySourceURL.get(url) || [];
        for (let i = 0, l = scripts.length; i < l; ++i) {
            const script = scripts[i];
            if (lineNumber === script.lineOffset) {
                minColumnNumber = minColumnNumber ? Math.min(minColumnNumber, script.columnOffset) : script.columnOffset;
            }
        }
        columnNumber = Math.max(columnNumber || 0, minColumnNumber);
        const response = await this._agent.invoke_setBreakpointByUrl({
            lineNumber: lineNumber,
            url: urlRegex ? undefined : url,
            urlRegex: urlRegex,
            columnNumber: columnNumber,
            condition: condition,
        });
        if (response.getError()) {
            return { locations: [], breakpointId: null };
        }
        let locations = [];
        if (response.locations) {
            locations = response.locations.map(payload => Location.fromPayload(this, payload));
        }
        return { locations, breakpointId: response.breakpointId };
    }
    async setBreakpointInAnonymousScript(scriptId, scriptHash, lineNumber, columnNumber, condition) {
        const response = await this._agent.invoke_setBreakpointByUrl({ lineNumber: lineNumber, scriptHash: scriptHash, columnNumber: columnNumber, condition: condition });
        const error = response.getError();
        if (error) {
            // Old V8 backend doesn't support scriptHash argument.
            if (error !== 'Either url or urlRegex must be specified.') {
                return { locations: [], breakpointId: null };
            }
            return this._setBreakpointBySourceId(scriptId, lineNumber, columnNumber, condition);
        }
        let locations = [];
        if (response.locations) {
            locations = response.locations.map(payload => Location.fromPayload(this, payload));
        }
        return { locations, breakpointId: response.breakpointId };
    }
    async _setBreakpointBySourceId(scriptId, lineNumber, columnNumber, condition) {
        // This method is required for backward compatibility with V8 before 6.3.275.
        const response = await this._agent.invoke_setBreakpoint({ location: { scriptId: scriptId, lineNumber: lineNumber, columnNumber: columnNumber }, condition: condition });
        if (response.getError()) {
            return { breakpointId: null, locations: [] };
        }
        let actualLocation = [];
        if (response.actualLocation) {
            actualLocation = [Location.fromPayload(this, response.actualLocation)];
        }
        return { locations: actualLocation, breakpointId: response.breakpointId };
    }
    async removeBreakpoint(breakpointId) {
        const response = await this._agent.invoke_removeBreakpoint({ breakpointId });
        if (response.getError()) {
            console.error('Failed to remove breakpoint: ' + response.getError());
        }
    }
    async getPossibleBreakpoints(startLocation, endLocation, restrictToFunction) {
        const response = await this._agent.invoke_getPossibleBreakpoints({
            start: startLocation.payload(),
            end: endLocation ? endLocation.payload() : undefined,
            restrictToFunction: restrictToFunction,
        });
        if (response.getError() || !response.locations) {
            return [];
        }
        return response.locations.map(location => BreakLocation.fromPayload(this, location));
    }
    async fetchAsyncStackTrace(stackId) {
        const response = await this._agent.invoke_getStackTrace({ stackTraceId: stackId });
        return response.getError() ? null : response.stackTrace;
    }
    _breakpointResolved(breakpointId, location) {
        this._breakpointResolvedEventTarget.dispatchEventToListeners(breakpointId, Location.fromPayload(this, location));
    }
    globalObjectCleared() {
        this._setDebuggerPausedDetails(null);
        this._reset();
        // TODO(dgozman): move clients to ExecutionContextDestroyed/ScriptCollected events.
        this.dispatchEventToListeners(Events.GlobalObjectCleared, this);
    }
    _reset() {
        for (const scriptWithSourceMap of this._sourceMapIdToScript.values()) {
            this._sourceMapManager.detachSourceMap(scriptWithSourceMap);
        }
        this._sourceMapIdToScript.clear();
        this._scripts.clear();
        this._scriptsBySourceURL.clear();
        this._discardableScripts = [];
        this._autoStepOver = false;
    }
    scripts() {
        return Array.from(this._scripts.values());
    }
    scriptForId(scriptId) {
        return this._scripts.get(scriptId) || null;
    }
    scriptsForSourceURL(sourceURL) {
        if (!sourceURL) {
            return [];
        }
        return this._scriptsBySourceURL.get(sourceURL) || [];
    }
    scriptsForExecutionContext(executionContext) {
        const result = [];
        for (const script of this._scripts.values()) {
            if (script.executionContextId === executionContext.id) {
                result.push(script);
            }
        }
        return result;
    }
    setScriptSource(scriptId, newSource, callback) {
        const script = this._scripts.get(scriptId);
        if (script) {
            script.editSource(newSource, this._didEditScriptSource.bind(this, scriptId, newSource, callback));
        }
    }
    _didEditScriptSource(scriptId, newSource, callback, error, exceptionDetails, callFrames, asyncStackTrace, asyncStackTraceId, needsStepIn) {
        callback(error, exceptionDetails);
        if (needsStepIn) {
            this.stepInto();
            return;
        }
        if (!error && callFrames && callFrames.length && this._debuggerPausedDetails) {
            this._pausedScript(callFrames, this._debuggerPausedDetails.reason, this._debuggerPausedDetails.auxData, this._debuggerPausedDetails.breakpointIds, asyncStackTrace, asyncStackTraceId);
        }
    }
    get callFrames() {
        return this._debuggerPausedDetails ? this._debuggerPausedDetails.callFrames : null;
    }
    debuggerPausedDetails() {
        return this._debuggerPausedDetails;
    }
    _setDebuggerPausedDetails(debuggerPausedDetails) {
        if (debuggerPausedDetails) {
            this._isPausing = false;
            this._debuggerPausedDetails = debuggerPausedDetails;
            if (this._beforePausedCallback) {
                if (!this._beforePausedCallback.call(null, debuggerPausedDetails)) {
                    return false;
                }
            }
            // If we resolved a location in auto-stepping callback, reset the
            // step-over marker.
            this._autoStepOver = false;
            this.dispatchEventToListeners(Events.DebuggerPaused, this);
            this.setSelectedCallFrame(debuggerPausedDetails.callFrames[0]);
        }
        else {
            this._isPausing = false;
            this._debuggerPausedDetails = null;
            this.setSelectedCallFrame(null);
        }
        return true;
    }
    setBeforePausedCallback(callback) {
        this._beforePausedCallback = callback;
    }
    setExpandCallFramesCallback(callback) {
        this._expandCallFramesCallback = callback;
    }
    setEvaluateOnCallFrameCallback(callback) {
        this._evaluateOnCallFrameCallback = callback;
    }
    async _pausedScript(callFrames, reason, auxData, breakpointIds, asyncStackTrace, asyncStackTraceId, asyncCallStackTraceId) {
        if (this._ignoreDebuggerPausedEvents) {
            return;
        }
        if (asyncCallStackTraceId) {
            // Note: this is only to support old backends. Newer ones do not send asyncCallStackTraceId.
            _scheduledPauseOnAsyncCall = asyncCallStackTraceId;
            const promises = [];
            for (const model of _debuggerIdToModel.values()) {
                promises.push(model._pauseOnAsyncCall(asyncCallStackTraceId));
            }
            await Promise.all(promises);
            this.resume();
            return;
        }
        const pausedDetails = new DebuggerPausedDetails(this, callFrames, reason, auxData, breakpointIds, asyncStackTrace, asyncStackTraceId);
        if (this._expandCallFramesCallback) {
            pausedDetails.callFrames = await this._expandCallFramesCallback.call(null, pausedDetails.callFrames);
        }
        if (this._continueToLocationCallback) {
            const callback = this._continueToLocationCallback;
            this._continueToLocationCallback = null;
            if (callback(pausedDetails)) {
                return;
            }
        }
        if (!this._setDebuggerPausedDetails(pausedDetails)) {
            if (this._autoStepOver) {
                this.stepOver();
            }
            else {
                this.stepInto();
            }
        }
        else {
            Common.EventTarget.fireEvent('DevTools.DebuggerPaused');
        }
        _scheduledPauseOnAsyncCall = null;
    }
    _resumedScript() {
        this._setDebuggerPausedDetails(null);
        this.dispatchEventToListeners(Events.DebuggerResumed, this);
    }
    _parsedScriptSource(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executionContextId, hash, executionContextAuxData, isLiveEdit, sourceMapURL, hasSourceURLComment, hasSyntaxError, length, isModule, originStackTrace, codeOffset, scriptLanguage, debugSymbols, embedderName) {
        const knownScript = this._scripts.get(scriptId);
        if (knownScript) {
            return knownScript;
        }
        let isContentScript = false;
        if (executionContextAuxData && ('isDefault' in executionContextAuxData)) {
            isContentScript = !executionContextAuxData['isDefault'];
        }
        const script = new Script(this, scriptId, sourceURL, startLine, startColumn, endLine, endColumn, executionContextId, hash, isContentScript, isLiveEdit, sourceMapURL, hasSourceURLComment, length, isModule, originStackTrace, codeOffset, scriptLanguage, debugSymbols, embedderName);
        this._registerScript(script);
        this.dispatchEventToListeners(Events.ParsedScriptSource, script);
        const sourceMapId = DebuggerModel._sourceMapId(script.executionContextId, script.sourceURL, script.sourceMapURL);
        if (sourceMapId && !hasSyntaxError) {
            // Consecutive script evaluations in the same execution context with the same sourceURL
            // and sourceMappingURL should result in source map reloading.
            const previousScript = this._sourceMapIdToScript.get(sourceMapId);
            if (previousScript) {
                this._sourceMapManager.detachSourceMap(previousScript);
            }
            this._sourceMapIdToScript.set(sourceMapId, script);
            this._sourceMapManager.attachSourceMap(script, script.sourceURL, script.sourceMapURL);
        }
        const isDiscardable = hasSyntaxError && script.isAnonymousScript();
        if (isDiscardable) {
            this._discardableScripts.push(script);
            this._collectDiscardedScripts();
        }
        return script;
    }
    setSourceMapURL(script, newSourceMapURL) {
        let sourceMapId = DebuggerModel._sourceMapId(script.executionContextId, script.sourceURL, script.sourceMapURL);
        if (sourceMapId && this._sourceMapIdToScript.get(sourceMapId) === script) {
            this._sourceMapIdToScript.delete(sourceMapId);
        }
        this._sourceMapManager.detachSourceMap(script);
        script.sourceMapURL = newSourceMapURL;
        sourceMapId = DebuggerModel._sourceMapId(script.executionContextId, script.sourceURL, script.sourceMapURL);
        if (!sourceMapId) {
            return;
        }
        this._sourceMapIdToScript.set(sourceMapId, script);
        this._sourceMapManager.attachSourceMap(script, script.sourceURL, script.sourceMapURL);
    }
    executionContextDestroyed(executionContext) {
        const sourceMapIds = Array.from(this._sourceMapIdToScript.keys());
        for (const sourceMapId of sourceMapIds) {
            const script = this._sourceMapIdToScript.get(sourceMapId);
            if (script && script.executionContextId === executionContext.id) {
                this._sourceMapIdToScript.delete(sourceMapId);
                this._sourceMapManager.detachSourceMap(script);
            }
        }
    }
    _registerScript(script) {
        this._scripts.set(script.scriptId, script);
        if (script.isAnonymousScript()) {
            return;
        }
        let scripts = this._scriptsBySourceURL.get(script.sourceURL);
        if (!scripts) {
            scripts = [];
            this._scriptsBySourceURL.set(script.sourceURL, scripts);
        }
        scripts.push(script);
    }
    _unregisterScript(script) {
        console.assert(script.isAnonymousScript());
        this._scripts.delete(script.scriptId);
    }
    _collectDiscardedScripts() {
        if (this._discardableScripts.length < 1000) {
            return;
        }
        const scriptsToDiscard = this._discardableScripts.splice(0, 100);
        for (const script of scriptsToDiscard) {
            this._unregisterScript(script);
            this.dispatchEventToListeners(Events.DiscardedAnonymousScriptSource, script);
        }
    }
    createRawLocation(script, lineNumber, columnNumber, inlineFrameIndex) {
        return this.createRawLocationByScriptId(script.scriptId, lineNumber, columnNumber, inlineFrameIndex);
    }
    createRawLocationByURL(sourceURL, lineNumber, columnNumber, inlineFrameIndex) {
        for (const script of this._scriptsBySourceURL.get(sourceURL) || []) {
            if (script.lineOffset > lineNumber ||
                (script.lineOffset === lineNumber && columnNumber !== undefined && script.columnOffset > columnNumber)) {
                continue;
            }
            if (script.endLine < lineNumber ||
                (script.endLine === lineNumber && columnNumber !== undefined && script.endColumn <= columnNumber)) {
                continue;
            }
            return new Location(this, script.scriptId, lineNumber, columnNumber, inlineFrameIndex);
        }
        return null;
    }
    createRawLocationByScriptId(scriptId, lineNumber, columnNumber, inlineFrameIndex) {
        return new Location(this, scriptId, lineNumber, columnNumber, inlineFrameIndex);
    }
    createRawLocationsByStackTrace(stackTrace) {
        const frames = [];
        let current = stackTrace;
        while (current) {
            for (const frame of current.callFrames) {
                frames.push(frame);
            }
            current = current.parent;
        }
        const rawLocations = [];
        for (const frame of frames) {
            const rawLocation = this.createRawLocationByScriptId(frame.scriptId, frame.lineNumber, frame.columnNumber);
            if (rawLocation) {
                rawLocations.push(rawLocation);
            }
        }
        return rawLocations;
    }
    isPaused() {
        return Boolean(this.debuggerPausedDetails());
    }
    isPausing() {
        return this._isPausing;
    }
    setSelectedCallFrame(callFrame) {
        if (this._selectedCallFrame === callFrame) {
            return;
        }
        this._selectedCallFrame = callFrame;
        this.dispatchEventToListeners(Events.CallFrameSelected, this);
    }
    selectedCallFrame() {
        return this._selectedCallFrame;
    }
    async evaluateOnSelectedCallFrame(options) {
        const callFrame = this.selectedCallFrame();
        if (!callFrame) {
            throw new Error('No call frame selected');
        }
        return callFrame.evaluate(options);
    }
    functionDetailsPromise(remoteObject) {
        return remoteObject.getAllProperties(false /* accessorPropertiesOnly */, false /* generatePreview */)
            .then(buildDetails.bind(this));
        function buildDetails(response) {
            if (!response) {
                return null;
            }
            let location = null;
            if (response.internalProperties) {
                for (const prop of response.internalProperties) {
                    if (prop.name === '[[FunctionLocation]]') {
                        location = prop.value;
                    }
                }
            }
            let functionName = null;
            if (response.properties) {
                for (const prop of response.properties) {
                    if (prop.name === 'name' && prop.value && prop.value.type === 'string') {
                        functionName = prop.value;
                    }
                }
            }
            let debuggerLocation = null;
            if (location) {
                debuggerLocation = this.createRawLocationByScriptId(location.value.scriptId, location.value.lineNumber, location.value.columnNumber);
            }
            return { location: debuggerLocation, functionName: functionName ? functionName.value : '' };
        }
    }
    async setVariableValue(scopeNumber, variableName, newValue, callFrameId) {
        const response = await this._agent.invoke_setVariableValue({ scopeNumber, variableName, newValue, callFrameId });
        const error = response.getError();
        if (error) {
            console.error(error);
        }
        return error;
    }
    addBreakpointListener(breakpointId, listener, thisObject) {
        this._breakpointResolvedEventTarget.addEventListener(breakpointId, listener, thisObject);
    }
    removeBreakpointListener(breakpointId, listener, thisObject) {
        this._breakpointResolvedEventTarget.removeEventListener(breakpointId, listener, thisObject);
    }
    async setBlackboxPatterns(patterns) {
        const response = await this._agent.invoke_setBlackboxPatterns({ patterns });
        const error = response.getError();
        if (error) {
            console.error(error);
        }
        return !error;
    }
    dispose() {
        this._sourceMapManager.dispose();
        if (this._debuggerId) {
            _debuggerIdToModel.delete(this._debuggerId);
        }
        Common.Settings.Settings.instance()
            .moduleSetting('pauseOnExceptionEnabled')
            .removeChangeListener(this._pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('pauseOnCaughtException')
            .removeChangeListener(this._pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('disableAsyncStackTraces')
            .removeChangeListener(this._asyncStackTracesStateChanged, this);
    }
    async suspendModel() {
        await this._disableDebugger();
    }
    async resumeModel() {
        await this._enableDebugger();
    }
    static _shouldResyncDebuggerId = false;
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _debuggerIdToModel = new Map();
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export let _scheduledPauseOnAsyncCall = null;
/**
 * Keep these in sync with WebCore::V8Debugger
 */
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var PauseOnExceptionsState;
(function (PauseOnExceptionsState) {
    PauseOnExceptionsState["DontPauseOnExceptions"] = "none";
    PauseOnExceptionsState["PauseOnAllExceptions"] = "all";
    PauseOnExceptionsState["PauseOnUncaughtExceptions"] = "uncaught";
})(PauseOnExceptionsState || (PauseOnExceptionsState = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["DebuggerWasEnabled"] = "DebuggerWasEnabled";
    Events["DebuggerWasDisabled"] = "DebuggerWasDisabled";
    Events["DebuggerPaused"] = "DebuggerPaused";
    Events["DebuggerResumed"] = "DebuggerResumed";
    Events["ParsedScriptSource"] = "ParsedScriptSource";
    Events["FailedToParseScriptSource"] = "FailedToParseScriptSource";
    Events["DiscardedAnonymousScriptSource"] = "DiscardedAnonymousScriptSource";
    Events["GlobalObjectCleared"] = "GlobalObjectCleared";
    Events["CallFrameSelected"] = "CallFrameSelected";
    Events["ConsoleCommandEvaluatedInSelectedCallFrame"] = "ConsoleCommandEvaluatedInSelectedCallFrame";
    Events["DebuggerIsReadyToPause"] = "DebuggerIsReadyToPause";
})(Events || (Events = {}));
class DebuggerDispatcher {
    _debuggerModel;
    constructor(debuggerModel) {
        this._debuggerModel = debuggerModel;
    }
    paused({ callFrames, reason, data, hitBreakpoints, asyncStackTrace, asyncStackTraceId, asyncCallStackTraceId }) {
        if (!this._debuggerModel.debuggerEnabled()) {
            return;
        }
        this._debuggerModel._pausedScript(callFrames, reason, data, hitBreakpoints || [], asyncStackTrace, asyncStackTraceId, asyncCallStackTraceId);
    }
    resumed() {
        if (!this._debuggerModel.debuggerEnabled()) {
            return;
        }
        this._debuggerModel._resumedScript();
    }
    scriptParsed({ scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, isLiveEdit, sourceMapURL, hasSourceURL, length, isModule, stackTrace, codeOffset, scriptLanguage, debugSymbols, embedderName, }) {
        if (!this._debuggerModel.debuggerEnabled()) {
            return;
        }
        this._debuggerModel._parsedScriptSource(scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, Boolean(isLiveEdit), sourceMapURL, Boolean(hasSourceURL), false, length || 0, isModule || null, stackTrace || null, codeOffset || null, scriptLanguage || null, debugSymbols || null, embedderName || null);
    }
    scriptFailedToParse({ scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, sourceMapURL, hasSourceURL, length, isModule, stackTrace, codeOffset, scriptLanguage, embedderName, }) {
        if (!this._debuggerModel.debuggerEnabled()) {
            return;
        }
        this._debuggerModel._parsedScriptSource(scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, false, sourceMapURL, Boolean(hasSourceURL), true, length || 0, isModule || null, stackTrace || null, codeOffset || null, scriptLanguage || null, null, embedderName || null);
    }
    breakpointResolved({ breakpointId, location }) {
        if (!this._debuggerModel.debuggerEnabled()) {
            return;
        }
        this._debuggerModel._breakpointResolved(breakpointId, location);
    }
}
export class Location {
    debuggerModel;
    scriptId;
    lineNumber;
    columnNumber;
    inlineFrameIndex;
    constructor(debuggerModel, scriptId, lineNumber, columnNumber, inlineFrameIndex) {
        this.debuggerModel = debuggerModel;
        this.scriptId = scriptId;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber || 0;
        this.inlineFrameIndex = inlineFrameIndex || 0;
    }
    static fromPayload(debuggerModel, payload, inlineFrameIndex) {
        return new Location(debuggerModel, payload.scriptId, payload.lineNumber, payload.columnNumber, inlineFrameIndex);
    }
    payload() {
        return { scriptId: this.scriptId, lineNumber: this.lineNumber, columnNumber: this.columnNumber };
    }
    script() {
        return this.debuggerModel.scriptForId(this.scriptId);
    }
    continueToLocation(pausedCallback) {
        if (pausedCallback) {
            this.debuggerModel._continueToLocationCallback = this._paused.bind(this, pausedCallback);
        }
        this.debuggerModel._agent.invoke_continueToLocation({
            location: this.payload(),
            targetCallFrames: "current" /* Current */,
        });
    }
    _paused(pausedCallback, debuggerPausedDetails) {
        const location = debuggerPausedDetails.callFrames[0].location();
        if (location.scriptId === this.scriptId && location.lineNumber === this.lineNumber &&
            location.columnNumber === this.columnNumber) {
            pausedCallback();
            return true;
        }
        return false;
    }
    id() {
        return this.debuggerModel.target().id() + ':' + this.scriptId + ':' + this.lineNumber + ':' + this.columnNumber;
    }
}
export class ScriptPosition {
    lineNumber;
    columnNumber;
    constructor(lineNumber, columnNumber) {
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }
    payload() {
        return { lineNumber: this.lineNumber, columnNumber: this.columnNumber };
    }
    compareTo(other) {
        if (this.lineNumber !== other.lineNumber) {
            return this.lineNumber - other.lineNumber;
        }
        return this.columnNumber - other.columnNumber;
    }
}
export class LocationRange {
    scriptId;
    start;
    end;
    constructor(scriptId, start, end) {
        this.scriptId = scriptId;
        this.start = start;
        this.end = end;
    }
    payload() {
        return { scriptId: this.scriptId, start: this.start.payload(), end: this.end.payload() };
    }
    static comparator(location1, location2) {
        return location1.compareTo(location2);
    }
    compareTo(other) {
        if (this.scriptId !== other.scriptId) {
            return this.scriptId > other.scriptId ? 1 : -1;
        }
        const startCmp = this.start.compareTo(other.start);
        if (startCmp) {
            return startCmp;
        }
        return this.end.compareTo(other.end);
    }
    overlap(other) {
        if (this.scriptId !== other.scriptId) {
            return false;
        }
        const startCmp = this.start.compareTo(other.start);
        if (startCmp < 0) {
            return this.end.compareTo(other.start) >= 0;
        }
        if (startCmp > 0) {
            return this.start.compareTo(other.end) <= 0;
        }
        return true;
    }
}
export class BreakLocation extends Location {
    type;
    constructor(debuggerModel, scriptId, lineNumber, columnNumber, type) {
        super(debuggerModel, scriptId, lineNumber, columnNumber);
        if (type) {
            this.type = type;
        }
    }
    static fromPayload(debuggerModel, payload) {
        return new BreakLocation(debuggerModel, payload.scriptId, payload.lineNumber, payload.columnNumber, payload.type);
    }
}
export class CallFrame {
    debuggerModel;
    _script;
    _payload;
    _location;
    _scopeChain;
    _localScope;
    _inlineFrameIndex;
    _functionName;
    _functionLocation;
    _returnValue;
    constructor(debuggerModel, script, payload, inlineFrameIndex, functionName) {
        this.debuggerModel = debuggerModel;
        this._script = script;
        this._payload = payload;
        this._location = Location.fromPayload(debuggerModel, payload.location, inlineFrameIndex);
        this._scopeChain = [];
        this._localScope = null;
        this._inlineFrameIndex = inlineFrameIndex || 0;
        this._functionName = functionName || payload.functionName;
        for (let i = 0; i < payload.scopeChain.length; ++i) {
            const scope = new Scope(this, i);
            this._scopeChain.push(scope);
            if (scope.type() === "local" /* Local */) {
                this._localScope = scope;
            }
        }
        if (payload.functionLocation) {
            this._functionLocation = Location.fromPayload(debuggerModel, payload.functionLocation);
        }
        this._returnValue =
            payload.returnValue ? this.debuggerModel._runtimeModel.createRemoteObject(payload.returnValue) : null;
    }
    static fromPayloadArray(debuggerModel, callFrames) {
        const result = [];
        for (let i = 0; i < callFrames.length; ++i) {
            const callFrame = callFrames[i];
            const script = debuggerModel.scriptForId(callFrame.location.scriptId);
            if (script) {
                result.push(new CallFrame(debuggerModel, script, callFrame));
            }
        }
        return result;
    }
    createVirtualCallFrame(inlineFrameIndex, functionName) {
        return new CallFrame(this.debuggerModel, this._script, this._payload, inlineFrameIndex, functionName);
    }
    get script() {
        return this._script;
    }
    get id() {
        return this._payload.callFrameId;
    }
    get inlineFrameIndex() {
        return this._inlineFrameIndex;
    }
    scopeChain() {
        return this._scopeChain;
    }
    localScope() {
        return this._localScope;
    }
    thisObject() {
        return this._payload.this ? this.debuggerModel._runtimeModel.createRemoteObject(this._payload.this) : null;
    }
    returnValue() {
        return this._returnValue;
    }
    async setReturnValue(expression) {
        if (!this._returnValue) {
            return null;
        }
        const evaluateResponse = await this.debuggerModel._agent.invoke_evaluateOnCallFrame({ callFrameId: this.id, expression: expression, silent: true, objectGroup: 'backtrace' });
        if (evaluateResponse.getError() || evaluateResponse.exceptionDetails) {
            return null;
        }
        const response = await this.debuggerModel._agent.invoke_setReturnValue({ newValue: evaluateResponse.result });
        if (response.getError()) {
            return null;
        }
        this._returnValue = this.debuggerModel._runtimeModel.createRemoteObject(evaluateResponse.result);
        return this._returnValue;
    }
    get functionName() {
        return this._functionName;
    }
    location() {
        return this._location;
    }
    functionLocation() {
        return this._functionLocation || null;
    }
    async evaluate(options) {
        const debuggerModel = this.debuggerModel;
        const runtimeModel = debuggerModel.runtimeModel();
        // Assume backends either support both throwOnSideEffect and timeout options or neither.
        const needsTerminationOptions = Boolean(options.throwOnSideEffect) || options.timeout !== undefined;
        if (needsTerminationOptions &&
            (runtimeModel.hasSideEffectSupport() === false ||
                (runtimeModel.hasSideEffectSupport() === null && !await runtimeModel.checkSideEffectSupport()))) {
            return { error: 'Side-effect checks not supported by backend.' };
        }
        if (debuggerModel._evaluateOnCallFrameCallback) {
            const result = await debuggerModel._evaluateOnCallFrameCallback(this, options);
            if (result) {
                return result;
            }
        }
        const response = await this.debuggerModel._agent.invoke_evaluateOnCallFrame({
            callFrameId: this.id,
            expression: options.expression,
            objectGroup: options.objectGroup,
            includeCommandLineAPI: options.includeCommandLineAPI,
            silent: options.silent,
            returnByValue: options.returnByValue,
            generatePreview: options.generatePreview,
            throwOnSideEffect: options.throwOnSideEffect,
            timeout: options.timeout,
        });
        const error = response.getError();
        if (error) {
            console.error(error);
            return { error: error };
        }
        return { object: runtimeModel.createRemoteObject(response.result), exceptionDetails: response.exceptionDetails };
    }
}
export class Scope {
    _callFrame;
    _payload;
    _type;
    _name;
    _ordinal;
    _startLocation;
    _endLocation;
    _object;
    constructor(callFrame, ordinal) {
        this._callFrame = callFrame;
        this._payload = callFrame._payload.scopeChain[ordinal];
        this._type = this._payload.type;
        this._name = this._payload.name;
        this._ordinal = ordinal;
        this._startLocation =
            this._payload.startLocation ? Location.fromPayload(callFrame.debuggerModel, this._payload.startLocation) : null;
        this._endLocation =
            this._payload.endLocation ? Location.fromPayload(callFrame.debuggerModel, this._payload.endLocation) : null;
        this._object = null;
    }
    callFrame() {
        return this._callFrame;
    }
    type() {
        return this._type;
    }
    typeName() {
        switch (this._type) {
            case "local" /* Local */:
                return i18nString(UIStrings.local);
            case "closure" /* Closure */:
                return i18nString(UIStrings.closure);
            case "catch" /* Catch */:
                return i18n.i18n.lockedString('Catch');
            case "block" /* Block */:
                return i18nString(UIStrings.block);
            case "script" /* Script */:
                return i18nString(UIStrings.script);
            case "with" /* With */:
                return i18nString(UIStrings.withBlock);
            case "global" /* Global */:
                return i18nString(UIStrings.global);
            case "module" /* Module */:
                return i18nString(UIStrings.module);
            case "wasm-expression-stack" /* WasmExpressionStack */:
                return i18nString(UIStrings.expression);
        }
        return '';
    }
    name() {
        return this._name;
    }
    startLocation() {
        return this._startLocation;
    }
    endLocation() {
        return this._endLocation;
    }
    object() {
        if (this._object) {
            return this._object;
        }
        const runtimeModel = this._callFrame.debuggerModel._runtimeModel;
        const declarativeScope = this._type !== "with" /* With */ && this._type !== "global" /* Global */;
        if (declarativeScope) {
            this._object =
                runtimeModel.createScopeRemoteObject(this._payload.object, new ScopeRef(this._ordinal, this._callFrame.id));
        }
        else {
            this._object = runtimeModel.createRemoteObject(this._payload.object);
        }
        return this._object;
    }
    description() {
        const declarativeScope = this._type !== "with" /* With */ && this._type !== "global" /* Global */;
        return declarativeScope ? '' : (this._payload.object.description || '');
    }
    icon() {
        return undefined;
    }
}
export class DebuggerPausedDetails {
    debuggerModel;
    callFrames;
    reason;
    auxData;
    breakpointIds;
    asyncStackTrace;
    asyncStackTraceId;
    constructor(debuggerModel, callFrames, reason, auxData, breakpointIds, asyncStackTrace, asyncStackTraceId) {
        this.debuggerModel = debuggerModel;
        this.callFrames = CallFrame.fromPayloadArray(debuggerModel, callFrames);
        this.reason = reason;
        this.auxData = auxData;
        this.breakpointIds = breakpointIds;
        if (asyncStackTrace) {
            this.asyncStackTrace = this._cleanRedundantFrames(asyncStackTrace);
        }
        this.asyncStackTraceId = asyncStackTraceId;
    }
    exception() {
        if (this.reason !== "exception" /* Exception */ &&
            this.reason !== "promiseRejection" /* PromiseRejection */) {
            return null;
        }
        return this.debuggerModel._runtimeModel.createRemoteObject(this.auxData);
    }
    _cleanRedundantFrames(asyncStackTrace) {
        let stack = asyncStackTrace;
        let previous = null;
        while (stack) {
            if (stack.description === 'async function' && stack.callFrames.length) {
                stack.callFrames.shift();
            }
            if (previous && !stack.callFrames.length) {
                previous.parent = stack.parent;
            }
            else {
                previous = stack;
            }
            stack = stack.parent;
        }
        return asyncStackTrace;
    }
}
SDKModel.register(DebuggerModel, { capabilities: Capability.JS, autostart: true });
//# sourceMappingURL=DebuggerModel.js.map