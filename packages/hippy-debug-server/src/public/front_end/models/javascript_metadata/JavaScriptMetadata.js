// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { NativeFunctions } from './NativeFunctions.js';
let javaScriptMetadataInstance;
export class JavaScriptMetadataImpl {
    _uniqueFunctions;
    _instanceMethods;
    _staticMethods;
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!javaScriptMetadataInstance || forceNew) {
            javaScriptMetadataInstance = new JavaScriptMetadataImpl();
        }
        return javaScriptMetadataInstance;
    }
    constructor() {
        this._uniqueFunctions = new Map();
        this._instanceMethods = new Map();
        this._staticMethods = new Map();
        for (const nativeFunction of NativeFunctions) {
            if (!nativeFunction.receiver) {
                this._uniqueFunctions.set(nativeFunction.name, nativeFunction.signatures);
            }
            else if (nativeFunction.static) {
                let staticMethod = this._staticMethods.get(nativeFunction.receiver);
                if (!staticMethod) {
                    staticMethod = new Map();
                    this._staticMethods.set(nativeFunction.receiver, staticMethod);
                }
                staticMethod.set(nativeFunction.name, nativeFunction.signatures);
            }
            else {
                let instanceMethod = this._instanceMethods.get(nativeFunction.receiver);
                if (!instanceMethod) {
                    instanceMethod = new Map();
                    this._instanceMethods.set(nativeFunction.receiver, instanceMethod);
                }
                instanceMethod.set(nativeFunction.name, nativeFunction.signatures);
            }
        }
    }
    signaturesForNativeFunction(name) {
        return this._uniqueFunctions.get(name) || null;
    }
    signaturesForInstanceMethod(name, receiverClassName) {
        const instanceMethod = this._instanceMethods.get(receiverClassName);
        if (!instanceMethod) {
            return null;
        }
        return instanceMethod.get(name) || null;
    }
    signaturesForStaticMethod(name, receiverConstructorName) {
        const staticMethod = this._staticMethods.get(receiverConstructorName);
        if (!staticMethod) {
            return null;
        }
        return staticMethod.get(name) || null;
    }
}
//# sourceMappingURL=JavaScriptMetadata.js.map