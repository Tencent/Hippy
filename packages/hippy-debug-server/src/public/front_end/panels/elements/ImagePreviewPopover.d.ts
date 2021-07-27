import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
/**
 * ImagePreviewPopover sets listeners on the container element to display
 * an image preview if needed. The image URL comes from the event (mouseover) target
 * in a propery identified by HrefSymbol. To enable preview for any child element
 * set the property HrefSymbol.
 */
export declare class ImagePreviewPopover {
    _getLinkElement: (arg0: Event) => Element | null;
    _getDOMNode: (arg0: Element) => SDK.DOMModel.DOMNode | null;
    _popover: UI.PopoverHelper.PopoverHelper;
    constructor(container: Element, getLinkElement: (arg0: Event) => Element | null, getDOMNode: (arg0: Element) => SDK.DOMModel.DOMNode | null);
    _handleRequest(event: Event): UI.PopoverHelper.PopoverRequest | null;
    hide(): void;
    static setImageUrl(element: Element, url: string): Element;
    static getImageURL(element: Element): string | undefined;
}
