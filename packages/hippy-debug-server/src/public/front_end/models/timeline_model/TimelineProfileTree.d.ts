import type * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import type { TimelineModelFilter } from './TimelineModelFilter.js';
export declare class Node {
    totalTime: number;
    selfTime: number;
    id: string | symbol;
    event: SDK.TracingModel.Event | null;
    parent: Node | null;
    _groupId: string;
    _isGroupNode: boolean;
    _depth: number;
    constructor(id: string | symbol, event: SDK.TracingModel.Event | null);
    isGroupNode(): boolean;
    hasChildren(): boolean;
    setHasChildren(_value: boolean): void;
    children(): ChildrenCache;
    searchTree(matchFunction: (arg0: SDK.TracingModel.Event) => boolean, results?: Node[]): Node[];
}
export declare class TopDownNode extends Node {
    _root: TopDownRootNode | null;
    _hasChildren: boolean;
    _children: ChildrenCache | null;
    parent: TopDownNode | null;
    constructor(id: string | symbol, event: SDK.TracingModel.Event | null, parent: TopDownNode | null);
    hasChildren(): boolean;
    setHasChildren(value: boolean): void;
    children(): ChildrenCache;
    _buildChildren(): ChildrenCache;
}
export declare class TopDownRootNode extends TopDownNode {
    _root: this;
    _events: SDK.TracingModel.Event[];
    _filter: (e: SDK.TracingModel.Event) => boolean;
    _startTime: number;
    _endTime: number;
    _eventGroupIdCallback: ((arg0: SDK.TracingModel.Event) => string) | null | undefined;
    _doNotAggregate: boolean | undefined;
    totalTime: number;
    selfTime: number;
    constructor(events: SDK.TracingModel.Event[], filters: TimelineModelFilter[], startTime: number, endTime: number, doNotAggregate?: boolean, eventGroupIdCallback?: ((arg0: SDK.TracingModel.Event) => string) | null);
    children(): ChildrenCache;
    _grouppedTopNodes(): ChildrenCache;
}
export declare class BottomUpRootNode extends Node {
    _children: ChildrenCache | null;
    _events: SDK.TracingModel.Event[];
    _textFilter: TimelineModelFilter;
    _filter: (e: SDK.TracingModel.Event) => boolean;
    _startTime: number;
    _endTime: number;
    _eventGroupIdCallback: ((arg0: SDK.TracingModel.Event) => string) | null;
    totalTime: number;
    constructor(events: SDK.TracingModel.Event[], textFilter: TimelineModelFilter, filters: TimelineModelFilter[], startTime: number, endTime: number, eventGroupIdCallback: ((arg0: SDK.TracingModel.Event) => string) | null);
    hasChildren(): boolean;
    _filterChildren(children: ChildrenCache): ChildrenCache;
    children(): ChildrenCache;
    _ungrouppedTopNodes(): ChildrenCache;
    _grouppedTopNodes(): ChildrenCache;
}
export declare class GroupNode extends Node {
    _children: ChildrenCache;
    _isGroupNode: boolean;
    constructor(id: string, parent: BottomUpRootNode | TopDownRootNode, event: SDK.TracingModel.Event);
    addChild(child: BottomUpNode, selfTime: number, totalTime: number): void;
    hasChildren(): boolean;
    children(): ChildrenCache;
}
export declare class BottomUpNode extends Node {
    parent: Node;
    _root: BottomUpRootNode;
    _depth: number;
    _cachedChildren: ChildrenCache | null;
    _hasChildren: boolean;
    constructor(root: BottomUpRootNode, id: string, event: SDK.TracingModel.Event, hasChildren: boolean, parent: Node);
    hasChildren(): boolean;
    setHasChildren(value: boolean): void;
    children(): ChildrenCache;
    searchTree(matchFunction: (arg0: SDK.TracingModel.Event) => boolean, results?: Node[]): Node[];
}
export declare function eventURL(event: SDK.TracingModel.Event): string | null;
export declare function eventStackFrame(event: SDK.TracingModel.Event): Protocol.Runtime.CallFrame | null;
export declare function _eventId(event: SDK.TracingModel.Event): string;
export declare type ChildrenCache = Map<string | symbol, Node>;
