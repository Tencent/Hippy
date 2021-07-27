// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2009 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../../../../core/host/host.js';
import * as UI from '../../legacy.js';
import * as ThemeSupport from '../../theme_support/theme_support.js';
const labelMap = new Map();
export class TimelineGrid {
    element;
    _dividersElement;
    _gridHeaderElement;
    _eventDividersElement;
    _dividersLabelBarElement;
    constructor() {
        this.element = document.createElement('div');
        UI.Utils.appendStyle(this.element, 'ui/legacy/components/perf_ui/timelineGrid.css', { enableLegacyPatching: false });
        this._dividersElement = this.element.createChild('div', 'resources-dividers');
        this._gridHeaderElement = document.createElement('div');
        this._gridHeaderElement.classList.add('timeline-grid-header');
        this._eventDividersElement = this._gridHeaderElement.createChild('div', 'resources-event-dividers');
        this._dividersLabelBarElement = this._gridHeaderElement.createChild('div', 'resources-dividers-label-bar');
        this.element.appendChild(this._gridHeaderElement);
    }
    static calculateGridOffsets(calculator, freeZoneAtLeft) {
        /** @const */ const minGridSlicePx = 64; // minimal distance between grid lines.
        const clientWidth = calculator.computePosition(calculator.maximumBoundary());
        let dividersCount = clientWidth / minGridSlicePx;
        let gridSliceTime = calculator.boundarySpan() / dividersCount;
        const pixelsPerTime = clientWidth / calculator.boundarySpan();
        // Align gridSliceTime to a nearest round value.
        // We allow spans that fit into the formula: span = (1|2|5)x10^n,
        // e.g.: ...  .1  .2  .5  1  2  5  10  20  50  ...
        // After a span has been chosen make grid lines at multiples of the span.
        const logGridSliceTime = Math.ceil(Math.log(gridSliceTime) / Math.LN10);
        gridSliceTime = Math.pow(10, logGridSliceTime);
        if (gridSliceTime * pixelsPerTime >= 5 * minGridSlicePx) {
            gridSliceTime = gridSliceTime / 5;
        }
        if (gridSliceTime * pixelsPerTime >= 2 * minGridSlicePx) {
            gridSliceTime = gridSliceTime / 2;
        }
        const firstDividerTime = Math.ceil((calculator.minimumBoundary() - calculator.zeroTime()) / gridSliceTime) * gridSliceTime +
            calculator.zeroTime();
        let lastDividerTime = calculator.maximumBoundary();
        // Add some extra space past the right boundary as the rightmost divider label text
        // may be partially shown rather than just pop up when a new rightmost divider gets into the view.
        lastDividerTime += minGridSlicePx / pixelsPerTime;
        dividersCount = Math.ceil((lastDividerTime - firstDividerTime) / gridSliceTime);
        if (!gridSliceTime) {
            dividersCount = 0;
        }
        const offsets = [];
        for (let i = 0; i < dividersCount; ++i) {
            const time = firstDividerTime + gridSliceTime * i;
            if (calculator.computePosition(time) < (freeZoneAtLeft || 0)) {
                continue;
            }
            offsets.push({ position: Math.floor(calculator.computePosition(time)), time: time });
        }
        return { offsets: offsets, precision: Math.max(0, -Math.floor(Math.log(gridSliceTime * 1.01) / Math.LN10)) };
    }
    static drawCanvasGrid(context, dividersData) {
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        const height = Math.floor(context.canvas.height / window.devicePixelRatio);
        context.strokeStyle = getComputedStyle(document.body).getPropertyValue('--divider-line');
        context.lineWidth = 1;
        context.translate(0.5, 0.5);
        context.beginPath();
        for (const offsetInfo of dividersData.offsets) {
            context.moveTo(offsetInfo.position, 0);
            context.lineTo(offsetInfo.position, height);
        }
        context.stroke();
        context.restore();
    }
    static drawCanvasHeaders(context, dividersData, formatTimeFunction, paddingTop, headerHeight, freeZoneAtLeft) {
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        const width = Math.ceil(context.canvas.width / window.devicePixelRatio);
        context.beginPath();
        context.fillStyle = ThemeSupport.ThemeSupport.instance().patchColorText('rgba(255, 255, 255, 0.5)', ThemeSupport.ThemeSupport.ColorUsage.Background);
        context.fillRect(0, 0, width, headerHeight);
        context.fillStyle =
            ThemeSupport.ThemeSupport.instance().patchColorText('#333', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        context.textBaseline = 'hanging';
        context.font = '11px ' + Host.Platform.fontFamily();
        const paddingRight = 4;
        for (const offsetInfo of dividersData.offsets) {
            const text = formatTimeFunction(offsetInfo.time);
            const textWidth = context.measureText(text).width;
            const textPosition = offsetInfo.position - textWidth - paddingRight;
            if (!freeZoneAtLeft || freeZoneAtLeft < textPosition) {
                context.fillText(text, textPosition, paddingTop);
            }
        }
        context.restore();
    }
    get dividersElement() {
        return this._dividersElement;
    }
    get dividersLabelBarElement() {
        return this._dividersLabelBarElement;
    }
    removeDividers() {
        this._dividersElement.removeChildren();
        this._dividersLabelBarElement.removeChildren();
    }
    updateDividers(calculator, freeZoneAtLeft) {
        const dividersData = TimelineGrid.calculateGridOffsets(calculator, freeZoneAtLeft);
        const dividerOffsets = dividersData.offsets;
        const precision = dividersData.precision;
        const dividersElementClientWidth = this._dividersElement.clientWidth;
        // Reuse divider elements and labels.
        let divider = this._dividersElement.firstChild;
        let dividerLabelBar = this._dividersLabelBarElement.firstChild;
        for (let i = 0; i < dividerOffsets.length; ++i) {
            if (!divider) {
                divider = document.createElement('div');
                divider.className = 'resources-divider';
                this._dividersElement.appendChild(divider);
                dividerLabelBar = document.createElement('div');
                dividerLabelBar.className = 'resources-divider';
                const label = document.createElement('div');
                label.className = 'resources-divider-label';
                labelMap.set(dividerLabelBar, label);
                dividerLabelBar.appendChild(label);
                this._dividersLabelBarElement.appendChild(dividerLabelBar);
            }
            const time = dividerOffsets[i].time;
            const position = dividerOffsets[i].position;
            if (dividerLabelBar) {
                const label = labelMap.get(dividerLabelBar);
                if (label) {
                    label.textContent = calculator.formatValue(time, precision);
                }
            }
            const percentLeft = 100 * position / dividersElementClientWidth;
            divider.style.left = percentLeft + '%';
            if (dividerLabelBar) {
                dividerLabelBar.style.left = percentLeft + '%';
            }
            divider = divider.nextSibling;
            if (dividerLabelBar) {
                dividerLabelBar = dividerLabelBar.nextSibling;
            }
        }
        // Remove extras.
        while (divider) {
            const nextDivider = divider.nextSibling;
            this._dividersElement.removeChild(divider);
            if (nextDivider) {
                divider = nextDivider;
            }
            else {
                break;
            }
        }
        while (dividerLabelBar) {
            const nextDivider = dividerLabelBar.nextSibling;
            this._dividersLabelBarElement.removeChild(dividerLabelBar);
            if (nextDivider) {
                dividerLabelBar = nextDivider;
            }
            else {
                break;
            }
        }
        return true;
    }
    addEventDivider(divider) {
        this._eventDividersElement.appendChild(divider);
    }
    addEventDividers(dividers) {
        this._gridHeaderElement.removeChild(this._eventDividersElement);
        for (const divider of dividers) {
            this._eventDividersElement.appendChild(divider);
        }
        this._gridHeaderElement.appendChild(this._eventDividersElement);
    }
    removeEventDividers() {
        this._eventDividersElement.removeChildren();
    }
    hideEventDividers() {
        this._eventDividersElement.classList.add('hidden');
    }
    showEventDividers() {
        this._eventDividersElement.classList.remove('hidden');
    }
    hideDividers() {
        this._dividersElement.classList.add('hidden');
    }
    showDividers() {
        this._dividersElement.classList.remove('hidden');
    }
    setScrollTop(scrollTop) {
        this._dividersLabelBarElement.style.top = scrollTop + 'px';
        this._eventDividersElement.style.top = scrollTop + 'px';
    }
}
//# sourceMappingURL=TimelineGrid.js.map