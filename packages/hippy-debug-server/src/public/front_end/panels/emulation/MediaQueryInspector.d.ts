import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class MediaQueryInspector extends UI.Widget.Widget implements SDK.TargetManager.SDKModelObserver<SDK.CSSModel.CSSModel> {
    _mediaThrottler: Common.Throttler.Throttler;
    _getWidthCallback: () => number;
    _setWidthCallback: (arg0: number) => void;
    _scale: number;
    elementsToMediaQueryModel: WeakMap<Element, MediaQueryUIModel>;
    elementsToCSSLocations: WeakMap<Element, SDK.CSSModel.CSSLocation[]>;
    _cssModel?: SDK.CSSModel.CSSModel;
    _cachedQueryModels?: MediaQueryUIModel[];
    constructor(getWidthCallback: () => number, setWidthCallback: (arg0: number) => void);
    modelAdded(cssModel: SDK.CSSModel.CSSModel): void;
    modelRemoved(cssModel: SDK.CSSModel.CSSModel): void;
    setAxisTransform(scale: number): void;
    _onMediaQueryClicked(event: Event): void;
    _onContextMenu(event: Event): void;
    _revealSourceLocation(location: Workspace.UISourceCode.UILocation): void;
    _scheduleMediaQueriesUpdate(): void;
    _refetchMediaQueries(): Promise<void>;
    _squashAdjacentEqual(models: MediaQueryUIModel[]): MediaQueryUIModel[];
    _rebuildMediaQueries(cssMedias: SDK.CSSMedia.CSSMedia[]): void;
    _renderMediaQueries(): void;
    _zoomFactor(): number;
    wasShown(): void;
    _createElementFromMediaQueryModel(model: MediaQueryUIModel): Element;
}
export declare const enum Section {
    Max = 0,
    MinMax = 1,
    Min = 2
}
export declare class MediaQueryUIModel {
    _cssMedia: SDK.CSSMedia.CSSMedia;
    _minWidthExpression: SDK.CSSMedia.CSSMediaQueryExpression | null;
    _maxWidthExpression: SDK.CSSMedia.CSSMediaQueryExpression | null;
    _active: boolean;
    _section: Section;
    _rawLocation?: SDK.CSSModel.CSSLocation | null;
    constructor(cssMedia: SDK.CSSMedia.CSSMedia, minWidthExpression: SDK.CSSMedia.CSSMediaQueryExpression | null, maxWidthExpression: SDK.CSSMedia.CSSMediaQueryExpression | null, active: boolean);
    static createFromMediaQuery(cssMedia: SDK.CSSMedia.CSSMedia, mediaQuery: SDK.CSSMedia.CSSMediaQuery): MediaQueryUIModel | null;
    equals(other: MediaQueryUIModel): boolean;
    dimensionsEqual(other: MediaQueryUIModel): boolean;
    compareTo(other: MediaQueryUIModel): number;
    section(): Section;
    mediaText(): string;
    rawLocation(): SDK.CSSModel.CSSLocation | null;
    minWidthExpression(): SDK.CSSMedia.CSSMediaQueryExpression | null;
    maxWidthExpression(): SDK.CSSMedia.CSSMediaQueryExpression | null;
    active(): boolean;
}
