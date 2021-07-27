// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../bindings/bindings.js';
import * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { FormatterInterface } from './ScriptFormatter.js'; // eslint-disable-line no-unused-vars
const objectToFormattingResult = new WeakMap();
export class SourceFormatData {
    originalSourceCode;
    formattedSourceCode;
    mapping;
    constructor(originalSourceCode, formattedSourceCode, mapping) {
        this.originalSourceCode = originalSourceCode;
        this.formattedSourceCode = formattedSourceCode;
        this.mapping = mapping;
    }
    originalPath() {
        return this.originalSourceCode.project().id() + ':' + this.originalSourceCode.url();
    }
    static _for(object) {
        return objectToFormattingResult.get(object) || null;
    }
}
let sourceFormatterInstance = null;
export class SourceFormatter {
    _projectId;
    _project;
    _formattedSourceCodes;
    _scriptMapping;
    _styleMapping;
    constructor() {
        this._projectId = 'formatter:';
        this._project = new Bindings.ContentProviderBasedProject.ContentProviderBasedProject(Workspace.Workspace.WorkspaceImpl.instance(), this._projectId, Workspace.Workspace.projectTypes.Formatter, 'formatter', true /* isServiceProject */);
        this._formattedSourceCodes = new Map();
        this._scriptMapping = new ScriptMapping();
        this._styleMapping = new StyleMapping();
        Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeRemoved, event => {
            this._onUISourceCodeRemoved(event);
        }, this);
    }
    static instance() {
        if (!sourceFormatterInstance) {
            sourceFormatterInstance = new SourceFormatter();
        }
        return sourceFormatterInstance;
    }
    async _onUISourceCodeRemoved(event) {
        const uiSourceCode = event.data;
        const cacheEntry = this._formattedSourceCodes.get(uiSourceCode);
        if (cacheEntry && cacheEntry.formatData) {
            await this._discardFormatData(cacheEntry.formatData);
        }
        this._formattedSourceCodes.delete(uiSourceCode);
    }
    async discardFormattedUISourceCode(formattedUISourceCode) {
        const formatData = SourceFormatData._for(formattedUISourceCode);
        if (!formatData) {
            return null;
        }
        await this._discardFormatData(formatData);
        this._formattedSourceCodes.delete(formatData.originalSourceCode);
        return formatData.originalSourceCode;
    }
    async _discardFormatData(formatData) {
        objectToFormattingResult.delete(formatData.formattedSourceCode);
        await this._scriptMapping._setSourceMappingEnabled(formatData, false);
        this._styleMapping._setSourceMappingEnabled(formatData, false);
        this._project.removeFile(formatData.formattedSourceCode.url());
    }
    hasFormatted(uiSourceCode) {
        return this._formattedSourceCodes.has(uiSourceCode);
    }
    getOriginalUISourceCode(uiSourceCode) {
        const formatData = objectToFormattingResult.get(uiSourceCode);
        if (!formatData) {
            return uiSourceCode;
        }
        return formatData.originalSourceCode;
    }
    async format(uiSourceCode) {
        const cacheEntry = this._formattedSourceCodes.get(uiSourceCode);
        if (cacheEntry) {
            return cacheEntry.promise;
        }
        const resultPromise = new Promise(async (resolve) => {
            const { content } = await uiSourceCode.requestContent();
            FormatterInterface.format(uiSourceCode.contentType(), uiSourceCode.mimeType(), content || '', async (formattedContent, formatterMapping) => {
                const cacheEntry = this._formattedSourceCodes.get(uiSourceCode);
                if (!cacheEntry || cacheEntry.promise !== resultPromise) {
                    return;
                }
                let formattedURL;
                let count = 0;
                let suffix = '';
                do {
                    formattedURL = `${uiSourceCode.url()}:formatted${suffix}`;
                    suffix = `:${count++}`;
                } while (this._project.uiSourceCodeForURL(formattedURL));
                const contentProvider = TextUtils.StaticContentProvider.StaticContentProvider.fromString(formattedURL, uiSourceCode.contentType(), formattedContent);
                const formattedUISourceCode = this._project.createUISourceCode(formattedURL, contentProvider.contentType());
                const formatData = new SourceFormatData(uiSourceCode, formattedUISourceCode, formatterMapping);
                objectToFormattingResult.set(formattedUISourceCode, formatData);
                this._project.addUISourceCodeWithProvider(formattedUISourceCode, contentProvider, /* metadata */ null, uiSourceCode.mimeType());
                await this._scriptMapping._setSourceMappingEnabled(formatData, true);
                await this._styleMapping._setSourceMappingEnabled(formatData, true);
                cacheEntry.formatData = formatData;
                for (const decoration of uiSourceCode.allDecorations()) {
                    const range = decoration.range();
                    const startLocation = formatterMapping.originalToFormatted(range.startLine, range.startColumn);
                    const endLocation = formatterMapping.originalToFormatted(range.endLine, range.endColumn);
                    formattedUISourceCode.addDecoration(new TextUtils.TextRange.TextRange(startLocation[0], startLocation[1], endLocation[0], endLocation[1]), decoration.type(), decoration.data());
                }
                resolve(formatData);
            });
        });
        this._formattedSourceCodes.set(uiSourceCode, { promise: resultPromise, formatData: null });
        return resultPromise;
    }
}
class ScriptMapping {
    constructor() {
        Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().addSourceMapping(this);
    }
    rawLocationToUILocation(rawLocation) {
        const script = rawLocation.script();
        const formatData = script && SourceFormatData._for(script);
        if (!formatData || !script) {
            return null;
        }
        if (script.isInlineScriptWithSourceURL()) {
            // Inline scripts with #sourceURL= have lineEndings wrt. the inline script (and not wrt. the containing document),
            // but `rawLocation` will always use locations wrt. the containing document, because that is what the back-end is
            // sending. This is a hack, because what we are really doing here is deciding the location based on /how/ the
            // script is displayed, which is really something this layer cannot and should not have to decide: The
            // SourceFormatter should not have to know whether a script is displayed inline (in its containing document) or
            // stand-alone.
            const [relativeLineNumber, relativeColumnNumber] = script.toRelativeLocation(rawLocation);
            const [formattedLineNumber, formattedColumnNumber] = formatData.mapping.originalToFormatted(relativeLineNumber, relativeColumnNumber);
            return formatData.formattedSourceCode.uiLocation(formattedLineNumber, formattedColumnNumber);
        }
        // Here we either have an inline script without a #sourceURL= or a stand-alone script. For stand-alone scripts, no
        // translation must be applied. For inline scripts, also no translation must be applied, because the line-endings
        // tables in the mapping are the same as in the containing document.
        const [lineNumber, columnNumber] = formatData.mapping.originalToFormatted(rawLocation.lineNumber, rawLocation.columnNumber || 0);
        return formatData.formattedSourceCode.uiLocation(lineNumber, columnNumber);
    }
    uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber) {
        const formatData = SourceFormatData._for(uiSourceCode);
        if (!formatData) {
            return [];
        }
        const [originalLine, originalColumn] = formatData.mapping.formattedToOriginal(lineNumber, columnNumber);
        if (formatData.originalSourceCode.contentType().isScript()) {
            // Here we have a script that is displayed on its own (i.e. it has a dedicated uiSourceCode). This means it is
            // either a stand-alone script or an inline script with a #sourceURL= and in both cases we can just forward the
            // question to the original (unformatted) source code.
            const rawLocations = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()
                .uiLocationToRawLocationsForUnformattedJavaScript(formatData.originalSourceCode, originalLine, originalColumn);
            console.assert(rawLocations.every(l => l && Boolean(l.script())));
            return rawLocations;
        }
        if (formatData.originalSourceCode.contentType() === Common.ResourceType.resourceTypes.Document) {
            const target = Bindings.NetworkProject.NetworkProject.targetForUISourceCode(formatData.originalSourceCode);
            const debuggerModel = target && target.model(SDK.DebuggerModel.DebuggerModel);
            if (debuggerModel) {
                const scripts = debuggerModel.scriptsForSourceURL(formatData.originalSourceCode.url())
                    .filter(script => script.isInlineScript() && !script.hasSourceURL);
                // Here we have an inline script, which was formatted together with the containing document, so we must not
                // translate locations as they are relative to the start of the document.
                const locations = scripts.map(script => script.rawLocation(originalLine, originalColumn)).filter(l => Boolean(l));
                console.assert(locations.every(l => l && Boolean(l.script())));
                return locations;
            }
        }
        return [];
    }
    async _setSourceMappingEnabled(formatData, enabled) {
        const scripts = this._scriptsForUISourceCode(formatData.originalSourceCode);
        if (!scripts.length) {
            return;
        }
        if (enabled) {
            for (const script of scripts) {
                objectToFormattingResult.set(script, formatData);
            }
        }
        else {
            for (const script of scripts) {
                objectToFormattingResult.delete(script);
            }
        }
        const updatePromises = scripts.map(script => Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().updateLocations(script));
        await Promise.all(updatePromises);
    }
    _scriptsForUISourceCode(uiSourceCode) {
        if (uiSourceCode.contentType() === Common.ResourceType.resourceTypes.Document) {
            const target = Bindings.NetworkProject.NetworkProject.targetForUISourceCode(uiSourceCode);
            const debuggerModel = target && target.model(SDK.DebuggerModel.DebuggerModel);
            if (debuggerModel) {
                const scripts = debuggerModel.scriptsForSourceURL(uiSourceCode.url())
                    .filter(script => script.isInlineScript() && !script.hasSourceURL);
                return scripts;
            }
        }
        if (uiSourceCode.contentType().isScript()) {
            console.assert(!objectToFormattingResult.has(uiSourceCode));
            const rawLocations = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()
                .uiLocationToRawLocationsForUnformattedJavaScript(uiSourceCode, 0, 0);
            return rawLocations.map(location => location.script()).filter(script => Boolean(script));
        }
        return [];
    }
}
const sourceCodeToHeaders = new WeakMap();
class StyleMapping {
    _headersSymbol;
    constructor() {
        Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().addSourceMapping(this);
        this._headersSymbol = Symbol('Formatter.SourceFormatter.StyleMapping._headersSymbol');
    }
    rawLocationToUILocation(rawLocation) {
        const styleHeader = rawLocation.header();
        const formatData = styleHeader && SourceFormatData._for(styleHeader);
        if (!formatData) {
            return null;
        }
        const formattedLocation = formatData.mapping.originalToFormatted(rawLocation.lineNumber, rawLocation.columnNumber || 0);
        return formatData.formattedSourceCode.uiLocation(formattedLocation[0], formattedLocation[1]);
    }
    uiLocationToRawLocations(uiLocation) {
        const formatData = SourceFormatData._for(uiLocation.uiSourceCode);
        if (!formatData) {
            return [];
        }
        const [originalLine, originalColumn] = formatData.mapping.formattedToOriginal(uiLocation.lineNumber, uiLocation.columnNumber);
        const allHeaders = sourceCodeToHeaders.get(formatData.originalSourceCode);
        if (!allHeaders) {
            return [];
        }
        const headers = allHeaders.filter(header => header.containsLocation(originalLine, originalColumn));
        return headers.map(header => new SDK.CSSModel.CSSLocation(header, originalLine, originalColumn));
    }
    async _setSourceMappingEnabled(formatData, enable) {
        const original = formatData.originalSourceCode;
        const headers = this._headersForUISourceCode(original);
        if (enable) {
            sourceCodeToHeaders.set(original, headers);
            headers.forEach(header => {
                objectToFormattingResult.set(header, formatData);
            });
        }
        else {
            sourceCodeToHeaders.delete(original);
            headers.forEach(header => {
                objectToFormattingResult.delete(header);
            });
        }
        const updatePromises = headers.map(header => Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().updateLocations(header));
        await Promise.all(updatePromises);
    }
    _headersForUISourceCode(uiSourceCode) {
        if (uiSourceCode.contentType() === Common.ResourceType.resourceTypes.Document) {
            const target = Bindings.NetworkProject.NetworkProject.targetForUISourceCode(uiSourceCode);
            const cssModel = target && target.model(SDK.CSSModel.CSSModel);
            if (cssModel) {
                return cssModel.headersForSourceURL(uiSourceCode.url())
                    .filter(header => header.isInline && !header.hasSourceURL);
            }
        }
        else if (uiSourceCode.contentType().isStyleSheet()) {
            const rawLocations = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().uiLocationToRawLocations(uiSourceCode.uiLocation(0, 0));
            return rawLocations.map(rawLocation => rawLocation.header()).filter(header => Boolean(header));
        }
        return [];
    }
}
//# sourceMappingURL=SourceFormatter.js.map