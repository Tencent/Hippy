// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Formatter from '../../models/formatter/formatter.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events, registerEditorAction } from './SourcesView.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Title of the format button in the Sources panel
    *@example {file name} PH1
    */
    formatS: 'Format {PH1}',
    /**
    *@description Tooltip text that appears when hovering over the largeicon pretty print button in the Inplace Formatter Editor Action of the Sources panel
    */
    format: 'Format',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/InplaceFormatterEditorAction.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let inplaceFormatterEditorActionInstance;
export class InplaceFormatterEditorAction {
    _button;
    _sourcesView;
    constructor() {
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!inplaceFormatterEditorActionInstance || forceNew) {
            inplaceFormatterEditorActionInstance = new InplaceFormatterEditorAction();
        }
        return inplaceFormatterEditorActionInstance;
    }
    _editorSelected(event) {
        const uiSourceCode = event.data;
        this._updateButton(uiSourceCode);
    }
    _editorClosed(event) {
        const wasSelected = event.data.wasSelected;
        if (wasSelected) {
            this._updateButton(null);
        }
    }
    _updateButton(uiSourceCode) {
        const isFormattable = this._isFormattable(uiSourceCode);
        this._button.element.classList.toggle('hidden', !isFormattable);
        if (uiSourceCode && isFormattable) {
            this._button.setTitle(i18nString(UIStrings.formatS, { PH1: uiSourceCode.name() }));
        }
    }
    button(sourcesView) {
        if (this._button) {
            return this._button;
        }
        this._sourcesView = sourcesView;
        this._sourcesView.addEventListener(Events.EditorSelected, this._editorSelected.bind(this));
        this._sourcesView.addEventListener(Events.EditorClosed, this._editorClosed.bind(this));
        this._button = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.format), 'largeicon-pretty-print');
        this._button.addEventListener(UI.Toolbar.ToolbarButton.Events.Click, this._formatSourceInPlace, this);
        this._updateButton(sourcesView.currentUISourceCode());
        return this._button;
    }
    _isFormattable(uiSourceCode) {
        if (!uiSourceCode) {
            return false;
        }
        if (uiSourceCode.project().canSetFileContent()) {
            return true;
        }
        if (Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode)) {
            return true;
        }
        return uiSourceCode.contentType().isStyleSheet();
    }
    _formatSourceInPlace(_event) {
        const uiSourceCode = this._sourcesView.currentUISourceCode();
        if (!uiSourceCode || !this._isFormattable(uiSourceCode)) {
            return;
        }
        if (uiSourceCode.isDirty()) {
            this._contentLoaded(uiSourceCode, uiSourceCode.workingCopy());
        }
        else {
            uiSourceCode.requestContent().then(deferredContent => {
                this._contentLoaded(uiSourceCode, deferredContent.content || '');
            });
        }
    }
    _contentLoaded(uiSourceCode, content) {
        const highlighterType = uiSourceCode.mimeType();
        Formatter.ScriptFormatter.FormatterInterface.format(uiSourceCode.contentType(), highlighterType, content, async (formattedContent, formatterMapping) => {
            this._formattingComplete(uiSourceCode, formattedContent, formatterMapping);
        });
    }
    /**
     * Post-format callback
     */
    _formattingComplete(uiSourceCode, formattedContent, formatterMapping) {
        if (uiSourceCode.workingCopy() === formattedContent) {
            return;
        }
        const sourceFrame = this._sourcesView.viewForFile(uiSourceCode);
        let start = [0, 0];
        if (sourceFrame) {
            const selection = sourceFrame.selection();
            start = formatterMapping.originalToFormatted(selection.startLine, selection.startColumn);
        }
        uiSourceCode.setWorkingCopy(formattedContent);
        this._sourcesView.showSourceLocation(uiSourceCode, start[0], start[1]);
    }
}
registerEditorAction(InplaceFormatterEditorAction.instance);
//# sourceMappingURL=InplaceFormatterEditorAction.js.map