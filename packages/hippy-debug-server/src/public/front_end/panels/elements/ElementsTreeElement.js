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
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js'; // eslint-disable-line no-unused-vars
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Emulation from '../emulation/emulation.js';
import * as ElementsComponents from './components/components.js';
import { canGetJSPath, cssPath, jsPath, xPath } from './DOMPath.js';
import { ElementsPanel } from './ElementsPanel.js';
import { MappedCharToEntity } from './ElementsTreeOutline.js'; // eslint-disable-line no-unused-vars
import { ImagePreviewPopover } from './ImagePreviewPopover.js';
import { getRegisteredDecorators } from './MarkerDecorator.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Title for Ad adorner. This iframe is marked as advertisement frame.
    */
    thisFrameWasIdentifiedAsAnAd: 'This frame was identified as an ad frame',
    /**
    *@description A context menu item in the Elements panel. Force is used as a verb, indicating intention to make the state change.
    */
    forceState: 'Force state',
    /**
    *@description Hint element title in Elements Tree Element of the Elements panel
    *@example {0} PH1
    */
    useSInTheConsoleToReferToThis: 'Use {PH1} in the console to refer to this element.',
    /**
    *@description A context menu item in the Elements Tree Element of the Elements panel
    */
    addAttribute: 'Add attribute',
    /**
    *@description Text to modify the attribute of an item
    */
    editAttribute: 'Edit attribute',
    /**
    *@description Text to focus on something
    */
    focus: 'Focus',
    /**
    *@description Text to scroll the displayed content into view
    */
    scrollIntoView: 'Scroll into view',
    /**
    *@description A context menu item in the Elements Tree Element of the Elements panel
    */
    editText: 'Edit text',
    /**
    *@description A context menu item in the Elements Tree Element of the Elements panel
    */
    editAsHtml: 'Edit as HTML',
    /**
    *@description Text for copying
    */
    copy: 'Copy',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copyOuterhtml: 'Copy outerHTML',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copySelector: 'Copy `selector`',
    /**
    *@description Text in Elements Tree Element of the Elements panel
    */
    copyJsPath: 'Copy JS path',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copyStyles: 'Copy styles',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copyXpath: 'Copy XPath',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copyFullXpath: 'Copy full XPath',
    /**
    *@description Text in Elements Tree Element of the Elements panel
    */
    cutElement: 'Cut element',
    /**
    *@description Text in Elements Tree Element of the Elements panel, copy should be used as a verb
    */
    copyElement: 'Copy element',
    /**
    *@description Text in Elements Tree Element of the Elements panel
    */
    pasteElement: 'Paste element',
    /**
    *@description A context menu item in the Elements Tree Element of the Elements panel
    */
    duplicateElement: 'Duplicate element',
    /**
    *@description Text to hide an element
    */
    hideElement: 'Hide element',
    /**
    *@description A context menu item in the Elements Tree Element of the Elements panel
    */
    deleteElement: 'Delete element',
    /**
    *@description Text to expand something recursively
    */
    expandRecursively: 'Expand recursively',
    /**
    *@description Text to collapse children of a parent group
    */
    collapseChildren: 'Collapse children',
    /**
    *@description Title of an action in the emulation tool to capture node screenshot
    */
    captureNodeScreenshot: 'Capture node screenshot',
    /**
    *@description Title of a context menu item. When clicked DevTools goes to the Application panel and shows this specific iframe's details
    */
    showFrameDetails: 'Show `iframe` details',
    /**
    *@description Text in Elements Tree Element of the Elements panel
    */
    valueIsTooLargeToEdit: '<value is too large to edit>',
    /**
    *@description Element text content in Elements Tree Element of the Elements panel
    */
    children: 'Children:',
    /**
    *@description ARIA label for Elements Tree adorners
    */
    enableGridMode: 'Enable grid mode',
    /**
    *@description ARIA label for Elements Tree adorners
    */
    disableGridMode: 'Disable grid mode',
    /**
    *@description Label of the adorner for flex elements in the Elements panel
    */
    enableFlexMode: 'Enable flex mode',
    /**
    *@description Label of the adorner for flex elements in the Elements panel
    */
    disableFlexMode: 'Disable flex mode',
    /**
    *@description Label of an adorner in the Elements panel. When clicked, it enables
    * the overlay showing CSS scroll snapping for the current element.
    */
    enableScrollSnap: 'Enable scroll-snap overlay',
    /**
    *@description Label of an adorner in the Elements panel. When clicked, it disables
    * the overlay showing CSS scroll snapping for the current element.
    */
    disableScrollSnap: 'Disable scroll-snap overlay',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/ElementsTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ElementsTreeElement extends UI.TreeOutline.TreeElement {
    _node;
    treeOutline;
    _gutterContainer;
    _decorationsElement;
    _isClosingTag;
    _canAddAttributes;
    _searchQuery;
    _expandedChildrenLimit;
    _decorationsThrottler;
    _inClipboard;
    _hovered;
    _editing;
    _highlightResult;
    _adornerContainer;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // @ts-expect-error
    _adorners;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // @ts-expect-error
    _styleAdorners;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // @ts-expect-error
    _adornersThrottler;
    _htmlEditElement;
    expandAllButtonElement;
    _searchHighlightsVisible;
    selectionElement;
    _hintElement;
    constructor(node, isClosingTag) {
        // The title will be updated in onattach.
        super();
        this._node = node;
        this.treeOutline = null;
        this._gutterContainer = this.listItemElement.createChild('div', 'gutter-container');
        this._gutterContainer.addEventListener('click', this._showContextMenu.bind(this));
        const gutterMenuIcon = UI.Icon.Icon.create('largeicon-menu', 'gutter-menu-icon');
        this._gutterContainer.appendChild(gutterMenuIcon);
        this._decorationsElement = this._gutterContainer.createChild('div', 'hidden');
        this._isClosingTag = isClosingTag;
        if (this._node.nodeType() === Node.ELEMENT_NODE && !isClosingTag) {
            this._canAddAttributes = true;
        }
        this._searchQuery = null;
        this._expandedChildrenLimit = InitialChildrenLimit;
        this._decorationsThrottler = new Common.Throttler.Throttler(100);
        this._inClipboard = false;
        this._hovered = false;
        this._editing = null;
        this._highlightResult = [];
        if (!isClosingTag) {
            this._adornerContainer = this.listItemElement.createChild('div', 'adorner-container hidden');
            this._adorners = [];
            this._styleAdorners = [];
            this._adornersThrottler = new Common.Throttler.Throttler(100);
            this.updateStyleAdorners();
            if (node.isAdFrameNode()) {
                const adorner = this.adorn(ElementsComponents.AdornerManager.AdornerRegistry.AD);
                UI.Tooltip.Tooltip.install(adorner, i18nString(UIStrings.thisFrameWasIdentifiedAsAnAd));
            }
        }
        this.expandAllButtonElement = null;
    }
    static animateOnDOMUpdate(treeElement) {
        const tagName = treeElement.listItemElement.querySelector('.webkit-html-tag-name');
        UI.UIUtils.runCSSAnimationOnce(tagName || treeElement.listItemElement, 'dom-update-highlight');
    }
    static visibleShadowRoots(node) {
        let roots = node.shadowRoots();
        if (roots.length && !Common.Settings.Settings.instance().moduleSetting('showUAShadowDOM').get()) {
            roots = roots.filter(filter);
        }
        function filter(root) {
            return root.shadowRootType() !== SDK.DOMModel.DOMNode.ShadowRootTypes.UserAgent;
        }
        return roots;
    }
    static canShowInlineText(node) {
        if (node.contentDocument() || node.templateContent() || ElementsTreeElement.visibleShadowRoots(node).length ||
            node.hasPseudoElements()) {
            return false;
        }
        if (node.nodeType() !== Node.ELEMENT_NODE) {
            return false;
        }
        if (!node.firstChild || node.firstChild !== node.lastChild || node.firstChild.nodeType() !== Node.TEXT_NODE) {
            return false;
        }
        const textChild = node.firstChild;
        const maxInlineTextChildLength = 80;
        if (textChild.nodeValue().length < maxInlineTextChildLength) {
            return true;
        }
        return false;
    }
    static populateForcedPseudoStateItems(contextMenu, node) {
        const pseudoClasses = ['active', 'hover', 'focus', 'visited', 'focus-within', 'focus-visible'];
        const forcedPseudoState = node.domModel().cssModel().pseudoState(node);
        const stateMenu = contextMenu.debugSection().appendSubMenuItem(i18nString(UIStrings.forceState));
        for (const pseudoClass of pseudoClasses) {
            const pseudoClassForced = forcedPseudoState ? forcedPseudoState.indexOf(pseudoClass) >= 0 : false;
            stateMenu.defaultSection().appendCheckboxItem(':' + pseudoClass, setPseudoStateCallback.bind(null, pseudoClass, !pseudoClassForced), pseudoClassForced, false);
        }
        function setPseudoStateCallback(pseudoState, enabled) {
            node.domModel().cssModel().forcePseudoState(node, pseudoState, enabled);
        }
    }
    isClosingTag() {
        return Boolean(this._isClosingTag);
    }
    node() {
        return this._node;
    }
    isEditing() {
        return Boolean(this._editing);
    }
    highlightSearchResults(searchQuery) {
        if (this._searchQuery !== searchQuery) {
            this._hideSearchHighlight();
        }
        this._searchQuery = searchQuery;
        this._searchHighlightsVisible = true;
        this.updateTitle(null, true);
    }
    hideSearchHighlights() {
        delete this._searchHighlightsVisible;
        this._hideSearchHighlight();
    }
    _hideSearchHighlight() {
        if (this._highlightResult.length === 0) {
            return;
        }
        for (let i = (this._highlightResult.length - 1); i >= 0; --i) {
            const entry = this._highlightResult[i];
            switch (entry.type) {
                case 'added':
                    entry.node.remove();
                    break;
                case 'changed':
                    entry.node.textContent = entry.oldText || null;
                    break;
            }
        }
        this._highlightResult = [];
    }
    setInClipboard(inClipboard) {
        if (this._inClipboard === inClipboard) {
            return;
        }
        this._inClipboard = inClipboard;
        this.listItemElement.classList.toggle('in-clipboard', inClipboard);
    }
    get hovered() {
        return this._hovered;
    }
    set hovered(isHovered) {
        if (this._hovered === isHovered) {
            return;
        }
        this._hovered = isHovered;
        if (this.listItemElement) {
            if (isHovered) {
                this._createSelection();
                this.listItemElement.classList.add('hovered');
            }
            else {
                this.listItemElement.classList.remove('hovered');
            }
        }
    }
    expandedChildrenLimit() {
        return this._expandedChildrenLimit;
    }
    setExpandedChildrenLimit(expandedChildrenLimit) {
        this._expandedChildrenLimit = expandedChildrenLimit;
    }
    _createSelection() {
        const listItemElement = this.listItemElement;
        if (!listItemElement) {
            return;
        }
        if (!this.selectionElement) {
            this.selectionElement = document.createElement('div');
            this.selectionElement.className = 'selection fill';
            this.selectionElement.style.setProperty('margin-left', (-this._computeLeftIndent()) + 'px');
            listItemElement.insertBefore(this.selectionElement, listItemElement.firstChild);
        }
    }
    _createHint() {
        if (this.listItemElement && !this._hintElement) {
            this._hintElement = this.listItemElement.createChild('span', 'selected-hint');
            const selectedElementCommand = '$0';
            UI.Tooltip.Tooltip.install(this._hintElement, i18nString(UIStrings.useSInTheConsoleToReferToThis, { PH1: selectedElementCommand }));
            UI.ARIAUtils.markAsHidden(this._hintElement);
        }
    }
    onbind() {
        if (this.treeOutline && !this._isClosingTag) {
            this.treeOutline.treeElementByNode.set(this._node, this);
        }
    }
    onunbind() {
        if (this._editing) {
            this._editing.cancel();
        }
        if (this.treeOutline && this.treeOutline.treeElementByNode.get(this._node) === this) {
            this.treeOutline.treeElementByNode.delete(this._node);
        }
    }
    onattach() {
        if (this._hovered) {
            this._createSelection();
            this.listItemElement.classList.add('hovered');
        }
        this.updateTitle();
        this.listItemElement.draggable = true;
    }
    async onpopulate() {
        if (this.treeOutline) {
            return this.treeOutline.populateTreeElement(this);
        }
    }
    async expandRecursively() {
        await this._node.getSubtree(-1, true);
        await super.expandRecursively(Number.MAX_VALUE);
    }
    onexpand() {
        if (this._isClosingTag) {
            return;
        }
        this.updateTitle();
    }
    oncollapse() {
        if (this._isClosingTag) {
            return;
        }
        this.updateTitle();
    }
    select(omitFocus, selectedByUser) {
        if (this._editing) {
            return false;
        }
        return super.select(omitFocus, selectedByUser);
    }
    onselect(selectedByUser) {
        if (!this.treeOutline) {
            return false;
        }
        this.treeOutline.suppressRevealAndSelect = true;
        this.treeOutline.selectDOMNode(this._node, selectedByUser);
        if (selectedByUser) {
            this._node.highlight();
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.ChangeInspectedNodeInElementsPanel);
        }
        this._createSelection();
        this._createHint();
        this.treeOutline.suppressRevealAndSelect = false;
        return true;
    }
    ondelete() {
        if (!this.treeOutline) {
            return false;
        }
        const startTagTreeElement = this.treeOutline.findTreeElement(this._node);
        startTagTreeElement ? startTagTreeElement.remove() : this.remove();
        return true;
    }
    onenter() {
        // On Enter or Return start editing the first attribute
        // or create a new attribute on the selected element.
        if (this._editing) {
            return false;
        }
        this._startEditing();
        // prevent a newline from being immediately inserted
        return true;
    }
    selectOnMouseDown(event) {
        super.selectOnMouseDown(event);
        if (this._editing) {
            return;
        }
        // Prevent selecting the nearest word on double click.
        if (event.detail >= 2) {
            event.preventDefault();
        }
    }
    ondblclick(event) {
        if (this._editing || this._isClosingTag) {
            return false;
        }
        if (this._startEditingTarget(event.target)) {
            return false;
        }
        if (this.isExpandable() && !this.expanded) {
            this.expand();
        }
        return false;
    }
    hasEditableNode() {
        return !this._node.isShadowRoot() && !this._node.ancestorUserAgentShadowRoot();
    }
    _insertInLastAttributePosition(tag, node) {
        if (tag.getElementsByClassName('webkit-html-attribute').length > 0) {
            tag.insertBefore(node, tag.lastChild);
        }
        else if (tag.textContent !== null) {
            const matchResult = tag.textContent.match(/^<(.*?)>$/);
            if (!matchResult) {
                return;
            }
            const nodeName = matchResult[1];
            tag.textContent = '';
            UI.UIUtils.createTextChild(tag, '<' + nodeName);
            tag.appendChild(node);
            UI.UIUtils.createTextChild(tag, '>');
        }
    }
    _startEditingTarget(eventTarget) {
        if (!this.treeOutline || this.treeOutline.selectedDOMNode() !== this._node) {
            return false;
        }
        if (this._node.nodeType() !== Node.ELEMENT_NODE && this._node.nodeType() !== Node.TEXT_NODE) {
            return false;
        }
        const textNode = eventTarget.enclosingNodeOrSelfWithClass('webkit-html-text-node');
        if (textNode) {
            return this._startEditingTextNode(textNode);
        }
        const attribute = eventTarget.enclosingNodeOrSelfWithClass('webkit-html-attribute');
        if (attribute) {
            return this._startEditingAttribute(attribute, eventTarget);
        }
        const tagName = eventTarget.enclosingNodeOrSelfWithClass('webkit-html-tag-name');
        if (tagName) {
            return this._startEditingTagName(tagName);
        }
        const newAttribute = eventTarget.enclosingNodeOrSelfWithClass('add-attribute');
        if (newAttribute) {
            return this._addNewAttribute();
        }
        return false;
    }
    _showContextMenu(event) {
        this.treeOutline && this.treeOutline.showContextMenu(this, event);
    }
    populateTagContextMenu(contextMenu, event) {
        // Add attribute-related actions.
        const treeElement = this._isClosingTag && this.treeOutline ? this.treeOutline.findTreeElement(this._node) : this;
        if (!treeElement) {
            return;
        }
        contextMenu.editSection().appendItem(i18nString(UIStrings.addAttribute), treeElement._addNewAttribute.bind(treeElement));
        const target = event.target;
        const attribute = target.enclosingNodeOrSelfWithClass('webkit-html-attribute');
        const newAttribute = target.enclosingNodeOrSelfWithClass('add-attribute');
        if (attribute && !newAttribute) {
            contextMenu.editSection().appendItem(i18nString(UIStrings.editAttribute), this._startEditingAttribute.bind(this, attribute, target));
        }
        this.populateNodeContextMenu(contextMenu);
        ElementsTreeElement.populateForcedPseudoStateItems(contextMenu, treeElement.node());
        this.populateScrollIntoView(contextMenu);
        contextMenu.viewSection().appendItem(i18nString(UIStrings.focus), async () => {
            await this._node.focus();
        });
    }
    populateScrollIntoView(contextMenu) {
        contextMenu.viewSection().appendItem(i18nString(UIStrings.scrollIntoView), () => this._node.scrollIntoView());
    }
    populateTextContextMenu(contextMenu, textNode) {
        if (!this._editing) {
            contextMenu.editSection().appendItem(i18nString(UIStrings.editText), this._startEditingTextNode.bind(this, textNode));
        }
        this.populateNodeContextMenu(contextMenu);
    }
    populateNodeContextMenu(contextMenu) {
        // Add free-form node-related actions.
        const isEditable = this.hasEditableNode();
        if (isEditable && !this._editing) {
            contextMenu.editSection().appendItem(i18nString(UIStrings.editAsHtml), this._editAsHTML.bind(this));
        }
        const isShadowRoot = this._node.isShadowRoot();
        // Place it here so that all "Copy"-ing items stick together.
        const copyMenu = contextMenu.clipboardSection().appendSubMenuItem(i18nString(UIStrings.copy));
        const createShortcut = UI.KeyboardShortcut.KeyboardShortcut.shortcutToString.bind(null);
        const modifier = UI.KeyboardShortcut.Modifiers.CtrlOrMeta;
        const treeOutline = this.treeOutline;
        if (!treeOutline) {
            return;
        }
        let menuItem;
        const section = copyMenu.section();
        if (!isShadowRoot) {
            menuItem = section.appendItem(i18nString(UIStrings.copyOuterhtml), treeOutline.performCopyOrCut.bind(treeOutline, false, this._node));
            menuItem.setShortcut(createShortcut('V', modifier));
        }
        if (this._node.nodeType() === Node.ELEMENT_NODE) {
            section.appendItem(i18nString(UIStrings.copySelector), this._copyCSSPath.bind(this));
            section.appendItem(i18nString(UIStrings.copyJsPath), this._copyJSPath.bind(this), !canGetJSPath(this._node));
            section.appendItem(i18nString(UIStrings.copyStyles), this._copyStyles.bind(this));
        }
        if (!isShadowRoot) {
            section.appendItem(i18nString(UIStrings.copyXpath), this._copyXPath.bind(this));
            section.appendItem(i18nString(UIStrings.copyFullXpath), this._copyFullXPath.bind(this));
        }
        if (!isShadowRoot) {
            menuItem = copyMenu.clipboardSection().appendItem(i18nString(UIStrings.cutElement), treeOutline.performCopyOrCut.bind(treeOutline, true, this._node), !this.hasEditableNode());
            menuItem.setShortcut(createShortcut('X', modifier));
            menuItem = copyMenu.clipboardSection().appendItem(i18nString(UIStrings.copyElement), treeOutline.performCopyOrCut.bind(treeOutline, false, this._node));
            menuItem.setShortcut(createShortcut('C', modifier));
            menuItem = copyMenu.clipboardSection().appendItem(i18nString(UIStrings.pasteElement), treeOutline.pasteNode.bind(treeOutline, this._node), !treeOutline.canPaste(this._node));
            menuItem.setShortcut(createShortcut('V', modifier));
            // Duplicate element, disabled on root element and ShadowDOM.
            const isRootElement = !this._node.parentNode || this._node.parentNode.nodeName() === '#document';
            menuItem = contextMenu.editSection().appendItem(i18nString(UIStrings.duplicateElement), treeOutline.duplicateNode.bind(treeOutline, this._node), (this._node.isInShadowTree() || isRootElement));
        }
        menuItem = contextMenu.debugSection().appendCheckboxItem(i18nString(UIStrings.hideElement), treeOutline.toggleHideElement.bind(treeOutline, this._node), treeOutline.isToggledToHidden(this._node));
        menuItem.setShortcut(UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutTitleForAction('elements.hide-element') || '');
        if (isEditable) {
            contextMenu.editSection().appendItem(i18nString(UIStrings.deleteElement), this.remove.bind(this));
        }
        contextMenu.viewSection().appendItem(i18nString(UIStrings.expandRecursively), this.expandRecursively.bind(this));
        contextMenu.viewSection().appendItem(i18nString(UIStrings.collapseChildren), this.collapseChildren.bind(this));
        const deviceModeWrapperAction = new Emulation.DeviceModeWrapper.ActionDelegate();
        contextMenu.viewSection().appendItem(i18nString(UIStrings.captureNodeScreenshot), deviceModeWrapperAction.handleAction.bind(null, UI.Context.Context.instance(), 'emulation.capture-node-screenshot'));
        if (this._node.frameOwnerFrameId()) {
            contextMenu.viewSection().appendItem(i18nString(UIStrings.showFrameDetails), () => {
                const frameOwnerFrameId = this._node.frameOwnerFrameId();
                if (frameOwnerFrameId) {
                    const frame = SDK.FrameManager.FrameManager.instance().getFrame(frameOwnerFrameId);
                    Common.Revealer.reveal(frame);
                }
            });
        }
    }
    _startEditing() {
        if (!this.treeOutline || this.treeOutline.selectedDOMNode() !== this._node) {
            return;
        }
        const listItem = this.listItemElement;
        if (this._canAddAttributes) {
            const attribute = listItem.getElementsByClassName('webkit-html-attribute')[0];
            if (attribute) {
                return this._startEditingAttribute(attribute, attribute.getElementsByClassName('webkit-html-attribute-value')[0]);
            }
            return this._addNewAttribute();
        }
        if (this._node.nodeType() === Node.TEXT_NODE) {
            const textNode = listItem.getElementsByClassName('webkit-html-text-node')[0];
            if (textNode) {
                return this._startEditingTextNode(textNode);
            }
        }
        return;
    }
    _addNewAttribute() {
        // Cannot just convert the textual html into an element without
        // a parent node. Use a temporary span container for the HTML.
        const container = document.createElement('span');
        const attr = this._buildAttributeDOM(container, ' ', '', null);
        attr.style.marginLeft = '2px'; // overrides the .editing margin rule
        attr.style.marginRight = '2px'; // overrides the .editing margin rule
        const tag = this.listItemElement.getElementsByClassName('webkit-html-tag')[0];
        this._insertInLastAttributePosition(tag, attr);
        attr.scrollIntoViewIfNeeded(true);
        return this._startEditingAttribute(attr, attr);
    }
    _triggerEditAttribute(attributeName) {
        const attributeElements = this.listItemElement.getElementsByClassName('webkit-html-attribute-name');
        for (let i = 0, len = attributeElements.length; i < len; ++i) {
            if (attributeElements[i].textContent === attributeName) {
                for (let elem = attributeElements[i].nextSibling; elem; elem = elem.nextSibling) {
                    if (elem.nodeType !== Node.ELEMENT_NODE) {
                        continue;
                    }
                    if (elem.classList.contains('webkit-html-attribute-value')) {
                        return this._startEditingAttribute(elem.parentElement, elem);
                    }
                }
            }
        }
        return;
    }
    _startEditingAttribute(attribute, elementForSelection) {
        console.assert(this.listItemElement.isAncestor(attribute));
        if (UI.UIUtils.isBeingEdited(attribute)) {
            return true;
        }
        const attributeNameElement = attribute.getElementsByClassName('webkit-html-attribute-name')[0];
        if (!attributeNameElement) {
            return false;
        }
        const attributeName = attributeNameElement.textContent;
        const attributeValueElement = attribute.getElementsByClassName('webkit-html-attribute-value')[0];
        // Make sure elementForSelection is not a child of attributeValueElement.
        elementForSelection =
            attributeValueElement.isAncestor(elementForSelection) ? attributeValueElement : elementForSelection;
        function removeZeroWidthSpaceRecursive(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                node.nodeValue = node.nodeValue ? node.nodeValue.replace(/\u200B/g, '') : '';
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return;
            }
            for (let child = node.firstChild; child; child = child.nextSibling) {
                removeZeroWidthSpaceRecursive(child);
            }
        }
        const attributeValue = attributeName && attributeValueElement ? this._node.getAttribute(attributeName) : undefined;
        if (attributeValue !== undefined) {
            attributeValueElement.setTextContentTruncatedIfNeeded(attributeValue, i18nString(UIStrings.valueIsTooLargeToEdit));
        }
        // Remove zero-width spaces that were added by nodeTitleInfo.
        removeZeroWidthSpaceRecursive(attribute);
        const config = new UI.InplaceEditor.Config(this._attributeEditingCommitted.bind(this), this._editingCancelled.bind(this), attributeName || undefined);
        function postKeyDownFinishHandler(event) {
            UI.UIUtils.handleElementValueModifications(event, attribute);
            return '';
        }
        if (!Common.ParsedURL.ParsedURL.fromString(attributeValueElement.textContent || '')) {
            config.setPostKeydownFinishHandler(postKeyDownFinishHandler);
        }
        this._updateEditorHandles(attribute, config);
        const componentSelection = this.listItemElement.getComponentSelection();
        componentSelection && componentSelection.selectAllChildren(elementForSelection);
        return true;
    }
    _startEditingTextNode(textNodeElement) {
        if (UI.UIUtils.isBeingEdited(textNodeElement)) {
            return true;
        }
        let textNode = this._node;
        // We only show text nodes inline in elements if the element only
        // has a single child, and that child is a text node.
        if (textNode.nodeType() === Node.ELEMENT_NODE && textNode.firstChild) {
            textNode = textNode.firstChild;
        }
        const container = textNodeElement.enclosingNodeOrSelfWithClass('webkit-html-text-node');
        if (container) {
            container.textContent = textNode.nodeValue();
        } // Strip the CSS or JS highlighting if present.
        const config = new UI.InplaceEditor.Config(this._textNodeEditingCommitted.bind(this, textNode), this._editingCancelled.bind(this));
        this._updateEditorHandles(textNodeElement, config);
        const componentSelection = this.listItemElement.getComponentSelection();
        componentSelection && componentSelection.selectAllChildren(textNodeElement);
        return true;
    }
    _startEditingTagName(tagNameElement) {
        if (!tagNameElement) {
            tagNameElement = this.listItemElement.getElementsByClassName('webkit-html-tag-name')[0];
            if (!tagNameElement) {
                return false;
            }
        }
        const tagName = tagNameElement.textContent;
        if (tagName !== null && EditTagBlocklist.has(tagName.toLowerCase())) {
            return false;
        }
        if (UI.UIUtils.isBeingEdited(tagNameElement)) {
            return true;
        }
        const closingTagElement = this._distinctClosingTagElement();
        function keyupListener() {
            if (closingTagElement && tagNameElement) {
                closingTagElement.textContent = '</' + tagNameElement.textContent + '>';
            }
        }
        const keydownListener = (event) => {
            if (event.key !== ' ') {
                return;
            }
            this._editing && this._editing.commit();
            event.consume(true);
        };
        function editingCommitted(element, newTagName, oldText, tagName, moveDirection) {
            if (!tagNameElement) {
                return;
            }
            tagNameElement.removeEventListener('keyup', keyupListener, false);
            tagNameElement.removeEventListener('keydown', keydownListener, false);
            this._tagNameEditingCommitted(element, newTagName, oldText, tagName, moveDirection);
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function editingCancelled(element, context) {
            if (!tagNameElement) {
                return;
            }
            tagNameElement.removeEventListener('keyup', keyupListener, false);
            tagNameElement.removeEventListener('keydown', keydownListener, false);
            this._editingCancelled(element, context);
        }
        tagNameElement.addEventListener('keyup', keyupListener, false);
        tagNameElement.addEventListener('keydown', keydownListener, false);
        const config = new UI.InplaceEditor.Config(editingCommitted.bind(this), editingCancelled.bind(this), tagName);
        this._updateEditorHandles(tagNameElement, config);
        const componentSelection = this.listItemElement.getComponentSelection();
        componentSelection && componentSelection.selectAllChildren(tagNameElement);
        return true;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _updateEditorHandles(element, config) {
        const editorHandles = UI.InplaceEditor.InplaceEditor.startEditing(element, config);
        if (!editorHandles) {
            this._editing = null;
        }
        else {
            this._editing = {
                commit: editorHandles.commit,
                cancel: editorHandles.cancel,
                editor: undefined,
                resize: () => { },
            };
        }
    }
    _startEditingAsHTML(commitCallback, disposeCallback, maybeInitialValue) {
        if (maybeInitialValue === null) {
            return;
        }
        if (this._editing) {
            return;
        }
        const initialValue = this._convertWhitespaceToEntities(maybeInitialValue).text;
        this._htmlEditElement = document.createElement('div');
        this._htmlEditElement.className = 'source-code elements-tree-editor';
        // Hide header items.
        let child = this.listItemElement.firstChild;
        while (child) {
            child.style.display = 'none';
            child = child.nextSibling;
        }
        // Hide children item.
        if (this.childrenListElement) {
            this.childrenListElement.style.display = 'none';
        }
        // Append editor.
        this.listItemElement.appendChild(this._htmlEditElement);
        const factory = TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditorFactory.instance();
        const editor = factory.createEditor({
            lineNumbers: false,
            lineWrapping: Common.Settings.Settings.instance().moduleSetting('domWordWrap').get(),
            mimeType: 'text/html',
            autoHeight: false,
            padBottom: false,
            bracketMatchingSetting: undefined,
            devtoolsAccessibleName: undefined,
            maxHighlightLength: undefined,
            placeholder: undefined,
            lineWiseCopyCut: undefined,
            inputStyle: undefined,
        });
        this._editing = { commit: commit.bind(this), cancel: dispose.bind(this), editor, resize: resize.bind(this) };
        resize.call(this);
        editor.widget().show(this._htmlEditElement);
        editor.setText(initialValue);
        editor.widget().focus();
        editor.widget().element.addEventListener('focusout', event => {
            // The relatedTarget is null when no element gains focus, e.g. switching windows.
            const relatedTarget = event.relatedTarget;
            if (relatedTarget && !relatedTarget.isSelfOrDescendant(editor.widget().element)) {
                this._editing && this._editing.commit();
            }
        }, false);
        editor.widget().element.addEventListener('keydown', keydown.bind(this), true);
        this.treeOutline && this.treeOutline.setMultilineEditing(this._editing);
        function resize() {
            if (this.treeOutline && this._htmlEditElement) {
                this._htmlEditElement.style.width = this.treeOutline.visibleWidth() - this._computeLeftIndent() - 30 + 'px';
            }
            if (this._editing && this._editing.editor) {
                this._editing.editor.onResize();
            }
        }
        function commit() {
            if (this._editing && this._editing.editor) {
                commitCallback(initialValue, this._editing.editor.text());
            }
            dispose.call(this);
        }
        function dispose() {
            if (!this._editing || !this._editing.editor) {
                return;
            }
            this._editing.editor.widget().element.removeEventListener('blur', this._editing.commit, true);
            this._editing.editor.widget().detach();
            this._editing = null;
            // Remove editor.
            if (this._htmlEditElement) {
                this.listItemElement.removeChild(this._htmlEditElement);
            }
            this._htmlEditElement = undefined;
            // Unhide children item.
            if (this.childrenListElement) {
                this.childrenListElement.style.removeProperty('display');
            }
            // Unhide header items.
            let child = this.listItemElement.firstChild;
            while (child) {
                child.style.removeProperty('display');
                child = child.nextSibling;
            }
            if (this.treeOutline) {
                this.treeOutline.setMultilineEditing(null);
                this.treeOutline.focus();
            }
            disposeCallback();
        }
        function keydown(event) {
            const keyboardEvent = event;
            const isMetaOrCtrl = UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(keyboardEvent) &&
                !keyboardEvent.altKey && !keyboardEvent.shiftKey;
            if (keyboardEvent.key === 'Enter' && (isMetaOrCtrl || keyboardEvent.isMetaOrCtrlForTest)) {
                keyboardEvent.consume(true);
                this._editing && this._editing.commit();
            }
            else if (keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Esc.code || keyboardEvent.key === 'Escape') {
                keyboardEvent.consume(true);
                this._editing && this._editing.cancel();
            }
        }
    }
    _attributeEditingCommitted(element, newText, oldText, attributeName, moveDirection) {
        this._editing = null;
        const treeOutline = this.treeOutline;
        function moveToNextAttributeIfNeeded(error) {
            if (error) {
                this._editingCancelled(element, attributeName);
            }
            if (!moveDirection) {
                return;
            }
            if (treeOutline) {
                treeOutline.runPendingUpdates();
                treeOutline.focus();
            }
            // Search for the attribute's position, and then decide where to move to.
            const attributes = this._node.attributes();
            for (let i = 0; i < attributes.length; ++i) {
                if (attributes[i].name !== attributeName) {
                    continue;
                }
                if (moveDirection === 'backward') {
                    if (i === 0) {
                        this._startEditingTagName();
                    }
                    else {
                        this._triggerEditAttribute(attributes[i - 1].name);
                    }
                }
                else {
                    if (i === attributes.length - 1) {
                        this._addNewAttribute();
                    }
                    else {
                        this._triggerEditAttribute(attributes[i + 1].name);
                    }
                }
                return;
            }
            // Moving From the "New Attribute" position.
            if (moveDirection === 'backward') {
                if (newText === ' ') {
                    // Moving from "New Attribute" that was not edited
                    if (attributes.length > 0) {
                        this._triggerEditAttribute(attributes[attributes.length - 1].name);
                    }
                }
                else {
                    // Moving from "New Attribute" that holds new value
                    if (attributes.length > 1) {
                        this._triggerEditAttribute(attributes[attributes.length - 2].name);
                    }
                }
            }
            else if (moveDirection === 'forward') {
                if (!Platform.StringUtilities.isWhitespace(newText)) {
                    this._addNewAttribute();
                }
                else {
                    this._startEditingTagName();
                }
            }
        }
        if ((attributeName.trim() || newText.trim()) && oldText !== newText) {
            this._node.setAttribute(attributeName, newText, moveToNextAttributeIfNeeded.bind(this));
            return;
        }
        this.updateTitle();
        moveToNextAttributeIfNeeded.call(this);
    }
    _tagNameEditingCommitted(element, newText, oldText, tagName, moveDirection) {
        this._editing = null;
        const self = this;
        function cancel() {
            const closingTagElement = self._distinctClosingTagElement();
            if (closingTagElement) {
                closingTagElement.textContent = '</' + tagName + '>';
            }
            self._editingCancelled(element, tagName);
            moveToNextAttributeIfNeeded.call(self);
        }
        function moveToNextAttributeIfNeeded() {
            if (moveDirection !== 'forward') {
                this._addNewAttribute();
                return;
            }
            const attributes = this._node.attributes();
            if (attributes.length > 0) {
                this._triggerEditAttribute(attributes[0].name);
            }
            else {
                this._addNewAttribute();
            }
        }
        newText = newText.trim();
        if (newText === oldText) {
            cancel();
            return;
        }
        const treeOutline = this.treeOutline;
        const wasExpanded = this.expanded;
        this._node.setNodeName(newText, (error, newNode) => {
            if (error || !newNode) {
                cancel();
                return;
            }
            if (!treeOutline) {
                return;
            }
            const newTreeItem = treeOutline.selectNodeAfterEdit(wasExpanded, error, newNode);
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            moveToNextAttributeIfNeeded.call(newTreeItem);
        });
    }
    _textNodeEditingCommitted(textNode, element, newText) {
        this._editing = null;
        function callback() {
            this.updateTitle();
        }
        textNode.setNodeValue(newText, callback.bind(this));
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _editingCancelled(_element, _context) {
        this._editing = null;
        // Need to restore attributes structure.
        this.updateTitle();
    }
    _distinctClosingTagElement() {
        // FIXME: Improve the Tree Element / Outline Abstraction to prevent crawling the DOM
        // For an expanded element, it will be the last element with class "close"
        // in the child element list.
        if (this.expanded) {
            const closers = this.childrenListElement.querySelectorAll('.close');
            return closers[closers.length - 1];
        }
        // Remaining cases are single line non-expanded elements with a closing
        // tag, or HTML elements without a closing tag (such as <br>). Return
        // null in the case where there isn't a closing tag.
        const tags = this.listItemElement.getElementsByClassName('webkit-html-tag');
        return tags.length === 1 ? null : tags[tags.length - 1];
    }
    updateTitle(updateRecord, onlySearchQueryChanged) {
        // If we are editing, return early to prevent canceling the edit.
        // After editing is committed updateTitle will be called.
        if (this._editing) {
            return;
        }
        if (onlySearchQueryChanged) {
            this._hideSearchHighlight();
        }
        else {
            const nodeInfo = this._nodeTitleInfo(updateRecord || null);
            if (this._node.nodeType() === Node.DOCUMENT_FRAGMENT_NODE && this._node.isInShadowTree() &&
                this._node.shadowRootType()) {
                this.childrenListElement.classList.add('shadow-root');
                let depth = 4;
                for (let node = this._node; depth && node; node = node.parentNode) {
                    if (node.nodeType() === Node.DOCUMENT_FRAGMENT_NODE) {
                        depth--;
                    }
                }
                if (!depth) {
                    this.childrenListElement.classList.add('shadow-root-deep');
                }
                else {
                    this.childrenListElement.classList.add('shadow-root-depth-' + depth);
                }
            }
            const highlightElement = document.createElement('span');
            highlightElement.className = 'highlight';
            highlightElement.appendChild(nodeInfo);
            // fixme: make it clear that `this.title = x` is a setter with significant side effects
            this.title = highlightElement;
            this.updateDecorations();
            this.listItemElement.insertBefore(this._gutterContainer, this.listItemElement.firstChild);
            if (!this._isClosingTag && this._adornerContainer) {
                this.listItemElement.appendChild(this._adornerContainer);
            }
            this._highlightResult = [];
            delete this.selectionElement;
            delete this._hintElement;
            if (this.selected) {
                this._createSelection();
                this._createHint();
            }
        }
        this._highlightSearchResults();
    }
    _computeLeftIndent() {
        let treeElement = this.parent;
        let depth = 0;
        while (treeElement !== null) {
            depth++;
            treeElement = treeElement.parent;
        }
        /** Keep it in sync with elementsTreeOutline.css **/
        return 12 * (depth - 2) + (this.isExpandable() ? 1 : 12);
    }
    updateDecorations() {
        this._gutterContainer.style.left = (-this._computeLeftIndent()) + 'px';
        if (this.isClosingTag()) {
            return;
        }
        if (this._node.nodeType() !== Node.ELEMENT_NODE) {
            return;
        }
        this._decorationsThrottler.schedule(this._updateDecorationsInternal.bind(this));
    }
    _updateDecorationsInternal() {
        if (!this.treeOutline) {
            return Promise.resolve();
        }
        const node = this._node;
        if (!this.treeOutline.decoratorExtensions) {
            this.treeOutline.decoratorExtensions = getRegisteredDecorators();
        }
        const markerToExtension = new Map();
        for (const decoratorExtension of this.treeOutline.decoratorExtensions) {
            markerToExtension.set(decoratorExtension.marker, decoratorExtension);
        }
        const promises = [];
        const decorations = [];
        const descendantDecorations = [];
        node.traverseMarkers(visitor);
        function visitor(n, marker) {
            const extension = markerToExtension.get(marker);
            if (!extension) {
                return;
            }
            promises.push(Promise.resolve(extension.decorator()).then(collectDecoration.bind(null, n)));
        }
        function collectDecoration(n, decorator) {
            const decoration = decorator.decorate(n);
            if (!decoration) {
                return;
            }
            (n === node ? decorations : descendantDecorations).push(decoration);
        }
        return Promise.all(promises).then(updateDecorationsUI.bind(this));
        function updateDecorationsUI() {
            this._decorationsElement.removeChildren();
            this._decorationsElement.classList.add('hidden');
            this._gutterContainer.classList.toggle('has-decorations', Boolean(decorations.length || descendantDecorations.length));
            UI.ARIAUtils.setAccessibleName(this._decorationsElement, '');
            if (!decorations.length && !descendantDecorations.length) {
                return;
            }
            const colors = new Set();
            const titles = document.createElement('div');
            for (const decoration of decorations) {
                const titleElement = titles.createChild('div');
                titleElement.textContent = decoration.title;
                colors.add(decoration.color);
            }
            if (this.expanded && !decorations.length) {
                return;
            }
            const descendantColors = new Set();
            if (descendantDecorations.length) {
                let element = titles.createChild('div');
                element.textContent = i18nString(UIStrings.children);
                for (const decoration of descendantDecorations) {
                    element = titles.createChild('div');
                    element.style.marginLeft = '15px';
                    element.textContent = decoration.title;
                    descendantColors.add(decoration.color);
                }
            }
            let offset = 0;
            processColors.call(this, colors, 'elements-gutter-decoration');
            if (!this.expanded) {
                processColors.call(this, descendantColors, 'elements-gutter-decoration elements-has-decorated-children');
            }
            UI.Tooltip.Tooltip.install(this._decorationsElement, titles);
            UI.ARIAUtils.setAccessibleName(this._decorationsElement, titles.textContent || '');
            function processColors(colors, className) {
                for (const color of colors) {
                    const child = this._decorationsElement.createChild('div', className);
                    this._decorationsElement.classList.remove('hidden');
                    child.style.backgroundColor = color;
                    child.style.borderColor = color;
                    if (offset) {
                        child.style.marginLeft = offset + 'px';
                    }
                    offset += 3;
                }
            }
        }
    }
    _buildAttributeDOM(parentElement, name, value, updateRecord, forceValue, node) {
        const closingPunctuationRegex = /[\/;:\)\]\}]/g;
        let highlightIndex = 0;
        let highlightCount = 0;
        let additionalHighlightOffset = 0;
        function setValueWithEntities(element, value) {
            const result = this._convertWhitespaceToEntities(value);
            highlightCount = result.entityRanges.length;
            value = result.text.replace(closingPunctuationRegex, (match, replaceOffset) => {
                while (highlightIndex < highlightCount && result.entityRanges[highlightIndex].offset < replaceOffset) {
                    result.entityRanges[highlightIndex].offset += additionalHighlightOffset;
                    ++highlightIndex;
                }
                additionalHighlightOffset += 1;
                return match + '\u200B';
            });
            while (highlightIndex < highlightCount) {
                result.entityRanges[highlightIndex].offset += additionalHighlightOffset;
                ++highlightIndex;
            }
            element.setTextContentTruncatedIfNeeded(value);
            UI.UIUtils.highlightRangesWithStyleClass(element, result.entityRanges, 'webkit-html-entity-value');
        }
        const hasText = (forceValue || value.length > 0);
        const attrSpanElement = parentElement.createChild('span', 'webkit-html-attribute');
        const attrNameElement = attrSpanElement.createChild('span', 'webkit-html-attribute-name');
        attrNameElement.textContent = name;
        if (hasText) {
            UI.UIUtils.createTextChild(attrSpanElement, '=\u200B"');
        }
        const attrValueElement = attrSpanElement.createChild('span', 'webkit-html-attribute-value');
        if (updateRecord && updateRecord.isAttributeModified(name)) {
            UI.UIUtils.runCSSAnimationOnce(hasText ? attrValueElement : attrNameElement, 'dom-update-highlight');
        }
        function linkifyValue(value) {
            const rewrittenHref = node ? node.resolveURL(value) : null;
            if (rewrittenHref === null) {
                const span = document.createElement('span');
                setValueWithEntities.call(this, span, value);
                return span;
            }
            value = value.replace(closingPunctuationRegex, '$&\u200B');
            if (value.startsWith('data:')) {
                value = Platform.StringUtilities.trimMiddle(value, 60);
            }
            const link = node && node.nodeName().toLowerCase() === 'a' ?
                UI.XLink.XLink.create(rewrittenHref, value, '', true /* preventClick */) :
                Components.Linkifier.Linkifier.linkifyURL(rewrittenHref, {
                    text: value,
                    preventClick: true,
                    className: undefined,
                    lineNumber: undefined,
                    columnNumber: undefined,
                    inlineFrameIndex: 0,
                    maxLength: undefined,
                    tabStop: undefined,
                    bypassURLTrimming: undefined,
                });
            return ImagePreviewPopover.setImageUrl(link, rewrittenHref);
        }
        const nodeName = node ? node.nodeName().toLowerCase() : '';
        if (nodeName && (name === 'src' || name === 'href')) {
            attrValueElement.appendChild(linkifyValue.call(this, value));
        }
        else if ((nodeName === 'img' || nodeName === 'source') && name === 'srcset') {
            attrValueElement.appendChild(linkifySrcset.call(this, value));
        }
        else if (nodeName === 'image' && (name === 'xlink:href' || name === 'href')) {
            attrValueElement.appendChild(linkifySrcset.call(this, value));
        }
        else {
            setValueWithEntities.call(this, attrValueElement, value);
        }
        if (hasText) {
            UI.UIUtils.createTextChild(attrSpanElement, '"');
        }
        function linkifySrcset(value) {
            // Splitting normally on commas or spaces will break on valid srcsets "foo 1x,bar 2x" and "data:,foo 1x".
            // 1) Let the index of the next space be `indexOfSpace`.
            // 2a) If the character at `indexOfSpace - 1` is a comma, collect the preceding characters up to
            //     `indexOfSpace - 1` as a URL and repeat step 1).
            // 2b) Else, collect the preceding characters as a URL.
            // 3) Collect the characters from `indexOfSpace` up to the next comma as the size descriptor and repeat step 1).
            // https://html.spec.whatwg.org/C/#parse-a-srcset-attribute
            const fragment = document.createDocumentFragment();
            let i = 0;
            while (value.length) {
                if (i++ > 0) {
                    UI.UIUtils.createTextChild(fragment, ' ');
                }
                value = value.trim();
                // The url and descriptor may end with a separating comma.
                let url = '';
                let descriptor = '';
                const indexOfSpace = value.search(/\s/);
                if (indexOfSpace === -1) {
                    url = value;
                }
                else if (indexOfSpace > 0 && value[indexOfSpace - 1] === ',') {
                    url = value.substring(0, indexOfSpace);
                }
                else {
                    url = value.substring(0, indexOfSpace);
                    const indexOfComma = value.indexOf(',', indexOfSpace);
                    if (indexOfComma !== -1) {
                        descriptor = value.substring(indexOfSpace, indexOfComma + 1);
                    }
                    else {
                        descriptor = value.substring(indexOfSpace);
                    }
                }
                if (url) {
                    // Up to one trailing comma should be removed from `url`.
                    if (url.endsWith(',')) {
                        fragment.appendChild(linkifyValue.call(this, url.substring(0, url.length - 1)));
                        UI.UIUtils.createTextChild(fragment, ',');
                    }
                    else {
                        fragment.appendChild(linkifyValue.call(this, url));
                    }
                }
                if (descriptor) {
                    UI.UIUtils.createTextChild(fragment, descriptor);
                }
                value = value.substring(url.length + descriptor.length);
            }
            return fragment;
        }
        return attrSpanElement;
    }
    _buildPseudoElementDOM(parentElement, pseudoElementName) {
        const pseudoElement = parentElement.createChild('span', 'webkit-html-pseudo-element');
        pseudoElement.textContent = '::' + pseudoElementName;
        UI.UIUtils.createTextChild(parentElement, '\u200B');
    }
    _buildTagDOM(parentElement, tagName, isClosingTag, isDistinctTreeElement, updateRecord) {
        const node = this._node;
        const classes = ['webkit-html-tag'];
        if (isClosingTag && isDistinctTreeElement) {
            classes.push('close');
        }
        const tagElement = parentElement.createChild('span', classes.join(' '));
        UI.UIUtils.createTextChild(tagElement, '<');
        const tagNameElement = tagElement.createChild('span', isClosingTag ? 'webkit-html-close-tag-name' : 'webkit-html-tag-name');
        tagNameElement.textContent = (isClosingTag ? '/' : '') + tagName;
        if (!isClosingTag) {
            if (node.hasAttributes()) {
                const attributes = node.attributes();
                for (let i = 0; i < attributes.length; ++i) {
                    const attr = attributes[i];
                    UI.UIUtils.createTextChild(tagElement, ' ');
                    this._buildAttributeDOM(tagElement, attr.name, attr.value, updateRecord, false, node);
                }
            }
            if (updateRecord) {
                let hasUpdates = updateRecord.hasRemovedAttributes() || updateRecord.hasRemovedChildren();
                hasUpdates = hasUpdates || (!this.expanded && updateRecord.hasChangedChildren());
                if (hasUpdates) {
                    UI.UIUtils.runCSSAnimationOnce(tagNameElement, 'dom-update-highlight');
                }
            }
        }
        UI.UIUtils.createTextChild(tagElement, '>');
        UI.UIUtils.createTextChild(parentElement, '\u200B');
        if (tagElement.textContent) {
            UI.ARIAUtils.setAccessibleName(tagElement, tagElement.textContent);
        }
    }
    _convertWhitespaceToEntities(text) {
        let result = '';
        let lastIndexAfterEntity = 0;
        const entityRanges = [];
        const charToEntity = MappedCharToEntity;
        for (let i = 0, size = text.length; i < size; ++i) {
            const char = text.charAt(i);
            if (charToEntity.has(char)) {
                result += text.substring(lastIndexAfterEntity, i);
                const entityValue = '&' + charToEntity.get(char) + ';';
                entityRanges.push({ offset: result.length, length: entityValue.length });
                result += entityValue;
                lastIndexAfterEntity = i + 1;
            }
        }
        if (result) {
            result += text.substring(lastIndexAfterEntity);
        }
        return { text: result || text, entityRanges: entityRanges };
    }
    _nodeTitleInfo(updateRecord) {
        const node = this._node;
        const titleDOM = document.createDocumentFragment();
        const updateSearchHighlight = () => {
            this._highlightResult = [];
            this._highlightSearchResults();
        };
        switch (node.nodeType()) {
            case Node.ATTRIBUTE_NODE:
                this._buildAttributeDOM(titleDOM, node.name, node.value, updateRecord, true);
                break;
            case Node.ELEMENT_NODE: {
                const pseudoType = node.pseudoType();
                if (pseudoType) {
                    this._buildPseudoElementDOM(titleDOM, pseudoType);
                    break;
                }
                const tagName = node.nodeNameInCorrectCase();
                if (this._isClosingTag) {
                    this._buildTagDOM(titleDOM, tagName, true, true, updateRecord);
                    break;
                }
                this._buildTagDOM(titleDOM, tagName, false, false, updateRecord);
                if (this.isExpandable()) {
                    if (!this.expanded) {
                        const textNodeElement = titleDOM.createChild('span', 'webkit-html-text-node bogus');
                        textNodeElement.textContent = '…';
                        UI.UIUtils.createTextChild(titleDOM, '\u200B');
                        this._buildTagDOM(titleDOM, tagName, true, false, updateRecord);
                    }
                    break;
                }
                if (ElementsTreeElement.canShowInlineText(node)) {
                    const textNodeElement = titleDOM.createChild('span', 'webkit-html-text-node');
                    const firstChild = node.firstChild;
                    if (!firstChild) {
                        throw new Error('ElementsTreeElement._nodeTitleInfo expects node.firstChild to be defined.');
                    }
                    const result = this._convertWhitespaceToEntities(firstChild.nodeValue());
                    textNodeElement.textContent = Platform.StringUtilities.collapseWhitespace(result.text);
                    UI.UIUtils.highlightRangesWithStyleClass(textNodeElement, result.entityRanges, 'webkit-html-entity-value');
                    UI.UIUtils.createTextChild(titleDOM, '\u200B');
                    this._buildTagDOM(titleDOM, tagName, true, false, updateRecord);
                    if (updateRecord && updateRecord.hasChangedChildren()) {
                        UI.UIUtils.runCSSAnimationOnce(textNodeElement, 'dom-update-highlight');
                    }
                    if (updateRecord && updateRecord.isCharDataModified()) {
                        UI.UIUtils.runCSSAnimationOnce(textNodeElement, 'dom-update-highlight');
                    }
                    break;
                }
                if (this.treeOutline && this.treeOutline.isXMLMimeType || !ForbiddenClosingTagElements.has(tagName)) {
                    this._buildTagDOM(titleDOM, tagName, true, false, updateRecord);
                }
                break;
            }
            case Node.TEXT_NODE:
                if (node.parentNode && node.parentNode.nodeName().toLowerCase() === 'script') {
                    const newNode = titleDOM.createChild('span', 'webkit-html-text-node webkit-html-js-node');
                    const text = node.nodeValue();
                    newNode.textContent = text.startsWith('\n') ? text.substring(1) : text;
                    const javascriptSyntaxHighlighter = new TextEditor.SyntaxHighlighter.SyntaxHighlighter('text/javascript', true);
                    javascriptSyntaxHighlighter.syntaxHighlightNode(newNode).then(updateSearchHighlight);
                }
                else if (node.parentNode && node.parentNode.nodeName().toLowerCase() === 'style') {
                    const newNode = titleDOM.createChild('span', 'webkit-html-text-node webkit-html-css-node');
                    const text = node.nodeValue();
                    newNode.textContent = text.startsWith('\n') ? text.substring(1) : text;
                    const cssSyntaxHighlighter = new TextEditor.SyntaxHighlighter.SyntaxHighlighter('text/css', true);
                    cssSyntaxHighlighter.syntaxHighlightNode(newNode).then(updateSearchHighlight);
                }
                else {
                    UI.UIUtils.createTextChild(titleDOM, '"');
                    const textNodeElement = titleDOM.createChild('span', 'webkit-html-text-node');
                    const result = this._convertWhitespaceToEntities(node.nodeValue());
                    textNodeElement.textContent = Platform.StringUtilities.collapseWhitespace(result.text);
                    UI.UIUtils.highlightRangesWithStyleClass(textNodeElement, result.entityRanges, 'webkit-html-entity-value');
                    UI.UIUtils.createTextChild(titleDOM, '"');
                    if (updateRecord && updateRecord.isCharDataModified()) {
                        UI.UIUtils.runCSSAnimationOnce(textNodeElement, 'dom-update-highlight');
                    }
                }
                break;
            case Node.COMMENT_NODE: {
                const commentElement = titleDOM.createChild('span', 'webkit-html-comment');
                UI.UIUtils.createTextChild(commentElement, '<!--' + node.nodeValue() + '-->');
                break;
            }
            case Node.DOCUMENT_TYPE_NODE: {
                const docTypeElement = titleDOM.createChild('span', 'webkit-html-doctype');
                UI.UIUtils.createTextChild(docTypeElement, '<!DOCTYPE ' + node.nodeName());
                if (node.publicId) {
                    UI.UIUtils.createTextChild(docTypeElement, ' PUBLIC "' + node.publicId + '"');
                    if (node.systemId) {
                        UI.UIUtils.createTextChild(docTypeElement, ' "' + node.systemId + '"');
                    }
                }
                else if (node.systemId) {
                    UI.UIUtils.createTextChild(docTypeElement, ' SYSTEM "' + node.systemId + '"');
                }
                if (node.internalSubset) {
                    UI.UIUtils.createTextChild(docTypeElement, ' [' + node.internalSubset + ']');
                }
                UI.UIUtils.createTextChild(docTypeElement, '>');
                break;
            }
            case Node.CDATA_SECTION_NODE: {
                const cdataElement = titleDOM.createChild('span', 'webkit-html-text-node');
                UI.UIUtils.createTextChild(cdataElement, '<![CDATA[' + node.nodeValue() + ']]>');
                break;
            }
            case Node.DOCUMENT_FRAGMENT_NODE: {
                const fragmentElement = titleDOM.createChild('span', 'webkit-html-fragment');
                fragmentElement.textContent = Platform.StringUtilities.collapseWhitespace(node.nodeNameInCorrectCase());
                break;
            }
            default: {
                const nameWithSpaceCollapsed = Platform.StringUtilities.collapseWhitespace(node.nodeNameInCorrectCase());
                UI.UIUtils.createTextChild(titleDOM, nameWithSpaceCollapsed);
            }
        }
        return titleDOM;
    }
    remove() {
        if (this._node.pseudoType()) {
            return;
        }
        const parentElement = this.parent;
        if (!parentElement) {
            return;
        }
        if (!this._node.parentNode || this._node.parentNode.nodeType() === Node.DOCUMENT_NODE) {
            return;
        }
        this._node.removeNode();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toggleEditAsHTML(callback, startEditing) {
        if (this._editing && this._htmlEditElement) {
            this._editing.commit();
            return;
        }
        if (startEditing === false) {
            return;
        }
        function selectNode(error) {
            if (callback) {
                callback(!error);
            }
        }
        function commitChange(initialValue, value) {
            if (initialValue !== value) {
                node.setOuterHTML(value, selectNode);
            }
        }
        function disposeCallback() {
            if (callback) {
                callback(false);
            }
        }
        const node = this._node;
        node.getOuterHTML().then(this._startEditingAsHTML.bind(this, commitChange, disposeCallback));
    }
    _copyCSSPath() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(cssPath(this._node, true));
    }
    _copyJSPath() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(jsPath(this._node, true));
    }
    _copyXPath() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(xPath(this._node, true));
    }
    _copyFullXPath() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(xPath(this._node, false));
    }
    async _copyStyles() {
        const node = this._node;
        const cssModel = node.domModel().cssModel();
        const cascade = await cssModel.cachedMatchedCascadeForNode(node);
        if (!cascade) {
            return;
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('textEditorIndent').get();
        const lines = [];
        for (const style of cascade.nodeStyles().reverse()) {
            for (const property of style.leadingProperties()) {
                if (!property.parsedOk || property.disabled || !property.activeInStyle() || property.implicit) {
                    continue;
                }
                if (cascade.isInherited(style) && !SDK.CSSMetadata.cssMetadata().isPropertyInherited(property.name)) {
                    continue;
                }
                if (style.parentRule && style.parentRule.isUserAgent()) {
                    continue;
                }
                if (cascade.propertyState(property) !== SDK.CSSMatchedStyles.PropertyState.Active) {
                    continue;
                }
                lines.push(`${indent}${property.name}: ${property.value};`);
            }
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(lines.join('\n'));
    }
    _highlightSearchResults() {
        if (!this._searchQuery || !this._searchHighlightsVisible) {
            return;
        }
        this._hideSearchHighlight();
        const text = this.listItemElement.textContent || '';
        const regexObject = createPlainTextSearchRegex(this._searchQuery, 'gi');
        let match = regexObject.exec(text);
        const matchRanges = [];
        while (match) {
            matchRanges.push(new TextUtils.TextRange.SourceRange(match.index, match[0].length));
            match = regexObject.exec(text);
        }
        // Fall back for XPath, etc. matches.
        if (!matchRanges.length) {
            matchRanges.push(new TextUtils.TextRange.SourceRange(0, text.length));
        }
        this._highlightResult = [];
        UI.UIUtils.highlightSearchResults(this.listItemElement, matchRanges, this._highlightResult);
    }
    _editAsHTML() {
        const promise = Common.Revealer.reveal(this.node());
        promise.then(() => {
            const action = UI.ActionRegistry.ActionRegistry.instance().action('elements.edit-as-html');
            if (!action) {
                return;
            }
            return action.execute();
        });
    }
    // TODO: add unit tests for adorner-related methods after component and TypeScript works are done
    adorn({ name, category }) {
        const adornerContent = document.createElement('span');
        adornerContent.textContent = name;
        const adorner = new ElementsComponents.Adorner.Adorner();
        adorner.data = {
            name,
            content: adornerContent,
            category,
        };
        this._adorners.push(adorner);
        ElementsPanel.instance().registerAdorner(adorner);
        this._updateAdorners();
        return adorner;
    }
    removeAdorner(adornerToRemove) {
        const adorners = this._adorners;
        ElementsPanel.instance().deregisterAdorner(adornerToRemove);
        adornerToRemove.remove();
        for (let i = 0; i < adorners.length; ++i) {
            if (adorners[i] === adornerToRemove) {
                adorners.splice(i, 1);
                this._updateAdorners();
                return;
            }
        }
    }
    removeAllAdorners() {
        for (const adorner of this._adorners) {
            ElementsPanel.instance().deregisterAdorner(adorner);
            adorner.remove();
        }
        this._adorners = [];
        this._updateAdorners();
    }
    _updateAdorners() {
        this._adornersThrottler.schedule(this._updateAdornersInternal.bind(this));
    }
    _updateAdornersInternal() {
        const adornerContainer = this._adornerContainer;
        if (!adornerContainer) {
            return Promise.resolve();
        }
        const adorners = this._adorners;
        if (adorners.length === 0) {
            adornerContainer.classList.add('hidden');
            return Promise.resolve();
        }
        adorners.sort(adornerComparator);
        adornerContainer.removeChildren();
        for (const adorner of adorners) {
            adornerContainer.appendChild(adorner);
        }
        adornerContainer.classList.remove('hidden');
        return Promise.resolve();
    }
    async updateStyleAdorners() {
        if (this._isClosingTag) {
            return;
        }
        const node = this.node();
        const nodeId = node.id;
        if (node.nodeType() === Node.COMMENT_NODE || node.nodeType() === Node.DOCUMENT_FRAGMENT_NODE ||
            node.nodeType() === Node.TEXT_NODE || nodeId === undefined) {
            return;
        }
        const styles = await node.domModel().cssModel().computedStylePromise(nodeId);
        for (const styleAdorner of this._styleAdorners) {
            this.removeAdorner(styleAdorner);
        }
        this._styleAdorners = [];
        if (!styles) {
            return;
        }
        const display = styles.get('display');
        const isGrid = display === 'grid' || display === 'inline-grid';
        const isFlex = display === 'flex' || display === 'inline-flex';
        const appendAdorner = (adorner) => {
            if (adorner) {
                this._styleAdorners.push(adorner);
            }
        };
        if (isGrid) {
            appendAdorner(this.createGridAdorner());
        }
        if (isFlex) {
            appendAdorner(this.createFlexAdorner());
        }
        if (styles.get('scroll-snap-type') && styles.get('scroll-snap-type') !== 'none') {
            appendAdorner(this.createScrollSnapAdorner());
        }
    }
    createGridAdorner() {
        const node = this.node();
        const nodeId = node.id;
        if (!nodeId) {
            return null;
        }
        const adorner = this.adorn(ElementsComponents.AdornerManager.AdornerRegistry.GRID);
        adorner.classList.add('grid');
        const onClick = (() => {
            if (adorner.isActive()) {
                node.domModel().overlayModel().highlightGridInPersistentOverlay(nodeId);
            }
            else {
                node.domModel().overlayModel().hideGridInPersistentOverlay(nodeId);
            }
        });
        adorner.addInteraction(onClick, {
            isToggle: true,
            shouldPropagateOnKeydown: false,
            ariaLabelDefault: i18nString(UIStrings.enableGridMode),
            ariaLabelActive: i18nString(UIStrings.disableGridMode),
        });
        node.domModel().overlayModel().addEventListener(SDK.OverlayModel.Events.PersistentGridOverlayStateChanged, event => {
            const { nodeId: eventNodeId, enabled } = event.data;
            if (eventNodeId !== nodeId) {
                return;
            }
            adorner.toggle(enabled);
        });
        return adorner;
    }
    createScrollSnapAdorner() {
        const node = this.node();
        const nodeId = node.id;
        if (!nodeId) {
            return null;
        }
        const adorner = this.adorn(ElementsComponents.AdornerManager.AdornerRegistry.SCROLL_SNAP);
        adorner.classList.add('scroll-snap');
        const onClick = (() => {
            const model = node.domModel().overlayModel();
            if (adorner.isActive()) {
                model.highlightScrollSnapInPersistentOverlay(nodeId);
            }
            else {
                model.hideScrollSnapInPersistentOverlay(nodeId);
            }
        });
        adorner.addInteraction(onClick, {
            isToggle: true,
            shouldPropagateOnKeydown: false,
            ariaLabelDefault: i18nString(UIStrings.enableScrollSnap),
            ariaLabelActive: i18nString(UIStrings.disableScrollSnap),
        });
        node.domModel().overlayModel().addEventListener(SDK.OverlayModel.Events.PersistentScrollSnapOverlayStateChanged, event => {
            const { nodeId: eventNodeId, enabled } = event.data;
            if (eventNodeId !== nodeId) {
                return;
            }
            adorner.toggle(enabled);
        });
        return adorner;
    }
    createFlexAdorner() {
        const node = this.node();
        const nodeId = node.id;
        if (!nodeId) {
            return null;
        }
        const adorner = this.adorn(ElementsComponents.AdornerManager.AdornerRegistry.FLEX);
        adorner.classList.add('flex');
        const onClick = (() => {
            const model = node.domModel().overlayModel();
            if (adorner.isActive()) {
                model.highlightFlexContainerInPersistentOverlay(nodeId);
            }
            else {
                model.hideFlexContainerInPersistentOverlay(nodeId);
            }
        });
        adorner.addInteraction(onClick, {
            isToggle: true,
            shouldPropagateOnKeydown: false,
            ariaLabelDefault: i18nString(UIStrings.enableFlexMode),
            ariaLabelActive: i18nString(UIStrings.disableFlexMode),
        });
        node.domModel().overlayModel().addEventListener(SDK.OverlayModel.Events.PersistentFlexContainerOverlayStateChanged, event => {
            const { nodeId: eventNodeId, enabled } = event.data;
            if (eventNodeId !== nodeId) {
                return;
            }
            adorner.toggle(enabled);
        });
        return adorner;
    }
}
export const InitialChildrenLimit = 500;
// A union of HTML4 and HTML5-Draft elements that explicitly
// or implicitly (for HTML5) forbid the closing tag.
export const ForbiddenClosingTagElements = new Set([
    'area', 'base', 'basefont', 'br', 'canvas', 'col', 'command', 'embed', 'frame', 'hr',
    'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr',
]);
// These tags we do not allow editing their tag name.
export const EditTagBlocklist = new Set(['html', 'head', 'body']);
const OrderedAdornerCategories = [
    "Security" /* SECURITY */,
    "Layout" /* LAYOUT */,
    "Default" /* DEFAULT */,
];
// Use idx + 1 for the order to avoid JavaScript's 0 == false issue
const AdornerCategoryOrder = new Map(OrderedAdornerCategories.map((category, idx) => [category, idx + 1]));
function adornerComparator(adornerA, adornerB) {
    const orderA = AdornerCategoryOrder.get(adornerA.category) || Number.POSITIVE_INFINITY;
    const orderB = AdornerCategoryOrder.get(adornerB.category) || Number.POSITIVE_INFINITY;
    if (orderA === orderB) {
        return adornerA.name.localeCompare(adornerB.name);
    }
    return orderA - orderB;
}
//# sourceMappingURL=ElementsTreeElement.js.map