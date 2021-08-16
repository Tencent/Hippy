import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import { CSSFontFace } from './CSSFontFace.js';
import { CSSMatchedStyles } from './CSSMatchedStyles.js';
import { CSSMedia } from './CSSMedia.js';
import { CSSStyleRule } from './CSSRule.js';
import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';
import { CSSStyleSheetHeader } from './CSSStyleSheetHeader.js';
import type { DOMNode } from './DOMModel.js';
import { DOMModel } from './DOMModel.js';
import { ResourceTreeModel } from './ResourceTreeModel.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { SourceMapManager } from './SourceMapManager.js';
export declare class CSSModel extends SDKModel {
    _isEnabled: boolean;
    _cachedMatchedCascadeNode: DOMNode | null;
    _cachedMatchedCascadePromise: Promise<CSSMatchedStyles | null> | null;
    _domModel: DOMModel;
    _sourceMapManager: SourceMapManager<CSSStyleSheetHeader>;
    _agent: ProtocolProxyApi.CSSApi;
    _styleLoader: ComputedStyleLoader;
    _resourceTreeModel: ResourceTreeModel | null;
    _styleSheetIdToHeader: Map<string, CSSStyleSheetHeader>;
    _styleSheetIdsForURL: Map<string, Map<string, Set<string>>>;
    _originalStyleSheetText: Map<CSSStyleSheetHeader, Promise<string | null>>;
    _isRuleUsageTrackingEnabled: boolean;
    _fontFaces: Map<string, CSSFontFace>;
    _cssPropertyTracker: CSSPropertyTracker | null;
    _isCSSPropertyTrackingEnabled: boolean;
    _isTrackingRequestPending: boolean;
    _trackedCSSProperties: Map<number, Protocol.CSS.CSSComputedStyleProperty[]>;
    _stylePollingThrottler: Common.Throttler.Throttler;
    constructor(target: Target);
    headersForSourceURL(sourceURL: string): CSSStyleSheetHeader[];
    createRawLocationsByURL(sourceURL: string, lineNumber: number, columnNumber?: number | undefined): CSSLocation[];
    sourceMapManager(): SourceMapManager<CSSStyleSheetHeader>;
    static trimSourceURL(text: string): string;
    domModel(): DOMModel;
    setStyleText(styleSheetId: string, range: TextUtils.TextRange.TextRange, text: string, majorChange: boolean): Promise<boolean>;
    setSelectorText(styleSheetId: string, range: TextUtils.TextRange.TextRange, text: string): Promise<boolean>;
    setKeyframeKey(styleSheetId: string, range: TextUtils.TextRange.TextRange, text: string): Promise<boolean>;
    startCoverage(): Promise<Protocol.ProtocolResponseWithError>;
    takeCoverageDelta(): Promise<{
        timestamp: number;
        coverage: Array<Protocol.CSS.RuleUsage>;
    }>;
    setLocalFontsEnabled(enabled: boolean): Promise<Protocol.ProtocolResponseWithError>;
    stopCoverage(): Promise<void>;
    mediaQueriesPromise(): Promise<CSSMedia[]>;
    isEnabled(): boolean;
    _enable(): Promise<any>;
    matchedStylesPromise(nodeId: number): Promise<CSSMatchedStyles | null>;
    classNamesPromise(styleSheetId: string): Promise<string[]>;
    computedStylePromise(nodeId: number): Promise<Map<string, string> | null>;
    backgroundColorsPromise(nodeId: number): Promise<ContrastInfo | null>;
    platformFontsPromise(nodeId: number): Promise<Protocol.CSS.PlatformFontUsage[] | null>;
    allStyleSheets(): CSSStyleSheetHeader[];
    inlineStylesPromise(nodeId: number): Promise<InlineStyleResult | null>;
    forcePseudoState(node: DOMNode, pseudoClass: string, enable: boolean): boolean;
    pseudoState(node: DOMNode): string[] | null;
    setMediaText(styleSheetId: string, range: TextUtils.TextRange.TextRange, newMediaText: string): Promise<boolean>;
    addRule(styleSheetId: string, ruleText: string, ruleLocation: TextUtils.TextRange.TextRange): Promise<CSSStyleRule | null>;
    requestViaInspectorStylesheet(node: DOMNode): Promise<CSSStyleSheetHeader | null>;
    mediaQueryResultChanged(): void;
    fontsUpdated(fontFace?: Protocol.CSS.FontFace | null): void;
    fontFaces(): CSSFontFace[];
    styleSheetHeaderForId(id: string): CSSStyleSheetHeader | null;
    styleSheetHeaders(): CSSStyleSheetHeader[];
    _fireStyleSheetChanged(styleSheetId: string, edit?: Edit): void;
    _ensureOriginalStyleSheetText(styleSheetId: string): Promise<string | null>;
    _originalContentRequestedForTest(_header: CSSStyleSheetHeader): void;
    originalStyleSheetText(header: CSSStyleSheetHeader): Promise<string | null>;
    getAllStyleSheetHeaders(): Iterable<CSSStyleSheetHeader>;
    _styleSheetAdded(header: Protocol.CSS.CSSStyleSheetHeader): void;
    _styleSheetRemoved(id: string): void;
    styleSheetIdsForURL(url: string): string[];
    setStyleSheetText(styleSheetId: string, newText: string, majorChange: boolean): Promise<string | null>;
    getStyleSheetText(styleSheetId: string): Promise<string | null>;
    _resetStyleSheets(): void;
    _resetFontFaces(): void;
    suspendModel(): Promise<any>;
    resumeModel(): Promise<any>;
    setEffectivePropertyValueForNode(nodeId: number, propertyName: string, value: string): void;
    cachedMatchedCascadeForNode(node: DOMNode): Promise<CSSMatchedStyles | null>;
    discardCachedMatchedCascade(): void;
    createCSSPropertyTracker(propertiesToTrack: Protocol.CSS.CSSComputedStyleProperty[]): CSSPropertyTracker;
    enableCSSPropertyTracker(cssPropertyTracker: CSSPropertyTracker): void;
    disableCSSPropertyTracker(): void;
    _pollComputedStyleUpdates(): Promise<void>;
    dispose(): void;
}
export declare enum Events {
    FontsUpdated = "FontsUpdated",
    MediaQueryResultChanged = "MediaQueryResultChanged",
    ModelWasEnabled = "ModelWasEnabled",
    PseudoStateForced = "PseudoStateForced",
    StyleSheetAdded = "StyleSheetAdded",
    StyleSheetChanged = "StyleSheetChanged",
    StyleSheetRemoved = "StyleSheetRemoved"
}
export declare class Edit {
    styleSheetId: string;
    oldRange: TextUtils.TextRange.TextRange;
    newRange: TextUtils.TextRange.TextRange;
    newText: string;
    payload: Object | null;
    constructor(styleSheetId: string, oldRange: TextUtils.TextRange.TextRange, newText: string, payload: Object | null);
}
export declare class CSSLocation {
    _cssModel: CSSModel;
    styleSheetId: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
    constructor(header: CSSStyleSheetHeader, lineNumber: number, columnNumber?: number);
    cssModel(): CSSModel;
    header(): CSSStyleSheetHeader | null;
}
declare class ComputedStyleLoader {
    _cssModel: CSSModel;
    _nodeIdToPromise: Map<number, Promise<Map<string, string> | null>>;
    constructor(cssModel: CSSModel);
    computedStylePromise(nodeId: number): Promise<Map<string, string> | null>;
}
export declare class InlineStyleResult {
    inlineStyle: CSSStyleDeclaration | null;
    attributesStyle: CSSStyleDeclaration | null;
    constructor(inlineStyle: CSSStyleDeclaration | null, attributesStyle: CSSStyleDeclaration | null);
}
export declare class CSSPropertyTracker extends Common.ObjectWrapper.ObjectWrapper {
    _cssModel: CSSModel;
    _properties: Protocol.CSS.CSSComputedStyleProperty[];
    constructor(cssModel: CSSModel, propertiesToTrack: Protocol.CSS.CSSComputedStyleProperty[]);
    start(): void;
    stop(): void;
    getTrackedProperties(): Protocol.CSS.CSSComputedStyleProperty[];
}
export declare enum CSSPropertyTrackerEvents {
    TrackedCSSPropertiesUpdated = "TrackedCSSPropertiesUpdated"
}
export interface ContrastInfo {
    backgroundColors: string[] | null;
    computedFontSize: string;
    computedFontWeight: string;
}
export {};
