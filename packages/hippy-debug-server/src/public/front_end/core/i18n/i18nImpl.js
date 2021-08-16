// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// eslint-disable-next-line
import i18nBundle from '../../third_party/i18n/i18n-bundle.js';
import * as Platform from '../platform/platform.js';
import * as Root from '../root/root.js';
import { DevToolsLocale } from './DevToolsLocale.js';
const UIStrings = {
    /**
    *@description μs is the short form of micro-seconds and the placeholder is a number
    *@example {2} PH1
    */
    fmms: '{PH1} μs',
    /**
    *@description ms is the short form of milli-seconds and the placeholder is a decimal number
    *@example {2.14} PH1
    */
    fms: '{PH1} ms',
    /**
    *@description s is short for seconds and the placeholder is a decimal number
    *@example {2.14} PH1
    */
    fs: '{PH1} s',
    /**
    *@description min is short for minutes and the placeholder is a decimal number
    *@example {2.2} PH1
    */
    fmin: '{PH1} min',
    /**
    *@description hrs is short for hours and the placeholder is a decimal number
    *@example {2.2} PH1
    */
    fhrs: '{PH1} hrs',
    /**
    *@description days formatting and the placeholder is a decimal number
    *@example {2.2} PH1
    */
    fdays: '{PH1} days',
};
const str_ = registerUIStrings('core/i18n/i18nImpl.ts', UIStrings);
const i18nString = getLocalizedString.bind(undefined, str_);
// All the locales that are part of the DevTools bundle and should not be fetched
// remotely. Keep this list in sync with "copied_devtools_locale_files" in
// "all_devtools_files.gni" (except the pseudo locales).
const BUNDLED_LOCALES = new Set(['en-US', 'en-XL', 'zh']);
/**
 * The strings from the module.json file
 */
let moduleJSONStrings;
/**
 * Returns an instance of an object of formatted strings based on locale. If the instance is not
 * set at the time of calling, it is created.
 */
function getOrSetModuleJSONStrings() {
    moduleJSONStrings = moduleJSONStrings || i18nBundle.getRendererFormattedStrings(DevToolsLocale.instance().locale);
    return moduleJSONStrings;
}
/**
 * Look up the best available locale for the requested language through these fall backs:
 * - exact match
 * - progressively shorter prefixes (`de-CH-1996` -> `de-CH` -> `de`)
 * - the default locale ('en-US') if no match is found
 *
 * If `locale` isn't provided, the default is used.
 */
export function lookupClosestSupportedDevToolsLocale(locale) {
    return i18nBundle.lookupLocale(locale);
}
/**
 * Returns the Url from which a locale can be fetched. This depends on the
 * specific locale, as some are bundled with DevTools while others
 * have to be fetched remotely.
 */
function getLocaleFetchUrl(locale) {
    const remoteBase = Root.Runtime.getRemoteBase();
    if (remoteBase && remoteBase.base && !BUNDLED_LOCALES.has(locale)) {
        return `${remoteBase.base}core/i18n/locales/${locale}.json`;
    }
    return new URL(`../../core/i18n/locales/${locale}.json`, import.meta.url).toString();
}
/**
 * Fetches the locale data of the specified locale.
 * Callers have to ensure that `locale` is an officilly supported locale.
 * Depending whether a locale is present in `bundledLocales`, the data will be
 * fetched locally or remotely.
 */
export async function fetchAndRegisterLocaleData(locale) {
    const localeDataTextPromise = Root.Runtime.loadResourcePromise(getLocaleFetchUrl(locale));
    const timeoutPromise = new Promise((resolve, reject) => setTimeout(() => reject(new Error('timed out fetching locale')), 5000));
    const localeDataText = await Promise.race([timeoutPromise, localeDataTextPromise]);
    const localeData = JSON.parse(localeDataText);
    i18nBundle.registerLocaleData(locale, localeData);
}
/**
 * Returns an anonymous function that wraps a call to retrieve a localized string.
 * This is introduced so that localized strings can be declared in environments where
 * the i18n system has not been configured and so, cannot be directly invoked. Instead,
 * strings are lazily localized when they are used. This is used for instance in the
 * meta files used to register module extensions.
 */
export function getLazilyComputedLocalizedString(
// eslint-disable-next-line @typescript-eslint/naming-convention
str_, id, values = {}) {
    return () => getLocalizedString(str_, id, values);
}
/**
 * Retrieve the localized string.
 */
export function getLocalizedString(
// eslint-disable-next-line @typescript-eslint/naming-convention
str_, id, values = {}) {
    const icuMessage = str_(id, values);
    return i18nBundle.getFormatted(icuMessage, DevToolsLocale.instance().locale);
}
/**
 * Register a file's UIStrings with i18n, return function to generate the string ids.
 */
export function registerUIStrings(path, stringStructure) {
    /**
     * Convert a message string & replacement values into an
     * indexed id value in the form '{messageid} | # {index}'.
     * */
    const str = (id, value) => {
        try {
            const i18nInstance = i18nBundle.createMessageInstanceIdFn(path, stringStructure);
            return i18nInstance(id, value);
        }
        catch (e) {
            // ID was not in the main file search for module.json strings
            if (e instanceof i18nBundle.idNotInMainDictionaryException) {
                const stringMappingArray = Object.getOwnPropertyNames(getOrSetModuleJSONStrings());
                const index = stringMappingArray.indexOf(id);
                if (index >= 0) {
                    return stringMappingArray[index];
                }
            }
            return id;
        }
    };
    return str;
}
/**
 * Returns a span element that may contains other DOM element as placeholders
 */
export function getFormatLocalizedString(
// eslint-disable-next-line @typescript-eslint/naming-convention
str_, stringId, placeholders) {
    const icuMessage = str_(stringId, placeholders);
    const formatter = i18nBundle.getFormatter(icuMessage, DevToolsLocale.instance().locale);
    const icuElements = formatter.getAst().elements;
    const args = [];
    let formattedString = '';
    for (const element of icuElements) {
        if (element.type === 'argumentElement') {
            const placeholderValue = placeholders[element.id];
            if (placeholderValue) {
                args.push(placeholderValue);
                element.value = '%s'; // convert the {PH} back to %s to use Platform.UIString
            }
        }
        formattedString += element.value;
    }
    return formatLocalized(formattedString, args);
}
export function formatLocalized(formattedString, args) {
    const substitution = substitution => {
        return substitution;
    };
    function append(a, b) {
        if (b) {
            a.appendChild(typeof b === 'string' ? document.createTextNode(b) : b);
        }
        return a;
    }
    const formatters = { s: substitution };
    return Platform.StringUtilities.format(formattedString, args, formatters, document.createElement('span'), append)
        .formattedResult;
}
export function serializeUIString(string, values = {}) {
    const serializedMessage = { string, values };
    return JSON.stringify(serializedMessage);
}
export function deserializeUIString(serializedMessage) {
    if (!serializedMessage) {
        return { string: '', values: {} };
    }
    return JSON.parse(serializedMessage);
}
/**
 * Use this function in places where a `LocalizedString` is expected but the
 * term/phrase you want to use does not require translation.
 */
export function lockedString(str) {
    return str;
}
/**
 * Same as `lockedString` but for places where `i18nLazyString` would be used otherwise.
 */
export function lockedLazyString(str) {
    return () => str;
}
/**
 * Returns a string of the form:
 *   "German (Austria) - Deutsch (Österreich)"
 * where the former locale representation is written in the currently enabled DevTools
 * locale and the latter locale representation is written in the locale of `localeString`.
 *
 * Should the two locales match (i.e. have the same language) then the latter locale
 * representation is written in English.
 */
export function getLocalizedLanguageRegion(localeString, devtoolsLocale) {
    // @ts-ignore TODO(crbug.com/1163928) Wait for Intl support.
    const locale = new Intl.Locale(localeString);
    // @ts-ignore TODO(crbug.com/1163928) Wait for Intl support.
    const devtoolsLoc = new Intl.Locale(devtoolsLocale.locale);
    const targetLanguage = locale.language === devtoolsLoc.language ? 'en' : locale.baseName;
    const languageInCurrentLocale = new Intl.DisplayNames([devtoolsLocale.locale], { type: 'language' }).of(locale.language);
    const languageInTargetLocale = new Intl.DisplayNames([targetLanguage], { type: 'language' }).of(locale.language);
    let wrappedRegionInCurrentLocale = '';
    let wrappedRegionInTargetLocale = '';
    if (locale.region) {
        const regionInCurrentLocale = new Intl.DisplayNames([devtoolsLocale.locale], { type: 'region', style: 'short' }).of(locale.region);
        const regionInTargetLocale = new Intl.DisplayNames([targetLanguage], { type: 'region', style: 'short' }).of(locale.region);
        wrappedRegionInCurrentLocale = ` (${regionInCurrentLocale})`;
        wrappedRegionInTargetLocale = ` (${regionInTargetLocale})`;
    }
    return `${languageInCurrentLocale}${wrappedRegionInCurrentLocale} - ${languageInTargetLocale}${wrappedRegionInTargetLocale}`;
}
export const preciseMillisToString = function (ms, precision) {
    precision = precision || 0;
    return i18nString(UIStrings.fms, { PH1: ms.toFixed(precision) });
};
export const millisToString = function (ms, higherResolution) {
    if (!isFinite(ms)) {
        return '-';
    }
    if (ms === 0) {
        return '0';
    }
    if (higherResolution && ms < 0.1) {
        return i18nString(UIStrings.fmms, { PH1: (ms * 1000).toFixed(0) });
    }
    if (higherResolution && ms < 1000) {
        return i18nString(UIStrings.fms, { PH1: (ms).toFixed(2) });
    }
    if (ms < 1000) {
        return i18nString(UIStrings.fms, { PH1: (ms).toFixed(0) });
    }
    const seconds = ms / 1000;
    if (seconds < 60) {
        return i18nString(UIStrings.fs, { PH1: (seconds).toFixed(2) });
    }
    const minutes = seconds / 60;
    if (minutes < 60) {
        return i18nString(UIStrings.fmin, { PH1: (minutes).toFixed(1) });
    }
    const hours = minutes / 60;
    if (hours < 24) {
        return i18nString(UIStrings.fhrs, { PH1: (hours).toFixed(1) });
    }
    const days = hours / 24;
    return i18nString(UIStrings.fdays, { PH1: (days).toFixed(1) });
};
export const secondsToString = function (seconds, higherResolution) {
    if (!isFinite(seconds)) {
        return '-';
    }
    return millisToString(seconds * 1000, higherResolution);
};
//# sourceMappingURL=i18nImpl.js.map