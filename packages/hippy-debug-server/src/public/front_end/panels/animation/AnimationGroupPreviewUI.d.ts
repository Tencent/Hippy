import type { AnimationGroup } from './AnimationModel.js';
export declare class AnimationGroupPreviewUI {
    _model: AnimationGroup;
    element: HTMLDivElement;
    _removeButton: HTMLElement;
    _replayOverlayElement: HTMLElement;
    _svg: Element;
    _viewBoxHeight: number;
    constructor(model: AnimationGroup);
    _groupDuration(): number;
    removeButton(): Element;
    replay(): void;
    _render(): void;
}
