import * as SDK from '../../core/sdk/sdk.js';
import type { ApplicationPanelSidebar } from './ApplicationPanelSidebar.js';
import { ApplicationPanelTreeElement, ExpandableApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import type { ResourcesPanel } from './ResourcesPanel.js';
export declare class ApplicationCacheManifestTreeElement extends ApplicationPanelTreeElement {
    private readonly manifestURL;
    constructor(resourcesPanel: ResourcesPanel, manifestURL: string);
    get itemURL(): string;
    onselect(selectedByUser: boolean | undefined): boolean;
}
export declare class ServiceWorkerCacheTreeElement extends ExpandableApplicationPanelTreeElement {
    private swCacheModel;
    private swCacheTreeElements;
    constructor(resourcesPanel: ResourcesPanel);
    initialize(model: SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel | null): void;
    onattach(): void;
    private handleContextMenuEvent;
    private refreshCaches;
    private cacheAdded;
    private addCache;
    private cacheRemoved;
    private cacheTreeElement;
}
export declare class SWCacheTreeElement extends ApplicationPanelTreeElement {
    private readonly model;
    private cache;
    private view;
    constructor(resourcesPanel: ResourcesPanel, model: SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel, cache: SDK.ServiceWorkerCacheModel.Cache);
    get itemURL(): string;
    onattach(): void;
    private handleContextMenuEvent;
    private clearCache;
    update(cache: SDK.ServiceWorkerCacheModel.Cache): void;
    onselect(selectedByUser: boolean | undefined): boolean;
    hasModelAndCache(model: SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel, cache: SDK.ServiceWorkerCacheModel.Cache): boolean;
}
export declare class ApplicationCacheFrameTreeElement extends ApplicationPanelTreeElement {
    private readonly sidebar;
    readonly frameId: string;
    readonly manifestURL: string;
    constructor(sidebar: ApplicationPanelSidebar, frame: SDK.ResourceTreeModel.ResourceTreeFrame, manifestURL: string);
    get itemURL(): string;
    private refreshTitles;
    frameNavigated(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    onselect(selectedByUser: boolean | undefined): boolean;
}
export declare class BackForwardCacheTreeElement extends ApplicationPanelTreeElement {
    private view?;
    constructor(resourcesPanel: ResourcesPanel);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
}
