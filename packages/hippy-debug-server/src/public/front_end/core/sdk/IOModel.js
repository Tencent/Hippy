// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import { RemoteObject } from './RemoteObject.js'; // eslint-disable-line no-unused-vars
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class IOModel extends SDKModel {
    constructor(target) {
        super(target);
    }
    /**
     * @throws {!Error}
     */
    async read(handle, size, offset) {
        const result = await this.target().ioAgent().invoke_read({ handle, offset, size });
        if (result.getError()) {
            throw new Error(result.getError());
        }
        if (result.eof) {
            return null;
        }
        if (result.base64Encoded) {
            return Common.Base64.decode(result.data);
        }
        return result.data;
    }
    async close(handle) {
        const result = await this.target().ioAgent().invoke_close({ handle });
        if (result.getError()) {
            console.error('Could not close stream.');
        }
    }
    /**
     * @throws {!Error}
     */
    async resolveBlob(objectOrObjectId) {
        const objectId = objectOrObjectId instanceof RemoteObject ? objectOrObjectId.objectId : objectOrObjectId;
        if (!objectId) {
            throw new Error('Remote object has undefined objectId');
        }
        const result = await this.target().ioAgent().invoke_resolveBlob({ objectId });
        if (result.getError()) {
            throw new Error(result.getError());
        }
        return `blob:${result.uuid}`;
    }
    /**
     * @throws {!Error}
     */
    async readToString(handle) {
        const strings = [];
        const decoder = new TextDecoder();
        for (;;) {
            const data = await this.read(handle, 1024 * 1024);
            if (data === null) {
                strings.push(decoder.decode());
                break;
            }
            if (data instanceof ArrayBuffer) {
                strings.push(decoder.decode(data, { stream: true }));
            }
            else {
                strings.push(data);
            }
        }
        return strings.join('');
    }
}
SDKModel.register(IOModel, { capabilities: Capability.IO, autostart: true });
//# sourceMappingURL=IOModel.js.map