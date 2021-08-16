import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { PlayerEvent } from './MediaModel.js';
export interface EventDisplayColumnConfig {
    id: string;
    title: string;
    sortable: boolean;
    weight?: number;
}
export declare const enum MediaEventColumnKeys {
    Timestamp = "displayTimestamp",
    Event = "event",
    Value = "value"
}
export declare class EventNode extends DataGrid.DataGrid.DataGridNode<EventNode> {
    _expandableElement: SourceFrame.JSONView.JSONView | null;
    constructor(event: PlayerEvent);
    createCell(columnId: string): HTMLElement;
}
export declare class PlayerEventsView extends UI.Widget.VBox {
    _dataGrid: DataGrid.DataGrid.DataGridImpl<EventNode>;
    _firstEventTime: number;
    constructor();
    _createDataGrid(headers: EventDisplayColumnConfig[]): DataGrid.DataGrid.DataGridImpl<EventNode>;
    onEvent(event: PlayerEvent): void;
    _subtractFirstEventTime(event: PlayerEvent): PlayerEvent;
    static _convertToGridDescriptor(columnConfig: EventDisplayColumnConfig): DataGrid.DataGrid.ColumnDescriptor;
}
