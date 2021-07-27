import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../bindings/bindings.js';
import * as Workspace from '../workspace/workspace.js';
import type { FormatterSourceMapping } from './ScriptFormatter.js';
export declare class SourceFormatData {
    originalSourceCode: Workspace.UISourceCode.UISourceCode;
    formattedSourceCode: Workspace.UISourceCode.UISourceCode;
    mapping: FormatterSourceMapping;
    constructor(originalSourceCode: Workspace.UISourceCode.UISourceCode, formattedSourceCode: Workspace.UISourceCode.UISourceCode, mapping: FormatterSourceMapping);
    originalPath(): string;
    static _for(object: Object): SourceFormatData | null;
}
export declare class SourceFormatter {
    _projectId: string;
    _project: Bindings.ContentProviderBasedProject.ContentProviderBasedProject;
    _formattedSourceCodes: Map<Workspace.UISourceCode.UISourceCode, {
        promise: Promise<SourceFormatData>;
        formatData: SourceFormatData | null;
    }>;
    _scriptMapping: ScriptMapping;
    _styleMapping: StyleMapping;
    constructor();
    static instance(): SourceFormatter;
    _onUISourceCodeRemoved(event: Common.EventTarget.EventTargetEvent): Promise<void>;
    discardFormattedUISourceCode(formattedUISourceCode: Workspace.UISourceCode.UISourceCode): Promise<Workspace.UISourceCode.UISourceCode | null>;
    _discardFormatData(formatData: SourceFormatData): Promise<void>;
    hasFormatted(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    getOriginalUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): Workspace.UISourceCode.UISourceCode;
    format(uiSourceCode: Workspace.UISourceCode.UISourceCode): Promise<SourceFormatData>;
}
declare class ScriptMapping implements Bindings.DebuggerWorkspaceBinding.DebuggerSourceMapping {
    constructor();
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    _setSourceMappingEnabled(formatData: SourceFormatData, enabled: boolean): Promise<void>;
    _scriptsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
}
declare class StyleMapping implements Bindings.CSSWorkspaceBinding.SourceMapping {
    _headersSymbol: symbol;
    constructor();
    rawLocationToUILocation(rawLocation: SDK.CSSModel.CSSLocation): Workspace.UISourceCode.UILocation | null;
    uiLocationToRawLocations(uiLocation: Workspace.UISourceCode.UILocation): SDK.CSSModel.CSSLocation[];
    _setSourceMappingEnabled(formatData: SourceFormatData, enable: boolean): Promise<void>;
    _headersForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.CSSStyleSheetHeader.CSSStyleSheetHeader[];
}
export {};
