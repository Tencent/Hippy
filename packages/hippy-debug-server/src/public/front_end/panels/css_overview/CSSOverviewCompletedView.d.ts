import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { OverviewController } from './CSSOverviewController.js';
import { CSSOverviewSidebarPanel } from './CSSOverviewSidebarPanel.js';
import type { UnusedDeclaration } from './CSSOverviewUnusedDeclarations.js';
export declare type NodeStyleStats = Map<string, Set<number>>;
export interface ContrastIssue {
    nodeId: number;
    contrastRatio: number;
    textColor: Common.Color.Color;
    backgroundColor: Common.Color.Color;
    thresholdsViolated: {
        aa: boolean;
        aaa: boolean;
        apca: boolean;
    };
}
export interface OverviewData {
    backgroundColors: Map<string, Set<number>>;
    textColors: Map<string, Set<number>>;
    textColorContrastIssues: Map<string, ContrastIssue[]>;
    fillColors: Map<string, Set<number>>;
    borderColors: Map<string, Set<number>>;
    globalStyleStats: {
        styleRules: number;
        inlineStyles: number;
        externalSheets: number;
        stats: {
            type: number;
            class: number;
            id: number;
            universal: number;
            attribute: number;
            nonSimple: number;
        };
    };
    fontInfo: Map<string, Map<string, Map<string, number[]>>>;
    elementCount: number;
    mediaQueries: Map<string, Protocol.CSS.CSSMedia[]>;
    unusedDeclarations: Map<string, UnusedDeclaration[]>;
}
export declare type FontInfo = Map<string, Map<string, Map<string, number[]>>>;
export declare class CSSOverviewCompletedView extends UI.Panel.PanelWithSidebar {
    _controller: OverviewController;
    _formatter: Intl.NumberFormat;
    _mainContainer: UI.SplitWidget.SplitWidget;
    _resultsContainer: UI.Widget.VBox;
    _elementContainer: DetailsView;
    _sideBar: CSSOverviewSidebarPanel;
    _cssModel: SDK.CSSModel.CSSModel;
    _domModel: SDK.DOMModel.DOMModel;
    _domAgent: ProtocolProxyApi.DOMApi;
    _linkifier: Components.Linkifier.Linkifier;
    _viewMap: Map<string, ElementDetailsView>;
    _data: OverviewData | null;
    _fragment?: UI.Fragment.Fragment;
    constructor(controller: OverviewController, target: SDK.Target.Target);
    wasShown(): void;
    _sideBarItemSelected(event: Common.EventTarget.EventTargetEvent): void;
    _sideBarReset(): void;
    _reset(): void;
    _onClick(evt: Event): void;
    _onMouseOver(evt: Event): void;
    _render(data: OverviewData): Promise<void>;
    _createElementsView(evt: Common.EventTarget.EventTargetEvent): void;
    _fontInfoToFragment(fontInfo: Map<string, Map<string, Map<string, number[]>>>): UI.Fragment.Fragment;
    _fontMetricsToFragment(font: string, fontMetrics: Map<string, Map<string, number[]>>): UI.Fragment.Fragment;
    _groupToFragment(items: Map<string, (number | UnusedDeclaration | Protocol.CSS.CSSMedia)[]>, type: string, dataLabel: string, path?: string): UI.Fragment.Fragment;
    _contrastIssuesToFragment(issues: Map<string, ContrastIssue[]>): UI.Fragment.Fragment;
    _contrastIssueToFragment(key: string, issues: ContrastIssue[]): UI.Fragment.Fragment;
    _colorsToFragment(section: string, color: string): UI.Fragment.Fragment | undefined;
    _sortColorsByLuminance(srcColors: Map<string, Set<number>>): string[];
    setOverviewData(data: OverviewData): void;
    static readonly pushedNodes: Set<unknown>;
}
export declare class DetailsView extends UI.Widget.VBox {
    _tabbedPane: UI.TabbedPane.TabbedPane;
    constructor();
    appendTab(id: string, tabTitle: string, view: UI.Widget.Widget, isCloseable?: boolean): void;
    closeTabs(): void;
}
export declare class ElementDetailsView extends UI.Widget.Widget {
    _controller: OverviewController;
    _domModel: SDK.DOMModel.DOMModel;
    _cssModel: SDK.CSSModel.CSSModel;
    _linkifier: Components.Linkifier.Linkifier;
    _elementGridColumns: DataGrid.DataGrid.ColumnDescriptor[];
    _elementGrid: DataGrid.SortableDataGrid.SortableDataGrid<unknown>;
    constructor(controller: OverviewController, domModel: SDK.DOMModel.DOMModel, cssModel: SDK.CSSModel.CSSModel, linkifier: Components.Linkifier.Linkifier);
    _sortMediaQueryDataGrid(): void;
    _onMouseOver(evt: Event): void;
    populateNodes(data: {
        nodeId: number;
        hasChildren: boolean;
        [x: string]: unknown;
    }[]): Promise<void>;
}
export declare class ElementNode extends DataGrid.SortableDataGrid.SortableDataGridNode<ElementNode> {
    _linkifier: Components.Linkifier.Linkifier;
    _cssModel: SDK.CSSModel.CSSModel;
    constructor(data: {
        hasChildren: boolean;
        [x: string]: unknown;
    }, linkifier: Components.Linkifier.Linkifier, cssModel: SDK.CSSModel.CSSModel);
    createCell(columnId: string): HTMLElement;
    _linkifyRuleLocation(cssModel: SDK.CSSModel.CSSModel, linkifier: Components.Linkifier.Linkifier, styleSheetId: string, ruleLocation: TextUtils.TextRange.TextRange): Element | undefined;
}
