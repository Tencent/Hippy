// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
const registeredModels = new Map();
export class SDKModel extends Common.ObjectWrapper.ObjectWrapper {
    _target;
    constructor(target) {
        super();
        this._target = target;
    }
    target() {
        return this._target;
    }
    /**
     * Override this method to perform tasks that are required to suspend the
     * model and that still need other models in an unsuspended state.
     */
    async preSuspendModel(_reason) {
    }
    async suspendModel(_reason) {
    }
    async resumeModel() {
    }
    /**
     * Override this method to perform tasks that are required to after resuming
     * the model and that require all models already in an unsuspended state.
     */
    async postResumeModel() {
    }
    dispose() {
    }
    static register(modelClass, registrationInfo) {
        if (registrationInfo.early && !registrationInfo.autostart) {
            throw new Error(`Error registering model ${modelClass.name}: early models must be autostarted.`);
        }
        registeredModels.set(modelClass, registrationInfo);
    }
    static get registeredModels() {
        return registeredModels;
    }
}
//# sourceMappingURL=SDKModel.js.map