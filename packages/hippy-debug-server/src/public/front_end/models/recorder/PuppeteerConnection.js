// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as puppeteer from '../../third_party/puppeteer/puppeteer.js';
export class Transport {
    connection;
    knownIds = new Set();
    knownTargets = new Set();
    constructor(connection) {
        this.connection = connection;
    }
    send(data) {
        const message = JSON.parse(data);
        this.knownIds.add(message.id);
        this.connection.sendRawMessage(data);
    }
    close() {
        this.connection.disconnect();
    }
    set onmessage(cb) {
        this.connection.setOnMessage((message) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (message);
            if (data.id && !this.knownIds.has(data.id)) {
                return;
            }
            this.knownIds.delete(data.id);
            if (data.method === 'Target.targetCreated') {
                this.knownTargets.add(data.params.targetInfo.targetId);
            }
            else if (data.method === 'Target.targetInfoChanged') {
                if (!this.knownTargets.has(data.params.targetId)) {
                    // This target is not known to puppeteer - skip passing information
                    return;
                }
            }
            else if (data.method === 'Target.targetDestroyed') {
                if (!this.knownTargets.has(data.params.targetId)) {
                    // This target is not known to puppeteer - skip passing information
                    return;
                }
                this.knownTargets.delete(data.params.targetId);
            }
            if (!data.sessionId) {
                return;
            }
            if (data.sessionId === this.connection._sessionId) {
                delete data.sessionId;
            }
            cb(JSON.stringify(data));
        });
    }
    set onclose(cb) {
        const prev = this.connection._onDisconnect;
        this.connection.setOnDisconnect(reason => {
            if (prev) {
                prev(reason);
            }
            if (cb) {
                cb();
            }
        });
    }
}
export async function getPuppeteerConnection() {
    const mainTarget = SDK.TargetManager.TargetManager.instance().mainTarget();
    if (!mainTarget) {
        throw new Error('Could not find main target');
    }
    const childTargetManager = mainTarget.model(SDK.ChildTargetManager.ChildTargetManager);
    if (!childTargetManager) {
        throw new Error('Could not get childTargetManager');
    }
    // Pass an empty message handler because it will be overwritten by puppeteer anyways.
    const rawConnection = await childTargetManager.createParallelConnection(() => { });
    const transport = new Transport(rawConnection);
    // url is an empty string in this case parallel to:
    // https://github.com/puppeteer/puppeteer/blob/f63a123ecef86693e6457b07437a96f108f3e3c5/src/common/BrowserConnector.ts#L72
    const connection = new puppeteer.Connection('', transport);
    const mainTargetId = await childTargetManager._getParentTargetId();
    const browser = await puppeteer.Browser.create(connection, [], false, undefined, undefined, undefined, (targetInfo) => {
        return targetInfo.targetId === mainTargetId;
    });
    const resourceTreeModel = mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel);
    if (!resourceTreeModel) {
        throw new Error('Could not get resource tree model');
    }
    const mainFrame = resourceTreeModel.mainFrame;
    if (!mainFrame) {
        throw new Error('Could not find main frame');
    }
    const page = await browser.pages().then(pages => pages.find(p => p.mainFrame()._id === mainFrame.id) || null);
    return { page, connection: rawConnection, browser };
}
//# sourceMappingURL=PuppeteerConnection.js.map