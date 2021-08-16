// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
/**
 * ImagePreviewPopover sets listeners on the container element to display
 * an image preview if needed. The image URL comes from the event (mouseover) target
 * in a propery identified by HrefSymbol. To enable preview for any child element
 * set the property HrefSymbol.
 */
export class ImagePreviewPopover {
    _getLinkElement;
    _getDOMNode;
    _popover;
    constructor(container, getLinkElement, getDOMNode) {
        this._getLinkElement = getLinkElement;
        this._getDOMNode = getDOMNode;
        this._popover = new UI.PopoverHelper.PopoverHelper(container, this._handleRequest.bind(this));
        this._popover.setHasPadding(true);
        this._popover.setTimeout(0, 100);
    }
    _handleRequest(event) {
        const link = this._getLinkElement(event);
        if (!link) {
            return null;
        }
        const href = elementToURLMap.get(link);
        if (!href) {
            return null;
        }
        return {
            box: link.boxInWindow(),
            hide: undefined,
            show: async (popover) => {
                const node = this._getDOMNode(link);
                if (!node) {
                    return false;
                }
                const precomputedFeatures = await Components.ImagePreview.ImagePreview.loadDimensionsForNode(node);
                const preview = await Components.ImagePreview.ImagePreview.build(node.domModel().target(), href, true, { imageAltText: undefined, precomputedFeatures });
                if (preview) {
                    popover.contentElement.appendChild(preview);
                }
                return Boolean(preview);
            },
        };
    }
    hide() {
        this._popover.hidePopover();
    }
    static setImageUrl(element, url) {
        elementToURLMap.set(element, url);
        return element;
    }
    static getImageURL(element) {
        return elementToURLMap.get(element);
    }
}
const elementToURLMap = new WeakMap();
//# sourceMappingURL=ImagePreviewPopover.js.map