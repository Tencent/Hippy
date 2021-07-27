// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { OverlayModel } from './OverlayModel.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
export class ScreenCaptureModel extends SDKModel {
    _agent;
    _onScreencastFrame;
    _onScreencastVisibilityChanged;
    constructor(target) {
        super(target);
        this._agent = target.pageAgent();
        this._onScreencastFrame = null;
        this._onScreencastVisibilityChanged = null;
        target.registerPageDispatcher(this);
    }
    startScreencast(format, quality, maxWidth, maxHeight, everyNthFrame, onFrame, onVisibilityChanged) {
        this._onScreencastFrame = onFrame;
        this._onScreencastVisibilityChanged = onVisibilityChanged;
        this._agent.invoke_startScreencast({ format, quality, maxWidth, maxHeight, everyNthFrame });
    }
    stopScreencast() {
        this._onScreencastFrame = null;
        this._onScreencastVisibilityChanged = null;
        this._agent.invoke_stopScreencast();
    }
    async captureScreenshot(format, quality, clip) {
        await OverlayModel.muteHighlight();
        const result = await this._agent.invoke_captureScreenshot({ format, quality, clip, fromSurface: true, captureBeyondViewport: true });
        await OverlayModel.unmuteHighlight();
        return result.data;
    }
    async fetchLayoutMetrics() {
        const response = await this._agent.invoke_getLayoutMetrics();
        if (response.getError()) {
            return null;
        }
        return {
            viewportX: response.cssVisualViewport.pageX,
            viewportY: response.cssVisualViewport.pageY,
            viewportScale: response.cssVisualViewport.scale,
            contentWidth: response.cssContentSize.width,
            contentHeight: response.cssContentSize.height,
        };
    }
    screencastFrame({ data, metadata, sessionId }) {
        this._agent.invoke_screencastFrameAck({ sessionId });
        if (this._onScreencastFrame) {
            this._onScreencastFrame.call(null, data, metadata);
        }
    }
    screencastVisibilityChanged({ visible }) {
        if (this._onScreencastVisibilityChanged) {
            this._onScreencastVisibilityChanged.call(null, visible);
        }
    }
    backForwardCacheNotUsed(_params) {
    }
    domContentEventFired(_params) {
    }
    loadEventFired(_params) {
    }
    lifecycleEvent(_params) {
    }
    navigatedWithinDocument(_params) {
    }
    frameAttached(_params) {
    }
    frameNavigated(_params) {
    }
    documentOpened(_params) {
    }
    frameDetached(_params) {
    }
    frameStartedLoading(_params) {
    }
    frameStoppedLoading(_params) {
    }
    frameRequestedNavigation(_params) {
    }
    frameScheduledNavigation(_params) {
    }
    frameClearedScheduledNavigation(_params) {
    }
    frameResized() {
    }
    javascriptDialogOpening(_params) {
    }
    javascriptDialogClosed(_params) {
    }
    interstitialShown() {
    }
    interstitialHidden() {
    }
    windowOpen(_params) {
    }
    fileChooserOpened(_params) {
    }
    compilationCacheProduced(_params) {
    }
    downloadWillBegin(_params) {
    }
    downloadProgress() {
    }
}
SDKModel.register(ScreenCaptureModel, { capabilities: Capability.ScreenCapture, autostart: false });
//# sourceMappingURL=ScreenCaptureModel.js.map