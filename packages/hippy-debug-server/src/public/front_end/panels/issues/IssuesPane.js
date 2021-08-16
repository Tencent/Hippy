// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as IssueCounter from '../../ui/components/issue_counter/issue_counter.js';
import * as UI from '../../ui/legacy/legacy.js';
import { IssueAggregator } from './IssueAggregator.js';
import { IssueView } from './IssueView.js';
const UIStrings = {
    /**
     * @description Category title for a group of cross origin embedder policy (COEP) issues
     */
    crossOriginEmbedderPolicy: 'Cross Origin Embedder Policy',
    /**
     * @description Category title for a group of mixed content issues
     */
    mixedContent: 'Mixed Content',
    /**
     * @description Category title for a group of SameSite cookie issues
     */
    samesiteCookie: 'SameSite Cookie',
    /**
     * @description Category title for a group of heavy ads issues
     */
    heavyAds: 'Heavy Ads',
    /**
     * @description Category title for a group of content security policy (CSP) issues
     */
    contentSecurityPolicy: 'Content Security Policy',
    /**
     * @description Category title for a group of trusted web activity issues
     */
    trustedWebActivity: 'Trusted Web Activity',
    /**
     * @description Text for other types of items
     */
    other: 'Other',
    /**
     * @description Category title for the different 'low text contrast' issues. Low text contrast refers
     *              to the difference between the color of a text and the background color where that text
     *              appears.
     */
    lowTextContrast: 'Low Text Contrast',
    /**
     * @description Category title for the different 'Cross-Origin Resource Sharing' (CORS) issues. CORS
     *              refers to one origin (e.g 'a.com') loading resources from another origin (e.g. 'b.com').
     */
    cors: 'Cross Origin Resource Sharing',
    /**
     * @description Title for a checkbox which toggles grouping by category in the issues tab
     */
    groupDisplayedIssuesUnder: 'Group displayed issues under associated categories',
    /**
     * @description Label for a checkbox which toggles grouping by category in the issues tab
     */
    groupByCategory: 'Group by category',
    /**
     * @description Title for a checkbox. Whether the issues tab should include third-party issues or not.
     */
    includeCookieIssuesCausedBy: 'Include cookie Issues caused by third-party sites',
    /**
     * @description Label for a checkbox. Whether the issues tab should include third-party issues or not.
     */
    includeThirdpartyCookieIssues: 'Include third-party cookie issues',
    /**
     * @description Label on the issues tab
     */
    onlyThirdpartyCookieIssues: 'Only third-party cookie issues detected so far',
    /**
     * @description Label in the issues panel
     */
    noIssuesDetectedSoFar: 'No issues detected so far',
    /**
     * @description Category title for the different 'Attribution Reporting API' issues. The
     * Attribution Reporting API is a newly proposed web API (see https://github.com/WICG/conversion-measurement-api).
     */
    attributionReporting: 'Attribution Reporting `API`',
    /**
     * @description Category title for the different 'Quirks Mode' issues. Quirks Mode refers
     *              to the legacy browser modes that displays web content according to outdated
     *              browser behaviors.
     */
    quirksMode: 'Quirks Mode',
};
const str_ = i18n.i18n.registerUIStrings('panels/issues/IssuesPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class IssueCategoryView extends UI.TreeOutline.TreeElement {
    category;
    issues;
    constructor(category) {
        super();
        this.category = category;
        this.issues = [];
        this.toggleOnClick = true;
        this.listItemElement.classList.add('issue-category');
    }
    getCategoryName() {
        switch (this.category) {
            case IssuesManager.Issue.IssueCategory.CrossOriginEmbedderPolicy:
                return i18nString(UIStrings.crossOriginEmbedderPolicy);
            case IssuesManager.Issue.IssueCategory.MixedContent:
                return i18nString(UIStrings.mixedContent);
            case IssuesManager.Issue.IssueCategory.SameSiteCookie:
                return i18nString(UIStrings.samesiteCookie);
            case IssuesManager.Issue.IssueCategory.HeavyAd:
                return i18nString(UIStrings.heavyAds);
            case IssuesManager.Issue.IssueCategory.ContentSecurityPolicy:
                return i18nString(UIStrings.contentSecurityPolicy);
            case IssuesManager.Issue.IssueCategory.TrustedWebActivity:
                return i18nString(UIStrings.trustedWebActivity);
            case IssuesManager.Issue.IssueCategory.LowTextContrast:
                return i18nString(UIStrings.lowTextContrast);
            case IssuesManager.Issue.IssueCategory.Cors:
                return i18nString(UIStrings.cors);
            case IssuesManager.Issue.IssueCategory.AttributionReporting:
                return i18nString(UIStrings.attributionReporting);
            case IssuesManager.Issue.IssueCategory.QuirksMode:
                return i18nString(UIStrings.quirksMode);
            case IssuesManager.Issue.IssueCategory.Other:
                return i18nString(UIStrings.other);
        }
    }
    onattach() {
        this.appendHeader();
    }
    appendHeader() {
        const header = document.createElement('div');
        header.classList.add('header');
        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = this.getCategoryName();
        header.appendChild(title);
        this.listItemElement.appendChild(header);
    }
}
export function getGroupIssuesByCategorySetting() {
    return Common.Settings.Settings.instance().createSetting('groupIssuesByCategory', false);
}
let issuesPaneInstance;
export class IssuesPane extends UI.Widget.VBox {
    categoryViews;
    issueViews;
    showThirdPartyCheckbox;
    issuesTree;
    noIssuesMessageDiv;
    issuesManager;
    aggregator;
    issueViewUpdatePromise = Promise.resolve();
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/issues/issuesPane.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('issues-pane');
        this.categoryViews = new Map();
        this.issueViews = new Map();
        this.showThirdPartyCheckbox = null;
        this.createToolbars();
        this.issuesTree = new UI.TreeOutline.TreeOutlineInShadow();
        this.issuesTree.registerRequiredCSS('panels/issues/issuesTree.css', { enableLegacyPatching: false });
        this.issuesTree.setShowSelectionOnKeyboardFocus(true);
        this.issuesTree.contentElement.classList.add('issues');
        this.contentElement.appendChild(this.issuesTree.element);
        this.noIssuesMessageDiv = document.createElement('div');
        this.noIssuesMessageDiv.classList.add('issues-pane-no-issues');
        this.contentElement.appendChild(this.noIssuesMessageDiv);
        this.issuesManager = IssuesManager.IssuesManager.IssuesManager.instance();
        this.aggregator = new IssueAggregator(this.issuesManager);
        this.aggregator.addEventListener("AggregatedIssueUpdated" /* AggregatedIssueUpdated */, this.issueUpdated, this);
        this.aggregator.addEventListener("FullUpdateRequired" /* FullUpdateRequired */, this.fullUpdate, this);
        for (const issue of this.aggregator.aggregatedIssues()) {
            this.scheduleIssueViewUpdate(issue);
        }
        this.issuesManager.addEventListener(IssuesManager.IssuesManager.Events.IssuesCountUpdated, this.updateCounts, this);
        this.updateCounts();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!issuesPaneInstance || forceNew) {
            issuesPaneInstance = new IssuesPane();
        }
        return issuesPaneInstance;
    }
    elementsToRestoreScrollPositionsFor() {
        return [this.issuesTree.element];
    }
    createToolbars() {
        const toolbarContainer = this.contentElement.createChild('div', 'issues-toolbar-container');
        new UI.Toolbar.Toolbar('issues-toolbar-left', toolbarContainer);
        const rightToolbar = new UI.Toolbar.Toolbar('issues-toolbar-right', toolbarContainer);
        const groupByCategorySetting = getGroupIssuesByCategorySetting();
        const groupByCategoryCheckbox = new UI.Toolbar.ToolbarSettingCheckbox(groupByCategorySetting, i18nString(UIStrings.groupDisplayedIssuesUnder), i18nString(UIStrings.groupByCategory));
        // Hide the option to toggle category grouping for now.
        groupByCategoryCheckbox.setVisible(false);
        rightToolbar.appendToolbarItem(groupByCategoryCheckbox);
        groupByCategorySetting.addChangeListener(() => {
            this.fullUpdate();
        });
        const thirdPartySetting = IssuesManager.Issue.getShowThirdPartyIssuesSetting();
        this.showThirdPartyCheckbox = new UI.Toolbar.ToolbarSettingCheckbox(thirdPartySetting, i18nString(UIStrings.includeCookieIssuesCausedBy), i18nString(UIStrings.includeThirdpartyCookieIssues));
        rightToolbar.appendToolbarItem(this.showThirdPartyCheckbox);
        this.setDefaultFocusedElement(this.showThirdPartyCheckbox.inputElement);
        rightToolbar.appendSeparator();
        const issueCounter = new IssueCounter.IssueCounter.IssueCounter();
        issueCounter.data = {
            tooltipCallback: () => {
                const issueEnumeration = IssueCounter.IssueCounter.getIssueCountsEnumeration(IssuesManager.IssuesManager.IssuesManager.instance(), false);
                UI.Tooltip.Tooltip.install(issueCounter, issueEnumeration);
            },
            displayMode: "ShowAlways" /* ShowAlways */,
            issuesManager: IssuesManager.IssuesManager.IssuesManager.instance(),
        };
        issueCounter.id = 'console-issues-counter';
        const issuesToolbarItem = new UI.Toolbar.ToolbarItem(issueCounter);
        rightToolbar.appendToolbarItem(issuesToolbarItem);
        return { toolbarContainer };
    }
    issueUpdated(event) {
        const issue = event.data;
        this.scheduleIssueViewUpdate(issue);
    }
    scheduleIssueViewUpdate(issue) {
        this.issueViewUpdatePromise = this.issueViewUpdatePromise.then(() => this.updateIssueView(issue));
    }
    /** Don't call directly. Use `scheduleIssueViewUpdate` instead. */
    async updateIssueView(issue) {
        let issueView = this.issueViews.get(issue.code());
        if (!issueView) {
            const description = issue.getDescription();
            if (!description) {
                console.warn('Could not find description for issue code:', issue.code());
                return;
            }
            const markdownDescription = await IssuesManager.MarkdownIssueDescription.createIssueDescriptionFromMarkdown(description);
            issueView = new IssueView(this, issue, markdownDescription);
            this.issueViews.set(issue.code(), issueView);
            const parent = this.getIssueViewParent(issue);
            parent.appendChild(issueView, (a, b) => {
                if (a instanceof IssueView && b instanceof IssueView) {
                    return a.getIssueTitle().localeCompare(b.getIssueTitle());
                }
                console.error('The issues tree should only contain IssueView objects as direct children');
                return 0;
            });
        }
        issueView.update();
        this.updateCounts();
    }
    getIssueViewParent(issue) {
        if (!getGroupIssuesByCategorySetting().get()) {
            return this.issuesTree;
        }
        const category = issue.getCategory();
        const view = this.categoryViews.get(category);
        if (view) {
            return view;
        }
        const newView = new IssueCategoryView(category);
        this.issuesTree.appendChild(newView, (a, b) => {
            if (a instanceof IssueCategoryView && b instanceof IssueCategoryView) {
                return a.getCategoryName().localeCompare(b.getCategoryName());
            }
            return 0;
        });
        this.categoryViews.set(category, newView);
        return newView;
    }
    clearViews(views) {
        for (const view of views.values()) {
            view.parent && view.parent.removeChild(view);
        }
        views.clear();
    }
    fullUpdate() {
        this.clearViews(this.categoryViews);
        this.clearViews(this.issueViews);
        if (this.aggregator) {
            for (const issue of this.aggregator.aggregatedIssues()) {
                this.scheduleIssueViewUpdate(issue);
            }
        }
        this.updateCounts();
    }
    updateCounts() {
        this.showIssuesTreeOrNoIssuesDetectedMessage(this.issuesManager.numberOfIssues());
    }
    showIssuesTreeOrNoIssuesDetectedMessage(issuesCount) {
        if (issuesCount > 0) {
            this.issuesTree.element.hidden = false;
            this.noIssuesMessageDiv.style.display = 'none';
            const firstChild = this.issuesTree.firstChild();
            if (firstChild) {
                firstChild.select(/* omitFocus= */ true);
                this.setDefaultFocusedElement(firstChild.listItemElement);
            }
        }
        else {
            this.issuesTree.element.hidden = true;
            if (this.showThirdPartyCheckbox) {
                this.setDefaultFocusedElement(this.showThirdPartyCheckbox.inputElement);
            }
            // We alreay know that issesCount is zero here.
            const hasOnlyThirdPartyIssues = this.issuesManager.numberOfAllStoredIssues() > 0;
            this.noIssuesMessageDiv.textContent = hasOnlyThirdPartyIssues ? i18nString(UIStrings.onlyThirdpartyCookieIssues) :
                i18nString(UIStrings.noIssuesDetectedSoFar);
            this.noIssuesMessageDiv.style.display = 'flex';
        }
    }
    revealByCode(code) {
        const issueView = this.issueViews.get(code);
        if (issueView) {
            issueView.expand();
            issueView.reveal();
            issueView.select();
        }
    }
}
//# sourceMappingURL=IssuesPane.js.map