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
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
const UIStrings = {
    /**
    *@description Text in Heap Snapshot Proxy of a profiler tool
    *@example {functionName} PH1
    */
    anErrorOccurredWhenACallToMethod: 'An error occurred when a call to method \'{PH1}\' was requested',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/HeapSnapshotProxy.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class HeapSnapshotWorkerProxy extends Common.ObjectWrapper.ObjectWrapper {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _eventHandler;
    _nextObjectId;
    _nextCallId;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _callbacks;
    _previousCallbacks;
    _worker;
    _interval;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(eventHandler) {
        super();
        this._eventHandler = eventHandler;
        this._nextObjectId = 1;
        this._nextCallId = 1;
        this._callbacks = new Map();
        this._previousCallbacks = new Set();
        // We use the legacy file here, as below we postMessage and expect certain objects to be
        // defined on the global scope. Ideally we use some sort of import-export mechanism across
        // worker boundaries, but that requires a partial rewrite of the heap_snapshot_worker.
        this._worker = Common.Worker.WorkerWrapper.fromURL(new URL('../../entrypoints/heap_snapshot_worker/heap_snapshot_worker-legacy.js', import.meta.url));
        this._worker.onmessage = this._messageReceived.bind(this);
    }
    createLoader(profileUid, snapshotReceivedCallback) {
        const objectId = this._nextObjectId++;
        const proxy = new HeapSnapshotLoaderProxy(this, objectId, profileUid, snapshotReceivedCallback);
        this._postMessage({
            callId: this._nextCallId++,
            disposition: 'create',
            objectId: objectId,
            methodName: 'HeapSnapshotWorker.HeapSnapshotLoader',
        });
        return proxy;
    }
    dispose() {
        this._worker.terminate();
        if (this._interval) {
            clearInterval(this._interval);
        }
    }
    disposeObject(objectId) {
        this._postMessage({ callId: this._nextCallId++, disposition: 'dispose', objectId: objectId });
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    evaluateForTest(script, callback) {
        const callId = this._nextCallId++;
        this._callbacks.set(callId, callback);
        this._postMessage({ callId: callId, disposition: 'evaluateForTest', source: script });
    }
    callFactoryMethod(callback, objectId, methodName, proxyConstructor) {
        const callId = this._nextCallId++;
        const methodArguments = Array.prototype.slice.call(arguments, 4);
        const newObjectId = this._nextObjectId++;
        if (callback) {
            this._callbacks.set(callId, remoteResult => {
                callback(remoteResult ? new proxyConstructor(this, newObjectId) : null);
            });
            this._postMessage({
                callId: callId,
                disposition: 'factory',
                objectId: objectId,
                methodName: methodName,
                methodArguments: methodArguments,
                newObjectId: newObjectId,
            });
            return null;
        }
        this._postMessage({
            callId: callId,
            disposition: 'factory',
            objectId: objectId,
            methodName: methodName,
            methodArguments: methodArguments,
            newObjectId: newObjectId,
        });
        return new proxyConstructor(this, newObjectId);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callMethod(callback, objectId, methodName) {
        const callId = this._nextCallId++;
        const methodArguments = Array.prototype.slice.call(arguments, 3);
        if (callback) {
            this._callbacks.set(callId, callback);
        }
        this._postMessage({
            callId: callId,
            disposition: 'method',
            objectId: objectId,
            methodName: methodName,
            methodArguments: methodArguments,
        });
    }
    startCheckingForLongRunningCalls() {
        if (this._interval) {
            return;
        }
        this._checkLongRunningCalls();
        this._interval = window.setInterval(this._checkLongRunningCalls.bind(this), 300);
    }
    _checkLongRunningCalls() {
        for (const callId of this._previousCallbacks) {
            if (!this._callbacks.has(callId)) {
                this._previousCallbacks.delete(callId);
            }
        }
        const hasLongRunningCalls = Boolean(this._previousCallbacks.size);
        this.dispatchEventToListeners("Wait" /* Wait */, hasLongRunningCalls);
        for (const callId of this._callbacks.keys()) {
            this._previousCallbacks.add(callId);
        }
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _messageReceived(event) {
        const data = event.data;
        if (data.eventName) {
            if (this._eventHandler) {
                this._eventHandler(data.eventName, data.data);
            }
            return;
        }
        if (data.error) {
            if (data.errorMethodName) {
                Common.Console.Console.instance().error(i18nString(UIStrings.anErrorOccurredWhenACallToMethod, { PH1: data.errorMethodName }));
            }
            Common.Console.Console.instance().error(data['errorCallStack']);
            this._callbacks.delete(data.callId);
            return;
        }
        const callback = this._callbacks.get(data.callId);
        if (!callback) {
            return;
        }
        this._callbacks.delete(data.callId);
        callback(data.result);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _postMessage(message) {
        this._worker.postMessage(message);
    }
}
export class HeapSnapshotProxyObject {
    _worker;
    _objectId;
    constructor(worker, objectId) {
        this._worker = worker;
        this._objectId = objectId;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _callWorker(workerMethodName, args) {
        args.splice(1, 0, this._objectId);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const worker = this._worker[workerMethodName];
        if (!worker) {
            throw new Error(`Could not find worker with name ${workerMethodName}.`);
        }
        return worker.apply(this._worker, args);
    }
    dispose() {
        this._worker.disposeObject(this._objectId);
    }
    disposeWorker() {
        this._worker.dispose();
    }
    callFactoryMethod(
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _callback, _methodName, _proxyConstructor, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention
    ..._var_args) {
        return this._callWorker('callFactoryMethod', Array.prototype.slice.call(arguments, 0));
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/naming-convention
    _callMethodPromise(_methodName, ..._var_args) {
        const args = Array.prototype.slice.call(arguments);
        return new Promise(resolve => this._callWorker('callMethod', [resolve, ...args]));
    }
}
export class HeapSnapshotLoaderProxy extends HeapSnapshotProxyObject {
    _profileUid;
    _snapshotReceivedCallback;
    constructor(worker, objectId, profileUid, snapshotReceivedCallback) {
        super(worker, objectId);
        this._profileUid = profileUid;
        this._snapshotReceivedCallback = snapshotReceivedCallback;
    }
    async write(chunk) {
        await this._callMethodPromise('write', chunk);
    }
    async close() {
        await this._callMethodPromise('close');
        const snapshotProxy = await new Promise(resolve => this.callFactoryMethod(resolve, 'buildSnapshot', HeapSnapshotProxy));
        this.dispose();
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // @ts-expect-error
        snapshotProxy.setProfileUid(this._profileUid);
        await snapshotProxy.updateStaticData();
        this._snapshotReceivedCallback(snapshotProxy);
    }
}
export class HeapSnapshotProxy extends HeapSnapshotProxyObject {
    _staticData;
    _profileUid;
    constructor(worker, objectId) {
        super(worker, objectId);
        this._staticData = null;
    }
    search(searchConfig, filter) {
        return this._callMethodPromise('search', searchConfig, filter);
    }
    aggregatesWithFilter(filter) {
        return this._callMethodPromise('aggregatesWithFilter', filter);
    }
    aggregatesForDiff() {
        return this._callMethodPromise('aggregatesForDiff');
    }
    calculateSnapshotDiff(baseSnapshotId, baseSnapshotAggregates) {
        return this._callMethodPromise('calculateSnapshotDiff', baseSnapshotId, baseSnapshotAggregates);
    }
    nodeClassName(snapshotObjectId) {
        return this._callMethodPromise('nodeClassName', snapshotObjectId);
    }
    createEdgesProvider(nodeIndex) {
        return this.callFactoryMethod(null, 'createEdgesProvider', HeapSnapshotProviderProxy, nodeIndex);
    }
    createRetainingEdgesProvider(nodeIndex) {
        return this.callFactoryMethod(null, 'createRetainingEdgesProvider', HeapSnapshotProviderProxy, nodeIndex);
    }
    createAddedNodesProvider(baseSnapshotId, className) {
        return this.callFactoryMethod(null, 'createAddedNodesProvider', HeapSnapshotProviderProxy, baseSnapshotId, className);
    }
    createDeletedNodesProvider(nodeIndexes) {
        return this.callFactoryMethod(null, 'createDeletedNodesProvider', HeapSnapshotProviderProxy, nodeIndexes);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createNodesProvider(filter) {
        return this.callFactoryMethod(null, 'createNodesProvider', HeapSnapshotProviderProxy, filter);
    }
    createNodesProviderForClass(className, nodeFilter) {
        return this.callFactoryMethod(null, 'createNodesProviderForClass', HeapSnapshotProviderProxy, className, nodeFilter);
    }
    allocationTracesTops() {
        return this._callMethodPromise('allocationTracesTops');
    }
    allocationNodeCallers(nodeId) {
        return this._callMethodPromise('allocationNodeCallers', nodeId);
    }
    allocationStack(nodeIndex) {
        return this._callMethodPromise('allocationStack', nodeIndex);
    }
    dispose() {
        throw new Error('Should never be called');
    }
    get nodeCount() {
        if (!this._staticData) {
            return 0;
        }
        return this._staticData.nodeCount;
    }
    get rootNodeIndex() {
        if (!this._staticData) {
            return 0;
        }
        return this._staticData.rootNodeIndex;
    }
    async updateStaticData() {
        this._staticData = await this._callMethodPromise('updateStaticData');
    }
    getStatistics() {
        return this._callMethodPromise('getStatistics');
    }
    getLocation(nodeIndex) {
        return this._callMethodPromise('getLocation', nodeIndex);
    }
    getSamples() {
        return this._callMethodPromise('getSamples');
    }
    get totalSize() {
        if (!this._staticData) {
            return 0;
        }
        return this._staticData.totalSize;
    }
    get uid() {
        return this._profileUid;
    }
    setProfileUid(profileUid) {
        this._profileUid = profileUid;
    }
    maxJSObjectId() {
        if (!this._staticData) {
            return 0;
        }
        return this._staticData.maxJSObjectId;
    }
}
export class HeapSnapshotProviderProxy extends HeapSnapshotProxyObject {
    constructor(worker, objectId) {
        super(worker, objectId);
    }
    nodePosition(snapshotObjectId) {
        return this._callMethodPromise('nodePosition', snapshotObjectId);
    }
    isEmpty() {
        return this._callMethodPromise('isEmpty');
    }
    serializeItemsRange(startPosition, endPosition) {
        return this._callMethodPromise('serializeItemsRange', startPosition, endPosition);
    }
    async sortAndRewind(comparator) {
        await this._callMethodPromise('sortAndRewind', comparator);
    }
}
//# sourceMappingURL=HeapSnapshotProxy.js.map