import * as SDK from '../../core/sdk/sdk.js';
import { CategorizedBreakpointsSidebarPane } from './CategorizedBreakpointsSidebarPane.js';
export declare class EventListenerBreakpointsSidebarPane extends CategorizedBreakpointsSidebarPane {
    private constructor();
    static instance(): EventListenerBreakpointsSidebarPane;
    _getBreakpointFromPausedDetails(details: SDK.DebuggerModel.DebuggerPausedDetails): SDK.DOMDebuggerModel.CategorizedBreakpoint | null;
}
