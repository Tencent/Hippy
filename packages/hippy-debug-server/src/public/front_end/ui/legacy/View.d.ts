import type { TabbedPane } from './TabbedPane.js';
import type { ToolbarItem, ToolbarMenuButton } from './Toolbar.js';
import type { Widget } from './Widget.js';
import { VBox } from './Widget.js';
export interface View {
    viewId(): string;
    title(): string;
    isCloseable(): boolean;
    isTransient(): boolean;
    toolbarItems(): Promise<ToolbarItem[]>;
    widget(): Promise<Widget>;
    disposeView(): void | Promise<void>;
}
export declare class SimpleView extends VBox implements View {
    _title: string;
    constructor(title: string, isWebComponent?: boolean);
    viewId(): string;
    title(): string;
    isCloseable(): boolean;
    isTransient(): boolean;
    toolbarItems(): Promise<ToolbarItem[]>;
    widget(): Promise<Widget>;
    revealView(): Promise<void>;
    disposeView(): void;
}
export interface ViewLocation {
    appendApplicableItems(locationName: string): void;
    appendView(view: View, insertBefore?: View | null): void;
    showView(view: View, insertBefore?: View | null, userGesture?: boolean): Promise<void>;
    removeView(view: View): void;
    widget(): Widget;
}
export interface TabbedViewLocation extends ViewLocation {
    tabbedPane(): TabbedPane;
    enableMoreTabsButton(): ToolbarMenuButton;
}
export interface ViewLocationResolver {
    resolveLocation(location: string): ViewLocation | null;
}
