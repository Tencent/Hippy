// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { RequestTimeRangeNameToColor } from './NetworkOverview.js';
import { RequestTimeRangeNames, RequestTimingView } from './RequestTimingView.js'; // eslint-disable-line no-unused-vars
const BAR_SPACING = 1;
export class NetworkWaterfallColumn extends UI.Widget.VBox {
    _canvas;
    _canvasPosition;
    _leftPadding;
    _fontSize;
    _rightPadding;
    _scrollTop;
    _headerHeight;
    _calculator;
    _rawRowHeight;
    _rowHeight;
    _offsetWidth;
    _offsetHeight;
    _startTime;
    _endTime;
    _popoverHelper;
    _nodes;
    _hoveredNode;
    _eventDividers;
    _updateRequestID;
    _styleForTimeRangeName;
    _styleForWaitingResourceType;
    _styleForDownloadingResourceType;
    _wiskerStyle;
    _hoverDetailsStyle;
    _pathForStyle;
    _textLayers;
    constructor(calculator) {
        // TODO(allada) Make this a shadowDOM when the NetworkWaterfallColumn gets moved into NetworkLogViewColumns.
        super(false);
        this.registerRequiredCSS('panels/network/networkWaterfallColumn.css', { enableLegacyPatching: false });
        this._canvas = this.contentElement.createChild('canvas');
        this._canvas.tabIndex = -1;
        this.setDefaultFocusedElement(this._canvas);
        this._canvasPosition = this._canvas.getBoundingClientRect();
        this._leftPadding = 5;
        this._fontSize = 10;
        this._rightPadding = 0;
        this._scrollTop = 0;
        this._headerHeight = 0;
        this._calculator = calculator;
        // this._rawRowHeight captures model height (41 or 21px),
        // this._rowHeight is computed height of the row in CSS pixels, can be 20.8 for zoomed-in content.
        this._rawRowHeight = 0;
        this._rowHeight = 0;
        this._offsetWidth = 0;
        this._offsetHeight = 0;
        this._startTime = this._calculator.minimumBoundary();
        this._endTime = this._calculator.maximumBoundary();
        this._popoverHelper = new UI.PopoverHelper.PopoverHelper(this.element, this._getPopoverRequest.bind(this));
        this._popoverHelper.setHasPadding(true);
        this._popoverHelper.setTimeout(300, 300);
        this._nodes = [];
        this._hoveredNode = null;
        this._eventDividers = new Map();
        this.element.addEventListener('mousemove', this._onMouseMove.bind(this), true);
        this.element.addEventListener('mouseleave', _event => this._setHoveredNode(null, false), true);
        this.element.addEventListener('click', this._onClick.bind(this), true);
        this._styleForTimeRangeName = NetworkWaterfallColumn._buildRequestTimeRangeStyle();
        const resourceStyleTuple = NetworkWaterfallColumn._buildResourceTypeStyle();
        this._styleForWaitingResourceType = resourceStyleTuple[0];
        this._styleForDownloadingResourceType = resourceStyleTuple[1];
        const baseLineColor = ThemeSupport.ThemeSupport.instance().patchColorText('#a5a5a5', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        this._wiskerStyle = { borderColor: baseLineColor, lineWidth: 1, fillStyle: undefined };
        this._hoverDetailsStyle = { fillStyle: baseLineColor, lineWidth: 1, borderColor: baseLineColor };
        this._pathForStyle = new Map();
        this._textLayers = [];
    }
    static _buildRequestTimeRangeStyle() {
        const types = RequestTimeRangeNames;
        const styleMap = new Map();
        styleMap.set(types.Connecting, { fillStyle: RequestTimeRangeNameToColor[types.Connecting] });
        styleMap.set(types.SSL, { fillStyle: RequestTimeRangeNameToColor[types.SSL] });
        styleMap.set(types.DNS, { fillStyle: RequestTimeRangeNameToColor[types.DNS] });
        styleMap.set(types.Proxy, { fillStyle: RequestTimeRangeNameToColor[types.Proxy] });
        styleMap.set(types.Blocking, { fillStyle: RequestTimeRangeNameToColor[types.Blocking] });
        styleMap.set(types.Push, { fillStyle: RequestTimeRangeNameToColor[types.Push] });
        styleMap.set(types.Queueing, { fillStyle: RequestTimeRangeNameToColor[types.Queueing], lineWidth: 2, borderColor: 'lightgrey' });
        // This ensures we always show at least 2 px for a request.
        styleMap.set(types.Receiving, {
            fillStyle: RequestTimeRangeNameToColor[types.Receiving],
            lineWidth: 2,
            borderColor: '#03A9F4',
        });
        styleMap.set(types.Waiting, { fillStyle: RequestTimeRangeNameToColor[types.Waiting] });
        styleMap.set(types.ReceivingPush, { fillStyle: RequestTimeRangeNameToColor[types.ReceivingPush] });
        styleMap.set(types.ServiceWorker, { fillStyle: RequestTimeRangeNameToColor[types.ServiceWorker] });
        styleMap.set(types.ServiceWorkerPreparation, { fillStyle: RequestTimeRangeNameToColor[types.ServiceWorkerPreparation] });
        styleMap.set(types.ServiceWorkerRespondWith, {
            fillStyle: RequestTimeRangeNameToColor[types.ServiceWorkerRespondWith],
        });
        return styleMap;
    }
    static _buildResourceTypeStyle() {
        const baseResourceTypeColors = new Map([
            ['document', 'hsl(215, 100%, 80%)'],
            ['font', 'hsl(8, 100%, 80%)'],
            ['media', 'hsl(90, 50%, 80%)'],
            ['image', 'hsl(90, 50%, 80%)'],
            ['script', 'hsl(31, 100%, 80%)'],
            ['stylesheet', 'hsl(272, 64%, 80%)'],
            ['texttrack', 'hsl(8, 100%, 80%)'],
            ['websocket', 'hsl(0, 0%, 95%)'],
            ['xhr', 'hsl(53, 100%, 80%)'],
            ['fetch', 'hsl(53, 100%, 80%)'],
            ['other', 'hsl(0, 0%, 95%)'],
        ]);
        const waitingStyleMap = new Map();
        const downloadingStyleMap = new Map();
        for (const resourceType of Object.values(Common.ResourceType.resourceTypes)) {
            let color = baseResourceTypeColors.get(resourceType.name());
            if (!color) {
                color = baseResourceTypeColors.get('other');
            }
            const borderColor = toBorderColor(color);
            waitingStyleMap.set(
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // @ts-expect-error
            resourceType, { fillStyle: toWaitingColor(color), lineWidth: 1, borderColor: borderColor });
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // @ts-expect-error
            downloadingStyleMap.set(resourceType, { fillStyle: color, lineWidth: 1, borderColor: borderColor });
        }
        return [waitingStyleMap, downloadingStyleMap];
        function toBorderColor(color) {
            const parsedColor = Common.Color.Color.parse(color);
            if (!parsedColor) {
                return '';
            }
            const hsla = parsedColor.hsla();
            hsla[1] /= 2;
            hsla[2] -= Math.min(hsla[2], 0.2);
            return parsedColor.asString(null);
        }
        function toWaitingColor(color) {
            const parsedColor = Common.Color.Color.parse(color);
            if (!parsedColor) {
                return '';
            }
            const hsla = parsedColor.hsla();
            hsla[2] *= 1.1;
            return parsedColor.asString(null);
        }
    }
    _resetPaths() {
        this._pathForStyle.clear();
        this._pathForStyle.set(this._wiskerStyle, new Path2D());
        this._styleForTimeRangeName.forEach(style => this._pathForStyle.set(style, new Path2D()));
        this._styleForWaitingResourceType.forEach(style => this._pathForStyle.set(style, new Path2D()));
        this._styleForDownloadingResourceType.forEach(style => this._pathForStyle.set(style, new Path2D()));
        this._pathForStyle.set(this._hoverDetailsStyle, new Path2D());
    }
    willHide() {
        this._popoverHelper.hidePopover();
    }
    wasShown() {
        this.update();
    }
    _onMouseMove(event) {
        this._setHoveredNode(this.getNodeFromPoint(event.offsetX, event.offsetY), event.shiftKey);
    }
    _onClick(event) {
        const handled = this._setSelectedNode(this.getNodeFromPoint(event.offsetX, event.offsetY));
        if (handled) {
            event.consume(true);
        }
    }
    _getPopoverRequest(event) {
        if (!this._hoveredNode) {
            return null;
        }
        const request = this._hoveredNode.request();
        if (!request) {
            return null;
        }
        const useTimingBars = !Common.Settings.Settings.instance().moduleSetting('networkColorCodeResourceTypes').get() &&
            !this._calculator.startAtZero;
        let range;
        let start;
        let end;
        if (useTimingBars) {
            range = RequestTimingView.calculateRequestTimeRanges(request, 0)
                .find(data => data.name === RequestTimeRangeNames.Total);
            start = this._timeToPosition(range.start);
            end = this._timeToPosition(range.end);
        }
        else {
            range = this._getSimplifiedBarRange(request, 0);
            start = range.start;
            end = range.end;
        }
        if (end - start < 50) {
            const halfWidth = (end - start) / 2;
            start = start + halfWidth - 25;
            end = end - halfWidth + 25;
        }
        if (event.clientX < this._canvasPosition.left + start || event.clientX > this._canvasPosition.left + end) {
            return null;
        }
        const rowIndex = this._nodes.findIndex(node => node.hovered());
        const barHeight = this._getBarHeight(range.name);
        const y = this._headerHeight + (this._rowHeight * rowIndex - this._scrollTop) + ((this._rowHeight - barHeight) / 2);
        if (event.clientY < this._canvasPosition.top + y || event.clientY > this._canvasPosition.top + y + barHeight) {
            return null;
        }
        const anchorBox = this.element.boxInWindow();
        anchorBox.x += start;
        anchorBox.y += y;
        anchorBox.width = end - start;
        anchorBox.height = barHeight;
        return {
            box: anchorBox,
            show: (popover) => {
                const content = RequestTimingView.createTimingTable(request, this._calculator);
                popover.contentElement.appendChild(content);
                return Promise.resolve(true);
            },
            hide: undefined,
        };
    }
    _setHoveredNode(node, highlightInitiatorChain) {
        if (this._hoveredNode) {
            this._hoveredNode.setHovered(false, false);
        }
        this._hoveredNode = node;
        if (this._hoveredNode) {
            this._hoveredNode.setHovered(true, highlightInitiatorChain);
        }
    }
    _setSelectedNode(node) {
        if (node && node.dataGrid) {
            node.select();
            node.dataGrid.element.focus();
            return true;
        }
        return false;
    }
    setRowHeight(height) {
        this._rawRowHeight = height;
        this._updateRowHeight();
    }
    _updateRowHeight() {
        this._rowHeight = Math.round(this._rawRowHeight * window.devicePixelRatio) / window.devicePixelRatio;
    }
    setHeaderHeight(height) {
        this._headerHeight = height;
    }
    setRightPadding(padding) {
        this._rightPadding = padding;
        this._calculateCanvasSize();
    }
    setCalculator(calculator) {
        this._calculator = calculator;
    }
    getNodeFromPoint(x, y) {
        if (y <= this._headerHeight) {
            return null;
        }
        return this._nodes[Math.floor((this._scrollTop + y - this._headerHeight) / this._rowHeight)];
    }
    scheduleDraw() {
        if (this._updateRequestID) {
            return;
        }
        this._updateRequestID = this.element.window().requestAnimationFrame(() => this.update());
    }
    update(scrollTop, eventDividers, nodes) {
        if (scrollTop !== undefined && this._scrollTop !== scrollTop) {
            this._popoverHelper.hidePopover();
            this._scrollTop = scrollTop;
        }
        if (nodes) {
            this._nodes = nodes;
            this._calculateCanvasSize();
        }
        if (eventDividers !== undefined) {
            this._eventDividers = eventDividers;
        }
        if (this._updateRequestID) {
            this.element.window().cancelAnimationFrame(this._updateRequestID);
            delete this._updateRequestID;
        }
        this._startTime = this._calculator.minimumBoundary();
        this._endTime = this._calculator.maximumBoundary();
        this._resetCanvas();
        this._resetPaths();
        this._textLayers = [];
        this._draw();
    }
    _resetCanvas() {
        const ratio = window.devicePixelRatio;
        this._canvas.width = this._offsetWidth * ratio;
        this._canvas.height = this._offsetHeight * ratio;
        this._canvas.style.width = this._offsetWidth + 'px';
        this._canvas.style.height = this._offsetHeight + 'px';
    }
    onResize() {
        super.onResize();
        this._updateRowHeight();
        this._calculateCanvasSize();
        this.scheduleDraw();
    }
    _calculateCanvasSize() {
        this._offsetWidth = this.contentElement.offsetWidth - this._rightPadding;
        this._offsetHeight = this.contentElement.offsetHeight;
        this._calculator.setDisplayWidth(this._offsetWidth);
        this._canvasPosition = this._canvas.getBoundingClientRect();
    }
    _timeToPosition(time) {
        const availableWidth = this._offsetWidth - this._leftPadding;
        const timeToPixel = availableWidth / (this._endTime - this._startTime);
        return Math.floor(this._leftPadding + (time - this._startTime) * timeToPixel);
    }
    _didDrawForTest() {
    }
    _draw() {
        const useTimingBars = !Common.Settings.Settings.instance().moduleSetting('networkColorCodeResourceTypes').get() &&
            !this._calculator.startAtZero;
        const nodes = this._nodes;
        const context = this._canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.translate(0, this._headerHeight);
        context.rect(0, 0, this._offsetWidth, this._offsetHeight);
        context.clip();
        const firstRequestIndex = Math.floor(this._scrollTop / this._rowHeight);
        const lastRequestIndex = Math.min(nodes.length, firstRequestIndex + Math.ceil(this._offsetHeight / this._rowHeight));
        for (let i = firstRequestIndex; i < lastRequestIndex; i++) {
            const rowOffset = this._rowHeight * i;
            const node = nodes[i];
            this._decorateRow(context, node, rowOffset - this._scrollTop);
            let drawNodes = [];
            if (node.hasChildren() && !node.expanded) {
                drawNodes = node.flatChildren();
            }
            drawNodes.push(node);
            for (const drawNode of drawNodes) {
                if (useTimingBars) {
                    this._buildTimingBarLayers(drawNode, rowOffset - this._scrollTop);
                }
                else {
                    this._buildSimplifiedBarLayers(context, drawNode, rowOffset - this._scrollTop);
                }
            }
        }
        this._drawLayers(context);
        context.save();
        context.fillStyle =
            ThemeSupport.ThemeSupport.instance().patchColorText('#888', ThemeSupport.ThemeSupport.ColorUsage.Foreground);
        for (const textData of this._textLayers) {
            context.fillText(textData.text, textData.x, textData.y);
        }
        context.restore();
        this._drawEventDividers(context);
        context.restore();
        const freeZoneAtLeft = 75;
        const freeZoneAtRight = 18;
        const dividersData = PerfUI.TimelineGrid.TimelineGrid.calculateGridOffsets(this._calculator);
        PerfUI.TimelineGrid.TimelineGrid.drawCanvasGrid(context, dividersData);
        PerfUI.TimelineGrid.TimelineGrid.drawCanvasHeaders(context, dividersData, time => this._calculator.formatValue(time, dividersData.precision), this._fontSize, this._headerHeight, freeZoneAtLeft);
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.clearRect(this._offsetWidth - freeZoneAtRight, 0, freeZoneAtRight, this._headerHeight);
        context.restore();
        this._didDrawForTest();
    }
    _drawLayers(context) {
        for (const entry of this._pathForStyle) {
            const style = entry[0];
            const path = entry[1];
            context.save();
            context.beginPath();
            if (style.lineWidth) {
                context.lineWidth = style.lineWidth;
                if (style.borderColor) {
                    context.strokeStyle = style.borderColor;
                }
                context.stroke(path);
            }
            if (style.fillStyle) {
                context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue(style.fillStyle);
                context.fill(path);
            }
            context.restore();
        }
    }
    _drawEventDividers(context) {
        context.save();
        context.lineWidth = 1;
        for (const color of this._eventDividers.keys()) {
            context.strokeStyle = color;
            for (const time of this._eventDividers.get(color) || []) {
                context.beginPath();
                const x = this._timeToPosition(time);
                context.moveTo(x, 0);
                context.lineTo(x, this._offsetHeight);
            }
            context.stroke();
        }
        context.restore();
    }
    _getBarHeight(type) {
        const types = RequestTimeRangeNames;
        switch (type) {
            case types.Connecting:
            case types.SSL:
            case types.DNS:
            case types.Proxy:
            case types.Blocking:
            case types.Push:
            case types.Queueing:
                return 7;
            default:
                return 13;
        }
    }
    _getSimplifiedBarRange(request, borderOffset) {
        const drawWidth = this._offsetWidth - this._leftPadding;
        const percentages = this._calculator.computeBarGraphPercentages(request);
        return {
            start: this._leftPadding + Math.floor((percentages.start / 100) * drawWidth) + borderOffset,
            mid: this._leftPadding + Math.floor((percentages.middle / 100) * drawWidth) + borderOffset,
            end: this._leftPadding + Math.floor((percentages.end / 100) * drawWidth) + borderOffset,
        };
    }
    _buildSimplifiedBarLayers(context, node, y) {
        const request = node.request();
        if (!request) {
            return;
        }
        const borderWidth = 1;
        const borderOffset = borderWidth % 2 === 0 ? 0 : 0.5;
        const ranges = this._getSimplifiedBarRange(request, borderOffset);
        const height = this._getBarHeight();
        y += Math.floor(this._rowHeight / 2 - height / 2 + borderWidth) - borderWidth / 2;
        const waitingStyle = this._styleForWaitingResourceType.get(request.resourceType());
        const waitingPath = this._pathForStyle.get(waitingStyle);
        waitingPath.rect(ranges.start, y, ranges.mid - ranges.start, height - borderWidth);
        const barWidth = Math.max(2, ranges.end - ranges.mid);
        const downloadingStyle = this._styleForDownloadingResourceType.get(request.resourceType());
        const downloadingPath = this._pathForStyle.get(downloadingStyle);
        downloadingPath.rect(ranges.mid, y, barWidth, height - borderWidth);
        let labels = null;
        if (node.hovered()) {
            labels = this._calculator.computeBarGraphLabels(request);
            const barDotLineLength = 10;
            const leftLabelWidth = context.measureText(labels.left).width;
            const rightLabelWidth = context.measureText(labels.right).width;
            const hoverLinePath = this._pathForStyle.get(this._hoverDetailsStyle);
            if (leftLabelWidth < ranges.mid - ranges.start) {
                const midBarX = ranges.start + (ranges.mid - ranges.start - leftLabelWidth) / 2;
                this._textLayers.push({ text: labels.left, x: midBarX, y: y + this._fontSize });
            }
            else if (barDotLineLength + leftLabelWidth + this._leftPadding < ranges.start) {
                this._textLayers.push({ text: labels.left, x: ranges.start - leftLabelWidth - barDotLineLength - 1, y: y + this._fontSize });
                hoverLinePath.moveTo(ranges.start - barDotLineLength, y + Math.floor(height / 2));
                hoverLinePath.arc(ranges.start, y + Math.floor(height / 2), 2, 0, 2 * Math.PI);
                hoverLinePath.moveTo(ranges.start - barDotLineLength, y + Math.floor(height / 2));
                hoverLinePath.lineTo(ranges.start, y + Math.floor(height / 2));
            }
            const endX = ranges.mid + barWidth + borderOffset;
            if (rightLabelWidth < endX - ranges.mid) {
                const midBarX = ranges.mid + (endX - ranges.mid - rightLabelWidth) / 2;
                this._textLayers.push({ text: labels.right, x: midBarX, y: y + this._fontSize });
            }
            else if (endX + barDotLineLength + rightLabelWidth < this._offsetWidth - this._leftPadding) {
                this._textLayers.push({ text: labels.right, x: endX + barDotLineLength + 1, y: y + this._fontSize });
                hoverLinePath.moveTo(endX, y + Math.floor(height / 2));
                hoverLinePath.arc(endX, y + Math.floor(height / 2), 2, 0, 2 * Math.PI);
                hoverLinePath.moveTo(endX, y + Math.floor(height / 2));
                hoverLinePath.lineTo(endX + barDotLineLength, y + Math.floor(height / 2));
            }
        }
        if (!this._calculator.startAtZero) {
            const queueingRange = RequestTimingView.calculateRequestTimeRanges(request, 0)
                .find(data => data.name === RequestTimeRangeNames.Total);
            const leftLabelWidth = labels ? context.measureText(labels.left).width : 0;
            const leftTextPlacedInBar = leftLabelWidth < ranges.mid - ranges.start;
            const wiskerTextPadding = 13;
            const textOffset = (labels && !leftTextPlacedInBar) ? leftLabelWidth + wiskerTextPadding : 0;
            const queueingStart = this._timeToPosition(queueingRange.start);
            if (ranges.start - textOffset > queueingStart) {
                const wiskerPath = this._pathForStyle.get(this._wiskerStyle);
                wiskerPath.moveTo(queueingStart, y + Math.floor(height / 2));
                wiskerPath.lineTo(ranges.start - textOffset, y + Math.floor(height / 2));
                // TODO(allada) This needs to be floored.
                const wiskerHeight = height / 2;
                wiskerPath.moveTo(queueingStart + borderOffset, y + wiskerHeight / 2);
                wiskerPath.lineTo(queueingStart + borderOffset, y + height - wiskerHeight / 2 - 1);
            }
        }
    }
    _buildTimingBarLayers(node, y) {
        const request = node.request();
        if (!request) {
            return;
        }
        const ranges = RequestTimingView.calculateRequestTimeRanges(request, 0);
        let index = 0;
        for (const range of ranges) {
            if (range.name === RequestTimeRangeNames.Total || range.name === RequestTimeRangeNames.Sending ||
                range.end - range.start === 0) {
                continue;
            }
            const style = this._styleForTimeRangeName.get(range.name);
            const path = this._pathForStyle.get(style);
            const lineWidth = style.lineWidth || 0;
            const height = this._getBarHeight(range.name);
            const middleBarY = y + Math.floor(this._rowHeight / 2 - height / 2) + lineWidth / 2;
            const start = this._timeToPosition(range.start);
            const end = this._timeToPosition(range.end);
            path.rect(start + (index * BAR_SPACING), middleBarY, end - start, height - lineWidth);
            index++;
        }
    }
    _decorateRow(context, node, y) {
        const nodeBgColorId = node.backgroundColor();
        context.save();
        context.beginPath();
        context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue(nodeBgColorId);
        context.rect(0, y, this._offsetWidth, this._rowHeight);
        context.fill();
        context.restore();
    }
}
//# sourceMappingURL=NetworkWaterfallColumn.js.map