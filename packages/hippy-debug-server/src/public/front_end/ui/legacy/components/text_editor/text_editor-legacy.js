// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as TextEditorModule from './text_editor.js';
self.TextEditor = self.TextEditor || {};
TextEditor = TextEditor || {};
/** @constructor */
TextEditor.CodeMirrorTextEditor = TextEditorModule.CodeMirrorTextEditor.CodeMirrorTextEditor;
/** @constructor */
TextEditor.CodeMirrorTextEditor.SelectNextOccurrenceController =
    TextEditorModule.CodeMirrorTextEditor.SelectNextOccurrenceController;
/** @interface */
TextEditor.TextEditorPositionHandle = TextEditorModule.CodeMirrorTextEditor.TextEditorPositionHandle;
/** @constructor */
TextEditor.CodeMirrorPositionHandle = TextEditorModule.CodeMirrorTextEditor.CodeMirrorPositionHandle;
/** @constructor */
TextEditor.TextEditorBookMark = TextEditorModule.CodeMirrorTextEditor.TextEditorBookMark;
/** @constructor */
TextEditor.CodeMirrorTextEditorFactory = TextEditorModule.CodeMirrorTextEditor.CodeMirrorTextEditorFactory;
/** @constructor */
TextEditor.SyntaxHighlighter = TextEditorModule.SyntaxHighlighter.SyntaxHighlighter;
/** @constructor */
TextEditor.TextEditorAutocompleteController =
    TextEditorModule.TextEditorAutocompleteController.TextEditorAutocompleteController;
//# sourceMappingURL=text_editor-legacy.js.map