import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class IndexedDBModel extends SDK.SDKModel.SDKModel implements ProtocolProxyApi.StorageDispatcher {
    _securityOriginManager: SDK.SecurityOriginManager.SecurityOriginManager | null;
    _indexedDBAgent: ProtocolProxyApi.IndexedDBApi;
    _storageAgent: ProtocolProxyApi.StorageApi;
    _databases: Map<DatabaseId, Database>;
    _databaseNamesBySecurityOrigin: {
        [x: string]: string[];
    };
    _originsUpdated: Set<string>;
    _throttler: Common.Throttler.Throttler;
    _enabled?: boolean;
    constructor(target: SDK.Target.Target);
    static keyFromIDBKey(idbKey: any): Protocol.IndexedDB.Key | undefined;
    static _keyRangeFromIDBKeyRange(idbKeyRange: IDBKeyRange): Protocol.IndexedDB.KeyRange;
    static idbKeyPathFromKeyPath(keyPath: Protocol.IndexedDB.KeyPath): string | string[] | null | undefined;
    static keyPathStringFromIDBKeyPath(idbKeyPath: string | string[] | null | undefined): string | null;
    enable(): void;
    clearForOrigin(origin: string): void;
    deleteDatabase(databaseId: DatabaseId): Promise<void>;
    refreshDatabaseNames(): Promise<void>;
    refreshDatabase(databaseId: DatabaseId): void;
    clearObjectStore(databaseId: DatabaseId, objectStoreName: string): Promise<void>;
    deleteEntries(databaseId: DatabaseId, objectStoreName: string, idbKeyRange: IDBKeyRange): Promise<void>;
    _securityOriginAdded(event: Common.EventTarget.EventTargetEvent): void;
    _securityOriginRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _addOrigin(securityOrigin: string): void;
    _removeOrigin(securityOrigin: string): void;
    _isValidSecurityOrigin(securityOrigin: string): boolean;
    _updateOriginDatabaseNames(securityOrigin: string, databaseNames: string[]): void;
    databases(): DatabaseId[];
    _databaseAdded(securityOrigin: string, databaseName: string): void;
    _databaseRemoved(securityOrigin: string, databaseName: string): void;
    _loadDatabaseNames(securityOrigin: string): Promise<string[]>;
    _loadDatabase(databaseId: DatabaseId, entriesUpdated: boolean): Promise<void>;
    loadObjectStoreData(databaseId: DatabaseId, objectStoreName: string, idbKeyRange: IDBKeyRange | null, skipCount: number, pageSize: number, callback: (arg0: Array<Entry>, arg1: boolean) => void): void;
    loadIndexData(databaseId: DatabaseId, objectStoreName: string, indexName: string, idbKeyRange: IDBKeyRange | null, skipCount: number, pageSize: number, callback: (arg0: Array<Entry>, arg1: boolean) => void): void;
    _requestData(databaseId: DatabaseId, databaseName: string, objectStoreName: string, indexName: string, idbKeyRange: IDBKeyRange | null, skipCount: number, pageSize: number, callback: (arg0: Array<Entry>, arg1: boolean) => void): Promise<void>;
    getMetadata(databaseId: DatabaseId, objectStore: ObjectStore): Promise<ObjectStoreMetadata | null>;
    _refreshDatabaseList(securityOrigin: string): Promise<void>;
    indexedDBListUpdated({ origin: securityOrigin }: Protocol.Storage.IndexedDBListUpdatedEvent): void;
    indexedDBContentUpdated({ origin: securityOrigin, databaseName, objectStoreName }: Protocol.Storage.IndexedDBContentUpdatedEvent): void;
    cacheStorageListUpdated(_event: Protocol.Storage.CacheStorageListUpdatedEvent): void;
    cacheStorageContentUpdated(_event: Protocol.Storage.CacheStorageContentUpdatedEvent): void;
}
export declare enum Events {
    DatabaseAdded = "DatabaseAdded",
    DatabaseRemoved = "DatabaseRemoved",
    DatabaseLoaded = "DatabaseLoaded",
    DatabaseNamesRefreshed = "DatabaseNamesRefreshed",
    IndexedDBContentUpdated = "IndexedDBContentUpdated"
}
export declare class Entry {
    key: SDK.RemoteObject.RemoteObject;
    primaryKey: SDK.RemoteObject.RemoteObject;
    value: SDK.RemoteObject.RemoteObject;
    constructor(key: SDK.RemoteObject.RemoteObject, primaryKey: SDK.RemoteObject.RemoteObject, value: SDK.RemoteObject.RemoteObject);
}
export declare class DatabaseId {
    securityOrigin: string;
    name: string;
    constructor(securityOrigin: string, name: string);
    equals(databaseId: DatabaseId): boolean;
}
export declare class Database {
    databaseId: DatabaseId;
    version: number;
    objectStores: Map<string, ObjectStore>;
    constructor(databaseId: DatabaseId, version: number);
}
export declare class ObjectStore {
    name: string;
    keyPath: any;
    autoIncrement: boolean;
    indexes: Map<string, Index>;
    constructor(name: string, keyPath: any, autoIncrement: boolean);
    get keyPathString(): string;
}
export declare class Index {
    name: string;
    keyPath: any;
    unique: boolean;
    multiEntry: boolean;
    constructor(name: string, keyPath: any, unique: boolean, multiEntry: boolean);
    get keyPathString(): string;
}
export interface ObjectStoreMetadata {
    entriesCount: number;
    keyGeneratorValue: number;
}
