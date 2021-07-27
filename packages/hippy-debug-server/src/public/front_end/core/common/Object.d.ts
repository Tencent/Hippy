import type { EventDescriptor, EventTarget, EventTargetEvent } from './EventTarget.js';
interface _listenerCallbackTuple {
    thisObject?: Object;
    listener: (arg0: EventTargetEvent) => void;
    disposed?: boolean;
}
export declare class ObjectWrapper implements EventTarget {
    _listeners: Map<string | symbol, _listenerCallbackTuple[]> | undefined;
    constructor();
    addEventListener(eventType: string | symbol, listener: (arg0: EventTargetEvent) => void, thisObject?: Object): EventDescriptor;
    once(eventType: string | symbol): Promise<any>;
    removeEventListener(eventType: string | symbol, listener: (arg0: EventTargetEvent) => void, thisObject?: Object): void;
    hasEventListeners(eventType: string | symbol): boolean;
    dispatchEventToListeners(eventType: string | symbol, eventData?: any): void;
}
export {};
