import { GlassPane } from './GlassPane.js';
import type { SplitWidget } from './SplitWidget.js';
import { WidgetFocusRestorer } from './Widget.js';
export declare class Dialog extends GlassPane {
    _tabIndexBehavior: OutsideTabIndexBehavior;
    _tabIndexMap: Map<HTMLElement, number>;
    _focusRestorer: WidgetFocusRestorer | null;
    _closeOnEscape: boolean;
    _targetDocument: Document | null;
    _targetDocumentKeyDownHandler: (event: Event) => void;
    _escapeKeyCallback: ((arg0: Event) => void) | null;
    constructor();
    static hasInstance(): boolean;
    show(where?: Document | Element): void;
    hide(): void;
    setCloseOnEscape(close: boolean): void;
    setEscapeKeyCallback(callback: (arg0: Event) => void): void;
    addCloseButton(): void;
    setOutsideTabIndexBehavior(tabIndexBehavior: OutsideTabIndexBehavior): void;
    _disableTabIndexOnElements(document: Document): void;
    _getMainWidgetTabIndexElements(splitWidget: SplitWidget | null): Set<HTMLElement>;
    _restoreTabIndexOnElements(): void;
    _onKeyDown(event: Event): void;
    static _instance: Dialog | null;
}
export declare enum OutsideTabIndexBehavior {
    DisableAllOutsideTabIndex = "DisableAllTabIndex",
    PreserveMainViewTabIndex = "PreserveMainViewTabIndex",
    PreserveTabIndex = "PreserveTabIndex"
}
