// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties, @typescript-eslint/no-explicit-any */
function getNodeData(node) {
    return node
        .data;
}
function setNodeData(node, value) {
    node.data = value;
}
export class Fragment {
    _element;
    _elementsById;
    constructor(element) {
        this._element = element;
        this._elementsById = new Map();
    }
    element() {
        return this._element;
    }
    $(elementId) {
        return this._elementsById.get(elementId);
    }
    static build(strings, ...values) {
        return Fragment._render(Fragment._template(strings), values);
    }
    static cached(strings, ...values) {
        let template = _templateCache.get(strings);
        if (!template) {
            template = Fragment._template(strings);
            _templateCache.set(strings, template);
        }
        return Fragment._render(template, values);
    }
    static _template(strings) {
        let html = '';
        let insideText = true;
        for (let i = 0; i < strings.length - 1; i++) {
            html += strings[i];
            const close = strings[i].lastIndexOf('>');
            const open = strings[i].indexOf('<', close + 1);
            if (close !== -1 && open === -1) {
                insideText = true;
            }
            else if (open !== -1) {
                insideText = false;
            }
            html += insideText ? _textMarker : _attributeMarker(i);
        }
        html += strings[strings.length - 1];
        const template = document.createElement('template');
        template.innerHTML = html;
        const walker = template.ownerDocument.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null, false);
        let valueIndex = 0;
        const emptyTextNodes = [];
        const binds = [];
        const nodesToMark = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeType === Node.ELEMENT_NODE && node.hasAttributes()) {
                if (node.hasAttribute('$')) {
                    nodesToMark.push(node);
                    binds.push({ replaceNodeIndex: undefined, attr: undefined, elementId: node.getAttribute('$') || '' });
                    node.removeAttribute('$');
                }
                const attributesToRemove = [];
                for (let i = 0; i < node.attributes.length; i++) {
                    const name = node.attributes[i].name;
                    if (!_attributeMarkerRegex.test(name) && !_attributeMarkerRegex.test(node.attributes[i].value)) {
                        continue;
                    }
                    attributesToRemove.push(name);
                    nodesToMark.push(node);
                    const attr = {
                        index: valueIndex,
                        names: name.split(_attributeMarkerRegex),
                        values: node.attributes[i].value.split(_attributeMarkerRegex),
                    };
                    valueIndex += attr.names.length - 1;
                    valueIndex += attr.values.length - 1;
                    const bind = {
                        elementId: undefined,
                        replaceNodeIndex: undefined,
                        attr,
                    };
                    binds.push(bind);
                }
                for (let i = 0; i < attributesToRemove.length; i++) {
                    node.removeAttribute(attributesToRemove[i]);
                }
            }
            if (node.nodeType === Node.TEXT_NODE && getNodeData(node).indexOf(_textMarker) !== -1) {
                const texts = getNodeData(node).split(_textMarkerRegex);
                setNodeData(node, texts[texts.length - 1]);
                const parentNode = node.parentNode;
                for (let i = 0; i < texts.length - 1; i++) {
                    if (texts[i]) {
                        parentNode.insertBefore(document.createTextNode(texts[i]), node);
                    }
                    const nodeToReplace = document.createElement('span');
                    nodesToMark.push(nodeToReplace);
                    binds.push({ attr: undefined, elementId: undefined, replaceNodeIndex: valueIndex++ });
                    parentNode.insertBefore(nodeToReplace, node);
                }
            }
            if (node.nodeType === Node.TEXT_NODE &&
                (!node.previousSibling || node.previousSibling.nodeType === Node.ELEMENT_NODE) &&
                (!node.nextSibling || node.nextSibling.nodeType === Node.ELEMENT_NODE) && /^\s*$/.test(getNodeData(node))) {
                emptyTextNodes.push(node);
            }
        }
        for (let i = 0; i < nodesToMark.length; i++) {
            nodesToMark[i].classList.add(_class(i));
        }
        for (const emptyTextNode of emptyTextNodes) {
            emptyTextNode.remove();
        }
        return { template, binds };
    }
    static _render(template, values) {
        const content = template.template.ownerDocument.importNode(template.template.content, true);
        const resultElement = (content.firstChild === content.lastChild ? content.firstChild : content);
        const result = new Fragment(resultElement);
        const boundElements = [];
        for (let i = 0; i < template.binds.length; i++) {
            const className = _class(i);
            const element = content.querySelector('.' + className);
            element.classList.remove(className);
            boundElements.push(element);
        }
        for (let bindIndex = 0; bindIndex < template.binds.length; bindIndex++) {
            const bind = template.binds[bindIndex];
            const element = boundElements[bindIndex];
            if (bind.elementId !== undefined) {
                result._elementsById.set(bind.elementId, element);
            }
            else if (bind.replaceNodeIndex !== undefined) {
                const value = values[bind.replaceNodeIndex];
                element.parentNode.replaceChild(this._nodeForValue(value), element);
            }
            else if (bind.attr !== undefined) {
                if (bind.attr.names.length === 2 && bind.attr.values.length === 1 &&
                    typeof values[bind.attr.index] === 'function') {
                    values[bind.attr.index].call(null, element);
                }
                else {
                    let name = bind.attr.names[0];
                    for (let i = 1; i < bind.attr.names.length; i++) {
                        name += values[bind.attr.index + i - 1];
                        name += bind.attr.names[i];
                    }
                    if (name) {
                        let value = bind.attr.values[0];
                        for (let i = 1; i < bind.attr.values.length; i++) {
                            value += values[bind.attr.index + bind.attr.names.length - 1 + i - 1];
                            value += bind.attr.values[i];
                        }
                        element.setAttribute(name, value);
                    }
                }
            }
            else {
                throw new Error('Unexpected bind');
            }
        }
        return result;
    }
    static _nodeForValue(value) {
        if (value instanceof Node) {
            return value;
        }
        if (value instanceof Fragment) {
            return value._element;
        }
        if (Array.isArray(value)) {
            const node = document.createDocumentFragment();
            for (const v of value) {
                node.appendChild(this._nodeForValue(v));
            }
            return node;
        }
        return document.createTextNode(String(value));
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _textMarker = '{{template-text}}';
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _textMarkerRegex = /{{template-text}}/;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const _attributeMarker = (index) => 'template-attribute' + index;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _attributeMarkerRegex = /template-attribute\d+/;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _class = (index) => 'template-class-' + index;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _templateCache = new Map();
export const html = (strings, ...vararg) => {
    return Fragment.cached(strings, ...vararg).element();
};
//# sourceMappingURL=Fragment.js.map