// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as UI from '../../legacy.js';
import { getRegisteredProviders, Provider, registerProvider } from './FilteredListWidget.js';
import { QuickOpenImpl } from './QuickOpen.js';
let helpQuickOpenInstance;
export class HelpQuickOpen extends Provider {
    _providers;
    constructor() {
        super();
        this._providers = [];
        getRegisteredProviders().forEach(this._addProvider.bind(this));
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!helpQuickOpenInstance || forceNew) {
            helpQuickOpenInstance = new HelpQuickOpen();
        }
        return helpQuickOpenInstance;
    }
    _addProvider(extension) {
        if (extension.title) {
            this._providers.push({ prefix: extension.prefix || '', title: extension.title() });
        }
    }
    itemCount() {
        return this._providers.length;
    }
    itemKeyAt(itemIndex) {
        return this._providers[itemIndex].prefix;
    }
    itemScoreAt(itemIndex, _query) {
        return -this._providers[itemIndex].prefix.length;
    }
    renderItem(itemIndex, _query, titleElement, _subtitleElement) {
        const provider = this._providers[itemIndex];
        const prefixElement = titleElement.createChild('span', 'monospace');
        prefixElement.textContent = (provider.prefix || '…') + ' ';
        UI.UIUtils.createTextChild(titleElement, provider.title);
    }
    selectItem(itemIndex, _promptValue) {
        if (itemIndex !== null) {
            QuickOpenImpl.show(this._providers[itemIndex].prefix);
        }
    }
    renderAsTwoRows() {
        return false;
    }
}
registerProvider({
    prefix: '?',
    title: undefined,
    provider: () => Promise.resolve(HelpQuickOpen.instance()),
});
//# sourceMappingURL=HelpQuickOpen.js.map