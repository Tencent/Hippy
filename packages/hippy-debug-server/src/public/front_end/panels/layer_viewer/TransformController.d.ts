import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class TransformController extends Common.ObjectWrapper.ObjectWrapper {
    _mode: Modes;
    _scale: number;
    _offsetX: number;
    _offsetY: number;
    _rotateX: number;
    _rotateY: number;
    _oldRotateX: number;
    _oldRotateY: number;
    _originX: number;
    _originY: number;
    element: HTMLElement;
    _minScale: number;
    _maxScale: number;
    _controlPanelToolbar: UI.Toolbar.Toolbar;
    _modeButtons: {
        [x: string]: UI.Toolbar.ToolbarToggle;
    };
    constructor(element: HTMLElement, disableRotate?: boolean);
    toolbar(): UI.Toolbar.Toolbar;
    _registerShortcuts(): void;
    _postChangeEvent(): void;
    _reset(): void;
    _setMode(mode: Modes): void;
    _updateModeButtons(): void;
    resetAndNotify(event?: Event): void;
    setScaleConstraints(minScale: number, maxScale: number): void;
    clampOffsets(minX: number, maxX: number, minY: number, maxY: number): void;
    scale(): number;
    offsetX(): number;
    offsetY(): number;
    rotateX(): number;
    rotateY(): number;
    _onScale(scaleFactor: number, x: number, y: number): void;
    _onPan(offsetX: number, offsetY: number): void;
    _onRotate(rotateX: number, rotateY: number): void;
    _onKeyboardZoom(zoomFactor: number): Promise<boolean>;
    _onKeyboardPanOrRotate(xMultiplier: number, yMultiplier: number): Promise<boolean>;
    _onMouseWheel(event: Event): void;
    _onDrag(event: Event): void;
    _onDragStart(event: MouseEvent): boolean;
    _onDragEnd(): void;
}
export declare enum Events {
    TransformChanged = "TransformChanged"
}
export declare const enum Modes {
    Pan = "Pan",
    Rotate = "Rotate"
}
