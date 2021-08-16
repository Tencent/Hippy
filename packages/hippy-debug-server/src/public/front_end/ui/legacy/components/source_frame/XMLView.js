// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
    *@description Text to find an item
    */
    find: 'Find',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/source_frame/XMLView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class XMLView extends UI.Widget.Widget {
    _treeOutline;
    _searchableView;
    _currentSearchFocusIndex;
    _currentSearchTreeElements;
    _searchConfig;
    constructor(parsedXML) {
        super(true);
        this.registerRequiredCSS('ui/legacy/components/source_frame/xmlView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('shadow-xml-view', 'source-code');
        this._treeOutline = new UI.TreeOutline.TreeOutlineInShadow();
        this._treeOutline.registerRequiredCSS('ui/legacy/components/source_frame/xmlTree.css', { enableLegacyPatching: false });
        this.contentElement.appendChild(this._treeOutline.element);
        this._currentSearchFocusIndex = 0;
        this._currentSearchTreeElements = [];
        XMLViewNode.populate(this._treeOutline, parsedXML, this);
        const firstChild = this._treeOutline.firstChild();
        if (firstChild) {
            firstChild.select(true /* omitFocus */, false /* selectedByUser */);
        }
    }
    static createSearchableView(parsedXML) {
        const xmlView = new XMLView(parsedXML);
        const searchableView = new UI.SearchableView.SearchableView(xmlView, null);
        searchableView.setPlaceholder(i18nString(UIStrings.find));
        xmlView._searchableView = searchableView;
        xmlView.show(searchableView.element);
        return searchableView;
    }
    static parseXML(text, mimeType) {
        let parsedXML;
        try {
            switch (mimeType) {
                case 'application/xhtml+xml':
                case 'application/xml':
                case 'image/svg+xml':
                case 'text/html':
                case 'text/xml':
                    parsedXML = (new DOMParser()).parseFromString(text, mimeType);
            }
        }
        catch (e) {
            return null;
        }
        if (!parsedXML || parsedXML.body) {
            return null;
        }
        return parsedXML;
    }
    _jumpToMatch(index, shouldJump) {
        if (!this._searchConfig) {
            return;
        }
        const regex = this._searchConfig.toSearchRegex(true);
        const previousFocusElement = this._currentSearchTreeElements[this._currentSearchFocusIndex];
        if (previousFocusElement) {
            previousFocusElement.setSearchRegex(regex);
        }
        const newFocusElement = this._currentSearchTreeElements[index];
        if (newFocusElement) {
            this._updateSearchIndex(index);
            if (shouldJump) {
                newFocusElement.reveal(true);
            }
            newFocusElement.setSearchRegex(regex, UI.UIUtils.highlightedCurrentSearchResultClassName);
        }
        else {
            this._updateSearchIndex(0);
        }
    }
    _updateSearchCount(count) {
        if (!this._searchableView) {
            return;
        }
        this._searchableView.updateSearchMatchesCount(count);
    }
    _updateSearchIndex(index) {
        this._currentSearchFocusIndex = index;
        if (!this._searchableView) {
            return;
        }
        this._searchableView.updateCurrentMatchIndex(index);
    }
    _innerPerformSearch(shouldJump, jumpBackwards) {
        if (!this._searchConfig) {
            return;
        }
        let newIndex = this._currentSearchFocusIndex;
        const previousSearchFocusElement = this._currentSearchTreeElements[newIndex];
        this._innerSearchCanceled();
        this._currentSearchTreeElements = [];
        const regex = this._searchConfig.toSearchRegex(true);
        for (let element = this._treeOutline.rootElement(); element; element = element.traverseNextTreeElement(false)) {
            if (!(element instanceof XMLViewNode)) {
                continue;
            }
            const hasMatch = element.setSearchRegex(regex);
            if (hasMatch) {
                this._currentSearchTreeElements.push(element);
            }
            if (previousSearchFocusElement === element) {
                const currentIndex = this._currentSearchTreeElements.length - 1;
                if (hasMatch || jumpBackwards) {
                    newIndex = currentIndex;
                }
                else {
                    newIndex = currentIndex + 1;
                }
            }
        }
        this._updateSearchCount(this._currentSearchTreeElements.length);
        if (!this._currentSearchTreeElements.length) {
            this._updateSearchIndex(0);
            return;
        }
        newIndex = Platform.NumberUtilities.mod(newIndex, this._currentSearchTreeElements.length);
        this._jumpToMatch(newIndex, shouldJump);
    }
    _innerSearchCanceled() {
        for (let element = this._treeOutline.rootElement(); element; element = element.traverseNextTreeElement(false)) {
            if (!(element instanceof XMLViewNode)) {
                continue;
            }
            element.revertHighlightChanges();
        }
        this._updateSearchCount(0);
        this._updateSearchIndex(0);
    }
    searchCanceled() {
        this._searchConfig = null;
        this._currentSearchTreeElements = [];
        this._innerSearchCanceled();
    }
    performSearch(searchConfig, shouldJump, jumpBackwards) {
        this._searchConfig = searchConfig;
        this._innerPerformSearch(shouldJump, jumpBackwards);
    }
    jumpToNextSearchResult() {
        if (!this._currentSearchTreeElements.length) {
            return;
        }
        const newIndex = Platform.NumberUtilities.mod(this._currentSearchFocusIndex + 1, this._currentSearchTreeElements.length);
        this._jumpToMatch(newIndex, true);
    }
    jumpToPreviousSearchResult() {
        if (!this._currentSearchTreeElements.length) {
            return;
        }
        const newIndex = Platform.NumberUtilities.mod(this._currentSearchFocusIndex - 1, this._currentSearchTreeElements.length);
        this._jumpToMatch(newIndex, true);
    }
    supportsCaseSensitiveSearch() {
        return true;
    }
    supportsRegexSearch() {
        return true;
    }
}
export class XMLViewNode extends UI.TreeOutline.TreeElement {
    _node;
    _closeTag;
    _highlightChanges;
    _xmlView;
    constructor(node, closeTag, xmlView) {
        super('', !closeTag && 'childElementCount' in node && Boolean(node.childElementCount));
        this._node = node;
        this._closeTag = closeTag;
        this.selectable = true;
        this._highlightChanges = [];
        this._xmlView = xmlView;
        this._updateTitle();
    }
    static populate(root, xmlNode, xmlView) {
        if (!(xmlNode instanceof Node)) {
            return;
        }
        let node = xmlNode.firstChild;
        while (node) {
            const currentNode = node;
            node = node.nextSibling;
            const nodeType = currentNode.nodeType;
            // ignore empty TEXT
            if (nodeType === 3 && currentNode.nodeValue && currentNode.nodeValue.match(/\s+/)) {
                continue;
            }
            // ignore ATTRIBUTE, ENTITY_REFERENCE, ENTITY, DOCUMENT, DOCUMENT_TYPE, DOCUMENT_FRAGMENT, NOTATION
            if ((nodeType !== 1) && (nodeType !== 3) && (nodeType !== 4) && (nodeType !== 7) && (nodeType !== 8)) {
                continue;
            }
            root.appendChild(new XMLViewNode(currentNode, false, xmlView));
        }
    }
    setSearchRegex(regex, additionalCssClassName) {
        this.revertHighlightChanges();
        if (!regex) {
            return false;
        }
        if (this._closeTag && this.parent && !this.parent.expanded) {
            return false;
        }
        regex.lastIndex = 0;
        let cssClasses = UI.UIUtils.highlightedSearchResultClassName;
        if (additionalCssClassName) {
            cssClasses += ' ' + additionalCssClassName;
        }
        if (!this.listItemElement.textContent) {
            return false;
        }
        const content = this.listItemElement.textContent.replace(/\xA0/g, ' ');
        let match = regex.exec(content);
        const ranges = [];
        while (match) {
            ranges.push(new TextUtils.TextRange.SourceRange(match.index, match[0].length));
            match = regex.exec(content);
        }
        if (ranges.length) {
            UI.UIUtils.highlightRangesWithStyleClass(this.listItemElement, ranges, cssClasses, this._highlightChanges);
        }
        return Boolean(this._highlightChanges.length);
    }
    revertHighlightChanges() {
        UI.UIUtils.revertDomChanges(this._highlightChanges);
        this._highlightChanges = [];
    }
    _updateTitle() {
        const node = this._node;
        if (!('nodeType' in node)) {
            return;
        }
        switch (node.nodeType) {
            case 1: { // ELEMENT
                if (node instanceof Element) {
                    const tag = node.tagName;
                    if (this._closeTag) {
                        this._setTitle(['</' + tag + '>', 'shadow-xml-view-tag']);
                        return;
                    }
                    const titleItems = ['<' + tag, 'shadow-xml-view-tag'];
                    const attributes = node.attributes;
                    for (let i = 0; i < attributes.length; ++i) {
                        const attributeNode = attributes.item(i);
                        if (!attributeNode) {
                            return;
                        }
                        titleItems.push('\xA0', 'shadow-xml-view-tag', attributeNode.name, 'shadow-xml-view-attribute-name', '="', 'shadow-xml-view-tag', attributeNode.value, 'shadow-xml-view-attribute-value', '"', 'shadow-xml-view-tag');
                    }
                    if (!this.expanded) {
                        if (node.childElementCount) {
                            titleItems.push('>', 'shadow-xml-view-tag', '…', 'shadow-xml-view-comment', '</' + tag, 'shadow-xml-view-tag');
                        }
                        else if (node.textContent) {
                            titleItems.push('>', 'shadow-xml-view-tag', node.textContent, 'shadow-xml-view-text', '</' + tag, 'shadow-xml-view-tag');
                        }
                        else {
                            titleItems.push(' /', 'shadow-xml-view-tag');
                        }
                    }
                    titleItems.push('>', 'shadow-xml-view-tag');
                    this._setTitle(titleItems);
                    return;
                }
                return;
            }
            case 3: { // TEXT
                if (node.nodeValue) {
                    this._setTitle([node.nodeValue, 'shadow-xml-view-text']);
                }
                return;
            }
            case 4: { // CDATA
                if (node.nodeValue) {
                    this._setTitle([
                        '<![CDATA[',
                        'shadow-xml-view-cdata',
                        node.nodeValue,
                        'shadow-xml-view-text',
                        ']]>',
                        'shadow-xml-view-cdata',
                    ]);
                }
                return;
            }
            case 7: { // PROCESSING_INSTRUCTION
                if (node.nodeValue) {
                    this._setTitle(['<?' + node.nodeName + ' ' + node.nodeValue + '?>', 'shadow-xml-view-processing-instruction']);
                }
                return;
            }
            case 8: { // COMMENT
                this._setTitle(['<!--' + node.nodeValue + '-->', 'shadow-xml-view-comment']);
                return;
            }
        }
    }
    _setTitle(items) {
        const titleFragment = document.createDocumentFragment();
        for (let i = 0; i < items.length; i += 2) {
            titleFragment.createChild('span', items[i + 1]).textContent = items[i];
        }
        this.title = titleFragment;
        this._xmlView._innerPerformSearch(false, false);
    }
    onattach() {
        this.listItemElement.classList.toggle('shadow-xml-view-close-tag', this._closeTag);
    }
    onexpand() {
        this._updateTitle();
    }
    oncollapse() {
        this._updateTitle();
    }
    async onpopulate() {
        XMLViewNode.populate(this, this._node, this._xmlView);
        this.appendChild(new XMLViewNode(this._node, true, this._xmlView));
    }
}
//# sourceMappingURL=XMLView.js.map