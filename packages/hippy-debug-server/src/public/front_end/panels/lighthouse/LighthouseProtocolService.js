// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
let lastId = 1;
export class ProtocolService extends Common.ObjectWrapper.ObjectWrapper {
    rawConnection;
    lighthouseWorkerPromise;
    lighthouseMessageUpdateCallback;
    async attach() {
        await SDK.TargetManager.TargetManager.instance().suspendAllTargets();
        const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
        if (!mainTarget) {
            throw new Error('Unable to find main target required for LightHouse');
        }
        const childTargetManager = mainTarget.model(SDK.ChildTargetManager.ChildTargetManager);
        if (!childTargetManager) {
            throw new Error('Unable to find child target manager required for LightHouse');
        }
        this.rawConnection = await childTargetManager.createParallelConnection(message => {
            if (typeof message === 'string') {
                message = JSON.parse(message);
            }
            this.dispatchProtocolMessage(message);
        });
    }
    getLocales() {
        return navigator.languages;
    }
    startLighthouse(auditURL, categoryIDs, flags) {
        return this.sendWithResponse('start', { url: auditURL, categoryIDs, flags, locales: this.getLocales() });
    }
    async detach() {
        const oldLighthouseWorker = this.lighthouseWorkerPromise;
        const oldRawConnection = this.rawConnection;
        // When detaching, make sure that we remove the old promises, before we
        // perform any async cleanups. That way, if there is a message coming from
        // lighthouse while we are in the process of cleaning up, we shouldn't deliver
        // them to the backend.
        this.lighthouseWorkerPromise = undefined;
        this.rawConnection = undefined;
        if (oldLighthouseWorker) {
            (await oldLighthouseWorker).terminate();
        }
        if (oldRawConnection) {
            await oldRawConnection.disconnect();
        }
        await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
    }
    registerStatusCallback(callback) {
        this.lighthouseMessageUpdateCallback = callback;
    }
    dispatchProtocolMessage(message) {
        // A message without a sessionId is the main session of the main target (call it "Main session").
        // A parallel connection and session was made that connects to the same main target (call it "Lighthouse session").
        // Messages from the "Lighthouse session" have a sessionId.
        // Without some care, there is a risk of sending the same events for the same main frame to Lighthouse–the backend
        // will create events for the "Main session" and the "Lighthouse session".
        // The workaround–only send message to Lighthouse if:
        //   * the message has a sessionId (is not for the "Main session")
        //   * the message does not have a sessionId (is for the "Main session"), but only for the Target domain
        //     (to kickstart autoAttach in LH).
        const protocolMessage = message;
        if (protocolMessage.sessionId || (protocolMessage.method && protocolMessage.method.startsWith('Target'))) {
            this.sendWithoutResponse('dispatchProtocolMessage', { message: JSON.stringify(message) });
        }
    }
    initWorker() {
        this.lighthouseWorkerPromise = new Promise(resolve => {
            const worker = new Worker(new URL('../../entrypoints/lighthouse_worker/lighthouse_worker.js', import.meta.url), { type: 'module' });
            worker.addEventListener('message', event => {
                if (event.data === 'workerReady') {
                    resolve(worker);
                    return;
                }
                const lighthouseMessage = JSON.parse(event.data);
                if (lighthouseMessage.method === 'statusUpdate') {
                    if (this.lighthouseMessageUpdateCallback && lighthouseMessage.params &&
                        'message' in lighthouseMessage.params) {
                        this.lighthouseMessageUpdateCallback(lighthouseMessage.params.message);
                    }
                }
                else if (lighthouseMessage.method === 'sendProtocolMessage') {
                    if (lighthouseMessage.params && 'message' in lighthouseMessage.params) {
                        this.sendProtocolMessage(lighthouseMessage.params.message);
                    }
                }
            });
        });
        return this.lighthouseWorkerPromise;
    }
    async ensureWorkerExists() {
        let worker;
        if (!this.lighthouseWorkerPromise) {
            worker = await this.initWorker();
        }
        else {
            worker = await this.lighthouseWorkerPromise;
        }
        return worker;
    }
    sendProtocolMessage(message) {
        if (this.rawConnection) {
            this.rawConnection.sendRawMessage(message);
        }
    }
    async sendWithoutResponse(method, params = {}) {
        const worker = await this.ensureWorkerExists();
        const messageId = lastId++;
        worker.postMessage(JSON.stringify({ id: messageId, method, params: { ...params, id: messageId } }));
    }
    async sendWithResponse(method, params = {}) {
        const worker = await this.ensureWorkerExists();
        const messageId = lastId++;
        const messageResult = new Promise(resolve => {
            const workerListener = (event) => {
                const lighthouseMessage = JSON.parse(event.data);
                if (lighthouseMessage.id === messageId) {
                    worker.removeEventListener('message', workerListener);
                    resolve(lighthouseMessage.result);
                }
            };
            worker.addEventListener('message', workerListener);
        });
        worker.postMessage(JSON.stringify({ id: messageId, method, params: { ...params, id: messageId } }));
        return messageResult;
    }
}
//# sourceMappingURL=LighthouseProtocolService.js.map