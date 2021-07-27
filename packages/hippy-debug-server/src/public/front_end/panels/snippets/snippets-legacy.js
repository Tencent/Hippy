// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as SnippetsModule from './snippets.js';
self.Snippets = self.Snippets || {};
Snippets = Snippets || {};
Snippets.evaluateScriptSnippet = SnippetsModule.ScriptSnippetFileSystem.evaluateScriptSnippet;
Snippets.isSnippetsUISourceCode = SnippetsModule.ScriptSnippetFileSystem.isSnippetsUISourceCode;
Snippets.isSnippetsProject = SnippetsModule.ScriptSnippetFileSystem.isSnippetsProject;
/**
 * @constructor
 */
Snippets.SnippetsQuickOpen = SnippetsModule.SnippetsQuickOpen.SnippetsQuickOpen;
Snippets.ScriptSnippetFileSystem = {};
Snippets.ScriptSnippetFileSystem.findSnippetsProject = SnippetsModule.ScriptSnippetFileSystem.findSnippetsProject;
//# sourceMappingURL=snippets-legacy.js.map