import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Workspace from '../workspace/workspace.js';
import type { LiveLocation as LiveLocationInterface, LiveLocationPool } from './LiveLocation.js';
import { LiveLocationWithPool } from './LiveLocation.js';
import { SASSSourceMapping } from './SASSSourceMapping.js';
import { StylesSourceMapping } from './StylesSourceMapping.js';
export declare class CSSWorkspaceBinding implements SDK.TargetManager.SDKModelObserver<SDK.CSSModel.CSSModel> {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _modelToInfo: Map<SDK.CSSModel.CSSModel, ModelInfo>;
    _sourceMappings: SourceMapping[];
    _liveLocationPromises: Set<Promise<unknown>>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        targetManager: SDK.TargetManager.TargetManager | null;
        workspace: Workspace.Workspace.WorkspaceImpl | null;
    }): CSSWorkspaceBinding;
    _getCSSModelInfo(cssModel: SDK.CSSModel.CSSModel): ModelInfo;
    modelAdded(cssModel: SDK.CSSModel.CSSModel): void;
    modelRemoved(cssModel: SDK.CSSModel.CSSModel): void;
    /**
     * The promise returned by this function is resolved once all *currently*
     * pending LiveLocations are processed.
     */
    pendingLiveLocationChangesPromise(): Promise<void>;
    _recordLiveLocationChange(promise: Promise<unknown>): void;
    updateLocations(header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): Promise<void>;
    createLiveLocation(rawLocation: SDK.CSSModel.CSSLocation, updateDelegate: (arg0: LiveLocationInterface) => Promise<void>, locationPool: LiveLocationPool): Promise<LiveLocation>;
    propertyUILocation(cssProperty: SDK.CSSProperty.CSSProperty, forName: boolean): Workspace.UISourceCode.UILocation | null;
    rawLocationToUILocation(rawLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
    addSourceMapping(sourceMapping: SourceMapping): void;
}
/**
 * @interface
 */
export interface SourceMapping {
    rawLocationToUILocation(rawLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
}
export declare class ModelInfo {
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _stylesSourceMapping: StylesSourceMapping;
    _sassSourceMapping: SASSSourceMapping;
    _locations: Platform.MapUtilities.Multimap<SDK.CSSStyleSheetHeader.CSSStyleSheetHeader, LiveLocation>;
    _unboundLocations: Platform.MapUtilities.Multimap<string, LiveLocation>;
    constructor(cssModel: SDK.CSSModel.CSSModel, workspace: Workspace.Workspace.WorkspaceImpl);
    _createLiveLocation(rawLocation: SDK.CSSModel.CSSLocation, updateDelegate: (arg0: LiveLocationInterface) => Promise<void>, locationPool: LiveLocationPool): Promise<LiveLocation>;
    _disposeLocation(location: LiveLocation): void;
    _updateLocations(header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader): Promise<void[]>;
    _styleSheetAdded(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _styleSheetRemoved(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _rawLocationToUILocation(rawLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    _uiLocationToRawLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
    _dispose(): void;
}
export declare class LiveLocation extends LiveLocationWithPool {
    _url: string;
    _lineNumber: number;
    _columnNumber: number;
    _info: ModelInfo;
    _header: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader | null;
    constructor(rawLocation: SDK.CSSModel.CSSLocation, info: ModelInfo, updateDelegate: (arg0: LiveLocationInterface) => Promise<void>, locationPool: LiveLocationPool);
    header(): SDK.CSSStyleSheetHeader.CSSStyleSheetHeader | null;
    uiLocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    dispose(): void;
    isIgnoreListed(): Promise<boolean>;
}
