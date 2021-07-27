import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class DOMStorage extends Common.ObjectWrapper.ObjectWrapper {
    _model: DOMStorageModel;
    _securityOrigin: string;
    _isLocalStorage: boolean;
    constructor(model: DOMStorageModel, securityOrigin: string, isLocalStorage: boolean);
    static storageId(securityOrigin: string, isLocalStorage: boolean): Protocol.DOMStorage.StorageId;
    get id(): Protocol.DOMStorage.StorageId;
    get securityOrigin(): string;
    get isLocalStorage(): boolean;
    getItems(): Promise<Protocol.DOMStorage.Item[] | null>;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
}
export declare namespace DOMStorage {
    enum Events {
        DOMStorageItemsCleared = "DOMStorageItemsCleared",
        DOMStorageItemRemoved = "DOMStorageItemRemoved",
        DOMStorageItemAdded = "DOMStorageItemAdded",
        DOMStorageItemUpdated = "DOMStorageItemUpdated"
    }
}
export declare class DOMStorageModel extends SDK.SDKModel.SDKModel {
    _securityOriginManager: SDK.SecurityOriginManager.SecurityOriginManager | null;
    _storages: {
        [x: string]: DOMStorage;
    };
    _agent: ProtocolProxyApi.DOMStorageApi;
    _enabled?: boolean;
    constructor(target: SDK.Target.Target);
    enable(): void;
    clearForOrigin(origin: string): void;
    _securityOriginAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addOrigin(securityOrigin: string): void;
    _securityOriginRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _removeOrigin(securityOrigin: string): void;
    _storageKey(securityOrigin: string, isLocalStorage: boolean): string;
    _domStorageItemsCleared(storageId: Protocol.DOMStorage.StorageId): void;
    _domStorageItemRemoved(storageId: Protocol.DOMStorage.StorageId, key: string): void;
    _domStorageItemAdded(storageId: Protocol.DOMStorage.StorageId, key: string, value: string): void;
    _domStorageItemUpdated(storageId: Protocol.DOMStorage.StorageId, key: string, oldValue: string, value: string): void;
    storageForId(storageId: Protocol.DOMStorage.StorageId): DOMStorage;
    storages(): DOMStorage[];
}
export declare enum Events {
    DOMStorageAdded = "DOMStorageAdded",
    DOMStorageRemoved = "DOMStorageRemoved"
}
export declare class DOMStorageDispatcher implements ProtocolProxyApi.DOMStorageDispatcher {
    _model: DOMStorageModel;
    constructor(model: DOMStorageModel);
    domStorageItemsCleared({ storageId }: Protocol.DOMStorage.DomStorageItemsClearedEvent): void;
    domStorageItemRemoved({ storageId, key }: Protocol.DOMStorage.DomStorageItemRemovedEvent): void;
    domStorageItemAdded({ storageId, key, newValue }: Protocol.DOMStorage.DomStorageItemAddedEvent): void;
    domStorageItemUpdated({ storageId, key, oldValue, newValue }: Protocol.DOMStorage.DomStorageItemUpdatedEvent): void;
}
