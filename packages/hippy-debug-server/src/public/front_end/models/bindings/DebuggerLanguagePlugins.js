// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { ContentProviderBasedProject } from './ContentProviderBasedProject.js';
import { NetworkProject } from './NetworkProject.js';
const UIStrings = {
    /**
    *@description Error message that is displayed in the Console when language plugins report errors
    *@example {File not found} PH1
    */
    errorInDebuggerLanguagePlugin: 'Error in debugger language plugin: {PH1}',
    /**
    *@description Status message that is shown in the Console when debugging information is being
    *loaded. The 2nd and 3rd placeholders are URLs.
    *@example {C/C++ DevTools Support (DWARF)} PH1
    *@example {http://web.dev/file.wasm} PH2
    *@example {http://web.dev/file.wasm.debug.wasm} PH3
    */
    loadingDebugSymbolsForVia: '[{PH1}] Loading debug symbols for {PH2} (via {PH3})...',
    /**
    *@description Status message that is shown in the Console when debugging information is being loaded
    *@example {C/C++ DevTools Support (DWARF)} PH1
    *@example {http://web.dev/file.wasm} PH2
    */
    loadingDebugSymbolsFor: '[{PH1}] Loading debug symbols for {PH2}...',
    /**
    *@description Warning message that is displayed in the Console when debugging information was loaded, but no source files were found
    *@example {C/C++ DevTools Support (DWARF)} PH1
    *@example {http://web.dev/file.wasm} PH2
    */
    loadedDebugSymbolsForButDidnt: '[{PH1}] Loaded debug symbols for {PH2}, but didn\'t find any source files',
    /**
    *@description Status message that is shown in the Console when debugging information is successfully loaded
    *@example {C/C++ DevTools Support (DWARF)} PH1
    *@example {http://web.dev/file.wasm} PH2
    *@example {42} PH3
    */
    loadedDebugSymbolsForFound: '[{PH1}] Loaded debug symbols for {PH2}, found {PH3} source file(s)',
    /**
    *@description Error message that is displayed in the Console when debugging information cannot be loaded
    *@example {C/C++ DevTools Support (DWARF)} PH1
    *@example {http://web.dev/file.wasm} PH2
    *@example {File not found} PH3
    */
    failedToLoadDebugSymbolsFor: '[{PH1}] Failed to load debug symbols for {PH2} ({PH3})',
};
const str_ = i18n.i18n.registerUIStrings('models/bindings/DebuggerLanguagePlugins.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class SourceType {
    typeInfo;
    members;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeMap;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(typeInfo, members, typeMap) {
        this.typeInfo = typeInfo;
        this.members = members;
        this.typeMap = typeMap;
    }
    /**
     * Create a type graph
     */
    static create(typeInfos) {
        if (typeInfos.length === 0) {
            return null;
        }
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typeMap = new Map();
        for (const typeInfo of typeInfos) {
            typeMap.set(typeInfo.typeId, new SourceType(typeInfo, [], typeMap));
        }
        for (const sourceType of typeMap.values()) {
            sourceType.members = sourceType.typeInfo.members.map(({ typeId }) => {
                const memberType = typeMap.get(typeId);
                if (!memberType) {
                    throw new Error(`Incomplete type information for type ${typeInfos[0].typeNames[0] || '<anonymous>'}`);
                }
                return memberType;
            });
        }
        return typeMap.get(typeInfos[0].typeId) || null;
    }
}
/**
 * Generates the raw module ID for a script, which is used
 * to uniquely identify the debugging data for a script on
 * the responsible language plugin.
 *
 * @param script the unique raw module ID for the script.
 */
function rawModuleIdForScript(script) {
    return `${script.sourceURL}@${script.hash}`;
}
function getRawLocation(callFrame) {
    const { script } = callFrame;
    return {
        rawModuleId: rawModuleIdForScript(script),
        codeOffset: callFrame.location().columnNumber - (script.codeOffset() || 0),
        inlineFrameIndex: callFrame.inlineFrameIndex,
    };
}
async function resolveRemoteObject(
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
callFrame, object) {
    if (typeof object.value !== 'undefined') {
        return object.value;
    }
    const response = await callFrame.debuggerModel.target().runtimeAgent().invoke_callFunctionOn({ functionDeclaration: 'function() { return this; }', objectId: object.objectId, returnByValue: true });
    const { result } = response;
    if (!result) {
        return undefined;
    }
    return result.value;
}
export class ValueNode extends SDK.RemoteObject.RemoteObjectImpl {
    inspectableAddress;
    callFrame;
    constructor(callFrame, objectId, type, subtype, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value, inspectableAddress, unserializableValue, description, preview, customPreview, className) {
        super(callFrame.debuggerModel.runtimeModel(), objectId, type, subtype, value, unserializableValue, description, preview, customPreview, className);
        this.inspectableAddress = inspectableAddress;
        this.callFrame = callFrame;
    }
}
// Debugger language plugins present source-language values as trees with mixed dynamic and static structural
// information. The static structure is defined by the variable's static type in the source language. Formatters are
// able to present source-language values in an arbitrary user-friendly way, which contributes the dynamic structural
// information. The classes StaticallyTypedValue and FormatedValueNode respectively implement the static and dynamic
// parts in the RemoteObject tree that defines the presentation of the source-language value in the debugger UI.
//
// struct S {
//   int i;
//   struct A {
//     int j;
//   } a[3];
// } s
//
// The RemoteObject tree representing the C struct above could look like the graph below with a formatter for the type
// struct A[3], interleaving static and dynamic representations:
//
// StaticallyTypedValueNode   -->  s: struct S
//                                 \
//                                 |\
// StaticallyTypedValueNode   -->  | i: int
//                                 \
//                                  \
// StaticallyTypedValueNode   -->    a: struct A[3]
//                                   \
//                                   |\
// FormattedValueNode         -->    | 0: struct A
//                                   | \
//                                   |  \
// StaticallyTypedValueNode   -->    |   j: int
//                                   .
//                                   .
//                                   .
/** Create a new value tree from an expression.
 */
async function getValueTreeForExpression(callFrame, plugin, expression, evalOptions) {
    const location = getRawLocation(callFrame);
    let typeInfo;
    try {
        typeInfo = await plugin.getTypeInfo(expression, location);
    }
    catch (e) {
        FormattingError.throwLocal(callFrame, e.message);
    }
    // If there's no type information we cannot represent this expression.
    if (!typeInfo) {
        return new SDK.RemoteObject.LocalJSONObject(undefined);
    }
    const { base, typeInfos } = typeInfo;
    const sourceType = SourceType.create(typeInfos);
    if (!sourceType) {
        return new SDK.RemoteObject.LocalJSONObject(undefined);
    }
    if (sourceType.typeInfo.hasValue && !sourceType.typeInfo.canExpand && base) {
        // Need to run the formatter for the expression result.
        return formatSourceValue(callFrame, plugin, sourceType, base, [], evalOptions);
    }
    // Create a new value tree with static information for the root.
    const address = await StaticallyTypedValueNode.getInspectableAddress(callFrame, plugin, base, [], evalOptions);
    return new StaticallyTypedValueNode(callFrame, plugin, sourceType, base, [], evalOptions, address);
}
/** Run the formatter for the value defined by the pair of base and fieldChain.
 */
async function formatSourceValue(callFrame, plugin, sourceType, base, field, evalOptions) {
    const location = getRawLocation(callFrame);
    let evalCode = await plugin.getFormatter({ base, field }, location);
    if (!evalCode) {
        evalCode = { js: '' };
    }
    const response = await callFrame.debuggerModel.target().debuggerAgent().invoke_evaluateOnCallFrame({
        callFrameId: callFrame.id,
        expression: evalCode.js,
        objectGroup: evalOptions.objectGroup,
        includeCommandLineAPI: evalOptions.includeCommandLineAPI,
        silent: evalOptions.silent,
        returnByValue: evalOptions.returnByValue,
        generatePreview: evalOptions.generatePreview,
        throwOnSideEffect: evalOptions.throwOnSideEffect,
        timeout: evalOptions.timeout,
    });
    const error = response.getError();
    if (error) {
        throw new Error(error);
    }
    const { result, exceptionDetails } = response;
    if (exceptionDetails) {
        throw new FormattingError(callFrame.debuggerModel.runtimeModel().createRemoteObject(result), exceptionDetails);
    }
    // Wrap the formatted result into a FormattedValueNode.
    const object = new FormattedValueNode(callFrame, sourceType, plugin, result, null, evalOptions, undefined);
    // Check whether the formatter returned a plain object or and object alongisde a formatter tag.
    const unpackedResultObject = await unpackResultObject(object);
    const node = unpackedResultObject || object;
    if (typeof node.value === 'undefined' && node.type !== 'undefined') {
        node.description = sourceType.typeInfo.typeNames[0];
    }
    return node;
    async function unpackResultObject(object) {
        const { tag, value, inspectableAddress } = await object.findProperties('tag', 'value', 'inspectableAddress');
        if (!tag || !value) {
            return null;
        }
        const { className, symbol } = await tag.findProperties('className', 'symbol');
        if (!className || !symbol) {
            return null;
        }
        const resolvedClassName = className.value;
        if (typeof resolvedClassName !== 'string' || typeof symbol.objectId === 'undefined') {
            return null;
        }
        value.formatterTag = { symbol: symbol.objectId, className: resolvedClassName };
        value.inspectableAddress = inspectableAddress ? inspectableAddress.value : undefined;
        return value;
    }
}
// Formatters produce proper JavaScript objects, which are mirrored as RemoteObjects. To implement interleaving of
// formatted and statically typed values, formatters may insert markers in the JavaScript objects. The markers contain
// the static type information (`EvalBase`)to create a new StaticallyTypedValueNode tree root. Markers are identified by
// their className and the presence of a special Symbol property. Both the class name and the symbol are defined by the
// `formatterTag` property.
//
// A FormattedValueNode is a RemoteObject whose properties can be either FormattedValueNodes or
// StaticallyTypedValueNodes. The class hooks into the creation of RemoteObjects for properties to check whether a
// property is a marker.
class FormattedValueNode extends ValueNode {
    _plugin;
    _sourceType;
    formatterTag;
    _evalOptions;
    constructor(callFrame, sourceType, plugin, object, formatterTag, evalOptions, inspectableAddress) {
        super(callFrame, object.objectId, object.type, object.subtype, object.value, inspectableAddress, object.unserializableValue, object.description, object.preview, object.customPreview, object.className);
        this._plugin = plugin;
        this._sourceType = sourceType;
        // The tag describes how to identify a marker by its className and its identifier symbol's object id.
        this.formatterTag = formatterTag;
        this._evalOptions = evalOptions;
    }
    async findProperties(...properties) {
        const result = {};
        for (const prop of (await this.getOwnProperties(false)).properties || []) {
            if (properties.indexOf(prop.name) >= 0) {
                if (prop.value) {
                    result[prop.name] = prop.value;
                }
            }
        }
        return result;
    }
    /**
     * Hook into RemoteObject creation for properties to check whether a property is a marker.
     */
    async _createRemoteObject(newObject) {
        // Check if the property RemoteObject is a marker
        const base = await this._getEvalBaseFromObject(newObject);
        if (!base) {
            return new FormattedValueNode(this.callFrame, this._sourceType, this._plugin, newObject, this.formatterTag, this._evalOptions, undefined);
        }
        // Property is a marker, check if it's just static type information or if we need to run formatters for the value.
        const newSourceType = this._sourceType.typeMap.get(base.rootType.typeId);
        if (!newSourceType) {
            throw new Error('Unknown typeId in eval base');
        }
        // The marker refers to a value that needs to be formatted, so run the formatter.
        if (base.rootType.hasValue && !base.rootType.canExpand && base) {
            return formatSourceValue(this.callFrame, this._plugin, newSourceType, base, [], this._evalOptions);
        }
        // The marker is just static information, so start a new subtree with a static type info root.
        const address = await StaticallyTypedValueNode.getInspectableAddress(this.callFrame, this._plugin, base, [], this._evalOptions);
        return new StaticallyTypedValueNode(this.callFrame, this._plugin, newSourceType, base, [], this._evalOptions, address);
    }
    /**
     * Check whether an object is a marker and if so return the EvalBase it contains.
     */
    async _getEvalBaseFromObject(object) {
        const { objectId } = object;
        if (!object || !this.formatterTag) {
            return null;
        }
        // A marker is definitively identified by the symbol property. To avoid checking the properties of all objects,
        // check the className first for an early exit.
        const { className, symbol } = this.formatterTag;
        if (className !== object.className) {
            return null;
        }
        const response = await this.debuggerModel().target().runtimeAgent().invoke_callFunctionOn({ functionDeclaration: 'function(sym) { return this[sym]; }', objectId, arguments: [{ objectId: symbol }] });
        const { result } = response;
        if (!result || result.type === 'undefined') {
            return null;
        }
        // The object is a marker, so pull the static type information from its symbol property. The symbol property is not
        // a formatted value per se, but we wrap it as one to be able to call `findProperties`.
        const baseObject = new FormattedValueNode(this.callFrame, this._sourceType, this._plugin, result, null, this._evalOptions, undefined);
        const { payload, rootType } = await baseObject.findProperties('payload', 'rootType');
        if (typeof payload === 'undefined' || typeof rootType === 'undefined') {
            return null;
        }
        const value = await resolveRemoteObject(this.callFrame, payload);
        const { typeId } = await rootType.findProperties('typeId');
        if (typeof value === 'undefined' || typeof typeId === 'undefined') {
            return null;
        }
        const newSourceType = this._sourceType.typeMap.get(typeId.value);
        if (!newSourceType) {
            return null;
        }
        return { payload: value, rootType: newSourceType.typeInfo };
    }
}
class FormattingError extends Error {
    exception;
    exceptionDetails;
    constructor(exception, exceptionDetails) {
        const { description } = exceptionDetails.exception || {};
        super(description || exceptionDetails.text);
        this.exception = exception;
        this.exceptionDetails = exceptionDetails;
    }
    static throwLocal(callFrame, message) {
        const exception = {
            type: "object" /* Object */,
            subtype: "error" /* Error */,
            description: message,
        };
        const exceptionDetails = { text: 'Uncaught', exceptionId: -1, columnNumber: 0, lineNumber: 0, exception };
        const errorObject = callFrame.debuggerModel.runtimeModel().createRemoteObject(exception);
        throw new FormattingError(errorObject, exceptionDetails);
    }
}
// This class implements a `RemoteObject` for source language value whose immediate properties are defined purely by
// static type information. Static type information is expressed by an `EvalBase` together with a `fieldChain`. The
// latter is necessary to express navigating through type members. We don't know how to make sense of an `EvalBase`'s
// payload here, which is why member navigation is relayed to the formatter via the `fieldChain`.
class StaticallyTypedValueNode extends ValueNode {
    _variableType;
    _plugin;
    _sourceType;
    _base;
    _fieldChain;
    _hasChildren;
    _evalOptions;
    constructor(callFrame, plugin, sourceType, base, fieldChain, evalOptions, inspectableAddress) {
        const typeName = sourceType.typeInfo.typeNames[0] || '<anonymous>';
        const variableType = 'object';
        super(callFrame, 
        /* objectId=*/ undefined, 
        /* type=*/ variableType, 
        /* subtype=*/ undefined, /* value=*/ null, inspectableAddress, /* unserializableValue=*/ undefined, 
        /* description=*/ typeName, /* preview=*/ undefined, /* customPreview=*/ undefined, /* className=*/ typeName);
        this._variableType = variableType;
        this._plugin = plugin;
        this._sourceType = sourceType;
        this._base = base;
        this._fieldChain = fieldChain;
        this._hasChildren = true;
        this._evalOptions = evalOptions;
    }
    get type() {
        return this._variableType;
    }
    async _expandMember(sourceType, fieldInfo) {
        const fieldChain = this._fieldChain.concat(fieldInfo);
        if (sourceType.typeInfo.hasValue && !sourceType.typeInfo.canExpand && this._base) {
            return formatSourceValue(this.callFrame, this._plugin, sourceType, this._base, fieldChain, this._evalOptions);
        }
        const address = this.inspectableAddress !== undefined ? this.inspectableAddress + fieldInfo.offset : undefined;
        return new StaticallyTypedValueNode(this.callFrame, this._plugin, sourceType, this._base, fieldChain, this._evalOptions, address);
    }
    static async getInspectableAddress(callFrame, plugin, base, field, evalOptions) {
        if (!base) {
            return undefined;
        }
        const addressCode = await plugin.getInspectableAddress({ base, field });
        if (!addressCode.js) {
            return undefined;
        }
        const response = await callFrame.debuggerModel.target().debuggerAgent().invoke_evaluateOnCallFrame({
            callFrameId: callFrame.id,
            expression: addressCode.js,
            objectGroup: evalOptions.objectGroup,
            includeCommandLineAPI: evalOptions.includeCommandLineAPI,
            silent: evalOptions.silent,
            returnByValue: true,
            generatePreview: evalOptions.generatePreview,
            throwOnSideEffect: evalOptions.throwOnSideEffect,
            timeout: evalOptions.timeout,
        });
        const error = response.getError();
        if (error) {
            throw new Error(error);
        }
        const { result, exceptionDetails } = response;
        if (exceptionDetails) {
            throw new FormattingError(callFrame.debuggerModel.runtimeModel().createRemoteObject(result), exceptionDetails);
        }
        const address = result.value;
        if (!Number.isSafeInteger(address) || address < 0) {
            console.error(`Inspectable address is not a positive, safe integer: ${address}`);
            return undefined;
        }
        return address;
    }
    async doGetProperties(_ownProperties, accessorPropertiesOnly, _generatePreview) {
        const { typeInfo } = this._sourceType;
        if (accessorPropertiesOnly || !typeInfo.canExpand) {
            return { properties: [], internalProperties: [] };
        }
        if (typeInfo.members.length > 0) {
            // This value doesn't have a formatter, but we can eagerly expand arrays in the frontend if the size is known.
            if (typeInfo.arraySize > 0) {
                const { typeId } = this._sourceType.typeInfo.members[0];
                const properties = [];
                const elementTypeInfo = this._sourceType.members[0];
                for (let i = 0; i < typeInfo.arraySize; ++i) {
                    const name = `${i}`;
                    const elementField = { name, typeId, offset: elementTypeInfo.typeInfo.size * i };
                    properties.push(new SDK.RemoteObject.RemoteObjectProperty(name, await this._expandMember(elementTypeInfo, elementField), /* enumerable=*/ false, 
                    /* writable=*/ false, 
                    /* isOwn=*/ true, 
                    /* wasThrown=*/ false));
                }
                return { properties, internalProperties: [] };
            }
            // The node is expanded, just make remote objects for its members
            const members = Promise.all(this._sourceType.members.map(async (memberTypeInfo, idx) => {
                const fieldInfo = this._sourceType.typeInfo.members[idx];
                const propertyObject = await this._expandMember(memberTypeInfo, fieldInfo);
                const name = fieldInfo.name || '';
                return new SDK.RemoteObject.RemoteObjectProperty(name, propertyObject, /* enumerable=*/ false, /* writable=*/ false, /* isOwn=*/ true, 
                /* wasThrown=*/ false);
            }));
            return { properties: await members, internalProperties: [] };
        }
        return { properties: [], internalProperties: [] };
    }
}
class NamespaceObject extends SDK.RemoteObject.LocalJSONObject {
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(value) {
        super(value);
    }
    get description() {
        return this.type;
    }
    get type() {
        return 'namespace';
    }
}
class SourceScopeRemoteObject extends SDK.RemoteObject.RemoteObjectImpl {
    variables;
    _callFrame;
    _plugin;
    _location;
    constructor(callFrame, plugin, location) {
        super(callFrame.debuggerModel.runtimeModel(), undefined, 'object', undefined, null);
        this.variables = [];
        this._callFrame = callFrame;
        this._plugin = plugin;
        this._location = location;
    }
    async doGetProperties(ownProperties, accessorPropertiesOnly, _generatePreview) {
        if (accessorPropertiesOnly) {
            return { properties: [], internalProperties: [] };
        }
        const properties = [];
        const namespaces = {};
        function makeProperty(name, obj) {
            return new SDK.RemoteObject.RemoteObjectProperty(name, obj, 
            /* enumerable=*/ false, /* writable=*/ false, /* isOwn=*/ true, /* wasThrown=*/ false);
        }
        for (const variable of this.variables) {
            let sourceVar;
            try {
                sourceVar = await getValueTreeForExpression(this._callFrame, this._plugin, variable.name, {
                    generatePreview: false,
                    includeCommandLineAPI: true,
                    objectGroup: 'backtrace',
                    returnByValue: false,
                    silent: false,
                });
            }
            catch (e) {
                console.warn(e);
                sourceVar = new SDK.RemoteObject.LocalJSONObject(undefined);
            }
            if (variable.nestedName && variable.nestedName.length > 1) {
                let parent = namespaces;
                for (let index = 0; index < variable.nestedName.length - 1; index++) {
                    const nestedName = variable.nestedName[index];
                    let child = parent[nestedName];
                    if (!child) {
                        child = new NamespaceObject({});
                        parent[nestedName] = child;
                    }
                    parent = child.value;
                }
                const name = variable.nestedName[variable.nestedName.length - 1];
                parent[name] = sourceVar;
            }
            else {
                properties.push(makeProperty(variable.name, sourceVar));
            }
        }
        for (const namespace in namespaces) {
            properties.push(makeProperty(namespace, namespaces[namespace]));
        }
        return /** @type {!SDK.RemoteObject.GetPropertiesResult} */ { properties: properties, internalProperties: [] };
    }
}
export class SourceScope {
    _callFrame;
    _type;
    _typeName;
    _icon;
    _object;
    _name;
    _startLocation;
    _endLocation;
    constructor(callFrame, type, typeName, icon, plugin, location) {
        this._callFrame = callFrame;
        this._type = type;
        this._typeName = typeName;
        this._icon = icon;
        this._object = new SourceScopeRemoteObject(callFrame, plugin, location);
        this._name = type;
        this._startLocation = null;
        this._endLocation = null;
    }
    async getVariableValue(name) {
        for (let v = 0; v < this._object.variables.length; ++v) {
            if (this._object.variables[v].name !== name) {
                continue;
            }
            const properties = await this._object.getAllProperties(false, false);
            if (!properties.properties) {
                continue;
            }
            const { value } = properties.properties[v];
            if (value) {
                return value;
            }
        }
        return null;
    }
    callFrame() {
        return this._callFrame;
    }
    type() {
        return this._type;
    }
    typeName() {
        return this._typeName;
    }
    name() {
        return undefined;
    }
    startLocation() {
        return this._startLocation;
    }
    endLocation() {
        return this._endLocation;
    }
    object() {
        return this._object;
    }
    description() {
        return '';
    }
    icon() {
        return this._icon;
    }
}
export class DebuggerLanguagePluginManager {
    _workspace;
    _debuggerWorkspaceBinding;
    _plugins;
    _debuggerModelToData;
    _rawModuleHandles;
    constructor(targetManager, workspace, debuggerWorkspaceBinding) {
        this._workspace = workspace;
        this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        this._plugins = [];
        this._debuggerModelToData = new Map();
        targetManager.observeModels(SDK.DebuggerModel.DebuggerModel, this);
        this._rawModuleHandles = new Map();
    }
    async _evaluateOnCallFrame(callFrame, options) {
        const { script } = callFrame;
        const { expression } = options;
        const { plugin } = await this._rawModuleIdAndPluginForScript(script);
        if (!plugin) {
            return null;
        }
        const location = getRawLocation(callFrame);
        const sourceLocations = await plugin.rawLocationToSourceLocation(location);
        if (sourceLocations.length === 0) {
            return null;
        }
        try {
            const object = await getValueTreeForExpression(callFrame, plugin, expression, options);
            return { object, exceptionDetails: undefined };
        }
        catch (error) {
            if (error instanceof FormattingError) {
                const { exception: object, exceptionDetails } = error;
                return { object, exceptionDetails };
            }
            return { error: error.message };
        }
    }
    _expandCallFrames(callFrames) {
        return Promise
            .all(callFrames.map(async (callFrame) => {
            const { frames } = await this.getFunctionInfo(callFrame.script, callFrame.location());
            if (frames.length) {
                return frames.map(({ name }, index) => callFrame.createVirtualCallFrame(index, name));
            }
            return callFrame;
        }))
            .then(callFrames => callFrames.flat());
    }
    modelAdded(debuggerModel) {
        this._debuggerModelToData.set(debuggerModel, new ModelData(debuggerModel, this._workspace));
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.GlobalObjectCleared, this._globalObjectCleared, this);
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.ParsedScriptSource, this._parsedScriptSource, this);
        debuggerModel.setEvaluateOnCallFrameCallback(this._evaluateOnCallFrame.bind(this));
        debuggerModel.setExpandCallFramesCallback(this._expandCallFrames.bind(this));
    }
    modelRemoved(debuggerModel) {
        debuggerModel.removeEventListener(SDK.DebuggerModel.Events.GlobalObjectCleared, this._globalObjectCleared, this);
        debuggerModel.removeEventListener(SDK.DebuggerModel.Events.ParsedScriptSource, this._parsedScriptSource, this);
        debuggerModel.setEvaluateOnCallFrameCallback(null);
        debuggerModel.setExpandCallFramesCallback(null);
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (modelData) {
            modelData._dispose();
            this._debuggerModelToData.delete(debuggerModel);
        }
        this._rawModuleHandles.forEach((rawModuleHandle, rawModuleId) => {
            const scripts = rawModuleHandle.scripts.filter(script => script.debuggerModel !== debuggerModel);
            if (scripts.length === 0) {
                rawModuleHandle.plugin.removeRawModule(rawModuleId).catch(error => {
                    Common.Console.Console.instance().error(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
                });
                this._rawModuleHandles.delete(rawModuleId);
            }
            else {
                rawModuleHandle.scripts = scripts;
            }
        });
    }
    _globalObjectCleared(event) {
        const debuggerModel = event.data;
        this.modelRemoved(debuggerModel);
        this.modelAdded(debuggerModel);
    }
    addPlugin(plugin) {
        this._plugins.push(plugin);
        for (const debuggerModel of this._debuggerModelToData.keys()) {
            for (const script of debuggerModel.scripts()) {
                if (this.hasPluginForScript(script)) {
                    continue;
                }
                this._parsedScriptSource({ data: script });
            }
        }
    }
    removePlugin(plugin) {
        this._plugins = this._plugins.filter(p => p !== plugin);
        const scripts = new Set();
        this._rawModuleHandles.forEach((rawModuleHandle, rawModuleId) => {
            if (rawModuleHandle.plugin !== plugin) {
                return;
            }
            rawModuleHandle.scripts.forEach(script => scripts.add(script));
            this._rawModuleHandles.delete(rawModuleId);
        });
        for (const script of scripts) {
            const modelData = this._debuggerModelToData.get(script.debuggerModel);
            modelData._removeScript(script);
            // Let's see if we have another plugin that's happy to
            // take this orphaned script now. This is important to
            // get right, since the same plugin might race during
            // unregister/register and we might already have the
            // new instance of the plugin added before we remove
            // the previous instance.
            this._parsedScriptSource({ data: script });
        }
    }
    hasPluginForScript(script) {
        const rawModuleId = rawModuleIdForScript(script);
        const rawModuleHandle = this._rawModuleHandles.get(rawModuleId);
        return rawModuleHandle !== undefined && rawModuleHandle.scripts.includes(script);
    }
    /**
     * Returns the responsible language plugin and the raw module ID for a script.
     *
     * This ensures that the `addRawModule` call finishes first such that the
     * caller can immediately issue calls to the returned plugin without the
     * risk of racing with the `addRawModule` call. The returned plugin will be
     * set to undefined to indicate that there's no plugin for the script.
     */
    async _rawModuleIdAndPluginForScript(script) {
        const rawModuleId = rawModuleIdForScript(script);
        const rawModuleHandle = this._rawModuleHandles.get(rawModuleId);
        if (rawModuleHandle) {
            await rawModuleHandle.addRawModulePromise;
            if (rawModuleHandle === this._rawModuleHandles.get(rawModuleId)) {
                return { rawModuleId, plugin: rawModuleHandle.plugin };
            }
        }
        return { rawModuleId, plugin: null };
    }
    uiSourceCodeForURL(debuggerModel, url) {
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (modelData) {
            return modelData._project.uiSourceCodeForURL(url);
        }
        return null;
    }
    async rawLocationToUILocation(rawLocation) {
        const script = rawLocation.script();
        if (!script) {
            return null;
        }
        const { rawModuleId, plugin } = await this._rawModuleIdAndPluginForScript(script);
        if (!plugin) {
            return null;
        }
        const pluginLocation = {
            rawModuleId,
            // RawLocation.columnNumber is the byte offset in the full raw wasm module. Plugins expect the offset in the code
            // section, so subtract the offset of the code section in the module here.
            codeOffset: rawLocation.columnNumber - (script.codeOffset() || 0),
            inlineFrameIndex: rawLocation.inlineFrameIndex,
        };
        try {
            const sourceLocations = await plugin.rawLocationToSourceLocation(pluginLocation);
            for (const sourceLocation of sourceLocations) {
                const uiSourceCode = this.uiSourceCodeForURL(script.debuggerModel, sourceLocation.sourceFileURL);
                if (!uiSourceCode) {
                    continue;
                }
                // Absence of column information is indicated by the value `-1` in talking to language plugins.
                return uiSourceCode.uiLocation(sourceLocation.lineNumber, sourceLocation.columnNumber >= 0 ? sourceLocation.columnNumber : undefined);
            }
        }
        catch (error) {
            Common.Console.Console.instance().error(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
        }
        return null;
    }
    uiLocationToRawLocationRanges(uiSourceCode, lineNumber, columnNumber = -1) {
        const locationPromises = [];
        this.scriptsForUISourceCode(uiSourceCode).forEach(script => {
            const rawModuleId = rawModuleIdForScript(script);
            const rawModuleHandle = this._rawModuleHandles.get(rawModuleId);
            if (!rawModuleHandle) {
                return;
            }
            const { plugin } = rawModuleHandle;
            locationPromises.push(getLocations(rawModuleId, plugin, script));
        });
        if (locationPromises.length === 0) {
            return Promise.resolve(null);
        }
        return Promise.all(locationPromises).then(locations => locations.flat()).catch(error => {
            Common.Console.Console.instance().error(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
            return null;
        });
        async function getLocations(rawModuleId, plugin, script) {
            const pluginLocation = { rawModuleId, sourceFileURL: uiSourceCode.url(), lineNumber, columnNumber };
            const rawLocations = await plugin.sourceLocationToRawLocation(pluginLocation);
            if (!rawLocations) {
                return [];
            }
            return rawLocations.map(m => ({
                start: new SDK.DebuggerModel.Location(script.debuggerModel, script.scriptId, 0, Number(m.startOffset) + (script.codeOffset() || 0)),
                end: new SDK.DebuggerModel.Location(script.debuggerModel, script.scriptId, 0, Number(m.endOffset) + (script.codeOffset() || 0)),
            }));
        }
    }
    async uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber) {
        const locationRanges = await this.uiLocationToRawLocationRanges(uiSourceCode, lineNumber, columnNumber);
        if (!locationRanges) {
            return null;
        }
        return locationRanges.map(({ start }) => start);
    }
    scriptsForUISourceCode(uiSourceCode) {
        for (const modelData of this._debuggerModelToData.values()) {
            const scripts = modelData._uiSourceCodeToScripts.get(uiSourceCode);
            if (scripts) {
                return scripts;
            }
        }
        return [];
    }
    _parsedScriptSource(event) {
        const script = event.data;
        if (!script.sourceURL) {
            return;
        }
        for (const plugin of this._plugins) {
            if (!plugin.handleScript(script)) {
                return;
            }
            const rawModuleId = rawModuleIdForScript(script);
            let rawModuleHandle = this._rawModuleHandles.get(rawModuleId);
            if (!rawModuleHandle) {
                const sourceFileURLsPromise = (async () => {
                    const console = Common.Console.Console.instance();
                    const url = script.sourceURL;
                    const symbolsUrl = (script.debugSymbols && script.debugSymbols.externalURL) || '';
                    if (symbolsUrl) {
                        console.log(i18nString(UIStrings.loadingDebugSymbolsForVia, { PH1: plugin.name, PH2: url, PH3: symbolsUrl }));
                    }
                    else {
                        console.log(i18nString(UIStrings.loadingDebugSymbolsFor, { PH1: plugin.name, PH2: url }));
                    }
                    try {
                        const code = (!symbolsUrl && url.startsWith('wasm://')) ? await script.getWasmBytecode() : undefined;
                        const sourceFileURLs = await plugin.addRawModule(rawModuleId, symbolsUrl, { url, code });
                        // Check that the handle isn't stale by now. This works because the code that assigns to
                        // `rawModuleHandle` below will run before this code because of the `await` in the preceding
                        // line. This is primarily to avoid logging the message below, which would give the developer
                        // the misleading information that we're done, while in reality it was a stale call that finished.
                        if (rawModuleHandle !== this._rawModuleHandles.get(rawModuleId)) {
                            return [];
                        }
                        if (sourceFileURLs.length === 0) {
                            console.warn(i18nString(UIStrings.loadedDebugSymbolsForButDidnt, { PH1: plugin.name, PH2: url }));
                        }
                        else {
                            console.log(i18nString(UIStrings.loadedDebugSymbolsForFound, { PH1: plugin.name, PH2: url, PH3: sourceFileURLs.length }));
                        }
                        return sourceFileURLs;
                    }
                    catch (error) {
                        console.error(i18nString(UIStrings.failedToLoadDebugSymbolsFor, { PH1: plugin.name, PH2: url, PH3: error.message }));
                        this._rawModuleHandles.delete(rawModuleId);
                        return [];
                    }
                })();
                rawModuleHandle = { rawModuleId, plugin, scripts: [script], addRawModulePromise: sourceFileURLsPromise };
                this._rawModuleHandles.set(rawModuleId, rawModuleHandle);
            }
            else {
                rawModuleHandle.scripts.push(script);
            }
            // Wait for the addRawModule call to finish and
            // update the project. It's important to check
            // for the DebuggerModel again, which may disappear
            // in the meantime...
            rawModuleHandle.addRawModulePromise.then(sourceFileURLs => {
                // The script might have disappeared meanwhile...
                if (script.debuggerModel.scriptForId(script.scriptId) === script) {
                    const modelData = this._debuggerModelToData.get(script.debuggerModel);
                    if (modelData) { // The DebuggerModel could have disappeared meanwhile...
                        modelData._addSourceFiles(script, sourceFileURLs);
                        this._debuggerWorkspaceBinding.updateLocations(script);
                    }
                }
            });
            return;
        }
    }
    async resolveScopeChain(callFrame) {
        const script = callFrame.script;
        const { rawModuleId, plugin } = await this._rawModuleIdAndPluginForScript(script);
        if (!plugin) {
            return null;
        }
        const location = {
            rawModuleId,
            codeOffset: callFrame.location().columnNumber - (script.codeOffset() || 0),
            inlineFrameIndex: callFrame.inlineFrameIndex,
        };
        try {
            const sourceMapping = await plugin.rawLocationToSourceLocation(location);
            if (sourceMapping.length === 0) {
                return null;
            }
            const scopes = new Map();
            const variables = await plugin.listVariablesInScope(location);
            for (const variable of variables || []) {
                let scope = scopes.get(variable.scope);
                if (!scope) {
                    const { type, typeName, icon } = await plugin.getScopeInfo(variable.scope);
                    scope = new SourceScope(callFrame, type, typeName, icon, plugin, location);
                    scopes.set(variable.scope, scope);
                }
                scope.object().variables.push(variable);
            }
            return Array.from(scopes.values());
        }
        catch (error) {
            Common.Console.Console.instance().error(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
            return null;
        }
    }
    async getFunctionInfo(script, location) {
        const noDwarfInfo = { frames: [] };
        const { rawModuleId, plugin } = await this._rawModuleIdAndPluginForScript(script);
        if (!plugin) {
            return noDwarfInfo;
        }
        const rawLocation = {
            rawModuleId,
            codeOffset: location.columnNumber - (script.codeOffset() || 0),
            inlineFrameIndex: 0,
        };
        try {
            return await plugin.getFunctionInfo(rawLocation);
        }
        catch (error) {
            Common.Console.Console.instance().warn(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
            return noDwarfInfo;
        }
    }
    async getInlinedFunctionRanges(rawLocation) {
        const script = rawLocation.script();
        if (!script) {
            return [];
        }
        const { rawModuleId, plugin } = await this._rawModuleIdAndPluginForScript(script);
        if (!plugin) {
            return [];
        }
        const pluginLocation = {
            rawModuleId,
            // RawLocation.columnNumber is the byte offset in the full raw wasm module. Plugins expect the offset in the code
            // section, so subtract the offset of the code section in the module here.
            codeOffset: rawLocation.columnNumber - (script.codeOffset() || 0),
        };
        try {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // @ts-ignore
            const locations = await plugin.getInlinedFunctionRanges(pluginLocation);
            return locations.map(m => ({
                start: new SDK.DebuggerModel.Location(script.debuggerModel, script.scriptId, 0, Number(m.startOffset) + (script.codeOffset() || 0)),
                end: new SDK.DebuggerModel.Location(script.debuggerModel, script.scriptId, 0, Number(m.endOffset) + (script.codeOffset() || 0)),
            }));
        }
        catch (error) {
            Common.Console.Console.instance().warn(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
            return [];
        }
    }
    async getInlinedCalleesRanges(rawLocation) {
        const script = rawLocation.script();
        if (!script) {
            return [];
        }
        const { rawModuleId, plugin } = await this._rawModuleIdAndPluginForScript(script);
        if (!plugin) {
            return [];
        }
        const pluginLocation = {
            rawModuleId,
            // RawLocation.columnNumber is the byte offset in the full raw wasm module. Plugins expect the offset in the code
            // section, so subtract the offset of the code section in the module here.
            codeOffset: rawLocation.columnNumber - (script.codeOffset() || 0),
        };
        try {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // @ts-ignore
            const locations = await plugin.getInlinedCalleesRanges(pluginLocation);
            return locations.map(m => ({
                start: new SDK.DebuggerModel.Location(script.debuggerModel, script.scriptId, 0, Number(m.startOffset) + (script.codeOffset() || 0)),
                end: new SDK.DebuggerModel.Location(script.debuggerModel, script.scriptId, 0, Number(m.endOffset) + (script.codeOffset() || 0)),
            }));
        }
        catch (error) {
            Common.Console.Console.instance().warn(i18nString(UIStrings.errorInDebuggerLanguagePlugin, { PH1: error.message }));
            return [];
        }
    }
    async getMappedLines(uiSourceCode) {
        const rawModuleIds = await Promise.all(this.scriptsForUISourceCode(uiSourceCode).map(s => this._rawModuleIdAndPluginForScript(s)));
        let mappedLines;
        for (const { rawModuleId, plugin } of rawModuleIds) {
            if (!plugin) {
                continue;
            }
            const lines = await plugin.getMappedLines(rawModuleId, uiSourceCode.url());
            if (lines === undefined) {
                continue;
            }
            if (mappedLines === undefined) {
                mappedLines = new Set(lines);
            }
            else {
                /**
                 * @param {number} l
                 */
                lines.forEach(l => mappedLines.add(l));
            }
        }
        return mappedLines;
    }
}
class ModelData {
    _debuggerModel;
    _project;
    _uiSourceCodeToScripts;
    constructor(debuggerModel, workspace) {
        this._debuggerModel = debuggerModel;
        this._project = new ContentProviderBasedProject(workspace, 'language_plugins::' + debuggerModel.target().id(), Workspace.Workspace.projectTypes.Network, '', false /* isServiceProject */);
        NetworkProject.setTargetForProject(this._project, debuggerModel.target());
        this._uiSourceCodeToScripts = new Map();
    }
    _addSourceFiles(script, urls) {
        const initiator = script.createPageResourceLoadInitiator();
        for (const url of urls) {
            let uiSourceCode = this._project.uiSourceCodeForURL(url);
            if (!uiSourceCode) {
                uiSourceCode = this._project.createUISourceCode(url, Common.ResourceType.resourceTypes.SourceMapScript);
                NetworkProject.setInitialFrameAttribution(uiSourceCode, script.frameId);
                // Bind the uiSourceCode to the script first before we add the
                // uiSourceCode to the project and thereby notify the rest of
                // the system about the new source file.
                // https://crbug.com/1150295 is an example where the breakpoint
                // resolution logic kicks in right after adding the uiSourceCode
                // and at that point we already need to have the mapping in place
                // otherwise we will not get the breakpoint right.
                this._uiSourceCodeToScripts.set(uiSourceCode, [script]);
                const contentProvider = new SDK.CompilerSourceMappingContentProvider.CompilerSourceMappingContentProvider(url, Common.ResourceType.resourceTypes.SourceMapScript, initiator);
                const mimeType = Common.ResourceType.ResourceType.mimeFromURL(url) || 'text/javascript';
                this._project.addUISourceCodeWithProvider(uiSourceCode, contentProvider, null, mimeType);
            }
            else {
                // The same uiSourceCode can be provided by different scripts,
                // but we don't expect that to happen frequently.
                const scripts = this._uiSourceCodeToScripts.get(uiSourceCode);
                if (!scripts.includes(script)) {
                    scripts.push(script);
                }
            }
        }
    }
    _removeScript(script) {
        this._uiSourceCodeToScripts.forEach((scripts, uiSourceCode) => {
            scripts = scripts.filter(s => s !== script);
            if (scripts.length === 0) {
                this._uiSourceCodeToScripts.delete(uiSourceCode);
                this._project.removeUISourceCode(uiSourceCode.url());
            }
            else {
                this._uiSourceCodeToScripts.set(uiSourceCode, scripts);
            }
        });
    }
    _dispose() {
        this._project.dispose();
    }
}
export class DebuggerLanguagePlugin {
    name;
    constructor(name) {
        this.name = name;
    }
    handleScript(_script) {
        throw new Error('Not implemented yet');
    }
    dispose() {
    }
    /** Notify the plugin about a new script
      */
    async addRawModule(_rawModuleId, _symbolsURL, _rawModule) {
        throw new Error('Not implemented yet');
    }
    /** Find locations in raw modules from a location in a source file
      */
    async sourceLocationToRawLocation(_sourceLocation) {
        throw new Error('Not implemented yet');
    }
    /** Find locations in source files from a location in a raw module
      */
    async rawLocationToSourceLocation(_rawLocation) {
        throw new Error('Not implemented yet');
    }
    /** Return detailed information about a scope
       */
    async getScopeInfo(_type) {
        throw new Error('Not implemented yet');
    }
    /** List all variables in lexical scope at a given location in a raw module
      */
    async listVariablesInScope(_rawLocation) {
        throw new Error('Not implemented yet');
    }
    /**
     * Notifies the plugin that a script is removed.
     */
    removeRawModule(_rawModuleId) {
        throw new Error('Not implemented yet');
    }
    getTypeInfo(_expression, _context) {
        throw new Error('Not implemented yet');
    }
    getFormatter(_expressionOrField, _context) {
        throw new Error('Not implemented yet');
    }
    getInspectableAddress(_field) {
        throw new Error('Not implemented yet');
    }
    /**
     * Find locations in source files from a location in a raw module
     */
    async getFunctionInfo(_rawLocation) {
        throw new Error('Not implemented yet');
    }
    /**
     * Find locations in raw modules corresponding to the inline function
     * that rawLocation is in. Used for stepping out of an inline function.
     */
    async getInlinedFunctionRanges(_rawLocation) {
        throw new Error('Not implemented yet');
    }
    /**
     * Find locations in raw modules corresponding to inline functions
     * called by the function or inline frame that rawLocation is in.
     * Used for stepping over inline functions.
     */
    async getInlinedCalleesRanges(_rawLocation) {
        throw new Error('Not implemented yet');
    }
    async getMappedLines(_rawModuleId, _sourceFileURL) {
        throw new Error('Not implemented yet');
    }
}
//# sourceMappingURL=DebuggerLanguagePlugins.js.map