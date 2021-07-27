// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class SecurityOriginManager extends SDKModel {
    _mainSecurityOrigin;
    _unreachableMainSecurityOrigin;
    _securityOrigins;
    constructor(target) {
        super(target);
        // if a URL is unreachable, the browser will jump to an error page at
        // 'chrome-error://chromewebdata/', and |this._mainSecurityOrigin| stores
        // its origin. In this situation, the original unreachable URL's security
        // origin will be stored in |this._unreachableMainSecurityOrigin|.
        this._mainSecurityOrigin = '';
        this._unreachableMainSecurityOrigin = '';
        this._securityOrigins = new Set();
    }
    updateSecurityOrigins(securityOrigins) {
        const oldOrigins = this._securityOrigins;
        this._securityOrigins = securityOrigins;
        for (const origin of oldOrigins) {
            if (!this._securityOrigins.has(origin)) {
                this.dispatchEventToListeners(Events.SecurityOriginRemoved, origin);
            }
        }
        for (const origin of this._securityOrigins) {
            if (!oldOrigins.has(origin)) {
                this.dispatchEventToListeners(Events.SecurityOriginAdded, origin);
            }
        }
    }
    securityOrigins() {
        return [...this._securityOrigins];
    }
    mainSecurityOrigin() {
        return this._mainSecurityOrigin;
    }
    unreachableMainSecurityOrigin() {
        return this._unreachableMainSecurityOrigin;
    }
    setMainSecurityOrigin(securityOrigin, unreachableSecurityOrigin) {
        this._mainSecurityOrigin = securityOrigin;
        this._unreachableMainSecurityOrigin = unreachableSecurityOrigin || null;
        this.dispatchEventToListeners(Events.MainSecurityOriginChanged, {
            mainSecurityOrigin: this._mainSecurityOrigin,
            unreachableMainSecurityOrigin: this._unreachableMainSecurityOrigin,
        });
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["SecurityOriginAdded"] = "SecurityOriginAdded";
    Events["SecurityOriginRemoved"] = "SecurityOriginRemoved";
    Events["MainSecurityOriginChanged"] = "MainSecurityOriginChanged";
})(Events || (Events = {}));
// TODO(jarhar): this is the only usage of Capability.None. Do something about it!
SDKModel.register(SecurityOriginManager, { capabilities: Capability.None, autostart: false });
//# sourceMappingURL=SecurityOriginManager.js.map