import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ApplicationCacheItemsView } from './ApplicationCacheItemsView.js';
import { ApplicationCacheModel } from './ApplicationCacheModel.js';
import { ApplicationCacheFrameTreeElement, ApplicationCacheManifestTreeElement, ServiceWorkerCacheTreeElement } from './ApplicationPanelCacheSection.js';
import { ApplicationPanelTreeElement, ExpandableApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import { AppManifestView } from './AppManifestView.js';
import { BackgroundServiceModel } from './BackgroundServiceModel.js';
import { BackgroundServiceView } from './BackgroundServiceView.js';
import * as ApplicationComponents from './components/components.js';
import type { Database as DatabaseModelDatabase } from './DatabaseModel.js';
import { DatabaseModel } from './DatabaseModel.js';
import { DatabaseQueryView } from './DatabaseQueryView.js';
import { DatabaseTableView } from './DatabaseTableView.js';
import type { DOMStorage } from './DOMStorageModel.js';
import { DOMStorageModel } from './DOMStorageModel.js';
import type { Database as IndexedDBModelDatabase, DatabaseId, Index, ObjectStore } from './IndexedDBModel.js';
import { IndexedDBModel } from './IndexedDBModel.js';
import { IDBDatabaseView, IDBDataView } from './IndexedDBViews.js';
import { OpenedWindowDetailsView, WorkerDetailsView } from './OpenedWindowDetailsView.js';
import type { ResourcesPanel } from './ResourcesPanel.js';
import { ServiceWorkersView } from './ServiceWorkersView.js';
import { StorageView } from './StorageView.js';
import { TrustTokensTreeElement } from './TrustTokensTreeElement.js';
export declare class ApplicationPanelSidebar extends UI.Widget.VBox implements SDK.TargetManager.Observer {
    _panel: ResourcesPanel;
    _applicationCacheViews: Map<string, ApplicationCacheItemsView>;
    _applicationCacheFrameElements: Map<string, ApplicationCacheFrameTreeElement>;
    _applicationCacheManifestElements: Map<string, ApplicationCacheManifestTreeElement>;
    _sidebarTree: UI.TreeOutline.TreeOutlineInShadow;
    _applicationTreeElement: UI.TreeOutline.TreeElement;
    serviceWorkersTreeElement: ServiceWorkersTreeElement;
    localStorageListTreeElement: ExpandableApplicationPanelTreeElement;
    sessionStorageListTreeElement: ExpandableApplicationPanelTreeElement;
    indexedDBListTreeElement: IndexedDBTreeElement;
    databasesListTreeElement: ExpandableApplicationPanelTreeElement;
    cookieListTreeElement: ExpandableApplicationPanelTreeElement;
    trustTokensTreeElement: TrustTokensTreeElement;
    cacheStorageListTreeElement: ServiceWorkerCacheTreeElement;
    applicationCacheListTreeElement: ExpandableApplicationPanelTreeElement;
    private backForwardCacheListTreeElement?;
    backgroundFetchTreeElement: BackgroundServiceTreeElement | undefined;
    backgroundSyncTreeElement: BackgroundServiceTreeElement | undefined;
    notificationsTreeElement: BackgroundServiceTreeElement | undefined;
    paymentHandlerTreeElement: BackgroundServiceTreeElement | undefined;
    periodicBackgroundSyncTreeElement: BackgroundServiceTreeElement | undefined;
    pushMessagingTreeElement: BackgroundServiceTreeElement | undefined;
    _resourcesSection: ResourcesSection;
    _databaseTableViews: Map<DatabaseModelDatabase, {
        [x: string]: DatabaseTableView;
    }>;
    _databaseQueryViews: Map<DatabaseModelDatabase, DatabaseQueryView>;
    _databaseTreeElements: Map<DatabaseModelDatabase, DatabaseTreeElement>;
    _domStorageTreeElements: Map<DOMStorage, DOMStorageTreeElement>;
    _domains: {
        [x: string]: boolean;
    };
    _target?: SDK.Target.Target;
    _databaseModel?: DatabaseModel | null;
    _applicationCacheModel?: ApplicationCacheModel | null;
    _previousHoveredElement?: FrameTreeElement;
    constructor(panel: ResourcesPanel);
    _addSidebarSection(title: string): UI.TreeOutline.TreeElement;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    focus(): void;
    _initialize(): void;
    _domStorageModelAdded(model: DOMStorageModel): void;
    _domStorageModelRemoved(model: DOMStorageModel): void;
    _resetWithFrames(): void;
    _resetWebSQL(): void;
    _resetAppCache(): void;
    _treeElementAdded(event: Common.EventTarget.EventTargetEvent): void;
    _reset(): void;
    _frameNavigated(event: Common.EventTarget.EventTargetEvent): void;
    _databaseAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addCookieDocument(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _domStorageAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addDOMStorage(domStorage: DOMStorage): void;
    _domStorageRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _removeDOMStorage(domStorage: DOMStorage): void;
    selectDatabase(database: DatabaseModelDatabase): void;
    showResource(resource: SDK.Resource.Resource, line?: number, column?: number): Promise<void>;
    showFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _showDatabase(database: DatabaseModelDatabase, tableName?: string): void;
    _showApplicationCache(frameId: string): void;
    showFileSystem(view: UI.Widget.Widget): void;
    _innerShowView(view: UI.Widget.Widget): void;
    _updateDatabaseTables(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    _populateApplicationCacheTree(_resourceTreeModel: SDK.ResourceTreeModel.ResourceTreeModel): void;
    _applicationCacheFrameManifestAdded(event: Common.EventTarget.EventTargetEvent): void;
    _applicationCacheFrameManifestRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _applicationCacheFrameManifestStatusChanged(event: Common.EventTarget.EventTargetEvent): void;
    _applicationCacheNetworkStateChanged(event: Common.EventTarget.EventTargetEvent): void;
    _onmousemove(event: MouseEvent): void;
    _onmouseleave(_event: MouseEvent): void;
}
export declare class BackgroundServiceTreeElement extends ApplicationPanelTreeElement {
    _serviceName: Protocol.BackgroundService.ServiceName;
    _selected: boolean;
    _view: BackgroundServiceView | null;
    _model: BackgroundServiceModel | null;
    constructor(storagePanel: ResourcesPanel, serviceName: Protocol.BackgroundService.ServiceName);
    _getIconType(): string;
    _initialize(model: BackgroundServiceModel | null): void;
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class DatabaseTreeElement extends ApplicationPanelTreeElement {
    _sidebar: ApplicationPanelSidebar;
    _database: DatabaseModelDatabase;
    constructor(sidebar: ApplicationPanelSidebar, database: DatabaseModelDatabase);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
    onexpand(): void;
    updateChildren(): Promise<void>;
}
export declare class DatabaseTableTreeElement extends ApplicationPanelTreeElement {
    _sidebar: ApplicationPanelSidebar;
    _database: DatabaseModelDatabase;
    _tableName: string;
    constructor(sidebar: ApplicationPanelSidebar, database: DatabaseModelDatabase, tableName: string);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class ServiceWorkersTreeElement extends ApplicationPanelTreeElement {
    _view?: ServiceWorkersView;
    constructor(storagePanel: ResourcesPanel);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class AppManifestTreeElement extends ApplicationPanelTreeElement {
    _view?: AppManifestView;
    constructor(storagePanel: ResourcesPanel);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class ClearStorageTreeElement extends ApplicationPanelTreeElement {
    _view?: StorageView;
    constructor(storagePanel: ResourcesPanel);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class IndexedDBTreeElement extends ExpandableApplicationPanelTreeElement {
    _idbDatabaseTreeElements: IDBDatabaseTreeElement[];
    constructor(storagePanel: ResourcesPanel);
    private initialize;
    removeIndexedDBForModel(model: IndexedDBModel): void;
    onattach(): void;
    _handleContextMenuEvent(event: MouseEvent): void;
    refreshIndexedDB(): void;
    _indexedDBAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addIndexedDB(model: IndexedDBModel, databaseId: DatabaseId): void;
    _indexedDBRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _removeIDBDatabaseTreeElement(idbDatabaseTreeElement: IDBDatabaseTreeElement): void;
    _indexedDBLoaded(event: Common.EventTarget.EventTargetEvent): void;
    _indexedDBLoadedForTest(): void;
    _indexedDBContentUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _idbDatabaseTreeElement(model: IndexedDBModel, databaseId: DatabaseId): IDBDatabaseTreeElement | null;
}
export declare class IDBDatabaseTreeElement extends ApplicationPanelTreeElement {
    _model: IndexedDBModel;
    _databaseId: DatabaseId;
    _idbObjectStoreTreeElements: Map<string, IDBObjectStoreTreeElement>;
    _database?: IndexedDBModelDatabase;
    _view?: IDBDatabaseView;
    constructor(storagePanel: ResourcesPanel, model: IndexedDBModel, databaseId: DatabaseId);
    get itemURL(): string;
    onattach(): void;
    _handleContextMenuEvent(event: MouseEvent): void;
    _refreshIndexedDB(): void;
    indexedDBContentUpdated(objectStoreName: string): void;
    update(database: IndexedDBModelDatabase, entriesUpdated: boolean): void;
    _updateTooltip(): void;
    onselect(selectedByUser?: boolean): boolean;
    _objectStoreRemoved(objectStoreName: string): void;
    clear(): void;
}
export declare class IDBObjectStoreTreeElement extends ApplicationPanelTreeElement {
    _model: IndexedDBModel;
    _databaseId: DatabaseId;
    _idbIndexTreeElements: Map<string, IDBIndexTreeElement>;
    _objectStore: ObjectStore;
    _view: IDBDataView | null;
    constructor(storagePanel: ResourcesPanel, model: IndexedDBModel, databaseId: DatabaseId, objectStore: ObjectStore);
    get itemURL(): string;
    onattach(): void;
    markNeedsRefresh(): void;
    _handleContextMenuEvent(event: MouseEvent): void;
    _refreshObjectStore(): void;
    _clearObjectStore(): Promise<void>;
    update(objectStore: ObjectStore, entriesUpdated: boolean): void;
    _updateTooltip(): void;
    onselect(selectedByUser?: boolean): boolean;
    _indexRemoved(indexName: string): void;
    clear(): void;
}
export declare class IDBIndexTreeElement extends ApplicationPanelTreeElement {
    _model: IndexedDBModel;
    _databaseId: DatabaseId;
    _objectStore: ObjectStore;
    _index: Index;
    _refreshObjectStore: () => void;
    _view?: IDBDataView;
    constructor(storagePanel: ResourcesPanel, model: IndexedDBModel, databaseId: DatabaseId, objectStore: ObjectStore, index: Index, refreshObjectStore: () => void);
    get itemURL(): string;
    markNeedsRefresh(): void;
    refreshIndex(): void;
    update(objectStore: ObjectStore, index: Index, entriesUpdated: boolean): void;
    _updateTooltip(): void;
    onselect(selectedByUser?: boolean): boolean;
    clear(): void;
}
export declare class DOMStorageTreeElement extends ApplicationPanelTreeElement {
    _domStorage: DOMStorage;
    constructor(storagePanel: ResourcesPanel, domStorage: DOMStorage);
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
    onattach(): void;
    _handleContextMenuEvent(event: MouseEvent): void;
}
export declare class CookieTreeElement extends ApplicationPanelTreeElement {
    _target: SDK.Target.Target;
    _cookieDomain: string;
    constructor(storagePanel: ResourcesPanel, frame: SDK.ResourceTreeModel.ResourceTreeFrame, cookieDomain: string);
    get itemURL(): string;
    cookieDomain(): string;
    onattach(): void;
    _handleContextMenuEvent(event: Event): void;
    onselect(selectedByUser?: boolean): boolean;
}
export declare class StorageCategoryView extends UI.Widget.VBox {
    _emptyWidget: UI.EmptyWidget.EmptyWidget;
    _linkElement: HTMLElement | null;
    constructor();
    setText(text: string): void;
    setLink(link: string | null): void;
}
export declare class ResourcesSection implements SDK.TargetManager.Observer {
    _panel: ResourcesPanel;
    _treeElement: UI.TreeOutline.TreeElement;
    _treeElementForFrameId: Map<string, FrameTreeElement>;
    _treeElementForTargetId: Map<string, FrameTreeElement>;
    constructor(storagePanel: ResourcesPanel, treeElement: UI.TreeOutline.TreeElement);
    targetAdded(target: SDK.Target.Target): void;
    _workerAdded(target: SDK.Target.Target): Promise<void>;
    targetRemoved(_target: SDK.Target.Target): void;
    _addFrameAndParents(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _expandFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame | null): boolean;
    revealResource(resource: SDK.Resource.Resource, line?: number, column?: number): Promise<void>;
    revealAndSelectFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _frameAdded(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _frameDetached(frameId: string): void;
    _frameNavigated(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    _resourceAdded(resource: SDK.Resource.Resource): void;
    _windowOpened(event: Common.EventTarget.EventTargetEvent): void;
    _windowDestroyed(event: Common.EventTarget.EventTargetEvent): void;
    _windowChanged(event: Common.EventTarget.EventTargetEvent): void;
    reset(): void;
}
export declare class FrameTreeElement extends ApplicationPanelTreeElement {
    _section: ResourcesSection;
    _frame: SDK.ResourceTreeModel.ResourceTreeFrame;
    _frameId: string;
    _categoryElements: Map<string, ExpandableApplicationPanelTreeElement>;
    _treeElementForResource: Map<string, FrameResourceTreeElement>;
    _treeElementForWindow: Map<string, FrameWindowTreeElement>;
    _treeElementForWorker: Map<string, WorkerTreeElement>;
    _view: ApplicationComponents.FrameDetailsView.FrameDetailsView | null;
    constructor(section: ResourcesSection, frame: SDK.ResourceTreeModel.ResourceTreeFrame);
    getIconTypeForFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): 'mediumicon-frame-blocked' | 'mediumicon-frame' | 'mediumicon-frame-embedded-blocked' | 'mediumicon-frame-embedded';
    frameNavigated(frame: SDK.ResourceTreeModel.ResourceTreeFrame): Promise<void>;
    get itemURL(): string;
    onselect(selectedByUser?: boolean): boolean;
    set hovered(hovered: boolean);
    appendResource(resource: SDK.Resource.Resource): void;
    windowOpened(targetInfo: Protocol.Target.TargetInfo): void;
    workerCreated(targetInfo: Protocol.Target.TargetInfo): void;
    windowChanged(targetInfo: Protocol.Target.TargetInfo): void;
    windowDestroyed(targetId: string): void;
    appendChild(treeElement: UI.TreeOutline.TreeElement, comparator?: ((arg0: UI.TreeOutline.TreeElement, arg1: UI.TreeOutline.TreeElement) => number) | undefined): void;
    /**
     * Order elements by type (first frames, then resources, last Document resources)
     * and then each of these groups in the alphabetical order.
     */
    static _presentationOrderCompare(treeElement1: UI.TreeOutline.TreeElement, treeElement2: UI.TreeOutline.TreeElement): number;
}
export declare class FrameResourceTreeElement extends ApplicationPanelTreeElement {
    _panel: ResourcesPanel;
    _resource: SDK.Resource.Resource;
    _previewPromise: Promise<UI.Widget.Widget> | null;
    constructor(storagePanel: ResourcesPanel, resource: SDK.Resource.Resource);
    static forResource(resource: SDK.Resource.Resource): FrameResourceTreeElement | undefined;
    get itemURL(): string;
    _preparePreview(): Promise<UI.Widget.Widget>;
    onselect(selectedByUser?: boolean): boolean;
    ondblclick(_event: Event): boolean;
    onattach(): void;
    _ondragstart(event: DragEvent): boolean;
    _handleContextMenuEvent(event: MouseEvent): void;
    revealResource(line?: number, column?: number): Promise<void>;
}
declare class FrameWindowTreeElement extends ApplicationPanelTreeElement {
    _targetInfo: Protocol.Target.TargetInfo;
    _isWindowClosed: boolean;
    _view: OpenedWindowDetailsView | null;
    constructor(storagePanel: ResourcesPanel, targetInfo: Protocol.Target.TargetInfo);
    updateIcon(canAccessOpener: boolean): void;
    update(targetInfo: Protocol.Target.TargetInfo): void;
    windowClosed(): void;
    onselect(selectedByUser?: boolean): boolean;
    get itemURL(): string;
}
declare class WorkerTreeElement extends ApplicationPanelTreeElement {
    _targetInfo: Protocol.Target.TargetInfo;
    _view: WorkerDetailsView | null;
    constructor(storagePanel: ResourcesPanel, targetInfo: Protocol.Target.TargetInfo);
    onselect(selectedByUser?: boolean): boolean;
    get itemURL(): string;
}
export {};
