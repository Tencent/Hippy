import type { SearchableView } from './SearchableView.js';
import { SplitWidget } from './SplitWidget.js';
import { VBox } from './Widget.js';
export declare class Panel extends VBox {
    _panelName: string;
    constructor(name: string);
    get name(): string;
    searchableView(): SearchableView | null;
    elementsToRestoreScrollPositionsFor(): Element[];
}
export declare class PanelWithSidebar extends Panel {
    _panelSplitWidget: SplitWidget;
    _mainWidget: VBox;
    _sidebarWidget: VBox;
    constructor(name: string, defaultWidth?: number);
    panelSidebarElement(): Element;
    mainElement(): Element;
    splitWidget(): SplitWidget;
}
