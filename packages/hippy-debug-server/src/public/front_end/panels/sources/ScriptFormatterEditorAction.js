// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as FormatterModule from '../../models/formatter/formatter.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events, registerEditorAction } from './SourcesView.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Title of the pretty print button in the Sources panel
    *@example {file name} PH1
    */
    prettyPrintS: 'Pretty print {PH1}',
    /**
    *@description Text to pretty print a file
    */
    prettyPrint: 'Pretty print',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/ScriptFormatterEditorAction.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let scriptFormatterEditorActionInstance;
export class ScriptFormatterEditorAction {
    _pathsToFormatOnLoad;
    _sourcesView;
    _button;
    constructor() {
        this._pathsToFormatOnLoad = new Set();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!scriptFormatterEditorActionInstance || forceNew) {
            scriptFormatterEditorActionInstance = new ScriptFormatterEditorAction();
        }
        return scriptFormatterEditorActionInstance;
    }
    _editorSelected(event) {
        const uiSourceCode = event.data;
        this._updateButton(uiSourceCode);
        if (this._isFormattableScript(uiSourceCode) && this._pathsToFormatOnLoad.has(uiSourceCode.url()) &&
            !FormatterModule.SourceFormatter.SourceFormatter.instance().hasFormatted(uiSourceCode)) {
            this._showFormatted(uiSourceCode);
        }
    }
    async _editorClosed(event) {
        const uiSourceCode = event.data.uiSourceCode;
        const wasSelected = event.data.wasSelected;
        if (wasSelected) {
            this._updateButton(null);
        }
        const original = await FormatterModule.SourceFormatter.SourceFormatter.instance().discardFormattedUISourceCode(uiSourceCode);
        if (original) {
            this._pathsToFormatOnLoad.delete(original.url());
        }
    }
    _updateButton(uiSourceCode) {
        const isFormattable = this._isFormattableScript(uiSourceCode);
        this._button.element.classList.toggle('hidden', !isFormattable);
        if (uiSourceCode) {
            // We always update the title of the button, even if the {uiSourceCode} is
            // not formattable, since we use the title (the aria-label actually) as a
            // signal for the E2E tests that the source code loading is done.
            this._button.setTitle(i18nString(UIStrings.prettyPrintS, { PH1: uiSourceCode.name() }));
        }
    }
    button(sourcesView) {
        if (this._button) {
            return this._button;
        }
        this._sourcesView = sourcesView;
        this._sourcesView.addEventListener(Events.EditorSelected, event => {
            this._editorSelected(event);
        });
        this._sourcesView.addEventListener(Events.EditorClosed, event => {
            this._editorClosed(event);
        });
        this._button = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.prettyPrint), 'largeicon-pretty-print');
        this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._onFormatScriptButtonClicked, this);
        this._updateButton(sourcesView.currentUISourceCode());
        return this._button;
    }
    _isFormattableScript(uiSourceCode) {
        if (!uiSourceCode) {
            return false;
        }
        if (uiSourceCode.project().canSetFileContent()) {
            return false;
        }
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Formatter) {
            return false;
        }
        if (Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode)) {
            return false;
        }
        if (uiSourceCode.mimeType() === 'application/wasm') {
            return false;
        }
        return uiSourceCode.contentType().hasScripts();
    }
    isCurrentUISourceCodeFormattable() {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        return this._isFormattableScript(uiSourceCode);
    }
    _onFormatScriptButtonClicked(_event) {
        this.toggleFormatScriptSource();
    }
    toggleFormatScriptSource() {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        if (!uiSourceCode || !this._isFormattableScript(uiSourceCode)) {
            return;
        }
        this._pathsToFormatOnLoad.add(uiSourceCode.url());
        this._showFormatted(uiSourceCode);
    }
    async _showFormatted(uiSourceCode) {
        const formatData = await FormatterModule.SourceFormatter.SourceFormatter.instance().format(uiSourceCode);
        if (uiSourceCode !== this._sourcesView.currentUISourceCode()) {
            return;
        }
        const sourceFrame = this._sourcesView.viewForFile(uiSourceCode);
        let start = [0, 0];
        if (sourceFrame instanceof SourceFrame.SourceFrame.SourceFrameImpl) {
            const selection = sourceFrame.selection();
            start = formatData.mapping.originalToFormatted(selection.startLine, selection.startColumn);
        }
        this._sourcesView.showSourceLocation(formatData.formattedSourceCode, start[0], start[1]);
    }
}
registerEditorAction(ScriptFormatterEditorAction.instance);
//# sourceMappingURL=ScriptFormatterEditorAction.js.map