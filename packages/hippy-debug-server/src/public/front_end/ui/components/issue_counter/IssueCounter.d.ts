import * as Common from '../../../core/common/common.js';
import * as IssuesManager from '../../../models/issues_manager/issues_manager.js';
import type * as IconButton from '../icon_button/icon_button.js';
export declare function getIssueKindIconData(issueKind: IssuesManager.Issue.IssueKind): IconButton.Icon.IconWithName;
export declare function getIssueKindDescription(issueKind: IssuesManager.Issue.IssueKind): Common.UIString.LocalizedString;
export declare const enum DisplayMode {
    OmitEmpty = "OmitEmpty",
    ShowAlways = "ShowAlways",
    OnlyMostImportant = "OnlyMostImportant"
}
export interface IssueCounterData {
    clickHandler?: () => void;
    tooltipCallback?: () => void;
    leadingText?: string;
    displayMode?: DisplayMode;
    issuesManager: IssuesManager.IssuesManager.IssuesManager;
    throttlerTimeout?: number;
    accessibleName?: string;
}
export declare function getIssueCountsEnumeration(issuesManager: IssuesManager.IssuesManager.IssuesManager, omitEmpty?: boolean): string;
export declare class IssueCounter extends HTMLElement {
    private readonly shadow;
    private clickHandler;
    private tooltipCallback;
    private leadingText;
    private throttler;
    private counts;
    private displayMode;
    private issuesManager;
    private accessibleName;
    private throttlerTimeout;
    scheduleUpdate(): void;
    set data(data: IssueCounterData);
    get data(): IssueCounterData;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'issue-counter': IssueCounter;
    }
}
