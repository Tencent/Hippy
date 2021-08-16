import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AnimationGroupPreviewUI } from './AnimationGroupPreviewUI.js';
import type { AnimationEffect, AnimationGroup, AnimationImpl } from './AnimationModel.js';
import { AnimationModel } from './AnimationModel.js';
import { AnimationUI } from './AnimationUI.js';
export declare class AnimationTimeline extends UI.Widget.VBox implements SDK.TargetManager.SDKModelObserver<AnimationModel> {
    _gridWrapper: HTMLElement;
    _grid: Element;
    _playbackRate: number;
    _allPaused: boolean;
    _animationsContainer: HTMLElement;
    _playbackRateButtons: HTMLElement[];
    _previewContainer: HTMLElement;
    _timelineScrubber: HTMLElement;
    _currentTime: HTMLElement;
    _popoverHelper: UI.PopoverHelper.PopoverHelper;
    _clearButton: UI.Toolbar.ToolbarButton;
    _selectedGroup: AnimationGroup | null;
    _renderQueue: AnimationUI[];
    _defaultDuration: number;
    _duration: number;
    _timelineControlsWidth: number;
    _nodesMap: Map<number, NodeUI>;
    _uiAnimations: AnimationUI[];
    _groupBuffer: AnimationGroup[];
    _previewMap: Map<AnimationGroup, AnimationGroupPreviewUI>;
    _symbol: symbol;
    _animationsMap: Map<string, AnimationImpl>;
    _timelineScrubberLine?: HTMLElement;
    _pauseButton?: UI.Toolbar.ToolbarToggle;
    _controlButton?: UI.Toolbar.ToolbarToggle;
    _controlState?: ControlState;
    _redrawing?: boolean;
    _cachedTimelineWidth?: number;
    _cachedTimelineHeight?: number;
    _scrubberPlayer?: Animation;
    _gridOffsetLeft?: number;
    _originalScrubberTime?: number | null;
    _originalMousePosition?: number;
    private constructor();
    static instance(): AnimationTimeline;
    wasShown(): void;
    willHide(): void;
    modelAdded(animationModel: AnimationModel): void;
    modelRemoved(animationModel: AnimationModel): void;
    _addEventListeners(animationModel: AnimationModel): void;
    _removeEventListeners(animationModel: AnimationModel): void;
    _nodeChanged(): void;
    _createScrubber(): HTMLElement;
    _createHeader(): HTMLElement;
    _handlePlaybackRateControlKeyDown(event: Event): void;
    _focusNextPlaybackRateButton(target: EventTarget | null, focusPrevious?: boolean): void;
    _getPopoverRequest(event: Event): UI.PopoverHelper.PopoverRequest | null;
    _togglePauseAll(): void;
    _setPlaybackRate(playbackRate: number): void;
    _updatePlaybackControls(): void;
    _controlButtonToggle(): void;
    _updateControlButton(): void;
    _effectivePlaybackRate(): number;
    _togglePause(pause: boolean): void;
    _replay(): void;
    duration(): number;
    setDuration(duration: number): void;
    _clearTimeline(): void;
    _reset(): void;
    _animationGroupStarted(event: Common.EventTarget.EventTargetEvent): void;
    _addAnimationGroup(group: AnimationGroup): void;
    _handleAnimationGroupKeyDown(group: AnimationGroup, event: KeyboardEvent): void;
    _focusNextGroup(group: AnimationGroup, target: EventTarget | null, focusPrevious?: boolean): void;
    _removeAnimationGroup(group: AnimationGroup, event: Event): void;
    _selectAnimationGroup(group: AnimationGroup): void;
    _addAnimation(animation: AnimationImpl): void;
    _nodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _renderGrid(): void;
    scheduleRedraw(): void;
    _render(timestamp?: number): void;
    onResize(): void;
    width(): number;
    _resizeWindow(animation: AnimationImpl): boolean;
    _syncScrubber(): void;
    _animateTime(currentTime: number): void;
    pixelMsRatio(): number;
    _updateScrubber(_timestamp: number): void;
    _repositionScrubber(event: Event): boolean;
    _scrubberDragStart(event: Event): boolean;
    _scrubberDragMove(event: Event): void;
    _scrubberDragEnd(_event: Event): void;
}
export declare const GlobalPlaybackRates: number[];
declare const enum ControlState {
    Play = "play-outline",
    Replay = "replay-outline",
    Pause = "pause-outline"
}
export declare class NodeUI {
    element: HTMLDivElement;
    _description: HTMLElement;
    _timelineElement: HTMLElement;
    _node?: SDK.DOMModel.DOMNode | null;
    constructor(_animationEffect: AnimationEffect);
    nodeResolved(node: SDK.DOMModel.DOMNode | null): void;
    createNewRow(): Element;
    nodeRemoved(): void;
    _nodeChanged(): void;
}
export declare class StepTimingFunction {
    steps: number;
    stepAtPosition: string;
    constructor(steps: number, stepAtPosition: string);
    static parse(text: string): StepTimingFunction | null;
}
export {};
