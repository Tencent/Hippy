import type * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../bindings/bindings.js';
export declare class LanguageExtensionEndpoint extends Bindings.DebuggerLanguagePlugins.DebuggerLanguagePlugin {
    _commands: any;
    _events: any;
    _supportedScriptTypes: {
        language: string;
        symbol_types: Array<string>;
    };
    _port: MessagePort;
    _nextRequestId: number;
    _pendingRequests: Map<any, any>;
    constructor(name: string, supportedScriptTypes: {
        language: string;
        symbol_types: Array<string>;
    }, port: MessagePort);
    _sendRequest(method: string, parameters: any): Promise<any>;
    _onResponse({ data }: MessageEvent<{
        requestId: number;
        result: any;
        error: Error | null;
    } | {
        event: string;
    }>): void;
    handleScript(script: SDK.Script.Script): boolean;
    /** Notify the plugin about a new script
       */
    addRawModule(rawModuleId: string, symbolsURL: string, rawModule: Bindings.DebuggerLanguagePlugins.RawModule): Promise<string[]>;
    /**
     * Notifies the plugin that a script is removed.
     */
    removeRawModule(rawModuleId: string): Promise<void>;
    /** Find locations in raw modules from a location in a source file
       */
    sourceLocationToRawLocation(sourceLocation: Bindings.DebuggerLanguagePlugins.SourceLocation): Promise<Bindings.DebuggerLanguagePlugins.RawLocationRange[]>;
    /** Find locations in source files from a location in a raw module
       */
    rawLocationToSourceLocation(rawLocation: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<Bindings.DebuggerLanguagePlugins.SourceLocation[]>;
    getScopeInfo(type: string): Promise<Bindings.DebuggerLanguagePlugins.ScopeInfo>;
    /** List all variables in lexical scope at a given location in a raw module
       */
    listVariablesInScope(rawLocation: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<Bindings.DebuggerLanguagePlugins.Variable[]>;
    /** List all function names (including inlined frames) at location
       */
    getFunctionInfo(rawLocation: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<{
        frames: Array<Bindings.DebuggerLanguagePlugins.FunctionInfo>;
    }>;
    /** Find locations in raw modules corresponding to the inline function
       *  that rawLocation is in.
       */
    getInlinedFunctionRanges(rawLocation: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<Bindings.DebuggerLanguagePlugins.RawLocationRange[]>;
    /** Find locations in raw modules corresponding to inline functions
       *  called by the function or inline frame that rawLocation is in.
       */
    getInlinedCalleesRanges(rawLocation: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<Bindings.DebuggerLanguagePlugins.RawLocationRange[]>;
    getTypeInfo(expression: string, context: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<{
        typeInfos: Array<Bindings.DebuggerLanguagePlugins.TypeInfo>;
        base: Bindings.DebuggerLanguagePlugins.EvalBase;
    } | null>;
    getFormatter(expressionOrField: string | {
        base: Bindings.DebuggerLanguagePlugins.EvalBase;
        field: Array<Bindings.DebuggerLanguagePlugins.FieldInfo>;
    }, context: Bindings.DebuggerLanguagePlugins.RawLocation): Promise<{
        js: string;
    }>;
    getInspectableAddress(field: {
        base: Bindings.DebuggerLanguagePlugins.EvalBase;
        field: Array<Bindings.DebuggerLanguagePlugins.FieldInfo>;
    }): Promise<{
        js: string;
    }>;
    getMappedLines(rawModuleId: string, sourceFileURL: string): Promise<number[] | undefined>;
    dispose(): void;
}
