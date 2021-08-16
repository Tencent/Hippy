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
/* eslint-disable rulesdir/no_underscored_properties */
import { NodeURL } from './NodeURL.js';
export const ProtocolError = Symbol('Protocol.Error');
export const DevToolsStubErrorCode = -32015;
// TODO(dgozman): we are not reporting generic errors in tests, but we should
// instead report them and just have some expected errors in test expectations.
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _GenericError = -32000;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _ConnectionClosedErrorCode = -32001;
export class InspectorBackend {
    _agentPrototypes;
    _dispatcherPrototypes;
    _initialized;
    constructor() {
        this._agentPrototypes = new Map();
        this._dispatcherPrototypes = new Map();
        this._initialized = false;
    }
    static reportProtocolError(error, messageObject) {
        console.error(error + ': ' + JSON.stringify(messageObject));
    }
    static reportProtocolWarning(error, messageObject) {
        console.warn(error + ': ' + JSON.stringify(messageObject));
    }
    isInitialized() {
        return this._initialized;
    }
    _addAgentGetterMethodToProtocolTargetPrototype(domain) {
        let upperCaseLength = 0;
        while (upperCaseLength < domain.length && domain[upperCaseLength].toLowerCase() !== domain[upperCaseLength]) {
            ++upperCaseLength;
        }
        const methodName = domain.substr(0, upperCaseLength).toLowerCase() + domain.slice(upperCaseLength) + 'Agent';
        function agentGetter() {
            return this._agents[domain];
        }
        // @ts-ignore Method code generation
        TargetBase.prototype[methodName] = agentGetter;
        function registerDispatcher(dispatcher) {
            this.registerDispatcher(domain, dispatcher);
        }
        // @ts-ignore Method code generation
        TargetBase.prototype['register' + domain + 'Dispatcher'] = registerDispatcher;
        function unregisterDispatcher(dispatcher) {
            this.unregisterDispatcher(domain, dispatcher);
        }
        // @ts-ignore Method code generation
        TargetBase.prototype['unregister' + domain + 'Dispatcher'] = unregisterDispatcher;
    }
    _agentPrototype(domain) {
        if (!this._agentPrototypes.has(domain)) {
            this._agentPrototypes.set(domain, new _AgentPrototype(domain));
            this._addAgentGetterMethodToProtocolTargetPrototype(domain);
        }
        return /** @type {!_AgentPrototype} */ this._agentPrototypes.get(domain);
    }
    _dispatcherPrototype(domain) {
        if (!this._dispatcherPrototypes.has(domain)) {
            this._dispatcherPrototypes.set(domain, new _DispatcherPrototype());
        }
        return /** @type {!_DispatcherPrototype} */ this._dispatcherPrototypes.get(domain);
    }
    registerCommand(method, signature, replyArgs) {
        const domainAndMethod = method.split('.');
        this._agentPrototype(domainAndMethod[0]).registerCommand(domainAndMethod[1], signature, replyArgs);
        this._initialized = true;
    }
    registerEnum(type, values) {
        const domainAndName = type.split('.');
        const domain = domainAndName[0];
        // @ts-ignore Protocol global namespace pollution
        if (!Protocol[domain]) {
            // @ts-ignore Protocol global namespace pollution
            Protocol[domain] = {};
        }
        // @ts-ignore Protocol global namespace pollution
        Protocol[domain][domainAndName[1]] = values;
        this._initialized = true;
    }
    registerEvent(eventName, params) {
        const domain = eventName.split('.')[0];
        this._dispatcherPrototype(domain).registerEvent(eventName, params);
        this._initialized = true;
    }
    wrapClientCallback(clientCallback, errorPrefix, constructor, defaultValue) {
        /**
         * @template S
         */
        function callbackWrapper(error, value) {
            if (error) {
                console.error(errorPrefix + error);
                clientCallback(defaultValue);
                return;
            }
            if (constructor) {
                // @ts-ignore Special casting
                clientCallback(new constructor(value));
            }
            else {
                // @ts-ignore Special casting
                clientCallback(value);
            }
        }
        return callbackWrapper;
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _factory;
export class Connection {
    _onMessage;
    constructor() {
    }
    setOnMessage(_onMessage) {
    }
    setOnDisconnect(_onDisconnect) {
    }
    sendRawMessage(_message) {
    }
    disconnect() {
        throw new Error('not implemented');
    }
    static setFactory(factory) {
        _factory = factory;
    }
    static getFactory() {
        return _factory;
    }
}
export const test = {
    /**
     * This will get called for every protocol message.
     * ProtocolClient.test.dumpProtocol = console.log
     */
    dumpProtocol: null,
    /**
     * Runs a function when no protocol activity is present.
     * ProtocolClient.test.deprecatedRunAfterPendingDispatches(() => console.log('done'))
     */
    deprecatedRunAfterPendingDispatches: null,
    /**
     * Sends a raw message over main connection.
     * ProtocolClient.test.sendRawMessage('Page.enable', {}, console.log)
     */
    sendRawMessage: null,
    /**
     * Set to true to not log any errors.
     */
    suppressRequestErrors: false,
    /**
     * Set to get notified about any messages sent over protocol.
     */
    onMessageSent: null,
    /**
     * Set to get notified about any messages received over protocol.
     */
    onMessageReceived: null,
};
const LongPollingMethods = new Set(['CSS.takeComputedStyleUpdates']);
export class SessionRouter {
    _connection;
    _lastMessageId;
    _pendingResponsesCount;
    _pendingLongPollingMessageIds;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _domainToLogger;
    _sessions;
    _pendingScripts;
    constructor(connection) {
        this._connection = connection;
        this._lastMessageId = 1;
        this._pendingResponsesCount = 0;
        this._pendingLongPollingMessageIds = new Set();
        this._domainToLogger = new Map();
        this._sessions = new Map();
        this._pendingScripts = [];
        test.deprecatedRunAfterPendingDispatches = this._deprecatedRunAfterPendingDispatches.bind(this);
        test.sendRawMessage = this._sendRawMessageForTesting.bind(this);
        this._connection.setOnMessage(this._onMessage.bind(this));
        this._connection.setOnDisconnect(reason => {
            const session = this._sessions.get('');
            if (session) {
                session.target.dispose(reason);
            }
        });
    }
    registerSession(target, sessionId, proxyConnection) {
        // Only the Audits panel uses proxy connections. If it is ever possible to have multiple active at the
        // same time, it should be tested thoroughly.
        if (proxyConnection) {
            for (const session of this._sessions.values()) {
                if (session.proxyConnection) {
                    console.error('Multiple simultaneous proxy connections are currently unsupported');
                    break;
                }
            }
        }
        this._sessions.set(sessionId, { target, callbacks: new Map(), proxyConnection });
    }
    unregisterSession(sessionId) {
        const session = this._sessions.get(sessionId);
        if (!session) {
            return;
        }
        for (const callback of session.callbacks.values()) {
            SessionRouter.dispatchUnregisterSessionError(callback);
        }
        this._sessions.delete(sessionId);
    }
    _getTargetBySessionId(sessionId) {
        const session = this._sessions.get(sessionId ? sessionId : '');
        if (!session) {
            return null;
        }
        return session.target;
    }
    _nextMessageId() {
        return this._lastMessageId++;
    }
    connection() {
        return this._connection;
    }
    sendMessage(sessionId, domain, method, params, callback) {
        const messageId = this._nextMessageId();
        const messageObject = {
            id: messageId,
            method: method,
        };
        if (params) {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            messageObject.params = params;
        }
        if (sessionId) {
            messageObject.sessionId = sessionId;
        }
        if (test.dumpProtocol) {
            test.dumpProtocol('frontend: ' + JSON.stringify(messageObject));
        }
        if (test.onMessageSent) {
            const paramsObject = JSON.parse(JSON.stringify(params || {}));
            test.onMessageSent({ domain, method, params: paramsObject, id: messageId, sessionId }, this._getTargetBySessionId(sessionId));
        }
        ++this._pendingResponsesCount;
        if (LongPollingMethods.has(method)) {
            this._pendingLongPollingMessageIds.add(messageId);
        }
        const session = this._sessions.get(sessionId);
        if (!session) {
            return;
        }
        session.callbacks.set(messageId, { callback, method });
        this._connection.sendRawMessage(JSON.stringify(messageObject));
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _sendRawMessageForTesting(method, params, callback) {
        const domain = method.split('.')[0];
        this.sendMessage('', domain, method, params, callback || (() => { }));
    }
    _onMessage(message) {
        if (test.dumpProtocol) {
            test.dumpProtocol('backend: ' + ((typeof message === 'string') ? message : JSON.stringify(message)));
        }
        if (test.onMessageReceived) {
            const messageObjectCopy = JSON.parse((typeof message === 'string') ? message : JSON.stringify(message));
            test.onMessageReceived(messageObjectCopy, this._getTargetBySessionId(messageObjectCopy.sessionId));
        }
        const messageObject = ((typeof message === 'string') ? JSON.parse(message) : message);
        // Send all messages to proxy connections.
        let suppressUnknownMessageErrors = false;
        for (const session of this._sessions.values()) {
            if (!session.proxyConnection) {
                continue;
            }
            if (!session.proxyConnection._onMessage) {
                InspectorBackend.reportProtocolError('Protocol Error: the session has a proxyConnection with no _onMessage', messageObject);
                continue;
            }
            session.proxyConnection._onMessage(messageObject);
            suppressUnknownMessageErrors = true;
        }
        const sessionId = messageObject.sessionId || '';
        const session = this._sessions.get(sessionId);
        if (!session) {
            if (!suppressUnknownMessageErrors) {
                InspectorBackend.reportProtocolError('Protocol Error: the message with wrong session id', messageObject);
            }
            return;
        }
        // If this message is directly for the target controlled by the proxy connection, don't handle it.
        if (session.proxyConnection) {
            return;
        }
        if (session.target._needsNodeJSPatching) {
            NodeURL.patch(messageObject);
        }
        if ('id' in messageObject) { // just a response for some request
            const callback = session.callbacks.get(messageObject.id);
            session.callbacks.delete(messageObject.id);
            if (!callback) {
                if (!suppressUnknownMessageErrors) {
                    InspectorBackend.reportProtocolError('Protocol Error: the message with wrong id', messageObject);
                }
                return;
            }
            callback.callback(messageObject.error, messageObject.result);
            --this._pendingResponsesCount;
            this._pendingLongPollingMessageIds.delete(messageObject.id);
            if (this._pendingScripts.length && !this._hasOutstandingNonLongPollingRequests()) {
                this._deprecatedRunAfterPendingDispatches();
            }
        }
        else {
            if (!('method' in messageObject)) {
                InspectorBackend.reportProtocolError('Protocol Error: the message without method', messageObject);
                return;
            }
            const method = messageObject.method.split('.');
            const domainName = method[0];
            if (!(domainName in session.target._dispatchers)) {
                InspectorBackend.reportProtocolError(`Protocol Error: the message ${messageObject.method} is for non-existing domain '${domainName}'`, messageObject);
                return;
            }
            session.target._dispatchers[domainName].dispatch(method[1], messageObject);
        }
    }
    _hasOutstandingNonLongPollingRequests() {
        return this._pendingResponsesCount - this._pendingLongPollingMessageIds.size > 0;
    }
    _deprecatedRunAfterPendingDispatches(script) {
        if (script) {
            this._pendingScripts.push(script);
        }
        // Execute all promises.
        setTimeout(() => {
            if (!this._hasOutstandingNonLongPollingRequests()) {
                this._executeAfterPendingDispatches();
            }
            else {
                this._deprecatedRunAfterPendingDispatches();
            }
        }, 0);
    }
    _executeAfterPendingDispatches() {
        if (!this._hasOutstandingNonLongPollingRequests()) {
            const scripts = this._pendingScripts;
            this._pendingScripts = [];
            for (let id = 0; id < scripts.length; ++id) {
                scripts[id]();
            }
        }
    }
    static dispatchConnectionError(callback, method) {
        const error = {
            message: `Connection is closed, can\'t dispatch pending call to ${method}`,
            code: _ConnectionClosedErrorCode,
            data: null,
        };
        setTimeout(() => callback(error, null), 0);
    }
    static dispatchUnregisterSessionError({ callback, method }) {
        const error = {
            message: `Session is unregistering, can\'t dispatch pending call to ${method}`,
            code: _ConnectionClosedErrorCode,
            data: null,
        };
        setTimeout(() => callback(error, null), 0);
    }
}
export class TargetBase {
    _needsNodeJSPatching;
    _sessionId;
    _router;
    _agents;
    _dispatchers;
    constructor(needsNodeJSPatching, parentTarget, sessionId, connection) {
        this._needsNodeJSPatching = needsNodeJSPatching;
        this._sessionId = sessionId;
        if ((!parentTarget && connection) || (!parentTarget && sessionId) || (connection && sessionId)) {
            throw new Error('Either connection or sessionId (but not both) must be supplied for a child target');
        }
        let router;
        if (sessionId && parentTarget && parentTarget._router) {
            router = parentTarget._router;
        }
        else if (connection) {
            router = new SessionRouter(connection);
        }
        else {
            router = new SessionRouter(_factory());
        }
        this._router = router;
        router.registerSession(this, this._sessionId);
        this._agents = {};
        for (const [domain, agentPrototype] of inspectorBackend._agentPrototypes) {
            this._agents[domain] = Object.create(agentPrototype);
            this._agents[domain]._target = this;
        }
        this._dispatchers = {};
        for (const [domain, dispatcherPrototype] of inspectorBackend._dispatcherPrototypes) {
            this._dispatchers[domain] = Object.create(dispatcherPrototype);
            this._dispatchers[domain]._dispatchers = [];
        }
    }
    registerDispatcher(domain, dispatcher) {
        if (!this._dispatchers[domain]) {
            return;
        }
        this._dispatchers[domain].addDomainDispatcher(dispatcher);
    }
    unregisterDispatcher(domain, dispatcher) {
        if (!this._dispatchers[domain]) {
            return;
        }
        this._dispatchers[domain].removeDomainDispatcher(dispatcher);
    }
    dispose(_reason) {
        if (!this._router) {
            return;
        }
        this._router.unregisterSession(this._sessionId);
        this._router = null;
    }
    isDisposed() {
        return !this._router;
    }
    markAsNodeJSForTest() {
        this._needsNodeJSPatching = true;
    }
    router() {
        return this._router;
    }
    // Agent accessors, keep alphabetically sorted.
    accessibilityAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    animationAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    applicationCacheAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    auditsAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    backgroundServiceAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    cacheStorageAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    cssAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    databaseAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    debuggerAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    deviceOrientationAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    domAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    domdebuggerAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    domsnapshotAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    domstorageAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    emulationAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    heapProfilerAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    indexedDBAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    inputAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    ioAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    inspectorAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    layerTreeAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    logAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    mediaAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    memoryAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    networkAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    overlayAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    pageAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    profilerAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    performanceAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    runtimeAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    securityAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    serviceWorkerAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    storageAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    targetAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    tracingAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    webAudioAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    webAuthnAgent() {
        throw new Error('Implemented in InspectorBackend.js');
    }
    // Dispatcher registration, keep alphabetically sorted.
    registerAnimationDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerApplicationCacheDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerAuditsDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerCSSDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerDatabaseDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerBackgroundServiceDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerDebuggerDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    unregisterDebuggerDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerDOMDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerDOMStorageDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerHeapProfilerDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerInspectorDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerLayerTreeDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerLogDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerMediaDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerNetworkDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerOverlayDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerPageDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerProfilerDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerRuntimeDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerSecurityDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerServiceWorkerDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerStorageDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerTargetDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerTracingDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
    registerWebAudioDispatcher(_dispatcher) {
        throw new Error('Implemented in InspectorBackend.js');
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
class _AgentPrototype {
    _replyArgs;
    _domain;
    _target;
    constructor(domain) {
        this._replyArgs = {};
        this._domain = domain;
    }
    registerCommand(methodName, signature, replyArgs) {
        const domainAndMethod = this._domain + '.' + methodName;
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function sendMessagePromise(_vararg) {
            const params = Array.prototype.slice.call(arguments);
            return _AgentPrototype.prototype._sendMessageToBackendPromise.call(this, domainAndMethod, signature, params);
        }
        // @ts-ignore Method code generation
        this[methodName] = sendMessagePromise;
        function invoke(request = {}) {
            return this._invoke(domainAndMethod, request);
        }
        // @ts-ignore Method code generation
        this['invoke_' + methodName] = invoke;
        this._replyArgs[domainAndMethod] = replyArgs;
    }
    _prepareParameters(method, signature, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args, errorCallback) {
        const params = {};
        let hasParams = false;
        for (const param of signature) {
            const paramName = param['name'];
            const typeName = param['type'];
            const optionalFlag = param['optional'];
            if (!args.length && !optionalFlag) {
                errorCallback(`Protocol Error: Invalid number of arguments for method '${method}' call. ` +
                    `It must have the following arguments ${JSON.stringify(signature)}'.`);
                return null;
            }
            const value = args.shift();
            if (optionalFlag && typeof value === 'undefined') {
                continue;
            }
            if (typeof value !== typeName) {
                errorCallback(`Protocol Error: Invalid type of argument '${paramName}' for method '${method}' call. ` +
                    `It must be '${typeName}' but it is '${typeof value}'.`);
                return null;
            }
            params[paramName] = value;
            hasParams = true;
        }
        if (args.length) {
            errorCallback(`Protocol Error: Extra ${args.length} arguments in a call to method '${method}'.`);
            return null;
        }
        return hasParams ? params : null;
    }
    _sendMessageToBackendPromise(method, signature, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args) {
        let errorMessage;
        function onError(message) {
            console.error(message);
            errorMessage = message;
        }
        const params = this._prepareParameters(method, signature, args, onError);
        if (errorMessage) {
            return Promise.resolve(null);
        }
        return new Promise(resolve => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const callback = (error, result) => {
                if (error) {
                    if (!test.suppressRequestErrors && error.code !== DevToolsStubErrorCode && error.code !== _GenericError &&
                        error.code !== _ConnectionClosedErrorCode) {
                        console.error('Request ' + method + ' failed. ' + JSON.stringify(error));
                    }
                    resolve(null);
                    return;
                }
                const args = this._replyArgs[method];
                resolve(result && args.length ? result[args[0]] : undefined);
            };
            if (!this._target._router) {
                SessionRouter.dispatchConnectionError(callback, method);
            }
            else {
                this._target._router.sendMessage(this._target._sessionId, this._domain, method, params, callback);
            }
        });
    }
    _invoke(method, request) {
        return new Promise(fulfill => {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const callback = (error, result) => {
                if (error && !test.suppressRequestErrors && error.code !== DevToolsStubErrorCode &&
                    error.code !== _GenericError && error.code !== _ConnectionClosedErrorCode) {
                    console.error('Request ' + method + ' failed. ' + JSON.stringify(error));
                }
                if (!result) {
                    result = {};
                }
                if (error) {
                    // TODO(crbug.com/1011811): Remove Old lookup of ProtocolError
                    result[ProtocolError] = error.message;
                    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    result.getError = () => {
                        return error.message;
                    };
                }
                else {
                    result.getError = () => {
                        return undefined;
                    };
                }
                fulfill(result);
            };
            if (!this._target._router) {
                SessionRouter.dispatchConnectionError(callback, method);
            }
            else {
                this._target._router.sendMessage(this._target._sessionId, this._domain, method, request, callback);
            }
        });
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
class _DispatcherPrototype {
    _eventArgs;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _dispatchers;
    constructor() {
        this._eventArgs = {};
    }
    registerEvent(eventName, params) {
        this._eventArgs[eventName] = params;
    }
    addDomainDispatcher(dispatcher) {
        this._dispatchers.push(dispatcher);
    }
    removeDomainDispatcher(dispatcher) {
        const index = this._dispatchers.indexOf(dispatcher);
        if (index === -1) {
            return;
        }
        this._dispatchers.splice(index, 1);
    }
    dispatch(functionName, messageObject) {
        if (!this._dispatchers.length) {
            return;
        }
        if (!this._eventArgs[messageObject.method]) {
            InspectorBackend.reportProtocolWarning(`Protocol Warning: Attempted to dispatch an unspecified method '${messageObject.method}'`, messageObject);
            return;
        }
        const messageArgument = { ...messageObject.params };
        for (let index = 0; index < this._dispatchers.length; ++index) {
            const dispatcher = this._dispatchers[index];
            if (functionName in dispatcher) {
                dispatcher[functionName].call(dispatcher, messageArgument);
            }
        }
    }
}
export const inspectorBackend = new InspectorBackend();
//# sourceMappingURL=InspectorBackend.js.map