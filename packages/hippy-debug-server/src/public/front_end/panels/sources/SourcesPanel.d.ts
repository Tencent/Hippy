import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as Recorder from '../../models/recorder/recorder.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as UI from '../../ui/legacy/legacy.js';
import { CallStackSidebarPane } from './CallStackSidebarPane.js';
import { DebuggerPausedMessage } from './DebuggerPausedMessage.js';
import type { NavigatorView } from './NavigatorView.js';
import { SourcesView } from './SourcesView.js';
export declare class SourcesPanel extends UI.Panel.Panel implements UI.ContextMenu.Provider, SDK.TargetManager.Observer, UI.View.ViewLocationResolver {
    _workspace: Workspace.Workspace.WorkspaceImpl;
    _togglePauseAction: UI.ActionRegistration.Action;
    _stepOverAction: UI.ActionRegistration.Action;
    _stepIntoAction: UI.ActionRegistration.Action;
    _stepOutAction: UI.ActionRegistration.Action;
    _stepAction: UI.ActionRegistration.Action;
    _toggleBreakpointsActiveAction: UI.ActionRegistration.Action;
    _debugToolbar: UI.Toolbar.Toolbar;
    _debugToolbarDrawer: HTMLDivElement;
    _debuggerPausedMessage: DebuggerPausedMessage;
    _splitWidget: UI.SplitWidget.SplitWidget;
    editorView: UI.SplitWidget.SplitWidget;
    _navigatorTabbedLocation: UI.View.TabbedViewLocation;
    _sourcesView: SourcesView;
    _toggleNavigatorSidebarButton: UI.Toolbar.ToolbarButton;
    _toggleDebuggerSidebarButton: UI.Toolbar.ToolbarButton;
    _threadsSidebarPane: UI.View.View | null;
    _watchSidebarPane: UI.View.View;
    _callstackPane: CallStackSidebarPane;
    _liveLocationPool: Bindings.LiveLocation.LiveLocationPool;
    _lastModificationTime: number;
    _paused?: boolean;
    _switchToPausedTargetTimeout?: number;
    _ignoreExecutionLineEvents?: boolean;
    _executionLineLocation?: Bindings.DebuggerWorkspaceBinding.Location | null;
    _pauseOnExceptionButton?: UI.Toolbar.ToolbarToggle;
    _sidebarPaneStack?: UI.View.ViewLocation;
    _tabbedLocationHeader?: Element | null;
    _extensionSidebarPanesContainer?: UI.View.ViewLocation;
    sidebarPaneView?: UI.Widget.VBox | UI.SplitWidget.SplitWidget;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): SourcesPanel;
    static updateResizerAndSidebarButtons(panel: SourcesPanel): void;
    targetAdded(_target: SDK.Target.Target): void;
    targetRemoved(_target: SDK.Target.Target): void;
    _showThreadsIfNeeded(): void;
    _setTarget(target: SDK.Target.Target | null): void;
    _onCurrentTargetChanged(event: Common.EventTarget.EventTargetEvent): void;
    paused(): boolean;
    wasShown(): void;
    willHide(): void;
    resolveLocation(locationName: string): UI.View.ViewLocation | null;
    _ensureSourcesViewVisible(): boolean;
    onResize(): void;
    searchableView(): UI.SearchableView.SearchableView;
    _debuggerPaused(event: Common.EventTarget.EventTargetEvent): void;
    _showDebuggerPausedDetails(details: SDK.DebuggerModel.DebuggerPausedDetails): void;
    _debuggerResumed(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    _debuggerWasEnabled(event: Common.EventTarget.EventTargetEvent): void;
    get visibleView(): UI.Widget.Widget | null;
    showUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber?: number, columnNumber?: number, omitFocus?: boolean): void;
    _showEditor(): void;
    showUILocation(uiLocation: Workspace.UISourceCode.UILocation, omitFocus?: boolean): void;
    _revealInNavigator(uiSourceCode: Workspace.UISourceCode.UISourceCode, skipReveal?: boolean): void;
    _populateNavigatorMenu(contextMenu: UI.ContextMenu.ContextMenu): void;
    setIgnoreExecutionLineEvents(ignoreExecutionLineEvents: boolean): void;
    updateLastModificationTime(): void;
    _executionLineChanged(liveLocation: Bindings.LiveLocation.LiveLocation): Promise<void>;
    _lastModificationTimeoutPassedForTest(): void;
    _updateLastModificationTimeForTest(): void;
    _callFrameChanged(): Promise<void>;
    _pauseOnExceptionEnabledChanged(): void;
    _updateDebuggerButtonsAndStatus(): Promise<void>;
    _updateDebuggerButtonsAndStatusForTest(): void;
    _clearInterface(): void;
    _switchToPausedTarget(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    _togglePauseOnExceptions(): void;
    _runSnippet(): void;
    _updateUserFlow(uiSourceCode: Workspace.UISourceCode.UISourceCode, userFlow: Recorder.Steps.UserFlow): Promise<void>;
    _toggleRecording(): Promise<void>;
    _replayRecording(): void;
    _exportRecording(): void;
    _editorSelected(event: Common.EventTarget.EventTargetEvent): void;
    _togglePause(): boolean;
    _prepareToResume(): SDK.DebuggerModel.DebuggerModel | null;
    _longResume(_event: Common.EventTarget.EventTargetEvent): void;
    _terminateExecution(_event: Common.EventTarget.EventTargetEvent): void;
    _stepOver(): boolean;
    _stepInto(): boolean;
    _stepIntoAsync(): boolean;
    _stepOut(): boolean;
    _continueToLocation(uiLocation: Workspace.UISourceCode.UILocation): Promise<void>;
    _toggleBreakpointsActive(): void;
    _breakpointsActiveStateChanged(): void;
    _createDebugToolbar(): UI.Toolbar.Toolbar;
    _createDebugToolbarDrawer(): HTMLDivElement;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    _appendUISourceCodeItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    _appendUISourceCodeFrameItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    appendUILocationItems(contextMenu: UI.ContextMenu.ContextMenu, object: Object): void;
    _handleContextMenuReveal(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    _appendRemoteObjectItems(contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    _appendNetworkRequestItems(contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
    _showFunctionDefinition(remoteObject: SDK.RemoteObject.RemoteObject): void;
    _didGetFunctionDetails(response: {
        location: SDK.DebuggerModel.Location | null;
    } | null): Promise<void>;
    _revealNavigatorSidebar(): void;
    _revealDebuggerSidebar(): void;
    _updateSidebarPosition(): void;
    _setAsCurrentPanel(): Promise<void>;
    _extensionSidebarPaneAdded(event: Common.EventTarget.EventTargetEvent): void;
    _addExtensionSidebarPane(pane: Extensions.ExtensionPanel.ExtensionSidebarPane): void;
    sourcesView(): SourcesView;
    _handleDrop(dataTransfer: DataTransfer): void;
}
export declare let lastModificationTimeout: number;
export declare const minToolbarWidth = 215;
export declare class UILocationRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): UILocationRevealer;
    reveal(uiLocation: Object, omitFocus?: boolean): Promise<void>;
}
export declare class DebuggerLocationRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): DebuggerLocationRevealer;
    reveal(rawLocation: Object, omitFocus?: boolean): Promise<void>;
}
export declare class UISourceCodeRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): UISourceCodeRevealer;
    reveal(uiSourceCode: Object, omitFocus?: boolean): Promise<void>;
}
export declare class DebuggerPausedDetailsRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): DebuggerPausedDetailsRevealer;
    reveal(_object: Object): Promise<void>;
}
export declare class RevealingActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): RevealingActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class DebuggingActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): DebuggingActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class WrapperView extends UI.Widget.VBox {
    _view: SourcesView;
    constructor();
    static instance(): WrapperView;
    static isShowing(): boolean;
    wasShown(): void;
    willHide(): void;
    _showViewInWrapper(): void;
}
export interface NavigatorViewRegistration {
    navigatorView: () => NavigatorView;
    viewId: string;
    experiment?: string;
}
