// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as InspectorFrontendHost from './InspectorFrontendHost.js';
import * as InspectorFrontendHostAPI from './InspectorFrontendHostAPI.js';
import * as Platform from './Platform.js';
import * as ResourceLoader from './ResourceLoader.js';
import * as UserMetrics from './UserMetrics.js';
export { InspectorFrontendHost, InspectorFrontendHostAPI, Platform, ResourceLoader, UserMetrics, };
export const userMetrics = new UserMetrics.UserMetrics();
//# sourceMappingURL=host.js.map