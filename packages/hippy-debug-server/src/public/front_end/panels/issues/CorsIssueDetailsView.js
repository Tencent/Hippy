// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as Network from '../../panels/network/network.js';
import { AffectedResourcesView } from './AffectedResourcesView.js';
const UIStrings = {
    /**
    *@description Label for number of affected resources indication in issue view
    */
    nRequests: '{n, plural, =1 {# request} other {# requests}}',
    /**
    *@description Value for the status column in SharedArrayBuffer issues
    */
    warning: 'warning',
    /**
    *@description The kind of resolution for a mixed content issue
    */
    blocked: 'blocked',
    /**
    *@description Text for the status column in the item list in the CORS issue details view
    */
    status: 'Status',
    /**
    *@description Text for the column showing the associated network request in the item list in the CORS issue details view
    */
    request: 'Request',
    /**
     *@description Text for the column showing the resource's address in the item list in the CORS issue details view
     */
    resourceAddressSpace: 'Resource Address',
    /**
     *@description Text for the column showing the address of the resource load initiator in the item list in the CORS issue details view
     */
    initiatorAddressSpace: 'Initiator Address',
    /**
    *@description Text for the status of the initiator context
    */
    secure: 'secure',
    /**
    *@description Text for the status of the initiator context
    */
    insecure: 'insecure',
    /**
    *@description Title for a column showing the status of the initiator context. The initiator context is either secure or insecure depending on whether it was loaded via HTTP or HTTPS.
    */
    initiatorContext: 'Initiator Context',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing a link to the associated preflight request in case the preflight request caused the issue.
    */
    preflightRequestIfProblematic: 'Preflight Request (if problematic)',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing a link to the associated preflight request.
    */
    preflightRequest: 'Preflight Request',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the name of the problematic HTTP response header.
    */
    header: 'Header',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the problem associated with the resource.
    */
    problem: 'Problem',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the value that was invalid and caused the problem if it is available.
    */
    invalidValue: 'Invalid Value (if available)',
    /**
    *@description Content for the problem column in the affected resources table for a CORS issue that indicates that a response header was missing.
    */
    problemMissingHeader: 'Missing Header',
    /**
    *@description Content for the problem column in the affected resources table for a CORS issue that indicates that a response header contained multiple values.
    */
    problemMultipleValues: 'Multiple Values',
    /**
    *@description Content for the problem column in the affected resources table for a CORS issue that indicates that a response header contained an invalid value.
    */
    problemInvalidValue: 'Invalid Value',
    /**
    *@description Content for the problem column in the affected resources table for a CORS issue that indicates that the response to the preflight request was a redirect.
    */
    preflightDisallowedRedirect: 'Response to preflight was a redirect',
    /**
    *@description Content for the problem column in the affected resources table for a CORS issue that indicates that the HTTP status the preflight request was not successful.
    */
    preflightInvalidStatus: 'HTTP status of preflight request didn\'t indicate success',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the origin that was allowed according to CORS headers.
    */
    allowedOrigin: 'Allowed Origin (from header)',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the value of the Access-Control-Allow-Credentials response header.
    */
    allowCredentialsValueFromHeader: '`Access-Control-Allow-Credentials` Header Value',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the request method that was disallowed.
    */
    disallowedRequestMethod: 'Disallowed Request Method',
    /**
    *@description Title for a column in the affected resources for a CORS issue showing the request header that was disallowed.
    */
    disallowedRequestHeader: 'Disallowed Request Header',
    /**
    *@description Header for the source location column
    */
    sourceLocation: 'Source Location',
    /**
    *@description Header for the column with the URL scheme that is not supported by fetch
    */
    unsupportedScheme: 'Unsupported Scheme',
};
const str_ = i18n.i18n.registerUIStrings('panels/issues/CorsIssueDetailsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CorsIssueDetailsView extends AffectedResourcesView {
    issue;
    constructor(parentView, issue) {
        super(parentView);
        this.issue = issue;
        this.affectedResourcesCountElement.classList.add('cors-issue-affected-resource-label');
    }
    appendStatus(element, isWarning) {
        const status = document.createElement('td');
        if (isWarning) {
            status.classList.add('affected-resource-report-only-status');
            status.textContent = i18nString(UIStrings.warning);
        }
        else {
            status.classList.add('affected-resource-blocked-status');
            status.textContent = i18nString(UIStrings.blocked);
        }
        element.appendChild(status);
    }
    getResourceNameWithCount(count) {
        return i18nString(UIStrings.nRequests, { n: count });
    }
    appendDetails(issueCode, issues) {
        const header = document.createElement('tr');
        this.appendColumnTitle(header, i18nString(UIStrings.request));
        this.appendColumnTitle(header, i18nString(UIStrings.status));
        switch (issueCode) {
            case IssuesManager.CorsIssue.IssueCode.InvalidHeaderValues:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequestIfProblematic));
                this.appendColumnTitle(header, i18nString(UIStrings.header));
                this.appendColumnTitle(header, i18nString(UIStrings.problem));
                this.appendColumnTitle(header, i18nString(UIStrings.invalidValue));
                break;
            case IssuesManager.CorsIssue.IssueCode.WildcardOriginNotAllowed:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequestIfProblematic));
                break;
            case IssuesManager.CorsIssue.IssueCode.PreflightResponseInvalid:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequest));
                this.appendColumnTitle(header, i18nString(UIStrings.problem));
                break;
            case IssuesManager.CorsIssue.IssueCode.OriginMismatch:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequestIfProblematic));
                this.appendColumnTitle(header, i18nString(UIStrings.initiatorContext));
                this.appendColumnTitle(header, i18nString(UIStrings.allowedOrigin));
                break;
            case IssuesManager.CorsIssue.IssueCode.AllowCredentialsRequired:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequestIfProblematic));
                this.appendColumnTitle(header, i18nString(UIStrings.allowCredentialsValueFromHeader));
                break;
            case IssuesManager.CorsIssue.IssueCode.InsecurePrivateNetwork:
            case IssuesManager.CorsIssue.IssueCode.InsecurePrivateNetworkPreflight:
                this.appendColumnTitle(header, i18nString(UIStrings.resourceAddressSpace));
                this.appendColumnTitle(header, i18nString(UIStrings.initiatorAddressSpace));
                this.appendColumnTitle(header, i18nString(UIStrings.initiatorContext));
                break;
            case IssuesManager.CorsIssue.IssueCode.MethodDisallowedByPreflightResponse:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequest));
                this.appendColumnTitle(header, i18nString(UIStrings.disallowedRequestMethod));
                break;
            case IssuesManager.CorsIssue.IssueCode.HeaderDisallowedByPreflightResponse:
                this.appendColumnTitle(header, i18nString(UIStrings.preflightRequest));
                this.appendColumnTitle(header, i18nString(UIStrings.disallowedRequestHeader));
                break;
            case IssuesManager.CorsIssue.IssueCode.RedirectContainsCredentials:
                // The default columns suffice.
                break;
            case IssuesManager.CorsIssue.IssueCode.DisallowedByMode:
                this.appendColumnTitle(header, i18nString(UIStrings.initiatorContext));
                this.appendColumnTitle(header, i18nString(UIStrings.sourceLocation));
                break;
            case IssuesManager.CorsIssue.IssueCode.CorsDisabledScheme:
                this.appendColumnTitle(header, i18nString(UIStrings.initiatorContext));
                this.appendColumnTitle(header, i18nString(UIStrings.sourceLocation));
                this.appendColumnTitle(header, i18nString(UIStrings.unsupportedScheme));
                break;
            case IssuesManager.CorsIssue.IssueCode.NoCorsRedirectModeNotFollow:
                this.appendColumnTitle(header, i18nString(UIStrings.sourceLocation));
                break;
            default:
                Platform.assertUnhandled(issueCode);
        }
        this.affectedResources.appendChild(header);
        let count = 0;
        for (const issue of issues) {
            count++;
            this.appendDetail(issueCode, issue);
        }
        this.updateAffectedResourceCount(count);
    }
    appendSecureContextCell(element, isSecureContext) {
        if (isSecureContext === undefined) {
            this.appendIssueDetailCell(element, '');
            return;
        }
        this.appendIssueDetailCell(element, isSecureContext ? i18nString(UIStrings.secure) : i18nString(UIStrings.insecure));
    }
    static getHeaderFromError(corsError) {
        switch (corsError) {
            case "InvalidAllowHeadersPreflightResponse" /* InvalidAllowHeadersPreflightResponse */:
                return 'Access-Control-Allow-Headers';
            case "InvalidAllowMethodsPreflightResponse" /* InvalidAllowMethodsPreflightResponse */:
            case "MethodDisallowedByPreflightResponse" /* MethodDisallowedByPreflightResponse */:
                return 'Access-Control-Allow-Methods';
            case "PreflightMissingAllowOriginHeader" /* PreflightMissingAllowOriginHeader */:
            case "PreflightMultipleAllowOriginValues" /* PreflightMultipleAllowOriginValues */:
            case "PreflightInvalidAllowOriginValue" /* PreflightInvalidAllowOriginValue */:
            case "MissingAllowOriginHeader" /* MissingAllowOriginHeader */:
            case "MultipleAllowOriginValues" /* MultipleAllowOriginValues */:
            case "InvalidAllowOriginValue" /* InvalidAllowOriginValue */:
            case "WildcardOriginNotAllowed" /* WildcardOriginNotAllowed */:
            case "PreflightWildcardOriginNotAllowed" /* PreflightWildcardOriginNotAllowed */:
            case "AllowOriginMismatch" /* AllowOriginMismatch */:
            case "PreflightAllowOriginMismatch" /* PreflightAllowOriginMismatch */:
                return 'Access-Control-Allow-Origin';
            case "InvalidAllowCredentials" /* InvalidAllowCredentials */:
            case "PreflightInvalidAllowCredentials" /* PreflightInvalidAllowCredentials */:
                return 'Access-Control-Allow-Credentials';
            case "RedirectContainsCredentials" /* RedirectContainsCredentials */:
            case "PreflightDisallowedRedirect" /* PreflightDisallowedRedirect */:
                return 'Location';
            case "PreflightInvalidStatus" /* PreflightInvalidStatus */:
                return 'Status-Code';
        }
        return '';
    }
    static getProblemFromError(corsErrorStatus) {
        switch (corsErrorStatus.corsError) {
            case "InvalidAllowHeadersPreflightResponse" /* InvalidAllowHeadersPreflightResponse */:
            case "InvalidAllowMethodsPreflightResponse" /* InvalidAllowMethodsPreflightResponse */:
            case "PreflightInvalidAllowOriginValue" /* PreflightInvalidAllowOriginValue */:
            case "InvalidAllowOriginValue" /* InvalidAllowOriginValue */:
                return i18nString(UIStrings.problemInvalidValue);
            case "PreflightMultipleAllowOriginValues" /* PreflightMultipleAllowOriginValues */:
            case "MultipleAllowOriginValues" /* MultipleAllowOriginValues */:
                return i18nString(UIStrings.problemMultipleValues);
            case "MissingAllowOriginHeader" /* MissingAllowOriginHeader */:
            case "PreflightMissingAllowOriginHeader" /* PreflightMissingAllowOriginHeader */:
                return i18nString(UIStrings.problemMissingHeader);
            case "PreflightInvalidStatus" /* PreflightInvalidStatus */:
                return i18nString(UIStrings.preflightInvalidStatus);
            case "PreflightDisallowedRedirect" /* PreflightDisallowedRedirect */:
                return i18nString(UIStrings.preflightDisallowedRedirect);
        }
        throw new Error('Invalid Argument');
    }
    appendDetail(issueCode, issue) {
        const element = document.createElement('tr');
        element.classList.add('affected-resource-directive');
        const details = issue.details();
        const corsErrorStatus = details.corsErrorStatus;
        const corsError = details.corsErrorStatus.corsError;
        const highlightHeader = {
            section: Network.NetworkSearchScope.UIHeaderSection.Response,
            name: CorsIssueDetailsView.getHeaderFromError(corsError),
        };
        switch (issueCode) {
            case IssuesManager.CorsIssue.IssueCode.InvalidHeaderValues:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                if (corsError.includes('Preflight')) {
                    element.appendChild(this.createRequestCell(details.request, { linkToPreflight: true, highlightHeader }));
                }
                else {
                    this.appendIssueDetailCell(element, '');
                }
                this.appendIssueDetailCell(element, CorsIssueDetailsView.getHeaderFromError(corsError), 'code-example');
                this.appendIssueDetailCell(element, CorsIssueDetailsView.getProblemFromError(details.corsErrorStatus));
                this.appendIssueDetailCell(element, details.corsErrorStatus.failedParameter, 'code-example');
                break;
            case IssuesManager.CorsIssue.IssueCode.WildcardOriginNotAllowed:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                if (corsError.includes('Preflight')) {
                    element.appendChild(this.createRequestCell(details.request, { linkToPreflight: true, highlightHeader }));
                }
                else {
                    this.appendIssueDetailCell(element, '');
                }
                break;
            case IssuesManager.CorsIssue.IssueCode.PreflightResponseInvalid: {
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                const specialHighlightHeader = corsError === "PreflightInvalidStatus" /* PreflightInvalidStatus */ ?
                    {
                        section: Network.NetworkSearchScope.UIHeaderSection.General,
                        name: 'Status-Code',
                    } :
                    highlightHeader;
                element.appendChild(this.createRequestCell(details.request, { linkToPreflight: true, highlightHeader: specialHighlightHeader }));
                this.appendIssueDetailCell(element, CorsIssueDetailsView.getProblemFromError(details.corsErrorStatus));
                break;
            }
            case IssuesManager.CorsIssue.IssueCode.OriginMismatch:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                if (corsError.includes('Preflight')) {
                    element.appendChild(this.createRequestCell(details.request, { linkToPreflight: true, highlightHeader }));
                }
                else {
                    this.appendIssueDetailCell(element, '');
                }
                this.appendIssueDetailCell(element, details.initiatorOrigin ?? '', 'code-example');
                this.appendIssueDetailCell(element, details.corsErrorStatus.failedParameter, 'code-example');
                break;
            case IssuesManager.CorsIssue.IssueCode.AllowCredentialsRequired:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                if (corsError.includes('Preflight')) {
                    element.appendChild(this.createRequestCell(details.request, { linkToPreflight: true, highlightHeader }));
                }
                else {
                    this.appendIssueDetailCell(element, '');
                }
                this.appendIssueDetailCell(element, details.corsErrorStatus.failedParameter, 'code-example');
                break;
            case IssuesManager.CorsIssue.IssueCode.InsecurePrivateNetwork:
            case IssuesManager.CorsIssue.IssueCode.InsecurePrivateNetworkPreflight:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                this.appendIssueDetailCell(element, details.resourceIPAddressSpace ?? '');
                this.appendIssueDetailCell(element, details.clientSecurityState?.initiatorIPAddressSpace ?? '');
                this.appendSecureContextCell(element, details.clientSecurityState?.initiatorIsSecureContext);
                break;
            case IssuesManager.CorsIssue.IssueCode.MethodDisallowedByPreflightResponse:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                element.appendChild(this.createRequestCell(details.request, { linkToPreflight: true, highlightHeader }));
                this.appendIssueDetailCell(element, details.corsErrorStatus.failedParameter, 'code-example');
                break;
            case IssuesManager.CorsIssue.IssueCode.HeaderDisallowedByPreflightResponse:
                element.appendChild(this.createRequestCell(details.request, {
                    highlightHeader: {
                        section: Network.NetworkSearchScope.UIHeaderSection.Request,
                        name: corsErrorStatus.failedParameter,
                    },
                }));
                this.appendStatus(element, details.isWarning);
                element.appendChild(this.createRequestCell(details.request, {
                    linkToPreflight: true,
                    highlightHeader: {
                        section: Network.NetworkSearchScope.UIHeaderSection.Response,
                        name: 'Access-Control-Allow-Headers',
                    },
                }));
                this.appendIssueDetailCell(element, details.corsErrorStatus.failedParameter, 'code-example');
                break;
            case IssuesManager.CorsIssue.IssueCode.RedirectContainsCredentials:
                element.appendChild(this.createRequestCell(details.request, {
                    highlightHeader: {
                        section: Network.NetworkSearchScope.UIHeaderSection.Response,
                        name: CorsIssueDetailsView.getHeaderFromError(corsError),
                    },
                }));
                this.appendStatus(element, details.isWarning);
                break;
            case IssuesManager.CorsIssue.IssueCode.DisallowedByMode:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                this.appendIssueDetailCell(element, details.initiatorOrigin ?? '', 'code-example');
                this.appendSourceLocation(element, details.location, issue.model()?.getTargetIfNotDisposed());
                break;
            case IssuesManager.CorsIssue.IssueCode.CorsDisabledScheme:
                element.appendChild(this.createRequestCell(details.request, {
                    highlightHeader: {
                        section: Network.NetworkSearchScope.UIHeaderSection.Response,
                        name: CorsIssueDetailsView.getHeaderFromError(corsError),
                    },
                }));
                this.appendStatus(element, details.isWarning);
                this.appendIssueDetailCell(element, details.initiatorOrigin ?? '', 'code-example');
                this.appendSourceLocation(element, details.location, issue.model()?.getTargetIfNotDisposed());
                this.appendIssueDetailCell(element, details.corsErrorStatus.failedParameter ?? '', 'code-example');
                break;
            case IssuesManager.CorsIssue.IssueCode.NoCorsRedirectModeNotFollow:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                this.appendSourceLocation(element, details.location, issue.model()?.getTargetIfNotDisposed());
                break;
            default:
                element.appendChild(this.createRequestCell(details.request));
                this.appendStatus(element, details.isWarning);
                Platform.assertUnhandled(issueCode);
                break;
        }
        this.affectedResources.appendChild(element);
    }
    update() {
        this.clear();
        const issues = this.issue.getCorsIssues();
        if (issues.size > 0) {
            this.appendDetails(issues.values().next().value.code(), issues);
        }
        else {
            this.updateAffectedResourceCount(0);
        }
    }
}
//# sourceMappingURL=CorsIssueDetailsView.js.map