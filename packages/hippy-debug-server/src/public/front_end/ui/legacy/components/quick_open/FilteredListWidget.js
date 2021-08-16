// Copyright 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as Diff from '../../../../third_party/diff/diff.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
    * @description Aria label for quick open dialog prompt
    */
    quickOpenPrompt: 'Quick open prompt',
    /**
    * @description Title of quick open dialog
    */
    quickOpen: 'Quick open',
    /**
    * @description Text to show no results have been found
    */
    noResultsFound: 'No results found',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/quick_open/FilteredListWidget.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FilteredListWidget extends UI.Widget.VBox {
    _promptHistory;
    _scoringTimer;
    _filterTimer;
    _loadTimeout;
    _refreshListWithCurrentResult;
    _dialog;
    _query;
    _promptElement;
    _prompt;
    _bottomElementsContainer;
    _progressElement;
    _progressBarElement;
    _items;
    _list;
    _itemElementsContainer;
    _notFoundElement;
    _prefix;
    _provider;
    _queryChangedCallback;
    constructor(provider, promptHistory, queryChangedCallback) {
        super(true);
        this._promptHistory = promptHistory || [];
        this._scoringTimer = 0;
        this._filterTimer = 0;
        this._loadTimeout = 0;
        this.contentElement.classList.add('filtered-list-widget');
        const listener = this._onKeyDown.bind(this);
        this.contentElement.addEventListener('keydown', listener, true);
        UI.ARIAUtils.markAsCombobox(this.contentElement);
        this.registerRequiredCSS('ui/legacy/components/quick_open/filteredListWidget.css', { enableLegacyPatching: false });
        this._promptElement = this.contentElement.createChild('div', 'filtered-list-widget-input');
        UI.ARIAUtils.setAccessibleName(this._promptElement, i18nString(UIStrings.quickOpenPrompt));
        this._promptElement.setAttribute('spellcheck', 'false');
        this._promptElement.setAttribute('contenteditable', 'plaintext-only');
        this._prompt = new UI.TextPrompt.TextPrompt();
        this._prompt.initialize(() => Promise.resolve([]));
        const promptProxy = this._prompt.attach(this._promptElement);
        promptProxy.addEventListener('input', this._onInput.bind(this), false);
        promptProxy.classList.add('filtered-list-widget-prompt-element');
        this._bottomElementsContainer = this.contentElement.createChild('div', 'vbox');
        this._progressElement = this._bottomElementsContainer.createChild('div', 'filtered-list-widget-progress');
        this._progressBarElement = this._progressElement.createChild('div', 'filtered-list-widget-progress-bar');
        this._items = new UI.ListModel.ListModel();
        this._list = new UI.ListControl.ListControl(this._items, this, UI.ListControl.ListMode.EqualHeightItems);
        this._itemElementsContainer = this._list.element;
        this._itemElementsContainer.classList.add('container');
        this._bottomElementsContainer.appendChild(this._itemElementsContainer);
        this._itemElementsContainer.addEventListener('click', this._onClick.bind(this), false);
        UI.ARIAUtils.markAsListBox(this._itemElementsContainer);
        UI.ARIAUtils.setControls(this._promptElement, this._itemElementsContainer);
        UI.ARIAUtils.setAutocomplete(this._promptElement, UI.ARIAUtils.AutocompleteInteractionModel.list);
        this._notFoundElement = this._bottomElementsContainer.createChild('div', 'not-found-text');
        this._notFoundElement.classList.add('hidden');
        this.setDefaultFocusedElement(this._promptElement);
        this._prefix = '';
        this._provider = provider;
        this._queryChangedCallback = queryChangedCallback;
    }
    static highlightRanges(element, query, caseInsensitive) {
        if (!query) {
            return false;
        }
        function rangesForMatch(text, query) {
            const opcodes = Diff.Diff.DiffWrapper.charDiff(query, text);
            let offset = 0;
            const ranges = [];
            for (let i = 0; i < opcodes.length; ++i) {
                const opcode = opcodes[i];
                if (opcode[0] === Diff.Diff.Operation.Equal) {
                    ranges.push(new TextUtils.TextRange.SourceRange(offset, opcode[1].length));
                }
                else if (opcode[0] !== Diff.Diff.Operation.Insert) {
                    return null;
                }
                offset += opcode[1].length;
            }
            return ranges;
        }
        if (element.textContent === null) {
            return false;
        }
        const text = element.textContent;
        let ranges = rangesForMatch(text, query);
        if (!ranges || caseInsensitive) {
            ranges = rangesForMatch(text.toUpperCase(), query.toUpperCase());
        }
        if (ranges) {
            UI.UIUtils.highlightRangesWithStyleClass(element, ranges, 'highlight');
            return true;
        }
        return false;
    }
    setPlaceholder(placeholder, ariaPlaceholder) {
        this._prompt.setPlaceholder(placeholder, ariaPlaceholder);
    }
    /**
     * Sets the text prompt's accessible title. By default, it is "Quick open prompt".
     */
    setPromptTitle(title) {
        UI.ARIAUtils.setAccessibleName(this._promptElement, title);
    }
    showAsDialog(dialogTitle) {
        if (!dialogTitle) {
            dialogTitle = i18nString(UIStrings.quickOpen);
        }
        this._dialog = new UI.Dialog.Dialog();
        UI.ARIAUtils.setAccessibleName(this._dialog.contentElement, dialogTitle);
        this._dialog.setMaxContentSize(new UI.Geometry.Size(504, 340));
        this._dialog.setSizeBehavior(UI.GlassPane.SizeBehavior.SetExactWidthMaxHeight);
        this._dialog.setContentPosition(null, 22);
        this.show(this._dialog.contentElement);
        UI.ARIAUtils.setExpanded(this.contentElement, true);
        this._dialog.once('hidden').then(() => {
            this.dispatchEventToListeners('hidden');
        });
        // @ts-ignore
        this._dialog.show();
    }
    setPrefix(prefix) {
        this._prefix = prefix;
    }
    setProvider(provider) {
        if (provider === this._provider) {
            return;
        }
        if (this._provider) {
            this._provider.detach();
        }
        this._clearTimers();
        this._provider = provider;
        if (this.isShowing()) {
            this._attachProvider();
        }
    }
    setQuerySelectedRange(startIndex, endIndex) {
        this._prompt.setSelectedRange(startIndex, endIndex);
    }
    _attachProvider() {
        this._items.replaceAll([]);
        this._list.invalidateItemHeight();
        if (this._provider) {
            this._provider.setRefreshCallback(this._itemsLoaded.bind(this, this._provider));
            this._provider.attach();
        }
        this._itemsLoaded(this._provider);
    }
    _value() {
        return this._prompt.text().trim();
    }
    _cleanValue() {
        return this._value().substring(this._prefix.length);
    }
    wasShown() {
        this._attachProvider();
    }
    willHide() {
        if (this._provider) {
            this._provider.detach();
        }
        this._clearTimers();
        UI.ARIAUtils.setExpanded(this.contentElement, false);
    }
    _clearTimers() {
        clearTimeout(this._filterTimer);
        clearTimeout(this._scoringTimer);
        clearTimeout(this._loadTimeout);
        this._filterTimer = 0;
        this._scoringTimer = 0;
        this._loadTimeout = 0;
        this._refreshListWithCurrentResult = undefined;
    }
    _onEnter(_event) {
        if (!this._provider) {
            return;
        }
        const selectedIndexInProvider = this._provider.itemCount() ? this._list.selectedItem() : null;
        this._selectItem(selectedIndexInProvider);
        if (this._dialog) {
            this._dialog.hide();
        }
    }
    _itemsLoaded(provider) {
        if (this._loadTimeout || provider !== this._provider) {
            return;
        }
        this._loadTimeout = window.setTimeout(this._updateAfterItemsLoaded.bind(this), 0);
    }
    _updateAfterItemsLoaded() {
        this._loadTimeout = 0;
        this._filterItems();
    }
    createElementForItem(item) {
        const itemElement = document.createElement('div');
        const renderAsTwoRows = this._provider && this._provider.renderAsTwoRows();
        itemElement.className = 'filtered-list-widget-item ' + (renderAsTwoRows ? 'two-rows' : 'one-row');
        const titleElement = itemElement.createChild('div', 'filtered-list-widget-title');
        const subtitleElement = itemElement.createChild('div', 'filtered-list-widget-subtitle');
        subtitleElement.textContent = '\u200B';
        if (this._provider) {
            this._provider.renderItem(item, this._cleanValue(), titleElement, subtitleElement);
        }
        UI.ARIAUtils.markAsOption(itemElement);
        return itemElement;
    }
    heightForItem(_item) {
        // Let the list measure items for us.
        return 0;
    }
    isItemSelectable(_item) {
        return true;
    }
    selectedItemChanged(_from, _to, fromElement, toElement) {
        if (fromElement) {
            fromElement.classList.remove('selected');
        }
        if (toElement) {
            toElement.classList.add('selected');
        }
        UI.ARIAUtils.setActiveDescendant(this._promptElement, toElement);
    }
    _onClick(event) {
        const item = this._list.itemForNode(event.target);
        if (item === null) {
            return;
        }
        event.consume(true);
        this._selectItem(item);
        if (this._dialog) {
            this._dialog.hide();
        }
    }
    setQuery(query) {
        this._prompt.focus();
        this._prompt.setText(query);
        this._queryChanged();
        this._prompt.autoCompleteSoon(true);
        this._scheduleFilter();
    }
    _tabKeyPressed() {
        const userEnteredText = this._prompt.text();
        let completion;
        for (let i = this._promptHistory.length - 1; i >= 0; i--) {
            if (this._promptHistory[i] !== userEnteredText && this._promptHistory[i].startsWith(userEnteredText)) {
                completion = this._promptHistory[i];
                break;
            }
        }
        if (!completion) {
            return false;
        }
        this._prompt.focus();
        this._prompt.setText(completion);
        this._prompt.setDOMSelection(userEnteredText.length, completion.length);
        this._scheduleFilter();
        return true;
    }
    _itemsFilteredForTest() {
        // Sniffed in tests.
    }
    _filterItems() {
        this._filterTimer = 0;
        if (this._scoringTimer) {
            clearTimeout(this._scoringTimer);
            this._scoringTimer = 0;
            if (this._refreshListWithCurrentResult) {
                this._refreshListWithCurrentResult();
            }
        }
        if (!this._provider) {
            this._bottomElementsContainer.classList.toggle('hidden', true);
            this._itemsFilteredForTest();
            return;
        }
        this._bottomElementsContainer.classList.toggle('hidden', false);
        this._progressBarElement.style.transform = 'scaleX(0)';
        this._progressBarElement.classList.remove('filtered-widget-progress-fade', 'hidden');
        const query = this._provider.rewriteQuery(this._cleanValue());
        this._query = query;
        const filterRegex = query ? Platform.StringUtilities.filterRegex(query) : null;
        const filteredItems = [];
        const bestScores = [];
        const bestItems = [];
        const bestItemsToCollect = 100;
        let minBestScore = 0;
        const overflowItems = [];
        const scoreStartTime = window.performance.now();
        const maxWorkItems = Platform.NumberUtilities.clamp(10, 500, (this._provider.itemCount() / 10) | 0);
        scoreItems.call(this, 0);
        function compareIntegers(a, b) {
            return b - a;
        }
        function scoreItems(fromIndex) {
            if (!this._provider) {
                return;
            }
            this._scoringTimer = 0;
            let workDone = 0;
            let i;
            for (i = fromIndex; i < this._provider.itemCount() && workDone < maxWorkItems; ++i) {
                // Filter out non-matching items quickly.
                if (filterRegex && !filterRegex.test(this._provider.itemKeyAt(i))) {
                    continue;
                }
                // Score item.
                const score = this._provider.itemScoreAt(i, query);
                if (query) {
                    workDone++;
                }
                // Find its index in the scores array (earlier elements have bigger scores).
                if (score > minBestScore || bestScores.length < bestItemsToCollect) {
                    const index = Platform.ArrayUtilities.upperBound(bestScores, score, compareIntegers);
                    bestScores.splice(index, 0, score);
                    bestItems.splice(index, 0, i);
                    if (bestScores.length > bestItemsToCollect) {
                        // Best list is too large -> drop last elements.
                        const bestItemLast = bestItems[bestItems.length - 1];
                        if (bestItemLast) {
                            overflowItems.push(bestItemLast);
                        }
                        bestScores.length = bestItemsToCollect;
                        bestItems.length = bestItemsToCollect;
                    }
                    const bestScoreLast = bestScores[bestScores.length - 1];
                    if (bestScoreLast) {
                        minBestScore = bestScoreLast;
                    }
                }
                else {
                    filteredItems.push(i);
                }
            }
            this._refreshListWithCurrentResult = this._refreshList.bind(this, bestItems, overflowItems, filteredItems);
            // Process everything in chunks.
            if (i < this._provider.itemCount()) {
                this._scoringTimer = window.setTimeout(scoreItems.bind(this, i), 0);
                if (window.performance.now() - scoreStartTime > 50) {
                    this._progressBarElement.style.transform = 'scaleX(' + i / this._provider.itemCount() + ')';
                }
                return;
            }
            if (window.performance.now() - scoreStartTime > 100) {
                this._progressBarElement.style.transform = 'scaleX(1)';
                this._progressBarElement.classList.add('filtered-widget-progress-fade');
            }
            else {
                this._progressBarElement.classList.add('hidden');
            }
            this._refreshListWithCurrentResult();
        }
    }
    _refreshList(bestItems, overflowItems, filteredItems) {
        this._refreshListWithCurrentResult = undefined;
        filteredItems = [...bestItems, ...overflowItems, ...filteredItems];
        this._updateNotFoundMessage(Boolean(filteredItems.length));
        const oldHeight = this._list.element.offsetHeight;
        this._items.replaceAll(filteredItems);
        if (filteredItems.length) {
            this._list.selectItem(filteredItems[0]);
        }
        if (this._list.element.offsetHeight !== oldHeight) {
            this._list.viewportResized();
        }
        this._itemsFilteredForTest();
    }
    _updateNotFoundMessage(hasItems) {
        this._list.element.classList.toggle('hidden', !hasItems);
        this._notFoundElement.classList.toggle('hidden', hasItems);
        if (!hasItems && this._provider) {
            this._notFoundElement.textContent = this._provider.notFoundText(this._cleanValue());
            UI.ARIAUtils.alert(this._notFoundElement.textContent);
        }
    }
    _onInput() {
        this._queryChanged();
        this._scheduleFilter();
    }
    _queryChanged() {
        if (this._queryChangedCallback) {
            this._queryChangedCallback(this._value());
        }
        if (this._provider) {
            this._provider.queryChanged(this._cleanValue());
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return false;
    }
    _onKeyDown(keyboardEvent) {
        let handled = false;
        switch (keyboardEvent.key) {
            case 'Enter':
                this._onEnter(keyboardEvent);
                return;
            case 'Tab':
                handled = this._tabKeyPressed();
                break;
            case 'ArrowUp':
                handled = this._list.selectPreviousItem(true, false);
                break;
            case 'ArrowDown':
                handled = this._list.selectNextItem(true, false);
                break;
            case 'PageUp':
                handled = this._list.selectItemPreviousPage(false);
                break;
            case 'PageDown':
                handled = this._list.selectItemNextPage(false);
                break;
        }
        if (handled) {
            keyboardEvent.consume(true);
        }
    }
    _scheduleFilter() {
        if (this._filterTimer) {
            return;
        }
        this._filterTimer = window.setTimeout(this._filterItems.bind(this), 0);
    }
    _selectItem(itemIndex) {
        this._promptHistory.push(this._value());
        if (this._promptHistory.length > 100) {
            this._promptHistory.shift();
        }
        if (this._provider) {
            this._provider.selectItem(itemIndex, this._cleanValue());
        }
    }
}
export class Provider {
    _refreshCallback;
    constructor() {
    }
    setRefreshCallback(refreshCallback) {
        this._refreshCallback = refreshCallback;
    }
    attach() {
    }
    itemCount() {
        return 0;
    }
    itemKeyAt(_itemIndex) {
        return '';
    }
    itemScoreAt(_itemIndex, _query) {
        return 1;
    }
    renderItem(_itemIndex, _query, _titleElement, _subtitleElement) {
    }
    renderAsTwoRows() {
        return false;
    }
    selectItem(_itemIndex, _promptValue) {
    }
    refresh() {
        if (this._refreshCallback) {
            this._refreshCallback();
        }
    }
    rewriteQuery(query) {
        return query;
    }
    queryChanged(_query) {
    }
    notFoundText(_query) {
        return i18nString(UIStrings.noResultsFound);
    }
    detach() {
    }
}
const registeredProviders = [];
export function registerProvider(registration) {
    registeredProviders.push(registration);
}
export function getRegisteredProviders() {
    return registeredProviders;
}
//# sourceMappingURL=FilteredListWidget.js.map