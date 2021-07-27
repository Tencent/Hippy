// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { hasCondition, hasFrameContext } from './Steps.js';
export class RecordingEventHandler {
    target;
    session;
    resourceTreeModel;
    lastStep;
    lastStepTimeout;
    constructor(session, target) {
        this.target = target;
        this.session = session;
        this.lastStep = null;
        this.lastStepTimeout = null;
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            throw new Error('ResourceTreeModel instance is missing for the target: ' + target.id());
        }
        this.resourceTreeModel = resourceTreeModel;
    }
    getTarget() {
        return this.target.id() === 'main' ? 'main' : this.target.inspectedURL();
    }
    getContextForFrame(frame) {
        const path = [];
        let currentFrame = frame;
        while (currentFrame) {
            const parentFrame = currentFrame.parentFrame();
            if (!parentFrame) {
                break;
            }
            const childFrames = parentFrame.childFrames;
            const index = childFrames.indexOf(currentFrame);
            path.unshift(index);
            currentFrame = parentFrame;
        }
        const target = this.getTarget();
        return {
            target,
            path,
        };
    }
    bindingCalled(frameId, step) {
        const frame = this.resourceTreeModel.frameForId(frameId);
        if (!frame) {
            throw new Error('Could not find frame.');
        }
        const context = this.getContextForFrame(frame);
        if (hasFrameContext(step)) {
            this.appendStep({ ...step, context });
        }
        else {
            this.appendStep(step);
        }
    }
    async appendStep(step) {
        this.lastStep = await this.session.appendStep(step);
        if (this.lastStepTimeout) {
            window.clearTimeout(this.lastStepTimeout);
        }
        this.lastStepTimeout = window.setTimeout(() => {
            this.lastStep = null;
            this.lastStepTimeout = null;
        }, 1000);
    }
    addConditionToLastStep(condition) {
        if (!this.lastStep) {
            return;
        }
        if (hasCondition(this.lastStep)) {
            this.session.addConditionToStep(this.lastStep, condition);
        }
    }
    targetDestroyed() {
        // TODO: figure out how this works with sections
        // this.appendStep(new CloseStep(this.getTarget()));
    }
    targetInfoChanged(url) {
        this.addConditionToLastStep({
            type: 'waitForNavigation',
            expectedUrl: url,
        });
    }
}
//# sourceMappingURL=RecordingEventHandler.js.map