// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import { CompilerScriptMapping } from './CompilerScriptMapping.js';
import { DebuggerLanguagePluginManager } from './DebuggerLanguagePlugins.js';
import { DefaultScriptMapping } from './DefaultScriptMapping.js';
import { IgnoreListManager } from './IgnoreListManager.js';
import { LiveLocationWithPool } from './LiveLocation.js'; // eslint-disable-line no-unused-vars
import { ResourceMapping } from './ResourceMapping.js';
import { ResourceScriptMapping } from './ResourceScriptMapping.js'; // eslint-disable-line no-unused-vars
let debuggerWorkspaceBindingInstance;
export class DebuggerWorkspaceBinding {
    _workspace;
    _sourceMappings;
    _debuggerModelToData;
    _liveLocationPromises;
    pluginManager;
    constructor(targetManager, workspace) {
        this._workspace = workspace;
        this._sourceMappings = [];
        this._debuggerModelToData = new Map();
        targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.GlobalObjectCleared, this._globalObjectCleared, this);
        targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerResumed, this._debuggerResumed, this);
        targetManager.observeModels(SDK.DebuggerModel.DebuggerModel, this);
        this._liveLocationPromises = new Set();
        this.pluginManager = Root.Runtime.experiments.isEnabled('wasmDWARFDebugging') ?
            new DebuggerLanguagePluginManager(targetManager, workspace, this) :
            null;
    }
    static instance(opts = { forceNew: null, targetManager: null, workspace: null }) {
        const { forceNew, targetManager, workspace } = opts;
        if (!debuggerWorkspaceBindingInstance || forceNew) {
            if (!targetManager || !workspace) {
                throw new Error(`Unable to create DebuggerWorkspaceBinding: targetManager and workspace must be provided: ${new Error().stack}`);
            }
            debuggerWorkspaceBindingInstance = new DebuggerWorkspaceBinding(targetManager, workspace);
        }
        return debuggerWorkspaceBindingInstance;
    }
    addSourceMapping(sourceMapping) {
        this._sourceMappings.push(sourceMapping);
    }
    async _computeAutoStepRanges(mode, callFrame) {
        function contained(location, range) {
            const { start, end } = range;
            if (start.scriptId !== location.scriptId) {
                return false;
            }
            if (location.lineNumber < start.lineNumber || location.lineNumber > end.lineNumber) {
                return false;
            }
            if (location.lineNumber === start.lineNumber && location.columnNumber < start.columnNumber) {
                return false;
            }
            if (location.lineNumber === end.lineNumber && location.columnNumber >= end.columnNumber) {
                return false;
            }
            return true;
        }
        // TODO(crbug.com/1018234): Also take into account source maps here and remove the auto-stepping
        // logic in the front-end (which is currently still an experiment) completely.
        const pluginManager = this.pluginManager;
        if (pluginManager) {
            const rawLocation = callFrame.location();
            if (mode === SDK.DebuggerModel.StepMode.StepOut) {
                // Step out of inline function.
                return await pluginManager.getInlinedFunctionRanges(rawLocation);
            }
            let ranges = [];
            const uiLocation = await pluginManager.rawLocationToUILocation(rawLocation);
            if (uiLocation) {
                ranges = await pluginManager.uiLocationToRawLocationRanges(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber) ||
                    [];
                // TODO(bmeurer): Remove the {rawLocation} from the {ranges}?
                ranges = ranges.filter(range => contained(rawLocation, range));
            }
            if (mode === SDK.DebuggerModel.StepMode.StepOver) {
                // Step over an inlined function.
                ranges = ranges.concat(await pluginManager.getInlinedCalleesRanges(rawLocation));
            }
            return ranges;
        }
        return [];
    }
    modelAdded(debuggerModel) {
        this._debuggerModelToData.set(debuggerModel, new ModelData(debuggerModel, this));
        debuggerModel.setComputeAutoStepRangesCallback(this._computeAutoStepRanges.bind(this));
    }
    modelRemoved(debuggerModel) {
        debuggerModel.setComputeAutoStepRangesCallback(null);
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (modelData) {
            modelData._dispose();
            this._debuggerModelToData.delete(debuggerModel);
        }
    }
    /**
     * The promise returned by this function is resolved once all *currently*
     * pending LiveLocations are processed.
     */
    async pendingLiveLocationChangesPromise() {
        await Promise.all(this._liveLocationPromises);
    }
    _recordLiveLocationChange(promise) {
        promise.then(() => {
            this._liveLocationPromises.delete(promise);
        });
        this._liveLocationPromises.add(promise);
    }
    async updateLocations(script) {
        const modelData = this._debuggerModelToData.get(script.debuggerModel);
        if (modelData) {
            const updatePromise = modelData._updateLocations(script);
            this._recordLiveLocationChange(updatePromise);
            await updatePromise;
        }
    }
    async createLiveLocation(rawLocation, updateDelegate, locationPool) {
        const modelData = this._debuggerModelToData.get(rawLocation.debuggerModel);
        if (!modelData) {
            return null;
        }
        const liveLocationPromise = modelData._createLiveLocation(rawLocation, updateDelegate, locationPool);
        this._recordLiveLocationChange(liveLocationPromise);
        return liveLocationPromise;
    }
    async createStackTraceTopFrameLiveLocation(rawLocations, updateDelegate, locationPool) {
        console.assert(rawLocations.length > 0);
        const locationPromise = StackTraceTopFrameLocation.createStackTraceTopFrameLocation(rawLocations, this, updateDelegate, locationPool);
        this._recordLiveLocationChange(locationPromise);
        return locationPromise;
    }
    async createCallFrameLiveLocation(location, updateDelegate, locationPool) {
        const script = location.script();
        if (!script) {
            return null;
        }
        const debuggerModel = location.debuggerModel;
        const liveLocationPromise = this.createLiveLocation(location, updateDelegate, locationPool);
        this._recordLiveLocationChange(liveLocationPromise);
        const liveLocation = await liveLocationPromise;
        if (!liveLocation) {
            return null;
        }
        this._registerCallFrameLiveLocation(debuggerModel, liveLocation);
        return liveLocation;
    }
    async rawLocationToUILocation(rawLocation) {
        for (const sourceMapping of this._sourceMappings) {
            const uiLocation = sourceMapping.rawLocationToUILocation(rawLocation);
            if (uiLocation) {
                return uiLocation;
            }
        }
        if (this.pluginManager) {
            const uiLocation = await this.pluginManager.rawLocationToUILocation(rawLocation);
            if (uiLocation) {
                return uiLocation;
            }
        }
        const modelData = this._debuggerModelToData.get(rawLocation.debuggerModel);
        return modelData ? modelData._rawLocationToUILocation(rawLocation) : null;
    }
    uiSourceCodeForSourceMapSourceURL(debuggerModel, url, isContentScript) {
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (!modelData) {
            return null;
        }
        return modelData._compilerMapping.uiSourceCodeForURL(url, isContentScript);
    }
    async uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber) {
        for (const sourceMapping of this._sourceMappings) {
            const locations = sourceMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
            if (locations.length) {
                return locations;
            }
        }
        const locations = await this.pluginManager?.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        if (locations) {
            return locations;
        }
        for (const modelData of this._debuggerModelToData.values()) {
            const locations = modelData._uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
            if (locations.length) {
                return locations;
            }
        }
        return [];
    }
    uiLocationToRawLocationsForUnformattedJavaScript(uiSourceCode, lineNumber, columnNumber) {
        console.assert(uiSourceCode.contentType().isScript());
        const locations = [];
        for (const modelData of this._debuggerModelToData.values()) {
            locations.push(...modelData._uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber));
        }
        return locations;
    }
    async normalizeUILocation(uiLocation) {
        const rawLocations = await this.uiLocationToRawLocations(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber);
        for (const location of rawLocations) {
            const uiLocationCandidate = await this.rawLocationToUILocation(location);
            if (uiLocationCandidate) {
                return uiLocationCandidate;
            }
        }
        return uiLocation;
    }
    scriptFile(uiSourceCode, debuggerModel) {
        const modelData = this._debuggerModelToData.get(debuggerModel);
        return modelData ? modelData._resourceMapping.scriptFile(uiSourceCode) : null;
    }
    scriptsForUISourceCode(uiSourceCode) {
        const scripts = new Set();
        if (this.pluginManager) {
            this.pluginManager.scriptsForUISourceCode(uiSourceCode).forEach(script => scripts.add(script));
        }
        for (const modelData of this._debuggerModelToData.values()) {
            const resourceScriptFile = modelData._resourceMapping.scriptFile(uiSourceCode);
            if (resourceScriptFile && resourceScriptFile._script) {
                scripts.add(resourceScriptFile._script);
            }
            modelData._compilerMapping.scriptsForUISourceCode(uiSourceCode).forEach(script => scripts.add(script));
        }
        return [...scripts];
    }
    scriptsForResource(uiSourceCode) {
        const scripts = new Set();
        for (const modelData of this._debuggerModelToData.values()) {
            const resourceScriptFile = modelData._resourceMapping.scriptFile(uiSourceCode);
            if (resourceScriptFile && resourceScriptFile._script) {
                scripts.add(resourceScriptFile._script);
            }
        }
        return [...scripts];
    }
    supportsConditionalBreakpoints(uiSourceCode) {
        // DevTools traditionally supported (JavaScript) conditions
        // for breakpoints everywhere, so we keep that behavior...
        if (!this.pluginManager) {
            return true;
        }
        const scripts = this.pluginManager.scriptsForUISourceCode(uiSourceCode);
        return scripts.every(script => script.isJavaScript());
    }
    sourceMapForScript(script) {
        const modelData = this._debuggerModelToData.get(script.debuggerModel);
        if (!modelData) {
            return null;
        }
        return modelData._compilerMapping.sourceMapForScript(script);
    }
    _globalObjectCleared(event) {
        const debuggerModel = event.data;
        this._reset(debuggerModel);
    }
    _reset(debuggerModel) {
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (!modelData) {
            return;
        }
        for (const location of modelData.callFrameLocations.values()) {
            this._removeLiveLocation(location);
        }
        modelData.callFrameLocations.clear();
    }
    _resetForTest(target) {
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (modelData) {
            modelData._resourceMapping.resetForTest();
        }
    }
    _registerCallFrameLiveLocation(debuggerModel, location) {
        const modelData = this._debuggerModelToData.get(debuggerModel);
        if (modelData) {
            const locations = modelData.callFrameLocations;
            locations.add(location);
        }
    }
    _removeLiveLocation(location) {
        const modelData = this._debuggerModelToData.get(location._rawLocation.debuggerModel);
        if (modelData) {
            modelData._disposeLocation(location);
        }
    }
    _debuggerResumed(event) {
        const debuggerModel = event.data;
        this._reset(debuggerModel);
    }
}
class ModelData {
    _debuggerModel;
    _debuggerWorkspaceBinding;
    callFrameLocations;
    _defaultMapping;
    _resourceMapping;
    _compilerMapping;
    _locations;
    constructor(debuggerModel, debuggerWorkspaceBinding) {
        this._debuggerModel = debuggerModel;
        this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        this.callFrameLocations = new Set();
        const workspace = debuggerWorkspaceBinding._workspace;
        this._defaultMapping = new DefaultScriptMapping(debuggerModel, workspace, debuggerWorkspaceBinding);
        this._resourceMapping = new ResourceScriptMapping(debuggerModel, workspace, debuggerWorkspaceBinding);
        this._compilerMapping = new CompilerScriptMapping(debuggerModel, workspace, debuggerWorkspaceBinding);
        this._locations = new Platform.MapUtilities.Multimap();
        debuggerModel.setBeforePausedCallback(this._beforePaused.bind(this));
    }
    async _createLiveLocation(rawLocation, updateDelegate, locationPool) {
        console.assert(rawLocation.scriptId !== '');
        const scriptId = rawLocation.scriptId;
        const location = new Location(scriptId, rawLocation, this._debuggerWorkspaceBinding, updateDelegate, locationPool);
        this._locations.set(scriptId, location);
        await location.update();
        return location;
    }
    _disposeLocation(location) {
        this._locations.delete(location._scriptId, location);
    }
    async _updateLocations(script) {
        const promises = [];
        for (const location of this._locations.get(script.scriptId)) {
            promises.push(location.update());
        }
        await Promise.all(promises);
    }
    _rawLocationToUILocation(rawLocation) {
        let uiLocation = this._compilerMapping.rawLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this._resourceMapping.rawLocationToUILocation(rawLocation);
        uiLocation = uiLocation || ResourceMapping.instance().jsLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this._defaultMapping.rawLocationToUILocation(rawLocation);
        return /** @type {!Workspace.UISourceCode.UILocation} */ uiLocation;
    }
    _uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber = 0) {
        // TODO(crbug.com/1153123): Revisit the `columnNumber = 0` and also preserve `undefined` for source maps?
        let locations = this._compilerMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        locations = locations.length ?
            locations :
            this._resourceMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        locations = locations.length ?
            locations :
            ResourceMapping.instance().uiLocationToJSLocations(uiSourceCode, lineNumber, columnNumber);
        locations = locations.length ?
            locations :
            this._defaultMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        return locations;
    }
    _beforePaused(debuggerPausedDetails) {
        const callFrame = debuggerPausedDetails.callFrames[0];
        if (!callFrame) {
            return false;
        }
        if (!Root.Runtime.experiments.isEnabled('emptySourceMapAutoStepping')) {
            return true;
        }
        return Boolean(this._compilerMapping.mapsToSourceCode(callFrame.location()));
    }
    _dispose() {
        this._debuggerModel.setBeforePausedCallback(null);
        this._compilerMapping.dispose();
        this._resourceMapping.dispose();
        this._defaultMapping.dispose();
    }
}
export class Location extends LiveLocationWithPool {
    _scriptId;
    _rawLocation;
    _binding;
    constructor(scriptId, rawLocation, binding, updateDelegate, locationPool) {
        super(updateDelegate, locationPool);
        this._scriptId = scriptId;
        this._rawLocation = rawLocation;
        this._binding = binding;
    }
    async uiLocation() {
        const debuggerModelLocation = this._rawLocation;
        return this._binding.rawLocationToUILocation(debuggerModelLocation);
    }
    dispose() {
        super.dispose();
        this._binding._removeLiveLocation(this);
    }
    async isIgnoreListed() {
        const uiLocation = await this.uiLocation();
        return uiLocation ? IgnoreListManager.instance().isIgnoreListedUISourceCode(uiLocation.uiSourceCode) : false;
    }
}
class StackTraceTopFrameLocation extends LiveLocationWithPool {
    _updateScheduled;
    _current;
    _locations;
    constructor(updateDelegate, locationPool) {
        super(updateDelegate, locationPool);
        this._updateScheduled = true;
        this._current = null;
        this._locations = null;
    }
    static async createStackTraceTopFrameLocation(rawLocations, binding, updateDelegate, locationPool) {
        const location = new StackTraceTopFrameLocation(updateDelegate, locationPool);
        const locationsPromises = rawLocations.map(rawLocation => binding.createLiveLocation(rawLocation, location._scheduleUpdate.bind(location), locationPool));
        location._locations = (await Promise.all(locationsPromises)).filter(l => Boolean(l));
        await location._updateLocation();
        return location;
    }
    async uiLocation() {
        return this._current ? this._current.uiLocation() : null;
    }
    async isIgnoreListed() {
        return this._current ? this._current.isIgnoreListed() : false;
    }
    dispose() {
        super.dispose();
        if (this._locations) {
            for (const location of this._locations) {
                location.dispose();
            }
        }
        this._locations = null;
        this._current = null;
    }
    async _scheduleUpdate() {
        if (this._updateScheduled) {
            return;
        }
        this._updateScheduled = true;
        queueMicrotask(() => {
            this._updateLocation();
        });
    }
    async _updateLocation() {
        this._updateScheduled = false;
        if (!this._locations || this._locations.length === 0) {
            return;
        }
        this._current = this._locations[0];
        for (const location of this._locations) {
            if (!(await location.isIgnoreListed())) {
                this._current = location;
                break;
            }
        }
        this.update();
    }
}
//# sourceMappingURL=DebuggerWorkspaceBinding.js.map