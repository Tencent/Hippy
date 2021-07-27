// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as QuickOpen from '../../ui/legacy/components/quick_open/quick_open.js';
import { evaluateScriptSnippet, findSnippetsProject } from './ScriptSnippetFileSystem.js';
const UIStrings = {
    /**
    *@description Text in Snippets Quick Open of the Sources panel when opening snippets
    */
    noSnippetsFound: 'No snippets found.',
    /**
    *@description Text to run a code snippet
    */
    runSnippet: 'Run snippet',
};
const str_ = i18n.i18n.registerUIStrings('panels/snippets/SnippetsQuickOpen.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let snippetsQuickOpenInstance;
export class SnippetsQuickOpen extends QuickOpen.FilteredListWidget.Provider {
    _snippets;
    constructor() {
        super();
        this._snippets = [];
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!snippetsQuickOpenInstance || forceNew) {
            snippetsQuickOpenInstance = new SnippetsQuickOpen();
        }
        return snippetsQuickOpenInstance;
    }
    selectItem(itemIndex, _promptValue) {
        if (itemIndex === null) {
            return;
        }
        evaluateScriptSnippet(this._snippets[itemIndex]);
    }
    notFoundText(_query) {
        return i18nString(UIStrings.noSnippetsFound);
    }
    attach() {
        this._snippets = findSnippetsProject().uiSourceCodes();
    }
    detach() {
        this._snippets = [];
    }
    itemCount() {
        return this._snippets.length;
    }
    itemKeyAt(itemIndex) {
        return this._snippets[itemIndex].name();
    }
    renderItem(itemIndex, query, titleElement, _subtitleElement) {
        titleElement.textContent = unescape(this._snippets[itemIndex].name());
        titleElement.classList.add('monospace');
        QuickOpen.FilteredListWidget.FilteredListWidget.highlightRanges(titleElement, query, true);
    }
}
QuickOpen.FilteredListWidget.registerProvider({
    prefix: '!',
    title: i18nLazyString(UIStrings.runSnippet),
    provider: () => Promise.resolve(SnippetsQuickOpen.instance()),
});
//# sourceMappingURL=SnippetsQuickOpen.js.map