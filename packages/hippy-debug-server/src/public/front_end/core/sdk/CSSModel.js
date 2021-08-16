/*
 * Copyright (C) 2010 Google Inc. All rights reserved.
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
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as Platform from '../platform/platform.js';
import { CSSFontFace } from './CSSFontFace.js';
import { CSSMatchedStyles } from './CSSMatchedStyles.js';
import { CSSMedia } from './CSSMedia.js';
import { CSSStyleRule } from './CSSRule.js';
import { CSSStyleDeclaration, Type } from './CSSStyleDeclaration.js';
import { CSSStyleSheetHeader } from './CSSStyleSheetHeader.js';
import { DOMModel } from './DOMModel.js'; // eslint-disable-line no-unused-vars
import { Events as ResourceTreeModelEvents, ResourceTreeModel } from './ResourceTreeModel.js';
import { Capability } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { SourceMapManager } from './SourceMapManager.js';
export class CSSModel extends SDKModel {
    _isEnabled;
    _cachedMatchedCascadeNode;
    _cachedMatchedCascadePromise;
    _domModel;
    _sourceMapManager;
    _agent;
    _styleLoader;
    _resourceTreeModel;
    _styleSheetIdToHeader;
    _styleSheetIdsForURL;
    _originalStyleSheetText;
    _isRuleUsageTrackingEnabled;
    _fontFaces;
    _cssPropertyTracker;
    _isCSSPropertyTrackingEnabled;
    _isTrackingRequestPending;
    _trackedCSSProperties;
    _stylePollingThrottler;
    constructor(target) {
        super(target);
        this._isEnabled = false;
        this._cachedMatchedCascadeNode = null;
        this._cachedMatchedCascadePromise = null;
        this._domModel = target.model(DOMModel);
        this._sourceMapManager = new SourceMapManager(target);
        this._agent = target.cssAgent();
        this._styleLoader = new ComputedStyleLoader(this);
        this._resourceTreeModel = target.model(ResourceTreeModel);
        if (this._resourceTreeModel) {
            this._resourceTreeModel.addEventListener(ResourceTreeModelEvents.MainFrameNavigated, this._resetStyleSheets, this);
        }
        target.registerCSSDispatcher(new CSSDispatcher(this));
        if (!target.suspended()) {
            this._enable();
        }
        this._styleSheetIdToHeader = new Map();
        this._styleSheetIdsForURL = new Map();
        this._originalStyleSheetText = new Map();
        this._isRuleUsageTrackingEnabled = false;
        this._fontFaces = new Map();
        this._cssPropertyTracker = null; // TODO: support multiple trackers when we refactor the backend
        this._isCSSPropertyTrackingEnabled = false;
        this._isTrackingRequestPending = false;
        this._trackedCSSProperties = new Map();
        this._stylePollingThrottler = new Common.Throttler.Throttler(StylePollingInterval);
        this._sourceMapManager.setEnabled(Common.Settings.Settings.instance().moduleSetting('cssSourceMapsEnabled').get());
        Common.Settings.Settings.instance()
            .moduleSetting('cssSourceMapsEnabled')
            .addChangeListener(event => this._sourceMapManager.setEnabled(event.data));
    }
    headersForSourceURL(sourceURL) {
        const headers = [];
        for (const headerId of this.styleSheetIdsForURL(sourceURL)) {
            const header = this.styleSheetHeaderForId(headerId);
            if (header) {
                headers.push(header);
            }
        }
        return headers;
    }
    createRawLocationsByURL(sourceURL, lineNumber, columnNumber = 0) {
        const headers = this.headersForSourceURL(sourceURL);
        headers.sort(stylesheetComparator);
        const endIndex = Platform.ArrayUtilities.upperBound(headers, undefined, (_, header) => lineNumber - header.startLine || columnNumber - header.startColumn);
        if (!endIndex) {
            return [];
        }
        const locations = [];
        const last = headers[endIndex - 1];
        for (let index = endIndex - 1; index >= 0 && headers[index].startLine === last.startLine && headers[index].startColumn === last.startColumn; --index) {
            if (headers[index].containsLocation(lineNumber, columnNumber)) {
                locations.push(new CSSLocation(headers[index], lineNumber, columnNumber));
            }
        }
        return locations;
        function stylesheetComparator(a, b) {
            return a.startLine - b.startLine || a.startColumn - b.startColumn || a.id.localeCompare(b.id);
        }
    }
    sourceMapManager() {
        return this._sourceMapManager;
    }
    static trimSourceURL(text) {
        let sourceURLIndex = text.lastIndexOf('/*# sourceURL=');
        if (sourceURLIndex === -1) {
            sourceURLIndex = text.lastIndexOf('/*@ sourceURL=');
            if (sourceURLIndex === -1) {
                return text;
            }
        }
        const sourceURLLineIndex = text.lastIndexOf('\n', sourceURLIndex);
        if (sourceURLLineIndex === -1) {
            return text;
        }
        const sourceURLLine = text.substr(sourceURLLineIndex + 1).split('\n', 1)[0];
        const sourceURLRegex = /[\040\t]*\/\*[#@] sourceURL=[\040\t]*([^\s]*)[\040\t]*\*\/[\040\t]*$/;
        if (sourceURLLine.search(sourceURLRegex) === -1) {
            return text;
        }
        return text.substr(0, sourceURLLineIndex) + text.substr(sourceURLLineIndex + sourceURLLine.length + 1);
    }
    domModel() {
        return this._domModel;
    }
    async setStyleText(styleSheetId, range, text, majorChange) {
        try {
            await this._ensureOriginalStyleSheetText(styleSheetId);
            const { styles } = await this._agent.invoke_setStyleTexts({ edits: [{ styleSheetId: styleSheetId, range: range.serializeToObject(), text }] });
            if (!styles || styles.length !== 1) {
                return false;
            }
            this._domModel.markUndoableState(!majorChange);
            const edit = new Edit(styleSheetId, range, text, styles[0]);
            this._fireStyleSheetChanged(styleSheetId, edit);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async setSelectorText(styleSheetId, range, text) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.StyleRuleEdited);
        try {
            await this._ensureOriginalStyleSheetText(styleSheetId);
            const { selectorList } = await this._agent.invoke_setRuleSelector({ styleSheetId, range, selector: text });
            if (!selectorList) {
                return false;
            }
            this._domModel.markUndoableState();
            const edit = new Edit(styleSheetId, range, text, selectorList);
            this._fireStyleSheetChanged(styleSheetId, edit);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async setKeyframeKey(styleSheetId, range, text) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.StyleRuleEdited);
        try {
            await this._ensureOriginalStyleSheetText(styleSheetId);
            const { keyText } = await this._agent.invoke_setKeyframeKey({ styleSheetId, range, keyText: text });
            if (!keyText) {
                return false;
            }
            this._domModel.markUndoableState();
            const edit = new Edit(styleSheetId, range, text, keyText);
            this._fireStyleSheetChanged(styleSheetId, edit);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    startCoverage() {
        this._isRuleUsageTrackingEnabled = true;
        return this._agent.invoke_startRuleUsageTracking();
    }
    async takeCoverageDelta() {
        const r = await this._agent.invoke_takeCoverageDelta();
        const timestamp = (r && r.timestamp) || 0;
        const coverage = (r && r.coverage) || [];
        return { timestamp, coverage };
    }
    setLocalFontsEnabled(enabled) {
        return this._agent.invoke_setLocalFontsEnabled({
            enabled,
        });
    }
    async stopCoverage() {
        this._isRuleUsageTrackingEnabled = false;
        await this._agent.invoke_stopRuleUsageTracking();
    }
    async mediaQueriesPromise() {
        const { medias } = await this._agent.invoke_getMediaQueries();
        return medias ? CSSMedia.parseMediaArrayPayload(this, medias) : [];
    }
    isEnabled() {
        return this._isEnabled;
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async _enable() {
        await this._agent.invoke_enable();
        this._isEnabled = true;
        if (this._isRuleUsageTrackingEnabled) {
            await this.startCoverage();
        }
        this.dispatchEventToListeners(Events.ModelWasEnabled);
    }
    async matchedStylesPromise(nodeId) {
        const response = await this._agent.invoke_getMatchedStylesForNode({ nodeId });
        if (response.getError()) {
            return null;
        }
        const node = this._domModel.nodeForId(nodeId);
        if (!node) {
            return null;
        }
        return new CSSMatchedStyles(this, node, response.inlineStyle || null, response.attributesStyle || null, response.matchedCSSRules || [], response.pseudoElements || [], response.inherited || [], response.cssKeyframesRules || []);
    }
    async classNamesPromise(styleSheetId) {
        const { classNames } = await this._agent.invoke_collectClassNames({ styleSheetId });
        return classNames || [];
    }
    computedStylePromise(nodeId) {
        return this._styleLoader.computedStylePromise(nodeId);
    }
    async backgroundColorsPromise(nodeId) {
        const response = await this._agent.invoke_getBackgroundColors({ nodeId });
        if (response.getError()) {
            return null;
        }
        return {
            backgroundColors: response.backgroundColors || null,
            computedFontSize: response.computedFontSize || '',
            computedFontWeight: response.computedFontWeight || '',
        };
    }
    async platformFontsPromise(nodeId) {
        const { fonts } = await this._agent.invoke_getPlatformFontsForNode({ nodeId });
        return fonts;
    }
    allStyleSheets() {
        const values = [...this._styleSheetIdToHeader.values()];
        function styleSheetComparator(a, b) {
            if (a.sourceURL < b.sourceURL) {
                return -1;
            }
            if (a.sourceURL > b.sourceURL) {
                return 1;
            }
            return a.startLine - b.startLine || a.startColumn - b.startColumn;
        }
        values.sort(styleSheetComparator);
        return values;
    }
    async inlineStylesPromise(nodeId) {
        const response = await this._agent.invoke_getInlineStylesForNode({ nodeId });
        if (response.getError() || !response.inlineStyle) {
            return null;
        }
        const inlineStyle = new CSSStyleDeclaration(this, null, response.inlineStyle, Type.Inline);
        const attributesStyle = response.attributesStyle ?
            new CSSStyleDeclaration(this, null, response.attributesStyle, Type.Attributes) :
            null;
        return new InlineStyleResult(inlineStyle, attributesStyle);
    }
    forcePseudoState(node, pseudoClass, enable) {
        const forcedPseudoClasses = node.marker(PseudoStateMarker) || [];
        const hasPseudoClass = forcedPseudoClasses.includes(pseudoClass);
        if (enable) {
            if (hasPseudoClass) {
                return false;
            }
            forcedPseudoClasses.push(pseudoClass);
            node.setMarker(PseudoStateMarker, forcedPseudoClasses);
        }
        else {
            if (!hasPseudoClass) {
                return false;
            }
            Platform.ArrayUtilities.removeElement(forcedPseudoClasses, pseudoClass);
            if (forcedPseudoClasses.length) {
                node.setMarker(PseudoStateMarker, forcedPseudoClasses);
            }
            else {
                node.setMarker(PseudoStateMarker, null);
            }
        }
        if (node.id === undefined) {
            return false;
        }
        this._agent.invoke_forcePseudoState({ nodeId: node.id, forcedPseudoClasses });
        this.dispatchEventToListeners(Events.PseudoStateForced, { node: node, pseudoClass: pseudoClass, enable: enable });
        return true;
    }
    pseudoState(node) {
        return node.marker(PseudoStateMarker) || [];
    }
    async setMediaText(styleSheetId, range, newMediaText) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.StyleRuleEdited);
        try {
            await this._ensureOriginalStyleSheetText(styleSheetId);
            const { media } = await this._agent.invoke_setMediaText({ styleSheetId, range, text: newMediaText });
            if (!media) {
                return false;
            }
            this._domModel.markUndoableState();
            const edit = new Edit(styleSheetId, range, newMediaText, media);
            this._fireStyleSheetChanged(styleSheetId, edit);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async addRule(styleSheetId, ruleText, ruleLocation) {
        try {
            await this._ensureOriginalStyleSheetText(styleSheetId);
            const { rule } = await this._agent.invoke_addRule({ styleSheetId, ruleText, location: ruleLocation });
            if (!rule) {
                return null;
            }
            this._domModel.markUndoableState();
            const edit = new Edit(styleSheetId, ruleLocation, ruleText, rule);
            this._fireStyleSheetChanged(styleSheetId, edit);
            return new CSSStyleRule(this, rule);
        }
        catch (e) {
            return null;
        }
    }
    async requestViaInspectorStylesheet(node) {
        const frameId = node.frameId() ||
            (this._resourceTreeModel && this._resourceTreeModel.mainFrame ? this._resourceTreeModel.mainFrame.id : '');
        const headers = [...this._styleSheetIdToHeader.values()];
        const styleSheetHeader = headers.find(header => header.frameId === frameId && header.isViaInspector());
        if (styleSheetHeader) {
            return styleSheetHeader;
        }
        try {
            const { styleSheetId } = await this._agent.invoke_createStyleSheet({ frameId });
            if (!styleSheetId) {
                return null;
            }
            return this._styleSheetIdToHeader.get(styleSheetId) || null;
        }
        catch (e) {
            return null;
        }
    }
    mediaQueryResultChanged() {
        this.dispatchEventToListeners(Events.MediaQueryResultChanged);
    }
    fontsUpdated(fontFace) {
        if (fontFace) {
            this._fontFaces.set(fontFace.src, new CSSFontFace(fontFace));
        }
        this.dispatchEventToListeners(Events.FontsUpdated);
    }
    fontFaces() {
        return [...this._fontFaces.values()];
    }
    styleSheetHeaderForId(id) {
        return this._styleSheetIdToHeader.get(id) || null;
    }
    styleSheetHeaders() {
        return [...this._styleSheetIdToHeader.values()];
    }
    _fireStyleSheetChanged(styleSheetId, edit) {
        this.dispatchEventToListeners(Events.StyleSheetChanged, { styleSheetId: styleSheetId, edit: edit });
    }
    _ensureOriginalStyleSheetText(styleSheetId) {
        const header = this.styleSheetHeaderForId(styleSheetId);
        if (!header) {
            return Promise.resolve(null);
        }
        let promise = this._originalStyleSheetText.get(header);
        if (!promise) {
            promise = this.getStyleSheetText(header.id);
            this._originalStyleSheetText.set(header, promise);
            this._originalContentRequestedForTest(header);
        }
        return promise;
    }
    _originalContentRequestedForTest(_header) {
    }
    originalStyleSheetText(header) {
        return this._ensureOriginalStyleSheetText(header.id);
    }
    getAllStyleSheetHeaders() {
        return this._styleSheetIdToHeader.values();
    }
    _styleSheetAdded(header) {
        console.assert(!this._styleSheetIdToHeader.get(header.styleSheetId));
        const styleSheetHeader = new CSSStyleSheetHeader(this, header);
        this._styleSheetIdToHeader.set(header.styleSheetId, styleSheetHeader);
        const url = styleSheetHeader.resourceURL();
        let frameIdToStyleSheetIds = this._styleSheetIdsForURL.get(url);
        if (!frameIdToStyleSheetIds) {
            frameIdToStyleSheetIds = new Map();
            this._styleSheetIdsForURL.set(url, frameIdToStyleSheetIds);
        }
        if (frameIdToStyleSheetIds) {
            let styleSheetIds = frameIdToStyleSheetIds.get(styleSheetHeader.frameId);
            if (!styleSheetIds) {
                styleSheetIds = new Set();
                frameIdToStyleSheetIds.set(styleSheetHeader.frameId, styleSheetIds);
            }
            styleSheetIds.add(styleSheetHeader.id);
        }
        this._sourceMapManager.attachSourceMap(styleSheetHeader, styleSheetHeader.sourceURL, styleSheetHeader.sourceMapURL);
        this.dispatchEventToListeners(Events.StyleSheetAdded, styleSheetHeader);
    }
    _styleSheetRemoved(id) {
        const header = this._styleSheetIdToHeader.get(id);
        console.assert(Boolean(header));
        if (!header) {
            return;
        }
        this._styleSheetIdToHeader.delete(id);
        const url = header.resourceURL();
        const frameIdToStyleSheetIds = this._styleSheetIdsForURL.get(url);
        console.assert(Boolean(frameIdToStyleSheetIds), 'No frameId to styleSheetId map is available for given style sheet URL.');
        if (frameIdToStyleSheetIds) {
            const stylesheetIds = frameIdToStyleSheetIds.get(header.frameId);
            if (stylesheetIds) {
                stylesheetIds.delete(id);
                if (!stylesheetIds.size) {
                    frameIdToStyleSheetIds.delete(header.frameId);
                    if (!frameIdToStyleSheetIds.size) {
                        this._styleSheetIdsForURL.delete(url);
                    }
                }
            }
        }
        this._originalStyleSheetText.delete(header);
        this._sourceMapManager.detachSourceMap(header);
        this.dispatchEventToListeners(Events.StyleSheetRemoved, header);
    }
    styleSheetIdsForURL(url) {
        const frameIdToStyleSheetIds = this._styleSheetIdsForURL.get(url);
        if (!frameIdToStyleSheetIds) {
            return [];
        }
        const result = [];
        for (const styleSheetIds of frameIdToStyleSheetIds.values()) {
            result.push(...styleSheetIds);
        }
        return result;
    }
    async setStyleSheetText(styleSheetId, newText, majorChange) {
        const header = this._styleSheetIdToHeader.get(styleSheetId);
        console.assert(Boolean(header));
        newText = CSSModel.trimSourceURL(newText);
        if (header.hasSourceURL) {
            newText += '\n/*# sourceURL=' + header.sourceURL + ' */';
        }
        await this._ensureOriginalStyleSheetText(styleSheetId);
        const response = await this._agent.invoke_setStyleSheetText({ styleSheetId: header.id, text: newText });
        const sourceMapURL = response.sourceMapURL;
        this._sourceMapManager.detachSourceMap(header);
        header.setSourceMapURL(sourceMapURL);
        this._sourceMapManager.attachSourceMap(header, header.sourceURL, header.sourceMapURL);
        if (sourceMapURL === null) {
            return 'Error in CSS.setStyleSheetText';
        }
        this._domModel.markUndoableState(!majorChange);
        this._fireStyleSheetChanged(styleSheetId);
        return null;
    }
    async getStyleSheetText(styleSheetId) {
        try {
            const { text } = await this._agent.invoke_getStyleSheetText({ styleSheetId });
            return text && CSSModel.trimSourceURL(text);
        }
        catch (e) {
            return null;
        }
    }
    _resetStyleSheets() {
        const headers = [...this._styleSheetIdToHeader.values()];
        this._styleSheetIdsForURL.clear();
        this._styleSheetIdToHeader.clear();
        for (const header of headers) {
            this._sourceMapManager.detachSourceMap(header);
            this.dispatchEventToListeners(Events.StyleSheetRemoved, header);
        }
    }
    _resetFontFaces() {
        this._fontFaces.clear();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async suspendModel() {
        this._isEnabled = false;
        await this._agent.invoke_disable();
        this._resetStyleSheets();
        this._resetFontFaces();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async resumeModel() {
        return this._enable();
    }
    setEffectivePropertyValueForNode(nodeId, propertyName, value) {
        this._agent.invoke_setEffectivePropertyValueForNode({ nodeId, propertyName, value });
    }
    cachedMatchedCascadeForNode(node) {
        if (this._cachedMatchedCascadeNode !== node) {
            this.discardCachedMatchedCascade();
        }
        this._cachedMatchedCascadeNode = node;
        if (!this._cachedMatchedCascadePromise) {
            if (node.id) {
                this._cachedMatchedCascadePromise = this.matchedStylesPromise(node.id);
            }
            else {
                return Promise.resolve(null);
            }
        }
        return this._cachedMatchedCascadePromise;
    }
    discardCachedMatchedCascade() {
        this._cachedMatchedCascadeNode = null;
        this._cachedMatchedCascadePromise = null;
    }
    createCSSPropertyTracker(propertiesToTrack) {
        const gridStyleTracker = new CSSPropertyTracker(this, propertiesToTrack);
        return gridStyleTracker;
    }
    enableCSSPropertyTracker(cssPropertyTracker) {
        const propertiesToTrack = cssPropertyTracker.getTrackedProperties();
        if (propertiesToTrack.length === 0) {
            return;
        }
        this._agent.invoke_trackComputedStyleUpdates({ propertiesToTrack });
        this._isCSSPropertyTrackingEnabled = true;
        this._cssPropertyTracker = cssPropertyTracker;
        this._pollComputedStyleUpdates();
    }
    // Since we only support one tracker at a time, this call effectively disables
    // style tracking.
    disableCSSPropertyTracker() {
        this._isCSSPropertyTrackingEnabled = false;
        this._cssPropertyTracker = null;
        // Sending an empty list to the backend signals the close of style tracking
        this._agent.invoke_trackComputedStyleUpdates({ propertiesToTrack: [] });
    }
    async _pollComputedStyleUpdates() {
        if (this._isTrackingRequestPending) {
            return;
        }
        if (this._isCSSPropertyTrackingEnabled) {
            this._isTrackingRequestPending = true;
            const result = await this._agent.invoke_takeComputedStyleUpdates();
            this._isTrackingRequestPending = false;
            if (result.getError() || !result.nodeIds || !this._isCSSPropertyTrackingEnabled) {
                return;
            }
            if (this._cssPropertyTracker) {
                this._cssPropertyTracker.dispatchEventToListeners(CSSPropertyTrackerEvents.TrackedCSSPropertiesUpdated, {
                    domNodes: result.nodeIds.map(nodeId => this._domModel.nodeForId(nodeId)),
                });
            }
        }
        if (this._isCSSPropertyTrackingEnabled) {
            this._stylePollingThrottler.schedule(this._pollComputedStyleUpdates.bind(this));
        }
    }
    dispose() {
        this.disableCSSPropertyTracker();
        super.dispose();
        this._sourceMapManager.dispose();
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["FontsUpdated"] = "FontsUpdated";
    Events["MediaQueryResultChanged"] = "MediaQueryResultChanged";
    Events["ModelWasEnabled"] = "ModelWasEnabled";
    Events["PseudoStateForced"] = "PseudoStateForced";
    Events["StyleSheetAdded"] = "StyleSheetAdded";
    Events["StyleSheetChanged"] = "StyleSheetChanged";
    Events["StyleSheetRemoved"] = "StyleSheetRemoved";
})(Events || (Events = {}));
const PseudoStateMarker = 'pseudo-state-marker';
export class Edit {
    styleSheetId;
    oldRange;
    newRange;
    newText;
    payload;
    constructor(styleSheetId, oldRange, newText, payload) {
        this.styleSheetId = styleSheetId;
        this.oldRange = oldRange;
        this.newRange = TextUtils.TextRange.TextRange.fromEdit(oldRange, newText);
        this.newText = newText;
        this.payload = payload;
    }
}
export class CSSLocation {
    _cssModel;
    styleSheetId;
    url;
    lineNumber;
    columnNumber;
    constructor(header, lineNumber, columnNumber) {
        this._cssModel = header.cssModel();
        this.styleSheetId = header.id;
        this.url = header.resourceURL();
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber || 0;
    }
    cssModel() {
        return this._cssModel;
    }
    header() {
        return this._cssModel.styleSheetHeaderForId(this.styleSheetId);
    }
}
class CSSDispatcher {
    _cssModel;
    constructor(cssModel) {
        this._cssModel = cssModel;
    }
    mediaQueryResultChanged() {
        this._cssModel.mediaQueryResultChanged();
    }
    fontsUpdated({ font }) {
        this._cssModel.fontsUpdated(font);
    }
    styleSheetChanged({ styleSheetId }) {
        this._cssModel._fireStyleSheetChanged(styleSheetId);
    }
    styleSheetAdded({ header }) {
        this._cssModel._styleSheetAdded(header);
    }
    styleSheetRemoved({ styleSheetId }) {
        this._cssModel._styleSheetRemoved(styleSheetId);
    }
}
class ComputedStyleLoader {
    _cssModel;
    _nodeIdToPromise;
    constructor(cssModel) {
        this._cssModel = cssModel;
        this._nodeIdToPromise = new Map();
    }
    computedStylePromise(nodeId) {
        let promise = this._nodeIdToPromise.get(nodeId);
        if (promise) {
            return promise;
        }
        promise = this._cssModel._agent.invoke_getComputedStyleForNode({ nodeId }).then(({ computedStyle }) => {
            this._nodeIdToPromise.delete(nodeId);
            if (!computedStyle || !computedStyle.length) {
                return null;
            }
            const result = new Map();
            for (const property of computedStyle) {
                result.set(property.name, property.value);
            }
            return result;
        });
        this._nodeIdToPromise.set(nodeId, promise);
        return promise;
    }
}
export class InlineStyleResult {
    inlineStyle;
    attributesStyle;
    constructor(inlineStyle, attributesStyle) {
        this.inlineStyle = inlineStyle;
        this.attributesStyle = attributesStyle;
    }
}
export class CSSPropertyTracker extends Common.ObjectWrapper.ObjectWrapper {
    _cssModel;
    _properties;
    constructor(cssModel, propertiesToTrack) {
        super();
        this._cssModel = cssModel;
        this._properties = propertiesToTrack;
    }
    start() {
        this._cssModel.enableCSSPropertyTracker(this);
    }
    stop() {
        this._cssModel.disableCSSPropertyTracker();
    }
    getTrackedProperties() {
        return this._properties;
    }
}
const StylePollingInterval = 1000; // throttling interval for style polling, in milliseconds
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var CSSPropertyTrackerEvents;
(function (CSSPropertyTrackerEvents) {
    CSSPropertyTrackerEvents["TrackedCSSPropertiesUpdated"] = "TrackedCSSPropertiesUpdated";
})(CSSPropertyTrackerEvents || (CSSPropertyTrackerEvents = {}));
SDKModel.register(CSSModel, { capabilities: Capability.DOM, autostart: true });
//# sourceMappingURL=CSSModel.js.map