// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
let contextInstance;
export class Context {
    _flavors;
    _eventDispatchers;
    constructor() {
        this._flavors = new Map();
        this._eventDispatchers = new Map();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!contextInstance || forceNew) {
            contextInstance = new Context();
        }
        return contextInstance;
    }
    setFlavor(flavorType, flavorValue) {
        const value = this._flavors.get(flavorType) || null;
        if (value === flavorValue) {
            return;
        }
        if (flavorValue) {
            this._flavors.set(flavorType, flavorValue);
        }
        else {
            this._flavors.delete(flavorType);
        }
        this._dispatchFlavorChange(flavorType, flavorValue);
    }
    _dispatchFlavorChange(flavorType, flavorValue) {
        for (const extension of getRegisteredListeners()) {
            if (extension.contextTypes().includes(flavorType)) {
                extension.loadListener().then(instance => instance.flavorChanged(flavorValue));
            }
        }
        const dispatcher = this._eventDispatchers.get(flavorType);
        if (!dispatcher) {
            return;
        }
        dispatcher.dispatchEventToListeners(Events.FlavorChanged, flavorValue);
    }
    addFlavorChangeListener(flavorType, listener, thisObject) {
        let dispatcher = this._eventDispatchers.get(flavorType);
        if (!dispatcher) {
            dispatcher = new Common.ObjectWrapper.ObjectWrapper();
            this._eventDispatchers.set(flavorType, dispatcher);
        }
        dispatcher.addEventListener(Events.FlavorChanged, listener, thisObject);
    }
    removeFlavorChangeListener(flavorType, listener, thisObject) {
        const dispatcher = this._eventDispatchers.get(flavorType);
        if (!dispatcher) {
            return;
        }
        dispatcher.removeEventListener(Events.FlavorChanged, listener, thisObject);
        if (!dispatcher.hasEventListeners(Events.FlavorChanged)) {
            this._eventDispatchers.delete(flavorType);
        }
    }
    flavor(flavorType) {
        return this._flavors.get(flavorType) || null;
    }
    flavors() {
        return new Set(this._flavors.keys());
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
var Events;
(function (Events) {
    Events["FlavorChanged"] = "FlavorChanged";
})(Events || (Events = {}));
const registeredListeners = [];
export function registerListener(registration) {
    registeredListeners.push(registration);
}
function getRegisteredListeners() {
    return registeredListeners;
}
//# sourceMappingURL=Context.js.map