// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export function removeEventListeners(eventList) {
    for (const eventInfo of eventList) {
        eventInfo.eventTarget.removeEventListener(eventInfo.eventType, eventInfo.listener, eventInfo.thisObject);
    }
    // Do not hold references on unused event descriptors.
    eventList.splice(0);
}
export class EventTarget {
    addEventListener(eventType, listener, thisObject) {
        throw new Error('not implemented');
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(eventType) {
        throw new Error('not implemented');
    }
    removeEventListener(eventType, listener, thisObject) {
        throw new Error('not implemented');
    }
    hasEventListeners(eventType) {
        throw new Error('not implemented');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatchEventToListeners(eventType, eventData) {
    }
    static removeEventListeners = removeEventListeners;
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fireEvent(name, detail = {}, target = window) {
    const evt = new CustomEvent(name, { bubbles: true, cancelable: true, detail });
    target.dispatchEvent(evt);
}
//# sourceMappingURL=EventTarget.js.map