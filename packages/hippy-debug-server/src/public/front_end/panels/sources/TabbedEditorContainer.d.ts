import * as Common from '../../core/common/common.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import { UISourceCodeFrame } from './UISourceCodeFrame.js';
/**
 * @interface
 */
export interface TabbedEditorContainerDelegate {
    viewForFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Widget.Widget;
    recycleUISourceCodeFrame(sourceFrame: UISourceCodeFrame, uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
}
export declare class TabbedEditorContainer extends Common.ObjectWrapper.ObjectWrapper {
    _delegate: TabbedEditorContainerDelegate;
    _tabbedPane: UI.TabbedPane.TabbedPane;
    _tabIds: Map<any, any>;
    _files: Map<string, Workspace.UISourceCode.UISourceCode>;
    _previouslyViewedFilesSetting: Common.Settings.Setting<any[]>;
    _history: History;
    _uriToUISourceCode: Map<any, any>;
    _currentFile: Workspace.UISourceCode.UISourceCode | null;
    _currentView: UI.Widget.Widget | null;
    _scrollTimer?: number;
    constructor(delegate: TabbedEditorContainerDelegate, setting: Common.Settings.Setting<any[]>, placeholderElement: Element, focusedPlaceholderElement?: Element);
    _onBindingCreated(event: Common.EventTarget.EventTargetEvent): void;
    _onBindingRemoved(event: Common.EventTarget.EventTargetEvent): void;
    get view(): UI.Widget.Widget;
    get visibleView(): UI.Widget.Widget | null;
    fileViews(): UI.Widget.Widget[];
    leftToolbar(): UI.Toolbar.Toolbar;
    rightToolbar(): UI.Toolbar.Toolbar;
    show(parentElement: Element): void;
    showFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    closeFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    closeAllFiles(): void;
    historyUISourceCodes(): Workspace.UISourceCode.UISourceCode[];
    _addViewListeners(): void;
    _removeViewListeners(): void;
    _scrollChanged(event: Common.EventTarget.EventTargetEvent): void;
    _selectionChanged(event: Common.EventTarget.EventTargetEvent): void;
    _innerShowFile(uiSourceCode: Workspace.UISourceCode.UISourceCode, userGesture?: boolean): void;
    _titleForFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): string;
    _maybeCloseTab(id: string, nextTabId: string | null): boolean;
    _closeTabs(ids: string[], forceCloseDirtyTabs?: boolean): void;
    _onContextMenu(tabId: string, contextMenu: UI.ContextMenu.ContextMenu): void;
    _canonicalUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): Workspace.UISourceCode.UISourceCode;
    addUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    removeUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    removeUISourceCodes(uiSourceCodes: Workspace.UISourceCode.UISourceCode[]): void;
    _editorClosedByUserAction(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _editorSelectedByUserAction(): void;
    _updateHistory(): void;
    _tooltipForFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): string;
    _appendFileTab(uiSourceCode: Workspace.UISourceCode.UISourceCode, userGesture?: boolean, index?: number, replaceView?: UI.Widget.Widget): string;
    _addLoadErrorIcon(tabId: string): void;
    _restoreEditorProperties(editorView: UI.Widget.Widget, selection?: TextUtils.TextRange.TextRange, firstLineNumber?: number): void;
    _tabClosed(event: Common.EventTarget.EventTargetEvent): void;
    _tabSelected(event: Common.EventTarget.EventTargetEvent): void;
    _addUISourceCodeListeners(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _removeUISourceCodeListeners(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _updateFileTitle(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _uiSourceCodeTitleChanged(event: Common.EventTarget.EventTargetEvent): void;
    _uiSourceCodeWorkingCopyChanged(event: Common.EventTarget.EventTargetEvent): void;
    _uiSourceCodeWorkingCopyCommitted(event: Common.EventTarget.EventTargetEvent): void;
    _generateTabId(): string;
    /** uiSourceCode
       */
    currentFile(): Workspace.UISourceCode.UISourceCode | null;
}
export declare enum Events {
    EditorSelected = "EditorSelected",
    EditorClosed = "EditorClosed"
}
export declare let tabId: number;
export declare const maximalPreviouslyViewedFilesCount = 30;
export declare class HistoryItem {
    url: string;
    _isSerializable: boolean;
    selectionRange: TextUtils.TextRange.TextRange | undefined;
    scrollLineNumber: number | undefined;
    constructor(url: string, selectionRange?: TextUtils.TextRange.TextRange, scrollLineNumber?: number);
    static fromObject(serializedHistoryItem: any): HistoryItem;
    serializeToObject(): Object | null;
    static readonly serializableUrlLengthLimit = 4096;
}
export declare class History {
    _items: HistoryItem[];
    _itemsIndex: Map<string, number>;
    constructor(items: HistoryItem[]);
    static fromObject(serializedHistory: any[]): History;
    index(url: string): number;
    _rebuildItemIndex(): void;
    selectionRange(url: string): TextUtils.TextRange.TextRange | undefined;
    updateSelectionRange(url: string, selectionRange?: TextUtils.TextRange.TextRange): void;
    scrollLineNumber(url: string): number | undefined;
    updateScrollLineNumber(url: string, scrollLineNumber: number): void;
    update(urls: string[]): void;
    remove(url: string): void;
    save(setting: Common.Settings.Setting<any[]>): void;
    _serializeToObject(): Object[];
    _urls(): string[];
}
export declare class EditorContainerTabDelegate implements UI.TabbedPane.TabbedPaneTabDelegate {
    _editorContainer: TabbedEditorContainer;
    constructor(editorContainer: TabbedEditorContainer);
    closeTabs(_tabbedPane: UI.TabbedPane.TabbedPane, ids: string[]): void;
    onContextMenu(tabId: string, contextMenu: UI.ContextMenu.ContextMenu): void;
}
