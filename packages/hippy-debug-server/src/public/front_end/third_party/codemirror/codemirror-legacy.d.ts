// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as CodeMirrorModule from 'codemirror/index';

declare module 'codemirror/index' {
  namespace CodeMirror {
    // These are commands we add to CodeMirror.commands, which is allowed
    // although makes TS very upset unless we define them here.
    interface CommandActions {
      smartNewlineAndIndent(cm: CodeMirrorModule.Editor): void;
      sourcesDismiss(cm: CodeMirrorModule.Editor): Object|undefined;
      autocomplete(cm: CodeMirrorModule.Editor): void;
      undoLastSelection(cm: CodeMirrorModule.Editor): void;
      selectNextOccurrence(cm: CodeMirrorModule.Editor): void;
      moveCamelLeft(cm: CodeMirrorModule.Editor): void;
      selectCamelLeft(cm: CodeMirrorModule.Editor): void;
      moveCamelRight(cm: CodeMirrorModule.Editor): void;
      selectCamelRight(cm: CodeMirrorModule.Editor): void;
      UserIndent(cm: CodeMirrorModule.Editor): void;
      indentLessOrPass(cm: CodeMirrorModule.Editor): void;
      gotoMatchingBracket(cm: CodeMirrorModule.Editor): void;
      undoAndReveal(cm: CodeMirrorModule.Editor): void;
      redoAndReveal(cm: CodeMirrorModule.Editor): void;
      dismiss(cm: CodeMirrorModule.Editor): Object|undefined;
      goSmartPageUp(cm: CodeMirrorModule.Editor): void;
      goSmartPageDown(cm: CodeMirrorModule.Editor): void;
    }

    // This is actually in CodeMirror but the types aren't up to date.
    interface Doc {
      replaceSelections(replacements: Array<string>, select?: string): void;
      findMatchingBracket(where: CodeMirrorModule.Position): {to: CodeMirrorModule.Position, match: boolean}|null;
    }
  }
}

declare global {
  var CodeMirror: typeof CodeMirrorModule;
}

export {}
