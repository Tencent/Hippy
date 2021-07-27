// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as UI from '../../legacy.js';
export class BezierUI {
    width;
    height;
    marginTop;
    radius;
    linearLine;
    constructor(width, height, marginTop, controlPointRadius, linearLine) {
        this.width = width;
        this.height = height;
        this.marginTop = marginTop;
        this.radius = controlPointRadius;
        this.linearLine = linearLine;
    }
    static drawVelocityChart(bezier, path, width) {
        const height = Height;
        let pathBuilder = ['M', 0, height];
        /** @const */ const sampleSize = 1 / 40;
        let prev = bezier.evaluateAt(0);
        for (let t = sampleSize; t < 1 + sampleSize; t += sampleSize) {
            const current = bezier.evaluateAt(t);
            let slope = (current.y - prev.y) / (current.x - prev.x);
            const weightedX = prev.x * (1 - t) + current.x * t;
            slope = Math.tanh(slope / 1.5); // Normalise slope
            pathBuilder = pathBuilder.concat(['L', (weightedX * width).toFixed(2), (height - slope * height).toFixed(2)]);
            prev = current;
        }
        pathBuilder = pathBuilder.concat(['L', width.toFixed(2), height, 'Z']);
        path.setAttribute('d', pathBuilder.join(' '));
    }
    curveWidth() {
        return this.width - this.radius * 2;
    }
    curveHeight() {
        return this.height - this.radius * 2 - this.marginTop * 2;
    }
    _drawLine(parentElement, className, x1, y1, x2, y2) {
        const line = UI.UIUtils.createSVGChild(parentElement, 'line', className);
        line.setAttribute('x1', String(x1 + this.radius));
        line.setAttribute('y1', String(y1 + this.radius + this.marginTop));
        line.setAttribute('x2', String(x2 + this.radius));
        line.setAttribute('y2', String(y2 + this.radius + this.marginTop));
    }
    _drawControlPoints(parentElement, startX, startY, controlX, controlY) {
        this._drawLine(parentElement, 'bezier-control-line', startX, startY, controlX, controlY);
        const circle = UI.UIUtils.createSVGChild(parentElement, 'circle', 'bezier-control-circle');
        circle.setAttribute('cx', String(controlX + this.radius));
        circle.setAttribute('cy', String(controlY + this.radius + this.marginTop));
        circle.setAttribute('r', String(this.radius));
    }
    drawCurve(bezier, svg) {
        if (!bezier) {
            return;
        }
        const width = this.curveWidth();
        const height = this.curveHeight();
        svg.setAttribute('width', String(this.width));
        svg.setAttribute('height', String(this.height));
        svg.removeChildren();
        const group = UI.UIUtils.createSVGChild(svg, 'g');
        if (this.linearLine) {
            this._drawLine(group, 'linear-line', 0, height, width, 0);
        }
        const curve = UI.UIUtils.createSVGChild(group, 'path', 'bezier-path');
        const curvePoints = [
            new UI.Geometry.Point(bezier.controlPoints[0].x * width + this.radius, (1 - bezier.controlPoints[0].y) * height + this.radius + this.marginTop),
            new UI.Geometry.Point(bezier.controlPoints[1].x * width + this.radius, (1 - bezier.controlPoints[1].y) * height + this.radius + this.marginTop),
            new UI.Geometry.Point(width + this.radius, this.marginTop + this.radius),
        ];
        curve.setAttribute('d', 'M' + this.radius + ',' + (height + this.radius + this.marginTop) + ' C' + curvePoints.join(' '));
        this._drawControlPoints(group, 0, height, bezier.controlPoints[0].x * width, (1 - bezier.controlPoints[0].y) * height);
        this._drawControlPoints(group, width, 0, bezier.controlPoints[1].x * width, (1 - bezier.controlPoints[1].y) * height);
    }
}
export const Height = 26;
//# sourceMappingURL=BezierUI.js.map