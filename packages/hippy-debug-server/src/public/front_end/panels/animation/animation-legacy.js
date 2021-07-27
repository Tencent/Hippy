// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as AnimationModule from './animation.js';
self.Animation = self.Animation || {};
/* global Animation:writable */
Animation = Animation || {};
/**
 * @constructor
 */
Animation.AnimationModel = AnimationModule.AnimationModel.AnimationModel;
/** @enum {symbol} */
Animation.AnimationModel.Events = AnimationModule.AnimationModel.Events;
/**
 * @constructor
 */
Animation.AnimationModel.Animation = AnimationModule.AnimationModel.AnimationImpl;
/**
 * @constructor
 */
Animation.AnimationModel.AnimationGroup = AnimationModule.AnimationModel.AnimationGroup;
/**
 * @constructor
 */
Animation.AnimationModel.ScreenshotCapture = AnimationModule.AnimationModel.ScreenshotCapture;
/**
 * @implements {SDK.SDKModelObserver<!Animation.AnimationModel>}
 * @constructor
 */
Animation.AnimationTimeline = AnimationModule.AnimationTimeline.AnimationTimeline;
/**
 * @constructor
 */
Animation.AnimationUI = AnimationModule.AnimationUI.AnimationUI;
/**
 * @enum {string}
 */
Animation.AnimationUI.Events = AnimationModule.AnimationUI.Events;
//# sourceMappingURL=animation-legacy.js.map