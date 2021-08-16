import type * as ProtocolClient from '../protocol_client/protocol_client.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import { CSSModel } from './CSSModel.js';
import { OverlayModel } from './OverlayModel.js';
import type { RemoteObject } from './RemoteObject.js';
import { RuntimeModel } from './RuntimeModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class DOMNode {
    _domModel: DOMModel;
    _agent: ProtocolProxyApi.DOMApi;
    ownerDocument: DOMDocument | null;
    _isInShadowTree: boolean;
    id: number;
    index: number | undefined;
    _backendNodeId: number;
    _nodeType: number;
    _nodeName: string;
    _localName: string;
    _nodeValue: string;
    _pseudoType: Protocol.DOM.PseudoType | undefined;
    _shadowRootType: Protocol.DOM.ShadowRootType | undefined;
    _frameOwnerFrameId: string | null;
    _xmlVersion: string | undefined;
    _isSVGNode: boolean;
    _creationStackTrace: Promise<Protocol.Runtime.StackTrace | null> | null;
    _pseudoElements: Map<string, DOMNode>;
    _distributedNodes: DOMNodeShortcut[];
    _shadowRoots: DOMNode[];
    _attributes: Map<string, Attribute>;
    _markers: Map<string, any>;
    _subtreeMarkerCount: number;
    _childNodeCount: number;
    _children: DOMNode[] | null;
    nextSibling: DOMNode | null;
    previousSibling: DOMNode | null;
    firstChild: DOMNode | null;
    lastChild: DOMNode | null;
    parentNode: DOMNode | null;
    _templateContent?: DOMNode;
    _contentDocument?: DOMDocument;
    _childDocumentPromiseForTesting?: Promise<DOMDocument | null>;
    _importedDocument?: DOMNode;
    publicId?: string;
    systemId?: string;
    internalSubset?: string;
    name?: string;
    value?: string;
    constructor(domModel: DOMModel);
    static create(domModel: DOMModel, doc: DOMDocument | null, isInShadowTree: boolean, payload: Protocol.DOM.Node): DOMNode;
    _init(doc: DOMDocument | null, isInShadowTree: boolean, payload: Protocol.DOM.Node): void;
    private createChildDocumentPromiseForTesting;
    isAdFrameNode(): boolean;
    isSVGNode(): boolean;
    creationStackTrace(): Promise<Protocol.Runtime.StackTrace | null>;
    domModel(): DOMModel;
    backendNodeId(): number;
    children(): DOMNode[] | null;
    hasAttributes(): boolean;
    childNodeCount(): number;
    hasShadowRoots(): boolean;
    shadowRoots(): DOMNode[];
    templateContent(): DOMNode | null;
    contentDocument(): DOMNode | null;
    isIframe(): boolean;
    isPortal(): boolean;
    importedDocument(): DOMNode | null;
    nodeType(): number;
    nodeName(): string;
    pseudoType(): string | undefined;
    hasPseudoElements(): boolean;
    pseudoElements(): Map<string, DOMNode>;
    beforePseudoElement(): DOMNode | null;
    afterPseudoElement(): DOMNode | null;
    markerPseudoElement(): DOMNode | null;
    isInsertionPoint(): boolean;
    distributedNodes(): DOMNodeShortcut[];
    isInShadowTree(): boolean;
    ancestorShadowHost(): DOMNode | null;
    ancestorShadowRoot(): DOMNode | null;
    ancestorUserAgentShadowRoot(): DOMNode | null;
    isShadowRoot(): boolean;
    shadowRootType(): string | null;
    nodeNameInCorrectCase(): string;
    setNodeName(name: string, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null, arg1: DOMNode | null) => any)): void;
    localName(): string;
    nodeValue(): string;
    setNodeValue(value: string, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null) => any)): void;
    getAttribute(name: string): string | undefined;
    setAttribute(name: string, text: string, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null) => any)): void;
    setAttributeValue(name: string, value: string, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null) => any)): void;
    setAttributeValuePromise(name: string, value: string): Promise<string | null>;
    attributes(): Attribute[];
    removeAttribute(name: string): Promise<void>;
    getChildNodes(callback: (arg0: Array<DOMNode> | null) => void): void;
    getSubtree(depth: number, pierce: boolean): Promise<DOMNode[] | null>;
    getOuterHTML(): Promise<string | null>;
    setOuterHTML(html: string, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null) => any)): void;
    removeNode(callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null, arg1?: Protocol.DOM.NodeId | undefined) => any)): void;
    copyNode(): Promise<string | null>;
    path(): string;
    isAncestor(node: DOMNode): boolean;
    isDescendant(descendant: DOMNode): boolean;
    frameOwnerFrameId(): string | null;
    frameId(): string | null;
    _setAttributesPayload(attrs: string[]): boolean;
    _insertChild(prev: DOMNode, payload: Protocol.DOM.Node): DOMNode;
    _removeChild(node: DOMNode): void;
    _setChildrenPayload(payloads: Protocol.DOM.Node[]): void;
    _setPseudoElements(payloads: Protocol.DOM.Node[] | undefined): void;
    _setDistributedNodePayloads(payloads: Protocol.DOM.BackendNode[]): void;
    _renumber(): void;
    _addAttribute(name: string, value: string): void;
    _setAttribute(name: string, value: string): void;
    _removeAttribute(name: string): void;
    copyTo(targetNode: DOMNode, anchorNode: DOMNode | null, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null, arg1: DOMNode | null) => any)): void;
    moveTo(targetNode: DOMNode, anchorNode: DOMNode | null, callback?: ((arg0: ProtocolClient.InspectorBackend.ProtocolError | null, arg1: DOMNode | null) => any)): void;
    isXMLNode(): boolean;
    setMarker(name: string, value: any): void;
    marker<T>(name: string): T | null;
    traverseMarkers(visitor: (arg0: DOMNode, arg1: string) => void): void;
    resolveURL(url: string): string | null;
    highlight(mode?: string): void;
    highlightForTwoSeconds(): void;
    resolveToObject(objectGroup?: string): Promise<RemoteObject | null>;
    boxModel(): Promise<Protocol.DOM.BoxModel | null>;
    setAsInspectedNode(): Promise<void>;
    enclosingElementOrSelf(): DOMNode | null;
    scrollIntoView(): Promise<void>;
    focus(): Promise<void>;
    simpleSelector(): string;
}
export declare namespace DOMNode {
    enum PseudoElementNames {
        Before = "before",
        After = "after",
        Marker = "marker"
    }
    enum ShadowRootTypes {
        UserAgent = "user-agent",
        Open = "open",
        Closed = "closed"
    }
}
export declare class DeferredDOMNode {
    _domModel: DOMModel;
    _backendNodeId: number;
    constructor(target: Target, backendNodeId: number);
    resolve(callback: (arg0: DOMNode | null) => void): void;
    resolvePromise(): Promise<DOMNode | null>;
    backendNodeId(): number;
    domModel(): DOMModel;
    highlight(): void;
}
export declare class DOMNodeShortcut {
    nodeType: number;
    nodeName: string;
    deferredNode: DeferredDOMNode;
    constructor(target: Target, backendNodeId: number, nodeType: number, nodeName: string);
}
export declare class DOMDocument extends DOMNode {
    body: DOMNode | null;
    documentElement: DOMNode | null;
    documentURL: string;
    baseURL: string;
    constructor(domModel: DOMModel, payload: Protocol.DOM.Node);
}
export declare class DOMModel extends SDKModel {
    _agent: ProtocolProxyApi.DOMApi;
    _idToDOMNode: {
        [x: number]: DOMNode;
    };
    _document: DOMDocument | null;
    _attributeLoadNodeIds: Set<number>;
    _runtimeModel: RuntimeModel;
    _lastMutationId: number;
    _pendingDocumentRequestPromise: Promise<DOMDocument | null> | null;
    _frameOwnerNode?: DOMNode | null;
    _loadNodeAttributesTimeout?: number;
    _searchId?: string;
    constructor(target: Target);
    runtimeModel(): RuntimeModel;
    cssModel(): CSSModel;
    overlayModel(): OverlayModel;
    static cancelSearch(): void;
    _scheduleMutationEvent(node: DOMNode): void;
    requestDocument(): Promise<DOMDocument | null>;
    getOwnerNodeForFrame(frameId: string): Promise<DeferredDOMNode | null>;
    _requestDocument(): Promise<DOMDocument | null>;
    existingDocument(): DOMDocument | null;
    pushNodeToFrontend(objectId: string): Promise<DOMNode | null>;
    pushNodeByPathToFrontend(path: string): Promise<number | null>;
    pushNodesByBackendIdsToFrontend(backendNodeIds: Set<number>): Promise<Map<number, DOMNode | null> | null>;
    _attributeModified(nodeId: number, name: string, value: string): void;
    _attributeRemoved(nodeId: number, name: string): void;
    _inlineStyleInvalidated(nodeIds: number[]): void;
    _loadNodeAttributes(): void;
    _characterDataModified(nodeId: number, newValue: string): void;
    nodeForId(nodeId: number | null): DOMNode | null;
    _documentUpdated(): void;
    _setDocument(payload: Protocol.DOM.Node | null): void;
    _setDetachedRoot(payload: Protocol.DOM.Node): void;
    _setChildNodes(parentId: number, payloads: Protocol.DOM.Node[]): void;
    _childNodeCountUpdated(nodeId: number, newValue: number): void;
    _childNodeInserted(parentId: number, prevId: number, payload: Protocol.DOM.Node): void;
    _childNodeRemoved(parentId: number, nodeId: number): void;
    _shadowRootPushed(hostId: number, root: Protocol.DOM.Node): void;
    _shadowRootPopped(hostId: number, rootId: number): void;
    _pseudoElementAdded(parentId: number, pseudoElement: Protocol.DOM.Node): void;
    _pseudoElementRemoved(parentId: number, pseudoElementId: number): void;
    _distributedNodesUpdated(insertionPointId: number, distributedNodes: Protocol.DOM.BackendNode[]): void;
    _unbind(node: DOMNode): void;
    getNodesByStyle(computedStyles: {
        name: string;
        value: string;
    }[], pierce?: boolean): Promise<number[]>;
    performSearch(query: string, includeUserAgentShadowDOM: boolean): Promise<number>;
    searchResult(index: number): Promise<DOMNode | null>;
    _cancelSearch(): void;
    classNamesPromise(nodeId: number): Promise<string[]>;
    querySelector(nodeId: number, selector: string): Promise<number | null>;
    querySelectorAll(nodeId: number, selector: string): Promise<number[] | null>;
    markUndoableState(minorChange?: boolean): void;
    nodeForLocation(x: number, y: number, includeUserAgentShadowDOM: boolean): Promise<DOMNode | null>;
    pushObjectAsNodeToFrontend(object: RemoteObject): Promise<DOMNode | null>;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    dispose(): void;
    parentModel(): DOMModel | null;
}
export declare enum Events {
    AttrModified = "AttrModified",
    AttrRemoved = "AttrRemoved",
    CharacterDataModified = "CharacterDataModified",
    DOMMutated = "DOMMutated",
    NodeInserted = "NodeInserted",
    NodeRemoved = "NodeRemoved",
    DocumentUpdated = "DocumentUpdated",
    ChildNodeCountUpdated = "ChildNodeCountUpdated",
    DistributedNodesChanged = "DistributedNodesChanged",
    MarkersChanged = "MarkersChanged"
}
export declare class DOMModelUndoStack {
    _stack: DOMModel[];
    _index: number;
    _lastModelWithMinorChange: DOMModel | null;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): DOMModelUndoStack;
    _markUndoableState(model: DOMModel, minorChange: boolean): Promise<void>;
    undo(): Promise<void>;
    redo(): Promise<void>;
    _dispose(model: DOMModel): void;
}
export interface Attribute {
    name: string;
    value: string;
    _node: DOMNode;
}
