// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class RenderCoordinatorQueueEmptyEvent extends Event {
    constructor() {
        super('renderqueueempty');
    }
}
export class RenderCoordinatorNewFrameEvent extends Event {
    constructor() {
        super('newframe');
    }
}
let renderCoordinatorInstance;
const UNNAMED_READ = 'Unnamed read';
const UNNAMED_WRITE = 'Unnamed write';
const UNNAMED_SCROLL = 'Unnamed scroll';
const DEADLOCK_TIMEOUT = 1500;
export class RenderCoordinator extends EventTarget {
    static instance({ forceNew = false } = {}) {
        if (!renderCoordinatorInstance || forceNew) {
            renderCoordinatorInstance = new RenderCoordinator();
        }
        return renderCoordinatorInstance;
    }
    // Toggle on to start tracking. You must call takeRecords() to
    // obtain the records. Please note: records are limited by maxRecordSize below.
    observe = false;
    recordStorageLimit = 100;
    // If true, only log activity with an explicit label.
    // This does not affect logging frames or queue empty events.
    observeOnlyNamed = true;
    logInternal = [];
    pendingWorkFrames = [];
    resolvers = new WeakMap();
    rejectors = new WeakMap();
    labels = new WeakMap();
    scheduledWorkId = 0;
    done() {
        if (this.pendingWorkFrames.length === 0) {
            this.logIfEnabled('[Queue empty]');
            return Promise.resolve();
        }
        return new Promise(resolve => this.addEventListener('renderqueueempty', () => resolve(), { once: true }));
    }
    async read(labelOrCallback, callback) {
        if (typeof labelOrCallback === 'string') {
            if (!callback) {
                throw new Error('Read called with label but no callback');
            }
            return this.enqueueHandler(callback, "read" /* READ */, labelOrCallback);
        }
        return this.enqueueHandler(labelOrCallback, "read" /* READ */, UNNAMED_READ);
    }
    async write(labelOrCallback, callback) {
        if (typeof labelOrCallback === 'string') {
            if (!callback) {
                throw new Error('Write called with label but no callback');
            }
            return this.enqueueHandler(callback, "write" /* WRITE */, labelOrCallback);
        }
        return this.enqueueHandler(labelOrCallback, "write" /* WRITE */, UNNAMED_WRITE);
    }
    takeRecords() {
        const logs = [...this.logInternal];
        this.logInternal.length = 0;
        return logs;
    }
    async scroll(labelOrCallback, callback) {
        if (typeof labelOrCallback === 'string') {
            if (!callback) {
                throw new Error('Scroll called with label but no callback');
            }
            return this.enqueueHandler(callback, "read" /* READ */, labelOrCallback);
        }
        return this.enqueueHandler(labelOrCallback, "read" /* READ */, UNNAMED_SCROLL);
    }
    enqueueHandler(callback, action, label = '') {
        this.labels.set(callback, `${action === "read" /* READ */ ? '[Read]' : '[Write]'}: ${label}`);
        if (this.pendingWorkFrames.length === 0) {
            this.pendingWorkFrames.push({
                readers: [],
                writers: [],
            });
        }
        const frame = this.pendingWorkFrames[0];
        if (!frame) {
            throw new Error('No frame available');
        }
        switch (action) {
            case "read" /* READ */:
                frame.readers.push(callback);
                break;
            case "write" /* WRITE */:
                frame.writers.push(callback);
                break;
            default:
                throw new Error(`Unknown action: ${action}`);
        }
        const resolverPromise = new Promise((resolve, reject) => {
            this.resolvers.set(callback, resolve);
            this.rejectors.set(callback, reject);
        });
        this.scheduleWork();
        return resolverPromise;
    }
    async handleWork(handler) {
        const data = await handler.call(undefined);
        const resolver = this.resolvers.get(handler);
        if (!resolver) {
            throw new Error('Unable to locate resolver');
        }
        resolver.call(undefined, data);
        this.resolvers.delete(handler);
        this.rejectors.delete(handler);
    }
    scheduleWork() {
        const hasScheduledWork = this.scheduledWorkId !== 0;
        if (hasScheduledWork) {
            return;
        }
        this.scheduledWorkId = requestAnimationFrame(async () => {
            const hasPendingFrames = this.pendingWorkFrames.length > 0;
            if (!hasPendingFrames) {
                // No pending frames means all pending work has completed.
                // The events dispatched below are mostly for testing contexts.
                // The first is for cases where we have a direct reference to
                // the render coordinator. The second is for other test contexts
                // where we don't, and instead we listen for an event on the window.
                this.dispatchEvent(new RenderCoordinatorQueueEmptyEvent());
                window.dispatchEvent(new RenderCoordinatorQueueEmptyEvent());
                this.logIfEnabled('[Queue empty]');
                this.scheduledWorkId = 0;
                return;
            }
            this.dispatchEvent(new RenderCoordinatorNewFrameEvent());
            this.logIfEnabled('[New frame]');
            const frame = this.pendingWorkFrames.shift();
            if (!frame) {
                return;
            }
            // Start with all the readers and allow them
            // to proceed together.
            const readers = [];
            for (const reader of frame.readers) {
                this.logIfEnabled(this.labels.get(reader));
                readers.push(this.handleWork(reader));
            }
            // Wait for them all to be done.
            try {
                await Promise.race([
                    Promise.all(readers),
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new Error(`Readers took over ${DEADLOCK_TIMEOUT}ms. Possible deadlock?`)), DEADLOCK_TIMEOUT);
                    }),
                ]);
            }
            catch (err) {
                this.rejectAll(frame.readers, err);
            }
            // Next do all the writers as a block.
            const writers = [];
            for (const writer of frame.writers) {
                this.logIfEnabled(this.labels.get(writer));
                writers.push(this.handleWork(writer));
            }
            // And wait for them to be done, too.
            try {
                await Promise.race([
                    Promise.all(writers),
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new Error(`Writers took over ${DEADLOCK_TIMEOUT}ms. Possible deadlock?`)), DEADLOCK_TIMEOUT);
                    }),
                ]);
            }
            catch (err) {
                this.rejectAll(frame.writers, err);
            }
            // Since there may have been more work requested in
            // the callback of a reader / writer, we attempt to schedule
            // it at this point.
            this.scheduledWorkId = 0;
            this.scheduleWork();
        });
    }
    rejectAll(handlers, error) {
        for (const handler of handlers) {
            const rejector = this.rejectors.get(handler);
            if (!rejector) {
                console.warn('Unable to locate rejector');
                continue;
            }
            rejector.call(undefined, error);
            this.resolvers.delete(handler);
            this.rejectors.delete(handler);
        }
    }
    logIfEnabled(value) {
        if (!this.observe || !value) {
            return;
        }
        const hasNoName = value.endsWith(UNNAMED_READ) || value.endsWith(UNNAMED_WRITE) || value.endsWith(UNNAMED_SCROLL);
        if (hasNoName && this.observeOnlyNamed) {
            return;
        }
        this.logInternal.push({ time: performance.now(), value });
        // Keep the log at the log size.
        while (this.logInternal.length > this.recordStorageLimit) {
            this.logInternal.shift();
        }
    }
}
//# sourceMappingURL=RenderCoordinator.js.map