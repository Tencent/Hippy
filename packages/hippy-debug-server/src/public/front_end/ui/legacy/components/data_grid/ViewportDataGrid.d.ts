import type { DataGridData, Parameters } from './DataGrid.js';
import { DataGridImpl, DataGridNode } from './DataGrid.js';
export declare class ViewportDataGrid<T> extends DataGridImpl<ViewportDataGridNode<T>> {
    _onScrollBound: (event: Event | null) => void;
    _visibleNodes: ViewportDataGridNode<T>[];
    _inline: boolean;
    _stickToBottom: boolean;
    _updateIsFromUser: boolean;
    _lastScrollTop: number;
    _firstVisibleIsStriped: boolean;
    _isStriped: boolean;
    _updateAnimationFrameId?: number;
    constructor(dataGridParameters: Parameters);
    setStriped(striped: boolean): void;
    _updateStripesClass(startsWithOdd: boolean): void;
    setScrollContainer(scrollContainer: HTMLElement): void;
    onResize(): void;
    setStickToBottom(stick: boolean): void;
    _onScroll(_event: Event | null): void;
    scheduleUpdateStructure(): void;
    scheduleUpdate(isFromUser?: boolean): void;
    updateInstantly(): void;
    renderInline(): void;
    _calculateVisibleNodes(clientHeight: number, scrollTop: number): {
        topPadding: number;
        bottomPadding: number;
        contentHeight: number;
        visibleNodes: Array<ViewportDataGridNode<T>>;
        offset: number;
    };
    _contentHeight(): number;
    _update(): void;
    _revealViewportNode(node: ViewportDataGridNode<T>): void;
}
export declare enum Events {
    ViewportCalculated = "ViewportCalculated"
}
export declare class ViewportDataGridNode<T> extends DataGridNode<ViewportDataGridNode<T>> {
    _stale: boolean;
    _flatNodes: ViewportDataGridNode<T>[] | null;
    _isStriped: boolean;
    constructor(data?: DataGridData | null, hasChildren?: boolean);
    element(): Element;
    setStriped(isStriped: boolean): void;
    isStriped(): boolean;
    clearFlatNodes(): void;
    flatChildren(): ViewportDataGridNode<T>[];
    insertChild(child: DataGridNode<ViewportDataGridNode<T>>, index: number): void;
    removeChild(child: DataGridNode<ViewportDataGridNode<T>>): void;
    removeChildren(): void;
    _unlink(): void;
    collapse(): void;
    expand(): void;
    attached(): boolean;
    refresh(): void;
    reveal(): void;
    recalculateSiblings(index: number): void;
}
