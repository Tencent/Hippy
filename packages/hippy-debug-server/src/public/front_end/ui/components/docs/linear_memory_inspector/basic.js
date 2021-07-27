// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as LinearMemoryInspector from '../../linear_memory_inspector/linear_memory_inspector.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const array = [];
const string = 'Hello this is a string from the memory buffer!';
for (let i = 0; i < string.length; ++i) {
    array.push(string.charCodeAt(i));
}
for (let i = -1000; i < 1000; ++i) {
    array.push(i);
}
const memory = new Uint8Array(array);
const memoryInspector = new LinearMemoryInspector.LinearMemoryInspector.LinearMemoryInspector();
document.getElementById('container')?.appendChild(memoryInspector);
memoryInspector.data = {
    memory: memory,
    address: 0,
    memoryOffset: 0,
    outerMemoryLength: memory.length,
};
//# sourceMappingURL=basic.js.map