// Copyright 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as QuickOpen from '../../ui/legacy/components/quick_open/quick_open.js';
import * as UI from '../../ui/legacy/legacy.js';
import { FilePathScoreFunction } from './FilePathScoreFunction.js';
const UIStrings = {
    /**
    *@description Text in Filtered UISource Code List Provider of the Sources panel
    */
    noFilesFound: 'No files found',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/FilteredUISourceCodeListProvider.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FilteredUISourceCodeListProvider extends QuickOpen.FilteredListWidget.Provider {
    _queryLineNumberAndColumnNumber;
    _defaultScores;
    _scorer;
    _uiSourceCodes;
    _uiSourceCodeUrls;
    _query;
    constructor() {
        super();
        this._queryLineNumberAndColumnNumber = '';
        this._defaultScores = null;
        this._scorer = new FilePathScoreFunction('');
        this._uiSourceCodes = [];
        this._uiSourceCodeUrls = new Set();
    }
    _projectRemoved(event) {
        const project = event.data;
        this._populate(project);
        this.refresh();
    }
    _populate(skipProject) {
        this._uiSourceCodes = [];
        this._uiSourceCodeUrls.clear();
        for (const project of Workspace.Workspace.WorkspaceImpl.instance().projects()) {
            if (project !== skipProject && this.filterProject(project)) {
                for (const uiSourceCode of project.uiSourceCodes()) {
                    if (this._filterUISourceCode(uiSourceCode)) {
                        this._uiSourceCodes.push(uiSourceCode);
                        this._uiSourceCodeUrls.add(uiSourceCode.url());
                    }
                }
            }
        }
    }
    _filterUISourceCode(uiSourceCode) {
        if (this._uiSourceCodeUrls.has(uiSourceCode.url())) {
            return false;
        }
        const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
        return !binding || binding.fileSystem === uiSourceCode;
    }
    uiSourceCodeSelected(_uiSourceCode, _lineNumber, _columnNumber) {
        // Overridden by subclasses
    }
    filterProject(_project) {
        return true;
        // Overridden by subclasses
    }
    itemCount() {
        return this._uiSourceCodes.length;
    }
    itemKeyAt(itemIndex) {
        return this._uiSourceCodes[itemIndex].url();
    }
    setDefaultScores(defaultScores) {
        this._defaultScores = defaultScores;
    }
    itemScoreAt(itemIndex, query) {
        const uiSourceCode = this._uiSourceCodes[itemIndex];
        const score = this._defaultScores ? (this._defaultScores.get(uiSourceCode) || 0) : 0;
        if (!query || query.length < 2) {
            return score;
        }
        if (this._query !== query) {
            this._query = query;
            this._scorer = new FilePathScoreFunction(query);
        }
        let multiplier = 10;
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.FileSystem &&
            !Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode)) {
            multiplier = 5;
        }
        const fullDisplayName = uiSourceCode.fullDisplayName();
        return score + multiplier * this._scorer.score(fullDisplayName, null);
    }
    renderItem(itemIndex, query, titleElement, subtitleElement) {
        query = this.rewriteQuery(query);
        const uiSourceCode = this._uiSourceCodes[itemIndex];
        const fullDisplayName = uiSourceCode.fullDisplayName();
        const indexes = [];
        new FilePathScoreFunction(query).score(fullDisplayName, indexes);
        const fileNameIndex = fullDisplayName.lastIndexOf('/');
        titleElement.classList.add('monospace');
        subtitleElement.classList.add('monospace');
        titleElement.textContent = uiSourceCode.displayName() + (this._queryLineNumberAndColumnNumber || '');
        this._renderSubtitleElement(subtitleElement, fullDisplayName);
        /** @type {!HTMLElement} */ UI.Tooltip.Tooltip.install((subtitleElement), fullDisplayName);
        const ranges = [];
        for (let i = 0; i < indexes.length; ++i) {
            ranges.push({ offset: indexes[i], length: 1 });
        }
        if (indexes[0] > fileNameIndex) {
            for (let i = 0; i < ranges.length; ++i) {
                ranges[i].offset -= fileNameIndex + 1;
            }
            UI.UIUtils.highlightRangesWithStyleClass(titleElement, ranges, 'highlight');
        }
        else {
            UI.UIUtils.highlightRangesWithStyleClass(subtitleElement, ranges, 'highlight');
        }
    }
    _renderSubtitleElement(element, text) {
        element.removeChildren();
        let splitPosition = text.lastIndexOf('/');
        const maxTextLength = 43;
        if (text.length > maxTextLength) {
            splitPosition = text.length - maxTextLength;
        }
        const first = element.createChild('div', 'first-part');
        first.textContent = text.substring(0, splitPosition);
        const second = element.createChild('div', 'second-part');
        second.textContent = text.substring(splitPosition);
        /** @type {!HTMLElement} */ UI.Tooltip.Tooltip.install((element), text);
    }
    selectItem(itemIndex, promptValue) {
        const parsedExpression = promptValue.trim().match(/^([^:]*)(:\d+)?(:\d+)?$/);
        if (!parsedExpression) {
            return;
        }
        let lineNumber;
        let columnNumber;
        if (parsedExpression[2]) {
            lineNumber = parseInt(parsedExpression[2].substr(1), 10) - 1;
        }
        if (parsedExpression[3]) {
            columnNumber = parseInt(parsedExpression[3].substr(1), 10) - 1;
        }
        const uiSourceCode = itemIndex !== null ? this._uiSourceCodes[itemIndex] : null;
        this.uiSourceCodeSelected(uiSourceCode, lineNumber, columnNumber);
    }
    rewriteQuery(query) {
        query = query ? query.trim() : '';
        if (!query || query === ':') {
            return '';
        }
        const lineNumberMatch = query.match(/^([^:]+)((?::[^:]*){0,2})$/);
        this._queryLineNumberAndColumnNumber = lineNumberMatch ? lineNumberMatch[2] : '';
        return lineNumberMatch ? lineNumberMatch[1] : query;
    }
    _uiSourceCodeAdded(event) {
        const uiSourceCode = event.data;
        if (!this._filterUISourceCode(uiSourceCode) || !this.filterProject(uiSourceCode.project())) {
            return;
        }
        this._uiSourceCodes.push(uiSourceCode);
        this._uiSourceCodeUrls.add(uiSourceCode.url());
        this.refresh();
    }
    notFoundText() {
        return i18nString(UIStrings.noFilesFound);
    }
    attach() {
        Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, this._uiSourceCodeAdded, this);
        Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.ProjectRemoved, this._projectRemoved, this);
        this._populate();
    }
    detach() {
        Workspace.Workspace.WorkspaceImpl.instance().removeEventListener(Workspace.Workspace.Events.UISourceCodeAdded, this._uiSourceCodeAdded, this);
        Workspace.Workspace.WorkspaceImpl.instance().removeEventListener(Workspace.Workspace.Events.ProjectRemoved, this._projectRemoved, this);
        this._queryLineNumberAndColumnNumber = '';
        this._defaultScores = null;
    }
}
//# sourceMappingURL=FilteredUISourceCodeListProvider.js.map