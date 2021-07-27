// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as IssuesManager from '../../../models/issues_manager/issues_manager.js';
import * as ComponentHelpers from '../../components/helpers/helpers.js';
import * as LitHtml from '../../lit-html/lit-html.js';
const UIStrings = {
    /**
     *@description A description for a kind of issue we display in the issues tab.
     */
    pageErrorIssue: 'A page error issue: the page is not working correctly',
    /**
     *@description A description for a kind of issue we display in the issues tab.
     */
    breakingChangeIssue: 'A breaking change issue: the page may stop working in an upcoming version of Chrome',
    /**
     *@description A description for a kind of issue we display in the issues tab.
     */
    improvementIssue: 'An improvement issue: there is an opportunity to improve the page',
    /**
    *@description Label for link to Issues tab, specifying how many issues there are.
    */
    pageErrors: '{issueCount, plural, =1 {# page error} other {# page errors}}',
    /**
   *@description Label for link to Issues tab, specifying how many issues there are.
   */
    breakingChanges: '{issueCount, plural, =1 {# breaking change} other {# breaking changes}}',
    /**
   *@description Label for link to Issues tab, specifying how many issues there are.
   */
    possibleImprovements: '{issueCount, plural, =1 {# possible improvement} other {# possible improvements}}',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/issue_counter/IssueCounter.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export function getIssueKindIconData(issueKind) {
    switch (issueKind) {
        case IssuesManager.Issue.IssueKind.PageError:
            return { iconName: 'issue-cross-icon', color: 'var(--issue-color-red)', width: '16px', height: '16px' };
        case IssuesManager.Issue.IssueKind.BreakingChange:
            return { iconName: 'issue-exclamation-icon', color: 'var(--issue-color-yellow)', width: '16px', height: '16px' };
        case IssuesManager.Issue.IssueKind.Improvement:
            return { iconName: 'issue-text-icon', color: 'var(--issue-color-blue)', width: '16px', height: '16px' };
    }
}
function toIconGroup({ iconName, color, width, height }, sizeOverride) {
    if (sizeOverride) {
        return { iconName, iconColor: color, iconWidth: sizeOverride, iconHeight: sizeOverride };
    }
    return { iconName, iconColor: color, iconWidth: width, iconHeight: height };
}
export function getIssueKindDescription(issueKind) {
    switch (issueKind) {
        case IssuesManager.Issue.IssueKind.PageError:
            return i18nString(UIStrings.pageErrorIssue);
        case IssuesManager.Issue.IssueKind.BreakingChange:
            return i18nString(UIStrings.breakingChangeIssue);
        case IssuesManager.Issue.IssueKind.Improvement:
            return i18nString(UIStrings.improvementIssue);
    }
}
// @ts-ignore Remove this comment once Intl.ListFormat is in type defs.
const listFormat = new Intl.ListFormat(navigator.language, { type: 'unit', style: 'short' });
export function getIssueCountsEnumeration(issuesManager, omitEmpty = true) {
    const counts = [
        issuesManager.numberOfIssues(IssuesManager.Issue.IssueKind.PageError),
        issuesManager.numberOfIssues(IssuesManager.Issue.IssueKind.BreakingChange),
        issuesManager.numberOfIssues(IssuesManager.Issue.IssueKind.Improvement),
    ];
    const phrases = [
        i18nString(UIStrings.pageErrors, { issueCount: counts[0] }),
        i18nString(UIStrings.breakingChanges, { issueCount: counts[1] }),
        i18nString(UIStrings.possibleImprovements, { issueCount: counts[2] }),
    ];
    return listFormat.format(phrases.filter((_, i) => omitEmpty ? counts[i] > 0 : true));
}
export class IssueCounter extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    clickHandler = undefined;
    tooltipCallback = undefined;
    leadingText = '';
    throttler;
    counts = [0, 0, 0];
    displayMode = "OmitEmpty" /* OmitEmpty */;
    issuesManager = undefined;
    accessibleName = undefined;
    throttlerTimeout;
    scheduleUpdate() {
        if (this.throttler) {
            this.throttler.schedule(async () => this.render());
        }
        else {
            this.render();
        }
    }
    set data(data) {
        this.clickHandler = data.clickHandler;
        this.leadingText = data.leadingText ?? '';
        this.tooltipCallback = data.tooltipCallback;
        this.displayMode = data.displayMode ?? "OmitEmpty" /* OmitEmpty */;
        this.accessibleName = data.accessibleName;
        this.throttlerTimeout = data.throttlerTimeout;
        if (this.issuesManager !== data.issuesManager) {
            this.issuesManager?.removeEventListener(IssuesManager.IssuesManager.Events.IssuesCountUpdated, this.scheduleUpdate, this);
            this.issuesManager = data.issuesManager;
            this.issuesManager.addEventListener(IssuesManager.IssuesManager.Events.IssuesCountUpdated, this.scheduleUpdate, this);
        }
        if (data.throttlerTimeout !== 0) {
            this.throttler = new Common.Throttler.Throttler(data.throttlerTimeout ?? 100);
        }
        else {
            this.throttler = undefined;
        }
        this.scheduleUpdate();
    }
    get data() {
        return {
            clickHandler: this.clickHandler,
            tooltipCallback: this.tooltipCallback,
            leadingText: this.leadingText,
            displayMode: this.displayMode,
            issuesManager: this.issuesManager,
            accessibleName: this.accessibleName,
            throttlerTimeout: this.throttlerTimeout,
        };
    }
    render() {
        if (!this.issuesManager) {
            return;
        }
        this.counts = [
            this.issuesManager.numberOfIssues(IssuesManager.Issue.IssueKind.PageError),
            this.issuesManager.numberOfIssues(IssuesManager.Issue.IssueKind.BreakingChange),
            this.issuesManager.numberOfIssues(IssuesManager.Issue.IssueKind.Improvement),
        ];
        const importance = [
            IssuesManager.Issue.IssueKind.PageError,
            IssuesManager.Issue.IssueKind.BreakingChange,
            IssuesManager.Issue.IssueKind.Improvement,
        ];
        const mostImportant = importance[this.counts.findIndex(x => x > 0) ?? 2];
        const countToString = (kind, count) => {
            switch (this.displayMode) {
                case "OmitEmpty" /* OmitEmpty */:
                    return count > 0 ? `${count}` : undefined;
                case "ShowAlways" /* ShowAlways */:
                    return `${count}`;
                case "OnlyMostImportant" /* OnlyMostImportant */:
                    return kind === mostImportant ? `${count}` : undefined;
            }
        };
        const iconSize = '2ex';
        const data = {
            groups: [
                {
                    ...toIconGroup(getIssueKindIconData(IssuesManager.Issue.IssueKind.PageError), iconSize),
                    text: countToString(IssuesManager.Issue.IssueKind.PageError, this.counts[0]),
                },
                {
                    ...toIconGroup(getIssueKindIconData(IssuesManager.Issue.IssueKind.BreakingChange), iconSize),
                    text: countToString(IssuesManager.Issue.IssueKind.BreakingChange, this.counts[1]),
                },
                {
                    ...toIconGroup(getIssueKindIconData(IssuesManager.Issue.IssueKind.Improvement), iconSize),
                    text: countToString(IssuesManager.Issue.IssueKind.Improvement, this.counts[2]),
                },
            ],
            clickHandler: this.clickHandler,
            leadingText: this.leadingText,
        };
        LitHtml.render(LitHtml.html `
        <style>
            :host {
              white-space: normal;
              display: inline-block;
            }
        </style>
        <icon-button .data=${data}
          aria-label="${LitHtml.Directives.ifDefined(this.accessibleName)}"></icon-button>
        `, this.shadow);
        this.tooltipCallback?.();
    }
}
ComponentHelpers.CustomElements.defineComponent('issue-counter', IssueCounter);
//# sourceMappingURL=IssueCounter.js.map