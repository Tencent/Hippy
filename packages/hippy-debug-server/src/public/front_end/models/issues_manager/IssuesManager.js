// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import { ContentSecurityPolicyIssue } from './ContentSecurityPolicyIssue.js';
import { CorsIssue } from './CorsIssue.js';
import { CrossOriginEmbedderPolicyIssue, isCrossOriginEmbedderPolicyIssue } from './CrossOriginEmbedderPolicyIssue.js';
import { DeprecationIssue } from './DeprecationIssue.js';
import { HeavyAdIssue } from './HeavyAdIssue.js';
import { LowTextContrastIssue } from './LowTextContrastIssue.js';
import { MixedContentIssue } from './MixedContentIssue.js';
import { QuirksModeIssue } from './QuirksModeIssue.js';
import { SameSiteCookieIssue } from './SameSiteCookieIssue.js';
import { SharedArrayBufferIssue } from './SharedArrayBufferIssue.js';
import { SourceFrameIssuesManager } from './SourceFrameIssuesManager.js';
import { TrustedWebActivityIssue } from './TrustedWebActivityIssue.js';
let issuesManagerInstance = null;
function createIssuesForBlockedByResponseIssue(issuesModel, inspectorIssue) {
    const blockedByResponseIssueDetails = inspectorIssue.details.blockedByResponseIssueDetails;
    if (!blockedByResponseIssueDetails) {
        console.warn('BlockedByResponse issue without details received.');
        return [];
    }
    if (isCrossOriginEmbedderPolicyIssue(blockedByResponseIssueDetails.reason)) {
        return [new CrossOriginEmbedderPolicyIssue(blockedByResponseIssueDetails, issuesModel)];
    }
    return [];
}
const issueCodeHandlers = new Map([
    [
        "SameSiteCookieIssue" /* SameSiteCookieIssue */,
        SameSiteCookieIssue.fromInspectorIssue,
    ],
    [
        "MixedContentIssue" /* MixedContentIssue */,
        MixedContentIssue.fromInspectorIssue,
    ],
    [
        "HeavyAdIssue" /* HeavyAdIssue */,
        HeavyAdIssue.fromInspectorIssue,
    ],
    [
        "ContentSecurityPolicyIssue" /* ContentSecurityPolicyIssue */,
        ContentSecurityPolicyIssue.fromInspectorIssue,
    ],
    ["BlockedByResponseIssue" /* BlockedByResponseIssue */, createIssuesForBlockedByResponseIssue],
    [
        "SharedArrayBufferIssue" /* SharedArrayBufferIssue */,
        SharedArrayBufferIssue.fromInspectorIssue,
    ],
    [
        "TrustedWebActivityIssue" /* TrustedWebActivityIssue */,
        TrustedWebActivityIssue.fromInspectorIssue,
    ],
    [
        "LowTextContrastIssue" /* LowTextContrastIssue */,
        LowTextContrastIssue.fromInspectorIssue,
    ],
    [
        "CorsIssue" /* CorsIssue */,
        CorsIssue.fromInspectorIssue,
    ],
    [
        "QuirksModeIssue" /* QuirksModeIssue */,
        QuirksModeIssue.fromInspectorIssue,
    ],
    [
        "NavigatorUserAgentIssue" /* NavigatorUserAgentIssue */,
        DeprecationIssue.fromInspectorIssue,
    ],
]);
/**
   * Each issue reported by the backend can result in multiple {!Issue} instances.
   * Handlers are simple functions hard-coded into a map.
   */
function createIssuesFromProtocolIssue(issuesModel, inspectorIssue) {
    const handler = issueCodeHandlers.get(inspectorIssue.code);
    if (handler) {
        return handler(issuesModel, inspectorIssue);
    }
    console.warn(`No handler registered for issue code ${inspectorIssue.code}`);
    return [];
}
/**
 * The `IssuesManager` is the central storage for issues. It collects issues from all the
 * `IssuesModel` instances in the page, and deduplicates them wrt their primary key.
 * It also takes care of clearing the issues when it sees a main-frame navigated event.
 * Any client can subscribe to the events provided, and/or query the issues via the public
 * interface.
 *
 * Additionally, the `IssuesManager` can filter Issues. All Issues are stored, but only
 * Issues that are accepted by the filter cause events to be fired or are returned by
 * `IssuesManager#issues()`.
 */
export class IssuesManager extends Common.ObjectWrapper.ObjectWrapper {
    eventListeners;
    allIssues;
    filteredIssues;
    issueCounts;
    hasSeenTopFrameNavigated;
    sourceFrameIssuesManager;
    showThirdPartyIssuesSetting;
    constructor(showThirdPartyIssuesSetting) {
        super();
        this.eventListeners = new WeakMap();
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.IssuesModel.IssuesModel, this);
        this.allIssues = new Map();
        this.filteredIssues = new Map();
        this.issueCounts = new Map();
        this.hasSeenTopFrameNavigated = false;
        SDK.FrameManager.FrameManager.instance().addEventListener(SDK.FrameManager.Events.TopFrameNavigated, this.onTopFrameNavigated, this);
        SDK.FrameManager.FrameManager.instance().addEventListener(SDK.FrameManager.Events.FrameAddedToTarget, this.onFrameAddedToTarget, this);
        this.showThirdPartyIssuesSetting = showThirdPartyIssuesSetting;
        // issueFilter uses the 'showThirdPartyIssues' setting. Clients of IssuesManager need
        // a full update when the setting changes to get an up-to-date issues list.
        this.showThirdPartyIssuesSetting?.addChangeListener(() => this.updateFilteredIssues());
        this.sourceFrameIssuesManager = new SourceFrameIssuesManager(this);
    }
    static instance(opts = {
        forceNew: false,
        ensureFirst: false,
    }) {
        if (issuesManagerInstance && opts.ensureFirst) {
            throw new Error('IssuesManager was already created. Either set "ensureFirst" to false or make sure that this invocation is really the first one.');
        }
        if (!issuesManagerInstance || opts.forceNew) {
            issuesManagerInstance = new IssuesManager(opts.showThirdPartyIssuesSetting);
        }
        return issuesManagerInstance;
    }
    /**
     * Once we have seen at least one `TopFrameNavigated` event, we can be reasonably sure
     * that we also collected issues that were reported during the navigation to the current
     * page. If we haven't seen a main frame navigated, we might have missed issues that arose
     * during navigation.
     */
    reloadForAccurateInformationRequired() {
        return !this.hasSeenTopFrameNavigated;
    }
    onTopFrameNavigated(event) {
        const { frame } = event.data;
        const keptIssues = new Map();
        for (const [key, issue] of this.allIssues.entries()) {
            if (issue.isAssociatedWithRequestId(frame.loaderId)) {
                keptIssues.set(key, issue);
            }
        }
        this.allIssues = keptIssues;
        this.hasSeenTopFrameNavigated = true;
        this.updateFilteredIssues();
    }
    onFrameAddedToTarget(event) {
        const { frame } = event.data;
        // Determining third-party status usually requires the registered domain of the top frame.
        // When DevTools is opened after navigation has completed, issues may be received
        // before the top frame is available. Thus, we trigger a recalcuation of third-party-ness
        // when we attach to the top frame.
        if (frame.isTopFrame()) {
            this.updateFilteredIssues();
        }
    }
    modelAdded(issuesModel) {
        const listener = issuesModel.addEventListener(SDK.IssuesModel.Events.IssueAdded, this.onIssueAddedEvent, this);
        this.eventListeners.set(issuesModel, listener);
    }
    modelRemoved(issuesModel) {
        const listener = this.eventListeners.get(issuesModel);
        if (listener) {
            Common.EventTarget.EventTarget.removeEventListeners([listener]);
        }
    }
    onIssueAddedEvent(event) {
        const { issuesModel, inspectorIssue } = event.data;
        const issues = createIssuesFromProtocolIssue(issuesModel, inspectorIssue);
        for (const issue of issues) {
            this.addIssue(issuesModel, issue);
        }
    }
    addIssue(issuesModel, issue) {
        // Ignore issues without proper description; they are invisible to the user and only cause confusion.
        if (!issue.getDescription()) {
            return;
        }
        const primaryKey = issue.primaryKey();
        if (this.allIssues.has(primaryKey)) {
            return;
        }
        this.allIssues.set(primaryKey, issue);
        if (this.issueFilter(issue)) {
            this.filteredIssues.set(primaryKey, issue);
            this.issueCounts.set(issue.getKind(), 1 + (this.issueCounts.get(issue.getKind()) || 0));
            this.dispatchEventToListeners(Events.IssueAdded, { issuesModel, issue });
        }
        // Always fire the "count" event even if the issue was filtered out.
        // The result of `hasOnlyThirdPartyIssues` could still change.
        this.dispatchEventToListeners(Events.IssuesCountUpdated);
    }
    issues() {
        return this.filteredIssues.values();
    }
    numberOfIssues(kind) {
        if (kind) {
            return this.issueCounts.get(kind) ?? 0;
        }
        return this.filteredIssues.size;
    }
    numberOfAllStoredIssues() {
        return this.allIssues.size;
    }
    issueFilter(issue) {
        return this.showThirdPartyIssuesSetting?.get() || !issue.isCausedByThirdParty();
    }
    updateFilteredIssues() {
        this.filteredIssues.clear();
        this.issueCounts.clear();
        for (const [key, issue] of this.allIssues) {
            if (this.issueFilter(issue)) {
                this.filteredIssues.set(key, issue);
                this.issueCounts.set(issue.getKind(), 1 + (this.issueCounts.get(issue.getKind()) ?? 0));
            }
        }
        this.dispatchEventToListeners(Events.FullUpdateRequired);
        this.dispatchEventToListeners(Events.IssuesCountUpdated);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["IssuesCountUpdated"] = "IssuesCountUpdated";
    Events["IssueAdded"] = "IssueAdded";
    Events["FullUpdateRequired"] = "FullUpdateRequired";
})(Events || (Events = {}));
// @ts-ignore
globalThis.addIssueForTest = (issue) => {
    const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
    const issuesModel = mainTarget?.model(SDK.IssuesModel.IssuesModel);
    issuesModel?.issueAdded({ issue });
};
//# sourceMappingURL=IssuesManager.js.map