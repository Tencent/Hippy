// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../../../core/sdk/sdk.js';
import * as CssOverviewModule from '../../../../panels/css_overview/css_overview.js';
import * as UI from '../../legacy.js';
const computedArrayFontSizeIndex = 6;
function getPxMultiplier() {
    return 1;
}
async function getEmMultiplier(isFontSizeProperty) {
    const selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
    let currentFontSize;
    if (selectedNode && selectedNode.parentNode && selectedNode.nodeName() !== 'HTML') {
        const [model] = SDK.TargetManager.TargetManager.instance().models(CssOverviewModule.CSSOverviewModel.CSSOverviewModel);
        const fontSizeNodeId = isFontSizeProperty ? selectedNode.parentNode.id : selectedNode.id;
        const computedFontSize = await model.getComputedStyleForNode(fontSizeNodeId).then(findFontSizeValue);
        const computedFontSizeValue = computedFontSize.replace(/[a-z]/g, '');
        currentFontSize = parseFloat(computedFontSizeValue);
    }
    else {
        currentFontSize = 16;
    }
    return currentFontSize;
}
async function getRemMultiplier() {
    const selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
    const htmlNode = findHtmlNode(selectedNode);
    if (!htmlNode || !htmlNode.id) {
        return 16;
    }
    const [model] = SDK.TargetManager.TargetManager.instance().models(CssOverviewModule.CSSOverviewModel.CSSOverviewModel);
    const computedRootFontSize = await model.getComputedStyleForNode(htmlNode.id).then(findFontSizeValue);
    const rootFontSizeValue = computedRootFontSize.replace(/[a-z]/g, '');
    const rootFontSize = parseFloat(rootFontSizeValue);
    return rootFontSize;
}
async function getPercentMultiplier(isFontSizeProperty) {
    const emMultiplier = await getEmMultiplier(isFontSizeProperty);
    const percMultiplier = emMultiplier / 100;
    return percMultiplier;
}
async function getVhMultiplier() {
    const viewportObject = await getViewportObject();
    if (!viewportObject) {
        return 1;
    }
    const viewportHeight = viewportObject.height;
    const vhMultiplier = viewportHeight / 100;
    return vhMultiplier;
}
async function getVwMultiplier() {
    const viewportObject = await getViewportObject();
    if (!viewportObject) {
        return 1;
    }
    const viewportWidth = viewportObject.width;
    const vwMultiplier = viewportWidth / 100;
    return vwMultiplier;
}
async function getVminMultiplier() {
    const viewportObject = await getViewportObject();
    if (!viewportObject) {
        return 1;
    }
    const viewportWidth = viewportObject.width;
    const viewportHeight = viewportObject.height;
    const minViewportSize = Math.min(viewportWidth, viewportHeight);
    const vminMultiplier = minViewportSize / 100;
    return vminMultiplier;
}
async function getVmaxMultiplier() {
    const viewportObject = await getViewportObject();
    if (!viewportObject) {
        return 1;
    }
    const viewportWidth = viewportObject.width;
    const viewportHeight = viewportObject.height;
    const maxViewportSize = Math.max(viewportWidth, viewportHeight);
    const vmaxMultiplier = maxViewportSize / 100;
    return vmaxMultiplier;
}
function getCmMultiplier() {
    return 37.795;
}
function getMmMultiplier() {
    return 3.7795;
}
function getInMultiplier() {
    return 96;
}
function getPtMultiplier() {
    return 4 / 3;
}
function getPcMultiplier() {
    return 16;
}
function findFontSizeValue(computedObject) {
    const computedArray = computedObject.computedStyle;
    let index = computedArrayFontSizeIndex;
    if (computedArray[index].name && computedArray[index].name !== 'font-size') {
        for (let i = 0; i < computedArray.length; i++) {
            if (computedArray[i].name === 'font-size') {
                index = i;
                break;
            }
        }
    }
    return computedArray[index].value;
}
function findHtmlNode(selectedNode) {
    let node = selectedNode;
    while (node && node.nodeName() !== 'HTML') {
        if (node.parentNode) {
            node = node.parentNode;
        }
        else {
            break;
        }
    }
    return node;
}
const widthEvaluateParams = {
    expression: 'window.innerWidth',
    objectGroup: undefined,
    includeCommandLineAPI: false,
    silent: true,
    contextId: undefined,
    returnByValue: false,
    generatePreview: false,
    userGesture: false,
    awaitPromise: true,
    throwOnSideEffect: false,
    timeout: undefined,
    disableBreaks: true,
    replMode: false,
    allowUnsafeEvalBlockedByCSP: false,
};
const heightEvaluateParams = {
    expression: 'window.innerHeight',
    objectGroup: undefined,
    includeCommandLineAPI: false,
    silent: true,
    contextId: undefined,
    returnByValue: false,
    generatePreview: false,
    userGesture: false,
    awaitPromise: true,
    throwOnSideEffect: false,
    timeout: undefined,
    disableBreaks: true,
    replMode: false,
    allowUnsafeEvalBlockedByCSP: false,
};
async function getViewportObject() {
    const currentExecutionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
    let width, height;
    if (currentExecutionContext) {
        const widthObject = await currentExecutionContext.evaluate(widthEvaluateParams, false, false);
        const heightObject = await currentExecutionContext.evaluate(heightEvaluateParams, false, false);
        if ('error' in widthObject || 'error' in heightObject) {
            return null;
        }
        if (widthObject.object) {
            width = widthObject.object.value;
        }
        if (heightObject.object) {
            height = heightObject.object.value;
        }
    }
    if (width === undefined || height === undefined) {
        const selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        if (!selectedNode) {
            return null;
        }
        const pageLayout = await selectedNode.domModel().target().pageAgent().invoke_getLayoutMetrics();
        const zoom = pageLayout.visualViewport.zoom ? pageLayout.visualViewport.zoom : 1;
        height = pageLayout.visualViewport.clientHeight / zoom;
        width = pageLayout.visualViewport.clientWidth / zoom;
    }
    return { width, height };
}
const unitConversionMap = new Map();
unitConversionMap.set('px', getPxMultiplier);
unitConversionMap.set('em', getEmMultiplier);
unitConversionMap.set('rem', getRemMultiplier);
unitConversionMap.set('%', getPercentMultiplier);
unitConversionMap.set('vh', getVhMultiplier);
unitConversionMap.set('vw', getVwMultiplier);
unitConversionMap.set('vmin', getVminMultiplier);
unitConversionMap.set('vmax', getVmaxMultiplier);
unitConversionMap.set('cm', getCmMultiplier);
unitConversionMap.set('mm', getMmMultiplier);
unitConversionMap.set('in', getInMultiplier);
unitConversionMap.set('pt', getPtMultiplier);
unitConversionMap.set('pc', getPcMultiplier);
export async function getUnitConversionMultiplier(prevUnit, newUnit, isFontSize) {
    if (prevUnit === '') {
        prevUnit = 'em';
    }
    if (newUnit === '') {
        newUnit = 'em';
    }
    let prevUnitMultiplier, newUnitMultiplier;
    const prevUnitFunction = unitConversionMap.get(prevUnit);
    const newUnitFunction = unitConversionMap.get(newUnit);
    if (prevUnitFunction && newUnitFunction) {
        if (prevUnit === 'em' || prevUnit === '%') {
            prevUnitMultiplier = await prevUnitFunction(isFontSize);
        }
        else {
            prevUnitMultiplier = await prevUnitFunction();
        }
        if (newUnit === 'em' || newUnit === '%') {
            newUnitMultiplier = await newUnitFunction(isFontSize);
        }
        else {
            newUnitMultiplier = await newUnitFunction();
        }
    }
    else {
        return 1;
    }
    return prevUnitMultiplier / newUnitMultiplier;
}
//# sourceMappingURL=FontEditorUnitConverter.js.map