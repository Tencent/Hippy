// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ElementsModule from './elements.js';
self.Elements = self.Elements || {};
Elements = Elements || {};
/** @constructor */
Elements.ClassesPaneWidget = ElementsModule.ClassesPaneWidget.ClassesPaneWidget;
/** @constructor */
Elements.ClassesPaneWidget.ButtonProvider = ElementsModule.ClassesPaneWidget.ButtonProvider;
/** @constructor */
Elements.ComputedStyleModel = ElementsModule.ComputedStyleModel.ComputedStyleModel;
/** @constructor */
Elements.ComputedStyleWidget = ElementsModule.ComputedStyleWidget.ComputedStyleWidget;
Elements.DOMLinkifier = {};
/** @constructor */
Elements.DOMLinkifier.Linkifier = ElementsModule.DOMLinkifier.Linkifier;
Elements.DOMPath = {};
Elements.DOMPath.fullQualifiedSelector = ElementsModule.DOMPath.fullQualifiedSelector;
Elements.DOMPath.cssPath = ElementsModule.DOMPath.cssPath;
Elements.DOMPath.jsPath = ElementsModule.DOMPath.jsPath;
Elements.DOMPath.xPath = ElementsModule.DOMPath.xPath;
/** @constructor */
Elements.ElementStatePaneWidget = ElementsModule.ElementStatePaneWidget.ElementStatePaneWidget;
/** @constructor */
Elements.ElementStatePaneWidget.ButtonProvider = ElementsModule.ElementStatePaneWidget.ButtonProvider;
/** @constructor */
Elements.ElementsPanel = ElementsModule.ElementsPanel.ElementsPanel;
/** @constructor */
Elements.ElementsPanel.ContextMenuProvider = ElementsModule.ElementsPanel.ContextMenuProvider;
/** @constructor */
Elements.ElementsPanel.DOMNodeRevealer = ElementsModule.ElementsPanel.DOMNodeRevealer;
/** @constructor */
Elements.ElementsPanel.CSSPropertyRevealer = ElementsModule.ElementsPanel.CSSPropertyRevealer;
/** @constructor */
Elements.ElementsActionDelegate = ElementsModule.ElementsPanel.ElementsActionDelegate;
/** @constructor */
Elements.ElementsPanel.PseudoStateMarkerDecorator = ElementsModule.ElementsPanel.PseudoStateMarkerDecorator;
/** @constructor */
Elements.ElementsTreeElement = ElementsModule.ElementsTreeElement.ElementsTreeElement;
/** @constructor */
Elements.ElementsTreeOutline = ElementsModule.ElementsTreeOutline.ElementsTreeOutline;
/** @constructor */
Elements.ElementsTreeOutline.Renderer = ElementsModule.ElementsTreeOutline.Renderer;
/** @constructor */
Elements.EventListenersWidget = ElementsModule.EventListenersWidget.EventListenersWidget;
/** @constructor */
Elements.InspectElementModeController = ElementsModule.InspectElementModeController.InspectElementModeController;
/** @constructor */
Elements.InspectElementModeController.ToggleSearchActionDelegate =
    ElementsModule.InspectElementModeController.ToggleSearchActionDelegate;
/** @interface */
Elements.MarkerDecorator = ElementsModule.MarkerDecorator.MarkerDecorator;
Elements.GenericDecorator = ElementsModule.MarkerDecorator.GenericDecorator;
/** @constructor */
Elements.LayoutSidebarPane = ElementsModule.LayoutSidebarPane.LayoutSidebarPane;
/** @constructor */
Elements.MetricsSidebarPane = ElementsModule.MetricsSidebarPane.MetricsSidebarPane;
/** @constructor */
Elements.NodeStackTraceWidget = ElementsModule.NodeStackTraceWidget.NodeStackTraceWidget;
/** @constructor */
Elements.PropertiesWidget = ElementsModule.PropertiesWidget.PropertiesWidget;
/** @constructor */
Elements.StylePropertyTreeElement = ElementsModule.StylePropertyTreeElement.StylePropertyTreeElement;
/** @constructor */
Elements.StylesSidebarPane = ElementsModule.StylesSidebarPane.StylesSidebarPane;
/** @constructor */
Elements.StylesSidebarPane.CSSPropertyPrompt = ElementsModule.StylesSidebarPane.CSSPropertyPrompt;
/** @constructor */
Elements.StylesSidebarPane.ButtonProvider = ElementsModule.StylesSidebarPane.ButtonProvider;
/** @constructor */
Elements.StylePropertiesSection = ElementsModule.StylesSidebarPane.StylePropertiesSection;
//# sourceMappingURL=elements-legacy.js.map