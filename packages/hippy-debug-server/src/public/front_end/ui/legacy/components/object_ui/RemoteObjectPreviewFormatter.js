// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
    * @description Text shown in the console object preview. Shown when the user is inspecting a
    * JavaScript object and there are multiple empty properties on the object (x =
    * 'times'/'multiply').
    * @example {3} PH1
    */
    emptyD: 'empty × {PH1}',
    /**
    * @description Shown when the user is inspecting a JavaScript object in the console and there is
    * an empty property on the object..
    */
    empty: 'empty',
    /**
    * @description Text shown when the user is inspecting a JavaScript object, but of the properties
    * is not immediately available because it is a JavaScript 'getter' function, which means we have
    * to run some code first in order to compute this property.
    */
    thePropertyIsComputedWithAGetter: 'The property is computed with a getter',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/object_ui/RemoteObjectPreviewFormatter.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class RemoteObjectPreviewFormatter {
    static _objectPropertyComparator(a, b) {
        return sortValue(a) - sortValue(b);
        function sortValue(property) {
            // TODO(einbinder) expose whether preview properties are actually internal.
            if (property.name === "[[PromiseState]]" /* PromiseState */) {
                return 1;
            }
            if (property.name === "[[PromiseResult]]" /* PromiseResult */) {
                return 2;
            }
            if (property.name === "[[GeneratorState]]" /* GeneratorState */ || property.name === "[[PrimitiveValue]]" /* PrimitiveValue */) {
                return 3;
            }
            if (property.type !== "function" /* Function */ && !property.name.startsWith('#')) {
                return 4;
            }
            return 5;
        }
    }
    appendObjectPreview(parentElement, preview, isEntry) {
        const description = preview.description;
        const subTypesWithoutValuePreview = new Set([
            "arraybuffer" /* Arraybuffer */,
            "dataview" /* Dataview */,
            "error" /* Error */,
            "null" /* Null */,
            "regexp" /* Regexp */,
            "webassemblymemory" /* Webassemblymemory */,
            'internal#entry',
            'trustedtype',
        ]);
        if (preview.type !== "object" /* Object */ ||
            (preview.subtype && subTypesWithoutValuePreview.has(preview.subtype)) || isEntry) {
            parentElement.appendChild(
            // @ts-ignore https://bugs.chromium.org/p/v8/issues/detail?id=11143
            this.renderPropertyPreview(preview.type, preview.subtype, preview.className, description));
            return;
        }
        const isArrayOrTypedArray = preview.subtype === "array" /* Array */
            // @ts-ignore https://bugs.chromium.org/p/v8/issues/detail?id=11143
            || preview.subtype === 'typedarray';
        if (description) {
            let text;
            if (isArrayOrTypedArray) {
                const arrayLength = SDK.RemoteObject.RemoteObject.arrayLength(preview);
                const arrayLengthText = arrayLength > 1 ? ('(' + arrayLength + ')') : '';
                const arrayName = SDK.RemoteObject.RemoteObject.arrayNameFromDescription(description);
                text = arrayName === 'Array' ? arrayLengthText : (arrayName + arrayLengthText);
            }
            else {
                const hideDescription = description === 'Object';
                text = hideDescription ? '' : description;
            }
            if (text.length > 0) {
                parentElement.createChild('span', 'object-description').textContent = text + '\xA0';
            }
        }
        const propertiesElement = parentElement.createChild('span', 'object-properties-preview');
        UI.UIUtils.createTextChild(propertiesElement, isArrayOrTypedArray ? '[' : '{');
        if (preview.entries) {
            this._appendEntriesPreview(propertiesElement, preview);
        }
        else if (isArrayOrTypedArray) {
            this._appendArrayPropertiesPreview(propertiesElement, preview);
        }
        else {
            this._appendObjectPropertiesPreview(propertiesElement, preview);
        }
        if (preview.overflow) {
            const ellipsisText = propertiesElement.textContent && propertiesElement.textContent.length > 1 ? ',\xA0…' : '…';
            propertiesElement.createChild('span').textContent = ellipsisText;
        }
        UI.UIUtils.createTextChild(propertiesElement, isArrayOrTypedArray ? ']' : '}');
    }
    _abbreviateFullQualifiedClassName(description) {
        const abbreviatedDescription = description.split('.');
        for (let i = 0; i < abbreviatedDescription.length - 1; ++i) {
            abbreviatedDescription[i] = Platform.StringUtilities.trimMiddle(abbreviatedDescription[i], 3);
        }
        return abbreviatedDescription.join('.');
    }
    _appendObjectPropertiesPreview(parentElement, preview) {
        const properties = preview.properties.filter(p => p.type !== 'accessor')
            .sort(RemoteObjectPreviewFormatter._objectPropertyComparator);
        for (let i = 0; i < properties.length; ++i) {
            if (i > 0) {
                UI.UIUtils.createTextChild(parentElement, ', ');
            }
            const property = properties[i];
            const name = property.name;
            // Internal properties are given special formatting, e.g. Promises `<rejected>: 123`.
            // @ts-ignore https://bugs.chromium.org/p/v8/issues/detail?id=11143
            if (preview.subtype === 'promise' && name === "[[PromiseState]]" /* PromiseState */) {
                parentElement.appendChild(this._renderDisplayName('<' + property.value + '>'));
                const nextProperty = i + 1 < properties.length ? properties[i + 1] : null;
                if (nextProperty && nextProperty.name === "[[PromiseResult]]" /* PromiseResult */) {
                    if (property.value !== 'pending') {
                        UI.UIUtils.createTextChild(parentElement, ': ');
                        parentElement.appendChild(this._renderPropertyPreviewOrAccessor([nextProperty]));
                    }
                    i++;
                }
            }
            else if (preview.subtype === 'generator' && name === "[[GeneratorState]]" /* GeneratorState */) {
                parentElement.appendChild(this._renderDisplayName('<' + property.value + '>'));
            }
            else if (name === "[[PrimitiveValue]]" /* PrimitiveValue */) {
                parentElement.appendChild(this._renderPropertyPreviewOrAccessor([property]));
            }
            else {
                parentElement.appendChild(this._renderDisplayName(name));
                UI.UIUtils.createTextChild(parentElement, ': ');
                parentElement.appendChild(this._renderPropertyPreviewOrAccessor([property]));
            }
        }
    }
    _appendArrayPropertiesPreview(parentElement, preview) {
        const arrayLength = SDK.RemoteObject.RemoteObject.arrayLength(preview);
        const indexProperties = preview.properties.filter(p => toArrayIndex(p.name) !== -1).sort(arrayEntryComparator);
        const otherProperties = preview.properties.filter(p => toArrayIndex(p.name) === -1)
            .sort(RemoteObjectPreviewFormatter._objectPropertyComparator);
        function arrayEntryComparator(a, b) {
            return toArrayIndex(a.name) - toArrayIndex(b.name);
        }
        function toArrayIndex(name) {
            // We need to differentiate between property accesses and array index accesses
            // Therefore, we need to make sure we are always dealing with an i32, in the event
            // that a particular property also exists, but as the literal string. For example
            // for {["1.5"]: true}, we don't want to return `true` if we provide `1.5` as the
            // value, but only want to do that if we provide `"1.5"`.
            const index = Number(name) >>> 0;
            if (String(index) === name && index < arrayLength) {
                return index;
            }
            return -1;
        }
        // Gaps can be shown when all properties are guaranteed to be in the preview.
        const canShowGaps = !preview.overflow;
        let lastNonEmptyArrayIndex = -1;
        let elementsAdded = false;
        for (let i = 0; i < indexProperties.length; ++i) {
            if (elementsAdded) {
                UI.UIUtils.createTextChild(parentElement, ', ');
            }
            const property = indexProperties[i];
            const index = toArrayIndex(property.name);
            if (canShowGaps && index - lastNonEmptyArrayIndex > 1) {
                appendUndefined(index);
                UI.UIUtils.createTextChild(parentElement, ', ');
            }
            if (!canShowGaps && i !== index) {
                parentElement.appendChild(this._renderDisplayName(property.name));
                UI.UIUtils.createTextChild(parentElement, ': ');
            }
            parentElement.appendChild(this._renderPropertyPreviewOrAccessor([property]));
            lastNonEmptyArrayIndex = index;
            elementsAdded = true;
        }
        if (canShowGaps && arrayLength - lastNonEmptyArrayIndex > 1) {
            if (elementsAdded) {
                UI.UIUtils.createTextChild(parentElement, ', ');
            }
            appendUndefined(arrayLength);
        }
        for (let i = 0; i < otherProperties.length; ++i) {
            if (elementsAdded) {
                UI.UIUtils.createTextChild(parentElement, ', ');
            }
            const property = otherProperties[i];
            parentElement.appendChild(this._renderDisplayName(property.name));
            UI.UIUtils.createTextChild(parentElement, ': ');
            parentElement.appendChild(this._renderPropertyPreviewOrAccessor([property]));
            elementsAdded = true;
        }
        function appendUndefined(index) {
            const span = parentElement.createChild('span', 'object-value-undefined');
            const count = index - lastNonEmptyArrayIndex - 1;
            // TODO(l10n): Plurals. Tricky because of a bug in the presubmit check for plurals.
            span.textContent = count !== 1 ? i18nString(UIStrings.emptyD, { PH1: count }) : i18nString(UIStrings.empty);
            elementsAdded = true;
        }
    }
    _appendEntriesPreview(parentElement, preview) {
        if (!preview.entries) {
            return;
        }
        for (let i = 0; i < preview.entries.length; ++i) {
            if (i > 0) {
                UI.UIUtils.createTextChild(parentElement, ', ');
            }
            const entry = preview.entries[i];
            if (entry.key) {
                this.appendObjectPreview(parentElement, entry.key, true /* isEntry */);
                UI.UIUtils.createTextChild(parentElement, ' => ');
            }
            this.appendObjectPreview(parentElement, entry.value, true /* isEntry */);
        }
    }
    _renderDisplayName(name) {
        const result = document.createElement('span');
        result.classList.add('name');
        const needsQuotes = /^\s|\s$|^$|\n/.test(name);
        result.textContent = needsQuotes ? '"' + name.replace(/\n/g, '\u21B5') + '"' : name;
        return result;
    }
    _renderPropertyPreviewOrAccessor(propertyPath) {
        const property = propertyPath[propertyPath.length - 1];
        if (!property) {
            throw new Error('Could not find property');
        }
        return this.renderPropertyPreview(property.type, property.subtype, property.name, property.value);
    }
    renderPropertyPreview(type, subtype, className, description) {
        const span = document.createElement('span');
        span.classList.add('object-value-' + (subtype || type));
        description = description || '';
        if (type === 'accessor') {
            span.textContent = '(...)';
            UI.Tooltip.Tooltip.install(span, i18nString(UIStrings.thePropertyIsComputedWithAGetter));
            return span;
        }
        if (type === 'function') {
            span.textContent = '\u0192';
            return span;
        }
        if (type === 'object' && subtype === 'trustedtype' && className) {
            createSpanForTrustedType(span, description, className);
            return span;
        }
        if (type === 'object' && subtype === 'node' && description) {
            createSpansForNodeTitle(span, description);
            return span;
        }
        if (type === 'string') {
            UI.UIUtils.createTextChildren(span, JSON.stringify(description));
            return span;
        }
        if (type === 'object' && !subtype) {
            let preview = this._abbreviateFullQualifiedClassName(description);
            if (preview === 'Object') {
                preview = '{…}';
            }
            span.textContent = preview;
            UI.Tooltip.Tooltip.install(span, description);
            return span;
        }
        span.textContent = description;
        return span;
    }
}
export const createSpansForNodeTitle = function (container, nodeTitle) {
    const match = nodeTitle.match(/([^#.]+)(#[^.]+)?(\..*)?/);
    if (!match) {
        return;
    }
    container.createChild('span', 'webkit-html-tag-name').textContent = match[1];
    if (match[2]) {
        container.createChild('span', 'webkit-html-attribute-value').textContent = match[2];
    }
    if (match[3]) {
        container.createChild('span', 'webkit-html-attribute-name').textContent = match[3];
    }
};
export const createSpanForTrustedType = function (span, description, className) {
    UI.UIUtils.createTextChildren(span, `${className} `);
    const trustedContentSpan = document.createElement('span');
    trustedContentSpan.classList.add('object-value-string');
    UI.UIUtils.createTextChildren(trustedContentSpan, '"', description.replace(/\n/g, '\u21B5'), '"');
    span.appendChild(trustedContentSpan);
};
//# sourceMappingURL=RemoteObjectPreviewFormatter.js.map