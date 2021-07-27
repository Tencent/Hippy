export interface DevToolsLocaleData {
    settingLanguage: string;
    navigatorLanguage: string;
    lookupClosestDevToolsLocale: (locale: string) => string;
}
export declare type DevToolsLocaleCreationOptions = {
    create: true;
    data: DevToolsLocaleData;
} | {
    create: false;
};
/**
 * Simple class that determines the DevTools locale based on:
 *   1) navigator.language, which matches the Chrome UI
 *   2) the value of the "language" Setting the user choses
 *   3) available locales in DevTools.
 *
 * The DevTools locale is only determined once during startup and
 * guaranteed to never change. Use this class when using
 * `Intl` APIs.
 */
export declare class DevToolsLocale {
    readonly locale: string;
    private constructor();
    static instance(opts?: DevToolsLocaleCreationOptions): DevToolsLocale;
    forceFallbackLocale(): void;
}
