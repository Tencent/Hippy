import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class ServiceWorkerManager extends SDKModel {
    _lastAnonymousTargetId: number;
    _agent: ProtocolProxyApi.ServiceWorkerApi;
    _registrations: Map<string, ServiceWorkerRegistration>;
    _enabled: boolean;
    _forceUpdateSetting: Common.Settings.Setting<boolean>;
    serviceWorkerNetworkRequestsPanelStatus: {
        isOpen: boolean;
        openedAt: number;
    };
    constructor(target: Target);
    enable(): Promise<void>;
    disable(): Promise<void>;
    registrations(): Map<string, ServiceWorkerRegistration>;
    hasRegistrationForURLs(urls: string[]): boolean;
    findVersion(versionId: string): ServiceWorkerVersion | null;
    deleteRegistration(registrationId: string): void;
    updateRegistration(registrationId: string): Promise<void>;
    deliverPushMessage(registrationId: string, data: string): Promise<void>;
    dispatchSyncEvent(registrationId: string, tag: string, lastChance: boolean): Promise<void>;
    dispatchPeriodicSyncEvent(registrationId: string, tag: string): Promise<void>;
    _unregister(scopeURL: string): Promise<void>;
    startWorker(scopeURL: string): Promise<void>;
    skipWaiting(scopeURL: string): Promise<void>;
    stopWorker(versionId: string): Promise<void>;
    inspectWorker(versionId: string): Promise<void>;
    _workerRegistrationUpdated(registrations: Protocol.ServiceWorker.ServiceWorkerRegistration[]): void;
    _workerVersionUpdated(versions: Protocol.ServiceWorker.ServiceWorkerVersion[]): void;
    _workerErrorReported(payload: Protocol.ServiceWorker.ServiceWorkerErrorMessage): void;
    forceUpdateOnReloadSetting(): Common.Settings.Setting<boolean>;
    _forceUpdateSettingChanged(): void;
}
export declare enum Events {
    RegistrationUpdated = "RegistrationUpdated",
    RegistrationErrorAdded = "RegistrationErrorAdded",
    RegistrationDeleted = "RegistrationDeleted"
}
/**
 * For every version, we keep a history of ServiceWorkerVersionState. Every time
 * a version is updated we will add a new state at the head of the history chain.
 * This history tells us information such as what the current state is, or when
 * the version becomes installed.
 */
export declare class ServiceWorkerVersionState {
    runningStatus: Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus;
    status: Protocol.ServiceWorker.ServiceWorkerVersionStatus;
    last_updated_timestamp: number;
    previousState: ServiceWorkerVersionState | null;
    constructor(runningStatus: Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus, status: Protocol.ServiceWorker.ServiceWorkerVersionStatus, previousState: ServiceWorkerVersionState | null, timestamp: number);
}
export declare class ServiceWorkerVersion {
    id: string;
    scriptURL: string;
    parsedURL: Common.ParsedURL.ParsedURL;
    securityOrigin: string;
    scriptLastModified: number | undefined;
    scriptResponseTime: number | undefined;
    controlledClients: string[];
    targetId: string | null;
    currentState: ServiceWorkerVersionState;
    registration: ServiceWorkerRegistration;
    constructor(registration: ServiceWorkerRegistration, payload: Protocol.ServiceWorker.ServiceWorkerVersion);
    _update(payload: Protocol.ServiceWorker.ServiceWorkerVersion): void;
    isStartable(): boolean;
    isStoppedAndRedundant(): boolean;
    isStopped(): boolean;
    isStarting(): boolean;
    isRunning(): boolean;
    isStopping(): boolean;
    isNew(): boolean;
    isInstalling(): boolean;
    isInstalled(): boolean;
    isActivating(): boolean;
    isActivated(): boolean;
    isRedundant(): boolean;
    get status(): Protocol.ServiceWorker.ServiceWorkerVersionStatus;
    get runningStatus(): Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus;
    mode(): string;
}
export declare namespace ServiceWorkerVersion {
    const RunningStatus: {
        running: () => Common.UIString.LocalizedString;
        starting: () => Common.UIString.LocalizedString;
        stopped: () => Common.UIString.LocalizedString;
        stopping: () => Common.UIString.LocalizedString;
    };
    const Status: {
        activated: () => Common.UIString.LocalizedString;
        activating: () => Common.UIString.LocalizedString;
        installed: () => Common.UIString.LocalizedString;
        installing: () => Common.UIString.LocalizedString;
        new: () => Common.UIString.LocalizedString;
        redundant: () => Common.UIString.LocalizedString;
    };
    enum Modes {
        Installing = "installing",
        Waiting = "waiting",
        Active = "active",
        Redundant = "redundant"
    }
}
export declare class ServiceWorkerRegistration {
    _fingerprint: symbol;
    id: string;
    scopeURL: string;
    securityOrigin: string;
    isDeleted: boolean;
    versions: Map<string, ServiceWorkerVersion>;
    _deleting: boolean;
    errors: Protocol.ServiceWorker.ServiceWorkerErrorMessage[];
    constructor(payload: Protocol.ServiceWorker.ServiceWorkerRegistration);
    _update(payload: Protocol.ServiceWorker.ServiceWorkerRegistration): void;
    fingerprint(): symbol;
    versionsByMode(): Map<string, ServiceWorkerVersion>;
    _updateVersion(payload: Protocol.ServiceWorker.ServiceWorkerVersion): ServiceWorkerVersion;
    _isRedundant(): boolean;
    _shouldBeRemoved(): boolean;
    canBeRemoved(): boolean;
    clearErrors(): void;
}
