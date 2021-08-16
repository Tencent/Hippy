import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { PerformanceModel } from './PerformanceModel.js';
import { TimelineLayersView } from './TimelineLayersView.js';
import { TimelinePaintProfilerView } from './TimelinePaintProfilerView.js';
import type { TimelineModeViewDelegate } from './TimelinePanel.js';
import { TimelineSelection } from './TimelinePanel.js';
import type { TimelineTreeView } from './TimelineTreeView.js';
export declare class TimelineDetailsView extends UI.Widget.VBox {
    _detailsLinkifier: Components.Linkifier.Linkifier;
    _tabbedPane: UI.TabbedPane.TabbedPane;
    _defaultDetailsWidget: UI.Widget.VBox;
    _defaultDetailsContentElement: HTMLElement;
    _rangeDetailViews: Map<string, TimelineTreeView>;
    _additionalMetricsToolbar: UI.Toolbar.Toolbar;
    _model: PerformanceModel;
    _track?: TimelineModel.TimelineModel.Track | null;
    _lazyPaintProfilerView?: TimelinePaintProfilerView | null;
    _lazyLayersView?: TimelineLayersView | null;
    _preferredTabId?: string;
    _selection?: TimelineSelection | null;
    constructor(delegate: TimelineModeViewDelegate);
    setModel(model: PerformanceModel | null, track: TimelineModel.TimelineModel.Track | null): void;
    _setContent(node: Node): void;
    _updateContents(): void;
    _appendTab(id: string, tabTitle: string, view: UI.Widget.Widget, isCloseable?: boolean): void;
    headerElement(): Element;
    setPreferredTab(tabId: string): void;
    _onWindowChanged(_event: Common.EventTarget.EventTargetEvent): void;
    _updateContentsFromWindow(): void;
    setSelection(selection: TimelineSelection | null): void;
    _tabSelected(event: Common.EventTarget.EventTargetEvent): void;
    _layersView(): TimelineLayersView;
    _paintProfilerView(): TimelinePaintProfilerView;
    _showSnapshotInPaintProfiler(snapshot: SDK.PaintProfiler.PaintProfilerSnapshot): void;
    _appendDetailsTabsForTraceEventAndShowDetails(event: SDK.TracingModel.Event, content: Node): void;
    _showEventInPaintProfiler(event: SDK.TracingModel.Event): void;
    _updateSelectedRangeStats(startTime: number, endTime: number): void;
}
export declare enum Tab {
    Details = "Details",
    EventLog = "EventLog",
    CallTree = "CallTree",
    BottomUp = "BottomUp",
    PaintProfiler = "PaintProfiler",
    LayerViewer = "LayerViewer"
}
