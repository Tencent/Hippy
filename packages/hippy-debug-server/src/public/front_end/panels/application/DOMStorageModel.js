// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Nokia Inc.  All rights reserved.
 * Copyright (C) 2013 Samsung Electronics. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
export class DOMStorage extends Common.ObjectWrapper.ObjectWrapper {
    _model;
    _securityOrigin;
    _isLocalStorage;
    constructor(model, securityOrigin, isLocalStorage) {
        super();
        this._model = model;
        this._securityOrigin = securityOrigin;
        this._isLocalStorage = isLocalStorage;
    }
    static storageId(securityOrigin, isLocalStorage) {
        return { securityOrigin: securityOrigin, isLocalStorage: isLocalStorage };
    }
    get id() {
        return DOMStorage.storageId(this._securityOrigin, this._isLocalStorage);
    }
    get securityOrigin() {
        return this._securityOrigin;
    }
    get isLocalStorage() {
        return this._isLocalStorage;
    }
    getItems() {
        return this._model._agent.invoke_getDOMStorageItems({ storageId: this.id }).then(({ entries }) => entries);
    }
    setItem(key, value) {
        this._model._agent.invoke_setDOMStorageItem({ storageId: this.id, key, value });
    }
    removeItem(key) {
        this._model._agent.invoke_removeDOMStorageItem({ storageId: this.id, key });
    }
    clear() {
        this._model._agent.invoke_clear({ storageId: this.id });
    }
}
(function (DOMStorage) {
    // TODO(crbug.com/1167717): Make this a const enum again
    // eslint-disable-next-line rulesdir/const_enum
    let Events;
    (function (Events) {
        Events["DOMStorageItemsCleared"] = "DOMStorageItemsCleared";
        Events["DOMStorageItemRemoved"] = "DOMStorageItemRemoved";
        Events["DOMStorageItemAdded"] = "DOMStorageItemAdded";
        Events["DOMStorageItemUpdated"] = "DOMStorageItemUpdated";
    })(Events = DOMStorage.Events || (DOMStorage.Events = {}));
})(DOMStorage || (DOMStorage = {}));
export class DOMStorageModel extends SDK.SDKModel.SDKModel {
    _securityOriginManager;
    _storages;
    _agent;
    _enabled;
    constructor(target) {
        super(target);
        this._securityOriginManager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        this._storages = {};
        this._agent = target.domstorageAgent();
    }
    enable() {
        if (this._enabled) {
            return;
        }
        this.target().registerDOMStorageDispatcher(new DOMStorageDispatcher(this));
        if (this._securityOriginManager) {
            this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginAdded, this._securityOriginAdded, this);
            this._securityOriginManager.addEventListener(SDK.SecurityOriginManager.Events.SecurityOriginRemoved, this._securityOriginRemoved, this);
            for (const securityOrigin of this._securityOriginManager.securityOrigins()) {
                this._addOrigin(securityOrigin);
            }
        }
        this._agent.invoke_enable();
        this._enabled = true;
    }
    clearForOrigin(origin) {
        if (!this._enabled) {
            return;
        }
        for (const isLocal of [true, false]) {
            const key = this._storageKey(origin, isLocal);
            const storage = this._storages[key];
            if (!storage) {
                return;
            }
            storage.clear();
        }
        this._removeOrigin(origin);
        this._addOrigin(origin);
    }
    _securityOriginAdded(event) {
        this._addOrigin(event.data);
    }
    _addOrigin(securityOrigin) {
        const parsed = new Common.ParsedURL.ParsedURL(securityOrigin);
        // These are "opaque" origins which are not supposed to support DOM storage.
        if (!parsed.isValid || parsed.scheme === 'data' || parsed.scheme === 'about' || parsed.scheme === 'javascript') {
            return;
        }
        for (const isLocal of [true, false]) {
            const key = this._storageKey(securityOrigin, isLocal);
            console.assert(!this._storages[key]);
            const storage = new DOMStorage(this, securityOrigin, isLocal);
            this._storages[key] = storage;
            this.dispatchEventToListeners(Events.DOMStorageAdded, storage);
        }
    }
    _securityOriginRemoved(event) {
        this._removeOrigin(event.data);
    }
    _removeOrigin(securityOrigin) {
        for (const isLocal of [true, false]) {
            const key = this._storageKey(securityOrigin, isLocal);
            const storage = this._storages[key];
            if (!storage) {
                continue;
            }
            delete this._storages[key];
            this.dispatchEventToListeners(Events.DOMStorageRemoved, storage);
        }
    }
    _storageKey(securityOrigin, isLocalStorage) {
        return JSON.stringify(DOMStorage.storageId(securityOrigin, isLocalStorage));
    }
    _domStorageItemsCleared(storageId) {
        const domStorage = this.storageForId(storageId);
        if (!domStorage) {
            return;
        }
        const eventData = {};
        domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemsCleared, eventData);
    }
    _domStorageItemRemoved(storageId, key) {
        const domStorage = this.storageForId(storageId);
        if (!domStorage) {
            return;
        }
        const eventData = { key: key };
        domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemRemoved, eventData);
    }
    _domStorageItemAdded(storageId, key, value) {
        const domStorage = this.storageForId(storageId);
        if (!domStorage) {
            return;
        }
        const eventData = { key: key, value: value };
        domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemAdded, eventData);
    }
    _domStorageItemUpdated(storageId, key, oldValue, value) {
        const domStorage = this.storageForId(storageId);
        if (!domStorage) {
            return;
        }
        const eventData = { key: key, oldValue: oldValue, value: value };
        domStorage.dispatchEventToListeners(DOMStorage.Events.DOMStorageItemUpdated, eventData);
    }
    storageForId(storageId) {
        return this._storages[JSON.stringify(storageId)];
    }
    storages() {
        const result = [];
        for (const id in this._storages) {
            result.push(this._storages[id]);
        }
        return result;
    }
}
SDK.SDKModel.SDKModel.register(DOMStorageModel, { capabilities: SDK.Target.Capability.DOM, autostart: false });
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["DOMStorageAdded"] = "DOMStorageAdded";
    Events["DOMStorageRemoved"] = "DOMStorageRemoved";
})(Events || (Events = {}));
export class DOMStorageDispatcher {
    _model;
    constructor(model) {
        this._model = model;
    }
    domStorageItemsCleared({ storageId }) {
        this._model._domStorageItemsCleared(storageId);
    }
    domStorageItemRemoved({ storageId, key }) {
        this._model._domStorageItemRemoved(storageId, key);
    }
    domStorageItemAdded({ storageId, key, newValue }) {
        this._model._domStorageItemAdded(storageId, key, newValue);
    }
    domStorageItemUpdated({ storageId, key, oldValue, newValue }) {
        this._model._domStorageItemUpdated(storageId, key, oldValue, newValue);
    }
}
//# sourceMappingURL=DOMStorageModel.js.map