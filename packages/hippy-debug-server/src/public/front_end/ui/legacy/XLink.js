// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../../core/host/host.js';
import * as Platform from '../../core/platform/platform.js';
import * as ComponentHelpers from '../components/helpers/helpers.js';
import * as ARIAUtils from './ARIAUtils.js';
import { html } from './Fragment.js';
import { Tooltip } from './Tooltip.js';
import { addReferrerToURLIfNecessary, copyLinkAddressLabel, MaxLengthForDisplayedURLs, openLinkExternallyLabel } from './UIUtils.js';
import { XElement } from './XElement.js';
export class XLink extends XElement {
    tabIndex;
    target;
    rel;
    _href;
    _clickable;
    _onClick;
    _onKeyDown;
    static create(url, linkText, className, preventClick) {
        if (!linkText) {
            linkText = url;
        }
        className = className || '';
        // clang-format off
        // TODO(dgozman): migrate css from 'devtools-link' to 'x-link'.
        const element = html `
  <x-link href='${url}' class='${className} devtools-link' ${preventClick ? 'no-click' : ''}
  >${Platform.StringUtilities.trimMiddle(linkText, MaxLengthForDisplayedURLs)}</x-link>`;
        // clang-format on
        return /** @type {!HTMLElement} */ element;
    }
    constructor() {
        super();
        this.style.setProperty('display', 'inline');
        ARIAUtils.markAsLink(this);
        this.tabIndex = 0;
        this.target = '_blank';
        this.rel = 'noopener';
        this._href = null;
        this._clickable = true;
        this._onClick = (event) => {
            event.consume(true);
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(this._href);
            this.dispatchEvent(new Event('x-link-invoke'));
        };
        this._onKeyDown = (event) => {
            if (isEnterOrSpaceKey(event)) {
                event.consume(true);
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(this._href);
            }
            this.dispatchEvent(new Event('x-link-invoke'));
        };
    }
    static get observedAttributes() {
        // TODO(dgozman): should be super.observedAttributes, but it does not compile.
        return XElement.observedAttributes.concat(['href', 'no-click']);
    }
    get href() {
        return this._href;
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'no-click') {
            this._clickable = !newValue;
            this._updateClick();
            return;
        }
        if (attr === 'href') {
            // For invalid or non-absolute URLs, `href` should remain `null`.
            if (!newValue) {
                newValue = '';
            }
            let href = null;
            let url = null;
            try {
                url = new URL(addReferrerToURLIfNecessary(newValue));
                href = url.toString();
            }
            catch {
            }
            if (url && url.protocol === 'javascript:') {
                href = null;
            }
            this._href = href;
            Tooltip.install(this, newValue);
            this._updateClick();
            return;
        }
        super.attributeChangedCallback(attr, oldValue, newValue);
    }
    _updateClick() {
        if (this._href !== null && this._clickable) {
            this.addEventListener('click', this._onClick, false);
            this.addEventListener('keydown', this._onKeyDown, false);
            this.style.setProperty('cursor', 'pointer');
        }
        else {
            this.removeEventListener('click', this._onClick, false);
            this.removeEventListener('keydown', this._onKeyDown, false);
            this.style.removeProperty('cursor');
        }
    }
}
let contextMenuProviderInstance;
export class ContextMenuProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!contextMenuProviderInstance || forceNew) {
            contextMenuProviderInstance = new ContextMenuProvider();
        }
        return contextMenuProviderInstance;
    }
    appendApplicableItems(event, contextMenu, target) {
        let targetNode = target;
        while (targetNode && !(targetNode instanceof XLink)) {
            targetNode = targetNode.parentNodeOrShadowHost();
        }
        if (!targetNode || !targetNode._href) {
            return;
        }
        const node = targetNode;
        contextMenu.revealSection().appendItem(openLinkExternallyLabel(), () => {
            if (node._href) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(node._href);
            }
        });
        contextMenu.revealSection().appendItem(copyLinkAddressLabel(), () => {
            if (node._href) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(node._href);
            }
        });
    }
}
ComponentHelpers.CustomElements.defineComponent('x-link', XLink);
//# sourceMappingURL=XLink.js.map