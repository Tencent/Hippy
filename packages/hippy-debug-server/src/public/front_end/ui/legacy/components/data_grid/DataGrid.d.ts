import * as Common from '../../../../core/common/common.js';
import * as UI from '../../legacy.js';
export declare class DataGridImpl<T> extends Common.ObjectWrapper.ObjectWrapper {
    element: HTMLDivElement;
    _displayName: string;
    _editCallback: ((arg0: any, arg1: string, arg2: any, arg3: any) => any) | undefined;
    _deleteCallback: ((arg0: any) => any) | undefined;
    _refreshCallback: (() => any) | undefined;
    _headerTable: Element;
    _headerTableHeaders: {
        [x: string]: Element;
    };
    _scrollContainer: Element;
    _dataTable: Element;
    _inline: boolean;
    _columnsArray: ColumnDescriptor[];
    _columns: {
        [x: string]: ColumnDescriptor;
    };
    visibleColumnsArray: ColumnDescriptor[];
    _cellClass: string | null;
    _headerTableColumnGroup: Element;
    _headerTableBody: HTMLTableSectionElement;
    _headerRow: Element;
    _dataTableColumnGroup: Element;
    dataTableBody: Element;
    _topFillerRow: HTMLElement;
    _bottomFillerRow: HTMLElement;
    _editing: boolean;
    selectedNode: DataGridNode<T> | null;
    expandNodesWhenArrowing: boolean;
    indentWidth: number;
    _resizers: HTMLElement[];
    _columnWidthsInitialized: boolean;
    _cornerWidth: number;
    _resizeMethod: ResizeMethod;
    _headerContextMenuCallback: ((arg0: UI.ContextMenu.SubMenu) => void) | null;
    _rowContextMenuCallback: ((arg0: UI.ContextMenu.ContextMenu, arg1: DataGridNode<T>) => void) | null;
    elementToDataGridNode: WeakMap<Node, DataGridNode<T>>;
    disclosureColumnId?: string;
    _sortColumnCell?: Element;
    _rootNode?: DataGridNode<T>;
    _editingNode?: DataGridNode<T> | null;
    _columnWeightsSetting?: Common.Settings.Setting<any>;
    creationNode?: CreationDataGridNode<any>;
    _currentResizer?: EventTarget | null;
    _dataGridWidget?: any;
    constructor(dataGridParameters: Parameters);
    _firstSelectableNode(): DataGridNode<T> | null | undefined;
    _lastSelectableNode(): DataGridNode<T> | undefined;
    setElementContent(element: Element, value: any): void;
    static setElementText(element: Element, newText: string, longText: boolean): void;
    static setElementBoolean(element: Element, value: boolean): void;
    setStriped(isStriped: boolean): void;
    setFocusable(focusable: boolean): void;
    setHasSelection(hasSelected: boolean): void;
    updateGridAccessibleName(text?: string): void;
    updateGridAccessibleNameOnFocus(): void;
    headerTableBody(): Element;
    _innerAddColumn(column: ColumnDescriptor, position?: number): void;
    addColumn(column: ColumnDescriptor, position?: number): void;
    _innerRemoveColumn(columnId: string): void;
    removeColumn(columnId: string): void;
    setCellClass(cellClass: string): void;
    _refreshHeader(): void;
    protected setVerticalPadding(top: number, bottom: number): void;
    protected setRootNode(rootNode: DataGridNode<T>): void;
    rootNode(): DataGridNode<T>;
    _ondblclick(event: Event): void;
    _startEditingColumnOfDataGridNode(node: DataGridNode<T>, cellIndex: number): void;
    startEditingNextEditableColumnOfDataGridNode(node: DataGridNode<T>, columnIdentifier: string): void;
    _startEditing(target: Node): void;
    renderInline(): void;
    _startEditingConfig(_element: Element): UI.InplaceEditor.Config<any>;
    _editingCommitted(element: Element, newText: any, oldText: any, context: string | undefined, moveDirection: string): void;
    _editingCancelled(_element: Element): void;
    _nextEditableColumn(cellIndex: number, moveBackward?: boolean): number;
    sortColumnId(): string | null;
    sortOrder(): string | null;
    isSortOrderAscending(): boolean;
    _autoSizeWidths(widths: number[], minPercent: number, maxPercent?: number): number[];
    /**
     * The range of |minPercent| and |maxPercent| is [0, 100].
     */
    autoSizeColumns(minPercent: number, maxPercent?: number, maxDescentLevel?: number): void;
    _enumerateChildren(rootNode: DataGridNode<T>, result: DataGridNode<T>[], maxLevel: number): DataGridNode<T>[];
    onResize(): void;
    updateWidths(): void;
    indexOfVisibleColumn(columnId: string): number;
    setName(name: string): void;
    _resetColumnWeights(): void;
    _loadColumnWeights(): void;
    _saveColumnWeights(): void;
    wasShown(): void;
    willHide(): void;
    _applyColumnWeights(): void;
    setColumnsVisiblity(columnsVisibility: Set<string>): void;
    get scrollContainer(): HTMLElement;
    _positionResizers(): void;
    addCreationNode(hasChildren?: boolean): void;
    _keyDown(event: Event): void;
    updateSelectionBeforeRemoval(root: DataGridNode<T> | null, _onlyAffectsSubtree: boolean): void;
    dataGridNodeFromNode(target: Node): DataGridNode<T> | null;
    columnIdFromNode(target: Node): string | null;
    _clickInHeaderCell(event: Event): void;
    _sortByColumnHeaderCell(cell: Element): void;
    markColumnAsSortedBy(columnId: string, sortOrder: Order): void;
    headerTableHeader(columnId: string): Element;
    _mouseDownInDataTable(event: Event): void;
    setHeaderContextMenuCallback(callback: ((arg0: UI.ContextMenu.SubMenu) => void) | null): void;
    setRowContextMenuCallback(callback: ((arg0: UI.ContextMenu.ContextMenu, arg1: DataGridNode<T>) => void) | null): void;
    _contextMenu(event: Event): void;
    _clickInDataTable(event: Event): void;
    setResizeMethod(method: ResizeMethod): void;
    _startResizerDragging(event: Event): boolean;
    _endResizerDragging(): void;
    _resizerDragging(event: MouseEvent): void;
    _setPreferredWidth(columnIndex: number, width: number): void;
    columnOffset(columnId: string): number;
    asWidget(): DataGridWidget<T>;
    topFillerRowElement(): HTMLElement;
}
export declare const CornerWidth = 14;
export declare enum Events {
    SelectedNode = "SelectedNode",
    DeselectedNode = "DeselectedNode",
    OpenedNode = "OpenedNode",
    SortingChanged = "SortingChanged",
    PaddingChanged = "PaddingChanged"
}
export declare enum Order {
    Ascending = "sort-ascending",
    Descending = "sort-descending"
}
export declare enum Align {
    Center = "center",
    Right = "right"
}
export declare enum DataType {
    String = "String",
    Boolean = "Boolean"
}
export declare const ColumnResizePadding = 24;
export declare const CenterResizerOverBorderAdjustment = 3;
export declare enum ResizeMethod {
    Nearest = "nearest",
    First = "first",
    Last = "last"
}
export declare type DataGridData = {
    [key: string]: any;
};
export declare class DataGridNode<T> extends Common.ObjectWrapper.ObjectWrapper {
    _element: Element | null;
    _expanded: boolean;
    _selected: boolean;
    _dirty: boolean;
    _inactive: boolean;
    key: string;
    _depth: number | undefined;
    _revealed: boolean | undefined;
    _attached: boolean;
    _savedPosition: {
        parent: DataGridNode<T>;
        index: number;
    } | null;
    _shouldRefreshChildren: boolean;
    _data: DataGridData;
    _hasChildren: boolean;
    children: DataGridNode<T>[];
    dataGrid: DataGridImpl<T> | null;
    parent: DataGridNode<T> | null;
    previousSibling: DataGridNode<T> | null;
    nextSibling: DataGridNode<T> | null;
    disclosureToggleWidth: number;
    selectable: boolean;
    _isRoot: boolean;
    nodeAccessibleText: string;
    cellAccessibleTextMap: Map<string, string>;
    isCreationNode: boolean;
    constructor(data?: DataGridData | null, hasChildren?: boolean);
    element(): Element;
    protected createElement(): Element;
    existingElement(): Element | null;
    protected resetElement(): void;
    protected createCells(element: Element): void;
    get data(): DataGridData;
    set data(x: DataGridData);
    get revealed(): boolean;
    set revealed(x: boolean);
    isDirty(): boolean;
    setDirty(dirty: boolean): void;
    isInactive(): boolean;
    setInactive(inactive: boolean): void;
    hasChildren(): boolean;
    setHasChildren(x: boolean): void;
    get depth(): number;
    get leftPadding(): number;
    get shouldRefreshChildren(): boolean;
    set shouldRefreshChildren(x: boolean);
    get selected(): boolean;
    set selected(x: boolean);
    get expanded(): boolean;
    set expanded(x: boolean);
    refresh(): void;
    createTDWithClass(className: string): HTMLElement;
    createTD(columnId: string): HTMLElement;
    createCell(columnId: string): HTMLElement;
    setCellAccessibleName(name: string, cell: Element, columnId: string): void;
    nodeSelfHeight(): number;
    appendChild(child: DataGridNode<T>): void;
    resetNode(onlyCaches?: boolean): void;
    insertChild(child: DataGridNode<T>, index: number): void;
    remove(): void;
    removeChild(child: DataGridNode<T>): void;
    removeChildren(): void;
    recalculateSiblings(myIndex: number): void;
    collapse(): void;
    collapseRecursively(): void;
    populate(): void;
    expand(): void;
    expandRecursively(): void;
    reveal(): void;
    select(supressSelectedEvent?: boolean): void;
    revealAndSelect(): void;
    deselect(supressDeselectedEvent?: boolean): void;
    traverseNextNode(skipHidden: boolean, stayWithin?: DataGridNode<T> | null, dontPopulate?: boolean, info?: {
        depthChange: number;
    }): DataGridNode<T> | null;
    traversePreviousNode(skipHidden: boolean, dontPopulate?: boolean): DataGridNode<T> | null;
    isEventWithinDisclosureTriangle(event: MouseEvent): boolean;
    _attach(): void;
    _detach(): void;
    savePosition(): void;
    restorePosition(): void;
}
export declare class CreationDataGridNode<T> extends DataGridNode<T> {
    isCreationNode: boolean;
    constructor(data?: {
        [x: string]: any;
    } | null, hasChildren?: boolean);
    makeNormal(): void;
}
export declare class DataGridWidget<T> extends UI.Widget.VBox {
    _dataGrid: DataGridImpl<T>;
    constructor(dataGrid: DataGridImpl<T>);
    wasShown(): void;
    willHide(): void;
    onResize(): void;
    elementsToRestoreScrollPositionsFor(): Element[];
}
export interface Parameters {
    displayName: string;
    columns: ColumnDescriptor[];
    editCallback?: ((arg0: any, arg1: string, arg2: any, arg3: any) => any);
    deleteCallback?: ((arg0: any) => any);
    refreshCallback?: (() => any);
}
export interface ColumnDescriptor {
    id: string;
    title?: Common.UIString.LocalizedString;
    titleDOMFragment?: DocumentFragment | null;
    sortable: boolean;
    sort?: Order | null;
    align?: Align | null;
    width?: string;
    fixedWidth?: boolean;
    editable?: boolean;
    nonSelectable?: boolean;
    longText?: boolean;
    disclosure?: boolean;
    weight?: number;
    allowInSortByEvenWhenHidden?: boolean;
    dataType?: DataType | null;
    defaultWeight?: number;
}
