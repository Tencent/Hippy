// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
const UIStrings = {
    /**
    *@description Label for the link for CORS private network issues
    */
    corsForPrivateNetworksRfc: 'CORS for private networks (RFC1918)',
    /**
    *@description Label for the link for CORS network issues
    */
    CORS: 'Cross-Origin Resource Sharing (`CORS`)',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/CorsIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var IssueCode;
(function (IssueCode) {
    IssueCode["InsecurePrivateNetwork"] = "CorsIssue::InsecurePrivateNetwork";
    IssueCode["InsecurePrivateNetworkPreflight"] = "CorsIssue::InsecurePrivateNetworkPreflight";
    IssueCode["InvalidHeaderValues"] = "CorsIssue::InvalidHeaders";
    IssueCode["WildcardOriginNotAllowed"] = "CorsIssue::WildcardOriginWithCredentials";
    IssueCode["PreflightResponseInvalid"] = "CorsIssue::PreflightResponseInvalid";
    IssueCode["OriginMismatch"] = "CorsIssue::OriginMismatch";
    IssueCode["AllowCredentialsRequired"] = "CorsIssue::AllowCredentialsRequired";
    IssueCode["MethodDisallowedByPreflightResponse"] = "CorsIssue::MethodDisallowedByPreflightResponse";
    IssueCode["HeaderDisallowedByPreflightResponse"] = "CorsIssue::HeaderDisallowedByPreflightResponse";
    IssueCode["RedirectContainsCredentials"] = "CorsIssue::RedirectContainsCredentials";
    IssueCode["DisallowedByMode"] = "CorsIssue::DisallowedByMode";
    IssueCode["CorsDisabledScheme"] = "CorsIssue::CorsDisabledScheme";
    IssueCode["PreflightMissingAllowExternal"] = "CorsIssue::PreflightMissingAllowExternal";
    IssueCode["PreflightInvalidAllowExternal"] = "CorsIssue::PreflightInvalidAllowExternal";
    IssueCode["InvalidResponse"] = "CorsIssue::InvalidResponse";
    IssueCode["NoCorsRedirectModeNotFollow"] = "CorsIssue::NoCorsRedirectModeNotFollow";
})(IssueCode || (IssueCode = {}));
function getIssueCode(details) {
    switch (details.corsErrorStatus.corsError) {
        case "InvalidAllowMethodsPreflightResponse" /* InvalidAllowMethodsPreflightResponse */:
        case "InvalidAllowHeadersPreflightResponse" /* InvalidAllowHeadersPreflightResponse */:
        case "PreflightMissingAllowOriginHeader" /* PreflightMissingAllowOriginHeader */:
        case "PreflightMultipleAllowOriginValues" /* PreflightMultipleAllowOriginValues */:
        case "PreflightInvalidAllowOriginValue" /* PreflightInvalidAllowOriginValue */:
        case "MissingAllowOriginHeader" /* MissingAllowOriginHeader */:
        case "MultipleAllowOriginValues" /* MultipleAllowOriginValues */:
        case "InvalidAllowOriginValue" /* InvalidAllowOriginValue */:
            return IssueCode.InvalidHeaderValues;
        case "PreflightWildcardOriginNotAllowed" /* PreflightWildcardOriginNotAllowed */:
        case "WildcardOriginNotAllowed" /* WildcardOriginNotAllowed */:
            return IssueCode.WildcardOriginNotAllowed;
        case "PreflightInvalidStatus" /* PreflightInvalidStatus */:
        case "PreflightDisallowedRedirect" /* PreflightDisallowedRedirect */:
            return IssueCode.PreflightResponseInvalid;
        case "AllowOriginMismatch" /* AllowOriginMismatch */:
        case "PreflightAllowOriginMismatch" /* PreflightAllowOriginMismatch */:
            return IssueCode.OriginMismatch;
        case "InvalidAllowCredentials" /* InvalidAllowCredentials */:
        case "PreflightInvalidAllowCredentials" /* PreflightInvalidAllowCredentials */:
            return IssueCode.AllowCredentialsRequired;
        case "MethodDisallowedByPreflightResponse" /* MethodDisallowedByPreflightResponse */:
            return IssueCode.MethodDisallowedByPreflightResponse;
        case "HeaderDisallowedByPreflightResponse" /* HeaderDisallowedByPreflightResponse */:
            return IssueCode.HeaderDisallowedByPreflightResponse;
        case "RedirectContainsCredentials" /* RedirectContainsCredentials */:
            return IssueCode.RedirectContainsCredentials;
        case "DisallowedByMode" /* DisallowedByMode */:
            return IssueCode.DisallowedByMode;
        case "CorsDisabledScheme" /* CorsDisabledScheme */:
            return IssueCode.CorsDisabledScheme;
        case "PreflightMissingAllowExternal" /* PreflightMissingAllowExternal */:
            return IssueCode.PreflightMissingAllowExternal;
        case "PreflightInvalidAllowExternal" /* PreflightInvalidAllowExternal */:
            return IssueCode.PreflightInvalidAllowExternal;
        case "InvalidResponse" /* InvalidResponse */:
            return IssueCode.InvalidResponse;
        case "InsecurePrivateNetwork" /* InsecurePrivateNetwork */:
            return details.clientSecurityState?.initiatorIsSecureContext ? IssueCode.InsecurePrivateNetworkPreflight :
                IssueCode.InsecurePrivateNetwork;
        case "NoCorsRedirectModeNotFollow" /* NoCorsRedirectModeNotFollow */:
            return IssueCode.NoCorsRedirectModeNotFollow;
    }
}
export class CorsIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        super(getIssueCode(issueDetails), issuesModel);
        this.issueDetails = issueDetails;
    }
    getCategory() {
        return IssueCategory.Cors;
    }
    details() {
        return this.issueDetails;
    }
    getDescription() {
        switch (getIssueCode(this.issueDetails)) {
            case IssueCode.InsecurePrivateNetwork:
                return {
                    file: 'corsInsecurePrivateNetwork.md',
                    links: [{
                            link: 'https://developer.chrome.com/blog/private-network-access-update',
                            linkTitle: i18nString(UIStrings.corsForPrivateNetworksRfc),
                        }],
                };
            case IssueCode.InsecurePrivateNetworkPreflight:
                return {
                    file: 'corsInsecurePrivateNetworkPreflight.md',
                    links: [{
                            link: 'https://developer.chrome.com/blog/private-network-access-update',
                            linkTitle: i18nString(UIStrings.corsForPrivateNetworksRfc),
                        }],
                };
            case IssueCode.InvalidHeaderValues:
                return {
                    file: 'corsInvalidHeaderValues.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.WildcardOriginNotAllowed:
                return {
                    file: 'corsWildcardOriginNotAllowed.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.PreflightResponseInvalid:
                return {
                    file: 'corsPreflightResponseInvalid.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.OriginMismatch:
                return {
                    file: 'corsOriginMismatch.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.AllowCredentialsRequired:
                return {
                    file: 'corsAllowCredentialsRequired.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.MethodDisallowedByPreflightResponse:
                return {
                    file: 'corsMethodDisallowedByPreflightResponse.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.HeaderDisallowedByPreflightResponse:
                return {
                    file: 'corsHeaderDisallowedByPreflightResponse.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.RedirectContainsCredentials:
                return {
                    file: 'corsRedirectContainsCredentials.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.DisallowedByMode:
                return {
                    file: 'corsDisallowedByMode.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.CorsDisabledScheme:
                return {
                    file: 'corsDisabledScheme.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.NoCorsRedirectModeNotFollow:
                return {
                    file: 'corsNoCorsRedirectModeNotFollow.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case IssueCode.PreflightMissingAllowExternal:
            case IssueCode.PreflightInvalidAllowExternal:
            case IssueCode.InvalidResponse:
                return null;
        }
    }
    primaryKey() {
        return JSON.stringify(this.issueDetails);
    }
    getKind() {
        if (this.issueDetails.isWarning &&
            this.issueDetails.corsErrorStatus.corsError === "InsecurePrivateNetwork" /* InsecurePrivateNetwork */) {
            return IssueKind.BreakingChange;
        }
        return IssueKind.PageError;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const corsIssueDetails = inspectorIssue.details.corsIssueDetails;
        if (!corsIssueDetails) {
            console.warn('Cors issue without details received.');
            return [];
        }
        return [new CorsIssue(corsIssueDetails, issuesModel)];
    }
}
//# sourceMappingURL=CorsIssue.js.map