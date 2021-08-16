// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
export class Importer {
    static requestsFromHARLog(log) {
        const pages = new Map();
        for (const page of log.pages) {
            pages.set(page.id, page);
        }
        log.entries.sort((a, b) => a.startedDateTime.valueOf() - b.startedDateTime.valueOf());
        const pageLoads = new Map();
        const requests = [];
        for (const entry of log.entries) {
            const pageref = entry.pageref;
            let pageLoad = pageref ? pageLoads.get(pageref) : undefined;
            const documentURL = pageLoad ? pageLoad.mainRequest.url() : entry.request.url;
            let initiator = null;
            const initiatorEntry = entry.customInitiator();
            if (initiatorEntry) {
                initiator = {
                    type: initiatorEntry.type,
                    url: initiatorEntry.url,
                    lineNumber: initiatorEntry.lineNumber,
                };
            }
            const request = new SDK.NetworkRequest.NetworkRequest('har-' + requests.length, entry.request.url, documentURL, '', '', initiator);
            const page = pageref ? pages.get(pageref) : undefined;
            if (!pageLoad && pageref && page) {
                pageLoad = Importer._buildPageLoad(page, request);
                pageLoads.set(pageref, pageLoad);
            }
            Importer._fillRequestFromHAREntry(request, entry, pageLoad);
            if (pageLoad) {
                pageLoad.bindRequest(request);
            }
            requests.push(request);
        }
        return requests;
    }
    static _buildPageLoad(page, mainRequest) {
        const pageLoad = new SDK.PageLoad.PageLoad(mainRequest);
        pageLoad.startTime = page.startedDateTime.valueOf();
        pageLoad.contentLoadTime = Number(page.pageTimings.onContentLoad) * 1000;
        pageLoad.loadTime = Number(page.pageTimings.onLoad) * 1000;
        return pageLoad;
    }
    static _fillRequestFromHAREntry(request, entry, pageLoad) {
        // Request data.
        if (entry.request.postData) {
            request.setRequestFormData(true, entry.request.postData.text);
        }
        else {
            request.setRequestFormData(false, null);
        }
        request.connectionId = entry.connection || '';
        request.requestMethod = entry.request.method;
        request.setRequestHeaders(entry.request.headers);
        // Response data.
        if (entry.response.content.mimeType && entry.response.content.mimeType !== 'x-unknown') {
            request.mimeType = entry.response.content.mimeType;
        }
        request.responseHeaders = entry.response.headers;
        request.statusCode = entry.response.status;
        request.statusText = entry.response.statusText;
        let protocol = entry.response.httpVersion.toLowerCase();
        if (protocol === 'http/2.0') {
            protocol = 'h2';
        }
        request.protocol = protocol.replace(/^http\/2\.0?\+quic/, 'http/2+quic');
        // Timing data.
        const issueTime = entry.startedDateTime.getTime() / 1000;
        request.setIssueTime(issueTime, issueTime);
        // Content data.
        const contentSize = entry.response.content.size > 0 ? entry.response.content.size : 0;
        const headersSize = entry.response.headersSize > 0 ? entry.response.headersSize : 0;
        const bodySize = entry.response.bodySize > 0 ? entry.response.bodySize : 0;
        request.resourceSize = contentSize || (headersSize + bodySize);
        let transferSize = entry.response.customAsNumber('transferSize');
        if (transferSize === undefined) {
            transferSize = entry.response.headersSize + entry.response.bodySize;
        }
        request.setTransferSize(transferSize >= 0 ? transferSize : 0);
        const fromCache = entry.customAsString('fromCache');
        if (fromCache === 'memory') {
            request.setFromMemoryCache();
        }
        else if (fromCache === 'disk') {
            request.setFromDiskCache();
        }
        const contentText = entry.response.content.text;
        const contentData = {
            error: null,
            content: contentText ? contentText : null,
            encoded: entry.response.content.encoding === 'base64',
        };
        request.setContentDataProvider(async () => contentData);
        // Timing data.
        Importer._setupTiming(request, issueTime, entry.time, entry.timings);
        // Meta data.
        request.setRemoteAddress(entry.serverIPAddress || '', 80); // Har does not support port numbers.
        request.setResourceType(Importer._getResourceType(request, entry, pageLoad));
        const priority = entry.customAsString('priority');
        if (priority && Protocol.Network.ResourcePriority.hasOwnProperty(priority)) {
            request.setPriority(priority);
        }
        const messages = entry.customAsArray('webSocketMessages');
        if (messages) {
            for (const message of messages) {
                if (message.time === undefined) {
                    continue;
                }
                if (!Object.values(SDK.NetworkRequest.WebSocketFrameType).includes(message.type)) {
                    continue;
                }
                if (message.opcode === undefined) {
                    continue;
                }
                if (message.data === undefined) {
                    continue;
                }
                const mask = message.type === SDK.NetworkRequest.WebSocketFrameType.Send;
                request.addFrame({ time: message.time, text: message.data, opCode: message.opcode, mask: mask, type: message.type });
            }
        }
        request.finished = true;
    }
    static _getResourceType(request, entry, pageLoad) {
        const customResourceTypeName = entry.customAsString('resourceType');
        if (customResourceTypeName) {
            const customResourceType = Common.ResourceType.ResourceType.fromName(customResourceTypeName);
            if (customResourceType) {
                return customResourceType;
            }
        }
        if (pageLoad && pageLoad.mainRequest === request) {
            return Common.ResourceType.resourceTypes.Document;
        }
        const resourceTypeFromMime = Common.ResourceType.ResourceType.fromMimeType(entry.response.content.mimeType);
        if (resourceTypeFromMime !== Common.ResourceType.resourceTypes.Other) {
            return resourceTypeFromMime;
        }
        const resourceTypeFromUrl = Common.ResourceType.ResourceType.fromURL(entry.request.url);
        if (resourceTypeFromUrl) {
            return resourceTypeFromUrl;
        }
        return Common.ResourceType.resourceTypes.Other;
    }
    static _setupTiming(request, issueTime, entryTotalDuration, timings) {
        function accumulateTime(timing) {
            if (timing === undefined || timing < 0) {
                return -1;
            }
            lastEntry += timing;
            return lastEntry;
        }
        let lastEntry = timings.blocked && (timings.blocked >= 0) ? timings.blocked : 0;
        const proxy = timings.customAsNumber('blocked_proxy') || -1;
        const queueing = timings.customAsNumber('blocked_queueing') || -1;
        // SSL is part of connect for both HAR and Chrome's format so subtract it here.
        const ssl = timings.ssl && (timings.ssl >= 0) ? timings.ssl : 0;
        if (timings.connect && (timings.connect > 0)) {
            timings.connect -= ssl;
        }
        const timing = {
            proxyStart: proxy > 0 ? lastEntry - proxy : -1,
            proxyEnd: proxy > 0 ? lastEntry : -1,
            requestTime: issueTime + (queueing > 0 ? queueing : 0) / 1000,
            dnsStart: timings.dns && (timings.dns >= 0) ? lastEntry : -1,
            dnsEnd: accumulateTime(timings.dns),
            // Add ssl to end time without modifying lastEntry (see comment above).
            connectStart: timings.connect && (timings.connect >= 0) ? lastEntry : -1,
            connectEnd: accumulateTime(timings.connect) + ssl,
            // Now update lastEntry to add ssl timing back in (see comment above).
            sslStart: timings.ssl && (timings.ssl >= 0) ? lastEntry : -1,
            sslEnd: accumulateTime(timings.ssl),
            workerStart: -1,
            workerReady: -1,
            workerFetchStart: -1,
            workerRespondWithSettled: -1,
            sendStart: timings.send >= 0 ? lastEntry : -1,
            sendEnd: accumulateTime(timings.send),
            pushStart: 0,
            pushEnd: 0,
            receiveHeadersEnd: accumulateTime(timings.wait),
        };
        accumulateTime(timings.receive);
        request.timing = timing;
        request.endTime = issueTime + Math.max(entryTotalDuration, lastEntry) / 1000;
    }
}
//# sourceMappingURL=Importer.js.map