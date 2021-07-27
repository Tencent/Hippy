// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import { assertInstanceOf, LONG_TASK_THRESHOLD } from './WebVitalsTimeline.js';
class WebVitalsLane {
    context;
    timeline;
    theme;
    constructor(timeline) {
        this.timeline = timeline;
        this.context = timeline.getContext();
        const styles = getComputedStyle(document.documentElement);
        this.theme = {
            good: styles.getPropertyValue('--lighthouse-green'),
            medium: styles.getPropertyValue('--lighthouse-orange'),
            bad: styles.getPropertyValue('--lighthouse-red'),
            frame: styles.getPropertyValue('--color-primary'),
            textPrimary: styles.getPropertyValue('--color-text-primary'),
            textSecondary: styles.getPropertyValue('--color-text-secondary'),
            background: styles.getPropertyValue('--color-background'),
            background50: styles.getPropertyValue('--color-background-opacity-50'),
            timeboxColor: styles.getPropertyValue('--color-primary-variant'),
        };
    }
    tX(x) {
        return this.timeline.tX(x);
    }
    tD(x) {
        return this.timeline.tD(x);
    }
    renderLaneLabel(label) {
        const upperCaseLabel = label.toLocaleUpperCase();
        this.context.save();
        this.context.font = '9px ' + Host.Platform.fontFamily();
        const text = this.context.measureText(upperCaseLabel);
        const height = text.actualBoundingBoxAscent - text.actualBoundingBoxDescent;
        this.context.fillStyle = this.theme.background50;
        this.context.fillRect(0, 1, text.width + 12, height + 6);
        this.context.fillStyle = this.theme.textSecondary;
        this.context.fillText(upperCaseLabel, 6, height + 4);
        this.context.restore();
    }
    render() {
    }
}
export class WebVitalsEventLane extends WebVitalsLane {
    markers = [];
    selectedMarker = null;
    hoverMarker = null;
    labelMetrics;
    label;
    getMarkerType;
    getMarkerOverlay;
    constructor(timeline, label, getMarkerType, getMarkerOverlay) {
        super(timeline);
        this.context = timeline.getContext();
        this.label = label;
        this.getMarkerType = getMarkerType;
        this.getMarkerOverlay = getMarkerOverlay;
        this.labelMetrics = this.measureLabel(this.label);
    }
    handlePointerMove(x) {
        const prevHoverMarker = this.hoverMarker;
        if (x === null) {
            this.hoverMarker = null;
        }
        else {
            this.hoverMarker = this.markers.find(m => {
                const tX = this.tX(m.timestamp);
                return tX - 5 <= x && x <= tX + m.widthIncludingLabel;
            }) ||
                null;
        }
        if (prevHoverMarker !== this.hoverMarker) {
            if (this.hoverMarker && this.getMarkerOverlay) {
                this.timeline.showOverlay(this.getMarkerOverlay(this.hoverMarker));
            }
            else {
                this.timeline.hideOverlay();
            }
        }
    }
    handleClick(_) {
        this.selectedMarker = this.hoverMarker;
    }
    setEvents(markers) {
        this.hoverMarker = null;
        this.selectedMarker = null;
        this.markers = markers.map(e => this.getMarker(e));
    }
    measureLabel(label) {
        this.context.save();
        this.context.font = '11px ' + Host.Platform.fontFamily();
        const textMetrics = this.context.measureText(label);
        this.context.restore();
        return textMetrics;
    }
    measureTimestamp(timestamp) {
        this.context.save();
        this.context.font = '11px ' + Host.Platform.fontFamily();
        const textMetrics = this.context.measureText(timestamp);
        this.context.restore();
        return textMetrics;
    }
    getMarker(event) {
        const markerType = this.getMarkerType(event);
        const timestamp = this.timeline.getTimeSinceLastMainFrameNavigation(event.timestamp);
        const timestampLabel = i18n.i18n.preciseMillisToString(timestamp, 1);
        const timestampMetrics = this.measureTimestamp(timestampLabel);
        const widthIncludingLabel = 10 + 5 + this.labelMetrics.width + 5;
        const widthIncludingTimestamp = widthIncludingLabel + 5 + timestampMetrics.width;
        return {
            timestamp: event.timestamp,
            timestampLabel,
            type: markerType,
            timestampMetrics,
            widthIncludingLabel,
            widthIncludingTimestamp,
        };
    }
    renderLabel(position, label, textMetrics) {
        this.context.save();
        this.context.font = '11px ' + Host.Platform.fontFamily();
        const height = textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent;
        this.context.fillStyle = this.theme.textPrimary;
        this.context.fillText(label, this.tX(position) + this.timeline.getLineHeight() * 0.5, 0.5 * this.timeline.getLineHeight() + height * .5);
        this.context.restore();
    }
    renderTimestamp(position, textWidth, timestamp, textMetrics) {
        this.context.save();
        this.context.font = '11px ' + Host.Platform.fontFamily();
        const height = textMetrics.actualBoundingBoxAscent - textMetrics.actualBoundingBoxDescent;
        this.context.fillStyle = this.theme.textSecondary;
        this.context.fillText(timestamp, this.tX(position) + this.timeline.getLineHeight() * 0.5 + textWidth + 5, 0.5 * this.timeline.getLineHeight() + height * .5);
        this.context.restore();
    }
    renderGoodMarkerSymbol(timestamp) {
        const radius = 5;
        this.context.save();
        this.context.beginPath();
        this.context.strokeStyle = this.theme.good;
        this.context.moveTo(this.tX(timestamp), 2);
        this.context.lineTo(this.tX(timestamp), 5);
        this.context.moveTo(this.tX(timestamp), 19);
        this.context.lineTo(this.tX(timestamp), 22);
        this.context.stroke();
        this.context.beginPath();
        this.context.fillStyle = this.theme.good;
        this.context.arc(this.tX(timestamp), 0.5 * this.timeline.getLineHeight(), radius, 0, Math.PI * 2);
        this.context.fill();
        this.context.restore();
    }
    renderMediumMarkerSymbol(timestamp) {
        this.context.save();
        this.context.beginPath();
        this.context.strokeStyle = this.theme.medium;
        this.context.moveTo(this.tX(timestamp), 2);
        this.context.lineTo(this.tX(timestamp), 5);
        this.context.moveTo(this.tX(timestamp), 19);
        this.context.lineTo(this.tX(timestamp), 22);
        this.context.stroke();
        this.context.beginPath();
        this.context.fillStyle = this.theme.medium;
        this.context.rect(this.tX(timestamp) - 5, 0.5 * this.timeline.getLineHeight() - 5, 10, 10);
        this.context.fill();
        this.context.restore();
    }
    renderBadMarkerSymbol(timestamp) {
        this.context.save();
        this.context.beginPath();
        this.context.strokeStyle = this.theme.bad;
        this.context.moveTo(this.tX(timestamp), 2);
        this.context.lineTo(this.tX(timestamp), 5);
        this.context.moveTo(this.tX(timestamp), 19);
        this.context.lineTo(this.tX(timestamp), 22);
        this.context.stroke();
        this.context.beginPath();
        this.context.fillStyle = this.theme.bad;
        this.context.translate(this.tX(timestamp), 0.5 * this.timeline.getLineHeight());
        this.context.rotate(45 * Math.PI / 180);
        this.context.rect(-4, -4, 8, 8);
        this.context.rotate(-45 * Math.PI / 180);
        this.context.translate(-this.tX(timestamp), -0.5 * this.timeline.getLineHeight());
        this.context.fill();
        this.context.restore();
    }
    renderMarker(marker, selected, hover, nextMarker) {
        const timestampLabel = marker.timestampLabel;
        const labelMetrics = this.labelMetrics;
        const timestampMetrics = marker.timestampMetrics;
        const showFrame = selected;
        const showDetails = hover || selected;
        const widthIncludingLabel = marker.widthIncludingLabel;
        const widthIncludingTimestamp = showDetails ? marker.widthIncludingTimestamp : widthIncludingLabel;
        const pixelDistance = nextMarker ? this.tD(nextMarker.timestamp - marker.timestamp) : null;
        const showLabel = showDetails || (pixelDistance !== null && pixelDistance > widthIncludingLabel + 5);
        if (showDetails) {
            this.context.save();
            const tX = this.tX(marker.timestamp) - 5 - 5;
            const tY = 1;
            const tWidth = widthIncludingTimestamp + 2 * 5;
            const tHeight = this.timeline.getLineHeight() - 2;
            this.context.fillStyle = this.theme.background;
            this.context.fillRect(tX, tY, tWidth, tHeight);
            if (showFrame) {
                this.context.strokeStyle = this.theme.frame;
                this.context.lineWidth = 2;
                this.context.strokeRect(tX, tY, tWidth, tHeight);
                this.context.lineWidth = 1;
            }
            this.context.restore();
        }
        if (showLabel) {
            if (labelMetrics) {
                this.renderLabel(marker.timestamp, this.label, labelMetrics);
            }
            if (showDetails) {
                this.renderTimestamp(marker.timestamp, labelMetrics ? labelMetrics.width : 0, timestampLabel, timestampMetrics);
            }
        }
        if (marker.type === "Good" /* Good */) {
            this.renderGoodMarkerSymbol(marker.timestamp);
        }
        else if (marker.type === "Medium" /* Medium */) {
            this.renderMediumMarkerSymbol(marker.timestamp);
        }
        else {
            this.renderBadMarkerSymbol(marker.timestamp);
        }
    }
    render() {
        for (let i = 0; i < this.markers.length; i++) {
            const event = this.markers[i];
            if (event === this.selectedMarker || event === this.hoverMarker) {
                continue;
            }
            this.renderMarker(event, false, false, i < this.markers.length - 1 ? this.markers[i + 1] : null);
        }
        if (this.hoverMarker && this.hoverMarker !== this.selectedMarker) {
            this.renderMarker(this.hoverMarker, false, true, null);
        }
        if (this.selectedMarker) {
            this.renderMarker(this.selectedMarker, true, false, null);
        }
    }
}
export class WebVitalsTimeboxLane extends WebVitalsLane {
    longTaskPattern;
    boxes = [];
    label;
    hoverBox = -1;
    selectedBox = -1;
    getTimeboxOverlay;
    constructor(timeline, label, getTimeboxOverlay) {
        super(timeline);
        this.label = label;
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        assertInstanceOf(patternContext, CanvasRenderingContext2D);
        const size = 17;
        patternCanvas.width = size;
        patternCanvas.height = size;
        // Rotate the stripe by 45deg to the right.
        patternContext.translate(size * 0.5, size * 0.5);
        patternContext.rotate(Math.PI * 0.25);
        patternContext.translate(-size * 0.5, -size * 0.5);
        patternContext.fillStyle = '#000';
        for (let x = -size; x < size * 2; x += 3) {
            patternContext.fillRect(x, -size, 1, size * 3);
        }
        const canvasPattern = this.context.createPattern(patternCanvas, 'repeat');
        assertInstanceOf(canvasPattern, CanvasPattern);
        this.longTaskPattern = canvasPattern;
        this.getTimeboxOverlay = getTimeboxOverlay;
    }
    handlePointerMove(x) {
        const prevHoverBox = this.hoverBox;
        if (x === null) {
            this.hoverBox = -1;
        }
        else {
            this.hoverBox = this.boxes.findIndex((box) => {
                const start = this.tX(box.start);
                const end = this.tX(box.start + box.duration);
                return start <= x && x <= end;
            });
        }
        if (prevHoverBox !== this.hoverBox) {
            if (this.hoverBox !== -1 && this.getTimeboxOverlay) {
                this.timeline.showOverlay(this.getTimeboxOverlay(this.boxes[this.hoverBox]));
            }
            else {
                this.timeline.hideOverlay();
            }
        }
    }
    handleClick(_) {
        this.selectedBox = this.hoverBox;
    }
    setTimeboxes(boxes) {
        this.selectedBox = -1;
        this.hoverBox = -1;
        this.boxes = boxes;
    }
    renderTimebox(box, hover) {
        const r = 2;
        this.context.save();
        this.context.beginPath();
        this.context.fillStyle = this.theme.timeboxColor;
        // Draw a box with rounded corners.
        this.context.moveTo(this.tX(box.start) + r, 2);
        this.context.lineTo(this.tX(box.start + box.duration) - r, 2);
        this.context.quadraticCurveTo(this.tX(box.start + box.duration), 2, this.tX(box.start + box.duration), 2 + r);
        this.context.lineTo(this.tX(box.start + box.duration), 22 - r);
        this.context.quadraticCurveTo(this.tX(box.start + box.duration), 22 - r, this.tX(box.start + box.duration) - r, 22);
        this.context.lineTo(this.tX(box.start) + r, 22);
        this.context.quadraticCurveTo(this.tX(box.start) + r, 22, this.tX(box.start), 22 - r);
        this.context.lineTo(this.tX(box.start), 2 + r);
        this.context.quadraticCurveTo(this.tX(box.start), 2 + r, this.tX(box.start) + r, 2);
        this.context.closePath();
        this.context.fill();
        // Fill the box with a striped pattern for everything over 50ms.
        this.context.beginPath();
        this.context.fillStyle = this.longTaskPattern;
        this.context.moveTo(this.tX(box.start + LONG_TASK_THRESHOLD) + r, 2);
        this.context.lineTo(this.tX(box.start + box.duration) - r, 2);
        this.context.quadraticCurveTo(this.tX(box.start + box.duration), 2, this.tX(box.start + box.duration), 2 + r);
        this.context.lineTo(this.tX(box.start + box.duration), 22 - r);
        this.context.quadraticCurveTo(this.tX(box.start + box.duration), 22 - r, this.tX(box.start + box.duration) - r, 22);
        this.context.lineTo(this.tX(box.start + 50), 22);
        this.context.lineTo(this.tX(box.start + 50), 2);
        this.context.closePath();
        this.context.fill();
        if (hover) {
            this.context.beginPath();
            this.context.strokeStyle = this.theme.frame;
            this.context.rect(this.tX(box.start) - 2, 0, this.tD(box.duration) + 4, 24);
            this.context.lineWidth = 2;
            this.context.stroke();
            this.context.lineWidth = 1;
        }
        this.context.restore();
    }
    render() {
        for (let i = 0; i < this.boxes.length; i++) {
            if (i === this.hoverBox || i === this.selectedBox) {
                continue;
            }
            this.renderTimebox(this.boxes[i], false);
        }
        if (this.hoverBox !== -1) {
            this.renderTimebox(this.boxes[this.hoverBox], true);
        }
        if (this.selectedBox !== -1) {
            this.renderTimebox(this.boxes[this.selectedBox], true);
        }
        this.renderLaneLabel(this.label);
    }
}
//# sourceMappingURL=WebVitalsLane.js.map