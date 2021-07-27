// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as Host from '../host/host.js'; // eslint-disable-line no-unused-vars
import * as i18n from '../i18n/i18n.js';
import { FrameManager } from './FrameManager.js';
import { IOModel } from './IOModel.js';
import { MultitargetNetworkManager } from './NetworkManager.js';
import { NetworkManager } from './NetworkManager.js';
import { Events as ResourceTreeModelEvents, ResourceTreeModel } from './ResourceTreeModel.js'; // eslint-disable-line no-unused-vars
import { TargetManager } from './TargetManager.js';
const UIStrings = {
    /**
    *@description Error message for canceled source map loads
    */
    loadCanceledDueToReloadOf: 'Load canceled due to reload of inspected page',
    /**
    *@description Error message for canceled source map loads
    */
    loadCanceledDueToLoadTimeout: 'Load canceled due to load timeout',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/PageResourceLoader.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let pageResourceLoader = null;
/**
 * The page resource loader is a bottleneck for all DevTools-initiated resource loads. For each such load, it keeps a
 * `PageResource` object around that holds meta information. This can be as the basis for reporting to the user which
 * resources were loaded, and whether there was a load error.
 */
export class PageResourceLoader extends Common.ObjectWrapper.ObjectWrapper {
    _currentlyLoading;
    _maxConcurrentLoads;
    _pageResources;
    _queuedLoads;
    _loadOverride;
    _loadTimeout;
    constructor(loadOverride, maxConcurrentLoads, loadTimeout) {
        super();
        this._currentlyLoading = 0;
        this._maxConcurrentLoads = maxConcurrentLoads;
        this._pageResources = new Map();
        this._queuedLoads = [];
        TargetManager.instance().addModelListener(ResourceTreeModel, ResourceTreeModelEvents.MainFrameNavigated, this._onMainFrameNavigated, this);
        this._loadOverride = loadOverride;
        this._loadTimeout = loadTimeout;
    }
    static instance({ forceNew, loadOverride, maxConcurrentLoads, loadTimeout } = {
        forceNew: false,
        loadOverride: null,
        maxConcurrentLoads: 500,
        loadTimeout: 30000,
    }) {
        if (!pageResourceLoader || forceNew) {
            pageResourceLoader = new PageResourceLoader(loadOverride, maxConcurrentLoads, loadTimeout);
        }
        return pageResourceLoader;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _onMainFrameNavigated(event) {
        const mainFrame = event.data;
        if (!mainFrame.isTopFrame()) {
            return;
        }
        for (const { reject } of this._queuedLoads) {
            reject(new Error(i18nString(UIStrings.loadCanceledDueToReloadOf)));
        }
        this._queuedLoads = [];
        this._pageResources.clear();
        this.dispatchEventToListeners(Events.Update);
    }
    getResourcesLoaded() {
        return this._pageResources;
    }
    /**
     * Loading is the number of currently loading and queued items. Resources is the total number of resources,
     * including loading and queued resources, but not including resources that are still loading but scheduled
     * for cancelation.;
     */
    getNumberOfResources() {
        return { loading: this._currentlyLoading, queued: this._queuedLoads.length, resources: this._pageResources.size };
    }
    async _acquireLoadSlot() {
        this._currentlyLoading++;
        if (this._currentlyLoading > this._maxConcurrentLoads) {
            const pair = { resolve: () => { }, reject: () => { } };
            const waitForCapacity = new Promise((resolve, reject) => {
                pair.resolve = resolve;
                pair.reject = reject;
            });
            this._queuedLoads.push(pair);
            await waitForCapacity;
        }
    }
    _releaseLoadSlot() {
        this._currentlyLoading--;
        const entry = this._queuedLoads.shift();
        if (entry) {
            entry.resolve(undefined);
        }
    }
    static async _withTimeout(promise, timeout) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(reject, timeout, new Error(i18nString(UIStrings.loadCanceledDueToLoadTimeout))));
        return Promise.race([promise, timeoutPromise]);
    }
    static makeKey(url, initiator) {
        if (initiator.frameId) {
            return `${url}-${initiator.frameId}`;
        }
        if (initiator.target) {
            return `${url}-${initiator.target.id()}`;
        }
        throw new Error('Invalid initiator');
    }
    async loadResource(url, initiator) {
        const key = PageResourceLoader.makeKey(url, initiator);
        const pageResource = { success: null, size: null, errorMessage: undefined, url, initiator };
        this._pageResources.set(key, pageResource);
        this.dispatchEventToListeners(Events.Update);
        try {
            await this._acquireLoadSlot();
            const resultPromise = this._dispatchLoad(url, initiator);
            const result = await PageResourceLoader._withTimeout(resultPromise, this._loadTimeout);
            pageResource.errorMessage = result.errorDescription.message;
            pageResource.success = result.success;
            if (result.success) {
                pageResource.size = result.content.length;
                return { content: result.content };
            }
            throw new Error(result.errorDescription.message);
        }
        catch (e) {
            if (pageResource.errorMessage === undefined) {
                pageResource.errorMessage = e.message;
            }
            if (pageResource.success === null) {
                pageResource.success = false;
            }
            throw e;
        }
        finally {
            this._releaseLoadSlot();
            this.dispatchEventToListeners(Events.Update);
        }
    }
    async _dispatchLoad(url, initiator) {
        let failureReason = null;
        if (this._loadOverride) {
            return this._loadOverride(url);
        }
        const parsedURL = new Common.ParsedURL.ParsedURL(url);
        const eligibleForLoadFromTarget = getLoadThroughTargetSetting().get() && parsedURL && parsedURL.isHttpOrHttps();
        Host.userMetrics.developerResourceScheme(this._getDeveloperResourceScheme(parsedURL));
        if (eligibleForLoadFromTarget) {
            try {
                if (initiator.target) {
                    Host.userMetrics.developerResourceLoaded(Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageViaTarget);
                    const result = await this._loadFromTarget(initiator.target, initiator.frameId, url);
                    return result;
                }
                const frame = FrameManager.instance().getFrame(initiator.frameId || '');
                if (frame) {
                    Host.userMetrics.developerResourceLoaded(Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageViaFrame);
                    const result = await this._loadFromTarget(frame.resourceTreeModel().target(), initiator.frameId, url);
                    return result;
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    Host.userMetrics.developerResourceLoaded(Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageFailure);
                    failureReason = e.message;
                }
            }
            Host.userMetrics.developerResourceLoaded(Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageFallback);
            console.warn('Fallback triggered', url, initiator);
        }
        else {
            const code = getLoadThroughTargetSetting().get() ? Host.UserMetrics.DeveloperResourceLoaded.FallbackPerProtocol :
                Host.UserMetrics.DeveloperResourceLoaded.FallbackPerOverride;
            Host.userMetrics.developerResourceLoaded(code);
        }
        const result = await MultitargetNetworkManager.instance().loadResource(url);
        if (eligibleForLoadFromTarget && !result.success) {
            Host.userMetrics.developerResourceLoaded(Host.UserMetrics.DeveloperResourceLoaded.FallbackFailure);
        }
        if (failureReason) {
            // In case we have a success, add a note about why the load through the target failed.
            result.errorDescription.message =
                `Fetch through target failed: ${failureReason}; Fallback: ${result.errorDescription.message}`;
        }
        return result;
    }
    _getDeveloperResourceScheme(parsedURL) {
        if (!parsedURL || parsedURL.scheme === '') {
            return Host.UserMetrics.DeveloperResourceScheme.SchemeUnknown;
        }
        const isLocalhost = parsedURL.host === 'localhost' || parsedURL.host.endsWith('.localhost');
        switch (parsedURL.scheme) {
            case 'file':
                return Host.UserMetrics.DeveloperResourceScheme.SchemeFile;
            case 'data':
                return Host.UserMetrics.DeveloperResourceScheme.SchemeData;
            case 'blob':
                return Host.UserMetrics.DeveloperResourceScheme.SchemeBlob;
            case 'http':
                return isLocalhost ? Host.UserMetrics.DeveloperResourceScheme.SchemeHttpLocalhost :
                    Host.UserMetrics.DeveloperResourceScheme.SchemeHttp;
            case 'https':
                return isLocalhost ? Host.UserMetrics.DeveloperResourceScheme.SchemeHttpsLocalhost :
                    Host.UserMetrics.DeveloperResourceScheme.SchemeHttps;
        }
        return Host.UserMetrics.DeveloperResourceScheme.SchemeOther;
    }
    async _loadFromTarget(target, frameId, url) {
        const networkManager = target.model(NetworkManager);
        const ioModel = target.model(IOModel);
        const resource = await networkManager.loadNetworkResource(frameId || '', url, { disableCache: true, includeCredentials: true });
        try {
            const content = resource.stream ? await ioModel.readToString(resource.stream) : '';
            return {
                success: resource.success,
                content,
                errorDescription: {
                    statusCode: resource.httpStatusCode || 0,
                    netError: resource.netError,
                    netErrorName: resource.netErrorName,
                    message: Host.ResourceLoader.netErrorToMessage(resource.netError, resource.httpStatusCode, resource.netErrorName) ||
                        '',
                    urlValid: undefined,
                },
            };
        }
        finally {
            if (resource.stream) {
                ioModel.close(resource.stream);
            }
        }
    }
}
export function getLoadThroughTargetSetting() {
    return Common.Settings.Settings.instance().createSetting('loadThroughTarget', true);
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["Update"] = "Update";
})(Events || (Events = {}));
//# sourceMappingURL=PageResourceLoader.js.map