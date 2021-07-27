// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../core/platform/platform.js';
import { GlassPane } from './GlassPane.js';
import { ShortcutRegistry } from './ShortcutRegistry.js';
import { createShadowRootWithCoreStyles } from './utils/create-shadow-root-with-core-styles.js';
import { ZoomManager } from './ZoomManager.js';
export class Tooltip {
    element;
    _shadowRoot;
    _tooltipElement;
    _anchorElement;
    _tooltipLastOpened;
    _tooltipLastClosed;
    constructor(doc) {
        this.element = doc.body.createChild('div');
        this._shadowRoot = createShadowRootWithCoreStyles(this.element, { cssFile: 'ui/legacy/tooltip.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this._tooltipElement = this._shadowRoot.createChild('div', 'tooltip');
        doc.addEventListener('mousemove', this._mouseMove.bind(this), true);
        doc.addEventListener('mousedown', this._hide.bind(this, true), true);
        doc.addEventListener('mouseleave', this._hide.bind(this, false), true);
        doc.addEventListener('keydown', this._keyDown.bind(this), true);
        // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
        doc[_symbol] = this;
        ZoomManager.instance().addEventListener("ZoomChanged" /* ZoomChanged */, this._reset, this);
        if (doc.defaultView) {
            doc.defaultView.addEventListener('resize', this._reset.bind(this), false);
        }
    }
    static installHandler(doc) {
        new Tooltip(doc);
    }
    static install(element, tooltipContent, actionId, options) {
        if (!tooltipContent) {
            // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
            delete element[_symbol];
            return;
        }
        // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
        element[_symbol] = { content: tooltipContent, actionId: actionId, options: options || {} };
        let timeout;
        element.addEventListener('focus', (event) => {
            // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
            const tooltipInstance = element.ownerDocument[_symbol];
            if (tooltipInstance) {
                timeout = window.setTimeout(() => {
                    if (element.matches(':focus-visible')) {
                        tooltipInstance._show(element, event);
                    }
                    timeout = null;
                }, Timing.OpeningDelay);
            }
        });
        element.addEventListener('blur', () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
            const tooltipInstance = element.ownerDocument[_symbol];
            if (tooltipInstance) {
                tooltipInstance._hide();
            }
        });
    }
    static getContent(element) {
        // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
        const tooltip = element[_symbol];
        return tooltip ? tooltip.content : '';
    }
    static addNativeOverrideContainer(element) {
        _nativeOverrideContainer.push(element);
    }
    _mouseMove(event) {
        const mouseEvent = event;
        const path = mouseEvent.composedPath();
        if (!path || mouseEvent.buttons !== 0 || (mouseEvent.movementX === 0 && mouseEvent.movementY === 0)) {
            return;
        }
        if (this._anchorElement && path.indexOf(this._anchorElement) === -1) {
            this._hide(false);
        }
        for (const element of path) {
            if (element === this._anchorElement) {
                return;
            }
            // The offsetParent is null when the element or an ancestor has 'display: none'.
            if (!(element instanceof HTMLElement) || element.offsetParent === null) {
                continue;
            }
            if (Tooltip.getContent(element)) {
                this._show(element, mouseEvent);
                return;
            }
        }
    }
    _keyDown(event) {
        if (!this._anchorElement) {
            return;
        }
        this._hide(true);
        const keyboardEvent = event;
        if (keyboardEvent.key === 'Escape') {
            keyboardEvent.consume(true);
        }
    }
    _reposition(anchorElement, event) {
        // Reposition to ensure text doesn't overflow unnecessarily.
        this._tooltipElement.positionAt(0, 0);
        // Get container element.
        const container = GlassPane.container(anchorElement.ownerDocument);
        // Position tooltip based on the anchor element.
        const containerBox = container.boxInWindow(this.element.window());
        const anchorBox = this._anchorElement.boxInWindow(this.element.window());
        const anchorOffset = 2;
        const pageMargin = 2;
        const cursorOffset = 10;
        const textContentMatchesWhitespace = this._tooltipElement && (this._tooltipElement.textContent || '').match('\\s');
        this._tooltipElement.classList.toggle('tooltip-breakword', !textContentMatchesWhitespace);
        this._tooltipElement.style.maxWidth = (containerBox.width - pageMargin * 2) + 'px';
        this._tooltipElement.style.maxHeight = '';
        const tooltipWidth = this._tooltipElement.offsetWidth;
        const tooltipHeight = this._tooltipElement.offsetHeight;
        const anchorTooltipAtElement = this._anchorTooltipAtElement() || event.x === undefined;
        let tooltipX = anchorTooltipAtElement ? anchorBox.x : event.x + cursorOffset;
        tooltipX = Platform.NumberUtilities.clamp(tooltipX, containerBox.x + pageMargin, containerBox.x + containerBox.width - tooltipWidth - pageMargin);
        let tooltipY;
        if (!anchorTooltipAtElement) {
            tooltipY = event.y + cursorOffset + tooltipHeight < containerBox.y + containerBox.height ?
                event.y + cursorOffset :
                event.y - tooltipHeight - 1;
        }
        else {
            const onBottom = anchorBox.y + anchorOffset + anchorBox.height + tooltipHeight < containerBox.y + containerBox.height;
            tooltipY = onBottom ? anchorBox.y + anchorBox.height + anchorOffset : anchorBox.y - tooltipHeight - anchorOffset;
        }
        this._tooltipElement.positionAt(tooltipX, tooltipY);
    }
    _anchorTooltipAtElement() {
        if (!this._anchorElement) {
            throw new Error('No _anchorElement set');
        }
        // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
        const tooltip = this._anchorElement[_symbol];
        if (tooltip.options.anchorTooltipAtElement !== undefined) {
            return tooltip.options.anchorTooltipAtElement;
        }
        // default legacy behavior; better to explicitly configure tooltip placement via options
        return this._anchorElement.nodeName === 'BUTTON' || this._anchorElement.nodeName === 'LABEL';
    }
    _show(anchorElement, event) {
        // @ts-ignore crbug.com/1150762: HTMLElement#title magic override.
        const tooltip = anchorElement[_symbol];
        this._anchorElement = anchorElement;
        this._tooltipElement.removeChildren();
        // Check if native tooltips should be used.
        if (this._shouldUseNativeTooltips()) {
            Tooltip.install(this._anchorElement, tooltip.content);
            return;
        }
        if (typeof tooltip.content === 'string') {
            this._tooltipElement.setTextContentTruncatedIfNeeded(tooltip.content);
        }
        else {
            this._tooltipElement.appendChild(tooltip.content);
        }
        if (tooltip.actionId) {
            const shortcuts = ShortcutRegistry.instance().shortcutsForAction(tooltip.actionId);
            for (const shortcut of shortcuts) {
                const shortcutElement = this._tooltipElement.createChild('div', 'tooltip-shortcut');
                shortcutElement.textContent = shortcut.title();
            }
        }
        // Show tooltip instantly if a tooltip was shown recently.
        const now = Date.now();
        const instant = (this._tooltipLastClosed !== undefined && now - this._tooltipLastClosed < Timing.InstantThreshold);
        this._tooltipElement.classList.toggle('instant', instant);
        this._tooltipLastOpened = instant ? now : now + Timing.OpeningDelay;
        this._reposition(anchorElement, event);
        this._tooltipElement.classList.add('shown');
    }
    _shouldUseNativeTooltips() {
        for (const element of _nativeOverrideContainer) {
            if (this._anchorElement && this._anchorElement.isSelfOrDescendant(element)) {
                return true;
            }
        }
        return false;
    }
    _hide(removeInstant) {
        delete this._anchorElement;
        this._tooltipElement.classList.remove('shown');
        if (removeInstant) {
            delete this._tooltipLastClosed;
        }
        else if (this._tooltipLastOpened && Date.now() > this._tooltipLastOpened) {
            this._tooltipLastClosed = Date.now();
        }
    }
    _reset() {
        this._hide(true);
        this._tooltipElement.positionAt(0, 0);
        this._tooltipElement.style.maxWidth = '0';
        this._tooltipElement.style.maxHeight = '0';
    }
}
const Timing = {
    // Max time between tooltips showing that no opening delay is required.
    'InstantThreshold': 300,
    // Wait time before opening a tooltip.
    'OpeningDelay': 600,
};
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _symbol = Symbol('Tooltip');
// Exported for layout tests.
export const TooltipSymbol = _symbol;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _nativeOverrideContainer = [];
//# sourceMappingURL=Tooltip.js.map