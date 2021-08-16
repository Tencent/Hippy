// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Coordinator from '../render_coordinator/render_coordinator.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
const pendingRenders = new WeakSet();
const activeRenders = new WeakSet();
const subsequentRender = new WeakMap();
const wrappedCallbacks = new WeakMap();
export async function scheduleRender(component, callback) {
    // If scheduleRender is called when there is already a render scheduled for this
    // component, store the callback against the renderer for after the current
    // call has finished.
    if (activeRenders.has(component)) {
        subsequentRender.set(component, callback);
        return;
    }
    // If this render was already scheduled but hasn't started yet, just return.
    if (pendingRenders.has(component)) {
        return;
    }
    pendingRenders.add(component);
    // Create a wrapper around the callback so that we know that it has moved from
    // pending to active. When it has completed we remove it from the active renderers.
    let wrappedCallback = wrappedCallbacks.get(callback);
    if (!wrappedCallback) {
        wrappedCallback = async () => {
            pendingRenders.delete(component);
            activeRenders.add(component);
            await callback.call(component);
            activeRenders.delete(component);
        };
        // Store it for next time so we aren't creating wrappers unnecessarily.
        wrappedCallbacks.set(callback, wrappedCallback);
    }
    // Track that there is render rendering, wait for it to finish, and stop tracking.
    await coordinator.write(wrappedCallback);
    // If during the render there was another schedule render call, get
    // the callback and schedule it to happen now.
    if (subsequentRender.has(component)) {
        const newCallback = subsequentRender.get(component);
        subsequentRender.delete(component);
        if (!newCallback) {
            return;
        }
        scheduleRender(component, newCallback);
    }
}
export function isScheduledRender(component) {
    return activeRenders.has(component);
}
//# sourceMappingURL=scheduled-render.js.map