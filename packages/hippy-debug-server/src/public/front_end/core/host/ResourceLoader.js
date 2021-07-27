// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
/* eslint-disable @typescript-eslint/naming-convention */
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { InspectorFrontendHostInstance } from './InspectorFrontendHost.js';
const UIStrings = {
    /**
    *@description Name of an error category used in error messages
    */
    systemError: 'System error',
    /**
    *@description Name of an error category used in error messages
    */
    connectionError: 'Connection error',
    /**
    *@description Name of an error category used in error messages
    */
    certificateError: 'Certificate error',
    /**
    *@description Name of an error category used in error messages
    */
    httpError: 'HTTP error',
    /**
    *@description Name of an error category used in error messages
    */
    cacheError: 'Cache error',
    /**
    *@description Name of an error category used in error messages
    */
    signedExchangeError: 'Signed Exchange error',
    /**
    *@description Name of an error category used in error messages
    */
    ftpError: 'FTP error',
    /**
    *@description Name of an error category used in error messages
    */
    certificateManagerError: 'Certificate manager error',
    /**
    *@description Name of an error category used in error messages
    */
    dnsResolverError: 'DNS resolver error',
    /**
    *@description Name of an error category used in error messages
    */
    unknownError: 'Unknown error',
    /**
    *@description Phrase used in error messages that carry a network error name
    *@example {404} PH1
    *@example {net::ERR_INSUFFICIENT_RESOURCES} PH2
    */
    httpErrorStatusCodeSS: 'HTTP error: status code {PH1}, {PH2}',
    /**
    *@description Name of an error category used in error messages
    */
    invalidUrl: 'Invalid URL',
    /**
    *@description Name of an error category used in error messages
    */
    decodingDataUrlFailed: 'Decoding Data URL failed',
};
const str_ = i18n.i18n.registerUIStrings('core/host/ResourceLoader.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export const ResourceLoader = {};
let _lastStreamId = 0;
const _boundStreams = {};
const _bindOutputStream = function (stream) {
    _boundStreams[++_lastStreamId] = stream;
    return _lastStreamId;
};
const _discardOutputStream = function (id) {
    _boundStreams[id].close();
    delete _boundStreams[id];
};
export const streamWrite = function (id, chunk) {
    _boundStreams[id].write(chunk);
};
export let load = function (url, headers, callback) {
    const stream = new Common.StringOutputStream.StringOutputStream();
    loadAsStream(url, headers, stream, mycallback);
    function mycallback(success, headers, errorDescription) {
        callback(success, headers, stream.data(), errorDescription);
    }
};
export function setLoadForTest(newLoad) {
    load = newLoad;
}
function getNetErrorCategory(netError) {
    if (netError > -100) {
        return i18nString(UIStrings.systemError);
    }
    if (netError > -200) {
        return i18nString(UIStrings.connectionError);
    }
    if (netError > -300) {
        return i18nString(UIStrings.certificateError);
    }
    if (netError > -400) {
        return i18nString(UIStrings.httpError);
    }
    if (netError > -500) {
        return i18nString(UIStrings.cacheError);
    }
    if (netError > -600) {
        return i18nString(UIStrings.signedExchangeError);
    }
    if (netError > -700) {
        return i18nString(UIStrings.ftpError);
    }
    if (netError > -800) {
        return i18nString(UIStrings.certificateManagerError);
    }
    if (netError > -900) {
        return i18nString(UIStrings.dnsResolverError);
    }
    return i18nString(UIStrings.unknownError);
}
function isHTTPError(netError) {
    return netError <= -300 && netError > -400;
}
export function netErrorToMessage(netError, httpStatusCode, netErrorName) {
    if (netError === undefined || netErrorName === undefined) {
        return null;
    }
    if (netError !== 0) {
        if (isHTTPError(netError)) {
            return i18nString(UIStrings.httpErrorStatusCodeSS, { PH1: httpStatusCode, PH2: netErrorName });
        }
        const errorCategory = getNetErrorCategory(netError);
        // We don't localize here, as `errorCategory` is already localized,
        // and `netErrorName` is an error code like 'net::ERR_CERT_AUTHORITY_INVALID'.
        return `${errorCategory}: ${netErrorName}`;
    }
    return null;
}
function createErrorMessageFromResponse(response) {
    const { statusCode, netError, netErrorName, urlValid, messageOverride } = response;
    let message = '';
    const success = statusCode >= 200 && statusCode < 300;
    if (typeof messageOverride === 'string') {
        message = messageOverride;
    }
    else if (!success) {
        if (typeof netError === 'undefined') {
            if (urlValid === false) {
                message = i18nString(UIStrings.invalidUrl);
            }
            else {
                message = i18nString(UIStrings.unknownError);
            }
        }
        else {
            const maybeMessage = netErrorToMessage(netError, statusCode, netErrorName);
            if (maybeMessage) {
                message = maybeMessage;
            }
        }
    }
    console.assert(success === (message.length === 0));
    return { success, description: { statusCode, netError, netErrorName, urlValid, message } };
}
const loadXHR = (url) => {
    return new Promise((successCallback, failureCallback) => {
        function onReadyStateChanged() {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status !== 200) {
                xhr.onreadystatechange = null;
                failureCallback(new Error(String(xhr.status)));
                return;
            }
            xhr.onreadystatechange = null;
            successCallback(xhr.responseText);
        }
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('GET', url, true);
        xhr.onreadystatechange = onReadyStateChanged;
        xhr.send(null);
    });
};
export const loadAsStream = function (url, headers, stream, callback) {
    const streamId = _bindOutputStream(stream);
    const parsedURL = new Common.ParsedURL.ParsedURL(url);
    if (parsedURL.isDataURL()) {
        loadXHR(url).then(dataURLDecodeSuccessful).catch(dataURLDecodeFailed);
        return;
    }
    const rawHeaders = [];
    if (headers) {
        for (const key in headers) {
            rawHeaders.push(key + ': ' + headers[key]);
        }
    }
    InspectorFrontendHostInstance.loadNetworkResource(url, rawHeaders.join('\r\n'), streamId, finishedCallback);
    function finishedCallback(response) {
        if (callback) {
            const { success, description } = createErrorMessageFromResponse(response);
            callback(success, response.headers || {}, description);
        }
        _discardOutputStream(streamId);
    }
    function dataURLDecodeSuccessful(text) {
        streamWrite(streamId, text);
        finishedCallback({ statusCode: 200 });
    }
    function dataURLDecodeFailed(_xhrStatus) {
        const messageOverride = i18nString(UIStrings.decodingDataUrlFailed);
        finishedCallback({ statusCode: 404, messageOverride });
    }
};
//# sourceMappingURL=ResourceLoader.js.map