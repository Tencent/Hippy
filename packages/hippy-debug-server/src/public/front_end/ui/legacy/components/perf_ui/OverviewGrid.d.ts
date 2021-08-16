import * as Common from '../../../../core/common/common.js';
import type { Calculator } from './TimelineGrid.js';
import { TimelineGrid } from './TimelineGrid.js';
export declare class OverviewGrid {
    element: HTMLDivElement;
    _grid: TimelineGrid;
    _window: Window;
    constructor(prefix: string, calculator?: Calculator);
    clientWidth(): number;
    updateDividers(calculator: Calculator): void;
    addEventDividers(dividers: Element[]): void;
    removeEventDividers(): void;
    reset(): void;
    windowLeft(): number;
    windowRight(): number;
    setWindow(left: number, right: number): void;
    addEventListener(eventType: string | symbol, listener: (arg0: Common.EventTarget.EventTargetEvent) => void, thisObject?: Object): Common.EventTarget.EventDescriptor;
    setClickHandler(clickHandler: ((arg0: Event) => boolean) | null): void;
    zoom(zoomFactor: number, referencePoint: number): void;
    setResizeEnabled(enabled: boolean): void;
}
export declare const MinSelectableSize = 14;
export declare const WindowScrollSpeedFactor = 0.3;
export declare const ResizerOffset = 3.5;
export declare const OffsetFromWindowEnds = 10;
export declare class Window extends Common.ObjectWrapper.ObjectWrapper {
    _parentElement: Element;
    _calculator: Calculator | undefined;
    _leftResizeElement: HTMLElement;
    _rightResizeElement: HTMLElement;
    _leftCurtainElement: HTMLElement;
    _rightCurtainElement: HTMLElement;
    _overviewWindowSelector: WindowSelector | undefined;
    _offsetLeft: number;
    _dragStartPoint: number;
    _dragStartLeft: number;
    _dragStartRight: number;
    windowLeft?: number;
    windowRight?: number;
    _enabled?: boolean;
    _clickHandler?: ((arg0: Event) => boolean) | null;
    _resizerParentOffsetLeft?: number;
    constructor(parentElement: Element, dividersLabelBarElement?: Element, calculator?: Calculator);
    _onRightResizeElementFocused(): void;
    reset(): void;
    setEnabled(enabled: boolean): void;
    setClickHandler(clickHandler: ((arg0: Event) => boolean) | null): void;
    _resizerElementStartDragging(event: Event): boolean;
    _leftResizeElementDragging(event: Event): void;
    _rightResizeElementDragging(event: Event): void;
    _handleKeyboardResizing(event: Event, moveRightResizer?: boolean): void;
    _getNewResizerPosition(offset: number, increment?: boolean, ctrlPressed?: boolean): number;
    _startWindowSelectorDragging(event: Event): boolean;
    _windowSelectorDragging(event: Event): void;
    _endWindowSelectorDragging(event: Event): void;
    _startWindowDragging(event: Event): boolean;
    _windowDragging(event: Event): void;
    _resizeWindowLeft(start: number): void;
    _resizeWindowRight(end: number): void;
    _resizeWindowMaximum(): void;
    _getRawSliderValue(leftSlider?: boolean): number;
    _updateResizeElementPositionValue(leftValue: number, rightValue: number): void;
    _updateResizeElementPositionLabels(): void;
    _updateResizeElementPercentageLabels(leftValue: string, rightValue: string): void;
    _calculateWindowPosition(): {
        rawStartValue: number;
        rawEndValue: number;
    };
    _setWindow(windowLeft: number, windowRight: number): void;
    _updateCurtains(): void;
    _setWindowPosition(start: number | null, end: number | null): void;
    _onMouseWheel(event: Event): void;
    _zoom(factor: number, reference: number): void;
}
export declare enum Events {
    WindowChanged = "WindowChanged"
}
export declare class WindowSelector {
    _startPosition: number;
    _width: number;
    _windowSelector: HTMLDivElement;
    constructor(parent: Element, position: number);
    _close(position: number): {
        start: number;
        end: number;
    };
    _updatePosition(position: number): void;
}
