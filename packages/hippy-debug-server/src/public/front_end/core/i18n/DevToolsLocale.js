// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let devToolsLocaleInstance = null;
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
export class DevToolsLocale {
    locale;
    constructor(data) {
        // TODO(crbug.com/1163928): Use constant once setting actually exists.
        if (data.settingLanguage === 'browserLanguage') {
            this.locale = data.navigatorLanguage || 'en-US';
        }
        else {
            this.locale = data.settingLanguage;
        }
        this.locale = data.lookupClosestDevToolsLocale(this.locale);
    }
    static instance(opts = { create: false }) {
        if (!devToolsLocaleInstance && !opts.create) {
            throw new Error('No LanguageSelector instance exists yet.');
        }
        if (opts.create) {
            devToolsLocaleInstance = new DevToolsLocale(opts.data);
        }
        return devToolsLocaleInstance;
    }
    forceFallbackLocale() {
        // Locale is 'readonly', this is the only case where we want to forceably
        // overwrite the locale.
        this.locale = 'en-US';
    }
}
//# sourceMappingURL=DevToolsLocale.js.map