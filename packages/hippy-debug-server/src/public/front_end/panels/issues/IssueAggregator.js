// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
/**
 * An `AggregatedIssue` representes a number of `IssuesManager.Issue.Issue` objects that are displayed together.
 * Currently only grouping by issue code, is supported. The class provides helpers to support displaying
 * of all resources that are affected by the aggregated issues.
 */
export class AggregatedIssue extends IssuesManager.Issue.Issue {
    affectedCookies;
    affectedRequests;
    affectedLocations;
    heavyAdIssues;
    blockedByResponseDetails;
    corsIssues;
    cspIssues;
    issueKind;
    lowContrastIssues;
    mixedContentIssues;
    sharedArrayBufferIssues;
    trustedWebActivityIssues;
    quirksModeIssues;
    representative;
    aggregatedIssuesCount;
    constructor(code) {
        super(code);
        this.affectedCookies = new Map();
        this.affectedRequests = new Map();
        this.affectedLocations = new Map();
        this.heavyAdIssues = new Set();
        this.blockedByResponseDetails = new Map();
        this.corsIssues = new Set();
        this.cspIssues = new Set();
        this.issueKind = IssuesManager.Issue.IssueKind.Improvement;
        this.lowContrastIssues = new Set();
        this.mixedContentIssues = new Set();
        this.sharedArrayBufferIssues = new Set();
        this.trustedWebActivityIssues = new Set();
        this.quirksModeIssues = new Set();
        this.representative = null;
        this.aggregatedIssuesCount = 0;
    }
    primaryKey() {
        throw new Error('This should never be called');
    }
    getBlockedByResponseDetails() {
        return this.blockedByResponseDetails.values();
    }
    cookies() {
        return Array.from(this.affectedCookies.values()).map(x => x.cookie);
    }
    sources() {
        return this.affectedLocations.values();
    }
    cookiesWithRequestIndicator() {
        return this.affectedCookies.values();
    }
    getHeavyAdIssues() {
        return this.heavyAdIssues;
    }
    getMixedContentIssues() {
        return this.mixedContentIssues;
    }
    getTrustedWebActivityIssues() {
        return this.trustedWebActivityIssues;
    }
    getCorsIssues() {
        return this.corsIssues;
    }
    getCspIssues() {
        return this.cspIssues;
    }
    getLowContrastIssues() {
        return this.lowContrastIssues;
    }
    requests() {
        return this.affectedRequests.values();
    }
    getSharedArrayBufferIssues() {
        return this.sharedArrayBufferIssues;
    }
    getQuirksModeIssues() {
        return this.quirksModeIssues;
    }
    getDescription() {
        if (this.representative) {
            return this.representative.getDescription();
        }
        return null;
    }
    getCategory() {
        if (this.representative) {
            return this.representative.getCategory();
        }
        return IssuesManager.Issue.IssueCategory.Other;
    }
    getAggregatedIssuesCount() {
        return this.aggregatedIssuesCount;
    }
    /**
     * Produces a primary key for a cookie. Use this instead of `JSON.stringify` in
     * case new fields are added to `AffectedCookie`.
     */
    keyForCookie(cookie) {
        const { domain, path, name } = cookie;
        return `${domain};${path};${name}`;
    }
    addInstance(issue) {
        this.aggregatedIssuesCount++;
        if (!this.representative) {
            this.representative = issue;
        }
        this.issueKind = IssuesManager.Issue.unionIssueKind(this.issueKind, issue.getKind());
        let hasRequest = false;
        for (const request of issue.requests()) {
            hasRequest = true;
            if (!this.affectedRequests.has(request.requestId)) {
                this.affectedRequests.set(request.requestId, request);
            }
        }
        for (const cookie of issue.cookies()) {
            const key = this.keyForCookie(cookie);
            if (!this.affectedCookies.has(key)) {
                this.affectedCookies.set(key, { cookie, hasRequest });
            }
        }
        for (const location of issue.sources()) {
            const key = JSON.stringify(location);
            if (!this.affectedLocations.has(key)) {
                this.affectedLocations.set(key, location);
            }
        }
        if (issue instanceof IssuesManager.MixedContentIssue.MixedContentIssue) {
            this.mixedContentIssues.add(issue);
        }
        if (issue instanceof IssuesManager.HeavyAdIssue.HeavyAdIssue) {
            this.heavyAdIssues.add(issue);
        }
        for (const details of issue.getBlockedByResponseDetails()) {
            const key = JSON.stringify(details, ['parentFrame', 'blockedFrame', 'requestId', 'frameId', 'reason', 'request']);
            this.blockedByResponseDetails.set(key, details);
        }
        if (issue instanceof IssuesManager.TrustedWebActivityIssue.TrustedWebActivityIssue) {
            this.trustedWebActivityIssues.add(issue);
        }
        if (issue instanceof IssuesManager.ContentSecurityPolicyIssue.ContentSecurityPolicyIssue) {
            this.cspIssues.add(issue);
        }
        if (issue instanceof IssuesManager.SharedArrayBufferIssue.SharedArrayBufferIssue) {
            this.sharedArrayBufferIssues.add(issue);
        }
        if (issue instanceof IssuesManager.LowTextContrastIssue.LowTextContrastIssue) {
            this.lowContrastIssues.add(issue);
        }
        if (issue instanceof IssuesManager.CorsIssue.CorsIssue) {
            this.corsIssues.add(issue);
        }
        if (issue instanceof IssuesManager.QuirksModeIssue.QuirksModeIssue) {
            this.quirksModeIssues.add(issue);
        }
    }
    getKind() {
        return this.issueKind;
    }
}
export class IssueAggregator extends Common.ObjectWrapper.ObjectWrapper {
    aggregatedIssuesByCode;
    issuesManager;
    constructor(issuesManager) {
        super();
        this.aggregatedIssuesByCode = new Map();
        this.issuesManager = issuesManager;
        this.issuesManager.addEventListener(IssuesManager.IssuesManager.Events.IssueAdded, this.onIssueAdded, this);
        this.issuesManager.addEventListener(IssuesManager.IssuesManager.Events.FullUpdateRequired, this.onFullUpdateRequired, this);
        for (const issue of this.issuesManager.issues()) {
            this.aggregateIssue(issue);
        }
    }
    onIssueAdded(event) {
        const { issue } = event.data;
        this.aggregateIssue(issue);
    }
    onFullUpdateRequired() {
        this.aggregatedIssuesByCode.clear();
        for (const issue of this.issuesManager.issues()) {
            this.aggregateIssue(issue);
        }
        this.dispatchEventToListeners("FullUpdateRequired" /* FullUpdateRequired */);
    }
    aggregateIssue(issue) {
        let aggregatedIssue = this.aggregatedIssuesByCode.get(issue.code());
        if (!aggregatedIssue) {
            aggregatedIssue = new AggregatedIssue(issue.code());
            this.aggregatedIssuesByCode.set(issue.code(), aggregatedIssue);
        }
        aggregatedIssue.addInstance(issue);
        this.dispatchEventToListeners("AggregatedIssueUpdated" /* AggregatedIssueUpdated */, aggregatedIssue);
        return aggregatedIssue;
    }
    aggregatedIssues() {
        return this.aggregatedIssuesByCode.values();
    }
    numberOfAggregatedIssues() {
        return this.aggregatedIssuesByCode.size;
    }
}
//# sourceMappingURL=IssueAggregator.js.map