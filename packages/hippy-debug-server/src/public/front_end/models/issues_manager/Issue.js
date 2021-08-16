// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
// eslint-disable-next-line rulesdir/const_enum
export var IssueCategory;
(function (IssueCategory) {
    IssueCategory["CrossOriginEmbedderPolicy"] = "CrossOriginEmbedderPolicy";
    IssueCategory["MixedContent"] = "MixedContent";
    IssueCategory["SameSiteCookie"] = "SameSiteCookie";
    IssueCategory["HeavyAd"] = "HeavyAd";
    IssueCategory["ContentSecurityPolicy"] = "ContentSecurityPolicy";
    IssueCategory["TrustedWebActivity"] = "TrustedWebActivity";
    IssueCategory["LowTextContrast"] = "LowTextContrast";
    IssueCategory["Cors"] = "Cors";
    IssueCategory["AttributionReporting"] = "AttributionReporting";
    IssueCategory["QuirksMode"] = "QuirksMode";
    IssueCategory["Other"] = "Other";
})(IssueCategory || (IssueCategory = {}));
// eslint-disable-next-line rulesdir/const_enum
export var IssueKind;
(function (IssueKind) {
    IssueKind["BreakingChange"] = "BreakingChange";
    IssueKind["PageError"] = "PageError";
    IssueKind["Improvement"] = "Improvement";
})(IssueKind || (IssueKind = {}));
/**
 * Union two issue kinds for issue aggregation. The idea is to show the most
 * important kind on aggregated issues that union issues of different kinds.
 */
export function unionIssueKind(a, b) {
    if (a === IssueKind.PageError || b === IssueKind.PageError) {
        return IssueKind.PageError;
    }
    if (a === IssueKind.BreakingChange || b === IssueKind.BreakingChange) {
        return IssueKind.BreakingChange;
    }
    return IssueKind.Improvement;
}
export function getShowThirdPartyIssuesSetting() {
    return Common.Settings.Settings.instance().createSetting('showThirdPartyIssues', false);
}
export class Issue extends Common.ObjectWrapper.ObjectWrapper {
    issueCode;
    issuesModel;
    constructor(code, issuesModel = null) {
        super();
        this.issueCode = typeof code === 'object' ? code.code : code;
        this.issuesModel = issuesModel;
        Host.userMetrics.issueCreated(typeof code === 'string' ? code : code.umaCode);
    }
    code() {
        return this.issueCode;
    }
    getBlockedByResponseDetails() {
        return [];
    }
    cookies() {
        return [];
    }
    elements() {
        return [];
    }
    requests() {
        return [];
    }
    sources() {
        return [];
    }
    isAssociatedWithRequestId(requestId) {
        for (const request of this.requests()) {
            if (request.requestId === requestId) {
                return true;
            }
        }
        return false;
    }
    /**
     * The model might be unavailable or belong to a target that has already been disposed.
     */
    model() {
        return this.issuesModel;
    }
    isCausedByThirdParty() {
        return false;
    }
}
export function toZeroBasedLocation(location) {
    if (!location) {
        return undefined;
    }
    return {
        url: location.url,
        scriptId: location.scriptId,
        lineNumber: location.lineNumber,
        columnNumber: location.columnNumber === 0 ? undefined : location.columnNumber - 1,
    };
}
//# sourceMappingURL=Issue.js.map