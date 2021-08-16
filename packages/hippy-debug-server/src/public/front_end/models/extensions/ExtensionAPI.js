/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
// @ts-nocheck
// TODO(crbug.com/1011811): Enable TypeScript compiler checks
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention */
export function defineCommonExtensionSymbols(apiPrivate) {
    if (!apiPrivate.panels) {
        apiPrivate.panels = {};
    }
    apiPrivate.panels.SearchAction = {
        CancelSearch: 'cancelSearch',
        PerformSearch: 'performSearch',
        NextSearchResult: 'nextSearchResult',
        PreviousSearchResult: 'previousSearchResult',
    };
    /** @enum {string} */
    apiPrivate.Events = {
        ButtonClicked: 'button-clicked-',
        PanelObjectSelected: 'panel-objectSelected-',
        NetworkRequestFinished: 'network-request-finished',
        OpenResource: 'open-resource',
        PanelSearch: 'panel-search-',
        RecordingStarted: 'trace-recording-started-',
        RecordingStopped: 'trace-recording-stopped-',
        ResourceAdded: 'resource-added',
        ResourceContentCommitted: 'resource-content-committed',
        ViewShown: 'view-shown-',
        ViewHidden: 'view-hidden-',
    };
    /** @enum {string} */
    apiPrivate.Commands = {
        AddRequestHeaders: 'addRequestHeaders',
        AddTraceProvider: 'addTraceProvider',
        ApplyStyleSheet: 'applyStyleSheet',
        CompleteTraceSession: 'completeTraceSession',
        CreatePanel: 'createPanel',
        CreateSidebarPane: 'createSidebarPane',
        CreateToolbarButton: 'createToolbarButton',
        EvaluateOnInspectedPage: 'evaluateOnInspectedPage',
        ForwardKeyboardEvent: '_forwardKeyboardEvent',
        GetHAR: 'getHAR',
        GetPageResources: 'getPageResources',
        GetRequestContent: 'getRequestContent',
        GetResourceContent: 'getResourceContent',
        InspectedURLChanged: 'inspectedURLChanged',
        OpenResource: 'openResource',
        Reload: 'Reload',
        Subscribe: 'subscribe',
        SetOpenResourceHandler: 'setOpenResourceHandler',
        SetResourceContent: 'setResourceContent',
        SetSidebarContent: 'setSidebarContent',
        SetSidebarHeight: 'setSidebarHeight',
        SetSidebarPage: 'setSidebarPage',
        ShowPanel: 'showPanel',
        Unsubscribe: 'unsubscribe',
        UpdateButton: 'updateButton',
        RegisterLanguageExtensionPlugin: 'registerLanguageExtensionPlugin',
    };
    /** @enum {string} */
    apiPrivate.LanguageExtensionPluginCommands = {
        AddRawModule: 'addRawModule',
        RemoveRawModule: 'removeRawModule',
        SourceLocationToRawLocation: 'sourceLocationToRawLocation',
        RawLocationToSourceLocation: 'rawLocationToSourceLocation',
        GetScopeInfo: 'getScopeInfo',
        ListVariablesInScope: 'listVariablesInScope',
        GetTypeInfo: 'getTypeInfo',
        GetFormatter: 'getFormatter',
        GetInspectableAddress: 'getInspectableAddress',
        GetFunctionInfo: 'getFunctionInfo',
        GetInlinedFunctionRanges: 'getInlinedFunctionRanges',
        GetInlinedCalleesRanges: 'getInlinedCalleesRanges',
        GetMappedLines: 'getMappedLines',
    };
    /** @enum {string} */
    apiPrivate.LanguageExtensionPluginEvents = {
        UnregisteredLanguageExtensionPlugin: 'unregisteredLanguageExtensionPlugin',
    };
}
self.injectedExtensionAPI = function (extensionInfo, inspectedTabId, themeName, keysToForward, testHook, injectedScriptId) {
    const keysToForwardSet = new Set(keysToForward);
    const chrome = window.chrome || {};
    const devtools_descriptor = Object.getOwnPropertyDescriptor(chrome, 'devtools');
    if (devtools_descriptor) {
        return;
    }
    const apiPrivate = {};
    defineCommonExtensionSymbols(apiPrivate);
    const commands = apiPrivate.Commands;
    const languageExtensionPluginCommands = apiPrivate.LanguageExtensionPluginCommands;
    const languageExtensionPluginEvents = apiPrivate.LanguageExtensionPluginEvents;
    const events = apiPrivate.Events;
    let userAction = false;
    // Here and below, all constructors are private to API implementation.
    // For a public type Foo, if internal fields are present, these are on
    // a private FooImpl type, an instance of FooImpl is used in a closure
    // by Foo consutrctor to re-bind publicly exported members to an instance
    // of Foo.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
    function EventSinkImpl(type, customDispatch) {
        this._type = type;
        this._listeners = [];
        this._customDispatch = customDispatch;
    }
    EventSinkImpl.prototype = {
        addListener: function (callback) {
            if (typeof callback !== 'function') {
                throw 'addListener: callback is not a function';
            }
            if (this._listeners.length === 0) {
                extensionServer.sendRequest({ command: commands.Subscribe, type: this._type });
            }
            this._listeners.push(callback);
            extensionServer.registerHandler('notify-' + this._type, this._dispatch.bind(this));
        },
        removeListener: function (callback) {
            const listeners = this._listeners;
            for (let i = 0; i < listeners.length; ++i) {
                if (listeners[i] === callback) {
                    listeners.splice(i, 1);
                    break;
                }
            }
            if (this._listeners.length === 0) {
                extensionServer.sendRequest({ command: commands.Unsubscribe, type: this._type });
            }
        },
        _fire: function _(_vararg) {
            const listeners = this._listeners.slice();
            for (let i = 0; i < listeners.length; ++i) {
                listeners[i].apply(null, arguments);
            }
        },
        _dispatch: function (request) {
            if (this._customDispatch) {
                this._customDispatch.call(this, request);
            }
            else {
                this._fire.apply(this, request.arguments);
            }
        },
    };
    /**
     * @constructor
     */
    function InspectorExtensionAPI() {
        this.inspectedWindow = new InspectedWindow();
        this.panels = new Panels();
        this.network = new Network();
        this.timeline = new Timeline();
        this.languageServices = new LanguageServicesAPI();
        defineDeprecatedProperty(this, 'webInspector', 'resources', 'network');
    }
    /**
     * @constructor
     */
    function Network() {
        function dispatchRequestEvent(message) {
            const request = message.arguments[1];
            request.__proto__ = new Request(message.arguments[0]);
            this._fire(request);
        }
        this.onRequestFinished = new EventSink(events.NetworkRequestFinished, dispatchRequestEvent);
        defineDeprecatedProperty(this, 'network', 'onFinished', 'onRequestFinished');
        this.onNavigated = new EventSink(events.InspectedURLChanged);
    }
    Network.prototype = {
        getHAR: function (callback) {
            function callbackWrapper(result) {
                const entries = (result && result.entries) || [];
                for (let i = 0; i < entries.length; ++i) {
                    entries[i].__proto__ = new Request(entries[i]._requestId);
                    delete entries[i]._requestId;
                }
                callback(result);
            }
            extensionServer.sendRequest({ command: commands.GetHAR }, callback && callbackWrapper);
        },
        addRequestHeaders: function (headers) {
            extensionServer.sendRequest({ command: commands.AddRequestHeaders, headers: headers, extensionId: window.location.hostname });
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
    function RequestImpl(id) {
        this._id = id;
    }
    RequestImpl.prototype = {
        getContent: function (callback) {
            function callbackWrapper(response) {
                callback(response.content, response.encoding);
            }
            extensionServer.sendRequest({ command: commands.GetRequestContent, id: this._id }, callback && callbackWrapper);
        },
    };
    /**
     * @constructor
     */
    function Panels() {
        const panels = {
            elements: new ElementsPanel(),
            sources: new SourcesPanel(),
        };
        function panelGetter(name) {
            return panels[name];
        }
        for (const panel in panels) {
            Object.defineProperty(this, panel, { get: panelGetter.bind(null, panel), enumerable: true });
        }
        this.applyStyleSheet = function (styleSheet) {
            extensionServer.sendRequest({ command: commands.ApplyStyleSheet, styleSheet: styleSheet });
        };
    }
    Panels.prototype = {
        create: function (title, icon, page, callback) {
            const id = 'extension-panel-' + extensionServer.nextObjectId();
            const request = { command: commands.CreatePanel, id: id, title: title, icon: icon, page: page };
            extensionServer.sendRequest(request, callback && callback.bind(this, new ExtensionPanel(id)));
        },
        setOpenResourceHandler: function (callback) {
            const hadHandler = extensionServer.hasHandler(events.OpenResource);
            function callbackWrapper(message) {
                // Allow the panel to show itself when handling the event.
                userAction = true;
                try {
                    callback.call(null, new Resource(message.resource), message.lineNumber);
                }
                finally {
                    userAction = false;
                }
            }
            if (!callback) {
                extensionServer.unregisterHandler(events.OpenResource);
            }
            else {
                extensionServer.registerHandler(events.OpenResource, callbackWrapper);
            }
            // Only send command if we either removed an existing handler or added handler and had none before.
            if (hadHandler === !callback) {
                extensionServer.sendRequest({ command: commands.SetOpenResourceHandler, 'handlerPresent': Boolean(callback) });
            }
        },
        openResource: function (url, lineNumber, callback) {
            extensionServer.sendRequest({ command: commands.OpenResource, 'url': url, 'lineNumber': lineNumber }, callback);
        },
        get SearchAction() {
            return apiPrivate.panels.SearchAction;
        },
    };
    /**
     * @constructor
     */
    function ExtensionViewImpl(id) {
        this._id = id;
        function dispatchShowEvent(message) {
            const frameIndex = message.arguments[0];
            if (typeof frameIndex === 'number') {
                this._fire(window.parent.frames[frameIndex]);
            }
            else {
                this._fire();
            }
        }
        if (id) {
            this.onShown = new EventSink(events.ViewShown + id, dispatchShowEvent);
            this.onHidden = new EventSink(events.ViewHidden + id);
        }
    }
    /**
     * @constructor
     * @extends {ExtensionViewImpl}
     */
    function PanelWithSidebarImpl(hostPanelName) {
        ExtensionViewImpl.call(this, null);
        this._hostPanelName = hostPanelName;
        this.onSelectionChanged = new EventSink(events.PanelObjectSelected + hostPanelName);
    }
    PanelWithSidebarImpl.prototype = {
        createSidebarPane: function (title, callback) {
            const id = 'extension-sidebar-' + extensionServer.nextObjectId();
            const request = { command: commands.CreateSidebarPane, panel: this._hostPanelName, id: id, title: title };
            function callbackWrapper() {
                callback(new ExtensionSidebarPane(id));
            }
            extensionServer.sendRequest(request, callback && callbackWrapper);
        },
        __proto__: ExtensionViewImpl.prototype,
    };
    /**
     * @constructor
     */
    function LanguageServicesAPIImpl() {
        /** @type {!Map<*, !MessagePort>} */
        this._plugins = new Map();
    }
    LanguageServicesAPIImpl.prototype = {
        registerLanguageExtensionPlugin: async function (plugin, pluginName, supportedScriptTypes) {
            if (this._plugins.has(plugin)) {
                throw new Error(`Tried to register plugin '${pluginName}' twice`);
            }
            const channel = new MessageChannel();
            const port = channel.port1;
            this._plugins.set(plugin, port);
            port.onmessage = ({ data: { requestId, method, parameters } }) => {
                console.time(`${requestId}: ${method}`);
                dispatchMethodCall(method, parameters)
                    .then(result => port.postMessage({ requestId, result }))
                    .catch(error => port.postMessage({ requestId, error: { message: error.message } }))
                    .finally(() => console.timeEnd(`${requestId}: ${method}`));
            };
            function dispatchMethodCall(method, parameters) {
                switch (method) {
                    case languageExtensionPluginCommands.AddRawModule:
                        return plugin.addRawModule(parameters.rawModuleId, parameters.symbolsURL, parameters.rawModule);
                    case languageExtensionPluginCommands.RemoveRawModule:
                        return plugin.removeRawModule(parameters.rawModuleId);
                    case languageExtensionPluginCommands.SourceLocationToRawLocation:
                        return plugin.sourceLocationToRawLocation(parameters.sourceLocation);
                    case languageExtensionPluginCommands.RawLocationToSourceLocation:
                        return plugin.rawLocationToSourceLocation(parameters.rawLocation);
                    case languageExtensionPluginCommands.GetScopeInfo:
                        return plugin.getScopeInfo(parameters.type);
                    case languageExtensionPluginCommands.ListVariablesInScope:
                        return plugin.listVariablesInScope(parameters.rawLocation);
                    case languageExtensionPluginCommands.GetTypeInfo:
                        return plugin.getTypeInfo(parameters.expression, parameters.context);
                    case languageExtensionPluginCommands.GetFormatter:
                        return plugin.getFormatter(parameters.expressionOrField, parameters.context);
                    case languageExtensionPluginCommands.GetInspectableAddress:
                        if ('getInspectableAddress' in plugin) {
                            return plugin.getInspectableAddress(parameters.field);
                        }
                        return Promise.resolve({ js: '' });
                    case languageExtensionPluginCommands.GetFunctionInfo:
                        return plugin.getFunctionInfo(parameters.rawLocation);
                    case languageExtensionPluginCommands.GetInlinedFunctionRanges:
                        return plugin.getInlinedFunctionRanges(parameters.rawLocation);
                    case languageExtensionPluginCommands.GetInlinedCalleesRanges:
                        return plugin.getInlinedCalleesRanges(parameters.rawLocation);
                    case languageExtensionPluginCommands.GetMappedLines:
                        if ('getMappedLines' in plugin) {
                            return plugin.getMappedLines(parameters.rawModuleId, parameters.sourceFileURL);
                        }
                        return Promise.resolve(undefined);
                }
                throw new Error(`Unknown language plugin method ${method}`);
            }
            await new Promise(resolve => {
                extensionServer.sendRequest({ command: commands.RegisterLanguageExtensionPlugin, pluginName, port: channel.port2, supportedScriptTypes }, () => resolve(), [channel.port2]);
            });
        },
        unregisterLanguageExtensionPlugin: async function (plugin) {
            const port = this._plugins.get(plugin);
            if (!port) {
                throw new Error('Tried to unregister a plugin that was not previously registered');
            }
            this._plugins.delete(plugin);
            port.postMessage({ event: languageExtensionPluginEvents.UnregisteredLanguageExtensionPlugin });
            port.close();
        },
    };
    function declareInterfaceClass(implConstructor) {
        return function () {
            const impl = { __proto__: implConstructor.prototype };
            implConstructor.apply(impl, arguments);
            populateInterfaceClass(this, impl);
        };
    }
    function defineDeprecatedProperty(object, className, oldName, newName) {
        let warningGiven = false;
        function getter() {
            if (!warningGiven) {
                console.warn(className + '.' + oldName + ' is deprecated. Use ' + className + '.' + newName + ' instead');
                warningGiven = true;
            }
            return object[newName];
        }
        object.__defineGetter__(oldName, getter);
    }
    function extractCallbackArgument(args) {
        const lastArgument = args[args.length - 1];
        return typeof lastArgument === 'function' ? lastArgument : undefined;
    }
    const LanguageServicesAPI = declareInterfaceClass(LanguageServicesAPIImpl);
    const Button = declareInterfaceClass(ButtonImpl);
    const EventSink = declareInterfaceClass(EventSinkImpl);
    const ExtensionPanel = declareInterfaceClass(ExtensionPanelImpl);
    const ExtensionSidebarPane = declareInterfaceClass(ExtensionSidebarPaneImpl);
    /**
     * @constructor
     * @param {string} hostPanelName
     */
    const PanelWithSidebarClass = declareInterfaceClass(PanelWithSidebarImpl);
    const Request = declareInterfaceClass(RequestImpl);
    const Resource = declareInterfaceClass(ResourceImpl);
    const TraceSession = declareInterfaceClass(TraceSessionImpl);
    class ElementsPanel extends PanelWithSidebarClass {
        constructor() {
            super('elements');
        }
    }
    class SourcesPanel extends PanelWithSidebarClass {
        constructor() {
            super('sources');
        }
    }
    /**
     * @constructor
     * @extends {ExtensionViewImpl}
     */
    function ExtensionPanelImpl(id) {
        ExtensionViewImpl.call(this, id);
        this.onSearch = new EventSink(events.PanelSearch + id);
    }
    ExtensionPanelImpl.prototype = {
        createStatusBarButton: function (iconPath, tooltipText, disabled) {
            const id = 'button-' + extensionServer.nextObjectId();
            const request = {
                command: commands.CreateToolbarButton,
                panel: this._id,
                id: id,
                icon: iconPath,
                tooltip: tooltipText,
                disabled: Boolean(disabled),
            };
            extensionServer.sendRequest(request);
            return new Button(id);
        },
        show: function () {
            if (!userAction) {
                return;
            }
            const request = { command: commands.ShowPanel, id: this._id };
            extensionServer.sendRequest(request);
        },
        __proto__: ExtensionViewImpl.prototype,
    };
    /**
     * @constructor
     * @extends {ExtensionViewImpl}
     */
    function ExtensionSidebarPaneImpl(id) {
        ExtensionViewImpl.call(this, id);
    }
    ExtensionSidebarPaneImpl.prototype = {
        setHeight: function (height) {
            extensionServer.sendRequest({ command: commands.SetSidebarHeight, id: this._id, height: height });
        },
        setExpression: function (expression, rootTitle, evaluateOptions) {
            const request = {
                command: commands.SetSidebarContent,
                id: this._id,
                expression: expression,
                rootTitle: rootTitle,
                evaluateOnPage: true,
            };
            if (typeof evaluateOptions === 'object') {
                request.evaluateOptions = evaluateOptions;
            }
            extensionServer.sendRequest(request, extractCallbackArgument(arguments));
        },
        setObject: function (jsonObject, rootTitle, callback) {
            extensionServer.sendRequest({ command: commands.SetSidebarContent, id: this._id, expression: jsonObject, rootTitle: rootTitle }, callback);
        },
        setPage: function (page) {
            extensionServer.sendRequest({ command: commands.SetSidebarPage, id: this._id, page: page });
        },
        __proto__: ExtensionViewImpl.prototype,
    };
    /**
     * @constructor
     */
    function ButtonImpl(id) {
        this._id = id;
        this.onClicked = new EventSink(events.ButtonClicked + id);
    }
    ButtonImpl.prototype = {
        update: function (iconPath, tooltipText, disabled) {
            const request = {
                command: commands.UpdateButton,
                id: this._id,
                icon: iconPath,
                tooltip: tooltipText,
                disabled: Boolean(disabled),
            };
            extensionServer.sendRequest(request);
        },
    };
    /**
     * @constructor
     */
    function Timeline() {
    }
    Timeline.prototype = {
        addTraceProvider: function (categoryName, categoryTooltip) {
            const id = 'extension-trace-provider-' + extensionServer.nextObjectId();
            extensionServer.sendRequest({ command: commands.AddTraceProvider, id: id, categoryName: categoryName, categoryTooltip: categoryTooltip });
            return new TraceProvider(id);
        },
    };
    /**
     * @constructor
     */
    function TraceSessionImpl(id) {
        this._id = id;
    }
    TraceSessionImpl.prototype = {
        complete: function (url, timeOffset) {
            const request = { command: commands.CompleteTraceSession, id: this._id, url: url || '', timeOffset: timeOffset || 0 };
            extensionServer.sendRequest(request);
        },
    };
    /**
     * @constructor
     */
    function TraceProvider(id) {
        function dispatchRecordingStarted(message) {
            const sessionId = message.arguments[0];
            this._fire(new TraceSession(sessionId));
        }
        this.onRecordingStarted = new EventSink(events.RecordingStarted + id, dispatchRecordingStarted);
        this.onRecordingStopped = new EventSink(events.RecordingStopped + id);
    }
    /**
     * @constructor
     */
    function InspectedWindow() {
        function dispatchResourceEvent(message) {
            this._fire(new Resource(message.arguments[0]));
        }
        function dispatchResourceContentEvent(message) {
            this._fire(new Resource(message.arguments[0]), message.arguments[1]);
        }
        this.onResourceAdded = new EventSink(events.ResourceAdded, dispatchResourceEvent);
        this.onResourceContentCommitted = new EventSink(events.ResourceContentCommitted, dispatchResourceContentEvent);
    }
    InspectedWindow.prototype = {
        reload: function (optionsOrUserAgent) {
            let options = null;
            if (typeof optionsOrUserAgent === 'object') {
                options = optionsOrUserAgent;
            }
            else if (typeof optionsOrUserAgent === 'string') {
                options = { userAgent: optionsOrUserAgent };
                console.warn('Passing userAgent as string parameter to inspectedWindow.reload() is deprecated. ' +
                    'Use inspectedWindow.reload({ userAgent: value}) instead.');
            }
            extensionServer.sendRequest({ command: commands.Reload, options: options });
        },
        eval: function (expression, evaluateOptions) {
            const callback = extractCallbackArgument(arguments);
            function callbackWrapper(result) {
                if (result.isError || result.isException) {
                    callback(undefined, result);
                }
                else {
                    callback(result.value);
                }
            }
            const request = { command: commands.EvaluateOnInspectedPage, expression: expression };
            if (typeof evaluateOptions === 'object') {
                request.evaluateOptions = evaluateOptions;
            }
            extensionServer.sendRequest(request, callback && callbackWrapper);
            return null;
        },
        getResources: function (callback) {
            function wrapResource(resourceData) {
                return new Resource(resourceData);
            }
            function callbackWrapper(resources) {
                callback(resources.map(wrapResource));
            }
            extensionServer.sendRequest({ command: commands.GetPageResources }, callback && callbackWrapper);
        },
    };
    /**
     * @constructor
     */
    function ResourceImpl(resourceData) {
        this._url = resourceData.url;
        this._type = resourceData.type;
    }
    ResourceImpl.prototype = {
        get url() {
            return this._url;
        },
        get type() {
            return this._type;
        },
        getContent: function (callback) {
            function callbackWrapper(response) {
                callback(response.content, response.encoding);
            }
            extensionServer.sendRequest({ command: commands.GetResourceContent, url: this._url }, callback && callbackWrapper);
        },
        setContent: function (content, commit, callback) {
            extensionServer.sendRequest({ command: commands.SetResourceContent, url: this._url, content: content, commit: commit }, callback);
        },
    };
    function getTabId() {
        return inspectedTabId;
    }
    let keyboardEventRequestQueue = [];
    let forwardTimer = null;
    function forwardKeyboardEvent(event) {
        // Check if the event should be forwarded.
        // This is a workaround for crbug.com/923338.
        const focused = document.activeElement;
        if (focused) {
            const isInput = focused.nodeName === 'INPUT' || focused.nodeName === 'TEXTAREA';
            if (isInput && !(event.ctrlKey || event.altKey || event.metaKey)) {
                return;
            }
        }
        let modifiers = 0;
        if (event.shiftKey) {
            modifiers |= 1;
        }
        if (event.ctrlKey) {
            modifiers |= 2;
        }
        if (event.altKey) {
            modifiers |= 4;
        }
        if (event.metaKey) {
            modifiers |= 8;
        }
        const num = (event.keyCode & 255) | (modifiers << 8);
        // We only care about global hotkeys, not about random text
        if (!keysToForwardSet.has(num)) {
            return;
        }
        event.preventDefault();
        const requestPayload = {
            eventType: event.type,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            keyIdentifier: event.keyIdentifier,
            key: event.key,
            code: event.code,
            location: event.location,
            keyCode: event.keyCode,
        };
        keyboardEventRequestQueue.push(requestPayload);
        if (!forwardTimer) {
            forwardTimer = setTimeout(forwardEventQueue, 0);
        }
    }
    function forwardEventQueue() {
        forwardTimer = null;
        const request = { command: commands.ForwardKeyboardEvent, entries: keyboardEventRequestQueue };
        extensionServer.sendRequest(request);
        keyboardEventRequestQueue = [];
    }
    document.addEventListener('keydown', forwardKeyboardEvent, false);
    /**
     * @constructor
     */
    function ExtensionServerClient() {
        this._callbacks = {};
        this._handlers = {};
        this._lastRequestId = 0;
        this._lastObjectId = 0;
        this.registerHandler('callback', this._onCallback.bind(this));
        const channel = new MessageChannel();
        this._port = channel.port1;
        this._port.addEventListener('message', this._onMessage.bind(this), false);
        this._port.start();
        window.parent.postMessage('registerExtension', '*', [channel.port2]);
    }
    ExtensionServerClient.prototype = {
        sendRequest: function (message, callback, transfers) {
            if (typeof callback === 'function') {
                message.requestId = this._registerCallback(callback);
            }
            this._port.postMessage(message, transfers);
        },
        hasHandler: function (command) {
            return Boolean(this._handlers[command]);
        },
        registerHandler: function (command, handler) {
            this._handlers[command] = handler;
        },
        unregisterHandler: function (command) {
            delete this._handlers[command];
        },
        nextObjectId: function () {
            return injectedScriptId.toString() + '_' + ++this._lastObjectId;
        },
        _registerCallback: function (callback) {
            const id = ++this._lastRequestId;
            this._callbacks[id] = callback;
            return id;
        },
        _onCallback: function (request) {
            if (request.requestId in this._callbacks) {
                const callback = this._callbacks[request.requestId];
                delete this._callbacks[request.requestId];
                callback(request.result);
            }
        },
        _onMessage: function (event) {
            const request = event.data;
            const handler = this._handlers[request.command];
            if (handler) {
                handler.call(this, request);
            }
        },
    };
    function populateInterfaceClass(interfaze, implementation) {
        for (const member in implementation) {
            if (member.charAt(0) === '_') {
                continue;
            }
            let descriptor = null;
            // Traverse prototype chain until we find the owner.
            for (let owner = implementation; owner && !descriptor; owner = owner.__proto__) {
                descriptor = Object.getOwnPropertyDescriptor(owner, member);
            }
            if (!descriptor) {
                continue;
            }
            if (typeof descriptor.value === 'function') {
                interfaze[member] = descriptor.value.bind(implementation);
            }
            else if (typeof descriptor.get === 'function') {
                interfaze.__defineGetter__(member, descriptor.get.bind(implementation));
            }
            else {
                Object.defineProperty(interfaze, member, descriptor);
            }
        }
    }
    const extensionServer = new ExtensionServerClient();
    const coreAPI = new InspectorExtensionAPI();
    Object.defineProperty(chrome, 'devtools', { value: {}, enumerable: true });
    // Only expose tabId on chrome.devtools.inspectedWindow, not webInspector.inspectedWindow.
    chrome.devtools.inspectedWindow = {};
    Object.defineProperty(chrome.devtools.inspectedWindow, 'tabId', { get: getTabId });
    chrome.devtools.inspectedWindow.__proto__ = coreAPI.inspectedWindow;
    chrome.devtools.network = coreAPI.network;
    chrome.devtools.panels = coreAPI.panels;
    chrome.devtools.panels.themeName = themeName;
    chrome.devtools.languageServices = new LanguageServicesAPI();
    // default to expose experimental APIs for now.
    if (extensionInfo.exposeExperimentalAPIs !== false) {
        chrome.experimental = chrome.experimental || {};
        chrome.experimental.devtools = chrome.experimental.devtools || {};
        const properties = Object.getOwnPropertyNames(coreAPI);
        for (let i = 0; i < properties.length; ++i) {
            const descriptor = Object.getOwnPropertyDescriptor(coreAPI, properties[i]);
            if (descriptor) {
                Object.defineProperty(chrome.experimental.devtools, properties[i], descriptor);
            }
        }
        chrome.experimental.devtools.inspectedWindow = chrome.devtools.inspectedWindow;
    }
    if (extensionInfo.exposeWebInspectorNamespace) {
        window.webInspector = coreAPI;
    }
    testHook(extensionServer, coreAPI);
};
self.buildExtensionAPIInjectedScript = function (extensionInfo, inspectedTabId, themeName, keysToForward, testHook) {
    const argumentsJSON = [extensionInfo, inspectedTabId || null, themeName, keysToForward].map(_ => JSON.stringify(_)).join(',');
    if (!testHook) {
        testHook = () => { };
    }
    return '(function(injectedScriptId){ ' + defineCommonExtensionSymbols.toString() + ';' +
        '(' + self.injectedExtensionAPI.toString() + ')(' + argumentsJSON + ',' + testHook + ', injectedScriptId);' +
        '})';
};
//# sourceMappingURL=ExtensionAPI.js.map