// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { BottomUpProfileDataGridTree } from './BottomUpProfileDataGrid.js';
import { CPUProfileFlameChart } from './CPUProfileFlameChart.js';
import { ProfileDataGridTree } from './ProfileDataGrid.js';
import { Events, ProfileHeader } from './ProfileHeader.js';
import { ProfileSidebarTreeElement } from './ProfileSidebarTreeElement.js';
import { TopDownProfileDataGridTree } from './TopDownProfileDataGrid.js';
const UIStrings = {
    /**
    *@description Text in Profile View of a profiler tool
    */
    profile: 'Profile',
    /**
    *@description Placeholder text in the search box of the JavaScript profiler tool. Users can search
    *the results by the cost in milliseconds, the name of the function, or the file name.
    */
    findByCostMsNameOrFile: 'Find by cost (>50ms), name or file',
    /**
    *@description Text for a programming function
    */
    function: 'Function',
    /**
    *@description Title of the Profiler tool
    */
    profiler: 'Profiler',
    /**
    *@description Aria-label for profiles view combobox in memory tool
    */
    profileViewMode: 'Profile view mode',
    /**
    *@description Tooltip text that appears when hovering over the largeicon visibility button in the Profile View of a profiler tool
    */
    focusSelectedFunction: 'Focus selected function',
    /**
    *@description Tooltip text that appears when hovering over the largeicon delete button in the Profile View of a profiler tool
    */
    excludeSelectedFunction: 'Exclude selected function',
    /**
    *@description Tooltip text that appears when hovering over the largeicon refresh button in the Profile View of a profiler tool
    */
    restoreAllFunctions: 'Restore all functions',
    /**
    *@description Text in Profile View of a profiler tool
    */
    chart: 'Chart',
    /**
    *@description Text in Profile View of a profiler tool
    */
    heavyBottomUp: 'Heavy (Bottom Up)',
    /**
    *@description Text for selecting different profile views in the JS profiler tool. This option is a tree view.
    */
    treeTopDown: 'Tree (Top Down)',
    /**
    * @description Name of a profile
    * @example {2} PH1
    */
    profileD: 'Profile {PH1}',
    /**
     *@description Text in Profile View of a profiler tool
    *@example {4 MB} PH1
    */
    loadingD: 'Loading… {PH1}%',
    /**
    *@description Text in Profile View of a profiler tool
    *@example {example.file} PH1
    *@example {cannot open file} PH2
    */
    fileSReadErrorS: 'File \'{PH1}\' read error: {PH2}',
    /**
    *@description Text when something is loading
    */
    loading: 'Loading…',
    /**
    *@description Text in Profile View of a profiler tool
    */
    failedToReadFile: 'Failed to read file',
    /**
    *@description Text in Profile View of a profiler tool
    */
    parsing: 'Parsing…',
    /**
    * @description Status indicator in the JS Profiler to show that a file has been successfully loaded
    * from file, as opposed to a profile that has been captured locally.
    */
    loaded: 'Loaded',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/ProfileView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ProfileView extends UI.View.SimpleView {
    _profile;
    _searchableView;
    dataGrid;
    viewSelectComboBox;
    focusButton;
    excludeButton;
    resetButton;
    _linkifier;
    _nodeFormatter;
    _viewType;
    adjustedTotal;
    profileHeader;
    _bottomUpProfileDataGridTree;
    _topDownProfileDataGridTree;
    _currentSearchResultIndex;
    _dataProvider;
    _flameChart;
    _visibleView;
    _searchableElement;
    profileDataGridTree;
    constructor() {
        super(i18nString(UIStrings.profile));
        this._profile = null;
        this._searchableView = new UI.SearchableView.SearchableView(this, null);
        this._searchableView.setPlaceholder(i18nString(UIStrings.findByCostMsNameOrFile));
        this._searchableView.show(this.element);
        const columns = [];
        columns.push({
            id: 'self',
            title: this.columnHeader('self'),
            width: '120px',
            fixedWidth: true,
            sortable: true,
            sort: DataGrid.DataGrid.Order.Descending,
            titleDOMFragment: undefined,
            align: undefined,
            editable: undefined,
            nonSelectable: undefined,
            longText: undefined,
            disclosure: undefined,
            weight: undefined,
            allowInSortByEvenWhenHidden: undefined,
            dataType: undefined,
            defaultWeight: undefined,
        });
        columns.push({
            id: 'total',
            title: this.columnHeader('total'),
            width: '120px',
            fixedWidth: true,
            sortable: true,
            sort: undefined,
            titleDOMFragment: undefined,
            align: undefined,
            editable: undefined,
            nonSelectable: undefined,
            longText: undefined,
            disclosure: undefined,
            weight: undefined,
            allowInSortByEvenWhenHidden: undefined,
            dataType: undefined,
            defaultWeight: undefined,
        });
        columns.push({
            id: 'function',
            title: i18nString(UIStrings.function),
            disclosure: true,
            sortable: true,
            sort: undefined,
            titleDOMFragment: undefined,
            align: undefined,
            editable: undefined,
            nonSelectable: undefined,
            longText: undefined,
            weight: undefined,
            allowInSortByEvenWhenHidden: undefined,
            dataType: undefined,
            defaultWeight: undefined,
            width: undefined,
            fixedWidth: undefined,
        });
        this.dataGrid = new DataGrid.DataGrid.DataGridImpl({
            displayName: i18nString(UIStrings.profiler),
            columns,
            editCallback: undefined,
            deleteCallback: undefined,
            refreshCallback: undefined,
        });
        this.dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged, this._sortProfile, this);
        this.dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode, this._nodeSelected.bind(this, true));
        this.dataGrid.addEventListener(DataGrid.DataGrid.Events.DeselectedNode, this._nodeSelected.bind(this, false));
        this.dataGrid.setRowContextMenuCallback(this._populateContextMenu.bind(this));
        this.viewSelectComboBox =
            new UI.Toolbar.ToolbarComboBox(this._changeView.bind(this), i18nString(UIStrings.profileViewMode));
        this.focusButton =
            new UI.Toolbar.ToolbarButton(i18nString(UIStrings.focusSelectedFunction), 'largeicon-visibility');
        this.focusButton.setEnabled(false);
        this.focusButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._focusClicked, this);
        this.excludeButton =
            new UI.Toolbar.ToolbarButton(i18nString(UIStrings.excludeSelectedFunction), 'largeicon-delete');
        this.excludeButton.setEnabled(false);
        this.excludeButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._excludeClicked, this);
        this.resetButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.restoreAllFunctions), 'largeicon-refresh');
        this.resetButton.setEnabled(false);
        this.resetButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._resetClicked, this);
        this._linkifier = new Components.Linkifier.Linkifier(maxLinkLength);
    }
    static buildPopoverTable(entryInfo) {
        const table = document.createElement('table');
        for (const entry of entryInfo) {
            const row = table.createChild('tr');
            row.createChild('td').textContent = entry.title;
            row.createChild('td').textContent = entry.value;
        }
        return table;
    }
    setProfile(profile) {
        this._profile = profile;
        this._bottomUpProfileDataGridTree = null;
        this._topDownProfileDataGridTree = null;
        this._changeView();
        this.refresh();
    }
    profile() {
        return this._profile;
    }
    initialize(nodeFormatter) {
        this._nodeFormatter = nodeFormatter;
        this._viewType = Common.Settings.Settings.instance().createSetting('profileView', "Heavy" /* Heavy */);
        const viewTypes = ["Flame" /* Flame */, "Heavy" /* Heavy */, "Tree" /* Tree */];
        const optionNames = new Map([
            ["Flame" /* Flame */, i18nString(UIStrings.chart)],
            ["Heavy" /* Heavy */, i18nString(UIStrings.heavyBottomUp)],
            ["Tree" /* Tree */, i18nString(UIStrings.treeTopDown)],
        ]);
        const options = new Map(viewTypes.map(type => [type, this.viewSelectComboBox.createOption(optionNames.get(type), type)]));
        const optionName = this._viewType.get() || viewTypes[0];
        const option = options.get(optionName) || options.get(viewTypes[0]);
        this.viewSelectComboBox.select(option);
        this._changeView();
        if (this._flameChart) {
            this._flameChart.update();
        }
    }
    focus() {
        if (this._flameChart) {
            this._flameChart.focus();
        }
        else {
            super.focus();
        }
    }
    columnHeader(_columnId) {
        throw 'Not implemented';
    }
    selectRange(timeLeft, timeRight) {
        if (!this._flameChart) {
            return;
        }
        this._flameChart.selectRange(timeLeft, timeRight);
    }
    async toolbarItems() {
        return [this.viewSelectComboBox, this.focusButton, this.excludeButton, this.resetButton];
    }
    _getBottomUpProfileDataGridTree() {
        if (!this._bottomUpProfileDataGridTree) {
            this._bottomUpProfileDataGridTree = new BottomUpProfileDataGridTree(this._nodeFormatter, this._searchableView, this._profile.root, this.adjustedTotal);
        }
        return this._bottomUpProfileDataGridTree;
    }
    _getTopDownProfileDataGridTree() {
        if (!this._topDownProfileDataGridTree) {
            this._topDownProfileDataGridTree = new TopDownProfileDataGridTree(this._nodeFormatter, this._searchableView, this._profile.root, this.adjustedTotal);
        }
        return this._topDownProfileDataGridTree;
    }
    _populateContextMenu(contextMenu, gridNode) {
        const node = gridNode;
        if (node.linkElement && !contextMenu.containsTarget(node.linkElement)) {
            contextMenu.appendApplicableItems(node.linkElement);
        }
    }
    willHide() {
        this._currentSearchResultIndex = -1;
    }
    refresh() {
        if (!this.profileDataGridTree) {
            return;
        }
        const selectedProfileNode = this.dataGrid.selectedNode ? this.dataGrid.selectedNode.profileNode : null;
        this.dataGrid.rootNode().removeChildren();
        const children = this.profileDataGridTree.children;
        const count = children.length;
        for (let index = 0; index < count; ++index) {
            this.dataGrid.rootNode().appendChild(children[index]);
        }
        if (selectedProfileNode) {
            // TODO(crbug.com/1011811): Cleanup the added `selected` property to this SDK class.
            // @ts-ignore
            selectedProfileNode.selected = true;
        }
    }
    refreshVisibleData() {
        let child = this.dataGrid.rootNode().children[0];
        while (child) {
            child.refresh();
            child = child.traverseNextNode(false, null, true);
        }
    }
    searchableView() {
        return this._searchableView;
    }
    supportsCaseSensitiveSearch() {
        return true;
    }
    supportsRegexSearch() {
        return false;
    }
    searchCanceled() {
        if (this._searchableElement) {
            this._searchableElement.searchCanceled();
        }
    }
    performSearch(searchConfig, shouldJump, jumpBackwards) {
        if (this._searchableElement) {
            this._searchableElement.performSearch(searchConfig, shouldJump, jumpBackwards);
        }
    }
    jumpToNextSearchResult() {
        if (this._searchableElement) {
            this._searchableElement.jumpToNextSearchResult();
        }
    }
    jumpToPreviousSearchResult() {
        if (this._searchableElement) {
            this._searchableElement.jumpToPreviousSearchResult();
        }
    }
    linkifier() {
        return this._linkifier;
    }
    createFlameChartDataProvider() {
        throw 'Not implemented';
    }
    _ensureFlameChartCreated() {
        if (this._flameChart) {
            return;
        }
        this._dataProvider = this.createFlameChartDataProvider();
        this._flameChart = new CPUProfileFlameChart(this._searchableView, this._dataProvider);
        this._flameChart.addEventListener(PerfUI.FlameChart.Events.EntryInvoked, event => {
            this._onEntryInvoked(event);
        });
    }
    async _onEntryInvoked(event) {
        if (!this._dataProvider) {
            return;
        }
        const entryIndex = event.data;
        const node = this._dataProvider.entryNodes[entryIndex];
        const debuggerModel = this.profileHeader._debuggerModel;
        if (!node || !node.scriptId || !debuggerModel) {
            return;
        }
        const script = debuggerModel.scriptForId(node.scriptId);
        if (!script) {
            return;
        }
        const location = debuggerModel.createRawLocation(script, node.lineNumber, node.columnNumber);
        const uiLocation = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(location);
        Common.Revealer.reveal(uiLocation);
    }
    _changeView() {
        if (!this._profile) {
            return;
        }
        this._searchableView.closeSearch();
        if (this._visibleView) {
            this._visibleView.detach();
        }
        this._viewType.set(this.viewSelectComboBox.selectedOption().value);
        switch (this._viewType.get()) {
            case "Flame" /* Flame */:
                this._ensureFlameChartCreated();
                this._visibleView = this._flameChart;
                this._searchableElement = this._flameChart;
                break;
            case "Tree" /* Tree */:
                this.profileDataGridTree = this._getTopDownProfileDataGridTree();
                this._sortProfile();
                this._visibleView = this.dataGrid.asWidget();
                this._searchableElement = this.profileDataGridTree;
                break;
            case "Heavy" /* Heavy */:
                this.profileDataGridTree = this._getBottomUpProfileDataGridTree();
                this._sortProfile();
                this._visibleView = this.dataGrid.asWidget();
                this._searchableElement = this.profileDataGridTree;
                break;
        }
        const isFlame = this._viewType.get() === "Flame" /* Flame */;
        this.focusButton.setVisible(!isFlame);
        this.excludeButton.setVisible(!isFlame);
        this.resetButton.setVisible(!isFlame);
        if (this._visibleView) {
            this._visibleView.show(this._searchableView.element);
        }
    }
    _nodeSelected(selected) {
        this.focusButton.setEnabled(selected);
        this.excludeButton.setEnabled(selected);
    }
    _focusClicked(_event) {
        if (!this.dataGrid.selectedNode) {
            return;
        }
        this.resetButton.setEnabled(true);
        this.resetButton.element.focus();
        if (this.profileDataGridTree) {
            this.profileDataGridTree.focus(this.dataGrid.selectedNode);
        }
        this.refresh();
        this.refreshVisibleData();
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.CpuProfileNodeFocused);
    }
    _excludeClicked(_event) {
        const selectedNode = this.dataGrid.selectedNode;
        if (!selectedNode) {
            return;
        }
        this.resetButton.setEnabled(true);
        this.resetButton.element.focus();
        selectedNode.deselect();
        if (this.profileDataGridTree) {
            this.profileDataGridTree.exclude(selectedNode);
        }
        this.refresh();
        this.refreshVisibleData();
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.CpuProfileNodeExcluded);
    }
    _resetClicked(_event) {
        this.viewSelectComboBox.selectElement().focus();
        this.resetButton.setEnabled(false);
        if (this.profileDataGridTree) {
            this.profileDataGridTree.restore();
        }
        this._linkifier.reset();
        this.refresh();
        this.refreshVisibleData();
    }
    _sortProfile() {
        if (!this.profileDataGridTree) {
            return;
        }
        const sortAscending = this.dataGrid.isSortOrderAscending();
        const sortColumnId = this.dataGrid.sortColumnId();
        const sortProperty = sortColumnId === 'function' ? 'functionName' : sortColumnId || '';
        this.profileDataGridTree.sort(ProfileDataGridTree.propertyComparator(sortProperty, sortAscending), false);
        this.refresh();
    }
}
export const maxLinkLength = 30;
export class WritableProfileHeader extends ProfileHeader {
    _debuggerModel;
    _fileName;
    _jsonifiedProfile;
    _profile;
    _protocolProfile;
    constructor(debuggerModel, type, title) {
        super(type, title || i18nString(UIStrings.profileD, { PH1: type.nextProfileUid() }));
        this._debuggerModel = debuggerModel;
    }
    _onChunkTransferred(_reader) {
        if (this._jsonifiedProfile) {
            // TODO(l10n): Is the '%' at the end of this string correct? 4MB% looks wrong
            this.updateStatus(i18nString(UIStrings.loadingD, { PH1: Platform.NumberUtilities.bytesToString(this._jsonifiedProfile.length) }));
        }
    }
    _onError(reader) {
        const error = reader.error();
        if (error) {
            this.updateStatus(i18nString(UIStrings.fileSReadErrorS, { PH1: reader.fileName(), PH2: error.message }));
        }
    }
    async write(text) {
        this._jsonifiedProfile += text;
    }
    async close() {
    }
    dispose() {
        this.removeTempFile();
    }
    createSidebarTreeElement(panel) {
        return new ProfileSidebarTreeElement(panel, this, 'profile-sidebar-tree-item');
    }
    canSaveToFile() {
        return !this.fromFile() && Boolean(this._protocolProfile);
    }
    async saveToFile() {
        const fileOutputStream = new Bindings.FileUtils.FileOutputStream();
        if (!this._fileName) {
            const now = Platform.DateUtilities.toISO8601Compact(new Date());
            const fileExtension = this.profileType().fileExtension();
            this._fileName = `${this.profileType().typeName()}-${now}${fileExtension}`;
        }
        const accepted = await fileOutputStream.open(this._fileName);
        if (!accepted || !this.tempFile) {
            return;
        }
        const data = await this.tempFile.read();
        if (data) {
            await fileOutputStream.write(data);
        }
        fileOutputStream.close();
    }
    async loadFromFile(file) {
        this.updateStatus(i18nString(UIStrings.loading), true);
        const fileReader = new Bindings.FileUtils.ChunkedFileReader(file, 10000000, this._onChunkTransferred.bind(this));
        this._jsonifiedProfile = '';
        const success = await fileReader.read(this);
        if (!success) {
            this._onError(fileReader);
            return new Error(i18nString(UIStrings.failedToReadFile));
        }
        this.updateStatus(i18nString(UIStrings.parsing), true);
        let error = null;
        try {
            this._profile = JSON.parse(this._jsonifiedProfile);
            this.setProfile(this._profile);
            this.updateStatus(i18nString(UIStrings.loaded), false);
        }
        catch (e) {
            error = e;
            this.profileType().removeProfile(this);
        }
        this._jsonifiedProfile = null;
        if (this.profileType().profileBeingRecorded() === this) {
            this.profileType().setProfileBeingRecorded(null);
        }
        return error;
    }
    setProtocolProfile(profile) {
        this.setProfile(profile);
        this._protocolProfile = profile;
        this.tempFile = new Bindings.TempFile.TempFile();
        this.tempFile.write([JSON.stringify(profile)]);
        if (this.canSaveToFile()) {
            this.dispatchEventToListeners(Events.ProfileReceived);
        }
    }
}
//# sourceMappingURL=ProfileView.js.map