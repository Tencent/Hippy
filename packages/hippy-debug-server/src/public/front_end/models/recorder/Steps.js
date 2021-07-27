// Copyright (c) 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export function assertAllStepTypesAreHandled(s) {
    throw new Error(`Unknown step type: ${s.type}`);
}
export function createClickStep(context, selector) {
    return {
        type: 'click',
        context,
        selector,
    };
}
export function createSubmitStep(context, selector) {
    return {
        type: 'submit',
        context,
        selector,
    };
}
export function createChangeStep(context, selector, value) {
    return {
        type: 'change',
        context,
        selector,
        value,
    };
}
export function createEmulateNetworkConditionsStep(conditions) {
    return {
        type: 'emulateNetworkConditions',
        conditions,
    };
}
export function createKeyDownStep(context, key) {
    return {
        type: 'keydown',
        context,
        key,
    };
}
export function createKeyUpStep(context, key) {
    return {
        type: 'keyup',
        context,
        key,
    };
}
export function createViewportStep(viewport) {
    return {
        type: 'viewport',
        width: viewport.clientWidth,
        height: viewport.clientHeight,
    };
}
export function hasFrameContext(step) {
    return ['click', 'change', 'submit', 'keydown', 'keyup'].includes(step.type);
}
export function hasCondition(step) {
    return ['click', 'change', 'submit', 'keydown', 'keyup'].includes(step.type);
}
//# sourceMappingURL=Steps.js.map