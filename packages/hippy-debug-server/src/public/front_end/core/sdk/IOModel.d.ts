import { RemoteObject } from './RemoteObject.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class IOModel extends SDKModel {
    constructor(target: Target);
    /**
     * @throws {!Error}
     */
    read(handle: string, size?: number, offset?: number): Promise<string | ArrayBuffer | null>;
    close(handle: string): Promise<void>;
    /**
     * @throws {!Error}
     */
    resolveBlob(objectOrObjectId: string | RemoteObject): Promise<string>;
    /**
     * @throws {!Error}
     */
    readToString(handle: string): Promise<string>;
}
