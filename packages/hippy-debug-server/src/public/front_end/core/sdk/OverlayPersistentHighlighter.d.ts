import * as Protocol from '../../generated/protocol.js';
import * as Common from '../common/common.js';
import { OverlayColorGenerator } from './OverlayColorGenerator.js';
export declare class OverlayPersistentHighlighter {
    _model: OverlayModel;
    _gridHighlights: Map<number, Protocol.Overlay.GridHighlightConfig>;
    _scrollSnapHighlights: Map<number, Protocol.Overlay.ScrollSnapContainerHighlightConfig>;
    _flexHighlights: Map<number, Protocol.Overlay.FlexContainerHighlightConfig>;
    _colors: Map<number, Common.Color.Color>;
    _gridColorGenerator: OverlayColorGenerator;
    _flexColorGenerator: OverlayColorGenerator;
    _flexEnabled: boolean;
    _showGridLineLabelsSetting: Common.Settings.Setting<any>;
    _extendGridLinesSetting: Common.Settings.Setting<any>;
    _showGridAreasSetting: Common.Settings.Setting<any>;
    _showGridTrackSizesSetting: Common.Settings.Setting<any>;
    constructor(model: OverlayModel, flexEnabled?: boolean);
    _onSettingChange(): void;
    _buildGridHighlightConfig(nodeId: number): Protocol.Overlay.GridHighlightConfig;
    _buildFlexContainerHighlightConfig(nodeId: number): Protocol.Overlay.FlexContainerHighlightConfig;
    _buildScrollSnapContainerHighlightConfig(_nodeId: number): Protocol.Overlay.ScrollSnapContainerHighlightConfig;
    highlightGridInOverlay(nodeId: number): void;
    isGridHighlighted(nodeId: number): boolean;
    colorOfGrid(nodeId: number): Common.Color.Color;
    setColorOfGrid(nodeId: number, color: Common.Color.Color): void;
    hideGridInOverlay(nodeId: number): void;
    highlightScrollSnapInOverlay(nodeId: number): void;
    isScrollSnapHighlighted(nodeId: number): boolean;
    hideScrollSnapInOverlay(nodeId: number): void;
    highlightFlexInOverlay(nodeId: number): void;
    isFlexHighlighted(nodeId: number): boolean;
    colorOfFlex(nodeId: number): Common.Color.Color;
    setColorOfFlex(nodeId: number, color: Common.Color.Color): void;
    hideFlexInOverlay(nodeId: number): void;
    hideAllInOverlay(): void;
    refreshHighlights(): void;
    _updateHighlightsForDeletedNodes(highlights: Map<number, unknown>): boolean;
    resetOverlay(): void;
    _updateHighlightsInOverlay(): void;
    _updateGridHighlightsInOverlay(): void;
    _updateFlexHighlightsInOverlay(): void;
    _updateScrollSnapHighlightsInOverlay(): void;
}
/**
 * @interface
 */
export interface DOMModel {
    nodeForId(nodeId: number): void;
}
/**
 * @interface
 */
export interface OverlayAgent {
    invoke_setShowGridOverlays(param: {
        gridNodeHighlightConfigs: Array<{
            nodeId: number;
            gridHighlightConfig: Protocol.Overlay.GridHighlightConfig;
        }>;
    }): void;
    invoke_setShowFlexOverlays(param: {
        flexNodeHighlightConfigs: Array<{
            nodeId: number;
            flexContainerHighlightConfig: Protocol.Overlay.FlexContainerHighlightConfig;
        }>;
    }): void;
    invoke_setShowScrollSnapOverlays(param: {
        scrollSnapHighlightConfigs: Array<{
            nodeId: number;
        }>;
    }): void;
}
/**
 * @interface
 */
export interface Target {
    overlayAgent(): OverlayAgent;
}
/**
 * @interface
 */
export interface OverlayModel {
    getDOMModel(): DOMModel;
    target(): Target;
    setShowViewportSizeOnResize(value: boolean): void;
}
