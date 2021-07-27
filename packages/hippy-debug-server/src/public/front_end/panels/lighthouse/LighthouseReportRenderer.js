// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import * as Timeline from '../timeline/timeline.js';
const UIStrings = {
    /**
    *@description Label for view trace button when simulated throttling is enabled
    */
    viewOriginalTrace: 'View Original Trace',
    /**
    *@description Text of the timeline button in Lighthouse Report Renderer
    */
    viewTrace: 'View Trace',
    /**
    *@description Help text for 'View Trace' button
    */
    thePerformanceMetricsAboveAre: 'The performance metrics above are simulated and won\'t match the timings found in this trace. Disable simulated throttling in "Lighthouse Settings" if you want the timings to match.',
};
const str_ = i18n.i18n.registerUIStrings('panels/lighthouse/LighthouseReportRenderer.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const MaxLengthForLinks = 40;
// @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
export class LighthouseReportRenderer extends self.ReportRenderer {
    constructor(dom) {
        super(dom);
    }
    static addViewTraceButton(el, reportUIFeatures, artifacts) {
        if (!artifacts || !artifacts.traces || !artifacts.traces.defaultPass) {
            return;
        }
        const simulated = artifacts.settings.throttlingMethod === 'simulate';
        const container = el.querySelector('.lh-audit-group');
        if (!container) {
            return;
        }
        const disclaimerEl = container.querySelector('.lh-metrics__disclaimer');
        // If it was a PWA-only run, we'd have a trace but no perf category to add the button to
        if (!disclaimerEl) {
            return;
        }
        const defaultPassTrace = artifacts.traces.defaultPass;
        const text = simulated ? i18nString(UIStrings.viewOriginalTrace) : i18nString(UIStrings.viewTrace);
        const timelineButton = reportUIFeatures.addButton({
            text,
            onClick: onViewTraceClick,
        });
        timelineButton.classList.add('lh-button--trace');
        if (simulated) {
            UI.Tooltip.Tooltip.install(timelineButton, i18nString(UIStrings.thePerformanceMetricsAboveAre));
        }
        async function onViewTraceClick() {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.LighthouseViewTrace);
            await UI.InspectorView.InspectorView.instance().showPanel('timeline');
            Timeline.TimelinePanel.TimelinePanel.instance().loadFromEvents(defaultPassTrace.traceEvents);
        }
    }
    static async linkifyNodeDetails(el) {
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (!mainTarget) {
            return;
        }
        const domModel = mainTarget.model(SDK.DOMModel.DOMModel);
        if (!domModel) {
            return;
        }
        for (const origElement of el.getElementsByClassName('lh-node')) {
            const origHTMLElement = origElement;
            const detailsItem = origHTMLElement.dataset;
            if (!detailsItem.path) {
                continue;
            }
            const nodeId = await domModel.pushNodeByPathToFrontend(detailsItem.path);
            if (!nodeId) {
                continue;
            }
            const node = domModel.nodeForId(nodeId);
            if (!node) {
                continue;
            }
            const element = await Common.Linkifier.Linkifier.linkify(node, { tooltip: detailsItem.snippet, preventKeyboardFocus: undefined });
            UI.Tooltip.Tooltip.install(origHTMLElement, '');
            const screenshotElement = origHTMLElement.querySelector('.lh-element-screenshot');
            origHTMLElement.textContent = '';
            if (screenshotElement) {
                origHTMLElement.append(screenshotElement);
            }
            origHTMLElement.appendChild(element);
        }
    }
    static async linkifySourceLocationDetails(el) {
        for (const origElement of el.getElementsByClassName('lh-source-location')) {
            const origHTMLElement = origElement;
            const detailsItem = origHTMLElement.dataset;
            if (!detailsItem.sourceUrl || !detailsItem.sourceLine || !detailsItem.sourceColumn) {
                continue;
            }
            const url = detailsItem.sourceUrl;
            const line = Number(detailsItem.sourceLine);
            const column = Number(detailsItem.sourceColumn);
            const element = await Components.Linkifier.Linkifier.linkifyURL(url, {
                lineNumber: line,
                columnNumber: column,
                inlineFrameIndex: 0,
                maxLength: MaxLengthForLinks,
                bypassURLTrimming: undefined,
                className: undefined,
                preventClick: undefined,
                tabStop: undefined,
                text: undefined,
            });
            UI.Tooltip.Tooltip.install(origHTMLElement, '');
            origHTMLElement.textContent = '';
            origHTMLElement.appendChild(element);
        }
    }
    static handleDarkMode(el) {
        if (ThemeSupport.ThemeSupport.instance().themeName() === 'dark') {
            el.classList.add('dark');
        }
    }
}
// @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
export class LighthouseReportUIFeatures extends self.ReportUIFeatures {
    _beforePrint;
    _afterPrint;
    constructor(dom) {
        super(dom);
        this._beforePrint = null;
        this._afterPrint = null;
    }
    setBeforePrint(beforePrint) {
        this._beforePrint = beforePrint;
    }
    setAfterPrint(afterPrint) {
        this._afterPrint = afterPrint;
    }
    /**
     * Returns the html that recreates this report.
     */
    getReportHtml() {
        this.resetUIState();
        // @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
        return Lighthouse.ReportGenerator.generateReportHtml(this.json);
    }
    /**
     * Downloads a file (blob) using the system dialog prompt.
     */
    async _saveFile(blob) {
        // @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
        const domain = new Common.ParsedURL.ParsedURL(this.json.finalUrl).domain();
        const sanitizedDomain = domain.replace(/[^a-z0-9.-]+/gi, '_');
        // @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
        const timestamp = Platform.DateUtilities.toISO8601Compact(new Date(this.json.fetchTime));
        const ext = blob.type.match('json') ? '.json' : '.html';
        const basename = `${sanitizedDomain}-${timestamp}${ext}`;
        const text = await blob.text();
        Workspace.FileManager.FileManager.instance().save(basename, text, true /* forceSaveAs */);
    }
    async _print() {
        const document = this.getDocument();
        const clonedReport = document.querySelector('.lh-root').cloneNode(true);
        const printWindow = window.open('', '_blank', 'channelmode=1,status=1,resizable=1');
        if (!printWindow) {
            return;
        }
        const style = printWindow.document.createElement('style');
        style.textContent = Root.Runtime.cachedResources.get('third_party/lighthouse/report-assets/report.css') || '';
        printWindow.document.head.appendChild(style);
        printWindow.document.body.replaceWith(clonedReport);
        // Linkified nodes are shadow elements, which aren't exposed via `cloneNode`.
        await LighthouseReportRenderer.linkifyNodeDetails(clonedReport);
        if (this._beforePrint) {
            this._beforePrint();
        }
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        if (this._afterPrint) {
            this._afterPrint();
        }
    }
    getDocument() {
        // @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
        return this._document;
    }
    resetUIState() {
        // @ts-ignore https://github.com/GoogleChrome/lighthouse/issues/11628
        this._resetUIState();
    }
}
//# sourceMappingURL=LighthouseReportRenderer.js.map