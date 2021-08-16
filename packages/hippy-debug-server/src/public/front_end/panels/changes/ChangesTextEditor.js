// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js';
const UIStrings = {
    /**
    *@description Text prepended to a removed line in a diff in the Changes tool, viewable only by screen reader.
    *@example {function log () } PH1
    */
    deletions: 'Deletion:{PH1}',
    /**
    *@description Text prepended to a new line in a diff in the Changes tool, viewable only by screen reader.
    *@example {function log () } PH1
    */
    additions: 'Addition:{PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/changes/ChangesTextEditor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ChangesTextEditor extends TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditor {
    constructor(options) {
        options.inputStyle = 'devToolsAccessibleDiffTextArea';
        super(options);
        this.codeMirror().setOption('gutters', ['CodeMirror-linenumbers', 'changes-diff-gutter']);
        this.codeMirror().setOption('extraKeys', {
            Enter: false,
            Space: false,
            Left: function (cm) {
                const scrollInfo = cm.getScrollInfo();
                // Left edge check required due to bug where line numbers would disappear when attempting to scroll left when the scrollbar is at the leftmost point.
                // CodeMirror Issue: https://github.com/codemirror/CodeMirror/issues/6139
                if (scrollInfo.left > 0) {
                    cm.scrollTo(scrollInfo.left - Math.round(scrollInfo.clientWidth / 6), null);
                }
            },
            Right: function (cm) {
                const scrollInfo = cm.getScrollInfo();
                cm.scrollTo(scrollInfo.left + Math.round(scrollInfo.clientWidth / 6), null);
            },
        });
    }
    updateDiffGutter(diffRows) {
        this.codeMirror().eachLine((line) => {
            const lineNumber = this.codeMirror().getLineNumber(line);
            const row = diffRows[lineNumber];
            let gutterMarker;
            if (row.type === "deletion" /* Deletion */) {
                gutterMarker = document.createElement('div');
                gutterMarker.classList.add('deletion');
                gutterMarker.classList.add('changes-diff-gutter-marker');
                gutterMarker.textContent = '-';
            }
            else if (row.type === "addition" /* Addition */) {
                gutterMarker = document.createElement('div');
                gutterMarker.classList.add('addition');
                gutterMarker.classList.add('changes-diff-gutter-marker');
                gutterMarker.textContent = '+';
            }
            if (gutterMarker) {
                this.codeMirror().setGutterMarker(line, 'changes-diff-gutter', gutterMarker);
            }
        });
    }
}
export class DevToolsAccessibleDiffTextArea extends TextEditor.CodeMirrorTextEditor.DevToolsAccessibleTextArea {
    reset(typing) {
        super.reset(typing);
        const doc = this.cm.doc;
        if (this.textAreaBusy(Boolean(typing)) || !(typeof doc.modeOption === 'object')) {
            return;
        }
        const diffRows = doc.modeOption.diffRows;
        const lineNumber = this.cm.getCursor().line;
        const rowType = diffRows[lineNumber].type;
        if (rowType === "deletion" /* Deletion */) {
            this.textarea.value = i18nString(UIStrings.deletions, { PH1: this.textarea.value });
        }
        if (rowType === "addition" /* Addition */) {
            this.textarea.value = i18nString(UIStrings.additions, { PH1: this.textarea.value });
        }
        this.prevInput = this.textarea.value;
    }
}
// @ts-ignore CodeMirror integration with externals, not yet part of codemirror-legacy.d.ts
CodeMirror.inputStyles.devToolsAccessibleDiffTextArea = DevToolsAccessibleDiffTextArea;
//# sourceMappingURL=ChangesTextEditor.js.map