// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ProtocolClientModule from './protocol_client.js';
self.ProtocolClient = self.ProtocolClient || {};
ProtocolClient = ProtocolClient || {};
ProtocolClient.DevToolsStubErrorCode = ProtocolClientModule.InspectorBackend.DevToolsStubErrorCode;
ProtocolClient.SessionRouter = ProtocolClientModule.InspectorBackend.SessionRouter;
/** @constructor */
ProtocolClient.InspectorBackend = ProtocolClientModule.InspectorBackend.InspectorBackend;
ProtocolClient.InspectorBackend.ProtocolError = ProtocolClientModule.InspectorBackend.ProtocolError;
/** @interface */
ProtocolClient.Connection = ProtocolClientModule.InspectorBackend.Connection;
/** @type {!ProtocolClientModule.InspectorBackend.InspectorBackend} */
ProtocolClient.inspectorBackend = ProtocolClientModule.InspectorBackend.inspectorBackend;
ProtocolClient.test = ProtocolClientModule.InspectorBackend.test;
/** @constructor */
ProtocolClient.TargetBase = ProtocolClientModule.InspectorBackend.TargetBase;
/** @constructor */
ProtocolClient.NodeURL = ProtocolClientModule.NodeURL.NodeURL;
//# sourceMappingURL=protocol_client-legacy.js.map