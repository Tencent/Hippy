/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../core/platform/platform.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
export class ConsoleViewport {
    element;
    _topGapElement;
    _topGapElementActive;
    _contentElement;
    _bottomGapElement;
    _bottomGapElementActive;
    _provider;
    _virtualSelectedIndex;
    _firstActiveIndex;
    _lastActiveIndex;
    _renderedItems;
    _anchorSelection;
    _headSelection;
    _itemCount;
    _cumulativeHeights;
    _muteCopyHandler;
    _observer;
    _observerConfig;
    _stickToBottom;
    _selectionIsBackward;
    _lastSelectedElement;
    _cachedProviderElements;
    constructor(provider) {
        this.element = document.createElement('div');
        this.element.style.overflow = 'auto';
        this._topGapElement = this.element.createChild('div');
        this._topGapElement.style.height = '0px';
        this._topGapElement.style.color = 'transparent';
        this._topGapElementActive = false;
        this._contentElement = this.element.createChild('div');
        this._bottomGapElement = this.element.createChild('div');
        this._bottomGapElement.style.height = '0px';
        this._bottomGapElement.style.color = 'transparent';
        this._bottomGapElementActive = false;
        // Text content needed for range intersection checks in _updateSelectionModel.
        // Use Unicode ZERO WIDTH NO-BREAK SPACE, which avoids contributing any height to the element's layout overflow.
        this._topGapElement.textContent = '\uFEFF';
        this._bottomGapElement.textContent = '\uFEFF';
        UI.ARIAUtils.markAsHidden(this._topGapElement);
        UI.ARIAUtils.markAsHidden(this._bottomGapElement);
        this._provider = provider;
        this.element.addEventListener('scroll', this._onScroll.bind(this), false);
        this.element.addEventListener('copy', this._onCopy.bind(this), false);
        this.element.addEventListener('dragstart', this._onDragStart.bind(this), false);
        this._contentElement.addEventListener('focusin', this._onFocusIn.bind(this), false);
        this._contentElement.addEventListener('focusout', this._onFocusOut.bind(this), false);
        this._contentElement.addEventListener('keydown', this._onKeyDown.bind(this), false);
        this._virtualSelectedIndex = -1;
        this._contentElement.tabIndex = -1;
        this._firstActiveIndex = -1;
        this._lastActiveIndex = -1;
        this._renderedItems = [];
        this._anchorSelection = null;
        this._headSelection = null;
        this._itemCount = 0;
        this._cumulativeHeights = new Int32Array(0);
        this._muteCopyHandler = false;
        // Listen for any changes to descendants and trigger a refresh. This ensures
        // that items updated asynchronously will not break stick-to-bottom behavior
        // if they change the scroll height.
        this._observer = new MutationObserver(this.refresh.bind(this));
        this._observerConfig = { childList: true, subtree: true };
        this._stickToBottom = false;
        this._selectionIsBackward = false;
    }
    stickToBottom() {
        return this._stickToBottom;
    }
    setStickToBottom(value) {
        this._stickToBottom = value;
        if (this._stickToBottom) {
            this._observer.observe(this._contentElement, this._observerConfig);
        }
        else {
            this._observer.disconnect();
        }
    }
    hasVirtualSelection() {
        return this._virtualSelectedIndex !== -1;
    }
    copyWithStyles() {
        this._muteCopyHandler = true;
        this.element.ownerDocument.execCommand('copy');
        this._muteCopyHandler = false;
    }
    _onCopy(event) {
        if (this._muteCopyHandler) {
            return;
        }
        const text = this._selectedText();
        if (!text) {
            return;
        }
        event.preventDefault();
        if (this._selectionContainsTable()) {
            this.copyWithStyles();
        }
        else if (event.clipboardData) {
            event.clipboardData.setData('text/plain', text);
        }
    }
    _onFocusIn(event) {
        const renderedIndex = this._renderedItems.findIndex(item => item.element().isSelfOrAncestor(event.target));
        if (renderedIndex !== -1) {
            this._virtualSelectedIndex = this._firstActiveIndex + renderedIndex;
        }
        let focusLastChild = false;
        // Make default selection when moving from external (e.g. prompt) to the container.
        if (this._virtualSelectedIndex === -1 && this._isOutsideViewport(event.relatedTarget) &&
            event.target === this._contentElement && this._itemCount) {
            focusLastChild = true;
            this._virtualSelectedIndex = this._itemCount - 1;
            // Update stick to bottom before scrolling into view.
            this.refresh();
            this.scrollItemIntoView(this._virtualSelectedIndex);
        }
        this._updateFocusedItem(focusLastChild);
    }
    _onFocusOut(event) {
        if (this._isOutsideViewport(event.relatedTarget)) {
            this._virtualSelectedIndex = -1;
        }
        this._updateFocusedItem();
    }
    _isOutsideViewport(element) {
        return element !== null && !element.isSelfOrDescendant(this._contentElement);
    }
    _onDragStart(event) {
        const text = this._selectedText();
        if (!text) {
            return false;
        }
        if (event.dataTransfer) {
            event.dataTransfer.clearData();
            event.dataTransfer.setData('text/plain', text);
            event.dataTransfer.effectAllowed = 'copy';
        }
        return true;
    }
    _onKeyDown(event) {
        if (UI.UIUtils.isEditing() || !this._itemCount || event.shiftKey) {
            return;
        }
        let isArrowUp = false;
        switch (event.key) {
            case 'ArrowUp':
                if (this._virtualSelectedIndex > 0) {
                    isArrowUp = true;
                    this._virtualSelectedIndex--;
                }
                else {
                    return;
                }
                break;
            case 'ArrowDown':
                if (this._virtualSelectedIndex < this._itemCount - 1) {
                    this._virtualSelectedIndex++;
                }
                else {
                    return;
                }
                break;
            case 'Home':
                this._virtualSelectedIndex = 0;
                break;
            case 'End':
                this._virtualSelectedIndex = this._itemCount - 1;
                break;
            default:
                return;
        }
        event.consume(true);
        this.scrollItemIntoView(this._virtualSelectedIndex);
        this._updateFocusedItem(isArrowUp);
    }
    _updateFocusedItem(focusLastChild) {
        const selectedElement = this.renderedElementAt(this._virtualSelectedIndex);
        const changed = this._lastSelectedElement !== selectedElement;
        const containerHasFocus = this._contentElement === this.element.ownerDocument.deepActiveElement();
        if (this._lastSelectedElement && changed) {
            this._lastSelectedElement.classList.remove('console-selected');
        }
        if (selectedElement && (focusLastChild || changed || containerHasFocus) && this.element.hasFocus()) {
            selectedElement.classList.add('console-selected');
            // Do not focus the message if something within holds focus (e.g. object).
            if (focusLastChild) {
                this.setStickToBottom(false);
                this._renderedItems[this._virtualSelectedIndex - this._firstActiveIndex].focusLastChildOrSelf();
            }
            else if (!selectedElement.hasFocus()) {
                selectedElement.focus({ preventScroll: true });
            }
        }
        if (this._itemCount && !this._contentElement.hasFocus()) {
            this._contentElement.tabIndex = 0;
        }
        else {
            this._contentElement.tabIndex = -1;
        }
        this._lastSelectedElement = selectedElement;
    }
    contentElement() {
        return this._contentElement;
    }
    invalidate() {
        delete this._cachedProviderElements;
        this._itemCount = this._provider.itemCount();
        if (this._virtualSelectedIndex > this._itemCount - 1) {
            this._virtualSelectedIndex = this._itemCount - 1;
        }
        this._rebuildCumulativeHeights();
        this.refresh();
    }
    _providerElement(index) {
        if (!this._cachedProviderElements) {
            this._cachedProviderElements = new Array(this._itemCount);
        }
        let element = this._cachedProviderElements[index];
        if (!element) {
            element = this._provider.itemElement(index);
            this._cachedProviderElements[index] = element;
        }
        return element;
    }
    _rebuildCumulativeHeights() {
        const firstActiveIndex = this._firstActiveIndex;
        const lastActiveIndex = this._lastActiveIndex;
        let height = 0;
        this._cumulativeHeights = new Int32Array(this._itemCount);
        for (let i = 0; i < this._itemCount; ++i) {
            if (firstActiveIndex <= i && i - firstActiveIndex < this._renderedItems.length && i <= lastActiveIndex) {
                height += this._renderedItems[i - firstActiveIndex].element().offsetHeight;
            }
            else {
                height += this._provider.fastHeight(i);
            }
            this._cumulativeHeights[i] = height;
        }
    }
    _rebuildCumulativeHeightsIfNeeded() {
        let totalCachedHeight = 0;
        let totalMeasuredHeight = 0;
        // Check whether current items in DOM have changed heights. Tolerate 1-pixel
        // error due to double-to-integer rounding errors.
        for (let i = 0; i < this._renderedItems.length; ++i) {
            const cachedItemHeight = this._cachedItemHeight(this._firstActiveIndex + i);
            const measuredHeight = this._renderedItems[i].element().offsetHeight;
            if (Math.abs(cachedItemHeight - measuredHeight) > 1) {
                this._rebuildCumulativeHeights();
                return;
            }
            totalMeasuredHeight += measuredHeight;
            totalCachedHeight += cachedItemHeight;
            if (Math.abs(totalCachedHeight - totalMeasuredHeight) > 1) {
                this._rebuildCumulativeHeights();
                return;
            }
        }
    }
    _cachedItemHeight(index) {
        return index === 0 ? this._cumulativeHeights[0] :
            this._cumulativeHeights[index] - this._cumulativeHeights[index - 1];
    }
    _isSelectionBackwards(selection) {
        if (!selection || !selection.rangeCount || !selection.anchorNode || !selection.focusNode) {
            return false;
        }
        const range = document.createRange();
        range.setStart(selection.anchorNode, selection.anchorOffset);
        range.setEnd(selection.focusNode, selection.focusOffset);
        return range.collapsed;
    }
    _createSelectionModel(itemIndex, node, offset) {
        return { item: itemIndex, node: node, offset: offset };
    }
    _updateSelectionModel(selection) {
        const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
        if (!range || (!selection || selection.isCollapsed) || !this.element.hasSelection()) {
            this._headSelection = null;
            this._anchorSelection = null;
            return false;
        }
        let firstSelectedIndex = Number.MAX_VALUE;
        let lastSelectedIndex = -1;
        let hasVisibleSelection = false;
        for (let i = 0; i < this._renderedItems.length; ++i) {
            if (range.intersectsNode(this._renderedItems[i].element())) {
                const index = i + this._firstActiveIndex;
                firstSelectedIndex = Math.min(firstSelectedIndex, index);
                lastSelectedIndex = Math.max(lastSelectedIndex, index);
                hasVisibleSelection = true;
            }
        }
        const topOverlap = range.intersectsNode(this._topGapElement) && this._topGapElementActive;
        const bottomOverlap = range.intersectsNode(this._bottomGapElement) && this._bottomGapElementActive;
        if (!topOverlap && !bottomOverlap && !hasVisibleSelection) {
            this._headSelection = null;
            this._anchorSelection = null;
            return false;
        }
        if (!this._anchorSelection || !this._headSelection) {
            this._anchorSelection = this._createSelectionModel(0, this.element, 0);
            this._headSelection = this._createSelectionModel(this._itemCount - 1, this.element, this.element.children.length);
            this._selectionIsBackward = false;
        }
        const isBackward = this._isSelectionBackwards(selection);
        const startSelection = this._selectionIsBackward ? this._headSelection : this._anchorSelection;
        const endSelection = this._selectionIsBackward ? this._anchorSelection : this._headSelection;
        let firstSelected = null;
        let lastSelected = null;
        if (hasVisibleSelection) {
            firstSelected = this._createSelectionModel(firstSelectedIndex, range.startContainer, range.startOffset);
            lastSelected = this._createSelectionModel(lastSelectedIndex, range.endContainer, range.endOffset);
        }
        if (topOverlap && bottomOverlap && hasVisibleSelection) {
            firstSelected = (firstSelected && firstSelected.item < startSelection.item) ? firstSelected : startSelection;
            lastSelected = (lastSelected && lastSelected.item > endSelection.item) ? lastSelected : endSelection;
        }
        else if (!hasVisibleSelection) {
            firstSelected = startSelection;
            lastSelected = endSelection;
        }
        else if (topOverlap) {
            firstSelected = isBackward ? this._headSelection : this._anchorSelection;
        }
        else if (bottomOverlap) {
            lastSelected = isBackward ? this._anchorSelection : this._headSelection;
        }
        if (isBackward) {
            this._anchorSelection = lastSelected;
            this._headSelection = firstSelected;
        }
        else {
            this._anchorSelection = firstSelected;
            this._headSelection = lastSelected;
        }
        this._selectionIsBackward = isBackward;
        return true;
    }
    _restoreSelection(selection) {
        if (!selection || !this._anchorSelection || !this._headSelection) {
            return;
        }
        const clampSelection = (selection, isSelectionBackwards) => {
            if (this._firstActiveIndex <= selection.item && selection.item <= this._lastActiveIndex) {
                return { element: selection.node, offset: selection.offset };
            }
            const element = selection.item < this._firstActiveIndex ? this._topGapElement : this._bottomGapElement;
            return { element, offset: isSelectionBackwards ? 1 : 0 };
        };
        const { element: anchorElement, offset: anchorOffset } = clampSelection(this._anchorSelection, Boolean(this._selectionIsBackward));
        const { element: headElement, offset: headOffset } = clampSelection(this._headSelection, !this._selectionIsBackward);
        selection.setBaseAndExtent(anchorElement, anchorOffset, headElement, headOffset);
    }
    _selectionContainsTable() {
        if (!this._anchorSelection || !this._headSelection) {
            return false;
        }
        const start = this._selectionIsBackward ? this._headSelection.item : this._anchorSelection.item;
        const end = this._selectionIsBackward ? this._anchorSelection.item : this._headSelection.item;
        for (let i = start; i <= end; i++) {
            const element = this._providerElement(i);
            if (element && element.consoleMessage().type === 'table') {
                return true;
            }
        }
        return false;
    }
    refresh() {
        this._observer.disconnect();
        this._innerRefresh();
        if (this._stickToBottom) {
            this._observer.observe(this._contentElement, this._observerConfig);
        }
    }
    _innerRefresh() {
        if (!this._visibleHeight()) {
            return;
        } // Do nothing for invisible controls.
        if (!this._itemCount) {
            for (let i = 0; i < this._renderedItems.length; ++i) {
                this._renderedItems[i].willHide();
            }
            this._renderedItems = [];
            this._contentElement.removeChildren();
            this._topGapElement.style.height = '0px';
            this._bottomGapElement.style.height = '0px';
            this._firstActiveIndex = -1;
            this._lastActiveIndex = -1;
            this._updateFocusedItem();
            return;
        }
        const selection = this.element.getComponentSelection();
        const shouldRestoreSelection = this._updateSelectionModel(selection);
        const visibleFrom = this.element.scrollTop;
        const visibleHeight = this._visibleHeight();
        const activeHeight = visibleHeight * 2;
        this._rebuildCumulativeHeightsIfNeeded();
        // When the viewport is scrolled to the bottom, using the cumulative heights estimate is not
        // precise enough to determine next visible indices. This stickToBottom check avoids extra
        // calls to refresh in those cases.
        if (this._stickToBottom) {
            this._firstActiveIndex =
                Math.max(this._itemCount - Math.ceil(activeHeight / this._provider.minimumRowHeight()), 0);
            this._lastActiveIndex = this._itemCount - 1;
        }
        else {
            this._firstActiveIndex = Math.max(Platform.ArrayUtilities.lowerBound(this._cumulativeHeights, visibleFrom + 1 - (activeHeight - visibleHeight) / 2, Platform.ArrayUtilities.DEFAULT_COMPARATOR), 0);
            // Proactively render more rows in case some of them will be collapsed without triggering refresh. @see crbug.com/390169
            this._lastActiveIndex = this._firstActiveIndex + Math.ceil(activeHeight / this._provider.minimumRowHeight()) - 1;
            this._lastActiveIndex = Math.min(this._lastActiveIndex, this._itemCount - 1);
        }
        const topGapHeight = this._cumulativeHeights[this._firstActiveIndex - 1] || 0;
        const bottomGapHeight = this._cumulativeHeights[this._cumulativeHeights.length - 1] - this._cumulativeHeights[this._lastActiveIndex];
        function prepare() {
            this._topGapElement.style.height = topGapHeight + 'px';
            this._bottomGapElement.style.height = bottomGapHeight + 'px';
            this._topGapElementActive = Boolean(topGapHeight);
            this._bottomGapElementActive = Boolean(bottomGapHeight);
            this._contentElement.style.setProperty('height', '10000000px');
        }
        this._partialViewportUpdate(prepare.bind(this));
        this._contentElement.style.removeProperty('height');
        // Should be the last call in the method as it might force layout.
        if (shouldRestoreSelection) {
            this._restoreSelection(selection);
        }
        if (this._stickToBottom) {
            this.element.scrollTop = 10000000;
        }
    }
    _partialViewportUpdate(prepare) {
        const itemsToRender = new Set();
        for (let i = this._firstActiveIndex; i <= this._lastActiveIndex; ++i) {
            const providerElement = this._providerElement(i);
            console.assert(Boolean(providerElement), 'Expected provider element to be defined');
            if (providerElement) {
                itemsToRender.add(providerElement);
            }
        }
        const willBeHidden = this._renderedItems.filter(item => !itemsToRender.has(item));
        for (let i = 0; i < willBeHidden.length; ++i) {
            willBeHidden[i].willHide();
        }
        prepare();
        let hadFocus = false;
        for (let i = 0; i < willBeHidden.length; ++i) {
            hadFocus = hadFocus || willBeHidden[i].element().hasFocus();
            willBeHidden[i].element().remove();
        }
        const wasShown = [];
        let anchor = this._contentElement.firstChild;
        for (const viewportElement of itemsToRender) {
            const element = viewportElement.element();
            if (element !== anchor) {
                const shouldCallWasShown = !element.parentElement;
                if (shouldCallWasShown) {
                    wasShown.push(viewportElement);
                }
                this._contentElement.insertBefore(element, anchor);
            }
            else {
                anchor = anchor.nextSibling;
            }
        }
        for (let i = 0; i < wasShown.length; ++i) {
            wasShown[i].wasShown();
        }
        this._renderedItems = Array.from(itemsToRender);
        if (hadFocus) {
            this._contentElement.focus();
        }
        this._updateFocusedItem();
    }
    _selectedText() {
        this._updateSelectionModel(this.element.getComponentSelection());
        if (!this._headSelection || !this._anchorSelection) {
            return null;
        }
        let startSelection = null;
        let endSelection = null;
        if (this._selectionIsBackward) {
            startSelection = this._headSelection;
            endSelection = this._anchorSelection;
        }
        else {
            startSelection = this._anchorSelection;
            endSelection = this._headSelection;
        }
        const textLines = [];
        for (let i = startSelection.item; i <= endSelection.item; ++i) {
            const providerElement = this._providerElement(i);
            console.assert(Boolean(providerElement));
            if (!providerElement) {
                continue;
            }
            const element = providerElement.element();
            const lineContent = element.childTextNodes().map(Components.Linkifier.Linkifier.untruncatedNodeText).join('');
            textLines.push(lineContent);
        }
        const endProviderElement = this._providerElement(endSelection.item);
        const endSelectionElement = endProviderElement && endProviderElement.element();
        if (endSelectionElement && endSelection.node && endSelection.node.isSelfOrDescendant(endSelectionElement)) {
            const itemTextOffset = this._textOffsetInNode(endSelectionElement, endSelection.node, endSelection.offset);
            if (textLines.length > 0) {
                textLines[textLines.length - 1] = textLines[textLines.length - 1].substring(0, itemTextOffset);
            }
        }
        const startProviderElement = this._providerElement(startSelection.item);
        const startSelectionElement = startProviderElement && startProviderElement.element();
        if (startSelectionElement && startSelection.node && startSelection.node.isSelfOrDescendant(startSelectionElement)) {
            const itemTextOffset = this._textOffsetInNode(startSelectionElement, startSelection.node, startSelection.offset);
            textLines[0] = textLines[0].substring(itemTextOffset);
        }
        return textLines.join('\n');
    }
    _textOffsetInNode(itemElement, selectionNode, offset) {
        // If the selectionNode is not a TextNode, we may need to convert a child offset into a character offset.
        const textContentLength = selectionNode.textContent ? selectionNode.textContent.length : 0;
        if (selectionNode.nodeType !== Node.TEXT_NODE) {
            if (offset < selectionNode.childNodes.length) {
                selectionNode = selectionNode.childNodes.item(offset);
                offset = 0;
            }
            else {
                offset = textContentLength;
            }
        }
        let chars = 0;
        let node = itemElement;
        while ((node = node.traverseNextNode(itemElement)) && node !== selectionNode) {
            if (node.nodeType !== Node.TEXT_NODE ||
                (node.parentElement &&
                    (node.parentElement.nodeName === 'STYLE' || node.parentElement.nodeName === 'SCRIPT'))) {
                continue;
            }
            chars += Components.Linkifier.Linkifier.untruncatedNodeText(node).length;
        }
        // If the selected node text was truncated, treat any non-zero offset as the full length.
        const untruncatedContainerLength = Components.Linkifier.Linkifier.untruncatedNodeText(selectionNode).length;
        if (offset > 0 && untruncatedContainerLength !== textContentLength) {
            offset = untruncatedContainerLength;
        }
        return chars + offset;
    }
    _onScroll(_event) {
        this.refresh();
    }
    firstVisibleIndex() {
        if (!this._cumulativeHeights.length) {
            return -1;
        }
        this._rebuildCumulativeHeightsIfNeeded();
        return Platform.ArrayUtilities.lowerBound(this._cumulativeHeights, this.element.scrollTop + 1, Platform.ArrayUtilities.DEFAULT_COMPARATOR);
    }
    lastVisibleIndex() {
        if (!this._cumulativeHeights.length) {
            return -1;
        }
        this._rebuildCumulativeHeightsIfNeeded();
        const scrollBottom = this.element.scrollTop + this.element.clientHeight;
        const right = this._itemCount - 1;
        return Platform.ArrayUtilities.lowerBound(this._cumulativeHeights, scrollBottom, Platform.ArrayUtilities.DEFAULT_COMPARATOR, undefined, right);
    }
    renderedElementAt(index) {
        if (index === -1 || index < this._firstActiveIndex || index > this._lastActiveIndex) {
            return null;
        }
        return this._renderedItems[index - this._firstActiveIndex].element();
    }
    scrollItemIntoView(index, makeLast) {
        const firstVisibleIndex = this.firstVisibleIndex();
        const lastVisibleIndex = this.lastVisibleIndex();
        if (index > firstVisibleIndex && index < lastVisibleIndex) {
            return;
        }
        // If the prompt is visible, then the last item must be fully on screen.
        if (index === lastVisibleIndex &&
            this._cumulativeHeights[index] <= this.element.scrollTop + this._visibleHeight()) {
            return;
        }
        if (makeLast) {
            this.forceScrollItemToBeLast(index);
        }
        else if (index <= firstVisibleIndex) {
            this.forceScrollItemToBeFirst(index);
        }
        else if (index >= lastVisibleIndex) {
            this.forceScrollItemToBeLast(index);
        }
    }
    forceScrollItemToBeFirst(index) {
        console.assert(index >= 0 && index < this._itemCount, 'Cannot scroll item at invalid index');
        this.setStickToBottom(false);
        this._rebuildCumulativeHeightsIfNeeded();
        this.element.scrollTop = index > 0 ? this._cumulativeHeights[index - 1] : 0;
        if (UI.UIUtils.isScrolledToBottom(this.element)) {
            this.setStickToBottom(true);
        }
        this.refresh();
        // After refresh, the item is in DOM, but may not be visible (items above were larger than expected).
        const renderedElement = this.renderedElementAt(index);
        if (renderedElement) {
            renderedElement.scrollIntoView(true /* alignTop */);
        }
    }
    forceScrollItemToBeLast(index) {
        console.assert(index >= 0 && index < this._itemCount, 'Cannot scroll item at invalid index');
        this.setStickToBottom(false);
        this._rebuildCumulativeHeightsIfNeeded();
        this.element.scrollTop = this._cumulativeHeights[index] - this._visibleHeight();
        if (UI.UIUtils.isScrolledToBottom(this.element)) {
            this.setStickToBottom(true);
        }
        this.refresh();
        // After refresh, the item is in DOM, but may not be visible (items above were larger than expected).
        const renderedElement = this.renderedElementAt(index);
        if (renderedElement) {
            renderedElement.scrollIntoView(false /* alignTop */);
        }
    }
    _visibleHeight() {
        // Use offsetHeight instead of clientHeight to avoid being affected by horizontal scroll.
        return this.element.offsetHeight;
    }
}
//# sourceMappingURL=ConsoleViewport.js.map