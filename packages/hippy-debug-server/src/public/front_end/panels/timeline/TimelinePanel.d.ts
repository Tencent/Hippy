import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Coverage from '../coverage/coverage.js';
import { PerformanceModel } from './PerformanceModel.js';
import type { Client } from './TimelineController.js';
import { TimelineController } from './TimelineController.js';
import type { TimelineEventOverview } from './TimelineEventOverview.js';
import { TimelineFlameChartView } from './TimelineFlameChartView.js';
import { TimelineHistoryManager } from './TimelineHistoryManager.js';
import { TimelineLoader } from './TimelineLoader.js';
export declare class TimelinePanel extends UI.Panel.Panel implements Client, TimelineModeViewDelegate {
    _dropTarget: UI.DropTarget.DropTarget;
    _recordingOptionUIControls: UI.Toolbar.ToolbarItem[];
    _state: State;
    _recordingPageReload: boolean;
    _millisecondsToRecordAfterLoadEvent: number;
    _toggleRecordAction: UI.ActionRegistration.Action;
    _recordReloadAction: UI.ActionRegistration.Action;
    _historyManager: TimelineHistoryManager;
    _performanceModel: PerformanceModel | null;
    _viewModeSetting: Common.Settings.Setting<any>;
    _disableCaptureJSProfileSetting: Common.Settings.Setting<any>;
    _captureLayersAndPicturesSetting: Common.Settings.Setting<any>;
    _showScreenshotsSetting: Common.Settings.Setting<any>;
    _startCoverage: Common.Settings.Setting<any>;
    _showMemorySetting: Common.Settings.Setting<any>;
    _showWebVitalsSetting: Common.Settings.Setting<any>;
    _panelToolbar: UI.Toolbar.Toolbar;
    _panelRightToolbar: UI.Toolbar.Toolbar;
    _timelinePane: UI.Widget.VBox;
    _overviewPane: PerfUI.TimelineOverviewPane.TimelineOverviewPane;
    _overviewControls: TimelineEventOverview[];
    _statusPaneContainer: HTMLElement;
    _flameChart: TimelineFlameChartView;
    _searchableView: UI.SearchableView.SearchableView;
    _showSettingsPaneButton: UI.Toolbar.ToolbarSettingToggle;
    _showSettingsPaneSetting: Common.Settings.Setting<boolean>;
    _settingsPane: UI.Widget.Widget;
    _controller: TimelineController | null;
    _clearButton: UI.Toolbar.ToolbarButton;
    _loadButton: UI.Toolbar.ToolbarButton;
    _saveButton: UI.Toolbar.ToolbarButton;
    _statusPane: StatusPane | null;
    _landingPage: UI.Widget.Widget;
    _loader?: TimelineLoader;
    _showScreenshotsToolbarCheckbox?: UI.Toolbar.ToolbarItem;
    _showMemoryToolbarCheckbox?: UI.Toolbar.ToolbarItem;
    _showWebVitalsToolbarCheckbox?: UI.Toolbar.ToolbarItem;
    _startCoverageCheckbox?: UI.Toolbar.ToolbarItem;
    _networkThrottlingSelect?: UI.Toolbar.ToolbarComboBox;
    _cpuThrottlingSelect?: UI.Toolbar.ToolbarComboBox;
    _fileSelectorElement?: HTMLInputElement;
    _selection?: TimelineSelection | null;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): TimelinePanel;
    searchableView(): UI.SearchableView.SearchableView | null;
    wasShown(): void;
    willHide(): void;
    loadFromEvents(events: SDK.TracingManager.EventPayload[]): void;
    _onOverviewWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onModelWindowChanged(event: Common.EventTarget.EventTargetEvent): void;
    _setState(state: State): void;
    _createSettingCheckbox(setting: Common.Settings.Setting<any>, tooltip: string): UI.Toolbar.ToolbarItem;
    _populateToolbar(): void;
    _createSettingsPane(): void;
    _appendExtensionsToToolbar(event: Common.EventTarget.EventTargetEvent): void;
    static _settingForTraceProvider(traceProvider: Extensions.ExtensionTraceProvider.ExtensionTraceProvider): Common.Settings.Setting<boolean>;
    _createNetworkConditionsSelect(): UI.Toolbar.ToolbarComboBox;
    _prepareToLoadTimeline(): void;
    _createFileSelector(): void;
    _contextMenu(event: Event): void;
    _saveToFile(): Promise<void>;
    _showHistory(): Promise<void>;
    _navigateHistory(direction: number): boolean;
    _selectFileToLoad(): void;
    _loadFromFile(file: File): void;
    _loadFromURL(url: string): void;
    _updateOverviewControls(): void;
    _onModeChanged(): void;
    _onWebVitalsChanged(): void;
    _updateSettingsPaneVisibility(): void;
    _updateShowSettingsToolbarButton(): void;
    _setUIControlsEnabled(enabled: boolean): void;
    _getCoverageViewWidget(): Promise<Coverage.CoverageView.CoverageView>;
    _startRecording(): Promise<void>;
    _stopRecording(): Promise<void>;
    _recordingFailed(error: string): void;
    _onSuspendStateChanged(): void;
    _updateTimelineControls(): void;
    _toggleRecording(): void;
    _recordReload(): void;
    _onClearButton(): void;
    _clear(): void;
    _reset(): void;
    _applyFilters(model: PerformanceModel): void;
    _setModel(model: PerformanceModel | null): void;
    _recordingStarted(): void;
    recordingProgress(usage: number): void;
    _showLandingPage(): void;
    _hideLandingPage(): void;
    loadingStarted(): void;
    loadingProgress(progress?: number): void;
    processingStarted(): void;
    loadingComplete(tracingModel: SDK.TracingModel.TracingModel | null): void;
    _showRecordingStarted(): void;
    _cancelLoading(): void;
    _setMarkers(timelineModel: TimelineModel.TimelineModel.TimelineModelImpl): void;
    _loadEventFired(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _frameForSelection(selection: TimelineSelection): TimelineModel.TimelineFrameModel.TimelineFrame | null;
    _jumpToFrame(offset: number): true | undefined;
    select(selection: TimelineSelection | null): void;
    selectEntryAtTime(events: SDK.TracingModel.Event[] | null, time: number): void;
    highlightEvent(event: SDK.TracingModel.Event | null): void;
    _revealTimeRange(startTime: number, endTime: number): void;
    _handleDrop(dataTransfer: DataTransfer): void;
}
export declare enum State {
    Idle = "Idle",
    StartPending = "StartPending",
    Recording = "Recording",
    StopPending = "StopPending",
    Loading = "Loading",
    RecordingFailed = "RecordingFailed"
}
export declare enum ViewMode {
    FlameChart = "FlameChart",
    BottomUp = "BottomUp",
    CallTree = "CallTree",
    EventLog = "EventLog"
}
export declare const rowHeight = 18;
export declare const headerHeight = 20;
export declare class TimelineSelection {
    _type: string;
    _startTime: number;
    _endTime: number;
    _object: Object | null;
    constructor(type: string, startTime: number, endTime: number, object?: Object);
    static fromFrame(frame: TimelineModel.TimelineFrameModel.TimelineFrame): TimelineSelection;
    static fromNetworkRequest(request: TimelineModel.TimelineModel.NetworkRequest): TimelineSelection;
    static fromTraceEvent(event: SDK.TracingModel.Event): TimelineSelection;
    static fromRange(startTime: number, endTime: number): TimelineSelection;
    type(): string;
    object(): Object | null;
    startTime(): number;
    endTime(): number;
}
export declare namespace TimelineSelection {
    enum Type {
        Frame = "Frame",
        NetworkRequest = "NetworkRequest",
        TraceEvent = "TraceEvent",
        Range = "Range"
    }
}
export interface TimelineModeViewDelegate {
    select(selection: TimelineSelection | null): void;
    selectEntryAtTime(events: SDK.TracingModel.Event[] | null, time: number): void;
    highlightEvent(event: SDK.TracingModel.Event | null): void;
}
export declare class StatusPane extends UI.Widget.VBox {
    _status: HTMLElement;
    _time: Element;
    _progressLabel: Element;
    _progressBar: Element;
    _description: HTMLElement | undefined;
    _button: HTMLButtonElement;
    _startTime: number;
    _timeUpdateTimer?: number;
    constructor(options: {
        showTimer?: boolean;
        showProgress?: boolean;
        description?: string;
        buttonText?: string;
        buttonDisabled?: boolean;
    }, buttonCallback: () => (Promise<void> | void));
    finish(): void;
    hide(): void;
    showPane(parent: Element): void;
    enableAndFocusButton(): void;
    updateStatus(text: string): void;
    updateProgressBar(activity: string, percent: number): void;
    startTimer(): void;
    _stopTimer(): void;
    _updateTimer(precise?: boolean): void;
}
export declare class LoadTimelineHandler implements Common.QueryParamHandler.QueryParamHandler {
    static instance(opts?: {
        forceNew: boolean | null;
    }): LoadTimelineHandler;
    handleQueryParam(value: string): void;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
