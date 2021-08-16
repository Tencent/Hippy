// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as Root from '../root/root.js';
import { Cookie } from './Cookie.js'; // eslint-disable-line no-unused-vars
import { ResourceTreeModel } from './ResourceTreeModel.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class CookieModel extends SDKModel {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _blockedCookies;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _cookieToBlockedReasons;
    constructor(target) {
        super(target);
        /** Array<!Cookie> */
        this._blockedCookies = new Map();
        this._cookieToBlockedReasons = new Map();
    }
    addBlockedCookie(cookie, blockedReasons) {
        const key = cookie.key();
        const previousCookie = this._blockedCookies.get(key);
        this._blockedCookies.set(key, cookie);
        this._cookieToBlockedReasons.set(cookie, blockedReasons);
        if (previousCookie) {
            this._cookieToBlockedReasons.delete(key);
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getCookieToBlockedReasonsMap() {
        return this._cookieToBlockedReasons;
    }
    async getCookies(urls) {
        const response = await this.target().networkAgent().invoke_getCookies({ urls });
        if (response.getError()) {
            return [];
        }
        const normalCookies = response.cookies.map(Cookie.fromProtocolCookie);
        return normalCookies.concat(Array.from(this._blockedCookies.values()));
    }
    async deleteCookie(cookie) {
        await this.deleteCookies([cookie]);
    }
    async clear(domain, securityOrigin) {
        const cookies = await this.getCookiesForDomain(domain || null);
        if (securityOrigin) {
            const cookiesToDelete = cookies.filter(cookie => {
                return cookie.matchesSecurityOrigin(securityOrigin);
            });
            await this.deleteCookies(cookiesToDelete);
        }
        else {
            await this.deleteCookies(cookies);
        }
    }
    async saveCookie(cookie) {
        let domain = cookie.domain();
        if (!domain.startsWith('.')) {
            domain = '';
        }
        let expires = undefined;
        if (cookie.expires()) {
            expires = Math.floor(Date.parse(`${cookie.expires()}`) / 1000);
        }
        const enabled = Root.Runtime.experiments.isEnabled('experimentalCookieFeatures');
        const preserveUnset = (scheme) => scheme === "Unset" /* Unset */ ? scheme : undefined;
        const protocolCookie = {
            name: cookie.name(),
            value: cookie.value(),
            url: cookie.url() || undefined,
            domain,
            path: cookie.path(),
            secure: cookie.secure(),
            httpOnly: cookie.httpOnly(),
            sameSite: cookie.sameSite(),
            expires,
            priority: cookie.priority(),
            sameParty: cookie.sameParty(),
            sourceScheme: enabled ? cookie.sourceScheme() : preserveUnset(cookie.sourceScheme()),
            sourcePort: enabled ? cookie.sourcePort() : undefined,
        };
        const response = await this.target().networkAgent().invoke_setCookie(protocolCookie);
        const error = response.getError();
        if (error || !response.success) {
            return false;
        }
        return response.success;
    }
    /**
     * Returns cookies needed by current page's frames whose security origins are |domain|.
     */
    getCookiesForDomain(domain) {
        const resourceURLs = [];
        function populateResourceURLs(resource) {
            const documentURL = Common.ParsedURL.ParsedURL.fromString(resource.documentURL);
            if (documentURL && (!domain || documentURL.securityOrigin() === domain)) {
                resourceURLs.push(resource.url);
            }
            return false;
        }
        const resourceTreeModel = this.target().model(ResourceTreeModel);
        if (resourceTreeModel) {
            // In case the current frame was unreachable, add it's cookies
            // because they might help to debug why the frame was unreachable.
            if (resourceTreeModel.mainFrame && resourceTreeModel.mainFrame.unreachableUrl()) {
                resourceURLs.push(resourceTreeModel.mainFrame.unreachableUrl());
            }
            resourceTreeModel.forAllResources(populateResourceURLs);
        }
        return this.getCookies(resourceURLs);
    }
    async deleteCookies(cookies) {
        const networkAgent = this.target().networkAgent();
        this._blockedCookies.clear();
        this._cookieToBlockedReasons.clear();
        await Promise.all(cookies.map(cookie => networkAgent.invoke_deleteCookies({ name: cookie.name(), url: undefined, domain: cookie.domain(), path: cookie.path() })));
    }
}
SDKModel.register(CookieModel, { capabilities: Capability.Network, autostart: false });
//# sourceMappingURL=CookieModel.js.map