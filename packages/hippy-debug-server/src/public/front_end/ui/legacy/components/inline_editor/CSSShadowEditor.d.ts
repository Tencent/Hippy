import * as UI from '../../legacy.js';
import type { CSSShadowModel } from './CSSShadowModel.js';
export declare class CSSShadowEditor extends UI.Widget.VBox {
    _typeField: HTMLElement;
    _outsetButton: HTMLElement;
    _insetButton: HTMLElement;
    _xInput: HTMLInputElement;
    _yInput: HTMLInputElement;
    _xySlider: HTMLCanvasElement;
    _halfCanvasSize: number;
    _innerCanvasSize: number;
    _blurInput: HTMLInputElement;
    _blurSlider: HTMLInputElement;
    _spreadField: HTMLElement;
    _spreadInput: HTMLInputElement;
    _spreadSlider: HTMLInputElement;
    _model: CSSShadowModel;
    _canvasOrigin: UI.Geometry.Point;
    _changedElement?: HTMLInputElement | null;
    constructor();
    _createTextInput(field: Element, propertyName: string): HTMLInputElement;
    _createSlider(field: Element): HTMLInputElement;
    wasShown(): void;
    setModel(model: CSSShadowModel): void;
    _updateUI(): void;
    _updateButtons(): void;
    _updateCanvas(drawFocus: boolean): void;
    _onButtonClick(event: Event): void;
    _handleValueModification(event: Event): void;
    _onTextInput(event: Event): void;
    _onTextBlur(): void;
    _onSliderInput(event: Event): void;
    _dragStart(event: MouseEvent): boolean;
    _dragMove(event: MouseEvent): void;
    _onCanvasBlur(): void;
    _onCanvasArrowKey(event: Event): void;
    _constrainPoint(point: UI.Geometry.Point, max: number): UI.Geometry.Point;
    _snapToClosestDirection(point: UI.Geometry.Point): UI.Geometry.Point;
    _sliderThumbPosition(): UI.Geometry.Point;
}
export declare enum Events {
    ShadowChanged = "ShadowChanged"
}
