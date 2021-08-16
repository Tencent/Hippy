import type * as Protocol from '../../generated/protocol.js';
export declare class Cookie {
    _name: string;
    _value: string;
    _type: Type | null | undefined;
    _attributes: {
        [x: string]: any;
    };
    _size: number;
    _priority: Protocol.Network.CookiePriority;
    _cookieLine: string | null;
    constructor(name: string, value: string, type?: Type | null, priority?: Protocol.Network.CookiePriority);
    static fromProtocolCookie(protocolCookie: Protocol.Network.Cookie): Cookie;
    key(): string;
    name(): string;
    value(): string;
    type(): Type | null | undefined;
    httpOnly(): boolean;
    secure(): boolean;
    sameSite(): Protocol.Network.CookieSameSite;
    /** boolean
     */
    sameParty(): boolean;
    priority(): Protocol.Network.CookiePriority;
    session(): boolean;
    path(): string;
    domain(): string;
    expires(): number;
    maxAge(): number;
    sourcePort(): number;
    sourceScheme(): Protocol.Network.CookieSourceScheme;
    size(): number;
    /**
     * @deprecated
     */
    url(): string | null;
    setSize(size: number): void;
    expiresDate(requestDate: Date): Date | null;
    addAttribute(key: string, value?: string | number | boolean): void;
    setCookieLine(cookieLine: string): void;
    getCookieLine(): string | null;
    matchesSecurityOrigin(securityOrigin: string): boolean;
    static isDomainMatch(domain: string, hostname: string): boolean;
}
export declare enum Type {
    Request = 0,
    Response = 1
}
export declare enum Attributes {
    Name = "name",
    Value = "value",
    Size = "size",
    Domain = "domain",
    Path = "path",
    Expires = "expires",
    HttpOnly = "httpOnly",
    Secure = "secure",
    SameSite = "sameSite",
    SameParty = "sameParty",
    SourceScheme = "sourceScheme",
    SourcePort = "sourcePort",
    Priority = "priority"
}
/**
 * A `CookieReference` uniquely identifies a cookie by the triple (name,domain,path). Additionally, a context may be
 * included to make it clear which site under Application>Cookies should be opened when revealing a `CookieReference`.
 */
export declare class CookieReference {
    _name: string;
    _domain: string;
    _path: string;
    _contextUrl: string | undefined;
    constructor(name: string, domain: string, path: string, contextUrl: string | undefined);
    domain(): string;
    contextUrl(): string | undefined;
}
