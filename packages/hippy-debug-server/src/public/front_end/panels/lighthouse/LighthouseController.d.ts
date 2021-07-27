import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type { ProtocolService } from './LighthouseProtocolService.js';
export declare class LighthouseController extends Common.ObjectWrapper.ObjectWrapper implements SDK.TargetManager.SDKModelObserver<SDK.ServiceWorkerManager.ServiceWorkerManager> {
    _manager?: SDK.ServiceWorkerManager.ServiceWorkerManager | null;
    _serviceWorkerListeners?: Common.EventTarget.EventDescriptor[];
    _inspectedURL?: string;
    constructor(protocolService: ProtocolService);
    modelAdded(serviceWorkerManager: SDK.ServiceWorkerManager.ServiceWorkerManager): void;
    modelRemoved(serviceWorkerManager: SDK.ServiceWorkerManager.ServiceWorkerManager): void;
    _hasActiveServiceWorker(): boolean;
    _hasAtLeastOneCategory(): boolean;
    _unauditablePageMessage(): string | null;
    _hasImportantResourcesNotCleared(): Promise<string>;
    _evaluateInspectedURL(): Promise<string>;
    getFlags(): {
        internalDisableDeviceScreenEmulation: boolean;
        emulatedFormFactor: (string | undefined);
    };
    getCategoryIDs(): string[];
    getInspectedURL(options?: {
        force: boolean;
    }): Promise<string>;
    recomputePageAuditability(): void;
}
export declare const Presets: Preset[];
export declare type Flags = {
    [flag: string]: string | boolean;
};
export declare const RuntimeSettings: RuntimeSetting[];
export declare const Events: {
    PageAuditabilityChanged: symbol;
    PageWarningsChanged: symbol;
    AuditProgressChanged: symbol;
    RequestLighthouseStart: symbol;
    RequestLighthouseCancel: symbol;
};
export interface Preset {
    setting: Common.Settings.Setting<boolean>;
    configID: string;
    title: () => Common.UIString.LocalizedString;
    description: () => Common.UIString.LocalizedString;
    plugin: boolean;
}
export interface RuntimeSetting {
    setting: Common.Settings.Setting<string | boolean>;
    description: () => Common.UIString.LocalizedString;
    setFlags: (flags: Flags, value: string | boolean) => void;
    options?: {
        label: () => Common.UIString.LocalizedString;
        value: string;
    }[];
    title?: () => Common.UIString.LocalizedString;
    learnMore?: string;
}
