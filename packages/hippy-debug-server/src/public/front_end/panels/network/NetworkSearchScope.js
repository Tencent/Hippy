// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Logs from '../../models/logs/logs.js';
const UIStrings = {
    /**
    *@description Text for web URLs
    */
    url: 'URL',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkSearchScope.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class NetworkSearchScope {
    performIndexing(progress) {
        queueMicrotask(() => {
            progress.done();
        });
    }
    async performSearch(searchConfig, progress, searchResultCallback, searchFinishedCallback) {
        const promises = [];
        const requests = Logs.NetworkLog.NetworkLog.instance().requests().filter(request => searchConfig.filePathMatchesFileQuery(request.url()));
        progress.setTotalWork(requests.length);
        for (const request of requests) {
            const promise = this._searchRequest(searchConfig, request, progress);
            promises.push(promise);
        }
        const resultsWithNull = await Promise.all(promises);
        const results = resultsWithNull.filter(result => result !== null);
        if (progress.isCanceled()) {
            searchFinishedCallback(false);
            return;
        }
        for (const result of results.sort((r1, r2) => r1.label().localeCompare(r2.label()))) {
            if (result.matchesCount() > 0) {
                searchResultCallback(result);
            }
        }
        progress.done();
        searchFinishedCallback(true);
    }
    async _searchRequest(searchConfig, request, progress) {
        let bodyMatches = [];
        if (request.contentType().isTextType()) {
            bodyMatches =
                await request.searchInContent(searchConfig.query(), !searchConfig.ignoreCase(), searchConfig.isRegex());
        }
        if (progress.isCanceled()) {
            return null;
        }
        const locations = [];
        if (stringMatchesQuery(request.url())) {
            locations.push(UIRequestLocation.urlMatch(request));
        }
        for (const header of request.requestHeaders()) {
            if (headerMatchesQuery(header)) {
                locations.push(UIRequestLocation.requestHeaderMatch(request, header));
            }
        }
        for (const header of request.responseHeaders) {
            if (headerMatchesQuery(header)) {
                locations.push(UIRequestLocation.responseHeaderMatch(request, header));
            }
        }
        for (const match of bodyMatches) {
            locations.push(UIRequestLocation.bodyMatch(request, match));
        }
        progress.worked();
        return new NetworkSearchResult(request, locations);
        function headerMatchesQuery(header) {
            return stringMatchesQuery(`${header.name}: ${header.value}`);
        }
        function stringMatchesQuery(string) {
            const flags = searchConfig.ignoreCase() ? 'i' : '';
            const regExps = searchConfig.queries().map(query => new RegExp(query, flags));
            let pos = 0;
            for (const regExp of regExps) {
                const match = string.substr(pos).match(regExp);
                if (!match || !match.index) {
                    return false;
                }
                pos += match.index + match[0].length;
            }
            return true;
        }
    }
    stopSearch() {
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var UIHeaderSection;
(function (UIHeaderSection) {
    UIHeaderSection["General"] = "General";
    UIHeaderSection["Request"] = "Request";
    UIHeaderSection["Response"] = "Response";
})(UIHeaderSection || (UIHeaderSection = {}));
export class UIRequestLocation {
    request;
    header;
    searchMatch;
    isUrlMatch;
    constructor(request, header, searchMatch, urlMatch) {
        this.request = request;
        this.header = header;
        this.searchMatch = searchMatch;
        this.isUrlMatch = urlMatch;
    }
    static requestHeaderMatch(request, header) {
        return new UIRequestLocation(request, { section: UIHeaderSection.Request, header }, null, false);
    }
    static responseHeaderMatch(request, header) {
        return new UIRequestLocation(request, { section: UIHeaderSection.Response, header }, null, false);
    }
    static bodyMatch(request, searchMatch) {
        return new UIRequestLocation(request, null, searchMatch, false);
    }
    static urlMatch(request) {
        return new UIRequestLocation(request, null, null, true);
    }
    static header(request, section, name) {
        return new UIRequestLocation(request, { section, header: { name, value: '' } }, null, true);
    }
}
export class NetworkSearchResult {
    _request;
    _locations;
    constructor(request, locations) {
        this._request = request;
        this._locations = locations;
    }
    matchesCount() {
        return this._locations.length;
    }
    label() {
        return this._request.displayName;
    }
    description() {
        const parsedUrl = this._request.parsedURL;
        if (!parsedUrl) {
            return this._request.url();
        }
        return parsedUrl.urlWithoutScheme();
    }
    matchLineContent(index) {
        const location = this._locations[index];
        if (location.isUrlMatch) {
            return this._request.url();
        }
        const header = location?.header?.header;
        if (header) {
            return header.value;
        }
        return location.searchMatch.lineContent;
    }
    matchRevealable(index) {
        return this._locations[index];
    }
    matchLabel(index) {
        const location = this._locations[index];
        if (location.isUrlMatch) {
            return i18nString(UIStrings.url);
        }
        const header = location?.header?.header;
        if (header) {
            return `${header.name}:`;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // @ts-expect-error
        return location.searchMatch.lineNumber + 1;
    }
}
//# sourceMappingURL=NetworkSearchScope.js.map