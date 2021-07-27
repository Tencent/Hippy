import * as Common from '../../core/common/common.js';
import type { ContextFlavorListener } from './ContextFlavorListener.js';
interface ConstructorFn<T> {
    new (...args: any[]): T;
}
export declare class Context {
    _flavors: Map<ConstructorFn<unknown>, Object>;
    _eventDispatchers: Map<ConstructorFn<unknown>, Common.ObjectWrapper.ObjectWrapper>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): Context;
    setFlavor<T>(flavorType: ConstructorFn<T>, flavorValue: T | null): void;
    _dispatchFlavorChange<T>(flavorType: ConstructorFn<T>, flavorValue: T | null): void;
    addFlavorChangeListener<T>(flavorType: ConstructorFn<T>, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): void;
    removeFlavorChangeListener<T>(flavorType: ConstructorFn<T>, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): void;
    flavor<T>(flavorType: ConstructorFn<T>): T | null;
    flavors(): Set<ConstructorFn<unknown>>;
}
export declare function registerListener(registration: ContextFlavorListenerRegistration): void;
export interface ContextFlavorListenerRegistration {
    contextTypes: () => Array<unknown>;
    loadListener: () => Promise<ContextFlavorListener>;
}
export {};
