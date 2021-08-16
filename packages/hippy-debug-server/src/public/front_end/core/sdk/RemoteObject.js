/*
 * Copyright (C) 2009 Google Inc. All rights reserved.
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
export class RemoteObject {
    /**
     * This may not be an interface due to "instanceof RemoteObject" checks in the code.
     */
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromLocalObject(value) {
        return new LocalJSONObject(value);
    }
    static type(remoteObject) {
        if (remoteObject === null) {
            return 'null';
        }
        const type = typeof remoteObject;
        if (type !== 'object' && type !== 'function') {
            return type;
        }
        return remoteObject.type;
    }
    static arrayNameFromDescription(description) {
        return description.replace(_descriptionLengthParenRegex, '').replace(_descriptionLengthSquareRegex, '');
    }
    static arrayLength(object) {
        if (object.subtype !== 'array' && object.subtype !== 'typedarray') {
            return 0;
        }
        // Array lengths in V8-generated descriptions switched from square brackets to parentheses.
        // Both formats are checked in case the front end is dealing with an old version of V8.
        const parenMatches = object.description && object.description.match(_descriptionLengthParenRegex);
        const squareMatches = object.description && object.description.match(_descriptionLengthSquareRegex);
        return parenMatches ? parseInt(parenMatches[1], 10) : (squareMatches ? parseInt(squareMatches[1], 10) : 0);
    }
    static arrayBufferByteLength(object) {
        if (object.subtype !== 'arraybuffer') {
            return 0;
        }
        const matches = object.description && object.description.match(_descriptionLengthParenRegex);
        return matches ? parseInt(matches[1], 10) : 0;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static unserializableDescription(object) {
        const type = typeof object;
        if (type === 'number') {
            const description = String(object);
            if (object === 0 && 1 / object < 0) {
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                return "-0" /* Negative0 */;
            }
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            if (description === "NaN" /* NaN */ || description === "Infinity" /* Infinity */ ||
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                description === "-Infinity" /* NegativeInfinity */) {
                return description;
            }
        }
        if (type === 'bigint') {
            return object + 'n';
        }
        return null;
    }
    static toCallArgument(object) {
        const type = typeof object;
        if (type === 'undefined') {
            return {};
        }
        const unserializableDescription = RemoteObject.unserializableDescription(object);
        if (type === 'number') {
            if (unserializableDescription !== null) {
                return { unserializableValue: unserializableDescription };
            }
            return { value: object };
        }
        if (type === 'bigint') {
            return { unserializableValue: unserializableDescription };
        }
        if (type === 'string' || type === 'boolean') {
            return { value: object };
        }
        if (!object) {
            return { value: null };
        }
        // The unserializableValue is a function on RemoteObject's and a simple property on
        // Protocol.Runtime.RemoteObject's.
        const objectAsProtocolRemoteObject = object;
        if (object instanceof RemoteObject) {
            const unserializableValue = object.unserializableValue();
            if (unserializableValue !== undefined) {
                return { unserializableValue: unserializableValue };
            }
        }
        else if (objectAsProtocolRemoteObject.unserializableValue !== undefined) {
            return { unserializableValue: objectAsProtocolRemoteObject.unserializableValue };
        }
        if (typeof objectAsProtocolRemoteObject.objectId !== 'undefined') {
            return { objectId: objectAsProtocolRemoteObject.objectId };
        }
        return { value: objectAsProtocolRemoteObject.value };
    }
    static async loadFromObjectPerProto(object, generatePreview) {
        const result = await Promise.all([
            object.getAllProperties(true /* accessorPropertiesOnly */, generatePreview),
            object.getOwnProperties(generatePreview),
        ]);
        const accessorProperties = result[0].properties;
        const ownProperties = result[1].properties;
        const internalProperties = result[1].internalProperties;
        if (!ownProperties || !accessorProperties) {
            return { properties: null, internalProperties: null };
        }
        const propertiesMap = new Map();
        const propertySymbols = [];
        for (let i = 0; i < accessorProperties.length; i++) {
            const property = accessorProperties[i];
            if (property.symbol) {
                propertySymbols.push(property);
            }
            else {
                propertiesMap.set(property.name, property);
            }
        }
        for (let i = 0; i < ownProperties.length; i++) {
            const property = ownProperties[i];
            if (property.isAccessorProperty()) {
                continue;
            }
            if (property.symbol) {
                propertySymbols.push(property);
            }
            else {
                propertiesMap.set(property.name, property);
            }
        }
        return {
            properties: [...propertiesMap.values()].concat(propertySymbols),
            internalProperties: internalProperties ? internalProperties : null,
        };
    }
    customPreview() {
        return null;
    }
    get objectId() {
        return 'Not implemented';
    }
    get type() {
        throw 'Not implemented';
    }
    get subtype() {
        throw 'Not implemented';
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get value() {
        throw 'Not implemented';
    }
    unserializableValue() {
        throw 'Not implemented';
    }
    get description() {
        throw 'Not implemented';
    }
    set description(description) {
        throw 'Not implemented';
    }
    get hasChildren() {
        throw 'Not implemented';
    }
    get preview() {
        return undefined;
    }
    get className() {
        return null;
    }
    arrayLength() {
        throw 'Not implemented';
    }
    arrayBufferByteLength() {
        throw 'Not implemented';
    }
    getOwnProperties(_generatePreview) {
        throw 'Not implemented';
    }
    getAllProperties(_accessorPropertiesOnly, _generatePreview) {
        throw 'Not implemented';
    }
    async deleteProperty(_name) {
        throw 'Not implemented';
    }
    async setPropertyValue(_name, _value) {
        throw 'Not implemented';
    }
    callFunction(_functionDeclaration, _args) {
        throw 'Not implemented';
    }
    callFunctionJSON(_functionDeclaration, _args) {
        throw 'Not implemented';
    }
    release() {
    }
    debuggerModel() {
        throw new Error('DebuggerModel-less object');
    }
    runtimeModel() {
        throw new Error('RuntimeModel-less object');
    }
    isNode() {
        return false;
    }
}
export class RemoteObjectImpl extends RemoteObject {
    _runtimeModel;
    _runtimeAgent;
    _type;
    _subtype;
    _objectId;
    _description;
    _hasChildren;
    _preview;
    _unserializableValue;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _value;
    _customPreview;
    _className;
    constructor(
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runtimeModel, objectId, type, subtype, value, unserializableValue, description, preview, customPreview, className) {
        super();
        this._runtimeModel = runtimeModel;
        this._runtimeAgent = runtimeModel.target().runtimeAgent();
        this._type = type;
        this._subtype = subtype;
        if (objectId) {
            // handle
            this._objectId = objectId;
            this._description = description;
            this._hasChildren = (type !== 'symbol');
            this._preview = preview;
        }
        else {
            this._description = description;
            if (!this.description && unserializableValue) {
                this._description = unserializableValue;
            }
            if (!this._description && (typeof value !== 'object' || value === null)) {
                this._description = String(value);
            }
            this._hasChildren = false;
            if (typeof unserializableValue === 'string') {
                this._unserializableValue = unserializableValue;
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // @ts-expect-error
                if (unserializableValue === "Infinity" /* Infinity */ ||
                    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                    // @ts-expect-error
                    unserializableValue === "-Infinity" /* NegativeInfinity */ ||
                    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                    // @ts-expect-error
                    unserializableValue === "-0" /* Negative0 */ ||
                    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                    // @ts-expect-error
                    unserializableValue === "NaN" /* NaN */) {
                    this._value = Number(unserializableValue);
                }
                else if (type === 'bigint' && unserializableValue.endsWith('n')) {
                    this._value = BigInt(unserializableValue.substring(0, unserializableValue.length - 1));
                }
                else {
                    this._value = unserializableValue;
                }
            }
            else {
                this._value = value;
            }
        }
        this._customPreview = customPreview || null;
        this._className = typeof className === 'string' ? className : null;
    }
    customPreview() {
        return this._customPreview;
    }
    get objectId() {
        return this._objectId;
    }
    get type() {
        return this._type;
    }
    get subtype() {
        return this._subtype;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get value() {
        return this._value;
    }
    unserializableValue() {
        return this._unserializableValue;
    }
    get description() {
        return this._description;
    }
    set description(description) {
        this._description = description;
    }
    get hasChildren() {
        return this._hasChildren;
    }
    get preview() {
        return this._preview;
    }
    get className() {
        return this._className;
    }
    getOwnProperties(generatePreview) {
        return this.doGetProperties(true, false, generatePreview);
    }
    getAllProperties(accessorPropertiesOnly, generatePreview) {
        return this.doGetProperties(false, accessorPropertiesOnly, generatePreview);
    }
    async _createRemoteObject(object) {
        return this._runtimeModel.createRemoteObject(object);
    }
    async doGetProperties(ownProperties, accessorPropertiesOnly, generatePreview) {
        if (!this._objectId) {
            return { properties: null, internalProperties: null };
        }
        const response = await this._runtimeAgent.invoke_getProperties({ objectId: this._objectId, ownProperties, accessorPropertiesOnly, generatePreview });
        if (response.getError()) {
            return { properties: null, internalProperties: null };
        }
        if (response.exceptionDetails) {
            this._runtimeModel.exceptionThrown(Date.now(), response.exceptionDetails);
            return { properties: null, internalProperties: null };
        }
        const { result: properties = [], internalProperties = [], privateProperties = [] } = response;
        const result = [];
        for (const property of properties) {
            const propertyValue = property.value ? await this._createRemoteObject(property.value) : null;
            const propertySymbol = property.symbol ? this._runtimeModel.createRemoteObject(property.symbol) : null;
            const remoteProperty = new RemoteObjectProperty(property.name, propertyValue, Boolean(property.enumerable), Boolean(property.writable), Boolean(property.isOwn), Boolean(property.wasThrown), propertySymbol);
            if (typeof property.value === 'undefined') {
                if (property.get && property.get.type !== 'undefined') {
                    remoteProperty.getter = this._runtimeModel.createRemoteObject(property.get);
                }
                if (property.set && property.set.type !== 'undefined') {
                    remoteProperty.setter = this._runtimeModel.createRemoteObject(property.set);
                }
            }
            result.push(remoteProperty);
        }
        for (const property of privateProperties) {
            const propertyValue = this._runtimeModel.createRemoteObject(property.value);
            const remoteProperty = new RemoteObjectProperty(property.name, propertyValue, true, true, true, false, undefined, false, undefined, true);
            result.push(remoteProperty);
        }
        const internalPropertiesResult = [];
        for (const property of internalProperties) {
            if (!property.value) {
                continue;
            }
            if (property.name === '[[StableObjectId]]') {
                continue;
            }
            const propertyValue = this._runtimeModel.createRemoteObject(property.value);
            internalPropertiesResult.push(new RemoteObjectProperty(property.name, propertyValue, true, false, undefined, undefined, undefined, true));
        }
        return { properties: result, internalProperties: internalPropertiesResult };
    }
    async setPropertyValue(name, value) {
        if (!this._objectId) {
            return 'Can’t set a property of non-object.';
        }
        const response = await this._runtimeAgent.invoke_evaluate({ expression: value, silent: true });
        if (response.getError() || response.exceptionDetails) {
            return response.getError() ||
                (response.result.type !== 'string' ? response.result.description : response.result.value);
        }
        if (typeof name === 'string') {
            name = RemoteObject.toCallArgument(name);
        }
        const resultPromise = this.doSetObjectPropertyValue(response.result, name);
        if (response.result.objectId) {
            this._runtimeAgent.invoke_releaseObject({ objectId: response.result.objectId });
        }
        return resultPromise;
    }
    async doSetObjectPropertyValue(result, name) {
        // This assignment may be for a regular (data) property, and for an accessor property (with getter/setter).
        // Note the sensitive matter about accessor property: the property may be physically defined in some proto object,
        // but logically it is bound to the object in question. JavaScript passes this object to getters/setters, not the object
        // where property was defined; so do we.
        const setPropertyValueFunction = 'function(a, b) { this[a] = b; }';
        const argv = [name, RemoteObject.toCallArgument(result)];
        const response = await this._runtimeAgent.invoke_callFunctionOn({ objectId: this._objectId, functionDeclaration: setPropertyValueFunction, arguments: argv, silent: true });
        const error = response.getError();
        return error || response.exceptionDetails ? error || response.result.description : undefined;
    }
    async deleteProperty(name) {
        if (!this._objectId) {
            return 'Can’t delete a property of non-object.';
        }
        const deletePropertyFunction = 'function(a) { delete this[a]; return !(a in this); }';
        const response = await this._runtimeAgent.invoke_callFunctionOn({ objectId: this._objectId, functionDeclaration: deletePropertyFunction, arguments: [name], silent: true });
        if (response.getError() || response.exceptionDetails) {
            return response.getError() || response.result.description;
        }
        if (!response.result.value) {
            return 'Failed to delete property.';
        }
        return undefined;
    }
    async callFunction(functionDeclaration, args) {
        const response = await this._runtimeAgent.invoke_callFunctionOn({ objectId: this._objectId, functionDeclaration: functionDeclaration.toString(), arguments: args, silent: true });
        if (response.getError()) {
            return { object: null, wasThrown: false };
        }
        // TODO: release exceptionDetails object
        return {
            object: this._runtimeModel.createRemoteObject(response.result),
            wasThrown: Boolean(response.exceptionDetails),
        };
    }
    async callFunctionJSON(functionDeclaration, args) {
        const response = await this._runtimeAgent.invoke_callFunctionOn({
            objectId: this._objectId,
            functionDeclaration: functionDeclaration.toString(),
            arguments: args,
            silent: true,
            returnByValue: true,
        });
        if (!this._objectId) {
            return this.value;
        }
        return response.getError() || response.exceptionDetails ? null : response.result.value;
    }
    release() {
        if (!this._objectId) {
            return;
        }
        this._runtimeAgent.invoke_releaseObject({ objectId: this._objectId });
    }
    arrayLength() {
        return RemoteObject.arrayLength(this);
    }
    arrayBufferByteLength() {
        return RemoteObject.arrayBufferByteLength(this);
    }
    debuggerModel() {
        return this._runtimeModel.debuggerModel();
    }
    runtimeModel() {
        return this._runtimeModel;
    }
    isNode() {
        return Boolean(this._objectId) && this.type === 'object' && this.subtype === 'node';
    }
}
export class ScopeRemoteObject extends RemoteObjectImpl {
    _scopeRef;
    _savedScopeProperties;
    constructor(runtimeModel, objectId, scopeRef, type, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subtype, value, unserializableValue, description, preview) {
        super(runtimeModel, objectId, type, subtype, value, unserializableValue, description, preview);
        this._scopeRef = scopeRef;
        this._savedScopeProperties = undefined;
    }
    async doGetProperties(ownProperties, accessorPropertiesOnly, _generatePreview) {
        if (accessorPropertiesOnly) {
            return { properties: [], internalProperties: [] };
        }
        if (this._savedScopeProperties) {
            // No need to reload scope variables, as the remote object never
            // changes its properties. If variable is updated, the properties
            // array is patched locally.
            return { properties: this._savedScopeProperties.slice(), internalProperties: null };
        }
        const allProperties = await super.doGetProperties(ownProperties, accessorPropertiesOnly, true /* generatePreview */);
        if (this._scopeRef && Array.isArray(allProperties.properties)) {
            this._savedScopeProperties = allProperties.properties.slice();
            if (!this._scopeRef.callFrameId) {
                for (const property of this._savedScopeProperties) {
                    property.writable = false;
                }
            }
        }
        return allProperties;
    }
    async doSetObjectPropertyValue(result, argumentName) {
        const name = argumentName.value;
        const error = await this.debuggerModel().setVariableValue(this._scopeRef.number, name, RemoteObject.toCallArgument(result), this._scopeRef.callFrameId);
        if (error) {
            return error;
        }
        if (this._savedScopeProperties) {
            for (const property of this._savedScopeProperties) {
                if (property.name === name) {
                    property.value = this._runtimeModel.createRemoteObject(result);
                }
            }
        }
        return;
    }
}
export class ScopeRef {
    number;
    callFrameId;
    constructor(number, callFrameId) {
        this.number = number;
        this.callFrameId = callFrameId;
    }
}
export class RemoteObjectProperty {
    name;
    value;
    enumerable;
    writable;
    isOwn;
    wasThrown;
    symbol;
    synthetic;
    syntheticSetter;
    private;
    getter;
    setter;
    constructor(name, value, enumerable, writable, isOwn, wasThrown, symbol, synthetic, syntheticSetter, isPrivate) {
        this.name = name;
        if (value !== null) {
            this.value = value;
        }
        this.enumerable = typeof enumerable !== 'undefined' ? enumerable : true;
        const isNonSyntheticOrSyntheticWritable = !synthetic || Boolean(syntheticSetter);
        this.writable = typeof writable !== 'undefined' ? writable : isNonSyntheticOrSyntheticWritable;
        this.isOwn = Boolean(isOwn);
        this.wasThrown = Boolean(wasThrown);
        if (symbol) {
            this.symbol = symbol;
        }
        this.synthetic = Boolean(synthetic);
        if (syntheticSetter) {
            this.syntheticSetter = syntheticSetter;
        }
        this.private = Boolean(isPrivate);
    }
    async setSyntheticValue(expression) {
        if (!this.syntheticSetter) {
            return false;
        }
        const result = await this.syntheticSetter(expression);
        if (result) {
            this.value = result;
        }
        return Boolean(result);
    }
    isAccessorProperty() {
        return Boolean(this.getter || this.setter);
    }
}
// Below is a wrapper around a local object that implements the RemoteObject interface,
// which can be used by the UI code (primarily ObjectPropertiesSection).
// Note that only JSON-compliant objects are currently supported, as there's no provision
// for traversing prototypes, extracting class names via constructor, handling properties
// or functions.
export class LocalJSONObject extends RemoteObject {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _value;
    _cachedDescription;
    _cachedChildren;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(value) {
        super();
        this._value = value;
    }
    get objectId() {
        return undefined;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get value() {
        return this._value;
    }
    unserializableValue() {
        const unserializableDescription = RemoteObject.unserializableDescription(this._value);
        return unserializableDescription || undefined;
    }
    get description() {
        if (this._cachedDescription) {
            return this._cachedDescription;
        }
        function formatArrayItem(property) {
            return this._formatValue(property.value || null);
        }
        function formatObjectItem(property) {
            let name = property.name;
            if (/^\s|\s$|^$|\n/.test(name)) {
                name = '"' + name.replace(/\n/g, '\u21B5') + '"';
            }
            return name + ': ' + this._formatValue(property.value || null);
        }
        if (this.type === 'object') {
            switch (this.subtype) {
                case 'array':
                    this._cachedDescription = this._concatenate('[', ']', formatArrayItem.bind(this));
                    break;
                case 'date':
                    this._cachedDescription = String(this._value);
                    break;
                case 'null':
                    this._cachedDescription = 'null';
                    break;
                default:
                    this._cachedDescription = this._concatenate('{', '}', formatObjectItem.bind(this));
            }
        }
        else {
            this._cachedDescription = String(this._value);
        }
        return this._cachedDescription;
    }
    _formatValue(value) {
        if (!value) {
            return 'undefined';
        }
        const description = value.description || '';
        if (value.type === 'string') {
            return '"' + description.replace(/\n/g, '\u21B5') + '"';
        }
        return description;
    }
    _concatenate(prefix, suffix, formatProperty) {
        const previewChars = 100;
        let buffer = prefix;
        const children = this._children();
        for (let i = 0; i < children.length; ++i) {
            const itemDescription = formatProperty(children[i]);
            if (buffer.length + itemDescription.length > previewChars) {
                buffer += ',…';
                break;
            }
            if (i) {
                buffer += ', ';
            }
            buffer += itemDescription;
        }
        buffer += suffix;
        return buffer;
    }
    get type() {
        return typeof this._value;
    }
    get subtype() {
        if (this._value === null) {
            return 'null';
        }
        if (Array.isArray(this._value)) {
            return 'array';
        }
        if (this._value instanceof Date) {
            return 'date';
        }
        return undefined;
    }
    get hasChildren() {
        if ((typeof this._value !== 'object') || (this._value === null)) {
            return false;
        }
        return Boolean(Object.keys(this._value).length);
    }
    async getOwnProperties(_generatePreview) {
        return { properties: this._children(), internalProperties: null };
    }
    async getAllProperties(accessorPropertiesOnly, _generatePreview) {
        if (accessorPropertiesOnly) {
            return { properties: [], internalProperties: null };
        }
        return { properties: this._children(), internalProperties: null };
    }
    _children() {
        if (!this.hasChildren) {
            return [];
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = this._value;
        function buildProperty(propName) {
            let propValue = value[propName];
            if (!(propValue instanceof RemoteObject)) {
                propValue = RemoteObject.fromLocalObject(propValue);
            }
            return new RemoteObjectProperty(propName, propValue);
        }
        if (!this._cachedChildren) {
            this._cachedChildren = Object.keys(value).map(buildProperty);
        }
        return this._cachedChildren;
    }
    arrayLength() {
        return Array.isArray(this._value) ? this._value.length : 0;
    }
    async callFunction(functionDeclaration, args) {
        const target = this._value;
        const rawArgs = args ? args.map(arg => arg.value) : [];
        let result;
        let wasThrown = false;
        try {
            result = functionDeclaration.apply(target, rawArgs);
        }
        catch (e) {
            wasThrown = true;
        }
        const object = RemoteObject.fromLocalObject(result);
        return { object, wasThrown };
    }
    async callFunctionJSON(functionDeclaration, args) {
        const target = this._value;
        const rawArgs = args ? args.map(arg => arg.value) : [];
        let result;
        try {
            result = functionDeclaration.apply(target, rawArgs);
        }
        catch (e) {
            result = null;
        }
        return result;
    }
}
export class RemoteArrayBuffer {
    _object;
    constructor(object) {
        if (object.type !== 'object' || object.subtype !== 'arraybuffer') {
            throw new Error('Object is not an arraybuffer');
        }
        this._object = object;
    }
    byteLength() {
        return this._object.arrayBufferByteLength();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async bytes(start = 0, end = this.byteLength()) {
        if (start < 0 || start >= this.byteLength()) {
            throw new RangeError('start is out of range');
        }
        if (end < start || end > this.byteLength()) {
            throw new RangeError('end is out of range');
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // @ts-expect-error
        return await this._object.callFunctionJSON(bytes, [{ value: start }, { value: end - start }]);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function bytes(offset, length) {
            return [...new Uint8Array(this, offset, length)];
        }
    }
    object() {
        return this._object;
    }
}
export class RemoteArray {
    _object;
    constructor(object) {
        this._object = object;
    }
    static objectAsArray(object) {
        if (!object || object.type !== 'object' || (object.subtype !== 'array' && object.subtype !== 'typedarray')) {
            throw new Error('Object is empty or not an array');
        }
        return new RemoteArray(object);
    }
    static createFromRemoteObjects(objects) {
        if (!objects.length) {
            throw new Error('Input array is empty');
        }
        const objectArguments = [];
        for (let i = 0; i < objects.length; ++i) {
            objectArguments.push(RemoteObject.toCallArgument(objects[i]));
        }
        return objects[0].callFunction(createArray, objectArguments).then(returnRemoteArray);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function createArray() {
            if (arguments.length > 1) {
                return new Array(arguments);
            }
            return [arguments[0]];
        }
        function returnRemoteArray(result) {
            if (result.wasThrown || !result.object) {
                throw new Error('Call function throws exceptions or returns empty value');
            }
            return RemoteArray.objectAsArray(result.object);
        }
    }
    at(index) {
        if (index < 0 || index > this._object.arrayLength()) {
            throw new Error('Out of range');
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // @ts-expect-error
        return this._object.callFunction(at, [RemoteObject.toCallArgument(index)]).then(assertCallFunctionResult);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function at(index) {
            return this[index];
        }
        function assertCallFunctionResult(result) {
            if (result.wasThrown || !result.object) {
                throw new Error('Exception in callFunction or result value is empty');
            }
            return result.object;
        }
    }
    length() {
        return this._object.arrayLength();
    }
    map(func) {
        const promises = [];
        for (let i = 0; i < this.length(); ++i) {
            promises.push(this.at(i).then(func));
        }
        return Promise.all(promises);
    }
    object() {
        return this._object;
    }
}
export class RemoteFunction {
    _object;
    constructor(object) {
        this._object = object;
    }
    static objectAsFunction(object) {
        if (!object || object.type !== 'function') {
            throw new Error('Object is empty or not a function');
        }
        return new RemoteFunction(object);
    }
    targetFunction() {
        return this._object.getOwnProperties(false /* generatePreview */).then(targetFunction.bind(this));
        function targetFunction(ownProperties) {
            if (!ownProperties.internalProperties) {
                return this._object;
            }
            const internalProperties = ownProperties.internalProperties;
            for (const property of internalProperties) {
                if (property.name === '[[TargetFunction]]') {
                    return property.value;
                }
            }
            return this._object;
        }
    }
    targetFunctionDetails() {
        return this.targetFunction().then(functionDetails.bind(this));
        function functionDetails(targetFunction) {
            const boundReleaseFunctionDetails = releaseTargetFunction.bind(null, this._object !== targetFunction ? targetFunction : null);
            return targetFunction.debuggerModel().functionDetailsPromise(targetFunction).then(boundReleaseFunctionDetails);
        }
        function releaseTargetFunction(targetFunction, functionDetails) {
            if (targetFunction) {
                targetFunction.release();
            }
            return functionDetails;
        }
    }
    object() {
        return this._object;
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _descriptionLengthParenRegex = /\(([0-9]+)\)/;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
const _descriptionLengthSquareRegex = /\[([0-9]+)\]/;
//# sourceMappingURL=RemoteObject.js.map