import { Cookie, Type } from './Cookie.js';
export declare class CookieParser {
    _domain: string | undefined;
    _cookies: Cookie[];
    _input: string | undefined;
    _originalInputLength: number;
    _lastCookie?: Cookie | null;
    _lastCookieLine?: string;
    _lastCookiePosition?: number;
    constructor(domain?: string);
    static parseSetCookie(header: string | undefined, domain?: string): Cookie[] | null;
    cookies(): Cookie[];
    parseSetCookie(setCookieHeader: string | undefined): Cookie[] | null;
    _initialize(headerValue: string | undefined): boolean;
    _flushCookie(): void;
    _extractKeyValue(): KeyValue | null;
    _advanceAndCheckCookieDelimiter(): boolean;
    _addCookie(keyValue: KeyValue, type: Type): void;
}
declare class KeyValue {
    key: string;
    value: string | undefined;
    position: number;
    constructor(key: string, value: string | undefined, position: number);
}
export {};
