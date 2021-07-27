// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
export function formatMillisecondsToSeconds(ms, decimalPlaces) {
    const roundPower = Math.pow(10, 3 - decimalPlaces);
    const denominatorPower = Math.pow(10, Math.max(0, decimalPlaces));
    return `${Math.round(ms / roundPower) / denominatorPower} s`;
}
/**
 * Manage the bounding box properties for the ticking flame chart.
 * kept in a separate file for unit testing.
 */
export class Bounds {
    _min;
    _max;
    _low;
    _high;
    _maxRange;
    _minRange;
    constructor(initialLow, initialHigh, maxRange, minRange) {
        this._min = initialLow;
        this._max = initialHigh;
        this._low = this._min;
        this._high = this._max;
        this._maxRange = maxRange;
        this._minRange = minRange;
    }
    get low() {
        return this._low;
    }
    get high() {
        return this._high;
    }
    get min() {
        return this._min;
    }
    get max() {
        return this._max;
    }
    get range() {
        return this._high - this._low;
    }
    _reassertBounds() {
        let needsAdjustment = true;
        while (needsAdjustment) {
            needsAdjustment = false;
            if (this.range < this._minRange) {
                needsAdjustment = true;
                const delta = (this._minRange - this.range) / 2;
                this._high += delta;
                this._low -= delta;
            }
            if (this._low < this._min) {
                needsAdjustment = true;
                this._low = this._min;
            }
            if (this._high > this._max) {
                needsAdjustment = true;
                this._high = this._max;
            }
        }
    }
    /**
     * zoom out |amount| ticks at position [0, 1] along the current range of the timeline.
     */
    zoomOut(amount, position) {
        const range = this._high - this._low;
        const growSize = range * Math.pow(1.1, amount) - range;
        const lowEnd = growSize * position;
        const highEnd = growSize - lowEnd;
        this._low -= lowEnd;
        this._high += highEnd;
        this._reassertBounds();
    }
    /**
     * zoom in |amount| ticks at position [0, 1] along the current range of the timeline.
     */
    zoomIn(amount, position) {
        const range = this._high - this._low;
        if (this.range <= this._minRange) {
            return;
        }
        const shrinkSize = range - range / Math.pow(1.1, amount);
        const lowEnd = shrinkSize * position;
        const highEnd = shrinkSize - lowEnd;
        this._low += lowEnd;
        this._high -= highEnd;
        this._reassertBounds();
    }
    /**
     * Add Xms to the max value, and scroll the timeline forward if the end is in sight.
     */
    addMax(amount) {
        const range = this._high - this._low;
        const isAtHighEnd = this._high === this._max;
        const isZoomedOut = this._low === this._min || range >= this._maxRange;
        this._max += amount;
        if (isAtHighEnd && isZoomedOut) {
            this._high = this._max;
        }
        this._reassertBounds();
    }
    /**
     * Attempt to push the maximum time up to |time| ms.
     */
    pushMaxAtLeastTo(time) {
        if (this._max < time) {
            this.addMax(time - this._max);
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=TickingFlameChartHelpers.js.map