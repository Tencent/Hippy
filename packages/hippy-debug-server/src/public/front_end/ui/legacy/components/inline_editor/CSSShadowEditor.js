// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as UI from '../../legacy.js';
import { CSSLength } from './CSSShadowModel.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Text that refers to some types
    */
    type: 'Type',
    /**
    *@description Text in CSSShadow Editor of the inline editor in the Styles tab
    */
    xOffset: 'X offset',
    /**
    *@description Text in CSSShadow Editor of the inline editor in the Styles tab
    */
    yOffset: 'Y offset',
    /**
    * @description Text in CSSShadow Editor of the inline editor in the Styles tab. Noun which is a
    * label for an input that allows the user to specify how blurred the box-shadow should be.
    */
    blur: 'Blur',
    /**
    *@description Text in CSSShadow Editor of the inline editor in the Styles tab
    */
    spread: 'Spread',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/inline_editor/CSSShadowEditor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const maxRange = 20;
const defaultUnit = 'px';
const sliderThumbRadius = 6;
const canvasSize = 88;
export class CSSShadowEditor extends UI.Widget.VBox {
    _typeField;
    _outsetButton;
    _insetButton;
    _xInput;
    _yInput;
    _xySlider;
    _halfCanvasSize;
    _innerCanvasSize;
    _blurInput;
    _blurSlider;
    _spreadField;
    _spreadInput;
    _spreadSlider;
    _model;
    _canvasOrigin;
    _changedElement;
    constructor() {
        super(true);
        this.registerRequiredCSS('ui/legacy/components/inline_editor/cssShadowEditor.css', { enableLegacyPatching: false });
        this.contentElement.tabIndex = 0;
        this.setDefaultFocusedElement(this.contentElement);
        this._typeField = this.contentElement.createChild('div', 'shadow-editor-field shadow-editor-flex-field');
        this._typeField.createChild('label', 'shadow-editor-label').textContent = i18nString(UIStrings.type);
        this._outsetButton = this._typeField.createChild('button', 'shadow-editor-button-left');
        this._outsetButton.textContent = i18n.i18n.lockedString('Outset');
        this._outsetButton.addEventListener('click', this._onButtonClick.bind(this), false);
        this._insetButton = this._typeField.createChild('button', 'shadow-editor-button-right');
        this._insetButton.textContent = i18n.i18n.lockedString('Inset');
        this._insetButton.addEventListener('click', this._onButtonClick.bind(this), false);
        const xField = this.contentElement.createChild('div', 'shadow-editor-field');
        this._xInput = this._createTextInput(xField, i18nString(UIStrings.xOffset));
        const yField = this.contentElement.createChild('div', 'shadow-editor-field');
        this._yInput = this._createTextInput(yField, i18nString(UIStrings.yOffset));
        this._xySlider = xField.createChild('canvas', 'shadow-editor-2D-slider');
        this._xySlider.width = canvasSize;
        this._xySlider.height = canvasSize;
        this._xySlider.tabIndex = -1;
        this._halfCanvasSize = canvasSize / 2;
        this._innerCanvasSize = this._halfCanvasSize - sliderThumbRadius;
        UI.UIUtils.installDragHandle(this._xySlider, this._dragStart.bind(this), this._dragMove.bind(this), null, 'default');
        this._xySlider.addEventListener('keydown', this._onCanvasArrowKey.bind(this), false);
        this._xySlider.addEventListener('blur', this._onCanvasBlur.bind(this), false);
        const blurField = this.contentElement.createChild('div', 'shadow-editor-field shadow-editor-flex-field shadow-editor-blur-field');
        this._blurInput = this._createTextInput(blurField, i18nString(UIStrings.blur));
        this._blurSlider = this._createSlider(blurField);
        this._spreadField = this.contentElement.createChild('div', 'shadow-editor-field shadow-editor-flex-field');
        this._spreadInput = this._createTextInput(this._spreadField, i18nString(UIStrings.spread));
        this._spreadSlider = this._createSlider(this._spreadField);
    }
    _createTextInput(field, propertyName) {
        const label = field.createChild('label', 'shadow-editor-label');
        label.textContent = propertyName;
        label.setAttribute('for', propertyName);
        const textInput = UI.UIUtils.createInput('shadow-editor-text-input', 'text');
        field.appendChild(textInput);
        textInput.id = propertyName;
        textInput.addEventListener('keydown', this._handleValueModification.bind(this), false);
        textInput.addEventListener('mousewheel', this._handleValueModification.bind(this), false);
        textInput.addEventListener('input', this._onTextInput.bind(this), false);
        textInput.addEventListener('blur', this._onTextBlur.bind(this), false);
        return textInput;
    }
    _createSlider(field) {
        const slider = UI.UIUtils.createSlider(0, maxRange, -1);
        slider.addEventListener('input', this._onSliderInput.bind(this), false);
        field.appendChild(slider);
        return /** @type {!HTMLInputElement} */ slider;
    }
    wasShown() {
        this._updateUI();
    }
    setModel(model) {
        this._model = model;
        this._typeField.classList.toggle('hidden', !model.isBoxShadow());
        this._spreadField.classList.toggle('hidden', !model.isBoxShadow());
        this._updateUI();
    }
    _updateUI() {
        this._updateButtons();
        this._xInput.value = this._model.offsetX().asCSSText();
        this._yInput.value = this._model.offsetY().asCSSText();
        this._blurInput.value = this._model.blurRadius().asCSSText();
        this._spreadInput.value = this._model.spreadRadius().asCSSText();
        this._blurSlider.value = this._model.blurRadius().amount.toString();
        this._spreadSlider.value = this._model.spreadRadius().amount.toString();
        this._updateCanvas(false);
    }
    _updateButtons() {
        this._insetButton.classList.toggle('enabled', this._model.inset());
        this._outsetButton.classList.toggle('enabled', !this._model.inset());
    }
    _updateCanvas(drawFocus) {
        const context = this._xySlider.getContext('2d');
        if (!context) {
            throw new Error('Unable to obtain canvas context');
        }
        context.clearRect(0, 0, this._xySlider.width, this._xySlider.height);
        // Draw dashed axes.
        context.save();
        context.setLineDash([1, 1]);
        context.strokeStyle = 'rgba(210, 210, 210, 0.8)';
        context.beginPath();
        context.moveTo(this._halfCanvasSize, 0);
        context.lineTo(this._halfCanvasSize, canvasSize);
        context.moveTo(0, this._halfCanvasSize);
        context.lineTo(canvasSize, this._halfCanvasSize);
        context.stroke();
        context.restore();
        const thumbPoint = this._sliderThumbPosition();
        // Draw 2D slider line.
        context.save();
        context.translate(this._halfCanvasSize, this._halfCanvasSize);
        context.lineWidth = 2;
        context.strokeStyle = 'rgba(130, 130, 130, 0.75)';
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(thumbPoint.x, thumbPoint.y);
        context.stroke();
        // Draw 2D slider thumb.
        if (drawFocus) {
            context.beginPath();
            context.fillStyle = 'rgba(66, 133, 244, 0.4)';
            context.arc(thumbPoint.x, thumbPoint.y, sliderThumbRadius + 2, 0, 2 * Math.PI);
            context.fill();
        }
        context.beginPath();
        context.fillStyle = '#4285F4';
        context.arc(thumbPoint.x, thumbPoint.y, sliderThumbRadius, 0, 2 * Math.PI);
        context.fill();
        context.restore();
    }
    _onButtonClick(event) {
        const insetClicked = (event.currentTarget === this._insetButton);
        if (insetClicked && this._model.inset() || !insetClicked && !this._model.inset()) {
            return;
        }
        this._model.setInset(insetClicked);
        this._updateButtons();
        this.dispatchEventToListeners(Events.ShadowChanged, this._model);
    }
    _handleValueModification(event) {
        const target = event.currentTarget;
        const modifiedValue = UI.UIUtils.createReplacementString(target.value, event, customNumberHandler);
        if (!modifiedValue) {
            return;
        }
        const length = CSSLength.parse(modifiedValue);
        if (!length) {
            return;
        }
        if (event.currentTarget === this._blurInput && length.amount < 0) {
            length.amount = 0;
        }
        target.value = length.asCSSText();
        target.selectionStart = 0;
        target.selectionEnd = target.value.length;
        this._onTextInput(event);
        event.consume(true);
        function customNumberHandler(prefix, number, suffix) {
            if (!suffix.length) {
                suffix = defaultUnit;
            }
            return prefix + number + suffix;
        }
    }
    _onTextInput(event) {
        const currentTarget = event.currentTarget;
        this._changedElement = currentTarget;
        this._changedElement.classList.remove('invalid');
        const length = CSSLength.parse(currentTarget.value);
        if (!length || currentTarget === this._blurInput && length.amount < 0) {
            return;
        }
        if (currentTarget === this._xInput) {
            this._model.setOffsetX(length);
            this._updateCanvas(false);
        }
        else if (currentTarget === this._yInput) {
            this._model.setOffsetY(length);
            this._updateCanvas(false);
        }
        else if (currentTarget === this._blurInput) {
            this._model.setBlurRadius(length);
            this._blurSlider.value = length.amount.toString();
        }
        else if (currentTarget === this._spreadInput) {
            this._model.setSpreadRadius(length);
            this._spreadSlider.value = length.amount.toString();
        }
        this.dispatchEventToListeners(Events.ShadowChanged, this._model);
    }
    _onTextBlur() {
        if (!this._changedElement) {
            return;
        }
        let length = !this._changedElement.value.trim() ? CSSLength.zero() : CSSLength.parse(this._changedElement.value);
        if (!length) {
            length = CSSLength.parse(this._changedElement.value + defaultUnit);
        }
        if (!length) {
            this._changedElement.classList.add('invalid');
            this._changedElement = null;
            return;
        }
        if (this._changedElement === this._xInput) {
            this._model.setOffsetX(length);
            this._xInput.value = length.asCSSText();
            this._updateCanvas(false);
        }
        else if (this._changedElement === this._yInput) {
            this._model.setOffsetY(length);
            this._yInput.value = length.asCSSText();
            this._updateCanvas(false);
        }
        else if (this._changedElement === this._blurInput) {
            if (length.amount < 0) {
                length = CSSLength.zero();
            }
            this._model.setBlurRadius(length);
            this._blurInput.value = length.asCSSText();
            this._blurSlider.value = length.amount.toString();
        }
        else if (this._changedElement === this._spreadInput) {
            this._model.setSpreadRadius(length);
            this._spreadInput.value = length.asCSSText();
            this._spreadSlider.value = length.amount.toString();
        }
        this._changedElement = null;
        this.dispatchEventToListeners(Events.ShadowChanged, this._model);
    }
    _onSliderInput(event) {
        if (event.currentTarget === this._blurSlider) {
            this._model.setBlurRadius(new CSSLength(Number(this._blurSlider.value), this._model.blurRadius().unit || defaultUnit));
            this._blurInput.value = this._model.blurRadius().asCSSText();
            this._blurInput.classList.remove('invalid');
        }
        else if (event.currentTarget === this._spreadSlider) {
            this._model.setSpreadRadius(new CSSLength(Number(this._spreadSlider.value), this._model.spreadRadius().unit || defaultUnit));
            this._spreadInput.value = this._model.spreadRadius().asCSSText();
            this._spreadInput.classList.remove('invalid');
        }
        this.dispatchEventToListeners(Events.ShadowChanged, this._model);
    }
    _dragStart(event) {
        this._xySlider.focus();
        this._updateCanvas(true);
        this._canvasOrigin = new UI.Geometry.Point(this._xySlider.totalOffsetLeft() + this._halfCanvasSize, this._xySlider.totalOffsetTop() + this._halfCanvasSize);
        const clickedPoint = new UI.Geometry.Point(event.x - this._canvasOrigin.x, event.y - this._canvasOrigin.y);
        const thumbPoint = this._sliderThumbPosition();
        if (clickedPoint.distanceTo(thumbPoint) >= sliderThumbRadius) {
            this._dragMove(event);
        }
        return true;
    }
    _dragMove(event) {
        let point = new UI.Geometry.Point(event.x - this._canvasOrigin.x, event.y - this._canvasOrigin.y);
        if (event.shiftKey) {
            point = this._snapToClosestDirection(point);
        }
        const constrainedPoint = this._constrainPoint(point, this._innerCanvasSize);
        const newX = Math.round((constrainedPoint.x / this._innerCanvasSize) * maxRange);
        const newY = Math.round((constrainedPoint.y / this._innerCanvasSize) * maxRange);
        if (event.shiftKey) {
            this._model.setOffsetX(new CSSLength(newX, this._model.offsetX().unit || defaultUnit));
            this._model.setOffsetY(new CSSLength(newY, this._model.offsetY().unit || defaultUnit));
        }
        else {
            if (!event.altKey) {
                this._model.setOffsetX(new CSSLength(newX, this._model.offsetX().unit || defaultUnit));
            }
            if (!UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlOrMeta(event)) {
                this._model.setOffsetY(new CSSLength(newY, this._model.offsetY().unit || defaultUnit));
            }
        }
        this._xInput.value = this._model.offsetX().asCSSText();
        this._yInput.value = this._model.offsetY().asCSSText();
        this._xInput.classList.remove('invalid');
        this._yInput.classList.remove('invalid');
        this._updateCanvas(true);
        this.dispatchEventToListeners(Events.ShadowChanged, this._model);
    }
    _onCanvasBlur() {
        this._updateCanvas(false);
    }
    _onCanvasArrowKey(event) {
        const keyboardEvent = event;
        let shiftX = 0;
        let shiftY = 0;
        if (keyboardEvent.key === 'ArrowRight') {
            shiftX = 1;
        }
        else if (keyboardEvent.key === 'ArrowLeft') {
            shiftX = -1;
        }
        else if (keyboardEvent.key === 'ArrowUp') {
            shiftY = -1;
        }
        else if (keyboardEvent.key === 'ArrowDown') {
            shiftY = 1;
        }
        if (!shiftX && !shiftY) {
            return;
        }
        event.consume(true);
        if (shiftX) {
            const offsetX = this._model.offsetX();
            const newAmount = Platform.NumberUtilities.clamp(offsetX.amount + shiftX, -maxRange, maxRange);
            if (newAmount === offsetX.amount) {
                return;
            }
            this._model.setOffsetX(new CSSLength(newAmount, offsetX.unit || defaultUnit));
            this._xInput.value = this._model.offsetX().asCSSText();
            this._xInput.classList.remove('invalid');
        }
        if (shiftY) {
            const offsetY = this._model.offsetY();
            const newAmount = Platform.NumberUtilities.clamp(offsetY.amount + shiftY, -maxRange, maxRange);
            if (newAmount === offsetY.amount) {
                return;
            }
            this._model.setOffsetY(new CSSLength(newAmount, offsetY.unit || defaultUnit));
            this._yInput.value = this._model.offsetY().asCSSText();
            this._yInput.classList.remove('invalid');
        }
        this._updateCanvas(true);
        this.dispatchEventToListeners(Events.ShadowChanged, this._model);
    }
    _constrainPoint(point, max) {
        if (Math.abs(point.x) <= max && Math.abs(point.y) <= max) {
            return new UI.Geometry.Point(point.x, point.y);
        }
        return point.scale(max / Math.max(Math.abs(point.x), Math.abs(point.y)));
    }
    _snapToClosestDirection(point) {
        let minDistance = Number.MAX_VALUE;
        let closestPoint = point;
        const directions = [
            new UI.Geometry.Point(0, -1), new UI.Geometry.Point(1, -1), new UI.Geometry.Point(1, 0),
            new UI.Geometry.Point(1, 1), // Southeast
        ];
        for (const direction of directions) {
            const projection = point.projectOn(direction);
            const distance = point.distanceTo(projection);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = projection;
            }
        }
        return closestPoint;
    }
    _sliderThumbPosition() {
        const x = (this._model.offsetX().amount / maxRange) * this._innerCanvasSize;
        const y = (this._model.offsetY().amount / maxRange) * this._innerCanvasSize;
        return this._constrainPoint(new UI.Geometry.Point(x, y), this._innerCanvasSize);
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ShadowChanged"] = "ShadowChanged";
})(Events || (Events = {}));
//# sourceMappingURL=CSSShadowEditor.js.map