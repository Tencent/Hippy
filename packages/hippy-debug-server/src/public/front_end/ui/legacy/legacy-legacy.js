// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as UIModule from './legacy.js';
self.UI = self.UI || {};
UI = UI || {};
/** @constructor */
UI.DockController = UIModule.DockController.DockController;
UI.DockController.State = UIModule.DockController.State;
/** @enum {symbol} */
UI.DockController.Events = UIModule.DockController.Events;
/** @constructor */
UI.DockController.ToggleDockActionDelegate = UIModule.DockController.ToggleDockActionDelegate;
/** @constructor */
UI.DockController.CloseButtonProvider = UIModule.DockController.CloseButtonProvider;
/** @constructor */
UI.Context = UIModule.Context.Context;
/** @interface */
UI.ContextFlavorListener = UIModule.ContextFlavorListener.ContextFlavorListener;
/** @constructor */
UI.ContextMenu = UIModule.ContextMenu.ContextMenu;
/**
 * @interface
 */
UI.ContextMenu.Provider = UIModule.ContextMenu.Provider;
/** @constructor */
UI.Dialog = UIModule.Dialog.Dialog;
/** @constructor */
UI.EmptyWidget = UIModule.EmptyWidget.EmptyWidget;
/** @constructor */
UI.Fragment = UIModule.Fragment.Fragment;
UI.html = UIModule.Fragment.html;
UI.Geometry = {};
/**
 * @constructor
 */
UI.Geometry.Vector = UIModule.Geometry.Vector;
/**
 * @constructor
 */
UI.Geometry.CubicBezier = UIModule.Geometry.CubicBezier;
/**
 * @constructor
 */
UI.Geometry.EulerAngles = UIModule.Geometry.EulerAngles;
/**
 * @param {!UIModule.Geometry.Vector} u
 * @param {!UIModule.Geometry.Vector} v
 * @return {number}
 */
UI.Geometry.scalarProduct = UIModule.Geometry.scalarProduct;
/**
 * @param {!UIModule.Geometry.Vector} u
 * @param {!UIModule.Geometry.Vector} v
 * @return {!UIModule.Geometry.Vector}
 */
UI.Geometry.crossProduct = UIModule.Geometry.crossProduct;
/**
 * @param {!UIModule.Geometry.Vector} u
 * @param {!UIModule.Geometry.Vector} v
 * @return {number}
 */
UI.Geometry.calculateAngle = UIModule.Geometry.calculateAngle;
/**
 * @param {number} deg
 * @return {number}
 */
UI.Geometry.degreesToRadians = UIModule.Geometry.degreesToRadians;
/**
 * @param {number} rad
 * @return {number}
 */
UI.Geometry.radiansToDegrees = UIModule.Geometry.radiansToDegrees;
/** @constructor */
UI.Size = UIModule.Geometry.Size;
/** @constructor */
UI.GlassPane = UIModule.GlassPane.GlassPane;
// Exported for layout tests.
UI.GlassPane._panes = UIModule.GlassPane.GlassPanePanes;
/** @constructor */
UI.InspectorView = UIModule.InspectorView.InspectorView;
/**
 * @implements {UI.ActionDelegate}
 */
UI.InspectorView.ActionDelegate = UIModule.InspectorView.ActionDelegate;
/** @constructor */
UI.ListControl = UIModule.ListControl.ListControl;
UI.ListMode = UIModule.ListControl.ListMode;
/** @constructor */
UI.ListModel = UIModule.ListModel.ListModel;
/** @constructor */
UI.Panel = UIModule.Panel.Panel;
// For testing.
UI.panels = {};
/** @constructor */
UI.SearchableView = UIModule.SearchableView.SearchableView;
/**
 * @constructor
 */
UI.SearchableView.SearchConfig = UIModule.SearchableView.SearchConfig;
/** @interface */
UI.Searchable = UIModule.SearchableView.Searchable;
/**
 * @interface
 */
UI.SettingUI = UIModule.SettingsUI.SettingUI;
/** @constructor */
UI.ShortcutRegistry = UIModule.ShortcutRegistry.ShortcutRegistry;
UI.ShortcutRegistry.ForwardedShortcut = UIModule.ShortcutRegistry.ForwardedShortcut;
/** @constructor */
UI.SoftContextMenu = UIModule.SoftContextMenu.SoftContextMenu;
/** @constructor */
UI.SoftDropDown = UIModule.SoftDropDown.SoftDropDown;
/** @constructor */
UI.SplitWidget = UIModule.SplitWidget.SplitWidget;
/** @constructor */
UI.SuggestBox = UIModule.SuggestBox.SuggestBox;
/** @constructor */
UI.TabbedPane = UIModule.TabbedPane.TabbedPane;
/** @enum {symbol} */
UI.TabbedPane.Events = UIModule.TabbedPane.Events;
/** @interface */
UI.TextEditor = UIModule.TextEditor.TextEditor;
/** @interface */
UI.TextEditorFactory = UIModule.TextEditor.TextEditorFactory;
/** @constructor */
UI.TextPrompt = UIModule.TextPrompt.TextPrompt;
/** @constructor */
UI.Toolbar = UIModule.Toolbar.Toolbar;
/** @constructor */
UI.ToolbarItem = UIModule.Toolbar.ToolbarItem;
/** @interface */
UI.ToolbarItem.Provider = UIModule.Toolbar.Provider;
/** @constructor */
UI.Tooltip = UIModule.Tooltip.Tooltip;
// Exported for layout tests.
UI.Tooltip._symbol = UIModule.Tooltip.TooltipSymbol;
/** @constructor */
UI.TreeOutline = UIModule.TreeOutline.TreeOutline;
UI.TreeOutline.Events = UIModule.TreeOutline.Events;
/** @constructor */
UI.TreeElement = UIModule.TreeOutline.TreeElement;
/** @constructor */
UI.TreeOutlineInShadow = UIModule.TreeOutline.TreeOutlineInShadow;
/** @interface */
UI.Renderer = UIModule.UIUtils.Renderer;
UI.isBeingEdited = UIModule.UIUtils.isBeingEdited;
UI.isEditing = UIModule.UIUtils.isEditing;
UI.highlightRangesWithStyleClass = UIModule.UIUtils.highlightRangesWithStyleClass;
UI.applyDomChanges = UIModule.UIUtils.applyDomChanges;
UI.revertDomChanges = UIModule.UIUtils.revertDomChanges;
UI.beautifyFunctionName = UIModule.UIUtils.beautifyFunctionName;
/** @interface */
UI.View = UIModule.View.View;
/** @constructor */
UI.SimpleView = UIModule.View.SimpleView;
/** @interface */
UI.ViewLocation = UIModule.View.ViewLocation;
/** @interface */
UI.ViewLocationResolver = UIModule.View.ViewLocationResolver;
/** @constructor */
UI.ViewManager = UIModule.ViewManager.ViewManager;
/** @constructor */
UI.ViewManager._ContainerWidget = UIModule.ViewManager.ContainerWidget;
/** @constructor */
UI.Widget = UIModule.Widget.Widget;
/** @constructor */
UI.XLink = UIModule.XLink.XLink;
/**
 * @implements {UI.ContextMenu.Provider}
 */
UI.XLink.ContextMenuProvider = UIModule.XLink.ContextMenuProvider;
/** @type {!UIModule.Context.Context} */
self.UI.context = UIModule.Context.Context.instance();
/**
 * @type {!UI.DockController}
 */
UI.dockController;
//# sourceMappingURL=legacy-legacy.js.map