import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import type { Location } from './DebuggerModel.js';
import type { DOMNode } from './DOMModel.js';
import { DOMModel } from './DOMModel.js';
import { RemoteObject } from './RemoteObject.js';
import { RuntimeModel } from './RuntimeModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import type { SDKModelObserver } from './TargetManager.js';
export declare class DOMDebuggerModel extends SDKModel {
    _agent: ProtocolProxyApi.DOMDebuggerApi;
    _runtimeModel: RuntimeModel;
    _domModel: DOMModel;
    _domBreakpoints: DOMBreakpoint[];
    _domBreakpointsSetting: Common.Settings.Setting<{
        url: string;
        path: string;
        type: Protocol.DOMDebugger.DOMBreakpointType;
        enabled: boolean;
    }[]>;
    suspended: boolean;
    constructor(target: Target);
    runtimeModel(): RuntimeModel;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    eventListeners(remoteObject: RemoteObject): Promise<EventListener[]>;
    retrieveDOMBreakpoints(): void;
    domBreakpoints(): DOMBreakpoint[];
    hasDOMBreakpoint(node: DOMNode, type: Protocol.DOMDebugger.DOMBreakpointType): boolean;
    setDOMBreakpoint(node: DOMNode, type: Protocol.DOMDebugger.DOMBreakpointType): DOMBreakpoint;
    removeDOMBreakpoint(node: DOMNode, type: Protocol.DOMDebugger.DOMBreakpointType): void;
    removeAllDOMBreakpoints(): void;
    toggleDOMBreakpoint(breakpoint: DOMBreakpoint, enabled: boolean): void;
    _enableDOMBreakpoint(breakpoint: DOMBreakpoint): void;
    _disableDOMBreakpoint(breakpoint: DOMBreakpoint): void;
    _nodeHasBreakpoints(node: DOMNode): boolean;
    resolveDOMBreakpointData(auxData: {
        type: Protocol.DOMDebugger.DOMBreakpointType;
        nodeId: Protocol.DOM.NodeId;
        targetNodeId: Protocol.DOM.NodeId;
        insertion: boolean;
    }): {
        type: Protocol.DOMDebugger.DOMBreakpointType;
        node: DOMNode;
        targetNode: DOMNode | null;
        insertion: boolean;
    } | null;
    _currentURL(): string;
    _documentUpdated(): Promise<void>;
    _removeDOMBreakpoints(filter: (arg0: DOMBreakpoint) => boolean): void;
    _nodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _saveDOMBreakpoints(): void;
}
export declare enum Events {
    DOMBreakpointAdded = "DOMBreakpointAdded",
    DOMBreakpointToggled = "DOMBreakpointToggled",
    DOMBreakpointsRemoved = "DOMBreakpointsRemoved"
}
export declare class DOMBreakpoint {
    domDebuggerModel: DOMDebuggerModel;
    node: DOMNode;
    type: Protocol.DOMDebugger.DOMBreakpointType;
    enabled: boolean;
    constructor(domDebuggerModel: DOMDebuggerModel, node: DOMNode, type: Protocol.DOMDebugger.DOMBreakpointType, enabled: boolean);
}
export declare class EventListener {
    _domDebuggerModel: DOMDebuggerModel;
    _eventTarget: RemoteObject;
    _type: string;
    _useCapture: boolean;
    _passive: boolean;
    _once: boolean;
    _handler: RemoteObject | null;
    _originalHandler: RemoteObject | null;
    _location: Location;
    _sourceURL: string;
    _customRemoveFunction: RemoteObject | null;
    _origin: string;
    constructor(domDebuggerModel: DOMDebuggerModel, eventTarget: RemoteObject, type: string, useCapture: boolean, passive: boolean, once: boolean, handler: RemoteObject | null, originalHandler: RemoteObject | null, location: Location, customRemoveFunction: RemoteObject | null, origin?: string);
    domDebuggerModel(): DOMDebuggerModel;
    type(): string;
    useCapture(): boolean;
    passive(): boolean;
    once(): boolean;
    handler(): RemoteObject | null;
    location(): Location;
    sourceURL(): string;
    originalHandler(): RemoteObject | null;
    canRemove(): boolean;
    remove(): Promise<void>;
    canTogglePassive(): boolean;
    togglePassive(): Promise<undefined>;
    origin(): string;
    markAsFramework(): void;
    isScrollBlockingType(): boolean;
}
export declare namespace EventListener {
    enum Origin {
        Raw = "Raw",
        Framework = "Framework",
        FrameworkUser = "FrameworkUser"
    }
}
export declare class CategorizedBreakpoint {
    _category: string;
    _title: string;
    _enabled: boolean;
    constructor(category: string, title: string);
    category(): string;
    enabled(): boolean;
    setEnabled(enabled: boolean): void;
    title(): string;
}
export declare class CSPViolationBreakpoint extends CategorizedBreakpoint {
    _type: Protocol.DOMDebugger.CSPViolationType;
    constructor(category: string, title: string, type: Protocol.DOMDebugger.CSPViolationType);
    type(): Protocol.DOMDebugger.CSPViolationType;
}
export declare class EventListenerBreakpoint extends CategorizedBreakpoint {
    _instrumentationName: string;
    _eventName: string;
    _eventTargetNames: string[];
    constructor(instrumentationName: string, eventName: string, eventTargetNames: string[], category: string, title: string);
    setEnabled(enabled: boolean): void;
    _updateOnModel(model: DOMDebuggerModel): void;
    static readonly _listener = "listener:";
    static readonly _instrumentation = "instrumentation:";
}
export declare class DOMDebuggerManager implements SDKModelObserver<DOMDebuggerModel> {
    _xhrBreakpointsSetting: Common.Settings.Setting<{
        url: string;
        enabled: boolean;
    }[]>;
    _xhrBreakpoints: Map<string, boolean>;
    _cspViolationsToBreakOn: CSPViolationBreakpoint[];
    _eventListenerBreakpoints: EventListenerBreakpoint[];
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): DOMDebuggerManager;
    cspViolationBreakpoints(): CSPViolationBreakpoint[];
    _createInstrumentationBreakpoints(category: string, instrumentationNames: string[]): void;
    _createEventListenerBreakpoints(category: string, eventNames: string[], eventTargetNames: string[]): void;
    _resolveEventListenerBreakpoint(eventName: string, eventTargetName?: string): EventListenerBreakpoint | null;
    eventListenerBreakpoints(): EventListenerBreakpoint[];
    resolveEventListenerBreakpointTitle(auxData: {
        eventName: string;
        webglErrorName: string;
        directiveText: string;
        targetName: string;
    }): string;
    resolveEventListenerBreakpoint(auxData: {
        eventName: string;
        targetName: string;
    }): EventListenerBreakpoint | null;
    updateCSPViolationBreakpoints(): void;
    _updateCSPViolationBreakpointsForModel(model: DOMDebuggerModel, violationTypes: Protocol.DOMDebugger.CSPViolationType[]): void;
    xhrBreakpoints(): Map<string, boolean>;
    _saveXHRBreakpoints(): void;
    addXHRBreakpoint(url: string, enabled: boolean): void;
    removeXHRBreakpoint(url: string): void;
    toggleXHRBreakpoint(url: string, enabled: boolean): void;
    modelAdded(domDebuggerModel: DOMDebuggerModel): void;
    modelRemoved(_domDebuggerModel: DOMDebuggerModel): void;
}
