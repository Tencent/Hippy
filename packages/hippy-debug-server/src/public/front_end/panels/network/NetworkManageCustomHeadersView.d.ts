import * as UI from '../../ui/legacy/legacy.js';
interface CustomHeader {
    header: string;
}
export declare class NetworkManageCustomHeadersView extends UI.Widget.VBox implements UI.ListWidget.Delegate<CustomHeader> {
    _list: UI.ListWidget.ListWidget<CustomHeader>;
    _columnConfigs: Map<string, {
        title: string;
        editable: boolean;
    }>;
    _addHeaderColumnCallback: (arg0: string) => boolean;
    _changeHeaderColumnCallback: (arg0: string, arg1: string) => boolean;
    _removeHeaderColumnCallback: (arg0: string) => boolean;
    _editor?: UI.ListWidget.Editor<CustomHeader>;
    constructor(columnData: {
        title: string;
        editable: boolean;
    }[], addHeaderColumnCallback: (arg0: string) => boolean, changeHeaderColumnCallback: (arg0: string, arg1: string) => boolean, removeHeaderColumnCallback: (arg0: string) => boolean);
    wasShown(): void;
    _headersUpdated(): void;
    _addButtonClicked(): void;
    renderItem(item: CustomHeader, _editable: boolean): Element;
    removeItemRequested(item: CustomHeader, _index: number): void;
    commitEdit(item: CustomHeader, editor: UI.ListWidget.Editor<CustomHeader>, isNew: boolean): void;
    beginEdit(item: CustomHeader): UI.ListWidget.Editor<CustomHeader>;
    _createEditor(): UI.ListWidget.Editor<CustomHeader>;
}
export {};
