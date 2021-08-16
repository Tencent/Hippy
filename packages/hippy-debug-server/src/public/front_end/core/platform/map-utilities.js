// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export const inverse = function (map) {
    const result = new Multimap();
    for (const [key, value] of map.entries()) {
        result.set(value, key);
    }
    return result;
};
export class Multimap {
    map = new Map();
    set(key, value) {
        let set = this.map.get(key);
        if (!set) {
            set = new Set();
            this.map.set(key, set);
        }
        set.add(value);
    }
    get(key) {
        return this.map.get(key) || new Set();
    }
    has(key) {
        return this.map.has(key);
    }
    hasValue(key, value) {
        const set = this.map.get(key);
        if (!set) {
            return false;
        }
        return set.has(value);
    }
    get size() {
        return this.map.size;
    }
    delete(key, value) {
        const values = this.get(key);
        if (!values) {
            return false;
        }
        const result = values.delete(value);
        if (!values.size) {
            this.map.delete(key);
        }
        return result;
    }
    deleteAll(key) {
        this.map.delete(key);
    }
    keysArray() {
        return [...this.map.keys()];
    }
    valuesArray() {
        const result = [];
        for (const set of this.map.values()) {
            result.push(...set.values());
        }
        return result;
    }
    clear() {
        this.map.clear();
    }
}
//# sourceMappingURL=map-utilities.js.map