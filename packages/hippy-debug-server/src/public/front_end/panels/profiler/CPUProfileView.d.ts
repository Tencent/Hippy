import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import { ProfileFlameChartDataProvider } from './CPUProfileFlameChart.js';
import type { Formatter, ProfileDataGridNode } from './ProfileDataGrid.js';
import type { ProfileHeader } from './ProfileHeader.js';
import { ProfileType } from './ProfileHeader.js';
import { ProfileView, WritableProfileHeader } from './ProfileView.js';
export declare class CPUProfileView extends ProfileView implements UI.SearchableView.Searchable {
    profileHeader: CPUProfileHeader;
    adjustedTotal: number;
    constructor(profileHeader: CPUProfileHeader);
    wasShown(): void;
    columnHeader(columnId: string): Common.UIString.LocalizedString;
    createFlameChartDataProvider(): ProfileFlameChartDataProvider;
}
export declare class CPUProfileType extends ProfileType {
    _recording: boolean;
    constructor();
    profileBeingRecorded(): ProfileHeader | null;
    typeName(): string;
    fileExtension(): string;
    get buttonTooltip(): Common.UIString.LocalizedString;
    buttonClicked(): boolean;
    get treeItemTitle(): Common.UIString.LocalizedString;
    get description(): Common.UIString.LocalizedString;
    _consoleProfileFinished(event: Common.EventTarget.EventTargetEvent): void;
    _startRecordingProfile(): void;
    _stopRecordingProfile(): Promise<void>;
    createProfileLoadedFromFile(title: string): ProfileHeader;
    profileBeingRecordedRemoved(): void;
    static readonly TypeId = "CPU";
}
export declare class CPUProfileHeader extends WritableProfileHeader {
    _cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel | null;
    _profileModel?: SDK.CPUProfileDataModel.CPUProfileDataModel;
    constructor(cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel | null, type: CPUProfileType, title?: string);
    createView(): ProfileView;
    protocolProfile(): Protocol.Profiler.Profile;
    profileModel(): SDK.CPUProfileDataModel.CPUProfileDataModel;
    setProfile(profile: Protocol.Profiler.Profile): void;
}
export declare class NodeFormatter implements Formatter {
    _profileView: CPUProfileView;
    constructor(profileView: CPUProfileView);
    formatValue(value: number): string;
    formatValueAccessibleText(value: number): string;
    formatPercent(value: number, node: ProfileDataGridNode): string;
    linkifyNode(node: ProfileDataGridNode): Element | null;
}
export declare class CPUFlameChartDataProvider extends ProfileFlameChartDataProvider {
    _cpuProfile: SDK.CPUProfileDataModel.CPUProfileDataModel;
    _cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel | null;
    _entrySelfTimes?: Float32Array;
    constructor(cpuProfile: SDK.CPUProfileDataModel.CPUProfileDataModel, cpuProfilerModel: SDK.CPUProfilerModel.CPUProfilerModel | null);
    minimumBoundary(): number;
    totalTime(): number;
    entryHasDeoptReason(entryIndex: number): boolean;
    _calculateTimelineData(): PerfUI.FlameChart.TimelineData;
    prepareHighlightedEntryInfo(entryIndex: number): Element | null;
}
export declare namespace CPUFlameChartDataProvider {
    class ChartEntry {
        depth: number;
        duration: number;
        startTime: number;
        selfTime: number;
        node: SDK.CPUProfileDataModel.CPUProfileNode;
        constructor(depth: number, duration: number, startTime: number, selfTime: number, node: SDK.CPUProfileDataModel.CPUProfileNode);
    }
}
