// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as SDK from '../../core/sdk/sdk.js';
export class AnimationModel extends SDK.SDKModel.SDKModel {
    _runtimeModel;
    _agent;
    _animationsById;
    _animationGroups;
    _pendingAnimations;
    _playbackRate;
    _screenshotCapture;
    _enabled;
    constructor(target) {
        super(target);
        this._runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        this._agent = target.animationAgent();
        target.registerAnimationDispatcher(new AnimationDispatcher(this));
        this._animationsById = new Map();
        this._animationGroups = new Map();
        this._pendingAnimations = new Set();
        this._playbackRate = 1;
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.MainFrameNavigated, this._reset, this);
        const screenCaptureModel = target.model(SDK.ScreenCaptureModel.ScreenCaptureModel);
        if (screenCaptureModel) {
            this._screenshotCapture = new ScreenshotCapture(this, screenCaptureModel);
        }
    }
    _reset() {
        this._animationsById.clear();
        this._animationGroups.clear();
        this._pendingAnimations.clear();
        this.dispatchEventToListeners(Events.ModelReset);
    }
    animationCreated(id) {
        this._pendingAnimations.add(id);
    }
    _animationCanceled(id) {
        this._pendingAnimations.delete(id);
        this._flushPendingAnimationsIfNeeded();
    }
    animationStarted(payload) {
        // We are not interested in animations without effect or target.
        if (!payload.source || !payload.source.backendNodeId) {
            return;
        }
        const animation = AnimationImpl.parsePayload(this, payload);
        if (!animation) {
            return;
        }
        // Ignore Web Animations custom effects & groups.
        const keyframesRule = animation.source().keyframesRule();
        if (animation.type() === 'WebAnimation' && keyframesRule && keyframesRule.keyframes().length === 0) {
            this._pendingAnimations.delete(animation.id());
        }
        else {
            this._animationsById.set(animation.id(), animation);
            this._pendingAnimations.add(animation.id());
        }
        this._flushPendingAnimationsIfNeeded();
    }
    _flushPendingAnimationsIfNeeded() {
        for (const id of this._pendingAnimations) {
            if (!this._animationsById.get(id)) {
                return;
            }
        }
        while (this._pendingAnimations.size) {
            this._matchExistingGroups(this._createGroupFromPendingAnimations());
        }
    }
    _matchExistingGroups(incomingGroup) {
        let matchedGroup = null;
        for (const group of this._animationGroups.values()) {
            if (group._matches(incomingGroup)) {
                matchedGroup = group;
                group._update(incomingGroup);
                break;
            }
        }
        if (!matchedGroup) {
            this._animationGroups.set(incomingGroup.id(), incomingGroup);
            if (this._screenshotCapture) {
                this._screenshotCapture.captureScreenshots(incomingGroup.finiteDuration(), incomingGroup._screenshots);
            }
        }
        this.dispatchEventToListeners(Events.AnimationGroupStarted, matchedGroup || incomingGroup);
        return Boolean(matchedGroup);
    }
    _createGroupFromPendingAnimations() {
        console.assert(this._pendingAnimations.size > 0);
        const firstAnimationId = this._pendingAnimations.values().next().value;
        this._pendingAnimations.delete(firstAnimationId);
        const firstAnimation = this._animationsById.get(firstAnimationId);
        if (!firstAnimation) {
            throw new Error('Unable to locate first animation');
        }
        const groupedAnimations = [firstAnimation];
        const groupStartTime = firstAnimation.startTime();
        const remainingAnimations = new Set();
        for (const id of this._pendingAnimations) {
            const anim = this._animationsById.get(id);
            if (anim.startTime() === groupStartTime) {
                groupedAnimations.push(anim);
            }
            else {
                remainingAnimations.add(id);
            }
        }
        this._pendingAnimations = remainingAnimations;
        return new AnimationGroup(this, firstAnimationId, groupedAnimations);
    }
    setPlaybackRate(playbackRate) {
        this._playbackRate = playbackRate;
        this._agent.invoke_setPlaybackRate({ playbackRate });
    }
    _releaseAnimations(animations) {
        this._agent.invoke_releaseAnimations({ animations });
    }
    async suspendModel() {
        this._reset();
        await this._agent.invoke_disable();
    }
    async resumeModel() {
        if (!this._enabled) {
            return;
        }
        await this._agent.invoke_enable();
    }
    async ensureEnabled() {
        if (this._enabled) {
            return;
        }
        await this._agent.invoke_enable();
        this._enabled = true;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["AnimationGroupStarted"] = "AnimationGroupStarted";
    Events["ModelReset"] = "ModelReset";
})(Events || (Events = {}));
export class AnimationImpl {
    _animationModel;
    _payload;
    _source;
    _playState;
    constructor(animationModel, payload) {
        this._animationModel = animationModel;
        this._payload = payload;
        this._source = new AnimationEffect(animationModel, this._payload.source);
    }
    static parsePayload(animationModel, payload) {
        return new AnimationImpl(animationModel, payload);
    }
    payload() {
        return this._payload;
    }
    id() {
        return this._payload.id;
    }
    name() {
        return this._payload.name;
    }
    paused() {
        return this._payload.pausedState;
    }
    playState() {
        return this._playState || this._payload.playState;
    }
    setPlayState(playState) {
        this._playState = playState;
    }
    playbackRate() {
        return this._payload.playbackRate;
    }
    startTime() {
        return this._payload.startTime;
    }
    endTime() {
        if (!this.source().iterations) {
            return Infinity;
        }
        return this.startTime() + this.source().delay() + this.source().duration() * this.source().iterations() +
            this.source().endDelay();
    }
    _finiteDuration() {
        const iterations = Math.min(this.source().iterations(), 3);
        return this.source().delay() + this.source().duration() * iterations;
    }
    currentTime() {
        return this._payload.currentTime;
    }
    source() {
        return this._source;
    }
    type() {
        return this._payload.type;
    }
    overlaps(animation) {
        // Infinite animations
        if (!this.source().iterations() || !animation.source().iterations()) {
            return true;
        }
        const firstAnimation = this.startTime() < animation.startTime() ? this : animation;
        const secondAnimation = firstAnimation === this ? animation : this;
        return firstAnimation.endTime() >= secondAnimation.startTime();
    }
    setTiming(duration, delay) {
        this._source.node().then(node => {
            if (!node) {
                throw new Error('Unable to find node');
            }
            this._updateNodeStyle(duration, delay, node);
        });
        this._source._duration = duration;
        this._source._delay = delay;
        this._animationModel._agent.invoke_setTiming({ animationId: this.id(), duration, delay });
    }
    _updateNodeStyle(duration, delay, node) {
        let animationPrefix;
        if (this.type() === "CSSTransition" /* CSSTransition */) {
            animationPrefix = 'transition-';
        }
        else if (this.type() === "CSSAnimation" /* CSSAnimation */) {
            animationPrefix = 'animation-';
        }
        else {
            return;
        }
        if (!node.id) {
            throw new Error('Node has no id');
        }
        const cssModel = node.domModel().cssModel();
        cssModel.setEffectivePropertyValueForNode(node.id, animationPrefix + 'duration', duration + 'ms');
        cssModel.setEffectivePropertyValueForNode(node.id, animationPrefix + 'delay', delay + 'ms');
    }
    async remoteObjectPromise() {
        const payload = await this._animationModel._agent.invoke_resolveAnimation({ animationId: this.id() });
        if (!payload) {
            return null;
        }
        return this._animationModel._runtimeModel.createRemoteObject(payload.remoteObject);
    }
    _cssId() {
        return this._payload.cssId || '';
    }
}
export class AnimationEffect {
    _animationModel;
    _payload;
    _keyframesRule;
    _delay;
    _duration;
    _deferredNode;
    constructor(animationModel, payload) {
        this._animationModel = animationModel;
        this._payload = payload;
        if (payload.keyframesRule) {
            this._keyframesRule = new KeyframesRule(payload.keyframesRule);
        }
        this._delay = this._payload.delay;
        this._duration = this._payload.duration;
    }
    delay() {
        return this._delay;
    }
    endDelay() {
        return this._payload.endDelay;
    }
    iterationStart() {
        return this._payload.iterationStart;
    }
    iterations() {
        // Animations with zero duration, zero delays and infinite iterations can't be shown.
        if (!this.delay() && !this.endDelay() && !this.duration()) {
            return 0;
        }
        return this._payload.iterations || Infinity;
    }
    duration() {
        return this._duration;
    }
    direction() {
        return this._payload.direction;
    }
    fill() {
        return this._payload.fill;
    }
    node() {
        if (!this._deferredNode) {
            this._deferredNode = new SDK.DOMModel.DeferredDOMNode(this._animationModel.target(), this.backendNodeId());
        }
        return this._deferredNode.resolvePromise();
    }
    deferredNode() {
        return new SDK.DOMModel.DeferredDOMNode(this._animationModel.target(), this.backendNodeId());
    }
    backendNodeId() {
        return this._payload.backendNodeId;
    }
    keyframesRule() {
        return this._keyframesRule || null;
    }
    easing() {
        return this._payload.easing;
    }
}
export class KeyframesRule {
    _payload;
    _keyframes;
    constructor(payload) {
        this._payload = payload;
        this._keyframes = this._payload.keyframes.map(function (keyframeStyle) {
            return new KeyframeStyle(keyframeStyle);
        });
    }
    _setKeyframesPayload(payload) {
        this._keyframes = payload.map(function (keyframeStyle) {
            return new KeyframeStyle(keyframeStyle);
        });
    }
    name() {
        return this._payload.name;
    }
    keyframes() {
        return this._keyframes;
    }
}
export class KeyframeStyle {
    _payload;
    _offset;
    constructor(payload) {
        this._payload = payload;
        this._offset = this._payload.offset;
    }
    offset() {
        return this._offset;
    }
    setOffset(offset) {
        this._offset = offset * 100 + '%';
    }
    offsetAsNumber() {
        return parseFloat(this._offset) / 100;
    }
    easing() {
        return this._payload.easing;
    }
}
export class AnimationGroup {
    _animationModel;
    _id;
    _animations;
    _paused;
    _screenshots;
    _screenshotImages;
    constructor(animationModel, id, animations) {
        this._animationModel = animationModel;
        this._id = id;
        this._animations = animations;
        this._paused = false;
        this._screenshots = [];
        this._screenshotImages = [];
    }
    id() {
        return this._id;
    }
    animations() {
        return this._animations;
    }
    release() {
        this._animationModel._animationGroups.delete(this.id());
        this._animationModel._releaseAnimations(this._animationIds());
    }
    _animationIds() {
        function extractId(animation) {
            return animation.id();
        }
        return this._animations.map(extractId);
    }
    startTime() {
        return this._animations[0].startTime();
    }
    finiteDuration() {
        let maxDuration = 0;
        for (let i = 0; i < this._animations.length; ++i) {
            maxDuration = Math.max(maxDuration, this._animations[i]._finiteDuration());
        }
        return maxDuration;
    }
    seekTo(currentTime) {
        this._animationModel._agent.invoke_seekAnimations({ animations: this._animationIds(), currentTime });
    }
    paused() {
        return this._paused;
    }
    togglePause(paused) {
        if (paused === this._paused) {
            return;
        }
        this._paused = paused;
        this._animationModel._agent.invoke_setPaused({ animations: this._animationIds(), paused });
    }
    currentTimePromise() {
        let longestAnim = null;
        for (const anim of this._animations) {
            if (!longestAnim || anim.endTime() > longestAnim.endTime()) {
                longestAnim = anim;
            }
        }
        if (!longestAnim) {
            throw new Error('No longest animation found');
        }
        return this._animationModel._agent.invoke_getCurrentTime({ id: longestAnim.id() })
            .then(({ currentTime }) => currentTime || 0);
    }
    _matches(group) {
        function extractId(anim) {
            if (anim.type() === "WebAnimation" /* WebAnimation */) {
                return anim.type() + anim.id();
            }
            return anim._cssId();
        }
        if (this._animations.length !== group._animations.length) {
            return false;
        }
        const left = this._animations.map(extractId).sort();
        const right = group._animations.map(extractId).sort();
        for (let i = 0; i < left.length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }
    _update(group) {
        this._animationModel._releaseAnimations(this._animationIds());
        this._animations = group._animations;
    }
    screenshots() {
        for (let i = 0; i < this._screenshots.length; ++i) {
            const image = new Image();
            image.src = 'data:image/jpeg;base64,' + this._screenshots[i];
            this._screenshotImages.push(image);
        }
        this._screenshots = [];
        return this._screenshotImages;
    }
}
export class AnimationDispatcher {
    _animationModel;
    constructor(animationModel) {
        this._animationModel = animationModel;
    }
    animationCreated({ id }) {
        this._animationModel.animationCreated(id);
    }
    animationCanceled({ id }) {
        this._animationModel._animationCanceled(id);
    }
    animationStarted({ animation }) {
        this._animationModel.animationStarted(animation);
    }
}
export class ScreenshotCapture {
    _requests;
    _screenCaptureModel;
    _animationModel;
    _stopTimer;
    _endTime;
    _capturing;
    constructor(animationModel, screenCaptureModel) {
        this._requests = [];
        this._screenCaptureModel = screenCaptureModel;
        this._animationModel = animationModel;
        this._animationModel.addEventListener(Events.ModelReset, this._stopScreencast, this);
    }
    captureScreenshots(duration, screenshots) {
        const screencastDuration = Math.min(duration / this._animationModel._playbackRate, 3000);
        const endTime = screencastDuration + window.performance.now();
        this._requests.push({ endTime: endTime, screenshots: screenshots });
        if (!this._endTime || endTime > this._endTime) {
            clearTimeout(this._stopTimer);
            this._stopTimer = window.setTimeout(this._stopScreencast.bind(this), screencastDuration);
            this._endTime = endTime;
        }
        if (this._capturing) {
            return;
        }
        this._capturing = true;
        this._screenCaptureModel.startScreencast("jpeg" /* Jpeg */, 80, undefined, 300, 2, this._screencastFrame.bind(this), _visible => { });
    }
    _screencastFrame(base64Data, _metadata) {
        function isAnimating(request) {
            return request.endTime >= now;
        }
        if (!this._capturing) {
            return;
        }
        const now = window.performance.now();
        this._requests = this._requests.filter(isAnimating);
        for (const request of this._requests) {
            request.screenshots.push(base64Data);
        }
    }
    _stopScreencast() {
        if (!this._capturing) {
            return;
        }
        delete this._stopTimer;
        delete this._endTime;
        this._requests = [];
        this._capturing = false;
        this._screenCaptureModel.stopScreencast();
    }
}
SDK.SDKModel.SDKModel.register(AnimationModel, { capabilities: SDK.Target.Capability.DOM, autostart: false });
//# sourceMappingURL=AnimationModel.js.map