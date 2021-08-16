import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
export declare class Database {
    _model: DatabaseModel;
    _id: string;
    _domain: string;
    _name: string;
    _version: string;
    constructor(model: DatabaseModel, id: string, domain: string, name: string, version: string);
    get id(): string;
    get name(): string;
    set name(x: string);
    get version(): string;
    set version(x: string);
    get domain(): string;
    set domain(x: string);
    tableNames(): Promise<string[]>;
    executeSql(query: string, onSuccess: (arg0: Array<string>, arg1: Array<any>) => void, onError: (arg0: string) => void): Promise<void>;
}
export declare class DatabaseModel extends SDK.SDKModel.SDKModel {
    _databases: Database[];
    _agent: ProtocolProxyApi.DatabaseApi;
    _enabled?: boolean;
    constructor(target: SDK.Target.Target);
    enable(): void;
    disable(): void;
    databases(): Database[];
    _addDatabase(database: Database): void;
}
export declare enum Events {
    DatabaseAdded = "DatabaseAdded",
    DatabasesRemoved = "DatabasesRemoved"
}
export declare class DatabaseDispatcher implements ProtocolProxyApi.DatabaseDispatcher {
    _model: DatabaseModel;
    constructor(model: DatabaseModel);
    addDatabase({ database }: Protocol.Database.AddDatabaseEvent): void;
}
