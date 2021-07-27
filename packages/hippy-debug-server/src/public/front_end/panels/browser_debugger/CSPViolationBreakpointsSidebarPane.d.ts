import * as SDK from '../../core/sdk/sdk.js';
import { CategorizedBreakpointsSidebarPane } from './CategorizedBreakpointsSidebarPane.js';
export declare class CSPViolationBreakpointsSidebarPane extends CategorizedBreakpointsSidebarPane {
    private constructor();
    static instance(): CSPViolationBreakpointsSidebarPane;
    _getBreakpointFromPausedDetails(details: SDK.DebuggerModel.DebuggerPausedDetails): SDK.DOMDebuggerModel.CategorizedBreakpoint | null;
    _toggleBreakpoint(breakpoint: SDK.DOMDebuggerModel.CategorizedBreakpoint, enabled: boolean): void;
}
