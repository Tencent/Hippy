import * as Platform from '../platform/platform.js';
import { DevToolsLocale } from './DevToolsLocale.js';
import type * as i18nTypes from './i18nTypes.js';
/**
 * Look up the best available locale for the requested language through these fall backs:
 * - exact match
 * - progressively shorter prefixes (`de-CH-1996` -> `de-CH` -> `de`)
 * - the default locale ('en-US') if no match is found
 *
 * If `locale` isn't provided, the default is used.
 */
export declare function lookupClosestSupportedDevToolsLocale(locale: string): string;
/**
 * Fetches the locale data of the specified locale.
 * Callers have to ensure that `locale` is an officilly supported locale.
 * Depending whether a locale is present in `bundledLocales`, the data will be
 * fetched locally or remotely.
 */
export declare function fetchAndRegisterLocaleData(locale: Intl.UnicodeBCP47LocaleIdentifier): Promise<void>;
/**
 * Returns an anonymous function that wraps a call to retrieve a localized string.
 * This is introduced so that localized strings can be declared in environments where
 * the i18n system has not been configured and so, cannot be directly invoked. Instead,
 * strings are lazily localized when they are used. This is used for instance in the
 * meta files used to register module extensions.
 */
export declare function getLazilyComputedLocalizedString(str_: (id: string, values: Object) => Platform.UIString.LocalizedString, id: string, values?: Object): () => Platform.UIString.LocalizedString;
/**
 * Retrieve the localized string.
 */
export declare function getLocalizedString(str_: (id: string, values: Object) => Platform.UIString.LocalizedString, id: string, values?: Object): Platform.UIString.LocalizedString;
/**
 * Register a file's UIStrings with i18n, return function to generate the string ids.
 */
export declare function registerUIStrings(path: string, stringStructure: Object): (id: string, values: Object) => Platform.UIString.LocalizedString;
/**
 * Returns a span element that may contains other DOM element as placeholders
 */
export declare function getFormatLocalizedString(str_: (id: string, values: Object) => Platform.UIString.LocalizedString, stringId: string, placeholders: Record<string, Object>): Element;
export declare function formatLocalized(formattedString: string, args: Array<Object>): Element;
export declare function serializeUIString(string: string, values?: Record<string, Object>): string;
export declare function deserializeUIString(serializedMessage: string): i18nTypes.SerializedMessage;
/**
 * Use this function in places where a `LocalizedString` is expected but the
 * term/phrase you want to use does not require translation.
 */
export declare function lockedString(str: string): Platform.UIString.LocalizedString;
/**
 * Same as `lockedString` but for places where `i18nLazyString` would be used otherwise.
 */
export declare function lockedLazyString(str: string): () => Platform.UIString.LocalizedString;
/**
 * Returns a string of the form:
 *   "German (Austria) - Deutsch (Österreich)"
 * where the former locale representation is written in the currently enabled DevTools
 * locale and the latter locale representation is written in the locale of `localeString`.
 *
 * Should the two locales match (i.e. have the same language) then the latter locale
 * representation is written in English.
 */
export declare function getLocalizedLanguageRegion(localeString: Intl.UnicodeBCP47LocaleIdentifier, devtoolsLocale: DevToolsLocale): Platform.UIString.LocalizedString;
export declare const preciseMillisToString: (ms: number, precision?: number | undefined) => string;
export declare const millisToString: (ms: number, higherResolution?: boolean | undefined) => string;
export declare const secondsToString: (seconds: number, higherResolution?: boolean | undefined) => string;
