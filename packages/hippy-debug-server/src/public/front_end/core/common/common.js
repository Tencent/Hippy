// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as App from './App.js';
import * as AppProvider from './AppProvider.js';
import * as Base64 from './Base64.js';
import * as CharacterIdMap from './CharacterIdMap.js';
import * as Color from './Color.js';
import * as ColorUtils from './ColorUtils.js';
import * as Console from './Console.js';
import * as Debouncer from './Debouncer.js';
import * as EventTarget from './EventTarget.js';
import * as JavaScriptMetaData from './JavaScriptMetaData.js';
import * as Lazy from './Lazy.js';
import * as Linkifier from './Linkifier.js';
import * as ObjectWrapper from './Object.js';
import * as ParsedURL from './ParsedURL.js';
import * as Progress from './Progress.js';
import * as QueryParamHandler from './QueryParamHandler.js';
import * as ResourceType from './ResourceType.js';
import * as Revealer from './Revealer.js';
import * as Runnable from './Runnable.js';
import * as SegmentedRange from './SegmentedRange.js';
import * as Settings from './Settings.js';
import * as SimpleHistoryManager from './SimpleHistoryManager.js';
import * as StringOutputStream from './StringOutputStream.js';
import * as TextDictionary from './TextDictionary.js';
import * as Throttler from './Throttler.js';
import * as Trie from './Trie.js';
import * as WasmDisassembly from './WasmDisassembly.js';
import * as Worker from './Worker.js';
/* This is re-exported here because we moved UIString into platform from
 * common and wanted to avoid a huge rename of imports. A future CL will
 * update all references to `Common.UIString` to `Platform.UIString`.
 */
export { UIString } from '../platform/platform.js';
/**
 * @type {!Settings.Settings}
 */
// @ts-ignore typedef
export let settings;
export { App, AppProvider, Base64, CharacterIdMap, Color, ColorUtils, Console, Debouncer, EventTarget, JavaScriptMetaData, Lazy, Linkifier, ObjectWrapper, ParsedURL, Progress, QueryParamHandler, ResourceType, Revealer, Runnable, SegmentedRange, Settings, SimpleHistoryManager, StringOutputStream, TextDictionary, Throttler, Trie, Worker, WasmDisassembly, };
//# sourceMappingURL=common.js.map