// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
export class ListModel extends Common.ObjectWrapper.ObjectWrapper {
    _items;
    constructor(items) {
        super();
        this._items = items || [];
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Symbol.iterator]() {
        return this._items[Symbol.iterator]();
    }
    get length() {
        return this._items.length;
    }
    at(index) {
        return this._items[index];
    }
    every(callback) {
        return this._items.every(callback);
    }
    filter(callback) {
        return this._items.filter(callback);
    }
    find(callback) {
        return this._items.find(callback);
    }
    findIndex(callback) {
        return this._items.findIndex(callback);
    }
    indexOf(value, fromIndex) {
        return this._items.indexOf(value, fromIndex);
    }
    insert(index, value) {
        this._items.splice(index, 0, value);
        this._replaced(index, [], 1);
    }
    insertWithComparator(value, comparator) {
        this.insert(Platform.ArrayUtilities.lowerBound(this._items, value, comparator), value);
    }
    join(separator) {
        return this._items.join(separator);
    }
    remove(index) {
        const result = this._items[index];
        this._items.splice(index, 1);
        this._replaced(index, [result], 0);
        return result;
    }
    replace(index, value, keepSelectedIndex) {
        const oldValue = this._items[index];
        this._items[index] = value;
        this._replaced(index, [oldValue], 1, keepSelectedIndex);
        return oldValue;
    }
    replaceRange(from, to, items) {
        let removed;
        if (items.length < 10000) {
            removed = this._items.splice(from, to - from, ...items);
        }
        else {
            removed = this._items.slice(from, to);
            // Splice may fail with too many arguments.
            const before = this._items.slice(0, from);
            const after = this._items.slice(to);
            this._items = [...before, ...items, ...after];
        }
        this._replaced(from, removed, items.length);
        return removed;
    }
    replaceAll(items) {
        const oldItems = this._items.slice();
        this._items = items;
        this._replaced(0, oldItems, items.length);
        return oldItems;
    }
    slice(from, to) {
        return this._items.slice(from, to);
    }
    some(callback) {
        return this._items.some(callback);
    }
    _replaced(index, removed, inserted, keepSelectedIndex) {
        this.dispatchEventToListeners(Events.ItemsReplaced, { index, removed, inserted, keepSelectedIndex });
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["ItemsReplaced"] = "ItemsReplaced";
})(Events || (Events = {}));
//# sourceMappingURL=ListModel.js.map