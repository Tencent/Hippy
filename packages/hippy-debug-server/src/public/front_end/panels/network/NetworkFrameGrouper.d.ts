import * as SDK from '../../core/sdk/sdk.js';
import { NetworkGroupNode } from './NetworkDataGridNode.js';
import type { GroupLookupInterface, NetworkLogView } from './NetworkLogView.js';
export declare class NetworkFrameGrouper implements GroupLookupInterface {
    _parentView: NetworkLogView;
    _activeGroups: Map<SDK.ResourceTreeModel.ResourceTreeFrame, FrameGroupNode>;
    constructor(parentView: NetworkLogView);
    groupNodeForRequest(request: SDK.NetworkRequest.NetworkRequest): NetworkGroupNode | null;
    reset(): void;
}
export declare class FrameGroupNode extends NetworkGroupNode {
    _frame: SDK.ResourceTreeModel.ResourceTreeFrame;
    constructor(parentView: NetworkLogView, frame: SDK.ResourceTreeModel.ResourceTreeFrame);
    displayName(): string;
    renderCell(cell: HTMLElement, columnId: string): void;
}
