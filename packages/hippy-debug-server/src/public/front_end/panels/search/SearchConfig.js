// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
export class SearchConfig {
    _query;
    _ignoreCase;
    _isRegex;
    _fileQueries;
    _queries;
    _fileRegexQueries;
    constructor(query, ignoreCase, isRegex) {
        this._query = query;
        this._ignoreCase = ignoreCase;
        this._isRegex = isRegex;
        this._parse();
    }
    static fromPlainObject(object) {
        return new SearchConfig(object.query, object.ignoreCase, object.isRegex);
    }
    query() {
        return this._query;
    }
    ignoreCase() {
        return this._ignoreCase;
    }
    isRegex() {
        return this._isRegex;
    }
    toPlainObject() {
        return { query: this.query(), ignoreCase: this.ignoreCase(), isRegex: this.isRegex() };
    }
    _parse() {
        // Inside double quotes: any symbol except double quote and backslash or any symbol escaped with a backslash.
        const quotedPattern = /"([^\\"]|\\.)+"/;
        // A word is a sequence of any symbols except space and backslash or any symbols escaped with a backslash, that does not start with file:.
        const unquotedWordPattern = /(\s*(?!-?f(ile)?:)[^\\ ]|\\.)+/;
        const unquotedPattern = unquotedWordPattern.source + '(\\s+' + unquotedWordPattern.source + ')*';
        const pattern = [
            '(\\s*' + FilePatternRegex.source + '\\s*)',
            '(' + quotedPattern.source + ')',
            '(' + unquotedPattern + ')',
        ].join('|');
        const regexp = new RegExp(pattern, 'g');
        const queryParts = this._query.match(regexp) || [];
        this._fileQueries = [];
        this._queries = [];
        for (let i = 0; i < queryParts.length; ++i) {
            const queryPart = queryParts[i];
            if (!queryPart) {
                continue;
            }
            const fileQuery = this._parseFileQuery(queryPart);
            if (fileQuery) {
                this._fileQueries.push(fileQuery);
                this._fileRegexQueries = this._fileRegexQueries || [];
                this._fileRegexQueries.push({ regex: new RegExp(fileQuery.text, this.ignoreCase() ? 'i' : ''), isNegative: fileQuery.isNegative });
                continue;
            }
            if (this._isRegex) {
                this._queries.push(queryPart);
                continue;
            }
            if (queryPart.startsWith('"')) {
                if (!queryPart.endsWith('"')) {
                    continue;
                }
                this._queries.push(this._parseQuotedQuery(queryPart));
                continue;
            }
            this._queries.push(this._parseUnquotedQuery(queryPart));
        }
    }
    filePathMatchesFileQuery(filePath) {
        if (!this._fileRegexQueries) {
            return true;
        }
        for (let i = 0; i < this._fileRegexQueries.length; ++i) {
            if (Boolean(filePath.match(this._fileRegexQueries[i].regex)) === this._fileRegexQueries[i].isNegative) {
                return false;
            }
        }
        return true;
    }
    queries() {
        return this._queries || [];
    }
    _parseUnquotedQuery(query) {
        return query.replace(/\\(.)/g, '$1');
    }
    _parseQuotedQuery(query) {
        return query.substring(1, query.length - 1).replace(/\\(.)/g, '$1');
    }
    _parseFileQuery(query) {
        const match = query.match(FilePatternRegex);
        if (!match) {
            return null;
        }
        const isNegative = Boolean(match[1]);
        query = match[3];
        let result = '';
        for (let i = 0; i < query.length; ++i) {
            const char = query[i];
            if (char === '*') {
                result += '.*';
            }
            else if (char === '\\') {
                ++i;
                const nextChar = query[i];
                if (nextChar === ' ') {
                    result += ' ';
                }
            }
            else {
                if (Platform.StringUtilities.regexSpecialCharacters().indexOf(query.charAt(i)) !== -1) {
                    result += '\\';
                }
                result += query.charAt(i);
            }
        }
        return new QueryTerm(result, isNegative);
    }
}
// After file: prefix: any symbol except space and backslash or any symbol escaped with a backslash.
export const FilePatternRegex = /(-)?f(ile)?:((?:[^\\ ]|\\.)+)/;
export class QueryTerm {
    text;
    isNegative;
    constructor(text, isNegative) {
        this.text = text;
        this.isNegative = isNegative;
    }
}
//# sourceMappingURL=SearchConfig.js.map