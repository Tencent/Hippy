// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { getRegisteredActionExtensions } from './ActionRegistration.js'; // eslint-disable-line no-unused-vars
import { Context } from './Context.js'; // eslint-disable-line no-unused-vars
let actionRegistryInstance;
export class ActionRegistry {
    _actionsById;
    constructor() {
        this._actionsById = new Map();
        this._registerActions();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!actionRegistryInstance || forceNew) {
            actionRegistryInstance = new ActionRegistry();
        }
        return actionRegistryInstance;
    }
    static removeInstance() {
        actionRegistryInstance = undefined;
    }
    _registerActions() {
        for (const action of getRegisteredActionExtensions()) {
            this._actionsById.set(action.id(), action);
            if (!action.canInstantiate()) {
                action.setEnabled(false);
            }
        }
    }
    availableActions() {
        return this.applicableActions([...this._actionsById.keys()], Context.instance());
    }
    actions() {
        return [...this._actionsById.values()];
    }
    applicableActions(actionIds, context) {
        const applicableActions = [];
        for (const actionId of actionIds) {
            const action = this._actionsById.get(actionId);
            if (action && action.enabled()) {
                if (isActionApplicableToContextTypes(action, context.flavors())) {
                    applicableActions.push(action);
                }
            }
        }
        return applicableActions;
        function isActionApplicableToContextTypes(action, currentContextTypes) {
            const contextTypes = action.contextTypes();
            if (!contextTypes) {
                return true;
            }
            for (let i = 0; i < contextTypes.length; ++i) {
                const contextType = contextTypes[i];
                const isMatching = Boolean(contextType) && currentContextTypes.has(contextType);
                if (isMatching) {
                    return true;
                }
            }
            return false;
        }
    }
    action(actionId) {
        return this._actionsById.get(actionId) || null;
    }
}
//# sourceMappingURL=ActionRegistry.js.map