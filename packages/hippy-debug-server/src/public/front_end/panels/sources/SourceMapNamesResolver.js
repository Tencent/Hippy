// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Formatter from '../../models/formatter/formatter.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
const scopeToCachedIdentifiersMap = new WeakMap();
const cachedMapByCallFrame = new WeakMap();
export class Identifier {
    name;
    lineNumber;
    columnNumber;
    constructor(name, lineNumber, columnNumber) {
        this.name = name;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }
}
export const scopeIdentifiers = async function (scope) {
    if (scope.type() === "global" /* Global */) {
        return [];
    }
    const startLocation = scope.startLocation();
    const endLocation = scope.endLocation();
    if (!startLocation || !endLocation) {
        return [];
    }
    const script = startLocation.script();
    if (!script || !script.sourceMapURL || script !== endLocation.script()) {
        return [];
    }
    const { content } = await script.requestContent();
    if (!content) {
        return [];
    }
    const text = new TextUtils.Text.Text(content);
    const scopeRange = new TextUtils.TextRange.TextRange(startLocation.lineNumber, startLocation.columnNumber, endLocation.lineNumber, endLocation.columnNumber);
    const scopeText = text.extract(scopeRange);
    const scopeStart = text.toSourceRange(scopeRange).offset;
    const prefix = 'function fui';
    const identifiers = await Formatter.FormatterWorkerPool.formatterWorkerPool().javaScriptIdentifiers(prefix + scopeText);
    const result = [];
    const cursor = new TextUtils.TextCursor.TextCursor(text.lineEndings());
    for (const id of identifiers) {
        if (id.offset < prefix.length) {
            continue;
        }
        const start = scopeStart + id.offset - prefix.length;
        cursor.resetTo(start);
        result.push(new Identifier(id.name, cursor.lineNumber(), cursor.columnNumber()));
    }
    return result;
};
export const resolveScopeChain = async function (callFrame) {
    if (!callFrame) {
        return null;
    }
    const { pluginManager } = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance();
    if (pluginManager) {
        const scopeChain = await pluginManager.resolveScopeChain(callFrame);
        if (scopeChain) {
            return scopeChain;
        }
    }
    return callFrame.scopeChain();
};
export const resolveScope = async (scope) => {
    let identifiersPromise = scopeToCachedIdentifiersMap.get(scope);
    if (!identifiersPromise) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        identifiersPromise = (async () => {
            const namesMapping = new Map();
            const script = scope.callFrame().script;
            const sourceMap = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().sourceMapForScript(script);
            if (sourceMap) {
                const textCache = new Map();
                // Extract as much as possible from SourceMap and resolve
                // missing identifier names from SourceMap ranges.
                const promises = [];
                for (const id of await scopeIdentifiers(scope)) {
                    const entry = sourceMap.findEntry(id.lineNumber, id.columnNumber);
                    if (entry && entry.name) {
                        namesMapping.set(id.name, entry.name);
                    }
                    else {
                        promises.push(resolveSourceName(script, sourceMap, id, textCache).then(sourceName => {
                            if (sourceName) {
                                namesMapping.set(id.name, sourceName);
                            }
                        }));
                    }
                }
                await Promise.all(promises).then(getScopeResolvedForTest());
            }
            return namesMapping;
        })();
        scopeToCachedIdentifiersMap.set(scope, identifiersPromise);
    }
    return await identifiersPromise;
    async function resolveSourceName(script, sourceMap, id, textCache) {
        const startEntry = sourceMap.findEntry(id.lineNumber, id.columnNumber);
        const endEntry = sourceMap.findEntry(id.lineNumber, id.columnNumber + id.name.length);
        if (!startEntry || !endEntry || !startEntry.sourceURL || startEntry.sourceURL !== endEntry.sourceURL ||
            !startEntry.sourceLineNumber || !startEntry.sourceColumnNumber || !endEntry.sourceLineNumber ||
            !endEntry.sourceColumnNumber) {
            return null;
        }
        const sourceTextRange = new TextUtils.TextRange.TextRange(startEntry.sourceLineNumber, startEntry.sourceColumnNumber, endEntry.sourceLineNumber, endEntry.sourceColumnNumber);
        const uiSourceCode = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().uiSourceCodeForSourceMapSourceURL(script.debuggerModel, startEntry.sourceURL, script.isContentScript());
        if (!uiSourceCode) {
            return null;
        }
        const { content } = await uiSourceCode.requestContent();
        if (!content) {
            return null;
        }
        let text = textCache.get(content);
        if (!text) {
            text = new TextUtils.Text.Text(content);
            textCache.set(content, text);
        }
        const originalIdentifier = text.extract(sourceTextRange).trim();
        return /[a-zA-Z0-9_$]+/.test(originalIdentifier) ? originalIdentifier : null;
    }
};
export const allVariablesInCallFrame = async (callFrame) => {
    const cachedMap = cachedMapByCallFrame.get(callFrame);
    if (cachedMap) {
        return cachedMap;
    }
    const scopeChain = callFrame.scopeChain();
    const nameMappings = await Promise.all(scopeChain.map(resolveScope));
    const reverseMapping = new Map();
    for (const map of nameMappings) {
        for (const [compiledName, originalName] of map) {
            if (originalName && !reverseMapping.has(originalName)) {
                reverseMapping.set(originalName, compiledName);
            }
        }
    }
    cachedMapByCallFrame.set(callFrame, reverseMapping);
    return reverseMapping;
};
export const resolveExpression = async (callFrame, originalText, uiSourceCode, lineNumber, startColumnNumber, endColumnNumber) => {
    if (uiSourceCode.mimeType() === 'application/wasm') {
        // For WebAssembly disassembly, lookup the different possiblities.
        return `memories["${originalText}"] ?? locals["${originalText}"] ?? tables["${originalText}"] ?? functions["${originalText}"] ?? globals["${originalText}"]`;
    }
    if (!uiSourceCode.contentType().isFromSourceMap()) {
        return '';
    }
    const reverseMapping = await allVariablesInCallFrame(callFrame);
    if (reverseMapping.has(originalText)) {
        return reverseMapping.get(originalText);
    }
    const rawLocations = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiSourceCode, lineNumber, startColumnNumber);
    const rawLocation = rawLocations.find(location => location.debuggerModel === callFrame.debuggerModel);
    if (!rawLocation) {
        return '';
    }
    const script = rawLocation.script();
    if (!script) {
        return '';
    }
    const sourceMap = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().sourceMapForScript(script);
    if (!sourceMap) {
        return '';
    }
    const { content } = await script.requestContent();
    if (!content) {
        return '';
    }
    const text = new TextUtils.Text.Text(content);
    const textRange = sourceMap.reverseMapTextRange(uiSourceCode.url(), new TextUtils.TextRange.TextRange(lineNumber, startColumnNumber, lineNumber, endColumnNumber));
    if (!textRange) {
        return '';
    }
    const subjectText = text.extract(textRange);
    if (!subjectText) {
        return '';
    }
    return await Formatter.FormatterWorkerPool.formatterWorkerPool().evaluatableJavaScriptSubstring(subjectText);
};
export const resolveThisObject = async (callFrame) => {
    if (!callFrame) {
        return null;
    }
    const scopeChain = callFrame.scopeChain();
    if (scopeChain.length === 0) {
        return callFrame.thisObject();
    }
    const namesMapping = await resolveScope(scopeChain[0]);
    const thisMappings = Platform.MapUtilities.inverse(namesMapping).get('this');
    if (!thisMappings || thisMappings.size !== 1) {
        return callFrame.thisObject();
    }
    const [expression] = thisMappings.values();
    const result = await callFrame.evaluate({
        expression,
        objectGroup: 'backtrace',
        includeCommandLineAPI: false,
        silent: true,
        returnByValue: false,
        generatePreview: true,
    });
    if ('exceptionDetails' in result) {
        return !result.exceptionDetails && result.object ? result.object : callFrame.thisObject();
    }
    return null;
};
export const resolveScopeInObject = function (scope) {
    const startLocation = scope.startLocation();
    const endLocation = scope.endLocation();
    const startLocationScript = startLocation ? startLocation.script() : null;
    if (scope.type() === "global" /* Global */ || !startLocationScript || !endLocation ||
        !startLocationScript.sourceMapURL || startLocationScript !== endLocation.script()) {
        return scope.object();
    }
    return new RemoteObject(scope);
};
export class RemoteObject extends SDK.RemoteObject.RemoteObject {
    _scope;
    _object;
    constructor(scope) {
        super();
        this._scope = scope;
        this._object = scope.object();
    }
    customPreview() {
        return this._object.customPreview();
    }
    get objectId() {
        return this._object.objectId;
    }
    get type() {
        return this._object.type;
    }
    get subtype() {
        return this._object.subtype;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get value() {
        return this._object.value;
    }
    get description() {
        return this._object.description;
    }
    get hasChildren() {
        return this._object.hasChildren;
    }
    get preview() {
        return this._object.preview;
    }
    arrayLength() {
        return this._object.arrayLength();
    }
    getOwnProperties(generatePreview) {
        return this._object.getOwnProperties(generatePreview);
    }
    async getAllProperties(accessorPropertiesOnly, generatePreview) {
        const allProperties = await this._object.getAllProperties(accessorPropertiesOnly, generatePreview);
        const namesMapping = await resolveScope(this._scope);
        const properties = allProperties.properties;
        const internalProperties = allProperties.internalProperties;
        const newProperties = [];
        if (properties) {
            for (let i = 0; i < properties.length; ++i) {
                const property = properties[i];
                const name = namesMapping.get(property.name) || properties[i].name;
                if (!property.value) {
                    continue;
                }
                newProperties.push(new SDK.RemoteObject.RemoteObjectProperty(name, property.value, property.enumerable, property.writable, property.isOwn, property.wasThrown, property.symbol, property.synthetic));
            }
        }
        return { properties: newProperties, internalProperties: internalProperties };
    }
    async setPropertyValue(argumentName, value) {
        const namesMapping = await resolveScope(this._scope);
        let name;
        if (typeof argumentName === 'string') {
            name = argumentName;
        }
        else {
            name = argumentName.value;
        }
        let actualName = name;
        for (const compiledName of namesMapping.keys()) {
            if (namesMapping.get(compiledName) === name) {
                actualName = compiledName;
                break;
            }
        }
        return this._object.setPropertyValue(actualName, value);
    }
    async deleteProperty(name) {
        return this._object.deleteProperty(name);
    }
    callFunction(functionDeclaration, args) {
        return this._object.callFunction(functionDeclaration, args);
    }
    callFunctionJSON(functionDeclaration, args) {
        return this._object.callFunctionJSON(functionDeclaration, args);
    }
    release() {
        this._object.release();
    }
    debuggerModel() {
        return this._object.debuggerModel();
    }
    runtimeModel() {
        return this._object.runtimeModel();
    }
    isNode() {
        return this._object.isNode();
    }
}
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
let _scopeResolvedForTest = function () { };
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
export const getScopeResolvedForTest = () => {
    return _scopeResolvedForTest;
};
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
export const setScopeResolvedForTest = (scope) => {
    _scopeResolvedForTest = scope;
};
//# sourceMappingURL=SourceMapNamesResolver.js.map