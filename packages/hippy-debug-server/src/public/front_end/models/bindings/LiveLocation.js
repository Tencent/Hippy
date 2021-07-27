// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class LiveLocationWithPool {
    _updateDelegate;
    _locationPool;
    _updatePromise;
    constructor(updateDelegate, locationPool) {
        this._updateDelegate = updateDelegate;
        this._locationPool = locationPool;
        this._locationPool._add(this);
        this._updatePromise = null;
    }
    async update() {
        if (!this._updateDelegate) {
            return;
        }
        // The following is a basic scheduling algorithm, guaranteeing that
        // {_updateDelegate} is always run atomically. That is, we always
        // wait for an update to finish before we trigger the next run.
        if (this._updatePromise) {
            await this._updatePromise.then(() => this.update());
        }
        else {
            this._updatePromise = this._updateDelegate(this);
            await this._updatePromise;
            this._updatePromise = null;
        }
    }
    async uiLocation() {
        throw 'Not implemented';
    }
    dispose() {
        this._locationPool._delete(this);
        this._updateDelegate = null;
    }
    async isIgnoreListed() {
        throw 'Not implemented';
    }
}
export class LiveLocationPool {
    _locations;
    constructor() {
        this._locations = new Set();
    }
    _add(location) {
        this._locations.add(location);
    }
    _delete(location) {
        this._locations.delete(location);
    }
    disposeAll() {
        for (const location of this._locations) {
            location.dispose();
        }
    }
}
//# sourceMappingURL=LiveLocation.js.map