import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import { DebuggerModel } from './DebuggerModel.js';
import type { DOMNode } from './DOMModel.js';
import { DeferredDOMNode, DOMModel } from './DOMModel.js';
import { OverlayPersistentHighlighter } from './OverlayPersistentHighlighter.js';
import type { RemoteObject } from './RemoteObject.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export interface HighlightColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface HighlightRect {
    x: number;
    y: number;
    width: number;
    height: number;
    color: HighlightColor;
    outlineColor: HighlightColor;
}
export interface Hinge {
    width: number;
    height: number;
    x: number;
    y: number;
    contentColor: HighlightColor;
    outlineColor: HighlightColor;
}
export declare class OverlayModel extends SDKModel implements ProtocolProxyApi.OverlayDispatcher {
    _domModel: DOMModel;
    _overlayAgent: ProtocolProxyApi.OverlayApi;
    _debuggerModel: DebuggerModel | null;
    _inspectModeEnabled: boolean;
    _hideHighlightTimeout: number | null;
    _defaultHighlighter: Highlighter;
    _highlighter: Highlighter;
    _showPaintRectsSetting: Common.Settings.Setting<any>;
    _showLayoutShiftRegionsSetting: Common.Settings.Setting<any>;
    _showAdHighlightsSetting: Common.Settings.Setting<any>;
    _showDebugBordersSetting: Common.Settings.Setting<any>;
    _showFPSCounterSetting: Common.Settings.Setting<any>;
    _showScrollBottleneckRectsSetting: Common.Settings.Setting<any>;
    _showHitTestBordersSetting: Common.Settings.Setting<any>;
    _showWebVitalsSetting: Common.Settings.Setting<any>;
    _registeredListeners: Common.EventTarget.EventDescriptor[];
    _showViewportSizeOnResize: boolean;
    _peristentHighlighter: OverlayPersistentHighlighter | null;
    _sourceOrderHighlighter: SourceOrderHighlighter;
    _sourceOrderModeActive: boolean;
    constructor(target: Target);
    static highlightObjectAsDOMNode(object: RemoteObject): void;
    static hideDOMNodeHighlight(): void;
    static muteHighlight(): Promise<void[]>;
    static unmuteHighlight(): Promise<void[]>;
    static highlightRect(rect: HighlightRect): void;
    static clearHighlight(): void;
    getDOMModel(): DOMModel;
    highlightRect({ x, y, width, height, color, outlineColor }: HighlightRect): Promise<any>;
    clearHighlight(): Promise<any>;
    _wireAgentToSettings(): Promise<void>;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    setShowViewportSizeOnResize(show: boolean): void;
    _updatePausedInDebuggerMessage(): void;
    setHighlighter(highlighter: Highlighter | null): void;
    setInspectMode(mode: Protocol.Overlay.InspectMode, showDetailedTooltip?: boolean | undefined): Promise<void>;
    inspectModeEnabled(): boolean;
    highlightInOverlay(data: HighlightData, mode?: string, showInfo?: boolean): void;
    highlightInOverlayForTwoSeconds(data: HighlightData): void;
    highlightGridInPersistentOverlay(nodeId: number): void;
    isHighlightedGridInPersistentOverlay(nodeId: number): boolean;
    hideGridInPersistentOverlay(nodeId: number): void;
    highlightScrollSnapInPersistentOverlay(nodeId: number): void;
    isHighlightedScrollSnapInPersistentOverlay(nodeId: number): boolean;
    hideScrollSnapInPersistentOverlay(nodeId: number): void;
    highlightFlexContainerInPersistentOverlay(nodeId: number): void;
    isHighlightedFlexContainerInPersistentOverlay(nodeId: number): boolean;
    hideFlexContainerInPersistentOverlay(nodeId: number): void;
    highlightSourceOrderInOverlay(node: DOMNode): void;
    colorOfGridInPersistentOverlay(nodeId: number): string | null;
    setColorOfGridInPersistentOverlay(nodeId: number, colorStr: string): void;
    colorOfFlexInPersistentOverlay(nodeId: number): string | null;
    setColorOfFlexInPersistentOverlay(nodeId: number, colorStr: string): void;
    hideSourceOrderInOverlay(): void;
    setSourceOrderActive(isActive: boolean): void;
    sourceOrderModeActive(): boolean;
    _delayedHideHighlight(delay: number): void;
    highlightFrame(frameId: string): void;
    showHingeForDualScreen(hinge: Hinge | null): void;
    _buildHighlightConfig(mode?: string | undefined, showDetailedToolip?: boolean | undefined): Protocol.Overlay.HighlightConfig;
    nodeHighlightRequested({ nodeId }: Protocol.Overlay.NodeHighlightRequestedEvent): void;
    static setInspectNodeHandler(handler: (arg0: DOMNode) => void): void;
    inspectNodeRequested({ backendNodeId }: Protocol.Overlay.InspectNodeRequestedEvent): void;
    screenshotRequested({ viewport }: Protocol.Overlay.ScreenshotRequestedEvent): void;
    inspectModeCanceled(): void;
    static _inspectNodeHandler: ((node: DOMNode) => void) | null;
}
export declare enum Events {
    InspectModeWillBeToggled = "InspectModeWillBeToggled",
    ExitedInspectMode = "InspectModeExited",
    HighlightNodeRequested = "HighlightNodeRequested",
    ScreenshotRequested = "ScreenshotRequested",
    PersistentGridOverlayStateChanged = "PersistentGridOverlayStateChanged",
    PersistentFlexContainerOverlayStateChanged = "PersistentFlexContainerOverlayStateChanged",
    PersistentScrollSnapOverlayStateChanged = "PersistentScrollSnapOverlayStateChanged"
}
export interface Highlighter {
    highlightInOverlay(data: HighlightData, config: Protocol.Overlay.HighlightConfig): void;
    setInspectMode(mode: Protocol.Overlay.InspectMode, config: Protocol.Overlay.HighlightConfig): Promise<void>;
    highlightFrame(frameId: string): void;
}
export declare class SourceOrderHighlighter {
    _model: OverlayModel;
    constructor(model: OverlayModel);
    highlightSourceOrderInOverlay(node: DOMNode, sourceOrderConfig: Protocol.Overlay.SourceOrderConfig): void;
    hideSourceOrderHighlight(): void;
}
export interface HighlightNodeData {
    node: DOMNode;
    selectorList?: string;
}
export interface HighlightDeferredNode {
    deferredNode: DeferredDOMNode;
}
export interface HighlightObjectData {
    object: RemoteObject;
    selectorList?: string;
}
export declare type HighlightData = HighlightNodeData | HighlightDeferredNode | HighlightObjectData | {
    clear: boolean;
};
