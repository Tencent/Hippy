import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import { BinaryResourceView } from './BinaryResourceView.js';
export declare class ResourceWebSocketFrameView extends UI.Widget.VBox {
    _request: SDK.NetworkRequest.NetworkRequest;
    _splitWidget: UI.SplitWidget.SplitWidget;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<unknown>;
    _timeComparator: (arg0: DataGrid.SortableDataGrid.SortableDataGridNode<ResourceWebSocketFrameNode>, arg1: DataGrid.SortableDataGrid.SortableDataGridNode<ResourceWebSocketFrameNode>) => number;
    _mainToolbar: UI.Toolbar.Toolbar;
    _clearAllButton: UI.Toolbar.ToolbarButton;
    _filterTypeCombobox: UI.Toolbar.ToolbarComboBox;
    _filterType: string | null;
    _filterTextInput: UI.Toolbar.ToolbarInput;
    _filterRegex: RegExp | null;
    _frameEmptyWidget: UI.EmptyWidget.EmptyWidget;
    _selectedNode: ResourceWebSocketFrameNode | null;
    _currentSelectedNode?: ResourceWebSocketFrameNode | null;
    private messageFilterSetting;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    static opCodeDescription(opCode: number, mask: boolean): string;
    wasShown(): void;
    willHide(): void;
    _frameAdded(event: Common.EventTarget.EventTargetEvent): void;
    _frameFilter(frame: SDK.NetworkRequest.WebSocketFrame): boolean;
    _clearFrames(): void;
    _updateFilterSetting(): void;
    _onFrameSelected(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _onFrameDeselected(_event: Common.EventTarget.EventTargetEvent): void;
    refresh(): void;
    _sortItems(): void;
}
export declare enum OpCodes {
    ContinuationFrame = 0,
    TextFrame = 1,
    BinaryFrame = 2,
    ConnectionCloseFrame = 8,
    PingFrame = 9,
    PongFrame = 10
}
export declare const opCodeDescriptions: (() => string)[];
export declare const _filterTypes: UI.FilterBar.Item[];
export declare class ResourceWebSocketFrameNode extends DataGrid.SortableDataGrid.SortableDataGridNode<unknown> {
    _url: string;
    _frame: SDK.NetworkRequest.WebSocketFrame;
    _isTextFrame: boolean;
    _dataText: string;
    _binaryView: BinaryResourceView | null;
    constructor(url: string, frame: SDK.NetworkRequest.WebSocketFrame);
    createCells(element: Element): void;
    nodeSelfHeight(): number;
    dataText(): string;
    opCode(): OpCodes;
    binaryView(): BinaryResourceView | null;
}
export declare function ResourceWebSocketFrameNodeTimeComparator(a: ResourceWebSocketFrameNode, b: ResourceWebSocketFrameNode): number;
