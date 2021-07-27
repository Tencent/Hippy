import * as Platform from '../../core/platform/platform.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class JavaScriptBreakpointsSidebarPane extends UI.ThrottledWidget.ThrottledWidget implements UI.ContextFlavorListener.ContextFlavorListener, UI.ListControl.ListDelegate<BreakpointItem> {
    _breakpointManager: Bindings.BreakpointManager.BreakpointManager;
    _breakpoints: UI.ListModel.ListModel<BreakpointItem>;
    _list: UI.ListControl.ListControl<BreakpointItem>;
    _emptyElement: HTMLElement;
    private constructor();
    static instance(): JavaScriptBreakpointsSidebarPane;
    _getBreakpointLocations(): BreakpointLocation[];
    _hideList(): void;
    _ensureListShown(): void;
    _groupBreakpointLocationsById(breakpointLocations: BreakpointLocation[]): BreakpointLocation[][];
    _getLocationIdsByLineId(breakpointLocations: BreakpointLocation[]): Platform.MapUtilities.Multimap<string, string>;
    _getSelectedUILocation(): Promise<Workspace.UISourceCode.UILocation | null>;
    _getContent(locations: BreakpointLocation[][]): Promise<TextUtils.Text.Text[]>;
    doUpdate(): Promise<void>;
    /**
     * If the number of breakpoint items is the same,
     * we expect only minor changes and it implies that only
     * few items should be updated
     */
    _setBreakpointItems(breakpointItems: BreakpointItem[]): void;
    createElementForItem(item: BreakpointItem): Element;
    heightForItem(_item: BreakpointItem): number;
    isItemSelectable(_item: BreakpointItem): boolean;
    selectedItemChanged(_from: BreakpointItem | null, _to: BreakpointItem | null, fromElement: HTMLElement | null, toElement: HTMLElement | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    _breakpointLocations(event: Event): Bindings.BreakpointManager.BreakpointLocation[];
    _breakpointLocationsForElement(element: Element): Bindings.BreakpointManager.BreakpointLocation[];
    _breakpointCheckboxClicked(event: Event): void;
    _revealLocation(element: Element): void;
    _breakpointContextMenu(event: Event): void;
    _toggleAllBreakpointsInFile(element: Element, toggleState: boolean): void;
    _toggleAllBreakpoints(toggleState: boolean): void;
    _removeAllBreakpoints(): void;
    _removeOtherBreakpoints(selectedBreakpoints: Set<Bindings.BreakpointManager.Breakpoint>): void;
    flavorChanged(_object: Object | null): void;
    _didUpdateForTest(): void;
}
declare class BreakpointItem {
    locations: BreakpointLocation[];
    text: TextUtils.Text.Text | null;
    isSelected: boolean;
    showColumn: boolean;
    constructor(locations: BreakpointLocation[], text: TextUtils.Text.Text | null, isSelected: boolean, showColumn: boolean);
    /**
     * Checks if this item has not changed compared with the other
     * Used to cache model items between re-renders
     */
    isSimilar(other: BreakpointItem): boolean | null;
}
export declare function retrieveLocationForElement(element: Element): Workspace.UISourceCode.UILocation | undefined;
export interface BreakpointLocation {
    breakpoint: Bindings.BreakpointManager.Breakpoint;
    uiLocation: Workspace.UISourceCode.UILocation;
}
export {};
