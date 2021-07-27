import * as Common from '../../core/common/common.js';
export declare class ResizerWidget extends Common.ObjectWrapper.ObjectWrapper {
    _isEnabled: boolean;
    _elements: Set<HTMLElement>;
    _installDragOnMouseDownBound: (event: Event) => false | undefined;
    _cursor: string;
    _startX?: number;
    _startY?: number;
    constructor();
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    elements(): Element[];
    addElement(element: HTMLElement): void;
    removeElement(element: HTMLElement): void;
    updateElementCursors(): void;
    _updateElementCursor(element: HTMLElement): void;
    cursor(): string;
    setCursor(cursor: string): void;
    _installDragOnMouseDown(event: Event): false | undefined;
    _dragStart(event: MouseEvent): boolean;
    sendDragStart(x: number, y: number): void;
    _drag(event: MouseEvent): boolean;
    sendDragMove(startX: number, currentX: number, startY: number, currentY: number, shiftKey: boolean): void;
    _dragEnd(_event: MouseEvent): void;
}
export declare enum Events {
    ResizeStart = "ResizeStart",
    ResizeUpdate = "ResizeUpdate",
    ResizeEnd = "ResizeEnd"
}
export declare class SimpleResizerWidget extends ResizerWidget {
    _isVertical: boolean;
    constructor();
    isVertical(): boolean;
    /**
     * Vertical widget resizes height (along y-axis).
     */
    setVertical(vertical: boolean): void;
    cursor(): string;
    sendDragStart(x: number, y: number): void;
    sendDragMove(startX: number, currentX: number, startY: number, currentY: number, shiftKey: boolean): void;
}
