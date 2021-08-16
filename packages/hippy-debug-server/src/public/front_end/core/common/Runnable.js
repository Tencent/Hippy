// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const registeredLateInitializationRunnables = [];
export function registerLateInitializationRunnable(runnable) {
    registeredLateInitializationRunnables.push(runnable);
}
export function lateInitializationRunnables() {
    return registeredLateInitializationRunnables;
}
const registeredEarlyInitializationRunnables = [];
export function registerEarlyInitializationRunnable(runnable) {
    registeredEarlyInitializationRunnables.push(runnable);
}
export function earlyInitializationRunnables() {
    return registeredEarlyInitializationRunnables;
}
//# sourceMappingURL=Runnable.js.map