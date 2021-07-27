import type * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Workspace from '../workspace/workspace.js';
import { CompilerScriptMapping } from './CompilerScriptMapping.js';
import { DebuggerLanguagePluginManager } from './DebuggerLanguagePlugins.js';
import { DefaultScriptMapping } from './DefaultScriptMapping.js';
import type { LiveLocation, LiveLocationPool } from './LiveLocation.js';
import { LiveLocationWithPool } from './LiveLocation.js';
import type { ResourceScriptFile } from './ResourceScriptMapping.js';
import { ResourceScriptMapping } from './ResourceScriptMapping.js';
export declare class DebuggerWorkspaceBinding implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _sourceMappings: DebuggerSourceMapping[];
    _debuggerModelToData: Map<SDK.DebuggerModel.DebuggerModel, ModelData>;
    _liveLocationPromises: Set<Promise<void | Location | StackTraceTopFrameLocation | null>>;
    pluginManager: DebuggerLanguagePluginManager | null;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        targetManager: SDK.TargetManager.TargetManager | null;
        workspace: Workspace.Workspace.WorkspaceImpl | null;
    }): DebuggerWorkspaceBinding;
    addSourceMapping(sourceMapping: DebuggerSourceMapping): void;
    _computeAutoStepRanges(mode: SDK.DebuggerModel.StepMode, callFrame: SDK.DebuggerModel.CallFrame): Promise<{
        start: SDK.DebuggerModel.Location;
        end: SDK.DebuggerModel.Location;
    }[]>;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    /**
     * The promise returned by this function is resolved once all *currently*
     * pending LiveLocations are processed.
     */
    pendingLiveLocationChangesPromise(): Promise<void | Location | StackTraceTopFrameLocation | null>;
    _recordLiveLocationChange(promise: Promise<void | Location | StackTraceTopFrameLocation | null>): void;
    updateLocations(script: SDK.Script.Script): Promise<void>;
    createLiveLocation(rawLocation: SDK.DebuggerModel.Location, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<Location | null>;
    createStackTraceTopFrameLiveLocation(rawLocations: SDK.DebuggerModel.Location[], updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<LiveLocation>;
    createCallFrameLiveLocation(location: SDK.DebuggerModel.Location, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<Location | null>;
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Promise<Workspace.UISourceCode.UILocation | null>;
    uiSourceCodeForSourceMapSourceURL(debuggerModel: SDK.DebuggerModel.DebuggerModel, url: string, isContentScript: boolean): Workspace.UISourceCode.UISourceCode | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number): Promise<SDK.DebuggerModel.Location[]>;
    uiLocationToRawLocationsForUnformattedJavaScript(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    normalizeUILocation(uiLocation: Workspace.UISourceCode.UILocation): Promise<Workspace.UISourceCode.UILocation>;
    scriptFile(uiSourceCode: Workspace.UISourceCode.UISourceCode, debuggerModel: SDK.DebuggerModel.DebuggerModel): ResourceScriptFile | null;
    scriptsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
    scriptsForResource(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
    supportsConditionalBreakpoints(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    sourceMapForScript(script: SDK.Script.Script): SDK.SourceMap.SourceMap | null;
    _globalObjectCleared(event: Common.EventTarget.EventTargetEvent): void;
    _reset(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    _resetForTest(target: SDK.Target.Target): void;
    _registerCallFrameLiveLocation(debuggerModel: SDK.DebuggerModel.DebuggerModel, location: Location): void;
    _removeLiveLocation(location: Location): void;
    _debuggerResumed(event: Common.EventTarget.EventTargetEvent): void;
}
declare class ModelData {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    callFrameLocations: Set<Location>;
    _defaultMapping: DefaultScriptMapping;
    _resourceMapping: ResourceScriptMapping;
    _compilerMapping: CompilerScriptMapping;
    _locations: Platform.MapUtilities.Multimap<string, Location>;
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    _createLiveLocation(rawLocation: SDK.DebuggerModel.Location, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<Location>;
    _disposeLocation(location: Location): void;
    _updateLocations(script: SDK.Script.Script): Promise<void>;
    _rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    _uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number | undefined): SDK.DebuggerModel.Location[];
    _beforePaused(debuggerPausedDetails: SDK.DebuggerModel.DebuggerPausedDetails): boolean;
    _dispose(): void;
}
export declare class Location extends LiveLocationWithPool {
    _scriptId: string;
    _rawLocation: SDK.DebuggerModel.Location;
    _binding: DebuggerWorkspaceBinding;
    constructor(scriptId: string, rawLocation: SDK.DebuggerModel.Location, binding: DebuggerWorkspaceBinding, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool);
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    dispose(): void;
    isIgnoreListed(): Promise<boolean>;
}
declare class StackTraceTopFrameLocation extends LiveLocationWithPool {
    _updateScheduled: boolean;
    _current: LiveLocation | null;
    _locations: LiveLocation[] | null;
    constructor(updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool);
    static createStackTraceTopFrameLocation(rawLocations: SDK.DebuggerModel.Location[], binding: DebuggerWorkspaceBinding, updateDelegate: (arg0: LiveLocation) => Promise<void>, locationPool: LiveLocationPool): Promise<StackTraceTopFrameLocation>;
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    isIgnoreListed(): Promise<boolean>;
    dispose(): void;
    _scheduleUpdate(): Promise<void>;
    _updateLocation(): Promise<void>;
}
/**
 * @interface
 */
export interface DebuggerSourceMapping {
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber?: number): SDK.DebuggerModel.Location[];
}
export {};
