import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Bindings from '../../models/bindings/bindings.js';
import * as Protocol from '../../generated/protocol.js';
export declare class DebuggerPausedMessage {
    _element: HTMLDivElement;
    _contentElement: HTMLElement;
    constructor();
    element(): Element;
    static _descriptionWithoutStack(description: string): string;
    static _createDOMBreakpointHitMessage(details: SDK.DebuggerModel.DebuggerPausedDetails): Promise<Element>;
    render(details: SDK.DebuggerModel.DebuggerPausedDetails | null, debuggerWorkspaceBinding: Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding, breakpointManager: Bindings.BreakpointManager.BreakpointManager): Promise<void>;
}
export declare const BreakpointTypeNouns: Map<Protocol.DOMDebugger.DOMBreakpointType, () => Common.UIString.LocalizedString>;
