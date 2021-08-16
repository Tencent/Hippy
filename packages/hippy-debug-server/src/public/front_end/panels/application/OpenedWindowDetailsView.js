// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js'; // eslint-disable-line no-unused-vars
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in Timeline indicating that input has happened recently
    */
    yes: 'Yes',
    /**
    *@description Text in Timeline indicating that input has not happened recently
    */
    no: 'No',
    /**
    *@description Title for a link to the Elements panel
    */
    clickToRevealInElementsPanel: 'Click to reveal in Elements panel',
    /**
    *@description Name of a network resource type
    */
    document: 'Document',
    /**
    *@description Text for web URLs
    */
    url: 'URL',
    /**
    *@description Title of the 'Security' tool
    */
    security: 'Security',
    /**
    *@description Label for link to Opener Frame in Detail View for Opened Window
    */
    openerFrame: 'Opener Frame',
    /**
    *@description Label in opened window's details view whether window has access to its opener
    */
    accessToOpener: 'Access to opener',
    /**
    *@description Description for the 'Access to Opener' field
    */
    showsWhetherTheOpenedWindowIs: 'Shows whether the opened window is able to access its opener and vice versa',
    /**
    *@description Text in Frames View of the Application panel
    */
    windowWithoutTitle: 'Window without title',
    /**
    *@description Label suffix in the Application Panel Frames section for windows which are already closed
    */
    closed: 'closed',
    /**
    *@description Default name for worker
    */
    worker: 'worker',
    /**
    *@description Text that refers to some types
    */
    type: 'Type',
    /**
    *@description Section header in the Frame Details view
    */
    securityIsolation: 'Security & Isolation',
    /**
    *@description Row title in the Frame Details view
    */
    crossoriginEmbedderPolicy: 'Cross-Origin Embedder Policy',
    /**
    *@description Label for worker type: web worker
    */
    webWorker: 'Web Worker',
    /**
    *@description Text for an unspecified service worker response source
    */
    unknown: 'Unknown',
    /**
    *@description This label specifies the server endpoints to which the server is reporting errors
    *and warnings through the Report-to API. Following this label will be the URL of the server.
    */
    reportingTo: 'reporting to',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/OpenedWindowDetailsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const booleanToYesNo = (b) => b ? i18nString(UIStrings.yes) : i18nString(UIStrings.no);
function linkifyIcon(iconType, title, eventHandler) {
    const icon = UI.Icon.Icon.create(iconType, 'icon-link devtools-link');
    const span = document.createElement('span');
    UI.Tooltip.Tooltip.install(span, title);
    span.classList.add('devtools-link');
    span.tabIndex = 0;
    span.appendChild(icon);
    span.addEventListener('click', event => {
        event.consume(true);
        eventHandler();
    });
    span.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.consume(true);
            eventHandler();
        }
    });
    return span;
}
async function maybeCreateLinkToElementsPanel(opener) {
    let openerFrame = null;
    if (opener instanceof SDK.ResourceTreeModel.ResourceTreeFrame) {
        openerFrame = opener;
    }
    else if (opener) {
        openerFrame = SDK.FrameManager.FrameManager.instance().getFrame(opener);
    }
    if (!openerFrame) {
        return null;
    }
    const linkTargetDOMNode = await openerFrame.getOwnerDOMNodeOrDocument();
    if (!linkTargetDOMNode) {
        return null;
    }
    const linkElement = linkifyIcon('mediumicon-elements-panel', i18nString(UIStrings.clickToRevealInElementsPanel), () => Common.Revealer.reveal(linkTargetDOMNode));
    const label = document.createElement('span');
    label.textContent = `<${linkTargetDOMNode.nodeName().toLocaleLowerCase()}>`;
    linkElement.insertBefore(label, linkElement.firstChild);
    linkElement.addEventListener('mouseenter', () => {
        if (openerFrame) {
            openerFrame.highlight();
        }
    });
    linkElement.addEventListener('mouseleave', () => {
        SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
    });
    return linkElement;
}
export class OpenedWindowDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    _targetInfo;
    _isWindowClosed;
    _reportView;
    _documentSection;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _URLFieldValue;
    _securitySection;
    _openerElementField;
    _hasDOMAccessValue;
    constructor(targetInfo, isWindowClosed) {
        super();
        this._targetInfo = targetInfo;
        this._isWindowClosed = isWindowClosed;
        this.registerRequiredCSS('panels/application/frameDetailsReportView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('frame-details-container');
        // TODO(crbug.com/1156978): Replace UI.ReportView.ReportView with ReportView.ts web component.
        this._reportView = new UI.ReportView.ReportView(this.buildTitle());
        this._reportView.registerRequiredCSS('panels/application/frameDetailsReportView.css', { enableLegacyPatching: false });
        this._reportView.show(this.contentElement);
        this._reportView.element.classList.add('frame-details-report-container');
        this._documentSection = this._reportView.appendSection(i18nString(UIStrings.document));
        this._URLFieldValue = this._documentSection.appendField(i18nString(UIStrings.url));
        this._securitySection = this._reportView.appendSection(i18nString(UIStrings.security));
        this._openerElementField = this._securitySection.appendField(i18nString(UIStrings.openerFrame));
        this._securitySection.setFieldVisible(i18nString(UIStrings.openerFrame), false);
        this._hasDOMAccessValue = this._securitySection.appendField(i18nString(UIStrings.accessToOpener));
        UI.Tooltip.Tooltip.install(this._hasDOMAccessValue, i18nString(UIStrings.showsWhetherTheOpenedWindowIs));
        this.update();
    }
    async doUpdate() {
        this._reportView.setTitle(this.buildTitle());
        this._URLFieldValue.textContent = this._targetInfo.url;
        this._hasDOMAccessValue.textContent = booleanToYesNo(this._targetInfo.canAccessOpener);
        this.maybeDisplayOpenerFrame();
    }
    async maybeDisplayOpenerFrame() {
        this._openerElementField.removeChildren();
        const linkElement = await maybeCreateLinkToElementsPanel(this._targetInfo.openerFrameId);
        if (linkElement) {
            this._openerElementField.append(linkElement);
            this._securitySection.setFieldVisible(i18nString(UIStrings.openerFrame), true);
            return;
        }
        this._securitySection.setFieldVisible(i18nString(UIStrings.openerFrame), false);
    }
    buildTitle() {
        let title = this._targetInfo.title || i18nString(UIStrings.windowWithoutTitle);
        if (this._isWindowClosed) {
            title += ` (${i18nString(UIStrings.closed)})`;
        }
        return title;
    }
    setIsWindowClosed(isWindowClosed) {
        this._isWindowClosed = isWindowClosed;
    }
    setTargetInfo(targetInfo) {
        this._targetInfo = targetInfo;
    }
}
export class WorkerDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    _targetInfo;
    _reportView;
    _documentSection;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _URLFieldValue;
    _isolationSection;
    _coepPolicy;
    constructor(targetInfo) {
        super();
        this._targetInfo = targetInfo;
        this.registerRequiredCSS('panels/application/frameDetailsReportView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('frame-details-container');
        // TODO(crbug.com/1156978): Replace UI.ReportView.ReportView with ReportView.ts web component.
        this._reportView =
            new UI.ReportView.ReportView(this._targetInfo.title || this._targetInfo.url || i18nString(UIStrings.worker));
        this._reportView.registerRequiredCSS('panels/application/frameDetailsReportView.css', { enableLegacyPatching: false });
        this._reportView.show(this.contentElement);
        this._reportView.element.classList.add('frame-details-report-container');
        this._documentSection = this._reportView.appendSection(i18nString(UIStrings.document));
        this._URLFieldValue = this._documentSection.appendField(i18nString(UIStrings.url));
        this._URLFieldValue.textContent = this._targetInfo.url;
        const workerType = this._documentSection.appendField(i18nString(UIStrings.type));
        workerType.textContent = this.workerTypeToString(this._targetInfo.type);
        this._isolationSection = this._reportView.appendSection(i18nString(UIStrings.securityIsolation));
        this._coepPolicy = this._isolationSection.appendField(i18nString(UIStrings.crossoriginEmbedderPolicy));
        this.update();
    }
    workerTypeToString(type) {
        if (type === 'worker') {
            return i18nString(UIStrings.webWorker);
        }
        if (type === 'service_worker') {
            return i18n.i18n.lockedString('Service Worker');
        }
        return i18nString(UIStrings.unknown);
    }
    async _updateCoopCoepStatus() {
        const target = SDK.TargetManager.TargetManager.instance().targetById(this._targetInfo.targetId);
        if (!target) {
            return;
        }
        const model = target.model(SDK.NetworkManager.NetworkManager);
        const info = model && await model.getSecurityIsolationStatus('');
        if (!info) {
            return;
        }
        const coepIsEnabled = (value) => value !== "None" /* None */;
        this._fillCrossOriginPolicy(this._coepPolicy, coepIsEnabled, info.coep);
    }
    _fillCrossOriginPolicy(field, isEnabled, info) {
        if (!info) {
            field.textContent = '';
            return;
        }
        const enabled = isEnabled(info.value);
        field.textContent = enabled ? info.value : info.reportOnlyValue;
        if (!enabled && isEnabled(info.reportOnlyValue)) {
            const reportOnly = document.createElement('span');
            reportOnly.classList.add('inline-comment');
            reportOnly.textContent = 'report-only';
            field.appendChild(reportOnly);
        }
        const endpoint = enabled ? info.reportingEndpoint : info.reportOnlyReportingEndpoint;
        if (endpoint) {
            const reportingEndpointPrefix = field.createChild('span', 'inline-name');
            reportingEndpointPrefix.textContent = i18nString(UIStrings.reportingTo);
            const reportingEndpointName = field.createChild('span');
            reportingEndpointName.textContent = endpoint;
        }
    }
    async doUpdate() {
        await this._updateCoopCoepStatus();
    }
}
//# sourceMappingURL=OpenedWindowDetailsView.js.map