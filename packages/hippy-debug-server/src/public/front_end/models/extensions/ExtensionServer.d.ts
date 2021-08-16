import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as HAR from '../har/har.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import { ExtensionSidebarPane } from './ExtensionPanel.js';
import type { TracingSession } from './ExtensionTraceProvider.js';
import { ExtensionTraceProvider } from './ExtensionTraceProvider.js';
export declare class ExtensionServer extends Common.ObjectWrapper.ObjectWrapper {
    _clientObjects: {};
    _handlers: {};
    _subscribers: Map<string, Set<MessagePort>>;
    _subscriptionStartHandlers: {};
    _subscriptionStopHandlers: {};
    _extraHeaders: Map<string, Map<string, any>>;
    _requests: {};
    _lastRequestId: number;
    _registeredExtensions: Map<string, {
        name: string;
    }>;
    _status: ExtensionStatus;
    _sidebarPanes: ExtensionSidebarPane[];
    _traceProviders: ExtensionTraceProvider[];
    _traceSessions: Map<string, TracingSession>;
    _extensionsEnabled: boolean;
    _languageExtensionRequests: Map<any, any>;
    _inspectedTabId?: string;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ExtensionServer;
    initializeExtensions(): void;
    hasExtensions(): boolean;
    notifySearchAction(panelId: string, action: string, searchString?: string): void;
    notifyViewShown(identifier: string, frameIndex?: number): void;
    notifyViewHidden(identifier: string): void;
    notifyButtonClicked(identifier: string): void;
    _registerLanguageExtensionEndpoint(message: any, _shared_port: any): Record;
    _inspectedURLChanged(event: any): void;
    startTraceRecording(providerId: string, sessionId: string, session: TracingSession): void;
    stopTraceRecording(providerId: string): void;
    hasSubscribers(type: string): boolean;
    _postNotification(type: string, _vararg: any): void;
    _onSubscribe(message: any, port: any): void;
    _onUnsubscribe(message: any, port: any): void;
    _onAddRequestHeaders(message: any): Record | undefined;
    _onApplyStyleSheet(message: any): void;
    _onCreatePanel(message: any, port: any): Record;
    _onShowPanel(message: any): void;
    _onCreateToolbarButton(message: any, port: any): Record;
    _onUpdateButton(message: any, port: any): Record;
    _onCompleteTraceSession(message: Object): Record | undefined;
    _onCreateSidebarPane(message: any): Record;
    sidebarPanes(): ExtensionSidebarPane[];
    _onSetSidebarHeight(message: any): Record;
    _onSetSidebarContent(message: any, port: any): any;
    _onSetSidebarPage(message: any, port: any): Record | undefined;
    _onOpenResource(message: any): Record;
    _onSetOpenResourceHandler(message: any, port: any): void;
    _handleOpenURL(port: any, contentProvider: any, lineNumber: any): void;
    _onReload(message: any): Record;
    _onEvaluateOnInspectedPage(message: any, port: any): Record | undefined;
    _onGetHAR(): Promise<HAR.Log.LogDTO>;
    _makeResource(contentProvider: TextUtils.ContentProvider.ContentProvider): {
        url: string;
        type: string;
    };
    _onGetPageResources(): TextUtils.ContentProvider.ContentProvider[];
    _getResourceContent(contentProvider: TextUtils.ContentProvider.ContentProvider, message: Object, port: MessagePort): Promise<void>;
    _onGetRequestContent(message: any, port: any): Record | undefined;
    _onGetResourceContent(message: any, port: any): Record | undefined;
    _onSetResourceContent(message: any, port: any): Record | undefined;
    _requestId(request: any): any;
    _requestById(id: any): any;
    _onAddTraceProvider(message: Object, port: MessagePort): void;
    traceProviders(): ExtensionTraceProvider[];
    _onForwardKeyboardEvent(message: any): void;
    _dispatchCallback(requestId: any, port: any, result: any): void;
    _initExtensions(): void;
    _notifyResourceAdded(event: any): void;
    _notifyUISourceCodeContentCommitted(event: any): void;
    _notifyRequestFinished(event: any): Promise<void>;
    _notifyElementsSelectionChanged(): void;
    sourceSelectionChanged(url: string, range: TextUtils.TextRange.TextRange): void;
    _setInspectedTabId(event: Common.EventTarget.EventTargetEvent): void;
    _addExtension(extensionInfo: Host.InspectorFrontendHostAPI.ExtensionDescriptor): boolean | undefined;
    _registerExtension(origin: any, port: any): void;
    _onWindowMessage(event: any): void;
    _onmessage(event: any): Promise<void>;
    _registerHandler(command: any, callback: any): void;
    _registerSubscriptionHandler(eventTopic: any, onSubscribeFirst: any, onUnsubscribeLast: any): void;
    _registerAutosubscriptionHandler(eventTopic: string, eventTarget: Object, frontendEventType: symbol, handler: (arg0: Common.EventTarget.EventTargetEvent) => any): void;
    _registerAutosubscriptionTargetManagerHandler(eventTopic: string, modelClass: Function, frontendEventType: symbol, handler: (arg0: Common.EventTarget.EventTargetEvent) => any): void;
    _registerResourceContentCommittedHandler(handler: any): void;
    _expandResourcePath(extensionPath: any, resourcePath: any): string | undefined;
    _normalizePath(path: any): string;
    evaluate(expression: string, exposeCommandLineAPI: boolean, returnByValue: boolean, options: Object | null, securityOrigin: string, callback: (arg0: string | null, arg1: SDK.RemoteObject.RemoteObject | null, arg2: boolean) => any): Record | undefined;
    _canInspectURL(url: string): boolean;
    _disableExtensions(): void;
}
export declare enum Events {
    SidebarPaneAdded = "SidebarPaneAdded",
    TraceProviderAdded = "TraceProviderAdded"
}
export declare class ExtensionStatus {
    OK: (...args: any[]) => Record;
    E_EXISTS: (...args: any[]) => Record;
    E_BADARG: (...args: any[]) => Record;
    E_BADARGTYPE: (...args: any[]) => Record;
    E_NOTFOUND: (...args: any[]) => Record;
    E_NOTSUPPORTED: (...args: any[]) => Record;
    E_PROTOCOLERROR: (...args: any[]) => Record;
    E_FAILED: (...args: any[]) => Record;
    constructor();
}
export interface Record {
    code: string;
    description: string;
    details: any[];
}
