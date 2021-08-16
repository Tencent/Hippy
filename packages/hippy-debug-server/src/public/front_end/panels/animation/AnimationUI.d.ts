import * as Common from '../../core/common/common.js';
import type * as SDK from '../../core/sdk/sdk.js';
import type { AnimationImpl, KeyframeStyle } from './AnimationModel.js';
import type { AnimationTimeline } from './AnimationTimeline.js';
declare type CachedElement = {
    group: HTMLElement | null;
    animationLine: HTMLElement | null;
    keyframePoints: {
        [x: number]: HTMLElement;
    };
    keyframeRender: {
        [x: number]: HTMLElement;
    };
};
export declare class AnimationUI {
    _animation: AnimationImpl;
    _timeline: AnimationTimeline;
    _parentElement: Element;
    _keyframes?: KeyframeStyle[];
    _nameElement: HTMLElement;
    _svg: Element;
    _activeIntervalGroup: Element;
    _cachedElements: CachedElement[];
    _movementInMs: number;
    _keyboardMovementRateMs: number;
    _color: string;
    _node?: SDK.DOMModel.DOMNode | null;
    _delayLine?: Element;
    _endDelayLine?: Element;
    _tailGroup?: Element;
    _mouseEventType?: Events;
    _keyframeMoved?: number | null;
    _downMouseX?: number;
    constructor(animation: AnimationImpl, timeline: AnimationTimeline, parentElement: Element);
    static colorForAnimation(animation: AnimationImpl): string;
    static installDragHandleKeyboard(element: Element, elementDrag: (arg0: Event) => void): void;
    animation(): AnimationImpl;
    setNode(node: SDK.DOMModel.DOMNode | null): void;
    _createLine(parentElement: HTMLElement, className: string): Element;
    _drawAnimationLine(iteration: number, parentElement: HTMLElement): void;
    _drawDelayLine(parentElement: HTMLElement): void;
    _drawPoint(iteration: number, parentElement: Element, x: number, keyframeIndex: number, attachEvents: boolean): void;
    _renderKeyframe(iteration: number, keyframeIndex: number, parentElement: HTMLElement, leftDistance: number, width: number, easing: string): void;
    redraw(): void;
    _renderTransition(): void;
    _renderIteration(parentElement: Element, iteration: number): void;
    _delay(): number;
    _duration(): number;
    _offset(i: number): number;
    _mouseDown(mouseEventType: Events, keyframeIndex: number | null, event: Event): boolean;
    _mouseMove(event: Event): void;
    _setMovementAndRedraw(movement: number): void;
    _mouseUp(event: Event): void;
    _keydownMove(mouseEventType: Events, keyframeIndex: number | null, event: Event): void;
    _onContextMenu(event: Event): void;
}
export declare const enum Events {
    AnimationDrag = "AnimationDrag",
    KeyframeMove = "KeyframeMove",
    StartEndpointMove = "StartEndpointMove",
    FinishEndpointMove = "FinishEndpointMove"
}
export declare const Options: {
    AnimationHeight: number;
    AnimationSVGHeight: number;
    AnimationMargin: number;
    EndpointsClickRegionSize: number;
    GridCanvasHeight: number;
};
export declare const Colors: Map<string, Common.Color.Color | null>;
export {};
