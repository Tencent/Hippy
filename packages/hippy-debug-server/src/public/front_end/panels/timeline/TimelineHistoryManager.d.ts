import * as UI from '../../ui/legacy/legacy.js';
import type { PerformanceModel } from './PerformanceModel.js';
import { TimelineEventOverviewResponsiveness } from './TimelineEventOverview.js';
export declare class TimelineHistoryManager {
    _recordings: PerformanceModel[];
    _action: UI.ActionRegistration.Action;
    _nextNumberByDomain: Map<string, number>;
    _button: ToolbarButton;
    _allOverviews: {
        constructor: typeof TimelineEventOverviewResponsiveness;
        height: number;
    }[];
    _totalHeight: number;
    _enabled: boolean;
    _lastActiveModel: PerformanceModel | null;
    constructor();
    addRecording(performanceModel: PerformanceModel): void;
    setEnabled(enabled: boolean): void;
    button(): ToolbarButton;
    clear(): void;
    showHistoryDropDown(): Promise<PerformanceModel | null>;
    cancelIfShowing(): void;
    navigate(direction: number): PerformanceModel | null;
    _setCurrentModel(model: PerformanceModel): void;
    _updateState(): void;
    static _previewElement(performanceModel: PerformanceModel): Element;
    static _coarseAge(time: number): string;
    _title(performanceModel: PerformanceModel): string;
    _buildPreview(performanceModel: PerformanceModel): HTMLDivElement;
    _buildTextDetails(performanceModel: PerformanceModel, title: string, timeElement: Element): Element;
    _buildScreenshotThumbnail(performanceModel: PerformanceModel): Element;
    _buildOverview(performanceModel: PerformanceModel): Element;
    static _dataForModel(model: PerformanceModel): PreviewData | null;
}
export declare const maxRecordings = 5;
export declare const previewWidth = 450;
export declare class DropDown implements UI.ListControl.ListDelegate<PerformanceModel> {
    _glassPane: UI.GlassPane.GlassPane;
    _listControl: UI.ListControl.ListControl<PerformanceModel>;
    _focusRestorer: UI.UIUtils.ElementFocusRestorer;
    _selectionDone: ((arg0: PerformanceModel | null) => void) | null;
    constructor(models: PerformanceModel[]);
    static show(models: PerformanceModel[], currentModel: PerformanceModel, anchor: Element): Promise<PerformanceModel | null>;
    static cancelIfShowing(): void;
    _show(anchor: Element, currentModel: PerformanceModel): Promise<PerformanceModel | null>;
    _onMouseMove(event: Event): void;
    _onClick(event: Event): void;
    _onKeyDown(event: Event): void;
    _close(model: PerformanceModel | null): void;
    createElementForItem(item: PerformanceModel): Element;
    heightForItem(_item: PerformanceModel): number;
    isItemSelectable(_item: PerformanceModel): boolean;
    selectedItemChanged(from: PerformanceModel | null, to: PerformanceModel | null, fromElement: Element | null, toElement: Element | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    static _instance: DropDown | null;
}
export declare class ToolbarButton extends UI.Toolbar.ToolbarItem {
    _contentElement: HTMLElement;
    constructor(action: UI.ActionRegistration.Action);
    setText(text: string): void;
}
export interface PreviewData {
    preview: Element;
    time: Element;
    lastUsed: number;
    title: string;
}
