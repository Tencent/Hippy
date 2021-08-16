import * as UI from '../../legacy.js';
import { BezierUI } from './BezierUI.js';
export declare class BezierEditor extends UI.Widget.VBox {
    _bezier: UI.Geometry.CubicBezier;
    _previewElement: HTMLElement;
    _previewOnion: HTMLElement;
    _outerContainer: HTMLElement;
    _selectedCategory: PresetCategory | null;
    _presetsContainer: HTMLElement;
    _presetUI: BezierUI;
    _presetCategories: PresetCategory[];
    _curveUI: BezierUI;
    _curve: Element;
    _header: HTMLElement;
    _label: HTMLElement;
    _mouseDownPosition?: UI.Geometry.Point;
    _controlPosition?: UI.Geometry.Point;
    _selectedPoint?: number;
    _previewAnimation?: Animation;
    constructor(bezier: UI.Geometry.CubicBezier);
    setBezier(bezier: UI.Geometry.CubicBezier): void;
    bezier(): UI.Geometry.CubicBezier;
    wasShown(): void;
    _onchange(): void;
    _updateUI(): void;
    _dragStart(event: MouseEvent): boolean;
    _updateControlPosition(mouseX: number, mouseY: number): void;
    _dragMove(event: MouseEvent): void;
    _dragEnd(event: MouseEvent): void;
    _createCategory(presetGroup: {
        name: string;
        value: string;
    }[]): PresetCategory;
    _createPresetModifyIcon(parentElement: Element, className: string, drawPath: string): Element;
    _unselectPresets(): void;
    _presetCategorySelected(category: PresetCategory, event?: Event): void;
    _presetModifyClicked(intensify: boolean, _event: Event): void;
    _startPreviewAnimation(): void;
}
export declare enum Events {
    BezierChanged = "BezierChanged"
}
export declare const Presets: {
    name: string;
    value: string;
}[][];
export interface PresetCategory {
    presets: {
        name: string;
        value: string;
    }[];
    icon: Element;
    presetIndex: number;
}
