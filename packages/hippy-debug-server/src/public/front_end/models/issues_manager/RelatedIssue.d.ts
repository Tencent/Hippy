import * as SDK from '../../core/sdk/sdk.js';
import type { Issue, IssueCategory } from './Issue.js';
export declare type IssuesAssociatable = SDK.NetworkRequest.NetworkRequest | SDK.Cookie.Cookie;
/**
 * @throws In case obj has an unsupported type (i.e. not part of the IssuesAssociatble union).
 */
export declare function issuesAssociatedWith(issues: Issue[], obj: IssuesAssociatable): Issue[];
export declare function hasIssues(obj: IssuesAssociatable): boolean;
export declare function hasIssueOfCategory(obj: IssuesAssociatable, category: IssueCategory): boolean;
export declare function reveal(obj: IssuesAssociatable, category?: IssueCategory): Promise<void | undefined>;
