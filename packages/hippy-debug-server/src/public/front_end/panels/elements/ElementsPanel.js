// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008 Matt Lilek <webkit@mattlilek.com>
 * Copyright (C) 2009 Joseph Pecoraro
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
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AccessibilityTreeView } from './AccessibilityTreeView.js';
import * as ElementsComponents from './components/components.js';
import { ComputedStyleWidget } from './ComputedStyleWidget.js';
import { ElementsTreeElementHighlighter } from './ElementsTreeElementHighlighter.js';
import { ElementsTreeOutline } from './ElementsTreeOutline.js';
import { MetricsSidebarPane } from './MetricsSidebarPane.js';
import { StylesSidebarPane } from './StylesSidebarPane.js';
const UIStrings = {
    /**
    * @description Placeholder text for the search box the Elements Panel. Selector refers to CSS
    * selectors.
    */
    findByStringSelectorOrXpath: 'Find by string, selector, or `XPath`',
    /**
    * @description Button text for a button that takes the user to the Accessibility Tree View from the
    * DOM tree view, in the Elements panel.
    */
    switchToAccessibilityTreeView: 'Switch to Accessibility Tree view',
    /**
    * @description Button text for a button that takes the user to the DOM tree view from the
    * Accessibility Tree View, in the Elements panel.
    */
    switchToDomTreeView: 'Switch to DOM Tree view',
    /**
    * @description Label for a link to a rendering frame.
    */
    frame: 'Frame',
    /**
    * @description Tooltip for the the Computed Styles sidebar toggle in the Styles pane. Command to
    * open/show the sidebar.
    */
    showComputedStylesSidebar: 'Show Computed Styles sidebar',
    /**
    * @description Tooltip for the the Computed Styles sidebar toggle in the Styles pane. Command to
    * close/hide the sidebar.
    */
    hideComputedStylesSidebar: 'Hide Computed Styles sidebar',
    /**
    * @description Title of a pane in the Elements panel that shows computed styles for the selected
    * HTML element. Computed styles are the final, actual styles of the element, including all
    * implicit and specified styles.
    */
    computed: 'Computed',
    /**
    * @description Title of a pane in the Elements panel that shows the CSS styles for the selected
    * HTML element.
    */
    styles: 'Styles',
    /**
    * @description A context menu item to reveal a node in the DOM tree of the Elements Panel
    */
    revealInElementsPanel: 'Reveal in Elements panel',
    /**
    * @description Warning/error text displayed when a node cannot be found in the current page.
    */
    nodeCannotBeFoundInTheCurrent: 'Node cannot be found in the current page.',
    /**
    * @description Console warning when a user tries to reveal a non-node type Remote Object. A remote
    * object is a JavaScript object that is not stored in DevTools, that DevTools has a connection to.
    * It should correspond to a local node.
    */
    theRemoteObjectCouldNotBe: 'The remote object could not be resolved to a valid node.',
    /**
    * @description Console warning when the user tries to reveal a deferred DOM Node that resolves as
    * null. A deferred DOM node is a node we know about but have not yet fetched from the backend (we
    * defer the work until later).
    */
    theDeferredDomNodeCouldNotBe: 'The deferred `DOM` Node could not be resolved to a valid node.',
    /**
    * @description Text in Elements Panel of the Elements panel. Shows the current CSS Pseudo-classes
    * applicable to the selected HTML element.
    * @example {::after, ::before} PH1
    */
    elementStateS: 'Element state: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/ElementsPanel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const legacyNodeToNewBreadcrumbsNode = (node) => {
    return {
        parentNode: node.parentNode ? legacyNodeToNewBreadcrumbsNode(node.parentNode) : null,
        id: node.id,
        nodeType: node.nodeType(),
        pseudoType: node.pseudoType(),
        shadowRootType: node.shadowRootType(),
        nodeName: node.nodeName(),
        nodeNameNicelyCased: node.nodeNameInCorrectCase(),
        legacyDomNode: node,
        highlightNode: () => node.highlight(),
        clearHighlight: () => SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight(),
        getAttribute: node.getAttribute.bind(node),
    };
};
let elementsPanelInstance;
export class ElementsPanel extends UI.Panel.Panel {
    _splitWidget;
    _searchableView;
    _contentElement;
    _splitMode;
    _accessibilityTreeView;
    _breadcrumbs;
    _stylesWidget;
    _computedStyleWidget;
    _metricsWidget;
    _treeOutlines;
    _treeOutlineHeaders;
    _gridStyleTrackerByCSSModel;
    _searchResults;
    _currentSearchResultIndex;
    _pendingNodeReveal;
    _adornerManager;
    _adornerSettingsPane;
    _adornersByName;
    _accessibilityTreeButton;
    domTreeButton;
    _selectedNodeOnReset;
    _hasNonDefaultSelectedNode;
    _searchConfig;
    _omitDefaultSelection;
    _notFirstInspectElement;
    sidebarPaneView;
    _stylesViewToReveal;
    constructor() {
        super('elements');
        this.registerRequiredCSS('panels/elements/elementsPanel.css', { enableLegacyPatching: false });
        this._splitWidget = new UI.SplitWidget.SplitWidget(true, true, 'elementsPanelSplitViewState', 325, 325);
        this._splitWidget.addEventListener(UI.SplitWidget.Events.SidebarSizeChanged, this._updateTreeOutlineVisibleWidth.bind(this));
        this._splitWidget.show(this.element);
        this._searchableView = new UI.SearchableView.SearchableView(this, null);
        this._searchableView.setMinimumSize(25, 28);
        this._searchableView.setPlaceholder(i18nString(UIStrings.findByStringSelectorOrXpath));
        const stackElement = this._searchableView.element;
        this._contentElement = document.createElement('div');
        const crumbsContainer = document.createElement('div');
        if (Root.Runtime.experiments.isEnabled('fullAccessibilityTree')) {
            this._initializeFullAccessibilityTreeView(stackElement);
        }
        stackElement.appendChild(this._contentElement);
        stackElement.appendChild(crumbsContainer);
        this._splitWidget.setMainWidget(this._searchableView);
        this._splitMode = null;
        this._contentElement.id = 'elements-content';
        // FIXME: crbug.com/425984
        if (Common.Settings.Settings.instance().moduleSetting('domWordWrap').get()) {
            this._contentElement.classList.add('elements-wrap');
        }
        Common.Settings.Settings.instance()
            .moduleSetting('domWordWrap')
            .addChangeListener(this._domWordWrapSettingChanged.bind(this));
        crumbsContainer.id = 'elements-crumbs';
        if (this.domTreeButton) {
            this._accessibilityTreeView = new AccessibilityTreeView(this.domTreeButton);
        }
        this._breadcrumbs = new ElementsComponents.ElementsBreadcrumbs.ElementsBreadcrumbs();
        this._breadcrumbs.addEventListener('breadcrumbsnodeselected', (event) => {
            this._crumbNodeSelected(event);
        });
        crumbsContainer.appendChild(this._breadcrumbs);
        this._stylesWidget = StylesSidebarPane.instance();
        this._computedStyleWidget = new ComputedStyleWidget();
        this._metricsWidget = new MetricsSidebarPane();
        Common.Settings.Settings.instance()
            .moduleSetting('sidebarPosition')
            .addChangeListener(this._updateSidebarPosition.bind(this));
        this._updateSidebarPosition();
        this._treeOutlines = new Set();
        this._treeOutlineHeaders = new Map();
        this._gridStyleTrackerByCSSModel = new Map();
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DOMModel.DOMModel, this);
        SDK.TargetManager.TargetManager.instance().addEventListener(SDK.TargetManager.Events.NameChanged, event => this._targetNameChanged(event.data));
        Common.Settings.Settings.instance()
            .moduleSetting('showUAShadowDOM')
            .addChangeListener(this._showUAShadowDOMChanged.bind(this));
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DOMModel.DOMModel, SDK.DOMModel.Events.DocumentUpdated, this._documentUpdatedEvent, this);
        Extensions.ExtensionServer.ExtensionServer.instance().addEventListener(Extensions.ExtensionServer.Events.SidebarPaneAdded, this._extensionSidebarPaneAdded, this);
        this._currentSearchResultIndex = -1; // -1 represents the initial invalid state
        this._pendingNodeReveal = false;
        this._adornerManager = new ElementsComponents.AdornerManager.AdornerManager(Common.Settings.Settings.instance().moduleSetting('adornerSettings'));
        this._adornerSettingsPane = null;
        this._adornersByName = new Map();
    }
    _initializeFullAccessibilityTreeView(stackElement) {
        this._accessibilityTreeButton = document.createElement('button');
        this._accessibilityTreeButton.textContent = i18nString(UIStrings.switchToAccessibilityTreeView);
        this._accessibilityTreeButton.addEventListener('click', this._showAccessibilityTree.bind(this));
        this.domTreeButton = document.createElement('button');
        this.domTreeButton.textContent = i18nString(UIStrings.switchToDomTreeView);
        this.domTreeButton.addEventListener('click', this._showDOMTree.bind(this));
        stackElement.appendChild(this._accessibilityTreeButton);
    }
    _showAccessibilityTree() {
        if (this._accessibilityTreeView) {
            this._splitWidget.setMainWidget(this._accessibilityTreeView);
        }
    }
    _showDOMTree() {
        // TODO(meredithl): Scroll to inspected DOM node.
        this._splitWidget.setMainWidget(this._searchableView);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!elementsPanelInstance || forceNew) {
            elementsPanelInstance = new ElementsPanel();
        }
        return elementsPanelInstance;
    }
    _revealProperty(cssProperty) {
        if (!this.sidebarPaneView || !this._stylesViewToReveal) {
            return Promise.resolve();
        }
        return this.sidebarPaneView.showView(this._stylesViewToReveal).then(() => {
            this._stylesWidget.revealProperty(cssProperty);
        });
    }
    resolveLocation(_locationName) {
        return this.sidebarPaneView || null;
    }
    showToolbarPane(widget, toggle) {
        // TODO(luoe): remove this function once its providers have an alternative way to reveal their views.
        this._stylesWidget.showToolbarPane(widget, toggle);
    }
    modelAdded(domModel) {
        const parentModel = domModel.parentModel();
        // Different frames will have different DOMModels, we only want to add the accessibility model
        // for the top level frame, as the accessibility tree does not yet support exploring IFrames.
        if (!parentModel && this._accessibilityTreeView) {
            this._accessibilityTreeView.setAccessibilityModel(domModel.target().model(SDK.AccessibilityModel.AccessibilityModel));
        }
        let treeOutline = parentModel ? ElementsTreeOutline.forDOMModel(parentModel) : null;
        if (!treeOutline) {
            treeOutline = new ElementsTreeOutline(true, true);
            treeOutline.setWordWrap(Common.Settings.Settings.instance().moduleSetting('domWordWrap').get());
            treeOutline.addEventListener(ElementsTreeOutline.Events.SelectedNodeChanged, this._selectedNodeChanged, this);
            treeOutline.addEventListener(ElementsTreeOutline.Events.ElementsTreeUpdated, this._updateBreadcrumbIfNeeded, this);
            new ElementsTreeElementHighlighter(treeOutline);
            this._treeOutlines.add(treeOutline);
            if (domModel.target().parentTarget()) {
                const element = document.createElement('div');
                element.classList.add('elements-tree-header');
                this._treeOutlineHeaders.set(treeOutline, element);
                this._targetNameChanged(domModel.target());
            }
        }
        treeOutline.wireToDOMModel(domModel);
        this._setupStyleTracking(domModel.cssModel());
        // Perform attach if necessary.
        if (this.isShowing()) {
            this.wasShown();
        }
    }
    modelRemoved(domModel) {
        const treeOutline = ElementsTreeOutline.forDOMModel(domModel);
        if (!treeOutline) {
            return;
        }
        treeOutline.unwireFromDOMModel(domModel);
        if (domModel.parentModel()) {
            return;
        }
        this._treeOutlines.delete(treeOutline);
        const header = this._treeOutlineHeaders.get(treeOutline);
        if (header) {
            header.remove();
        }
        this._treeOutlineHeaders.delete(treeOutline);
        treeOutline.element.remove();
        this._removeStyleTracking(domModel.cssModel());
    }
    _targetNameChanged(target) {
        const domModel = target.model(SDK.DOMModel.DOMModel);
        if (!domModel) {
            return;
        }
        const treeOutline = ElementsTreeOutline.forDOMModel(domModel);
        if (!treeOutline) {
            return;
        }
        const header = this._treeOutlineHeaders.get(treeOutline);
        if (!header) {
            return;
        }
        header.removeChildren();
        header.createChild('div', 'elements-tree-header-frame').textContent = i18nString(UIStrings.frame);
        header.appendChild(Components.Linkifier.Linkifier.linkifyURL(target.inspectedURL(), { text: target.name() }));
    }
    _updateTreeOutlineVisibleWidth() {
        if (!this._treeOutlines.size) {
            return;
        }
        let width = this._splitWidget.element.offsetWidth;
        if (this._splitWidget.isVertical()) {
            width -= this._splitWidget.sidebarSize();
        }
        for (const treeOutline of this._treeOutlines) {
            treeOutline.setVisibleWidth(width);
        }
    }
    focus() {
        if (this._treeOutlines.size) {
            this._treeOutlines.values().next().value.focus();
        }
    }
    searchableView() {
        return this._searchableView;
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(ElementsPanel, this);
        for (const treeOutline of this._treeOutlines) {
            // Attach heavy component lazily
            if (treeOutline.element.parentElement !== this._contentElement) {
                const header = this._treeOutlineHeaders.get(treeOutline);
                if (header) {
                    this._contentElement.appendChild(header);
                }
                this._contentElement.appendChild(treeOutline.element);
            }
        }
        super.wasShown();
        const domModels = SDK.TargetManager.TargetManager.instance().models(SDK.DOMModel.DOMModel);
        for (const domModel of domModels) {
            if (domModel.parentModel()) {
                continue;
            }
            const treeOutline = ElementsTreeOutline.forDOMModel(domModel);
            if (!treeOutline) {
                continue;
            }
            treeOutline.setVisible(true);
            if (!treeOutline.rootDOMNode) {
                if (domModel.existingDocument()) {
                    treeOutline.rootDOMNode = domModel.existingDocument();
                    this._documentUpdated(domModel);
                }
                else {
                    domModel.requestDocument();
                }
            }
        }
    }
    willHide() {
        SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        for (const treeOutline of this._treeOutlines) {
            treeOutline.setVisible(false);
            // Detach heavy component on hide
            this._contentElement.removeChild(treeOutline.element);
            const header = this._treeOutlineHeaders.get(treeOutline);
            if (header) {
                this._contentElement.removeChild(header);
            }
        }
        super.willHide();
        UI.Context.Context.instance().setFlavor(ElementsPanel, null);
    }
    onResize() {
        this.element.window().requestAnimationFrame(this._updateSidebarPosition.bind(this)); // Do not force layout.
        this._updateTreeOutlineVisibleWidth();
    }
    _selectedNodeChanged(event) {
        let selectedNode = event.data.node;
        // If the selectedNode is a pseudoNode, we want to ensure that it has a valid parentNode
        if (selectedNode && (selectedNode.pseudoType() && !selectedNode.parentNode)) {
            selectedNode = null;
        }
        const focus = event.data.focus;
        for (const treeOutline of this._treeOutlines) {
            if (!selectedNode || ElementsTreeOutline.forDOMModel(selectedNode.domModel()) !== treeOutline) {
                treeOutline.selectDOMNode(null);
            }
        }
        if (selectedNode) {
            const activeNode = legacyNodeToNewBreadcrumbsNode(selectedNode);
            const crumbs = [activeNode];
            for (let current = selectedNode.parentNode; current; current = current.parentNode) {
                crumbs.push(legacyNodeToNewBreadcrumbsNode(current));
            }
            this._breadcrumbs.data = {
                crumbs,
                selectedNode: legacyNodeToNewBreadcrumbsNode(selectedNode),
            };
        }
        else {
            this._breadcrumbs.data = { crumbs: [], selectedNode: null };
        }
        UI.Context.Context.instance().setFlavor(SDK.DOMModel.DOMNode, selectedNode);
        if (!selectedNode) {
            return;
        }
        selectedNode.setAsInspectedNode();
        if (this._accessibilityTreeView) {
            this._accessibilityTreeView.selectedNodeChanged(selectedNode);
        }
        if (focus) {
            this._selectedNodeOnReset = selectedNode;
            this._hasNonDefaultSelectedNode = true;
        }
        const executionContexts = selectedNode.domModel().runtimeModel().executionContexts();
        const nodeFrameId = selectedNode.frameId();
        for (const context of executionContexts) {
            if (context.frameId === nodeFrameId) {
                UI.Context.Context.instance().setFlavor(SDK.RuntimeModel.ExecutionContext, context);
                break;
            }
        }
    }
    _documentUpdatedEvent(event) {
        const domModel = event.data;
        this._documentUpdated(domModel);
        this._removeStyleTracking(domModel.cssModel());
        this._setupStyleTracking(domModel.cssModel());
    }
    _documentUpdated(domModel) {
        this._searchableView.resetSearch();
        if (!domModel.existingDocument()) {
            if (this.isShowing()) {
                domModel.requestDocument();
            }
            return;
        }
        this._hasNonDefaultSelectedNode = false;
        if (this._omitDefaultSelection) {
            return;
        }
        const savedSelectedNodeOnReset = this._selectedNodeOnReset;
        restoreNode.call(this, domModel, this._selectedNodeOnReset || null);
        async function restoreNode(domModel, staleNode) {
            const nodePath = staleNode ? staleNode.path() : null;
            const restoredNodeId = nodePath ? await domModel.pushNodeByPathToFrontend(nodePath) : null;
            if (savedSelectedNodeOnReset !== this._selectedNodeOnReset) {
                return;
            }
            let node = restoredNodeId ? domModel.nodeForId(restoredNodeId) : null;
            if (!node) {
                const inspectedDocument = domModel.existingDocument();
                node = inspectedDocument ? inspectedDocument.body || inspectedDocument.documentElement : null;
            }
            // If `node` is null here, the document hasn't been transmitted from the backend yet
            // and isn't in a valid state to have a default-selected node. Another document update
            // should be forthcoming. In the meantime, don't set the default-selected node or notify
            // the test that it's ready, because it isn't.
            if (node) {
                this._setDefaultSelectedNode(node);
                this._lastSelectedNodeSelectedForTest();
            }
        }
    }
    _lastSelectedNodeSelectedForTest() {
    }
    _setDefaultSelectedNode(node) {
        if (!node || this._hasNonDefaultSelectedNode || this._pendingNodeReveal) {
            return;
        }
        const treeOutline = ElementsTreeOutline.forDOMModel(node.domModel());
        if (!treeOutline) {
            return;
        }
        this.selectDOMNode(node);
        if (treeOutline.selectedTreeElement) {
            treeOutline.selectedTreeElement.expand();
        }
    }
    searchCanceled() {
        this._searchConfig = undefined;
        this._hideSearchHighlights();
        this._searchableView.updateSearchMatchesCount(0);
        this._currentSearchResultIndex = -1;
        delete this._searchResults;
        SDK.DOMModel.DOMModel.cancelSearch();
    }
    performSearch(searchConfig, shouldJump, jumpBackwards) {
        const query = searchConfig.query;
        const whitespaceTrimmedQuery = query.trim();
        if (!whitespaceTrimmedQuery.length) {
            return;
        }
        if (!this._searchConfig || this._searchConfig.query !== query) {
            this.searchCanceled();
        }
        else {
            this._hideSearchHighlights();
        }
        this._searchConfig = searchConfig;
        const showUAShadowDOM = Common.Settings.Settings.instance().moduleSetting('showUAShadowDOM').get();
        const domModels = SDK.TargetManager.TargetManager.instance().models(SDK.DOMModel.DOMModel);
        const promises = domModels.map(domModel => domModel.performSearch(whitespaceTrimmedQuery, showUAShadowDOM));
        Promise.all(promises).then(resultCounts => {
            this._searchResults = [];
            for (let i = 0; i < resultCounts.length; ++i) {
                const resultCount = resultCounts[i];
                for (let j = 0; j < resultCount; ++j) {
                    this._searchResults.push({ domModel: domModels[i], index: j, node: undefined });
                }
            }
            this._searchableView.updateSearchMatchesCount(this._searchResults.length);
            if (!this._searchResults.length) {
                return;
            }
            if (this._currentSearchResultIndex >= this._searchResults.length) {
                this._currentSearchResultIndex = -1;
            }
            let index = this._currentSearchResultIndex;
            if (shouldJump) {
                if (this._currentSearchResultIndex === -1) {
                    index = jumpBackwards ? -1 : 0;
                }
                else {
                    index = jumpBackwards ? index - 1 : index + 1;
                }
                this._jumpToSearchResult(index);
            }
        });
    }
    _domWordWrapSettingChanged(event) {
        this._contentElement.classList.toggle('elements-wrap', event.data);
        for (const treeOutline of this._treeOutlines) {
            treeOutline.setWordWrap(event.data);
        }
    }
    switchToAndFocus(node) {
        // Reset search restore.
        this._searchableView.cancelSearch();
        UI.ViewManager.ViewManager.instance().showView('elements').then(() => this.selectDOMNode(node, true));
    }
    _jumpToSearchResult(index) {
        if (!this._searchResults) {
            return;
        }
        this._currentSearchResultIndex = (index + this._searchResults.length) % this._searchResults.length;
        this._highlightCurrentSearchResult();
    }
    jumpToNextSearchResult() {
        if (!this._searchResults || !this._searchConfig) {
            return;
        }
        this.performSearch(this._searchConfig, true);
    }
    jumpToPreviousSearchResult() {
        if (!this._searchResults || !this._searchConfig) {
            return;
        }
        this.performSearch(this._searchConfig, true, true);
    }
    supportsCaseSensitiveSearch() {
        return false;
    }
    supportsRegexSearch() {
        return false;
    }
    _highlightCurrentSearchResult() {
        const index = this._currentSearchResultIndex;
        const searchResults = this._searchResults;
        if (!searchResults) {
            return;
        }
        const searchResult = searchResults[index];
        this._searchableView.updateCurrentMatchIndex(index);
        if (searchResult.node === null) {
            return;
        }
        if (typeof searchResult.node === 'undefined') {
            // No data for slot, request it.
            searchResult.domModel.searchResult(searchResult.index).then(node => {
                searchResult.node = node;
                // If any of these properties are undefined or reset to an invalid value,
                // this means the search/highlight request is outdated.
                const highlightRequestValid = this._searchConfig && this._searchResults && (this._currentSearchResultIndex !== -1);
                if (highlightRequestValid) {
                    this._highlightCurrentSearchResult();
                }
            });
            return;
        }
        const treeElement = this._treeElementForNode(searchResult.node);
        searchResult.node.scrollIntoView();
        if (treeElement) {
            this._searchConfig && treeElement.highlightSearchResults(this._searchConfig.query);
            treeElement.reveal();
            const matches = treeElement.listItemElement.getElementsByClassName(UI.UIUtils.highlightedSearchResultClassName);
            if (matches.length) {
                matches[0].scrollIntoViewIfNeeded(false);
            }
        }
    }
    _hideSearchHighlights() {
        if (!this._searchResults || !this._searchResults.length || this._currentSearchResultIndex === -1) {
            return;
        }
        const searchResult = this._searchResults[this._currentSearchResultIndex];
        if (!searchResult.node) {
            return;
        }
        const treeElement = this._treeElementForNode(searchResult.node);
        if (treeElement) {
            treeElement.hideSearchHighlights();
        }
    }
    selectedDOMNode() {
        for (const treeOutline of this._treeOutlines) {
            if (treeOutline.selectedDOMNode()) {
                return treeOutline.selectedDOMNode();
            }
        }
        return null;
    }
    selectDOMNode(node, focus) {
        for (const treeOutline of this._treeOutlines) {
            const outline = ElementsTreeOutline.forDOMModel(node.domModel());
            if (outline === treeOutline) {
                treeOutline.selectDOMNode(node, focus);
            }
            else {
                treeOutline.selectDOMNode(null);
            }
        }
    }
    _updateBreadcrumbIfNeeded(event) {
        const nodes = event.data;
        /* If we don't have a selected node then we can tell the breadcrumbs that & bail. */
        const selectedNode = this.selectedDOMNode();
        if (!selectedNode) {
            this._breadcrumbs.data = {
                crumbs: [],
                selectedNode: null,
            };
            return;
        }
        /* This function gets called whenever the tree outline is updated
         * and contains any nodes that have changed.
         * What we need to do is construct the new set of breadcrumb nodes, combining the Nodes
         * that we had before with the new nodes, and pass them into the breadcrumbs component.
         */
        // Get the current set of active crumbs
        const activeNode = legacyNodeToNewBreadcrumbsNode(selectedNode);
        const existingCrumbs = [activeNode];
        for (let current = selectedNode.parentNode; current; current = current.parentNode) {
            existingCrumbs.push(legacyNodeToNewBreadcrumbsNode(current));
        }
        /* Get the change nodes from the event & convert them to breadcrumb nodes */
        const newNodes = nodes.map(legacyNodeToNewBreadcrumbsNode);
        const nodesThatHaveChangedMap = new Map();
        newNodes.forEach(crumb => nodesThatHaveChangedMap.set(crumb.id, crumb));
        /* Loop over our existing crumbs, and if any have an ID that matches an ID from the new nodes
         * that we have, use the new node, rather than the one we had, because it's changed.
         */
        const newSetOfCrumbs = existingCrumbs.map(crumb => {
            const replacement = nodesThatHaveChangedMap.get(crumb.id);
            return replacement || crumb;
        });
        this._breadcrumbs.data = {
            crumbs: newSetOfCrumbs,
            selectedNode: activeNode,
        };
    }
    _crumbNodeSelected(event) {
        const node = event.data;
        this.selectDOMNode(node, true);
    }
    _treeOutlineForNode(node) {
        if (!node) {
            return null;
        }
        return ElementsTreeOutline.forDOMModel(node.domModel());
    }
    _treeElementForNode(node) {
        const treeOutline = this._treeOutlineForNode(node);
        if (!treeOutline) {
            return null;
        }
        return /** @type {?ElementsTreeElement} */ treeOutline.findTreeElement(node);
    }
    _leaveUserAgentShadowDOM(node) {
        let userAgentShadowRoot;
        while ((userAgentShadowRoot = node.ancestorUserAgentShadowRoot()) && userAgentShadowRoot.parentNode) {
            node = userAgentShadowRoot.parentNode;
        }
        return node;
    }
    revealAndSelectNode(node, focus, omitHighlight) {
        this._omitDefaultSelection = true;
        node = Common.Settings.Settings.instance().moduleSetting('showUAShadowDOM').get() ?
            node :
            this._leaveUserAgentShadowDOM(node);
        if (!omitHighlight) {
            node.highlightForTwoSeconds();
        }
        return UI.ViewManager.ViewManager.instance().showView('elements', false, !focus).then(() => {
            this.selectDOMNode(node, focus);
            delete this._omitDefaultSelection;
            if (!this._notFirstInspectElement) {
                ElementsPanel._firstInspectElementNodeNameForTest = node.nodeName();
                ElementsPanel._firstInspectElementCompletedForTest();
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.inspectElementCompleted();
            }
            this._notFirstInspectElement = true;
        });
    }
    _showUAShadowDOMChanged() {
        for (const treeOutline of this._treeOutlines) {
            treeOutline.update();
        }
    }
    _setupTextSelectionHack(stylePaneWrapperElement) {
        // We "extend" the sidebar area when dragging, in order to keep smooth text
        // selection. It should be replaced by 'user-select: contain' in the future.
        const uninstallHackBound = uninstallHack.bind(this);
        // Fallback to cover unforeseen cases where text selection has ended.
        const uninstallHackOnMousemove = (event) => {
            if (event.buttons === 0) {
                uninstallHack.call(this);
            }
        };
        stylePaneWrapperElement.addEventListener('mousedown', (event) => {
            if (event.button !== 0) {
                return;
            }
            this._splitWidget.element.classList.add('disable-resizer-for-elements-hack');
            stylePaneWrapperElement.style.setProperty('height', `${stylePaneWrapperElement.offsetHeight}px`);
            const largeLength = 1000000;
            stylePaneWrapperElement.style.setProperty('left', `${-1 * largeLength}px`);
            stylePaneWrapperElement.style.setProperty('padding-left', `${largeLength}px`);
            stylePaneWrapperElement.style.setProperty('width', `calc(100% + ${largeLength}px)`);
            stylePaneWrapperElement.style.setProperty('position', 'fixed');
            stylePaneWrapperElement.window().addEventListener('blur', uninstallHackBound);
            stylePaneWrapperElement.window().addEventListener('contextmenu', uninstallHackBound, true);
            stylePaneWrapperElement.window().addEventListener('dragstart', uninstallHackBound, true);
            stylePaneWrapperElement.window().addEventListener('mousemove', uninstallHackOnMousemove, true);
            stylePaneWrapperElement.window().addEventListener('mouseup', uninstallHackBound, true);
            stylePaneWrapperElement.window().addEventListener('visibilitychange', uninstallHackBound);
        }, true);
        function uninstallHack() {
            this._splitWidget.element.classList.remove('disable-resizer-for-elements-hack');
            stylePaneWrapperElement.style.removeProperty('left');
            stylePaneWrapperElement.style.removeProperty('padding-left');
            stylePaneWrapperElement.style.removeProperty('width');
            stylePaneWrapperElement.style.removeProperty('position');
            stylePaneWrapperElement.window().removeEventListener('blur', uninstallHackBound);
            stylePaneWrapperElement.window().removeEventListener('contextmenu', uninstallHackBound, true);
            stylePaneWrapperElement.window().removeEventListener('dragstart', uninstallHackBound, true);
            stylePaneWrapperElement.window().removeEventListener('mousemove', uninstallHackOnMousemove, true);
            stylePaneWrapperElement.window().removeEventListener('mouseup', uninstallHackBound, true);
            stylePaneWrapperElement.window().removeEventListener('visibilitychange', uninstallHackBound);
        }
    }
    _initializeSidebarPanes(splitMode) {
        this._splitWidget.setVertical(splitMode === "Vertical" /* Vertical */);
        this.showToolbarPane(null /* widget */, null /* toggle */);
        const matchedStylePanesWrapper = new UI.Widget.VBox();
        matchedStylePanesWrapper.element.classList.add('style-panes-wrapper');
        this._stylesWidget.show(matchedStylePanesWrapper.element);
        this._setupTextSelectionHack(matchedStylePanesWrapper.element);
        const computedStylePanesWrapper = new UI.Widget.VBox();
        computedStylePanesWrapper.element.classList.add('style-panes-wrapper');
        this._computedStyleWidget.show(computedStylePanesWrapper.element);
        const stylesSplitWidget = new UI.SplitWidget.SplitWidget(true /* isVertical */, true /* secondIsSidebar */, 'elements.styles.sidebar.width', 100);
        stylesSplitWidget.setMainWidget(matchedStylePanesWrapper);
        stylesSplitWidget.hideSidebar();
        stylesSplitWidget.enableShowModeSaving();
        stylesSplitWidget.addEventListener(UI.SplitWidget.Events.ShowModeChanged, () => {
            showMetricsWidgetInStylesPane();
        });
        this._stylesWidget.addEventListener("InitialUpdateCompleted" /* InitialUpdateCompleted */, () => {
            this._stylesWidget.appendToolbarItem(stylesSplitWidget.createShowHideSidebarButton(i18nString(UIStrings.showComputedStylesSidebar), i18nString(UIStrings.hideComputedStylesSidebar)));
        });
        const showMetricsWidgetInComputedPane = () => {
            this._metricsWidget.show(computedStylePanesWrapper.element, this._computedStyleWidget.element);
            this._metricsWidget.toggleVisibility(true /* visible */);
            this._stylesWidget.removeEventListener("StylesUpdateCompleted" /* StylesUpdateCompleted */, toggleMetricsWidget);
        };
        const showMetricsWidgetInStylesPane = () => {
            const showMergedComputedPane = stylesSplitWidget.showMode() === UI.SplitWidget.ShowMode.Both;
            if (showMergedComputedPane) {
                showMetricsWidgetInComputedPane();
            }
            else {
                this._metricsWidget.show(matchedStylePanesWrapper.element);
                if (!this._stylesWidget.hasMatchedStyles) {
                    this._metricsWidget.toggleVisibility(false /* invisible */);
                }
                this._stylesWidget.addEventListener("StylesUpdateCompleted" /* StylesUpdateCompleted */, toggleMetricsWidget);
            }
        };
        let skippedInitialTabSelectedEvent = false;
        const toggleMetricsWidget = (event) => {
            this._metricsWidget.toggleVisibility(event.data.hasMatchedStyles);
        };
        const tabSelected = (event) => {
            const tabId = event.data.tabId;
            if (tabId === i18nString(UIStrings.computed)) {
                computedStylePanesWrapper.show(computedView.element);
                showMetricsWidgetInComputedPane();
            }
            else if (tabId === i18nString(UIStrings.styles)) {
                stylesSplitWidget.setSidebarWidget(computedStylePanesWrapper);
                showMetricsWidgetInStylesPane();
            }
            if (skippedInitialTabSelectedEvent) {
                // We don't log the initially selected sidebar pane to UMA because
                // it will skew the histogram heavily toward the Styles pane
                Host.userMetrics.sidebarPaneShown(tabId);
            }
            else {
                skippedInitialTabSelectedEvent = true;
            }
        };
        this.sidebarPaneView = UI.ViewManager.ViewManager.instance().createTabbedLocation(() => UI.ViewManager.ViewManager.instance().showView('elements'));
        const tabbedPane = this.sidebarPaneView.tabbedPane();
        if (this._splitMode !== "Vertical" /* Vertical */) {
            this._splitWidget.installResizer(tabbedPane.headerElement());
        }
        const stylesView = new UI.View.SimpleView(i18nString(UIStrings.styles));
        this.sidebarPaneView.appendView(stylesView);
        stylesView.element.classList.add('flex-auto');
        stylesSplitWidget.show(stylesView.element);
        const computedView = new UI.View.SimpleView(i18nString(UIStrings.computed));
        computedView.element.classList.add('composite', 'fill');
        tabbedPane.addEventListener(UI.TabbedPane.Events.TabSelected, tabSelected, this);
        this.sidebarPaneView.appendView(computedView);
        this._stylesViewToReveal = stylesView;
        this.sidebarPaneView.appendApplicableItems('elements-sidebar');
        const extensionSidebarPanes = Extensions.ExtensionServer.ExtensionServer.instance().sidebarPanes();
        for (let i = 0; i < extensionSidebarPanes.length; ++i) {
            this._addExtensionSidebarPane(extensionSidebarPanes[i]);
        }
        this._splitWidget.setSidebarWidget(this.sidebarPaneView.tabbedPane());
    }
    _updateSidebarPosition() {
        if (this.sidebarPaneView && this.sidebarPaneView.tabbedPane().shouldHideOnDetach()) {
            return;
        } // We can't reparent extension iframes.
        const position = Common.Settings.Settings.instance().moduleSetting('sidebarPosition').get();
        let splitMode = "Horizontal" /* Horizontal */;
        if (position === 'right' ||
            (position === 'auto' && UI.InspectorView.InspectorView.instance().element.offsetWidth > 680)) {
            splitMode = "Vertical" /* Vertical */;
        }
        if (!this.sidebarPaneView) {
            this._initializeSidebarPanes(splitMode);
            return;
        }
        if (splitMode === this._splitMode) {
            return;
        }
        this._splitMode = splitMode;
        const tabbedPane = this.sidebarPaneView.tabbedPane();
        this._splitWidget.uninstallResizer(tabbedPane.headerElement());
        this._splitWidget.setVertical(this._splitMode === "Vertical" /* Vertical */);
        this.showToolbarPane(null /* widget */, null /* toggle */);
        if (this._splitMode !== "Vertical" /* Vertical */) {
            this._splitWidget.installResizer(tabbedPane.headerElement());
        }
    }
    _extensionSidebarPaneAdded(event) {
        const pane = event.data;
        this._addExtensionSidebarPane(pane);
    }
    _addExtensionSidebarPane(pane) {
        if (this.sidebarPaneView && pane.panelName() === this.name) {
            this.sidebarPaneView.appendView(pane);
        }
    }
    getComputedStyleWidget() {
        return this._computedStyleWidget;
    }
    _setupStyleTracking(cssModel) {
        const gridStyleTracker = cssModel.createCSSPropertyTracker(TrackedCSSGridProperties);
        gridStyleTracker.start();
        this._gridStyleTrackerByCSSModel.set(cssModel, gridStyleTracker);
        gridStyleTracker.addEventListener(SDK.CSSModel.CSSPropertyTrackerEvents.TrackedCSSPropertiesUpdated, this._trackedCSSPropertiesUpdated, this);
    }
    _removeStyleTracking(cssModel) {
        const gridStyleTracker = this._gridStyleTrackerByCSSModel.get(cssModel);
        if (!gridStyleTracker) {
            return;
        }
        gridStyleTracker.stop();
        this._gridStyleTrackerByCSSModel.delete(cssModel);
        gridStyleTracker.removeEventListener(SDK.CSSModel.CSSPropertyTrackerEvents.TrackedCSSPropertiesUpdated, this._trackedCSSPropertiesUpdated, this);
    }
    _trackedCSSPropertiesUpdated(event) {
        const domNodes = event.data.domNodes;
        for (const domNode of domNodes) {
            if (!domNode) {
                continue;
            }
            const treeElement = this._treeElementForNode(domNode);
            if (treeElement) {
                treeElement.updateStyleAdorners();
            }
        }
    }
    showAdornerSettingsPane() {
        // Delay the initialization of the pane to the first showing
        // since usually this pane won't be used.
        if (!this._adornerSettingsPane) {
            this._adornerSettingsPane = new ElementsComponents.AdornerSettingsPane.AdornerSettingsPane();
            this._adornerSettingsPane.addEventListener('adornersettingupdated', (event) => {
                const { adornerName, isEnabledNow, newSettings } = event.data;
                const adornersToUpdate = this._adornersByName.get(adornerName);
                if (adornersToUpdate) {
                    for (const adorner of adornersToUpdate) {
                        isEnabledNow ? adorner.show() : adorner.hide();
                    }
                }
                this._adornerManager.updateSettings(newSettings);
            });
            this._searchableView.element.prepend(this._adornerSettingsPane);
        }
        const adornerSettings = this._adornerManager.getSettings();
        this._adornerSettingsPane.data = {
            settings: adornerSettings,
        };
        this._adornerSettingsPane.show();
    }
    isAdornerEnabled(adornerText) {
        return this._adornerManager.isAdornerEnabled(adornerText);
    }
    registerAdorner(adorner) {
        let adornerSet = this._adornersByName.get(adorner.name);
        if (!adornerSet) {
            adornerSet = new Set();
            this._adornersByName.set(adorner.name, adornerSet);
        }
        adornerSet.add(adorner);
        if (!this.isAdornerEnabled(adorner.name)) {
            adorner.hide();
        }
    }
    deregisterAdorner(adorner) {
        const adornerSet = this._adornersByName.get(adorner.name);
        if (!adornerSet) {
            return;
        }
        adornerSet.delete(adorner);
    }
    static _firstInspectElementCompletedForTest = function () { };
    static _firstInspectElementNodeNameForTest = '';
}
// @ts-ignore exported for Tests.js
globalThis.Elements = globalThis.Elements || {};
// @ts-ignore exported for Tests.js
globalThis.Elements.ElementsPanel = ElementsPanel;
const TrackedCSSGridProperties = [
    {
        name: 'display',
        value: 'grid',
    },
    {
        name: 'display',
        value: 'inline-grid',
    },
    {
        name: 'display',
        value: 'flex',
    },
    {
        name: 'display',
        value: 'inline-flex',
    },
];
let contextMenuProviderInstance;
export class ContextMenuProvider {
    appendApplicableItems(event, contextMenu, object) {
        if (!(object instanceof SDK.RemoteObject.RemoteObject && object.isNode()) &&
            !(object instanceof SDK.DOMModel.DOMNode) && !(object instanceof SDK.DOMModel.DeferredDOMNode)) {
            return;
        }
        if (ElementsPanel.instance().element.isAncestor(event.target)) {
            return;
        }
        const commandCallback = Common.Revealer.reveal.bind(Common.Revealer.Revealer, object);
        contextMenu.revealSection().appendItem(i18nString(UIStrings.revealInElementsPanel), commandCallback);
    }
    static instance() {
        if (!contextMenuProviderInstance) {
            contextMenuProviderInstance = new ContextMenuProvider();
        }
        return contextMenuProviderInstance;
    }
}
let dOMNodeRevealerInstance;
export class DOMNodeRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!dOMNodeRevealerInstance || forceNew) {
            dOMNodeRevealerInstance = new DOMNodeRevealer();
        }
        return dOMNodeRevealerInstance;
    }
    reveal(node, omitFocus) {
        const panel = ElementsPanel.instance();
        panel._pendingNodeReveal = true;
        return new Promise(revealPromise);
        function revealPromise(resolve, reject) {
            if (node instanceof SDK.DOMModel.DOMNode) {
                onNodeResolved(node);
            }
            else if (node instanceof SDK.DOMModel.DeferredDOMNode) {
                node.resolve(checkDeferredDOMNodeThenReveal);
            }
            else if (node instanceof SDK.RemoteObject.RemoteObject) {
                const domModel = 
                /** @type {!SDK.RemoteObject.RemoteObject} */ node
                    .runtimeModel()
                    .target()
                    .model(SDK.DOMModel.DOMModel);
                if (domModel) {
                    domModel.pushObjectAsNodeToFrontend(node).then(checkRemoteObjectThenReveal);
                }
                else {
                    reject(new Error('Could not resolve a node to reveal.'));
                }
            }
            else {
                reject(new Error('Can\'t reveal a non-node.'));
                panel._pendingNodeReveal = false;
            }
            function onNodeResolved(resolvedNode) {
                panel._pendingNodeReveal = false;
                // A detached node could still have a parent and ownerDocument
                // properties, which means stepping up through the hierarchy to ensure
                // that the root node is the document itself. Any break implies
                // detachment.
                let currentNode = resolvedNode;
                while (currentNode.parentNode) {
                    currentNode = currentNode.parentNode;
                }
                const isDetached = !(currentNode instanceof SDK.DOMModel.DOMDocument);
                const isDocument = node instanceof SDK.DOMModel.DOMDocument;
                if (!isDocument && isDetached) {
                    const msg = i18nString(UIStrings.nodeCannotBeFoundInTheCurrent);
                    Common.Console.Console.instance().warn(msg);
                    reject(new Error(msg));
                    return;
                }
                if (resolvedNode) {
                    panel.revealAndSelectNode(resolvedNode, !omitFocus).then(resolve);
                    return;
                }
                reject(new Error('Could not resolve node to reveal.'));
            }
            function checkRemoteObjectThenReveal(resolvedNode) {
                if (!resolvedNode) {
                    const msg = i18nString(UIStrings.theRemoteObjectCouldNotBe);
                    Common.Console.Console.instance().warn(msg);
                    reject(new Error(msg));
                    return;
                }
                onNodeResolved(resolvedNode);
            }
            function checkDeferredDOMNodeThenReveal(resolvedNode) {
                if (!resolvedNode) {
                    const msg = i18nString(UIStrings.theDeferredDomNodeCouldNotBe);
                    Common.Console.Console.instance().warn(msg);
                    reject(new Error(msg));
                    return;
                }
                onNodeResolved(resolvedNode);
            }
        }
    }
}
let cSSPropertyRevealerInstance;
export class CSSPropertyRevealer {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!cSSPropertyRevealerInstance || forceNew) {
            cSSPropertyRevealerInstance = new CSSPropertyRevealer();
        }
        return cSSPropertyRevealerInstance;
    }
    reveal(property) {
        const panel = ElementsPanel.instance();
        return panel._revealProperty(property);
    }
}
let elementsActionDelegateInstance;
export class ElementsActionDelegate {
    handleAction(context, actionId) {
        const node = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (!node) {
            return true;
        }
        const treeOutline = ElementsTreeOutline.forDOMModel(node.domModel());
        if (!treeOutline) {
            return true;
        }
        switch (actionId) {
            case 'elements.hide-element':
                treeOutline.toggleHideElement(node);
                return true;
            case 'elements.edit-as-html':
                treeOutline.toggleEditAsHTML(node);
                return true;
            case 'elements.duplicate-element':
                treeOutline.duplicateNode(node);
                return true;
            case 'elements.copy-styles':
                treeOutline.findTreeElement(node)?._copyStyles();
                return true;
            case 'elements.undo':
                SDK.DOMModel.DOMModelUndoStack.instance().undo();
                ElementsPanel.instance()._stylesWidget.forceUpdate();
                return true;
            case 'elements.redo':
                SDK.DOMModel.DOMModelUndoStack.instance().redo();
                ElementsPanel.instance()._stylesWidget.forceUpdate();
                return true;
        }
        return false;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!elementsActionDelegateInstance || forceNew) {
            elementsActionDelegateInstance = new ElementsActionDelegate();
        }
        return elementsActionDelegateInstance;
    }
}
let pseudoStateMarkerDecoratorInstance;
export class PseudoStateMarkerDecorator {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!pseudoStateMarkerDecoratorInstance || forceNew) {
            pseudoStateMarkerDecoratorInstance = new PseudoStateMarkerDecorator();
        }
        return pseudoStateMarkerDecoratorInstance;
    }
    decorate(node) {
        const pseudoState = node.domModel().cssModel().pseudoState(node);
        if (!pseudoState) {
            return null;
        }
        return { color: 'orange', title: i18nString(UIStrings.elementStateS, { PH1: ':' + pseudoState.join(', :') }) };
    }
}
//# sourceMappingURL=ElementsPanel.js.map