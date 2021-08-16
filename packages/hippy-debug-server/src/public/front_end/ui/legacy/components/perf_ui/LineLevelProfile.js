// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as Bindings from '../../../../models/bindings/bindings.js';
import * as Workspace from '../../../../models/workspace/workspace.js'; // eslint-disable-line no-unused-vars
import * as SourceFrame from '../source_frame/source_frame.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description The milisecond unit
    */
    ms: 'ms',
    /**
    *@description Unit for data size in DevTools
    */
    mb: 'MB',
    /**
    *@description A unit
    */
    kb: 'kB',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/perf_ui/LineLevelProfile.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let performanceInstance;
export class Performance {
    _helper;
    constructor() {
        this._helper = new Helper('performance');
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!performanceInstance || forceNew) {
            performanceInstance = new Performance();
        }
        return performanceInstance;
    }
    reset() {
        this._helper.reset();
    }
    _appendLegacyCPUProfile(profile) {
        const target = profile.target();
        const nodesToGo = [profile.profileHead];
        const sampleDuration = (profile.profileEndTime - profile.profileStartTime) / profile.totalHitCount;
        while (nodesToGo.length) {
            const nodes = 
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodesToGo.pop().children; // Cast to any because runtime checks assert the props.
            for (let i = 0; i < nodes.length; ++i) {
                const node = nodes[i];
                nodesToGo.push(node);
                if (!node.url || !node.positionTicks) {
                    continue;
                }
                for (let j = 0; j < node.positionTicks.length; ++j) {
                    const lineInfo = node.positionTicks[j];
                    const line = lineInfo.line;
                    const time = lineInfo.ticks * sampleDuration;
                    this._helper.addLineData(target, node.url, line, time);
                }
            }
        }
    }
    appendCPUProfile(profile) {
        if (!profile.lines) {
            this._appendLegacyCPUProfile(profile);
            this._helper.scheduleUpdate();
            return;
        }
        const target = profile.target();
        if (!profile.samples) {
            return;
        }
        for (let i = 1; i < profile.samples.length; ++i) {
            const line = profile.lines[i];
            if (!line) {
                continue;
            }
            const node = profile.nodeByIndex(i);
            if (!node) {
                continue;
            }
            const scriptIdOrUrl = node.scriptId || node.url;
            if (!scriptIdOrUrl) {
                continue;
            }
            const time = profile.timestamps[i] - profile.timestamps[i - 1];
            this._helper.addLineData(target, scriptIdOrUrl, line, time);
        }
        this._helper.scheduleUpdate();
    }
}
let memoryInstance;
export class Memory {
    _helper;
    constructor() {
        this._helper = new Helper('memory');
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!memoryInstance || forceNew) {
            memoryInstance = new Memory();
        }
        return memoryInstance;
    }
    reset() {
        this._helper.reset();
    }
    appendHeapProfile(profile, target) {
        const helper = this._helper;
        processNode(profile.head);
        helper.scheduleUpdate();
        function processNode(node) {
            node.children.forEach(processNode);
            if (!node.selfSize) {
                return;
            }
            const script = Number(node.callFrame.scriptId) || node.callFrame.url;
            if (!script) {
                return;
            }
            const line = node.callFrame.lineNumber + 1;
            helper.addLineData(target, script, line, node.selfSize);
        }
    }
}
export class Helper {
    _type;
    _locationPool;
    _updateTimer;
    _lineData;
    constructor(type) {
        this._type = type;
        this._locationPool = new Bindings.LiveLocation.LiveLocationPool();
        this._updateTimer = null;
        this.reset();
    }
    reset() {
        // The second map uses string keys for script URLs and numbers for scriptId.
        this._lineData = new Map();
        this.scheduleUpdate();
    }
    addLineData(target, scriptIdOrUrl, line, data) {
        let targetData = this._lineData.get(target);
        if (!targetData) {
            targetData = new Map();
            this._lineData.set(target, targetData);
        }
        let scriptData = targetData.get(scriptIdOrUrl);
        if (!scriptData) {
            scriptData = new Map();
            targetData.set(scriptIdOrUrl, scriptData);
        }
        scriptData.set(line, (scriptData.get(line) || 0) + data);
    }
    scheduleUpdate() {
        if (this._updateTimer) {
            return;
        }
        this._updateTimer = window.setTimeout(() => {
            this._updateTimer = null;
            this._doUpdate();
        }, 0);
    }
    _doUpdate() {
        this._locationPool.disposeAll();
        Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodes().forEach(uiSourceCode => uiSourceCode.removeDecorationsForType(this._type));
        for (const targetToScript of this._lineData) {
            const target = targetToScript[0];
            const debuggerModel = target ? target.model(SDK.DebuggerModel.DebuggerModel) : null;
            const scriptToLineMap = targetToScript[1];
            for (const scriptToLine of scriptToLineMap) {
                const scriptIdOrUrl = scriptToLine[0];
                const lineToDataMap = scriptToLine[1];
                // debuggerModel is null when the profile is loaded from file.
                // Try to get UISourceCode by the URL in this case.
                const uiSourceCode = !debuggerModel && typeof scriptIdOrUrl === 'string' ?
                    Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(scriptIdOrUrl) :
                    null;
                if (!debuggerModel && !uiSourceCode) {
                    continue;
                }
                for (const lineToData of lineToDataMap) {
                    const line = lineToData[0] - 1;
                    const data = lineToData[1];
                    if (uiSourceCode) {
                        uiSourceCode.addLineDecoration(line, this._type, data);
                        continue;
                    }
                    if (debuggerModel) {
                        const rawLocation = typeof scriptIdOrUrl === 'string' ?
                            debuggerModel.createRawLocationByURL(scriptIdOrUrl, line, 0) :
                            debuggerModel.createRawLocationByScriptId(String(scriptIdOrUrl), line, 0);
                        if (rawLocation) {
                            new Presentation(rawLocation, this._type, data, this._locationPool);
                        }
                    }
                }
            }
        }
    }
}
export class Presentation {
    _type;
    _time;
    _uiLocation;
    constructor(rawLocation, type, time, locationPool) {
        this._type = type;
        this._time = time;
        this._uiLocation = null;
        Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createLiveLocation(rawLocation, this.updateLocation.bind(this), locationPool);
    }
    async updateLocation(liveLocation) {
        if (this._uiLocation) {
            this._uiLocation.uiSourceCode.removeDecorationsForType(this._type);
        }
        this._uiLocation = await liveLocation.uiLocation();
        if (this._uiLocation) {
            this._uiLocation.uiSourceCode.addLineDecoration(this._uiLocation.lineNumber, this._type, this._time);
        }
    }
}
let lineDecoratorInstance;
export class LineDecorator {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!lineDecoratorInstance || forceNew) {
            lineDecoratorInstance = new LineDecorator();
        }
        return lineDecoratorInstance;
    }
    decorate(uiSourceCode, textEditor, type) {
        const gutterType = `CodeMirror-gutter-${type}`;
        const decorations = uiSourceCode.decorationsForType(type);
        textEditor.uninstallGutter(gutterType);
        if (!decorations || !decorations.size) {
            return;
        }
        textEditor.installGutter(gutterType, false);
        for (const decoration of decorations) {
            const value = decoration.data();
            const element = this._createElement(type, value);
            textEditor.setGutterDecoration(decoration.range().startLine, gutterType, element);
        }
    }
    _createElement(type, value) {
        const element = document.createElement('div');
        element.classList.add('text-editor-line-marker-text');
        if (type === 'performance') {
            const intensity = Platform.NumberUtilities.clamp(Math.log10(1 + 10 * value) / 5, 0.02, 1);
            element.textContent = value.toFixed(1);
            element.style.backgroundColor = `hsla(44, 100%, 50%, ${intensity.toFixed(3)})`;
            element.createChild('span', 'line-marker-units').textContent = i18nString(UIStrings.ms);
        }
        else {
            const intensity = Platform.NumberUtilities.clamp(Math.log10(1 + 2e-3 * value) / 5, 0.02, 1);
            element.style.backgroundColor = `hsla(217, 100%, 70%, ${intensity.toFixed(3)})`;
            value /= 1e3;
            let units;
            let fractionDigits;
            if (value >= 1e3) {
                units = i18nString(UIStrings.mb);
                value /= 1e3;
                fractionDigits = value >= 20 ? 0 : 1;
            }
            else {
                units = i18nString(UIStrings.kb);
                fractionDigits = 0;
            }
            element.textContent = value.toFixed(fractionDigits);
            element.createChild('span', 'line-marker-units').textContent = units;
        }
        return element;
    }
}
SourceFrame.SourceFrame.registerLineDecorator({
    lineDecorator: LineDecorator.instance,
    decoratorType: SourceFrame.SourceFrame.DecoratorType.MEMORY,
});
SourceFrame.SourceFrame.registerLineDecorator({
    lineDecorator: LineDecorator.instance,
    decoratorType: SourceFrame.SourceFrame.DecoratorType.PERFORMANCE,
});
//# sourceMappingURL=LineLevelProfile.js.map