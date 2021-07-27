// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as QuickOpen from '../../ui/legacy/components/quick_open/quick_open.js';
import * as TextEditor from '../../ui/legacy/components/text_editor/text_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Command for showing the 'Sources' tool
    */
    showSources: 'Show Sources',
    /**
    *@description Name of the Sources panel
    */
    sources: 'Sources',
    /**
    *@description Command for showing the 'Filesystem' tool
    */
    showFilesystem: 'Show Filesystem',
    /**
    *@description Title of the 'Filesystem' tool in the Files Navigator View, which is part of the Sources tool
    */
    filesystem: 'Filesystem',
    /**
    *@description Command for showing the 'Snippets' tool
    */
    showSnippets: 'Show Snippets',
    /**
    *@description Title of the 'Snippets' tool in the Snippets Navigator View, which is part of the Sources tool
    */
    snippets: 'Snippets',
    /**
    *@description Command for showing the 'Search' tool
    */
    showSearch: 'Show Search',
    /**
    *@description Title of a search bar or tool
    */
    search: 'Search',
    /**
    *@description Command for showing the 'Recordings' tool
    */
    showRecordings: 'Show Recordings',
    /**
    *@description Title of the 'Recorder' tool in the Recorder Navigator View, which is part of the Sources tool
    */
    recordings: 'Recordings',
    /**
    *@description Command for showing the 'Quick source' tool
    */
    showQuickSource: 'Show Quick source',
    /**
    *@description Title of the 'Quick source' tool in the bottom drawer
    */
    quickSource: 'Quick source',
    /**
    *@description Command for showing the 'Threads' tool
    */
    showThreads: 'Show Threads',
    /**
    *@description Title of the sources threads
    */
    threads: 'Threads',
    /**
    *@description Command for showing the 'Scope' tool
    */
    showScope: 'Show Scope',
    /**
    *@description Title of the sources scopeChain
    */
    scope: 'Scope',
    /**
    *@description Command for showing the 'Watch' tool
    */
    showWatch: 'Show Watch',
    /**
    *@description Title of the sources watch
    */
    watch: 'Watch',
    /**
    *@description Command for showing the 'Breakpoints' tool
    */
    showBreakpoints: 'Show Breakpoints',
    /**
    *@description Title of the sources jsBreakpoints
    */
    breakpoints: 'Breakpoints',
    /**
    *@description Title of an action under the Debugger category that can be invoked through the Command Menu
    */
    pauseScriptExecution: 'Pause script execution',
    /**
    *@description Title of an action under the Debugger category that can be invoked through the Command Menu
    */
    resumeScriptExecution: 'Resume script execution',
    /**
    *@description Title of an action in the debugger tool to step over
    */
    stepOverNextFunctionCall: 'Step over next function call',
    /**
    *@description Title of an action in the debugger tool to step into
    */
    stepIntoNextFunctionCall: 'Step into next function call',
    /**
    *@description Title of an action in the debugger tool to step
    */
    step: 'Step',
    /**
    *@description Title of an action in the debugger tool to step out
    */
    stepOutOfCurrentFunction: 'Step out of current function',
    /**
    *@description Text to run a code snippet
    */
    runSnippet: 'Run snippet',
    /**
    *@description Label for the button to start a recording
    */
    startRecording: 'Start Recording',
    /**
    *@description Text to record a series of actions for analysis
    */
    record: 'Record',
    /**
    *@description Text to replay a recorded series of actions
    */
    replayRecording: 'Replay',
    /**
    *@description Title of a button to export a recorded series of actions as a Puppeteer script
    */
    exportRecording: 'Export',
    /**
    *@description Text of an item that stops the running task
    */
    stop: 'Stop',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    deactivateBreakpoints: 'Deactivate breakpoints',
    /**
    *@description Text in Java Script Breakpoints Sidebar Pane of the Sources panel
    */
    activateBreakpoints: 'Activate breakpoints',
    /**
    *@description Title of an action in the sources tool to add to watch
    */
    addSelectedTextToWatches: 'Add selected text to watches',
    /**
    *@description Title of an action in the debugger tool to evaluate selection
    */
    evaluateSelectedTextInConsole: 'Evaluate selected text in console',
    /**
    *@description Title of an action that switches files in the Sources panel
    */
    switchFile: 'Switch file',
    /**
    *@description Title of a sources panel action that renames a file
    */
    rename: 'Rename',
    /**
    *@description Title of an action in the sources tool to close all
    */
    closeAll: 'Close All',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (jump to previous editing location in text editor)
    */
    jumpToPreviousEditingLocation: 'Jump to previous editing location',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (jump to next editing location in text editor)
    */
    jumpToNextEditingLocation: 'Jump to next editing location',
    /**
    *@description Title of an action that closes the active editor tab in the Sources panel
    */
    closeTheActiveTab: 'Close the active tab',
    /**
    *@description Text to go to a given line
    */
    goToLine: 'Go to line',
    /**
    *@description Title of an action that opens the go to member menu
    */
    goToAFunctionDeclarationruleSet: 'Go to a function declaration/rule set',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (toggle breakpoint in debugger)
    */
    toggleBreakpoint: 'Toggle breakpoint',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (enable toggle breakpoint shortcut in debugger)
    */
    toggleBreakpointEnabled: 'Toggle breakpoint enabled',
    /**
    *@description Title of a sources panel action that opens the breakpoint input window
    */
    toggleBreakpointInputWindow: 'Toggle breakpoint input window',
    /**
    *@description Text to save something
    */
    save: 'Save',
    /**
    *@description Title of an action to save all files in the Sources panel
    */
    saveAll: 'Save all',
    /**
    *@description Title of an action in the sources tool to create snippet
    */
    createNewSnippet: 'Create new snippet',
    /**
    *@description Title of an action in the sources tool to add folder to workspace
    */
    addFolderToWorkspace: 'Add folder to workspace',
    /**
    *@description Title of an action in the debugger tool to previous call frame
    */
    previousCallFrame: 'Previous call frame',
    /**
    *@description Title of an action in the debugger tool to next call frame
    */
    nextCallFrame: 'Next call frame',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (increment CSS unit by 10 in Styles pane)
    */
    incrementCssUnitByTen: 'Increment CSS unit by 10',
    /**
    *@description Text in the Shortcuts page to explain a keyboard shortcut (decrement CSS unit by 10 in Styles pane)
    */
    decrementCssUnitByTen: 'Decrement CSS unit by 10',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    searchInAnonymousAndContent: 'Search in anonymous and content scripts',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    doNotSearchInAnonymousAndContent: 'Do not search in anonymous and content scripts',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    automaticallyRevealFilesIn: 'Automatically reveal files in sidebar',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    doNotAutomaticallyRevealFilesIn: 'Do not automatically reveal files in sidebar',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    enableJavascriptSourceMaps: 'Enable JavaScript source maps',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    disableJavascriptSourceMaps: 'Disable JavaScript source maps',
    /**
    *@description Title of a setting that can be invoked through the Command Menu.
    *'tab moves focus' is the name of the setting, which means that when the user
    *hits the tab key, the focus in the UI will be moved to the next part of the
    *text editor, as opposed to inserting a tab character into the text in the
    *text editor.
    */
    enableTabMovesFocus: 'Enable tab moves focus',
    /**
    *@description Title of a setting that can be invoked through the Command Menu.
    *'tab moves focus' is the name of the setting, which means that when the user
    *hits the tab key, the focus in the UI will be moved to the next part of the
    *text editor, as opposed to inserting a tab character into the text in the
    *text editor.
    */
    disableTabMovesFocus: 'Disable tab moves focus',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    detectIndentation: 'Detect indentation',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    doNotDetectIndentation: 'Do not detect indentation',
    /**
    *@description Text for autocompletion
    */
    autocompletion: 'Autocompletion',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    enableAutocompletion: 'Enable autocompletion',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    disableAutocompletion: 'Disable autocompletion',
    /**
    *@description Title of a setting under the Sources category in Settings
    */
    bracketMatching: 'Bracket matching',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    enableBracketMatching: 'Enable bracket matching',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    disableBracketMatching: 'Disable bracket matching',
    /**
    *@description Title of a setting under the Sources category in Settings
    */
    codeFolding: 'Code folding',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    enableCodeFolding: 'Enable code folding',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    disableCodeFolding: 'Disable code folding',
    /**
    *@description Title of a setting under the Sources category in Settings
    */
    showWhitespaceCharacters: 'Show whitespace characters:',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    doNotShowWhitespaceCharacters: 'Do not show whitespace characters',
    /**
    * @description One value of an option that can be set to 'none', 'all', or 'trailing'. The setting
    * controls how whitespace characters are shown in a text editor.
    */
    none: 'None',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    showAllWhitespaceCharacters: 'Show all whitespace characters',
    /**
    *@description Text for everything
    */
    all: 'All',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    showTrailingWhitespaceCharacters: 'Show trailing whitespace characters',
    /**
    *@description A drop-down menu option to show trailing whitespace characters
    */
    trailing: 'Trailing',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    displayVariableValuesInlineWhile: 'Display variable values inline while debugging',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    doNotDisplayVariableValuesInline: 'Do not display variable values inline while debugging',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    enableCssSourceMaps: 'Enable CSS source maps',
    /**
    *@description Title of a setting under the Sources category that can be invoked through the Command Menu
    */
    disableCssSourceMaps: 'Disable CSS source maps',
    /**
    *@description Title of a setting under the Sources category in Settings
    */
    allowScrollingPastEndOfFile: 'Allow scrolling past end of file',
    /**
    *@description Title of a setting under the Sources category in Settings
    */
    disallowScrollingPastEndOfFile: 'Disallow scrolling past end of file',
    /**
    *@description Title of the Filtered List WidgetProvider of Quick Open
    */
    goToSymbol: 'Go to symbol',
    /**
    *@description Text to open a file
    */
    openFile: 'Open file',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/sources-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedSourcesModule;
async function loadSourcesModule() {
    if (!loadedSourcesModule) {
        // Side-effect import resources in module.json
        await Root.Runtime.Runtime.instance().loadModulePromise('panels/sources');
        loadedSourcesModule = await import('./sources.js');
    }
    return loadedSourcesModule;
}
function maybeRetrieveContextTypes(getClassCallBack) {
    if (loadedSourcesModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedSourcesModule);
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* PANEL */,
    id: 'sources',
    commandPrompt: i18nLazyString(UIStrings.showSources),
    title: i18nLazyString(UIStrings.sources),
    order: 30,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.SourcesPanel.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "navigator-view" /* NAVIGATOR_VIEW */,
    id: 'navigator-files',
    commandPrompt: i18nLazyString(UIStrings.showFilesystem),
    title: i18nLazyString(UIStrings.filesystem),
    order: 3,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.FilesNavigatorView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "navigator-view" /* NAVIGATOR_VIEW */,
    id: 'navigator-snippets',
    commandPrompt: i18nLazyString(UIStrings.showSnippets),
    title: i18nLazyString(UIStrings.snippets),
    order: 6,
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.SnippetsNavigatorView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'sources.search-sources-tab',
    commandPrompt: i18nLazyString(UIStrings.showSearch),
    title: i18nLazyString(UIStrings.search),
    order: 7,
    persistence: "closeable" /* CLOSEABLE */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SearchSourcesView.SearchSourcesView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "navigator-view" /* NAVIGATOR_VIEW */,
    id: 'navigator-recordings',
    commandPrompt: i18nLazyString(UIStrings.showRecordings),
    title: i18nLazyString(UIStrings.recordings),
    order: 8,
    persistence: "permanent" /* PERMANENT */,
    experiment: Root.Runtime.ExperimentName.RECORDER,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.RecordingsNavigatorView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    location: "drawer-view" /* DRAWER_VIEW */,
    id: 'sources.quick',
    commandPrompt: i18nLazyString(UIStrings.showQuickSource),
    title: i18nLazyString(UIStrings.quickSource),
    persistence: "closeable" /* CLOSEABLE */,
    order: 1000,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.WrapperView.instance();
    },
});
UI.ViewManager.registerViewExtension({
    id: 'sources.threads',
    commandPrompt: i18nLazyString(UIStrings.showThreads),
    title: i18nLazyString(UIStrings.threads),
    persistence: "permanent" /* PERMANENT */,
    condition: Root.Runtime.ConditionName.NOT_SOURCES_HIDE_ADD_FOLDER,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.ThreadsSidebarPane.ThreadsSidebarPane.instance();
    },
});
UI.ViewManager.registerViewExtension({
    id: 'sources.scopeChain',
    commandPrompt: i18nLazyString(UIStrings.showScope),
    title: i18nLazyString(UIStrings.scope),
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.ScopeChainSidebarPane.ScopeChainSidebarPane.instance();
    },
});
UI.ViewManager.registerViewExtension({
    id: 'sources.watch',
    commandPrompt: i18nLazyString(UIStrings.showWatch),
    title: i18nLazyString(UIStrings.watch),
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.WatchExpressionsSidebarPane.WatchExpressionsSidebarPane.instance();
    },
    hasToolbar: true,
});
UI.ViewManager.registerViewExtension({
    id: 'sources.jsBreakpoints',
    commandPrompt: i18nLazyString(UIStrings.showBreakpoints),
    title: i18nLazyString(UIStrings.breakpoints),
    persistence: "permanent" /* PERMANENT */,
    async loadView() {
        const Sources = await loadSourcesModule();
        return Sources.JavaScriptBreakpointsSidebarPane.JavaScriptBreakpointsSidebarPane.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.toggle-pause',
    iconClass: "largeicon-pause" /* LARGEICON_PAUSE */,
    toggleable: true,
    toggledIconClass: "largeicon-resume" /* LARGEICON_RESUME */,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.RevealingActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView,
            UI.ShortcutRegistry.ForwardedShortcut,
        ]);
    },
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.pauseScriptExecution),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.resumeScriptExecution),
        },
    ],
    bindings: [
        {
            shortcut: 'F8',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+\\',
        },
        {
            shortcut: 'F5',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            shortcut: 'Shift+F5',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+\\',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.step-over',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.stepOverNextFunctionCall),
    iconClass: "largeicon-step-over" /* LARGEICON_STEP_OVER */,
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    bindings: [
        {
            shortcut: 'F10',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+\'',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+\'',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.step-into',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.stepIntoNextFunctionCall),
    iconClass: "largeicon-step-into" /* LARGE_ICON_STEP_INTO */,
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    bindings: [
        {
            shortcut: 'F11',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+;',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+;',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.step',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.step),
    iconClass: "largeicon-step" /* LARGE_ICON_STEP */,
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    bindings: [
        {
            shortcut: 'F9',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.step-out',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.stepOutOfCurrentFunction),
    iconClass: "largeicon-step-out" /* LARGE_ICON_STEP_OUT */,
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    bindings: [
        {
            shortcut: 'Shift+F11',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Shift+Ctrl+;',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Shift+Meta+;',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'debugger.run-snippet',
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.runSnippet),
    iconClass: "largeicon-play" /* LARGEICON_PLAY */,
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Enter',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Enter',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'recorder.toggle-recording',
    experiment: Root.Runtime.ExperimentName.RECORDER,
    category: UI.ActionRegistration.ActionCategory.RECORDER,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.startRecording),
    iconClass: "largeicon-start-recording" /* LARGEICON_START_RECORDING */,
    toggleable: true,
    toggledIconClass: "largeicon-stop-recording" /* LARGEICON_STOP_RECORDING */,
    toggleWithRedColor: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.record),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.stop),
        },
    ],
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+E',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+E',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'recorder.replay-recording',
    experiment: Root.Runtime.ExperimentName.RECORDER,
    category: UI.ActionRegistration.ActionCategory.RECORDER,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.replayRecording),
    iconClass: "largeicon-play" /* LARGEICON_PLAY */,
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            shortcut: 'Ctrl+Enter',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'recorder.export-recording',
    experiment: Root.Runtime.ExperimentName.RECORDER,
    category: UI.ActionRegistration.ActionCategory.RECORDER,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.exportRecording),
    iconClass: "largeicon-download" /* LARGEICON_DOWNLOAD */,
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.toggle-breakpoints-active',
    iconClass: "largeicon-deactivate-breakpoints" /* LARGE_ICON_DEACTIVATE_BREAKPOINTS */,
    toggleable: true,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.deactivateBreakpoints),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.activateBreakpoints),
        },
    ],
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+F8',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+F8',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.add-to-watch',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.WatchExpressionsSidebarPane.WatchExpressionsSidebarPane.instance();
    },
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    title: i18nLazyString(UIStrings.addSelectedTextToWatches),
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.UISourceCodeFrame.UISourceCodeFrame]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+A',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+A',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'debugger.evaluate-selection',
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggingActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.evaluateSelectedTextInConsole),
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.UISourceCodeFrame.UISourceCodeFrame]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+E',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+E',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.switch-file',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.switchFile),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.SwitchFileActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            shortcut: 'Alt+O',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.rename',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.rename),
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'F2',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Enter',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    actionId: 'sources.close-all',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.closeAll),
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.jump-to-previous-location',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.jumpToPreviousEditingLocation),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            shortcut: 'Alt+Minus',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.jump-to-next-location',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.jumpToNextEditingLocation),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            shortcut: 'Alt+Plus',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.close-editor-tab',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.closeTheActiveTab),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            shortcut: 'Alt+w',
        },
        {
            shortcut: 'Ctrl+W',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows" /* Windows */,
            shortcut: 'Ctrl+F4',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.go-to-line',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.goToLine),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            shortcut: 'Ctrl+g',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.go-to-member',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.goToAFunctionDeclarationruleSet),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+o',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+o',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+T',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+T',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            shortcut: 'F12',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'debugger.toggle-breakpoint',
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    title: i18nLazyString(UIStrings.toggleBreakpoint),
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+b',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+b',
        },
        {
            shortcut: 'F9',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'debugger.toggle-breakpoint-enabled',
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    title: i18nLazyString(UIStrings.toggleBreakpointEnabled),
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+b',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+b',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'debugger.breakpoint-input-window',
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    title: i18nLazyString(UIStrings.toggleBreakpointInputWindow),
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Alt+b',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Alt+b',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.save',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.save),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+s',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+s',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.save-all',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.saveAll),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesView.ActionDelegate.instance();
    },
    contextTypes() {
        return maybeRetrieveContextTypes(Sources => [Sources.SourcesView.SourcesView]);
    },
    bindings: [
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+s',
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Alt+s',
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+K S',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Alt+S',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    actionId: 'sources.create-snippet',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.ActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.createNewSnippet),
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    actionId: 'sources.add-folder-to-workspace',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesNavigator.ActionDelegate.instance();
    },
    iconClass: "largeicon-add" /* LARGE_ICON_ADD */,
    title: i18nLazyString(UIStrings.addFolderToWorkspace),
    condition: Root.Runtime.ConditionName.NOT_SOURCES_HIDE_ADD_FOLDER,
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.previous-call-frame',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.CallStackSidebarPane.ActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.previousCallFrame),
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    bindings: [
        {
            shortcut: 'Ctrl+,',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: UI.ActionRegistration.ActionCategory.DEBUGGER,
    actionId: 'debugger.next-call-frame',
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.CallStackSidebarPane.ActionDelegate.instance();
    },
    title: i18nLazyString(UIStrings.nextCallFrame),
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    bindings: [
        {
            shortcut: 'Ctrl+.',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.search',
    title: i18nLazyString(UIStrings.search),
    async loadActionDelegate() {
        const Sources = await loadSourcesModule();
        return Sources.SearchSourcesView.ActionDelegate.instance();
    },
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    bindings: [
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Alt+F',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+F',
            keybindSets: [
                "devToolsDefault" /* DEVTOOLS_DEFAULT */,
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "windows,linux" /* WindowsLinux */,
            shortcut: 'Ctrl+Shift+J',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+F',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
        {
            platform: "mac" /* Mac */,
            shortcut: 'Meta+Shift+J',
            keybindSets: [
                "vsCode" /* VS_CODE */,
            ],
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.increment-css',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString('Increment CSS unit by 1'),
    bindings: [
        {
            shortcut: 'Alt+Up',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.increment-css-by-ten',
    title: i18nLazyString(UIStrings.incrementCssUnitByTen),
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    bindings: [
        {
            shortcut: 'Alt+PageUp',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.decrement-css',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString('Decrement CSS unit by 1'),
    bindings: [
        {
            shortcut: 'Alt+Down',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'sources.decrement-css-by-ten',
    category: UI.ActionRegistration.ActionCategory.SOURCES,
    title: i18nLazyString(UIStrings.decrementCssUnitByTen),
    bindings: [
        {
            shortcut: 'Alt+PageDown',
        },
    ],
});
Common.Settings.registerSettingExtension({
    settingName: 'navigatorGroupByFolder',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.searchInAnonymousAndContent),
    settingName: 'searchInAnonymousAndContentScripts',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.searchInAnonymousAndContent),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotSearchInAnonymousAndContent),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.automaticallyRevealFilesIn),
    settingName: 'autoRevealInNavigator',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.automaticallyRevealFilesIn),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotAutomaticallyRevealFilesIn),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.enableJavascriptSourceMaps),
    settingName: 'jsSourceMapsEnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableJavascriptSourceMaps),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableJavascriptSourceMaps),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.enableTabMovesFocus),
    settingName: 'textEditorTabMovesFocus',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableTabMovesFocus),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableTabMovesFocus),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.detectIndentation),
    settingName: 'textEditorAutoDetectIndent',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.detectIndentation),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotDetectIndentation),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.autocompletion),
    settingName: 'textEditorAutocompletion',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableAutocompletion),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableAutocompletion),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.bracketMatching),
    settingName: 'textEditorBracketMatching',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableBracketMatching),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableBracketMatching),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.codeFolding),
    settingName: 'textEditorCodeFolding',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: false,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableCodeFolding),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableCodeFolding),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.showWhitespaceCharacters),
    settingName: 'showWhitespacesInEditor',
    settingType: Common.Settings.SettingType.ENUM,
    defaultValue: 'original',
    options: [
        {
            title: i18nLazyString(UIStrings.doNotShowWhitespaceCharacters),
            text: i18nLazyString(UIStrings.none),
            value: 'none',
        },
        {
            title: i18nLazyString(UIStrings.showAllWhitespaceCharacters),
            text: i18nLazyString(UIStrings.all),
            value: 'all',
        },
        {
            title: i18nLazyString(UIStrings.showTrailingWhitespaceCharacters),
            text: i18nLazyString(UIStrings.trailing),
            value: 'trailing',
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.displayVariableValuesInlineWhile),
    settingName: 'inlineVariableValues',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.displayVariableValuesInlineWhile),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.doNotDisplayVariableValuesInline),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.enableCssSourceMaps),
    settingName: 'cssSourceMapsEnabled',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.enableCssSourceMaps),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disableCssSourceMaps),
        },
    ],
});
Common.Settings.registerSettingExtension({
    category: Common.Settings.SettingCategory.SOURCES,
    title: i18nLazyString(UIStrings.allowScrollingPastEndOfFile),
    settingName: 'allowScrollPastEof',
    settingType: Common.Settings.SettingType.BOOLEAN,
    defaultValue: true,
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.allowScrollingPastEndOfFile),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.disallowScrollingPastEndOfFile),
        },
    ],
});
UI.ViewManager.registerLocationResolver({
    name: "navigator-view" /* NAVIGATOR_VIEW */,
    category: UI.ViewManager.ViewLocationCategoryValues.SOURCES,
    async loadResolver() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.SourcesPanel.instance();
    },
});
UI.ViewManager.registerLocationResolver({
    name: "sources.sidebar-top" /* SOURCES_SIDEBAR_TOP */,
    category: UI.ViewManager.ViewLocationCategoryValues.SOURCES,
    async loadResolver() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.SourcesPanel.instance();
    },
});
UI.ViewManager.registerLocationResolver({
    name: "sources.sidebar-bottom" /* SOURCES_SIDEBAR_BOTTOM */,
    category: UI.ViewManager.ViewLocationCategoryValues.SOURCES,
    async loadResolver() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.SourcesPanel.instance();
    },
});
UI.ViewManager.registerLocationResolver({
    name: "sources.sidebar-tabs" /* SOURCES_SIDEBAR_TABS */,
    category: UI.ViewManager.ViewLocationCategoryValues.SOURCES,
    async loadResolver() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.SourcesPanel.instance();
    },
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            Workspace.UISourceCode.UISourceCode,
            Workspace.UISourceCode.UILocation,
            SDK.RemoteObject.RemoteObject,
            SDK.NetworkRequest.NetworkRequest,
            ...maybeRetrieveContextTypes(Sources => [Sources.UISourceCodeFrame.UISourceCodeFrame]),
        ];
    },
    async loadProvider() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.SourcesPanel.instance();
    },
    experiment: undefined,
});
UI.ContextMenu.registerProvider({
    async loadProvider() {
        const Sources = await loadSourcesModule();
        return Sources.WatchExpressionsSidebarPane.WatchExpressionsSidebarPane.instance();
    },
    contextTypes() {
        return [
            ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement,
        ];
    },
    experiment: undefined,
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            TextEditor.CodeMirrorTextEditor.CodeMirrorTextEditor,
        ];
    },
    async loadProvider() {
        const Sources = await loadSourcesModule();
        return Sources.WatchExpressionsSidebarPane.WatchExpressionsSidebarPane.instance();
    },
    experiment: undefined,
});
UI.ContextMenu.registerProvider({
    contextTypes() {
        return [
            Workspace.UISourceCode.UISourceCode,
        ];
    },
    async loadProvider() {
        const Sources = await loadSourcesModule();
        return Sources.GutterDiffPlugin.ContextMenuProvider.instance();
    },
    experiment: undefined,
});
UI.ContextMenu.registerProvider({
    async loadProvider() {
        const Sources = await loadSourcesModule();
        return Sources.ScopeChainSidebarPane.OpenLinearMemoryInspector.instance();
    },
    experiment: undefined,
    contextTypes() {
        return [
            ObjectUI.ObjectPropertiesSection.ObjectPropertyTreeElement,
        ];
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            Workspace.UISourceCode.UILocation,
        ];
    },
    destination: Common.Revealer.RevealerDestination.SOURCES_PANEL,
    async loadRevealer() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.UILocationRevealer.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.DebuggerModel.Location,
        ];
    },
    destination: Common.Revealer.RevealerDestination.SOURCES_PANEL,
    async loadRevealer() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggerLocationRevealer.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            Workspace.UISourceCode.UISourceCode,
        ];
    },
    destination: Common.Revealer.RevealerDestination.SOURCES_PANEL,
    async loadRevealer() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.UISourceCodeRevealer.instance();
    },
});
Common.Revealer.registerRevealer({
    contextTypes() {
        return [
            SDK.DebuggerModel.DebuggerPausedDetails,
        ];
    },
    destination: Common.Revealer.RevealerDestination.SOURCES_PANEL,
    async loadRevealer() {
        const Sources = await loadSourcesModule();
        return Sources.SourcesPanel.DebuggerPausedDetailsRevealer.instance();
    },
});
UI.Toolbar.registerToolbarItem({
    actionId: 'sources.add-folder-to-workspace',
    location: UI.Toolbar.ToolbarItemLocation.FILES_NAVIGATION_TOOLBAR,
    showLabel: true,
    condition: Root.Runtime.ConditionName.NOT_SOURCES_HIDE_ADD_FOLDER,
    loadItem: undefined,
    order: undefined,
    separator: undefined,
});
UI.Context.registerListener({
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    async loadListener() {
        const Sources = await loadSourcesModule();
        return Sources.JavaScriptBreakpointsSidebarPane.JavaScriptBreakpointsSidebarPane.instance();
    },
});
UI.Context.registerListener({
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    async loadListener() {
        const Sources = await loadSourcesModule();
        return Sources.JavaScriptBreakpointsSidebarPane.JavaScriptBreakpointsSidebarPane.instance();
    },
});
UI.Context.registerListener({
    contextTypes() {
        return [SDK.DebuggerModel.DebuggerPausedDetails];
    },
    async loadListener() {
        const Sources = await loadSourcesModule();
        return Sources.CallStackSidebarPane.CallStackSidebarPane.instance();
    },
});
UI.Context.registerListener({
    contextTypes() {
        return [SDK.DebuggerModel.CallFrame];
    },
    async loadListener() {
        const Sources = await loadSourcesModule();
        return Sources.ScopeChainSidebarPane.ScopeChainSidebarPane.instance();
    },
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.NAVIGATOR_MENU_DEFAULT,
    actionId: 'quickOpen.show',
    order: undefined,
});
UI.ContextMenu.registerItem({
    location: UI.ContextMenu.ItemLocation.MAIN_MENU_DEFAULT,
    actionId: 'sources.search',
    order: undefined,
});
QuickOpen.FilteredListWidget.registerProvider({
    prefix: '@',
    title: i18nLazyString(UIStrings.goToSymbol),
    async provider() {
        const Sources = await loadSourcesModule();
        return Sources.OutlineQuickOpen.OutlineQuickOpen.instance();
    },
});
QuickOpen.FilteredListWidget.registerProvider({
    prefix: ':',
    title: i18nLazyString(UIStrings.goToLine),
    async provider() {
        const Sources = await loadSourcesModule();
        return Sources.GoToLineQuickOpen.GoToLineQuickOpen.instance();
    },
});
QuickOpen.FilteredListWidget.registerProvider({
    prefix: '',
    title: i18nLazyString(UIStrings.openFile),
    async provider() {
        const Sources = await loadSourcesModule();
        return Sources.OpenFileQuickOpen.OpenFileQuickOpen.instance();
    },
});
//# sourceMappingURL=sources-meta.js.map