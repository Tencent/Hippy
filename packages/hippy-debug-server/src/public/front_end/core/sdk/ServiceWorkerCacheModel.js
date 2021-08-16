// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { Events as SecurityOriginManagerEvents, SecurityOriginManager } from './SecurityOriginManager.js';
const UIStrings = {
    /**
    *@description Text in Service Worker Cache Model
    *@example {https://cache} PH1
    *@example {error message} PH2
    */
    serviceworkercacheagentError: '`ServiceWorkerCacheAgent` error deleting cache entry {PH1} in cache: {PH2}',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/ServiceWorkerCacheModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ServiceWorkerCacheModel extends SDKModel {
    _caches;
    _cacheAgent;
    _storageAgent;
    _securityOriginManager;
    _originsUpdated;
    _throttler;
    _enabled;
    /**
     * Invariant: This model can only be constructed on a ServiceWorker target.
     */
    constructor(target) {
        super(target);
        target.registerStorageDispatcher(this);
        this._caches = new Map();
        this._cacheAgent = target.cacheStorageAgent();
        this._storageAgent = target.storageAgent();
        this._securityOriginManager = target.model(SecurityOriginManager);
        this._originsUpdated = new Set();
        this._throttler = new Common.Throttler.Throttler(2000);
        this._enabled = false;
    }
    enable() {
        if (this._enabled) {
            return;
        }
        this._securityOriginManager.addEventListener(SecurityOriginManagerEvents.SecurityOriginAdded, this._securityOriginAdded, this);
        this._securityOriginManager.addEventListener(SecurityOriginManagerEvents.SecurityOriginRemoved, this._securityOriginRemoved, this);
        for (const securityOrigin of this._securityOriginManager.securityOrigins()) {
            this._addOrigin(securityOrigin);
        }
        this._enabled = true;
    }
    clearForOrigin(origin) {
        this._removeOrigin(origin);
        this._addOrigin(origin);
    }
    refreshCacheNames() {
        for (const cache of this._caches.values()) {
            this._cacheRemoved(cache);
        }
        this._caches.clear();
        const securityOrigins = this._securityOriginManager.securityOrigins();
        for (const securityOrigin of securityOrigins) {
            this._loadCacheNames(securityOrigin);
        }
    }
    async deleteCache(cache) {
        const response = await this._cacheAgent.invoke_deleteCache({ cacheId: cache.cacheId });
        if (response.getError()) {
            console.error(`ServiceWorkerCacheAgent error deleting cache ${cache.toString()}: ${response.getError()}`);
            return;
        }
        this._caches.delete(cache.cacheId);
        this._cacheRemoved(cache);
    }
    async deleteCacheEntry(cache, request) {
        const response = await this._cacheAgent.invoke_deleteEntry({ cacheId: cache.cacheId, request });
        if (response.getError()) {
            Common.Console.Console.instance().error(i18nString(UIStrings.serviceworkercacheagentError, { PH1: cache.toString(), PH2: response.getError() }));
            return;
        }
    }
    loadCacheData(cache, skipCount, pageSize, pathFilter, callback) {
        this._requestEntries(cache, skipCount, pageSize, pathFilter, callback);
    }
    loadAllCacheData(cache, pathFilter, callback) {
        this._requestAllEntries(cache, pathFilter, callback);
    }
    caches() {
        const caches = new Array();
        for (const cache of this._caches.values()) {
            caches.push(cache);
        }
        return caches;
    }
    dispose() {
        for (const cache of this._caches.values()) {
            this._cacheRemoved(cache);
        }
        this._caches.clear();
        if (this._enabled) {
            this._securityOriginManager.removeEventListener(SecurityOriginManagerEvents.SecurityOriginAdded, this._securityOriginAdded, this);
            this._securityOriginManager.removeEventListener(SecurityOriginManagerEvents.SecurityOriginRemoved, this._securityOriginRemoved, this);
        }
    }
    _addOrigin(securityOrigin) {
        this._loadCacheNames(securityOrigin);
        if (this._isValidSecurityOrigin(securityOrigin)) {
            this._storageAgent.invoke_trackCacheStorageForOrigin({ origin: securityOrigin });
        }
    }
    _removeOrigin(securityOrigin) {
        for (const [opaqueId, cache] of this._caches.entries()) {
            if (cache.securityOrigin === securityOrigin) {
                this._caches.delete(opaqueId);
                this._cacheRemoved(cache);
            }
        }
        if (this._isValidSecurityOrigin(securityOrigin)) {
            this._storageAgent.invoke_untrackCacheStorageForOrigin({ origin: securityOrigin });
        }
    }
    _isValidSecurityOrigin(securityOrigin) {
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(securityOrigin);
        return parsedURL !== null && parsedURL.scheme.startsWith('http');
    }
    async _loadCacheNames(securityOrigin) {
        const response = await this._cacheAgent.invoke_requestCacheNames({ securityOrigin: securityOrigin });
        if (response.getError()) {
            return;
        }
        this._updateCacheNames(securityOrigin, response.caches);
    }
    _updateCacheNames(securityOrigin, cachesJson) {
        function deleteAndSaveOldCaches(cache) {
            if (cache.securityOrigin === securityOrigin && !updatingCachesIds.has(cache.cacheId)) {
                oldCaches.set(cache.cacheId, cache);
                this._caches.delete(cache.cacheId);
            }
        }
        const updatingCachesIds = new Set();
        const newCaches = new Map();
        const oldCaches = new Map();
        for (const cacheJson of cachesJson) {
            const cache = new Cache(this, cacheJson.securityOrigin, cacheJson.cacheName, cacheJson.cacheId);
            updatingCachesIds.add(cache.cacheId);
            if (this._caches.has(cache.cacheId)) {
                continue;
            }
            newCaches.set(cache.cacheId, cache);
            this._caches.set(cache.cacheId, cache);
        }
        this._caches.forEach(deleteAndSaveOldCaches, this);
        newCaches.forEach(this._cacheAdded, this);
        oldCaches.forEach(this._cacheRemoved, this);
    }
    _securityOriginAdded(event) {
        const securityOrigin = event.data;
        this._addOrigin(securityOrigin);
    }
    _securityOriginRemoved(event) {
        const securityOrigin = event.data;
        this._removeOrigin(securityOrigin);
    }
    _cacheAdded(cache) {
        this.dispatchEventToListeners(Events.CacheAdded, { model: this, cache: cache });
    }
    _cacheRemoved(cache) {
        this.dispatchEventToListeners(Events.CacheRemoved, { model: this, cache: cache });
    }
    async _requestEntries(cache, skipCount, pageSize, pathFilter, callback) {
        const response = await this._cacheAgent.invoke_requestEntries({ cacheId: cache.cacheId, skipCount, pageSize, pathFilter });
        if (response.getError()) {
            console.error('ServiceWorkerCacheAgent error while requesting entries: ', response.getError());
            return;
        }
        callback(response.cacheDataEntries, response.returnCount);
    }
    async _requestAllEntries(cache, pathFilter, callback) {
        const response = await this._cacheAgent.invoke_requestEntries({ cacheId: cache.cacheId, pathFilter });
        if (response.getError()) {
            console.error('ServiceWorkerCacheAgent error while requesting entries: ', response.getError());
            return;
        }
        callback(response.cacheDataEntries, response.returnCount);
    }
    cacheStorageListUpdated({ origin }) {
        this._originsUpdated.add(origin);
        this._throttler.schedule(() => {
            const promises = Array.from(this._originsUpdated, origin => this._loadCacheNames(origin));
            this._originsUpdated.clear();
            return Promise.all(promises);
        });
    }
    cacheStorageContentUpdated({ origin, cacheName }) {
        this.dispatchEventToListeners(Events.CacheStorageContentUpdated, { origin, cacheName });
    }
    indexedDBListUpdated(_event) {
    }
    indexedDBContentUpdated(_event) {
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["CacheAdded"] = "CacheAdded";
    Events["CacheRemoved"] = "CacheRemoved";
    Events["CacheStorageContentUpdated"] = "CacheStorageContentUpdated";
})(Events || (Events = {}));
export class Cache {
    _model;
    securityOrigin;
    cacheName;
    cacheId;
    constructor(model, securityOrigin, cacheName, cacheId) {
        this._model = model;
        this.securityOrigin = securityOrigin;
        this.cacheName = cacheName;
        this.cacheId = cacheId;
    }
    equals(cache) {
        return this.cacheId === cache.cacheId;
    }
    toString() {
        return this.securityOrigin + this.cacheName;
    }
    async requestCachedResponse(url, requestHeaders) {
        const response = await this._model._cacheAgent.invoke_requestCachedResponse({ cacheId: this.cacheId, requestURL: url, requestHeaders });
        if (response.getError()) {
            return null;
        }
        return response.response;
    }
}
SDKModel.register(ServiceWorkerCacheModel, { capabilities: Capability.Storage, autostart: false });
//# sourceMappingURL=ServiceWorkerCacheModel.js.map