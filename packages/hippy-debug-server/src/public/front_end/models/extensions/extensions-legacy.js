// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ExtensionsModule from './extensions.js';
self.Extensions = self.Extensions || {};
Extensions = Extensions || {};
Extensions.extensionAPI = {};
ExtensionsModule.ExtensionAPI.defineCommonExtensionSymbols(Extensions.extensionAPI);
/** @constructor */
Extensions.ExtensionSidebarPane = ExtensionsModule.ExtensionPanel.ExtensionSidebarPane;
/** @constructor */
Extensions.ExtensionServer = ExtensionsModule.ExtensionServer.ExtensionServer;
/** @enum {symbol} */
Extensions.ExtensionServer.Events = ExtensionsModule.ExtensionServer.Events;
/** @constructor */
Extensions.ExtensionStatus = ExtensionsModule.ExtensionServer.ExtensionStatus;
/** @constructor */
Extensions.ExtensionTraceProvider = ExtensionsModule.ExtensionTraceProvider.ExtensionTraceProvider;
/** @interface */
Extensions.TracingSession = ExtensionsModule.ExtensionTraceProvider.TracingSession;
//# sourceMappingURL=extensions-legacy.js.map