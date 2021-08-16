import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
export declare class AnimationModel extends SDK.SDKModel.SDKModel {
    _runtimeModel: SDK.RuntimeModel.RuntimeModel;
    _agent: ProtocolProxyApi.AnimationApi;
    _animationsById: Map<string, AnimationImpl>;
    _animationGroups: Map<string, AnimationGroup>;
    _pendingAnimations: Set<string>;
    _playbackRate: number;
    _screenshotCapture?: ScreenshotCapture;
    _enabled?: boolean;
    constructor(target: SDK.Target.Target);
    _reset(): void;
    animationCreated(id: string): void;
    _animationCanceled(id: string): void;
    animationStarted(payload: Protocol.Animation.Animation): void;
    _flushPendingAnimationsIfNeeded(): void;
    _matchExistingGroups(incomingGroup: AnimationGroup): boolean;
    _createGroupFromPendingAnimations(): AnimationGroup;
    setPlaybackRate(playbackRate: number): void;
    _releaseAnimations(animations: string[]): void;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    ensureEnabled(): Promise<void>;
}
export declare enum Events {
    AnimationGroupStarted = "AnimationGroupStarted",
    ModelReset = "ModelReset"
}
export declare class AnimationImpl {
    _animationModel: AnimationModel;
    _payload: Protocol.Animation.Animation;
    _source: AnimationEffect;
    _playState?: string;
    constructor(animationModel: AnimationModel, payload: Protocol.Animation.Animation);
    static parsePayload(animationModel: AnimationModel, payload: Protocol.Animation.Animation): AnimationImpl;
    payload(): Protocol.Animation.Animation;
    id(): string;
    name(): string;
    paused(): boolean;
    playState(): string;
    setPlayState(playState: string): void;
    playbackRate(): number;
    startTime(): number;
    endTime(): number;
    _finiteDuration(): number;
    currentTime(): number;
    source(): AnimationEffect;
    type(): Protocol.Animation.AnimationType;
    overlaps(animation: AnimationImpl): boolean;
    setTiming(duration: number, delay: number): void;
    _updateNodeStyle(duration: number, delay: number, node: SDK.DOMModel.DOMNode): void;
    remoteObjectPromise(): Promise<SDK.RemoteObject.RemoteObject | null>;
    _cssId(): string;
}
export declare class AnimationEffect {
    _animationModel: AnimationModel;
    _payload: Protocol.Animation.AnimationEffect;
    _keyframesRule: KeyframesRule | undefined;
    _delay: number;
    _duration: number;
    _deferredNode?: SDK.DOMModel.DeferredDOMNode;
    constructor(animationModel: AnimationModel, payload: Protocol.Animation.AnimationEffect);
    delay(): number;
    endDelay(): number;
    iterationStart(): number;
    iterations(): number;
    duration(): number;
    direction(): string;
    fill(): string;
    node(): Promise<SDK.DOMModel.DOMNode | null>;
    deferredNode(): SDK.DOMModel.DeferredDOMNode;
    backendNodeId(): number;
    keyframesRule(): KeyframesRule | null;
    easing(): string;
}
export declare class KeyframesRule {
    _payload: Protocol.Animation.KeyframesRule;
    _keyframes: KeyframeStyle[];
    constructor(payload: Protocol.Animation.KeyframesRule);
    _setKeyframesPayload(payload: Protocol.Animation.KeyframeStyle[]): void;
    name(): string | undefined;
    keyframes(): KeyframeStyle[];
}
export declare class KeyframeStyle {
    _payload: Protocol.Animation.KeyframeStyle;
    _offset: string;
    constructor(payload: Protocol.Animation.KeyframeStyle);
    offset(): string;
    setOffset(offset: number): void;
    offsetAsNumber(): number;
    easing(): string;
}
export declare class AnimationGroup {
    _animationModel: AnimationModel;
    _id: string;
    _animations: AnimationImpl[];
    _paused: boolean;
    _screenshots: string[];
    _screenshotImages: HTMLImageElement[];
    constructor(animationModel: AnimationModel, id: string, animations: AnimationImpl[]);
    id(): string;
    animations(): AnimationImpl[];
    release(): void;
    _animationIds(): string[];
    startTime(): number;
    finiteDuration(): number;
    seekTo(currentTime: number): void;
    paused(): boolean;
    togglePause(paused: boolean): void;
    currentTimePromise(): Promise<number>;
    _matches(group: AnimationGroup): boolean;
    _update(group: AnimationGroup): void;
    screenshots(): HTMLImageElement[];
}
export declare class AnimationDispatcher implements ProtocolProxyApi.AnimationDispatcher {
    _animationModel: AnimationModel;
    constructor(animationModel: AnimationModel);
    animationCreated({ id }: Protocol.Animation.AnimationCreatedEvent): void;
    animationCanceled({ id }: Protocol.Animation.AnimationCanceledEvent): void;
    animationStarted({ animation }: Protocol.Animation.AnimationStartedEvent): void;
}
export declare class ScreenshotCapture {
    _requests: Request[];
    _screenCaptureModel: SDK.ScreenCaptureModel.ScreenCaptureModel;
    _animationModel: AnimationModel;
    _stopTimer?: number;
    _endTime?: number;
    _capturing?: boolean;
    constructor(animationModel: AnimationModel, screenCaptureModel: SDK.ScreenCaptureModel.ScreenCaptureModel);
    captureScreenshots(duration: number, screenshots: string[]): void;
    _screencastFrame(base64Data: string, _metadata: Protocol.Page.ScreencastFrameMetadata): void;
    _stopScreencast(): void;
}
export interface Request {
    endTime: number;
    screenshots: string[];
}
