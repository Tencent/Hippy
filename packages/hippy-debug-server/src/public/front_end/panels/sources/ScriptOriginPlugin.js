// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { Plugin } from './Plugin.js';
const UIStrings = {
    /**
    *@description Text in Script Origin Plugin of the Sources panel
    *@example {example.com} PH1
    */
    sourceMappedFromS: '(source mapped from {PH1})',
    /**
    *@description Text in Script Origin Plugin of the Sources panel
    *@example {http://localhost/file.wasm} PH1
    */
    providedViaDebugInfoByS: '(provided via debug info by {PH1})',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/ScriptOriginPlugin.ts', UIStrings);
export class ScriptOriginPlugin extends Plugin {
    _textEditor;
    _uiSourceCode;
    constructor(textEditor, uiSourceCode) {
        super();
        this._textEditor = textEditor;
        this._uiSourceCode = uiSourceCode;
    }
    static accepts(uiSourceCode) {
        return uiSourceCode.contentType().hasScripts() || Boolean(ScriptOriginPlugin._script(uiSourceCode));
    }
    async rightToolbarItems() {
        const originURLs = Bindings.CompilerScriptMapping.CompilerScriptMapping.uiSourceCodeOrigin(this._uiSourceCode);
        if (originURLs.length) {
            return originURLs.map(originURL => {
                const item = i18n.i18n.getFormatLocalizedString(str_, UIStrings.sourceMappedFromS, { PH1: Components.Linkifier.Linkifier.linkifyURL(originURL) });
                return new UI.Toolbar.ToolbarItem(item);
            });
        }
        const pluginManager = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().pluginManager;
        if (pluginManager) {
            for (const originScript of pluginManager.scriptsForUISourceCode(this._uiSourceCode)) {
                if (originScript.sourceURL) {
                    const item = i18n.i18n.getFormatLocalizedString(str_, UIStrings.providedViaDebugInfoByS, { PH1: Components.Linkifier.Linkifier.linkifyURL(originScript.sourceURL) });
                    return [new UI.Toolbar.ToolbarItem(item)];
                }
            }
        }
        // Handle anonymous scripts with an originStackTrace.
        const script = await ScriptOriginPlugin._script(this._uiSourceCode);
        if (!script || !script.originStackTrace) {
            return [];
        }
        const link = linkifier.linkifyStackTraceTopFrame(script.debuggerModel.target(), script.originStackTrace);
        return [new UI.Toolbar.ToolbarItem(link)];
    }
    static async _script(uiSourceCode) {
        const locations = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiSourceCode, 0, 0);
        for (const location of locations) {
            const script = location.script();
            if (script && script.originStackTrace) {
                return script;
            }
        }
        return null;
    }
}
export const linkifier = new Components.Linkifier.Linkifier();
//# sourceMappingURL=ScriptOriginPlugin.js.map