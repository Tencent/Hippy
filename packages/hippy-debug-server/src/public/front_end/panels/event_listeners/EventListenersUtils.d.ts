import * as SDK from '../../core/sdk/sdk.js';
export declare function frameworkEventListeners(object: SDK.RemoteObject.RemoteObject): Promise<FrameworkEventListenersObject>;
export interface FrameworkEventListenersObject {
    eventListeners: SDK.DOMDebuggerModel.EventListener[];
    internalHandlers: SDK.RemoteObject.RemoteArray | null;
}
export interface PossibleEventListenerObjectInInspectedPage {
    type?: string;
    useCapture?: boolean;
    passive?: boolean;
    once?: boolean;
    handler?: SDK.RemoteObject.RemoteObject | null;
    remove?: SDK.RemoteObject.RemoteObject | null;
}
export interface EventListenerObjectInInspectedPage {
    type: string;
    useCapture: boolean;
    passive: boolean;
    once: boolean;
    handler: SDK.RemoteObject.RemoteObject | null;
    remove: SDK.RemoteObject.RemoteObject | null;
}
export interface TruncatedEventListenerObjectInInspectedPage {
    type?: string;
    useCapture?: boolean;
    passive?: boolean;
    once?: boolean;
}
