/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as i18n from '../i18n/i18n.js';
import { FrontendMessageSource, FrontendMessageType } from './ConsoleModelTypes.js';
export { FrontendMessageSource, FrontendMessageType } from './ConsoleModelTypes.js';
import { CPUProfilerModel, Events as CPUProfilerModelEvents } from './CPUProfilerModel.js'; // eslint-disable-line no-unused-vars
import { Events as DebuggerModelEvents } from './DebuggerModel.js'; // eslint-disable-line no-unused-vars
import { LogModel } from './LogModel.js';
import { RemoteObject } from './RemoteObject.js';
import { Events as ResourceTreeModelEvents, ResourceTreeModel } from './ResourceTreeModel.js';
import { Events as RuntimeModelEvents, RuntimeModel } from './RuntimeModel.js'; // eslint-disable-line no-unused-vars
import { TargetManager } from './TargetManager.js';
const UIStrings = {
    /**
    *@description Text shown when the main frame (page) of the website was navigated to a different URL.
    *@example {https://example.com} PH1
    */
    navigatedToS: 'Navigated to {PH1}',
    /**
    *@description Text shown in the console when a performance profile (with the given name) was started.
    *@example {title} PH1
    */
    profileSStarted: 'Profile \'{PH1}\' started.',
    /**
    *@description Text shown in the console when a performance profile (with the given name) was stopped.
    *@example {name} PH1
    */
    profileSFinished: 'Profile \'{PH1}\' finished.',
    /**
    *@description Error message shown in the console after the user tries to save a JavaScript value to a temporary variable.
    */
    failedToSaveToTempVariable: 'Failed to save to temp variable.',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/ConsoleModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let settingsInstance;
export class ConsoleModel extends Common.ObjectWrapper.ObjectWrapper {
    _messages;
    _messageByExceptionId;
    _warnings;
    _errors;
    _violations;
    _pageLoadSequenceNumber;
    _targetListeners;
    constructor() {
        super();
        this._messages = [];
        this._messageByExceptionId = new Map();
        this._warnings = 0;
        this._errors = 0;
        this._violations = 0;
        this._pageLoadSequenceNumber = 0;
        this._targetListeners = new WeakMap();
        TargetManager.instance().observeTargets(this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!settingsInstance || forceNew) {
            settingsInstance = new ConsoleModel();
        }
        return settingsInstance;
    }
    targetAdded(target) {
        const resourceTreeModel = target.model(ResourceTreeModel);
        if (!resourceTreeModel || resourceTreeModel.cachedResourcesLoaded()) {
            this._initTarget(target);
            return;
        }
        const eventListener = resourceTreeModel.addEventListener(ResourceTreeModelEvents.CachedResourcesLoaded, () => {
            Common.EventTarget.EventTarget.removeEventListeners([eventListener]);
            this._initTarget(target);
        });
    }
    _initTarget(target) {
        const eventListeners = [];
        const cpuProfilerModel = target.model(CPUProfilerModel);
        if (cpuProfilerModel) {
            eventListeners.push(cpuProfilerModel.addEventListener(CPUProfilerModelEvents.ConsoleProfileStarted, this._consoleProfileStarted.bind(this, cpuProfilerModel)));
            eventListeners.push(cpuProfilerModel.addEventListener(CPUProfilerModelEvents.ConsoleProfileFinished, this._consoleProfileFinished.bind(this, cpuProfilerModel)));
        }
        const resourceTreeModel = target.model(ResourceTreeModel);
        if (resourceTreeModel && !target.parentTarget()) {
            eventListeners.push(resourceTreeModel.addEventListener(ResourceTreeModelEvents.MainFrameNavigated, this._mainFrameNavigated, this));
        }
        const runtimeModel = target.model(RuntimeModel);
        if (runtimeModel) {
            eventListeners.push(runtimeModel.addEventListener(RuntimeModelEvents.ExceptionThrown, this._exceptionThrown.bind(this, runtimeModel)));
            eventListeners.push(runtimeModel.addEventListener(RuntimeModelEvents.ExceptionRevoked, this._exceptionRevoked.bind(this, runtimeModel)));
            eventListeners.push(runtimeModel.addEventListener(RuntimeModelEvents.ConsoleAPICalled, this._consoleAPICalled.bind(this, runtimeModel)));
            if (!target.parentTarget()) {
                eventListeners.push(runtimeModel.debuggerModel().addEventListener(DebuggerModelEvents.GlobalObjectCleared, this._clearIfNecessary, this));
            }
            eventListeners.push(runtimeModel.addEventListener(RuntimeModelEvents.QueryObjectRequested, this._queryObjectRequested.bind(this, runtimeModel)));
        }
        this._targetListeners.set(target, eventListeners);
    }
    targetRemoved(target) {
        const runtimeModel = target.model(RuntimeModel);
        if (runtimeModel) {
            this._messageByExceptionId.delete(runtimeModel);
        }
        Common.EventTarget.EventTarget.removeEventListeners(this._targetListeners.get(target) || []);
    }
    async evaluateCommandInConsole(executionContext, originatingMessage, expression, useCommandLineAPI) {
        const result = await executionContext.evaluate({
            expression: expression,
            objectGroup: 'console',
            includeCommandLineAPI: useCommandLineAPI,
            silent: false,
            returnByValue: false,
            generatePreview: true,
            replMode: true,
            allowUnsafeEvalBlockedByCSP: false,
            disableBreaks: undefined,
            throwOnSideEffect: undefined,
            timeout: undefined,
        }, Common.Settings.Settings.instance().moduleSetting('consoleUserActivationEval').get(), /* awaitPromise */ false);
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.ConsoleEvaluated);
        if ('error' in result) {
            return;
        }
        await Common.Console.Console.instance().showPromise();
        this.dispatchEventToListeners(Events.CommandEvaluated, { result: result.object, commandMessage: originatingMessage, exceptionDetails: result.exceptionDetails });
    }
    addCommandMessage(executionContext, text) {
        const commandMessage = new ConsoleMessage(executionContext.runtimeModel, "javascript" /* Javascript */, null, text, FrontendMessageType.Command);
        commandMessage.setExecutionContextId(executionContext.id);
        this.addMessage(commandMessage);
        return commandMessage;
    }
    addMessage(msg) {
        msg._pageLoadSequenceNumber = this._pageLoadSequenceNumber;
        if (msg.source === FrontendMessageSource.ConsoleAPI &&
            msg.type === "clear" /* Clear */) {
            this._clearIfNecessary();
        }
        this._messages.push(msg);
        const runtimeModel = msg.runtimeModel();
        if (msg._exceptionId && runtimeModel) {
            let modelMap = this._messageByExceptionId.get(runtimeModel);
            if (!modelMap) {
                modelMap = new Map();
                this._messageByExceptionId.set(runtimeModel, modelMap);
            }
            modelMap.set(msg._exceptionId, msg);
        }
        this._incrementErrorWarningCount(msg);
        this.dispatchEventToListeners(Events.MessageAdded, msg);
    }
    _exceptionThrown(runtimeModel, event) {
        const exceptionWithTimestamp = event.data;
        const consoleMessage = ConsoleMessage.fromException(runtimeModel, exceptionWithTimestamp.details, undefined, exceptionWithTimestamp.timestamp, undefined);
        consoleMessage.setExceptionId(exceptionWithTimestamp.details.exceptionId);
        this.addMessage(consoleMessage);
    }
    _exceptionRevoked(runtimeModel, event) {
        const exceptionId = event.data;
        const modelMap = this._messageByExceptionId.get(runtimeModel);
        const exceptionMessage = modelMap ? modelMap.get(exceptionId) : null;
        if (!exceptionMessage) {
            return;
        }
        this._errors--;
        exceptionMessage.level = "verbose" /* Verbose */;
        this.dispatchEventToListeners(Events.MessageUpdated, exceptionMessage);
    }
    _consoleAPICalled(runtimeModel, event) {
        const call = event.data;
        let level = "info" /* Info */;
        if (call.type === "debug" /* Debug */) {
            level = "verbose" /* Verbose */;
        }
        else if (call.type === "error" /* Error */ ||
            call.type === "assert" /* Assert */) {
            level = "error" /* Error */;
        }
        else if (call.type === "warning" /* Warning */) {
            level = "warning" /* Warning */;
        }
        else if (call.type === "info" /* Info */ ||
            call.type === "log" /* Log */) {
            level = "info" /* Info */;
        }
        let message = '';
        if (call.args.length && call.args[0].unserializableValue) {
            message = call.args[0].unserializableValue;
        }
        else if (call.args.length && (typeof call.args[0].value !== 'object' || call.args[0].value === null)) {
            message = String(call.args[0].value);
        }
        else if (call.args.length && call.args[0].description) {
            message = call.args[0].description;
        }
        const callFrame = call.stackTrace && call.stackTrace.callFrames.length ? call.stackTrace.callFrames[0] : null;
        const consoleMessage = new ConsoleMessage(runtimeModel, FrontendMessageSource.ConsoleAPI, level, message, call.type, callFrame ? callFrame.url : undefined, callFrame ? callFrame.lineNumber : undefined, callFrame ? callFrame.columnNumber : undefined, call.args, call.stackTrace, call.timestamp, call.executionContextId, undefined, undefined, call.context);
        this.addMessage(consoleMessage);
    }
    _queryObjectRequested(runtimeModel, event) {
        const data = event.data;
        const consoleMessage = new ConsoleMessage(runtimeModel, FrontendMessageSource.ConsoleAPI, "info" /* Info */, '', FrontendMessageType.QueryObjectResult, undefined, undefined, undefined, [data.objects]);
        this.addMessage(consoleMessage);
    }
    _clearIfNecessary() {
        if (!Common.Settings.Settings.instance().moduleSetting('preserveConsoleLog').get()) {
            this._clear();
        }
        ++this._pageLoadSequenceNumber;
    }
    _mainFrameNavigated(event) {
        if (Common.Settings.Settings.instance().moduleSetting('preserveConsoleLog').get()) {
            Common.Console.Console.instance().log(i18nString(UIStrings.navigatedToS, { PH1: event.data.url }));
        }
    }
    _consoleProfileStarted(cpuProfilerModel, event) {
        const data = event.data;
        this._addConsoleProfileMessage(cpuProfilerModel, "profile" /* Profile */, data.scriptLocation, i18nString(UIStrings.profileSStarted, { PH1: data.title }));
    }
    _consoleProfileFinished(cpuProfilerModel, event) {
        const data = event.data;
        this._addConsoleProfileMessage(cpuProfilerModel, "profileEnd" /* ProfileEnd */, data.scriptLocation, i18nString(UIStrings.profileSFinished, { PH1: data.title }));
    }
    _addConsoleProfileMessage(cpuProfilerModel, type, scriptLocation, messageText) {
        const script = scriptLocation.script();
        const callFrames = [{
                functionName: '',
                scriptId: scriptLocation.scriptId,
                url: script ? script.contentURL() : '',
                lineNumber: scriptLocation.lineNumber,
                columnNumber: scriptLocation.columnNumber || 0,
            }];
        this.addMessage(new ConsoleMessage(cpuProfilerModel.runtimeModel(), FrontendMessageSource.ConsoleAPI, "info" /* Info */, messageText, type, undefined, undefined, undefined, undefined, { callFrames }));
    }
    _incrementErrorWarningCount(msg) {
        if (msg.source === "violation" /* Violation */) {
            this._violations++;
            return;
        }
        switch (msg.level) {
            case "warning" /* Warning */:
                this._warnings++;
                break;
            case "error" /* Error */:
                this._errors++;
                break;
        }
    }
    messages() {
        return this._messages;
    }
    requestClearMessages() {
        for (const logModel of TargetManager.instance().models(LogModel)) {
            logModel.requestClear();
        }
        for (const runtimeModel of TargetManager.instance().models(RuntimeModel)) {
            runtimeModel.discardConsoleEntries();
        }
        this._clear();
    }
    _clear() {
        this._messages = [];
        this._messageByExceptionId.clear();
        this._errors = 0;
        this._warnings = 0;
        this._violations = 0;
        this.dispatchEventToListeners(Events.ConsoleCleared);
    }
    errors() {
        return this._errors;
    }
    warnings() {
        return this._warnings;
    }
    violations() {
        return this._violations;
    }
    async saveToTempVariable(currentExecutionContext, remoteObject) {
        if (!remoteObject || !currentExecutionContext) {
            failedToSave(null);
            return;
        }
        const executionContext = currentExecutionContext;
        const result = await executionContext.globalObject(/* objectGroup */ '', /* generatePreview */ false);
        if ('error' in result || Boolean(result.exceptionDetails) || !result.object) {
            failedToSave('object' in result && result.object || null);
            return;
        }
        const globalObject = result.object;
        const callFunctionResult = 
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // @ts-expect-error
        await globalObject.callFunction(saveVariable, [RemoteObject.toCallArgument(remoteObject)]);
        globalObject.release();
        if (callFunctionResult.wasThrown || !callFunctionResult.object || callFunctionResult.object.type !== 'string') {
            failedToSave(callFunctionResult.object || null);
        }
        else {
            const text = callFunctionResult.object.value;
            const message = this.addCommandMessage(executionContext, text);
            this.evaluateCommandInConsole(executionContext, message, text, /* useCommandLineAPI */ false);
        }
        if (callFunctionResult.object) {
            callFunctionResult.object.release();
        }
        function saveVariable(value) {
            const prefix = 'temp';
            let index = 1;
            while ((prefix + index) in this) {
                ++index;
            }
            const name = prefix + index;
            // @ts-ignore Assignment to global object
            this[name] = value;
            return name;
        }
        function failedToSave(result) {
            let message = i18nString(UIStrings.failedToSaveToTempVariable);
            if (result) {
                message = message + ' ' + result.description;
            }
            Common.Console.Console.instance().error(message);
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ConsoleCleared"] = "ConsoleCleared";
    Events["MessageAdded"] = "MessageAdded";
    Events["MessageUpdated"] = "MessageUpdated";
    Events["CommandEvaluated"] = "CommandEvaluated";
})(Events || (Events = {}));
export class ConsoleMessage {
    _runtimeModel;
    source;
    level;
    messageText;
    _type;
    url;
    line;
    column;
    parameters;
    stackTrace;
    timestamp;
    executionContextId;
    scriptId;
    workerId;
    context;
    _originatingConsoleMessage;
    _pageLoadSequenceNumber;
    _exceptionId;
    constructor(runtimeModel, source, level, messageText, type, url, line, column, parameters, stackTrace, timestamp, executionContextId, scriptId, workerId, context) {
        this._runtimeModel = runtimeModel;
        this.source = source;
        this.level = level;
        this.messageText = messageText;
        this._type = type || "log" /* Log */;
        this.url = url || undefined;
        this.line = line || 0;
        this.column = column || 0;
        this.parameters = parameters;
        this.stackTrace = stackTrace;
        this.timestamp = timestamp || Date.now();
        this.executionContextId = executionContextId || 0;
        this.scriptId = scriptId || null;
        this.workerId = workerId || null;
        if (!this.executionContextId && this._runtimeModel) {
            if (this.scriptId) {
                this.executionContextId = this._runtimeModel.executionContextIdForScriptId(this.scriptId);
            }
            else if (this.stackTrace) {
                this.executionContextId = this._runtimeModel.executionContextForStackTrace(this.stackTrace);
            }
        }
        if (context) {
            const match = context.match(/[^#]*/);
            this.context = match && match[0];
        }
        this._originatingConsoleMessage = null;
        this._pageLoadSequenceNumber = undefined;
        this._exceptionId = undefined;
    }
    get type() {
        return this._type;
    }
    static fromException(runtimeModel, exceptionDetails, messageType, timestamp, forceUrl) {
        return new ConsoleMessage(runtimeModel, "javascript" /* Javascript */, "error" /* Error */, RuntimeModel.simpleTextFromException(exceptionDetails), messageType, forceUrl || exceptionDetails.url, exceptionDetails.lineNumber, exceptionDetails.columnNumber, exceptionDetails.exception ? [RemoteObject.fromLocalObject(exceptionDetails.text), exceptionDetails.exception] :
            undefined, exceptionDetails.stackTrace, timestamp, exceptionDetails.executionContextId, exceptionDetails.scriptId);
    }
    runtimeModel() {
        return this._runtimeModel;
    }
    target() {
        return this._runtimeModel ? this._runtimeModel.target() : null;
    }
    setOriginatingMessage(originatingMessage) {
        this._originatingConsoleMessage = originatingMessage;
        this.executionContextId = originatingMessage.executionContextId;
    }
    setExecutionContextId(executionContextId) {
        this.executionContextId = executionContextId;
    }
    setExceptionId(exceptionId) {
        this._exceptionId = exceptionId;
    }
    originatingMessage() {
        return this._originatingConsoleMessage;
    }
    isGroupMessage() {
        return this.type === "startGroup" /* StartGroup */ ||
            this.type === "startGroupCollapsed" /* StartGroupCollapsed */ ||
            this.type === "endGroup" /* EndGroup */;
    }
    isGroupStartMessage() {
        return this.type === "startGroup" /* StartGroup */ ||
            this.type === "startGroupCollapsed" /* StartGroupCollapsed */;
    }
    isErrorOrWarning() {
        return (this.level === "warning" /* Warning */ || this.level === "error" /* Error */);
    }
    isGroupable() {
        const isUngroupableError = this.level === "error" /* Error */ &&
            (this.source === "javascript" /* Javascript */ || this.source === "network" /* Network */);
        return (this.source !== FrontendMessageSource.ConsoleAPI && this.type !== FrontendMessageType.Command &&
            this.type !== FrontendMessageType.Result && this.type !== FrontendMessageType.System && !isUngroupableError);
    }
    groupCategoryKey() {
        return [this.source, this.level, this.type, this._pageLoadSequenceNumber].join(':');
    }
    isEqual(msg) {
        if (!msg) {
            return false;
        }
        if (!this._isEqualStackTraces(this.stackTrace, msg.stackTrace)) {
            return false;
        }
        if (this.parameters) {
            if (!msg.parameters || this.parameters.length !== msg.parameters.length) {
                return false;
            }
            for (let i = 0; i < msg.parameters.length; ++i) {
                const msgParam = msg.parameters[i];
                const param = this.parameters[i];
                if (typeof msgParam === 'string' || typeof param === 'string') {
                    // TODO(chromium:1136435): Remove this case.
                    return false;
                }
                // Never treat objects as equal - their properties might change over time. Errors can be treated as equal
                // since they are always formatted as strings.
                if (msgParam.type === 'object' && msgParam.subtype !== 'error') {
                    return false;
                }
                if (param.type !== msgParam.type || param.value !== msgParam.value ||
                    param.description !== msgParam.description) {
                    return false;
                }
            }
        }
        const watchExpressionRegex = /^watch-expression-\d+.devtools$/;
        const bothAreWatchExpressions = watchExpressionRegex.test(this.url || '') && watchExpressionRegex.test(msg.url || '');
        return (this.runtimeModel() === msg.runtimeModel()) && (this.source === msg.source) && (this.type === msg.type) &&
            (this.level === msg.level) && (this.line === msg.line) && (this.url === msg.url) &&
            (bothAreWatchExpressions || this.scriptId === msg.scriptId) && (this.messageText === msg.messageText) &&
            (this.executionContextId === msg.executionContextId);
    }
    _isEqualStackTraces(stackTrace1, stackTrace2) {
        if (!stackTrace1 !== !stackTrace2) {
            return false;
        }
        if (!stackTrace1 || !stackTrace2) {
            return true;
        }
        const callFrames1 = stackTrace1.callFrames;
        const callFrames2 = stackTrace2.callFrames;
        if (callFrames1.length !== callFrames2.length) {
            return false;
        }
        for (let i = 0, n = callFrames1.length; i < n; ++i) {
            if (callFrames1[i].url !== callFrames2[i].url || callFrames1[i].functionName !== callFrames2[i].functionName ||
                callFrames1[i].lineNumber !== callFrames2[i].lineNumber ||
                callFrames1[i].columnNumber !== callFrames2[i].columnNumber) {
                return false;
            }
        }
        return this._isEqualStackTraces(stackTrace1.parent, stackTrace2.parent);
    }
}
export const MessageSourceDisplayName = new Map(([
    ["xml" /* XML */, 'xml'],
    ["javascript" /* Javascript */, 'javascript'],
    ["network" /* Network */, 'network'],
    [FrontendMessageSource.ConsoleAPI, 'console-api'],
    ["storage" /* Storage */, 'storage'],
    ["appcache" /* Appcache */, 'appcache'],
    ["rendering" /* Rendering */, 'rendering'],
    [FrontendMessageSource.CSS, 'css'],
    ["security" /* Security */, 'security'],
    ["deprecation" /* Deprecation */, 'deprecation'],
    ["worker" /* Worker */, 'worker'],
    ["violation" /* Violation */, 'violation'],
    ["intervention" /* Intervention */, 'intervention'],
    ["recommendation" /* Recommendation */, 'recommendation'],
    ["other" /* Other */, 'other'],
]));
//# sourceMappingURL=ConsoleModel.js.map