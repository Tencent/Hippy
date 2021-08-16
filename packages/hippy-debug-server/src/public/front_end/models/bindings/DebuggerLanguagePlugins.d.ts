import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import type { DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export declare class ValueNode extends SDK.RemoteObject.RemoteObjectImpl {
    inspectableAddress?: number;
    callFrame: SDK.DebuggerModel.CallFrame;
    constructor(callFrame: SDK.DebuggerModel.CallFrame, objectId: string | undefined, type: string, subtype: string | undefined, value: any, inspectableAddress?: number, unserializableValue?: string, description?: string, preview?: Protocol.Runtime.ObjectPreview, customPreview?: Protocol.Runtime.CustomPreview, className?: string);
}
declare class SourceScopeRemoteObject extends SDK.RemoteObject.RemoteObjectImpl {
    variables: Variable[];
    _callFrame: SDK.DebuggerModel.CallFrame;
    _plugin: DebuggerLanguagePlugin;
    _location: RawLocation;
    constructor(callFrame: SDK.DebuggerModel.CallFrame, plugin: DebuggerLanguagePlugin, location: RawLocation);
    doGetProperties(ownProperties: boolean, accessorPropertiesOnly: boolean, _generatePreview: boolean): Promise<SDK.RemoteObject.GetPropertiesResult>;
}
export declare class SourceScope implements SDK.DebuggerModel.ScopeChainEntry {
    _callFrame: SDK.DebuggerModel.CallFrame;
    _type: string;
    _typeName: string;
    _icon: string | undefined;
    _object: SourceScopeRemoteObject;
    _name: string;
    _startLocation: SDK.DebuggerModel.Location | null;
    _endLocation: SDK.DebuggerModel.Location | null;
    constructor(callFrame: SDK.DebuggerModel.CallFrame, type: string, typeName: string, icon: string | undefined, plugin: DebuggerLanguagePlugin, location: RawLocation);
    getVariableValue(name: string): Promise<SDK.RemoteObject.RemoteObject | null>;
    callFrame(): SDK.DebuggerModel.CallFrame;
    type(): string;
    typeName(): string;
    name(): string | undefined;
    startLocation(): SDK.DebuggerModel.Location | null;
    endLocation(): SDK.DebuggerModel.Location | null;
    object(): SourceScopeRemoteObject;
    description(): string;
    icon(): string | undefined;
}
export declare class DebuggerLanguagePluginManager implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _plugins: DebuggerLanguagePlugin[];
    _debuggerModelToData: Map<SDK.DebuggerModel.DebuggerModel, ModelData>;
    _rawModuleHandles: Map<string, {
        rawModuleId: string;
        plugin: DebuggerLanguagePlugin;
        scripts: Array<SDK.Script.Script>;
        addRawModulePromise: Promise<Array<string>>;
    }>;
    constructor(targetManager: SDK.TargetManager.TargetManager, workspace: Workspace.Workspace.WorkspaceImpl, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    _evaluateOnCallFrame(callFrame: SDK.DebuggerModel.CallFrame, options: SDK.RuntimeModel.EvaluationOptions): Promise<{
        object: SDK.RemoteObject.RemoteObject;
        exceptionDetails: Protocol.Runtime.ExceptionDetails | undefined;
    } | {
        error: string;
    } | null>;
    _expandCallFrames(callFrames: SDK.DebuggerModel.CallFrame[]): Promise<SDK.DebuggerModel.CallFrame[]>;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    _globalObjectCleared(event: Common.EventTarget.EventTargetEvent): void;
    addPlugin(plugin: DebuggerLanguagePlugin): void;
    removePlugin(plugin: DebuggerLanguagePlugin): void;
    hasPluginForScript(script: SDK.Script.Script): boolean;
    /**
     * Returns the responsible language plugin and the raw module ID for a script.
     *
     * This ensures that the `addRawModule` call finishes first such that the
     * caller can immediately issue calls to the returned plugin without the
     * risk of racing with the `addRawModule` call. The returned plugin will be
     * set to undefined to indicate that there's no plugin for the script.
     */
    _rawModuleIdAndPluginForScript(script: SDK.Script.Script): Promise<{
        rawModuleId: string;
        plugin: DebuggerLanguagePlugin | null;
    }>;
    uiSourceCodeForURL(debuggerModel: SDK.DebuggerModel.DebuggerModel, url: string): Workspace.UISourceCode.UISourceCode | null;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Promise<Workspace.UISourceCode.UILocation | null>;
    uiLocationToRawLocationRanges(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number | undefined): Promise<{
        start: SDK.DebuggerModel.Location;
        end: SDK.DebuggerModel.Location;
    }[] | null>;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number): Promise<SDK.DebuggerModel.Location[] | null>;
    scriptsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
    _parsedScriptSource(event: Common.EventTarget.EventTargetEvent): void;
    resolveScopeChain(callFrame: SDK.DebuggerModel.CallFrame): Promise<SourceScope[] | null>;
    getFunctionInfo(script: SDK.Script.Script, location: SDK.DebuggerModel.Location): Promise<{
        frames: Array<FunctionInfo>;
    }>;
    getInlinedFunctionRanges(rawLocation: SDK.DebuggerModel.Location): Promise<{
        start: SDK.DebuggerModel.Location;
        end: SDK.DebuggerModel.Location;
    }[]>;
    getInlinedCalleesRanges(rawLocation: SDK.DebuggerModel.Location): Promise<{
        start: SDK.DebuggerModel.Location;
        end: SDK.DebuggerModel.Location;
    }[]>;
    getMappedLines(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<Set<number> | undefined>;
}
declare class ModelData {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _project: ContentProviderBasedProject;
    _uiSourceCodeToScripts: Map<Workspace.UISourceCode.UISourceCode, SDK.Script.Script[]>;
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, workspace: Workspace.Workspace.WorkspaceImpl);
    _addSourceFiles(script: SDK.Script.Script, urls: string[]): void;
    _removeScript(script: SDK.Script.Script): void;
    _dispose(): void;
}
export interface RawModule {
    url: string;
    code?: ArrayBuffer;
}
export interface RawLocationRange {
    rawModuleId: string;
    startOffset: number;
    endOffset: number;
}
export interface RawLocation {
    rawModuleId: string;
    codeOffset: number;
    inlineFrameIndex: number;
}
export interface SourceLocation {
    rawModuleId: string;
    sourceFileURL: string;
    lineNumber: number;
    columnNumber: number;
}
export interface Variable {
    scope: string;
    name: string;
    type: string;
    nestedName: string[] | null;
}
export interface VariableValue {
    value: string | VariableValue[];
    js_type: string;
    type: string;
    name: string;
}
export interface EvaluatorModule {
    code?: ArrayBuffer;
    constantValue?: VariableValue;
}
export interface ScopeInfo {
    type: string;
    typeName: string;
    icon?: string;
}
export interface FunctionInfo {
    name: string;
}
export interface FieldInfo {
    name?: string;
    offset: number;
    typeId: any;
}
export interface TypeInfo {
    typeNames: string[];
    typeId: any;
    members: FieldInfo[];
    alignment: number;
    arraySize: number;
    size: number;
    canExpand: boolean;
    hasValue: boolean;
}
export interface EvalBase {
    rootType: TypeInfo;
    payload: any;
}
export declare class DebuggerLanguagePlugin {
    name: string;
    constructor(name: string);
    handleScript(_script: SDK.Script.Script): boolean;
    dispose(): void;
    /** Notify the plugin about a new script
      */
    addRawModule(_rawModuleId: string, _symbolsURL: string, _rawModule: RawModule): Promise<string[]>;
    /** Find locations in raw modules from a location in a source file
      */
    sourceLocationToRawLocation(_sourceLocation: SourceLocation): Promise<RawLocationRange[]>;
    /** Find locations in source files from a location in a raw module
      */
    rawLocationToSourceLocation(_rawLocation: RawLocation): Promise<SourceLocation[]>;
    /** Return detailed information about a scope
       */
    getScopeInfo(_type: string): Promise<ScopeInfo>;
    /** List all variables in lexical scope at a given location in a raw module
      */
    listVariablesInScope(_rawLocation: RawLocation): Promise<Variable[]>;
    /**
     * Notifies the plugin that a script is removed.
     */
    removeRawModule(_rawModuleId: string): Promise<void>;
    getTypeInfo(_expression: string, _context: RawLocation): Promise<{
        typeInfos: Array<TypeInfo>;
        base: EvalBase;
    } | null>;
    getFormatter(_expressionOrField: string | {
        base: EvalBase;
        field: Array<FieldInfo>;
    }, _context: RawLocation): Promise<{
        js: string;
    } | null>;
    getInspectableAddress(_field: {
        base: EvalBase;
        field: Array<FieldInfo>;
    }): Promise<{
        js: string;
    }>;
    /**
     * Find locations in source files from a location in a raw module
     */
    getFunctionInfo(_rawLocation: RawLocation): Promise<{
        frames: Array<FunctionInfo>;
    }>;
    /**
     * Find locations in raw modules corresponding to the inline function
     * that rawLocation is in. Used for stepping out of an inline function.
     */
    getInlinedFunctionRanges(_rawLocation: RawLocation): Promise<RawLocationRange[]>;
    /**
     * Find locations in raw modules corresponding to inline functions
     * called by the function or inline frame that rawLocation is in.
     * Used for stepping over inline functions.
     */
    getInlinedCalleesRanges(_rawLocation: RawLocation): Promise<RawLocationRange[]>;
    getMappedLines(_rawModuleId: string, _sourceFileURL: string): Promise<number[] | undefined>;
}
export {};
