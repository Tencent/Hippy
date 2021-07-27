import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class LiveHeapProfileView extends UI.Widget.VBox {
    _gridNodeByUrl: Map<string, GridNode>;
    _setting: Common.Settings.Setting<boolean>;
    _toggleRecordAction: UI.ActionRegistration.Action;
    _toggleRecordButton: UI.Toolbar.ToolbarToggle;
    _startWithReloadButton: UI.Toolbar.ToolbarButton | undefined;
    _dataGrid: DataGrid.SortableDataGrid.SortableDataGrid<GridNode>;
    _currentPollId: number;
    private constructor();
    static instance(): LiveHeapProfileView;
    _createDataGrid(): DataGrid.SortableDataGrid.SortableDataGrid<GridNode>;
    wasShown(): void;
    willHide(): void;
    _settingChanged(value: Common.EventTarget.EventTargetEvent): void;
    _poll(): Promise<void>;
    _update(isolates: SDK.IsolateManager.Isolate[], profiles: (Protocol.HeapProfiler.SamplingHeapProfile | null)[]): void;
    _onKeyDown(event: KeyboardEvent): void;
    _revealSourceForSelectedNode(): void;
    _sortingChanged(): void;
    _toggleRecording(): void;
    _startRecording(reload?: boolean): void;
    _stopRecording(): Promise<void>;
}
export declare class GridNode extends DataGrid.SortableDataGrid.SortableDataGridNode<unknown> {
    _url: string;
    _size: number;
    _isolateCount: number;
    constructor(url: string, size: number, isolateCount: number);
    updateNode(size: number, isolateCount: number): void;
    createCell(columnId: string): HTMLElement;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(_context: UI.Context.Context, actionId: string): boolean;
    _innerHandleAction(profilerView: LiveHeapProfileView, actionId: string): void;
}
