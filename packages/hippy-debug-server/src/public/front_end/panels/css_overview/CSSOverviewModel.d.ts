import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import type { ContrastIssue } from './CSSOverviewCompletedView.js';
import type { UnusedDeclaration } from './CSSOverviewUnusedDeclarations.js';
interface NodeStyleStats {
    elementCount: number;
    backgroundColors: Map<string, Set<number>>;
    textColors: Map<string, Set<number>>;
    textColorContrastIssues: Map<string, ContrastIssue[]>;
    fillColors: Map<string, Set<number>>;
    borderColors: Map<string, Set<number>>;
    fontInfo: Map<string, Map<string, Map<string, number[]>>>;
    unusedDeclarations: Map<string, UnusedDeclaration[]>;
}
export interface GlobalStyleStats {
    styleRules: number;
    inlineStyles: number;
    externalSheets: number;
    stats: {
        type: number;
        class: number;
        id: number;
        universal: number;
        attribute: number;
        nonSimple: number;
    };
}
export declare class CSSOverviewModel extends SDK.SDKModel.SDKModel {
    _runtimeAgent: ProtocolProxyApi.RuntimeApi;
    _cssAgent: ProtocolProxyApi.CSSApi;
    _domAgent: ProtocolProxyApi.DOMApi;
    _domSnapshotAgent: ProtocolProxyApi.DOMSnapshotApi;
    _overlayAgent: ProtocolProxyApi.OverlayApi;
    constructor(target: SDK.Target.Target);
    highlightNode(node: number): void;
    getNodeStyleStats(): Promise<NodeStyleStats>;
    getComputedStyleForNode(nodeId: Protocol.DOM.NodeId): Promise<Protocol.CSS.GetComputedStyleForNodeResponse>;
    getMediaQueries(): Promise<Map<string, Protocol.CSS.CSSMedia[]>>;
    getGlobalStylesheetStats(): Promise<GlobalStyleStats | void>;
}
export {};
