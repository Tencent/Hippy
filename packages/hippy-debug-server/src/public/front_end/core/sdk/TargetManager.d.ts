import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import type * as ProtocolClient from '../protocol_client/protocol_client.js';
import type * as Protocol from '../../generated/protocol.js';
import type { Type as TargetType } from './Target.js';
import { Target } from './Target.js';
import type { SDKModel } from './SDKModel.js';
export declare class TargetManager extends Common.ObjectWrapper.ObjectWrapper {
    _targets: Set<Target>;
    _observers: Set<Observer>;
    _modelListeners: Platform.MapUtilities.Multimap<string | symbol, {
        modelClass: new (arg1: Target) => SDKModel;
        thisObject: (Object | undefined);
        listener: (arg0: Common.EventTarget.EventTargetEvent) => void;
    }>;
    _modelObservers: Platform.MapUtilities.Multimap<new (arg1: Target) => SDKModel, SDKModelObserver<any>>;
    _isSuspended: boolean;
    private constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): TargetManager;
    static removeInstance(): void;
    onInspectedURLChange(target: Target): void;
    onNameChange(target: Target): void;
    suspendAllTargets(reason?: string): Promise<void>;
    resumeAllTargets(): Promise<void>;
    allTargetsSuspended(): boolean;
    models<T extends SDKModel>(modelClass: new (arg1: Target) => T): T[];
    inspectedURL(): string;
    observeModels<T extends SDKModel>(modelClass: new (arg1: Target) => T, observer: SDKModelObserver<T>): void;
    unobserveModels<T extends SDKModel>(modelClass: new (arg1: Target) => SDKModel, observer: SDKModelObserver<T>): void;
    modelAdded(target: Target, modelClass: new (arg1: Target) => SDKModel, model: SDKModel): void;
    _modelRemoved(target: Target, modelClass: new (arg1: Target) => SDKModel, model: SDKModel): void;
    addModelListener(modelClass: new (arg1: Target) => SDKModel, eventType: string | symbol, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): void;
    removeModelListener(modelClass: new (arg1: Target) => SDKModel, eventType: string | symbol, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): void;
    observeTargets(targetObserver: Observer): void;
    unobserveTargets(targetObserver: Observer): void;
    createTarget(id: string, name: string, type: TargetType, parentTarget: Target | null, sessionId?: string, waitForDebuggerInPage?: boolean, connection?: ProtocolClient.InspectorBackend.Connection, targetInfo?: Protocol.Target.TargetInfo): Target;
    removeTarget(target: Target): void;
    targets(): Target[];
    targetById(id: string): Target | null;
    mainTarget(): Target | null;
}
export declare enum Events {
    AvailableTargetsChanged = "AvailableTargetsChanged",
    InspectedURLChanged = "InspectedURLChanged",
    NameChanged = "NameChanged",
    SuspendStateChanged = "SuspendStateChanged"
}
export declare class Observer {
    targetAdded(_target: Target): void;
    targetRemoved(_target: Target): void;
}
export declare class SDKModelObserver<T> {
    modelAdded(_model: T): void;
    modelRemoved(_model: T): void;
}
