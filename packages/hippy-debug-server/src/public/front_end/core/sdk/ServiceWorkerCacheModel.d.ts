import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { NameValue } from './NetworkRequest.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { SecurityOriginManager } from './SecurityOriginManager.js';
export declare class ServiceWorkerCacheModel extends SDKModel implements ProtocolProxyApi.StorageDispatcher {
    _caches: Map<string, Cache>;
    _cacheAgent: ProtocolProxyApi.CacheStorageApi;
    _storageAgent: ProtocolProxyApi.StorageApi;
    _securityOriginManager: SecurityOriginManager;
    _originsUpdated: Set<string>;
    _throttler: Common.Throttler.Throttler;
    _enabled: boolean;
    /**
     * Invariant: This model can only be constructed on a ServiceWorker target.
     */
    constructor(target: Target);
    enable(): void;
    clearForOrigin(origin: string): void;
    refreshCacheNames(): void;
    deleteCache(cache: Cache): Promise<void>;
    deleteCacheEntry(cache: Cache, request: string): Promise<void>;
    loadCacheData(cache: Cache, skipCount: number, pageSize: number, pathFilter: string, callback: (arg0: Array<Protocol.CacheStorage.DataEntry>, arg1: number) => void): void;
    loadAllCacheData(cache: Cache, pathFilter: string, callback: (arg0: Array<Protocol.CacheStorage.DataEntry>, arg1: number) => void): void;
    caches(): Cache[];
    dispose(): void;
    _addOrigin(securityOrigin: string): void;
    _removeOrigin(securityOrigin: string): void;
    _isValidSecurityOrigin(securityOrigin: string): boolean;
    _loadCacheNames(securityOrigin: string): Promise<void>;
    _updateCacheNames(securityOrigin: string, cachesJson: Protocol.CacheStorage.Cache[]): void;
    _securityOriginAdded(event: Common.EventTarget.EventTargetEvent): void;
    _securityOriginRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _cacheAdded(cache: Cache): void;
    _cacheRemoved(cache: Cache): void;
    _requestEntries(cache: Cache, skipCount: number, pageSize: number, pathFilter: string, callback: (arg0: Array<Protocol.CacheStorage.DataEntry>, arg1: number) => void): Promise<void>;
    _requestAllEntries(cache: Cache, pathFilter: string, callback: (arg0: Array<Protocol.CacheStorage.DataEntry>, arg1: number) => void): Promise<void>;
    cacheStorageListUpdated({ origin }: Protocol.Storage.CacheStorageListUpdatedEvent): void;
    cacheStorageContentUpdated({ origin, cacheName }: Protocol.Storage.CacheStorageContentUpdatedEvent): void;
    indexedDBListUpdated(_event: Protocol.Storage.IndexedDBListUpdatedEvent): void;
    indexedDBContentUpdated(_event: Protocol.Storage.IndexedDBContentUpdatedEvent): void;
}
export declare enum Events {
    CacheAdded = "CacheAdded",
    CacheRemoved = "CacheRemoved",
    CacheStorageContentUpdated = "CacheStorageContentUpdated"
}
export declare class Cache {
    _model: ServiceWorkerCacheModel;
    securityOrigin: string;
    cacheName: string;
    cacheId: string;
    constructor(model: ServiceWorkerCacheModel, securityOrigin: string, cacheName: string, cacheId: string);
    equals(cache: Cache): boolean;
    toString(): string;
    requestCachedResponse(url: string, requestHeaders: NameValue[]): Promise<Protocol.CacheStorage.CachedResponse | null>;
}
