// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as BrowserDebuggerModule from './browser_debugger.js';
self.BrowserDebugger = self.BrowserDebugger || {};
BrowserDebugger = BrowserDebugger || {};
/**
 * @constructor
 */
BrowserDebugger.DOMBreakpointsSidebarPane = BrowserDebuggerModule.DOMBreakpointsSidebarPane.DOMBreakpointsSidebarPane;
BrowserDebugger.DOMBreakpointsSidebarPane.BreakpointTypeLabels =
    BrowserDebuggerModule.DOMBreakpointsSidebarPane.BreakpointTypeLabels;
BrowserDebugger.DOMBreakpointsSidebarPane.ContextMenuProvider =
    BrowserDebuggerModule.DOMBreakpointsSidebarPane.ContextMenuProvider;
/**
 * @constructor
 */
BrowserDebugger.EventListenerBreakpointsSidebarPane =
    BrowserDebuggerModule.EventListenerBreakpointsSidebarPane.EventListenerBreakpointsSidebarPane;
/**
 * @constructor
 */
BrowserDebugger.CSPViolationBreakpointsSidebarPane =
    BrowserDebuggerModule.CSPViolationBreakpointsSidebarPane.CSPViolationBreakpointsSidebarPane;
/**
 * @constructor
 */
BrowserDebugger.ObjectEventListenersSidebarPane =
    BrowserDebuggerModule.ObjectEventListenersSidebarPane.ObjectEventListenersSidebarPane;
BrowserDebugger.ObjectEventListenersSidebarPane._objectGroupName =
    BrowserDebuggerModule.ObjectEventListenersSidebarPane.objectGroupName;
/**
 * @constructor
 */
BrowserDebugger.XHRBreakpointsSidebarPane = BrowserDebuggerModule.XHRBreakpointsSidebarPane.XHRBreakpointsSidebarPane;
//# sourceMappingURL=browser_debugger-legacy.js.map