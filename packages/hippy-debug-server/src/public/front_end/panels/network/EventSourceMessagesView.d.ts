import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class EventSourceMessagesView extends UI.Widget.VBox {
    _request: SDK.NetworkRequest.NetworkRequest;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<EventSourceMessageNode>;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    wasShown(): void;
    willHide(): void;
    _messageAdded(event: Common.EventTarget.EventTargetEvent): void;
    _sortItems(): void;
    _onRowContextMenu(contextMenu: UI.ContextMenu.ContextMenu, node: DataGrid.DataGrid.DataGridNode<DataGrid.ViewportDataGrid.ViewportDataGridNode<DataGrid.SortableDataGrid.SortableDataGridNode<EventSourceMessageNode>>>): void;
}
export declare class EventSourceMessageNode extends DataGrid.SortableDataGrid.SortableDataGridNode<EventSourceMessageNode> {
    _message: SDK.NetworkRequest.EventSourceMessage;
    constructor(message: SDK.NetworkRequest.EventSourceMessage);
}
export declare function EventSourceMessageNodeComparator(fieldGetter: (arg0: SDK.NetworkRequest.EventSourceMessage) => (number | string), a: EventSourceMessageNode, b: EventSourceMessageNode): number;
export declare const Comparators: {
    [x: string]: (arg0: EventSourceMessageNode, arg1: EventSourceMessageNode) => number;
};
