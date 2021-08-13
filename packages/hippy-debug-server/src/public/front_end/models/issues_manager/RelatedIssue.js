// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import { IssuesManager } from './IssuesManager.js';
function issuesAssociatedWithNetworkRequest(issues, request) {
    return issues.filter(issue => {
        for (const affectedRequest of issue.requests()) {
            if (affectedRequest.requestId === request.requestId()) {
                return true;
            }
        }
        return false;
    });
}
function issuesAssociatedWithCookie(issues, domain, name, path) {
    return issues.filter(issue => {
        for (const cookie of issue.cookies()) {
            if (cookie.domain === domain && cookie.name === name && cookie.path === path) {
                return true;
            }
        }
        return false;
    });
}
/**
 * @throws In case obj has an unsupported type (i.e. not part of the IssuesAssociatble union).
 */
export function issuesAssociatedWith(issues, obj) {
    if (obj instanceof SDK.NetworkRequest.NetworkRequest) {
        return issuesAssociatedWithNetworkRequest(issues, obj);
    }
    if (obj instanceof SDK.Cookie.Cookie) {
        return issuesAssociatedWithCookie(issues, obj.domain(), obj.name(), obj.path());
    }
    throw new Error(`issues can not be associated with ${JSON.stringify(obj)}`);
}
export function hasIssues(obj) {
    const issues = Array.from(IssuesManager.instance().issues());
    return issuesAssociatedWith(issues, obj).length > 0;
}
export function hasIssueOfCategory(obj, category) {
    const issues = Array.from(IssuesManager.instance().issues());
    return issuesAssociatedWith(issues, obj).some(issue => issue.getCategory() === category);
}
export async function reveal(obj, category) {
    const issues = Array.from(IssuesManager.instance().issues());
    const candidates = issuesAssociatedWith(issues, obj).filter(issue => !category || issue.getCategory() === category);
    if (candidates.length > 0) {
        return Common.Revealer.reveal(candidates[0]);
    }
}
//# sourceMappingURL=RelatedIssue.js.map