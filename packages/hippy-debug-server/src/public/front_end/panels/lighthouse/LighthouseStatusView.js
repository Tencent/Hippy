// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Events, RuntimeSettings } from './LighthouseController.js';
const UIStrings = {
    /**
    *@description Text to cancel something
    */
    cancel: 'Cancel',
    /**
    *@description Text when something is loading
    */
    loading: 'Loading…',
    /**
    *@description Status text in Lighthouse splash screen while an audit is being performed
    *@example {github.com} PH1
    */
    auditingS: 'Auditing {PH1}',
    /**
    *@description Status text in Lighthouse splash screen while an audit is being performed
    */
    auditingYourWebPage: 'Auditing your web page',
    /**
    *@description Status text in Lighthouse splash screen while an audit is being performed, and cancellation to take effect
    */
    cancelling: 'Cancelling…',
    /**
    *@description Status text in Lighthouse splash screen while preparing for an audit
    */
    lighthouseIsWarmingUp: '`Lighthouse` is warming up…',
    /**
    *@description Status text in Lighthouse splash screen while an audit is being performed
    */
    lighthouseIsLoadingYourPage: '`Lighthouse` is loading your page',
    /**
    *@description Text in Lighthouse Status View
    *@example {75% of global mobile users in 2016 were on 2G or 3G [Source: GSMA Mobile]} PH1
    */
    fastFactMessageWithPlaceholder: '💡 {PH1}',
    /**
    *@description Text of a DOM element in Lighthouse Status View
    */
    ahSorryWeRanIntoAnError: 'Ah, sorry! We ran into an error.',
    /**
    *@description Text in Lighthouse Status View
    */
    tryToNavigateToTheUrlInAFresh: 'Try to navigate to the URL in a fresh `Chrome` profile without any other tabs or extensions open and try again.',
    /**
    *@description Text of a DOM element in Lighthouse Status View
    */
    ifThisIssueIsReproduciblePlease: 'If this issue is reproducible, please report it at the `Lighthouse` `GitHub` repo.',
    /**
    *@description Text in Lighthouse splash screen when loading the page for auditing
    */
    lighthouseIsLoadingThePage: 'Lighthouse is loading the page.',
    /**
    *@description Text in Lighthouse splash screen when Lighthouse is gathering information for display
    */
    lighthouseIsGatheringInformation: '`Lighthouse` is gathering information about the page to compute your score.',
    /**
    *@description Text in Lighthouse splash screen when Lighthouse is generating a report.
    */
    almostThereLighthouseIsNow: 'Almost there! `Lighthouse` is now generating your report.',
    /**
    *@description Text in Lighthouse splash screen when loading the page for auditing
    */
    lighthouseIsLoadingYourPageWith: '`Lighthouse` is loading your page with throttling to measure performance on a mobile device on 3G.',
    /**
    *@description Text in Lighthouse splash screen when loading the page for auditing
    */
    lighthouseIsLoadingYourPageWithThrottling: '`Lighthouse` is loading your page with throttling to measure performance on a slow desktop on 3G.',
    /**
    *@description Text in Lighthouse splash screen when loading the page for auditing
    */
    lighthouseIsLoadingYourPageWithMobile: '`Lighthouse` is loading your page with mobile emulation.',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    mbTakesAMinimumOfSecondsTo: '1MB takes a minimum of 5 seconds to download on a typical 3G connection [Source: `WebPageTest` and `DevTools` 3G definition].',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    rebuildingPinterestPagesFor: 'Rebuilding Pinterest pages for performance increased conversion rates by 15% [Source: `WPO Stats`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    byReducingTheResponseSizeOfJson: 'By reducing the response size of JSON needed for displaying comments, Instagram saw increased impressions [Source: `WPO Stats`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    walmartSawAIncreaseInRevenueFor: 'Walmart saw a 1% increase in revenue for every 100ms improvement in page load [Source: `WPO Stats`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    ifASiteTakesSecondToBecome: 'If a site takes >1 second to become interactive, users lose attention, and their perception of completing the page task is broken [Source: `Google Developers Blog`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    OfGlobalMobileUsersInWereOnGOrG: '75% of global mobile users in 2016 were on 2G or 3G [Source: `GSMA Mobile`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    theAverageUserDeviceCostsLess: 'The average user device costs less than 200 USD. [Source: `International Data Corporation`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    SecondsIsTheAverageTimeAMobile: '19 seconds is the average time a mobile web page takes to load on a 3G connection [Source: `Google DoubleClick blog`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    OfMobilePagesTakeNearlySeconds: '70% of mobile pages take nearly 7 seconds for the visual content above the fold to display on the screen. [Source: `Think with Google`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    asPageLoadTimeIncreasesFromOne: 'As page load time increases from one second to seven seconds, the probability of a mobile site visitor bouncing increases 113%. [Source: `Think with Google`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    asTheNumberOfElementsOnAPage: 'As the number of elements on a page increases from 400 to 6,000, the probability of conversion drops 95%. [Source: `Think with Google`]',
    /**
    *@description Fast fact in the splash screen while Lighthouse is performing an audit
    */
    lighthouseOnlySimulatesMobile: '`Lighthouse` only simulates mobile performance; to measure performance on a real device, try WebPageTest.org [Source: `Lighthouse` team]',
};
const str_ = i18n.i18n.registerUIStrings('panels/lighthouse/LighthouseStatusView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class StatusView {
    _controller;
    _statusView;
    _statusHeader;
    _progressWrapper;
    _progressBar;
    _statusText;
    _cancelButton;
    _inspectedURL;
    _textChangedAt;
    _fastFactsQueued;
    _currentPhase;
    _scheduledTextChangeTimeout;
    _scheduledFastFactTimeout;
    _dialog;
    constructor(controller) {
        this._controller = controller;
        this._statusView = null;
        this._statusHeader = null;
        this._progressWrapper = null;
        this._progressBar = null;
        this._statusText = null;
        this._cancelButton = null;
        this._inspectedURL = '';
        this._textChangedAt = 0;
        this._fastFactsQueued = FastFacts.map(lazyString => lazyString());
        this._currentPhase = null;
        this._scheduledTextChangeTimeout = null;
        this._scheduledFastFactTimeout = null;
        this._dialog = new UI.Dialog.Dialog();
        this._dialog.setDimmed(true);
        this._dialog.setCloseOnEscape(false);
        this._dialog.setOutsideClickCallback(event => event.consume(true));
        this._render();
    }
    _render() {
        const dialogRoot = UI.Utils.createShadowRootWithCoreStyles(this._dialog.contentElement, { cssFile: 'panels/lighthouse/lighthouseDialog.css', enableLegacyPatching: false, delegatesFocus: undefined });
        const lighthouseViewElement = dialogRoot.createChild('div', 'lighthouse-view vbox');
        const cancelButton = UI.UIUtils.createTextButton(i18nString(UIStrings.cancel), this._cancel.bind(this));
        const fragment = UI.Fragment.Fragment.build `
  <div class="lighthouse-view vbox">
  <h2 $="status-header">Auditing your web page…</h2>
  <div class="lighthouse-status vbox" $="status-view">
  <div class="lighthouse-progress-wrapper" $="progress-wrapper">
  <div class="lighthouse-progress-bar" $="progress-bar"></div>
  </div>
  <div class="lighthouse-status-text" $="status-text"></div>
  </div>
  ${cancelButton}
  </div>
  `;
        lighthouseViewElement.appendChild(fragment.element());
        this._statusView = fragment.$('status-view');
        this._statusHeader = fragment.$('status-header');
        this._progressWrapper = fragment.$('progress-wrapper');
        this._progressBar = fragment.$('progress-bar');
        this._statusText = fragment.$('status-text');
        // Use StatusPhases array index as progress bar value
        UI.ARIAUtils.markAsProgressBar(this._progressBar, 0, StatusPhases.length - 1);
        this._cancelButton = cancelButton;
        UI.ARIAUtils.markAsStatus(this._statusText);
        this._dialog.setDefaultFocusedElement(cancelButton);
        this._dialog.setSizeBehavior(UI.GlassPane.SizeBehavior.SetExactWidthMaxHeight);
        this._dialog.setMaxContentSize(new UI.Geometry.Size(500, 400));
    }
    _reset() {
        this._resetProgressBarClasses();
        clearTimeout(this._scheduledFastFactTimeout);
        this._textChangedAt = 0;
        this._fastFactsQueued = FastFacts.map(lazyString => lazyString());
        this._currentPhase = null;
        this._scheduledTextChangeTimeout = null;
        this._scheduledFastFactTimeout = null;
    }
    show(dialogRenderElement) {
        this._reset();
        this.updateStatus(i18nString(UIStrings.loading));
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(this._inspectedURL);
        const pageHost = parsedURL && parsedURL.host;
        const statusHeader = pageHost ? i18nString(UIStrings.auditingS, { PH1: pageHost }) : i18nString(UIStrings.auditingYourWebPage);
        this._renderStatusHeader(statusHeader);
        // @ts-ignore TS expects Document, but gets Element (show takes Element|Document)
        this._dialog.show(dialogRenderElement);
    }
    _renderStatusHeader(statusHeader) {
        if (this._statusHeader) {
            this._statusHeader.textContent = `${statusHeader}…`;
        }
    }
    hide() {
        if (this._dialog.isShowing()) {
            this._dialog.hide();
        }
    }
    setInspectedURL(url = '') {
        this._inspectedURL = url;
    }
    updateStatus(message) {
        if (!message || !this._statusText) {
            return;
        }
        if (message.startsWith('Cancel')) {
            this._commitTextChange(i18nString(UIStrings.cancelling));
            clearTimeout(this._scheduledFastFactTimeout);
            return;
        }
        const nextPhase = this._getPhaseForMessage(message);
        // @ts-ignore indexOf null is valid.
        const nextPhaseIndex = StatusPhases.indexOf(nextPhase);
        // @ts-ignore indexOf null is valid.
        const currentPhaseIndex = StatusPhases.indexOf(this._currentPhase);
        if (!nextPhase && !this._currentPhase) {
            this._commitTextChange(i18nString(UIStrings.lighthouseIsWarmingUp));
            clearTimeout(this._scheduledFastFactTimeout);
        }
        else if (nextPhase && (!this._currentPhase || currentPhaseIndex < nextPhaseIndex)) {
            this._currentPhase = nextPhase;
            const text = this._getMessageForPhase(nextPhase);
            this._scheduleTextChange(text);
            this._scheduleFastFactCheck();
            this._resetProgressBarClasses();
            if (this._progressBar) {
                this._progressBar.classList.add(nextPhase.progressBarClass);
                UI.ARIAUtils.setProgressBarValue(this._progressBar, nextPhaseIndex, text);
            }
        }
    }
    _cancel() {
        this._controller.dispatchEventToListeners(Events.RequestLighthouseCancel);
    }
    _getMessageForPhase(phase) {
        if (phase.message()) {
            return phase.message();
        }
        const deviceTypeSetting = RuntimeSettings.find(item => item.setting.name === 'lighthouse.device_type');
        const throttleSetting = RuntimeSettings.find(item => item.setting.name === 'lighthouse.throttling');
        const deviceType = deviceTypeSetting ? deviceTypeSetting.setting.get() : '';
        const throttling = throttleSetting ? throttleSetting.setting.get() : '';
        const match = LoadingMessages.find(item => {
            return item.deviceType === deviceType && item.throttling === throttling;
        });
        return match ? match.message() : i18nString(UIStrings.lighthouseIsLoadingYourPage);
    }
    _getPhaseForMessage(message) {
        return StatusPhases.find(phase => message.startsWith(phase.statusMessagePrefix)) || null;
    }
    _resetProgressBarClasses() {
        if (this._progressBar) {
            this._progressBar.className = 'lighthouse-progress-bar';
        }
    }
    _scheduleFastFactCheck() {
        if (!this._currentPhase || this._scheduledFastFactTimeout) {
            return;
        }
        this._scheduledFastFactTimeout = window.setTimeout(() => {
            this._updateFastFactIfNecessary();
            this._scheduledFastFactTimeout = null;
            this._scheduleFastFactCheck();
        }, 100);
    }
    _updateFastFactIfNecessary() {
        const now = performance.now();
        if (now - this._textChangedAt < fastFactRotationInterval) {
            return;
        }
        if (!this._fastFactsQueued.length) {
            return;
        }
        const fastFactIndex = Math.floor(Math.random() * this._fastFactsQueued.length);
        this._scheduleTextChange(i18nString(UIStrings.fastFactMessageWithPlaceholder, { PH1: this._fastFactsQueued[fastFactIndex] }));
        this._fastFactsQueued.splice(fastFactIndex, 1);
    }
    _commitTextChange(text) {
        if (!this._statusText) {
            return;
        }
        this._textChangedAt = performance.now();
        this._statusText.textContent = text;
    }
    _scheduleTextChange(text) {
        if (this._scheduledTextChangeTimeout) {
            clearTimeout(this._scheduledTextChangeTimeout);
        }
        const msSinceLastChange = performance.now() - this._textChangedAt;
        const msToTextChange = minimumTextVisibilityDuration - msSinceLastChange;
        this._scheduledTextChangeTimeout = window.setTimeout(() => {
            this._commitTextChange(text);
        }, Math.max(msToTextChange, 0));
    }
    renderBugReport(err) {
        console.error(err);
        if (this._scheduledFastFactTimeout) {
            window.clearTimeout(this._scheduledFastFactTimeout);
        }
        if (this._scheduledTextChangeTimeout) {
            window.clearTimeout(this._scheduledTextChangeTimeout);
        }
        this._resetProgressBarClasses();
        if (this._progressBar) {
            this._progressBar.classList.add('errored');
        }
        if (this._statusText) {
            this._commitTextChange('');
            UI.UIUtils.createTextChild(this._statusText.createChild('p'), i18nString(UIStrings.ahSorryWeRanIntoAnError));
            if (KnownBugPatterns.some(pattern => pattern.test(err.message))) {
                const message = i18nString(UIStrings.tryToNavigateToTheUrlInAFresh);
                UI.UIUtils.createTextChild(this._statusText.createChild('p'), message);
            }
            else {
                this._renderBugReportBody(err, this._inspectedURL);
            }
        }
    }
    renderText(statusHeader, text) {
        this._renderStatusHeader(statusHeader);
        this._commitTextChange(text);
    }
    toggleCancelButton(show) {
        if (this._cancelButton) {
            this._cancelButton.style.visibility = show ? 'visible' : 'hidden';
        }
    }
    _renderBugReportBody(err, auditURL) {
        const chromeVersion = navigator.userAgent.match(/Chrome\/(\S+)/) || ['', 'Unknown'];
        // @ts-ignore Lighthouse sets `friendlyMessage` on certain
        // important errors such as PROTOCOL_TIMEOUT.
        const errorMessage = err.friendlyMessage || err.message;
        const issueBody = `
${errorMessage}
\`\`\`
Channel: DevTools
Initial URL: ${auditURL}
Chrome Version: ${chromeVersion[1]}
Stack Trace: ${err.stack}
\`\`\`
`;
        if (this._statusText) {
            UI.UIUtils.createTextChild(this._statusText.createChild('p'), i18nString(UIStrings.ifThisIssueIsReproduciblePlease));
            UI.UIUtils.createTextChild(this._statusText.createChild('code', 'monospace'), issueBody.trim());
        }
    }
}
export const fastFactRotationInterval = 6000;
export const minimumTextVisibilityDuration = 3000;
const KnownBugPatterns = [
    /PARSING_PROBLEM/,
    /DOCUMENT_REQUEST/,
    /READ_FAILED/,
    /TRACING_ALREADY_STARTED/,
    /^You must provide a url to the runner/,
    /^You probably have multiple tabs open/,
];
export const StatusPhases = [
    {
        id: 'loading',
        progressBarClass: 'loading',
        message: i18nLazyString(UIStrings.lighthouseIsLoadingThePage),
        statusMessagePrefix: 'Loading page',
    },
    {
        id: 'gathering',
        progressBarClass: 'gathering',
        message: i18nLazyString(UIStrings.lighthouseIsGatheringInformation),
        statusMessagePrefix: 'Gathering',
    },
    {
        id: 'auditing',
        progressBarClass: 'auditing',
        message: i18nLazyString(UIStrings.almostThereLighthouseIsNow),
        statusMessagePrefix: 'Auditing',
    },
];
const LoadingMessages = [
    {
        deviceType: 'mobile',
        throttling: 'on',
        message: i18nLazyString(UIStrings.lighthouseIsLoadingYourPageWith),
    },
    {
        deviceType: 'desktop',
        throttling: 'on',
        message: i18nLazyString(UIStrings.lighthouseIsLoadingYourPageWithThrottling),
    },
    {
        deviceType: 'mobile',
        throttling: 'off',
        message: i18nLazyString(UIStrings.lighthouseIsLoadingYourPageWithMobile),
    },
    {
        deviceType: 'desktop',
        throttling: 'off',
        message: i18nLazyString(UIStrings.lighthouseIsLoadingThePage),
    },
];
const FastFacts = [
    i18nLazyString(UIStrings.mbTakesAMinimumOfSecondsTo),
    i18nLazyString(UIStrings.rebuildingPinterestPagesFor),
    i18nLazyString(UIStrings.byReducingTheResponseSizeOfJson),
    i18nLazyString(UIStrings.walmartSawAIncreaseInRevenueFor),
    i18nLazyString(UIStrings.ifASiteTakesSecondToBecome),
    i18nLazyString(UIStrings.OfGlobalMobileUsersInWereOnGOrG),
    i18nLazyString(UIStrings.theAverageUserDeviceCostsLess),
    i18nLazyString(UIStrings.SecondsIsTheAverageTimeAMobile),
    i18nLazyString(UIStrings.OfMobilePagesTakeNearlySeconds),
    i18nLazyString(UIStrings.asPageLoadTimeIncreasesFromOne),
    i18nLazyString(UIStrings.asTheNumberOfElementsOnAPage),
    i18nLazyString(UIStrings.OfMobilePagesTakeNearlySeconds),
    i18nLazyString(UIStrings.lighthouseOnlySimulatesMobile),
];
//# sourceMappingURL=LighthouseStatusView.js.map