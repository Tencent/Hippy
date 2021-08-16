/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js'; // eslint-disable-line no-unused-vars
import { LiveLocationPool } from './LiveLocation.js'; // eslint-disable-line no-unused-vars
let breakpointManagerInstance;
export class BreakpointManager extends Common.ObjectWrapper.ObjectWrapper {
    _storage;
    _workspace;
    _targetManager;
    _debuggerWorkspaceBinding;
    _breakpointsForUISourceCode;
    _breakpointByStorageId;
    constructor(targetManager, workspace, debuggerWorkspaceBinding) {
        super();
        this._storage = new Storage();
        this._workspace = workspace;
        this._targetManager = targetManager;
        this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        this._breakpointsForUISourceCode = new Map();
        this._breakpointByStorageId = new Map();
        this._workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, this._uiSourceCodeAdded, this);
        this._workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeRemoved, this._uiSourceCodeRemoved, this);
        this._workspace.addEventListener(Workspace.Workspace.Events.ProjectRemoved, this._projectRemoved, this);
    }
    static instance(opts = { forceNew: null, targetManager: null, workspace: null, debuggerWorkspaceBinding: null }) {
        const { forceNew, targetManager, workspace, debuggerWorkspaceBinding } = opts;
        if (!breakpointManagerInstance || forceNew) {
            if (!targetManager || !workspace || !debuggerWorkspaceBinding) {
                throw new Error(`Unable to create settings: targetManager, workspace, and debuggerWorkspaceBinding must be provided: ${new Error().stack}`);
            }
            breakpointManagerInstance = new BreakpointManager(targetManager, workspace, debuggerWorkspaceBinding);
        }
        return breakpointManagerInstance;
    }
    static _breakpointStorageId(url, lineNumber, columnNumber) {
        if (!url) {
            return '';
        }
        return `${url}:${lineNumber}` + (typeof columnNumber === 'number' ? `:${columnNumber}` : '');
    }
    async copyBreakpoints(fromURL, toSourceCode) {
        const breakpointItems = this._storage.breakpointItems(fromURL);
        for (const item of breakpointItems) {
            await this.setBreakpoint(toSourceCode, item.lineNumber, item.columnNumber, item.condition, item.enabled);
        }
    }
    _restoreBreakpoints(uiSourceCode) {
        const url = uiSourceCode.url();
        if (!url) {
            return;
        }
        this._storage.mute();
        const breakpointItems = this._storage.breakpointItems(url);
        for (const item of breakpointItems) {
            this._innerSetBreakpoint(uiSourceCode, item.lineNumber, item.columnNumber, item.condition, item.enabled);
        }
        this._storage.unmute();
    }
    _uiSourceCodeAdded(event) {
        const uiSourceCode = event.data;
        this._restoreBreakpoints(uiSourceCode);
    }
    _uiSourceCodeRemoved(event) {
        const uiSourceCode = event.data;
        this._removeUISourceCode(uiSourceCode);
    }
    _projectRemoved(event) {
        const project = event.data;
        for (const uiSourceCode of project.uiSourceCodes()) {
            this._removeUISourceCode(uiSourceCode);
        }
    }
    _removeUISourceCode(uiSourceCode) {
        const breakpoints = this.breakpointLocationsForUISourceCode(uiSourceCode);
        breakpoints.forEach(bp => bp.breakpoint.removeUISourceCode(uiSourceCode));
    }
    async setBreakpoint(uiSourceCode, lineNumber, columnNumber, condition, enabled) {
        let uiLocation = new Workspace.UISourceCode.UILocation(uiSourceCode, lineNumber, columnNumber);
        const normalizedLocation = await this._debuggerWorkspaceBinding.normalizeUILocation(uiLocation);
        if (normalizedLocation.id() !== uiLocation.id()) {
            Common.Revealer.reveal(normalizedLocation);
            uiLocation = normalizedLocation;
        }
        return this._innerSetBreakpoint(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber, condition, enabled);
    }
    _innerSetBreakpoint(uiSourceCode, lineNumber, columnNumber, condition, enabled) {
        const itemId = BreakpointManager._breakpointStorageId(uiSourceCode.url(), lineNumber, columnNumber);
        let breakpoint = this._breakpointByStorageId.get(itemId);
        if (breakpoint) {
            breakpoint._updateState(condition, enabled);
            breakpoint.addUISourceCode(uiSourceCode);
            breakpoint._updateBreakpoint();
            return breakpoint;
        }
        breakpoint = new Breakpoint(this, uiSourceCode, uiSourceCode.url(), lineNumber, columnNumber, condition, enabled);
        this._breakpointByStorageId.set(itemId, breakpoint);
        return breakpoint;
    }
    findBreakpoint(uiLocation) {
        const breakpoints = this._breakpointsForUISourceCode.get(uiLocation.uiSourceCode);
        return breakpoints ? (breakpoints.get(uiLocation.id())) || null : null;
    }
    async possibleBreakpoints(uiSourceCode, textRange) {
        const { pluginManager } = this._debuggerWorkspaceBinding;
        if (pluginManager) {
            // TODO(bmeurer): Refactor this logic, as for DWARF and sourcemaps, it doesn't make sense
            //                to even ask V8 for possible break locations, since these are determined
            //                from the debugging information.
            const rawLocations = await pluginManager.uiLocationToRawLocations(uiSourceCode, textRange.startLine);
            if (rawLocations) {
                const uiLocations = [];
                for (const rawLocation of rawLocations) {
                    const uiLocation = await this._debuggerWorkspaceBinding.rawLocationToUILocation(rawLocation);
                    if (uiLocation) {
                        uiLocations.push(uiLocation);
                    }
                }
                return uiLocations;
            }
        }
        const startLocationsPromise = DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiSourceCode, textRange.startLine, textRange.startColumn);
        const endLocationsPromise = DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiSourceCode, textRange.endLine, textRange.endColumn);
        const [startLocations, endLocations] = await Promise.all([startLocationsPromise, endLocationsPromise]);
        const endLocationByModel = new Map();
        for (const location of endLocations) {
            endLocationByModel.set(location.debuggerModel, location);
        }
        let startLocation = null;
        let endLocation = null;
        for (const location of startLocations) {
            const endLocationCandidate = endLocationByModel.get(location.debuggerModel);
            if (endLocationCandidate) {
                startLocation = location;
                endLocation = endLocationCandidate;
                break;
            }
        }
        if (!startLocation || !endLocation) {
            return [];
        }
        return startLocation.debuggerModel
            .getPossibleBreakpoints(startLocation, endLocation, /* restrictToFunction */ false)
            .then(toUILocations.bind(this));
        async function toUILocations(locations) {
            const sortedLocationsPromises = locations.map(location => this._debuggerWorkspaceBinding.rawLocationToUILocation(location));
            const nullableLocations = await Promise.all(sortedLocationsPromises);
            const sortedLocations = nullableLocations.filter(location => location && location.uiSourceCode === uiSourceCode);
            if (!sortedLocations.length) {
                return [];
            }
            sortedLocations.sort(Workspace.UISourceCode.UILocation.comparator);
            let lastLocation = sortedLocations[0];
            const result = [lastLocation];
            for (const location of sortedLocations) {
                if (location.id() !== lastLocation.id()) {
                    result.push(location);
                    lastLocation = location;
                }
            }
            return result;
        }
    }
    breakpointLocationsForUISourceCode(uiSourceCode) {
        const breakpoints = this._breakpointsForUISourceCode.get(uiSourceCode);
        return breakpoints ? Array.from(breakpoints.values()) : [];
    }
    allBreakpointLocations() {
        const result = [];
        for (const breakpoints of this._breakpointsForUISourceCode.values()) {
            result.push(...breakpoints.values());
        }
        return result;
    }
    _removeBreakpoint(breakpoint, removeFromStorage) {
        if (removeFromStorage) {
            this._storage._removeBreakpoint(breakpoint);
        }
        this._breakpointByStorageId.delete(breakpoint._breakpointStorageId());
    }
    _uiLocationAdded(breakpoint, uiLocation) {
        let breakpoints = this._breakpointsForUISourceCode.get(uiLocation.uiSourceCode);
        if (!breakpoints) {
            breakpoints = new Map();
            this._breakpointsForUISourceCode.set(uiLocation.uiSourceCode, breakpoints);
        }
        const breakpointLocation = { breakpoint: breakpoint, uiLocation: uiLocation };
        breakpoints.set(uiLocation.id(), breakpointLocation);
        this.dispatchEventToListeners(Events.BreakpointAdded, breakpointLocation);
    }
    _uiLocationRemoved(breakpoint, uiLocation) {
        const breakpoints = this._breakpointsForUISourceCode.get(uiLocation.uiSourceCode);
        if (!breakpoints) {
            return;
        }
        const breakpointLocation = breakpoints.get(uiLocation.id()) || null;
        if (!breakpointLocation) {
            return;
        }
        breakpoints.delete(uiLocation.id());
        if (breakpoints.size === 0) {
            this._breakpointsForUISourceCode.delete(uiLocation.uiSourceCode);
        }
        this.dispatchEventToListeners(Events.BreakpointRemoved, { breakpoint: breakpoint, uiLocation: uiLocation });
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["BreakpointAdded"] = "breakpoint-added";
    Events["BreakpointRemoved"] = "breakpoint-removed";
})(Events || (Events = {}));
export class Breakpoint {
    _breakpointManager;
    _url;
    _lineNumber;
    _columnNumber;
    _uiLocations;
    _uiSourceCodes;
    _condition;
    _enabled;
    _isRemoved;
    _currentState;
    _modelBreakpoints;
    constructor(breakpointManager, primaryUISourceCode, url, lineNumber, columnNumber, condition, enabled) {
        this._breakpointManager = breakpointManager;
        this._url = url;
        this._lineNumber = lineNumber;
        this._columnNumber = columnNumber;
        this._uiLocations = new Set(); // Bound locations
        this._uiSourceCodes = new Set(); // All known UISourceCodes with this url
        this._currentState = null;
        this._modelBreakpoints = new Map();
        this._updateState(condition, enabled);
        this.addUISourceCode(primaryUISourceCode);
        this._breakpointManager._targetManager.observeModels(SDK.DebuggerModel.DebuggerModel, this);
    }
    async refreshInDebugger() {
        if (!this._isRemoved) {
            const breakpoints = Array.from(this._modelBreakpoints.values());
            await Promise.all(breakpoints.map(breakpoint => breakpoint._refreshBreakpoint()));
        }
    }
    modelAdded(debuggerModel) {
        const debuggerWorkspaceBinding = this._breakpointManager._debuggerWorkspaceBinding;
        this._modelBreakpoints.set(debuggerModel, new ModelBreakpoint(debuggerModel, this, debuggerWorkspaceBinding));
    }
    modelRemoved(debuggerModel) {
        const modelBreakpoint = this._modelBreakpoints.get(debuggerModel);
        this._modelBreakpoints.delete(debuggerModel);
        if (!modelBreakpoint) {
            return;
        }
        modelBreakpoint._cleanUpAfterDebuggerIsGone();
        modelBreakpoint._removeEventListeners();
    }
    addUISourceCode(uiSourceCode) {
        if (!this._uiSourceCodes.has(uiSourceCode)) {
            this._uiSourceCodes.add(uiSourceCode);
            if (!this.bound()) {
                this._breakpointManager._uiLocationAdded(this, this._defaultUILocation(uiSourceCode));
            }
        }
    }
    clearUISourceCodes() {
        if (!this.bound()) {
            this._removeAllUnboundLocations();
        }
        this._uiSourceCodes.clear();
    }
    removeUISourceCode(uiSourceCode) {
        if (this._uiSourceCodes.has(uiSourceCode)) {
            this._uiSourceCodes.delete(uiSourceCode);
            if (!this.bound()) {
                this._breakpointManager._uiLocationRemoved(this, this._defaultUILocation(uiSourceCode));
            }
        }
        // Do we need to do this? Not sure if bound locations will leak...
        if (this.bound()) {
            for (const uiLocation of this._uiLocations) {
                if (uiLocation.uiSourceCode === uiSourceCode) {
                    this._uiLocations.delete(uiLocation);
                    this._breakpointManager._uiLocationRemoved(this, uiLocation);
                }
            }
            if (!this.bound() && !this._isRemoved) {
                // Switch to unbound locations
                this._addAllUnboundLocations();
            }
        }
    }
    url() {
        return this._url;
    }
    lineNumber() {
        return this._lineNumber;
    }
    columnNumber() {
        return this._columnNumber;
    }
    _uiLocationAdded(uiLocation) {
        if (this._isRemoved) {
            return;
        }
        if (!this.bound()) {
            // This is our first bound location; remove all unbound locations
            this._removeAllUnboundLocations();
        }
        this._uiLocations.add(uiLocation);
        this._breakpointManager._uiLocationAdded(this, uiLocation);
    }
    _uiLocationRemoved(uiLocation) {
        if (this._uiLocations.has(uiLocation)) {
            this._uiLocations.delete(uiLocation);
            this._breakpointManager._uiLocationRemoved(this, uiLocation);
            if (!this.bound() && !this._isRemoved) {
                this._addAllUnboundLocations();
            }
        }
    }
    enabled() {
        return this._enabled;
    }
    bound() {
        return this._uiLocations.size !== 0;
    }
    hasBoundScript() {
        for (const uiSourceCode of this._uiSourceCodes) {
            if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Network) {
                return true;
            }
        }
        return false;
    }
    setEnabled(enabled) {
        this._updateState(this._condition, enabled);
    }
    condition() {
        return this._condition;
    }
    setCondition(condition) {
        this._updateState(condition, this._enabled);
    }
    _updateState(condition, enabled) {
        if (this._enabled === enabled && this._condition === condition) {
            return;
        }
        this._enabled = enabled;
        this._condition = condition;
        this._breakpointManager._storage._updateBreakpoint(this);
        this._updateBreakpoint();
    }
    _updateBreakpoint() {
        if (!this.bound()) {
            this._removeAllUnboundLocations();
            if (!this._isRemoved) {
                this._addAllUnboundLocations();
            }
        }
        for (const modelBreakpoint of this._modelBreakpoints.values()) {
            modelBreakpoint._scheduleUpdateInDebugger();
        }
    }
    remove(keepInStorage) {
        this._isRemoved = true;
        const removeFromStorage = !keepInStorage;
        for (const modelBreakpoint of this._modelBreakpoints.values()) {
            modelBreakpoint._scheduleUpdateInDebugger();
            modelBreakpoint._removeEventListeners();
        }
        this._breakpointManager._removeBreakpoint(this, removeFromStorage);
        this._breakpointManager._targetManager.unobserveModels(SDK.DebuggerModel.DebuggerModel, this);
        this.clearUISourceCodes();
    }
    _breakpointStorageId() {
        return BreakpointManager._breakpointStorageId(this._url, this._lineNumber, this._columnNumber);
    }
    _resetLocations() {
        this.clearUISourceCodes();
        for (const modelBreakpoint of this._modelBreakpoints.values()) {
            modelBreakpoint._resetLocations();
        }
    }
    _defaultUILocation(uiSourceCode) {
        return uiSourceCode.uiLocation(this._lineNumber, this._columnNumber);
    }
    _removeAllUnboundLocations() {
        for (const uiSourceCode of this._uiSourceCodes) {
            this._breakpointManager._uiLocationRemoved(this, this._defaultUILocation(uiSourceCode));
        }
    }
    _addAllUnboundLocations() {
        for (const uiSourceCode of this._uiSourceCodes) {
            this._breakpointManager._uiLocationAdded(this, this._defaultUILocation(uiSourceCode));
        }
    }
}
export class ModelBreakpoint {
    _debuggerModel;
    _breakpoint;
    _debuggerWorkspaceBinding;
    _liveLocations;
    _uiLocations;
    _hasPendingUpdate;
    _isUpdating;
    _cancelCallback;
    _currentState;
    _breakpointIds;
    constructor(debuggerModel, breakpoint, debuggerWorkspaceBinding) {
        this._debuggerModel = debuggerModel;
        this._breakpoint = breakpoint;
        this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        this._liveLocations = new LiveLocationPool();
        this._uiLocations = new Map();
        this._debuggerModel.addEventListener(SDK.DebuggerModel.Events.DebuggerWasDisabled, this._cleanUpAfterDebuggerIsGone, this);
        this._debuggerModel.addEventListener(SDK.DebuggerModel.Events.DebuggerWasEnabled, this._scheduleUpdateInDebugger, this);
        this._hasPendingUpdate = false;
        this._isUpdating = false;
        this._cancelCallback = false;
        this._currentState = null;
        this._breakpointIds = [];
        if (this._debuggerModel.debuggerEnabled()) {
            this._scheduleUpdateInDebugger();
        }
    }
    _resetLocations() {
        for (const uiLocation of this._uiLocations.values()) {
            this._breakpoint._uiLocationRemoved(uiLocation);
        }
        this._uiLocations.clear();
        this._liveLocations.disposeAll();
    }
    _scheduleUpdateInDebugger() {
        if (this._isUpdating) {
            this._hasPendingUpdate = true;
            return;
        }
        this._isUpdating = true;
        this._updateInDebugger(this._didUpdateInDebugger.bind(this));
    }
    _didUpdateInDebugger() {
        this._isUpdating = false;
        if (this._hasPendingUpdate) {
            this._hasPendingUpdate = false;
            this._scheduleUpdateInDebugger();
        }
    }
    _scriptDiverged() {
        for (const uiSourceCode of this._breakpoint._uiSourceCodes) {
            const scriptFile = this._debuggerWorkspaceBinding.scriptFile(uiSourceCode, this._debuggerModel);
            if (scriptFile && scriptFile.hasDivergedFromVM()) {
                return true;
            }
        }
        return false;
    }
    async _updateInDebugger(callback) {
        if (this._debuggerModel.target().isDisposed()) {
            this._cleanUpAfterDebuggerIsGone();
            callback();
            return;
        }
        const lineNumber = this._breakpoint.lineNumber();
        const columnNumber = this._breakpoint.columnNumber();
        const condition = this._breakpoint.condition();
        let newState = null;
        if (!this._breakpoint._isRemoved && this._breakpoint.enabled() && !this._scriptDiverged()) {
            let debuggerLocations = [];
            for (const uiSourceCode of this._breakpoint._uiSourceCodes) {
                const locations = await DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
                debuggerLocations = locations.filter(location => location.debuggerModel === this._debuggerModel);
                if (debuggerLocations.length) {
                    break;
                }
            }
            if (debuggerLocations.length && debuggerLocations.every(loc => loc.script())) {
                const positions = debuggerLocations.map(loc => {
                    const script = loc.script();
                    return {
                        url: script.sourceURL,
                        scriptId: script.scriptId,
                        scriptHash: script.hash,
                        lineNumber: loc.lineNumber,
                        columnNumber: loc.columnNumber,
                    };
                });
                newState = new Breakpoint.State(positions, condition);
            }
            else if (this._breakpoint._currentState) {
                newState = new Breakpoint.State(this._breakpoint._currentState.positions, condition);
            }
            else {
                // TODO(bmeurer): This fallback doesn't make a whole lot of sense, we should
                // at least signal a warning to the developer that this breakpoint wasn't
                // really resolved.
                const position = { url: this._breakpoint.url(), scriptId: '', scriptHash: '', lineNumber, columnNumber };
                newState = new Breakpoint.State([position], condition);
            }
        }
        if (this._breakpointIds.length && Breakpoint.State.equals(newState, this._currentState)) {
            callback();
            return;
        }
        this._breakpoint._currentState = newState;
        if (this._breakpointIds.length) {
            await this._refreshBreakpoint();
            callback();
            return;
        }
        if (!newState) {
            callback();
            return;
        }
        this._currentState = newState;
        const results = await Promise.all(newState.positions.map(pos => {
            if (pos.url) {
                return this._debuggerModel.setBreakpointByURL(pos.url, pos.lineNumber, pos.columnNumber, condition);
            }
            return this._debuggerModel.setBreakpointInAnonymousScript(pos.scriptId, pos.scriptHash, pos.lineNumber, pos.columnNumber, condition);
        }));
        const breakpointIds = [];
        let combinedLocations = [];
        for (const { breakpointId, locations } of results) {
            if (breakpointId) {
                breakpointIds.push(breakpointId);
                combinedLocations = combinedLocations.concat(locations);
            }
        }
        await this._didSetBreakpointInDebugger(callback, breakpointIds, combinedLocations);
    }
    async _refreshBreakpoint() {
        if (!this._breakpointIds.length) {
            return;
        }
        this._resetLocations();
        await Promise.all(this._breakpointIds.map(id => this._debuggerModel.removeBreakpoint(id)));
        this._didRemoveFromDebugger();
        this._currentState = null;
        this._scheduleUpdateInDebugger();
    }
    async _didSetBreakpointInDebugger(callback, breakpointIds, locations) {
        if (this._cancelCallback) {
            this._cancelCallback = false;
            callback();
            return;
        }
        if (!breakpointIds.length) {
            this._breakpoint.remove(true);
            callback();
            return;
        }
        this._breakpointIds = breakpointIds;
        for (const debuggerId of this._breakpointIds) {
            this._debuggerModel.addBreakpointListener(debuggerId, (event) => this._breakpointResolved(event), this);
        }
        for (const location of locations) {
            if (!(await this._addResolvedLocation(location))) {
                break;
            }
        }
        callback();
    }
    _didRemoveFromDebugger() {
        if (this._cancelCallback) {
            this._cancelCallback = false;
            return;
        }
        this._resetLocations();
        for (const debuggerId of this._breakpointIds) {
            this._debuggerModel.removeBreakpointListener(debuggerId, (event) => this._breakpointResolved(event), this);
        }
        this._breakpointIds = [];
    }
    async _breakpointResolved(event) {
        await this._addResolvedLocation(event.data);
    }
    async _locationUpdated(liveLocation) {
        const oldUILocation = this._uiLocations.get(liveLocation);
        const uiLocation = await liveLocation.uiLocation();
        if (oldUILocation) {
            this._breakpoint._uiLocationRemoved(oldUILocation);
        }
        if (uiLocation) {
            this._uiLocations.set(liveLocation, uiLocation);
            this._breakpoint._uiLocationAdded(uiLocation);
        }
        else {
            this._uiLocations.delete(liveLocation);
        }
    }
    async _addResolvedLocation(location) {
        const uiLocation = await this._debuggerWorkspaceBinding.rawLocationToUILocation(location);
        if (!uiLocation) {
            return false;
        }
        const breakpointLocation = this._breakpoint._breakpointManager.findBreakpoint(uiLocation);
        if (breakpointLocation && breakpointLocation.breakpoint !== this._breakpoint) {
            // location clash
            this._breakpoint.remove(false /* keepInStorage */);
            return false;
        }
        await this._debuggerWorkspaceBinding.createLiveLocation(location, this._locationUpdated.bind(this), this._liveLocations);
        return true;
    }
    _cleanUpAfterDebuggerIsGone() {
        if (this._isUpdating) {
            this._cancelCallback = true;
        }
        this._resetLocations();
        this._currentState = null;
        if (this._breakpointIds.length) {
            this._didRemoveFromDebugger();
        }
    }
    _removeEventListeners() {
        this._debuggerModel.removeEventListener(SDK.DebuggerModel.Events.DebuggerWasDisabled, this._cleanUpAfterDebuggerIsGone, this);
        this._debuggerModel.removeEventListener(SDK.DebuggerModel.Events.DebuggerWasEnabled, this._scheduleUpdateInDebugger, this);
    }
}
(function (Breakpoint) {
    class State {
        positions;
        condition;
        constructor(positions, condition) {
            this.positions = positions;
            this.condition = condition;
        }
        static equals(stateA, stateB) {
            if (!stateA || !stateB) {
                return false;
            }
            if (stateA.condition !== stateB.condition) {
                return false;
            }
            if (stateA.positions.length !== stateB.positions.length) {
                return false;
            }
            for (let i = 0; i < stateA.positions.length; i++) {
                const positionA = stateA.positions[i];
                const positionB = stateB.positions[i];
                if (positionA.url !== positionB.url) {
                    return false;
                }
                if (positionA.scriptId !== positionB.scriptId) {
                    return false;
                }
                if (positionA.scriptHash !== positionB.scriptHash) {
                    return false;
                }
                if (positionA.lineNumber !== positionB.lineNumber) {
                    return false;
                }
                if (positionA.columnNumber !== positionB.columnNumber) {
                    return false;
                }
            }
            return true;
        }
    }
    Breakpoint.State = State;
})(Breakpoint || (Breakpoint = {}));
class Storage {
    _setting;
    _breakpoints;
    _muted;
    constructor() {
        this._setting = Common.Settings.Settings.instance().createLocalSetting('breakpoints', []);
        this._breakpoints = new Map();
        const items = this._setting.get();
        for (const item of items) {
            this._breakpoints.set(BreakpointManager._breakpointStorageId(item.url, item.lineNumber, item.columnNumber), item);
        }
    }
    mute() {
        this._muted = true;
    }
    unmute() {
        delete this._muted;
    }
    breakpointItems(url) {
        return Array.from(this._breakpoints.values()).filter(item => item.url === url);
    }
    _updateBreakpoint(breakpoint) {
        if (this._muted || !breakpoint._breakpointStorageId()) {
            return;
        }
        this._breakpoints.set(breakpoint._breakpointStorageId(), new Storage.Item(breakpoint));
        this._save();
    }
    _removeBreakpoint(breakpoint) {
        if (!this._muted) {
            this._breakpoints.delete(breakpoint._breakpointStorageId());
            this._save();
        }
    }
    _save() {
        this._setting.set(Array.from(this._breakpoints.values()));
    }
}
(function (Storage) {
    class Item {
        url;
        lineNumber;
        columnNumber;
        condition;
        enabled;
        constructor(breakpoint) {
            this.url = breakpoint._url;
            this.lineNumber = breakpoint.lineNumber();
            this.columnNumber = breakpoint.columnNumber();
            this.condition = breakpoint.condition();
            this.enabled = breakpoint.enabled();
        }
    }
    Storage.Item = Item;
})(Storage || (Storage = {}));
//# sourceMappingURL=BreakpointManager.js.map