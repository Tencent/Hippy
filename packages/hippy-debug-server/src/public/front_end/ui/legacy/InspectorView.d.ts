import * as Common from '../../core/common/common.js';
import type { ActionDelegate as ActionDelegateInterface } from './ActionRegistration.js';
import type { Context } from './Context.js';
import type { ContextMenu } from './ContextMenu.js';
import type { Icon } from './Icon.js';
import { Infobar } from './Infobar.js';
import type { Panel } from './Panel.js';
import { SplitWidget } from './SplitWidget.js';
import type { TabbedPane, TabbedPaneTabDelegate } from './TabbedPane.js';
import type { TabbedViewLocation, View, ViewLocation, ViewLocationResolver } from './View.js';
import type { Widget } from './Widget.js';
import { VBox, WidgetFocusRestorer } from './Widget.js';
export declare class InspectorView extends VBox implements ViewLocationResolver {
    _drawerSplitWidget: SplitWidget;
    _tabDelegate: InspectorViewTabDelegate;
    _drawerTabbedLocation: TabbedViewLocation;
    _drawerTabbedPane: TabbedPane;
    _infoBarDiv: HTMLDivElement | null;
    _tabbedLocation: TabbedViewLocation;
    _tabbedPane: TabbedPane;
    _keyDownBound: (event: Event) => void;
    _currentPanelLocked?: boolean;
    _focusRestorer?: WidgetFocusRestorer | null;
    _ownerSplitWidget?: SplitWidget;
    _reloadRequiredInfobar?: Infobar;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): InspectorView;
    wasShown(): void;
    willHide(): void;
    resolveLocation(locationName: string): ViewLocation | null;
    createToolbars(): Promise<void>;
    addPanel(view: View): void;
    hasPanel(panelName: string): boolean;
    panel(panelName: string): Promise<Panel>;
    onSuspendStateChanged(allTargetsSuspended: boolean): void;
    canSelectPanel(panelName: string): boolean;
    showPanel(panelName: string): Promise<void>;
    setPanelIcon(tabId: string, icon: Icon | null): void;
    _emitDrawerChangeEvent(isDrawerOpen: boolean): void;
    _getTabbedPaneForTabId(tabId: string): TabbedPane | null;
    currentPanelDeprecated(): Widget | null;
    _showDrawer(focus: boolean): void;
    drawerVisible(): boolean;
    _closeDrawer(): void;
    setDrawerMinimized(minimized: boolean): void;
    isDrawerMinimized(): boolean;
    closeDrawerTab(id: string, userGesture?: boolean): void;
    _keyDown(event: Event): void;
    onResize(): void;
    topResizerElement(): Element;
    toolbarItemResized(): void;
    _tabSelected(event: Common.EventTarget.EventTargetEvent): void;
    setOwnerSplit(splitWidget: SplitWidget): void;
    ownerSplit(): SplitWidget | null;
    minimize(): void;
    restore(): void;
    displayReloadRequiredWarning(message: string): void;
    _attachReloadRequiredInfobar(infobar: Infobar): void;
}
export declare class ActionDelegate implements ActionDelegateInterface {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: Context, actionId: string): boolean;
}
export declare class InspectorViewTabDelegate implements TabbedPaneTabDelegate {
    closeTabs(tabbedPane: TabbedPane, ids: string[]): void;
    moveToDrawer(tabId: string): void;
    moveToMainPanel(tabId: string): void;
    onContextMenu(tabId: string, contextMenu: ContextMenu): void;
}
export declare enum Events {
    DrawerChange = "drawerchange"
}
