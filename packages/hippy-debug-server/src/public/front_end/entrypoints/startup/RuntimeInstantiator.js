/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import '../../core/root/root-legacy.js';
import * as RootModule from '../../core/root/root.js';
// Legacy runtime namespace definitions
// @ts-ignore
self.Runtime = self.Runtime || {};
// @ts-ignore
Runtime = Runtime || {};
// The following two variables are initialized in `build_release_applications`
// @ts-ignore
Root.allDescriptors = Root.allDescriptors || [];
// @ts-ignore
Root.applicationDescriptor = Root.applicationDescriptor || undefined;
export async function startApplication(_appName) {
    console.timeStamp('Root.Runtime.startApplication');
    const allDescriptorsByName = {};
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // @ts-ignore
    for (let i = 0; i < Root.allDescriptors.length; ++i) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // @ts-ignore
        const d = Root.allDescriptors[i];
        allDescriptorsByName[d['name']] = d;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // @ts-ignore
    const configuration = Root.applicationDescriptor.modules;
    const moduleDescriptors = [];
    const coreModuleNames = [];
    for (let i = 0; i < configuration.length; ++i) {
        const descriptor = configuration[i];
        const name = descriptor['name'];
        moduleDescriptors.push(allDescriptorsByName[name]);
        if (descriptor['type'] === 'autostart') {
            coreModuleNames.push(name);
        }
    }
    for (let i = 0; i < moduleDescriptors.length; ++i) {
        moduleDescriptors[i].name = configuration[i]['name'];
        moduleDescriptors[i].condition = configuration[i]['condition'];
    }
    const runtimeInstance = RootModule.Runtime.Runtime.instance({ forceNew: true, moduleDescriptors });
    // @ts-ignore Exposed for legacy layout tests
    self.runtime = runtimeInstance;
    if (coreModuleNames) {
        await runtimeInstance.loadAutoStartModules(coreModuleNames);
    }
    RootModule.Runtime.appStartedPromiseCallback();
}
export async function startWorker(appName) {
    return startApplication(appName).then(sendWorkerReady);
    function sendWorkerReady() {
        // @ts-ignore
        self.postMessage('workerReady');
    }
}
//# sourceMappingURL=RuntimeInstantiator.js.map