// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as DataGrid from '../../ui/components/data_grid/data_grid.js';
import * as Linkifier from '../../ui/components/linkifier/linkifier.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LitHtml from '../../ui/lit-html/lit-html.js';
export class CSPViolationsListView extends UI.Widget.VBox {
    table = new DataGrid.DataGridController.DataGridController();
    categoryFilter = new Set();
    issueRows = new Map();
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/issues/cspViolationsListView.css', { enableLegacyPatching: false });
        this.table.data = {
            columns: [
                { id: 'sourceCode', title: 'Source Code', sortable: false, widthWeighting: 1, visible: true, hideable: false },
                {
                    id: 'violatedDirective',
                    title: 'Violated Directive',
                    sortable: false,
                    widthWeighting: 1,
                    visible: true,
                    hideable: false,
                },
                { id: 'category', title: 'Category', sortable: false, widthWeighting: 1, visible: true, hideable: false },
                { id: 'status', title: 'Status', sortable: false, widthWeighting: 1, visible: true, hideable: false },
            ],
            rows: [],
        };
        this.contentElement.appendChild(this.table);
    }
    updateTextFilter(filter) {
        if (filter.length === 0) {
            this.table.data = { ...this.table.data, filters: [] };
        }
        else {
            this.table.data = {
                ...this.table.data,
                filters: [{ text: filter, key: undefined, regex: undefined, negative: false }],
            };
        }
    }
    updateCategoryFilter(categories) {
        this.categoryFilter = categories;
        const rows = [];
        for (const [issue, row] of this.issueRows.entries()) {
            if (this.isIssueInFilterCategories(issue)) {
                rows.push(row);
            }
        }
        this.table.data = { ...this.table.data, rows: rows };
    }
    isIssueInFilterCategories(issue) {
        return (this.categoryFilter.has(issue.code()) || this.categoryFilter.size === 0);
    }
    addIssue(issue) {
        const location = IssuesManager.Issue.toZeroBasedLocation(issue.details().sourceCodeLocation);
        if (!location) {
            return;
        }
        const status = issue.details().isReportOnly ? 'report-only' : 'blocked';
        const category = this.issueViolationCodeToCategoryName(issue.code());
        const newIssue = {
            cells: [
                {
                    columnId: 'sourceCode',
                    value: location.url,
                    renderer() {
                        return LitHtml.html `<${Linkifier.Linkifier.Linkifier.litTagName} .data=${location}></${Linkifier.Linkifier.Linkifier.litTagName}>`;
                    },
                },
                { columnId: 'violatedDirective', value: issue.details().violatedDirective },
                { columnId: 'category', value: category },
                { columnId: 'status', value: status },
            ],
        };
        this.issueRows.set(issue, newIssue);
        if (this.isIssueInFilterCategories(issue)) {
            this.table.data.rows.push(newIssue);
            this.table.data = { ...this.table.data };
        }
    }
    clearIssues() {
        this.issueRows.clear();
        this.table.data = { ...this.table.data, rows: [] };
    }
    issueViolationCodeToCategoryName(code) {
        if (code === IssuesManager.ContentSecurityPolicyIssue.inlineViolationCode) {
            return 'Inline Violation';
        }
        if (code === IssuesManager.ContentSecurityPolicyIssue.urlViolationCode) {
            return 'URL Violation';
        }
        if (code === IssuesManager.ContentSecurityPolicyIssue.evalViolationCode) {
            return 'Eval Violation';
        }
        if (code === IssuesManager.ContentSecurityPolicyIssue.trustedTypesSinkViolationCode) {
            return 'Sink Violation';
        }
        if (code === IssuesManager.ContentSecurityPolicyIssue.trustedTypesPolicyViolationCode) {
            return 'Policy Violation';
        }
        return 'unknown';
    }
}
//# sourceMappingURL=CSPViolationsListView.js.map