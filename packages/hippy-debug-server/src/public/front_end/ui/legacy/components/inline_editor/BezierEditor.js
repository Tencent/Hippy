// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../../../core/platform/platform.js';
import * as UI from '../../legacy.js';
import { BezierUI } from './BezierUI.js';
export class BezierEditor extends UI.Widget.VBox {
    _bezier;
    _previewElement;
    _previewOnion;
    _outerContainer;
    _selectedCategory;
    _presetsContainer;
    _presetUI;
    _presetCategories;
    _curveUI;
    _curve;
    _header;
    _label;
    _mouseDownPosition;
    _controlPosition;
    _selectedPoint;
    _previewAnimation;
    constructor(bezier) {
        super(true);
        this._bezier = bezier;
        this.registerRequiredCSS('ui/legacy/components/inline_editor/bezierEditor.css', { enableLegacyPatching: false });
        this.contentElement.tabIndex = 0;
        this.setDefaultFocusedElement(this.contentElement);
        // Preview UI
        this._previewElement = this.contentElement.createChild('div', 'bezier-preview-container');
        this._previewElement.createChild('div', 'bezier-preview-animation');
        this._previewElement.addEventListener('click', this._startPreviewAnimation.bind(this));
        this._previewOnion = this.contentElement.createChild('div', 'bezier-preview-onion');
        this._previewOnion.addEventListener('click', this._startPreviewAnimation.bind(this));
        this._outerContainer = this.contentElement.createChild('div', 'bezier-container');
        // Presets UI
        this._selectedCategory = null;
        this._presetsContainer = this._outerContainer.createChild('div', 'bezier-presets');
        this._presetUI = new BezierUI(40, 40, 0, 2, false);
        this._presetCategories = [];
        for (let i = 0; i < Presets.length; i++) {
            this._presetCategories[i] = this._createCategory(Presets[i]);
            this._presetsContainer.appendChild(this._presetCategories[i].icon);
        }
        // Curve UI
        this._curveUI = new BezierUI(150, 250, 50, 7, true);
        this._curve = UI.UIUtils.createSVGChild(this._outerContainer, 'svg', 'bezier-curve');
        UI.UIUtils.installDragHandle(this._curve, this._dragStart.bind(this), this._dragMove.bind(this), this._dragEnd.bind(this), 'default');
        this._header = this.contentElement.createChild('div', 'bezier-header');
        const minus = this._createPresetModifyIcon(this._header, 'bezier-preset-minus', 'M 12 6 L 8 10 L 12 14');
        const plus = this._createPresetModifyIcon(this._header, 'bezier-preset-plus', 'M 8 6 L 12 10 L 8 14');
        minus.addEventListener('click', this._presetModifyClicked.bind(this, false));
        plus.addEventListener('click', this._presetModifyClicked.bind(this, true));
        this._label = this._header.createChild('span', 'source-code bezier-display-value');
    }
    setBezier(bezier) {
        if (!bezier) {
            return;
        }
        this._bezier = bezier;
        this._updateUI();
    }
    bezier() {
        return this._bezier;
    }
    wasShown() {
        this._unselectPresets();
        // Check if bezier matches a preset
        for (const category of this._presetCategories) {
            for (let i = 0; i < category.presets.length; i++) {
                if (this._bezier.asCSSText() === category.presets[i].value) {
                    category.presetIndex = i;
                    this._presetCategorySelected(category);
                }
            }
        }
        this._updateUI();
        this._startPreviewAnimation();
    }
    _onchange() {
        this._updateUI();
        this.dispatchEventToListeners(Events.BezierChanged, this._bezier.asCSSText());
    }
    _updateUI() {
        const labelText = this._selectedCategory ? this._selectedCategory.presets[this._selectedCategory.presetIndex].name :
            this._bezier.asCSSText().replace(/\s(-\d\.\d)/g, '$1');
        this._label.textContent = labelText;
        this._curveUI.drawCurve(this._bezier, this._curve);
        this._previewOnion.removeChildren();
    }
    _dragStart(event) {
        this._mouseDownPosition = new UI.Geometry.Point(event.x, event.y);
        const ui = this._curveUI;
        this._controlPosition = new UI.Geometry.Point(Platform.NumberUtilities.clamp((event.offsetX - ui.radius) / ui.curveWidth(), 0, 1), (ui.curveHeight() + ui.marginTop + ui.radius - event.offsetY) / ui.curveHeight());
        const firstControlPointIsCloser = this._controlPosition.distanceTo(this._bezier.controlPoints[0]) <
            this._controlPosition.distanceTo(this._bezier.controlPoints[1]);
        this._selectedPoint = firstControlPointIsCloser ? 0 : 1;
        this._bezier.controlPoints[this._selectedPoint] = this._controlPosition;
        this._unselectPresets();
        this._onchange();
        event.consume(true);
        return true;
    }
    _updateControlPosition(mouseX, mouseY) {
        if (this._mouseDownPosition === undefined || this._controlPosition === undefined ||
            this._selectedPoint === undefined) {
            return;
        }
        const deltaX = (mouseX - this._mouseDownPosition.x) / this._curveUI.curveWidth();
        const deltaY = (mouseY - this._mouseDownPosition.y) / this._curveUI.curveHeight();
        const newPosition = new UI.Geometry.Point(Platform.NumberUtilities.clamp(this._controlPosition.x + deltaX, 0, 1), this._controlPosition.y - deltaY);
        this._bezier.controlPoints[this._selectedPoint] = newPosition;
    }
    _dragMove(event) {
        this._updateControlPosition(event.x, event.y);
        this._onchange();
    }
    _dragEnd(event) {
        this._updateControlPosition(event.x, event.y);
        this._onchange();
        this._startPreviewAnimation();
    }
    _createCategory(presetGroup) {
        const presetElement = document.createElement('div');
        presetElement.classList.add('bezier-preset-category');
        const iconElement = UI.UIUtils.createSVGChild(presetElement, 'svg', 'bezier-preset monospace');
        const category = { presets: presetGroup, presetIndex: 0, icon: presetElement };
        this._presetUI.drawCurve(UI.Geometry.CubicBezier.parse(category.presets[0].value), iconElement);
        iconElement.addEventListener('click', this._presetCategorySelected.bind(this, category));
        return category;
    }
    _createPresetModifyIcon(parentElement, className, drawPath) {
        const icon = UI.UIUtils.createSVGChild(parentElement, 'svg', 'bezier-preset-modify ' + className);
        icon.setAttribute('width', '20');
        icon.setAttribute('height', '20');
        const path = UI.UIUtils.createSVGChild(icon, 'path');
        path.setAttribute('d', drawPath);
        return icon;
    }
    _unselectPresets() {
        for (const category of this._presetCategories) {
            category.icon.classList.remove('bezier-preset-selected');
        }
        this._selectedCategory = null;
        this._header.classList.remove('bezier-header-active');
    }
    _presetCategorySelected(category, event) {
        if (this._selectedCategory === category) {
            return;
        }
        this._unselectPresets();
        this._header.classList.add('bezier-header-active');
        this._selectedCategory = category;
        this._selectedCategory.icon.classList.add('bezier-preset-selected');
        const newBezier = UI.Geometry.CubicBezier.parse(category.presets[category.presetIndex].value);
        if (newBezier) {
            this.setBezier(newBezier);
            this._onchange();
            this._startPreviewAnimation();
        }
        if (event) {
            event.consume(true);
        }
    }
    _presetModifyClicked(intensify, _event) {
        if (this._selectedCategory === null) {
            return;
        }
        const length = this._selectedCategory.presets.length;
        this._selectedCategory.presetIndex = (this._selectedCategory.presetIndex + (intensify ? 1 : -1) + length) % length;
        const newBezier = UI.Geometry.CubicBezier.parse(this._selectedCategory.presets[this._selectedCategory.presetIndex].value);
        if (newBezier) {
            this.setBezier(newBezier);
            this._onchange();
            this._startPreviewAnimation();
        }
    }
    _startPreviewAnimation() {
        if (this._previewAnimation) {
            this._previewAnimation.cancel();
        }
        const animationDuration = 1600;
        const numberOnionSlices = 20;
        const keyframes = [
            { offset: 0, transform: 'translateX(0px)', easing: this._bezier.asCSSText(), opacity: 1 },
            { offset: 0.9, transform: 'translateX(218px)', opacity: 1 },
            { offset: 1, transform: 'translateX(218px)', opacity: 0 },
        ];
        this._previewAnimation = this._previewElement.animate(keyframes, animationDuration);
        this._previewOnion.removeChildren();
        for (let i = 0; i <= numberOnionSlices; i++) {
            const slice = this._previewOnion.createChild('div', 'bezier-preview-animation');
            const player = slice.animate([{ transform: 'translateX(0px)', easing: this._bezier.asCSSText() }, { transform: 'translateX(218px)' }], { duration: animationDuration, fill: 'forwards' });
            player.pause();
            player.currentTime = animationDuration * i / numberOnionSlices;
        }
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["BezierChanged"] = "BezierChanged";
})(Events || (Events = {}));
export const Presets = [
    [
        { name: 'ease-in-out', value: 'ease-in-out' },
        { name: 'In Out · Sine', value: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)' },
        { name: 'In Out · Quadratic', value: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)' },
        { name: 'In Out · Cubic', value: 'cubic-bezier(0.65, 0.05, 0.36, 1)' },
        { name: 'Fast Out, Slow In', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { name: 'In Out · Back', value: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
    ],
    [
        { name: 'Fast Out, Linear In', value: 'cubic-bezier(0.4, 0, 1, 1)' },
        { name: 'ease-in', value: 'ease-in' },
        { name: 'In · Sine', value: 'cubic-bezier(0.47, 0, 0.75, 0.72)' },
        { name: 'In · Quadratic', value: 'cubic-bezier(0.55, 0.09, 0.68, 0.53)' },
        { name: 'In · Cubic', value: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)' },
        { name: 'In · Back', value: 'cubic-bezier(0.6, -0.28, 0.74, 0.05)' },
    ],
    [
        { name: 'ease-out', value: 'ease-out' },
        { name: 'Out · Sine', value: 'cubic-bezier(0.39, 0.58, 0.57, 1)' },
        { name: 'Out · Quadratic', value: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
        { name: 'Out · Cubic', value: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
        { name: 'Linear Out, Slow In', value: 'cubic-bezier(0, 0, 0.2, 1)' },
        { name: 'Out · Back', value: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)' },
    ],
];
//# sourceMappingURL=BezierEditor.js.map