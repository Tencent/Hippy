import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
export declare const decorateNodeLabel: (node: SDK.DOMModel.DOMNode, parentElement: HTMLElement, tooltipContent?: string | undefined) => void;
export declare const linkifyNodeReference: (node: SDK.DOMModel.DOMNode | null, options?: Common.Linkifier.Options | undefined) => Node;
export declare const linkifyDeferredNodeReference: (deferredNode: SDK.DOMModel.DeferredDOMNode, options?: Common.Linkifier.Options | undefined) => Node;
export declare class Linkifier implements Common.Linkifier.Linkifier {
    static instance(opts?: {
        forceNew: boolean | null;
    }): Linkifier;
    linkify(object: Object, options?: Common.Linkifier.Options): Node;
}
