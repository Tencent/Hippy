// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as ARIAProperties from '../../generated/ARIAProperties.js';
export class ARIAMetadata {
    _attributes;
    _roleNames;
    constructor(config) {
        this._attributes = new Map();
        this._roleNames = [];
        if (config) {
            this._initialize(config);
        }
    }
    _initialize(config) {
        const attributes = config['attributes'];
        const booleanEnum = ['true', 'false'];
        for (const attributeConfig of attributes) {
            if (attributeConfig.type === 'boolean') {
                attributeConfig.enum = booleanEnum;
            }
            this._attributes.set(attributeConfig.name, new Attribute(attributeConfig));
        }
        /** @type {!Array<string>} */
        this._roleNames = config['roles'].map(roleConfig => roleConfig.name);
    }
    valuesForProperty(property) {
        const attribute = this._attributes.get(property);
        if (attribute) {
            return attribute.getEnum();
        }
        if (property === 'role') {
            return this._roleNames;
        }
        return [];
    }
}
let instance;
export function ariaMetadata() {
    if (!instance) {
        instance = new ARIAMetadata(ARIAProperties.config || null);
    }
    return instance;
}
export class Attribute {
    _enum;
    constructor(config) {
        this._enum = [];
        if (config.enum) {
            this._enum = config.enum;
        }
    }
    getEnum() {
        return this._enum;
    }
}
//# sourceMappingURL=ARIAMetadata.js.map