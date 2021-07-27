import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
import type { LiveLocation } from './LiveLocation.js';
import { LiveLocationPool } from './LiveLocation.js';
export declare class BreakpointManager extends Common.ObjectWrapper.ObjectWrapper {
    _storage: Storage;
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _targetManager: SDK.TargetManager.TargetManager;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _breakpointsForUISourceCode: Map<Workspace.UISourceCode.UISourceCode, Map<string, BreakpointLocation>>;
    _breakpointByStorageId: Map<string, Breakpoint>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        targetManager: SDK.TargetManager.TargetManager | null;
        workspace: Workspace.Workspace.WorkspaceImpl | null;
        debuggerWorkspaceBinding: DebuggerWorkspaceBinding | null;
    }): BreakpointManager;
    static _breakpointStorageId(url: string, lineNumber: number, columnNumber?: number): string;
    copyBreakpoints(fromURL: string, toSourceCode: Workspace.UISourceCode.UISourceCode): Promise<void>;
    _restoreBreakpoints(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _uiSourceCodeAdded(event: Common.EventTarget.EventTargetEvent): void;
    _uiSourceCodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _projectRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _removeUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    setBreakpoint(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number | undefined, condition: string, enabled: boolean): Promise<Breakpoint>;
    _innerSetBreakpoint(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number | undefined, condition: string, enabled: boolean): Breakpoint;
    findBreakpoint(uiLocation: Workspace.UISourceCode.UILocation): BreakpointLocation | null;
    possibleBreakpoints(uiSourceCode: Workspace.UISourceCode.UISourceCode, textRange: TextUtils.TextRange.TextRange): Promise<Workspace.UISourceCode.UILocation[]>;
    breakpointLocationsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): BreakpointLocation[];
    allBreakpointLocations(): BreakpointLocation[];
    _removeBreakpoint(breakpoint: Breakpoint, removeFromStorage: boolean): void;
    _uiLocationAdded(breakpoint: Breakpoint, uiLocation: Workspace.UISourceCode.UILocation): void;
    _uiLocationRemoved(breakpoint: Breakpoint, uiLocation: Workspace.UISourceCode.UILocation): void;
}
export declare enum Events {
    BreakpointAdded = "breakpoint-added",
    BreakpointRemoved = "breakpoint-removed"
}
export declare class Breakpoint implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    _breakpointManager: BreakpointManager;
    _url: string;
    _lineNumber: number;
    _columnNumber: number | undefined;
    _uiLocations: Set<Workspace.UISourceCode.UILocation>;
    _uiSourceCodes: Set<Workspace.UISourceCode.UISourceCode>;
    _condition: string;
    _enabled: boolean;
    _isRemoved: boolean;
    _currentState: Breakpoint.State | null;
    _modelBreakpoints: Map<SDK.DebuggerModel.DebuggerModel, ModelBreakpoint>;
    constructor(breakpointManager: BreakpointManager, primaryUISourceCode: Workspace.UISourceCode.UISourceCode, url: string, lineNumber: number, columnNumber: number | undefined, condition: string, enabled: boolean);
    refreshInDebugger(): Promise<void>;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    addUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    clearUISourceCodes(): void;
    removeUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    url(): string;
    lineNumber(): number;
    columnNumber(): number | undefined;
    _uiLocationAdded(uiLocation: Workspace.UISourceCode.UILocation): void;
    _uiLocationRemoved(uiLocation: Workspace.UISourceCode.UILocation): void;
    enabled(): boolean;
    bound(): boolean;
    hasBoundScript(): boolean;
    setEnabled(enabled: boolean): void;
    condition(): string;
    setCondition(condition: string): void;
    _updateState(condition: string, enabled: boolean): void;
    _updateBreakpoint(): void;
    remove(keepInStorage: boolean): void;
    _breakpointStorageId(): string;
    _resetLocations(): void;
    _defaultUILocation(uiSourceCode: Workspace.UISourceCode.UISourceCode): Workspace.UISourceCode.UILocation;
    _removeAllUnboundLocations(): void;
    _addAllUnboundLocations(): void;
}
export declare class ModelBreakpoint {
    _debuggerModel: SDK.DebuggerModel.DebuggerModel;
    _breakpoint: Breakpoint;
    _debuggerWorkspaceBinding: DebuggerWorkspaceBinding;
    _liveLocations: LiveLocationPool;
    _uiLocations: Map<LiveLocation, Workspace.UISourceCode.UILocation>;
    _hasPendingUpdate: boolean;
    _isUpdating: boolean;
    _cancelCallback: boolean;
    _currentState: Breakpoint.State | null;
    _breakpointIds: string[];
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, breakpoint: Breakpoint, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    _resetLocations(): void;
    _scheduleUpdateInDebugger(): void;
    _didUpdateInDebugger(): void;
    _scriptDiverged(): boolean;
    _updateInDebugger(callback: () => void): Promise<void>;
    _refreshBreakpoint(): Promise<void>;
    _didSetBreakpointInDebugger(callback: () => void, breakpointIds: string[], locations: SDK.DebuggerModel.Location[]): Promise<void>;
    _didRemoveFromDebugger(): void;
    _breakpointResolved(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _locationUpdated(liveLocation: LiveLocation): Promise<void>;
    _addResolvedLocation(location: SDK.DebuggerModel.Location): Promise<boolean>;
    _cleanUpAfterDebuggerIsGone(): void;
    _removeEventListeners(): void;
}
interface Position {
    url: string;
    scriptId: string;
    scriptHash: string;
    lineNumber: number;
    columnNumber?: number;
}
export declare namespace Breakpoint {
    class State {
        positions: Position[];
        condition: string;
        constructor(positions: Position[], condition: string);
        static equals(stateA?: State | null, stateB?: State | null): boolean;
    }
}
declare class Storage {
    _setting: Common.Settings.Setting<Storage.Item[]>;
    _breakpoints: Map<string, Storage.Item>;
    _muted: boolean | undefined;
    constructor();
    mute(): void;
    unmute(): void;
    breakpointItems(url: string): Storage.Item[];
    _updateBreakpoint(breakpoint: Breakpoint): void;
    _removeBreakpoint(breakpoint: Breakpoint): void;
    _save(): void;
}
declare namespace Storage {
    class Item {
        url: string;
        lineNumber: number;
        columnNumber?: number;
        condition: string;
        enabled: boolean;
        constructor(breakpoint: Breakpoint);
    }
}
export interface BreakpointLocation {
    breakpoint: Breakpoint;
    uiLocation: Workspace.UISourceCode.UILocation;
}
export {};
