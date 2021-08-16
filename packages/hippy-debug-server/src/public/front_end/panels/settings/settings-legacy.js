// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as SettingsModule from './settings.js';
self.Settings = self.Settings || {};
Settings = Settings || {};
/**
 * @constructor
 */
Settings.FrameworkIgnoreListSettingsTab = SettingsModule.FrameworkIgnoreListSettingsTab.FrameworkIgnoreListSettingsTab;
/**
 * @constructor
 */
Settings.SettingsScreen = SettingsModule.SettingsScreen.SettingsScreen;
/**
 * @implements {UI.ActionDelegate}
 * @constructor
 */
Settings.SettingsScreen.ActionDelegate = SettingsModule.SettingsScreen.ActionDelegate;
/**
 * @implements {Common.Revealer}
 * @constructor
 */
Settings.SettingsScreen.Revealer = SettingsModule.SettingsScreen.Revealer;
/**
 * @constructor
 */
Settings.GenericSettingsTab = SettingsModule.SettingsScreen.GenericSettingsTab;
/**
 * @constructor
 */
Settings.ExperimentsSettingsTab = SettingsModule.SettingsScreen.ExperimentsSettingsTab;
/**
 * @constructor
 */
Settings.KeybindsSettingsTab = SettingsModule.KeybindsSettingsTab.KeybindsSettingsTab;
//# sourceMappingURL=settings-legacy.js.map