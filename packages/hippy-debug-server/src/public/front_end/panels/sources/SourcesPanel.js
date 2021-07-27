// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as Recorder from '../../models/recorder/recorder.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Snippets from '../snippets/snippets.js';
import { CallStackSidebarPane } from './CallStackSidebarPane.js';
import { DebuggerPausedMessage } from './DebuggerPausedMessage.js';
import { ContentScriptsNavigatorView, FilesNavigatorView, NetworkNavigatorView, OverridesNavigatorView, RecordingsNavigatorView, SnippetsNavigatorView } from './SourcesNavigator.js';
import { Events, SourcesView } from './SourcesView.js';
import { ThreadsSidebarPane } from './ThreadsSidebarPane.js';
import { UISourceCodeFrame } from './UISourceCodeFrame.js';
const UIStrings = {
    /**
    *@description Text that appears when user drag and drop something (for example, a file) in Sources Panel of the Sources panel
    */
    dropWorkspaceFolderHere: 'Drop workspace folder here',
    /**
    *@description Text to show more options
    */
    moreOptions: 'More options',
    /**
    * @description Tooltip for the the navigator toggle in the Sources panel. Command to open/show the
    * sidebar containing the navigator tool.
    */
    showNavigator: 'Show navigator',
    /**
    * @description Tooltip for the the navigator toggle in the Sources panel. Command to close/hide
    * the sidebar containing the navigator tool.
    */
    hideNavigator: 'Hide navigator',
    /**
    * @description Tooltip for the the debugger toggle in the Sources panel. Command to open/show the
    * sidebar containing the debugger tool.
    */
    showDebugger: 'Show debugger',
    /**
    * @description Tooltip for the the debugger toggle in the Sources panel. Command to close/hide the
    * sidebar containing the debugger tool.
    */
    hideDebugger: 'Hide debugger',
    /**
    *@description Text in Sources Panel of the Sources panel
    */
    groupByFolder: 'Group by folder',
    /**
    *@description Text for pausing the debugger on exceptions
    */
    pauseOnExceptions: 'Pause on exceptions',
    /**
    *@description Text in Sources Panel of the Sources panel
    */
    dontPauseOnExceptions: 'Don\'t pause on exceptions',
    /**
    *@description Tooltip text that appears when hovering over the largeicon play button in the Sources Panel of the Sources panel
    */
    resumeWithAllPausesBlockedForMs: 'Resume with all pauses blocked for 500 ms',
    /**
    *@description Tooltip text that appears when hovering over the largeicon terminate execution button in the Sources Panel of the Sources panel
    */
    terminateCurrentJavascriptCall: 'Terminate current JavaScript call',
    /**
    *@description Text in Sources Panel of the Sources panel
    */
    pauseOnCaughtExceptions: 'Pause on caught exceptions',
    /**
    *@description A context menu item in the Sources Panel of the Sources panel
    */
    revealInSidebar: 'Reveal in sidebar',
    /**
    *@description A context menu item in the Sources Panel of the Sources panel when debugging JS code.
    * When clicked, the execution is resumed until it reaches the line specified by the right-click that
    * opened the context menu.
    */
    continueToHere: 'Continue to here',
    /**
    *@description A context menu item in the Console that stores selection as a temporary global variable
    *@example {string} PH1
    */
    storeSAsGlobalVariable: 'Store {PH1} as global variable',
    /**
    *@description A context menu item in the Console, Sources, and Network panel
    *@example {string} PH1
    */
    copyS: 'Copy {PH1}',
    /**
    *@description A context menu item in the Sources Panel of the Sources panel
    */
    showFunctionDefinition: 'Show function definition',
    /**
    *@description Text in Sources Panel of the Sources panel
    */
    openInSourcesPanel: 'Open in Sources panel',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/SourcesPanel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let sourcesPanelInstance;
let wrapperViewInstance;
export class SourcesPanel extends UI.Panel.Panel {
    _workspace;
    _togglePauseAction;
    _stepOverAction;
    _stepIntoAction;
    _stepOutAction;
    _stepAction;
    _toggleBreakpointsActiveAction;
    _debugToolbar;
    _debugToolbarDrawer;
    _debuggerPausedMessage;
    _splitWidget;
    editorView;
    _navigatorTabbedLocation;
    _sourcesView;
    _toggleNavigatorSidebarButton;
    _toggleDebuggerSidebarButton;
    _threadsSidebarPane;
    _watchSidebarPane;
    _callstackPane;
    _liveLocationPool;
    _lastModificationTime;
    _paused;
    _switchToPausedTargetTimeout;
    _ignoreExecutionLineEvents;
    _executionLineLocation;
    _pauseOnExceptionButton;
    _sidebarPaneStack;
    _tabbedLocationHeader;
    _extensionSidebarPanesContainer;
    sidebarPaneView;
    constructor() {
        super('sources');
        this.registerRequiredCSS('panels/sources/sourcesPanel.css', { enableLegacyPatching: false });
        new UI.DropTarget.DropTarget(this.element, [UI.DropTarget.Type.Folder], i18nString(UIStrings.dropWorkspaceFolderHere), this._handleDrop.bind(this));
        this._workspace = Workspace.Workspace.WorkspaceImpl.instance();
        this._togglePauseAction =
            UI.ActionRegistry.ActionRegistry.instance().action('debugger.toggle-pause');
        this._stepOverAction =
            UI.ActionRegistry.ActionRegistry.instance().action('debugger.step-over');
        this._stepIntoAction =
            UI.ActionRegistry.ActionRegistry.instance().action('debugger.step-into');
        this._stepOutAction =
            UI.ActionRegistry.ActionRegistry.instance().action('debugger.step-out');
        this._stepAction =
            UI.ActionRegistry.ActionRegistry.instance().action('debugger.step');
        this._toggleBreakpointsActiveAction =
            UI.ActionRegistry.ActionRegistry.instance().action('debugger.toggle-breakpoints-active');
        this._debugToolbar = this._createDebugToolbar();
        this._debugToolbarDrawer = this._createDebugToolbarDrawer();
        this._debuggerPausedMessage = new DebuggerPausedMessage();
        const initialDebugSidebarWidth = 225;
        this._splitWidget =
            new UI.SplitWidget.SplitWidget(true, true, 'sourcesPanelSplitViewState', initialDebugSidebarWidth);
        this._splitWidget.enableShowModeSaving();
        this._splitWidget.show(this.element);
        // Create scripts navigator
        const initialNavigatorWidth = 225;
        this.editorView =
            new UI.SplitWidget.SplitWidget(true, false, 'sourcesPanelNavigatorSplitViewState', initialNavigatorWidth);
        this.editorView.enableShowModeSaving();
        this._splitWidget.setMainWidget(this.editorView);
        // Create navigator tabbed pane with toolbar.
        this._navigatorTabbedLocation = UI.ViewManager.ViewManager.instance().createTabbedLocation(this._revealNavigatorSidebar.bind(this), 'navigator-view', true);
        const tabbedPane = this._navigatorTabbedLocation.tabbedPane();
        tabbedPane.setMinimumSize(100, 25);
        tabbedPane.element.classList.add('navigator-tabbed-pane');
        const navigatorMenuButton = new UI.Toolbar.ToolbarMenuButton(this._populateNavigatorMenu.bind(this), true);
        navigatorMenuButton.setTitle(i18nString(UIStrings.moreOptions));
        tabbedPane.rightToolbar().appendToolbarItem(navigatorMenuButton);
        if (UI.ViewManager.ViewManager.instance().hasViewsForLocation('run-view-sidebar')) {
            const navigatorSplitWidget = new UI.SplitWidget.SplitWidget(false, true, 'sourcePanelNavigatorSidebarSplitViewState');
            navigatorSplitWidget.setMainWidget(tabbedPane);
            const runViewTabbedPane = UI.ViewManager.ViewManager.instance()
                .createTabbedLocation(this._revealNavigatorSidebar.bind(this), 'run-view-sidebar')
                .tabbedPane();
            navigatorSplitWidget.setSidebarWidget(runViewTabbedPane);
            navigatorSplitWidget.installResizer(runViewTabbedPane.headerElement());
            this.editorView.setSidebarWidget(navigatorSplitWidget);
        }
        else {
            this.editorView.setSidebarWidget(tabbedPane);
        }
        this._sourcesView = new SourcesView();
        this._sourcesView.addEventListener(Events.EditorSelected, this._editorSelected.bind(this));
        this._toggleNavigatorSidebarButton = this.editorView.createShowHideSidebarButton(i18nString(UIStrings.showNavigator), i18nString(UIStrings.hideNavigator));
        this._toggleDebuggerSidebarButton = this._splitWidget.createShowHideSidebarButton(i18nString(UIStrings.showDebugger), i18nString(UIStrings.hideDebugger));
        this.editorView.setMainWidget(this._sourcesView);
        this._threadsSidebarPane = null;
        this._watchSidebarPane = UI.ViewManager.ViewManager.instance().view('sources.watch');
        this._callstackPane = CallStackSidebarPane.instance();
        Common.Settings.Settings.instance()
            .moduleSetting('sidebarPosition')
            .addChangeListener(this._updateSidebarPosition.bind(this));
        this._updateSidebarPosition();
        this._updateDebuggerButtonsAndStatus();
        this._pauseOnExceptionEnabledChanged();
        Common.Settings.Settings.instance()
            .moduleSetting('pauseOnExceptionEnabled')
            .addChangeListener(this._pauseOnExceptionEnabledChanged, this);
        this._liveLocationPool = new Bindings.LiveLocation.LiveLocationPool();
        this._setTarget(UI.Context.Context.instance().flavor(SDK.Target.Target));
        Common.Settings.Settings.instance()
            .moduleSetting('breakpointsActive')
            .addChangeListener(this._breakpointsActiveStateChanged, this);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.Target.Target, this._onCurrentTargetChanged, this);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DebuggerModel.CallFrame, this._callFrameChanged, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerWasEnabled, this._debuggerWasEnabled, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerPaused, this._debuggerPaused, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerResumed, event => this._debuggerResumed(event.data));
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.GlobalObjectCleared, event => this._debuggerResumed(event.data));
        Extensions.ExtensionServer.ExtensionServer.instance().addEventListener(Extensions.ExtensionServer.Events.SidebarPaneAdded, this._extensionSidebarPaneAdded, this);
        SDK.TargetManager.TargetManager.instance().observeTargets(this);
        this._lastModificationTime = window.performance.now();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!sourcesPanelInstance || forceNew) {
            sourcesPanelInstance = new SourcesPanel();
        }
        return sourcesPanelInstance;
    }
    static updateResizerAndSidebarButtons(panel) {
        panel._sourcesView.leftToolbar().removeToolbarItems();
        panel._sourcesView.rightToolbar().removeToolbarItems();
        panel._sourcesView.bottomToolbar().removeToolbarItems();
        const isInWrapper = WrapperView.isShowing() && !UI.InspectorView.InspectorView.instance().isDrawerMinimized();
        if (panel._splitWidget.isVertical() || isInWrapper) {
            panel._splitWidget.uninstallResizer(panel._sourcesView.toolbarContainerElement());
        }
        else {
            panel._splitWidget.installResizer(panel._sourcesView.toolbarContainerElement());
        }
        if (!isInWrapper) {
            panel._sourcesView.leftToolbar().appendToolbarItem(panel._toggleNavigatorSidebarButton);
            if (panel._splitWidget.isVertical()) {
                panel._sourcesView.rightToolbar().appendToolbarItem(panel._toggleDebuggerSidebarButton);
            }
            else {
                panel._sourcesView.bottomToolbar().appendToolbarItem(panel._toggleDebuggerSidebarButton);
            }
        }
    }
    targetAdded(_target) {
        this._showThreadsIfNeeded();
    }
    targetRemoved(_target) {
    }
    _showThreadsIfNeeded() {
        if (ThreadsSidebarPane.shouldBeShown() && !this._threadsSidebarPane) {
            this._threadsSidebarPane = UI.ViewManager.ViewManager.instance().view('sources.threads');
            if (this._sidebarPaneStack && this._threadsSidebarPane) {
                this._sidebarPaneStack.showView(this._threadsSidebarPane, this._splitWidget.isVertical() ? this._watchSidebarPane : this._callstackPane);
            }
        }
    }
    _setTarget(target) {
        if (!target) {
            return;
        }
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        if (!debuggerModel) {
            return;
        }
        if (debuggerModel.isPaused()) {
            this._showDebuggerPausedDetails(debuggerModel.debuggerPausedDetails());
        }
        else {
            this._paused = false;
            this._clearInterface();
            this._toggleDebuggerSidebarButton.setEnabled(true);
        }
    }
    _onCurrentTargetChanged(event) {
        const target = event.data;
        this._setTarget(target);
    }
    paused() {
        return this._paused || false;
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(SourcesPanel, this);
        super.wasShown();
        const wrapper = WrapperView.instance();
        if (wrapper && wrapper.isShowing()) {
            UI.InspectorView.InspectorView.instance().setDrawerMinimized(true);
            SourcesPanel.updateResizerAndSidebarButtons(this);
        }
        this.editorView.setMainWidget(this._sourcesView);
    }
    willHide() {
        super.willHide();
        UI.Context.Context.instance().setFlavor(SourcesPanel, null);
        if (WrapperView.isShowing()) {
            WrapperView.instance()._showViewInWrapper();
            UI.InspectorView.InspectorView.instance().setDrawerMinimized(false);
            SourcesPanel.updateResizerAndSidebarButtons(this);
        }
    }
    resolveLocation(locationName) {
        if (locationName === 'sources.sidebar-top' || locationName === 'sources.sidebar-bottom' ||
            locationName === 'sources.sidebar-tabs') {
            return this._sidebarPaneStack || null;
        }
        return this._navigatorTabbedLocation;
    }
    _ensureSourcesViewVisible() {
        if (WrapperView.isShowing()) {
            return true;
        }
        if (!UI.InspectorView.InspectorView.instance().canSelectPanel('sources')) {
            return false;
        }
        UI.ViewManager.ViewManager.instance().showView('sources');
        return true;
    }
    onResize() {
        if (Common.Settings.Settings.instance().moduleSetting('sidebarPosition').get() === 'auto') {
            this.element.window().requestAnimationFrame(this._updateSidebarPosition.bind(this));
        } // Do not force layout.
    }
    searchableView() {
        return this._sourcesView.searchableView();
    }
    _debuggerPaused(event) {
        const debuggerModel = event.data;
        const details = debuggerModel.debuggerPausedDetails();
        if (!this._paused) {
            this._setAsCurrentPanel();
        }
        if (UI.Context.Context.instance().flavor(SDK.Target.Target) === debuggerModel.target()) {
            this._showDebuggerPausedDetails(details);
        }
        else if (!this._paused) {
            UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
        }
    }
    _showDebuggerPausedDetails(details) {
        this._paused = true;
        this._updateDebuggerButtonsAndStatus();
        UI.Context.Context.instance().setFlavor(SDK.DebuggerModel.DebuggerPausedDetails, details);
        this._toggleDebuggerSidebarButton.setEnabled(false);
        this._revealDebuggerSidebar();
        window.focus();
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
    }
    _debuggerResumed(debuggerModel) {
        const target = debuggerModel.target();
        if (UI.Context.Context.instance().flavor(SDK.Target.Target) !== target) {
            return;
        }
        this._paused = false;
        this._clearInterface();
        this._toggleDebuggerSidebarButton.setEnabled(true);
        this._switchToPausedTargetTimeout = window.setTimeout(this._switchToPausedTarget.bind(this, debuggerModel), 500);
    }
    _debuggerWasEnabled(event) {
        const debuggerModel = event.data;
        if (UI.Context.Context.instance().flavor(SDK.Target.Target) !== debuggerModel.target()) {
            return;
        }
        this._updateDebuggerButtonsAndStatus();
    }
    get visibleView() {
        return this._sourcesView.visibleView();
    }
    showUISourceCode(uiSourceCode, lineNumber, columnNumber, omitFocus) {
        if (omitFocus) {
            const wrapperShowing = WrapperView.isShowing();
            if (!this.isShowing() && !wrapperShowing) {
                return;
            }
        }
        else {
            this._showEditor();
        }
        this._sourcesView.showSourceLocation(uiSourceCode, lineNumber, columnNumber, omitFocus);
    }
    _showEditor() {
        if (WrapperView.isShowing()) {
            return;
        }
        this._setAsCurrentPanel();
    }
    showUILocation(uiLocation, omitFocus) {
        this.showUISourceCode(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber, omitFocus);
    }
    _revealInNavigator(uiSourceCode, skipReveal) {
        for (const navigator of registeredNavigatorViews) {
            const navigatorView = navigator.navigatorView();
            const viewId = navigator.viewId;
            if (viewId && navigatorView.acceptProject(uiSourceCode.project())) {
                navigatorView.revealUISourceCode(uiSourceCode, true);
                if (skipReveal) {
                    this._navigatorTabbedLocation.tabbedPane().selectTab(viewId);
                }
                else {
                    UI.ViewManager.ViewManager.instance().showView(viewId);
                }
            }
        }
    }
    _populateNavigatorMenu(contextMenu) {
        const groupByFolderSetting = Common.Settings.Settings.instance().moduleSetting('navigatorGroupByFolder');
        contextMenu.appendItemsAtLocation('navigatorMenu');
        contextMenu.viewSection().appendCheckboxItem(i18nString(UIStrings.groupByFolder), () => groupByFolderSetting.set(!groupByFolderSetting.get()), groupByFolderSetting.get());
    }
    setIgnoreExecutionLineEvents(ignoreExecutionLineEvents) {
        this._ignoreExecutionLineEvents = ignoreExecutionLineEvents;
    }
    updateLastModificationTime() {
        this._lastModificationTime = window.performance.now();
    }
    async _executionLineChanged(liveLocation) {
        const uiLocation = await liveLocation.uiLocation();
        if (!uiLocation) {
            return;
        }
        if (window.performance.now() - this._lastModificationTime < lastModificationTimeout) {
            return;
        }
        this._sourcesView.showSourceLocation(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber, undefined, true);
    }
    _lastModificationTimeoutPassedForTest() {
        lastModificationTimeout = Number.MIN_VALUE;
    }
    _updateLastModificationTimeForTest() {
        lastModificationTimeout = Number.MAX_VALUE;
    }
    async _callFrameChanged() {
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (!callFrame) {
            return;
        }
        if (this._executionLineLocation) {
            this._executionLineLocation.dispose();
        }
        this._executionLineLocation =
            await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createCallFrameLiveLocation(callFrame.location(), this._executionLineChanged.bind(this), this._liveLocationPool);
    }
    _pauseOnExceptionEnabledChanged() {
        const enabled = Common.Settings.Settings.instance().moduleSetting('pauseOnExceptionEnabled').get();
        const button = this._pauseOnExceptionButton;
        button.setToggled(enabled);
        button.setTitle(enabled ? i18nString(UIStrings.pauseOnExceptions) : i18nString(UIStrings.dontPauseOnExceptions));
        this._debugToolbarDrawer.classList.toggle('expanded', enabled);
    }
    async _updateDebuggerButtonsAndStatus() {
        const currentTarget = UI.Context.Context.instance().flavor(SDK.Target.Target);
        const currentDebuggerModel = currentTarget ? currentTarget.model(SDK.DebuggerModel.DebuggerModel) : null;
        if (!currentDebuggerModel) {
            this._togglePauseAction.setEnabled(false);
            this._stepOverAction.setEnabled(false);
            this._stepIntoAction.setEnabled(false);
            this._stepOutAction.setEnabled(false);
            this._stepAction.setEnabled(false);
        }
        else if (this._paused) {
            this._togglePauseAction.setToggled(true);
            this._togglePauseAction.setEnabled(true);
            this._stepOverAction.setEnabled(true);
            this._stepIntoAction.setEnabled(true);
            this._stepOutAction.setEnabled(true);
            this._stepAction.setEnabled(true);
        }
        else {
            this._togglePauseAction.setToggled(false);
            this._togglePauseAction.setEnabled(!currentDebuggerModel.isPausing());
            this._stepOverAction.setEnabled(false);
            this._stepIntoAction.setEnabled(false);
            this._stepOutAction.setEnabled(false);
            this._stepAction.setEnabled(false);
        }
        const details = currentDebuggerModel ? currentDebuggerModel.debuggerPausedDetails() : null;
        await this._debuggerPausedMessage.render(details, Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance(), Bindings.BreakpointManager.BreakpointManager.instance());
        if (details) {
            this._updateDebuggerButtonsAndStatusForTest();
        }
    }
    _updateDebuggerButtonsAndStatusForTest() {
    }
    _clearInterface() {
        this._updateDebuggerButtonsAndStatus();
        UI.Context.Context.instance().setFlavor(SDK.DebuggerModel.DebuggerPausedDetails, null);
        if (this._switchToPausedTargetTimeout) {
            clearTimeout(this._switchToPausedTargetTimeout);
        }
        this._liveLocationPool.disposeAll();
    }
    _switchToPausedTarget(debuggerModel) {
        delete this._switchToPausedTargetTimeout;
        if (this._paused || debuggerModel.isPaused()) {
            return;
        }
        for (const debuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel)) {
            if (debuggerModel.isPaused()) {
                UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
                break;
            }
        }
    }
    _togglePauseOnExceptions() {
        Common.Settings.Settings.instance()
            .moduleSetting('pauseOnExceptionEnabled')
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // @ts-expect-error
            .set(!(this._pauseOnExceptionButton).toggled());
    }
    _runSnippet() {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        if (uiSourceCode) {
            Snippets.ScriptSnippetFileSystem.evaluateScriptSnippet(uiSourceCode);
        }
    }
    async _updateUserFlow(uiSourceCode, userFlow) {
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const content = JSON.stringify(userFlow, null, indent);
        uiSourceCode.setContent(content, false);
        await Common.Revealer.reveal(uiSourceCode.uiLocation(content.length), true);
    }
    async _toggleRecording() {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        if (!uiSourceCode) {
            return;
        }
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (!target) {
            return;
        }
        const recorderModel = target.model(Recorder.RecorderModel.RecorderModel);
        if (!recorderModel) {
            return;
        }
        const currentSession = await recorderModel.toggleRecording();
        if (currentSession) {
            currentSession.addEventListener('recording-updated', async ({ data }) => {
                this._updateUserFlow(uiSourceCode, data);
            });
            // Render the initial user flow
            this._updateUserFlow(uiSourceCode, currentSession.getUserFlow());
        }
    }
    _replayRecording() {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        if (!uiSourceCode) {
            return;
        }
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (!target) {
            return;
        }
        const recorderModel = target.model(Recorder.RecorderModel.RecorderModel);
        if (!recorderModel) {
            return;
        }
        const userFlow = recorderModel.parseUserFlow(uiSourceCode.content());
        recorderModel.replayRecording(userFlow);
    }
    _exportRecording() {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        if (!uiSourceCode) {
            return;
        }
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (!target) {
            return;
        }
        const recorderModel = target.model(Recorder.RecorderModel.RecorderModel);
        if (!recorderModel) {
            return;
        }
        recorderModel.exportRecording(uiSourceCode);
    }
    _editorSelected(event) {
        const uiSourceCode = event.data;
        if (this.editorView.mainWidget() &&
            Common.Settings.Settings.instance().moduleSetting('autoRevealInNavigator').get()) {
            this._revealInNavigator(uiSourceCode, true);
        }
    }
    _togglePause() {
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (!target) {
            return true;
        }
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        if (!debuggerModel) {
            return true;
        }
        if (this._paused) {
            this._paused = false;
            debuggerModel.resume();
        }
        else {
            // Make sure pauses didn't stick skipped.
            debuggerModel.pause();
        }
        this._clearInterface();
        return true;
    }
    _prepareToResume() {
        if (!this._paused) {
            return null;
        }
        this._paused = false;
        this._clearInterface();
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        return target ? target.model(SDK.DebuggerModel.DebuggerModel) : null;
    }
    _longResume(_event) {
        const debuggerModel = this._prepareToResume();
        if (debuggerModel) {
            debuggerModel.skipAllPausesUntilReloadOrTimeout(500);
            debuggerModel.resume();
        }
    }
    _terminateExecution(_event) {
        const debuggerModel = this._prepareToResume();
        if (debuggerModel) {
            debuggerModel.runtimeModel().terminateExecution();
            debuggerModel.resume();
        }
    }
    _stepOver() {
        const debuggerModel = this._prepareToResume();
        if (debuggerModel) {
            debuggerModel.stepOver();
        }
        return true;
    }
    _stepInto() {
        const debuggerModel = this._prepareToResume();
        if (debuggerModel) {
            debuggerModel.stepInto();
        }
        return true;
    }
    _stepIntoAsync() {
        const debuggerModel = this._prepareToResume();
        if (debuggerModel) {
            debuggerModel.scheduleStepIntoAsync();
        }
        return true;
    }
    _stepOut() {
        const debuggerModel = this._prepareToResume();
        if (debuggerModel) {
            debuggerModel.stepOut();
        }
        return true;
    }
    async _continueToLocation(uiLocation) {
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (!executionContext) {
            return;
        }
        // Always use 0 column.
        const rawLocations = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiLocation.uiSourceCode, uiLocation.lineNumber, 0);
        const rawLocation = rawLocations.find(location => location.debuggerModel === executionContext.debuggerModel);
        if (rawLocation && this._prepareToResume()) {
            rawLocation.continueToLocation();
        }
    }
    _toggleBreakpointsActive() {
        Common.Settings.Settings.instance()
            .moduleSetting('breakpointsActive')
            .set(!Common.Settings.Settings.instance().moduleSetting('breakpointsActive').get());
    }
    _breakpointsActiveStateChanged() {
        const active = Common.Settings.Settings.instance().moduleSetting('breakpointsActive').get();
        this._toggleBreakpointsActiveAction.setToggled(!active);
        this._sourcesView.toggleBreakpointsActiveState(active);
    }
    _createDebugToolbar() {
        const debugToolbar = new UI.Toolbar.Toolbar('scripts-debug-toolbar');
        const longResumeButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.resumeWithAllPausesBlockedForMs), 'largeicon-play');
        longResumeButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._longResume, this);
        const terminateExecutionButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.terminateCurrentJavascriptCall), 'largeicon-terminate-execution');
        terminateExecutionButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._terminateExecution, this);
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createLongPressActionButton(this._togglePauseAction, [terminateExecutionButton, longResumeButton], []));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepOverAction));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepIntoAction));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepOutAction));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._stepAction));
        debugToolbar.appendSeparator();
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._toggleBreakpointsActiveAction));
        this._pauseOnExceptionButton = new UI.Toolbar.ToolbarToggle('', 'largeicon-pause-on-exceptions');
        this._pauseOnExceptionButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._togglePauseOnExceptions, this);
        debugToolbar.appendToolbarItem(this._pauseOnExceptionButton);
        return debugToolbar;
    }
    _createDebugToolbarDrawer() {
        const debugToolbarDrawer = document.createElement('div');
        debugToolbarDrawer.classList.add('scripts-debug-toolbar-drawer');
        const label = i18nString(UIStrings.pauseOnCaughtExceptions);
        const setting = Common.Settings.Settings.instance().moduleSetting('pauseOnCaughtException');
        debugToolbarDrawer.appendChild(UI.SettingsUI.createSettingCheckbox(label, setting, true));
        return debugToolbarDrawer;
    }
    appendApplicableItems(event, contextMenu, target) {
        this._appendUISourceCodeItems(event, contextMenu, target);
        this._appendUISourceCodeFrameItems(event, contextMenu, target);
        this.appendUILocationItems(contextMenu, target);
        this._appendRemoteObjectItems(contextMenu, target);
        this._appendNetworkRequestItems(contextMenu, target);
    }
    _appendUISourceCodeItems(event, contextMenu, target) {
        if (!(target instanceof Workspace.UISourceCode.UISourceCode) || !event.target) {
            return;
        }
        const uiSourceCode = target;
        const eventTarget = event.target;
        if (!uiSourceCode.project().isServiceProject() &&
            !eventTarget.isSelfOrDescendant(this._navigatorTabbedLocation.widget().element)) {
            contextMenu.revealSection().appendItem(i18nString(UIStrings.revealInSidebar), this._handleContextMenuReveal.bind(this, uiSourceCode));
        }
    }
    _appendUISourceCodeFrameItems(event, contextMenu, target) {
        if (!(target instanceof UISourceCodeFrame)) {
            return;
        }
        if (target.uiSourceCode().contentType().isFromSourceMap() || target.textEditor.selection().isEmpty()) {
            return;
        }
        contextMenu.debugSection().appendAction('debugger.evaluate-selection');
    }
    appendUILocationItems(contextMenu, object) {
        if (!(object instanceof Workspace.UISourceCode.UILocation)) {
            return;
        }
        const uiLocation = object;
        const uiSourceCode = uiLocation.uiSourceCode;
        if (!Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()
            .scriptsForUISourceCode(uiSourceCode)
            .every(script => script.isJavaScript())) {
            // Ignore List and 'Continue to here' currently only works for JavaScript debugging.
            return;
        }
        const contentType = uiSourceCode.contentType();
        if (contentType.hasScripts()) {
            const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
            const debuggerModel = target ? target.model(SDK.DebuggerModel.DebuggerModel) : null;
            if (debuggerModel && debuggerModel.isPaused()) {
                contextMenu.debugSection().appendItem(i18nString(UIStrings.continueToHere), this._continueToLocation.bind(this, uiLocation));
            }
            this._callstackPane.appendIgnoreListURLContextMenuItems(contextMenu, uiSourceCode);
        }
    }
    _handleContextMenuReveal(uiSourceCode) {
        this.editorView.showBoth();
        this._revealInNavigator(uiSourceCode);
    }
    _appendRemoteObjectItems(contextMenu, target) {
        if (!(target instanceof SDK.RemoteObject.RemoteObject)) {
            return;
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const remoteObject = target;
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        function getObjectTitle() {
            if (remoteObject.type === 'wasm') {
                return remoteObject.subtype;
            }
            if (remoteObject.subtype === 'node') {
                return 'outerHTML';
            }
            return remoteObject.type;
        }
        const copyContextMenuTitle = getObjectTitle();
        contextMenu.debugSection().appendItem(i18nString(UIStrings.storeSAsGlobalVariable, { PH1: copyContextMenuTitle }), () => SDK.ConsoleModel.ConsoleModel.instance().saveToTempVariable(executionContext, remoteObject));
        // Copy object context menu.
        if (remoteObject.type !== 'function') {
            const copyDecodedValueHandler = async () => {
                const result = await remoteObject.callFunctionJSON(toStringForClipboard, [{
                        value: {
                            subtype: remoteObject.subtype,
                            indent: indent,
                        },
                    }]);
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(result);
            };
            contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyS, { PH1: copyContextMenuTitle }), copyDecodedValueHandler);
        }
        if (remoteObject.type === 'function') {
            contextMenu.debugSection().appendItem(i18nString(UIStrings.showFunctionDefinition), this._showFunctionDefinition.bind(this, remoteObject));
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function toStringForClipboard(data) {
            const subtype = data.subtype;
            const indent = data.indent;
            if (subtype === 'node') {
                return this instanceof Element ? this.outerHTML : undefined;
            }
            if (subtype && typeof this === 'undefined') {
                return String(subtype);
            }
            try {
                return JSON.stringify(this, null, indent);
            }
            catch (error) {
                return String(this);
            }
        }
    }
    _appendNetworkRequestItems(contextMenu, target) {
        if (!(target instanceof SDK.NetworkRequest.NetworkRequest)) {
            return;
        }
        const request = target;
        const uiSourceCode = this._workspace.uiSourceCodeForURL(request.url());
        if (!uiSourceCode) {
            return;
        }
        const openText = i18nString(UIStrings.openInSourcesPanel);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const callback = this.showUILocation.bind(this, uiSourceCode.uiLocation(0, 0));
        contextMenu.revealSection().appendItem(openText, callback);
    }
    _showFunctionDefinition(remoteObject) {
        remoteObject.debuggerModel().functionDetailsPromise(remoteObject).then(this._didGetFunctionDetails.bind(this));
    }
    async _didGetFunctionDetails(response) {
        if (!response || !response.location) {
            return;
        }
        const uiLocation = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(response.location);
        if (uiLocation) {
            this.showUILocation(uiLocation);
        }
    }
    _revealNavigatorSidebar() {
        this._setAsCurrentPanel();
        this.editorView.showBoth(true);
    }
    _revealDebuggerSidebar() {
        this._setAsCurrentPanel();
        this._splitWidget.showBoth(true);
    }
    _updateSidebarPosition() {
        let vertically;
        const position = Common.Settings.Settings.instance().moduleSetting('sidebarPosition').get();
        if (position === 'right') {
            vertically = false;
        }
        else if (position === 'bottom') {
            vertically = true;
        }
        else {
            vertically = UI.InspectorView.InspectorView.instance().element.offsetWidth < 680;
        }
        if (this.sidebarPaneView && vertically === !this._splitWidget.isVertical()) {
            return;
        }
        if (this.sidebarPaneView && this.sidebarPaneView.shouldHideOnDetach()) {
            return;
        } // We can't reparent extension iframes.
        if (this.sidebarPaneView) {
            this.sidebarPaneView.detach();
        }
        this._splitWidget.setVertical(!vertically);
        this._splitWidget.element.classList.toggle('sources-split-view-vertical', vertically);
        SourcesPanel.updateResizerAndSidebarButtons(this);
        // Create vertical box with stack.
        const vbox = new UI.Widget.VBox();
        vbox.element.appendChild(this._debugToolbar.element);
        vbox.element.appendChild(this._debugToolbarDrawer);
        vbox.setMinimumAndPreferredSizes(minToolbarWidth, 25, minToolbarWidth, 100);
        this._sidebarPaneStack =
            UI.ViewManager.ViewManager.instance().createStackLocation(this._revealDebuggerSidebar.bind(this));
        this._sidebarPaneStack.widget().element.classList.add('overflow-auto');
        this._sidebarPaneStack.widget().show(vbox.element);
        this._sidebarPaneStack.widget().element.appendChild(this._debuggerPausedMessage.element());
        this._sidebarPaneStack.appendApplicableItems('sources.sidebar-top');
        if (this._threadsSidebarPane) {
            this._sidebarPaneStack.showView(this._threadsSidebarPane);
        }
        const jsBreakpoints = UI.ViewManager.ViewManager.instance().view('sources.jsBreakpoints');
        const scopeChainView = UI.ViewManager.ViewManager.instance().view('sources.scopeChain');
        if (this._tabbedLocationHeader) {
            this._splitWidget.uninstallResizer(this._tabbedLocationHeader);
            this._tabbedLocationHeader = null;
        }
        if (!vertically) {
            // Populate the rest of the stack.
            this._sidebarPaneStack.appendView(this._watchSidebarPane);
            this._sidebarPaneStack.showView(jsBreakpoints);
            this._sidebarPaneStack.showView(scopeChainView);
            this._sidebarPaneStack.showView(this._callstackPane);
            this._extensionSidebarPanesContainer = this._sidebarPaneStack;
            this.sidebarPaneView = vbox;
            this._splitWidget.uninstallResizer(this._debugToolbar.gripElementForResize());
        }
        else {
            const splitWidget = new UI.SplitWidget.SplitWidget(true, true, 'sourcesPanelDebuggerSidebarSplitViewState', 0.5);
            splitWidget.setMainWidget(vbox);
            // Populate the left stack.
            this._sidebarPaneStack.showView(jsBreakpoints);
            this._sidebarPaneStack.showView(this._callstackPane);
            const tabbedLocation = UI.ViewManager.ViewManager.instance().createTabbedLocation(this._revealDebuggerSidebar.bind(this));
            splitWidget.setSidebarWidget(tabbedLocation.tabbedPane());
            this._tabbedLocationHeader = tabbedLocation.tabbedPane().headerElement();
            this._splitWidget.installResizer(this._tabbedLocationHeader);
            this._splitWidget.installResizer(this._debugToolbar.gripElementForResize());
            tabbedLocation.appendView(scopeChainView);
            tabbedLocation.appendView(this._watchSidebarPane);
            tabbedLocation.appendApplicableItems('sources.sidebar-tabs');
            this._extensionSidebarPanesContainer = tabbedLocation;
            this.sidebarPaneView = splitWidget;
        }
        this._sidebarPaneStack.appendApplicableItems('sources.sidebar-bottom');
        const extensionSidebarPanes = Extensions.ExtensionServer.ExtensionServer.instance().sidebarPanes();
        for (let i = 0; i < extensionSidebarPanes.length; ++i) {
            this._addExtensionSidebarPane(extensionSidebarPanes[i]);
        }
        this._splitWidget.setSidebarWidget(this.sidebarPaneView);
    }
    _setAsCurrentPanel() {
        return UI.ViewManager.ViewManager.instance().showView('sources');
    }
    _extensionSidebarPaneAdded(event) {
        const pane = event.data;
        this._addExtensionSidebarPane(pane);
    }
    _addExtensionSidebarPane(pane) {
        if (pane.panelName() === this.name) {
            this._extensionSidebarPanesContainer.appendView(pane);
        }
    }
    sourcesView() {
        return this._sourcesView;
    }
    _handleDrop(dataTransfer) {
        const items = dataTransfer.items;
        if (!items.length) {
            return;
        }
        const entry = items[0].webkitGetAsEntry();
        if (!entry.isDirectory) {
            return;
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.upgradeDraggedFileSystemPermissions(entry.filesystem);
    }
}
export let lastModificationTimeout = 200;
export const minToolbarWidth = 215;
let uILocationRevealerInstance;
export class UILocationRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!uILocationRevealerInstance || forceNew) {
            uILocationRevealerInstance = new UILocationRevealer();
        }
        return uILocationRevealerInstance;
    }
    reveal(uiLocation, omitFocus) {
        if (!(uiLocation instanceof Workspace.UISourceCode.UILocation)) {
            return Promise.reject(new Error('Internal error: not a ui location'));
        }
        SourcesPanel.instance().showUILocation(uiLocation, omitFocus);
        return Promise.resolve();
    }
}
let debuggerLocationRevealerInstance;
export class DebuggerLocationRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!debuggerLocationRevealerInstance || forceNew) {
            debuggerLocationRevealerInstance = new DebuggerLocationRevealer();
        }
        return debuggerLocationRevealerInstance;
    }
    async reveal(rawLocation, omitFocus) {
        if (!(rawLocation instanceof SDK.DebuggerModel.Location)) {
            throw new Error('Internal error: not a debugger location');
        }
        const uiLocation = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(rawLocation);
        if (uiLocation) {
            SourcesPanel.instance().showUILocation(uiLocation, omitFocus);
        }
    }
}
let uISourceCodeRevealerInstance;
export class UISourceCodeRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!uISourceCodeRevealerInstance || forceNew) {
            uISourceCodeRevealerInstance = new UISourceCodeRevealer();
        }
        return uISourceCodeRevealerInstance;
    }
    reveal(uiSourceCode, omitFocus) {
        if (!(uiSourceCode instanceof Workspace.UISourceCode.UISourceCode)) {
            return Promise.reject(new Error('Internal error: not a ui source code'));
        }
        SourcesPanel.instance().showUISourceCode(uiSourceCode, undefined, undefined, omitFocus);
        return Promise.resolve();
    }
}
let debuggerPausedDetailsRevealerInstance;
export class DebuggerPausedDetailsRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!debuggerPausedDetailsRevealerInstance || forceNew) {
            debuggerPausedDetailsRevealerInstance = new DebuggerPausedDetailsRevealer();
        }
        return debuggerPausedDetailsRevealerInstance;
    }
    reveal(_object) {
        return SourcesPanel.instance()._setAsCurrentPanel();
    }
}
let revealingActionDelegateInstance;
export class RevealingActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!revealingActionDelegateInstance || forceNew) {
            revealingActionDelegateInstance = new RevealingActionDelegate();
        }
        return revealingActionDelegateInstance;
    }
    handleAction(context, actionId) {
        const panel = SourcesPanel.instance();
        if (!panel._ensureSourcesViewVisible()) {
            return false;
        }
        switch (actionId) {
            case 'debugger.toggle-pause':
                panel._togglePause();
                return true;
        }
        return false;
    }
}
let debuggingActionDelegateInstance;
export class DebuggingActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!debuggingActionDelegateInstance || forceNew) {
            debuggingActionDelegateInstance = new DebuggingActionDelegate();
        }
        return debuggingActionDelegateInstance;
    }
    handleAction(context, actionId) {
        const panel = SourcesPanel.instance();
        switch (actionId) {
            case 'debugger.step-over': {
                panel._stepOver();
                return true;
            }
            case 'debugger.step-into': {
                panel._stepIntoAsync();
                return true;
            }
            case 'debugger.step': {
                panel._stepInto();
                return true;
            }
            case 'debugger.step-out': {
                panel._stepOut();
                return true;
            }
            case 'debugger.run-snippet': {
                panel._runSnippet();
                return true;
            }
            case 'recorder.toggle-recording': {
                // TODO: Handle dangling promise
                panel._toggleRecording();
                return true;
            }
            case 'recorder.replay-recording': {
                panel._replayRecording();
                return true;
            }
            case 'recorder.export-recording': {
                panel._exportRecording();
                return true;
            }
            case 'debugger.toggle-breakpoints-active': {
                panel._toggleBreakpointsActive();
                return true;
            }
            case 'debugger.evaluate-selection': {
                const frame = UI.Context.Context.instance().flavor(UISourceCodeFrame);
                if (frame) {
                    let text = frame.textEditor.text(frame.textEditor.selection());
                    const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
                    if (executionContext) {
                        const message = SDK.ConsoleModel.ConsoleModel.instance().addCommandMessage(executionContext, text);
                        text = ObjectUI.JavaScriptREPL.JavaScriptREPL.wrapObjectLiteral(text);
                        SDK.ConsoleModel.ConsoleModel.instance().evaluateCommandInConsole(executionContext, message, text, /* useCommandLineAPI */ true);
                    }
                }
                return true;
            }
        }
        return false;
    }
}
export class WrapperView extends UI.Widget.VBox {
    _view;
    constructor() {
        super();
        this.element.classList.add('sources-view-wrapper');
        this._view = SourcesPanel.instance()._sourcesView;
    }
    static instance() {
        if (!wrapperViewInstance) {
            wrapperViewInstance = new WrapperView();
        }
        return wrapperViewInstance;
    }
    static isShowing() {
        return Boolean(wrapperViewInstance) && wrapperViewInstance.isShowing();
    }
    wasShown() {
        if (!SourcesPanel.instance().isShowing()) {
            this._showViewInWrapper();
        }
        else {
            UI.InspectorView.InspectorView.instance().setDrawerMinimized(true);
        }
        SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance());
    }
    willHide() {
        UI.InspectorView.InspectorView.instance().setDrawerMinimized(false);
        queueMicrotask(() => {
            SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance());
        });
    }
    _showViewInWrapper() {
        this._view.show(this.element);
    }
}
const registeredNavigatorViews = [
    {
        viewId: 'navigator-network',
        navigatorView: NetworkNavigatorView.instance,
        experiment: undefined,
    },
    {
        viewId: 'navigator-files',
        navigatorView: FilesNavigatorView.instance,
        experiment: undefined,
    },
    {
        viewId: 'navigator-snippets',
        navigatorView: SnippetsNavigatorView.instance,
        experiment: undefined,
    },
    {
        viewId: 'navigator-recordings',
        navigatorView: RecordingsNavigatorView.instance,
        experiment: Root.Runtime.ExperimentName.RECORDER,
    },
    {
        viewId: 'navigator-overrides',
        navigatorView: OverridesNavigatorView.instance,
        experiment: undefined,
    },
    {
        viewId: 'navigator-contentScripts',
        navigatorView: ContentScriptsNavigatorView.instance,
        experiment: undefined,
    },
];
//# sourceMappingURL=SourcesPanel.js.map