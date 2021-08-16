import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare const Types: {
    Domain: string;
    File: string;
    FileSystem: string;
    FileSystemFolder: string;
    Frame: string;
    NetworkFolder: string;
    Root: string;
    SourceMapFolder: string;
    Worker: string;
};
export declare class NavigatorView extends UI.Widget.VBox implements SDK.TargetManager.Observer {
    _placeholder: UI.Widget.Widget | null;
    _scriptsTree: UI.TreeOutline.TreeOutlineInShadow;
    _uiSourceCodeNodes: Platform.MapUtilities.Multimap<Workspace.UISourceCode.UISourceCode, NavigatorUISourceCodeTreeNode>;
    _subfolderNodes: Map<string, NavigatorFolderTreeNode>;
    _rootNode: NavigatorRootTreeNode;
    _frameNodes: Map<SDK.ResourceTreeModel.ResourceTreeFrame, NavigatorGroupTreeNode>;
    _navigatorGroupByFolderSetting: Common.Settings.Setting<any>;
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _lastSelectedUISourceCode?: Workspace.UISourceCode.UISourceCode;
    _groupByFrame?: boolean;
    _groupByDomain?: any;
    _groupByFolder?: any;
    constructor();
    static _treeElementOrder(treeElement: UI.TreeOutline.TreeElement): number;
    static appendSearchItem(contextMenu: UI.ContextMenu.ContextMenu, path?: string): void;
    static _treeElementsCompare(treeElement1: UI.TreeOutline.TreeElement, treeElement2: UI.TreeOutline.TreeElement): number;
    setPlaceholder(placeholder: UI.Widget.Widget): void;
    _onBindingChanged(event: Common.EventTarget.EventTargetEvent): void;
    focus(): void;
    /**
     * Central place to add elements to the tree to
     * enable focus if the tree has elements
     */
    appendChild(parent: UI.TreeOutline.TreeElement, child: UI.TreeOutline.TreeElement): void;
    /**
     * Central place to remove elements from the tree to
     * disable focus if the tree is empty
     */
    removeChild(parent: UI.TreeOutline.TreeElement, child: UI.TreeOutline.TreeElement): void;
    _resetWorkspace(workspace: Workspace.Workspace.WorkspaceImpl): void;
    _projectAddedCallback(event: Common.EventTarget.EventTargetEvent): void;
    _projectRemovedCallback(event: Common.EventTarget.EventTargetEvent): void;
    workspace(): Workspace.Workspace.WorkspaceImpl;
    acceptProject(project: Workspace.Workspace.Project): boolean;
    _frameAttributionAdded(event: Common.EventTarget.EventTargetEvent): void;
    _frameAttributionRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _acceptsUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    _addUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _addUISourceCodeNode(uiSourceCode: Workspace.UISourceCode.UISourceCode, frame: SDK.ResourceTreeModel.ResourceTreeFrame | null): void;
    uiSourceCodeAdded(_uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _uiSourceCodeAdded(event: Common.EventTarget.EventTargetEvent): void;
    _uiSourceCodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    tryAddProject(project: Workspace.Workspace.Project): void;
    _projectAdded(project: Workspace.Workspace.Project): void;
    _selectDefaultTreeNode(): void;
    _computeUniqueFileSystemProjectNames(): void;
    _removeProject(project: Workspace.Workspace.Project): void;
    _folderNodeId(project: Workspace.Workspace.Project, target: SDK.Target.Target | null, frame: SDK.ResourceTreeModel.ResourceTreeFrame | null, projectOrigin: string, path: string): string;
    _folderNode(uiSourceCode: Workspace.UISourceCode.UISourceCode, project: Workspace.Workspace.Project, target: SDK.Target.Target | null, frame: SDK.ResourceTreeModel.ResourceTreeFrame | null, projectOrigin: string, path: string[], fromSourceMap: boolean): NavigatorTreeNode;
    _domainNode(uiSourceCode: Workspace.UISourceCode.UISourceCode, project: Workspace.Workspace.Project, target: SDK.Target.Target, frame: SDK.ResourceTreeModel.ResourceTreeFrame | null, projectOrigin: string): NavigatorTreeNode;
    _frameNode(project: Workspace.Workspace.Project, target: SDK.Target.Target, frame: SDK.ResourceTreeModel.ResourceTreeFrame | null): NavigatorTreeNode;
    _targetNode(project: Workspace.Workspace.Project, target: SDK.Target.Target): NavigatorTreeNode;
    _computeProjectDisplayName(target: SDK.Target.Target, projectOrigin: string): string;
    revealUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode, select?: boolean): NavigatorUISourceCodeTreeNode | null;
    _sourceSelected(uiSourceCode: Workspace.UISourceCode.UISourceCode, focusSource: boolean): void;
    _removeUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _removeUISourceCodeNode(node: NavigatorUISourceCodeTreeNode): void;
    reset(): void;
    handleContextMenu(_event: Event): void;
    _renameShortcut(): Promise<boolean>;
    _handleContextMenuCreate(project: Workspace.Workspace.Project, path: string, uiSourceCode?: Workspace.UISourceCode.UISourceCode): void;
    _handleContextMenuRename(node: NavigatorUISourceCodeTreeNode): void;
    _handleContextMenuExclude(project: Workspace.Workspace.Project, path: string): void;
    _handleContextMenuDelete(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    handleFileContextMenu(event: Event, node: NavigatorUISourceCodeTreeNode): void;
    _handleDeleteOverrides(node: NavigatorTreeNode): void;
    _handleDeleteOverridesHelper(node: NavigatorTreeNode): void;
    handleFolderContextMenu(event: Event, node: NavigatorTreeNode): void;
    rename(node: NavigatorUISourceCodeTreeNode, creatingNewUISourceCode: boolean): void;
    create(project: Workspace.Workspace.Project, path: string, uiSourceCodeToCopy?: Workspace.UISourceCode.UISourceCode): Promise<void>;
    _groupingChanged(): void;
    _initGrouping(): void;
    _resetForTest(): void;
    _discardFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): void;
    targetAdded(_target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    _targetNameChanged(event: Common.EventTarget.EventTargetEvent): void;
}
export declare class NavigatorFolderTreeElement extends UI.TreeOutline.TreeElement {
    _nodeType: string;
    _navigatorView: NavigatorView;
    _hoverCallback: ((arg0: boolean) => any) | undefined;
    _node: NavigatorTreeNode;
    _hovered?: boolean;
    constructor(navigatorView: NavigatorView, type: string, title: string, hoverCallback?: ((arg0: boolean) => any));
    onpopulate(): Promise<void>;
    onattach(): void;
    setNode(node: NavigatorTreeNode): void;
    _handleContextMenuEvent(event: Event): void;
    _mouseMove(_event: Event): void;
    _mouseLeave(_event: Event): void;
}
export declare class NavigatorSourceTreeElement extends UI.TreeOutline.TreeElement {
    _nodeType: string;
    _node: NavigatorUISourceCodeTreeNode;
    _navigatorView: NavigatorView;
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    constructor(navigatorView: NavigatorView, uiSourceCode: Workspace.UISourceCode.UISourceCode, title: string, node: NavigatorUISourceCodeTreeNode);
    updateIcon(): void;
    get uiSourceCode(): Workspace.UISourceCode.UISourceCode;
    onattach(): void;
    _shouldRenameOnMouseDown(): boolean;
    selectOnMouseDown(event: MouseEvent): void;
    _ondragstart(event: DragEvent): void;
    onspace(): boolean;
    _onclick(_event: Event): void;
    ondblclick(event: Event): boolean;
    onenter(): boolean;
    ondelete(): boolean;
    _handleContextMenuEvent(event: Event): void;
}
export declare class NavigatorTreeNode {
    id: string;
    _navigatorView: NavigatorView;
    _type: string;
    _children: Map<string, NavigatorTreeNode>;
    _populated: boolean;
    _isMerged: boolean;
    parent: NavigatorTreeNode | null;
    _title: string;
    constructor(navigatorView: NavigatorView, id: string, type: string);
    treeNode(): UI.TreeOutline.TreeElement;
    dispose(): void;
    updateTitle(): void;
    isRoot(): boolean;
    hasChildren(): boolean;
    onattach(): void;
    setTitle(_title: string): void;
    populate(): void;
    wasPopulated(): void;
    didAddChild(node: NavigatorTreeNode): void;
    willRemoveChild(node: NavigatorTreeNode): void;
    isPopulated(): boolean;
    isEmpty(): boolean;
    children(): NavigatorTreeNode[];
    child(id: string): NavigatorTreeNode | null;
    appendChild(node: NavigatorTreeNode): void;
    removeChild(node: NavigatorTreeNode): void;
    reset(): void;
}
export declare class NavigatorRootTreeNode extends NavigatorTreeNode {
    constructor(navigatorView: NavigatorView);
    isRoot(): boolean;
    treeNode(): UI.TreeOutline.TreeElement;
}
export declare class NavigatorUISourceCodeTreeNode extends NavigatorTreeNode {
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _treeElement: NavigatorSourceTreeElement | null;
    _eventListeners: Common.EventTarget.EventDescriptor[];
    _frame: SDK.ResourceTreeModel.ResourceTreeFrame | null;
    constructor(navigatorView: NavigatorView, uiSourceCode: Workspace.UISourceCode.UISourceCode, frame: SDK.ResourceTreeModel.ResourceTreeFrame | null);
    frame(): SDK.ResourceTreeModel.ResourceTreeFrame | null;
    uiSourceCode(): Workspace.UISourceCode.UISourceCode;
    treeNode(): UI.TreeOutline.TreeElement;
    updateTitle(ignoreIsDirty?: boolean): void;
    hasChildren(): boolean;
    dispose(): void;
    reveal(select?: boolean): void;
    rename(callback?: ((arg0: boolean) => any)): void;
}
export declare class NavigatorFolderTreeNode extends NavigatorTreeNode {
    _project: Workspace.Workspace.Project | null;
    _folderPath: string;
    _title: string;
    _treeElement: NavigatorFolderTreeElement | null;
    constructor(navigatorView: NavigatorView, project: Workspace.Workspace.Project | null, id: string, type: string, folderPath: string, title: string);
    treeNode(): UI.TreeOutline.TreeElement;
    updateTitle(): void;
    _createTreeElement(title: string, node: NavigatorTreeNode): NavigatorFolderTreeElement;
    wasPopulated(): void;
    _addChildrenRecursive(): void;
    _shouldMerge(node: NavigatorTreeNode): boolean;
    didAddChild(node: NavigatorTreeNode): void;
    willRemoveChild(node: NavigatorTreeNode): void;
}
export declare class NavigatorGroupTreeNode extends NavigatorTreeNode {
    _project: Workspace.Workspace.Project;
    _title: string;
    _hoverCallback?: ((arg0: boolean) => void);
    _treeElement?: NavigatorFolderTreeElement;
    constructor(navigatorView: NavigatorView, project: Workspace.Workspace.Project, id: string, type: string, title: string);
    setHoverCallback(hoverCallback: (arg0: boolean) => void): void;
    treeNode(): UI.TreeOutline.TreeElement;
    onattach(): void;
    updateTitle(): void;
    setTitle(title: string): void;
}
