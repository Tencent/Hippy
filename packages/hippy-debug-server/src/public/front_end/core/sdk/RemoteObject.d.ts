import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { DebuggerModel, FunctionDetails } from './DebuggerModel.js';
import type { RuntimeModel } from './RuntimeModel.js';
export declare class RemoteObject {
    /**
     * This may not be an interface due to "instanceof RemoteObject" checks in the code.
     */
    static fromLocalObject(value: any): RemoteObject;
    static type(remoteObject: RemoteObject): string;
    static arrayNameFromDescription(description: string): string;
    static arrayLength(object: RemoteObject | Protocol.Runtime.RemoteObject | Protocol.Runtime.ObjectPreview): number;
    static arrayBufferByteLength(object: RemoteObject | Protocol.Runtime.RemoteObject | Protocol.Runtime.ObjectPreview): number;
    static unserializableDescription(object: any): string | null;
    static toCallArgument(object: string | number | bigint | boolean | RemoteObject | Protocol.Runtime.RemoteObject | null | undefined): Protocol.Runtime.CallArgument;
    static loadFromObjectPerProto(object: RemoteObject, generatePreview: boolean): Promise<GetPropertiesResult>;
    customPreview(): Protocol.Runtime.CustomPreview | null;
    get objectId(): Protocol.Runtime.RemoteObjectId | undefined;
    get type(): string;
    get subtype(): string | undefined;
    get value(): any;
    unserializableValue(): string | undefined;
    get description(): string | undefined;
    set description(description: string | undefined);
    get hasChildren(): boolean;
    get preview(): Protocol.Runtime.ObjectPreview | undefined;
    get className(): string | null;
    arrayLength(): number;
    arrayBufferByteLength(): number;
    getOwnProperties(_generatePreview: boolean): Promise<GetPropertiesResult>;
    getAllProperties(_accessorPropertiesOnly: boolean, _generatePreview: boolean): Promise<GetPropertiesResult>;
    deleteProperty(_name: Protocol.Runtime.CallArgument): Promise<string | undefined>;
    setPropertyValue(_name: string | Protocol.Runtime.CallArgument, _value: string): Promise<string | undefined>;
    callFunction<T>(_functionDeclaration: (this: Object, ...arg1: unknown[]) => T, _args?: Protocol.Runtime.CallArgument[]): Promise<CallFunctionResult>;
    callFunctionJSON<T>(_functionDeclaration: (this: Object, ...arg1: unknown[]) => T, _args: Protocol.Runtime.CallArgument[] | undefined): Promise<T>;
    release(): void;
    debuggerModel(): DebuggerModel;
    runtimeModel(): RuntimeModel;
    isNode(): boolean;
}
export declare class RemoteObjectImpl extends RemoteObject {
    _runtimeModel: RuntimeModel;
    _runtimeAgent: ProtocolProxyApi.RuntimeApi;
    _type: string;
    _subtype: string | undefined;
    _objectId: string | undefined;
    _description: string | undefined;
    _hasChildren: boolean;
    _preview: Protocol.Runtime.ObjectPreview | undefined;
    _unserializableValue: string | undefined;
    _value: any;
    _customPreview: Protocol.Runtime.CustomPreview | null;
    _className: string | null;
    constructor(runtimeModel: RuntimeModel, objectId: string | undefined, type: string, subtype: string | undefined, value: any, unserializableValue?: string, description?: string, preview?: Protocol.Runtime.ObjectPreview, customPreview?: Protocol.Runtime.CustomPreview, className?: string);
    customPreview(): Protocol.Runtime.CustomPreview | null;
    get objectId(): Protocol.Runtime.RemoteObjectId | undefined;
    get type(): string;
    get subtype(): string | undefined;
    get value(): any;
    unserializableValue(): string | undefined;
    get description(): string | undefined;
    set description(description: string | undefined);
    get hasChildren(): boolean;
    get preview(): Protocol.Runtime.ObjectPreview | undefined;
    get className(): string | null;
    getOwnProperties(generatePreview: boolean): Promise<GetPropertiesResult>;
    getAllProperties(accessorPropertiesOnly: boolean, generatePreview: boolean): Promise<GetPropertiesResult>;
    _createRemoteObject(object: Protocol.Runtime.RemoteObject): Promise<RemoteObject>;
    doGetProperties(ownProperties: boolean, accessorPropertiesOnly: boolean, generatePreview: boolean): Promise<GetPropertiesResult>;
    setPropertyValue(name: string | Protocol.Runtime.CallArgument, value: string): Promise<string | undefined>;
    doSetObjectPropertyValue(result: Protocol.Runtime.RemoteObject, name: Protocol.Runtime.CallArgument): Promise<string | undefined>;
    deleteProperty(name: Protocol.Runtime.CallArgument): Promise<string | undefined>;
    callFunction<T>(functionDeclaration: (this: Object, ...arg1: unknown[]) => T, args?: Protocol.Runtime.CallArgument[]): Promise<CallFunctionResult>;
    callFunctionJSON<T>(functionDeclaration: (this: Object, ...arg1: unknown[]) => T, args: Protocol.Runtime.CallArgument[] | undefined): Promise<T>;
    release(): void;
    arrayLength(): number;
    arrayBufferByteLength(): number;
    debuggerModel(): DebuggerModel;
    runtimeModel(): RuntimeModel;
    isNode(): boolean;
}
export declare class ScopeRemoteObject extends RemoteObjectImpl {
    _scopeRef: ScopeRef;
    _savedScopeProperties: RemoteObjectProperty[] | undefined;
    constructor(runtimeModel: RuntimeModel, objectId: string | undefined, scopeRef: ScopeRef, type: string, subtype: string | undefined, value: any, unserializableValue?: string, description?: string, preview?: Protocol.Runtime.ObjectPreview);
    doGetProperties(ownProperties: boolean, accessorPropertiesOnly: boolean, _generatePreview: boolean): Promise<GetPropertiesResult>;
    doSetObjectPropertyValue(result: Protocol.Runtime.RemoteObject, argumentName: Protocol.Runtime.CallArgument): Promise<string | undefined>;
}
export declare class ScopeRef {
    number: number;
    callFrameId: string | undefined;
    constructor(number: number, callFrameId?: string);
}
export declare class RemoteObjectProperty {
    name: string;
    value: RemoteObject | null | undefined;
    enumerable: boolean;
    writable: boolean;
    isOwn: boolean;
    wasThrown: boolean;
    symbol: RemoteObject | undefined;
    synthetic: boolean;
    syntheticSetter: ((arg0: string) => Promise<RemoteObject | null>) | undefined;
    private: boolean;
    getter: RemoteObject | undefined;
    setter: RemoteObject | undefined;
    constructor(name: string, value: RemoteObject | null, enumerable?: boolean, writable?: boolean, isOwn?: boolean, wasThrown?: boolean, symbol?: RemoteObject | null, synthetic?: boolean, syntheticSetter?: ((arg0: string) => Promise<RemoteObject | null>), isPrivate?: boolean);
    setSyntheticValue(expression: string): Promise<boolean>;
    isAccessorProperty(): boolean;
}
export declare class LocalJSONObject extends RemoteObject {
    _value: any;
    _cachedDescription: string;
    _cachedChildren: RemoteObjectProperty[];
    constructor(value: any);
    get objectId(): Protocol.Runtime.RemoteObjectId | undefined;
    get value(): any;
    unserializableValue(): string | undefined;
    get description(): string;
    _formatValue(value: RemoteObject | null): string;
    _concatenate(prefix: string, suffix: string, formatProperty: (arg0: RemoteObjectProperty) => string): string;
    get type(): string;
    get subtype(): string | undefined;
    get hasChildren(): boolean;
    getOwnProperties(_generatePreview: boolean): Promise<GetPropertiesResult>;
    getAllProperties(accessorPropertiesOnly: boolean, _generatePreview: boolean): Promise<GetPropertiesResult>;
    _children(): RemoteObjectProperty[];
    arrayLength(): number;
    callFunction<T>(functionDeclaration: (this: Object, ...arg1: unknown[]) => T, args?: Protocol.Runtime.CallArgument[]): Promise<CallFunctionResult>;
    callFunctionJSON<T>(functionDeclaration: (this: Object, ...arg1: unknown[]) => T, args: Protocol.Runtime.CallArgument[] | undefined): Promise<T>;
}
export declare class RemoteArrayBuffer {
    _object: RemoteObject;
    constructor(object: RemoteObject);
    byteLength(): number;
    bytes(start?: any, end?: any): Promise<number[]>;
    object(): RemoteObject;
}
export declare class RemoteArray {
    _object: RemoteObject;
    constructor(object: RemoteObject);
    static objectAsArray(object: RemoteObject | null): RemoteArray;
    static createFromRemoteObjects(objects: RemoteObject[]): Promise<RemoteArray>;
    at(index: number): Promise<RemoteObject>;
    length(): number;
    map<T>(func: (arg0: RemoteObject) => Promise<T>): Promise<T[]>;
    object(): RemoteObject;
}
export declare class RemoteFunction {
    _object: RemoteObject;
    constructor(object: RemoteObject);
    static objectAsFunction(object: RemoteObject | null): RemoteFunction;
    targetFunction(): Promise<RemoteObject>;
    targetFunctionDetails(): Promise<FunctionDetails | null>;
    object(): RemoteObject;
}
export interface CallFunctionResult {
    object: RemoteObject | null;
    wasThrown?: boolean;
}
export interface GetPropertiesResult {
    properties: RemoteObjectProperty[] | null;
    internalProperties: RemoteObjectProperty[] | null;
}
