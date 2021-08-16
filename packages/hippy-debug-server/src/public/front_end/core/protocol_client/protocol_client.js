// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as InspectorBackendCommands from '../../generated/InspectorBackendCommands.js';
import * as InspectorBackend from './InspectorBackend.js';
import * as NodeURL from './NodeURL.js';
export { InspectorBackend, NodeURL, };
// Create the global here because registering commands will involve putting
// items onto the global.
// @ts-ignore Global namespace instantiation
self.Protocol = self.Protocol || {};
// FIXME: This instance of InspectorBackend should not be a side effect of importing this module.
InspectorBackendCommands.registerCommands(InspectorBackend.inspectorBackend);
//# sourceMappingURL=protocol_client.js.map