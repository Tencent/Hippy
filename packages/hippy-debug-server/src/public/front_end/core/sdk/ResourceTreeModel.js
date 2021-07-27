/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { DOMModel } from './DOMModel.js'; // eslint-disable-line no-unused-vars
import { Events as NetworkManagerEvents, NetworkManager } from './NetworkManager.js'; // eslint-disable-line no-unused-vars
import { Resource } from './Resource.js';
import { ExecutionContext, RuntimeModel } from './RuntimeModel.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
import { SecurityOriginManager } from './SecurityOriginManager.js';
export class ResourceTreeModel extends SDKModel {
    _agent;
    _securityOriginManager;
    _frames;
    _cachedResourcesProcessed;
    _pendingReloadOptions;
    _reloadSuspensionCount;
    _isInterstitialShowing;
    mainFrame;
    pendingBackForwardCacheNotUsedEvents;
    constructor(target) {
        super(target);
        const networkManager = target.model(NetworkManager);
        if (networkManager) {
            networkManager.addEventListener(NetworkManagerEvents.RequestFinished, this._onRequestFinished, this);
            networkManager.addEventListener(NetworkManagerEvents.RequestUpdateDropped, this._onRequestUpdateDropped, this);
        }
        this._agent = target.pageAgent();
        this._agent.invoke_enable();
        this._securityOriginManager = target.model(SecurityOriginManager);
        this.pendingBackForwardCacheNotUsedEvents = new Set();
        target.registerPageDispatcher(new PageDispatcher(this));
        this._frames = new Map();
        this._cachedResourcesProcessed = false;
        this._pendingReloadOptions = null;
        this._reloadSuspensionCount = 0;
        this._isInterstitialShowing = false;
        this.mainFrame = null;
        this._agent.invoke_getResourceTree().then(event => {
            this._processCachedResources(event.getError() ? null : event.frameTree);
        });
    }
    static frameForRequest(request) {
        const networkManager = NetworkManager.forRequest(request);
        const resourceTreeModel = networkManager ? networkManager.target().model(ResourceTreeModel) : null;
        if (!resourceTreeModel) {
            return null;
        }
        return resourceTreeModel.frameForId(request.frameId);
    }
    static frames() {
        const result = [];
        for (const resourceTreeModel of TargetManager.instance().models(ResourceTreeModel)) {
            result.push(...resourceTreeModel._frames.values());
        }
        return result;
    }
    static resourceForURL(url) {
        for (const resourceTreeModel of TargetManager.instance().models(ResourceTreeModel)) {
            const mainFrame = resourceTreeModel.mainFrame;
            const result = mainFrame ? mainFrame.resourceForURL(url) : null;
            if (result) {
                return result;
            }
        }
        return null;
    }
    static reloadAllPages(bypassCache, scriptToEvaluateOnLoad) {
        for (const resourceTreeModel of TargetManager.instance().models(ResourceTreeModel)) {
            if (!resourceTreeModel.target().parentTarget()) {
                resourceTreeModel.reloadPage(bypassCache, scriptToEvaluateOnLoad);
            }
        }
    }
    domModel() {
        return this.target().model(DOMModel);
    }
    _processCachedResources(mainFramePayload) {
        // TODO(caseq): the url check below is a mergeable, conservative
        // workaround for a problem caused by us requesting resources from a
        // subtarget frame before it has committed. The proper fix is likely
        // to be too complicated to be safely merged.
        // See https://crbug.com/1081270 for details.
        if (mainFramePayload && mainFramePayload.frame.url !== ':') {
            this.dispatchEventToListeners(Events.WillLoadCachedResources);
            this._addFramesRecursively(null, mainFramePayload);
            this.target().setInspectedURL(mainFramePayload.frame.url);
        }
        this._cachedResourcesProcessed = true;
        const runtimeModel = this.target().model(RuntimeModel);
        if (runtimeModel) {
            runtimeModel.setExecutionContextComparator(this._executionContextComparator.bind(this));
            runtimeModel.fireExecutionContextOrderChanged();
        }
        this.dispatchEventToListeners(Events.CachedResourcesLoaded, this);
    }
    cachedResourcesLoaded() {
        return this._cachedResourcesProcessed;
    }
    isInterstitialShowing() {
        return this._isInterstitialShowing;
    }
    _addFrame(frame, _aboutToNavigate) {
        this._frames.set(frame.id, frame);
        if (frame.isMainFrame()) {
            this.mainFrame = frame;
        }
        this.dispatchEventToListeners(Events.FrameAdded, frame);
        this._updateSecurityOrigins();
    }
    _frameAttached(frameId, parentFrameId, stackTrace) {
        const sameTargetParentFrame = parentFrameId ? (this._frames.get(parentFrameId) || null) : null;
        // Do nothing unless cached resource tree is processed - it will overwrite everything.
        if (!this._cachedResourcesProcessed && sameTargetParentFrame) {
            return null;
        }
        if (this._frames.has(frameId)) {
            return null;
        }
        const frame = new ResourceTreeFrame(this, sameTargetParentFrame, frameId, null, stackTrace || null);
        if (parentFrameId && !sameTargetParentFrame) {
            frame._crossTargetParentFrameId = parentFrameId;
        }
        if (frame.isMainFrame() && this.mainFrame) {
            // Navigation to the new backend process.
            this._frameDetached(this.mainFrame.id, false);
        }
        this._addFrame(frame, true);
        return frame;
    }
    _frameNavigated(framePayload, type) {
        const sameTargetParentFrame = framePayload.parentId ? (this._frames.get(framePayload.parentId) || null) : null;
        // Do nothing unless cached resource tree is processed - it will overwrite everything.
        if (!this._cachedResourcesProcessed && sameTargetParentFrame) {
            return;
        }
        let frame = this._frames.get(framePayload.id) || null;
        if (!frame) {
            // Simulate missed "frameAttached" for a main frame navigation to the new backend process.
            frame = this._frameAttached(framePayload.id, framePayload.parentId || '');
            console.assert(Boolean(frame));
            if (!frame) {
                return;
            }
        }
        if (type) {
            frame.backForwardCacheDetails.restoredFromCache = type === "BackForwardCacheRestore" /* BackForwardCacheRestore */;
        }
        this.dispatchEventToListeners(Events.FrameWillNavigate, frame);
        frame._navigate(framePayload);
        this.dispatchEventToListeners(Events.FrameNavigated, frame);
        if (frame.isMainFrame()) {
            this.processPendingBackForwardCacheNotUsedEvents(frame);
            this.dispatchEventToListeners(Events.MainFrameNavigated, frame);
            const networkManager = this.target().model(NetworkManager);
            if (networkManager) {
                networkManager.clearRequests();
            }
        }
        // Fill frame with retained resources (the ones loaded using new loader).
        const resources = frame.resources();
        for (let i = 0; i < resources.length; ++i) {
            this.dispatchEventToListeners(Events.ResourceAdded, resources[i]);
        }
        if (frame.isMainFrame()) {
            this.target().setInspectedURL(frame.url);
        }
        this._updateSecurityOrigins();
    }
    _documentOpened(framePayload) {
        this._frameNavigated(framePayload, undefined);
        const frame = this._frames.get(framePayload.id);
        if (frame && !frame._resourcesMap.get(framePayload.url)) {
            const frameResource = this._createResourceFromFramePayload(framePayload, framePayload.url, Common.ResourceType.resourceTypes.Document, framePayload.mimeType, null, null);
            frameResource.isGenerated = true;
            frame.addResource(frameResource);
        }
    }
    _frameDetached(frameId, isSwap) {
        // Do nothing unless cached resource tree is processed - it will overwrite everything.
        if (!this._cachedResourcesProcessed) {
            return;
        }
        const frame = this._frames.get(frameId);
        if (!frame) {
            return;
        }
        const sameTargetParentFrame = frame.sameTargetParentFrame();
        if (sameTargetParentFrame) {
            sameTargetParentFrame._removeChildFrame(frame, isSwap);
        }
        else {
            frame._remove(isSwap);
        }
        this._updateSecurityOrigins();
    }
    _onRequestFinished(event) {
        if (!this._cachedResourcesProcessed) {
            return;
        }
        const request = event.data;
        if (request.failed || request.resourceType() === Common.ResourceType.resourceTypes.XHR) {
            return;
        }
        const frame = this._frames.get(request.frameId);
        if (frame) {
            frame._addRequest(request);
        }
    }
    _onRequestUpdateDropped(event) {
        if (!this._cachedResourcesProcessed) {
            return;
        }
        const data = event.data;
        const frameId = data.frameId;
        const frame = this._frames.get(frameId);
        if (!frame) {
            return;
        }
        const url = data.url;
        if (frame._resourcesMap.get(url)) {
            return;
        }
        const resource = new Resource(this, null, url, frame.url, frameId, data.loaderId, Common.ResourceType.resourceTypes[data.resourceType], data.mimeType, data.lastModified, null);
        frame.addResource(resource);
    }
    frameForId(frameId) {
        return this._frames.get(frameId) || null;
    }
    forAllResources(callback) {
        if (this.mainFrame) {
            return this.mainFrame._callForFrameResources(callback);
        }
        return false;
    }
    frames() {
        return [...this._frames.values()];
    }
    resourceForURL(url) {
        // Workers call into this with no frames available.
        return this.mainFrame ? this.mainFrame.resourceForURL(url) : null;
    }
    _addFramesRecursively(sameTargetParentFrame, frameTreePayload) {
        const framePayload = frameTreePayload.frame;
        const frame = new ResourceTreeFrame(this, sameTargetParentFrame, framePayload.id, framePayload, null);
        if (!sameTargetParentFrame && framePayload.parentId) {
            frame._crossTargetParentFrameId = framePayload.parentId;
        }
        this._addFrame(frame);
        for (const childFrame of frameTreePayload.childFrames || []) {
            this._addFramesRecursively(frame, childFrame);
        }
        for (let i = 0; i < frameTreePayload.resources.length; ++i) {
            const subresource = frameTreePayload.resources[i];
            const resource = this._createResourceFromFramePayload(framePayload, subresource.url, Common.ResourceType.resourceTypes[subresource.type], subresource.mimeType, subresource.lastModified || null, subresource.contentSize || null);
            frame.addResource(resource);
        }
        if (!frame._resourcesMap.get(framePayload.url)) {
            const frameResource = this._createResourceFromFramePayload(framePayload, framePayload.url, Common.ResourceType.resourceTypes.Document, framePayload.mimeType, null, null);
            frame.addResource(frameResource);
        }
    }
    _createResourceFromFramePayload(frame, url, type, mimeType, lastModifiedTime, contentSize) {
        const lastModified = typeof lastModifiedTime === 'number' ? new Date(lastModifiedTime * 1000) : null;
        return new Resource(this, null, url, frame.url, frame.id, frame.loaderId, type, mimeType, lastModified, contentSize);
    }
    suspendReload() {
        this._reloadSuspensionCount++;
    }
    resumeReload() {
        this._reloadSuspensionCount--;
        console.assert(this._reloadSuspensionCount >= 0, 'Unbalanced call to ResourceTreeModel.resumeReload()');
        if (!this._reloadSuspensionCount && this._pendingReloadOptions) {
            const { ignoreCache, scriptToEvaluateOnLoad } = this._pendingReloadOptions;
            this.reloadPage(ignoreCache, scriptToEvaluateOnLoad);
        }
    }
    reloadPage(ignoreCache, scriptToEvaluateOnLoad) {
        // Only dispatch PageReloadRequested upon first reload request to simplify client logic.
        if (!this._pendingReloadOptions) {
            this.dispatchEventToListeners(Events.PageReloadRequested, this);
        }
        if (this._reloadSuspensionCount) {
            this._pendingReloadOptions = { ignoreCache, scriptToEvaluateOnLoad };
            return;
        }
        this._pendingReloadOptions = null;
        const networkManager = this.target().model(NetworkManager);
        if (networkManager) {
            networkManager.clearRequests();
        }
        this.dispatchEventToListeners(Events.WillReloadPage);
        this._agent.invoke_reload({ ignoreCache, scriptToEvaluateOnLoad });
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate(url) {
        return this._agent.invoke_navigate({ url });
    }
    async navigationHistory() {
        const response = await this._agent.invoke_getNavigationHistory();
        if (response.getError()) {
            return null;
        }
        return { currentIndex: response.currentIndex, entries: response.entries };
    }
    navigateToHistoryEntry(entry) {
        this._agent.invoke_navigateToHistoryEntry({ entryId: entry.id });
    }
    setLifecycleEventsEnabled(enabled) {
        return this._agent.invoke_setLifecycleEventsEnabled({ enabled });
    }
    async fetchAppManifest() {
        const response = await this._agent.invoke_getAppManifest();
        if (response.getError()) {
            return { url: response.url, data: null, errors: [] };
        }
        return { url: response.url, data: response.data || null, errors: response.errors };
    }
    async getInstallabilityErrors() {
        const response = await this._agent.invoke_getInstallabilityErrors();
        return response.installabilityErrors || [];
    }
    async getManifestIcons() {
        const response = await this._agent.invoke_getManifestIcons();
        return { primaryIcon: response.primaryIcon || null };
    }
    _executionContextComparator(a, b) {
        function framePath(frame) {
            let currentFrame = frame;
            const parents = [];
            while (currentFrame) {
                parents.push(currentFrame);
                currentFrame = currentFrame.sameTargetParentFrame();
            }
            return parents.reverse();
        }
        if (a.target() !== b.target()) {
            return ExecutionContext.comparator(a, b);
        }
        const framesA = a.frameId ? framePath(this.frameForId(a.frameId)) : [];
        const framesB = b.frameId ? framePath(this.frameForId(b.frameId)) : [];
        let frameA;
        let frameB;
        for (let i = 0;; i++) {
            if (!framesA[i] || !framesB[i] || (framesA[i] !== framesB[i])) {
                frameA = framesA[i];
                frameB = framesB[i];
                break;
            }
        }
        if (!frameA && frameB) {
            return -1;
        }
        if (!frameB && frameA) {
            return 1;
        }
        if (frameA && frameB) {
            return frameA.id.localeCompare(frameB.id);
        }
        return ExecutionContext.comparator(a, b);
    }
    _getSecurityOriginData() {
        const securityOrigins = new Set();
        let mainSecurityOrigin = null;
        let unreachableMainSecurityOrigin = null;
        for (const frame of this._frames.values()) {
            const origin = frame.securityOrigin;
            if (!origin) {
                continue;
            }
            securityOrigins.add(origin);
            if (frame.isMainFrame()) {
                mainSecurityOrigin = origin;
                if (frame.unreachableUrl()) {
                    const unreachableParsed = new Common.ParsedURL.ParsedURL(frame.unreachableUrl());
                    unreachableMainSecurityOrigin = unreachableParsed.securityOrigin();
                }
            }
        }
        return {
            securityOrigins: securityOrigins,
            mainSecurityOrigin: mainSecurityOrigin,
            unreachableMainSecurityOrigin: unreachableMainSecurityOrigin,
        };
    }
    _updateSecurityOrigins() {
        const data = this._getSecurityOriginData();
        this._securityOriginManager.setMainSecurityOrigin(data.mainSecurityOrigin || '', data.unreachableMainSecurityOrigin || '');
        this._securityOriginManager.updateSecurityOrigins(data.securityOrigins);
    }
    getMainSecurityOrigin() {
        const data = this._getSecurityOriginData();
        return data.mainSecurityOrigin || data.unreachableMainSecurityOrigin;
    }
    onBackForwardCacheNotUsed(event) {
        if (this.mainFrame && this.mainFrame.id === event.frameId && this.mainFrame.loaderId === event.loaderId) {
            this.mainFrame.backForwardCacheDetails.restoredFromCache = false;
            this.dispatchEventToListeners(Events.BackForwardCacheDetailsUpdated, this.mainFrame);
        }
        else {
            this.pendingBackForwardCacheNotUsedEvents.add(event);
        }
    }
    processPendingBackForwardCacheNotUsedEvents(frame) {
        if (!frame.isMainFrame()) {
            return;
        }
        for (const event of this.pendingBackForwardCacheNotUsedEvents) {
            if (frame.id === event.frameId && frame.loaderId === event.loaderId) {
                frame.backForwardCacheDetails.restoredFromCache = false;
                this.pendingBackForwardCacheNotUsedEvents.delete(event);
                // No need to dispatch the `BackForwardCacheDetailsUpdated` event here,
                // as this method call is followed by a `MainFrameNavigated` event.
                return;
            }
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["FrameAdded"] = "FrameAdded";
    Events["FrameNavigated"] = "FrameNavigated";
    Events["FrameDetached"] = "FrameDetached";
    Events["FrameResized"] = "FrameResized";
    Events["FrameWillNavigate"] = "FrameWillNavigate";
    Events["MainFrameNavigated"] = "MainFrameNavigated";
    Events["ResourceAdded"] = "ResourceAdded";
    Events["WillLoadCachedResources"] = "WillLoadCachedResources";
    Events["CachedResourcesLoaded"] = "CachedResourcesLoaded";
    Events["DOMContentLoaded"] = "DOMContentLoaded";
    Events["LifecycleEvent"] = "LifecycleEvent";
    Events["Load"] = "Load";
    Events["PageReloadRequested"] = "PageReloadRequested";
    Events["WillReloadPage"] = "WillReloadPage";
    Events["InterstitialShown"] = "InterstitialShown";
    Events["InterstitialHidden"] = "InterstitialHidden";
    Events["BackForwardCacheDetailsUpdated"] = "BackForwardCacheDetailsUpdated";
})(Events || (Events = {}));
export class ResourceTreeFrame {
    _model;
    _sameTargetParentFrame;
    _id;
    _crossTargetParentFrameId;
    _loaderId;
    _name;
    _url;
    _domainAndRegistry;
    _securityOrigin;
    _mimeType;
    _unreachableUrl;
    _adFrameType;
    _secureContextType;
    _crossOriginIsolatedContextType;
    _gatedAPIFeatures;
    creationStackTrace;
    creationStackTraceTarget;
    _childFrames;
    _resourcesMap;
    backForwardCacheDetails = { restoredFromCache: undefined };
    constructor(model, parentFrame, frameId, payload, creationStackTrace) {
        this._model = model;
        this._sameTargetParentFrame = parentFrame;
        this._id = frameId;
        this._crossTargetParentFrameId = null;
        this._loaderId = (payload && payload.loaderId) || '';
        this._name = payload && payload.name;
        this._url = (payload && payload.url) || '';
        this._domainAndRegistry = (payload && payload.domainAndRegistry) || '';
        this._securityOrigin = payload && payload.securityOrigin;
        this._mimeType = payload && payload.mimeType;
        this._unreachableUrl = (payload && payload.unreachableUrl) || '';
        this._adFrameType = (payload && payload.adFrameType) || "none" /* None */;
        this._secureContextType = payload && payload.secureContextType;
        this._crossOriginIsolatedContextType = payload && payload.crossOriginIsolatedContextType;
        this._gatedAPIFeatures = payload && payload.gatedAPIFeatures;
        this.creationStackTrace = creationStackTrace;
        this.creationStackTraceTarget = null;
        this._childFrames = new Set();
        this._resourcesMap = new Map();
        if (this._sameTargetParentFrame) {
            this._sameTargetParentFrame._childFrames.add(this);
        }
    }
    isSecureContext() {
        return this._secureContextType !== null && this._secureContextType.startsWith('Secure');
    }
    getSecureContextType() {
        return this._secureContextType;
    }
    isCrossOriginIsolated() {
        return this._crossOriginIsolatedContextType !== null && this._crossOriginIsolatedContextType.startsWith('Isolated');
    }
    getCrossOriginIsolatedContextType() {
        return this._crossOriginIsolatedContextType;
    }
    getGatedAPIFeatures() {
        return this._gatedAPIFeatures;
    }
    getCreationStackTraceData() {
        return {
            creationStackTrace: this.creationStackTrace,
            creationStackTraceTarget: this.creationStackTraceTarget || this.resourceTreeModel().target(),
        };
    }
    _navigate(framePayload) {
        this._loaderId = framePayload.loaderId;
        this._name = framePayload.name;
        this._url = framePayload.url;
        this._domainAndRegistry = framePayload.domainAndRegistry;
        this._securityOrigin = framePayload.securityOrigin;
        this._mimeType = framePayload.mimeType;
        this._unreachableUrl = framePayload.unreachableUrl || '';
        this._adFrameType = framePayload.adFrameType || "none" /* None */;
        this._secureContextType = framePayload.secureContextType;
        this._crossOriginIsolatedContextType = framePayload.crossOriginIsolatedContextType;
        this._gatedAPIFeatures = framePayload.gatedAPIFeatures;
        const mainResource = this._resourcesMap.get(this._url);
        this._resourcesMap.clear();
        this._removeChildFrames();
        if (mainResource && mainResource.loaderId === this._loaderId) {
            this.addResource(mainResource);
        }
    }
    resourceTreeModel() {
        return this._model;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name || '';
    }
    get url() {
        return this._url;
    }
    domainAndRegistry() {
        return this._domainAndRegistry;
    }
    get securityOrigin() {
        return this._securityOrigin;
    }
    unreachableUrl() {
        return this._unreachableUrl;
    }
    get loaderId() {
        return this._loaderId;
    }
    adFrameType() {
        return this._adFrameType;
    }
    get childFrames() {
        return [...this._childFrames];
    }
    /**
     * Returns the parent frame if both frames are part of the same process/target.
     */
    sameTargetParentFrame() {
        return this._sameTargetParentFrame;
    }
    /**
     * Returns the parent frame if both frames are part of different processes/targets (child is an OOPIF).
     */
    crossTargetParentFrame() {
        if (!this._crossTargetParentFrameId) {
            return null;
        }
        const parentTarget = this._model.target().parentTarget();
        if (!parentTarget) {
            return null;
        }
        const parentModel = parentTarget.model(ResourceTreeModel);
        if (!parentModel) {
            return null;
        }
        // Note that parent model has already processed cached resources:
        // - when parent target was created, we issued getResourceTree call;
        // - strictly after we issued setAutoAttach call;
        // - both of them were handled in renderer in the same order;
        // - cached resource tree got processed on parent model;
        // - child target was created as a result of setAutoAttach call.
        return parentModel._frames.get(this._crossTargetParentFrameId) || null;
    }
    /**
     * Returns the parent frame. There is only 1 parent and it's either in the
     * same target or it's cross-target.
     */
    parentFrame() {
        return this.sameTargetParentFrame() || this.crossTargetParentFrame();
    }
    /**
     * Returns true if this is the main frame of its target. For example, this returns true for the main frame
     * of an out-of-process iframe (OOPIF).
     */
    isMainFrame() {
        return !this._sameTargetParentFrame;
    }
    /**
     * Returns true if this is the top frame of the main target, i.e. if this is the top-most frame in the inspected
     * tab.
     */
    isTopFrame() {
        return !this._model.target().parentTarget() && !this._sameTargetParentFrame && !this._crossTargetParentFrameId;
    }
    _removeChildFrame(frame, isSwap) {
        this._childFrames.delete(frame);
        frame._remove(isSwap);
    }
    _removeChildFrames() {
        const frames = this._childFrames;
        this._childFrames = new Set();
        for (const frame of frames) {
            frame._remove(false);
        }
    }
    _remove(isSwap) {
        this._removeChildFrames();
        this._model._frames.delete(this.id);
        this._model.dispatchEventToListeners(Events.FrameDetached, { frame: this, isSwap });
    }
    addResource(resource) {
        if (this._resourcesMap.get(resource.url) === resource) {
            // Already in the tree, we just got an extra update.
            return;
        }
        this._resourcesMap.set(resource.url, resource);
        this._model.dispatchEventToListeners(Events.ResourceAdded, resource);
    }
    _addRequest(request) {
        let resource = this._resourcesMap.get(request.url());
        if (resource && resource.request === request) {
            // Already in the tree, we just got an extra update.
            return;
        }
        resource = new Resource(this._model, request, request.url(), request.documentURL, request.frameId, request.loaderId, request.resourceType(), request.mimeType, null, null);
        this._resourcesMap.set(resource.url, resource);
        this._model.dispatchEventToListeners(Events.ResourceAdded, resource);
    }
    resources() {
        return Array.from(this._resourcesMap.values());
    }
    resourceForURL(url) {
        const resource = this._resourcesMap.get(url);
        if (resource) {
            return resource;
        }
        for (const frame of this._childFrames) {
            const resource = frame.resourceForURL(url);
            if (resource) {
                return resource;
            }
        }
        return null;
    }
    _callForFrameResources(callback) {
        for (const resource of this._resourcesMap.values()) {
            if (callback(resource)) {
                return true;
            }
        }
        for (const frame of this._childFrames) {
            if (frame._callForFrameResources(callback)) {
                return true;
            }
        }
        return false;
    }
    displayName() {
        if (this.isTopFrame()) {
            return i18n.i18n.lockedString('top');
        }
        const subtitle = new Common.ParsedURL.ParsedURL(this._url).displayName;
        if (subtitle) {
            if (!this._name) {
                return subtitle;
            }
            return this._name + ' (' + subtitle + ')';
        }
        return i18n.i18n.lockedString('iframe');
    }
    async getOwnerDeferredDOMNode() {
        const parentFrame = this.parentFrame();
        if (!parentFrame) {
            return null;
        }
        return parentFrame.resourceTreeModel().domModel().getOwnerNodeForFrame(this._id);
    }
    async getOwnerDOMNodeOrDocument() {
        const deferredNode = await this.getOwnerDeferredDOMNode();
        if (deferredNode) {
            return deferredNode.resolvePromise();
        }
        if (this.isTopFrame()) {
            return this.resourceTreeModel().domModel().requestDocument();
        }
        return null;
    }
    async highlight() {
        const parentFrame = this.parentFrame();
        const parentTarget = this.resourceTreeModel().target().parentTarget();
        const highlightFrameOwner = async (domModel) => {
            const deferredNode = await domModel.getOwnerNodeForFrame(this._id);
            if (deferredNode) {
                domModel.overlayModel().highlightInOverlay({ deferredNode, selectorList: '' }, 'all', true);
            }
        };
        if (parentFrame) {
            return highlightFrameOwner(parentFrame.resourceTreeModel().domModel());
        }
        // Portals.
        if (parentTarget) {
            const domModel = parentTarget.model(DOMModel);
            if (domModel) {
                return highlightFrameOwner(domModel);
            }
        }
        // For the top frame there is no owner node. Highlight the whole document instead.
        const document = await this.resourceTreeModel().domModel().requestDocument();
        if (document) {
            this.resourceTreeModel().domModel().overlayModel().highlightInOverlay({ node: document, selectorList: '' }, 'all', true);
        }
    }
    async getPermissionsPolicyState() {
        const response = await this.resourceTreeModel().target().pageAgent().invoke_getPermissionsPolicyState({ frameId: this._id });
        if (response.getError()) {
            return null;
        }
        return response.states;
    }
    setCreationStackTrace(creationStackTraceData) {
        this.creationStackTrace = creationStackTraceData.creationStackTrace;
        this.creationStackTraceTarget = creationStackTraceData.creationStackTraceTarget;
    }
}
export class PageDispatcher {
    _resourceTreeModel;
    constructor(resourceTreeModel) {
        this._resourceTreeModel = resourceTreeModel;
    }
    backForwardCacheNotUsed(params) {
        this._resourceTreeModel.onBackForwardCacheNotUsed(params);
    }
    domContentEventFired({ timestamp }) {
        this._resourceTreeModel.dispatchEventToListeners(Events.DOMContentLoaded, timestamp);
    }
    loadEventFired({ timestamp }) {
        this._resourceTreeModel.dispatchEventToListeners(Events.Load, { resourceTreeModel: this._resourceTreeModel, loadTime: timestamp });
    }
    lifecycleEvent({ frameId, name }) {
        this._resourceTreeModel.dispatchEventToListeners(Events.LifecycleEvent, { frameId, name });
    }
    frameAttached({ frameId, parentFrameId, stack }) {
        this._resourceTreeModel._frameAttached(frameId, parentFrameId, stack);
    }
    frameNavigated({ frame, type }) {
        this._resourceTreeModel._frameNavigated(frame, type);
    }
    documentOpened({ frame }) {
        this._resourceTreeModel._documentOpened(frame);
    }
    frameDetached({ frameId, reason }) {
        this._resourceTreeModel._frameDetached(frameId, reason === "swap" /* Swap */);
    }
    frameStartedLoading({}) {
    }
    frameStoppedLoading({}) {
    }
    frameRequestedNavigation({}) {
    }
    frameScheduledNavigation({}) {
    }
    frameClearedScheduledNavigation({}) {
    }
    navigatedWithinDocument({}) {
    }
    frameResized() {
        this._resourceTreeModel.dispatchEventToListeners(Events.FrameResized, null);
    }
    javascriptDialogOpening({ hasBrowserHandler }) {
        if (!hasBrowserHandler) {
            this._resourceTreeModel._agent.invoke_handleJavaScriptDialog({ accept: false });
        }
    }
    javascriptDialogClosed({}) {
    }
    screencastFrame({}) {
    }
    screencastVisibilityChanged({}) {
    }
    interstitialShown() {
        this._resourceTreeModel._isInterstitialShowing = true;
        this._resourceTreeModel.dispatchEventToListeners(Events.InterstitialShown);
    }
    interstitialHidden() {
        this._resourceTreeModel._isInterstitialShowing = false;
        this._resourceTreeModel.dispatchEventToListeners(Events.InterstitialHidden);
    }
    windowOpen({}) {
    }
    compilationCacheProduced({}) {
    }
    fileChooserOpened({}) {
    }
    downloadWillBegin({}) {
    }
    downloadProgress() {
    }
}
SDKModel.register(ResourceTreeModel, { capabilities: Capability.DOM, autostart: true, early: true });
//# sourceMappingURL=ResourceTreeModel.js.map