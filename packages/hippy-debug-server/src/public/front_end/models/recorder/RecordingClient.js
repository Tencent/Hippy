// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * This function is special because it gets injected into the target page.
 * All runtime code should be defined withing the function so that it can
 * be serialised.
 */
export function setupRecordingClient(bindings, debug = false, allowUntrustedEvents = false, exports = {}) {
    const log = (...args) => {
        if (debug) {
            console.log(...args); // eslint-disable-line no-console
        }
    };
    const createStepFromEvent = (event, target, isTrusted = false) => {
        // Clicking on a submit button will emit a submit event
        // which will be handled in a different handler.
        // TODO: figure out the event type for Submit.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (event.type === 'submit' && Boolean(event.submitter)) {
            return;
        }
        if (!target || (!isTrusted && !allowUntrustedEvents)) {
            return;
        }
        const nodeTarget = target;
        if (event.type === 'click') {
            return {
                type: event.type,
                selector: getSelector(nodeTarget),
            };
        }
        if (event.type === 'submit') {
            return {
                type: event.type,
                selector: getSelector(nodeTarget),
            };
        }
        if (event.type === 'change') {
            // Currently we support a Change event only for the select element.
            // Perhaps eventually we need to create a select-change event to
            // capture select-specific logic.
            if (nodeTarget.nodeName.toLowerCase() !== 'select') {
                return;
            }
            return { type: event.type, selector: getSelector(nodeTarget), value: target.value };
        }
        if (event.type === 'keydown' || event.type === 'keyup') {
            const keyboardEvent = event;
            return {
                type: event.type,
                altKey: keyboardEvent.altKey,
                ctrlKey: keyboardEvent.ctrlKey,
                key: keyboardEvent.key,
                metaKey: keyboardEvent.metaKey,
                shiftKey: keyboardEvent.shiftKey,
            };
        }
        return;
    };
    exports.createStepFromEvent = createStepFromEvent;
    let lastStep;
    const recorderEventListener = (event) => {
        const target = event.target;
        log(target.nodeName, target.type);
        const step = createStepFromEvent(event, event.target, event.isTrusted);
        if (!step) {
            return;
        }
        // If you click on a select option both the change event and click event fire.
        // Therefore, we ignore the click.
        if (lastStep && step.type === 'click' && lastStep.type === 'change' && step.selector === lastStep.selector) {
            return;
        }
        window.addStep(JSON.stringify(step));
        lastStep = step;
    };
    if (!window._recorderEventListener) {
        log('Setting _recorderEventListener');
        window.addEventListener('click', recorderEventListener, true);
        window.addEventListener('submit', recorderEventListener, true);
        window.addEventListener('change', recorderEventListener, true);
        window.addEventListener('keydown', recorderEventListener, true);
        window.addEventListener('keyup', recorderEventListener, true);
        window._recorderEventListener = recorderEventListener;
    }
    else {
        log('_recorderEventListener was already installed');
    }
    const teardown = () => {
        window.removeEventListener('click', recorderEventListener, true);
        window.removeEventListener('submit', recorderEventListener, true);
        window.removeEventListener('change', recorderEventListener, true);
        window.removeEventListener('keydown', recorderEventListener, true);
        window.removeEventListener('keyup', recorderEventListener, true);
        delete window._recorderEventListener;
    };
    exports.teardown = teardown;
    const RELEVANT_ROLES_FOR_ARIA_SELECTORS = new Set(['button', 'link', 'textbox', 'checkbox', 'combobox', 'option']);
    const getSelector = (node) => {
        let axNode = node;
        while (axNode) {
            const role = bindings.getAccessibleRole(axNode);
            const name = bindings.getAccessibleName(axNode);
            log('Getting a11y role and name for a node', role, name, axNode);
            if (name && RELEVANT_ROLES_FOR_ARIA_SELECTORS.has(role)) {
                return `aria/${name}`;
            }
            axNode = axNode.parentNode;
        }
        return cssPath(node);
    };
    exports.getSelector = getSelector;
    const nodeNameInCorrectCase = (node) => {
        // If there is no local name, it's case sensitive
        if (!('localName' in node)) {
            return node.nodeName;
        }
        const element = node;
        // If the names are different lengths, there is a prefix and it's case sensitive
        if (element.localName.length !== element.nodeName.length) {
            return element.nodeName;
        }
        // Return the localname, which will be case insensitive if its an html node
        return element.localName;
    };
    const cssPathStep = function (node, optimized, isTargetNode) {
        if (!(node instanceof Element)) {
            return null;
        }
        const id = node.id;
        if (optimized) {
            if (id) {
                return new PathStep(idSelector(id), true);
            }
            const nodeNameLower = node.nodeName.toLowerCase();
            if (nodeNameLower === 'body' || nodeNameLower === 'head' || nodeNameLower === 'html') {
                return new PathStep(nodeNameInCorrectCase(node), true);
            }
        }
        const nodeName = nodeNameInCorrectCase(node);
        if (id) {
            return new PathStep(nodeName + idSelector(id), true);
        }
        const parent = node.parentNode;
        if (!parent) {
            return new PathStep(nodeName, true);
        }
        function prefixedElementClassNames(node) {
            const classAttribute = node.getAttribute('class');
            if (!classAttribute) {
                return [];
            }
            return classAttribute.split(/\s+/g).filter(Boolean).map(function (name) {
                // The prefix is required to store "__proto__" in a object-based map.
                return '$' + name;
            });
        }
        function idSelector(id) {
            return '#' + CSS.escape(id);
        }
        const prefixedOwnClassNamesArray = prefixedElementClassNames(node);
        let needsClassNames = false;
        let needsNthChild = false;
        let ownIndex = -1;
        let elementIndex = -1;
        const siblings = parent.children;
        for (let i = 0; siblings && (ownIndex === -1 || !needsNthChild) && i < siblings.length; ++i) {
            const sibling = siblings[i];
            elementIndex += 1;
            if (sibling === node) {
                ownIndex = elementIndex;
                continue;
            }
            if (needsNthChild) {
                continue;
            }
            if (nodeNameInCorrectCase(sibling) !== nodeName) {
                continue;
            }
            needsClassNames = true;
            const ownClassNames = new Set(prefixedOwnClassNamesArray);
            if (!ownClassNames.size) {
                needsNthChild = true;
                continue;
            }
            const siblingClassNamesArray = prefixedElementClassNames(sibling);
            for (let j = 0; j < siblingClassNamesArray.length; ++j) {
                const siblingClass = siblingClassNamesArray[j];
                if (!ownClassNames.has(siblingClass)) {
                    continue;
                }
                ownClassNames.delete(siblingClass);
                if (!ownClassNames.size) {
                    needsNthChild = true;
                    break;
                }
            }
        }
        let result = nodeName;
        if (isTargetNode && nodeName.toLowerCase() === 'input' && node.getAttribute('type') && !node.getAttribute('id') &&
            !node.getAttribute('class')) {
            result += '[type=' + CSS.escape((node.getAttribute('type')) || '') + ']';
        }
        if (needsNthChild) {
            result += ':nth-child(' + (ownIndex + 1) + ')';
        }
        else if (needsClassNames) {
            for (const prefixedName of prefixedOwnClassNamesArray) {
                result += '.' + CSS.escape(prefixedName.slice(1));
            }
        }
        return new PathStep(result, false);
    };
    const cssPath = function (node, optimized) {
        const steps = [];
        let contextNode = node;
        while (contextNode) {
            const step = cssPathStep(contextNode, Boolean(optimized), contextNode === node);
            if (!step) {
                break;
            } // Error - bail out early.
            steps.push(step);
            if (step.optimized) {
                break;
            }
            contextNode = contextNode.parentNode;
        }
        steps.reverse();
        return steps.join(' > ');
    };
    class PathStep {
        value;
        optimized;
        constructor(value, optimized) {
            this.value = value;
            this.optimized = optimized || false;
        }
        toString() {
            return this.value;
        }
    }
}
//# sourceMappingURL=RecordingClient.js.map