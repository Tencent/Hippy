// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Logs from '../../models/logs/logs.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as MobileThrottling from '../mobile_throttling/mobile_throttling.js';
import * as Search from '../search/search.js';
import { BlockedURLsPane } from './BlockedURLsPane.js';
import { Events } from './NetworkDataGridNode.js';
import { NetworkItemView } from './NetworkItemView.js'; // eslint-disable-line no-unused-vars
import { NetworkLogView } from './NetworkLogView.js'; // eslint-disable-line no-unused-vars
import { NetworkOverview } from './NetworkOverview.js';
import { NetworkSearchScope } from './NetworkSearchScope.js'; // eslint-disable-line no-unused-vars
import { NetworkTransferTimeCalculator } from './NetworkTimeCalculator.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text to close something
    */
    close: 'Close',
    /**
    *@description Title of a search bar or tool
    */
    search: 'Search',
    /**
    *@description Text to clear content
    */
    clear: 'Clear',
    /**
    *@description Tooltip text that appears on the setting to preserve log when hovering over the item
    */
    doNotClearLogOnPageReload: 'Do not clear log on page reload / navigation',
    /**
    *@description Text to preserve the log after refreshing
    */
    preserveLog: 'Preserve log',
    /**
    *@description Text to disable cache while DevTools is open
    */
    disableCacheWhileDevtoolsIsOpen: 'Disable cache (while DevTools is open)',
    /**
    *@description Text in Network Config View of the Network panel
    */
    disableCache: 'Disable cache',
    /**
    *@description Tooltip text that appears when hovering over the largeicon settings gear in show settings pane setting in network panel of the network panel
    */
    networkSettings: 'Network settings',
    /**
    *@description Tooltip for expanding network request row setting
    */
    showMoreInformationInRequestRows: 'Show more information in request rows',
    /**
    *@description Text in Network Panel of the Network panel
    */
    useLargeRequestRows: 'Use large request rows',
    /**
    *@description Tooltip text for network request overview setting
    */
    showOverviewOfNetworkRequests: 'Show overview of network requests',
    /**
    *@description Text in Network Panel of the Network panel
    */
    showOverview: 'Show overview',
    /**
    *@description Tooltip for group by frame network setting
    */
    groupRequestsByTopLevelRequest: 'Group requests by top level request frame',
    /**
    *@description Text in Network Panel of the Network panel
    */
    groupByFrame: 'Group by frame',
    /**
    *@description Tooltip for capture screenshot network setting
    */
    captureScreenshotsWhenLoadingA: 'Capture screenshots when loading a page',
    /**
    *@description Text to take screenshots
    */
    captureScreenshots: 'Capture screenshots',
    /**
    * @description Tooltip text that appears when hovering over the largeicon load button in the
    * Network Panel. This action prompts the user to select a HAR file to upload to DevTools.
    */
    importHarFile: 'Import `HAR` file...',
    /**
    * @description Tooltip text that appears when hovering over the largeicon download button in the
    * Network Panel. HAR is a file format (HTTP Archive) and should not be translated. This action
    * triggers the download of a HAR file.
    */
    exportHar: 'Export `HAR`...',
    /**
    *@description Text for throttling the network
    */
    throttling: 'Throttling',
    /**
    *@description Text in Network Panel of the Network panel
    *@example {Ctrl + R} PH1
    */
    hitSToReloadAndCaptureFilmstrip: 'Hit {PH1} to reload and capture filmstrip.',
    /**
    *@description A context menu item in the Network Panel of the Network panel
    */
    revealInNetworkPanel: 'Reveal in Network panel',
    /**
    *@description Text in Network Panel of the Network panel
    */
    recordingFrames: 'Recording frames...',
    /**
    *@description Text in Network Panel of the Network panel
    */
    fetchingFrames: 'Fetching frames...',
    /**
     * @description Text of a button in the Network panel's toolbar that open Network Conditions panel in the drawer.
     */
    moreNetworkConditions: 'More network conditions…',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkPanel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let networkPanelInstance;
export class NetworkPanel extends UI.Panel.Panel {
    _networkLogShowOverviewSetting;
    _networkLogLargeRowsSetting;
    _networkRecordFilmStripSetting;
    _toggleRecordAction;
    _pendingStopTimer;
    _networkItemView;
    _filmStripView;
    _filmStripRecorder;
    _currentRequest;
    _panelToolbar;
    _rightToolbar;
    _filterBar;
    _settingsPane;
    _showSettingsPaneSetting;
    _filmStripPlaceholderElement;
    _overviewPane;
    _networkOverview;
    _overviewPlaceholderElement;
    _calculator;
    _splitWidget;
    _sidebarLocation;
    _progressBarContainer;
    _networkLogView;
    _fileSelectorElement;
    _detailsWidget;
    _closeButtonElement;
    _preserveLogSetting;
    _recordLogSetting;
    _throttlingSelect;
    constructor() {
        super('network');
        this.registerRequiredCSS('panels/network/networkPanel.css', { enableLegacyPatching: false });
        this._networkLogShowOverviewSetting =
            Common.Settings.Settings.instance().createSetting('networkLogShowOverview', true);
        this._networkLogLargeRowsSetting = Common.Settings.Settings.instance().createSetting('networkLogLargeRows', false);
        this._networkRecordFilmStripSetting =
            Common.Settings.Settings.instance().createSetting('networkRecordFilmStripSetting', false);
        this._toggleRecordAction =
            UI.ActionRegistry.ActionRegistry.instance().action('network.toggle-recording');
        this._networkItemView = null;
        this._filmStripView = null;
        this._filmStripRecorder = null;
        this._currentRequest = null;
        const panel = new UI.Widget.VBox();
        const networkToolbarContainer = panel.contentElement.createChild('div', 'network-toolbar-container');
        this._panelToolbar = new UI.Toolbar.Toolbar('', networkToolbarContainer);
        this._panelToolbar.makeWrappable(true);
        this._rightToolbar = new UI.Toolbar.Toolbar('', networkToolbarContainer);
        this._filterBar = new UI.FilterBar.FilterBar('networkPanel', true);
        this._filterBar.show(panel.contentElement);
        this._filterBar.addEventListener(UI.FilterBar.FilterBar.Events.Changed, this._handleFilterChanged.bind(this));
        this._settingsPane = new UI.Widget.HBox();
        this._settingsPane.element.classList.add('network-settings-pane');
        this._settingsPane.show(panel.contentElement);
        this._showSettingsPaneSetting =
            Common.Settings.Settings.instance().createSetting('networkShowSettingsToolbar', false);
        this._showSettingsPaneSetting.addChangeListener(this._updateSettingsPaneVisibility.bind(this));
        this._updateSettingsPaneVisibility();
        this._filmStripPlaceholderElement = panel.contentElement.createChild('div', 'network-film-strip-placeholder');
        // Create top overview component.
        this._overviewPane = new PerfUI.TimelineOverviewPane.TimelineOverviewPane('network');
        this._overviewPane.addEventListener(PerfUI.TimelineOverviewPane.Events.WindowChanged, this._onWindowChanged.bind(this));
        this._overviewPane.element.id = 'network-overview-panel';
        this._networkOverview = new NetworkOverview();
        this._overviewPane.setOverviewControls([this._networkOverview]);
        this._overviewPlaceholderElement = panel.contentElement.createChild('div');
        this._calculator = new NetworkTransferTimeCalculator();
        this._splitWidget = new UI.SplitWidget.SplitWidget(true, false, 'networkPanelSplitViewState');
        this._splitWidget.hideMain();
        this._splitWidget.show(panel.contentElement);
        panel.setDefaultFocusedChild(this._filterBar);
        const initialSidebarWidth = 225;
        const splitWidget = new UI.SplitWidget.SplitWidget(true, false, 'networkPanelSidebarState', initialSidebarWidth);
        splitWidget.hideSidebar();
        splitWidget.enableShowModeSaving();
        splitWidget.show(this.element);
        this._sidebarLocation = UI.ViewManager.ViewManager.instance().createTabbedLocation(async () => {
            UI.ViewManager.ViewManager.instance().showView('network');
            splitWidget.showBoth();
        }, 'network-sidebar', true);
        const tabbedPane = this._sidebarLocation.tabbedPane();
        tabbedPane.setMinimumSize(100, 25);
        tabbedPane.element.classList.add('network-tabbed-pane');
        tabbedPane.element.addEventListener('keydown', event => {
            if (event.key !== 'Escape') {
                return;
            }
            splitWidget.hideSidebar();
            event.consume();
        });
        const closeSidebar = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.close), 'largeicon-delete');
        closeSidebar.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => splitWidget.hideSidebar());
        tabbedPane.rightToolbar().appendToolbarItem(closeSidebar);
        splitWidget.setSidebarWidget(tabbedPane);
        splitWidget.setMainWidget(panel);
        splitWidget.setDefaultFocusedChild(panel);
        this.setDefaultFocusedChild(splitWidget);
        this._progressBarContainer = document.createElement('div');
        this._networkLogView =
            new NetworkLogView(this._filterBar, this._progressBarContainer, this._networkLogLargeRowsSetting);
        this._splitWidget.setSidebarWidget(this._networkLogView);
        this._fileSelectorElement =
            UI.UIUtils.createFileSelectorElement(this._networkLogView.onLoadFromFile.bind(this._networkLogView));
        panel.element.appendChild(this._fileSelectorElement);
        this._detailsWidget = new UI.Widget.VBox();
        this._detailsWidget.element.classList.add('network-details-view');
        this._splitWidget.setMainWidget(this._detailsWidget);
        this._closeButtonElement = document.createElement('div', { is: 'dt-close-button' });
        this._closeButtonElement.addEventListener('click', async () => {
            const action = UI.ActionRegistry.ActionRegistry.instance().action('network.hide-request-details');
            if (action) {
                await action.execute();
            }
        }, false);
        this._closeButtonElement.style.margin = '0 5px';
        this._networkLogShowOverviewSetting.addChangeListener(this._toggleShowOverview, this);
        this._networkLogLargeRowsSetting.addChangeListener(this._toggleLargerRequests, this);
        this._networkRecordFilmStripSetting.addChangeListener(this._toggleRecordFilmStrip, this);
        this._preserveLogSetting = Common.Settings.Settings.instance().moduleSetting('network_log.preserve-log');
        this._recordLogSetting = Common.Settings.Settings.instance().moduleSetting('network_log.record-log');
        this._recordLogSetting.addChangeListener(({ data }) => this._toggleRecord(data));
        this._throttlingSelect = this._createThrottlingConditionsSelect();
        this._setupToolbarButtons(splitWidget);
        this._toggleRecord(this._recordLogSetting.get());
        this._toggleShowOverview();
        this._toggleLargerRequests();
        this._toggleRecordFilmStrip();
        this._updateUI();
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.WillReloadPage, this._willReloadPage, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.Load, this._load, this);
        this._networkLogView.addEventListener(Events.RequestSelected, this._onRequestSelected, this);
        this._networkLogView.addEventListener(Events.RequestActivated, this._onRequestActivated, this);
        Logs.NetworkLog.NetworkLog.instance().addEventListener(Logs.NetworkLog.Events.RequestAdded, this._onUpdateRequest, this);
        Logs.NetworkLog.NetworkLog.instance().addEventListener(Logs.NetworkLog.Events.RequestUpdated, this._onUpdateRequest, this);
        Logs.NetworkLog.NetworkLog.instance().addEventListener(Logs.NetworkLog.Events.Reset, this._onNetworkLogReset, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!networkPanelInstance || forceNew) {
            networkPanelInstance = new NetworkPanel();
        }
        return networkPanelInstance;
    }
    static revealAndFilter(filters) {
        const panel = NetworkPanel._instance();
        let filterString = '';
        for (const filter of filters) {
            if (filter.filterType) {
                filterString += `${filter.filterType}:${filter.filterValue} `;
            }
            else {
                filterString += `${filter.filterValue} `;
            }
        }
        panel._networkLogView.setTextFilterValue(filterString);
        UI.ViewManager.ViewManager.instance().showView('network');
    }
    static async selectAndShowRequest(request, tab, options) {
        const panel = NetworkPanel._instance();
        await panel.selectAndActivateRequest(request, tab, options);
    }
    static _instance() {
        return NetworkPanel.instance();
    }
    throttlingSelectForTest() {
        return this._throttlingSelect;
    }
    _onWindowChanged(event) {
        const startTime = Math.max(this._calculator.minimumBoundary(), event.data.startTime / 1000);
        const endTime = Math.min(this._calculator.maximumBoundary(), event.data.endTime / 1000);
        this._networkLogView.setWindow(startTime, endTime);
    }
    async _searchToggleClick(_event) {
        const action = UI.ActionRegistry.ActionRegistry.instance().action('network.search');
        if (action) {
            await action.execute();
        }
    }
    _setupToolbarButtons(splitWidget) {
        const searchToggle = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.search), 'largeicon-search');
        function updateSidebarToggle() {
            const isSidebarShowing = splitWidget.showMode() !== UI.SplitWidget.ShowMode.OnlyMain;
            searchToggle.setToggled(isSidebarShowing);
            if (!isSidebarShowing) {
                searchToggle.element.focus();
            }
        }
        this._panelToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this._toggleRecordAction));
        const clearButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.clear), 'largeicon-clear');
        clearButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => Logs.NetworkLog.NetworkLog.instance().reset(true), this);
        this._panelToolbar.appendToolbarItem(clearButton);
        this._panelToolbar.appendSeparator();
        this._panelToolbar.appendToolbarItem(this._filterBar.filterButton());
        updateSidebarToggle();
        splitWidget.addEventListener(UI.SplitWidget.Events.ShowModeChanged, updateSidebarToggle);
        searchToggle.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, event => {
            this._searchToggleClick(event);
        });
        this._panelToolbar.appendToolbarItem(searchToggle);
        this._panelToolbar.appendSeparator();
        this._panelToolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._preserveLogSetting, i18nString(UIStrings.doNotClearLogOnPageReload), i18nString(UIStrings.preserveLog)));
        this._panelToolbar.appendSeparator();
        const disableCacheCheckbox = new UI.Toolbar.ToolbarSettingCheckbox(Common.Settings.Settings.instance().moduleSetting('cacheDisabled'), i18nString(UIStrings.disableCacheWhileDevtoolsIsOpen), i18nString(UIStrings.disableCache));
        this._panelToolbar.appendToolbarItem(disableCacheCheckbox);
        this._panelToolbar.appendToolbarItem(this._throttlingSelect);
        const networkConditionsIcon = new IconButton.Icon.Icon();
        networkConditionsIcon.data = {
            iconName: 'network_conditions_icon',
            color: 'rgb(110 110 110)',
            width: '18px',
            height: '18px',
        };
        const networkConditionsButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.moreNetworkConditions), networkConditionsIcon);
        networkConditionsButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => {
            UI.ViewManager.ViewManager.instance().showView('network.config');
        }, this);
        this._panelToolbar.appendToolbarItem(networkConditionsButton);
        this._rightToolbar.appendToolbarItem(new UI.Toolbar.ToolbarItem(this._progressBarContainer));
        this._rightToolbar.appendSeparator();
        this._rightToolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingToggle(this._showSettingsPaneSetting, 'largeicon-settings-gear', i18nString(UIStrings.networkSettings)));
        const settingsToolbarLeft = new UI.Toolbar.Toolbar('', this._settingsPane.element);
        settingsToolbarLeft.makeVertical();
        settingsToolbarLeft.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._networkLogLargeRowsSetting, i18nString(UIStrings.showMoreInformationInRequestRows), i18nString(UIStrings.useLargeRequestRows)));
        settingsToolbarLeft.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._networkLogShowOverviewSetting, i18nString(UIStrings.showOverviewOfNetworkRequests), i18nString(UIStrings.showOverview)));
        const settingsToolbarRight = new UI.Toolbar.Toolbar('', this._settingsPane.element);
        settingsToolbarRight.makeVertical();
        settingsToolbarRight.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(Common.Settings.Settings.instance().moduleSetting('network.group-by-frame'), i18nString(UIStrings.groupRequestsByTopLevelRequest), i18nString(UIStrings.groupByFrame)));
        settingsToolbarRight.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(this._networkRecordFilmStripSetting, i18nString(UIStrings.captureScreenshotsWhenLoadingA), i18nString(UIStrings.captureScreenshots)));
        this._panelToolbar.appendSeparator();
        const importHarButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.importHarFile), 'largeicon-load');
        importHarButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, () => this._fileSelectorElement.click(), this);
        this._panelToolbar.appendToolbarItem(importHarButton);
        const exportHarButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.exportHar), 'largeicon-download');
        exportHarButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, _event => {
            this._networkLogView.exportAll();
        }, this);
        this._panelToolbar.appendToolbarItem(exportHarButton);
    }
    _updateSettingsPaneVisibility() {
        this._settingsPane.element.classList.toggle('hidden', !this._showSettingsPaneSetting.get());
    }
    _createThrottlingConditionsSelect() {
        const toolbarItem = new UI.Toolbar.ToolbarComboBox(null, i18nString(UIStrings.throttling));
        toolbarItem.setMaxWidth(160);
        MobileThrottling.ThrottlingManager.throttlingManager().decorateSelectWithNetworkThrottling(toolbarItem.selectElement());
        return toolbarItem;
    }
    _toggleRecord(toggled) {
        this._toggleRecordAction.setToggled(toggled);
        if (this._recordLogSetting.get() !== toggled) {
            this._recordLogSetting.set(toggled);
        }
        this._networkLogView.setRecording(toggled);
        if (!toggled && this._filmStripRecorder) {
            this._filmStripRecorder.stopRecording(this._filmStripAvailable.bind(this));
        }
    }
    _filmStripAvailable(filmStripModel) {
        if (!filmStripModel) {
            return;
        }
        const calculator = this._networkLogView.timeCalculator();
        if (this._filmStripView) {
            this._filmStripView.setModel(filmStripModel, calculator.minimumBoundary() * 1000, calculator.boundarySpan() * 1000);
        }
        this._networkOverview.setFilmStripModel(filmStripModel);
        const timestamps = filmStripModel.frames().map(mapTimestamp);
        function mapTimestamp(frame) {
            return frame.timestamp / 1000;
        }
        this._networkLogView.addFilmStripFrames(timestamps);
    }
    _onNetworkLogReset(event) {
        const { clearIfPreserved } = event.data;
        BlockedURLsPane.reset();
        if (!this._preserveLogSetting.get() || clearIfPreserved) {
            this._calculator.reset();
            this._overviewPane.reset();
        }
        if (this._filmStripView) {
            this._resetFilmStripView();
        }
    }
    _willReloadPage(_event) {
        if (this._pendingStopTimer) {
            clearTimeout(this._pendingStopTimer);
            delete this._pendingStopTimer;
        }
        if (this.isShowing() && this._filmStripRecorder) {
            this._filmStripRecorder.startRecording();
        }
    }
    _load(_event) {
        if (this._filmStripRecorder && this._filmStripRecorder.isRecording()) {
            this._pendingStopTimer = window.setTimeout(this._stopFilmStripRecording.bind(this), displayScreenshotDelay);
        }
    }
    _stopFilmStripRecording() {
        if (this._filmStripRecorder) {
            this._filmStripRecorder.stopRecording(this._filmStripAvailable.bind(this));
        }
        delete this._pendingStopTimer;
    }
    _toggleLargerRequests() {
        this._updateUI();
    }
    _toggleShowOverview() {
        const toggled = this._networkLogShowOverviewSetting.get();
        if (toggled) {
            this._overviewPane.show(this._overviewPlaceholderElement);
        }
        else {
            this._overviewPane.detach();
        }
        this.doResize();
    }
    _toggleRecordFilmStrip() {
        const toggled = this._networkRecordFilmStripSetting.get();
        if (toggled && !this._filmStripRecorder) {
            this._filmStripView = new PerfUI.FilmStripView.FilmStripView();
            this._filmStripView.setMode(PerfUI.FilmStripView.Modes.FrameBased);
            this._filmStripView.element.classList.add('network-film-strip');
            this._filmStripRecorder = new FilmStripRecorder(this._networkLogView.timeCalculator(), this._filmStripView);
            this._filmStripView.show(this._filmStripPlaceholderElement);
            this._filmStripView.addEventListener(PerfUI.FilmStripView.Events.FrameSelected, this._onFilmFrameSelected, this);
            this._filmStripView.addEventListener(PerfUI.FilmStripView.Events.FrameEnter, this._onFilmFrameEnter, this);
            this._filmStripView.addEventListener(PerfUI.FilmStripView.Events.FrameExit, this._onFilmFrameExit, this);
            this._resetFilmStripView();
        }
        if (!toggled && this._filmStripRecorder) {
            if (this._filmStripView) {
                this._filmStripView.detach();
            }
            this._filmStripView = null;
            this._filmStripRecorder = null;
        }
    }
    _resetFilmStripView() {
        const reloadShortcut = UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction('inspector_main.reload')[0];
        if (this._filmStripView) {
            this._filmStripView.reset();
            if (reloadShortcut) {
                this._filmStripView.setStatusText(i18nString(UIStrings.hitSToReloadAndCaptureFilmstrip, { PH1: reloadShortcut.title() }));
            }
        }
    }
    elementsToRestoreScrollPositionsFor() {
        return this._networkLogView.elementsToRestoreScrollPositionsFor();
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(NetworkPanel, this);
        // Record the network tool load time after the panel has loaded.
        Host.userMetrics.panelLoaded('network', 'DevTools.Launch.Network');
    }
    willHide() {
        UI.Context.Context.instance().setFlavor(NetworkPanel, null);
    }
    revealAndHighlightRequest(request) {
        this._hideRequestPanel();
        if (request) {
            this._networkLogView.revealAndHighlightRequest(request);
        }
    }
    async selectAndActivateRequest(request, shownTab, options) {
        await UI.ViewManager.ViewManager.instance().showView('network');
        this._networkLogView.selectRequest(request, options);
        this._showRequestPanel(shownTab);
        return this._networkItemView;
    }
    _handleFilterChanged(_event) {
        this._hideRequestPanel();
    }
    _onRowSizeChanged(_event) {
        this._updateUI();
    }
    _onRequestSelected(event) {
        const request = event.data;
        this._currentRequest = request;
        this._networkOverview.setHighlightedRequest(request);
        this._updateNetworkItemView();
    }
    _onRequestActivated(event) {
        const eventData = event.data;
        if (eventData.showPanel) {
            this._showRequestPanel(eventData.tab, /* takeFocus */ eventData.takeFocus);
        }
        else {
            this._hideRequestPanel();
        }
    }
    _showRequestPanel(shownTab, takeFocus) {
        if (this._splitWidget.showMode() === UI.SplitWidget.ShowMode.Both && !shownTab && !takeFocus) {
            // If panel is already shown, and we are not forcing a specific tab, return.
            return;
        }
        this._clearNetworkItemView();
        if (this._currentRequest) {
            const networkItemView = this._createNetworkItemView(shownTab);
            if (networkItemView && takeFocus) {
                networkItemView.focus();
            }
        }
        this._updateUI();
    }
    _hideRequestPanel() {
        this._clearNetworkItemView();
        this._splitWidget.hideMain();
        this._updateUI();
    }
    _updateNetworkItemView() {
        if (this._splitWidget.showMode() === UI.SplitWidget.ShowMode.Both) {
            this._clearNetworkItemView();
            this._createNetworkItemView();
            this._updateUI();
        }
    }
    _clearNetworkItemView() {
        if (this._networkItemView) {
            this._networkItemView.detach();
            this._networkItemView = null;
        }
    }
    _createNetworkItemView(initialTab) {
        if (!this._currentRequest) {
            return;
        }
        this._networkItemView =
            new NetworkItemView(this._currentRequest, this._networkLogView.timeCalculator(), initialTab);
        this._networkItemView.leftToolbar().appendToolbarItem(new UI.Toolbar.ToolbarItem(this._closeButtonElement));
        this._networkItemView.show(this._detailsWidget.element);
        this._splitWidget.showBoth();
        return this._networkItemView;
    }
    _updateUI() {
        if (this._detailsWidget) {
            this._detailsWidget.element.classList.toggle('network-details-view-tall-header', this._networkLogLargeRowsSetting.get());
        }
        if (this._networkLogView) {
            this._networkLogView.switchViewMode(!this._splitWidget.isResizable());
        }
    }
    appendApplicableItems(event, contextMenu, target) {
        function reveal(request) {
            UI.ViewManager.ViewManager.instance()
                .showView('network')
                .then(this._networkLogView.resetFilter.bind(this._networkLogView))
                .then(this.revealAndHighlightRequest.bind(this, request));
        }
        function appendRevealItem(request) {
            contextMenu.revealSection().appendItem(i18nString(UIStrings.revealInNetworkPanel), reveal.bind(this, request));
        }
        if (event.target.isSelfOrDescendant(this.element)) {
            return;
        }
        if (target instanceof SDK.Resource.Resource) {
            const resource = target;
            if (resource.request) {
                appendRevealItem.call(this, resource.request);
            }
            return;
        }
        if (target instanceof Workspace.UISourceCode.UISourceCode) {
            const uiSourceCode = target;
            const resource = Bindings.ResourceUtils.resourceForURL(uiSourceCode.url());
            if (resource && resource.request) {
                appendRevealItem.call(this, resource.request);
            }
            return;
        }
        if (!(target instanceof SDK.NetworkRequest.NetworkRequest)) {
            return;
        }
        const request = target;
        if (this._networkItemView && this._networkItemView.isShowing() && this._networkItemView.request() === request) {
            return;
        }
        appendRevealItem.call(this, request);
    }
    _onFilmFrameSelected(event) {
        const timestamp = event.data;
        this._overviewPane.setWindowTimes(0, timestamp);
    }
    _onFilmFrameEnter(event) {
        const timestamp = event.data;
        this._networkOverview.selectFilmStripFrame(timestamp);
        this._networkLogView.selectFilmStripFrame(timestamp / 1000);
    }
    _onFilmFrameExit(_event) {
        this._networkOverview.clearFilmStripFrame();
        this._networkLogView.clearFilmStripFrame();
    }
    _onUpdateRequest(event) {
        const request = event.data;
        this._calculator.updateBoundaries(request);
        // FIXME: Unify all time units across the frontend!
        this._overviewPane.setBounds(this._calculator.minimumBoundary() * 1000, this._calculator.maximumBoundary() * 1000);
        this._networkOverview.updateRequest(request);
        this._overviewPane.scheduleUpdate();
    }
    resolveLocation(locationName) {
        if (locationName === 'network-sidebar') {
            return this._sidebarLocation;
        }
        return null;
    }
}
export const displayScreenshotDelay = 1000;
let contextMenuProviderInstance;
export class ContextMenuProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!contextMenuProviderInstance || forceNew) {
            contextMenuProviderInstance = new ContextMenuProvider();
        }
        return contextMenuProviderInstance;
    }
    appendApplicableItems(event, contextMenu, target) {
        NetworkPanel._instance().appendApplicableItems(event, contextMenu, target);
    }
}
let requestRevealerInstance;
export class RequestRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!requestRevealerInstance || forceNew) {
            requestRevealerInstance = new RequestRevealer();
        }
        return requestRevealerInstance;
    }
    reveal(request) {
        if (!(request instanceof SDK.NetworkRequest.NetworkRequest)) {
            return Promise.reject(new Error('Internal error: not a network request'));
        }
        const panel = NetworkPanel._instance();
        return UI.ViewManager.ViewManager.instance().showView('network').then(panel.revealAndHighlightRequest.bind(panel, request));
    }
}
export class FilmStripRecorder {
    _tracingManager;
    _resourceTreeModel;
    _timeCalculator;
    _filmStripView;
    _tracingModel;
    _callback;
    constructor(timeCalculator, filmStripView) {
        this._tracingManager = null;
        this._resourceTreeModel = null;
        this._timeCalculator = timeCalculator;
        this._filmStripView = filmStripView;
        this._tracingModel = null;
        this._callback = null;
    }
    traceEventsCollected(events) {
        if (this._tracingModel) {
            this._tracingModel.addEvents(events);
        }
    }
    tracingComplete() {
        if (!this._tracingModel || !this._tracingManager) {
            return;
        }
        this._tracingModel.tracingComplete();
        this._tracingManager = null;
        if (this._callback) {
            this._callback(new SDK.FilmStripModel.FilmStripModel(this._tracingModel, this._timeCalculator.minimumBoundary() * 1000));
        }
        this._callback = null;
        if (this._resourceTreeModel) {
            this._resourceTreeModel.resumeReload();
        }
        this._resourceTreeModel = null;
    }
    tracingBufferUsage() {
    }
    eventsRetrievalProgress(_progress) {
    }
    startRecording() {
        this._filmStripView.reset();
        this._filmStripView.setStatusText(i18nString(UIStrings.recordingFrames));
        const tracingManagers = SDK.TargetManager.TargetManager.instance().models(SDK.TracingManager.TracingManager);
        if (this._tracingManager || !tracingManagers.length) {
            return;
        }
        this._tracingManager = tracingManagers[0];
        if (!this._tracingManager) {
            return;
        }
        this._resourceTreeModel = this._tracingManager.target().model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (this._tracingModel) {
            this._tracingModel.dispose();
        }
        this._tracingModel = new SDK.TracingModel.TracingModel(new Bindings.TempFile.TempFileBackingStorage());
        this._tracingManager.start(this, '-*,disabled-by-default-devtools.screenshot', '');
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.FilmStripStartedRecording);
    }
    isRecording() {
        return Boolean(this._tracingManager);
    }
    stopRecording(callback) {
        if (!this._tracingManager) {
            return;
        }
        this._tracingManager.stop();
        if (this._resourceTreeModel) {
            this._resourceTreeModel.suspendReload();
        }
        this._callback = callback;
        this._filmStripView.setStatusText(i18nString(UIStrings.fetchingFrames));
    }
}
let networkActionDelegateInstance;
export class ActionDelegate {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!networkActionDelegateInstance || forceNew) {
            networkActionDelegateInstance = new ActionDelegate();
        }
        return networkActionDelegateInstance;
    }
    handleAction(context, actionId) {
        const panel = UI.Context.Context.instance().flavor(NetworkPanel);
        console.assert(Boolean(panel && panel instanceof NetworkPanel));
        if (!panel) {
            return false;
        }
        switch (actionId) {
            case 'network.toggle-recording': {
                panel._toggleRecord(!panel._recordLogSetting.get());
                return true;
            }
            case 'network.hide-request-details': {
                if (!panel._networkItemView) {
                    return false;
                }
                panel._hideRequestPanel();
                panel._networkLogView.resetFocus();
                return true;
            }
            case 'network.search': {
                const selection = UI.InspectorView.InspectorView.instance().element.window().getSelection();
                if (selection) {
                    let queryCandidate = '';
                    if (selection.rangeCount) {
                        queryCandidate = selection.toString().replace(/\r?\n.*/, '');
                    }
                    SearchNetworkView.openSearch(queryCandidate);
                    return true;
                }
            }
        }
        return false;
    }
}
let requestLocationRevealerInstance;
export class RequestLocationRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!requestLocationRevealerInstance || forceNew) {
            requestLocationRevealerInstance = new RequestLocationRevealer();
        }
        return requestLocationRevealerInstance;
    }
    async reveal(match) {
        const location = match;
        const view = await NetworkPanel._instance().selectAndActivateRequest(location.request);
        if (!view) {
            return;
        }
        if (location.searchMatch) {
            await view.revealResponseBody(location.searchMatch.lineNumber);
        }
        if (location.header) {
            view.revealHeader(location.header.section, location.header.header?.name);
        }
    }
}
let searchNetworkViewInstance;
export class SearchNetworkView extends Search.SearchView.SearchView {
    constructor() {
        super('network');
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!searchNetworkViewInstance || forceNew) {
            searchNetworkViewInstance = new SearchNetworkView();
        }
        return searchNetworkViewInstance;
    }
    static async openSearch(query, searchImmediately) {
        await UI.ViewManager.ViewManager.instance().showView('network.search-network-tab');
        const searchView = SearchNetworkView.instance();
        searchView.toggle(query, Boolean(searchImmediately));
        return searchView;
    }
    createScope() {
        return new NetworkSearchScope();
    }
}
//# sourceMappingURL=NetworkPanel.js.map