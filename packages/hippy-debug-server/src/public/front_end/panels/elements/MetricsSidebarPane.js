// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
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
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ElementsSidebarPane } from './ElementsSidebarPane.js';
export class MetricsSidebarPane extends ElementsSidebarPane {
    originalPropertyData;
    previousPropertyDataCandidate;
    _inlineStyle;
    _highlightMode;
    _boxElements;
    _isEditingMetrics;
    constructor() {
        super();
        this.registerRequiredCSS('panels/elements/metricsSidebarPane.css', { enableLegacyPatching: false });
        this.originalPropertyData = null;
        this.previousPropertyDataCandidate = null;
        this._inlineStyle = null;
        this._highlightMode = '';
        this._boxElements = [];
    }
    doUpdate() {
        // "style" attribute might have changed. Update metrics unless they are being edited
        // (if a CSS property is added, a StyleSheetChanged event is dispatched).
        if (this._isEditingMetrics) {
            return Promise.resolve();
        }
        // FIXME: avoid updates of a collapsed pane.
        const node = this.node();
        const cssModel = this.cssModel();
        if (!node || node.nodeType() !== Node.ELEMENT_NODE || !cssModel) {
            this.contentElement.removeChildren();
            this.element.classList.add('collapsed');
            return Promise.resolve();
        }
        function callback(style) {
            if (!style || this.node() !== node) {
                return;
            }
            this._updateMetrics(style);
        }
        if (!node.id) {
            return Promise.resolve();
        }
        const promises = [
            cssModel.computedStylePromise(node.id).then(callback.bind(this)),
            cssModel.inlineStylesPromise(node.id).then(inlineStyleResult => {
                if (inlineStyleResult && this.node() === node) {
                    this._inlineStyle = inlineStyleResult.inlineStyle;
                }
            }),
        ];
        return Promise.all(promises);
    }
    onCSSModelChanged() {
        this.update();
    }
    /**
     * Toggle the visibility of the Metrics pane. This toggle allows external
     * callers to control the visibility of this pane, but toggling this on does
     * not guarantee the pane will always show up, because the pane's visibility
     * is also controlled by the internal condition that style cannot be empty.
     */
    toggleVisibility(isVisible) {
        this.element.classList.toggle('invisible', !isVisible);
    }
    _getPropertyValueAsPx(style, propertyName) {
        const propertyValue = style.get(propertyName);
        if (!propertyValue) {
            return 0;
        }
        return Number(propertyValue.replace(/px$/, '') || 0);
    }
    _getBox(computedStyle, componentName) {
        const suffix = componentName === 'border' ? '-width' : '';
        const left = this._getPropertyValueAsPx(computedStyle, componentName + '-left' + suffix);
        const top = this._getPropertyValueAsPx(computedStyle, componentName + '-top' + suffix);
        const right = this._getPropertyValueAsPx(computedStyle, componentName + '-right' + suffix);
        const bottom = this._getPropertyValueAsPx(computedStyle, componentName + '-bottom' + suffix);
        return { left, top, right, bottom };
    }
    _highlightDOMNode(showHighlight, mode, event) {
        event.consume();
        const node = this.node();
        if (showHighlight && node) {
            if (this._highlightMode === mode) {
                return;
            }
            this._highlightMode = mode;
            node.highlight(mode);
        }
        else {
            this._highlightMode = '';
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        }
        for (const { element, name, backgroundColor } of this._boxElements) {
            const shouldHighlight = !node || mode === 'all' || name === mode;
            element.style.backgroundColor = shouldHighlight ? backgroundColor : '';
            element.classList.toggle('highlighted', shouldHighlight);
        }
    }
    _updateMetrics(style) {
        // Updating with computed style.
        const metricsElement = document.createElement('div');
        metricsElement.className = 'metrics';
        const self = this;
        function createBoxPartElement(style, name, side, suffix) {
            const element = document.createElement('div');
            element.className = side;
            const propertyName = (name !== 'position' ? name + '-' : '') + side + suffix;
            let value = style.get(propertyName);
            if (value === undefined) {
                return element;
            }
            if (value === '' || (name !== 'position' && value === '0px')) {
                value = '\u2012';
            }
            else if (name === 'position' && value === 'auto') {
                value = '\u2012';
            }
            value = value.replace(/px$/, '');
            value = Platform.NumberUtilities.toFixedIfFloating(value);
            element.textContent = value;
            element.addEventListener('dblclick', this.startEditing.bind(this, element, name, propertyName, style), false);
            return element;
        }
        function getContentAreaWidthPx(style) {
            let width = style.get('width');
            if (!width) {
                return '';
            }
            width = width.replace(/px$/, '');
            const widthValue = Number(width);
            if (!isNaN(widthValue) && style.get('box-sizing') === 'border-box') {
                const borderBox = self._getBox(style, 'border');
                const paddingBox = self._getBox(style, 'padding');
                width = (widthValue - borderBox.left - borderBox.right - paddingBox.left - paddingBox.right).toString();
            }
            return Platform.NumberUtilities.toFixedIfFloating(width);
        }
        function getContentAreaHeightPx(style) {
            let height = style.get('height');
            if (!height) {
                return '';
            }
            height = height.replace(/px$/, '');
            const heightValue = Number(height);
            if (!isNaN(heightValue) && style.get('box-sizing') === 'border-box') {
                const borderBox = self._getBox(style, 'border');
                const paddingBox = self._getBox(style, 'padding');
                height = (heightValue - borderBox.top - borderBox.bottom - paddingBox.top - paddingBox.bottom).toString();
            }
            return Platform.NumberUtilities.toFixedIfFloating(height);
        }
        // Display types for which margin is ignored.
        const noMarginDisplayType = new Set([
            'table-cell',
            'table-column',
            'table-column-group',
            'table-footer-group',
            'table-header-group',
            'table-row',
            'table-row-group',
        ]);
        // Display types for which padding is ignored.
        const noPaddingDisplayType = new Set([
            'table-column',
            'table-column-group',
            'table-footer-group',
            'table-header-group',
            'table-row',
            'table-row-group',
        ]);
        // Position types for which top, left, bottom and right are ignored.
        const noPositionType = new Set(['static']);
        const boxes = ['content', 'padding', 'border', 'margin', 'position'];
        const boxColors = [
            Common.Color.PageHighlight.Content,
            Common.Color.PageHighlight.Padding,
            Common.Color.PageHighlight.Border,
            Common.Color.PageHighlight.Margin,
            Common.Color.Color.fromRGBA([0, 0, 0, 0]),
        ];
        const boxLabels = ['content', 'padding', 'border', 'margin', 'position'];
        let previousBox = null;
        this._boxElements = [];
        for (let i = 0; i < boxes.length; ++i) {
            const name = boxes[i];
            const display = style.get('display');
            const position = style.get('position');
            if (!display || !position) {
                continue;
            }
            if (name === 'margin' && noMarginDisplayType.has(display)) {
                continue;
            }
            if (name === 'padding' && noPaddingDisplayType.has(display)) {
                continue;
            }
            if (name === 'position' && noPositionType.has(position)) {
                continue;
            }
            const boxElement = document.createElement('div');
            boxElement.className = `${name} highlighted`;
            const backgroundColor = boxColors[i].asString(Common.Color.Format.RGBA) || '';
            boxElement.style.backgroundColor = backgroundColor;
            boxElement.addEventListener('mouseover', this._highlightDOMNode.bind(this, true, name === 'position' ? 'all' : name), false);
            this._boxElements.push({ element: boxElement, name, backgroundColor });
            if (name === 'content') {
                const widthElement = document.createElement('span');
                widthElement.textContent = getContentAreaWidthPx(style);
                widthElement.addEventListener('dblclick', this.startEditing.bind(this, widthElement, 'width', 'width', style), false);
                const heightElement = document.createElement('span');
                heightElement.textContent = getContentAreaHeightPx(style);
                heightElement.addEventListener('dblclick', this.startEditing.bind(this, heightElement, 'height', 'height', style), false);
                const timesElement = document.createElement('span');
                timesElement.textContent = ' × ';
                boxElement.appendChild(widthElement);
                boxElement.appendChild(timesElement);
                boxElement.appendChild(heightElement);
            }
            else {
                const suffix = (name === 'border' ? '-width' : '');
                const labelElement = document.createElement('div');
                labelElement.className = 'label';
                labelElement.textContent = boxLabels[i];
                boxElement.appendChild(labelElement);
                boxElement.appendChild(createBoxPartElement.call(this, style, name, 'top', suffix));
                boxElement.appendChild(document.createElement('br'));
                boxElement.appendChild(createBoxPartElement.call(this, style, name, 'left', suffix));
                if (previousBox) {
                    boxElement.appendChild(previousBox);
                }
                boxElement.appendChild(createBoxPartElement.call(this, style, name, 'right', suffix));
                boxElement.appendChild(document.createElement('br'));
                boxElement.appendChild(createBoxPartElement.call(this, style, name, 'bottom', suffix));
            }
            previousBox = boxElement;
        }
        metricsElement.appendChild(previousBox);
        metricsElement.addEventListener('mouseover', this._highlightDOMNode.bind(this, false, 'all'), false);
        metricsElement.addEventListener('mouseleave', this._highlightDOMNode.bind(this, false, 'all'), false);
        this.contentElement.removeChildren();
        this.contentElement.appendChild(metricsElement);
        this.element.classList.remove('collapsed');
    }
    startEditing(targetElement, box, styleProperty, computedStyle) {
        if (UI.UIUtils.isBeingEdited(targetElement)) {
            return;
        }
        const context = { box, styleProperty, computedStyle, keyDownHandler: () => { } };
        const boundKeyDown = this._handleKeyDown.bind(this, context);
        context.keyDownHandler = boundKeyDown;
        targetElement.addEventListener('keydown', boundKeyDown, false);
        this._isEditingMetrics = true;
        const config = new UI.InplaceEditor.Config(this._editingCommitted.bind(this), this.editingCancelled.bind(this), context);
        UI.InplaceEditor.InplaceEditor.startEditing(targetElement, config);
        const selection = targetElement.getComponentSelection();
        selection && selection.selectAllChildren(targetElement);
    }
    _handleKeyDown(context, event) {
        const element = event.currentTarget;
        function finishHandler(originalValue, replacementString) {
            this._applyUserInput(element, replacementString, originalValue, context, false);
        }
        function customNumberHandler(prefix, number, suffix) {
            if (context.styleProperty !== 'margin' && number < 0) {
                number = 0;
            }
            return prefix + number + suffix;
        }
        UI.UIUtils.handleElementValueModifications(event, element, finishHandler.bind(this), undefined, customNumberHandler);
    }
    editingEnded(element, context) {
        this.originalPropertyData = null;
        this.previousPropertyDataCandidate = null;
        element.removeEventListener('keydown', context.keyDownHandler, false);
        delete this._isEditingMetrics;
    }
    editingCancelled(element, context) {
        if (this._inlineStyle) {
            if (!this.originalPropertyData) {
                // An added property, remove the last property in the style.
                const pastLastSourcePropertyIndex = this._inlineStyle.pastLastSourcePropertyIndex();
                if (pastLastSourcePropertyIndex) {
                    this._inlineStyle.allProperties()[pastLastSourcePropertyIndex - 1].setText('', false);
                }
            }
            else {
                this._inlineStyle.allProperties()[this.originalPropertyData.index].setText(this.originalPropertyData.propertyText || '', false);
            }
        }
        this.editingEnded(element, context);
        this.update();
    }
    _applyUserInput(element, userInput, previousContent, context, commitEditor) {
        if (!this._inlineStyle) {
            // Element has no renderer.
            return this.editingCancelled(element, context); // nothing changed, so cancel
        }
        if (commitEditor && userInput === previousContent) {
            return this.editingCancelled(element, context);
        } // nothing changed, so cancel
        if (context.box !== 'position' && (!userInput || userInput === '\u2012')) {
            userInput = '0px';
        }
        else if (context.box === 'position' && (!userInput || userInput === '\u2012')) {
            userInput = 'auto';
        }
        userInput = userInput.toLowerCase();
        // Append a "px" unit if the user input was just a number.
        if (/^\d+$/.test(userInput)) {
            userInput += 'px';
        }
        const styleProperty = context.styleProperty;
        const computedStyle = context.computedStyle;
        if (computedStyle.get('box-sizing') === 'border-box' && (styleProperty === 'width' || styleProperty === 'height')) {
            if (!userInput.match(/px$/)) {
                Common.Console.Console.instance().error('For elements with box-sizing: border-box, only absolute content area dimensions can be applied');
                return;
            }
            const borderBox = this._getBox(computedStyle, 'border');
            const paddingBox = this._getBox(computedStyle, 'padding');
            let userValuePx = Number(userInput.replace(/px$/, ''));
            if (isNaN(userValuePx)) {
                return;
            }
            if (styleProperty === 'width') {
                userValuePx += borderBox.left + borderBox.right + paddingBox.left + paddingBox.right;
            }
            else {
                userValuePx += borderBox.top + borderBox.bottom + paddingBox.top + paddingBox.bottom;
            }
            userInput = userValuePx + 'px';
        }
        this.previousPropertyDataCandidate = null;
        const allProperties = this._inlineStyle.allProperties();
        for (let i = 0; i < allProperties.length; ++i) {
            const property = allProperties[i];
            if (property.name !== context.styleProperty || !property.activeInStyle()) {
                continue;
            }
            this.previousPropertyDataCandidate = property;
            property.setValue(userInput, commitEditor, true, callback.bind(this));
            return;
        }
        this._inlineStyle.appendProperty(context.styleProperty, userInput, callback.bind(this));
        function callback(success) {
            if (!success) {
                return;
            }
            if (!this.originalPropertyData) {
                this.originalPropertyData = this.previousPropertyDataCandidate;
            }
            if (this._highlightMode) {
                const node = this.node();
                if (!node) {
                    return;
                }
                node.highlight(this._highlightMode);
            }
            if (commitEditor) {
                this.update();
            }
        }
    }
    _editingCommitted(element, userInput, previousContent, context) {
        this.editingEnded(element, context);
        this._applyUserInput(element, userInput, previousContent, context, true);
    }
}
//# sourceMappingURL=MetricsSidebarPane.js.map