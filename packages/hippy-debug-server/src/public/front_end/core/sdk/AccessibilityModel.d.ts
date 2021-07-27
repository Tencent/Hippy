import type * as Protocol from '../../generated/protocol.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type { DOMNode } from './DOMModel.js';
import { DeferredDOMNode } from './DOMModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare enum CoreAxPropertyName {
    Name = "name",
    Description = "description",
    Value = "value",
    Role = "role"
}
export interface CoreOrProtocolAxProperty {
    name: CoreAxPropertyName | Protocol.Accessibility.AXPropertyName;
    value: Protocol.Accessibility.AXValue;
}
export declare class AccessibilityNode {
    _accessibilityModel: AccessibilityModel;
    _agent: ProtocolProxyApi.AccessibilityApi;
    _id: string;
    _backendDOMNodeId: number | null;
    _deferredDOMNode: DeferredDOMNode | null;
    _ignored: boolean;
    _ignoredReasons: Protocol.Accessibility.AXProperty[] | undefined;
    _role: Protocol.Accessibility.AXValue | null;
    _name: Protocol.Accessibility.AXValue | null;
    _description: Protocol.Accessibility.AXValue | null;
    _value: Protocol.Accessibility.AXValue | null;
    _properties: Protocol.Accessibility.AXProperty[] | null;
    _childIds: string[] | null;
    _parentNode: AccessibilityNode | null;
    constructor(accessibilityModel: AccessibilityModel, payload: Protocol.Accessibility.AXNode);
    id(): string;
    accessibilityModel(): AccessibilityModel;
    ignored(): boolean;
    ignoredReasons(): Protocol.Accessibility.AXProperty[] | null;
    role(): Protocol.Accessibility.AXValue | null;
    coreProperties(): CoreOrProtocolAxProperty[];
    name(): Protocol.Accessibility.AXValue | null;
    description(): Protocol.Accessibility.AXValue | null;
    value(): Protocol.Accessibility.AXValue | null;
    properties(): Protocol.Accessibility.AXProperty[] | null;
    parentNode(): AccessibilityNode | null;
    _setParentNode(parentNode: AccessibilityNode | null): void;
    isDOMNode(): boolean;
    backendDOMNodeId(): number | null;
    deferredDOMNode(): DeferredDOMNode | null;
    highlightDOMNode(): void;
    children(): AccessibilityNode[];
    numChildren(): number;
    hasOnlyUnloadedChildren(): boolean;
}
export declare class AccessibilityModel extends SDKModel {
    _agent: ProtocolProxyApi.AccessibilityApi;
    _axIdToAXNode: Map<string, AccessibilityNode>;
    _backendDOMNodeIdToAXNode: Map<any, any>;
    constructor(target: Target);
    clear(): void;
    resumeModel(): Promise<void>;
    suspendModel(): Promise<void>;
    requestPartialAXTree(node: DOMNode): Promise<void>;
    requestRootNode(depth?: number): Promise<AccessibilityNode | undefined>;
    requestAXChildren(nodeId: string): Promise<AccessibilityNode[]>;
    /**
     *
     * @param {!DOMNode} node
     * @return ?{!Promise<!AccessibilityNode[]>}
     */
    requestAndLoadSubTreeToNode(node: DOMNode): Promise<AccessibilityNode | null>;
    /**
     * @param {string} axId
     * @return {?AccessibilityNode}
     */
    axNodeForId(axId: string): AccessibilityNode | null;
    _setAXNodeForAXId(axId: string, axNode: AccessibilityNode): void;
    axNodeForDOMNode(domNode: DOMNode | null): AccessibilityNode | null;
    _setAXNodeForBackendDOMNodeId(backendDOMNodeId: number, axNode: AccessibilityNode): void;
}
