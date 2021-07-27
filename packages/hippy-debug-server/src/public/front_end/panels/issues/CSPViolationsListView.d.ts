import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class CSPViolationsListView extends UI.Widget.VBox {
    private table;
    private categoryFilter;
    private issueRows;
    constructor();
    updateTextFilter(filter: string): void;
    updateCategoryFilter(categories: Set<string>): void;
    private isIssueInFilterCategories;
    addIssue(issue: IssuesManager.ContentSecurityPolicyIssue.ContentSecurityPolicyIssue): void;
    clearIssues(): void;
    private issueViolationCodeToCategoryName;
}
