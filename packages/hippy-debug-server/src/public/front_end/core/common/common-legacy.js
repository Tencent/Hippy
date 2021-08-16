// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as CommonModule from './common.js';
self.Common = self.Common || {};
Common = Common || {};
/**
 * @interface
 */
Common.App = CommonModule.App.App;
/**
 * @interface
 */
Common.AppProvider = CommonModule.AppProvider.AppProvider;
/**
 * @constructor
 */
Common.Color = CommonModule.Color.Color;
/**
 * @enum {string}
 */
Common.Color.Format = CommonModule.Color.Format;
Common.Color.Nicknames = CommonModule.Color.Nicknames;
Common.console = CommonModule.Console.Console.instance();
/**
 * @constructor
 */
Common.Console = CommonModule.Console.Console;
/**
 * @interface
 */
Common.EventTarget = CommonModule.EventTarget.EventTarget;
/**
 * @interface
 */
Common.JavaScriptMetadata = CommonModule.JavaScriptMetaData.JavaScriptMetaData;
/**
 * @interface
 */
Common.Linkifier = CommonModule.Linkifier.Linkifier;
/**
 * @constructor
 */
Common.Object = CommonModule.ObjectWrapper.ObjectWrapper;
/**
 * @constructor
 */
Common.ParsedURL = CommonModule.ParsedURL.ParsedURL;
/**
 * @interface
 */
Common.Progress = CommonModule.Progress.Progress;
/**
 * @constructor
 */
Common.CompositeProgress = CommonModule.Progress.CompositeProgress;
/**
 * @interface
 */
Common.QueryParamHandler = CommonModule.QueryParamHandler.QueryParamHandler;
/**
 * @enum {!CommonModule.ResourceType.ResourceType}
 */
Common.resourceTypes = CommonModule.ResourceType.resourceTypes;
/**
 * @interface
 */
Common.Revealer = CommonModule.Revealer.Revealer;
Common.Revealer.reveal = CommonModule.Revealer.reveal;
Common.Revealer.setRevealForTest = CommonModule.Revealer.setRevealForTest;
/**
 * @constructor
 */
Common.Segment = CommonModule.SegmentedRange.Segment;
/**
 * @constructor
 */
Common.SegmentedRange = CommonModule.SegmentedRange.SegmentedRange;
/**
 * @constructor
 */
Common.Settings = CommonModule.Settings.Settings;
Common.Settings.detectColorFormat = CommonModule.Settings.detectColorFormat;
Common.Setting = CommonModule.Settings.Setting;
Common.settingForTest = CommonModule.Settings.settingForTest;
/**
 * @constructor
 */
Common.VersionController = CommonModule.Settings.VersionController;
Common.moduleSetting = CommonModule.Settings.moduleSetting;
Common.StringOutputStream = CommonModule.StringOutputStream.StringOutputStream;
Common.Throttler = CommonModule.Throttler.Throttler;
Common.Trie = CommonModule.Trie.Trie;
/**
 * @type {!Common.Settings}
 */
Common.settings;
//# sourceMappingURL=common-legacy.js.map