/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AddSourceMapURLDialog } from './AddSourceMapURLDialog.js';
import { BreakpointEditDialog, LogpointPrefix } from './BreakpointEditDialog.js';
import { Plugin } from './Plugin.js';
import { ScriptFormatterEditorAction } from './ScriptFormatterEditorAction.js';
import { resolveExpression, resolveScopeInObject } from './SourceMapNamesResolver.js';
import { SourcesPanel } from './SourcesPanel.js';
import { getRegisteredEditorActions } from './SourcesView.js';
const UIStrings = {
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    thisScriptIsOnTheDebuggersIgnore: 'This script is on the debugger\'s ignore list',
    /**
    *@description Text to stop preventing the debugger from stepping into library code
    */
    removeFromIgnoreList: 'Remove from ignore list',
    /**
    *@description Text of a button in the Sources panel Debugger Plugin to configure ignore listing in Settings
    */
    configure: 'Configure',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    sourceMapFoundButIgnoredForFile: 'Source map found, but ignored for file on ignore list.',
    /**
    *@description Text to add a breakpoint
    */
    addBreakpoint: 'Add breakpoint',
    /**
    *@description A context menu item in the Debugger Plugin of the Sources panel
    */
    addConditionalBreakpoint: 'Add conditional breakpoint…',
    /**
    *@description A context menu item in the Debugger Plugin of the Sources panel
    */
    addLogpoint: 'Add logpoint…',
    /**
    *@description A context menu item in the Debugger Plugin of the Sources panel
    */
    neverPauseHere: 'Never pause here',
    /**
    *@description Context menu command to delete/remove a breakpoint that the user
    *has set. One line of code can have multiple breakpoints. Always >= 1 breakpoint.
    */
    removeBreakpoint: '{n, plural, =1 {Remove breakpoint} other {Remove all breakpoints in line}}',
    /**
    *@description A context menu item in the Debugger Plugin of the Sources panel
    */
    editBreakpoint: 'Edit breakpoint…',
    /**
    *@description Context menu command to disable (but not delete) a breakpoint
    *that the user has set. One line of code can have multiple breakpoints. Always
    *>= 1 breakpoint.
    */
    disableBreakpoint: '{n, plural, =1 {Disable breakpoint} other {Disable all breakpoints in line}}',
    /**
    *@description Context menu command to enable a breakpoint that the user has
    *set. One line of code can have multiple breakpoints. Always >= 1 breakpoint.
    */
    enableBreakpoint: '{n, plural, =1 {Enable breakpoint} other {Enable all breakpoints in line}}',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    addSourceMap: 'Add source map…',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    sourceMapDetected: 'Source map detected.',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    prettyprintThisMinifiedFile: 'Pretty-print this minified file?',
    /**
    *@description Label of a button in the Sources panel to pretty-print the current file
    */
    prettyprint: 'Pretty-print',
    /**
    *@description Text in Debugger Plugin pretty-print details message of the Sources panel
    *@example {Debug} PH1
    */
    prettyprintingWillFormatThisFile: 'Pretty-printing will format this file in a new tab where you can continue debugging. You can also pretty-print this file by clicking the {PH1} button on the bottom status bar.',
    /**
    *@description Title of the Filtered List WidgetProvider of Quick Open
    *@example {Ctrl+P Ctrl+O} PH1
    */
    associatedFilesAreAvailable: 'Associated files are available via file tree or {PH1}.',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    associatedFilesShouldBeAdded: 'Associated files should be added to the file tree. You can debug these resolved source files as regular JavaScript files.',
    /**
    *@description Text in Debugger Plugin of the Sources panel
    */
    theDebuggerWillSkipStepping: 'The debugger will skip stepping through this script, and will not stop on exceptions.',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/DebuggerPlugin.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// eslint-disable-next-line no-unused-vars
class DecoratorWidget extends HTMLDivElement {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __nameToToken;
    constructor() {
        super();
    }
}
export class DebuggerPlugin extends Plugin {
    _textEditor;
    _uiSourceCode;
    _transformer;
    _executionLocation;
    _controlDown;
    _asyncStepInHoveredLine;
    _asyncStepInHovered;
    _clearValueWidgetsTimer;
    _sourceMapInfobar;
    _controlTimeout;
    _scriptsPanel;
    _breakpointManager;
    _popoverHelper;
    _boundPopoverHelperHide;
    _boundKeyDown;
    _boundKeyUp;
    _boundMouseMove;
    _boundMouseDown;
    _boundBlur;
    _boundWheel;
    _boundGutterClick;
    _breakpointDecorations;
    _decorationByBreakpoint;
    _possibleBreakpointsRequested;
    _scriptFileForDebuggerModel;
    _valueWidgets;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _continueToLocationDecorations;
    _liveLocationPool;
    _muted;
    _mutedFromStart;
    _ignoreListInfobar;
    _hasLineWithoutMapping;
    _prettyPrintInfobar;
    _scheduledBreakpointDecorationUpdates;
    constructor(textEditor, uiSourceCode, transformer) {
        super();
        this._textEditor = textEditor;
        this._uiSourceCode = uiSourceCode;
        this._transformer = transformer;
        this._executionLocation = null;
        this._controlDown = false;
        this._asyncStepInHoveredLine = 0;
        this._asyncStepInHovered = false;
        this._clearValueWidgetsTimer = null;
        this._sourceMapInfobar = null;
        this._controlTimeout = null;
        this._scriptsPanel = SourcesPanel.instance();
        this._breakpointManager = Bindings.BreakpointManager.BreakpointManager.instance();
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Debugger) {
            this._textEditor.element.classList.add('source-frame-debugger-script');
        }
        this._popoverHelper =
            new UI.PopoverHelper.PopoverHelper(this._scriptsPanel.element, this._getPopoverRequest.bind(this));
        this._popoverHelper.setDisableOnClick(true);
        this._popoverHelper.setTimeout(250, 250);
        this._popoverHelper.setHasPadding(true);
        this._boundPopoverHelperHide = this._popoverHelper.hidePopover.bind(this._popoverHelper);
        this._scriptsPanel.element.addEventListener('scroll', this._boundPopoverHelperHide, true);
        const shortcutHandlers = {
            'debugger.toggle-breakpoint': async () => {
                const selection = this._textEditor.selection();
                if (!selection) {
                    return false;
                }
                await this._toggleBreakpoint(selection.startLine, false);
                return true;
            },
            'debugger.toggle-breakpoint-enabled': async () => {
                const selection = this._textEditor.selection();
                if (!selection) {
                    return false;
                }
                await this._toggleBreakpoint(selection.startLine, true);
                return true;
            },
            'debugger.breakpoint-input-window': async () => {
                const selection = this._textEditor.selection();
                if (!selection) {
                    return false;
                }
                const breakpoints = this._lineBreakpointDecorations(selection.startLine)
                    .map(decoration => decoration.breakpoint)
                    .filter(breakpoint => Boolean(breakpoint));
                let breakpoint = null;
                if (breakpoints.length) {
                    breakpoint = breakpoints[0];
                }
                const isLogpoint = breakpoint ? breakpoint.condition().includes(LogpointPrefix) : false;
                this._editBreakpointCondition(selection.startLine, breakpoint, null, isLogpoint);
                return true;
            },
        };
        UI.ShortcutRegistry.ShortcutRegistry.instance().addShortcutListener(this._textEditor.element, shortcutHandlers);
        this._boundKeyDown = this._onKeyDown.bind(this);
        this._textEditor.element.addEventListener('keydown', this._boundKeyDown, true);
        this._boundKeyUp = this._onKeyUp.bind(this);
        this._textEditor.element.addEventListener('keyup', this._boundKeyUp, true);
        this._boundMouseMove = this._onMouseMove.bind(this);
        this._textEditor.element.addEventListener('mousemove', this._boundMouseMove, false);
        this._boundMouseDown = this._onMouseDown.bind(this);
        this._textEditor.element.addEventListener('mousedown', this._boundMouseDown, true);
        this._boundBlur = this._onBlur.bind(this);
        this._textEditor.element.addEventListener('focusout', this._boundBlur, false);
        this._boundWheel = this._onWheel.bind(this);
        this._textEditor.element.addEventListener('wheel', this._boundWheel, true);
        this._boundGutterClick = ((e) => {
            this._handleGutterClick(e);
        });
        this._textEditor.addEventListener(SourceFrame.SourcesTextEditor.Events.GutterClick, this._boundGutterClick, this);
        this._breakpointManager.addEventListener(Bindings.BreakpointManager.Events.BreakpointAdded, this._breakpointAdded, this);
        this._breakpointManager.addEventListener(Bindings.BreakpointManager.Events.BreakpointRemoved, this._breakpointRemoved, this);
        this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._workingCopyChanged, this);
        this._uiSourceCode.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._workingCopyCommitted, this);
        this._breakpointDecorations = new Set();
        this._decorationByBreakpoint = new Map();
        this._possibleBreakpointsRequested = new Set();
        this._scriptFileForDebuggerModel = new Map();
        Common.Settings.Settings.instance()
            .moduleSetting('skipStackFramesPattern')
            .addChangeListener(this._showIgnoreListInfobarIfNeeded, this);
        Common.Settings.Settings.instance()
            .moduleSetting('skipContentScripts')
            .addChangeListener(this._showIgnoreListInfobarIfNeeded, this);
        this._valueWidgets = new Map();
        this._continueToLocationDecorations = null;
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DebuggerModel.CallFrame, this._callFrameChanged, this);
        this._liveLocationPool = new Bindings.LiveLocation.LiveLocationPool();
        this._callFrameChanged();
        this._updateScriptFiles();
        if (this._uiSourceCode.isDirty()) {
            this._muted = true;
            this._mutedFromStart = true;
        }
        else {
            this._muted = false;
            this._mutedFromStart = false;
            this._initializeBreakpoints();
        }
        this._ignoreListInfobar = null;
        this._showIgnoreListInfobarIfNeeded();
        for (const scriptFile of this._scriptFileForDebuggerModel.values()) {
            scriptFile.checkMapping();
        }
        this._hasLineWithoutMapping = false;
        this._updateLinesWithoutMappingHighlight();
        if (!Root.Runtime.experiments.isEnabled('sourcesPrettyPrint')) {
            this._prettyPrintInfobar = null;
            this._detectMinified();
        }
    }
    static accepts(uiSourceCode) {
        return uiSourceCode.contentType().hasScripts();
    }
    _showIgnoreListInfobarIfNeeded() {
        const uiSourceCode = this._uiSourceCode;
        if (!uiSourceCode.contentType().hasScripts()) {
            return;
        }
        const projectType = uiSourceCode.project().type();
        if (!Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedUISourceCode(uiSourceCode)) {
            this._hideIgnoreListInfobar();
            return;
        }
        if (this._ignoreListInfobar) {
            this._ignoreListInfobar.dispose();
        }
        function unIgnoreList() {
            Bindings.IgnoreListManager.IgnoreListManager.instance().unIgnoreListUISourceCode(uiSourceCode);
            if (projectType === Workspace.Workspace.projectTypes.ContentScripts) {
                Bindings.IgnoreListManager.IgnoreListManager.instance().unIgnoreListContentScripts();
            }
        }
        const infobar = new UI.Infobar.Infobar(UI.Infobar.Type.Warning, i18nString(UIStrings.thisScriptIsOnTheDebuggersIgnore), [
            { text: i18nString(UIStrings.removeFromIgnoreList), highlight: false, delegate: unIgnoreList, dismiss: true },
            {
                text: i18nString(UIStrings.configure),
                highlight: false,
                delegate: UI.ViewManager.ViewManager.instance().showView.bind(UI.ViewManager.ViewManager.instance(), 'blackbox'),
                dismiss: false,
            },
        ]);
        this._ignoreListInfobar = infobar;
        infobar.createDetailsRowMessage(i18nString(UIStrings.theDebuggerWillSkipStepping));
        const scriptFile = this._scriptFileForDebuggerModel.size ? this._scriptFileForDebuggerModel.values().next().value : null;
        if (scriptFile && scriptFile.hasSourceMapURL()) {
            infobar.createDetailsRowMessage(i18nString(UIStrings.sourceMapFoundButIgnoredForFile));
        }
        this._textEditor.attachInfobar(this._ignoreListInfobar);
    }
    _hideIgnoreListInfobar() {
        if (!this._ignoreListInfobar) {
            return;
        }
        this._ignoreListInfobar.dispose();
        this._ignoreListInfobar = null;
    }
    wasShown() {
        if (this._executionLocation) {
            // We need SourcesTextEditor to be initialized prior to this call. @see crbug.com/499889
            queueMicrotask(() => {
                this._generateValuesInSource();
            });
        }
    }
    willHide() {
        this._popoverHelper.hidePopover();
    }
    async populateLineGutterContextMenu(contextMenu, editorLineNumber) {
        const uiLocation = new Workspace.UISourceCode.UILocation(this._uiSourceCode, editorLineNumber, 0);
        this._scriptsPanel.appendUILocationItems(contextMenu, uiLocation);
        const breakpoints = this._lineBreakpointDecorations(editorLineNumber)
            .map(decoration => decoration.breakpoint)
            .filter(breakpoint => Boolean(breakpoint));
        const supportsConditionalBreakpoints = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().supportsConditionalBreakpoints(this._uiSourceCode);
        if (!breakpoints.length) {
            if (!this._textEditor.hasLineClass(editorLineNumber, 'cm-non-breakable-line')) {
                contextMenu.debugSection().appendItem(i18nString(UIStrings.addBreakpoint), this._createNewBreakpoint.bind(this, editorLineNumber, '', true));
                if (supportsConditionalBreakpoints) {
                    contextMenu.debugSection().appendItem(i18nString(UIStrings.addConditionalBreakpoint), this._editBreakpointCondition.bind(this, editorLineNumber, null, null, false /* preferLogpoint */));
                    contextMenu.debugSection().appendItem(i18nString(UIStrings.addLogpoint), this._editBreakpointCondition.bind(this, editorLineNumber, null, null, true /* preferLogpoint */));
                    contextMenu.debugSection().appendItem(i18nString(UIStrings.neverPauseHere), this._createNewBreakpoint.bind(this, editorLineNumber, 'false', true));
                }
            }
        }
        else {
            const removeTitle = i18nString(UIStrings.removeBreakpoint, { n: breakpoints.length });
            contextMenu.debugSection().appendItem(removeTitle, () => breakpoints.map(breakpoint => breakpoint.remove(false)));
            if (breakpoints.length === 1 && supportsConditionalBreakpoints) {
                // Editing breakpoints only make sense for conditional breakpoints
                // and logpoints and both are currently only available for JavaScript
                // debugging.
                contextMenu.debugSection().appendItem(i18nString(UIStrings.editBreakpoint), this._editBreakpointCondition.bind(this, editorLineNumber, breakpoints[0], null, false /* preferLogpoint */));
            }
            const hasEnabled = breakpoints.some(breakpoint => breakpoint.enabled());
            if (hasEnabled) {
                const title = i18nString(UIStrings.disableBreakpoint, { n: breakpoints.length });
                contextMenu.debugSection().appendItem(title, () => breakpoints.map(breakpoint => breakpoint.setEnabled(false)));
            }
            const hasDisabled = breakpoints.some(breakpoint => !breakpoint.enabled());
            if (hasDisabled) {
                const title = i18nString(UIStrings.enableBreakpoint, { n: breakpoints.length });
                contextMenu.debugSection().appendItem(title, () => breakpoints.map(breakpoint => breakpoint.setEnabled(true)));
            }
        }
    }
    populateTextAreaContextMenu(contextMenu, editorLineNumber, editorColumnNumber) {
        function addSourceMapURL(scriptFile) {
            const dialog = new AddSourceMapURLDialog(addSourceMapURLDialogCallback.bind(null, scriptFile));
            dialog.show();
        }
        function addSourceMapURLDialogCallback(scriptFile, url) {
            if (!url) {
                return;
            }
            scriptFile.addSourceMapURL(url);
        }
        function populateSourceMapMembers() {
            if (this._uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Network &&
                Common.Settings.Settings.instance().moduleSetting('jsSourceMapsEnabled').get() &&
                !Bindings.IgnoreListManager.IgnoreListManager.instance().isIgnoreListedUISourceCode(this._uiSourceCode)) {
                if (this._scriptFileForDebuggerModel.size) {
                    const scriptFile = this._scriptFileForDebuggerModel.values().next().value;
                    const addSourceMapURLLabel = i18nString(UIStrings.addSourceMap);
                    contextMenu.debugSection().appendItem(addSourceMapURLLabel, addSourceMapURL.bind(null, scriptFile));
                }
            }
        }
        return super.populateTextAreaContextMenu(contextMenu, editorLineNumber, editorColumnNumber)
            .then(populateSourceMapMembers.bind(this));
    }
    _workingCopyChanged() {
        if (this._scriptFileForDebuggerModel.size) {
            return;
        }
        if (this._uiSourceCode.isDirty()) {
            this._muteBreakpointsWhileEditing();
        }
        else {
            this._restoreBreakpointsAfterEditing();
        }
    }
    _workingCopyCommitted(_event) {
        this._scriptsPanel.updateLastModificationTime();
        if (!this._scriptFileForDebuggerModel.size) {
            this._restoreBreakpointsAfterEditing();
        }
    }
    _didMergeToVM() {
        this._restoreBreakpointsIfConsistentScripts();
    }
    _didDivergeFromVM() {
        this._muteBreakpointsWhileEditing();
    }
    _muteBreakpointsWhileEditing() {
        if (this._muted) {
            return;
        }
        for (const decoration of this._breakpointDecorations) {
            this._updateBreakpointDecoration(decoration);
        }
        this._muted = true;
    }
    async _restoreBreakpointsIfConsistentScripts() {
        for (const scriptFile of this._scriptFileForDebuggerModel.values()) {
            if (scriptFile.hasDivergedFromVM() || scriptFile.isMergingToVM()) {
                return;
            }
        }
        await this._restoreBreakpointsAfterEditing();
    }
    async _restoreBreakpointsAfterEditing() {
        this._muted = false;
        if (this._mutedFromStart) {
            this._mutedFromStart = false;
            this._initializeBreakpoints();
            return;
        }
        const decorations = Array.from(this._breakpointDecorations);
        this._breakpointDecorations.clear();
        this._textEditor.operation(() => decorations.map(decoration => decoration.hide()));
        for (const decoration of decorations) {
            if (!decoration.breakpoint) {
                continue;
            }
            const enabled = decoration.enabled;
            decoration.breakpoint.remove(false);
            const location = decoration.handle.resolve();
            if (location) {
                await this._setBreakpoint(location.lineNumber, location.columnNumber, decoration.condition, enabled);
            }
        }
    }
    _isIdentifier(tokenType) {
        return tokenType.startsWith('js-variable') || tokenType.startsWith('js-property') || tokenType === 'js-def' ||
            tokenType === 'variable';
    }
    _getPopoverRequest(event) {
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event)) {
            return null;
        }
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        const debuggerModel = target ? target.model(SDK.DebuggerModel.DebuggerModel) : null;
        if (!debuggerModel || !debuggerModel.isPaused()) {
            return null;
        }
        const textPosition = this._textEditor.coordinatesToCursorPosition(event.x, event.y);
        if (!textPosition) {
            return null;
        }
        const mouseLine = textPosition.startLine;
        const mouseColumn = textPosition.startColumn;
        const textSelection = this._textEditor.selection().normalize();
        let editorLineNumber = -1;
        let startHighlight = -1;
        let endHighlight = -1;
        const selectedCallFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (!selectedCallFrame) {
            return null;
        }
        if (textSelection && !textSelection.isEmpty()) {
            if (textSelection.startLine !== textSelection.endLine || textSelection.startLine !== mouseLine ||
                mouseColumn < textSelection.startColumn || mouseColumn > textSelection.endColumn) {
                return null;
            }
            editorLineNumber = textSelection.startLine;
            startHighlight = textSelection.startColumn;
            endHighlight = textSelection.endColumn - 1;
        }
        else if (this._uiSourceCode.mimeType() === 'application/wasm') {
            const token = this._textEditor.tokenAtTextPosition(textPosition.startLine, textPosition.startColumn);
            if (!token || token.type !== 'variable-2') {
                return null;
            }
            editorLineNumber = textPosition.startLine;
            startHighlight = token.startColumn;
            endHighlight = token.endColumn - 1;
        }
        else {
            let token = this._textEditor.tokenAtTextPosition(textPosition.startLine, textPosition.startColumn);
            if (!token) {
                return null;
            }
            editorLineNumber = textPosition.startLine;
            const line = this._textEditor.line(editorLineNumber);
            let tokenContent = line.substring(token.startColumn, token.endColumn);
            // When the user hovers an opening bracket, we look for the closing bracket
            // and kick off the matching from that below.
            if (tokenContent === '[') {
                const closingColumn = line.indexOf(']', token.startColumn);
                if (closingColumn < 0) {
                    return null;
                }
                token = this._textEditor.tokenAtTextPosition(editorLineNumber, closingColumn);
                if (!token) {
                    return null;
                }
                tokenContent = line.substring(token.startColumn, token.endColumn);
            }
            startHighlight = token.startColumn;
            endHighlight = token.endColumn - 1;
            // Consume multiple `[index][0]...[f(1)]` at the end of the expression.
            while (tokenContent === ']') {
                startHighlight = line.lastIndexOf('[', startHighlight) - 1;
                if (startHighlight < 0) {
                    return null;
                }
                token = this._textEditor.tokenAtTextPosition(editorLineNumber, startHighlight);
                if (!token) {
                    return null;
                }
                tokenContent = line.substring(token.startColumn, token.endColumn);
                startHighlight = token.startColumn;
            }
            if (!token.type) {
                return null;
            }
            const isIdentifier = this._isIdentifier(token.type);
            if (!isIdentifier && (token.type !== 'js-keyword' || tokenContent !== 'this')) {
                return null;
            }
            while (startHighlight > 1 && line.charAt(startHighlight - 1) === '.') {
                // Consume multiple `[index][0]...[f(1)]` preceeding a dot.
                while (line.charAt(startHighlight - 2) === ']') {
                    startHighlight = line.lastIndexOf('[', startHighlight - 2) - 1;
                    if (startHighlight < 0) {
                        return null;
                    }
                }
                const tokenBefore = this._textEditor.tokenAtTextPosition(editorLineNumber, startHighlight - 2);
                if (!tokenBefore || !tokenBefore.type) {
                    return null;
                }
                if (tokenBefore.type === 'js-meta') {
                    break;
                }
                if (tokenBefore.type === 'js-string-2') {
                    // If we hit a template literal, find the opening ` in this line.
                    // TODO(bmeurer): We should eventually replace this tokenization
                    // approach with a proper soluation based on parsing, maybe reusing
                    // the Parser and AST inside V8 for this (or potentially relying on
                    // acorn to do the job).
                    if (tokenBefore.endColumn < 2) {
                        return null;
                    }
                    startHighlight = line.lastIndexOf('`', tokenBefore.endColumn - 2);
                    if (startHighlight < 0) {
                        return null;
                    }
                    break;
                }
                startHighlight = tokenBefore.startColumn;
            }
        }
        const leftCorner = this._textEditor.cursorPositionToCoordinates(editorLineNumber, startHighlight);
        const rightCorner = this._textEditor.cursorPositionToCoordinates(editorLineNumber, endHighlight);
        const box = new AnchorBox(leftCorner.x, leftCorner.y, rightCorner.x - leftCorner.x, leftCorner.height);
        let objectPopoverHelper = null;
        let highlightDescriptor = null;
        async function evaluate(uiSourceCode, evaluationText) {
            const resolvedText = await resolveExpression(selectedCallFrame, evaluationText, uiSourceCode, editorLineNumber, startHighlight, endHighlight);
            return await selectedCallFrame.evaluate({
                expression: resolvedText || evaluationText,
                objectGroup: 'popover',
                includeCommandLineAPI: false,
                silent: true,
                returnByValue: false,
                generatePreview: false,
                throwOnSideEffect: undefined,
                timeout: undefined,
                disableBreaks: undefined,
                replMode: undefined,
                allowUnsafeEvalBlockedByCSP: undefined,
            });
        }
        return {
            box,
            show: async (popover) => {
                const evaluationText = this._textEditor.line(editorLineNumber).substring(startHighlight, endHighlight + 1);
                const result = await evaluate(this._uiSourceCode, evaluationText);
                if (!result || 'error' in result || !result.object ||
                    (result.object.type === 'object' && result.object.subtype === 'error')) {
                    return false;
                }
                objectPopoverHelper =
                    await ObjectUI.ObjectPopoverHelper.ObjectPopoverHelper.buildObjectPopover(result.object, popover);
                const potentiallyUpdatedCallFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
                if (!objectPopoverHelper || selectedCallFrame !== potentiallyUpdatedCallFrame) {
                    debuggerModel.runtimeModel().releaseObjectGroup('popover');
                    if (objectPopoverHelper) {
                        objectPopoverHelper.dispose();
                    }
                    return false;
                }
                const highlightRange = new TextUtils.TextRange.TextRange(editorLineNumber, startHighlight, editorLineNumber, endHighlight);
                highlightDescriptor = this._textEditor.highlightRange(highlightRange, 'source-frame-eval-expression');
                return true;
            },
            hide: () => {
                if (objectPopoverHelper) {
                    objectPopoverHelper.dispose();
                }
                debuggerModel.runtimeModel().releaseObjectGroup('popover');
                if (highlightDescriptor) {
                    this._textEditor.removeHighlight(highlightDescriptor);
                }
            },
        };
    }
    _onWheel(event) {
        if (this._executionLocation && UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event)) {
            event.preventDefault();
        }
    }
    _onKeyDown(event) {
        if (!event.ctrlKey || (!event.metaKey && Host.Platform.isMac())) {
            this._clearControlDown();
        }
        if (event.key === 'Escape') {
            if (this._popoverHelper.isPopoverVisible()) {
                this._popoverHelper.hidePopover();
                event.consume();
            }
            return;
        }
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event) && this._executionLocation) {
            this._controlDown = true;
            if (event.key === (Host.Platform.isMac() ? 'Meta' : 'Control')) {
                this._controlTimeout = window.setTimeout(() => {
                    if (this._executionLocation && this._controlDown) {
                        this._showContinueToLocations();
                    }
                }, 150);
            }
        }
    }
    _onMouseMove(event) {
        if (this._executionLocation && this._controlDown &&
            UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event)) {
            if (!this._continueToLocationDecorations) {
                this._showContinueToLocations();
            }
        }
        if (this._continueToLocationDecorations) {
            const target = event.target;
            const textPosition = this._textEditor.coordinatesToCursorPosition(event.x, event.y);
            const hovering = Boolean(target.enclosingNodeOrSelfWithClass('source-frame-async-step-in'));
            this._setAsyncStepInHoveredLine(textPosition ? textPosition.startLine : null, hovering);
        }
    }
    _setAsyncStepInHoveredLine(editorLineNumber, hovered) {
        if (this._asyncStepInHoveredLine === editorLineNumber && this._asyncStepInHovered === hovered) {
            return;
        }
        if (this._asyncStepInHovered && this._asyncStepInHoveredLine) {
            this._textEditor.toggleLineClass(this._asyncStepInHoveredLine, 'source-frame-async-step-in-hovered', false);
        }
        this._asyncStepInHoveredLine = editorLineNumber;
        this._asyncStepInHovered = hovered;
        if (this._asyncStepInHovered && this._asyncStepInHoveredLine) {
            this._textEditor.toggleLineClass(this._asyncStepInHoveredLine, 'source-frame-async-step-in-hovered', true);
        }
    }
    _onMouseDown(event) {
        if (!this._executionLocation || !UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event)) {
            return;
        }
        if (!this._continueToLocationDecorations) {
            return;
        }
        event.consume();
        const textPosition = this._textEditor.coordinatesToCursorPosition(event.x, event.y);
        if (!textPosition) {
            return;
        }
        for (const decoration of this._continueToLocationDecorations.keys()) {
            const range = decoration.find();
            if (!range) {
                continue;
            }
            if (range.from.line !== textPosition.startLine || range.to.line !== textPosition.startLine) {
                continue;
            }
            if (range.from.ch <= textPosition.startColumn && textPosition.startColumn <= range.to.ch) {
                const callback = this._continueToLocationDecorations.get(decoration);
                if (!callback) {
                    throw new Error('Expected a function');
                }
                callback();
                break;
            }
        }
    }
    _onBlur(_event) {
        this._clearControlDown();
    }
    _onKeyUp(_event) {
        this._clearControlDown();
    }
    _clearControlDown() {
        this._controlDown = false;
        this._clearContinueToLocations();
        if (this._controlTimeout) {
            clearTimeout(this._controlTimeout);
        }
    }
    async _editBreakpointCondition(editorLineNumber, breakpoint, location, preferLogpoint) {
        const oldCondition = breakpoint ? breakpoint.condition() : '';
        const decorationElement = document.createElement('div');
        const dialog = new BreakpointEditDialog(editorLineNumber, oldCondition, Boolean(preferLogpoint), async (result) => {
            dialog.detach();
            this._textEditor.removeDecoration(decorationElement, editorLineNumber);
            if (!result.committed) {
                return;
            }
            if (breakpoint) {
                breakpoint.setCondition(result.condition);
            }
            else if (location) {
                await this._setBreakpoint(location.lineNumber, location.columnNumber, result.condition, true);
            }
            else {
                await this._createNewBreakpoint(editorLineNumber, result.condition, true);
            }
        });
        this._textEditor.addDecoration(decorationElement, editorLineNumber);
        dialog.markAsExternallyManaged();
        dialog.show(decorationElement);
        dialog.focusEditor();
    }
    async _executionLineChanged(liveLocation) {
        this._clearExecutionLine();
        const uiLocation = await liveLocation.uiLocation();
        if (!uiLocation || uiLocation.uiSourceCode.url() !== this._uiSourceCode.url()) {
            this._executionLocation = null;
            return;
        }
        this._executionLocation = uiLocation;
        const editorLocation = this._transformer.uiLocationToEditorLocation(uiLocation.lineNumber, uiLocation.columnNumber);
        this._textEditor.setExecutionLocation(editorLocation.lineNumber, editorLocation.columnNumber);
        if (this._textEditor.isShowing()) {
            // We need SourcesTextEditor to be initialized prior to this call. @see crbug.com/506566
            queueMicrotask(() => {
                if (this._controlDown) {
                    this._showContinueToLocations();
                }
                else {
                    this._generateValuesInSource();
                }
            });
        }
    }
    _generateValuesInSource() {
        if (!Common.Settings.Settings.instance().moduleSetting('inlineVariableValues').get()) {
            return;
        }
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (!executionContext) {
            return;
        }
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (!callFrame) {
            return;
        }
        const localScope = callFrame.localScope();
        const functionLocation = callFrame.functionLocation();
        if (localScope && functionLocation) {
            resolveScopeInObject(localScope)
                .getAllProperties(false, false)
                .then(this._prepareScopeVariables.bind(this, callFrame));
        }
    }
    _showContinueToLocations() {
        this._popoverHelper.hidePopover();
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (!executionContext) {
            return;
        }
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (!callFrame) {
            return;
        }
        const start = callFrame.functionLocation() || callFrame.location();
        const debuggerModel = callFrame.debuggerModel;
        debuggerModel.getPossibleBreakpoints(start, null, true)
            .then(locations => this._textEditor.operation(renderLocations.bind(this, locations)));
        function renderLocations(locations) {
            this._clearContinueToLocationsNoRestore();
            this._textEditor.hideExecutionLineBackground();
            this._continueToLocationDecorations = new Map();
            locations = locations.reverse();
            let previousCallLine = -1;
            for (const location of locations) {
                const editorLocation = this._transformer.uiLocationToEditorLocation(location.lineNumber, location.columnNumber);
                const tokenThatIsPossiblyNull = this._textEditor.tokenAtTextPosition(editorLocation.lineNumber, editorLocation.columnNumber);
                if (!tokenThatIsPossiblyNull) {
                    continue;
                }
                let token = tokenThatIsPossiblyNull;
                const line = this._textEditor.line(editorLocation.lineNumber);
                let tokenContent = line.substring(token.startColumn, token.endColumn);
                if (!token.type && tokenContent === '.') {
                    const nextToken = this._textEditor.tokenAtTextPosition(editorLocation.lineNumber, token.endColumn + 1);
                    if (!nextToken) {
                        throw new Error('nextToken should not be null.');
                    }
                    token = nextToken;
                    tokenContent = line.substring(token.startColumn, token.endColumn);
                }
                if (!token.type) {
                    continue;
                }
                const validKeyword = token.type === 'js-keyword' &&
                    (tokenContent === 'this' || tokenContent === 'return' || tokenContent === 'new' ||
                        tokenContent === 'continue' || tokenContent === 'break');
                if (!validKeyword && !this._isIdentifier(token.type)) {
                    continue;
                }
                if (previousCallLine === editorLocation.lineNumber &&
                    location.type !== "call" /* Call */) {
                    continue;
                }
                let highlightRange = new TextUtils.TextRange.TextRange(editorLocation.lineNumber, token.startColumn, editorLocation.lineNumber, token.endColumn - 1);
                let decoration = this._textEditor.highlightRange(highlightRange, 'source-frame-continue-to-location');
                this._continueToLocationDecorations.set(decoration, location.continueToLocation.bind(location));
                if (location.type === "call" /* Call */) {
                    previousCallLine = editorLocation.lineNumber;
                }
                let isAsyncCall = (line[token.startColumn - 1] === '.' && tokenContent === 'then') ||
                    tokenContent === 'setTimeout' || tokenContent === 'setInterval' || tokenContent === 'postMessage';
                if (tokenContent === 'new') {
                    const nextToken = this._textEditor.tokenAtTextPosition(editorLocation.lineNumber, token.endColumn + 1);
                    if (!nextToken) {
                        throw new Error('nextToken should not be null.');
                    }
                    token = nextToken;
                    tokenContent = line.substring(token.startColumn, token.endColumn);
                    isAsyncCall = tokenContent === 'Worker';
                }
                const isCurrentPosition = this._executionLocation &&
                    location.lineNumber === this._executionLocation.lineNumber &&
                    location.columnNumber === this._executionLocation.columnNumber;
                if (location.type === "call" /* Call */ && isAsyncCall) {
                    const asyncStepInRange = this._findAsyncStepInRange(this._textEditor, editorLocation.lineNumber, line, token.endColumn);
                    if (asyncStepInRange) {
                        highlightRange = new TextUtils.TextRange.TextRange(editorLocation.lineNumber, asyncStepInRange.from, editorLocation.lineNumber, asyncStepInRange.to - 1);
                        decoration = this._textEditor.highlightRange(highlightRange, 'source-frame-async-step-in');
                        this._continueToLocationDecorations.set(decoration, this._asyncStepIn.bind(this, location, Boolean(isCurrentPosition)));
                    }
                }
            }
            this._continueToLocationRenderedForTest();
        }
    }
    _continueToLocationRenderedForTest() {
    }
    _findAsyncStepInRange(textEditor, editorLineNumber, line, column) {
        let token = null;
        let tokenText;
        let from = column;
        let to = line.length;
        let position = line.indexOf('(', column);
        const argumentsStart = position;
        if (position === -1) {
            return null;
        }
        position++;
        skipWhitespace();
        if (position >= line.length) {
            return null;
        }
        token = nextToken();
        if (!token) {
            return null;
        }
        from = token.startColumn;
        if (token.type === 'js-keyword' && tokenText === 'async') {
            skipWhitespace();
            if (position >= line.length) {
                return { from: from, to: to };
            }
            token = nextToken();
            if (!token) {
                return { from: from, to: to };
            }
        }
        if (token.type === 'js-keyword' && tokenText === 'function') {
            return { from: from, to: to };
        }
        if (token.type === 'js-string') {
            return { from: argumentsStart, to: to };
        }
        if (token.type && this._isIdentifier(token.type)) {
            return { from: from, to: to };
        }
        if (tokenText !== '(') {
            return null;
        }
        const closeParen = line.indexOf(')', position);
        if (closeParen === -1 || line.substring(position, closeParen).indexOf('(') !== -1) {
            return { from: from, to: to };
        }
        return { from: from, to: closeParen + 1 };
        function nextToken() {
            token = textEditor.tokenAtTextPosition(editorLineNumber, position);
            if (token) {
                position = token.endColumn;
                to = token.endColumn;
                tokenText = line.substring(token.startColumn, token.endColumn);
            }
            return token;
        }
        function skipWhitespace() {
            while (position < line.length) {
                if (line[position] === ' ') {
                    position++;
                    continue;
                }
                const token = textEditor.tokenAtTextPosition(editorLineNumber, position);
                if (!token) {
                    throw new Error('expected token to not be null');
                }
                if (token.type === 'js-comment') {
                    position = token.endColumn;
                    continue;
                }
                break;
            }
        }
    }
    _asyncStepIn(location, isCurrentPosition) {
        if (!isCurrentPosition) {
            location.continueToLocation(asyncStepIn);
        }
        else {
            asyncStepIn();
        }
        function asyncStepIn() {
            location.debuggerModel.scheduleStepIntoAsync();
        }
    }
    async _prepareScopeVariables(callFrame, allProperties) {
        const properties = allProperties.properties;
        this._clearValueWidgets();
        if (!properties || !properties.length || properties.length > 500 || !this._textEditor.isShowing()) {
            return;
        }
        const functionUILocationPromise = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(callFrame.functionLocation());
        const executionUILocationPromise = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(callFrame.location());
        const [functionUILocation, executionUILocation] = await Promise.all([functionUILocationPromise, executionUILocationPromise]);
        if (!functionUILocation || !executionUILocation ||
            functionUILocation.uiSourceCode.url() !== this._uiSourceCode.url() ||
            executionUILocation.uiSourceCode.url() !== this._uiSourceCode.url()) {
            return;
        }
        const functionEditorLocation = this._transformer.uiLocationToEditorLocation(functionUILocation.lineNumber, functionUILocation.columnNumber);
        const executionEditorLocation = this._transformer.uiLocationToEditorLocation(executionUILocation.lineNumber, executionUILocation.columnNumber);
        const fromLine = functionEditorLocation.lineNumber;
        const fromColumn = functionEditorLocation.columnNumber;
        const toLine = executionEditorLocation.lineNumber;
        if (fromLine >= toLine || toLine - fromLine > 500 || fromLine < 0 || toLine >= this._textEditor.linesCount) {
            return;
        }
        const valuesMap = new Map();
        for (const property of properties) {
            valuesMap.set(property.name, property.value);
        }
        const namesPerLine = new Map();
        let skipObjectProperty = false;
        const tokenizer = TextUtils.CodeMirrorUtils.TokenizerFactory.instance().createTokenizer('text/javascript');
        tokenizer(this._textEditor.line(fromLine).substring(fromColumn), processToken.bind(this, fromLine));
        for (let i = fromLine + 1; i < toLine; ++i) {
            tokenizer(this._textEditor.line(i), processToken.bind(this, i));
        }
        function processToken(editorLineNumber, tokenValue, tokenType, _column, _newColumn) {
            if (!skipObjectProperty && tokenType && this._isIdentifier(tokenType) && valuesMap.get(tokenValue)) {
                let names = namesPerLine.get(editorLineNumber);
                if (!names) {
                    names = new Set();
                    namesPerLine.set(editorLineNumber, names);
                }
                names.add(tokenValue);
            }
            skipObjectProperty = tokenValue === '.';
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // @ts-expect-error
        this._textEditor.operation(this._renderDecorations.bind(this, valuesMap, namesPerLine, fromLine, toLine));
    }
    _renderDecorations(valuesMap, namesPerLine, fromLine, toLine) {
        const formatter = new ObjectUI.RemoteObjectPreviewFormatter.RemoteObjectPreviewFormatter();
        for (let i = fromLine; i < toLine; ++i) {
            const names = namesPerLine.get(i);
            const oldWidget = this._valueWidgets.get(i);
            if (!names) {
                if (oldWidget) {
                    this._valueWidgets.delete(i);
                    this._textEditor.removeDecoration(oldWidget, i);
                }
                continue;
            }
            const widget = document.createElement('div');
            widget.classList.add('text-editor-value-decoration');
            const base = this._textEditor.cursorPositionToCoordinates(i, 0);
            if (!base) {
                throw new Error('base is expected to not be null');
            }
            const offset = this._textEditor.cursorPositionToCoordinates(i, this._textEditor.line(i).length);
            if (!offset) {
                throw new Error('offset is expected to not be null');
            }
            const codeMirrorLinesLeftPadding = 4;
            const left = offset.x - base.x + codeMirrorLinesLeftPadding;
            widget.style.left = left + 'px';
            widget.__nameToToken = new Map();
            let renderedNameCount = 0;
            for (const name of names) {
                if (renderedNameCount > 10) {
                    break;
                }
                const names = namesPerLine.get(i - 1);
                if (names && names.has(name)) {
                    continue;
                } // Only render name once in the given continuous block.
                if (renderedNameCount) {
                    UI.UIUtils.createTextChild(widget, ', ');
                }
                const nameValuePair = widget.createChild('span');
                widget.__nameToToken.set(name, nameValuePair);
                UI.UIUtils.createTextChild(nameValuePair, name + ' = ');
                const value = valuesMap.get(name);
                if (!value) {
                    throw new Error('value is expected to be null');
                }
                const propertyCount = value.preview ? value.preview.properties.length : 0;
                const entryCount = value.preview && value.preview.entries ? value.preview.entries.length : 0;
                if (value.preview && propertyCount + entryCount < 10) {
                    formatter.appendObjectPreview(nameValuePair, value.preview, false /* isEntry */);
                }
                else {
                    const propertyValue = ObjectUI.ObjectPropertiesSection.ObjectPropertiesSection.createPropertyValue(value, /* wasThrown */ false, /* showPreview */ false);
                    nameValuePair.appendChild(propertyValue.element);
                }
                ++renderedNameCount;
            }
            let widgetChanged = true;
            if (oldWidget) {
                widgetChanged = false;
                for (const name of widget.__nameToToken.keys()) {
                    const oldTextElement = oldWidget.__nameToToken.get(name);
                    const newTextElement = widget.__nameToToken.get(name);
                    const oldText = oldTextElement ? oldTextElement.textContent : '';
                    const newText = newTextElement ? newTextElement.textContent : '';
                    if (newText !== oldText) {
                        widgetChanged = true;
                        UI.UIUtils.runCSSAnimationOnce(widget.__nameToToken.get(name), 'source-frame-value-update-highlight');
                    }
                }
                if (widgetChanged) {
                    this._valueWidgets.delete(i);
                    this._textEditor.removeDecoration(oldWidget, i);
                }
            }
            if (widgetChanged) {
                this._valueWidgets.set(i, widget);
                this._textEditor.addDecoration(widget, i);
            }
        }
    }
    _clearExecutionLine() {
        this._textEditor.operation(() => {
            if (this._executionLocation) {
                this._textEditor.clearExecutionLine();
            }
            this._executionLocation = null;
            if (this._clearValueWidgetsTimer) {
                clearTimeout(this._clearValueWidgetsTimer);
                this._clearValueWidgetsTimer = null;
            }
            this._clearValueWidgetsTimer = window.setTimeout(this._clearValueWidgets.bind(this), 1000);
            this._clearContinueToLocationsNoRestore();
        });
    }
    _clearValueWidgets() {
        if (this._clearValueWidgetsTimer) {
            clearTimeout(this._clearValueWidgetsTimer);
        }
        this._clearValueWidgetsTimer = null;
        this._textEditor.operation(() => {
            for (const line of this._valueWidgets.keys()) {
                const valueWidget = this._valueWidgets.get(line);
                if (valueWidget) {
                    this._textEditor.removeDecoration(valueWidget, line);
                }
            }
            this._valueWidgets.clear();
        });
    }
    _clearContinueToLocationsNoRestore() {
        const continueToLocationDecorations = this._continueToLocationDecorations;
        if (!continueToLocationDecorations) {
            return;
        }
        this._textEditor.operation(() => {
            for (const decoration of continueToLocationDecorations.keys()) {
                this._textEditor.removeHighlight(decoration);
            }
            this._continueToLocationDecorations = null;
            this._setAsyncStepInHoveredLine(null, false);
        });
    }
    _clearContinueToLocations() {
        if (!this._continueToLocationDecorations) {
            return;
        }
        this._textEditor.operation(() => {
            this._textEditor.showExecutionLineBackground();
            this._generateValuesInSource();
            this._clearContinueToLocationsNoRestore();
        });
    }
    _lineBreakpointDecorations(lineNumber) {
        return Array.from(this._breakpointDecorations)
            .filter(decoration => (decoration.handle.resolve() || {}).lineNumber === lineNumber);
    }
    _breakpointDecoration(editorLineNumber, editorColumnNumber) {
        for (const decoration of this._breakpointDecorations) {
            const location = decoration.handle.resolve();
            if (!location) {
                continue;
            }
            if (location.lineNumber === editorLineNumber && location.columnNumber === editorColumnNumber) {
                return decoration;
            }
        }
        return null;
    }
    _updateBreakpointDecoration(decoration) {
        if (!this._scheduledBreakpointDecorationUpdates) {
            this._scheduledBreakpointDecorationUpdates = new Set();
            queueMicrotask(() => {
                this._textEditor.operation(update.bind(this));
            });
        }
        this._scheduledBreakpointDecorationUpdates.add(decoration);
        function update() {
            if (!this._scheduledBreakpointDecorationUpdates) {
                return;
            }
            const editorLineNumbers = new Set();
            for (const decoration of this._scheduledBreakpointDecorationUpdates) {
                const location = decoration.handle.resolve();
                if (!location) {
                    continue;
                }
                editorLineNumbers.add(location.lineNumber);
            }
            this._scheduledBreakpointDecorationUpdates = null;
            let waitingForInlineDecorations = false;
            for (const lineNumber of editorLineNumbers) {
                const decorations = this._lineBreakpointDecorations(lineNumber);
                updateGutter.call(this, lineNumber, decorations);
                if (this._possibleBreakpointsRequested.has(lineNumber)) {
                    waitingForInlineDecorations = true;
                    continue;
                }
                updateInlineDecorations.call(this, lineNumber, decorations);
            }
            if (!waitingForInlineDecorations) {
                this._breakpointDecorationsUpdatedForTest();
            }
        }
        function updateGutter(editorLineNumber, decorations) {
            this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint', false);
            this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-disabled', false);
            this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-unbound', false);
            this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-conditional', false);
            this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-logpoint', false);
            if (decorations.length) {
                decorations.sort(BreakpointDecoration.mostSpecificFirst);
                const isDisabled = !decorations[0].enabled || this._muted;
                const isLogpoint = decorations[0].condition.includes(LogpointPrefix);
                const isUnbound = !decorations[0].bound;
                const isConditionalBreakpoint = Boolean(decorations[0].condition) && !isLogpoint;
                this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint', true);
                this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-disabled', isDisabled);
                this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-unbound', isUnbound && !isDisabled);
                this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-logpoint', isLogpoint);
                this._textEditor.toggleLineClass(editorLineNumber, 'cm-breakpoint-conditional', isConditionalBreakpoint);
            }
        }
        function updateInlineDecorations(editorLineNumber, decorations) {
            const actualBookmarks = new Set(
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            decorations.map(decoration => decoration.bookmark).filter(bookmark => Boolean(bookmark)));
            const lineEnd = this._textEditor.line(editorLineNumber).length;
            const bookmarks = this._textEditor.bookmarks(new TextUtils.TextRange.TextRange(editorLineNumber, 0, editorLineNumber, lineEnd), BreakpointDecoration.bookmarkSymbol);
            for (const bookmark of bookmarks) {
                if (!actualBookmarks.has(bookmark)) {
                    bookmark.clear();
                }
            }
            if (!decorations.length) {
                return;
            }
            if (decorations.length > 1) {
                for (const decoration of decorations) {
                    decoration.update();
                    if (!this._muted) {
                        decoration.show();
                    }
                    else {
                        decoration.hide();
                    }
                }
            }
            else {
                decorations[0].update();
                decorations[0].hide();
            }
        }
    }
    _breakpointDecorationsUpdatedForTest() {
    }
    async _inlineBreakpointClick(decoration, event) {
        event.consume(true);
        if (decoration.breakpoint) {
            if (event.shiftKey) {
                decoration.breakpoint.setEnabled(!decoration.breakpoint.enabled());
            }
            else {
                decoration.breakpoint.remove(false);
            }
        }
        else {
            const editorLocation = decoration.handle.resolve();
            if (!editorLocation) {
                return;
            }
            const location = this._transformer.editorLocationToUILocation(editorLocation.lineNumber, editorLocation.columnNumber);
            await this._setBreakpoint(location.lineNumber, location.columnNumber, decoration.condition, true);
        }
    }
    _inlineBreakpointContextMenu(decoration, event) {
        event.consume(true);
        const editorLocation = decoration.handle.resolve();
        if (!editorLocation) {
            return;
        }
        if (this._textEditor.hasLineClass(editorLocation.lineNumber, 'cm-non-breakable-line')) {
            return;
        }
        if (!Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().supportsConditionalBreakpoints(this._uiSourceCode)) {
            // Editing breakpoints only make sense for conditional breakpoints
            // and logpoints.
            return;
        }
        const location = this._transformer.editorLocationToUILocation(editorLocation.lineNumber, editorLocation.columnNumber);
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        if (decoration.breakpoint) {
            contextMenu.debugSection().appendItem(i18nString(UIStrings.editBreakpoint), this._editBreakpointCondition.bind(this, editorLocation.lineNumber, decoration.breakpoint, null, false /* preferLogpoint */));
        }
        else {
            contextMenu.debugSection().appendItem(i18nString(UIStrings.addConditionalBreakpoint), this._editBreakpointCondition.bind(this, editorLocation.lineNumber, null, editorLocation, false /* preferLogpoint */));
            contextMenu.debugSection().appendItem(i18nString(UIStrings.addLogpoint), this._editBreakpointCondition.bind(this, editorLocation.lineNumber, null, editorLocation, true /* preferLogpoint */));
            contextMenu.debugSection().appendItem(i18nString(UIStrings.neverPauseHere), this._setBreakpoint.bind(this, location.lineNumber, location.columnNumber, 'false', true));
        }
        contextMenu.show();
    }
    _shouldIgnoreExternalBreakpointEvents(event) {
        const uiLocation = event.data.uiLocation;
        if (uiLocation.uiSourceCode !== this._uiSourceCode) {
            return true;
        }
        if (this._muted) {
            return true;
        }
        for (const scriptFile of this._scriptFileForDebuggerModel.values()) {
            if (scriptFile.isDivergingFromVM() || scriptFile.isMergingToVM()) {
                return true;
            }
        }
        return false;
    }
    _breakpointAdded(event) {
        if (this._shouldIgnoreExternalBreakpointEvents(event)) {
            return;
        }
        const uiLocation = event.data.uiLocation;
        const breakpoint = event.data.breakpoint;
        this._addBreakpoint(uiLocation, breakpoint);
    }
    _addBreakpoint(uiLocation, breakpoint) {
        const editorLocation = this._transformer.uiLocationToEditorLocation(uiLocation.lineNumber, uiLocation.columnNumber);
        const lineDecorations = this._lineBreakpointDecorations(uiLocation.lineNumber);
        let decoration = this._breakpointDecoration(editorLocation.lineNumber, editorLocation.columnNumber);
        if (decoration) {
            decoration.breakpoint = breakpoint;
            decoration.condition = breakpoint.condition();
            decoration.enabled = breakpoint.enabled();
        }
        else {
            const handle = this._textEditor.textEditorPositionHandle(editorLocation.lineNumber, editorLocation.columnNumber);
            decoration = new BreakpointDecoration(this._textEditor, handle, breakpoint.condition(), breakpoint.enabled(), breakpoint.bound() || !breakpoint.hasBoundScript(), breakpoint);
            decoration.element.addEventListener('click', this._inlineBreakpointClick.bind(this, decoration), true);
            decoration.element.addEventListener('contextmenu', this._inlineBreakpointContextMenu.bind(this, decoration), true);
            this._breakpointDecorations.add(decoration);
        }
        this._decorationByBreakpoint.set(breakpoint, decoration);
        this._updateBreakpointDecoration(decoration);
        if (breakpoint.enabled() && !lineDecorations.length) {
            this._possibleBreakpointsRequested.add(editorLocation.lineNumber);
            const start = this._transformer.editorLocationToUILocation(editorLocation.lineNumber, 0);
            const end = this._transformer.editorLocationToUILocation(editorLocation.lineNumber + 1, 0);
            this._breakpointManager
                .possibleBreakpoints(this._uiSourceCode, new TextUtils.TextRange.TextRange(start.lineNumber, start.columnNumber || 0, end.lineNumber, end.columnNumber || 0))
                .then(addInlineDecorations.bind(this, editorLocation.lineNumber));
        }
        function addInlineDecorations(editorLineNumber, possibleLocations) {
            this._possibleBreakpointsRequested.delete(editorLineNumber);
            const decorations = this._lineBreakpointDecorations(editorLineNumber);
            for (const decoration of decorations) {
                this._updateBreakpointDecoration(decoration);
            }
            if (!decorations.some(decoration => Boolean(decoration.breakpoint))) {
                return;
            }
            const columns = new Set();
            for (const decoration of decorations) {
                const editorLocation = decoration.handle.resolve();
                if (!editorLocation) {
                    continue;
                }
                columns.add(editorLocation.columnNumber);
            }
            // Only consider the first 100 inline breakpoints, as DevTools might appear to hang while CodeMirror is updating
            // the inline breakpoints. See crbug.com/1060105.
            for (const location of possibleLocations.slice(0, 100)) {
                const editorLocation = this._transformer.uiLocationToEditorLocation(location.lineNumber, location.columnNumber);
                if (editorLocation.lineNumber !== editorLineNumber) {
                    continue;
                }
                if (columns.has(editorLocation.columnNumber)) {
                    continue;
                }
                const handle = this._textEditor.textEditorPositionHandle(editorLocation.lineNumber, editorLocation.columnNumber);
                const decoration = new BreakpointDecoration(this._textEditor, handle, '', /** enabled */ false, /** bound */ false, /** breakpoint */ null);
                decoration.element.addEventListener('click', this._inlineBreakpointClick.bind(this, decoration), true);
                decoration.element.addEventListener('contextmenu', this._inlineBreakpointContextMenu.bind(this, decoration), true);
                this._breakpointDecorations.add(decoration);
                this._updateBreakpointDecoration(decoration);
            }
        }
    }
    _breakpointRemoved(event) {
        if (this._shouldIgnoreExternalBreakpointEvents(event)) {
            return;
        }
        const uiLocation = event.data.uiLocation;
        const breakpoint = event.data.breakpoint;
        const decoration = this._decorationByBreakpoint.get(breakpoint);
        if (!decoration) {
            return;
        }
        this._decorationByBreakpoint.delete(breakpoint);
        const editorLocation = this._transformer.uiLocationToEditorLocation(uiLocation.lineNumber, uiLocation.columnNumber);
        decoration.breakpoint = null;
        decoration.enabled = false;
        const lineDecorations = this._lineBreakpointDecorations(editorLocation.lineNumber);
        if (!lineDecorations.some(decoration => Boolean(decoration.breakpoint))) {
            for (const lineDecoration of lineDecorations) {
                this._breakpointDecorations.delete(lineDecoration);
                this._updateBreakpointDecoration(lineDecoration);
            }
        }
        else {
            this._updateBreakpointDecoration(decoration);
        }
    }
    _initializeBreakpoints() {
        const breakpointLocations = this._breakpointManager.breakpointLocationsForUISourceCode(this._uiSourceCode);
        for (const breakpointLocation of breakpointLocations) {
            this._addBreakpoint(breakpointLocation.uiLocation, breakpointLocation.breakpoint);
        }
    }
    _updateLinesWithoutMappingHighlight() {
        if (Bindings.CompilerScriptMapping.CompilerScriptMapping.uiSourceCodeOrigin(this._uiSourceCode).length) {
            const linesCount = this._textEditor.linesCount;
            for (let i = 0; i < linesCount; ++i) {
                const lineHasMapping = Bindings.CompilerScriptMapping.CompilerScriptMapping.uiLineHasMapping(this._uiSourceCode, i);
                if (!lineHasMapping) {
                    this._hasLineWithoutMapping = true;
                }
                if (this._hasLineWithoutMapping) {
                    this._textEditor.toggleLineClass(i, 'cm-non-breakable-line', !lineHasMapping);
                }
            }
            return;
        }
        const { pluginManager } = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance();
        if (pluginManager) {
            pluginManager.getMappedLines(this._uiSourceCode)
                .then(mappedLines => {
                if (mappedLines === undefined) {
                    return;
                }
                const linesCount = this._textEditor.linesCount;
                for (let i = 0; i < linesCount; ++i) {
                    const lineHasMapping = mappedLines.has(i);
                    if (!lineHasMapping) {
                        this._hasLineWithoutMapping = true;
                    }
                    if (this._hasLineWithoutMapping) {
                        this._textEditor.toggleLineClass(i, 'cm-non-breakable-line', !lineHasMapping);
                    }
                }
            })
                .catch(console.error);
        }
    }
    _updateScriptFiles() {
        for (const debuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel)) {
            const scriptFile = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptFile(this._uiSourceCode, debuggerModel);
            if (scriptFile) {
                this._updateScriptFile(debuggerModel);
            }
        }
    }
    _updateScriptFile(debuggerModel) {
        const oldScriptFile = this._scriptFileForDebuggerModel.get(debuggerModel);
        const newScriptFile = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().scriptFile(this._uiSourceCode, debuggerModel);
        this._scriptFileForDebuggerModel.delete(debuggerModel);
        if (oldScriptFile) {
            oldScriptFile.removeEventListener(Bindings.ResourceScriptMapping.ResourceScriptFile.Events.DidMergeToVM, this._didMergeToVM, this);
            oldScriptFile.removeEventListener(Bindings.ResourceScriptMapping.ResourceScriptFile.Events.DidDivergeFromVM, this._didDivergeFromVM, this);
            if (this._muted && !this._uiSourceCode.isDirty()) {
                this._restoreBreakpointsIfConsistentScripts();
            }
        }
        if (!newScriptFile) {
            return;
        }
        this._scriptFileForDebuggerModel.set(debuggerModel, newScriptFile);
        newScriptFile.addEventListener(Bindings.ResourceScriptMapping.ResourceScriptFile.Events.DidMergeToVM, this._didMergeToVM, this);
        newScriptFile.addEventListener(Bindings.ResourceScriptMapping.ResourceScriptFile.Events.DidDivergeFromVM, this._didDivergeFromVM, this);
        newScriptFile.checkMapping();
        if (newScriptFile.hasSourceMapURL()) {
            this._showSourceMapInfobar();
        }
    }
    _showSourceMapInfobar() {
        if (this._sourceMapInfobar) {
            return;
        }
        this._sourceMapInfobar = UI.Infobar.Infobar.create(UI.Infobar.Type.Info, i18nString(UIStrings.sourceMapDetected), [], Common.Settings.Settings.instance().createSetting('sourceMapInfobarDisabled', false));
        if (!this._sourceMapInfobar) {
            return;
        }
        this._sourceMapInfobar.createDetailsRowMessage(i18nString(UIStrings.associatedFilesShouldBeAdded));
        this._sourceMapInfobar.createDetailsRowMessage(i18nString(UIStrings.associatedFilesAreAvailable, { PH1: UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutTitleForAction('quickOpen.show') }));
        this._sourceMapInfobar.setCloseCallback(() => {
            this._sourceMapInfobar = null;
        });
        this._textEditor.attachInfobar(this._sourceMapInfobar);
    }
    async _detectMinified() {
        const content = this._uiSourceCode.content();
        if (!content || !TextUtils.TextUtils.isMinified(content)) {
            return;
        }
        const editorActions = getRegisteredEditorActions();
        let formatterCallback = null;
        for (const editorAction of editorActions) {
            if (editorAction instanceof ScriptFormatterEditorAction) {
                // Check if the source code is formattable the same way the pretty print button does
                if (!editorAction.isCurrentUISourceCodeFormattable()) {
                    return;
                }
                formatterCallback = editorAction.toggleFormatScriptSource.bind(editorAction);
                break;
            }
        }
        this._prettyPrintInfobar = UI.Infobar.Infobar.create(UI.Infobar.Type.Info, i18nString(UIStrings.prettyprintThisMinifiedFile), [{ text: i18nString(UIStrings.prettyprint), delegate: formatterCallback, highlight: true, dismiss: true }], Common.Settings.Settings.instance().createSetting('prettyPrintInfobarDisabled', false));
        if (!this._prettyPrintInfobar) {
            return;
        }
        this._prettyPrintInfobar.setCloseCallback(() => {
            this._prettyPrintInfobar = null;
        });
        const toolbar = new UI.Toolbar.Toolbar('');
        const button = new UI.Toolbar.ToolbarButton('', 'largeicon-pretty-print');
        toolbar.appendToolbarItem(button);
        toolbar.element.style.display = 'inline-block';
        toolbar.element.style.verticalAlign = 'middle';
        toolbar.element.style.marginBottom = '3px';
        toolbar.element.style.pointerEvents = 'none';
        toolbar.element.tabIndex = -1;
        const element = this._prettyPrintInfobar.createDetailsRowMessage();
        element.appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.prettyprintingWillFormatThisFile, { PH1: toolbar.element }));
        UI.ARIAUtils.markAsAlert(element);
        this._textEditor.attachInfobar(this._prettyPrintInfobar);
    }
    async _handleGutterClick(event) {
        if (this._muted) {
            return;
        }
        const eventData = event.data;
        if (eventData.gutterType !== SourceFrame.SourcesTextEditor.lineNumbersGutterType) {
            return;
        }
        const editorLineNumber = eventData.lineNumber;
        const eventObject = eventData.event;
        if (eventObject.button !== 0 || eventObject.altKey || eventObject.ctrlKey || eventObject.metaKey) {
            return;
        }
        await this._toggleBreakpoint(editorLineNumber, eventObject.shiftKey);
        eventObject.consume(true);
    }
    async _toggleBreakpoint(editorLineNumber, onlyDisable) {
        const decorations = this._lineBreakpointDecorations(editorLineNumber);
        if (!decorations.length) {
            await this._createNewBreakpoint(editorLineNumber, '', true);
            return;
        }
        const hasDisabled = this._textEditor.hasLineClass(editorLineNumber, 'cm-breakpoint-disabled');
        const breakpoints = decorations.map(decoration => decoration.breakpoint).filter(breakpoint => Boolean(breakpoint));
        for (const breakpoint of breakpoints) {
            if (onlyDisable) {
                breakpoint.setEnabled(hasDisabled);
            }
            else {
                breakpoint.remove(false);
            }
        }
    }
    async _createNewBreakpoint(editorLineNumber, condition, enabled) {
        if (this._textEditor.hasLineClass(editorLineNumber, 'cm-non-breakable-line')) {
            return;
        }
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.ScriptsBreakpointSet);
        const origin = this._transformer.editorLocationToUILocation(editorLineNumber);
        await this._setBreakpoint(origin.lineNumber, origin.columnNumber, condition, enabled);
    }
    async _setBreakpoint(lineNumber, columnNumber, condition, enabled) {
        Common.Settings.Settings.instance().moduleSetting('breakpointsActive').set(true);
        await this._breakpointManager.setBreakpoint(this._uiSourceCode, lineNumber, columnNumber, condition, enabled);
        this._breakpointWasSetForTest(lineNumber, columnNumber, condition, enabled);
    }
    _breakpointWasSetForTest(_lineNumber, _columnNumber, _condition, _enabled) {
    }
    async _callFrameChanged() {
        this._liveLocationPool.disposeAll();
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (!callFrame) {
            this._clearExecutionLine();
            return;
        }
        await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createCallFrameLiveLocation(callFrame.location(), this._executionLineChanged.bind(this), this._liveLocationPool);
    }
    dispose() {
        for (const decoration of this._breakpointDecorations) {
            decoration.dispose();
        }
        this._breakpointDecorations.clear();
        if (this._scheduledBreakpointDecorationUpdates) {
            for (const decoration of this._scheduledBreakpointDecorationUpdates) {
                decoration.dispose();
            }
            this._scheduledBreakpointDecorationUpdates.clear();
        }
        this._hideIgnoreListInfobar();
        if (this._sourceMapInfobar) {
            this._sourceMapInfobar.dispose();
        }
        if (this._prettyPrintInfobar) {
            this._prettyPrintInfobar.dispose();
        }
        this._scriptsPanel.element.removeEventListener('scroll', this._boundPopoverHelperHide, true);
        for (const script of this._scriptFileForDebuggerModel.values()) {
            script.removeEventListener(Bindings.ResourceScriptMapping.ResourceScriptFile.Events.DidMergeToVM, this._didMergeToVM, this);
            script.removeEventListener(Bindings.ResourceScriptMapping.ResourceScriptFile.Events.DidDivergeFromVM, this._didDivergeFromVM, this);
        }
        this._scriptFileForDebuggerModel.clear();
        this._textEditor.element.removeEventListener('keydown', this._boundKeyDown, true);
        this._textEditor.element.removeEventListener('keyup', this._boundKeyUp, true);
        this._textEditor.element.removeEventListener('mousemove', this._boundMouseMove, false);
        this._textEditor.element.removeEventListener('mousedown', this._boundMouseDown, true);
        this._textEditor.element.removeEventListener('focusout', this._boundBlur, false);
        this._textEditor.element.removeEventListener('wheel', this._boundWheel, true);
        this._textEditor.removeEventListener(SourceFrame.SourcesTextEditor.Events.GutterClick, this._boundGutterClick, this);
        this._popoverHelper.hidePopover();
        this._popoverHelper.dispose();
        this._breakpointManager.removeEventListener(Bindings.BreakpointManager.Events.BreakpointAdded, this._breakpointAdded, this);
        this._breakpointManager.removeEventListener(Bindings.BreakpointManager.Events.BreakpointRemoved, this._breakpointRemoved, this);
        this._uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged, this._workingCopyChanged, this);
        this._uiSourceCode.removeEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted, this._workingCopyCommitted, this);
        Common.Settings.Settings.instance()
            .moduleSetting('skipStackFramesPattern')
            .removeChangeListener(this._showIgnoreListInfobarIfNeeded, this);
        Common.Settings.Settings.instance()
            .moduleSetting('skipContentScripts')
            .removeChangeListener(this._showIgnoreListInfobarIfNeeded, this);
        super.dispose();
        this._clearExecutionLine();
        UI.Context.Context.instance().removeFlavorChangeListener(SDK.DebuggerModel.CallFrame, this._callFrameChanged, this);
        this._liveLocationPool.disposeAll();
    }
}
export class BreakpointDecoration {
    _textEditor;
    handle;
    condition;
    enabled;
    bound;
    breakpoint;
    element;
    bookmark;
    constructor(textEditor, handle, condition, enabled, bound, breakpoint) {
        this._textEditor = textEditor;
        this.handle = handle;
        this.condition = condition;
        this.enabled = enabled;
        this.bound = bound;
        this.breakpoint = breakpoint;
        this.element = document.createElement('span');
        this.element.classList.toggle('cm-inline-breakpoint', true);
        this.bookmark = null;
    }
    static mostSpecificFirst(decoration1, decoration2) {
        if (decoration1.enabled !== decoration2.enabled) {
            return decoration1.enabled ? -1 : 1;
        }
        if (decoration1.bound !== decoration2.bound) {
            return decoration1.bound ? -1 : 1;
        }
        if (Boolean(decoration1.condition) !== Boolean(decoration2.condition)) {
            return Boolean(decoration1.condition) ? -1 : 1;
        }
        return 0;
    }
    update() {
        const isLogpoint = Boolean(this.condition) && this.condition.includes(LogpointPrefix);
        const isConditionalBreakpoint = Boolean(this.condition) && !isLogpoint;
        this.element.classList.toggle('cm-inline-logpoint', isLogpoint);
        this.element.classList.toggle('cm-inline-breakpoint-conditional', isConditionalBreakpoint);
        this.element.classList.toggle('cm-inline-disabled', !this.enabled);
    }
    show() {
        if (this.bookmark) {
            return;
        }
        const editorLocation = this.handle.resolve();
        if (!editorLocation) {
            return;
        }
        this.bookmark = this._textEditor.addBookmark(editorLocation.lineNumber, editorLocation.columnNumber, this.element, BreakpointDecoration.bookmarkSymbol);
        // @ts-ignore Only used for layout tests
        this.bookmark[BreakpointDecoration._elementSymbolForTest] = this.element;
    }
    hide() {
        if (!this.bookmark) {
            return;
        }
        this.bookmark.clear();
        this.bookmark = null;
    }
    dispose() {
        const location = this.handle.resolve();
        if (location) {
            this._textEditor.toggleLineClass(location.lineNumber, 'cm-breakpoint', false);
            this._textEditor.toggleLineClass(location.lineNumber, 'cm-breakpoint-disabled', false);
            this._textEditor.toggleLineClass(location.lineNumber, 'cm-breakpoint-unbound', false);
            this._textEditor.toggleLineClass(location.lineNumber, 'cm-breakpoint-conditional', false);
            this._textEditor.toggleLineClass(location.lineNumber, 'cm-breakpoint-logpoint', false);
        }
        this.hide();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static bookmarkSymbol = Symbol('bookmark');
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static _elementSymbolForTest = Symbol('element');
}
export const continueToLocationDecorationSymbol = Symbol('bookmark');
//# sourceMappingURL=DebuggerPlugin.js.map