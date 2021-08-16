// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Snippets from '../snippets/snippets.js';
import { Plugin } from './Plugin.js';
const UIStrings = {
    /**
    *@description Text in Snippets Plugin of the Sources panel
    */
    enter: '⌘+Enter',
    /**
    *@description Text in Snippets Plugin of the Sources panel
    */
    ctrlenter: 'Ctrl+Enter',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/SnippetsPlugin.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SnippetsPlugin extends Plugin {
    _textEditor;
    _uiSourceCode;
    constructor(textEditor, uiSourceCode) {
        super();
        this._textEditor = textEditor;
        this._uiSourceCode = uiSourceCode;
    }
    static accepts(uiSourceCode) {
        return Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(uiSourceCode);
    }
    async rightToolbarItems() {
        const runSnippet = UI.Toolbar.Toolbar.createActionButtonForId('debugger.run-snippet');
        runSnippet.setText(Host.Platform.isMac() ? i18nString(UIStrings.enter) : i18nString(UIStrings.ctrlenter));
        return [runSnippet];
    }
}
//# sourceMappingURL=SnippetsPlugin.js.map