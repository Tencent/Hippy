// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import { elementDragStart } from './UIUtils.js';
export class ResizerWidget extends Common.ObjectWrapper.ObjectWrapper {
    _isEnabled;
    _elements;
    _installDragOnMouseDownBound;
    _cursor;
    _startX;
    _startY;
    constructor() {
        super();
        this._isEnabled = true;
        this._elements = new Set();
        this._installDragOnMouseDownBound = this._installDragOnMouseDown.bind(this);
        this._cursor = 'nwse-resize';
    }
    isEnabled() {
        return this._isEnabled;
    }
    setEnabled(enabled) {
        this._isEnabled = enabled;
        this.updateElementCursors();
    }
    elements() {
        return [...this._elements];
    }
    addElement(element) {
        if (!this._elements.has(element)) {
            this._elements.add(element);
            element.addEventListener('mousedown', this._installDragOnMouseDownBound, false);
            this._updateElementCursor(element);
        }
    }
    removeElement(element) {
        if (this._elements.has(element)) {
            this._elements.delete(element);
            element.removeEventListener('mousedown', this._installDragOnMouseDownBound, false);
            element.style.removeProperty('cursor');
        }
    }
    updateElementCursors() {
        this._elements.forEach(this._updateElementCursor.bind(this));
    }
    _updateElementCursor(element) {
        if (this._isEnabled) {
            element.style.setProperty('cursor', this.cursor());
        }
        else {
            element.style.removeProperty('cursor');
        }
    }
    cursor() {
        return this._cursor;
    }
    setCursor(cursor) {
        this._cursor = cursor;
        this.updateElementCursors();
    }
    _installDragOnMouseDown(event) {
        const element = event.target;
        // Only handle drags of the nodes specified.
        if (!this._elements.has(element)) {
            return false;
        }
        elementDragStart(element, this._dragStart.bind(this), event => {
            this._drag(event);
        }, this._dragEnd.bind(this), this.cursor(), event);
        return undefined;
    }
    _dragStart(event) {
        if (!this._isEnabled) {
            return false;
        }
        this._startX = event.pageX;
        this._startY = event.pageY;
        this.sendDragStart(this._startX, this._startY);
        return true;
    }
    sendDragStart(x, y) {
        this.dispatchEventToListeners(Events.ResizeStart, { startX: x, currentX: x, startY: y, currentY: y });
    }
    _drag(event) {
        if (!this._isEnabled) {
            this._dragEnd(event);
            return true; // Cancel drag.
        }
        this.sendDragMove(this._startX, event.pageX, this._startY, event.pageY, event.shiftKey);
        event.preventDefault();
        return false; // Continue drag.
    }
    sendDragMove(startX, currentX, startY, currentY, shiftKey) {
        this.dispatchEventToListeners(Events.ResizeUpdate, { startX: startX, currentX: currentX, startY: startY, currentY: currentY, shiftKey: shiftKey });
    }
    _dragEnd(_event) {
        this.dispatchEventToListeners(Events.ResizeEnd);
        delete this._startX;
        delete this._startY;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ResizeStart"] = "ResizeStart";
    Events["ResizeUpdate"] = "ResizeUpdate";
    Events["ResizeEnd"] = "ResizeEnd";
})(Events || (Events = {}));
export class SimpleResizerWidget extends ResizerWidget {
    _isVertical;
    constructor() {
        super();
        this._isVertical = true;
    }
    isVertical() {
        return this._isVertical;
    }
    /**
     * Vertical widget resizes height (along y-axis).
     */
    setVertical(vertical) {
        this._isVertical = vertical;
        this.updateElementCursors();
    }
    cursor() {
        return this._isVertical ? 'ns-resize' : 'ew-resize';
    }
    sendDragStart(x, y) {
        const position = this._isVertical ? y : x;
        this.dispatchEventToListeners(Events.ResizeStart, { startPosition: position, currentPosition: position });
    }
    sendDragMove(startX, currentX, startY, currentY, shiftKey) {
        if (this._isVertical) {
            this.dispatchEventToListeners(Events.ResizeUpdate, { startPosition: startY, currentPosition: currentY, shiftKey: shiftKey });
        }
        else {
            this.dispatchEventToListeners(Events.ResizeUpdate, { startPosition: startX, currentPosition: currentX, shiftKey: shiftKey });
        }
    }
}
//# sourceMappingURL=ResizerWidget.js.map