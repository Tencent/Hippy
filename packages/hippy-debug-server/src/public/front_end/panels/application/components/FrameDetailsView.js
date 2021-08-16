// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { StackTrace } from './StackTrace.js';
import * as Bindings from '../../../models/bindings/bindings.js';
import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as Network from '../../network/network.js';
import * as Root from '../../../core/root/root.js';
import * as SDK from '../../../core/sdk/sdk.js'; // eslint-disable-line no-unused-vars
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as ReportView from '../../../ui/components/report_view/report_view.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as Workspace from '../../../models/workspace/workspace.js';
import * as Components from '../../../ui/legacy/components/utils/utils.js';
const UIStrings = {
    /**
    *@description Section header in the Frame Details view
    */
    additionalInformation: 'Additional Information',
    /**
    *@description Explanation for why the additional information section is being shown
    */
    thisAdditionalDebugging: 'This additional (debugging) information is shown because the \'Protocol Monitor\' experiment is enabled.',
    /**
    *@description Label for subtitle of frame details view
    */
    frameId: 'Frame ID',
    /**
    *@description Name of a network resource type
    */
    document: 'Document',
    /**
    *@description Text for web URLs
    */
    url: 'URL',
    /**
    *@description Title for a link to the Sources panel
    */
    clickToRevealInSourcesPanel: 'Click to reveal in Sources panel',
    /**
    *@description Title for a link to the Network panel
    */
    clickToRevealInNetworkPanel: 'Click to reveal in Network panel',
    /**
    *@description Title for unreachable URL field
    */
    unreachableUrl: 'Unreachable URL',
    /**
    *@description Title for a link that applies a filter to the network panel
    */
    clickToRevealInNetworkPanelMight: 'Click to reveal in Network panel (might require page reload)',
    /**
    *@description Text for the origin of something
    */
    origin: 'Origin',
    /**
    *@description Related node label in Timeline UIUtils of the Performance panel
    */
    ownerElement: 'Owner Element',
    /**
    *@description Title for a link to the Elements panel
    */
    clickToRevealInElementsPanel: 'Click to reveal in Elements panel',
    /**
    *@description Title for ad frame type field
    */
    adStatus: 'Ad Status',
    /**
    *@description Description for ad frame type
    */
    thisFrameHasBeenIdentifiedAsThe: 'This frame has been identified as the root frame of an ad',
    /**
    *@description Value for ad frame type
    */
    root: 'root',
    /**
    *@description Description for ad frame type
    */
    thisFrameHasBeenIdentifiedAsTheA: 'This frame has been identified as a child frame of an ad',
    /**
    *@description Value for ad frame type
    */
    child: 'child',
    /**
    *@description Section header in the Frame Details view
    */
    securityIsolation: 'Security & Isolation',
    /**
    *@description Row title for in the Frame Details view
    */
    secureContext: 'Secure Context',
    /**
    *@description Text in Timeline indicating that input has happened recently
    */
    yes: 'Yes',
    /**
    *@description Text in Timeline indicating that input has not happened recently
    */
    no: 'No',
    /**
    *@description Row title for in the Frame Details view
    */
    crossoriginIsolated: 'Cross-Origin Isolated',
    /**
    *@description Explanatory text in the Frame Details view
    */
    localhostIsAlwaysASecureContext: 'Localhost is always a secure context',
    /**
    *@description Explanatory text in the Frame Details view
    */
    aFrameAncestorIsAnInsecure: 'A frame ancestor is an insecure context',
    /**
    *@description Explanatory text in the Frame Details view
    */
    theFramesSchemeIsInsecure: 'The frame\'s scheme is insecure',
    /**
    *@description Row title in the Frame Details view
    */
    crossoriginEmbedderPolicy: 'Cross-Origin Embedder Policy',
    /**
    *@description Row title in the Frame Details view
    */
    crossoriginOpenerPolicy: 'Cross-Origin Opener Policy',
    /**
    *@description This label specifies the server endpoints to which the server is reporting errors
    *and warnings through the Report-to API. Following this label will be the URL of the server.
    */
    reportingTo: 'reporting to',
    /**
    *@description Section header in the Frame Details view
    */
    apiAvailability: 'API availability',
    /**
    *@description Explanatory text in the Frame Details view for the API availability section
    */
    availabilityOfCertainApisDepends: 'Availability of certain APIs depends on the document being cross-origin isolated.',
    /**
    *@description Description of the SharedArrayBuffer status
    */
    availableTransferable: 'available, transferable',
    /**
    *@description Description of the SharedArrayBuffer status
    */
    availableNotTransferable: 'available, not transferable',
    /**
    *@description Explanation for the SharedArrayBuffer availability status
    */
    unavailable: 'unavailable',
    /**
    *@description Tooltip for the SharedArrayBuffer availability status
    */
    sharedarraybufferConstructorIs: 'SharedArrayBuffer constructor is available and SABs can be transferred via postMessage',
    /**
    *@description Tooltip for the SharedArrayBuffer availability status
    */
    sharedarraybufferConstructorIsAvailable: 'SharedArrayBuffer constructor is available but SABs cannot be transferred via postMessage',
    /**
    *@description Explanation for the SharedArrayBuffer availability status
    */
    willRequireCrossoriginIsolated: '⚠️ will require cross-origin isolated context in the future',
    /**
    *@description Explanation for the SharedArrayBuffer availability status
    */
    requiresCrossoriginIsolated: 'requires cross-origin isolated context',
    /**
     *@description Explanation for the SharedArrayBuffer availability status in case the transfer of a SAB requires the
     * permission policy `cross-origin-isolated` to be enabled (e.g. because the message refers to the situation in an iframe).
     */
    transferRequiresCrossoriginIsolatedPermission: '`SharedArrayBuffer` transfer requires enabling the permission policy:',
    /**
    *@description Explanation for the Measure Memory availability status
    */
    available: 'available',
    /**
    *@description Tooltip for the Measure Memory availability status
    */
    thePerformanceAPI: 'The performance.measureUserAgentSpecificMemory() API is available',
    /**
    *@description Tooltip for the Measure Memory availability status
    */
    thePerformancemeasureuseragentspecificmemory: 'The performance.measureUserAgentSpecificMemory() API is not available',
    /**
    *@description Entry in the API availability section of the frame details view
    */
    measureMemory: 'Measure Memory',
    /**
    *@description Text that is usually a hyperlink to more documentation
    */
    learnMore: 'Learn more',
    /**
    *@description Label for a stack trace. If a frame is created programmatically (i.e. via JavaScript), there is a
    * stack trace for the line of code which caused the creation of the iframe. This is the stack trace we are showing here.
    */
    creationStackTrace: 'Frame Creation Stack Trace',
    /**
    *@description Tooltip for 'Frame Creation Stack Trace' explaining that the stack
    *trace shows where in the code the frame has been created programmatically
    */
    creationStackTraceExplanation: 'This frame was created programmatically. The stack trace shows where this happened.',
    /**
     *@description Label for a button. When clicked more details (for the content this button refers to) will be shown.
     */
    showDetails: 'Show details',
    /**
    *@description Label for a button. When clicked some details (for the content this button refers to) will be hidden.
    */
    hideDetails: 'Hide details',
    /**
    *@description Label for a list of features which are allowed according to the current Permissions policy
    *(a mechanism that allows developers to enable/disable browser features and APIs (e.g. camera, geolocation, autoplay))
    */
    allowedFeatures: 'Allowed Features',
    /**
    *@description Label for a list of features which are disabled according to the current Permissions policy
    *(a mechanism that allows developers to enable/disable browser features and APIs (e.g. camera, geolocation, autoplay))
    */
    disabledFeatures: 'Disabled Features',
    /**
    *@description Tooltip text for a link to a specific request's headers in the Network panel.
    */
    clickToShowHeader: 'Click to reveal the request whose "`Permissions-Policy`" HTTP header disables this feature.',
    /**
    *@description Tooltip text for a link to a specific iframe in the Elements panel (Iframes can be nested, the link goes
    *  to the outer-most iframe which blocks a certain feature).
    */
    clickToShowIframe: 'Click to reveal the top-most iframe which does not allow this feature in the elements panel.',
    /**
    *@description Text describing that a specific feature is blocked by not being included in the iframe's "allow" attribute.
    */
    disabledByIframe: 'missing in iframe "`allow`" attribute',
    /**
    *@description Text describing that a specific feature is blocked by a Permissions Policy specified in a request header.
    */
    disabledByHeader: 'disabled by "`Permissions-Policy`" header',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/components/FrameDetailsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FrameDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    reportView = new FrameDetailsReportView();
    frame;
    constructor(frame) {
        super();
        this.frame = frame;
        this.contentElement.classList.add('overflow-auto');
        this.contentElement.appendChild(this.reportView);
        this.update();
    }
    async doUpdate() {
        this.reportView.data = { frame: this.frame };
    }
}
export class FrameDetailsReportView extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    frame;
    protocolMonitorExperimentEnabled = false;
    showPermissionsDisallowedDetails = false;
    connectedCallback() {
        this.protocolMonitorExperimentEnabled = Root.Runtime.experiments.isEnabled('protocolMonitor');
    }
    set data(data) {
        this.frame = data.frame;
        this.render();
    }
    async render() {
        if (!this.frame) {
            return;
        }
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        .text-ellipsis {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        button ~ .text-ellipsis {
          padding-left: 2px;
        }

        .link,
        .devtools-link {
          color: var(--color-link);
          text-decoration: underline;
          cursor: pointer;
          padding: 2px 0; /* adjust focus ring size */
        }

        button.link {
          border: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
        }

        .inline-comment {
          padding-left: 1ex;
          white-space: pre-line;
        }

        .inline-comment::before {
          content: "(";
        }

        .inline-comment::after {
          content: ")";
        }

        .inline-name {
          color: var(--color-text-secondary);
          padding-left: 2ex;
          user-select: none;
          white-space: pre-line;
        }

        .inline-name::after {
          content: ':\u00a0';
        }

        .inline-items {
          display: flex;
        }

        .span-cols {
          grid-column-start: span 2;
          margin: 0 0 8px 30px;
          line-height: 28px;
        }

        .policies-list {
          padding-top: 3px;
        }
      </style>
      <${ReportView.ReportView.Report.litTagName} .data=${{ reportTitle: this.frame.displayName() }}>
        ${this.renderDocumentSection()}
        ${this.renderIsolationSection()}
        ${this.renderApiAvailabilitySection()}
        ${LitHtml.Directives.until(this.renderPermissionPolicy(), LitHtml.nothing)}
        ${this.protocolMonitorExperimentEnabled ? this.renderAdditionalInfoSection() : LitHtml.nothing}
      </${ReportView.ReportView.Report.litTagName}>
    `, this.shadow);
        // clang-format on
    }
    async renderPermissionPolicy() {
        const policies = await (this.frame && this.frame.getPermissionsPolicyState());
        if (!policies) {
            return LitHtml.nothing;
        }
        const toggleShowPermissionsDisallowedDetails = () => {
            this.showPermissionsDisallowedDetails = !this.showPermissionsDisallowedDetails;
            this.render();
        };
        const renderAllowed = () => {
            const allowed = policies.filter(p => p.allowed).map(p => p.feature).sort();
            if (!allowed.length) {
                return LitHtml.nothing;
            }
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.allowedFeatures)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          ${allowed.join(', ')}
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
        };
        const renderDisallowed = async () => {
            const disallowed = policies.filter(p => !p.allowed).sort((a, b) => a.feature.localeCompare(b.feature));
            if (!disallowed.length) {
                return LitHtml.nothing;
            }
            if (!this.showPermissionsDisallowedDetails) {
                return LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.disabledFeatures)}</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName}>
            ${disallowed.map(p => p.feature).join(', ')}
            <button class="link" @click=${() => toggleShowPermissionsDisallowedDetails()}>
              ${i18nString(UIStrings.showDetails)}
            </button>
          </${ReportView.ReportView.ReportValue.litTagName}>
        `;
            }
            const frameManager = SDK.FrameManager.FrameManager.instance();
            const featureRows = await Promise.all(disallowed.map(async (policy) => {
                const frame = policy.locator ? frameManager.getFrame(policy.locator.frameId) : null;
                const blockReason = policy.locator?.blockReason;
                const linkTargetDOMNode = await (blockReason === "IframeAttribute" /* IframeAttribute */ && frame &&
                    frame.getOwnerDOMNodeOrDocument());
                const resource = frame && frame.resourceForURL(frame.url);
                const linkTargetRequest = blockReason === "Header" /* Header */ && resource && resource.request;
                const blockReasonText = blockReason === "IframeAttribute" /* IframeAttribute */ ?
                    i18nString(UIStrings.disabledByIframe) :
                    blockReason === "Header" /* Header */ ? i18nString(UIStrings.disabledByHeader) :
                        '';
                const revealHeader = async () => {
                    if (!linkTargetRequest) {
                        return;
                    }
                    const headerName = linkTargetRequest.responseHeaderValue('permissions-policy') ? 'permissions-policy' : 'feature-policy';
                    const requestLocation = Network.NetworkSearchScope.UIRequestLocation.responseHeaderMatch(linkTargetRequest, { name: headerName, value: '' });
                    // TODO(crbug.com/1196676) Refactor to use Common.Revealer
                    await Network.NetworkPanel.RequestLocationRevealer.instance().reveal(requestLocation);
                };
                return LitHtml.html `
          <div class="permissions-row">
            <div>
              <${IconButton.Icon.Icon.litTagName} class="allowed-icon"
                .data=${{ color: '', iconName: 'error_icon', width: '14px' }}>
              </${IconButton.Icon.Icon.litTagName}>
            </div>
            <div class="feature-name text-ellipsis">
              ${policy.feature}
            </div>
            <div class="block-reason">${blockReasonText}</div>
            <div>
              ${linkTargetDOMNode ? this.renderIconLink('elements_panel_icon', i18nString(UIStrings.clickToShowIframe), () => Common.Revealer.reveal(linkTargetDOMNode)) :
                    LitHtml.nothing}
              ${linkTargetRequest ? this.renderIconLink('network_panel_icon', i18nString(UIStrings.clickToShowHeader), revealHeader) :
                    LitHtml.nothing}
            </div>
          </div>
        `;
            }));
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.disabledFeatures)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName} class="policies-list">
          <style>
            .permissions-row {
              display: flex;
              line-height: 22px;
            }

            .permissions-row div {
              padding-right: 5px;
            }

            .feature-name {
              width: 135px;
            }

            .allowed-icon {
              padding: 2.5px 0;
            }

            .block-reason {
              width: 215px;
            }
          </style>
          ${featureRows}
          <div class="permissions-row">
            <button class="link" @click=${() => toggleShowPermissionsDisallowedDetails()}>
              ${i18nString(UIStrings.hideDetails)}
            </button>
          </div>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
        };
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18n.i18n.lockedString('Permissions Policy')}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      ${renderAllowed()}
      ${LitHtml.Directives.until(renderDisallowed(), LitHtml.nothing)}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    renderDocumentSection() {
        if (!this.frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.document)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.url)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <div class="inline-items">
          ${this.maybeRenderSourcesLinkForURL()}
          ${this.maybeRenderNetworkLinkForURL()}
          <div class="text-ellipsis" title=${this.frame.url}>${this.frame.url}</div>
        </div>
      </${ReportView.ReportView.ReportValue.litTagName}>
      ${this.maybeRenderUnreachableURL()}
      ${this.maybeRenderOrigin()}
      ${LitHtml.Directives.until(this.renderOwnerElement(), LitHtml.nothing)}
      ${this.maybeRenderCreationStacktrace()}
      ${this.maybeRenderAdStatus()}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    maybeRenderSourcesLinkForURL() {
        if (!this.frame || this.frame.unreachableUrl()) {
            return LitHtml.nothing;
        }
        const sourceCode = this.uiSourceCodeForFrame(this.frame);
        return this.renderIconLink('sources_panel_icon', i18nString(UIStrings.clickToRevealInSourcesPanel), () => Common.Revealer.reveal(sourceCode));
    }
    maybeRenderNetworkLinkForURL() {
        if (this.frame) {
            const resource = this.frame.resourceForURL(this.frame.url);
            if (resource && resource.request) {
                const request = resource.request;
                return this.renderIconLink('network_panel_icon', i18nString(UIStrings.clickToRevealInNetworkPanel), () => Network.NetworkPanel.NetworkPanel.selectAndShowRequest(request, Network.NetworkItemView.Tabs.Headers));
            }
        }
        return LitHtml.nothing;
    }
    renderIconLink(iconName, title, clickHandler) {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <button class="link" role="link" tabindex=0 @click=${clickHandler} title=${title}>
        <${IconButton.Icon.Icon.litTagName} .data=${{
            iconName: iconName,
            color: 'var(--color-primary)',
            width: '16px',
            height: '16px',
        }}>
        </${IconButton.Icon.Icon.litTagName}>
      </button>
    `;
        // clang-format on
    }
    uiSourceCodeForFrame(frame) {
        for (const project of Workspace.Workspace.WorkspaceImpl.instance().projects()) {
            const projectTarget = Bindings.NetworkProject.NetworkProject.getTargetForProject(project);
            if (projectTarget && projectTarget === frame.resourceTreeModel().target()) {
                const uiSourceCode = project.uiSourceCodeForURL(frame.url);
                if (uiSourceCode) {
                    return uiSourceCode;
                }
            }
        }
        return null;
    }
    maybeRenderUnreachableURL() {
        if (!this.frame || !this.frame.unreachableUrl()) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.unreachableUrl)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <div class="inline-items">
          ${this.renderNetworkLinkForUnreachableURL()}
          <div class="text-ellipsis" title=${this.frame.unreachableUrl()}>${this.frame.unreachableUrl()}</div>
        </div>
      </${ReportView.ReportView.ReportValue.litTagName}>
    `;
    }
    renderNetworkLinkForUnreachableURL() {
        if (this.frame) {
            const unreachableUrl = Common.ParsedURL.ParsedURL.fromString(this.frame.unreachableUrl());
            if (unreachableUrl) {
                return this.renderIconLink('network_panel_icon', i18nString(UIStrings.clickToRevealInNetworkPanelMight), () => {
                    Network.NetworkPanel.NetworkPanel.revealAndFilter([
                        {
                            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
                            // @ts-expect-error
                            filterType: 'domain',
                            filterValue: unreachableUrl.domain(),
                        },
                        {
                            filterType: null,
                            filterValue: unreachableUrl.path,
                        },
                    ]);
                });
            }
        }
        return LitHtml.nothing;
    }
    maybeRenderOrigin() {
        if (this.frame && this.frame.securityOrigin && this.frame.securityOrigin !== '://') {
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.origin)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <div class="text-ellipsis" title=${this.frame.securityOrigin}>${this.frame.securityOrigin}</div>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
        }
        return LitHtml.nothing;
    }
    async renderOwnerElement() {
        if (this.frame) {
            const linkTargetDOMNode = await this.frame.getOwnerDOMNodeOrDocument();
            if (linkTargetDOMNode) {
                // Disabled until https://crbug.com/1079231 is fixed.
                // clang-format off
                return LitHtml.html `
          <style>
            .button-icon-with-text {
              vertical-align: sub;
            }

            .without-min-width {
              min-width: auto;
            }
          </style>
            <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.ownerElement)}</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} class="without-min-width">
              <button class="link" role="link" tabindex=0 title=${i18nString(UIStrings.clickToRevealInElementsPanel)}
              @mouseenter=${() => this.frame?.highlight()}
              @mouseleave=${() => SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight()}
              @click=${() => Common.Revealer.reveal(linkTargetDOMNode)}
            >
              <${IconButton.Icon.Icon.litTagName} class="button-icon-with-text" .data=${{
                    iconName: 'elements_panel_icon',
                    color: 'var(--color-primary)',
                    width: '16px',
                    height: '16px',
                }}></${IconButton.Icon.Icon.litTagName}>
              &lt;${linkTargetDOMNode.nodeName().toLocaleLowerCase()}&gt;
            </button>
          </${ReportView.ReportView.ReportValue.litTagName}>
        `;
                // clang-format on
            }
        }
        return LitHtml.nothing;
    }
    maybeRenderCreationStacktrace() {
        const creationStackTraceData = this.frame?.getCreationStackTraceData();
        if (creationStackTraceData && creationStackTraceData.creationStackTrace) {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName} title=${i18nString(UIStrings.creationStackTraceExplanation)}>${i18nString(UIStrings.creationStackTrace)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <${StackTrace.litTagName} .data=${{
                frame: this.frame,
                buildStackTraceRows: Components.JSPresentationUtils.buildStackTraceRows,
            }}>
          </${StackTrace.litTagName}>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
            // clang-format on
        }
        return LitHtml.nothing;
    }
    maybeRenderAdStatus() {
        if (this.frame) {
            if (this.frame.adFrameType() === "root" /* Root */) {
                return LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.adStatus)}</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} title=${i18nString(UIStrings.thisFrameHasBeenIdentifiedAsThe)}>${i18nString(UIStrings.root)}</${ReportView.ReportView.ReportValue.litTagName}>
        `;
            }
            if (this.frame.adFrameType() === "child" /* Child */) {
                return LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.adStatus)}</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} title=${i18nString(UIStrings.thisFrameHasBeenIdentifiedAsTheA)}>${i18nString(UIStrings.child)}</${ReportView.ReportView.ReportValue.litTagName}>
        `;
            }
        }
        return LitHtml.nothing;
    }
    renderIsolationSection() {
        if (!this.frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.securityIsolation)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.secureContext)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        ${this.frame.isSecureContext() ? i18nString(UIStrings.yes) : i18nString(UIStrings.no)}\xA0${this.maybeRenderSecureContextExplanation()}
      </${ReportView.ReportView.ReportValue.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.crossoriginIsolated)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        ${this.frame.isCrossOriginIsolated() ? i18nString(UIStrings.yes) : i18nString(UIStrings.no)}
      </${ReportView.ReportView.ReportValue.litTagName}>
      ${LitHtml.Directives.until(this.maybeRenderCoopCoepStatus(), LitHtml.nothing)}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    maybeRenderSecureContextExplanation() {
        const explanation = this.getSecureContextExplanation();
        if (explanation) {
            return LitHtml.html `<span class="inline-comment">${explanation}</span>`;
        }
        return LitHtml.nothing;
    }
    getSecureContextExplanation() {
        switch (this.frame?.getSecureContextType()) {
            case "Secure" /* Secure */:
                return null;
            case "SecureLocalhost" /* SecureLocalhost */:
                return i18nString(UIStrings.localhostIsAlwaysASecureContext);
            case "InsecureAncestor" /* InsecureAncestor */:
                return i18nString(UIStrings.aFrameAncestorIsAnInsecure);
            case "InsecureScheme" /* InsecureScheme */:
                return i18nString(UIStrings.theFramesSchemeIsInsecure);
        }
        return null;
    }
    async maybeRenderCoopCoepStatus() {
        if (this.frame) {
            const model = this.frame.resourceTreeModel().target().model(SDK.NetworkManager.NetworkManager);
            const info = model && await model.getSecurityIsolationStatus(this.frame.id);
            if (info) {
                return LitHtml.html `
          ${this.maybeRenderCrossOriginStatus(info.coep, i18nString(UIStrings.crossoriginEmbedderPolicy), "None" /* None */)}
          ${this.maybeRenderCrossOriginStatus(info.coop, i18nString(UIStrings.crossoriginOpenerPolicy), "UnsafeNone" /* UnsafeNone */)}
        `;
            }
        }
        return LitHtml.nothing;
    }
    maybeRenderCrossOriginStatus(info, policyName, noneValue) {
        if (!info) {
            return LitHtml.nothing;
        }
        const isEnabled = info.value !== noneValue;
        const isReportOnly = (!isEnabled && info.reportOnlyValue !== noneValue);
        const endpoint = isEnabled ? info.reportingEndpoint : info.reportOnlyReportingEndpoint;
        return LitHtml.html `
      <${ReportView.ReportView.ReportKey.litTagName}>${policyName}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        ${isEnabled ? info.value : info.reportOnlyValue}
        ${isReportOnly ? LitHtml.html `<span class="inline-comment">report-only</span>` : LitHtml.nothing}
        ${endpoint ? LitHtml.html `<span class="inline-name">${i18nString(UIStrings.reportingTo)}</span>${endpoint}` :
            LitHtml.nothing}
      </${ReportView.ReportView.ReportValue.litTagName}>
    `;
    }
    renderApiAvailabilitySection() {
        if (!this.frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.apiAvailability)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <div class="span-cols">
        ${i18nString(UIStrings.availabilityOfCertainApisDepends)}
        <x-link href="https://web.dev/why-coop-coep/" class="link">${i18nString(UIStrings.learnMore)}</x-link>
      </div>
      ${this.renderSharedArrayBufferAvailability()}
      ${this.renderMeasureMemoryAvailability()}
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
    renderSharedArrayBufferAvailability() {
        if (this.frame) {
            const features = this.frame.getGatedAPIFeatures();
            if (features) {
                const sabAvailable = features.includes("SharedArrayBuffers" /* SharedArrayBuffers */);
                const sabTransferAvailable = sabAvailable && features.includes("SharedArrayBuffersTransferAllowed" /* SharedArrayBuffersTransferAllowed */);
                const availabilityText = sabTransferAvailable ?
                    i18nString(UIStrings.availableTransferable) :
                    (sabAvailable ? i18nString(UIStrings.availableNotTransferable) : i18nString(UIStrings.unavailable));
                const tooltipText = sabTransferAvailable ?
                    i18nString(UIStrings.sharedarraybufferConstructorIs) :
                    (sabAvailable ? i18nString(UIStrings.sharedarraybufferConstructorIsAvailable) : '');
                function renderHint(frame) {
                    switch (frame.getCrossOriginIsolatedContextType()) {
                        case "Isolated" /* Isolated */:
                            return LitHtml.nothing;
                        case "NotIsolated" /* NotIsolated */:
                            if (sabAvailable) {
                                return LitHtml.html `<span class="inline-comment">${i18nString(UIStrings.willRequireCrossoriginIsolated)}</span>`;
                            }
                            return LitHtml.html `<span class="inline-comment">${i18nString(UIStrings.requiresCrossoriginIsolated)}</span>`;
                        case "NotIsolatedFeatureDisabled" /* NotIsolatedFeatureDisabled */:
                            if (!sabTransferAvailable) {
                                return LitHtml.html `<span class="inline-comment">${i18nString(UIStrings
                                    .transferRequiresCrossoriginIsolatedPermission)} <code>cross-origin-isolated</code></span>`;
                            }
                            break;
                    }
                    return LitHtml.nothing;
                }
                // SharedArrayBuffer is an API name, so we don't translate it.
                return LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>SharedArrayBuffers</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} title=${tooltipText}>
            ${availabilityText}
            ${renderHint(this.frame)}
          </${ReportView.ReportView.ReportValue.litTagName}>
        `;
            }
        }
        return LitHtml.nothing;
    }
    renderMeasureMemoryAvailability() {
        if (this.frame) {
            const measureMemoryAvailable = this.frame.isCrossOriginIsolated();
            const availabilityText = measureMemoryAvailable ? i18nString(UIStrings.available) : i18nString(UIStrings.unavailable);
            const tooltipText = measureMemoryAvailable ? i18nString(UIStrings.thePerformanceAPI) :
                i18nString(UIStrings.thePerformancemeasureuseragentspecificmemory);
            return LitHtml.html `
        <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.measureMemory)}</${ReportView.ReportView.ReportKey.litTagName}>
        <${ReportView.ReportView.ReportValue.litTagName}>
          <span title=${tooltipText}>${availabilityText}</span>\xA0<x-link class="link" href="https://web.dev/monitor-total-page-memory-usage/">${i18nString(UIStrings.learnMore)}</x-link>
        </${ReportView.ReportView.ReportValue.litTagName}>
      `;
        }
        return LitHtml.nothing;
    }
    renderAdditionalInfoSection() {
        if (!this.frame) {
            return LitHtml.nothing;
        }
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}
        title=${i18nString(UIStrings.thisAdditionalDebugging)}
      >${i18nString(UIStrings.additionalInformation)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportKey.litTagName}>${i18nString(UIStrings.frameId)}</${ReportView.ReportView.ReportKey.litTagName}>
      <${ReportView.ReportView.ReportValue.litTagName}>
        <div class="text-ellipsis" title=${this.frame.id}>${this.frame.id}</div>
      </${ReportView.ReportView.ReportValue.litTagName}>
      <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
    `;
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-resources-frame-details-view', FrameDetailsReportView);
//# sourceMappingURL=FrameDetailsView.js.map