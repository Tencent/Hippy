/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import * as Host from '../../core/host/host.js';
let fileManagerInstance;
export class FileManager extends Common.ObjectWrapper.ObjectWrapper {
    _saveCallbacks;
    constructor() {
        super();
        this._saveCallbacks = new Map();
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.SavedURL, this._savedURL, this);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.CanceledSaveURL, this._canceledSavedURL, this);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.AppendedToURL, this._appendedToURL, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!fileManagerInstance || forceNew) {
            fileManagerInstance = new FileManager();
        }
        return fileManagerInstance;
    }
    save(url, content, forceSaveAs) {
        // Remove this url from the saved URLs while it is being saved.
        const result = new Promise(resolve => this._saveCallbacks.set(url, resolve));
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.save(url, content, forceSaveAs);
        return result;
    }
    _savedURL(event) {
        const url = event.data.url;
        const callback = this._saveCallbacks.get(url);
        this._saveCallbacks.delete(url);
        if (callback) {
            callback({ fileSystemPath: event.data.fileSystemPath });
        }
    }
    _canceledSavedURL(event) {
        const url = event.data;
        const callback = this._saveCallbacks.get(url);
        this._saveCallbacks.delete(url);
        if (callback) {
            callback(null);
        }
    }
    append(url, content) {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.append(url, content);
    }
    close(url) {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.close(url);
    }
    _appendedToURL(event) {
        const url = event.data;
        this.dispatchEventToListeners(Events.AppendedToURL, url);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["AppendedToURL"] = "AppendedToURL";
})(Events || (Events = {}));
//# sourceMappingURL=FileManager.js.map