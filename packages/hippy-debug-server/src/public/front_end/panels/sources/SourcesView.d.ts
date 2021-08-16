import * as Common from '../../core/common/common.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import { EditingLocationHistoryManager } from './EditingLocationHistoryManager.js';
import type { TabbedEditorContainerDelegate } from './TabbedEditorContainer.js';
import { TabbedEditorContainer } from './TabbedEditorContainer.js';
import { UISourceCodeFrame } from './UISourceCodeFrame.js';
export declare class SourcesView extends UI.Widget.VBox implements TabbedEditorContainerDelegate, UI.SearchableView.Searchable, UI.SearchableView.Replaceable {
    _placeholderOptionArray: {
        element: HTMLElement;
        handler: Function;
    }[];
    _selectedIndex: number;
    _searchableView: UI.SearchableView.SearchableView;
    _sourceViewByUISourceCode: Map<Workspace.UISourceCode.UISourceCode, UI.Widget.Widget>;
    _editorContainer: TabbedEditorContainer;
    _historyManager: EditingLocationHistoryManager;
    _toolbarContainerElement: HTMLElement;
    _scriptViewToolbar: UI.Toolbar.Toolbar;
    _bottomToolbar: UI.Toolbar.Toolbar;
    _toolbarChangedListener: Common.EventTarget.EventDescriptor | null;
    _shortcuts: Map<number, () => boolean>;
    _focusedPlaceholderElement?: HTMLElement;
    _searchView?: UISourceCodeFrame;
    _searchConfig?: UI.SearchableView.SearchConfig;
    constructor();
    _placeholderElement(): Element;
    _placeholderOnKeyDown(event: Event): void;
    static defaultUISourceCodeScores(): Map<Workspace.UISourceCode.UISourceCode, number>;
    leftToolbar(): UI.Toolbar.Toolbar;
    rightToolbar(): UI.Toolbar.Toolbar;
    bottomToolbar(): UI.Toolbar.Toolbar;
    _registerShortcuts(keys: UI.KeyboardShortcut.Descriptor[], handler: (arg0?: Event | undefined) => boolean): void;
    _handleKeyDown(event: Event): void;
    wasShown(): void;
    willHide(): void;
    toolbarContainerElement(): Element;
    searchableView(): UI.SearchableView.SearchableView;
    visibleView(): UI.Widget.Widget | null;
    currentSourceFrame(): UISourceCodeFrame | null;
    currentUISourceCode(): Workspace.UISourceCode.UISourceCode | null;
    _onCloseEditorTab(): boolean;
    _onJumpToPreviousLocation(): void;
    _onJumpToNextLocation(): void;
    _uiSourceCodeAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _uiSourceCodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _removeUISourceCodes(uiSourceCodes: Workspace.UISourceCode.UISourceCode[]): void;
    _projectRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _updateScriptViewToolbarItems(): void;
    showSourceLocation(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber?: number, columnNumber?: number, omitFocus?: boolean, omitHighlight?: boolean): void;
    _createSourceView(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Widget.Widget;
    _getOrCreateSourceView(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Widget.Widget;
    recycleUISourceCodeFrame(sourceFrame: UISourceCodeFrame, uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    viewForFile(uiSourceCode: Workspace.UISourceCode.UISourceCode): UI.Widget.Widget;
    _removeSourceFrame(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _editorClosed(event: Common.EventTarget.EventTargetEvent): void;
    _editorSelected(event: Common.EventTarget.EventTargetEvent): void;
    _removeToolbarChangedListener(): void;
    _updateToolbarChangedListener(): void;
    searchCanceled(): void;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
    replaceSelectionWith(searchConfig: UI.SearchableView.SearchConfig, replacement: string): void;
    replaceAllWith(searchConfig: UI.SearchableView.SearchConfig, replacement: string): void;
    _showOutlineQuickOpen(): void;
    _showGoToLineQuickOpen(): void;
    _save(): void;
    _saveAll(): void;
    _saveSourceFrame(sourceFrame: UI.Widget.Widget | null): void;
    toggleBreakpointsActiveState(active: boolean): void;
}
export declare enum Events {
    EditorClosed = "EditorClosed",
    EditorSelected = "EditorSelected"
}
/**
 * @interface
 */
export interface EditorAction {
    button(sourcesView: SourcesView): UI.Toolbar.ToolbarButton;
}
export declare function registerEditorAction(editorAction: () => EditorAction): void;
export declare function getRegisteredEditorActions(): EditorAction[];
export declare class SwitchFileActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): SwitchFileActionDelegate;
    static _nextFile(currentUISourceCode: Workspace.UISourceCode.UISourceCode): Workspace.UISourceCode.UISourceCode | null;
    handleAction(_context: UI.Context.Context, _actionId: string): boolean;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
