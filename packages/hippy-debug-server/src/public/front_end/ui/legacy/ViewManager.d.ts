import * as Common from '../../core/common/common.js';
import type { ContextMenu } from './ContextMenu.js';
import { Icon } from './Icon.js';
import { TabbedPane } from './TabbedPane.js';
import type { ToolbarItem } from './Toolbar.js';
import { ToolbarMenuButton } from './Toolbar.js';
import type { TabbedViewLocation, View, ViewLocation } from './View.js';
import { getRegisteredLocationResolvers, getRegisteredViewExtensions, maybeRemoveViewExtension, registerLocationResolver, registerViewExtension, ViewLocationCategoryValues, ViewLocationValues, ViewPersistence, ViewRegistration } from './ViewRegistration.js';
import type { Widget } from './Widget.js';
import { VBox } from './Widget.js';
export declare class PreRegisteredView implements View {
    _viewRegistration: ViewRegistration;
    _widgetRequested: boolean;
    constructor(viewRegistration: ViewRegistration);
    title(): Common.UIString.LocalizedString;
    commandPrompt(): Common.UIString.LocalizedString;
    isCloseable(): boolean;
    isTransient(): boolean;
    viewId(): string;
    location(): ViewLocationValues | undefined;
    order(): number | undefined;
    settings(): string[] | undefined;
    tags(): string | undefined;
    persistence(): ViewPersistence | undefined;
    toolbarItems(): Promise<any>;
    widget(): Promise<Widget>;
    disposeView(): Promise<void>;
    experiment(): string | undefined;
    condition(): string | undefined;
}
export declare class ViewManager {
    _views: Map<string, View>;
    _locationNameByViewId: Map<string, string>;
    _locationOverrideSetting: Common.Settings.Setting<{
        [key: string]: string;
    }>;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ViewManager;
    static removeInstance(): void;
    static _createToolbar(toolbarItems: ToolbarItem[]): Element | null;
    locationNameForViewId(viewId: string): string;
    /**
     * Moves a view to a new location
     */
    moveView(viewId: string, locationName: string, options?: {
        shouldSelectTab: (boolean);
        overrideSaving: (boolean);
    }): void;
    revealView(view: View): Promise<void>;
    /**
     * Show view in location
     */
    showViewInLocation(viewId: string, locationName: string, shouldSelectTab?: boolean | undefined): void;
    view(viewId: string): View;
    materializedWidget(viewId: string): Widget | null;
    showView(viewId: string, userGesture?: boolean, omitFocus?: boolean): Promise<void>;
    resolveLocation(location?: string): Promise<_Location | null>;
    createTabbedLocation(revealCallback?: (() => void), location?: string, restoreSelection?: boolean, allowReorder?: boolean, defaultTab?: string | null): TabbedViewLocation;
    createStackLocation(revealCallback?: (() => void), location?: string): ViewLocation;
    hasViewsForLocation(location: string): boolean;
    _viewsForLocation(location: string): View[];
}
export declare class ContainerWidget extends VBox {
    _view: View;
    _materializePromise?: Promise<void[]>;
    constructor(view: View);
    _materialize(): Promise<any>;
    wasShown(): void;
    _wasShownForTest(): void;
}
export declare class _ExpandableContainerWidget extends VBox {
    _titleElement: HTMLDivElement;
    _titleExpandIcon: Icon;
    _view: View;
    _widget?: Widget;
    _materializePromise?: Promise<void[]>;
    constructor(view: View);
    wasShown(): void;
    _materialize(): Promise<any>;
    _expand(): Promise<any>;
    _collapse(): void;
    _toggleExpanded(event: Event): void;
    _onTitleKeyDown(event: Event): void;
}
declare class _Location {
    _manager: ViewManager;
    _revealCallback: (() => void) | undefined;
    _widget: Widget;
    constructor(manager: ViewManager, widget: Widget, revealCallback?: (() => void));
    widget(): Widget;
    _reveal(): void;
    showView(_view: View, _insertBefore?: View | null, _userGesture?: boolean, _omitFocus?: boolean, _shouldSelectTab?: boolean): Promise<void>;
    removeView(_view: View): void;
}
export declare class _TabbedLocation extends _Location implements TabbedViewLocation {
    _tabbedPane: TabbedPane;
    _allowReorder: boolean | undefined;
    _closeableTabSetting: Common.Settings.Setting<any>;
    _tabOrderSetting: Common.Settings.Setting<any>;
    _lastSelectedTabSetting: Common.Settings.Setting<any> | undefined;
    _defaultTab: string | null | undefined;
    _views: Map<string, View>;
    constructor(manager: ViewManager, revealCallback?: (() => void), location?: string, restoreSelection?: boolean, allowReorder?: boolean, defaultTab?: string | null);
    _setOrUpdateCloseableTabsSetting(): void;
    widget(): Widget;
    tabbedPane(): TabbedPane;
    enableMoreTabsButton(): ToolbarMenuButton;
    appendApplicableItems(locationName: string): void;
    _appendTabsToMenu(contextMenu: ContextMenu): void;
    _appendTab(view: View, index?: number): void;
    appendView(view: View, insertBefore?: View | null): void;
    showView(view: View, insertBefore?: View | null, userGesture?: boolean, omitFocus?: boolean, shouldSelectTab?: boolean | undefined): Promise<void>;
    removeView(view: View): void;
    _tabSelected(event: Common.EventTarget.EventTargetEvent): void;
    _tabClosed(event: Common.EventTarget.EventTargetEvent): void;
    _persistTabOrder(): void;
    static orderStep: number;
}
export { ViewRegistration, ViewPersistence, getRegisteredViewExtensions, maybeRemoveViewExtension, registerViewExtension, ViewLocationValues, getRegisteredLocationResolvers, registerLocationResolver, ViewLocationCategoryValues, };
