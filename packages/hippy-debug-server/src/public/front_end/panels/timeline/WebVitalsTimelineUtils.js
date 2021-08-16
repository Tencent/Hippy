// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as TimelineComponents from './components/components.js';
export class WebVitalsIntegrator extends UI.Widget.VBox {
    delegate;
    webVitalsTimeline;
    chartViewport;
    constructor(delegate) {
        super(true, true);
        this.delegate = delegate;
        this.element.style.height = '120px';
        this.element.style.flex = '0 auto';
        this.webVitalsTimeline = new TimelineComponents.WebVitalsTimeline.WebVitalsTimeline();
        this.chartViewport = new PerfUI.ChartViewport.ChartViewport(this);
        this.chartViewport.show(this.contentElement);
        this.chartViewport.alwaysShowVerticalScroll();
        this.chartViewport.setContentHeight(114);
        this.chartViewport.viewportElement.appendChild(this.webVitalsTimeline);
    }
    windowChanged(startTime, endTime, animate) {
        this.delegate.windowChanged(startTime, endTime, animate);
    }
    updateRangeSelection(startTime, endTime) {
        this.delegate.updateRangeSelection(startTime, endTime);
    }
    setSize(width, height) {
        this.webVitalsTimeline.setSize(width, height);
    }
    update() {
        this.webVitalsTimeline.render();
    }
}
//# sourceMappingURL=WebVitalsTimelineUtils.js.map