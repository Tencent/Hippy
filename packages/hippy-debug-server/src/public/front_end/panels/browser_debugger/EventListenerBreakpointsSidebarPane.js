// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
import { CategorizedBreakpointsSidebarPane } from './CategorizedBreakpointsSidebarPane.js';
let eventListenerBreakpointsSidebarPaneInstance;
export class EventListenerBreakpointsSidebarPane extends CategorizedBreakpointsSidebarPane {
    constructor() {
        const categories = SDK.DOMDebuggerModel.DOMDebuggerManager.instance().eventListenerBreakpoints().map(breakpoint => breakpoint.category());
        categories.sort();
        const breakpoints = SDK.DOMDebuggerModel.DOMDebuggerManager.instance().eventListenerBreakpoints();
        super(categories, breakpoints, 'sources.eventListenerBreakpoints', "EventListener" /* EventListener */);
    }
    static instance() {
        if (!eventListenerBreakpointsSidebarPaneInstance) {
            eventListenerBreakpointsSidebarPaneInstance = new EventListenerBreakpointsSidebarPane();
        }
        return eventListenerBreakpointsSidebarPaneInstance;
    }
    _getBreakpointFromPausedDetails(details) {
        return SDK.DOMDebuggerModel.DOMDebuggerManager.instance().resolveEventListenerBreakpoint(details.auxData);
    }
}
//# sourceMappingURL=EventListenerBreakpointsSidebarPane.js.map