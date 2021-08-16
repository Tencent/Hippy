// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import * as Platform from '../platform/platform.js';
import { Events as TargetManagerEvents, TargetManager } from './TargetManager.js'; // eslint-disable-line no-unused-vars
import { TextSourceMap } from './SourceMap.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Error message when failing to load a source map text
    *@example {An error occurred} PH1
    */
    devtoolsFailedToLoadSourcemapS: 'DevTools failed to load source map: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/SourceMapManager.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SourceMapManager extends Common.ObjectWrapper.ObjectWrapper {
    _target;
    _isEnabled;
    _relativeSourceURL;
    _relativeSourceMapURL;
    _resolvedSourceMapId;
    _sourceMapById;
    _sourceMapIdToLoadingClients;
    _sourceMapIdToClients;
    constructor(target) {
        super();
        this._target = target;
        this._isEnabled = true;
        this._relativeSourceURL = new Map();
        this._relativeSourceMapURL = new Map();
        this._resolvedSourceMapId = new Map();
        this._sourceMapById = new Map();
        this._sourceMapIdToLoadingClients = new Platform.MapUtilities.Multimap();
        this._sourceMapIdToClients = new Platform.MapUtilities.Multimap();
        TargetManager.instance().addEventListener(TargetManagerEvents.InspectedURLChanged, this._inspectedURLChanged, this);
    }
    setEnabled(isEnabled) {
        if (isEnabled === this._isEnabled) {
            return;
        }
        this._isEnabled = isEnabled;
        // We need this copy, because `this._resolvedSourceMapId` is getting modified
        // in the loop body and trying to iterate over it at the same time leads to
        // an infinite loop.
        const clients = [...this._resolvedSourceMapId.keys()];
        for (const client of clients) {
            const relativeSourceURL = this._relativeSourceURL.get(client);
            const relativeSourceMapURL = this._relativeSourceMapURL.get(client);
            this.detachSourceMap(client);
            this.attachSourceMap(client, relativeSourceURL, relativeSourceMapURL);
        }
    }
    _inspectedURLChanged(event) {
        if (event.data !== this._target) {
            return;
        }
        // We need this copy, because `this._resolvedSourceMapId` is getting modified
        // in the loop body and trying to iterate over it at the same time leads to
        // an infinite loop.
        const prevSourceMapIds = new Map(this._resolvedSourceMapId);
        for (const [client, prevSourceMapId] of prevSourceMapIds) {
            const relativeSourceURL = this._relativeSourceURL.get(client);
            const relativeSourceMapURL = this._relativeSourceMapURL.get(client);
            if (relativeSourceURL === undefined || relativeSourceMapURL === undefined) {
                continue;
            }
            const resolvedUrls = this._resolveRelativeURLs(relativeSourceURL, relativeSourceMapURL);
            if (resolvedUrls !== null && prevSourceMapId !== resolvedUrls.sourceMapId) {
                this.detachSourceMap(client);
                this.attachSourceMap(client, relativeSourceURL, relativeSourceMapURL);
            }
        }
    }
    sourceMapForClient(client) {
        const sourceMapId = this._resolvedSourceMapId.get(client);
        if (!sourceMapId) {
            return null;
        }
        return this._sourceMapById.get(sourceMapId) || null;
    }
    clientsForSourceMap(sourceMap) {
        const sourceMapId = this._getSourceMapId(sourceMap.compiledURL(), sourceMap.url());
        if (this._sourceMapIdToClients.has(sourceMapId)) {
            return [...this._sourceMapIdToClients.get(sourceMapId)];
        }
        return [...this._sourceMapIdToLoadingClients.get(sourceMapId)];
    }
    _getSourceMapId(sourceURL, sourceMapURL) {
        return `${sourceURL}:${sourceMapURL}`;
    }
    _resolveRelativeURLs(sourceURL, sourceMapURL) {
        // |sourceURL| can be a random string, but is generally an absolute path.
        // Complete it to inspected page url for relative links.
        const resolvedSourceURL = Common.ParsedURL.ParsedURL.completeURL(this._target.inspectedURL(), sourceURL);
        if (!resolvedSourceURL) {
            return null;
        }
        const resolvedSourceMapURL = Common.ParsedURL.ParsedURL.completeURL(resolvedSourceURL, sourceMapURL);
        if (!resolvedSourceMapURL) {
            return null;
        }
        return {
            sourceURL: resolvedSourceURL,
            sourceMapURL: resolvedSourceMapURL,
            sourceMapId: this._getSourceMapId(resolvedSourceURL, resolvedSourceMapURL),
        };
    }
    attachSourceMap(client, relativeSourceURL, relativeSourceMapURL) {
        // TODO(chromium:1011811): Strengthen the type to obsolte the undefined check once core/sdk/ is fully typescriptified.
        if (relativeSourceURL === undefined || !relativeSourceMapURL) {
            return;
        }
        console.assert(!this._resolvedSourceMapId.has(client), 'SourceMap is already attached to client');
        const resolvedURLs = this._resolveRelativeURLs(relativeSourceURL, relativeSourceMapURL);
        if (!resolvedURLs) {
            return;
        }
        this._relativeSourceURL.set(client, relativeSourceURL);
        this._relativeSourceMapURL.set(client, relativeSourceMapURL);
        const { sourceURL, sourceMapURL, sourceMapId } = resolvedURLs;
        this._resolvedSourceMapId.set(client, sourceMapId);
        if (!this._isEnabled) {
            return;
        }
        this.dispatchEventToListeners(Events.SourceMapWillAttach, client);
        if (this._sourceMapById.has(sourceMapId)) {
            attach.call(this, sourceMapId, client);
            return;
        }
        if (!this._sourceMapIdToLoadingClients.has(sourceMapId)) {
            TextSourceMap.load(sourceMapURL, sourceURL, client.createPageResourceLoadInitiator())
                .catch(error => {
                Common.Console.Console.instance().warn(i18nString(UIStrings.devtoolsFailedToLoadSourcemapS, { PH1: error.message }));
                return null;
            })
                .then(onSourceMap.bind(this, sourceMapId));
        }
        this._sourceMapIdToLoadingClients.set(sourceMapId, client);
        function onSourceMap(sourceMapId, sourceMap) {
            this._sourceMapLoadedForTest();
            const clients = this._sourceMapIdToLoadingClients.get(sourceMapId);
            this._sourceMapIdToLoadingClients.deleteAll(sourceMapId);
            if (!clients.size) {
                return;
            }
            if (!sourceMap) {
                for (const client of clients) {
                    this.dispatchEventToListeners(Events.SourceMapFailedToAttach, client);
                }
                return;
            }
            this._sourceMapById.set(sourceMapId, sourceMap);
            for (const client of clients) {
                attach.call(this, sourceMapId, client);
            }
        }
        function attach(sourceMapId, client) {
            this._sourceMapIdToClients.set(sourceMapId, client);
            const sourceMap = this._sourceMapById.get(sourceMapId);
            this.dispatchEventToListeners(Events.SourceMapAttached, { client: client, sourceMap: sourceMap });
        }
    }
    detachSourceMap(client) {
        const sourceMapId = this._resolvedSourceMapId.get(client);
        this._relativeSourceURL.delete(client);
        this._relativeSourceMapURL.delete(client);
        this._resolvedSourceMapId.delete(client);
        if (!sourceMapId) {
            return;
        }
        if (!this._sourceMapIdToClients.hasValue(sourceMapId, client)) {
            if (this._sourceMapIdToLoadingClients.delete(sourceMapId, client)) {
                this.dispatchEventToListeners(Events.SourceMapFailedToAttach, client);
            }
            return;
        }
        this._sourceMapIdToClients.delete(sourceMapId, client);
        const sourceMap = this._sourceMapById.get(sourceMapId);
        if (!sourceMap) {
            return;
        }
        if (!this._sourceMapIdToClients.has(sourceMapId)) {
            this._sourceMapById.delete(sourceMapId);
        }
        this.dispatchEventToListeners(Events.SourceMapDetached, { client: client, sourceMap: sourceMap });
    }
    _sourceMapLoadedForTest() {
    }
    dispose() {
        TargetManager.instance().removeEventListener(TargetManagerEvents.InspectedURLChanged, this._inspectedURLChanged, this);
    }
}
export const Events = {
    SourceMapWillAttach: Symbol('SourceMapWillAttach'),
    SourceMapFailedToAttach: Symbol('SourceMapFailedToAttach'),
    SourceMapAttached: Symbol('SourceMapAttached'),
    SourceMapDetached: Symbol('SourceMapDetached'),
};
//# sourceMappingURL=SourceMapManager.js.map