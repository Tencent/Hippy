import type * as Common from '../../core/common/common.js';
export declare class IssueRevealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): IssueRevealer;
    reveal(issue: Object): Promise<void>;
}
