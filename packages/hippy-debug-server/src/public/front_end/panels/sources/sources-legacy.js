// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as SourcesModule from './sources.js';
self.Sources = self.Sources || {};
Sources = Sources || {};
/** @constructor */
Sources.AddSourceMapURLDialog = SourcesModule.AddSourceMapURLDialog.AddSourceMapURLDialog;
/** @constructor */
Sources.BreakpointEditDialog = SourcesModule.BreakpointEditDialog.BreakpointEditDialog;
Sources.BreakpointEditDialog.LogpointPrefix = SourcesModule.BreakpointEditDialog.LogpointPrefix;
Sources.BreakpointEditDialog._LogpointSuffix = SourcesModule.BreakpointEditDialog.LogpointSuffix;
Sources.BreakpointEditDialog.BreakpointType = SourcesModule.BreakpointEditDialog.BreakpointType;
/** @constructor */
Sources.CSSPlugin = SourcesModule.CSSPlugin.CSSPlugin;
Sources.CSSPlugin.maxSwatchProcessingLength = SourcesModule.CSSPlugin.maxSwatchProcessingLength;
Sources.CSSPlugin.SwatchBookmark = SourcesModule.CSSPlugin.SwatchBookmark;
/** @constructor */
Sources.CallStackSidebarPane = SourcesModule.CallStackSidebarPane.CallStackSidebarPane;
Sources.CallStackSidebarPane._elementSymbol = SourcesModule.CallStackSidebarPane.elementSymbol;
Sources.CallStackSidebarPane._defaultMaxAsyncStackChainDepth =
    SourcesModule.CallStackSidebarPane.defaultMaxAsyncStackChainDepth;
/** @constructor */
Sources.CallStackSidebarPane.ActionDelegate = SourcesModule.CallStackSidebarPane.ActionDelegate;
/** @constructor */
Sources.CallStackSidebarPane.Item = SourcesModule.CallStackSidebarPane.Item;
/** @constructor */
Sources.CoveragePlugin = SourcesModule.CoveragePlugin.CoveragePlugin;
/** @constructor */
Sources.DebuggerPausedMessage = SourcesModule.DebuggerPausedMessage.DebuggerPausedMessage;
Sources.DebuggerPausedMessage.BreakpointTypeNouns = SourcesModule.DebuggerPausedMessage.BreakpointTypeNouns;
/** @constructor */
Sources.DebuggerPlugin = SourcesModule.DebuggerPlugin.DebuggerPlugin;
/** @constructor */
Sources.DebuggerPlugin.BreakpointDecoration = SourcesModule.DebuggerPlugin.BreakpointDecoration;
Sources.DebuggerPlugin.continueToLocationDecorationSymbol =
    SourcesModule.DebuggerPlugin.continueToLocationDecorationSymbol;
/** @constructor */
Sources.EditingLocationHistoryManager = SourcesModule.EditingLocationHistoryManager.EditingLocationHistoryManager;
Sources.EditingLocationHistoryManager.HistoryDepth = SourcesModule.EditingLocationHistoryManager.HistoryDepth;
/** @constructor */
Sources.EditingLocationHistoryEntry = SourcesModule.EditingLocationHistoryManager.EditingLocationHistoryEntry;
/** @constructor */
Sources.FilePathScoreFunction = SourcesModule.FilePathScoreFunction.FilePathScoreFunction;
/** @constructor */
Sources.FilteredUISourceCodeListProvider =
    SourcesModule.FilteredUISourceCodeListProvider.FilteredUISourceCodeListProvider;
/** @constructor */
Sources.GoToLineQuickOpen = SourcesModule.GoToLineQuickOpen.GoToLineQuickOpen;
/** @constructor */
Sources.GutterDiffPlugin = SourcesModule.GutterDiffPlugin.GutterDiffPlugin;
/** @constructor */
Sources.GutterDiffPlugin.GutterDecoration = SourcesModule.GutterDiffPlugin.GutterDecoration;
Sources.GutterDiffPlugin.DiffGutterType = SourcesModule.GutterDiffPlugin.DiffGutterType;
/** @constructor */
Sources.GutterDiffPlugin.ContextMenuProvider = SourcesModule.GutterDiffPlugin.ContextMenuProvider;
/** @constructor */
Sources.InplaceFormatterEditorAction = SourcesModule.InplaceFormatterEditorAction.InplaceFormatterEditorAction;
/** @constructor */
Sources.JavaScriptBreakpointsSidebarPane =
    SourcesModule.JavaScriptBreakpointsSidebarPane.JavaScriptBreakpointsSidebarPane;
Sources.JavaScriptBreakpointsSidebarPane.retrieveLocationForElement =
    SourcesModule.JavaScriptBreakpointsSidebarPane.retrieveLocationForElement;
/** @constructor */
Sources.JavaScriptCompilerPlugin = SourcesModule.JavaScriptCompilerPlugin.JavaScriptCompilerPlugin;
Sources.JavaScriptCompilerPlugin.CompileDelay = SourcesModule.JavaScriptCompilerPlugin.CompileDelay;
/** @constructor */
Sources.NavigatorView = SourcesModule.NavigatorView.NavigatorView;
Sources.NavigatorView.Types = SourcesModule.NavigatorView.Types;
/** @constructor */
Sources.NavigatorFolderTreeElement = SourcesModule.NavigatorView.NavigatorFolderTreeElement;
/** @constructor */
Sources.NavigatorSourceTreeElement = SourcesModule.NavigatorView.NavigatorSourceTreeElement;
/** @constructor */
Sources.NavigatorTreeNode = SourcesModule.NavigatorView.NavigatorTreeNode;
/** @constructor */
Sources.NavigatorRootTreeNode = SourcesModule.NavigatorView.NavigatorRootTreeNode;
/** @constructor */
Sources.NavigatorUISourceCodeTreeNode = SourcesModule.NavigatorView.NavigatorUISourceCodeTreeNode;
/** @constructor */
Sources.NavigatorFolderTreeNode = SourcesModule.NavigatorView.NavigatorFolderTreeNode;
/** @constructor */
Sources.NavigatorGroupTreeNode = SourcesModule.NavigatorView.NavigatorGroupTreeNode;
/** @constructor */
Sources.OpenFileQuickOpen = SourcesModule.OpenFileQuickOpen.OpenFileQuickOpen;
/** @constructor */
Sources.OutlineQuickOpen = SourcesModule.OutlineQuickOpen.OutlineQuickOpen;
/** @constructor */
Sources.ScopeChainSidebarPane = SourcesModule.ScopeChainSidebarPane.ScopeChainSidebarPane;
/** @constructor */
Sources.ScopeChainSidebarPane.OpenLinearMemoryInspector = SourcesModule.ScopeChainSidebarPane.OpenLinearMemoryInspector;
/** @constructor */
Sources.ScriptFormatterEditorAction = SourcesModule.ScriptFormatterEditorAction.ScriptFormatterEditorAction;
/** @constructor */
Sources.ScriptOriginPlugin = SourcesModule.ScriptOriginPlugin.ScriptOriginPlugin;
Sources.ScriptOriginPlugin._linkifier = SourcesModule.ScriptOriginPlugin.linkifier;
/** @constructor */
Sources.SearchSourcesView = SourcesModule.SearchSourcesView.SearchSourcesView;
/** @constructor */
Sources.SearchSourcesView.ActionDelegate = SourcesModule.SearchSourcesView.ActionDelegate;
/** @constructor */
Sources.SnippetsPlugin = SourcesModule.SnippetsPlugin.SnippetsPlugin;
/** @constructor */
Sources.RecorderPlugin = SourcesModule.RecorderPlugin.RecorderPlugin;
Sources.SourceMapNamesResolver = {};
Sources.SourceMapNamesResolver.setScopeResolvedForTest = SourcesModule.SourceMapNamesResolver.setScopeResolvedForTest;
// Tests can override this global symbol and therefore can't be exported
Object.defineProperty(Sources.SourceMapNamesResolver, '_scopeResolvedForTest', {
    get: SourcesModule.SourceMapNamesResolver.getScopeResolvedForTest,
    set: SourcesModule.SourceMapNamesResolver.setScopeResolvedForTest,
});
Sources.SourceMapNamesResolver._scopeIdentifiers = SourcesModule.SourceMapNamesResolver.scopeIdentifiers;
Sources.SourceMapNamesResolver._resolveScope = SourcesModule.SourceMapNamesResolver.resolveScope;
Sources.SourceMapNamesResolver._allVariablesInCallFrame = SourcesModule.SourceMapNamesResolver.allVariablesInCallFrame;
Sources.SourceMapNamesResolver.resolveExpression = SourcesModule.SourceMapNamesResolver.resolveExpression;
Sources.SourceMapNamesResolver.resolveThisObject = SourcesModule.SourceMapNamesResolver.resolveThisObject;
Sources.SourceMapNamesResolver.resolveScopeInObject = SourcesModule.SourceMapNamesResolver.resolveScopeInObject;
/** @constructor */
Sources.SourceMapNamesResolver.Identifier = SourcesModule.SourceMapNamesResolver.Identifier;
/** @constructor */
Sources.SourceMapNamesResolver.RemoteObject = SourcesModule.SourceMapNamesResolver.RemoteObject;
/** @constructor */
Sources.NetworkNavigatorView = SourcesModule.SourcesNavigator.NetworkNavigatorView;
/** @constructor */
Sources.FilesNavigatorView = SourcesModule.SourcesNavigator.FilesNavigatorView;
/** @constructor */
Sources.OverridesNavigatorView = SourcesModule.SourcesNavigator.OverridesNavigatorView;
/** @constructor */
Sources.ContentScriptsNavigatorView = SourcesModule.SourcesNavigator.ContentScriptsNavigatorView;
/** @constructor */
Sources.SnippetsNavigatorView = SourcesModule.SourcesNavigator.SnippetsNavigatorView;
/** @constructor */
Sources.RecordingsNavigatorView = SourcesModule.SourcesNavigator.RecordingsNavigatorView;
/** @constructor */
Sources.ActionDelegate = SourcesModule.SourcesNavigator.ActionDelegate;
/** @constructor */
Sources.SourcesPanel = SourcesModule.SourcesPanel.SourcesPanel;
Sources.SourcesPanel._lastModificationTimeout = SourcesModule.SourcesPanel.lastModificationTimeout;
Sources.SourcesPanel.minToolbarWidth = SourcesModule.SourcesPanel.minToolbarWidth;
/** @constructor */
Sources.SourcesPanel.UILocationRevealer = SourcesModule.SourcesPanel.UILocationRevealer;
/** @constructor */
Sources.SourcesPanel.DebuggerLocationRevealer = SourcesModule.SourcesPanel.DebuggerLocationRevealer;
/** @constructor */
Sources.SourcesPanel.UISourceCodeRevealer = SourcesModule.SourcesPanel.UISourceCodeRevealer;
/** @constructor */
Sources.SourcesPanel.DebuggerPausedDetailsRevealer = SourcesModule.SourcesPanel.DebuggerPausedDetailsRevealer;
/** @constructor */
Sources.SourcesPanel.RevealingActionDelegate = SourcesModule.SourcesPanel.RevealingActionDelegate;
/** @constructor */
Sources.SourcesPanel.DebuggingActionDelegate = SourcesModule.SourcesPanel.DebuggingActionDelegate;
/** @constructor */
Sources.SourcesPanel.WrapperView = SourcesModule.SourcesPanel.WrapperView;
/** @constructor */
Sources.SourcesSearchScope = SourcesModule.SourcesSearchScope.SourcesSearchScope;
/** @constructor */
Sources.FileBasedSearchResult = SourcesModule.SourcesSearchScope.FileBasedSearchResult;
/** @constructor */
Sources.SourcesView = SourcesModule.SourcesView.SourcesView;
/** @enum {symbol} */
Sources.SourcesView.Events = SourcesModule.SourcesView.Events;
/** @interface */
Sources.SourcesView.EditorAction = SourcesModule.SourcesView.EditorAction;
Sources.SourcesView.getRegisteredEditorActions = SourcesModule.SourcesView.getRegisteredEditorActions;
/** @constructor */
Sources.SourcesView.SwitchFileActionDelegate = SourcesModule.SourcesView.SwitchFileActionDelegate;
/** @constructor */
Sources.SourcesView.ActionDelegate = SourcesModule.SourcesView.ActionDelegate;
/** @constructor */
Sources.TabbedEditorContainer = SourcesModule.TabbedEditorContainer.TabbedEditorContainer;
/** @enum {symbol} */
Sources.TabbedEditorContainer.Events = SourcesModule.TabbedEditorContainer.Events;
Sources.TabbedEditorContainer._tabId = SourcesModule.TabbedEditorContainer.tabId;
Sources.TabbedEditorContainer.maximalPreviouslyViewedFilesCount =
    SourcesModule.TabbedEditorContainer.maximalPreviouslyViewedFilesCount;
/** @constructor */
Sources.TabbedEditorContainer.HistoryItem = SourcesModule.TabbedEditorContainer.HistoryItem;
/** @constructor */
Sources.TabbedEditorContainer.History = SourcesModule.TabbedEditorContainer.History;
/** @interface */
Sources.TabbedEditorContainerDelegate = SourcesModule.TabbedEditorContainer.TabbedEditorContainerDelegate;
/** @constructor */
Sources.EditorContainerTabDelegate = SourcesModule.TabbedEditorContainer.EditorContainerTabDelegate;
/** @constructor */
Sources.ThreadsSidebarPane = SourcesModule.ThreadsSidebarPane.ThreadsSidebarPane;
/** @constructor */
Sources.UISourceCodeFrame = SourcesModule.UISourceCodeFrame.UISourceCodeFrame;
/** @constructor */
Sources.UISourceCodeFrame.RowMessage = SourcesModule.UISourceCodeFrame.RowMessage;
/** @constructor */
Sources.UISourceCodeFrame.RowMessageBucket = SourcesModule.UISourceCodeFrame.RowMessageBucket;
/** @constructor */
Sources.UISourceCodeFrame.Plugin = SourcesModule.Plugin.Plugin;
/** @enum {symbol} */
Sources.UISourceCodeFrame.Events = SourcesModule.UISourceCodeFrame.Events;
/** @constructor */
Sources.WatchExpressionsSidebarPane = SourcesModule.WatchExpressionsSidebarPane.WatchExpressionsSidebarPane;
/** @constructor */
Sources.WatchExpression = SourcesModule.WatchExpressionsSidebarPane.WatchExpression;
//# sourceMappingURL=sources-legacy.js.map