// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class ObjectWrapper {
    _listeners;
    constructor() {
    }
    addEventListener(eventType, listener, thisObject) {
        if (!listener) {
            console.assert(false);
        }
        if (!this._listeners) {
            this._listeners = new Map();
        }
        if (!this._listeners.has(eventType)) {
            this._listeners.set(eventType, []);
        }
        const listenerForEventType = this._listeners.get(eventType);
        if (listenerForEventType) {
            listenerForEventType.push({ thisObject: thisObject, listener: listener, disposed: undefined });
        }
        return { eventTarget: this, eventType: eventType, thisObject: thisObject, listener: listener };
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(eventType) {
        return new Promise(resolve => {
            const descriptor = this.addEventListener(eventType, event => {
                this.removeEventListener(eventType, descriptor.listener);
                resolve(event.data);
            });
        });
    }
    removeEventListener(eventType, listener, thisObject) {
        console.assert(Boolean(listener));
        if (!this._listeners || !this._listeners.has(eventType)) {
            return;
        }
        const listeners = this._listeners.get(eventType) || [];
        for (let i = 0; i < listeners.length; ++i) {
            if (listeners[i].listener === listener && listeners[i].thisObject === thisObject) {
                listeners[i].disposed = true;
                listeners.splice(i--, 1);
            }
        }
        if (!listeners.length) {
            this._listeners.delete(eventType);
        }
    }
    hasEventListeners(eventType) {
        return Boolean(this._listeners && this._listeners.has(eventType));
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatchEventToListeners(eventType, eventData) {
        if (!this._listeners || !this._listeners.has(eventType)) {
            return;
        }
        const event = { data: eventData };
        // @ts-ignore we do the check for undefined above
        const listeners = this._listeners.get(eventType).slice(0) || [];
        for (let i = 0; i < listeners.length; ++i) {
            if (!listeners[i].disposed) {
                listeners[i].listener.call(listeners[i].thisObject, event);
            }
        }
    }
}
//# sourceMappingURL=Object.js.map