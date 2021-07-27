// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export const ARROW_KEYS = new Set([
    "ArrowUp" /* UP */,
    "ArrowDown" /* DOWN */,
    "ArrowLeft" /* LEFT */,
    "ArrowRight" /* RIGHT */,
]);
export function keyIsArrowKey(key) {
    return ARROW_KEYS.has(key);
}
//# sourceMappingURL=keyboard-utilities.js.map