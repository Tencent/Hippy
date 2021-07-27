import type * as SDK from '../../../core/sdk/sdk.js';
import * as Components from '../../../ui/legacy/components/utils/utils.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import type * as Protocol from '../../../generated/protocol.js';
export interface StackTraceData {
    frame: SDK.ResourceTreeModel.ResourceTreeFrame;
    buildStackTraceRows: (stackTrace: Protocol.Runtime.StackTrace, target: SDK.Target.Target | null, linkifier: Components.Linkifier.Linkifier, tabStops: boolean | undefined, updateCallback?: (arg0: (Components.JSPresentationUtils.StackTraceRegularRow | Components.JSPresentationUtils.StackTraceAsyncRow)[]) => void) => (Components.JSPresentationUtils.StackTraceRegularRow | Components.JSPresentationUtils.StackTraceAsyncRow)[];
}
export declare class StackTrace extends HTMLElement {
    static litTagName: import("../../../ui/lit-html/static.js").Static;
    private readonly shadow;
    private readonly linkifier;
    private stackTraceRows;
    private showHidden;
    set data(data: StackTraceData);
    private onStackTraceRowsUpdated;
    private onShowAllClick;
    createRowTemplates(): LitHtml.TemplateResult[];
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-stack-trace': StackTrace;
    }
}
