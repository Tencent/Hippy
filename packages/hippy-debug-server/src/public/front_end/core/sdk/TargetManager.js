// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import { Target } from './Target.js';
let targetManagerInstance;
export class TargetManager extends Common.ObjectWrapper.ObjectWrapper {
    _targets;
    _observers;
    _modelListeners;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _modelObservers;
    _isSuspended;
    constructor() {
        super();
        this._targets = new Set();
        this._observers = new Set();
        this._modelListeners = new Platform.MapUtilities.Multimap();
        this._modelObservers = new Platform.MapUtilities.Multimap();
        this._isSuspended = false;
    }
    static instance({ forceNew } = { forceNew: false }) {
        if (!targetManagerInstance || forceNew) {
            targetManagerInstance = new TargetManager();
        }
        return targetManagerInstance;
    }
    static removeInstance() {
        targetManagerInstance = undefined;
    }
    onInspectedURLChange(target) {
        this.dispatchEventToListeners(Events.InspectedURLChanged, target);
    }
    onNameChange(target) {
        this.dispatchEventToListeners(Events.NameChanged, target);
    }
    async suspendAllTargets(reason) {
        if (this._isSuspended) {
            return;
        }
        this._isSuspended = true;
        this.dispatchEventToListeners(Events.SuspendStateChanged);
        const suspendPromises = Array.from(this._targets.values(), target => target.suspend(reason));
        await Promise.all(suspendPromises);
    }
    async resumeAllTargets() {
        if (!this._isSuspended) {
            return;
        }
        this._isSuspended = false;
        this.dispatchEventToListeners(Events.SuspendStateChanged);
        const resumePromises = Array.from(this._targets.values(), target => target.resume());
        await Promise.all(resumePromises);
    }
    allTargetsSuspended() {
        return this._isSuspended;
    }
    models(modelClass) {
        const result = [];
        for (const target of this._targets) {
            const model = target.model(modelClass);
            if (model) {
                result.push(model);
            }
        }
        return result;
    }
    inspectedURL() {
        const mainTarget = this.mainTarget();
        return mainTarget ? mainTarget.inspectedURL() : '';
    }
    observeModels(modelClass, observer) {
        const models = this.models(modelClass);
        this._modelObservers.set(modelClass, observer);
        for (const model of models) {
            observer.modelAdded(model);
        }
    }
    unobserveModels(modelClass, observer) {
        this._modelObservers.delete(modelClass, observer);
    }
    modelAdded(target, modelClass, model) {
        for (const observer of this._modelObservers.get(modelClass).values()) {
            observer.modelAdded(model);
        }
    }
    _modelRemoved(target, modelClass, model) {
        for (const observer of this._modelObservers.get(modelClass).values()) {
            observer.modelRemoved(model);
        }
    }
    addModelListener(modelClass, eventType, listener, thisObject) {
        for (const model of this.models(modelClass)) {
            model.addEventListener(eventType, listener, thisObject);
        }
        this._modelListeners.set(eventType, { modelClass: modelClass, thisObject: thisObject, listener: listener });
    }
    removeModelListener(modelClass, eventType, listener, thisObject) {
        if (!this._modelListeners.has(eventType)) {
            return;
        }
        for (const model of this.models(modelClass)) {
            model.removeEventListener(eventType, listener, thisObject);
        }
        for (const info of this._modelListeners.get(eventType)) {
            if (info.modelClass === modelClass && info.listener === listener && info.thisObject === thisObject) {
                this._modelListeners.delete(eventType, info);
            }
        }
    }
    observeTargets(targetObserver) {
        if (this._observers.has(targetObserver)) {
            throw new Error('Observer can only be registered once');
        }
        for (const target of this._targets) {
            targetObserver.targetAdded(target);
        }
        this._observers.add(targetObserver);
    }
    unobserveTargets(targetObserver) {
        this._observers.delete(targetObserver);
    }
    createTarget(id, name, type, parentTarget, sessionId, waitForDebuggerInPage, connection, targetInfo) {
        const target = new Target(this, id, name, type, parentTarget, sessionId || '', this._isSuspended, connection || null, targetInfo);
        if (waitForDebuggerInPage) {
            // @ts-ignore TODO(1063322): Find out where pageAgent() is set on Target/TargetBase.
            target.pageAgent().waitForDebugger();
        }
        target.createModels(new Set(this._modelObservers.keysArray()));
        this._targets.add(target);
        // Iterate over a copy. _observers might be modified during iteration.
        for (const observer of [...this._observers]) {
            observer.targetAdded(target);
        }
        for (const modelClass of target.models().keys()) {
            const model = target.models().get(modelClass);
            this.modelAdded(target, modelClass, model);
        }
        for (const key of this._modelListeners.keysArray()) {
            for (const info of this._modelListeners.get(key)) {
                const model = target.model(info.modelClass);
                if (model) {
                    model.addEventListener(key, info.listener, info.thisObject);
                }
            }
        }
        return target;
    }
    removeTarget(target) {
        if (!this._targets.has(target)) {
            return;
        }
        this._targets.delete(target);
        for (const modelClass of target.models().keys()) {
            const model = target.models().get(modelClass);
            this._modelRemoved(target, modelClass, model);
        }
        // Iterate over a copy. _observers might be modified during iteration.
        for (const observer of [...this._observers]) {
            observer.targetRemoved(target);
        }
        for (const key of this._modelListeners.keysArray()) {
            for (const info of this._modelListeners.get(key)) {
                const model = target.model(info.modelClass);
                if (model) {
                    model.removeEventListener(key, info.listener, info.thisObject);
                }
            }
        }
    }
    targets() {
        return [...this._targets];
    }
    targetById(id) {
        // TODO(dgozman): add a map id -> target.
        return this.targets().find(target => target.id() === id) || null;
    }
    mainTarget() {
        return this._targets.size ? this._targets.values().next().value : null;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["AvailableTargetsChanged"] = "AvailableTargetsChanged";
    Events["InspectedURLChanged"] = "InspectedURLChanged";
    Events["NameChanged"] = "NameChanged";
    Events["SuspendStateChanged"] = "SuspendStateChanged";
})(Events || (Events = {}));
export class Observer {
    targetAdded(_target) {
    }
    targetRemoved(_target) {
    }
}
export class SDKModelObserver {
    modelAdded(_model) {
    }
    modelRemoved(_model) {
    }
}
//# sourceMappingURL=TargetManager.js.map