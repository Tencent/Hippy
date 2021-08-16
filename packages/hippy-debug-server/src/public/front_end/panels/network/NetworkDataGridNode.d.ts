import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { NetworkTimeCalculator } from './NetworkTimeCalculator.js';
export declare enum Events {
    RequestSelected = "RequestSelected",
    RequestActivated = "RequestActivated"
}
export declare abstract class NetworkLogViewInterface {
    static HTTPRequestsFilter(request: SDK.NetworkRequest.NetworkRequest): boolean;
    onLoadFromFile(file: File): Promise<void>;
    abstract nodeForRequest(request: SDK.NetworkRequest.NetworkRequest): NetworkRequestNode | null;
    abstract headerHeight(): number;
    setRecording(recording: boolean): void;
    setWindow(start: number, end: number): void;
    resetFocus(): void;
    columnExtensionResolved(): void;
    hoveredNode(): NetworkNode | null;
    scheduleRefresh(): void;
    addFilmStripFrames(times: number[]): void;
    selectFilmStripFrame(time: number): void;
    clearFilmStripFrame(): void;
    timeCalculator(): NetworkTimeCalculator;
    calculator(): NetworkTimeCalculator;
    setCalculator(x: NetworkTimeCalculator): void;
    flatNodesList(): NetworkNode[];
    updateNodeBackground(): void;
    updateNodeSelectedClass(isSelected: boolean): void;
    stylesChanged(): void;
    setTextFilterValue(filterString: string): void;
    rowHeight(): number;
    switchViewMode(gridMode: boolean): void;
    handleContextMenuForRequest(contextMenu: UI.ContextMenu.ContextMenu, request: SDK.NetworkRequest.NetworkRequest): void;
    exportAll(): Promise<void>;
    revealAndHighlightRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    selectRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    removeAllNodeHighlights(): void;
    static getDCLEventColor(): string;
    static getLoadEventColor(): string;
    modelAdded(model: SDK.NetworkManager.NetworkManager): void;
    modelRemoved(model: SDK.NetworkManager.NetworkManager): void;
    linkifier(): Components.Linkifier.Linkifier;
}
export declare class NetworkNode extends DataGrid.SortableDataGrid.SortableDataGridNode<NetworkNode> {
    _parentView: NetworkLogViewInterface;
    _isHovered: boolean;
    _showingInitiatorChain: boolean;
    _requestOrFirstKnownChildRequest: SDK.NetworkRequest.NetworkRequest | null;
    constructor(parentView: NetworkLogViewInterface);
    displayName(): string;
    displayType(): string;
    createCell(columnId: string): HTMLElement;
    renderCell(cell: Element, columnId: string): void;
    _isFailed(): boolean;
    backgroundColor(): string;
    updateBackgroundColor(): void;
    setStriped(isStriped: boolean): void;
    select(supressSelectedEvent?: boolean): void;
    deselect(supressSelectedEvent?: boolean): void;
    parentView(): NetworkLogViewInterface;
    hovered(): boolean;
    showingInitiatorChain(): boolean;
    nodeSelfHeight(): number;
    setHovered(hovered: boolean, showInitiatorChain: boolean): void;
    showingInitiatorChainChanged(): void;
    isOnInitiatorPath(): boolean;
    isOnInitiatedPath(): boolean;
    request(): SDK.NetworkRequest.NetworkRequest | null;
    isNavigationRequest(): boolean;
    clearFlatNodes(): void;
    requestOrFirstKnownChildRequest(): SDK.NetworkRequest.NetworkRequest | null;
}
export declare const _backgroundColors: {
    [x: string]: string;
};
export declare class NetworkRequestNode extends NetworkNode {
    _nameCell: Element | null;
    _initiatorCell: Element | null;
    _request: SDK.NetworkRequest.NetworkRequest;
    _isNavigationRequest: boolean;
    selectable: boolean;
    _isOnInitiatorPath: boolean;
    _isOnInitiatedPath: boolean;
    _linkifiedInitiatorAnchor?: HTMLElement;
    constructor(parentView: NetworkLogViewInterface, request: SDK.NetworkRequest.NetworkRequest);
    static NameComparator(a: NetworkNode, b: NetworkNode): number;
    static RemoteAddressComparator(a: NetworkNode, b: NetworkNode): number;
    static SizeComparator(a: NetworkNode, b: NetworkNode): number;
    static TypeComparator(a: NetworkNode, b: NetworkNode): number;
    static InitiatorComparator(a: NetworkNode, b: NetworkNode): number;
    static InitiatorAddressSpaceComparator(a: NetworkNode, b: NetworkNode): number;
    static RemoteAddressSpaceComparator(a: NetworkNode, b: NetworkNode): number;
    static RequestCookiesCountComparator(a: NetworkNode, b: NetworkNode): number;
    static ResponseCookiesCountComparator(a: NetworkNode, b: NetworkNode): number;
    static PriorityComparator(a: NetworkNode, b: NetworkNode): number;
    static RequestPropertyComparator(propertyName: string, a: NetworkNode, b: NetworkNode): number;
    static RequestURLComparator(a: NetworkNode, b: NetworkNode): number;
    static ResponseHeaderStringComparator(propertyName: string, a: NetworkNode, b: NetworkNode): number;
    static ResponseHeaderNumberComparator(propertyName: string, a: NetworkNode, b: NetworkNode): number;
    static ResponseHeaderDateComparator(propertyName: string, a: NetworkNode, b: NetworkNode): number;
    showingInitiatorChainChanged(): void;
    _setIsOnInitiatorPath(isOnInitiatorPath: boolean): void;
    isOnInitiatorPath(): boolean;
    _setIsOnInitiatedPath(isOnInitiatedPath: boolean): void;
    isOnInitiatedPath(): boolean;
    displayType(): string;
    displayName(): string;
    request(): SDK.NetworkRequest.NetworkRequest;
    isNavigationRequest(): boolean;
    nodeSelfHeight(): number;
    createCells(element: Element): void;
    _setTextAndTitle(element: HTMLElement, text: string, title?: string): void;
    _setTextAndTitleAsLink(element: HTMLElement, cellText: string, titleText: string, handler: () => void): void;
    renderCell(c: Element, columnId: string): void;
    _arrayLength(array: Array<unknown> | null): string;
    select(supressSelectedEvent?: boolean): void;
    highlightMatchedSubstring(regexp: RegExp | null): Object[];
    _openInNewTab(): void;
    _isFailed(): boolean;
    _renderPrimaryCell(cell: HTMLElement, columnId: string, text?: string): void;
    _renderStatusCell(cell: HTMLElement): void;
    _renderInitiatorCell(cell: HTMLElement): void;
    _renderAddressSpaceCell(cell: HTMLElement, ipAddressSpace: Protocol.Network.IPAddressSpace): void;
    _renderSizeCell(cell: HTMLElement): void;
    _renderTimeCell(cell: HTMLElement): void;
    _appendSubtitle(cellElement: Element, subtitleText: string, showInlineWhenSelected?: boolean | undefined): void;
}
export declare class NetworkGroupNode extends NetworkNode {
    createCells(element: Element): void;
    renderCell(c: Element, columnId: string): void;
    select(supressSelectedEvent?: boolean): void;
}
