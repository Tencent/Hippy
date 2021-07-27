import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationPanelSidebar, StorageCategoryView } from './ApplicationPanelSidebar.js';
import { CookieItemsView } from './CookieItemsView.js';
import { DOMStorageItemsView } from './DOMStorageItemsView.js';
import type { DOMStorage } from './DOMStorageModel.js';
export declare class ResourcesPanel extends UI.Panel.PanelWithSidebar {
    _resourcesLastSelectedItemSetting: Common.Settings.Setting<string[]>;
    visibleView: UI.Widget.Widget | null;
    _pendingViewPromise: Promise<UI.Widget.Widget> | null;
    _categoryView: StorageCategoryView | null;
    storageViews: HTMLElement;
    _storageViewToolbar: UI.Toolbar.Toolbar;
    _domStorageView: DOMStorageItemsView | null;
    _cookieView: CookieItemsView | null;
    _emptyWidget: UI.EmptyWidget.EmptyWidget | null;
    _sidebar: ApplicationPanelSidebar;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ResourcesPanel;
    static _instance(): ResourcesPanel;
    static _shouldCloseOnReset(view: UI.Widget.Widget): boolean;
    static showAndGetSidebar(): Promise<ApplicationPanelSidebar>;
    focus(): void;
    lastSelectedItemPath(): string[];
    setLastSelectedItemPath(path: string[]): void;
    resetView(): void;
    showView(view: UI.Widget.Widget | null): void;
    scheduleShowView(viewPromise: Promise<UI.Widget.Widget>): Promise<UI.Widget.Widget | null>;
    showCategoryView(categoryName: string, categoryLink: string | null): void;
    showDOMStorage(domStorage: DOMStorage): void;
    showCookies(cookieFrameTarget: SDK.Target.Target, cookieDomain: string): void;
    clearCookies(target: SDK.Target.Target, cookieDomain: string): void;
}
export declare class ResourceRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ResourceRevealer;
    reveal(resource: Object): Promise<void>;
}
export declare class CookieReferenceRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): CookieReferenceRevealer;
    reveal(cookie: Object): Promise<void>;
    _revealByDomain(sidebar: ApplicationPanelSidebar, domain: string): Promise<boolean>;
}
export declare class FrameDetailsRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): FrameDetailsRevealer;
    reveal(frame: Object): Promise<void>;
}
