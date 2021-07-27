// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as TimelineComponents from '../../../../panels/timeline/components/components.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
await FrontendHelpers.initializeGlobalVars();
await ComponentHelpers.ComponentServerSetup.setup();
const component = new TimelineComponents.WebVitalsTimeline.WebVitalsTimeline();
document.getElementById('container')?.appendChild(component);
component.data = {
    startTime: 0,
    duration: 1000,
    maxDuration: 15000,
    fcps: [0, 250, 500, 750, 1000, 1250, 1500, 2000, 3000, 4000, 5000].map(t => ({ timestamp: t })),
    lcps: [190, 380, 700].map(t => ({ timestamp: t })),
    layoutShifts: [200, 210, 220, 222, 225, 227, 230, 500].map(t => ({ timestamp: t })),
    longTasks: [
        { start: 300, duration: 400 },
        { start: 850, duration: 50 },
    ],
    mainFrameNavigations: [500, 1500, 12000],
};
//# sourceMappingURL=webvitals.js.map