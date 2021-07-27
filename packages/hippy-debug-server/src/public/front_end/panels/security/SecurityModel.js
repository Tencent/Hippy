// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
const UIStrings = {
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
    *@description Description of an SSL cipher that contains a separate (bulk) cipher and MAC.
    *@example {AES_256_CBC} PH1
    *@example {HMAC-SHA1} PH2
    */
    cipherWithMAC: '{PH1} with {PH2}',
    /**
    *@description Description of an SSL Key and its Key Exchange Group.
    *@example {ECDHE_RSA} PH1
    *@example {X25519} PH2
    */
    keyExchangeWithGroup: '{PH1} with {PH2}',
};
const str_ = i18n.i18n.registerUIStrings('panels/security/SecurityModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class SecurityModel extends SDK.SDKModel.SDKModel {
    _dispatcher;
    _securityAgent;
    constructor(target) {
        super(target);
        this._dispatcher = new SecurityDispatcher(this);
        this._securityAgent = target.securityAgent();
        target.registerSecurityDispatcher(this._dispatcher);
        this._securityAgent.invoke_enable();
    }
    resourceTreeModel() {
        return /** @type {!SDK.ResourceTreeModel.ResourceTreeModel} */ this.target().model(SDK.ResourceTreeModel.ResourceTreeModel);
    }
    networkManager() {
        return /** @type {!SDK.NetworkManager.NetworkManager} */ this.target().model(SDK.NetworkManager.NetworkManager);
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static SecurityStateComparator(a, b) {
        const securityStateMap = getOrCreateSecurityStateOrdinalMap();
        const aScore = a && securityStateMap.get(a) || 0;
        const bScore = b && securityStateMap.get(b) || 0;
        return aScore - bScore;
    }
}
let securityStateToOrdinal = null;
const getOrCreateSecurityStateOrdinalMap = () => {
    if (!securityStateToOrdinal) {
        securityStateToOrdinal = new Map();
        const ordering = [
            "info" /* Info */,
            "insecure-broken" /* InsecureBroken */,
            "insecure" /* Insecure */,
            "neutral" /* Neutral */,
            "secure" /* Secure */,
            "unknown" /* Unknown */,
        ];
        for (let i = 0; i < ordering.length; i++) {
            securityStateToOrdinal.set(ordering[i], i + 1);
        }
    }
    return securityStateToOrdinal;
};
SDK.SDKModel.SDKModel.register(SecurityModel, { capabilities: SDK.Target.Capability.Security, autostart: false });
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["SecurityStateChanged"] = "SecurityStateChanged";
    Events["VisibleSecurityStateChanged"] = "VisibleSecurityStateChanged";
})(Events || (Events = {}));
export const SummaryMessages = {
    ["unknown" /* Unknown */]: i18nLazyString(UIStrings.theSecurityOfThisPageIsUnknown),
    ["insecure" /* Insecure */]: i18nLazyString(UIStrings.thisPageIsNotSecure),
    ["neutral" /* Neutral */]: i18nLazyString(UIStrings.thisPageIsNotSecure),
    ["secure" /* Secure */]: i18nLazyString(UIStrings.thisPageIsSecureValidHttps),
    ["insecure-broken" /* InsecureBroken */]: i18nLazyString(UIStrings.thisPageIsNotSecureBrokenHttps),
};
export class PageSecurityState {
    securityState;
    explanations;
    summary;
    constructor(securityState, explanations, summary) {
        this.securityState = securityState;
        this.explanations = explanations;
        this.summary = summary;
    }
}
export class PageVisibleSecurityState {
    securityState;
    certificateSecurityState;
    safetyTipInfo;
    securityStateIssueIds;
    constructor(securityState, certificateSecurityState, safetyTipInfo, securityStateIssueIds) {
        this.securityState = securityState;
        this.certificateSecurityState =
            certificateSecurityState ? new CertificateSecurityState(certificateSecurityState) : null;
        this.safetyTipInfo = safetyTipInfo ? new SafetyTipInfo(safetyTipInfo) : null;
        this.securityStateIssueIds = securityStateIssueIds;
    }
}
export class CertificateSecurityState {
    protocol;
    keyExchange;
    keyExchangeGroup;
    cipher;
    mac;
    certificate;
    subjectName;
    issuer;
    validFrom;
    validTo;
    certificateNetworkError;
    certificateHasWeakSignature;
    certificateHasSha1Signature;
    modernSSL;
    obsoleteSslProtocol;
    obsoleteSslKeyExchange;
    obsoleteSslCipher;
    obsoleteSslSignature;
    constructor(certificateSecurityState) {
        this.protocol = certificateSecurityState.protocol;
        this.keyExchange = certificateSecurityState.keyExchange;
        this.keyExchangeGroup = certificateSecurityState.keyExchangeGroup || null;
        this.cipher = certificateSecurityState.cipher;
        this.mac = certificateSecurityState.mac || null;
        this.certificate = certificateSecurityState.certificate;
        this.subjectName = certificateSecurityState.subjectName;
        this.issuer = certificateSecurityState.issuer;
        this.validFrom = certificateSecurityState.validFrom;
        this.validTo = certificateSecurityState.validTo;
        this.certificateNetworkError = certificateSecurityState.certificateNetworkError || null;
        this.certificateHasWeakSignature = certificateSecurityState.certificateHasWeakSignature;
        this.certificateHasSha1Signature = certificateSecurityState.certificateHasSha1Signature;
        this.modernSSL = certificateSecurityState.modernSSL;
        this.obsoleteSslProtocol = certificateSecurityState.obsoleteSslProtocol;
        this.obsoleteSslKeyExchange = certificateSecurityState.obsoleteSslKeyExchange;
        this.obsoleteSslCipher = certificateSecurityState.obsoleteSslCipher;
        this.obsoleteSslSignature = certificateSecurityState.obsoleteSslSignature;
    }
    isCertificateExpiringSoon() {
        const expiryDate = new Date(this.validTo * 1000).getTime();
        return (expiryDate < new Date(Date.now()).setHours(48)) && (expiryDate > Date.now());
    }
    getKeyExchangeName() {
        if (this.keyExchangeGroup) {
            return this.keyExchange ?
                i18nString(UIStrings.keyExchangeWithGroup, { PH1: this.keyExchange, PH2: this.keyExchangeGroup }) :
                this.keyExchangeGroup;
        }
        return this.keyExchange;
    }
    getCipherFullName() {
        return this.mac ? i18nString(UIStrings.cipherWithMAC, { PH1: this.cipher, PH2: this.mac }) : this.cipher;
    }
}
class SafetyTipInfo {
    safetyTipStatus;
    safeUrl;
    constructor(safetyTipInfo) {
        this.safetyTipStatus = safetyTipInfo.safetyTipStatus;
        this.safeUrl = safetyTipInfo.safeUrl || null;
    }
}
export class SecurityStyleExplanation {
    securityState;
    title;
    summary;
    description;
    certificate;
    mixedContentType;
    recommendations;
    constructor(securityState, title, summary, description, certificate = [], mixedContentType = "none" /* None */, recommendations = []) {
        this.securityState = securityState;
        this.title = title;
        this.summary = summary;
        this.description = description;
        this.certificate = certificate;
        this.mixedContentType = mixedContentType;
        this.recommendations = recommendations;
    }
}
class SecurityDispatcher {
    _model;
    constructor(model) {
        this._model = model;
    }
    securityStateChanged({ securityState, explanations, summary }) {
        const pageSecurityState = new PageSecurityState(securityState, explanations, summary || null);
        this._model.dispatchEventToListeners(Events.SecurityStateChanged, pageSecurityState);
    }
    visibleSecurityStateChanged({ visibleSecurityState }) {
        const pageVisibleSecurityState = new PageVisibleSecurityState(visibleSecurityState.securityState, visibleSecurityState.certificateSecurityState || null, visibleSecurityState.safetyTipInfo || null, visibleSecurityState.securityStateIssueIds);
        this._model.dispatchEventToListeners(Events.VisibleSecurityStateChanged, pageVisibleSecurityState);
    }
    certificateError(_event) {
    }
}
//# sourceMappingURL=SecurityModel.js.map