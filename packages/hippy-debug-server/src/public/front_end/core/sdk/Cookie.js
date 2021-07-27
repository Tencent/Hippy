// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class Cookie {
    _name;
    _value;
    _type;
    _attributes;
    _size;
    _priority;
    _cookieLine;
    constructor(name, value, type, priority) {
        this._name = name;
        this._value = value;
        this._type = type;
        this._attributes = {};
        this._size = 0;
        this._priority = (priority || 'Medium');
        this._cookieLine = null;
    }
    static fromProtocolCookie(protocolCookie) {
        const cookie = new Cookie(protocolCookie.name, protocolCookie.value, null, protocolCookie.priority);
        cookie.addAttribute('domain', protocolCookie['domain']);
        cookie.addAttribute('path', protocolCookie['path']);
        if (protocolCookie['expires']) {
            cookie.addAttribute('expires', protocolCookie['expires'] * 1000);
        }
        if (protocolCookie['httpOnly']) {
            cookie.addAttribute('httpOnly');
        }
        if (protocolCookie['secure']) {
            cookie.addAttribute('secure');
        }
        if (protocolCookie['sameSite']) {
            cookie.addAttribute('sameSite', protocolCookie['sameSite']);
        }
        if (protocolCookie.sameParty) {
            cookie.addAttribute('sameParty');
        }
        if ('sourcePort' in protocolCookie) {
            cookie.addAttribute('sourcePort', protocolCookie.sourcePort);
        }
        if ('sourceScheme' in protocolCookie) {
            cookie.addAttribute('sourceScheme', protocolCookie.sourceScheme);
        }
        cookie.setSize(protocolCookie['size']);
        return cookie;
    }
    key() {
        return (this.domain() || '-') + ' ' + this.name() + ' ' + (this.path() || '-');
    }
    name() {
        return this._name;
    }
    value() {
        return this._value;
    }
    type() {
        return this._type;
    }
    httpOnly() {
        return 'httponly' in this._attributes;
    }
    secure() {
        return 'secure' in this._attributes;
    }
    sameSite() {
        // TODO(allada) This should not rely on _attributes and instead store them individually.
        // when attributes get added via addAttribute() they are lowercased, hence the lowercasing of samesite here
        return /** @type {!Protocol.Network.CookieSameSite} */ this._attributes['samesite'];
    }
    /** boolean
     */
    sameParty() {
        return 'sameparty' in this._attributes;
    }
    priority() {
        return this._priority;
    }
    session() {
        // RFC 2965 suggests using Discard attribute to mark session cookies, but this does not seem to be widely used.
        // Check for absence of explicitly max-age or expiry date instead.
        return !('expires' in this._attributes || 'max-age' in this._attributes);
    }
    path() {
        return /** @type {string} */ this._attributes['path'];
    }
    domain() {
        return /** @type {string} */ this._attributes['domain'];
    }
    expires() {
        return /** @type {number} */ this._attributes['expires'];
    }
    maxAge() {
        return /** @type {number} */ this._attributes['max-age'];
    }
    sourcePort() {
        return /** @type {number} */ this._attributes['sourceport'];
    }
    sourceScheme() {
        return /** @type {Protocol.Network.CookieSourceScheme} */ this._attributes['sourcescheme'];
    }
    size() {
        return this._size;
    }
    /**
     * @deprecated
     */
    url() {
        if (!this.domain() || !this.path()) {
            return null;
        }
        let port = '';
        const sourcePort = this.sourcePort();
        // Do not include standard ports to ensure the back-end will change standard ports according to the scheme.
        if (sourcePort && sourcePort !== 80 && sourcePort !== 443) {
            port = `:${this.sourcePort()}`;
        }
        // We must not consider the this.sourceScheme() here, otherwise it will be impossible to set a cookie without
        // the Secure attribute from a secure origin.
        return (this.secure() ? 'https://' : 'http://') + this.domain() + port + this.path();
    }
    setSize(size) {
        this._size = size;
    }
    expiresDate(requestDate) {
        // RFC 6265 indicates that the max-age attribute takes precedence over the expires attribute
        if (this.maxAge()) {
            return new Date(requestDate.getTime() + 1000 * this.maxAge());
        }
        if (this.expires()) {
            return new Date(this.expires());
        }
        return null;
    }
    addAttribute(key, value) {
        const normalizedKey = key.toLowerCase();
        switch (normalizedKey) {
            case 'priority':
                this._priority = value;
                break;
            default:
                this._attributes[normalizedKey] = value;
        }
    }
    setCookieLine(cookieLine) {
        this._cookieLine = cookieLine;
    }
    getCookieLine() {
        return this._cookieLine;
    }
    matchesSecurityOrigin(securityOrigin) {
        const hostname = new URL(securityOrigin).hostname;
        return Cookie.isDomainMatch(this.domain(), hostname);
    }
    static isDomainMatch(domain, hostname) {
        // This implementation mirrors
        // https://source.chromium.org/search?q=net::cookie_util::IsDomainMatch()
        //
        // Can domain match in two ways; as a domain cookie (where the cookie
        // domain begins with ".") or as a host cookie (where it doesn't).
        // Some consumers of the CookieMonster expect to set cookies on
        // URLs like http://.strange.url.  To retrieve cookies in this instance,
        // we allow matching as a host cookie even when the domain_ starts with
        // a period.
        if (hostname === domain) {
            return true;
        }
        // Domain cookie must have an initial ".".  To match, it must be
        // equal to url's host with initial period removed, or a suffix of
        // it.
        // Arguably this should only apply to "http" or "https" cookies, but
        // extension cookie tests currently use the funtionality, and if we
        // ever decide to implement that it should be done by preventing
        // such cookies from being set.
        if (!domain || domain[0] !== '.') {
            return false;
        }
        // The host with a "." prefixed.
        if (domain.substr(1) === hostname) {
            return true;
        }
        // A pure suffix of the host (ok since we know the domain already
        // starts with a ".")
        return hostname.length > domain.length && hostname.endsWith(domain);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Type;
(function (Type) {
    Type[Type["Request"] = 0] = "Request";
    Type[Type["Response"] = 1] = "Response";
})(Type || (Type = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Attributes;
(function (Attributes) {
    Attributes["Name"] = "name";
    Attributes["Value"] = "value";
    Attributes["Size"] = "size";
    Attributes["Domain"] = "domain";
    Attributes["Path"] = "path";
    Attributes["Expires"] = "expires";
    Attributes["HttpOnly"] = "httpOnly";
    Attributes["Secure"] = "secure";
    Attributes["SameSite"] = "sameSite";
    Attributes["SameParty"] = "sameParty";
    Attributes["SourceScheme"] = "sourceScheme";
    Attributes["SourcePort"] = "sourcePort";
    Attributes["Priority"] = "priority";
})(Attributes || (Attributes = {}));
/**
 * A `CookieReference` uniquely identifies a cookie by the triple (name,domain,path). Additionally, a context may be
 * included to make it clear which site under Application>Cookies should be opened when revealing a `CookieReference`.
 */
export class CookieReference {
    _name;
    _domain;
    _path;
    _contextUrl;
    constructor(name, domain, path, contextUrl) {
        this._name = name;
        this._domain = domain;
        this._path = path;
        this._contextUrl = contextUrl;
    }
    domain() {
        return this._domain;
    }
    contextUrl() {
        return this._contextUrl;
    }
}
//# sourceMappingURL=Cookie.js.map