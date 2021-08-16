// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Accessibility label for number of matches in each file in search results pane
    *@example {2} PH1
    */
    matchesCountS: 'Matches Count {PH1}',
    /**
    *@description Search result label for results in the Search tool
    *@example {2} PH1
    */
    lineS: 'Line {PH1}',
    /**
    *@description Text in Search Results Pane of the Search tab
    *@example {2} PH1
    */
    showDMore: 'Show {PH1} more',
};
const str_ = i18n.i18n.registerUIStrings('panels/search/SearchResultsPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SearchResultsPane extends UI.Widget.VBox {
    _searchConfig;
    _searchResults;
    _treeOutline;
    _matchesExpandedCount;
    constructor(searchConfig) {
        super(true);
        this._searchConfig = searchConfig;
        this._searchResults = [];
        this._treeOutline = new UI.TreeOutline.TreeOutlineInShadow();
        this._treeOutline.hideOverflow();
        this._treeOutline.registerRequiredCSS('panels/search/searchResultsPane.css', { enableLegacyPatching: false });
        this.contentElement.appendChild(this._treeOutline.element);
        this._matchesExpandedCount = 0;
    }
    addSearchResult(searchResult) {
        this._searchResults.push(searchResult);
        this._addTreeElement(searchResult);
    }
    _addTreeElement(searchResult) {
        const treeElement = new SearchResultsTreeElement(this._searchConfig, searchResult);
        this._treeOutline.appendChild(treeElement);
        if (!this._treeOutline.selectedTreeElement) {
            treeElement.select(/* omitFocus */ true, /* selectedByUser */ true);
        }
        // Expand until at least a certain number of matches is expanded.
        if (this._matchesExpandedCount < matchesExpandedByDefault) {
            treeElement.expand();
        }
        this._matchesExpandedCount += searchResult.matchesCount();
    }
}
export const matchesExpandedByDefault = 20;
export const matchesShownAtOnce = 20;
export class SearchResultsTreeElement extends UI.TreeOutline.TreeElement {
    _searchConfig;
    _searchResult;
    _initialized;
    toggleOnClick;
    constructor(searchConfig, searchResult) {
        super('', true);
        this._searchConfig = searchConfig;
        this._searchResult = searchResult;
        this._initialized = false;
        this.toggleOnClick = true;
    }
    onexpand() {
        if (this._initialized) {
            return;
        }
        this._updateMatchesUI();
        this._initialized = true;
    }
    _updateMatchesUI() {
        this.removeChildren();
        const toIndex = Math.min(this._searchResult.matchesCount(), matchesShownAtOnce);
        if (toIndex < this._searchResult.matchesCount()) {
            this._appendSearchMatches(0, toIndex - 1);
            this._appendShowMoreMatchesElement(toIndex - 1);
        }
        else {
            this._appendSearchMatches(0, toIndex);
        }
    }
    onattach() {
        this._updateSearchMatches();
    }
    _updateSearchMatches() {
        this.listItemElement.classList.add('search-result');
        const fileNameSpan = span(this._searchResult.label(), 'search-result-file-name');
        fileNameSpan.appendChild(span('\u2014', 'search-result-dash'));
        fileNameSpan.appendChild(span(this._searchResult.description(), 'search-result-qualifier'));
        this.tooltip = this._searchResult.description();
        this.listItemElement.appendChild(fileNameSpan);
        const matchesCountSpan = document.createElement('span');
        matchesCountSpan.className = 'search-result-matches-count';
        matchesCountSpan.textContent = `${this._searchResult.matchesCount()}`;
        UI.ARIAUtils.setAccessibleName(matchesCountSpan, i18nString(UIStrings.matchesCountS, { PH1: this._searchResult.matchesCount() }));
        this.listItemElement.appendChild(matchesCountSpan);
        if (this.expanded) {
            this._updateMatchesUI();
        }
        function span(text, className) {
            const span = document.createElement('span');
            span.className = className;
            span.textContent = text;
            return span;
        }
    }
    _appendSearchMatches(fromIndex, toIndex) {
        const searchResult = this._searchResult;
        const queries = this._searchConfig.queries();
        const regexes = [];
        for (let i = 0; i < queries.length; ++i) {
            regexes.push(Platform.StringUtilities.createSearchRegex(queries[i], !this._searchConfig.ignoreCase(), this._searchConfig.isRegex()));
        }
        for (let i = fromIndex; i < toIndex; ++i) {
            const lineContent = searchResult.matchLineContent(i).trim();
            let matchRanges = [];
            for (let j = 0; j < regexes.length; ++j) {
                matchRanges = matchRanges.concat(this._regexMatchRanges(lineContent, regexes[j]));
            }
            const anchor = Components.Linkifier.Linkifier.linkifyRevealable(searchResult.matchRevealable(i), '');
            anchor.classList.add('search-match-link');
            const labelSpan = document.createElement('span');
            labelSpan.classList.add('search-match-line-number');
            const resultLabel = searchResult.matchLabel(i);
            labelSpan.textContent = resultLabel;
            if (typeof resultLabel === 'number' && !isNaN(resultLabel)) {
                UI.ARIAUtils.setAccessibleName(labelSpan, i18nString(UIStrings.lineS, { PH1: resultLabel }));
            }
            else {
                UI.ARIAUtils.setAccessibleName(labelSpan, resultLabel);
            }
            anchor.appendChild(labelSpan);
            const contentSpan = this._createContentSpan(lineContent, matchRanges);
            anchor.appendChild(contentSpan);
            const searchMatchElement = new UI.TreeOutline.TreeElement();
            this.appendChild(searchMatchElement);
            searchMatchElement.listItemElement.className = 'search-match';
            searchMatchElement.listItemElement.appendChild(anchor);
            searchMatchElement.listItemElement.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    event.consume(true);
                    Common.Revealer.reveal(searchResult.matchRevealable(i));
                }
            });
            searchMatchElement.tooltip = lineContent;
        }
    }
    _appendShowMoreMatchesElement(startMatchIndex) {
        const matchesLeftCount = this._searchResult.matchesCount() - startMatchIndex;
        const showMoreMatchesText = i18nString(UIStrings.showDMore, { PH1: matchesLeftCount });
        const showMoreMatchesTreeElement = new UI.TreeOutline.TreeElement(showMoreMatchesText);
        this.appendChild(showMoreMatchesTreeElement);
        showMoreMatchesTreeElement.listItemElement.classList.add('show-more-matches');
        showMoreMatchesTreeElement.onselect =
            this._showMoreMatchesElementSelected.bind(this, showMoreMatchesTreeElement, startMatchIndex);
    }
    _createContentSpan(lineContent, matchRanges) {
        let trimBy = 0;
        if (matchRanges.length > 0 && matchRanges[0].offset > 20) {
            trimBy = 15;
        }
        lineContent = lineContent.substring(trimBy, 1000 + trimBy);
        if (trimBy) {
            matchRanges =
                matchRanges.map(range => new TextUtils.TextRange.SourceRange(range.offset - trimBy + 1, range.length));
            lineContent = '…' + lineContent;
        }
        const contentSpan = document.createElement('span');
        contentSpan.className = 'search-match-content';
        contentSpan.textContent = lineContent;
        UI.ARIAUtils.setAccessibleName(contentSpan, `${lineContent} line`);
        UI.UIUtils.highlightRangesWithStyleClass(contentSpan, matchRanges, 'highlighted-match');
        return contentSpan;
    }
    _regexMatchRanges(lineContent, regex) {
        regex.lastIndex = 0;
        let match;
        const matchRanges = [];
        while ((regex.lastIndex < lineContent.length) && (match = regex.exec(lineContent))) {
            matchRanges.push(new TextUtils.TextRange.SourceRange(match.index, match[0].length));
        }
        return matchRanges;
    }
    _showMoreMatchesElementSelected(showMoreMatchesTreeElement, startMatchIndex) {
        this.removeChild(showMoreMatchesTreeElement);
        this._appendSearchMatches(startMatchIndex, this._searchResult.matchesCount());
        return false;
    }
}
//# sourceMappingURL=SearchResultsPane.js.map