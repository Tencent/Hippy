import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Category, IsLong } from './TimelineFilters.js';
import type { TimelineModeViewDelegate } from './TimelinePanel.js';
import { TimelineSelection } from './TimelinePanel.js';
import { TimelineTreeView } from './TimelineTreeView.js';
export declare class EventsTimelineTreeView extends TimelineTreeView {
    _filtersControl: Filters;
    _delegate: TimelineModeViewDelegate;
    _currentTree: TimelineModel.TimelineProfileTree.Node;
    constructor(delegate: TimelineModeViewDelegate);
    filters(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    updateContents(selection: TimelineSelection): void;
    getToolbarInputAccessiblePlaceHolder(): string;
    _buildTree(): TimelineModel.TimelineProfileTree.Node;
    _onFilterChanged(): void;
    _findNodeWithEvent(event: SDK.TracingModel.Event): TimelineModel.TimelineProfileTree.Node | null;
    _selectEvent(event: SDK.TracingModel.Event, expand?: boolean): void;
    populateColumns(columns: DataGrid.DataGrid.ColumnDescriptor[]): void;
    populateToolbar(toolbar: UI.Toolbar.Toolbar): void;
    _showDetailsForNode(node: TimelineModel.TimelineProfileTree.Node): boolean;
    _onHover(node: TimelineModel.TimelineProfileTree.Node | null): void;
}
export declare class Filters extends Common.ObjectWrapper.ObjectWrapper {
    _categoryFilter: Category;
    _durationFilter: IsLong;
    _filters: (IsLong | Category)[];
    constructor();
    filters(): TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    populateToolbar(toolbar: UI.Toolbar.Toolbar): void;
    _notifyFiltersChanged(): void;
    static readonly _durationFilterPresetsMs: number[];
}
export declare namespace Filters {
    enum Events {
        FilterChanged = "FilterChanged"
    }
}
