// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Issue, IssueCategory, IssueKind } from './Issue.js';
function getIssueCode(details) {
    switch (details.violationType) {
        case "PermissionPolicyDisabled" /* PermissionPolicyDisabled */:
            return "AttributionReportingIssue::PermissionPolicyDisabled" /* PermissionPolicyDisabled */;
        case "InvalidAttributionSourceEventId" /* InvalidAttributionSourceEventId */:
            return "AttributionReportingIssue::InvalidAttributionSourceEventId" /* InvalidAttributionSourceEventId */;
        case "InvalidAttributionData" /* InvalidAttributionData */:
            return details.invalidParameter !== undefined ? "AttributionReportingIssue::InvalidAttributionData" /* InvalidAttributionData */ :
                "AttributionReportingIssue::MissingAttributionData" /* MissingAttributionData */;
        case "AttributionSourceUntrustworthyOrigin" /* AttributionSourceUntrustworthyOrigin */:
            return details.frame !== undefined ? "AttributionReportingIssue::AttributionSourceUntrustworthyFrameOrigin" /* AttributionSourceUntrustworthyFrameOrigin */ :
                "AttributionReportingIssue::AttributionSourceUntrustworthyOrigin" /* AttributionSourceUntrustworthyOrigin */;
        case "AttributionUntrustworthyOrigin" /* AttributionUntrustworthyOrigin */:
            return details.frame !== undefined ? "AttributionReportingIssue::AttributionUntrustworthyFrameOrigin" /* AttributionUntrustworthyFrameOrigin */ :
                "AttributionReportingIssue::AttributionUntrustworthyOrigin" /* AttributionUntrustworthyOrigin */;
    }
}
export class AttributionReportingIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        super(getIssueCode(issueDetails), issuesModel);
        this.issueDetails = issueDetails;
    }
    getCategory() {
        return IssueCategory.AttributionReporting;
    }
    getDescription() {
        switch (this.code()) {
            case "AttributionReportingIssue::PermissionPolicyDisabled" /* PermissionPolicyDisabled */:
                return {
                    file: 'arPermissionPolicyDisabled.md',
                    links: [],
                };
            case "AttributionReportingIssue::InvalidAttributionSourceEventId" /* InvalidAttributionSourceEventId */:
                return {
                    file: 'arInvalidAttrubtionSourceEventId.md',
                    links: [],
                };
            case "AttributionReportingIssue::InvalidAttributionData" /* InvalidAttributionData */:
                return {
                    file: 'arInvalidAttributionData.md',
                    links: [],
                };
            case "AttributionReportingIssue::MissingAttributionData" /* MissingAttributionData */:
                return {
                    file: 'arMissingAttributionData.md',
                    links: [],
                };
            case "AttributionReportingIssue::AttributionSourceUntrustworthyFrameOrigin" /* AttributionSourceUntrustworthyFrameOrigin */:
                return {
                    file: 'arAttributionSourceUntrustworthyFrameOrigin.md',
                    links: [],
                };
            case "AttributionReportingIssue::AttributionSourceUntrustworthyOrigin" /* AttributionSourceUntrustworthyOrigin */:
                return {
                    file: 'arAttributionSourceUntrustworthyOrigin.md',
                    links: [],
                };
            case "AttributionReportingIssue::AttributionUntrustworthyFrameOrigin" /* AttributionUntrustworthyFrameOrigin */:
                return {
                    file: 'arAttributionUntrustworthyFrameOrigin.md',
                    links: [],
                };
            case "AttributionReportingIssue::AttributionUntrustworthyOrigin" /* AttributionUntrustworthyOrigin */:
                return {
                    file: 'arAttributionUntrustworthyOrigin.md',
                    links: [],
                };
        }
    }
    primaryKey() {
        return JSON.stringify(this.issueDetails);
    }
    getKind() {
        return IssueKind.PageError;
    }
    static fromInspectorIssue(issuesModel, inspectorDetails) {
        const { attributionReportingIssueDetails } = inspectorDetails;
        if (!attributionReportingIssueDetails) {
            console.warn('Attribution Reporting issue without details received.');
            return [];
        }
        return [new AttributionReportingIssue(attributionReportingIssueDetails, issuesModel)];
    }
}
//# sourceMappingURL=AttributionReportingIssue.js.map