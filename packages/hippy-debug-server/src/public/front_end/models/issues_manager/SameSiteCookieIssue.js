// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { resolveLazyDescription } from './MarkdownIssueDescription.js';
const UIStrings = {
    /**
    *@description Label for the link for SameSiteCookies Issues
    */
    samesiteCookiesExplained: 'SameSite cookies explained',
    /**
    *@description Label for the link for Schemeful Same-Site Issues
    */
    howSchemefulSamesiteWorks: 'How Schemeful Same-Site Works',
    /**
    *@description Phrase used to describe the security of a context. Substitued like 'a secure context' or 'a secure origin'.
    */
    aSecure: 'a secure',
    /**
    *@description Phrase used to describe the security of a context. Substitued like 'an insecure context' or 'an insecure origin'.
    */
    anInsecure: 'an insecure',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/SameSiteCookieIssue.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class SameSiteCookieIssue extends Issue {
    issueDetails;
    constructor(code, issueDetails, issuesModel) {
        super(code, issuesModel);
        this.issueDetails = issueDetails;
    }
    cookieId() {
        if (this.issueDetails.cookie) {
            const { domain, path, name } = this.issueDetails.cookie;
            const cookieId = `${domain};${path};${name}`;
            return cookieId;
        }
        return this.issueDetails.rawCookieLine ?? 'no-cookie-info';
    }
    primaryKey() {
        const requestId = this.issueDetails.request ? this.issueDetails.request.requestId : 'no-request';
        return `${this.code()}-(${this.cookieId()})-(${requestId})`;
    }
    /**
     * Returns an array of issues from a given SameSiteCookieIssueDetails.
     */
    static createIssuesFromSameSiteDetails(sameSiteDetails, issuesModel) {
        /** @type {!Array<!Issue>} */
        const issues = [];
        // Exclusion reasons have priority. It means a cookie was blocked. Create an issue
        // for every exclusion reason but ignore warning reasons if the cookie was blocked.
        // Some exclusion reasons are dependent on warning reasons existing in order to produce an issue.
        if (sameSiteDetails.cookieExclusionReasons && sameSiteDetails.cookieExclusionReasons.length > 0) {
            for (const exclusionReason of sameSiteDetails.cookieExclusionReasons) {
                const code = SameSiteCookieIssue.codeForSameSiteDetails(exclusionReason, sameSiteDetails.cookieWarningReasons, sameSiteDetails.operation, sameSiteDetails.cookieUrl);
                if (code) {
                    issues.push(new SameSiteCookieIssue(code, sameSiteDetails, issuesModel));
                }
            }
            return issues;
        }
        if (sameSiteDetails.cookieWarningReasons) {
            for (const warningReason of sameSiteDetails.cookieWarningReasons) {
                // warningReasons should be an empty array here.
                const code = SameSiteCookieIssue.codeForSameSiteDetails(warningReason, [], sameSiteDetails.operation, sameSiteDetails.cookieUrl);
                if (code) {
                    issues.push(new SameSiteCookieIssue(code, sameSiteDetails, issuesModel));
                }
            }
        }
        return issues;
    }
    /**
     * Calculates an issue code from a reason, an operation, and an array of warningReasons. All these together
     * can uniquely identify a specific SameSite cookie issue.
     * warningReasons is only needed for some SameSiteCookieExclusionReason in order to determine if an issue should be raised.
     * It is not required if reason is a SameSiteCookieWarningReason.
     */
    static codeForSameSiteDetails(reason, warningReasons, operation, cookieUrl) {
        const isURLSecure = cookieUrl && (cookieUrl.startsWith('https://') || cookieUrl.startsWith('wss://'));
        const secure = isURLSecure ? 'Secure' : 'Insecure';
        if (reason === "ExcludeSameSiteStrict" /* ExcludeSameSiteStrict */ ||
            reason === "ExcludeSameSiteLax" /* ExcludeSameSiteLax */ ||
            reason === "ExcludeSameSiteUnspecifiedTreatedAsLax" /* ExcludeSameSiteUnspecifiedTreatedAsLax */) {
            if (warningReasons && warningReasons.length > 0) {
                if (warningReasons.includes("WarnSameSiteStrictLaxDowngradeStrict" /* WarnSameSiteStrictLaxDowngradeStrict */)) {
                    return [
                        "SameSiteCookieIssue" /* SameSiteCookieIssue */,
                        'ExcludeNavigationContextDowngrade',
                        secure,
                    ].join('::');
                }
                if (warningReasons.includes("WarnSameSiteStrictCrossDowngradeStrict" /* WarnSameSiteStrictCrossDowngradeStrict */) ||
                    warningReasons.includes("WarnSameSiteStrictCrossDowngradeLax" /* WarnSameSiteStrictCrossDowngradeLax */) ||
                    warningReasons.includes("WarnSameSiteLaxCrossDowngradeStrict" /* WarnSameSiteLaxCrossDowngradeStrict */) ||
                    warningReasons.includes("WarnSameSiteLaxCrossDowngradeLax" /* WarnSameSiteLaxCrossDowngradeLax */)) {
                    return [
                        "SameSiteCookieIssue" /* SameSiteCookieIssue */,
                        'ExcludeContextDowngrade',
                        operation,
                        secure,
                    ].join('::');
                }
            }
            // If we have ExcludeSameSiteUnspecifiedTreatedAsLax but no corresponding warnings, then add just
            // the Issue code for ExcludeSameSiteUnspecifiedTreatedAsLax.
            if (reason === "ExcludeSameSiteUnspecifiedTreatedAsLax" /* ExcludeSameSiteUnspecifiedTreatedAsLax */) {
                return ["SameSiteCookieIssue" /* SameSiteCookieIssue */, reason, operation].join('::');
            }
            // ExcludeSameSiteStrict and ExcludeSameSiteLax require being paired with an appropriate warning. We didn't
            // find one of those warnings so return null to indicate there shouldn't be an issue created.
            return null;
        }
        if (reason === "WarnSameSiteStrictLaxDowngradeStrict" /* WarnSameSiteStrictLaxDowngradeStrict */) {
            return ["SameSiteCookieIssue" /* SameSiteCookieIssue */, reason, secure].join('::');
        }
        // These have the same message.
        if (reason === "WarnSameSiteStrictCrossDowngradeStrict" /* WarnSameSiteStrictCrossDowngradeStrict */ ||
            reason === "WarnSameSiteStrictCrossDowngradeLax" /* WarnSameSiteStrictCrossDowngradeLax */ ||
            reason === "WarnSameSiteLaxCrossDowngradeLax" /* WarnSameSiteLaxCrossDowngradeLax */ ||
            reason === "WarnSameSiteLaxCrossDowngradeStrict" /* WarnSameSiteLaxCrossDowngradeStrict */) {
            return ["SameSiteCookieIssue" /* SameSiteCookieIssue */, 'WarnCrossDowngrade', operation, secure].join('::');
        }
        return ["SameSiteCookieIssue" /* SameSiteCookieIssue */, reason, operation].join('::');
    }
    cookies() {
        if (this.issueDetails.cookie) {
            return [this.issueDetails.cookie];
        }
        return [];
    }
    requests() {
        if (this.issueDetails.request) {
            return [this.issueDetails.request];
        }
        return [];
    }
    getCategory() {
        return IssueCategory.SameSiteCookie;
    }
    getDescription() {
        const description = issueDescriptions.get(this.code());
        if (!description) {
            return null;
        }
        return resolveLazyDescription(description);
    }
    isCausedByThirdParty() {
        const topFrame = SDK.FrameManager.FrameManager.instance().getTopFrame();
        return isCausedByThirdParty(topFrame, this.issueDetails.cookieUrl);
    }
    getKind() {
        if (this.issueDetails.cookieExclusionReasons?.length > 0) {
            return IssueKind.PageError;
        }
        return IssueKind.BreakingChange;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const sameSiteDetails = inspectorIssue.details.sameSiteCookieIssueDetails;
        if (!sameSiteDetails) {
            console.warn('SameSite issue without details received.');
            return [];
        }
        return SameSiteCookieIssue.createIssuesFromSameSiteDetails(sameSiteDetails, issuesModel);
    }
}
/**
 * Exported for unit test.
 */
export function isCausedByThirdParty(topFrame, cookieUrl) {
    if (!topFrame) {
        // The top frame is not yet available. Consider this issue as a third-party issue
        // until the top frame is available. This will prevent the issue from being visible
        // for only just a split second.
        return true;
    }
    // In the case of no domain and registry, we assume its an IP address or localhost
    // during development, in this case we classify the issue as first-party.
    if (!cookieUrl || topFrame.domainAndRegistry() === '') {
        return false;
    }
    const parsedCookieUrl = Common.ParsedURL.ParsedURL.fromString(cookieUrl);
    if (!parsedCookieUrl) {
        return false;
    }
    // For both operation types we compare the cookieUrl's domain  with the top frames
    // registered domain to determine first-party vs third-party. If they don't match
    // then we consider this issue a third-party issue.
    //
    // For a Set operation: The Set-Cookie response is part of a request to a third-party.
    //
    // For a Read operation: The cookie was included in a request to a third-party
    //     site. Only cookies that have their domain also set to this third-party
    //     are included in the request. We assume that the cookie was set by the same
    //     third-party at some point, so we treat this as a third-party issue.
    //
    // TODO(crbug.com/1080589): Use "First-Party sets" instead of the sites registered domain.
    return !isSubdomainOf(parsedCookieUrl.domain(), topFrame.domainAndRegistry());
}
function isSubdomainOf(subdomain, superdomain) {
    // Subdomain must be identical or have strictly more labels than the
    // superdomain.
    if (subdomain.length <= superdomain.length) {
        return subdomain === superdomain;
    }
    // Superdomain must be suffix of subdomain, and the last character not
    // included in the matching substring must be a dot.
    if (!subdomain.endsWith(superdomain)) {
        return false;
    }
    const subdomainWithoutSuperdomian = subdomain.substr(0, subdomain.length - superdomain.length);
    return subdomainWithoutSuperdomian.endsWith('.');
}
const sameSiteUnspecifiedErrorRead = {
    file: 'SameSiteUnspecifiedTreatedAsLaxRead.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteUnspecifiedErrorSet = {
    file: 'SameSiteUnspecifiedTreatedAsLaxSet.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteUnspecifiedWarnRead = {
    file: 'SameSiteUnspecifiedLaxAllowUnsafeRead.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteUnspecifiedWarnSet = {
    file: 'SameSiteUnspecifiedLaxAllowUnsafeSet.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteNoneInsecureErrorRead = {
    file: 'SameSiteNoneInsecureErrorRead.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteNoneInsecureErrorSet = {
    file: 'SameSiteNoneInsecureErrorSet.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteNoneInsecureWarnRead = {
    file: 'SameSiteNoneInsecureWarnRead.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const sameSiteNoneInsecureWarnSet = {
    file: 'SameSiteNoneInsecureWarnSet.md',
    links: [
        {
            link: 'https://web.dev/samesite-cookies-explained/',
            linkTitle: i18nLazyString(UIStrings.samesiteCookiesExplained),
        },
    ],
};
const schemefulSameSiteArticles = [{ link: 'https://web.dev/schemeful-samesite/', linkTitle: i18nLazyString(UIStrings.howSchemefulSamesiteWorks) }];
function sameSiteWarnStrictLaxDowngradeStrict(isSecure) {
    const substitutions = new Map([
        ['PLACEHOLDER_destination', isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
        ['PLACEHOLDER_origin', !isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
    ]);
    return {
        file: 'SameSiteWarnStrictLaxDowngradeStrict.md',
        substitutions,
        links: schemefulSameSiteArticles,
    };
}
function sameSiteExcludeNavigationContextDowngrade(isSecure) {
    const substitutions = new Map([
        ['PLACEHOLDER_destination', isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
        ['PLACEHOLDER_origin', !isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
    ]);
    return {
        file: 'SameSiteExcludeNavigationContextDowngrade.md',
        substitutions,
        links: schemefulSameSiteArticles,
    };
}
function sameSiteWarnCrossDowngradeRead(isSecure) {
    const substitutions = new Map([
        ['PLACEHOLDER_destination', isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
        ['PLACEHOLDER_origin', !isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
    ]);
    return {
        file: 'SameSiteWarnCrossDowngradeRead.md',
        substitutions,
        links: schemefulSameSiteArticles,
    };
}
function sameSiteExcludeContextDowngradeRead(isSecure) {
    const substitutions = new Map([
        ['PLACEHOLDER_destination', isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
        ['PLACEHOLDER_origin', !isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
    ]);
    return {
        file: 'SameSiteExcludeContextDowngradeRead.md',
        substitutions,
        links: schemefulSameSiteArticles,
    };
}
function sameSiteWarnCrossDowngradeSet(isSecure) {
    const substitutions = new Map([
        ['PLACEHOLDER_ORIGIN', isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
        ['PLACEHOLDER_DESTINATION', !isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
    ]);
    return {
        file: 'SameSiteWarnCrossDowngradeSet.md',
        substitutions,
        links: schemefulSameSiteArticles,
    };
}
function sameSiteExcludeContextDowngradeSet(isSecure) {
    const substitutions = new Map([
        ['PLACEHOLDER_destination', isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
        ['PLACEHOLDER_origin', !isSecure ? i18nLazyString(UIStrings.aSecure) : i18nLazyString(UIStrings.anInsecure)],
    ]);
    return {
        file: 'SameSiteExcludeContextDowngradeSet.md',
        substitutions,
        links: schemefulSameSiteArticles,
    };
}
const issueDescriptions = new Map([
    ['SameSiteCookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::ReadCookie', sameSiteUnspecifiedErrorRead],
    ['SameSiteCookieIssue::ExcludeSameSiteUnspecifiedTreatedAsLax::SetCookie', sameSiteUnspecifiedErrorSet],
    // These two don't have a deprecation date yet, but they need to be fixed eventually.
    ['SameSiteCookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::ReadCookie', sameSiteUnspecifiedWarnRead],
    ['SameSiteCookieIssue::WarnSameSiteUnspecifiedLaxAllowUnsafe::SetCookie', sameSiteUnspecifiedWarnSet],
    ['SameSiteCookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::ReadCookie', sameSiteUnspecifiedWarnRead],
    ['SameSiteCookieIssue::WarnSameSiteUnspecifiedCrossSiteContext::SetCookie', sameSiteUnspecifiedWarnSet],
    ['SameSiteCookieIssue::ExcludeSameSiteNoneInsecure::ReadCookie', sameSiteNoneInsecureErrorRead],
    ['SameSiteCookieIssue::ExcludeSameSiteNoneInsecure::SetCookie', sameSiteNoneInsecureErrorSet],
    ['SameSiteCookieIssue::WarnSameSiteNoneInsecure::ReadCookie', sameSiteNoneInsecureWarnRead],
    ['SameSiteCookieIssue::WarnSameSiteNoneInsecure::SetCookie', sameSiteNoneInsecureWarnSet],
    ['SameSiteCookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Secure', sameSiteWarnStrictLaxDowngradeStrict(true)],
    ['SameSiteCookieIssue::WarnSameSiteStrictLaxDowngradeStrict::Insecure', sameSiteWarnStrictLaxDowngradeStrict(false)],
    ['SameSiteCookieIssue::WarnCrossDowngrade::ReadCookie::Secure', sameSiteWarnCrossDowngradeRead(true)],
    ['SameSiteCookieIssue::WarnCrossDowngrade::ReadCookie::Insecure', sameSiteWarnCrossDowngradeRead(false)],
    ['SameSiteCookieIssue::WarnCrossDowngrade::SetCookie::Secure', sameSiteWarnCrossDowngradeSet(true)],
    ['SameSiteCookieIssue::WarnCrossDowngrade::SetCookie::Insecure', sameSiteWarnCrossDowngradeSet(false)],
    ['SameSiteCookieIssue::ExcludeNavigationContextDowngrade::Secure', sameSiteExcludeNavigationContextDowngrade(true)],
    [
        'SameSiteCookieIssue::ExcludeNavigationContextDowngrade::Insecure',
        sameSiteExcludeNavigationContextDowngrade(false),
    ],
    ['SameSiteCookieIssue::ExcludeContextDowngrade::ReadCookie::Secure', sameSiteExcludeContextDowngradeRead(true)],
    ['SameSiteCookieIssue::ExcludeContextDowngrade::ReadCookie::Insecure', sameSiteExcludeContextDowngradeRead(false)],
    ['SameSiteCookieIssue::ExcludeContextDowngrade::SetCookie::Secure', sameSiteExcludeContextDowngradeSet(true)],
    ['SameSiteCookieIssue::ExcludeContextDowngrade::SetCookie::Insecure', sameSiteExcludeContextDowngradeSet(false)],
]);
//# sourceMappingURL=SameSiteCookieIssue.js.map