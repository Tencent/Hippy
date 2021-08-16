// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as DOMExtension from '../../core/dom_extension/dom_extension.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as ARIAUtils from './ARIAUtils.js';
import { Dialog } from './Dialog.js';
import { Size } from './Geometry.js';
import { GlassPane, PointerEventsBehavior, SizeBehavior } from './GlassPane.js';
import { Icon } from './Icon.js';
import { KeyboardShortcut } from './KeyboardShortcut.js';
import * as ThemeSupport from './theme_support/theme_support.js'; // eslint-disable-line rulesdir/es_modules_import
import { Toolbar } from './Toolbar.js'; // eslint-disable-line no-unused-vars
import { Tooltip } from './Tooltip.js';
import { createShadowRootWithCoreStyles } from './utils/create-shadow-root-with-core-styles.js';
import { focusChanged } from './utils/focus-changed.js';
import { injectCoreStyles } from './utils/inject-core-styles.js';
import { measuredScrollbarWidth } from './utils/measured-scrollbar-width.js';
import { registerCustomElement } from './utils/register-custom-element.js';
const UIStrings = {
    /**
    *@description label to open link externally
    */
    openInNewTab: 'Open in new tab',
    /**
    *@description label to copy link address
    */
    copyLinkAddress: 'Copy link address',
    /**
    *@description label to copy file name
    */
    copyFileName: 'Copy file name',
    /**
    *@description label for the profiler control button
    */
    anotherProfilerIsAlreadyActive: 'Another profiler is already active',
    /**
    *@description Text in UIUtils
    */
    promiseResolvedAsync: 'Promise resolved (async)',
    /**
    *@description Text in UIUtils
    */
    promiseRejectedAsync: 'Promise rejected (async)',
    /**
    *@description Text in UIUtils
    *@example {Promise} PH1
    */
    sAsync: '{PH1} (async)',
    /**
    *@description Text for the title of asynchronous function calls group in Call Stack
    */
    asyncCall: 'Async Call',
    /**
    *@description Text for the name of anonymous functions
    */
    anonymous: '(anonymous)',
    /**
    *@description Text to close something
    */
    close: 'Close',
    /**
    *@description Text on a button for message dialog
    */
    ok: 'OK',
    /**
    *@description Text to cancel something
    */
    cancel: 'Cancel',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/UIUtils.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export const highlightedSearchResultClassName = 'highlighted-search-result';
export const highlightedCurrentSearchResultClassName = 'current-search-result';
export function installDragHandle(element, elementDragStart, elementDrag, elementDragEnd, cursor, hoverCursor, startDelay) {
    function onMouseDown(event) {
        const dragHandler = new DragHandler();
        const dragStart = () => dragHandler.elementDragStart(element, elementDragStart, elementDrag, elementDragEnd, cursor, event);
        if (startDelay) {
            startTimer = window.setTimeout(dragStart, startDelay);
        }
        else {
            dragStart();
        }
    }
    function onMouseUp() {
        if (startTimer) {
            window.clearTimeout(startTimer);
        }
        startTimer = null;
    }
    let startTimer;
    element.addEventListener('mousedown', onMouseDown, false);
    if (startDelay) {
        element.addEventListener('mouseup', onMouseUp, false);
    }
    if (hoverCursor !== null) {
        element.style.cursor = hoverCursor || cursor || '';
    }
}
export function elementDragStart(targetElement, elementDragStart, elementDrag, elementDragEnd, cursor, event) {
    const dragHandler = new DragHandler();
    dragHandler.elementDragStart(targetElement, elementDragStart, elementDrag, elementDragEnd, cursor, event);
}
class DragHandler {
    _glassPaneInUse;
    _elementDraggingEventListener;
    _elementEndDraggingEventListener;
    _dragEventsTargetDocument;
    _dragEventsTargetDocumentTop;
    _restoreCursorAfterDrag;
    constructor() {
        this._elementDragMove = this._elementDragMove.bind(this);
        this._elementDragEnd = this._elementDragEnd.bind(this);
        this._mouseOutWhileDragging = this._mouseOutWhileDragging.bind(this);
    }
    _createGlassPane() {
        this._glassPaneInUse = true;
        if (!DragHandler._glassPaneUsageCount++) {
            DragHandler._glassPane = new GlassPane();
            DragHandler._glassPane.setPointerEventsBehavior(PointerEventsBehavior.BlockedByGlassPane);
            if (DragHandler._documentForMouseOut) {
                DragHandler._glassPane.show(DragHandler._documentForMouseOut);
            }
        }
    }
    _disposeGlassPane() {
        if (!this._glassPaneInUse) {
            return;
        }
        this._glassPaneInUse = false;
        if (--DragHandler._glassPaneUsageCount) {
            return;
        }
        if (DragHandler._glassPane) {
            DragHandler._glassPane.hide();
            DragHandler._glassPane = null;
        }
        DragHandler._documentForMouseOut = null;
        DragHandler._rootForMouseOut = null;
    }
    elementDragStart(targetElement, elementDragStart, elementDrag, elementDragEnd, cursor, ev) {
        const event = ev;
        // Only drag upon left button. Right will likely cause a context menu. So will ctrl-click on mac.
        if (event.button || (Host.Platform.isMac() && event.ctrlKey)) {
            return;
        }
        if (this._elementDraggingEventListener) {
            return;
        }
        if (elementDragStart && !elementDragStart(event)) {
            return;
        }
        const targetDocument = (event.target instanceof Node && event.target.ownerDocument);
        this._elementDraggingEventListener = elementDrag;
        this._elementEndDraggingEventListener = elementDragEnd;
        console.assert((DragHandler._documentForMouseOut || targetDocument) === targetDocument, 'Dragging on multiple documents.');
        DragHandler._documentForMouseOut = targetDocument;
        DragHandler._rootForMouseOut = event.target instanceof Node && event.target.getRootNode() || null;
        this._dragEventsTargetDocument = targetDocument;
        try {
            if (targetDocument.defaultView) {
                this._dragEventsTargetDocumentTop = targetDocument.defaultView.top.document;
            }
        }
        catch (e) {
            this._dragEventsTargetDocumentTop = this._dragEventsTargetDocument;
        }
        targetDocument.addEventListener('mousemove', this._elementDragMove, true);
        targetDocument.addEventListener('mouseup', this._elementDragEnd, true);
        DragHandler._rootForMouseOut &&
            DragHandler._rootForMouseOut.addEventListener('mouseout', this._mouseOutWhileDragging, { capture: true });
        if (this._dragEventsTargetDocumentTop && targetDocument !== this._dragEventsTargetDocumentTop) {
            this._dragEventsTargetDocumentTop.addEventListener('mouseup', this._elementDragEnd, true);
        }
        const targetHtmlElement = targetElement;
        if (typeof cursor === 'string') {
            this._restoreCursorAfterDrag = restoreCursor.bind(this, targetHtmlElement.style.cursor);
            targetHtmlElement.style.cursor = cursor;
            targetDocument.body.style.cursor = cursor;
        }
        function restoreCursor(oldCursor) {
            targetDocument.body.style.removeProperty('cursor');
            targetHtmlElement.style.cursor = oldCursor;
            this._restoreCursorAfterDrag = undefined;
        }
        event.preventDefault();
    }
    _mouseOutWhileDragging() {
        this._unregisterMouseOutWhileDragging();
        this._createGlassPane();
    }
    _unregisterMouseOutWhileDragging() {
        if (!DragHandler._rootForMouseOut) {
            return;
        }
        DragHandler._rootForMouseOut.removeEventListener('mouseout', this._mouseOutWhileDragging, { capture: true });
    }
    _unregisterDragEvents() {
        if (!this._dragEventsTargetDocument) {
            return;
        }
        this._dragEventsTargetDocument.removeEventListener('mousemove', this._elementDragMove, true);
        this._dragEventsTargetDocument.removeEventListener('mouseup', this._elementDragEnd, true);
        if (this._dragEventsTargetDocumentTop && this._dragEventsTargetDocument !== this._dragEventsTargetDocumentTop) {
            this._dragEventsTargetDocumentTop.removeEventListener('mouseup', this._elementDragEnd, true);
        }
        delete this._dragEventsTargetDocument;
        delete this._dragEventsTargetDocumentTop;
    }
    _elementDragMove(event) {
        if (event.buttons !== 1) {
            this._elementDragEnd(event);
            return;
        }
        if (this._elementDraggingEventListener && this._elementDraggingEventListener(event)) {
            this._cancelDragEvents(event);
        }
    }
    _cancelDragEvents(_event) {
        this._unregisterDragEvents();
        this._unregisterMouseOutWhileDragging();
        if (this._restoreCursorAfterDrag) {
            this._restoreCursorAfterDrag();
        }
        this._disposeGlassPane();
        delete this._elementDraggingEventListener;
        delete this._elementEndDraggingEventListener;
    }
    _elementDragEnd(event) {
        const elementDragEnd = this._elementEndDraggingEventListener;
        this._cancelDragEvents(event);
        event.preventDefault();
        if (elementDragEnd) {
            elementDragEnd(event);
        }
    }
    static _glassPaneUsageCount = 0;
    static _glassPane = null;
    static _documentForMouseOut = null;
    static _rootForMouseOut = null;
}
export function isBeingEdited(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
        return false;
    }
    const element = node;
    if (element.classList.contains('text-prompt') || element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        return true;
    }
    if (!elementsBeingEdited.size) {
        return false;
    }
    let currentElement = element;
    while (currentElement) {
        if (elementsBeingEdited.has(element)) {
            return true;
        }
        currentElement = currentElement.parentElementOrShadowHost();
    }
    return false;
}
export function isEditing() {
    if (elementsBeingEdited.size) {
        return true;
    }
    const focused = document.deepActiveElement();
    if (!focused) {
        return false;
    }
    return focused.classList.contains('text-prompt') || focused.nodeName === 'INPUT' || focused.nodeName === 'TEXTAREA';
}
export function markBeingEdited(element, value) {
    if (value) {
        if (elementsBeingEdited.has(element)) {
            return false;
        }
        element.classList.add('being-edited');
        elementsBeingEdited.add(element);
    }
    else {
        if (!elementsBeingEdited.has(element)) {
            return false;
        }
        element.classList.remove('being-edited');
        elementsBeingEdited.delete(element);
    }
    return true;
}
const elementsBeingEdited = new Set();
// Avoids Infinity, NaN, and scientific notation (e.g. 1e20), see crbug.com/81165.
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _numberRegex = /^(-?(?:\d+(?:\.\d+)?|\.\d+))$/;
export const StyleValueDelimiters = ' \xA0\t\n"\':;,/()';
export function getValueModificationDirection(event) {
    let direction = null;
    if (event.type === 'wheel') {
        // When shift is pressed while spinning mousewheel, delta comes as wheelDeltaX.
        const wheelEvent = event;
        if (wheelEvent.deltaY < 0 || wheelEvent.deltaX < 0) {
            direction = 'Up';
        }
        else if (wheelEvent.deltaY > 0 || wheelEvent.deltaX > 0) {
            direction = 'Down';
        }
    }
    else {
        const keyEvent = event;
        if (keyEvent.key === 'ArrowUp' || keyEvent.key === 'PageUp') {
            direction = 'Up';
        }
        else if (keyEvent.key === 'ArrowDown' || keyEvent.key === 'PageDown') {
            direction = 'Down';
        }
    }
    return direction;
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function _modifiedHexValue(hexString, event) {
    const direction = getValueModificationDirection(event);
    if (!direction) {
        return null;
    }
    const mouseEvent = event;
    const number = parseInt(hexString, 16);
    if (isNaN(number) || !isFinite(number)) {
        return null;
    }
    const hexStrLen = hexString.length;
    const channelLen = hexStrLen / 3;
    // Colors are either rgb or rrggbb.
    if (channelLen !== 1 && channelLen !== 2) {
        return null;
    }
    // Precision modifier keys work with both mousewheel and up/down keys.
    // When ctrl is pressed, increase R by 1.
    // When shift is pressed, increase G by 1.
    // When alt is pressed, increase B by 1.
    // If no shortcut keys are pressed then increase hex value by 1.
    // Keys can be pressed together to increase RGB channels. e.g trying different shades.
    let delta = 0;
    if (KeyboardShortcut.eventHasCtrlOrMeta(mouseEvent)) {
        delta += Math.pow(16, channelLen * 2);
    }
    if (mouseEvent.shiftKey) {
        delta += Math.pow(16, channelLen);
    }
    if (mouseEvent.altKey) {
        delta += 1;
    }
    if (delta === 0) {
        delta = 1;
    }
    if (direction === 'Down') {
        delta *= -1;
    }
    // Increase hex value by 1 and clamp from 0 ... maxValue.
    const maxValue = Math.pow(16, hexStrLen) - 1;
    const result = Platform.NumberUtilities.clamp(number + delta, 0, maxValue);
    // Ensure the result length is the same as the original hex value.
    let resultString = result.toString(16).toUpperCase();
    for (let i = 0, lengthDelta = hexStrLen - resultString.length; i < lengthDelta; ++i) {
        resultString = '0' + resultString;
    }
    return resultString;
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function _modifiedFloatNumber(number, event, modifierMultiplier) {
    const direction = getValueModificationDirection(event);
    if (!direction) {
        return null;
    }
    const mouseEvent = event;
    // Precision modifier keys work with both mousewheel and up/down keys.
    // When ctrl is pressed, increase by 100.
    // When shift is pressed, increase by 10.
    // When alt is pressed, increase by 0.1.
    // Otherwise increase by 1.
    let delta = 1;
    if (KeyboardShortcut.eventHasCtrlOrMeta(mouseEvent)) {
        delta = 100;
    }
    else if (mouseEvent.shiftKey) {
        delta = 10;
    }
    else if (mouseEvent.altKey) {
        delta = 0.1;
    }
    if (direction === 'Down') {
        delta *= -1;
    }
    if (modifierMultiplier) {
        delta *= modifierMultiplier;
    }
    // Make the new number and constrain it to a precision of 6, this matches numbers the engine returns.
    // Use the Number constructor to forget the fixed precision, so 1.100000 will print as 1.1.
    const result = Number((number + delta).toFixed(6));
    if (!String(result).match(_numberRegex)) {
        return null;
    }
    return result;
}
export function createReplacementString(wordString, event, customNumberHandler) {
    let prefix;
    let suffix;
    let number;
    let replacementString = null;
    let matches = /(.*#)([\da-fA-F]+)(.*)/.exec(wordString);
    if (matches && matches.length) {
        prefix = matches[1];
        suffix = matches[3];
        number = _modifiedHexValue(matches[2], event);
        if (number !== null) {
            replacementString = prefix + number + suffix;
        }
    }
    else {
        matches = /(.*?)(-?(?:\d+(?:\.\d+)?|\.\d+))(.*)/.exec(wordString);
        if (matches && matches.length) {
            prefix = matches[1];
            suffix = matches[3];
            number = _modifiedFloatNumber(parseFloat(matches[2]), event);
            if (number !== null) {
                replacementString =
                    customNumberHandler ? customNumberHandler(prefix, number, suffix) : prefix + number + suffix;
            }
        }
    }
    return replacementString;
}
export function handleElementValueModifications(event, element, finishHandler, suggestionHandler, customNumberHandler) {
    const arrowKeyOrWheelEvent = (event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.type === 'wheel');
    const pageKeyPressed = (event.key === 'PageUp' || event.key === 'PageDown');
    if (!arrowKeyOrWheelEvent && !pageKeyPressed) {
        return false;
    }
    const selection = element.getComponentSelection();
    if (!selection || !selection.rangeCount) {
        return false;
    }
    const selectionRange = selection.getRangeAt(0);
    if (!selectionRange.commonAncestorContainer.isSelfOrDescendant(element)) {
        return false;
    }
    const originalValue = element.textContent;
    const wordRange = DOMExtension.DOMExtension.rangeOfWord(selectionRange.startContainer, selectionRange.startOffset, StyleValueDelimiters, element);
    const wordString = wordRange.toString();
    if (suggestionHandler && suggestionHandler(wordString)) {
        return false;
    }
    const replacementString = createReplacementString(wordString, event, customNumberHandler);
    if (replacementString) {
        const replacementTextNode = document.createTextNode(replacementString);
        wordRange.deleteContents();
        wordRange.insertNode(replacementTextNode);
        const finalSelectionRange = document.createRange();
        finalSelectionRange.setStart(replacementTextNode, 0);
        finalSelectionRange.setEnd(replacementTextNode, replacementString.length);
        selection.removeAllRanges();
        selection.addRange(finalSelectionRange);
        event.handled = true;
        event.preventDefault();
        if (finishHandler) {
            finishHandler(originalValue || '', replacementString);
        }
        return true;
    }
    return false;
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatLocalized(format, substitutions) {
    const formatters = {
        s: (substitution) => substitution,
    };
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function append(a, b) {
        a.appendChild(typeof b === 'string' ? document.createTextNode(b) : b);
        return a;
    }
    return Platform.StringUtilities.format(format, substitutions, formatters, document.createElement('span'), append)
        .formattedResult;
}
export function openLinkExternallyLabel() {
    return i18nString(UIStrings.openInNewTab);
}
export function copyLinkAddressLabel() {
    return i18nString(UIStrings.copyLinkAddress);
}
export function copyFileNameLabel() {
    return i18nString(UIStrings.copyFileName);
}
export function anotherProfilerActiveLabel() {
    return i18nString(UIStrings.anotherProfilerIsAlreadyActive);
}
export function asyncStackTraceLabel(description) {
    if (description) {
        if (description === 'Promise.resolve') {
            return i18nString(UIStrings.promiseResolvedAsync);
        }
        if (description === 'Promise.reject') {
            return i18nString(UIStrings.promiseRejectedAsync);
        }
        return i18nString(UIStrings.sAsync, { PH1: description });
    }
    return i18nString(UIStrings.asyncCall);
}
export function installComponentRootStyles(element) {
    injectCoreStyles(element);
    element.classList.add('platform-' + Host.Platform.platform());
    // Detect overlay scrollbar enable by checking for nonzero scrollbar width.
    if (!Host.Platform.isMac() && measuredScrollbarWidth(element.ownerDocument) === 0) {
        element.classList.add('overlay-scrollbar-enabled');
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function _windowFocused(document, event) {
    if (event.target instanceof Window && event.target.document.nodeType === Node.DOCUMENT_NODE) {
        document.body.classList.remove('inactive');
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
function _windowBlurred(document, event) {
    if (event.target instanceof Window && event.target.document.nodeType === Node.DOCUMENT_NODE) {
        document.body.classList.add('inactive');
    }
}
export class ElementFocusRestorer {
    _element;
    _previous;
    constructor(element) {
        this._element = element;
        this._previous = element.ownerDocument.deepActiveElement();
        element.focus();
    }
    restore() {
        if (!this._element) {
            return;
        }
        if (this._element.hasFocus() && this._previous) {
            this._previous.focus();
        }
        this._previous = null;
        this._element = null;
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function highlightSearchResult(element, offset, length, domChanges) {
    const result = highlightSearchResults(element, [new TextUtils.TextRange.SourceRange(offset, length)], domChanges);
    return result.length ? result[0] : null;
}
export function highlightSearchResults(element, resultRanges, changes) {
    return highlightRangesWithStyleClass(element, resultRanges, highlightedSearchResultClassName, changes);
}
export function runCSSAnimationOnce(element, className) {
    function animationEndCallback() {
        element.classList.remove(className);
        element.removeEventListener('webkitAnimationEnd', animationEndCallback, false);
    }
    if (element.classList.contains(className)) {
        element.classList.remove(className);
    }
    element.addEventListener('webkitAnimationEnd', animationEndCallback, false);
    element.classList.add(className);
}
export function highlightRangesWithStyleClass(element, resultRanges, styleClass, changes) {
    changes = changes || [];
    const highlightNodes = [];
    const textNodes = element.childTextNodes();
    const lineText = textNodes
        .map(function (node) {
        return node.textContent;
    })
        .join('');
    const ownerDocument = element.ownerDocument;
    if (textNodes.length === 0) {
        return highlightNodes;
    }
    const nodeRanges = [];
    let rangeEndOffset = 0;
    for (const textNode of textNodes) {
        const range = new TextUtils.TextRange.SourceRange(rangeEndOffset, textNode.textContent ? textNode.textContent.length : 0);
        rangeEndOffset = range.offset + range.length;
        nodeRanges.push(range);
    }
    let startIndex = 0;
    for (let i = 0; i < resultRanges.length; ++i) {
        const startOffset = resultRanges[i].offset;
        const endOffset = startOffset + resultRanges[i].length;
        while (startIndex < textNodes.length &&
            nodeRanges[startIndex].offset + nodeRanges[startIndex].length <= startOffset) {
            startIndex++;
        }
        let endIndex = startIndex;
        while (endIndex < textNodes.length && nodeRanges[endIndex].offset + nodeRanges[endIndex].length < endOffset) {
            endIndex++;
        }
        if (endIndex === textNodes.length) {
            break;
        }
        const highlightNode = ownerDocument.createElement('span');
        highlightNode.className = styleClass;
        highlightNode.textContent = lineText.substring(startOffset, endOffset);
        const lastTextNode = textNodes[endIndex];
        const lastText = lastTextNode.textContent || '';
        lastTextNode.textContent = lastText.substring(endOffset - nodeRanges[endIndex].offset);
        changes.push({
            node: lastTextNode,
            type: 'changed',
            oldText: lastText,
            newText: lastTextNode.textContent,
            nextSibling: undefined,
            parent: undefined,
        });
        if (startIndex === endIndex && lastTextNode.parentElement) {
            lastTextNode.parentElement.insertBefore(highlightNode, lastTextNode);
            changes.push({
                node: highlightNode,
                type: 'added',
                nextSibling: lastTextNode,
                parent: lastTextNode.parentElement,
                oldText: undefined,
                newText: undefined,
            });
            highlightNodes.push(highlightNode);
            const prefixNode = ownerDocument.createTextNode(lastText.substring(0, startOffset - nodeRanges[startIndex].offset));
            lastTextNode.parentElement.insertBefore(prefixNode, highlightNode);
            changes.push({
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                node: prefixNode,
                type: 'added',
                nextSibling: highlightNode,
                parent: lastTextNode.parentElement,
                oldText: undefined,
                newText: undefined,
            });
        }
        else {
            const firstTextNode = textNodes[startIndex];
            const firstText = firstTextNode.textContent || '';
            const anchorElement = firstTextNode.nextSibling;
            if (firstTextNode.parentElement) {
                firstTextNode.parentElement.insertBefore(highlightNode, anchorElement);
                changes.push({
                    node: highlightNode,
                    type: 'added',
                    nextSibling: anchorElement || undefined,
                    parent: firstTextNode.parentElement,
                    oldText: undefined,
                    newText: undefined,
                });
                highlightNodes.push(highlightNode);
            }
            firstTextNode.textContent = firstText.substring(0, startOffset - nodeRanges[startIndex].offset);
            changes.push({
                node: firstTextNode,
                type: 'changed',
                oldText: firstText,
                newText: firstTextNode.textContent,
                nextSibling: undefined,
                parent: undefined,
            });
            for (let j = startIndex + 1; j < endIndex; j++) {
                const textNode = textNodes[j];
                const text = textNode.textContent;
                textNode.textContent = '';
                changes.push({
                    node: textNode,
                    type: 'changed',
                    oldText: text || undefined,
                    newText: textNode.textContent,
                    nextSibling: undefined,
                    parent: undefined,
                });
            }
        }
        startIndex = endIndex;
        nodeRanges[startIndex].offset = endOffset;
        nodeRanges[startIndex].length = lastTextNode.textContent.length;
    }
    return highlightNodes;
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyDomChanges(domChanges) {
    for (let i = 0, size = domChanges.length; i < size; ++i) {
        const entry = domChanges[i];
        switch (entry.type) {
            case 'added':
                entry.parent.insertBefore(entry.node, entry.nextSibling);
                break;
            case 'changed':
                entry.node.textContent = entry.newText;
                break;
        }
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function revertDomChanges(domChanges) {
    for (let i = domChanges.length - 1; i >= 0; --i) {
        const entry = domChanges[i];
        switch (entry.type) {
            case 'added':
                entry.node.remove();
                break;
            case 'changed':
                entry.node.textContent = entry.oldText;
                break;
        }
    }
}
export function measurePreferredSize(element, containerElement) {
    const oldParent = element.parentElement;
    const oldNextSibling = element.nextSibling;
    containerElement = containerElement || element.ownerDocument.body;
    containerElement.appendChild(element);
    element.positionAt(0, 0);
    const result = element.getBoundingClientRect();
    element.positionAt(undefined, undefined);
    if (oldParent) {
        oldParent.insertBefore(element, oldNextSibling);
    }
    else {
        element.remove();
    }
    return new Size(result.width, result.height);
}
class InvokeOnceHandlers {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _handlers;
    _autoInvoke;
    constructor(autoInvoke) {
        this._handlers = null;
        this._autoInvoke = autoInvoke;
    }
    add(object, method) {
        if (!this._handlers) {
            this._handlers = new Map();
            if (this._autoInvoke) {
                this.scheduleInvoke();
            }
        }
        let methods = this._handlers.get(object);
        if (!methods) {
            methods = new Set();
            this._handlers.set(object, methods);
        }
        methods.add(method);
    }
    scheduleInvoke() {
        if (this._handlers) {
            requestAnimationFrame(this._invoke.bind(this));
        }
    }
    _invoke() {
        const handlers = this._handlers || new Map(); // Make closure happy. This should not be null.
        this._handlers = null;
        for (const [object, methods] of handlers) {
            for (const method of methods) {
                method.call(object);
            }
        }
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _coalescingLevel = 0;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _postUpdateHandlers = null;
export function startBatchUpdate() {
    if (!_coalescingLevel++) {
        _postUpdateHandlers = new InvokeOnceHandlers(false);
    }
}
export function endBatchUpdate() {
    if (--_coalescingLevel) {
        return;
    }
    if (_postUpdateHandlers) {
        _postUpdateHandlers.scheduleInvoke();
        _postUpdateHandlers = null;
    }
}
export function invokeOnceAfterBatchUpdate(object, method) {
    if (!_postUpdateHandlers) {
        _postUpdateHandlers = new InvokeOnceHandlers(true);
    }
    _postUpdateHandlers.add(object, method);
}
export function animateFunction(window, func, params, 
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
duration, animationComplete) {
    const start = window.performance.now();
    let raf = window.requestAnimationFrame(animationStep);
    function animationStep(timestamp) {
        const progress = Platform.NumberUtilities.clamp((timestamp - start) / duration, 0, 1);
        func(...params.map(p => p.from + (p.to - p.from) * progress));
        if (progress < 1) {
            raf = window.requestAnimationFrame(animationStep);
        }
        else if (animationComplete) {
            animationComplete();
        }
    }
    return () => window.cancelAnimationFrame(raf);
}
export class LongClickController extends Common.ObjectWrapper.ObjectWrapper {
    _element;
    _callback;
    _editKey;
    _longClickData;
    _longClickInterval;
    constructor(element, callback, isEditKeyFunc = (event) => isEnterOrSpaceKey(event)) {
        super();
        this._element = element;
        this._callback = callback;
        this._editKey = isEditKeyFunc;
        this._enable();
    }
    reset() {
        if (this._longClickInterval) {
            clearInterval(this._longClickInterval);
            delete this._longClickInterval;
        }
    }
    _enable() {
        if (this._longClickData) {
            return;
        }
        const boundKeyDown = keyDown.bind(this);
        const boundKeyUp = keyUp.bind(this);
        const boundMouseDown = mouseDown.bind(this);
        const boundMouseUp = mouseUp.bind(this);
        const boundReset = this.reset.bind(this);
        this._element.addEventListener('keydown', boundKeyDown, false);
        this._element.addEventListener('keyup', boundKeyUp, false);
        this._element.addEventListener('mousedown', boundMouseDown, false);
        this._element.addEventListener('mouseout', boundReset, false);
        this._element.addEventListener('mouseup', boundMouseUp, false);
        this._element.addEventListener('click', boundReset, true);
        this._longClickData = { mouseUp: boundMouseUp, mouseDown: boundMouseDown, reset: boundReset };
        function keyDown(e) {
            if (this._editKey(e)) {
                const callback = this._callback;
                this._longClickInterval = window.setTimeout(callback.bind(null, e), LongClickController.TIME_MS);
            }
        }
        function keyUp(e) {
            if (this._editKey(e)) {
                this.reset();
            }
        }
        function mouseDown(e) {
            if (e.which !== 1) {
                return;
            }
            const callback = this._callback;
            this._longClickInterval = window.setTimeout(callback.bind(null, e), LongClickController.TIME_MS);
        }
        function mouseUp(e) {
            if (e.which !== 1) {
                return;
            }
            this.reset();
        }
    }
    dispose() {
        if (!this._longClickData) {
            return;
        }
        this._element.removeEventListener('mousedown', this._longClickData.mouseDown, false);
        this._element.removeEventListener('mouseout', this._longClickData.reset, false);
        this._element.removeEventListener('mouseup', this._longClickData.mouseUp, false);
        this._element.addEventListener('click', this._longClickData.reset, true);
        delete this._longClickData;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static TIME_MS = 200;
}
export function initializeUIUtils(document, themeSetting) {
    document.body.classList.toggle('inactive', !document.hasFocus());
    if (document.defaultView) {
        document.defaultView.addEventListener('focus', _windowFocused.bind(undefined, document), false);
        document.defaultView.addEventListener('blur', _windowBlurred.bind(undefined, document), false);
    }
    document.addEventListener('focus', focusChanged.bind(undefined), true);
    if (!ThemeSupport.ThemeSupport.hasInstance()) {
        ThemeSupport.ThemeSupport.instance({ forceNew: true, setting: themeSetting });
    }
    ThemeSupport.ThemeSupport.instance().applyTheme(document);
    const body = document.body;
    GlassPane.setContainer(body);
}
export function beautifyFunctionName(name) {
    return name || i18nString(UIStrings.anonymous);
}
export const createTextChild = (element, text) => {
    const textNode = element.ownerDocument.createTextNode(text);
    element.appendChild(textNode);
    return textNode;
};
export const createTextChildren = (element, ...childrenText) => {
    for (const child of childrenText) {
        createTextChild(element, child);
    }
};
export function createTextButton(
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
text, eventHandler, className, primary, alternativeEvent) {
    const element = document.createElement('button');
    if (className) {
        element.className = className;
    }
    element.textContent = text;
    element.classList.add('text-button');
    if (primary) {
        element.classList.add('primary-button');
    }
    if (eventHandler) {
        element.addEventListener(alternativeEvent || 'click', eventHandler);
    }
    element.type = 'button';
    return element;
}
export function createInput(className, type) {
    const element = document.createElement('input');
    if (className) {
        element.className = className;
    }
    element.spellcheck = false;
    element.classList.add('harmony-input');
    if (type) {
        element.type = type;
    }
    return /** @type {!HTMLInputElement} */ element;
}
export function createSelect(name, options) {
    const select = document.createElementWithClass('select', 'chrome-select');
    ARIAUtils.setAccessibleName(select, name);
    for (const option of options) {
        if (option instanceof Map) {
            for (const [key, value] of option) {
                const optGroup = select.createChild('optgroup');
                optGroup.label = key;
                for (const child of value) {
                    if (typeof child === 'string') {
                        optGroup.appendChild(new Option(child, child));
                    }
                }
            }
        }
        else if (typeof option === 'string') {
            select.add(new Option(option, option));
        }
    }
    return select;
}
export function createLabel(title, className, associatedControl) {
    const element = document.createElement('label');
    if (className) {
        element.className = className;
    }
    element.textContent = title;
    if (associatedControl) {
        ARIAUtils.bindLabelToControl(element, associatedControl);
    }
    return element;
}
export function createRadioLabel(name, title, checked) {
    const element = document.createElement('span', { is: 'dt-radio' });
    element.radioElement.name = name;
    element.radioElement.checked = Boolean(checked);
    createTextChild(element.labelElement, title);
    return element;
}
export function createIconLabel(title, iconClass) {
    const element = document.createElement('span', { is: 'dt-icon-label' });
    element.createChild('span').textContent = title;
    element.type = iconClass;
    return element;
}
export function createSlider(min, max, tabIndex) {
    const element = document.createElement('span', { is: 'dt-slider' });
    element.sliderElement.min = String(min);
    element.sliderElement.max = String(max);
    element.sliderElement.step = String(1);
    element.sliderElement.tabIndex = tabIndex;
    return element;
}
export function setTitle(element, title, actionId = undefined) {
    ARIAUtils.setAccessibleName(element, title);
    Tooltip.install(element, title, actionId, {
        anchorTooltipAtElement: true,
    });
}
export class CheckboxLabel extends HTMLSpanElement {
    _shadowRoot;
    checkboxElement;
    textElement;
    constructor() {
        super();
        CheckboxLabel._lastId = CheckboxLabel._lastId + 1;
        const id = 'ui-checkbox-label' + CheckboxLabel._lastId;
        this._shadowRoot = createShadowRootWithCoreStyles(this, { cssFile: 'ui/legacy/checkboxTextLabel.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this.checkboxElement = this._shadowRoot.createChild('input');
        this.checkboxElement.type = 'checkbox';
        this.checkboxElement.setAttribute('id', id);
        this.textElement = this._shadowRoot.createChild('label', 'dt-checkbox-text');
        this.textElement.setAttribute('for', id);
        this._shadowRoot.createChild('slot');
    }
    static create(title, checked, subtitle) {
        if (!CheckboxLabel._constructor) {
            CheckboxLabel._constructor = registerCustomElement('span', 'dt-checkbox', CheckboxLabel);
        }
        const element = CheckboxLabel._constructor();
        element.checkboxElement.checked = Boolean(checked);
        if (title !== undefined) {
            element.textElement.textContent = title;
            ARIAUtils.setAccessibleName(element.checkboxElement, title);
            if (subtitle !== undefined) {
                element.textElement.createChild('div', 'dt-checkbox-subtitle').textContent = subtitle;
            }
        }
        return element;
    }
    set backgroundColor(color) {
        this.checkboxElement.classList.add('dt-checkbox-themed');
        this.checkboxElement.style.backgroundColor = color;
    }
    set checkColor(color) {
        this.checkboxElement.classList.add('dt-checkbox-themed');
        const stylesheet = document.createElement('style');
        stylesheet.textContent = 'input.dt-checkbox-themed:checked:after { background-color: ' + color + '}';
        this._shadowRoot.appendChild(stylesheet);
    }
    set borderColor(color) {
        this.checkboxElement.classList.add('dt-checkbox-themed');
        this.checkboxElement.style.borderColor = color;
    }
    static _lastId = 0;
    static _constructor = null;
}
export class DevToolsIconLabel extends HTMLSpanElement {
    _iconElement;
    constructor() {
        super();
        const root = createShadowRootWithCoreStyles(this, {
            enableLegacyPatching: false,
            cssFile: undefined,
            delegatesFocus: undefined,
        });
        this._iconElement = Icon.create();
        this._iconElement.style.setProperty('margin-right', '4px');
        root.appendChild(this._iconElement);
        root.createChild('slot');
    }
    set type(type) {
        this._iconElement.setIconType(type);
    }
}
let labelId = 0;
export class DevToolsRadioButton extends HTMLSpanElement {
    radioElement;
    labelElement;
    constructor() {
        super();
        this.radioElement = this.createChild('input', 'dt-radio-button');
        this.labelElement = this.createChild('label');
        const id = 'dt-radio-button-id' + (++labelId);
        this.radioElement.id = id;
        this.radioElement.type = 'radio';
        this.labelElement.htmlFor = id;
        const root = createShadowRootWithCoreStyles(this, { cssFile: 'ui/legacy/radioButton.css', enableLegacyPatching: false, delegatesFocus: undefined });
        root.createChild('slot');
        this.addEventListener('click', this.radioClickHandler.bind(this), false);
    }
    radioClickHandler() {
        if (this.radioElement.checked || this.radioElement.disabled) {
            return;
        }
        this.radioElement.checked = true;
        this.radioElement.dispatchEvent(new Event('change'));
    }
}
registerCustomElement('span', 'dt-radio', DevToolsRadioButton);
registerCustomElement('span', 'dt-icon-label', DevToolsIconLabel);
export class DevToolsSlider extends HTMLSpanElement {
    sliderElement;
    constructor() {
        super();
        const root = createShadowRootWithCoreStyles(this, { cssFile: 'ui/legacy/slider.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this.sliderElement = document.createElement('input');
        this.sliderElement.classList.add('dt-range-input');
        this.sliderElement.type = 'range';
        root.appendChild(this.sliderElement);
    }
    set value(amount) {
        this.sliderElement.value = String(amount);
    }
    get value() {
        return Number(this.sliderElement.value);
    }
}
registerCustomElement('span', 'dt-slider', DevToolsSlider);
export class DevToolsSmallBubble extends HTMLSpanElement {
    _textElement;
    constructor() {
        super();
        const root = createShadowRootWithCoreStyles(this, { cssFile: 'ui/legacy/smallBubble.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this._textElement = root.createChild('div');
        this._textElement.className = 'info';
        this._textElement.createChild('slot');
    }
    set type(type) {
        this._textElement.className = type;
    }
}
registerCustomElement('span', 'dt-small-bubble', DevToolsSmallBubble);
export class DevToolsCloseButton extends HTMLDivElement {
    _buttonElement;
    _hoverIcon;
    _activeIcon;
    constructor() {
        super();
        const root = createShadowRootWithCoreStyles(this, { cssFile: 'ui/legacy/closeButton.css', enableLegacyPatching: false, delegatesFocus: undefined });
        this._buttonElement = root.createChild('div', 'close-button');
        ARIAUtils.setAccessibleName(this._buttonElement, i18nString(UIStrings.close));
        ARIAUtils.markAsButton(this._buttonElement);
        const regularIcon = Icon.create('smallicon-cross', 'default-icon');
        this._hoverIcon = Icon.create('mediumicon-red-cross-hover', 'hover-icon');
        this._activeIcon = Icon.create('mediumicon-red-cross-active', 'active-icon');
        this._buttonElement.appendChild(regularIcon);
        this._buttonElement.appendChild(this._hoverIcon);
        this._buttonElement.appendChild(this._activeIcon);
    }
    set gray(gray) {
        if (gray) {
            this._hoverIcon.setIconType('mediumicon-gray-cross-hover');
            this._activeIcon.setIconType('mediumicon-gray-cross-active');
        }
        else {
            this._hoverIcon.setIconType('mediumicon-red-cross-hover');
            this._activeIcon.setIconType('mediumicon-red-cross-active');
        }
    }
    setAccessibleName(name) {
        ARIAUtils.setAccessibleName(this._buttonElement, name);
    }
    setTabbable(tabbable) {
        if (tabbable) {
            this._buttonElement.tabIndex = 0;
        }
        else {
            this._buttonElement.tabIndex = -1;
        }
    }
}
registerCustomElement('div', 'dt-close-button', DevToolsCloseButton);
export function bindInput(input, apply, validate, numeric, modifierMultiplier) {
    input.addEventListener('change', onChange, false);
    input.addEventListener('input', onInput, false);
    input.addEventListener('keydown', onKeyDown, false);
    input.addEventListener('focus', input.select.bind(input), false);
    function onInput() {
        input.classList.toggle('error-input', !validate(input.value));
    }
    function onChange() {
        const { valid } = validate(input.value);
        input.classList.toggle('error-input', !valid);
        if (valid) {
            apply(input.value);
        }
    }
    function onKeyDown(event) {
        if (event.key === 'Enter') {
            const { valid } = validate(input.value);
            if (valid) {
                apply(input.value);
            }
            event.preventDefault();
            return;
        }
        if (!numeric) {
            return;
        }
        const value = _modifiedFloatNumber(parseFloat(input.value), event, modifierMultiplier);
        const stringValue = value ? String(value) : '';
        const { valid } = validate(stringValue);
        if (!valid || !value) {
            return;
        }
        input.value = stringValue;
        apply(input.value);
        event.preventDefault();
    }
    function setValue(value) {
        if (value === input.value) {
            return;
        }
        const { valid } = validate(value);
        input.classList.toggle('error-input', !valid);
        input.value = value;
    }
    return setValue;
}
export function trimText(context, text, maxWidth, trimFunction) {
    const maxLength = 200;
    if (maxWidth <= 10) {
        return '';
    }
    if (text.length > maxLength) {
        text = trimFunction(text, maxLength);
    }
    const textWidth = measureTextWidth(context, text);
    if (textWidth <= maxWidth) {
        return text;
    }
    let l = 0;
    let r = text.length;
    let lv = 0;
    let rv = textWidth;
    while (l < r && lv !== rv && lv !== maxWidth) {
        const m = Math.ceil(l + (r - l) * (maxWidth - lv) / (rv - lv));
        const mv = measureTextWidth(context, trimFunction(text, m));
        if (mv <= maxWidth) {
            l = m;
            lv = mv;
        }
        else {
            r = m - 1;
            rv = mv;
        }
    }
    text = trimFunction(text, l);
    return text !== '…' ? text : '';
}
export function trimTextMiddle(context, text, maxWidth) {
    return trimText(context, text, maxWidth, (text, width) => Platform.StringUtilities.trimMiddle(text, width));
}
export function trimTextEnd(context, text, maxWidth) {
    return trimText(context, text, maxWidth, (text, width) => Platform.StringUtilities.trimEndWithMaxLength(text, width));
}
export function measureTextWidth(context, text) {
    const maxCacheableLength = 200;
    if (text.length > maxCacheableLength) {
        return context.measureText(text).width;
    }
    if (!measureTextWidthCache) {
        measureTextWidthCache = new Map();
    }
    const font = context.font;
    let textWidths = measureTextWidthCache.get(font);
    if (!textWidths) {
        textWidths = new Map();
        measureTextWidthCache.set(font, textWidths);
    }
    let width = textWidths.get(text);
    if (!width) {
        width = context.measureText(text).width;
        textWidths.set(text, width);
    }
    return width;
}
let measureTextWidthCache = null;
/**
 * Adds a 'utm_source=devtools' as query parameter to the url.
 */
export function addReferrerToURL(url) {
    if (/(\?|&)utm_source=devtools/.test(url)) {
        return url;
    }
    if (url.indexOf('?') === -1) {
        // If the URL does not contain a query, add the referrer query after path
        // and before (potential) anchor.
        return url.replace(/^([^#]*)(#.*)?$/g, '$1?utm_source=devtools$2');
    }
    // If the URL already contains a query, add the referrer query after the last query
    // and before (potential) anchor.
    return url.replace(/^([^#]*)(#.*)?$/g, '$1&utm_source=devtools$2');
}
/**
 * We want to add a referrer query param to every request to
 * 'web.dev' or 'developers.google.com'.
 */
export function addReferrerToURLIfNecessary(url) {
    if (/(\/\/developers.google.com\/|\/\/web.dev\/)/.test(url)) {
        return addReferrerToURL(url);
    }
    return url;
}
export function loadImage(url) {
    return new Promise(fulfill => {
        const image = new Image();
        image.addEventListener('load', () => fulfill(image));
        image.addEventListener('error', () => fulfill(null));
        image.src = url;
    });
}
export function loadImageFromData(data) {
    return data ? loadImage('data:image/jpg;base64,' + data) : Promise.resolve(null);
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createFileSelectorElement(callback) {
    const fileSelectorElement = document.createElement('input');
    fileSelectorElement.type = 'file';
    fileSelectorElement.style.display = 'none';
    fileSelectorElement.tabIndex = -1;
    fileSelectorElement.onchange = () => {
        if (fileSelectorElement.files) {
            callback(fileSelectorElement.files[0]);
        }
    };
    return fileSelectorElement;
}
export const MaxLengthForDisplayedURLs = 150;
export class MessageDialog {
    static async show(message, where) {
        const dialog = new Dialog();
        dialog.setSizeBehavior(SizeBehavior.MeasureContent);
        dialog.setDimmed(true);
        const shadowRoot = createShadowRootWithCoreStyles(dialog.contentElement, { cssFile: 'ui/legacy/confirmDialog.css', enableLegacyPatching: false, delegatesFocus: undefined });
        const content = shadowRoot.createChild('div', 'widget');
        await new Promise(resolve => {
            const okButton = createTextButton(i18nString(UIStrings.ok), resolve, '', true);
            content.createChild('div', 'message').createChild('span').textContent = message;
            content.createChild('div', 'button').appendChild(okButton);
            dialog.setOutsideClickCallback(event => {
                event.consume();
                resolve(undefined);
            });
            dialog.show(where);
            okButton.focus();
        });
        dialog.hide();
    }
}
export class ConfirmDialog {
    static async show(message, where) {
        const dialog = new Dialog();
        dialog.setSizeBehavior(SizeBehavior.MeasureContent);
        dialog.setDimmed(true);
        ARIAUtils.setAccessibleName(dialog.contentElement, message);
        const shadowRoot = createShadowRootWithCoreStyles(dialog.contentElement, { cssFile: 'ui/legacy/confirmDialog.css', enableLegacyPatching: false, delegatesFocus: undefined });
        const content = shadowRoot.createChild('div', 'widget');
        content.createChild('div', 'message').createChild('span').textContent = message;
        const buttonsBar = content.createChild('div', 'button');
        const result = await new Promise(resolve => {
            const okButton = createTextButton(
            /* text= */ i18nString(UIStrings.ok), /* clickHandler= */ () => resolve(true), /* className= */ '', 
            /* primary= */ true);
            buttonsBar.appendChild(okButton);
            buttonsBar.appendChild(createTextButton(i18nString(UIStrings.cancel), () => resolve(false)));
            dialog.setOutsideClickCallback(event => {
                event.consume();
                resolve(false);
            });
            dialog.show(where);
            okButton.focus();
        });
        dialog.hide();
        return result;
    }
}
export function createInlineButton(toolbarButton) {
    const element = document.createElement('span');
    const shadowRoot = createShadowRootWithCoreStyles(element, { cssFile: 'ui/legacy/inlineButton.css', enableLegacyPatching: false, delegatesFocus: undefined });
    element.classList.add('inline-button');
    const toolbar = new Toolbar('');
    toolbar.appendToolbarItem(toolbarButton);
    shadowRoot.appendChild(toolbar.element);
    return element;
}
export class Renderer {
    static async render(object, options) {
        if (!object) {
            throw new Error('Can\'t render ' + object);
        }
        const extension = getApplicableRegisteredRenderers(object)[0];
        if (!extension) {
            return null;
        }
        const renderer = await extension.loadRenderer();
        return renderer.render(object, options);
    }
}
export function formatTimestamp(timestamp, full) {
    const date = new Date(timestamp);
    const yymmdd = date.getFullYear() + '-' + leadZero(date.getMonth() + 1, 2) + '-' + leadZero(date.getDate(), 2);
    const hhmmssfff = leadZero(date.getHours(), 2) + ':' + leadZero(date.getMinutes(), 2) + ':' +
        leadZero(date.getSeconds(), 2) + '.' + leadZero(date.getMilliseconds(), 3);
    return full ? (yymmdd + ' ' + hhmmssfff) : hhmmssfff;
    function leadZero(value, length) {
        const valueString = String(value);
        return valueString.padStart(length, '0');
    }
}
export const isScrolledToBottom = (element) => {
    // This code works only for 0-width border.
    // The scrollTop, clientHeight and scrollHeight are computed in double values internally.
    // However, they are exposed to javascript differently, each being either rounded (via
    // round, ceil or floor functions) or left intouch.
    // This adds up a total error up to 2.
    return Math.abs(element.scrollTop + element.clientHeight - element.scrollHeight) <= 2;
};
export function createSVGChild(element, childType, className) {
    const child = element.ownerDocument.createElementNS('http://www.w3.org/2000/svg', childType);
    if (className) {
        child.setAttribute('class', className);
    }
    element.appendChild(child);
    return child;
}
export const enclosingNodeOrSelfWithNodeNameInArray = (initialNode, nameArray) => {
    let node = initialNode;
    for (; node && node !== initialNode.ownerDocument; node = node.parentNodeOrShadowHost()) {
        for (let i = 0; i < nameArray.length; ++i) {
            if (node.nodeName.toLowerCase() === nameArray[i].toLowerCase()) {
                return node;
            }
        }
    }
    return null;
};
export const enclosingNodeOrSelfWithNodeName = function (node, nodeName) {
    return enclosingNodeOrSelfWithNodeNameInArray(node, [nodeName]);
};
export const deepElementFromPoint = (document, x, y) => {
    let container = document;
    let node = null;
    while (container) {
        const innerNode = container.elementFromPoint(x, y);
        if (!innerNode || node === innerNode) {
            break;
        }
        node = innerNode;
        container = node.shadowRoot;
    }
    return node;
};
export const deepElementFromEvent = (ev) => {
    const event = ev;
    // Some synthetic events have zero coordinates which lead to a wrong element. Better return nothing in this case.
    if (!event.which && !event.pageX && !event.pageY && !event.clientX && !event.clientY && !event.movementX &&
        !event.movementY) {
        return null;
    }
    const root = event.target && event.target.getComponentRoot();
    return root ? deepElementFromPoint(root, event.pageX, event.pageY) : null;
};
const registeredRenderers = [];
export function registerRenderer(registration) {
    registeredRenderers.push(registration);
}
export function getApplicableRegisteredRenderers(object) {
    return registeredRenderers.filter(isRendererApplicableToContextTypes);
    function isRendererApplicableToContextTypes(rendererRegistration) {
        if (!rendererRegistration.contextTypes) {
            return true;
        }
        for (const contextType of rendererRegistration.contextTypes()) {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            if (object instanceof contextType) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=UIUtils.js.map