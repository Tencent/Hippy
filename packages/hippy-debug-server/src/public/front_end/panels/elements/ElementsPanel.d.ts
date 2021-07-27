import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AccessibilityTreeView } from './AccessibilityTreeView.js';
import * as ElementsComponents from './components/components.js';
import { ComputedStyleWidget } from './ComputedStyleWidget.js';
import type { ElementsTreeElement } from './ElementsTreeElement.js';
import { ElementsTreeOutline } from './ElementsTreeOutline.js';
import type { MarkerDecorator } from './MarkerDecorator.js';
import { MetricsSidebarPane } from './MetricsSidebarPane.js';
import { StylesSidebarPane } from './StylesSidebarPane.js';
export declare class ElementsPanel extends UI.Panel.Panel implements UI.SearchableView.Searchable, SDK.TargetManager.SDKModelObserver<SDK.DOMModel.DOMModel>, UI.View.ViewLocationResolver {
    _splitWidget: UI.SplitWidget.SplitWidget;
    _searchableView: UI.SearchableView.SearchableView;
    _contentElement: HTMLDivElement;
    _splitMode: _splitMode | null;
    _accessibilityTreeView: AccessibilityTreeView | undefined;
    _breadcrumbs: ElementsComponents.ElementsBreadcrumbs.ElementsBreadcrumbs;
    _stylesWidget: StylesSidebarPane;
    _computedStyleWidget: ComputedStyleWidget;
    _metricsWidget: MetricsSidebarPane;
    _treeOutlines: Set<ElementsTreeOutline>;
    _treeOutlineHeaders: Map<ElementsTreeOutline, Element>;
    _gridStyleTrackerByCSSModel: Map<SDK.CSSModel.CSSModel, SDK.CSSModel.CSSPropertyTracker>;
    _searchResults: {
        domModel: SDK.DOMModel.DOMModel;
        index: number;
        node: ((SDK.DOMModel.DOMNode | undefined) | null);
    }[] | undefined;
    _currentSearchResultIndex: number;
    _pendingNodeReveal: boolean;
    _adornerManager: ElementsComponents.AdornerManager.AdornerManager;
    _adornerSettingsPane: ElementsComponents.AdornerSettingsPane.AdornerSettingsPane | null;
    _adornersByName: Map<string, Set<ElementsComponents.Adorner.Adorner>>;
    _accessibilityTreeButton?: HTMLButtonElement;
    domTreeButton?: HTMLButtonElement;
    _selectedNodeOnReset?: SDK.DOMModel.DOMNode;
    _hasNonDefaultSelectedNode?: boolean;
    _searchConfig?: UI.SearchableView.SearchConfig;
    _omitDefaultSelection?: boolean;
    _notFirstInspectElement?: boolean;
    sidebarPaneView?: UI.View.TabbedViewLocation;
    _stylesViewToReveal?: UI.View.SimpleView;
    constructor();
    _initializeFullAccessibilityTreeView(stackElement: UI.Widget.WidgetElement): void;
    _showAccessibilityTree(): void;
    _showDOMTree(): void;
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): ElementsPanel;
    _revealProperty(cssProperty: SDK.CSSProperty.CSSProperty): Promise<void>;
    resolveLocation(_locationName: string): UI.View.ViewLocation | null;
    showToolbarPane(widget: UI.Widget.Widget | null, toggle: UI.Toolbar.ToolbarToggle | null): void;
    modelAdded(domModel: SDK.DOMModel.DOMModel): void;
    modelRemoved(domModel: SDK.DOMModel.DOMModel): void;
    _targetNameChanged(target: SDK.Target.Target): void;
    _updateTreeOutlineVisibleWidth(): void;
    focus(): void;
    searchableView(): UI.SearchableView.SearchableView;
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    _selectedNodeChanged(event: Common.EventTarget.EventTargetEvent): void;
    _documentUpdatedEvent(event: Common.EventTarget.EventTargetEvent): void;
    _documentUpdated(domModel: SDK.DOMModel.DOMModel): void;
    _lastSelectedNodeSelectedForTest(): void;
    _setDefaultSelectedNode(node: SDK.DOMModel.DOMNode | null): void;
    searchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    _domWordWrapSettingChanged(event: Common.EventTarget.EventTargetEvent): void;
    switchToAndFocus(node: SDK.DOMModel.DOMNode): void;
    _jumpToSearchResult(index: number): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
    _highlightCurrentSearchResult(): void;
    _hideSearchHighlights(): void;
    selectedDOMNode(): SDK.DOMModel.DOMNode | null;
    selectDOMNode(node: SDK.DOMModel.DOMNode, focus?: boolean): void;
    _updateBreadcrumbIfNeeded(event: Common.EventTarget.EventTargetEvent): void;
    _crumbNodeSelected(event: Common.EventTarget.EventTargetEvent): void;
    _treeOutlineForNode(node: SDK.DOMModel.DOMNode | null): ElementsTreeOutline | null;
    _treeElementForNode(node: SDK.DOMModel.DOMNode): ElementsTreeElement | null;
    _leaveUserAgentShadowDOM(node: SDK.DOMModel.DOMNode): SDK.DOMModel.DOMNode;
    revealAndSelectNode(node: SDK.DOMModel.DOMNode, focus: boolean, omitHighlight?: boolean): Promise<void>;
    _showUAShadowDOMChanged(): void;
    _setupTextSelectionHack(stylePaneWrapperElement: HTMLElement): void;
    _initializeSidebarPanes(splitMode: _splitMode): void;
    _updateSidebarPosition(): void;
    _extensionSidebarPaneAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addExtensionSidebarPane(pane: Extensions.ExtensionPanel.ExtensionSidebarPane): void;
    getComputedStyleWidget(): ComputedStyleWidget;
    _setupStyleTracking(cssModel: SDK.CSSModel.CSSModel): void;
    _removeStyleTracking(cssModel: SDK.CSSModel.CSSModel): void;
    _trackedCSSPropertiesUpdated(event: Common.EventTarget.EventTargetEvent): void;
    showAdornerSettingsPane(): void;
    isAdornerEnabled(adornerText: string): boolean;
    registerAdorner(adorner: ElementsComponents.Adorner.Adorner): void;
    deregisterAdorner(adorner: ElementsComponents.Adorner.Adorner): void;
    static _firstInspectElementCompletedForTest: () => void;
    static _firstInspectElementNodeNameForTest: string;
}
export declare const enum _splitMode {
    Vertical = "Vertical",
    Horizontal = "Horizontal"
}
export declare class ContextMenuProvider implements UI.ContextMenu.Provider {
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, object: Object): void;
    static instance(): ContextMenuProvider;
}
export declare class DOMNodeRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): DOMNodeRevealer;
    reveal(node: Object, omitFocus?: boolean): Promise<void>;
}
export declare class CSSPropertyRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): CSSPropertyRevealer;
    reveal(property: Object): Promise<void>;
}
export declare class ElementsActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(context: UI.Context.Context, actionId: string): boolean;
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): ElementsActionDelegate;
}
export declare class PseudoStateMarkerDecorator implements MarkerDecorator {
    static instance(opts?: {
        forceNew: boolean | null;
    }): PseudoStateMarkerDecorator;
    decorate(node: SDK.DOMModel.DOMNode): {
        title: string;
        color: string;
    } | null;
}
