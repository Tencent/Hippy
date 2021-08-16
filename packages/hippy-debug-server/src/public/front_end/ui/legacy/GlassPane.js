// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import { Icon } from './Icon.js';
import { deepElementFromEvent } from './UIUtils.js';
import { measuredScrollbarWidth } from './utils/measured-scrollbar-width.js';
import { Widget } from './Widget.js';
export class GlassPane extends Common.ObjectWrapper.ObjectWrapper {
    _widget;
    element;
    contentElement;
    _arrowElement;
    _onMouseDownBound;
    _onClickOutsideCallback;
    _maxSize;
    _positionX;
    _positionY;
    _anchorBox;
    _anchorBehavior;
    _sizeBehavior;
    _marginBehavior;
    constructor() {
        super();
        this._widget = new Widget(true);
        this._widget.markAsRoot();
        this.element = this._widget.element;
        this.contentElement = this._widget.contentElement;
        this._arrowElement = Icon.create('', 'arrow hidden');
        if (this.element.shadowRoot) {
            this.element.shadowRoot.appendChild(this._arrowElement);
        }
        this.registerRequiredCSS('ui/legacy/glassPane.css', { enableLegacyPatching: false });
        this.setPointerEventsBehavior(PointerEventsBehavior.PierceGlassPane);
        this._onMouseDownBound = this._onMouseDown.bind(this);
        this._onClickOutsideCallback = null;
        this._maxSize = null;
        this._positionX = null;
        this._positionY = null;
        this._anchorBox = null;
        this._anchorBehavior = AnchorBehavior.PreferTop;
        this._sizeBehavior = SizeBehavior.SetExactSize;
        this._marginBehavior = MarginBehavior.DefaultMargin;
    }
    isShowing() {
        return this._widget.isShowing();
    }
    registerRequiredCSS(cssFile, options) {
        this._widget.registerRequiredCSS(cssFile, options);
    }
    setDefaultFocusedElement(element) {
        this._widget.setDefaultFocusedElement(element);
    }
    setDimmed(dimmed) {
        this.element.classList.toggle('dimmed-pane', dimmed);
    }
    setPointerEventsBehavior(pointerEventsBehavior) {
        this.element.classList.toggle('no-pointer-events', pointerEventsBehavior !== PointerEventsBehavior.BlockedByGlassPane);
        this.contentElement.classList.toggle('no-pointer-events', pointerEventsBehavior === PointerEventsBehavior.PierceContents);
    }
    setOutsideClickCallback(callback) {
        this._onClickOutsideCallback = callback;
    }
    setMaxContentSize(size) {
        this._maxSize = size;
        this.positionContent();
    }
    setSizeBehavior(sizeBehavior) {
        this._sizeBehavior = sizeBehavior;
        this.positionContent();
    }
    setContentPosition(x, y) {
        this._positionX = x;
        this._positionY = y;
        this.positionContent();
    }
    setContentAnchorBox(anchorBox) {
        this._anchorBox = anchorBox;
        this.positionContent();
    }
    setAnchorBehavior(behavior) {
        this._anchorBehavior = behavior;
    }
    setMarginBehavior(behavior) {
        this._marginBehavior = behavior;
        this._arrowElement.classList.toggle('hidden', behavior !== MarginBehavior.Arrow);
    }
    show(document) {
        if (this.isShowing()) {
            return;
        }
        // TODO(crbug.com/1006759): Extract the magic number
        // Deliberately starts with 3000 to hide other z-indexed elements below.
        this.element.style.zIndex = `${3000 + 1000 * _panes.size}`;
        document.body.addEventListener('mousedown', this._onMouseDownBound, true);
        this._widget.show(document.body);
        _panes.add(this);
        this.positionContent();
    }
    hide() {
        if (!this.isShowing()) {
            return;
        }
        _panes.delete(this);
        this.element.ownerDocument.body.removeEventListener('mousedown', this._onMouseDownBound, true);
        this._widget.detach();
    }
    _onMouseDown(event) {
        if (!this._onClickOutsideCallback) {
            return;
        }
        const node = deepElementFromEvent(event);
        if (!node || this.contentElement.isSelfOrAncestor(node)) {
            return;
        }
        this._onClickOutsideCallback.call(null, event);
    }
    positionContent() {
        if (!this.isShowing()) {
            return;
        }
        const showArrow = this._marginBehavior === MarginBehavior.Arrow;
        const gutterSize = showArrow ? 8 : (this._marginBehavior === MarginBehavior.NoMargin ? 0 : 3);
        const scrollbarSize = measuredScrollbarWidth(this.element.ownerDocument);
        const arrowSize = 10;
        const container = (_containers.get(this.element.ownerDocument));
        if (this._sizeBehavior === SizeBehavior.MeasureContent) {
            this.contentElement.positionAt(0, 0);
            this.contentElement.style.width = '';
            this.contentElement.style.maxWidth = '';
            this.contentElement.style.height = '';
            this.contentElement.style.maxHeight = '';
        }
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        let width = containerWidth - gutterSize * 2;
        let height = containerHeight - gutterSize * 2;
        let positionX = gutterSize;
        let positionY = gutterSize;
        if (this._maxSize) {
            width = Math.min(width, this._maxSize.width);
            height = Math.min(height, this._maxSize.height);
        }
        if (this._sizeBehavior === SizeBehavior.MeasureContent) {
            const measuredRect = this.contentElement.getBoundingClientRect();
            const widthOverflow = height < measuredRect.height ? scrollbarSize : 0;
            const heightOverflow = width < measuredRect.width ? scrollbarSize : 0;
            width = Math.min(width, measuredRect.width + widthOverflow);
            height = Math.min(height, measuredRect.height + heightOverflow);
        }
        if (this._anchorBox) {
            const anchorBox = this._anchorBox.relativeToElement(container);
            let behavior = this._anchorBehavior;
            this._arrowElement.classList.remove('arrow-none', 'arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');
            if (behavior === AnchorBehavior.PreferTop || behavior === AnchorBehavior.PreferBottom) {
                const top = anchorBox.y - 2 * gutterSize;
                const bottom = containerHeight - anchorBox.y - anchorBox.height - 2 * gutterSize;
                if (behavior === AnchorBehavior.PreferTop && top < height && bottom > top) {
                    behavior = AnchorBehavior.PreferBottom;
                }
                if (behavior === AnchorBehavior.PreferBottom && bottom < height && top > bottom) {
                    behavior = AnchorBehavior.PreferTop;
                }
                let arrowY;
                let enoughHeight = true;
                if (behavior === AnchorBehavior.PreferTop) {
                    positionY = Math.max(gutterSize, anchorBox.y - height - gutterSize);
                    const spaceTop = anchorBox.y - positionY - gutterSize;
                    if (this._sizeBehavior === SizeBehavior.MeasureContent) {
                        if (height > spaceTop) {
                            this._arrowElement.classList.add('arrow-none');
                            enoughHeight = false;
                        }
                    }
                    else {
                        height = Math.min(height, spaceTop);
                    }
                    this._arrowElement.setIconType('mediumicon-arrow-bottom');
                    this._arrowElement.classList.add('arrow-bottom');
                    arrowY = anchorBox.y - gutterSize;
                }
                else {
                    positionY = anchorBox.y + anchorBox.height + gutterSize;
                    const spaceBottom = containerHeight - positionY - gutterSize;
                    if (this._sizeBehavior === SizeBehavior.MeasureContent) {
                        if (height > spaceBottom) {
                            this._arrowElement.classList.add('arrow-none');
                            positionY = containerHeight - gutterSize - height;
                            enoughHeight = false;
                        }
                    }
                    else {
                        height = Math.min(height, spaceBottom);
                    }
                    this._arrowElement.setIconType('mediumicon-arrow-top');
                    this._arrowElement.classList.add('arrow-top');
                    arrowY = anchorBox.y + anchorBox.height + gutterSize;
                }
                positionX = Math.max(gutterSize, Math.min(anchorBox.x, containerWidth - width - gutterSize));
                if (!enoughHeight) {
                    positionX = Math.min(positionX + arrowSize, containerWidth - width - gutterSize);
                }
                else if (showArrow && positionX - arrowSize >= gutterSize) {
                    positionX -= arrowSize;
                }
                width = Math.min(width, containerWidth - positionX - gutterSize);
                if (2 * arrowSize >= width) {
                    this._arrowElement.classList.add('arrow-none');
                }
                else {
                    let arrowX = anchorBox.x + Math.min(50, Math.floor(anchorBox.width / 2));
                    arrowX = Platform.NumberUtilities.clamp(arrowX, positionX + arrowSize, positionX + width - arrowSize);
                    this._arrowElement.positionAt(arrowX, arrowY, container);
                }
            }
            else {
                const left = anchorBox.x - 2 * gutterSize;
                const right = containerWidth - anchorBox.x - anchorBox.width - 2 * gutterSize;
                if (behavior === AnchorBehavior.PreferLeft && left < width && right > left) {
                    behavior = AnchorBehavior.PreferRight;
                }
                if (behavior === AnchorBehavior.PreferRight && right < width && left > right) {
                    behavior = AnchorBehavior.PreferLeft;
                }
                let arrowX;
                let enoughWidth = true;
                if (behavior === AnchorBehavior.PreferLeft) {
                    positionX = Math.max(gutterSize, anchorBox.x - width - gutterSize);
                    const spaceLeft = anchorBox.x - positionX - gutterSize;
                    if (this._sizeBehavior === SizeBehavior.MeasureContent) {
                        if (width > spaceLeft) {
                            this._arrowElement.classList.add('arrow-none');
                            enoughWidth = false;
                        }
                    }
                    else {
                        width = Math.min(width, spaceLeft);
                    }
                    this._arrowElement.setIconType('mediumicon-arrow-right');
                    this._arrowElement.classList.add('arrow-right');
                    arrowX = anchorBox.x - gutterSize;
                }
                else {
                    positionX = anchorBox.x + anchorBox.width + gutterSize;
                    const spaceRight = containerWidth - positionX - gutterSize;
                    if (this._sizeBehavior === SizeBehavior.MeasureContent) {
                        if (width > spaceRight) {
                            this._arrowElement.classList.add('arrow-none');
                            positionX = containerWidth - gutterSize - width;
                            enoughWidth = false;
                        }
                    }
                    else {
                        width = Math.min(width, spaceRight);
                    }
                    this._arrowElement.setIconType('mediumicon-arrow-left');
                    this._arrowElement.classList.add('arrow-left');
                    arrowX = anchorBox.x + anchorBox.width + gutterSize;
                }
                positionY = Math.max(gutterSize, Math.min(anchorBox.y, containerHeight - height - gutterSize));
                if (!enoughWidth) {
                    positionY = Math.min(positionY + arrowSize, containerHeight - height - gutterSize);
                }
                else if (showArrow && positionY - arrowSize >= gutterSize) {
                    positionY -= arrowSize;
                }
                height = Math.min(height, containerHeight - positionY - gutterSize);
                if (2 * arrowSize >= height) {
                    this._arrowElement.classList.add('arrow-none');
                }
                else {
                    let arrowY = anchorBox.y + Math.min(50, Math.floor(anchorBox.height / 2));
                    arrowY = Platform.NumberUtilities.clamp(arrowY, positionY + arrowSize, positionY + height - arrowSize);
                    this._arrowElement.positionAt(arrowX, arrowY, container);
                }
            }
        }
        else {
            positionX = this._positionX !== null ? this._positionX : (containerWidth - width) / 2;
            positionY = this._positionY !== null ? this._positionY : (containerHeight - height) / 2;
            width = Math.min(width, containerWidth - positionX - gutterSize);
            height = Math.min(height, containerHeight - positionY - gutterSize);
            this._arrowElement.classList.add('arrow-none');
        }
        this.contentElement.style.width = width + 'px';
        if (this._sizeBehavior === SizeBehavior.SetExactWidthMaxHeight) {
            this.contentElement.style.maxHeight = height + 'px';
        }
        else {
            this.contentElement.style.height = height + 'px';
        }
        this.contentElement.positionAt(positionX, positionY, container);
        this._widget.doResize();
    }
    widget() {
        return this._widget;
    }
    static setContainer(element) {
        _containers.set(element.ownerDocument, element);
        GlassPane.containerMoved(element);
    }
    static container(document) {
        return _containers.get(document);
    }
    static containerMoved(element) {
        for (const pane of _panes) {
            if (pane.isShowing() && pane.element.ownerDocument === element.ownerDocument) {
                pane.positionContent();
            }
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var PointerEventsBehavior;
(function (PointerEventsBehavior) {
    PointerEventsBehavior["BlockedByGlassPane"] = "BlockedByGlassPane";
    PointerEventsBehavior["PierceGlassPane"] = "PierceGlassPane";
    PointerEventsBehavior["PierceContents"] = "PierceContents";
})(PointerEventsBehavior || (PointerEventsBehavior = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var AnchorBehavior;
(function (AnchorBehavior) {
    AnchorBehavior["PreferTop"] = "PreferTop";
    AnchorBehavior["PreferBottom"] = "PreferBottom";
    AnchorBehavior["PreferLeft"] = "PreferLeft";
    AnchorBehavior["PreferRight"] = "PreferRight";
})(AnchorBehavior || (AnchorBehavior = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var SizeBehavior;
(function (SizeBehavior) {
    SizeBehavior["SetExactSize"] = "SetExactSize";
    SizeBehavior["SetExactWidthMaxHeight"] = "SetExactWidthMaxHeight";
    SizeBehavior["MeasureContent"] = "MeasureContent";
})(SizeBehavior || (SizeBehavior = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var MarginBehavior;
(function (MarginBehavior) {
    MarginBehavior["Arrow"] = "Arrow";
    MarginBehavior["DefaultMargin"] = "DefaultMargin";
    MarginBehavior["NoMargin"] = "NoMargin";
})(MarginBehavior || (MarginBehavior = {}));
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _containers = new Map();
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _panes = new Set();
// Exported for layout tests.
export const GlassPanePanes = _panes;
//# sourceMappingURL=GlassPane.js.map