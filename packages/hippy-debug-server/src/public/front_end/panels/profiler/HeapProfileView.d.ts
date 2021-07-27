import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import { ProfileFlameChartDataProvider } from './CPUProfileFlameChart.js';
import { HeapTimelineOverview } from './HeapTimelineOverview.js';
import type { Formatter, ProfileDataGridNode } from './ProfileDataGrid.js';
import type { ProfileHeader } from './ProfileHeader.js';
import { ProfileType } from './ProfileHeader.js';
import { ProfileView, WritableProfileHeader } from './ProfileView.js';
export declare class HeapProfileView extends ProfileView implements UI.SearchableView.Searchable {
    profileHeader: SamplingHeapProfileHeader;
    _profileType: ProfileType;
    adjustedTotal: number;
    _selectedSizeText: UI.Toolbar.ToolbarText;
    _timestamps: number[];
    _sizes: number[];
    _max: number[];
    _ordinals: number[];
    _totalTime: number;
    _lastOrdinal: number;
    _timelineOverview: HeapTimelineOverview;
    constructor(profileHeader: SamplingHeapProfileHeader);
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    _onIdsRangeChanged(event: Common.EventTarget.EventTargetEvent): void;
    _setSelectionRange(minId: number, maxId: number): void;
    _onStatsUpdate(event: Common.EventTarget.EventTargetEvent): void;
    columnHeader(columnId: string): Common.UIString.LocalizedString;
    createFlameChartDataProvider(): ProfileFlameChartDataProvider;
}
export declare class SamplingHeapProfileTypeBase extends ProfileType {
    _recording: boolean;
    _clearedDuringRecording: boolean;
    constructor(typeId: string, description: string);
    profileBeingRecorded(): SamplingHeapProfileHeader | null;
    typeName(): string;
    fileExtension(): string;
    get buttonTooltip(): Common.UIString.LocalizedString;
    buttonClicked(): boolean;
    _startRecordingProfile(): void;
    _stopRecordingProfile(): Promise<void>;
    createProfileLoadedFromFile(title: string): ProfileHeader;
    profileBeingRecordedRemoved(): void;
    _startSampling(): void;
    _stopSampling(): Promise<Protocol.HeapProfiler.SamplingHeapProfile>;
}
export declare class SamplingHeapProfileType extends SamplingHeapProfileTypeBase {
    _updateTimer: number;
    _updateIntervalMs: number;
    constructor();
    static get instance(): SamplingHeapProfileType;
    get treeItemTitle(): Common.UIString.LocalizedString;
    get description(): string;
    hasTemporaryView(): boolean;
    _startSampling(): void;
    _obtainRecordingProfile(): SDK.HeapProfilerModel.HeapProfilerModel | null;
    _stopSampling(): Promise<Protocol.HeapProfiler.SamplingHeapProfile>;
    _updateStats(): Promise<void>;
    static readonly TypeId = "SamplingHeap";
}
export declare namespace SamplingHeapProfileType {
    const enum Events {
        RecordingStopped = "RecordingStopped",
        StatsUpdate = "StatsUpdate"
    }
}
export declare class SamplingHeapProfileHeader extends WritableProfileHeader {
    _heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null;
    _protocolProfile: {
        head: {
            callFrame: {
                functionName: string;
                scriptId: string;
                url: string;
                lineNumber: number;
                columnNumber: number;
            };
            children: never[];
            selfSize: number;
            id: number;
        };
        samples: never[];
        startTime: number;
        endTime: number;
        nodes: never[];
    };
    constructor(heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null, type: SamplingHeapProfileTypeBase, title?: string);
    createView(): HeapProfileView;
    protocolProfile(): Protocol.HeapProfiler.SamplingHeapProfile;
    heapProfilerModel(): SDK.HeapProfilerModel.HeapProfilerModel | null;
}
export declare class SamplingHeapProfileNode extends SDK.ProfileTreeModel.ProfileNode {
    self: number;
    constructor(node: Protocol.HeapProfiler.SamplingHeapProfileNode);
}
export declare class SamplingHeapProfileModel extends SDK.ProfileTreeModel.ProfileTreeModel {
    modules: any;
    constructor(profile: Protocol.HeapProfiler.SamplingHeapProfile, minOrdinal?: number, maxOrdinal?: number);
}
export declare class NodeFormatter implements Formatter {
    _profileView: HeapProfileView;
    constructor(profileView: HeapProfileView);
    formatValue(value: number): string;
    formatValueAccessibleText(value: number): string;
    formatPercent(value: number, _node: ProfileDataGridNode): string;
    linkifyNode(node: ProfileDataGridNode): Element | null;
}
export declare class HeapFlameChartDataProvider extends ProfileFlameChartDataProvider {
    _profile: SDK.ProfileTreeModel.ProfileTreeModel;
    _heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null;
    _timelineData?: PerfUI.FlameChart.TimelineData;
    constructor(profile: SDK.ProfileTreeModel.ProfileTreeModel, heapProfilerModel: SDK.HeapProfilerModel.HeapProfilerModel | null);
    minimumBoundary(): number;
    totalTime(): number;
    entryHasDeoptReason(_entryIndex: number): boolean;
    formatValue(value: number, _precision?: number): string;
    _calculateTimelineData(): PerfUI.FlameChart.TimelineData;
    prepareHighlightedEntryInfo(entryIndex: number): Element | null;
}
