import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
interface EventStylesMap {
    [x: string]: TimelineRecordStyle;
}
export declare class TimelineUIUtils {
    static _initEventStyles(): EventStylesMap;
    static setEventStylesMap(eventStyles: any): void;
    static inputEventDisplayName(inputEventType: TimelineModel.TimelineIRModel.InputEvents): string | null;
    static frameDisplayName(frame: Protocol.Runtime.CallFrame): string;
    static testContentMatching(traceEvent: SDK.TracingModel.Event, regExp: RegExp): boolean;
    static eventURL(event: SDK.TracingModel.Event): string | null;
    static eventStyle(event: SDK.TracingModel.Event): TimelineRecordStyle;
    static eventColor(event: SDK.TracingModel.Event): string;
    static eventColorByProduct(model: TimelineModel.TimelineModel.TimelineModelImpl, urlToColorCache: Map<string, string>, event: SDK.TracingModel.Event): string;
    static eventTitle(event: SDK.TracingModel.Event): string;
    static _interactionPhaseStyles(): Map<TimelineModel.TimelineIRModel.Phases, {
        color: string;
        label: string;
    }>;
    static interactionPhaseColor(phase: TimelineModel.TimelineIRModel.Phases): string;
    static interactionPhaseLabel(phase: TimelineModel.TimelineIRModel.Phases): string;
    static isUserFrame(frame: Protocol.Runtime.CallFrame): boolean;
    static networkRequestCategory(request: TimelineModel.TimelineModel.NetworkRequest): NetworkCategory;
    static networkCategoryColor(category: NetworkCategory): string;
    static buildDetailsTextForTraceEvent(event: SDK.TracingModel.Event, target: SDK.Target.Target | null): Promise<string | null>;
    static buildDetailsNodeForTraceEvent(event: SDK.TracingModel.Event, target: SDK.Target.Target | null, linkifier: Components.Linkifier.Linkifier): Promise<Node | null>;
    static buildDetailsNodeForPerformanceEvent(event: SDK.TracingModel.Event): Element;
    static buildCompilationCacheDetails(eventData: any, contentHelper: TimelineDetailsContentHelper): void;
    static buildTraceEventDetails(event: SDK.TracingModel.Event, model: TimelineModel.TimelineModel.TimelineModelImpl, linkifier: Components.Linkifier.Linkifier, detailed: boolean): Promise<DocumentFragment>;
    static statsForTimeRange(events: SDK.TracingModel.Event[], startTime: number, endTime: number): {
        [x: string]: number;
    };
    static buildNetworkRequestDetails(request: TimelineModel.TimelineModel.NetworkRequest, model: TimelineModel.TimelineModel.TimelineModelImpl, linkifier: Components.Linkifier.Linkifier): Promise<DocumentFragment>;
    static _stackTraceFromCallFrames(callFrames: Protocol.Runtime.CallFrame[]): Protocol.Runtime.StackTrace;
    static _generateCauses(event: SDK.TracingModel.Event, target: SDK.Target.Target | null, relatedNodesMap: Map<number, SDK.DOMModel.DOMNode | null> | null, contentHelper: TimelineDetailsContentHelper): void;
    static _generateInvalidations(event: SDK.TracingModel.Event, target: SDK.Target.Target, relatedNodesMap: Map<number, SDK.DOMModel.DOMNode | null> | null, contentHelper: TimelineDetailsContentHelper): void;
    static _generateInvalidationsForType(type: string, target: SDK.Target.Target, invalidations: TimelineModel.TimelineModel.InvalidationTrackingEvent[], relatedNodesMap: Map<number, SDK.DOMModel.DOMNode | null> | null, contentHelper: TimelineDetailsContentHelper): void;
    static _collectInvalidationNodeIds(nodeIds: Set<number>, invalidations: TimelineModel.TimelineModel.InvalidationTrackingEvent[]): void;
    static _aggregatedStatsForTraceEvent(total: {
        [x: string]: number;
    }, model: TimelineModel.TimelineModel.TimelineModelImpl, event: SDK.TracingModel.Event): boolean;
    static buildPicturePreviewContent(event: SDK.TracingModel.Event, target: SDK.Target.Target): Promise<Element | null>;
    static createEventDivider(event: SDK.TracingModel.Event, zeroTime: number): Element;
    static _visibleTypes(): string[];
    static visibleEventsFilter(): TimelineModel.TimelineModelFilter.TimelineModelFilter;
    static categories(): {
        [x: string]: TimelineCategory;
    };
    static setCategories(cats: {
        [x: string]: TimelineCategory;
    }): void;
    static getTimelineMainEventCategories(): string[];
    static setTimelineMainEventCategories(categories: string[]): void;
    static generatePieChart(aggregatedStats: {
        [x: string]: number;
    }, selfCategory?: TimelineCategory, selfTime?: number): Element;
    static generateDetailsContentForFrame(frame: TimelineModel.TimelineFrameModel.TimelineFrame, filmStripFrame: SDK.FilmStripModel.Frame | null): DocumentFragment;
    static frameDuration(frame: TimelineModel.TimelineFrameModel.TimelineFrame): Element;
    static createFillStyle(context: CanvasRenderingContext2D, width: number, height: number, color0: string, color1: string, color2: string): CanvasGradient;
    static quadWidth(quad: number[]): number;
    static quadHeight(quad: number[]): number;
    static eventDispatchDesciptors(): EventDispatchTypeDescriptor[];
    static markerShortTitle(event: SDK.TracingModel.Event): string | null;
    static markerStyleForEvent(event: SDK.TracingModel.Event): TimelineMarkerStyle;
    static markerStyleForFrame(): TimelineMarkerStyle;
    static colorForId(id: string): string;
    static eventWarning(event: SDK.TracingModel.Event, warningType?: string): Element | null;
    static displayNameForFrame(frame: TimelineModel.TimelineModel.PageFrame, trimAt?: number): any;
}
export declare class TimelineRecordStyle {
    title: string;
    category: TimelineCategory;
    hidden: boolean;
    constructor(title: string, category: TimelineCategory, hidden?: boolean | undefined);
}
export declare enum NetworkCategory {
    HTML = "HTML",
    Script = "Script",
    Style = "Style",
    Media = "Media",
    Other = "Other"
}
export declare const aggregatedStatsKey: unique symbol;
export declare class InvalidationsGroupElement extends UI.TreeOutline.TreeElement {
    toggleOnClick: boolean;
    _relatedNodesMap: Map<number, SDK.DOMModel.DOMNode | null> | null;
    _contentHelper: TimelineDetailsContentHelper;
    _invalidations: TimelineModel.TimelineModel.InvalidationTrackingEvent[];
    constructor(target: SDK.Target.Target, relatedNodesMap: Map<number, SDK.DOMModel.DOMNode | null> | null, contentHelper: TimelineDetailsContentHelper, invalidations: TimelineModel.TimelineModel.InvalidationTrackingEvent[]);
    _createTitle(target: SDK.Target.Target): Element;
    onpopulate(): Promise<void>;
    _getTruncatedNodesElement(invalidations: TimelineModel.TimelineModel.InvalidationTrackingEvent[]): Element | null;
    _createInvalidationNode(invalidation: TimelineModel.TimelineModel.InvalidationTrackingEvent, showUnknownNodes: boolean): HTMLSpanElement | Text;
}
export declare const previewElementSymbol: unique symbol;
export declare class EventDispatchTypeDescriptor {
    priority: number;
    color: string;
    eventTypes: string[];
    constructor(priority: number, color: string, eventTypes: string[]);
}
export declare class TimelineCategory extends Common.ObjectWrapper.ObjectWrapper {
    name: string;
    title: string;
    visible: boolean;
    childColor: string;
    color: string;
    _hidden?: boolean;
    constructor(name: string, title: string, visible: boolean, childColor: string, color: string);
    get hidden(): boolean;
    set hidden(hidden: boolean);
}
export declare namespace TimelineCategory {
    enum Events {
        VisibilityChanged = "VisibilityChanged"
    }
}
export declare class TimelineDetailsContentHelper {
    fragment: DocumentFragment;
    _linkifier: Components.Linkifier.Linkifier | null;
    _target: SDK.Target.Target | null;
    element: HTMLDivElement;
    _tableElement: HTMLElement;
    constructor(target: SDK.Target.Target | null, linkifier: Components.Linkifier.Linkifier | null);
    addSection(title: string, swatchColor?: string): void;
    linkifier(): Components.Linkifier.Linkifier | null;
    appendTextRow(title: string, value: string | number | boolean): void;
    appendElementRow(title: string, content: string | Node, isWarning?: boolean, isStacked?: boolean): void;
    appendLocationRow(title: string, url: string, startLine: number, startColumn?: number): void;
    appendLocationRange(title: string, url: string, startLine: number, endLine?: number): void;
    appendStackTrace(title: string, stackTrace: Protocol.Runtime.StackTrace): void;
    createChildStackTraceElement(parentElement: Element, stackTrace: Protocol.Runtime.StackTrace): void;
    appendWarningRow(event: SDK.TracingModel.Event, warningType?: string): void;
}
export declare const categoryBreakdownCacheSymbol: unique symbol;
export interface TimelineMarkerStyle {
    title: string;
    color: string;
    lineWidth: number;
    dashStyle: number[];
    tall: boolean;
    lowPriority: boolean;
}
export {};
