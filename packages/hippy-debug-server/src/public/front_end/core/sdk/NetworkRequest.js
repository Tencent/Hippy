/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import * as Platform from '../platform/platform.js';
import { Attributes } from './Cookie.js'; // eslint-disable-line no-unused-vars
import { CookieParser } from './CookieParser.js';
import { NetworkManager } from './NetworkManager.js';
import { Type } from './Target.js';
import { ServerTiming } from './ServerTiming.js';
// clang-format off
const UIStrings = {
    /**
    *@description Text in Network Request
    */
    binary: '(binary)',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    secureOnly: 'This cookie was blocked because it had the "`Secure`" attribute and the connection was not secure.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    notOnPath: 'This cookie was blocked because its path was not an exact match for or a superdirectory of the request url\'s path.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    domainMismatch: 'This cookie was blocked because neither did the request URL\'s domain exactly match the cookie\'s domain, nor was the request URL\'s domain a subdomain of the cookie\'s Domain attribute value.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    sameSiteStrict: 'This cookie was blocked because it had the "`SameSite=Strict`" attribute and the request was made from a different site. This includes top-level navigation requests initiated by other sites.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    sameSiteLax: 'This cookie was blocked because it had the "`SameSite=Lax`" attribute and the request was made from a different site and was not initiated by a top-level navigation.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    sameSiteUnspecifiedTreatedAsLax: 'This cookie didn\'t specify a "`SameSite`" attribute when it was stored and was defaulted to "SameSite=Lax," and was blocked because the request was made from a different site and was not initiated by a top-level navigation. The cookie had to have been set with "`SameSite=None`" to enable cross-site usage.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    sameSiteNoneInsecure: 'This cookie was blocked because it had the "`SameSite=None`" attribute but was not marked "Secure". Cookies without SameSite restrictions must be marked "Secure" and sent over a secure connection.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    userPreferences: 'This cookie was blocked due to user preferences.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    unknownError: 'An unknown error was encountered when trying to send this cookie.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
    */
    schemefulSameSiteStrict: 'This cookie was blocked because it had the "`SameSite=Strict`" attribute but the request was cross-site. This includes top-level navigation requests initiated by other sites. This request is considered cross-site because the URL has a different scheme than the current site.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
    */
    schemefulSameSiteLax: 'This cookie was blocked because it had the "`SameSite=Lax`" attribute but the request was cross-site and was not initiated by a top-level navigation. This request is considered cross-site because the URL has a different scheme than the current site.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
    */
    schemefulSameSiteUnspecifiedTreatedAsLax: 'This cookie didn\'t specify a "`SameSite`" attribute when it was stored, was defaulted to "`SameSite=Lax"`, and was blocked because the request was cross-site and was not initiated by a top-level navigation. This request is considered cross-site because the URL has a different scheme than the current site.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to SameParty
    */
    samePartyFromCrossPartyContext: 'This cookie was blocked because it had the "`SameParty`" attribute but the request was cross-party. The request was considered cross-party because the domain of the resource\'s URL and the domains of the resource\'s enclosing frames/documents are neither owners nor members in the same First-Party Set.',
    /**
    *@description Tooltip to explain why an attempt to set a cookie via `Set-Cookie` HTTP header on a request's response was blocked.
    */
    thisSetcookieWasBlockedDueToUser: 'This attempt to set a cookie via a `Set-Cookie` header was blocked due to user preferences.',
    /**
    *@description Tooltip to explain why an attempt to set a cookie via `Set-Cookie` HTTP header on a request's response was blocked.
    */
    thisSetcookieHadInvalidSyntax: 'This `Set-Cookie` header had invalid syntax.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    theSchemeOfThisConnectionIsNot: 'The scheme of this connection is not allowed to store cookies.',
    /**
    *@description Tooltip to explain why a cookie was blocked
    */
    anUnknownErrorWasEncounteredWhenTrying: 'An unknown error was encountered when trying to store this cookie.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
    *@example {SameSite=Strict} PH1
    */
    thisSetcookieWasBlockedBecauseItHadTheSamesiteStrictLax: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "{PH1}" attribute but came from a cross-site response which was not the response to a top-level navigation. This response is considered cross-site because the URL has a different scheme than the current site.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to Schemeful Same-Site
    */
    thisSetcookieDidntSpecifyASamesite: 'This `Set-Cookie` header didn\'t specify a "`SameSite`" attribute, was defaulted to "`SameSite=Lax"`, and was blocked because it came from a cross-site response which was not the response to a top-level navigation. This response is considered cross-site because the URL has a different scheme than the current site.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to SameParty
    */
    thisSetcookieWasBlockedBecauseItHadTheSameparty: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "`SameParty`" attribute but the request was cross-party. The request was considered cross-party because the domain of the resource\'s URL and the domains of the resource\'s enclosing frames/documents are neither owners nor members in the same First-Party Set.',
    /**
    *@description Tooltip to explain why a cookie was blocked due to SameParty
    */
    thisSetcookieWasBlockedBecauseItHadTheSamepartyAttribute: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "`SameParty`" attribute but also had other conflicting attributes. Chrome requires cookies that use the "`SameParty`" attribute to also have the "Secure" attribute, and to not be restricted to "`SameSite=Strict`".',
    /**
    *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
    */
    blockedReasonSecureOnly: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "Secure" attribute but was not received over a secure connection.',
    /**
     *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
     *@example {SameSite=Strict} PH1
    */
    blockedReasonSameSiteStrictLax: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "{PH1}" attribute but came from a cross-site response which was not the response to a top-level navigation.',
    /**
     *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
    */
    blockedReasonSameSiteUnspecifiedTreatedAsLax: 'This `Set-Cookie` header didn\'t specify a "`SameSite`" attribute and was defaulted to "`SameSite=Lax,`" and was blocked because it came from a cross-site response which was not the response to a top-level navigation. The `Set-Cookie` had to have been set with "`SameSite=None`" to enable cross-site usage.',
    /**
     *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
    */
    blockedReasonSameSiteNoneInsecure: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it had the "`SameSite=None`" attribute but did not have the "Secure" attribute, which is required in order to use "`SameSite=None`".',
    /**
     *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
    */
    blockedReasonOverwriteSecure: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it was not sent over a secure connection and would have overwritten a cookie with the Secure attribute.',
    /**
     *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
    */
    blockedReasonInvalidDomain: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because its Domain attribute was invalid with regards to the current host url.',
    /**
     *@description Tooltip to explain why an attempt to set a cookie via a `Set-Cookie` HTTP header on a request's response was blocked.
    */
    blockedReasonInvalidPrefix: 'This attempt to set a cookie via a `Set-Cookie` header was blocked because it used the "`__Secure-`" or "`__Host-`" prefix in its name and broke the additional rules applied to cookies with these prefixes as defined in `https://tools.ietf.org/html/draft-west-cookie-prefixes-05`.',
};
// clang-format on
const str_ = i18n.i18n.registerUIStrings('core/sdk/NetworkRequest.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum, @typescript-eslint/naming-convention
export var MIME_TYPE;
(function (MIME_TYPE) {
    MIME_TYPE["HTML"] = "text/html";
    MIME_TYPE["XML"] = "text/xml";
    MIME_TYPE["PLAIN"] = "text/plain";
    MIME_TYPE["XHTML"] = "application/xhtml+xml";
    MIME_TYPE["SVG"] = "image/svg+xml";
    MIME_TYPE["CSS"] = "text/css";
    MIME_TYPE["XSL"] = "text/xsl";
    MIME_TYPE["VTT"] = "text/vtt";
    MIME_TYPE["PDF"] = "application/pdf";
    MIME_TYPE["EVENTSTREAM"] = "text/event-stream";
})(MIME_TYPE || (MIME_TYPE = {}));
export class NetworkRequest extends Common.ObjectWrapper.ObjectWrapper {
    _requestId;
    _backendRequestId;
    _documentURL;
    _frameId;
    _loaderId;
    _initiator;
    _redirectSource;
    _preflightRequest;
    _preflightInitiatorRequest;
    _isRedirect;
    _redirectDestination;
    _issueTime;
    _startTime;
    _endTime;
    _blockedReason;
    _corsErrorStatus;
    statusCode;
    statusText;
    requestMethod;
    requestTime;
    protocol;
    mixedContentType;
    _initialPriority;
    _currentPriority;
    _signedExchangeInfo;
    _webBundleInfo;
    _webBundleInnerRequestInfo;
    _resourceType;
    _contentData;
    _frames;
    _eventSourceMessages;
    _responseHeaderValues;
    _responseHeadersText;
    _requestHeaders;
    _requestHeaderValues;
    _remoteAddress;
    _remoteAddressSpace;
    _referrerPolicy;
    _securityState;
    _securityDetails;
    connectionId;
    connectionReused;
    hasNetworkData;
    _formParametersPromise;
    _requestFormDataPromise;
    _hasExtraRequestInfo;
    _hasExtraResponseInfo;
    _blockedRequestCookies;
    _includedRequestCookies;
    _blockedResponseCookies;
    localizedFailDescription;
    _url;
    _responseReceivedTime;
    _transferSize;
    _finished;
    _failed;
    _canceled;
    _mimeType;
    _parsedURL;
    _name;
    _path;
    _clientSecurityState;
    _trustTokenParams;
    _trustTokenOperationDoneEvent;
    _responseCacheStorageCacheName;
    _serviceWorkerResponseSource;
    _wallIssueTime;
    _responseRetrievalTime;
    _resourceSize;
    _fromMemoryCache;
    _fromDiskCache;
    _fromPrefetchCache;
    _fetchedViaServiceWorker;
    _timing;
    _requestHeadersText;
    _responseHeaders;
    _sortedResponseHeaders;
    _responseCookies;
    _serverTimings;
    _queryString;
    _parsedQueryParameters;
    _contentDataProvider;
    constructor(requestId, url, documentURL, frameId, loaderId, initiator) {
        super();
        this._requestId = requestId;
        this._backendRequestId = requestId;
        this.setUrl(url);
        this._documentURL = documentURL;
        this._frameId = frameId;
        this._loaderId = loaderId;
        this._initiator = initiator;
        this._redirectSource = null;
        this._preflightRequest = null;
        this._preflightInitiatorRequest = null;
        this._isRedirect = false;
        this._redirectDestination = null;
        this._issueTime = -1;
        this._startTime = -1;
        this._endTime = -1;
        this._blockedReason = undefined;
        this._corsErrorStatus = undefined;
        this.statusCode = 0;
        this.statusText = '';
        this.requestMethod = '';
        this.requestTime = 0;
        this.protocol = '';
        this.mixedContentType = "none" /* None */;
        this._initialPriority = null;
        this._currentPriority = null;
        this._signedExchangeInfo = null;
        this._webBundleInfo = null;
        this._webBundleInnerRequestInfo = null;
        this._resourceType = Common.ResourceType.resourceTypes.Other;
        this._contentData = null;
        this._frames = [];
        this._eventSourceMessages = [];
        this._responseHeaderValues = {};
        this._responseHeadersText = '';
        this._requestHeaders = [];
        this._requestHeaderValues = {};
        this._remoteAddress = '';
        this._remoteAddressSpace = "Unknown" /* Unknown */;
        this._referrerPolicy = null;
        this._securityState = "unknown" /* Unknown */;
        this._securityDetails = null;
        this.connectionId = '0';
        this.connectionReused = false;
        this.hasNetworkData = false;
        this._formParametersPromise = null;
        this._requestFormDataPromise = Promise.resolve(null);
        this._hasExtraRequestInfo = false;
        this._hasExtraResponseInfo = false;
        this._blockedRequestCookies = [];
        this._includedRequestCookies = [];
        this._blockedResponseCookies = [];
        this.localizedFailDescription = null;
    }
    identityCompare(other) {
        const thisId = this.requestId();
        const thatId = other.requestId();
        if (thisId > thatId) {
            return 1;
        }
        if (thisId < thatId) {
            return -1;
        }
        return 0;
    }
    requestId() {
        return this._requestId;
    }
    backendRequestId() {
        return this._backendRequestId;
    }
    url() {
        return this._url;
    }
    isBlobRequest() {
        return this._url.startsWith('blob:');
    }
    setUrl(x) {
        if (this._url === x) {
            return;
        }
        this._url = x;
        this._parsedURL = new Common.ParsedURL.ParsedURL(x);
        delete this._queryString;
        delete this._parsedQueryParameters;
        delete this._name;
        delete this._path;
    }
    get documentURL() {
        return this._documentURL;
    }
    get parsedURL() {
        return this._parsedURL;
    }
    get frameId() {
        return this._frameId;
    }
    get loaderId() {
        return this._loaderId;
    }
    setRemoteAddress(ip, port) {
        this._remoteAddress = ip + ':' + port;
        this.dispatchEventToListeners(Events.RemoteAddressChanged, this);
    }
    remoteAddress() {
        return this._remoteAddress;
    }
    remoteAddressSpace() {
        return this._remoteAddressSpace;
    }
    /**
     * The cache name of the CacheStorage from where the response is served via
     * the ServiceWorker.
     */
    getResponseCacheStorageCacheName() {
        return this._responseCacheStorageCacheName;
    }
    setResponseCacheStorageCacheName(x) {
        this._responseCacheStorageCacheName = x;
    }
    serviceWorkerResponseSource() {
        return this._serviceWorkerResponseSource;
    }
    setServiceWorkerResponseSource(serviceWorkerResponseSource) {
        this._serviceWorkerResponseSource = serviceWorkerResponseSource;
    }
    setReferrerPolicy(referrerPolicy) {
        this._referrerPolicy = referrerPolicy;
    }
    referrerPolicy() {
        return this._referrerPolicy;
    }
    securityState() {
        return this._securityState;
    }
    setSecurityState(securityState) {
        this._securityState = securityState;
    }
    securityDetails() {
        return this._securityDetails;
    }
    securityOrigin() {
        return this._parsedURL.securityOrigin();
    }
    setSecurityDetails(securityDetails) {
        this._securityDetails = securityDetails;
    }
    get startTime() {
        return this._startTime || -1;
    }
    setIssueTime(monotonicTime, wallTime) {
        this._issueTime = monotonicTime;
        this._wallIssueTime = wallTime;
        this._startTime = monotonicTime;
    }
    issueTime() {
        return this._issueTime;
    }
    pseudoWallTime(monotonicTime) {
        return this._wallIssueTime ? this._wallIssueTime - this._issueTime + monotonicTime : monotonicTime;
    }
    get responseReceivedTime() {
        return this._responseReceivedTime || -1;
    }
    set responseReceivedTime(x) {
        this._responseReceivedTime = x;
    }
    /**
     * The time at which the returned response was generated. For cached
     * responses, this is the last time the cache entry was validated.
     */
    getResponseRetrievalTime() {
        return this._responseRetrievalTime;
    }
    setResponseRetrievalTime(x) {
        this._responseRetrievalTime = x;
    }
    get endTime() {
        return this._endTime || -1;
    }
    set endTime(x) {
        if (this.timing && this.timing.requestTime) {
            // Check against accurate responseReceivedTime.
            this._endTime = Math.max(x, this.responseReceivedTime);
        }
        else {
            // Prefer endTime since it might be from the network stack.
            this._endTime = x;
            if (this._responseReceivedTime > x) {
                this._responseReceivedTime = x;
            }
        }
        this.dispatchEventToListeners(Events.TimingChanged, this);
    }
    get duration() {
        if (this._endTime === -1 || this._startTime === -1) {
            return -1;
        }
        return this._endTime - this._startTime;
    }
    get latency() {
        if (this._responseReceivedTime === -1 || this._startTime === -1) {
            return -1;
        }
        return this._responseReceivedTime - this._startTime;
    }
    get resourceSize() {
        return this._resourceSize || 0;
    }
    set resourceSize(x) {
        this._resourceSize = x;
    }
    get transferSize() {
        return this._transferSize || 0;
    }
    increaseTransferSize(x) {
        this._transferSize = (this._transferSize || 0) + x;
    }
    setTransferSize(x) {
        this._transferSize = x;
    }
    get finished() {
        return this._finished;
    }
    set finished(x) {
        if (this._finished === x) {
            return;
        }
        this._finished = x;
        if (x) {
            this.dispatchEventToListeners(Events.FinishedLoading, this);
        }
    }
    get failed() {
        return this._failed;
    }
    set failed(x) {
        this._failed = x;
    }
    get canceled() {
        return this._canceled;
    }
    set canceled(x) {
        this._canceled = x;
    }
    blockedReason() {
        return this._blockedReason;
    }
    setBlockedReason(reason) {
        this._blockedReason = reason;
    }
    corsErrorStatus() {
        return this._corsErrorStatus;
    }
    setCorsErrorStatus(corsErrorStatus) {
        this._corsErrorStatus = corsErrorStatus;
    }
    wasBlocked() {
        return Boolean(this._blockedReason);
    }
    cached() {
        return (Boolean(this._fromMemoryCache) || Boolean(this._fromDiskCache)) && !this._transferSize;
    }
    cachedInMemory() {
        return Boolean(this._fromMemoryCache) && !this._transferSize;
    }
    fromPrefetchCache() {
        return Boolean(this._fromPrefetchCache);
    }
    setFromMemoryCache() {
        this._fromMemoryCache = true;
        delete this._timing;
    }
    setFromDiskCache() {
        this._fromDiskCache = true;
    }
    setFromPrefetchCache() {
        this._fromPrefetchCache = true;
    }
    /**
     * Returns true if the request was intercepted by a service worker and it
     * provided its own response.
     */
    get fetchedViaServiceWorker() {
        return Boolean(this._fetchedViaServiceWorker);
    }
    set fetchedViaServiceWorker(x) {
        this._fetchedViaServiceWorker = x;
    }
    /**
     * Returns true if the request was sent by a service worker.
     */
    initiatedByServiceWorker() {
        const networkManager = NetworkManager.forRequest(this);
        if (!networkManager) {
            return false;
        }
        return networkManager.target().type() === Type.ServiceWorker;
    }
    get timing() {
        return this._timing;
    }
    set timing(timingInfo) {
        if (!timingInfo || this._fromMemoryCache) {
            return;
        }
        // Take startTime and responseReceivedTime from timing data for better accuracy.
        // Timing's requestTime is a baseline in seconds, rest of the numbers there are ticks in millis.
        this._startTime = timingInfo.requestTime;
        const headersReceivedTime = timingInfo.requestTime + timingInfo.receiveHeadersEnd / 1000.0;
        if ((this._responseReceivedTime || -1) < 0 || this._responseReceivedTime > headersReceivedTime) {
            this._responseReceivedTime = headersReceivedTime;
        }
        if (this._startTime > this._responseReceivedTime) {
            this._responseReceivedTime = this._startTime;
        }
        this._timing = timingInfo;
        this.dispatchEventToListeners(Events.TimingChanged, this);
    }
    get mimeType() {
        return this._mimeType;
    }
    set mimeType(x) {
        this._mimeType = x;
    }
    get displayName() {
        return this._parsedURL.displayName;
    }
    name() {
        if (this._name) {
            return this._name;
        }
        this._parseNameAndPathFromURL();
        return this._name;
    }
    path() {
        if (this._path) {
            return this._path;
        }
        this._parseNameAndPathFromURL();
        return this._path;
    }
    _parseNameAndPathFromURL() {
        if (this._parsedURL.isDataURL()) {
            this._name = this._parsedURL.dataURLDisplayName();
            this._path = '';
        }
        else if (this._parsedURL.isBlobURL()) {
            this._name = this._parsedURL.url;
            this._path = '';
        }
        else if (this._parsedURL.isAboutBlank()) {
            this._name = this._parsedURL.url;
            this._path = '';
        }
        else {
            this._path = this._parsedURL.host + this._parsedURL.folderPathComponents;
            const networkManager = NetworkManager.forRequest(this);
            const inspectedURL = networkManager ? Common.ParsedURL.ParsedURL.fromString(networkManager.target().inspectedURL()) : null;
            this._path = Platform.StringUtilities.trimURL(this._path, inspectedURL ? inspectedURL.host : '');
            if (this._parsedURL.lastPathComponent || this._parsedURL.queryParams) {
                this._name =
                    this._parsedURL.lastPathComponent + (this._parsedURL.queryParams ? '?' + this._parsedURL.queryParams : '');
            }
            else if (this._parsedURL.folderPathComponents) {
                this._name =
                    this._parsedURL.folderPathComponents.substring(this._parsedURL.folderPathComponents.lastIndexOf('/') + 1) +
                        '/';
                this._path = this._path.substring(0, this._path.lastIndexOf('/'));
            }
            else {
                this._name = this._parsedURL.host;
                this._path = '';
            }
        }
    }
    get folder() {
        let path = this._parsedURL.path;
        const indexOfQuery = path.indexOf('?');
        if (indexOfQuery !== -1) {
            path = path.substring(0, indexOfQuery);
        }
        const lastSlashIndex = path.lastIndexOf('/');
        return lastSlashIndex !== -1 ? path.substring(0, lastSlashIndex) : '';
    }
    get pathname() {
        return this._parsedURL.path;
    }
    resourceType() {
        return this._resourceType;
    }
    setResourceType(resourceType) {
        this._resourceType = resourceType;
    }
    get domain() {
        return this._parsedURL.host;
    }
    get scheme() {
        return this._parsedURL.scheme;
    }
    redirectSource() {
        return this._redirectSource;
    }
    setRedirectSource(originatingRequest) {
        this._redirectSource = originatingRequest;
    }
    preflightRequest() {
        return this._preflightRequest;
    }
    setPreflightRequest(preflightRequest) {
        this._preflightRequest = preflightRequest;
    }
    preflightInitiatorRequest() {
        return this._preflightInitiatorRequest;
    }
    setPreflightInitiatorRequest(preflightInitiatorRequest) {
        this._preflightInitiatorRequest = preflightInitiatorRequest;
    }
    isPreflightRequest() {
        return this._initiator !== null && this._initiator !== undefined &&
            this._initiator.type === "preflight" /* Preflight */;
    }
    redirectDestination() {
        return this._redirectDestination;
    }
    setRedirectDestination(redirectDestination) {
        this._redirectDestination = redirectDestination;
    }
    requestHeaders() {
        return this._requestHeaders;
    }
    setRequestHeaders(headers) {
        this._requestHeaders = headers;
        this.dispatchEventToListeners(Events.RequestHeadersChanged);
    }
    requestHeadersText() {
        return this._requestHeadersText;
    }
    setRequestHeadersText(text) {
        this._requestHeadersText = text;
        this.dispatchEventToListeners(Events.RequestHeadersChanged);
    }
    requestHeaderValue(headerName) {
        if (this._requestHeaderValues[headerName]) {
            return this._requestHeaderValues[headerName];
        }
        this._requestHeaderValues[headerName] = this._computeHeaderValue(this.requestHeaders(), headerName);
        return this._requestHeaderValues[headerName];
    }
    requestFormData() {
        if (!this._requestFormDataPromise) {
            this._requestFormDataPromise = NetworkManager.requestPostData(this);
        }
        return this._requestFormDataPromise;
    }
    setRequestFormData(hasData, data) {
        this._requestFormDataPromise = (hasData && data === null) ? null : Promise.resolve(data);
        this._formParametersPromise = null;
    }
    _filteredProtocolName() {
        const protocol = this.protocol.toLowerCase();
        if (protocol === 'h2') {
            return 'http/2.0';
        }
        return protocol.replace(/^http\/2(\.0)?\+/, 'http/2.0+');
    }
    requestHttpVersion() {
        const headersText = this.requestHeadersText();
        if (!headersText) {
            const version = this.requestHeaderValue('version') || this.requestHeaderValue(':version');
            if (version) {
                return version;
            }
            return this._filteredProtocolName();
        }
        const firstLine = headersText.split(/\r\n/)[0];
        const match = firstLine.match(/(HTTP\/\d+\.\d+)$/);
        return match ? match[1] : 'HTTP/0.9';
    }
    get responseHeaders() {
        return this._responseHeaders || [];
    }
    set responseHeaders(x) {
        this._responseHeaders = x;
        delete this._sortedResponseHeaders;
        delete this._serverTimings;
        delete this._responseCookies;
        this._responseHeaderValues = {};
        this.dispatchEventToListeners(Events.ResponseHeadersChanged);
    }
    get responseHeadersText() {
        return this._responseHeadersText;
    }
    set responseHeadersText(x) {
        this._responseHeadersText = x;
        this.dispatchEventToListeners(Events.ResponseHeadersChanged);
    }
    get sortedResponseHeaders() {
        if (this._sortedResponseHeaders !== undefined) {
            return this._sortedResponseHeaders;
        }
        this._sortedResponseHeaders = this.responseHeaders.slice();
        this._sortedResponseHeaders.sort(function (a, b) {
            return Platform.StringUtilities.compare(a.name.toLowerCase(), b.name.toLowerCase());
        });
        return this._sortedResponseHeaders;
    }
    responseHeaderValue(headerName) {
        if (headerName in this._responseHeaderValues) {
            return this._responseHeaderValues[headerName];
        }
        this._responseHeaderValues[headerName] = this._computeHeaderValue(this.responseHeaders, headerName);
        return this._responseHeaderValues[headerName];
    }
    get responseCookies() {
        if (!this._responseCookies) {
            this._responseCookies = CookieParser.parseSetCookie(this.responseHeaderValue('Set-Cookie'), this.domain) || [];
        }
        return this._responseCookies;
    }
    responseLastModified() {
        return this.responseHeaderValue('last-modified');
    }
    allCookiesIncludingBlockedOnes() {
        return [
            ...this.includedRequestCookies(),
            ...this.responseCookies,
            ...this.blockedRequestCookies().map(blockedRequestCookie => blockedRequestCookie.cookie),
            ...this.blockedResponseCookies().map(blockedResponseCookie => blockedResponseCookie.cookie),
        ].filter(v => Boolean(v));
    }
    get serverTimings() {
        if (typeof this._serverTimings === 'undefined') {
            this._serverTimings = ServerTiming.parseHeaders(this.responseHeaders);
        }
        return this._serverTimings;
    }
    queryString() {
        if (this._queryString !== undefined) {
            return this._queryString;
        }
        let queryString = null;
        const url = this.url();
        const questionMarkPosition = url.indexOf('?');
        if (questionMarkPosition !== -1) {
            queryString = url.substring(questionMarkPosition + 1);
            const hashSignPosition = queryString.indexOf('#');
            if (hashSignPosition !== -1) {
                queryString = queryString.substring(0, hashSignPosition);
            }
        }
        this._queryString = queryString;
        return this._queryString;
    }
    get queryParameters() {
        if (this._parsedQueryParameters) {
            return this._parsedQueryParameters;
        }
        const queryString = this.queryString();
        if (!queryString) {
            return null;
        }
        this._parsedQueryParameters = this._parseParameters(queryString);
        return this._parsedQueryParameters;
    }
    async _parseFormParameters() {
        const requestContentType = this.requestContentType();
        if (!requestContentType) {
            return null;
        }
        // Handling application/x-www-form-urlencoded request bodies.
        if (requestContentType.match(/^application\/x-www-form-urlencoded\s*(;.*)?$/i)) {
            const formData = await this.requestFormData();
            if (!formData) {
                return null;
            }
            return this._parseParameters(formData);
        }
        // Handling multipart/form-data request bodies.
        const multipartDetails = requestContentType.match(/^multipart\/form-data\s*;\s*boundary\s*=\s*(\S+)\s*$/);
        if (!multipartDetails) {
            return null;
        }
        const boundary = multipartDetails[1];
        if (!boundary) {
            return null;
        }
        const formData = await this.requestFormData();
        if (!formData) {
            return null;
        }
        return this._parseMultipartFormDataParameters(formData, boundary);
    }
    formParameters() {
        if (!this._formParametersPromise) {
            this._formParametersPromise = this._parseFormParameters();
        }
        return this._formParametersPromise;
    }
    responseHttpVersion() {
        const headersText = this._responseHeadersText;
        if (!headersText) {
            const version = this.responseHeaderValue('version') || this.responseHeaderValue(':version');
            if (version) {
                return version;
            }
            return this._filteredProtocolName();
        }
        const firstLine = headersText.split(/\r\n/)[0];
        const match = firstLine.match(/^(HTTP\/\d+\.\d+)/);
        return match ? match[1] : 'HTTP/0.9';
    }
    _parseParameters(queryString) {
        function parseNameValue(pair) {
            const position = pair.indexOf('=');
            if (position === -1) {
                return { name: pair, value: '' };
            }
            return { name: pair.substring(0, position), value: pair.substring(position + 1) };
        }
        return queryString.split('&').map(parseNameValue);
    }
    /**
     * Parses multipart/form-data; boundary=boundaryString request bodies -
     * --boundaryString
     * Content-Disposition: form-data; name="field-name"; filename="r.gif"
     * Content-Type: application/octet-stream
     *
     * optionalValue
     * --boundaryString
     * Content-Disposition: form-data; name="field-name-2"
     *
     * optionalValue2
     * --boundaryString--
     */
    _parseMultipartFormDataParameters(data, boundary) {
        const sanitizedBoundary = Platform.StringUtilities.escapeForRegExp(boundary);
        const keyValuePattern = new RegExp(
        // Header with an optional file name.
        '^\\r\\ncontent-disposition\\s*:\\s*form-data\\s*;\\s*name="([^"]*)"(?:\\s*;\\s*filename="([^"]*)")?' +
            // Optional secondary header with the content type.
            '(?:\\r\\ncontent-type\\s*:\\s*([^\\r\\n]*))?' +
            // Padding.
            '\\r\\n\\r\\n' +
            // Value
            '(.*)' +
            // Padding.
            '\\r\\n$', 'is');
        const fields = data.split(new RegExp(`--${sanitizedBoundary}(?:--\s*$)?`, 'g'));
        return fields.reduce(parseMultipartField, []);
        function parseMultipartField(result, field) {
            const [match, name, filename, contentType, value] = field.match(keyValuePattern) || [];
            if (!match) {
                return result;
            }
            const processedValue = (filename || contentType) ? i18nString(UIStrings.binary) : value;
            result.push({ name, value: processedValue });
            return result;
        }
    }
    _computeHeaderValue(headers, headerName) {
        headerName = headerName.toLowerCase();
        const values = [];
        for (let i = 0; i < headers.length; ++i) {
            if (headers[i].name.toLowerCase() === headerName) {
                values.push(headers[i].value);
            }
        }
        if (!values.length) {
            return undefined;
        }
        // Set-Cookie values should be separated by '\n', not comma, otherwise cookies could not be parsed.
        if (headerName === 'set-cookie') {
            return values.join('\n');
        }
        return values.join(', ');
    }
    contentData() {
        if (this._contentData) {
            return this._contentData;
        }
        if (this._contentDataProvider) {
            this._contentData = this._contentDataProvider();
        }
        else {
            this._contentData = NetworkManager.requestContentData(this);
        }
        return this._contentData;
    }
    setContentDataProvider(dataProvider) {
        console.assert(!this._contentData, 'contentData can only be set once.');
        this._contentDataProvider = dataProvider;
    }
    contentURL() {
        return this._url;
    }
    contentType() {
        return this._resourceType;
    }
    async contentEncoded() {
        return (await this.contentData()).encoded;
    }
    async requestContent() {
        const { content, error, encoded } = await this.contentData();
        return {
            content,
            error,
            isEncoded: encoded,
        };
    }
    async searchInContent(query, caseSensitive, isRegex) {
        if (!this._contentDataProvider) {
            return NetworkManager.searchInRequest(this, query, caseSensitive, isRegex);
        }
        const contentData = await this.contentData();
        let content = contentData.content;
        if (!content) {
            return [];
        }
        if (contentData.encoded) {
            content = window.atob(content);
        }
        return TextUtils.TextUtils.performSearchInContent(content, query, caseSensitive, isRegex);
    }
    isHttpFamily() {
        return Boolean(this.url().match(/^https?:/i));
    }
    requestContentType() {
        return this.requestHeaderValue('Content-Type');
    }
    hasErrorStatusCode() {
        return this.statusCode >= 400;
    }
    setInitialPriority(priority) {
        this._initialPriority = priority;
    }
    initialPriority() {
        return this._initialPriority;
    }
    setPriority(priority) {
        this._currentPriority = priority;
    }
    priority() {
        return this._currentPriority || this._initialPriority || null;
    }
    setSignedExchangeInfo(info) {
        this._signedExchangeInfo = info;
    }
    signedExchangeInfo() {
        return this._signedExchangeInfo;
    }
    setWebBundleInfo(info) {
        this._webBundleInfo = info;
    }
    webBundleInfo() {
        return this._webBundleInfo;
    }
    setWebBundleInnerRequestInfo(info) {
        this._webBundleInnerRequestInfo = info;
    }
    webBundleInnerRequestInfo() {
        return this._webBundleInnerRequestInfo;
    }
    async populateImageSource(image) {
        const { content, encoded } = await this.contentData();
        let imageSrc = TextUtils.ContentProvider.contentAsDataURL(content, this._mimeType, encoded);
        if (imageSrc === null && !this._failed) {
            const cacheControl = this.responseHeaderValue('cache-control') || '';
            if (!cacheControl.includes('no-cache')) {
                imageSrc = this._url;
            }
        }
        if (imageSrc !== null) {
            image.src = imageSrc;
        }
    }
    initiator() {
        return this._initiator || null;
    }
    frames() {
        return this._frames;
    }
    addProtocolFrameError(errorMessage, time) {
        this.addFrame({ type: WebSocketFrameType.Error, text: errorMessage, time: this.pseudoWallTime(time), opCode: -1, mask: false });
    }
    addProtocolFrame(response, time, sent) {
        const type = sent ? WebSocketFrameType.Send : WebSocketFrameType.Receive;
        this.addFrame({
            type: type,
            text: response.payloadData,
            time: this.pseudoWallTime(time),
            opCode: response.opcode,
            mask: response.mask,
        });
    }
    addFrame(frame) {
        this._frames.push(frame);
        this.dispatchEventToListeners(Events.WebsocketFrameAdded, frame);
    }
    eventSourceMessages() {
        return this._eventSourceMessages;
    }
    addEventSourceMessage(time, eventName, eventId, data) {
        const message = { time: this.pseudoWallTime(time), eventName: eventName, eventId: eventId, data: data };
        this._eventSourceMessages.push(message);
        this.dispatchEventToListeners(Events.EventSourceMessageAdded, message);
    }
    markAsRedirect(redirectCount) {
        this._isRedirect = true;
        this._requestId = `${this._backendRequestId}:redirected.${redirectCount}`;
    }
    isRedirect() {
        return this._isRedirect;
    }
    setRequestIdForTest(requestId) {
        this._backendRequestId = requestId;
        this._requestId = requestId;
    }
    charset() {
        const contentTypeHeader = this.responseHeaderValue('content-type');
        if (!contentTypeHeader) {
            return null;
        }
        const responseCharsets = contentTypeHeader.replace(/ /g, '')
            .split(';')
            .filter(parameter => parameter.toLowerCase().startsWith('charset='))
            .map(parameter => parameter.slice('charset='.length));
        if (responseCharsets.length) {
            return responseCharsets[0];
        }
        return null;
    }
    addExtraRequestInfo(extraRequestInfo) {
        this._blockedRequestCookies = extraRequestInfo.blockedRequestCookies;
        this._includedRequestCookies = extraRequestInfo.includedRequestCookies;
        this.setRequestHeaders(extraRequestInfo.requestHeaders);
        this._hasExtraRequestInfo = true;
        this.setRequestHeadersText(''); // Mark request headers as non-provisional
        this._clientSecurityState = extraRequestInfo.clientSecurityState;
    }
    hasExtraRequestInfo() {
        return this._hasExtraRequestInfo;
    }
    blockedRequestCookies() {
        return this._blockedRequestCookies;
    }
    includedRequestCookies() {
        return this._includedRequestCookies;
    }
    hasRequestCookies() {
        return this._includedRequestCookies.length > 0 || this._blockedRequestCookies.length > 0;
    }
    addExtraResponseInfo(extraResponseInfo) {
        this._blockedResponseCookies = extraResponseInfo.blockedResponseCookies;
        this.responseHeaders = extraResponseInfo.responseHeaders;
        if (extraResponseInfo.responseHeadersText) {
            this.responseHeadersText = extraResponseInfo.responseHeadersText;
            if (!this.requestHeadersText()) {
                // Generate request headers text from raw headers in extra request info because
                // Network.requestWillBeSentExtraInfo doesn't include headers text.
                let requestHeadersText = `${this.requestMethod} ${this.parsedURL.path}`;
                if (this.parsedURL.queryParams) {
                    requestHeadersText += `?${this.parsedURL.queryParams}`;
                }
                requestHeadersText += ' HTTP/1.1\r\n';
                for (const { name, value } of this.requestHeaders()) {
                    requestHeadersText += `${name}: ${value}\r\n`;
                }
                this.setRequestHeadersText(requestHeadersText);
            }
        }
        this._remoteAddressSpace = extraResponseInfo.resourceIPAddressSpace;
        this._hasExtraResponseInfo = true;
    }
    hasExtraResponseInfo() {
        return this._hasExtraResponseInfo;
    }
    blockedResponseCookies() {
        return this._blockedResponseCookies;
    }
    redirectSourceSignedExchangeInfoHasNoErrors() {
        return this._redirectSource !== null && this._redirectSource._signedExchangeInfo !== null &&
            !this._redirectSource._signedExchangeInfo.errors;
    }
    clientSecurityState() {
        return this._clientSecurityState;
    }
    setTrustTokenParams(trustTokenParams) {
        this._trustTokenParams = trustTokenParams;
    }
    trustTokenParams() {
        return this._trustTokenParams;
    }
    setTrustTokenOperationDoneEvent(doneEvent) {
        this._trustTokenOperationDoneEvent = doneEvent;
        this.dispatchEventToListeners(Events.TrustTokenResultAdded);
    }
    trustTokenOperationDoneEvent() {
        return this._trustTokenOperationDoneEvent;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["FinishedLoading"] = "FinishedLoading";
    Events["TimingChanged"] = "TimingChanged";
    Events["RemoteAddressChanged"] = "RemoteAddressChanged";
    Events["RequestHeadersChanged"] = "RequestHeadersChanged";
    Events["ResponseHeadersChanged"] = "ResponseHeadersChanged";
    Events["WebsocketFrameAdded"] = "WebsocketFrameAdded";
    Events["EventSourceMessageAdded"] = "EventSourceMessageAdded";
    Events["TrustTokenResultAdded"] = "TrustTokenResultAdded";
})(Events || (Events = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var InitiatorType;
(function (InitiatorType) {
    InitiatorType["Other"] = "other";
    InitiatorType["Parser"] = "parser";
    InitiatorType["Redirect"] = "redirect";
    InitiatorType["Script"] = "script";
    InitiatorType["Preload"] = "preload";
    InitiatorType["SignedExchange"] = "signedExchange";
    InitiatorType["Preflight"] = "preflight";
})(InitiatorType || (InitiatorType = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var WebSocketFrameType;
(function (WebSocketFrameType) {
    WebSocketFrameType["Send"] = "send";
    WebSocketFrameType["Receive"] = "receive";
    WebSocketFrameType["Error"] = "error";
})(WebSocketFrameType || (WebSocketFrameType = {}));
export const cookieBlockedReasonToUiString = function (blockedReason) {
    switch (blockedReason) {
        case "SecureOnly" /* SecureOnly */:
            return i18nString(UIStrings.secureOnly);
        case "NotOnPath" /* NotOnPath */:
            return i18nString(UIStrings.notOnPath);
        case "DomainMismatch" /* DomainMismatch */:
            return i18nString(UIStrings.domainMismatch);
        case "SameSiteStrict" /* SameSiteStrict */:
            return i18nString(UIStrings.sameSiteStrict);
        case "SameSiteLax" /* SameSiteLax */:
            return i18nString(UIStrings.sameSiteLax);
        case "SameSiteUnspecifiedTreatedAsLax" /* SameSiteUnspecifiedTreatedAsLax */:
            return i18nString(UIStrings.sameSiteUnspecifiedTreatedAsLax);
        case "SameSiteNoneInsecure" /* SameSiteNoneInsecure */:
            return i18nString(UIStrings.sameSiteNoneInsecure);
        case "UserPreferences" /* UserPreferences */:
            return i18nString(UIStrings.userPreferences);
        case "UnknownError" /* UnknownError */:
            return i18nString(UIStrings.unknownError);
        case "SchemefulSameSiteStrict" /* SchemefulSameSiteStrict */:
            return i18nString(UIStrings.schemefulSameSiteStrict);
        case "SchemefulSameSiteLax" /* SchemefulSameSiteLax */:
            return i18nString(UIStrings.schemefulSameSiteLax);
        case "SchemefulSameSiteUnspecifiedTreatedAsLax" /* SchemefulSameSiteUnspecifiedTreatedAsLax */:
            return i18nString(UIStrings.schemefulSameSiteUnspecifiedTreatedAsLax);
        case "SamePartyFromCrossPartyContext" /* SamePartyFromCrossPartyContext */:
            return i18nString(UIStrings.samePartyFromCrossPartyContext);
    }
    return '';
};
export const setCookieBlockedReasonToUiString = function (blockedReason) {
    switch (blockedReason) {
        case "SecureOnly" /* SecureOnly */:
            return i18nString(UIStrings.blockedReasonSecureOnly);
        case "SameSiteStrict" /* SameSiteStrict */:
            return i18nString(UIStrings.blockedReasonSameSiteStrictLax, { PH1: 'SameSite=Strict' });
        case "SameSiteLax" /* SameSiteLax */:
            return i18nString(UIStrings.blockedReasonSameSiteStrictLax, { PH1: 'SameSite=Lax' });
        case "SameSiteUnspecifiedTreatedAsLax" /* SameSiteUnspecifiedTreatedAsLax */:
            return i18nString(UIStrings.blockedReasonSameSiteUnspecifiedTreatedAsLax);
        case "SameSiteNoneInsecure" /* SameSiteNoneInsecure */:
            return i18nString(UIStrings.blockedReasonSameSiteNoneInsecure);
        case "UserPreferences" /* UserPreferences */:
            return i18nString(UIStrings.thisSetcookieWasBlockedDueToUser);
        case "SyntaxError" /* SyntaxError */:
            return i18nString(UIStrings.thisSetcookieHadInvalidSyntax);
        case "SchemeNotSupported" /* SchemeNotSupported */:
            return i18nString(UIStrings.theSchemeOfThisConnectionIsNot);
        case "OverwriteSecure" /* OverwriteSecure */:
            return i18nString(UIStrings.blockedReasonOverwriteSecure);
        case "InvalidDomain" /* InvalidDomain */:
            return i18nString(UIStrings.blockedReasonInvalidDomain);
        case "InvalidPrefix" /* InvalidPrefix */:
            return i18nString(UIStrings.blockedReasonInvalidPrefix);
        case "UnknownError" /* UnknownError */:
            return i18nString(UIStrings.anUnknownErrorWasEncounteredWhenTrying);
        case "SchemefulSameSiteStrict" /* SchemefulSameSiteStrict */:
            return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSamesiteStrictLax, { PH1: 'SameSite=Strict' });
        case "SchemefulSameSiteLax" /* SchemefulSameSiteLax */:
            return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSamesiteStrictLax, { PH1: 'SameSite=Lax' });
        case "SchemefulSameSiteUnspecifiedTreatedAsLax" /* SchemefulSameSiteUnspecifiedTreatedAsLax */:
            return i18nString(UIStrings.thisSetcookieDidntSpecifyASamesite);
        case "SamePartyFromCrossPartyContext" /* SamePartyFromCrossPartyContext */:
            return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSameparty);
        case "SamePartyConflictsWithOtherAttributes" /* SamePartyConflictsWithOtherAttributes */:
            return i18nString(UIStrings.thisSetcookieWasBlockedBecauseItHadTheSamepartyAttribute);
    }
    return '';
};
export const cookieBlockedReasonToAttribute = function (blockedReason) {
    switch (blockedReason) {
        case "SecureOnly" /* SecureOnly */:
            return Attributes.Secure;
        case "NotOnPath" /* NotOnPath */:
            return Attributes.Path;
        case "DomainMismatch" /* DomainMismatch */:
            return Attributes.Domain;
        case "SameSiteStrict" /* SameSiteStrict */:
        case "SameSiteLax" /* SameSiteLax */:
        case "SameSiteUnspecifiedTreatedAsLax" /* SameSiteUnspecifiedTreatedAsLax */:
        case "SameSiteNoneInsecure" /* SameSiteNoneInsecure */:
        case "SchemefulSameSiteStrict" /* SchemefulSameSiteStrict */:
        case "SchemefulSameSiteLax" /* SchemefulSameSiteLax */:
        case "SchemefulSameSiteUnspecifiedTreatedAsLax" /* SchemefulSameSiteUnspecifiedTreatedAsLax */:
            return Attributes.SameSite;
        case "SamePartyFromCrossPartyContext" /* SamePartyFromCrossPartyContext */:
            return Attributes.SameParty;
        case "UserPreferences" /* UserPreferences */:
        case "UnknownError" /* UnknownError */:
            return null;
    }
    return null;
};
export const setCookieBlockedReasonToAttribute = function (blockedReason) {
    switch (blockedReason) {
        case "SecureOnly" /* SecureOnly */:
        case "OverwriteSecure" /* OverwriteSecure */:
            return Attributes.Secure;
        case "SameSiteStrict" /* SameSiteStrict */:
        case "SameSiteLax" /* SameSiteLax */:
        case "SameSiteUnspecifiedTreatedAsLax" /* SameSiteUnspecifiedTreatedAsLax */:
        case "SameSiteNoneInsecure" /* SameSiteNoneInsecure */:
        case "SchemefulSameSiteStrict" /* SchemefulSameSiteStrict */:
        case "SchemefulSameSiteLax" /* SchemefulSameSiteLax */:
        case "SchemefulSameSiteUnspecifiedTreatedAsLax" /* SchemefulSameSiteUnspecifiedTreatedAsLax */:
            return Attributes.SameSite;
        case "InvalidDomain" /* InvalidDomain */:
            return Attributes.Domain;
        case "InvalidPrefix" /* InvalidPrefix */:
            return Attributes.Name;
        case "SamePartyConflictsWithOtherAttributes" /* SamePartyConflictsWithOtherAttributes */:
        case "SamePartyFromCrossPartyContext" /* SamePartyFromCrossPartyContext */:
            return Attributes.SameParty;
        case "UserPreferences" /* UserPreferences */:
        case "SyntaxError" /* SyntaxError */:
        case "SchemeNotSupported" /* SchemeNotSupported */:
        case "UnknownError" /* UnknownError */:
            return null;
    }
    return null;
};
//# sourceMappingURL=NetworkRequest.js.map