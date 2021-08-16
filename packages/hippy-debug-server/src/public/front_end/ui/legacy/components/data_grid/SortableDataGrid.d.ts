import type { DataGridData, Parameters } from './DataGrid.js';
import { ViewportDataGrid, ViewportDataGridNode } from './ViewportDataGrid.js';
export declare class SortableDataGrid<T> extends ViewportDataGrid<SortableDataGridNode<T>> {
    _sortingFunction: <T>(a: SortableDataGridNode<T>, b: SortableDataGridNode<T>) => number;
    constructor(dataGridParameters: Parameters);
    static TrivialComparator<T>(_a: SortableDataGridNode<T>, _b: SortableDataGridNode<T>): number;
    static NumericComparator<T>(columnId: string, a: SortableDataGridNode<T>, b: SortableDataGridNode<T>): number;
    static StringComparator<T>(columnId: string, a: SortableDataGridNode<T>, b: SortableDataGridNode<T>): number;
    static Comparator<T>(comparator: (arg0: SortableDataGridNode<T>, arg1: SortableDataGridNode<T>) => number, reverseMode: boolean, a: SortableDataGridNode<T>, b: SortableDataGridNode<T>): number;
    static create<T>(columnNames: string[], values: any[], displayName: string): SortableDataGrid<SortableDataGridNode<T>> | null;
    insertChild(node: SortableDataGridNode<T>): void;
    sortNodes(comparator: (arg0: SortableDataGridNode<T>, arg1: SortableDataGridNode<T>) => number, reverseMode: boolean): void;
}
export declare class SortableDataGridNode<T> extends ViewportDataGridNode<SortableDataGridNode<T>> {
    constructor(data?: DataGridData | null, hasChildren?: boolean);
    insertChildOrdered(node: SortableDataGridNode<T>): void;
    _sortChildren(): void;
}
