export interface EventDescriptor {
    eventTarget: EventTarget;
    eventType: string | symbol;
    thisObject?: Object;
    listener: (arg0: EventTargetEvent) => void;
}
export declare function removeEventListeners(eventList: EventDescriptor[]): void;
export declare class EventTarget {
    addEventListener(eventType: string | symbol, listener: (arg0: EventTargetEvent) => void, thisObject?: Object): EventDescriptor;
    once(eventType: string | symbol): Promise<any>;
    removeEventListener(eventType: string | symbol, listener: (arg0: EventTargetEvent) => void, thisObject?: Object): void;
    hasEventListeners(eventType: string | symbol): boolean;
    dispatchEventToListeners(eventType: string | symbol, eventData?: any): void;
    static removeEventListeners: typeof removeEventListeners;
}
export declare function fireEvent(name: string, detail?: any, target?: HTMLElement | Window): void;
export interface EventTargetEvent<T = any> {
    data: T;
}
