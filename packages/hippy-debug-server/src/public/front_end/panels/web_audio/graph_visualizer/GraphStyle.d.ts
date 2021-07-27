export declare const PortPadding = 4;
export declare const InputPortRadius = 10;
export declare const AudioParamRadius = 5;
export declare const LeftMarginOfText = 12;
export declare const RightMarginOfText = 30;
export declare const LeftSideTopPadding = 5;
export declare const BottomPaddingWithoutParam = 6;
export declare const BottomPaddingWithParam = 8;
export declare const ArrowHeadSize = 12;
export declare const GraphPadding = 20;
export declare const GraphMargin = 20;
export declare const TotalInputPortHeight: number;
export declare const TotalOutputPortHeight: number;
export declare const TotalParamPortHeight: number;
export declare const NodeLabelFontStyle = "14px Segoe UI, Arial";
export declare const ParamLabelFontStyle = "12px Segoe UI, Arial";
/**
 * Supported port types.
 */
export declare const enum PortTypes {
    In = "In",
    Out = "Out",
    Param = "Param"
}
export interface Size {
    width: number;
    height: number;
}
export interface Point {
    x: number;
    y: number;
}
export interface NodeLayout {
    inputPortSectionHeight: number;
    outputPortSectionHeight: number;
    maxTextLength: number;
    totalHeight: number;
}
export interface Port {
    id: string;
    type: PortTypes;
    label?: string;
    x: number;
    y: number;
}
export interface NodeCreationData {
    nodeId: string;
    nodeType: string;
    numberOfInputs: number;
    numberOfOutputs: number;
}
export interface ParamCreationData {
    paramId: string;
    paramType: string;
    nodeId: string;
}
export interface NodesConnectionData {
    sourceId: string;
    destinationId: string;
    sourceOutputIndex?: number;
    destinationInputIndex?: number;
}
export interface NodesDisconnectionData {
    sourceId: string;
    destinationId?: string | null;
    sourceOutputIndex?: number;
    destinationInputIndex?: number;
}
export interface NodesDisconnectionDataWithDestination {
    sourceId: string;
    destinationId: string;
    sourceOutputIndex?: number;
    destinationInputIndex?: number;
}
export interface NodeParamConnectionData {
    sourceId: string;
    destinationId: string;
    sourceOutputIndex?: number;
    destinationParamId: string;
}
export interface NodeParamDisconnectionData {
    sourceId: string;
    destinationId: string;
    sourceOutputIndex?: number;
    destinationParamId: string;
}
