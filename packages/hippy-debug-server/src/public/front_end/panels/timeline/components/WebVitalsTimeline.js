// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as Coordinator from '../../../ui/components/render_coordinator/render_coordinator.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
import { WebVitalsEventLane, WebVitalsTimeboxLane } from './WebVitalsLane.js';
const UIStrings = {
    /**
    *@description Label for the First Contentful Paint lane
    */
    fcp: 'FCP',
    /**
    *@description Label for the Largest Contentful Paint lane
    */
    lcp: 'LCP',
    /**
    *@description Label for the Layout Shifts lane
    */
    ls: 'LS',
    /**
    *@description Label for the Long Tasks lane
    */
    longTasks: 'Long Tasks',
    /**
    *@description Label for the Long Tasks overlay
    */
    longTask: 'Long Task',
    /**
    *@description Label for the First Contentful Paint overlay
    */
    firstContentfulPaint: 'First Contentful Paint',
    /**
    *@description Label for the Largest Contentful Paint overlay
    */
    largestContentfulPaint: 'Largest Contentful Paint',
    /**
    *@description Label to describe the range in which the rating for the value is considered good
    */
    good: 'Good',
    /**
    *@description Label to describe the range in which the rating for the value is considered to need improvement
    */
    needsImprovement: 'Needs improvement',
    /**
    *@description Label to describe the range in which the rating for the value is considered poor
    */
    poor: 'Poor',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/components/WebVitalsTimeline.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export const LINE_HEIGHT = 24;
const NUMBER_OF_LANES = 5;
const FCP_GOOD_TIMING = 2000;
const FCP_MEDIUM_TIMING = 4000;
const LCP_GOOD_TIMING = 2500;
const LCP_MEDIUM_TIMING = 4000;
export const LONG_TASK_THRESHOLD = 50;
//  eslint-disable-next-line
export function assertInstanceOf(instance, constructor) {
    if (!(instance instanceof constructor)) {
        throw new TypeError(`Instance expected to be of type ${constructor.name} but got ${instance.constructor.name}`);
    }
}
export class WebVitalsTimeline extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    mainFrameNavigations = [];
    startTime = 0;
    duration = 1000;
    maxDuration = 1000;
    width = 0;
    height = 0;
    canvas;
    hoverLane = null;
    fcpLane;
    lcpLane;
    layoutShiftsLane;
    longTasksLane;
    context;
    animationFrame = null;
    overlay;
    constructor() {
        super();
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = `${Math.max(LINE_HEIGHT * NUMBER_OF_LANES, 120)}px`;
        this.shadow.appendChild(this.canvas);
        this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
        this.canvas.addEventListener('pointerout', this.handlePointerOut.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        const context = this.canvas.getContext('2d');
        assertInstanceOf(context, CanvasRenderingContext2D);
        this.context = context;
        this.fcpLane = new WebVitalsEventLane(this, i18nString(UIStrings.fcp), e => this.getMarkerTypeForFCPEvent(e), this.getFCPMarkerOverlay);
        this.lcpLane = new WebVitalsEventLane(this, i18nString(UIStrings.lcp), e => this.getMarkerTypeForLCPEvent(e), this.getLCPMarkerOverlay);
        this.layoutShiftsLane = new WebVitalsEventLane(this, i18nString(UIStrings.ls), _ => "Bad" /* Bad */);
        this.longTasksLane = new WebVitalsTimeboxLane(this, i18nString(UIStrings.longTasks), this.getLongTaskOverlay);
        this.overlay = document.createElement('devtools-timeline-webvitals-tooltip');
        this.overlay.style.position = 'absolute';
        this.overlay.style.visibility = 'hidden';
        this.ownerDocument.body.appendChild(this.overlay);
    }
    set data(data) {
        this.startTime = data.startTime || this.startTime;
        this.duration = data.duration || this.duration;
        this.maxDuration = data.maxDuration || this.maxDuration;
        this.mainFrameNavigations = data.mainFrameNavigations || this.mainFrameNavigations;
        if (data.fcps) {
            this.fcpLane.setEvents(data.fcps);
        }
        if (data.lcps) {
            this.lcpLane.setEvents(data.lcps);
        }
        if (data.layoutShifts) {
            this.layoutShiftsLane.setEvents(data.layoutShifts);
        }
        if (data.longTasks) {
            this.longTasksLane.setTimeboxes(data.longTasks);
        }
        this.scheduleRender();
    }
    getContext() {
        return this.context;
    }
    getLineHeight() {
        return LINE_HEIGHT;
    }
    hideOverlay() {
        this.overlay.style.visibility = 'hidden';
    }
    showOverlay(content) {
        this.overlay.data = { content };
        this.overlay.style.visibility = 'visible';
    }
    handlePointerMove(e) {
        this.updateOverlayPosition(e.clientX, e.clientY);
        const x = e.offsetX, y = e.offsetY;
        const lane = Math.floor(y / LINE_HEIGHT);
        this.hoverLane = lane;
        this.fcpLane.handlePointerMove(this.hoverLane === 1 ? x : null);
        this.lcpLane.handlePointerMove(this.hoverLane === 2 ? x : null);
        this.layoutShiftsLane.handlePointerMove(this.hoverLane === 3 ? x : null);
        this.longTasksLane.handlePointerMove(this.hoverLane === 4 ? x : null);
        this.scheduleRender();
    }
    updateOverlayPosition(clientX, clientY) {
        coordinator.read(() => {
            const bb1 = this.getBoundingClientRect();
            const bb2 = this.overlay.getBoundingClientRect();
            const x = clientX + 10 + bb2.width > bb1.x + bb1.width ? clientX - bb2.width - 10 : clientX + 10;
            coordinator.write(() => {
                this.overlay.style.top = `${clientY + 10}px`;
                this.overlay.style.left = `${x}px`;
            });
        });
    }
    handlePointerOut(_) {
        this.fcpLane.handlePointerMove(null);
        this.lcpLane.handlePointerMove(null);
        this.layoutShiftsLane.handlePointerMove(null);
        this.longTasksLane.handlePointerMove(null);
        this.scheduleRender();
    }
    handleClick(e) {
        const x = e.offsetX;
        this.focus();
        this.fcpLane.handleClick(this.hoverLane === 1 ? x : null);
        this.lcpLane.handleClick(this.hoverLane === 2 ? x : null);
        this.layoutShiftsLane.handleClick(this.hoverLane === 3 ? x : null);
        this.longTasksLane.handleClick(this.hoverLane === 4 ? x : null);
        this.scheduleRender();
    }
    /**
     * Transform from time to pixel offset
     * @param x
     */
    tX(x) {
        return (x - this.startTime) / this.duration * this.width;
    }
    /**
     * Transform from duration to pixels
     * @param duration
     */
    tD(duration) {
        return duration / this.duration * this.width;
    }
    setSize(width, height) {
        const scale = window.devicePixelRatio;
        this.width = width;
        this.height = Math.max(height, 120);
        this.canvas.width = Math.floor(this.width * scale);
        this.canvas.height = Math.floor(this.height * scale);
        this.context.scale(scale, scale);
        this.style.width = this.width + 'px';
        this.style.height = this.height + 'px';
        this.render();
    }
    connectedCallback() {
        this.style.display = 'block';
        this.tabIndex = 0;
        const boundingClientRect = this.canvas.getBoundingClientRect();
        const width = boundingClientRect.width;
        const height = boundingClientRect.height;
        this.setSize(width, height);
        this.render();
    }
    disconnectedCallback() {
        this.overlay.remove();
    }
    getMarkerTypeForFCPEvent(event) {
        const t = this.getTimeSinceLastMainFrameNavigation(event.timestamp);
        if (t <= FCP_GOOD_TIMING) {
            return "Good" /* Good */;
        }
        if (t <= FCP_MEDIUM_TIMING) {
            return "Medium" /* Medium */;
        }
        return "Bad" /* Bad */;
    }
    getMarkerTypeForLCPEvent(event) {
        const t = this.getTimeSinceLastMainFrameNavigation(event.timestamp);
        if (t <= LCP_GOOD_TIMING) {
            return "Good" /* Good */;
        }
        if (t <= LCP_MEDIUM_TIMING) {
            return "Medium" /* Medium */;
        }
        return "Bad" /* Bad */;
    }
    getFCPMarkerOverlay() {
        return LitHtml.html `
      <table class="table">
        <thead>
          <td colspan="3" class="title">${i18nString(UIStrings.firstContentfulPaint)}</td>
        </thead>
        <tbody>
          <tr>
            <td><span class="good"></span></td>
            <td>${i18nString(UIStrings.good)}</td>
            <td>
              ≤ ${i18n.i18n.millisToString(FCP_GOOD_TIMING)}</td>
          </tr>
          <tr>
            <td><span class="medium"></span></td>
            <td>${i18nString(UIStrings.needsImprovement)}</td>
            <td></td>
          </tr>
          <tr>
            <td><span class="bad"></span></td>
            <td>${i18nString(UIStrings.poor)}</td>
            <td>> ${i18n.i18n.millisToString(FCP_MEDIUM_TIMING)}</td>
          </tr>
        </tbody>
      </table>
    `;
    }
    getLCPMarkerOverlay() {
        return LitHtml.html `
      <table class="table">
        <thead>
          <td colspan="3" class="title">${i18nString(UIStrings.largestContentfulPaint)}</td>
        </thead>
        <tbody>
          <tr>
            <td><span class="good"></span></td>
            <td>${i18nString(UIStrings.good)}</td>
            <td>
            ≤ ${i18n.i18n.millisToString(LCP_GOOD_TIMING)}</td>
          </tr>
          <tr>
            <td><span class="medium"></span></td>
            <td>${i18nString(UIStrings.needsImprovement)}</td>
            <td></td>
          </tr>
          <tr>
            <td><span class="bad"></span></td>
            <td>${i18nString(UIStrings.poor)}</td>
            <td>> ${i18n.i18n.millisToString(LCP_MEDIUM_TIMING)}</td>
          </tr>
        </tbody>
      </table>
    `;
    }
    getLongTaskOverlay(timebox) {
        return LitHtml.html `
        <table class="table">
          <thead>
            <td colspan="3" class="title">
              ${i18nString(UIStrings.longTask)}
              <span class="small">
                ${i18n.i18n.millisToString(timebox.duration)}
              </span>
            </td>
          </thead>
          <tbody>
            <tr>
              <td><span class="good"></span></td>
              <td>${i18nString(UIStrings.good)}</td>
              <td>≤ ${i18n.i18n.millisToString(LONG_TASK_THRESHOLD)}</td>
            </tr>
            <tr>
              <td><span class="bad"></span></td>
              <td>${i18nString(UIStrings.poor)}</td>
              <td>> ${i18n.i18n.millisToString(LONG_TASK_THRESHOLD)}</td>
            </tr>
          </tbody>
        </table>
    `;
    }
    renderMainFrameNavigations(markers) {
        this.context.save();
        this.context.strokeStyle = 'blue';
        this.context.beginPath();
        for (const marker of markers) {
            this.context.moveTo(this.tX(marker), 0);
            this.context.lineTo(this.tX(marker), this.height);
        }
        this.context.stroke();
        this.context.restore();
    }
    getTimeSinceLastMainFrameNavigation(time) {
        let i = 0, prev = 0;
        while (i < this.mainFrameNavigations.length && this.mainFrameNavigations[i] <= time) {
            prev = this.mainFrameNavigations[i];
            i++;
        }
        return time - prev;
    }
    render() {
        this.context.save();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.strokeStyle = '#dadce0';
        // Render the grid in the background.
        this.context.beginPath();
        for (let i = 0; i < NUMBER_OF_LANES; i++) {
            this.context.moveTo(0, (i * LINE_HEIGHT) + 0.5);
            this.context.lineTo(this.width, (i * LINE_HEIGHT) + 0.5);
        }
        this.context.moveTo(0, NUMBER_OF_LANES * LINE_HEIGHT - 0.5);
        this.context.lineTo(this.width, NUMBER_OF_LANES * LINE_HEIGHT - 0.5);
        this.context.stroke();
        this.context.restore();
        // Render the WebVitals label.
        this.context.save();
        this.context.font = '11px ' + Host.Platform.fontFamily();
        const text = this.context.measureText('Web Vitals');
        const height = text.actualBoundingBoxAscent - text.actualBoundingBoxDescent;
        this.context.fillStyle = '#202124';
        this.context.fillText('Web Vitals', 6, 4 + height);
        this.context.restore();
        // Render all the lanes.
        this.context.save();
        this.context.translate(0, Number(LINE_HEIGHT));
        this.fcpLane.render();
        this.context.translate(0, Number(LINE_HEIGHT));
        this.lcpLane.render();
        this.context.translate(0, Number(LINE_HEIGHT));
        this.layoutShiftsLane.render();
        this.context.translate(0, Number(LINE_HEIGHT));
        this.longTasksLane.render();
        this.context.restore();
        this.renderMainFrameNavigations(this.mainFrameNavigations);
    }
    scheduleRender() {
        if (this.animationFrame) {
            return;
        }
        this.animationFrame = window.requestAnimationFrame(() => {
            this.animationFrame = null;
            this.render();
        });
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-timeline-webvitals', WebVitalsTimeline);
//# sourceMappingURL=WebVitalsTimeline.js.map