// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as ReportView from '../../../ui/components/report_view/report_view.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
const UIStrings = {
    /**
    *@description Section heading in the Trust Token tab
    */
    parameters: 'Parameters',
    /**
    *@description Text that refers to some types
    */
    type: 'Type',
    /**
    *@description Label for a Trust Token parameter
    */
    refreshPolicy: 'Refresh policy',
    /**
    *@description Label for a list if origins in the Trust Token tab
    */
    issuers: 'Issuers',
    /**
    *@description Label for a report field in the Network panel
    */
    topLevelOrigin: 'Top level origin',
    /**
    *@description Text for the issuer of an item
    */
    issuer: 'Issuer',
    /**
    *@description Heading of a report section in the Network panel
    */
    result: 'Result',
    /**
    *@description Text for the status of something
    */
    status: 'Status',
    /**
    *@description Label for a field in the Network panel
    */
    numberOfIssuedTokens: 'Number of issued tokens',
    /**
    * @description Text for the success status in the Network panel. Refers to the outcome of a network
    * request which will either be 'Success' or 'Failure'.
    */
    success: 'Success',
    /**
    *@description Text in the network panel for an error status
    */
    failure: 'Failure',
    /**
    *@description Detailed text for a success status in the Network panel
    */
    theOperationsResultWasServedFrom: 'The operations result was served from cache.',
    /**
    *@description Detailed text for a success status in the Network panel
    */
    theOperationWasFulfilledLocally: 'The operation was fulfilled locally, no request was sent.',
    /**
    *@description Text for an error status in the Network panel
    */
    aClientprovidedArgumentWas: 'A client-provided argument was malformed or otherwise invalid.',
    /**
    *@description Text for an error status in the Network panel
    */
    eitherNoInputsForThisOperation: 'Either no inputs for this operation are available or the output exceeds the operations quota.',
    /**
    *@description Text for an error status in the Network panel
    */
    theServersResponseWasMalformedOr: 'The servers response was malformed or otherwise invalid.',
    /**
    *@description Text for an error status in the Network panel
    */
    theOperationFailedForAnUnknown: 'The operation failed for an unknown reason.',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/components/RequestTrustTokensView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class RequestTrustTokensView extends UI.Widget.VBox {
    reportView = new RequestTrustTokensReport();
    request;
    constructor(request) {
        super();
        this.request = request;
        this.contentElement.appendChild(this.reportView);
    }
    wasShown() {
        this.request.addEventListener(SDK.NetworkRequest.Events.TrustTokenResultAdded, this.refreshReportView, this);
        this.refreshReportView();
    }
    willHide() {
        this.request.removeEventListener(SDK.NetworkRequest.Events.TrustTokenResultAdded, this.refreshReportView, this);
    }
    refreshReportView() {
        this.reportView.data = {
            params: this.request.trustTokenParams(),
            result: this.request.trustTokenOperationDoneEvent(),
        };
    }
}
export class RequestTrustTokensReport extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    trustTokenData;
    set data(data) {
        this.trustTokenData = data;
        this.render();
    }
    render() {
        if (!this.trustTokenData) {
            throw new Error('Trying to render a Trust Token report without providing data');
        }
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        .code {
          font-family: var(--monospace-font-family);
          font-size: var(--monospace-font-size);
        }

        .issuers-list {
          display: flex;
          flex-direction: column;
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .status-icon {
          margin: 0 0.3em 2px 0;
          vertical-align: middle;
        }
      </style>
      <${ReportView.ReportView.Report.litTagName}>
        ${this.renderParameterSection()}
        ${this.renderResultSection()}
      </${ReportView.ReportView.Report.litTagName}>
    `, this.shadow);
        // clang-format on
    }
    renderParameterSection() {
        if (!this.trustTokenData || !this.trustTokenData.params) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.parameters)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      ${renderRowWithCodeValue(i18nString(UIStrings.type), this.trustTokenData.params.type.toString())}
      ${this.renderRefreshPolicy(this.trustTokenData.params)}
      ${this.renderIssuers(this.trustTokenData.params)}
      ${this.renderIssuerAndTopLevelOriginFromResult()}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    renderRefreshPolicy(params) {
        if (params.type !== "Redemption" /* Redemption */) {
            return LitHtml.nothing;
        }
        return renderRowWithCodeValue(i18nString(UIStrings.refreshPolicy), params.refreshPolicy.toString());
    }
    renderIssuers(params) {
        if (!params.issuers || params.issuers.length === 0) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.issuers)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <ul class="issuers-list">
          ${params.issuers.map(issuer => LitHtml.html `<li>${issuer}</li>`)}
        </ul>
      </${ReportView.ReportView.ReportValue.litTagName}>
    `;
    }
    // The issuer and top level origin are technically parameters but reported in the
    // result structure due to the timing when they are calculated in the backend.
    // Nonetheless, we show them as part of the parameter section.
    renderIssuerAndTopLevelOriginFromResult() {
        if (!this.trustTokenData || !this.trustTokenData.result) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      ${renderSimpleRowIfValuePresent(i18nString(UIStrings.topLevelOrigin), this.trustTokenData.result.topLevelOrigin)}
      ${renderSimpleRowIfValuePresent(i18nString(UIStrings.issuer), this.trustTokenData.result.issuerOrigin)}`;
    }
    renderResultSection() {
        if (!this.trustTokenData || !this.trustTokenData.result) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.result)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.status)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <span>
          <${IconButton.Icon.Icon.litTagName} class="status-icon"
            .data=${getIconForStatusCode(this.trustTokenData.result.status)}>
          </${IconButton.Icon.Icon.litTagName}>
          <strong>${getSimplifiedStatusTextForStatusCode(this.trustTokenData.result.status)}</strong>
          ${getDetailedTextForStatusCode(this.trustTokenData.result.status)}
        </span>
      </${ReportView.ReportView.ReportValue.litTagName}>
      ${this.renderIssuedTokenCount(this.trustTokenData.result)}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
      `;
    }
    renderIssuedTokenCount(result) {
        if (result.type !== "Issuance" /* Issuance */) {
            return LitHtml.nothing;
        }
        return renderSimpleRowIfValuePresent(i18nString(UIStrings.numberOfIssuedTokens), result.issuedTokenCount);
    }
}
const SUCCESS_ICON_DATA = {
    color: 'rgb(12, 164, 12)',
    iconName: 'ic_checkmark_16x16',
    width: '12px',
};
const FAILURE_ICON_DATA = {
    color: '',
    iconName: 'error_icon',
    width: '12px',
};
export function statusConsideredSuccess(status) {
    return status === "Ok" /* Ok */ ||
        status === "AlreadyExists" /* AlreadyExists */ ||
        status === "FulfilledLocally" /* FulfilledLocally */;
}
function getIconForStatusCode(status) {
    return statusConsideredSuccess(status) ? SUCCESS_ICON_DATA : FAILURE_ICON_DATA;
}
function getSimplifiedStatusTextForStatusCode(status) {
    return statusConsideredSuccess(status) ? i18nString(UIStrings.success) : i18nString(UIStrings.failure);
}
function getDetailedTextForStatusCode(status) {
    switch (status) {
        case "Ok" /* Ok */:
            return null;
        case "AlreadyExists" /* AlreadyExists */:
            return i18nString(UIStrings.theOperationsResultWasServedFrom);
        case "FulfilledLocally" /* FulfilledLocally */:
            return i18nString(UIStrings.theOperationWasFulfilledLocally);
        case "InvalidArgument" /* InvalidArgument */:
            return i18nString(UIStrings.aClientprovidedArgumentWas);
        case "ResourceExhausted" /* ResourceExhausted */:
            return i18nString(UIStrings.eitherNoInputsForThisOperation);
        case "BadResponse" /* BadResponse */:
            return i18nString(UIStrings.theServersResponseWasMalformedOr);
        case "FailedPrecondition" /* FailedPrecondition */:
        case "Unavailable" /* Unavailable */:
        case "InternalError" /* InternalError */:
        case "UnknownError" /* UnknownError */:
            return i18nString(UIStrings.theOperationFailedForAnUnknown);
    }
}
function renderSimpleRowIfValuePresent(key, value) {
    if (value === undefined) {
        return LitHtml.nothing;
    }
    return LitHtml.html `
    <${ReportView.ReportView.ReportKey.litTagName}>${key}</${ReportView.ReportView.ReportKey.litTagName}>
    <${ReportView.ReportView.ReportValue.litTagName}>${value}</${ReportView.ReportView.ReportValue.litTagName}>
  `;
}
function renderRowWithCodeValue(key, value) {
    return LitHtml.html `
    <${ReportView.ReportView.ReportKey.litTagName}>${key}</${ReportView.ReportView.ReportKey.litTagName}>
    <${ReportView.ReportView.ReportValue.litTagName} class="code">${value}</${ReportView.ReportView.ReportValue.litTagName}>
  `;
}
ComponentHelpers.CustomElements.defineComponent('devtools-trust-token-report', RequestTrustTokensReport);
//# sourceMappingURL=RequestTrustTokensView.js.map