// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
const UNINITIALIZED = Symbol('uninitialized');
const ERROR_STATE = Symbol('error');
export function lazy(producer) {
    let value = UNINITIALIZED;
    let error = null;
    return () => {
        if (value === ERROR_STATE) {
            throw error;
        }
        else if (value !== UNINITIALIZED) {
            return value;
        }
        try {
            value = producer();
            return value;
        }
        catch (err) {
            error = err;
            value = ERROR_STATE;
            throw error;
        }
    };
}
//# sourceMappingURL=Lazy.js.map