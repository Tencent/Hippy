import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { PageVisibleSecurityState } from './SecurityModel.js';
import { SecurityModel, SecurityStyleExplanation } from './SecurityModel.js';
export declare class SecurityPanel extends UI.Panel.PanelWithSidebar implements SDK.TargetManager.SDKModelObserver<SecurityModel> {
    _mainView: SecurityMainView;
    _sidebarMainViewElement: SecurityPanelSidebarTreeElement;
    _sidebarTree: SecurityPanelSidebarTree;
    _lastResponseReceivedForLoaderId: Map<string, SDK.NetworkRequest.NetworkRequest>;
    _origins: Map<string, OriginState>;
    _filterRequestCounts: Map<string, number>;
    _visibleView: UI.Widget.VBox | null;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _securityModel: SecurityModel | null;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): SecurityPanel;
    static _instance(): SecurityPanel;
    static createCertificateViewerButtonForOrigin(text: string, origin: string): Element;
    static createCertificateViewerButtonForCert(text: string, names: string[]): Element;
    static createHighlightedUrl(url: string, securityState: string): Element;
    _updateSecurityState(newSecurityState: Protocol.Security.SecurityState, explanations: Protocol.Security.SecurityStateExplanation[], summary: string | null): void;
    _onSecurityStateChanged(event: Common.EventTarget.EventTargetEvent): void;
    _updateVisibleSecurityState(visibleSecurityState: PageVisibleSecurityState): void;
    _onVisibleSecurityStateChanged(event: Common.EventTarget.EventTargetEvent): void;
    selectAndSwitchToMainView(): void;
    showOrigin(origin: string): void;
    wasShown(): void;
    focus(): void;
    _setVisibleView(view: UI.Widget.VBox): void;
    _onResponseReceived(event: Common.EventTarget.EventTargetEvent): void;
    _processRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    _onRequestFinished(event: Common.EventTarget.EventTargetEvent): void;
    _updateFilterRequestCounts(request: SDK.NetworkRequest.NetworkRequest): void;
    filterRequestCount(filterKey: string): number;
    _securityStateMin(stateA: Protocol.Security.SecurityState, stateB: Protocol.Security.SecurityState): Protocol.Security.SecurityState;
    modelAdded(securityModel: SecurityModel): void;
    modelRemoved(securityModel: SecurityModel): void;
    _onMainFrameNavigated(event: Common.EventTarget.EventTargetEvent): void;
    _onInterstitialShown(): void;
    _onInterstitialHidden(): void;
}
export declare class SecurityPanelSidebarTree extends UI.TreeOutline.TreeOutlineInShadow {
    _showOriginInPanel: (arg0: Origin) => void;
    _mainOrigin: string | null;
    _originGroupTitles: Map<OriginGroup, string>;
    _originGroups: Map<OriginGroup, UI.TreeOutline.TreeElement>;
    _elementsByOrigin: Map<string, SecurityPanelSidebarTreeElement>;
    constructor(mainViewElement: SecurityPanelSidebarTreeElement, showOriginInPanel: (arg0: Origin) => void);
    _originGroupTitle(originGroup: OriginGroup): string;
    _originGroupElement(originGroup: OriginGroup): UI.TreeOutline.TreeElement;
    _createOriginGroupElement(originGroupTitle: string): UI.TreeOutline.TreeElement;
    toggleOriginsList(hidden: boolean): void;
    addOrigin(origin: string, securityState: Protocol.Security.SecurityState): void;
    setMainOrigin(origin: string): void;
    updateOrigin(origin: string, securityState: Protocol.Security.SecurityState): void;
    _clearOriginGroups(): void;
    clearOrigins(): void;
}
export declare enum OriginGroup {
    MainOrigin = "MainOrigin",
    NonSecure = "NonSecure",
    Secure = "Secure",
    Unknown = "Unknown"
}
export declare class SecurityPanelSidebarTreeElement extends UI.TreeOutline.TreeElement {
    _selectCallback: () => void;
    _cssPrefix: string;
    _iconElement: HTMLElement;
    _securityState: Protocol.Security.SecurityState | null;
    constructor(textElement: Element, selectCallback: () => void, className: string, cssPrefix: string);
    setSecurityState(newSecurityState: Protocol.Security.SecurityState): void;
    securityState(): Protocol.Security.SecurityState | null;
    onselect(): boolean;
}
export declare class SecurityMainView extends UI.Widget.VBox {
    _panel: SecurityPanel;
    _summarySection: HTMLElement;
    _securityExplanationsMain: HTMLElement;
    _securityExplanationsExtra: HTMLElement;
    _lockSpectrum: Map<Protocol.Security.SecurityState, HTMLElement>;
    _summaryText: HTMLElement;
    _explanations: (Protocol.Security.SecurityStateExplanation | SecurityStyleExplanation)[] | null;
    _securityState: Protocol.Security.SecurityState | null;
    constructor(panel: SecurityPanel);
    getLockSpectrumDiv(securityState: Protocol.Security.SecurityState): HTMLElement;
    _addExplanation(parent: Element, explanation: Protocol.Security.SecurityStateExplanation | SecurityStyleExplanation): Element;
    updateSecurityState(newSecurityState: Protocol.Security.SecurityState, explanations: Protocol.Security.SecurityStateExplanation[], summary: string | null): void;
    updateVisibleSecurityState(visibleSecurityState: PageVisibleSecurityState): void;
    _getSecuritySummaryAndExplanations(visibleSecurityState: PageVisibleSecurityState): {
        summary: (string | undefined);
        explanations: Array<SecurityStyleExplanation>;
    };
    _explainSafetyTipSecurity(visibleSecurityState: PageVisibleSecurityState, summary: string | undefined, explanations: SecurityStyleExplanation[]): string | undefined;
    _explainCertificateSecurity(visibleSecurityState: PageVisibleSecurityState, explanations: SecurityStyleExplanation[]): void;
    _explainConnectionSecurity(visibleSecurityState: PageVisibleSecurityState, explanations: SecurityStyleExplanation[]): void;
    _explainContentSecurity(visibleSecurityState: PageVisibleSecurityState, explanations: SecurityStyleExplanation[]): void;
    _orderExplanations(explanations: SecurityStyleExplanation[]): SecurityStyleExplanation[];
    refreshExplanations(): void;
    _addMixedContentExplanation(parent: Element, explanation: Protocol.Security.SecurityStateExplanation | SecurityStyleExplanation, filterKey: string): void;
    showNetworkFilter(filterKey: string, e: Event): void;
}
export declare class SecurityOriginView extends UI.Widget.VBox {
    _panel: SecurityPanel;
    _originLockIcon: HTMLElement;
    constructor(panel: SecurityPanel, origin: string, originState: OriginState);
    _createSanDiv(sanList: string[]): Element;
    setSecurityState(newSecurityState: Protocol.Security.SecurityState): void;
}
export declare class SecurityDetailsTable {
    _element: HTMLTableElement;
    constructor();
    element(): HTMLTableElement;
    addRow(key: string, value: string | Node): void;
}
export interface OriginState {
    securityState: Protocol.Security.SecurityState;
    securityDetails: Protocol.Network.SecurityDetails | null;
    loadedFromCache: boolean;
    originView?: SecurityOriginView | null;
}
export declare type Origin = string;
