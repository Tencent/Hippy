// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Network from '../network/network.js';
import { Events, SecurityModel, SecurityStyleExplanation, SummaryMessages } from './SecurityModel.js';
const UIStrings = {
    /**
    *@description Title text content in Security Panel of the Security panel
    */
    overview: 'Overview',
    /**
    *@description Text in Security Panel of the Security panel
    */
    mainOrigin: 'Main origin',
    /**
    *@description Text in Security Panel of the Security panel
    */
    nonsecureOrigins: 'Non-secure origins',
    /**
    *@description Text in Security Panel of the Security panel
    */
    secureOrigins: 'Secure origins',
    /**
    *@description Text in Security Panel of the Security panel
    */
    unknownCanceled: 'Unknown / canceled',
    /**
    *@description Text in Security Panel of the Security panel
    */
    reloadToViewDetails: 'Reload to view details',
    /**
    *@description New parent title in Security Panel of the Security panel
    */
    mainOriginSecure: 'Main origin (secure)',
    /**
    *@description New parent title in Security Panel of the Security panel
    */
    mainOriginNonsecure: 'Main origin (non-secure)',
    /**
    *@description Summary div text content in Security Panel of the Security panel
    */
    securityOverview: 'Security overview',
    /**
    *@description Text to show something is secure
    */
    secure: 'Secure',
    /**
    *@description Sdk console message message level info of level Labels in Console View of the Console panel
    */
    info: 'Info',
    /**
    *@description Not secure div text content in Security Panel of the Security panel
    */
    notSecure: 'Not secure',
    /**
    *@description Text to view a security certificate
    */
    viewCertificate: 'View certificate',
    /**
    *@description Text in Security Panel of the Security panel
    */
    theSecurityOfThisPageIsUnknown: 'The security of this page is unknown.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    thisPageIsNotSecure: 'This page is not secure.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    thisPageIsSecureValidHttps: 'This page is secure (valid HTTPS).',
    /**
    *@description Text in Security Panel of the Security panel
    */
    thisPageIsNotSecureBrokenHttps: 'This page is not secure (broken HTTPS).',
    /**
    *@description Text in Security Panel of the Security panel
    */
    notSecureBroken: 'Not secure (broken)',
    /**
    *@description Main summary for page when it has been deemed unsafe by the SafeBrowsing service.
    */
    thisPageIsDangerousFlaggedBy: 'This page is dangerous (flagged by Google Safe Browsing).',
    /**
    *@description Summary phrase for a security problem where the site is deemed unsafe by the SafeBrowsing service.
    */
    flaggedByGoogleSafeBrowsing: 'Flagged by Google Safe Browsing',
    /**
    *@description Description of a security problem where the site is deemed unsafe by the SafeBrowsing service.
    */
    toCheckThisPagesStatusVisit: 'To check this page\'s status, visit g.co/safebrowsingstatus.',
    /**
    *@description Main summary for a non cert error page.
    */
    thisIsAnErrorPage: 'This is an error page.',
    /**
    *@description Main summary for where the site is non-secure HTTP.
    */
    thisPageIsInsecureUnencrypted: 'This page is insecure (unencrypted HTTP).',
    /**
    *@description Main summary for where the site has a non-cryptographic secure origin.
    */
    thisPageHasANonhttpsSecureOrigin: 'This page has a non-HTTPS secure origin.',
    /**
    *@description Message to display in devtools security tab when the page you are on triggered a safety tip.
    */
    thisPageIsSuspicious: 'This page is suspicious',
    /**
    *@description Body of message to display in devtools security tab when you are viewing a page that triggered a safety tip.
    */
    chromeHasDeterminedThatThisSiteS: 'Chrome has determined that this site could be fake or fraudulent.',
    /**
    *@description Second part of the body of message to display in devtools security tab when you are viewing a page that triggered a safety tip.
    */
    ifYouBelieveThisIsShownIn: 'If you believe this is shown in error please visit https://bugs.chromium.org/p/chromium/issues/entry?template=Safety+Tips+Appeals.',
    /**
    *@description Summary of a warning when the user visits a page that triggered a Safety Tip because the domain looked like another domain.
    */
    possibleSpoofingUrl: 'Possible spoofing URL',
    /**
    *@description Body of a warning when the user visits a page that triggered a Safety Tip because the domain looked like another domain.
    *@example {wikipedia.org} PH1
    */
    thisSitesHostnameLooksSimilarToP: 'This site\'s hostname looks similar to {PH1}. Attackers sometimes mimic sites by making small, hard-to-see changes to the domain name.',
    /**
    *@description second part of body of a warning when the user visits a page that triggered a Safety Tip because the domain looked like another domain.
    */
    ifYouBelieveThisIsShownInErrorSafety: 'If you believe this is shown in error please visit https://bugs.chromium.org/p/chromium/issues/entry?template=Safety+Tips+Appeals.',
    /**
    *@description Title of the devtools security tab when the page you are on triggered a safety tip.
    */
    thisPageIsSuspiciousFlaggedBy: 'This page is suspicious (flagged by Chrome).',
    /**
    *@description Text for a security certificate
    */
    certificate: 'Certificate',
    /**
    *@description Summary phrase for a security problem where the site's certificate chain contains a SHA1 signature.
    */
    insecureSha: 'insecure (SHA-1)',
    /**
    *@description Description of a security problem where the site's certificate chain contains a SHA1 signature.
    */
    theCertificateChainForThisSite: 'The certificate chain for this site contains a certificate signed using SHA-1.',
    /**
    *@description Summary phrase for a security problem where the site's certificate is missing a subjectAltName extension.
    */
    subjectAlternativeNameMissing: '`Subject Alternative Name` missing',
    /**
    *@description Description of a security problem where the site's certificate is missing a subjectAltName extension.
    */
    theCertificateForThisSiteDoesNot: 'The certificate for this site does not contain a `Subject Alternative Name` extension containing a domain name or IP address.',
    /**
    *@description Summary phrase for a security problem with the site's certificate.
    */
    missing: 'missing',
    /**
    *@description Description of a security problem with the site's certificate.
    *@example {net::ERR_CERT_AUTHORITY_INVALID} PH1
    */
    thisSiteIsMissingAValidTrusted: 'This site is missing a valid, trusted certificate ({PH1}).',
    /**
    *@description Summary phrase for a site that has a valid server certificate.
    */
    validAndTrusted: 'valid and trusted',
    /**
    *@description Description of a site that has a valid server certificate.
    *@example {Let's Encrypt Authority X3} PH1
    */
    theConnectionToThisSiteIsUsingA: 'The connection to this site is using a valid, trusted server certificate issued by {PH1}.',
    /**
    *@description Summary phrase for a security state where Private Key Pinning is ignored because the certificate chains to a locally-trusted root.
    */
    publickeypinningBypassed: 'Public-Key-Pinning bypassed',
    /**
    *@description Description of a security state where Private Key Pinning is ignored because the certificate chains to a locally-trusted root.
    */
    publickeypinningWasBypassedByA: 'Public-Key-Pinning was bypassed by a local root certificate.',
    /**
    *@description Summary phrase for a site with a certificate that is expiring soon.
    */
    certificateExpiresSoon: 'Certificate expires soon',
    /**
    *@description Description for a site with a certificate that is expiring soon.
    */
    theCertificateForThisSiteExpires: 'The certificate for this site expires in less than 48 hours and needs to be renewed.',
    /**
    *@description Text that refers to the network connection
    */
    connection: 'Connection',
    /**
    *@description Summary phrase for a site that uses a modern, secure TLS protocol and cipher.
    */
    secureConnectionSettings: 'secure connection settings',
    /**
    *@description Description of a site's TLS settings.
    *@example {TLS 1.2} PH1
    *@example {ECDHE_RSA} PH2
    *@example {AES_128_GCM} PH3
    */
    theConnectionToThisSiteIs: 'The connection to this site is encrypted and authenticated using {PH1}, {PH2}, and {PH3}.',
    /**
    *@description A recommendation to the site owner to use a modern TLS protocol
    *@example {TLS 1.0} PH1
    */
    sIsObsoleteEnableTlsOrLater: '{PH1} is obsolete. Enable TLS 1.2 or later.',
    /**
    *@description A recommendation to the site owner to use a modern TLS key exchange
    */
    rsaKeyExchangeIsObsoleteEnableAn: 'RSA key exchange is obsolete. Enable an ECDHE-based cipher suite.',
    /**
    *@description A recommendation to the site owner to use a modern TLS cipher
    *@example {3DES_EDE_CBC} PH1
    */
    sIsObsoleteEnableAnAesgcmbased: '{PH1} is obsolete. Enable an AES-GCM-based cipher suite.',
    /**
    *@description A recommendation to the site owner to use a modern TLS server signature
    */
    theServerSignatureUsesShaWhichIs: 'The server signature uses SHA-1, which is obsolete. Enable a SHA-2 signature algorithm instead. (Note this is different from the signature in the certificate.)',
    /**
    *@description Summary phrase for a site that uses an outdated SSL settings (protocol, key exchange, or cipher).
    */
    obsoleteConnectionSettings: 'obsolete connection settings',
    /**
    *@description A title of the 'Resources' action category
    */
    resources: 'Resources',
    /**
    *@description Summary for page when there is active mixed content
    */
    activeMixedContent: 'active mixed content',
    /**
    *@description Description for page when there is active mixed content
    */
    youHaveRecentlyAllowedNonsecure: 'You have recently allowed non-secure content (such as scripts or iframes) to run on this site.',
    /**
    *@description Summary for page when there is mixed content
    */
    mixedContent: 'mixed content',
    /**
    *@description Description for page when there is mixed content
    */
    thisPageIncludesHttpResources: 'This page includes HTTP resources.',
    /**
    *@description Summary for page when there is a non-secure form
    */
    nonsecureForm: 'non-secure form',
    /**
    *@description Description for page when there is a non-secure form
    */
    thisPageIncludesAFormWithA: 'This page includes a form with a non-secure "action" attribute.',
    /**
    *@description Summary for the page when it contains active content with certificate error
    */
    activeContentWithCertificate: 'active content with certificate errors',
    /**
    *@description Description for the page when it contains active content with certificate error
    */
    youHaveRecentlyAllowedContent: 'You have recently allowed content loaded with certificate errors (such as scripts or iframes) to run on this site.',
    /**
    *@description Summary for page when there is active content with certificate errors
    */
    contentWithCertificateErrors: 'content with certificate errors',
    /**
    *@description Description for page when there is content with certificate errors
    */
    thisPageIncludesResourcesThat: 'This page includes resources that were loaded with certificate errors.',
    /**
    *@description Summary for page when all resources are served securely
    */
    allServedSecurely: 'all served securely',
    /**
    *@description Description for page when all resources are served securely
    */
    allResourcesOnThisPageAreServed: 'All resources on this page are served securely.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    blockedMixedContent: 'Blocked mixed content',
    /**
    *@description Text in Security Panel of the Security panel
    */
    yourPageRequestedNonsecure: 'Your page requested non-secure resources that were blocked.',
    /**
    *@description Refresh prompt text content in Security Panel of the Security panel
    */
    reloadThePageToRecordRequestsFor: 'Reload the page to record requests for HTTP resources.',
    /**
    * @description Link text in the Security Panel. Clicking the link navigates the user to the
    * Network panel. Requests refers to network requests. Each request is a piece of data transmitted
    * from the current user's browser to a remote server.
    */
    viewDRequestsInNetworkPanel: '{n, plural, =1 {View # request in Network Panel} other {View # requests in Network Panel}}',
    /**
    *@description Text for the origin of something
    */
    origin: 'Origin',
    /**
    *@description Text in Security Panel of the Security panel
    */
    viewRequestsInNetworkPanel: 'View requests in Network Panel',
    /**
    *@description Text for security or network protocol
    */
    protocol: 'Protocol',
    /**
    *@description Text in Security Panel of the Security panel
    */
    keyExchange: 'Key exchange',
    /**
    *@description Text in Security Panel of the Security panel
    */
    keyExchangeGroup: 'Key exchange group',
    /**
    *@description Text in Security Panel of the Security panel
    */
    cipher: 'Cipher',
    /**
    *@description Sct div text content in Security Panel of the Security panel
    */
    certificateTransparency: 'Certificate Transparency',
    /**
    *@description Text that refers to the subject of a security certificate
    */
    subject: 'Subject',
    /**
    *@description Text to show since when an item is valid
    */
    validFrom: 'Valid from',
    /**
    *@description Text to indicate the expiry date
    */
    validUntil: 'Valid until',
    /**
    *@description Text for the issuer of an item
    */
    issuer: 'Issuer',
    /**
    *@description Text in Security Panel of the Security panel
    */
    openFullCertificateDetails: 'Open full certificate details',
    /**
    *@description Text in Security Panel of the Security panel
    */
    sct: 'SCT',
    /**
    *@description Text in Security Panel of the Security panel
    */
    logName: 'Log name',
    /**
    *@description Text in Security Panel of the Security panel
    */
    logId: 'Log ID',
    /**
    *@description Text in Security Panel of the Security panel
    */
    validationStatus: 'Validation status',
    /**
    *@description Text for the source of something
    */
    source: 'Source',
    /**
    * @description Label for a date/time string in the Security panel. It indicates the time at which
    * a security certificate was issued (created by an authority and distributed).
    */
    issuedAt: 'Issued at',
    /**
    *@description Text in Security Panel of the Security panel
    */
    hashAlgorithm: 'Hash algorithm',
    /**
    *@description Text in Security Panel of the Security panel
    */
    signatureAlgorithm: 'Signature algorithm',
    /**
    *@description Text in Security Panel of the Security panel
    */
    signatureData: 'Signature data',
    /**
    *@description Toggle scts details link text content in Security Panel of the Security panel
    */
    showFullDetails: 'Show full details',
    /**
    *@description Toggle scts details link text content in Security Panel of the Security panel
    */
    hideFullDetails: 'Hide full details',
    /**
    *@description Text in Security Panel of the Security panel
    */
    thisRequestCompliesWithChromes: 'This request complies with `Chrome`\'s Certificate Transparency policy.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    thisRequestDoesNotComplyWith: 'This request does not comply with `Chrome`\'s Certificate Transparency policy.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    thisResponseWasLoadedFromCache: 'This response was loaded from cache. Some security details might be missing.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    theSecurityDetailsAboveAreFrom: 'The security details above are from the first inspected response.',
    /**
    *@description Main summary for where the site has a non-cryptographic secure origin.
    */
    thisOriginIsANonhttpsSecure: 'This origin is a non-HTTPS secure origin.',
    /**
    *@description Text in Security Panel of the Security panel
    */
    yourConnectionToThisOriginIsNot: 'Your connection to this origin is not secure.',
    /**
    *@description No info div text content in Security Panel of the Security panel
    */
    noSecurityInformation: 'No security information',
    /**
    *@description Text in Security Panel of the Security panel
    */
    noSecurityDetailsAreAvailableFor: 'No security details are available for this origin.',
    /**
    *@description San div text content in Security Panel of the Security panel
    */
    na: '(n/a)',
    /**
    *@description Text to show less content
    */
    showLess: 'Show less',
    /**
    *@description Truncated santoggle text content in Security Panel of the Security panel
    *@example {2} PH1
    */
    showMoreSTotal: 'Show more ({PH1} total)',
};
const str_ = i18n.i18n.registerUIStrings('panels/security/SecurityPanel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let securityPanelInstance;
export class SecurityPanel extends UI.Panel.PanelWithSidebar {
    _mainView;
    _sidebarMainViewElement;
    _sidebarTree;
    _lastResponseReceivedForLoaderId;
    _origins;
    _filterRequestCounts;
    _visibleView;
    _eventListeners;
    _securityModel;
    constructor() {
        super('security');
        this._mainView = new SecurityMainView(this);
        const title = document.createElement('span');
        title.classList.add('title');
        title.textContent = i18nString(UIStrings.overview);
        this._sidebarMainViewElement = new SecurityPanelSidebarTreeElement(title, this._setVisibleView.bind(this, this._mainView), 'security-main-view-sidebar-tree-item', 'lock-icon');
        this._sidebarMainViewElement.tooltip = title.textContent;
        this._sidebarTree = new SecurityPanelSidebarTree(this._sidebarMainViewElement, this.showOrigin.bind(this));
        this.panelSidebarElement().appendChild(this._sidebarTree.element);
        this._lastResponseReceivedForLoaderId = new Map();
        this._origins = new Map();
        this._filterRequestCounts = new Map();
        SDK.TargetManager.TargetManager.instance().observeModels(SecurityModel, this);
        this._visibleView = null;
        this._eventListeners = [];
        this._securityModel = null;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!securityPanelInstance || forceNew) {
            securityPanelInstance = new SecurityPanel();
        }
        return securityPanelInstance;
    }
    static _instance() {
        return SecurityPanel.instance();
    }
    static createCertificateViewerButtonForOrigin(text, origin) {
        const certificateButton = UI.UIUtils.createTextButton(text, async (e) => {
            e.consume();
            const names = await SDK.NetworkManager.MultitargetNetworkManager.instance().getCertificate(origin);
            if (names.length > 0) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.showCertificateViewer(names);
            }
        }, 'origin-button');
        UI.ARIAUtils.markAsButton(certificateButton);
        return certificateButton;
    }
    static createCertificateViewerButtonForCert(text, names) {
        const certificateButton = UI.UIUtils.createTextButton(text, e => {
            e.consume();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.showCertificateViewer(names);
        }, 'origin-button');
        UI.ARIAUtils.markAsButton(certificateButton);
        return certificateButton;
    }
    static createHighlightedUrl(url, securityState) {
        const schemeSeparator = '://';
        const index = url.indexOf(schemeSeparator);
        // If the separator is not found, just display the text without highlighting.
        if (index === -1) {
            const text = document.createElement('span');
            text.textContent = url;
            return text;
        }
        const highlightedUrl = document.createElement('span');
        const scheme = url.substr(0, index);
        const content = url.substr(index + schemeSeparator.length);
        highlightedUrl.createChild('span', 'url-scheme-' + securityState).textContent = scheme;
        highlightedUrl.createChild('span', 'url-scheme-separator').textContent = schemeSeparator;
        highlightedUrl.createChild('span').textContent = content;
        return highlightedUrl;
    }
    _updateSecurityState(newSecurityState, explanations, summary) {
        this._sidebarMainViewElement.setSecurityState(newSecurityState);
        this._mainView.updateSecurityState(newSecurityState, explanations, summary);
    }
    _onSecurityStateChanged(event) {
        const data = event.data;
        const securityState = data.securityState;
        const explanations = data.explanations;
        const summary = data.summary;
        this._updateSecurityState(securityState, explanations, summary);
    }
    _updateVisibleSecurityState(visibleSecurityState) {
        this._sidebarMainViewElement.setSecurityState(visibleSecurityState.securityState);
        this._mainView.updateVisibleSecurityState(visibleSecurityState);
    }
    _onVisibleSecurityStateChanged(event) {
        const data = event.data;
        this._updateVisibleSecurityState(data);
    }
    selectAndSwitchToMainView() {
        // The sidebar element will trigger displaying the main view. Rather than making a redundant call to display the main view, we rely on this.
        this._sidebarMainViewElement.select(true);
    }
    showOrigin(origin) {
        const originState = this._origins.get(origin);
        if (!originState) {
            return;
        }
        if (!originState.originView) {
            originState.originView = new SecurityOriginView(this, origin, originState);
        }
        this._setVisibleView(originState.originView);
    }
    wasShown() {
        super.wasShown();
        if (!this._visibleView) {
            this.selectAndSwitchToMainView();
        }
    }
    focus() {
        this._sidebarTree.focus();
    }
    _setVisibleView(view) {
        if (this._visibleView === view) {
            return;
        }
        if (this._visibleView) {
            this._visibleView.detach();
        }
        this._visibleView = view;
        if (view) {
            this.splitWidget().setMainWidget(view);
        }
    }
    _onResponseReceived(event) {
        const request = event.data.request;
        if (request.resourceType() === Common.ResourceType.resourceTypes.Document) {
            this._lastResponseReceivedForLoaderId.set(request.loaderId, request);
        }
    }
    _processRequest(request) {
        const origin = Common.ParsedURL.ParsedURL.extractOrigin(request.url());
        if (!origin) {
            // We don't handle resources like data: URIs. Most of them don't affect the lock icon.
            return;
        }
        let securityState = request.securityState();
        if (request.mixedContentType === "blockable" /* Blockable */ ||
            request.mixedContentType === "optionally-blockable" /* OptionallyBlockable */) {
            securityState = "insecure" /* Insecure */;
        }
        const originState = this._origins.get(origin);
        if (originState) {
            const oldSecurityState = originState.securityState;
            originState.securityState = this._securityStateMin(oldSecurityState, securityState);
            if (oldSecurityState !== originState.securityState) {
                const securityDetails = request.securityDetails();
                if (securityDetails) {
                    originState.securityDetails = securityDetails;
                }
                this._sidebarTree.updateOrigin(origin, securityState);
                if (originState.originView) {
                    originState.originView.setSecurityState(securityState);
                }
            }
        }
        else {
            // This stores the first security details we see for an origin, but we should
            // eventually store a (deduplicated) list of all the different security
            // details we have seen. https://crbug.com/503170
            const newOriginState = {
                securityState,
                securityDetails: request.securityDetails(),
                loadedFromCache: request.cached(),
                originView: undefined,
            };
            this._origins.set(origin, newOriginState);
            this._sidebarTree.addOrigin(origin, securityState);
            // Don't construct the origin view yet (let it happen lazily).
        }
    }
    _onRequestFinished(event) {
        const request = event.data;
        this._updateFilterRequestCounts(request);
        this._processRequest(request);
    }
    _updateFilterRequestCounts(request) {
        if (request.mixedContentType === "none" /* None */) {
            return;
        }
        let filterKey = Network.NetworkLogView.MixedContentFilterValues.All;
        if (request.wasBlocked()) {
            filterKey = Network.NetworkLogView.MixedContentFilterValues.Blocked;
        }
        else if (request.mixedContentType === "blockable" /* Blockable */) {
            filterKey = Network.NetworkLogView.MixedContentFilterValues.BlockOverridden;
        }
        else if (request.mixedContentType === "optionally-blockable" /* OptionallyBlockable */) {
            filterKey = Network.NetworkLogView.MixedContentFilterValues.Displayed;
        }
        const currentCount = this._filterRequestCounts.get(filterKey);
        if (!currentCount) {
            this._filterRequestCounts.set(filterKey, 1);
        }
        else {
            this._filterRequestCounts.set(filterKey, currentCount + 1);
        }
        this._mainView.refreshExplanations();
    }
    filterRequestCount(filterKey) {
        return this._filterRequestCounts.get(filterKey) || 0;
    }
    _securityStateMin(stateA, stateB) {
        return SecurityModel.SecurityStateComparator(stateA, stateB) < 0 ? stateA : stateB;
    }
    modelAdded(securityModel) {
        if (this._securityModel) {
            return;
        }
        this._securityModel = securityModel;
        const resourceTreeModel = securityModel.resourceTreeModel();
        const networkManager = securityModel.networkManager();
        this._eventListeners = [
            securityModel.addEventListener(Events.VisibleSecurityStateChanged, this._onVisibleSecurityStateChanged, this),
            resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.MainFrameNavigated, this._onMainFrameNavigated, this),
            resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.InterstitialShown, this._onInterstitialShown, this),
            resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.InterstitialHidden, this._onInterstitialHidden, this),
            networkManager.addEventListener(SDK.NetworkManager.Events.ResponseReceived, this._onResponseReceived, this),
            networkManager.addEventListener(SDK.NetworkManager.Events.RequestFinished, this._onRequestFinished, this),
        ];
        if (resourceTreeModel.isInterstitialShowing()) {
            this._onInterstitialShown();
        }
    }
    modelRemoved(securityModel) {
        if (this._securityModel !== securityModel) {
            return;
        }
        this._securityModel = null;
        Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners);
    }
    _onMainFrameNavigated(event) {
        const frame = event.data;
        const request = this._lastResponseReceivedForLoaderId.get(frame.loaderId);
        this.selectAndSwitchToMainView();
        this._sidebarTree.clearOrigins();
        this._origins.clear();
        this._lastResponseReceivedForLoaderId.clear();
        this._filterRequestCounts.clear();
        // After clearing the filtered request counts, refresh the
        // explanations to reflect the new counts.
        this._mainView.refreshExplanations();
        // If we could not find a matching request (as in the case of clicking
        // through an interstitial, see https://crbug.com/669309), set the origin
        // based upon the url data from the MainFrameNavigated event itself.
        const origin = Common.ParsedURL.ParsedURL.extractOrigin(request ? request.url() : frame.url);
        this._sidebarTree.setMainOrigin(origin);
        if (request) {
            this._processRequest(request);
        }
    }
    _onInterstitialShown() {
        // The panel might have been displaying the origin view on the
        // previously loaded page. When showing an interstitial, switch
        // back to the Overview view.
        this.selectAndSwitchToMainView();
        this._sidebarTree.toggleOriginsList(true /* hidden */);
    }
    _onInterstitialHidden() {
        this._sidebarTree.toggleOriginsList(false /* hidden */);
    }
}
export class SecurityPanelSidebarTree extends UI.TreeOutline.TreeOutlineInShadow {
    _showOriginInPanel;
    _mainOrigin;
    _originGroupTitles;
    _originGroups;
    _elementsByOrigin;
    constructor(mainViewElement, showOriginInPanel) {
        super();
        this.registerRequiredCSS('panels/security/sidebar.css', { enableLegacyPatching: false });
        this.registerRequiredCSS('panels/security/lockIcon.css', { enableLegacyPatching: false });
        this.appendChild(mainViewElement);
        this._showOriginInPanel = showOriginInPanel;
        this._mainOrigin = null;
        this._originGroupTitles = new Map([
            [OriginGroup.MainOrigin, i18nString(UIStrings.mainOrigin)],
            [OriginGroup.NonSecure, i18nString(UIStrings.nonsecureOrigins)],
            [OriginGroup.Secure, i18nString(UIStrings.secureOrigins)],
            [OriginGroup.Unknown, i18nString(UIStrings.unknownCanceled)],
        ]);
        this._originGroups = new Map();
        for (const group of Object.values(OriginGroup)) {
            const element = this._createOriginGroupElement(this._originGroupTitles.get(group));
            this._originGroups.set(group, element);
            this.appendChild(element);
        }
        this._clearOriginGroups();
        // This message will be removed by clearOrigins() during the first new page load after the panel was opened.
        const mainViewReloadMessage = new UI.TreeOutline.TreeElement(i18nString(UIStrings.reloadToViewDetails));
        mainViewReloadMessage.selectable = false;
        mainViewReloadMessage.listItemElement.classList.add('security-main-view-reload-message');
        const treeElement = this._originGroups.get(OriginGroup.MainOrigin);
        treeElement.appendChild(mainViewReloadMessage);
        this._elementsByOrigin = new Map();
    }
    _originGroupTitle(originGroup) {
        return /** @type {string} */ this._originGroupTitles.get(originGroup);
    }
    _originGroupElement(originGroup) {
        return /** @type {!UI.TreeOutline.TreeElement} */ this._originGroups.get(originGroup);
    }
    _createOriginGroupElement(originGroupTitle) {
        const originGroup = new UI.TreeOutline.TreeElement(originGroupTitle, true);
        originGroup.selectable = false;
        originGroup.setCollapsible(false);
        originGroup.expand();
        originGroup.listItemElement.classList.add('security-sidebar-origins');
        UI.ARIAUtils.setAccessibleName(originGroup.childrenListElement, originGroupTitle);
        return originGroup;
    }
    toggleOriginsList(hidden) {
        for (const element of this._originGroups.values()) {
            element.hidden = hidden;
        }
    }
    addOrigin(origin, securityState) {
        const originElement = new SecurityPanelSidebarTreeElement(SecurityPanel.createHighlightedUrl(origin, securityState), this._showOriginInPanel.bind(this, origin), 'security-sidebar-tree-item', 'security-property');
        originElement.tooltip = origin;
        this._elementsByOrigin.set(origin, originElement);
        this.updateOrigin(origin, securityState);
    }
    setMainOrigin(origin) {
        this._mainOrigin = origin;
    }
    updateOrigin(origin, securityState) {
        const originElement = this._elementsByOrigin.get(origin);
        originElement.setSecurityState(securityState);
        let newParent;
        if (origin === this._mainOrigin) {
            newParent = this._originGroups.get(OriginGroup.MainOrigin);
            if (securityState === "secure" /* Secure */) {
                newParent.title = i18nString(UIStrings.mainOriginSecure);
            }
            else {
                newParent.title = i18nString(UIStrings.mainOriginNonsecure);
            }
            UI.ARIAUtils.setAccessibleName(newParent.childrenListElement, newParent.title);
        }
        else {
            switch (securityState) {
                case "secure" /* Secure */:
                    newParent = this._originGroupElement(OriginGroup.Secure);
                    break;
                case "unknown" /* Unknown */:
                    newParent = this._originGroupElement(OriginGroup.Unknown);
                    break;
                default:
                    newParent = this._originGroupElement(OriginGroup.NonSecure);
                    break;
            }
        }
        const oldParent = originElement.parent;
        if (oldParent !== newParent) {
            if (oldParent) {
                oldParent.removeChild(originElement);
                if (oldParent.childCount() === 0) {
                    oldParent.hidden = true;
                }
            }
            newParent.appendChild(originElement);
            newParent.hidden = false;
        }
    }
    _clearOriginGroups() {
        for (const originGroup of this._originGroups.values()) {
            originGroup.removeChildren();
            originGroup.hidden = true;
        }
        const mainOrigin = this._originGroupElement(OriginGroup.MainOrigin);
        mainOrigin.title = this._originGroupTitle(OriginGroup.MainOrigin);
        mainOrigin.hidden = false;
    }
    clearOrigins() {
        this._clearOriginGroups();
        this._elementsByOrigin.clear();
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var OriginGroup;
(function (OriginGroup) {
    OriginGroup["MainOrigin"] = "MainOrigin";
    OriginGroup["NonSecure"] = "NonSecure";
    OriginGroup["Secure"] = "Secure";
    OriginGroup["Unknown"] = "Unknown";
})(OriginGroup || (OriginGroup = {}));
export class SecurityPanelSidebarTreeElement extends UI.TreeOutline.TreeElement {
    _selectCallback;
    _cssPrefix;
    _iconElement;
    _securityState;
    constructor(textElement, selectCallback, className, cssPrefix) {
        super('', false);
        this._selectCallback = selectCallback;
        this._cssPrefix = cssPrefix;
        this.listItemElement.classList.add(className);
        this._iconElement = this.listItemElement.createChild('div', 'icon');
        this._iconElement.classList.add(this._cssPrefix);
        this.listItemElement.appendChild(textElement);
        this._securityState = null;
        this.setSecurityState("unknown" /* Unknown */);
    }
    setSecurityState(newSecurityState) {
        if (this._securityState) {
            this._iconElement.classList.remove(this._cssPrefix + '-' + this._securityState);
        }
        this._securityState = newSecurityState;
        this._iconElement.classList.add(this._cssPrefix + '-' + newSecurityState);
    }
    securityState() {
        return this._securityState;
    }
    onselect() {
        this._selectCallback();
        return true;
    }
}
export class SecurityMainView extends UI.Widget.VBox {
    _panel;
    _summarySection;
    _securityExplanationsMain;
    _securityExplanationsExtra;
    _lockSpectrum;
    _summaryText;
    _explanations;
    _securityState;
    constructor(panel) {
        super(true);
        this.registerRequiredCSS('panels/security/mainView.css', { enableLegacyPatching: false });
        this.registerRequiredCSS('panels/security/lockIcon.css', { enableLegacyPatching: false });
        this.setMinimumSize(200, 100);
        this.contentElement.classList.add('security-main-view');
        this._panel = panel;
        this._summarySection = this.contentElement.createChild('div', 'security-summary');
        // Info explanations should appear after all others.
        this._securityExplanationsMain =
            this.contentElement.createChild('div', 'security-explanation-list security-explanations-main');
        this._securityExplanationsExtra =
            this.contentElement.createChild('div', 'security-explanation-list security-explanations-extra');
        // Fill the security summary section.
        const summaryDiv = this._summarySection.createChild('div', 'security-summary-section-title');
        summaryDiv.textContent = i18nString(UIStrings.securityOverview);
        UI.ARIAUtils.markAsHeading(summaryDiv, 1);
        const lockSpectrum = this._summarySection.createChild('div', 'lock-spectrum');
        this._lockSpectrum = new Map([
            ["secure" /* Secure */, lockSpectrum.createChild('div', 'lock-icon lock-icon-secure')],
            ["neutral" /* Neutral */, lockSpectrum.createChild('div', 'lock-icon lock-icon-neutral')],
            ["insecure" /* Insecure */, lockSpectrum.createChild('div', 'lock-icon lock-icon-insecure')],
        ]);
        UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("secure" /* Secure */), i18nString(UIStrings.secure));
        UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("neutral" /* Neutral */), i18nString(UIStrings.info));
        UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("insecure" /* Insecure */), i18nString(UIStrings.notSecure));
        this._summarySection.createChild('div', 'triangle-pointer-container')
            .createChild('div', 'triangle-pointer-wrapper')
            .createChild('div', 'triangle-pointer');
        this._summaryText = this._summarySection.createChild('div', 'security-summary-text');
        UI.ARIAUtils.markAsHeading(this._summaryText, 2);
        this._explanations = null;
        this._securityState = null;
    }
    getLockSpectrumDiv(securityState) {
        const element = this._lockSpectrum.get(securityState);
        if (!element) {
            throw new Error(`Invalid argument: ${securityState}`);
        }
        return element;
    }
    _addExplanation(parent, explanation) {
        const explanationSection = parent.createChild('div', 'security-explanation');
        explanationSection.classList.add('security-explanation-' + explanation.securityState);
        explanationSection.createChild('div', 'security-property')
            .classList.add('security-property-' + explanation.securityState);
        const text = explanationSection.createChild('div', 'security-explanation-text');
        const explanationHeader = text.createChild('div', 'security-explanation-title');
        if (explanation.title) {
            explanationHeader.createChild('span').textContent = explanation.title + ' - ';
            explanationHeader.createChild('span', 'security-explanation-title-' + explanation.securityState).textContent =
                explanation.summary;
        }
        else {
            explanationHeader.textContent = explanation.summary;
        }
        text.createChild('div').textContent = explanation.description;
        if (explanation.certificate.length) {
            text.appendChild(SecurityPanel.createCertificateViewerButtonForCert(i18nString(UIStrings.viewCertificate), explanation.certificate));
        }
        if (explanation.recommendations && explanation.recommendations.length) {
            const recommendationList = text.createChild('ul', 'security-explanation-recommendations');
            for (const recommendation of explanation.recommendations) {
                recommendationList.createChild('li').textContent = recommendation;
            }
        }
        return text;
    }
    updateSecurityState(newSecurityState, explanations, summary) {
        // Remove old state.
        // It's safe to call this even when this._securityState is undefined.
        this._summarySection.classList.remove('security-summary-' + this._securityState);
        // Add new state.
        this._securityState = newSecurityState;
        this._summarySection.classList.add('security-summary-' + this._securityState);
        const summaryExplanationStrings = new Map([
            ["unknown" /* Unknown */, i18nString(UIStrings.theSecurityOfThisPageIsUnknown)],
            ["insecure" /* Insecure */, i18nString(UIStrings.thisPageIsNotSecure)],
            ["neutral" /* Neutral */, i18nString(UIStrings.thisPageIsNotSecure)],
            ["secure" /* Secure */, i18nString(UIStrings.thisPageIsSecureValidHttps)],
            ["insecure-broken" /* InsecureBroken */, i18nString(UIStrings.thisPageIsNotSecureBrokenHttps)],
        ]);
        // Update the color and title of the triangle icon in the lock spectrum to
        // match the security state.
        if (this._securityState === "insecure" /* Insecure */) {
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.add('lock-icon-insecure');
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.remove('lock-icon-insecure-broken');
            UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("insecure" /* Insecure */), i18nString(UIStrings.notSecure));
        }
        else if (this._securityState === "insecure-broken" /* InsecureBroken */) {
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.add('lock-icon-insecure-broken');
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.remove('lock-icon-insecure');
            UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("insecure" /* Insecure */), i18nString(UIStrings.notSecureBroken));
        }
        // Use override summary if present, otherwise use base explanation
        this._summaryText.textContent = summary || summaryExplanationStrings.get(this._securityState) || '';
        this._explanations = explanations;
        this.refreshExplanations();
    }
    updateVisibleSecurityState(visibleSecurityState) {
        // Remove old state.
        // It's safe to call this even when this._securityState is undefined.
        this._summarySection.classList.remove('security-summary-' + this._securityState);
        // Add new state.
        this._securityState = visibleSecurityState.securityState;
        this._summarySection.classList.add('security-summary-' + this._securityState);
        // Update the color and title of the triangle icon in the lock spectrum to
        // match the security state.
        if (this._securityState === "insecure" /* Insecure */) {
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.add('lock-icon-insecure');
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.remove('lock-icon-insecure-broken');
            UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("insecure" /* Insecure */), i18nString(UIStrings.notSecure));
        }
        else if (this._securityState === "insecure-broken" /* InsecureBroken */) {
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.add('lock-icon-insecure-broken');
            this.getLockSpectrumDiv("insecure" /* Insecure */).classList.remove('lock-icon-insecure');
            UI.Tooltip.Tooltip.install(this.getLockSpectrumDiv("insecure" /* Insecure */), i18nString(UIStrings.notSecureBroken));
        }
        const { summary, explanations } = this._getSecuritySummaryAndExplanations(visibleSecurityState);
        // Use override summary if present, otherwise use base explanation
        this._summaryText.textContent = summary || SummaryMessages[this._securityState]();
        this._explanations = this._orderExplanations(explanations);
        this.refreshExplanations();
    }
    _getSecuritySummaryAndExplanations(visibleSecurityState) {
        const { securityState, securityStateIssueIds } = visibleSecurityState;
        let summary;
        const explanations = [];
        summary = this._explainSafetyTipSecurity(visibleSecurityState, summary, explanations);
        if (securityStateIssueIds.includes('malicious-content')) {
            summary = i18nString(UIStrings.thisPageIsDangerousFlaggedBy);
            // Always insert SafeBrowsing explanation at the front.
            explanations.unshift(new SecurityStyleExplanation("insecure" /* Insecure */, undefined, i18nString(UIStrings.flaggedByGoogleSafeBrowsing), i18nString(UIStrings.toCheckThisPagesStatusVisit)));
        }
        else if (securityStateIssueIds.includes('is-error-page') &&
            (visibleSecurityState.certificateSecurityState === null ||
                visibleSecurityState.certificateSecurityState.certificateNetworkError === null)) {
            summary = i18nString(UIStrings.thisIsAnErrorPage);
            // In the case of a non cert error page, we usually don't have a
            // certificate, connection, or content that needs to be explained, e.g. in
            // the case of a net error, so we can early return.
            return { summary, explanations };
        }
        else if (securityState === "insecure-broken" /* InsecureBroken */ &&
            securityStateIssueIds.includes('scheme-is-not-cryptographic')) {
            summary = summary || i18nString(UIStrings.thisPageIsInsecureUnencrypted);
        }
        if (securityStateIssueIds.includes('scheme-is-not-cryptographic')) {
            if (securityState === "neutral" /* Neutral */ &&
                !securityStateIssueIds.includes('insecure-origin')) {
                summary = i18nString(UIStrings.thisPageHasANonhttpsSecureOrigin);
            }
            return { summary, explanations };
        }
        this._explainCertificateSecurity(visibleSecurityState, explanations);
        this._explainConnectionSecurity(visibleSecurityState, explanations);
        this._explainContentSecurity(visibleSecurityState, explanations);
        return { summary, explanations };
    }
    _explainSafetyTipSecurity(visibleSecurityState, summary, explanations) {
        const { securityStateIssueIds, safetyTipInfo } = visibleSecurityState;
        const currentExplanations = [];
        if (securityStateIssueIds.includes('bad_reputation')) {
            const formatedDescription = `${i18nString(UIStrings.chromeHasDeterminedThatThisSiteS)}\n\n${i18nString(UIStrings.ifYouBelieveThisIsShownIn)}`;
            currentExplanations.push({
                summary: i18nString(UIStrings.thisPageIsSuspicious),
                description: formatedDescription,
            });
        }
        else if (securityStateIssueIds.includes('lookalike') && safetyTipInfo && safetyTipInfo.safeUrl) {
            const hostname = new URL(safetyTipInfo.safeUrl).hostname;
            const hostnamePlaceholder = { PH1: hostname };
            const formatedDescriptionSafety = `${i18nString(UIStrings.thisSitesHostnameLooksSimilarToP, hostnamePlaceholder)}\n\n${i18nString(UIStrings.ifYouBelieveThisIsShownInErrorSafety)}`;
            currentExplanations.push({ summary: i18nString(UIStrings.possibleSpoofingUrl), description: formatedDescriptionSafety });
        }
        if (currentExplanations.length > 0) {
            // To avoid overwriting SafeBrowsing's title, set the main summary only if
            // it's empty. The title set here can be overridden by later checks (e.g.
            // bad HTTP).
            summary = summary || i18nString(UIStrings.thisPageIsSuspiciousFlaggedBy);
            explanations.push(new SecurityStyleExplanation("insecure" /* Insecure */, undefined, currentExplanations[0].summary, currentExplanations[0].description));
        }
        return summary;
    }
    _explainCertificateSecurity(visibleSecurityState, explanations) {
        const { certificateSecurityState, securityStateIssueIds } = visibleSecurityState;
        const title = i18nString(UIStrings.certificate);
        if (certificateSecurityState && certificateSecurityState.certificateHasSha1Signature) {
            const explanationSummary = i18nString(UIStrings.insecureSha);
            const description = i18nString(UIStrings.theCertificateChainForThisSite);
            if (certificateSecurityState.certificateHasWeakSignature) {
                explanations.push(new SecurityStyleExplanation("insecure" /* Insecure */, title, explanationSummary, description, certificateSecurityState.certificate, "none" /* None */));
            }
            else {
                explanations.push(new SecurityStyleExplanation("neutral" /* Neutral */, title, explanationSummary, description, certificateSecurityState.certificate, "none" /* None */));
            }
        }
        if (certificateSecurityState && securityStateIssueIds.includes('cert-missing-subject-alt-name')) {
            explanations.push(new SecurityStyleExplanation("insecure" /* Insecure */, title, i18nString(UIStrings.subjectAlternativeNameMissing), i18nString(UIStrings.theCertificateForThisSiteDoesNot), certificateSecurityState.certificate, "none" /* None */));
        }
        if (certificateSecurityState && certificateSecurityState.certificateNetworkError !== null) {
            explanations.push(new SecurityStyleExplanation("insecure" /* Insecure */, title, i18nString(UIStrings.missing), i18nString(UIStrings.thisSiteIsMissingAValidTrusted, { PH1: certificateSecurityState.certificateNetworkError }), certificateSecurityState.certificate, "none" /* None */));
        }
        else if (certificateSecurityState && !certificateSecurityState.certificateHasSha1Signature) {
            explanations.push(new SecurityStyleExplanation("secure" /* Secure */, title, i18nString(UIStrings.validAndTrusted), i18nString(UIStrings.theConnectionToThisSiteIsUsingA, { PH1: certificateSecurityState.issuer }), certificateSecurityState.certificate, "none" /* None */));
        }
        if (securityStateIssueIds.includes('pkp-bypassed')) {
            explanations.push(new SecurityStyleExplanation("info" /* Info */, title, i18nString(UIStrings.publickeypinningBypassed), i18nString(UIStrings.publickeypinningWasBypassedByA)));
        }
        if (certificateSecurityState && certificateSecurityState.isCertificateExpiringSoon()) {
            explanations.push(new SecurityStyleExplanation("info" /* Info */, undefined, i18nString(UIStrings.certificateExpiresSoon), i18nString(UIStrings.theCertificateForThisSiteExpires)));
        }
    }
    _explainConnectionSecurity(visibleSecurityState, explanations) {
        const certificateSecurityState = visibleSecurityState.certificateSecurityState;
        if (!certificateSecurityState) {
            return;
        }
        const title = i18nString(UIStrings.connection);
        if (certificateSecurityState.modernSSL) {
            explanations.push(new SecurityStyleExplanation("secure" /* Secure */, title, i18nString(UIStrings.secureConnectionSettings), i18nString(UIStrings.theConnectionToThisSiteIs, {
                PH1: certificateSecurityState.protocol,
                PH2: certificateSecurityState.getKeyExchangeName(),
                PH3: certificateSecurityState.getCipherFullName(),
            })));
            return;
        }
        const recommendations = [];
        if (certificateSecurityState.obsoleteSslProtocol) {
            recommendations.push(i18nString(UIStrings.sIsObsoleteEnableTlsOrLater, { PH1: certificateSecurityState.protocol }));
        }
        if (certificateSecurityState.obsoleteSslKeyExchange) {
            recommendations.push(i18nString(UIStrings.rsaKeyExchangeIsObsoleteEnableAn));
        }
        if (certificateSecurityState.obsoleteSslCipher) {
            recommendations.push(i18nString(UIStrings.sIsObsoleteEnableAnAesgcmbased, { PH1: certificateSecurityState.cipher }));
        }
        if (certificateSecurityState.obsoleteSslSignature) {
            recommendations.push(i18nString(UIStrings.theServerSignatureUsesShaWhichIs));
        }
        explanations.push(new SecurityStyleExplanation("info" /* Info */, title, i18nString(UIStrings.obsoleteConnectionSettings), i18nString(UIStrings.theConnectionToThisSiteIs, {
            PH1: certificateSecurityState.protocol,
            PH2: certificateSecurityState.getKeyExchangeName(),
            PH3: certificateSecurityState.getCipherFullName(),
        }), undefined, undefined, recommendations));
    }
    _explainContentSecurity(visibleSecurityState, explanations) {
        // Add the secure explanation unless there is an issue.
        let addSecureExplanation = true;
        const title = i18nString(UIStrings.resources);
        const securityStateIssueIds = visibleSecurityState.securityStateIssueIds;
        if (securityStateIssueIds.includes('ran-mixed-content')) {
            addSecureExplanation = false;
            explanations.push(new SecurityStyleExplanation("insecure" /* Insecure */, title, i18nString(UIStrings.activeMixedContent), i18nString(UIStrings.youHaveRecentlyAllowedNonsecure), [], "blockable" /* Blockable */));
        }
        if (securityStateIssueIds.includes('displayed-mixed-content')) {
            addSecureExplanation = false;
            explanations.push(new SecurityStyleExplanation("neutral" /* Neutral */, title, i18nString(UIStrings.mixedContent), i18nString(UIStrings.thisPageIncludesHttpResources), [], "optionally-blockable" /* OptionallyBlockable */));
        }
        if (securityStateIssueIds.includes('contained-mixed-form')) {
            addSecureExplanation = false;
            explanations.push(new SecurityStyleExplanation("neutral" /* Neutral */, title, i18nString(UIStrings.nonsecureForm), i18nString(UIStrings.thisPageIncludesAFormWithA)));
        }
        if (visibleSecurityState.certificateSecurityState === null ||
            visibleSecurityState.certificateSecurityState.certificateNetworkError === null) {
            if (securityStateIssueIds.includes('ran-content-with-cert-error')) {
                addSecureExplanation = false;
                explanations.push(new SecurityStyleExplanation("insecure" /* Insecure */, title, i18nString(UIStrings.activeContentWithCertificate), i18nString(UIStrings.youHaveRecentlyAllowedContent)));
            }
            if (securityStateIssueIds.includes('displayed-content-with-cert-errors')) {
                addSecureExplanation = false;
                explanations.push(new SecurityStyleExplanation("neutral" /* Neutral */, title, i18nString(UIStrings.contentWithCertificateErrors), i18nString(UIStrings.thisPageIncludesResourcesThat)));
            }
        }
        if (addSecureExplanation) {
            if (!securityStateIssueIds.includes('scheme-is-not-cryptographic')) {
                explanations.push(new SecurityStyleExplanation("secure" /* Secure */, title, i18nString(UIStrings.allServedSecurely), i18nString(UIStrings.allResourcesOnThisPageAreServed)));
            }
        }
    }
    _orderExplanations(explanations) {
        if (explanations.length === 0) {
            return explanations;
        }
        const securityStateOrder = [
            "insecure" /* Insecure */,
            "neutral" /* Neutral */,
            "secure" /* Secure */,
            "info" /* Info */,
        ];
        const orderedExplanations = [];
        for (const securityState of securityStateOrder) {
            orderedExplanations.push(...explanations.filter(explanation => explanation.securityState === securityState));
        }
        return orderedExplanations;
    }
    refreshExplanations() {
        this._securityExplanationsMain.removeChildren();
        this._securityExplanationsExtra.removeChildren();
        if (!this._explanations) {
            return;
        }
        for (const explanation of this._explanations) {
            if (explanation.securityState === "info" /* Info */) {
                this._addExplanation(this._securityExplanationsExtra, explanation);
            }
            else {
                switch (explanation.mixedContentType) {
                    case "blockable" /* Blockable */:
                        this._addMixedContentExplanation(this._securityExplanationsMain, explanation, Network.NetworkLogView.MixedContentFilterValues.BlockOverridden);
                        break;
                    case "optionally-blockable" /* OptionallyBlockable */:
                        this._addMixedContentExplanation(this._securityExplanationsMain, explanation, Network.NetworkLogView.MixedContentFilterValues.Displayed);
                        break;
                    default:
                        this._addExplanation(this._securityExplanationsMain, explanation);
                        break;
                }
            }
        }
        if (this._panel.filterRequestCount(Network.NetworkLogView.MixedContentFilterValues.Blocked) > 0) {
            const explanation = {
                securityState: "info" /* Info */,
                summary: i18nString(UIStrings.blockedMixedContent),
                description: i18nString(UIStrings.yourPageRequestedNonsecure),
                mixedContentType: "blockable" /* Blockable */,
                certificate: [],
                title: '',
            };
            this._addMixedContentExplanation(this._securityExplanationsMain, explanation, Network.NetworkLogView.MixedContentFilterValues.Blocked);
        }
    }
    _addMixedContentExplanation(parent, explanation, filterKey) {
        const element = this._addExplanation(parent, explanation);
        const filterRequestCount = this._panel.filterRequestCount(filterKey);
        if (!filterRequestCount) {
            // Network instrumentation might not have been enabled for the page
            // load, so the security panel does not necessarily know a count of
            // individual mixed requests at this point. Prompt them to refresh
            // instead of pointing them to the Network panel to get prompted
            // to refresh.
            const refreshPrompt = element.createChild('div', 'security-mixed-content');
            refreshPrompt.textContent = i18nString(UIStrings.reloadThePageToRecordRequestsFor);
            return;
        }
        const requestsAnchor = element.createChild('div', 'security-mixed-content devtools-link');
        UI.ARIAUtils.markAsLink(requestsAnchor);
        requestsAnchor.tabIndex = 0;
        requestsAnchor.textContent = i18nString(UIStrings.viewDRequestsInNetworkPanel, { n: filterRequestCount });
        requestsAnchor.addEventListener('click', this.showNetworkFilter.bind(this, filterKey));
        requestsAnchor.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                this.showNetworkFilter(filterKey, event);
            }
        });
    }
    showNetworkFilter(filterKey, e) {
        e.consume();
        Network.NetworkPanel.NetworkPanel.revealAndFilter([{ filterType: Network.NetworkLogView.FilterType.MixedContent, filterValue: filterKey }]);
    }
}
export class SecurityOriginView extends UI.Widget.VBox {
    _panel;
    _originLockIcon;
    constructor(panel, origin, originState) {
        super();
        this._panel = panel;
        this.setMinimumSize(200, 100);
        this.element.classList.add('security-origin-view');
        this.registerRequiredCSS('panels/security/originView.css', { enableLegacyPatching: false });
        this.registerRequiredCSS('panels/security/lockIcon.css', { enableLegacyPatching: false });
        const titleSection = this.element.createChild('div', 'title-section');
        const titleDiv = titleSection.createChild('div', 'title-section-header');
        titleDiv.textContent = i18nString(UIStrings.origin);
        UI.ARIAUtils.markAsHeading(titleDiv, 1);
        const originDisplay = titleSection.createChild('div', 'origin-display');
        this._originLockIcon = originDisplay.createChild('span', 'security-property');
        this._originLockIcon.classList.add('security-property-' + originState.securityState);
        originDisplay.appendChild(SecurityPanel.createHighlightedUrl(origin, originState.securityState));
        const originNetworkDiv = titleSection.createChild('div', 'view-network-button');
        const originNetworkButton = UI.UIUtils.createTextButton(i18nString(UIStrings.viewRequestsInNetworkPanel), event => {
            event.consume();
            const parsedURL = new Common.ParsedURL.ParsedURL(origin);
            Network.NetworkPanel.NetworkPanel.revealAndFilter([
                { filterType: Network.NetworkLogView.FilterType.Domain, filterValue: parsedURL.host },
                { filterType: Network.NetworkLogView.FilterType.Scheme, filterValue: parsedURL.scheme },
            ]);
        });
        originNetworkDiv.appendChild(originNetworkButton);
        UI.ARIAUtils.markAsLink(originNetworkButton);
        if (originState.securityDetails) {
            const connectionSection = this.element.createChild('div', 'origin-view-section');
            const connectionDiv = connectionSection.createChild('div', 'origin-view-section-title');
            connectionDiv.textContent = i18nString(UIStrings.connection);
            UI.ARIAUtils.markAsHeading(connectionDiv, 2);
            let table = new SecurityDetailsTable();
            connectionSection.appendChild(table.element());
            table.addRow(i18nString(UIStrings.protocol), originState.securityDetails.protocol);
            if (originState.securityDetails.keyExchange) {
                table.addRow(i18nString(UIStrings.keyExchange), originState.securityDetails.keyExchange);
            }
            if (originState.securityDetails.keyExchangeGroup) {
                table.addRow(i18nString(UIStrings.keyExchangeGroup), originState.securityDetails.keyExchangeGroup);
            }
            table.addRow(i18nString(UIStrings.cipher), originState.securityDetails.cipher +
                (originState.securityDetails.mac ? ' with ' + originState.securityDetails.mac : ''));
            // Create the certificate section outside the callback, so that it appears in the right place.
            const certificateSection = this.element.createChild('div', 'origin-view-section');
            const certificateDiv = certificateSection.createChild('div', 'origin-view-section-title');
            certificateDiv.textContent = i18nString(UIStrings.certificate);
            UI.ARIAUtils.markAsHeading(certificateDiv, 2);
            const sctListLength = originState.securityDetails.signedCertificateTimestampList.length;
            const ctCompliance = originState.securityDetails.certificateTransparencyCompliance;
            let sctSection;
            if (sctListLength || ctCompliance !== "unknown" /* Unknown */) {
                // Create the Certificate Transparency section outside the callback, so that it appears in the right place.
                sctSection = this.element.createChild('div', 'origin-view-section');
                const sctDiv = sctSection.createChild('div', 'origin-view-section-title');
                sctDiv.textContent = i18nString(UIStrings.certificateTransparency);
                UI.ARIAUtils.markAsHeading(sctDiv, 2);
            }
            const sanDiv = this._createSanDiv(originState.securityDetails.sanList);
            const validFromString = new Date(1000 * originState.securityDetails.validFrom).toUTCString();
            const validUntilString = new Date(1000 * originState.securityDetails.validTo).toUTCString();
            table = new SecurityDetailsTable();
            certificateSection.appendChild(table.element());
            table.addRow(i18nString(UIStrings.subject), originState.securityDetails.subjectName);
            table.addRow(i18n.i18n.lockedString('SAN'), sanDiv);
            table.addRow(i18nString(UIStrings.validFrom), validFromString);
            table.addRow(i18nString(UIStrings.validUntil), validUntilString);
            table.addRow(i18nString(UIStrings.issuer), originState.securityDetails.issuer);
            table.addRow('', SecurityPanel.createCertificateViewerButtonForOrigin(i18nString(UIStrings.openFullCertificateDetails), origin));
            if (!sctSection) {
                return;
            }
            // Show summary of SCT(s) of Certificate Transparency.
            const sctSummaryTable = new SecurityDetailsTable();
            sctSummaryTable.element().classList.add('sct-summary');
            sctSection.appendChild(sctSummaryTable.element());
            for (let i = 0; i < sctListLength; i++) {
                const sct = originState.securityDetails.signedCertificateTimestampList[i];
                sctSummaryTable.addRow(i18nString(UIStrings.sct), sct.logDescription + ' (' + sct.origin + ', ' + sct.status + ')');
            }
            // Show detailed SCT(s) of Certificate Transparency.
            const sctTableWrapper = sctSection.createChild('div', 'sct-details');
            sctTableWrapper.classList.add('hidden');
            for (let i = 0; i < sctListLength; i++) {
                const sctTable = new SecurityDetailsTable();
                sctTableWrapper.appendChild(sctTable.element());
                const sct = originState.securityDetails.signedCertificateTimestampList[i];
                sctTable.addRow(i18nString(UIStrings.logName), sct.logDescription);
                sctTable.addRow(i18nString(UIStrings.logId), sct.logId.replace(/(.{2})/g, '$1 '));
                sctTable.addRow(i18nString(UIStrings.validationStatus), sct.status);
                sctTable.addRow(i18nString(UIStrings.source), sct.origin);
                sctTable.addRow(i18nString(UIStrings.issuedAt), new Date(sct.timestamp).toUTCString());
                sctTable.addRow(i18nString(UIStrings.hashAlgorithm), sct.hashAlgorithm);
                sctTable.addRow(i18nString(UIStrings.signatureAlgorithm), sct.signatureAlgorithm);
                sctTable.addRow(i18nString(UIStrings.signatureData), sct.signatureData.replace(/(.{2})/g, '$1 '));
            }
            // Add link to toggle between displaying of the summary of the SCT(s) and the detailed SCT(s).
            if (sctListLength) {
                function toggleSctDetailsDisplay() {
                    let buttonText;
                    const isDetailsShown = !sctTableWrapper.classList.contains('hidden');
                    if (isDetailsShown) {
                        buttonText = i18nString(UIStrings.showFullDetails);
                    }
                    else {
                        buttonText = i18nString(UIStrings.hideFullDetails);
                    }
                    toggleSctsDetailsLink.textContent = buttonText;
                    UI.ARIAUtils.setAccessibleName(toggleSctsDetailsLink, buttonText);
                    UI.ARIAUtils.setExpanded(toggleSctsDetailsLink, !isDetailsShown);
                    sctSummaryTable.element().classList.toggle('hidden');
                    sctTableWrapper.classList.toggle('hidden');
                }
                const toggleSctsDetailsLink = UI.UIUtils.createTextButton(i18nString(UIStrings.showFullDetails), toggleSctDetailsDisplay, 'details-toggle');
                sctSection.appendChild(toggleSctsDetailsLink);
            }
            switch (ctCompliance) {
                case "compliant" /* Compliant */:
                    sctSection.createChild('div', 'origin-view-section-notes').textContent =
                        i18nString(UIStrings.thisRequestCompliesWithChromes);
                    break;
                case "not-compliant" /* NotCompliant */:
                    sctSection.createChild('div', 'origin-view-section-notes').textContent =
                        i18nString(UIStrings.thisRequestDoesNotComplyWith);
                    break;
                case "unknown" /* Unknown */:
                    break;
            }
            const noteSection = this.element.createChild('div', 'origin-view-section origin-view-notes');
            if (originState.loadedFromCache) {
                noteSection.createChild('div').textContent = i18nString(UIStrings.thisResponseWasLoadedFromCache);
            }
            noteSection.createChild('div').textContent = i18nString(UIStrings.theSecurityDetailsAboveAreFrom);
        }
        else if (originState.securityState === "secure" /* Secure */) {
            // If the security state is secure but there are no security details,
            // this means that the origin is a non-cryptographic secure origin, e.g.
            // chrome:// or about:.
            const secureSection = this.element.createChild('div', 'origin-view-section');
            const secureDiv = secureSection.createChild('div', 'origin-view-section-title');
            secureDiv.textContent = i18nString(UIStrings.secure);
            UI.ARIAUtils.markAsHeading(secureDiv, 2);
            secureSection.createChild('div').textContent = i18nString(UIStrings.thisOriginIsANonhttpsSecure);
        }
        else if (originState.securityState !== "unknown" /* Unknown */) {
            const notSecureSection = this.element.createChild('div', 'origin-view-section');
            const notSecureDiv = notSecureSection.createChild('div', 'origin-view-section-title');
            notSecureDiv.textContent = i18nString(UIStrings.notSecure);
            UI.ARIAUtils.markAsHeading(notSecureDiv, 2);
            notSecureSection.createChild('div').textContent = i18nString(UIStrings.yourConnectionToThisOriginIsNot);
        }
        else {
            const noInfoSection = this.element.createChild('div', 'origin-view-section');
            const noInfoDiv = noInfoSection.createChild('div', 'origin-view-section-title');
            noInfoDiv.textContent = i18nString(UIStrings.noSecurityInformation);
            UI.ARIAUtils.markAsHeading(noInfoDiv, 2);
            noInfoSection.createChild('div').textContent = i18nString(UIStrings.noSecurityDetailsAreAvailableFor);
        }
    }
    _createSanDiv(sanList) {
        const sanDiv = document.createElement('div');
        if (sanList.length === 0) {
            sanDiv.textContent = i18nString(UIStrings.na);
            sanDiv.classList.add('empty-san');
        }
        else {
            const truncatedNumToShow = 2;
            const listIsTruncated = sanList.length > truncatedNumToShow + 1;
            for (let i = 0; i < sanList.length; i++) {
                const span = sanDiv.createChild('span', 'san-entry');
                span.textContent = sanList[i];
                if (listIsTruncated && i >= truncatedNumToShow) {
                    span.classList.add('truncated-entry');
                }
            }
            if (listIsTruncated) {
                function toggleSANTruncation() {
                    const isTruncated = sanDiv.classList.contains('truncated-san');
                    let buttonText;
                    if (isTruncated) {
                        sanDiv.classList.remove('truncated-san');
                        buttonText = i18nString(UIStrings.showLess);
                    }
                    else {
                        sanDiv.classList.add('truncated-san');
                        buttonText = i18nString(UIStrings.showMoreSTotal, { PH1: sanList.length });
                    }
                    truncatedSANToggle.textContent = buttonText;
                    UI.ARIAUtils.setAccessibleName(truncatedSANToggle, buttonText);
                    UI.ARIAUtils.setExpanded(truncatedSANToggle, isTruncated);
                }
                const truncatedSANToggle = UI.UIUtils.createTextButton(i18nString(UIStrings.showMoreSTotal, { PH1: sanList.length }), toggleSANTruncation);
                sanDiv.appendChild(truncatedSANToggle);
                toggleSANTruncation();
            }
        }
        return sanDiv;
    }
    setSecurityState(newSecurityState) {
        for (const className of Array.prototype.slice.call(this._originLockIcon.classList)) {
            if (className.startsWith('security-property-')) {
                this._originLockIcon.classList.remove(className);
            }
        }
        this._originLockIcon.classList.add('security-property-' + newSecurityState);
    }
}
export class SecurityDetailsTable {
    _element;
    constructor() {
        this._element = document.createElement('table');
        this._element.classList.add('details-table');
    }
    element() {
        return this._element;
    }
    addRow(key, value) {
        const row = this._element.createChild('div', 'details-table-row');
        row.createChild('div').textContent = key;
        const valueDiv = row.createChild('div');
        if (typeof value === 'string') {
            valueDiv.textContent = value;
        }
        else {
            valueDiv.appendChild(value);
        }
    }
}
//# sourceMappingURL=SecurityPanel.js.map