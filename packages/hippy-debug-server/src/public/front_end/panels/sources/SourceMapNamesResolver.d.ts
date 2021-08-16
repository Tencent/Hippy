import * as SDK from '../../core/sdk/sdk.js';
import type * as Workspace from '../../models/workspace/workspace.js';
import * as Protocol from '../../generated/protocol.js';
export declare class Identifier {
    name: string;
    lineNumber: number;
    columnNumber: number;
    constructor(name: string, lineNumber: number, columnNumber: number);
}
export declare const scopeIdentifiers: (scope: SDK.DebuggerModel.ScopeChainEntry) => Promise<Identifier[]>;
export declare const resolveScopeChain: (callFrame: SDK.DebuggerModel.CallFrame | null) => Promise<SDK.DebuggerModel.ScopeChainEntry[] | null>;
export declare const resolveScope: (scope: SDK.DebuggerModel.ScopeChainEntry) => Promise<Map<string, string>>;
export declare const allVariablesInCallFrame: (callFrame: SDK.DebuggerModel.CallFrame) => Promise<Map<string, string>>;
export declare const resolveExpression: (callFrame: SDK.DebuggerModel.CallFrame, originalText: string, uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, startColumnNumber: number, endColumnNumber: number) => Promise<string>;
export declare const resolveThisObject: (callFrame: SDK.DebuggerModel.CallFrame | null) => Promise<SDK.RemoteObject.RemoteObject | null>;
export declare const resolveScopeInObject: (scope: SDK.DebuggerModel.ScopeChainEntry) => SDK.RemoteObject.RemoteObject;
export declare class RemoteObject extends SDK.RemoteObject.RemoteObject {
    _scope: SDK.DebuggerModel.ScopeChainEntry;
    _object: SDK.RemoteObject.RemoteObject;
    constructor(scope: SDK.DebuggerModel.ScopeChainEntry);
    customPreview(): Protocol.Runtime.CustomPreview | null;
    get objectId(): Protocol.Runtime.RemoteObjectId | undefined;
    get type(): string;
    get subtype(): string | undefined;
    get value(): any;
    get description(): string | undefined;
    get hasChildren(): boolean;
    get preview(): Protocol.Runtime.ObjectPreview | undefined;
    arrayLength(): number;
    getOwnProperties(generatePreview: boolean): Promise<SDK.RemoteObject.GetPropertiesResult>;
    getAllProperties(accessorPropertiesOnly: boolean, generatePreview: boolean): Promise<SDK.RemoteObject.GetPropertiesResult>;
    setPropertyValue(argumentName: string | Protocol.Runtime.CallArgument, value: string): Promise<string | undefined>;
    deleteProperty(name: Protocol.Runtime.CallArgument): Promise<string | undefined>;
    callFunction<T>(functionDeclaration: (this: Object, ...arg1: unknown[]) => T, args?: Protocol.Runtime.CallArgument[]): Promise<SDK.RemoteObject.CallFunctionResult>;
    callFunctionJSON<T>(functionDeclaration: (this: Object, ...arg1: unknown[]) => T, args?: Protocol.Runtime.CallArgument[]): Promise<T>;
    release(): void;
    debuggerModel(): SDK.DebuggerModel.DebuggerModel;
    runtimeModel(): SDK.RuntimeModel.RuntimeModel;
    isNode(): boolean;
}
export declare const getScopeResolvedForTest: () => (...arg0: any[]) => any;
export declare const setScopeResolvedForTest: (scope: (...arg0: any[]) => any) => void;
