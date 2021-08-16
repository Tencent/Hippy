import * as UI from '../../ui/legacy/legacy.js';
export declare class AnimationScreenshotPopover extends UI.Widget.VBox {
    _frames: HTMLImageElement[];
    _rafId: number;
    _currentFrame: number;
    _progressBar: HTMLElement;
    _showFrame?: boolean;
    _endDelay?: number;
    constructor(images: HTMLImageElement[]);
    wasShown(): void;
    willHide(): void;
    _changeFrame(): void;
}
