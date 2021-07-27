import type * as Platform from '../platform/platform.js';
export declare class ResourceType {
    _name: string;
    _title: () => Platform.UIString.LocalizedString;
    _category: ResourceCategory;
    _isTextType: boolean;
    constructor(name: string, title: () => Platform.UIString.LocalizedString, category: ResourceCategory, isTextType: boolean);
    static fromMimeType(mimeType: string | null): ResourceType;
    static fromMimeTypeOverride(mimeType: string | null): ResourceType | null;
    static fromURL(url: string): ResourceType | null;
    static fromName(name: string): ResourceType | null;
    static mimeFromURL(url: string): string | undefined;
    static mimeFromExtension(ext: string): string | undefined;
    name(): string;
    title(): string;
    category(): ResourceCategory;
    isTextType(): boolean;
    isScript(): boolean;
    hasScripts(): boolean;
    isStyleSheet(): boolean;
    isDocument(): boolean;
    isDocumentOrScriptOrStyleSheet(): boolean;
    isImage(): boolean;
    isFromSourceMap(): boolean;
    toString(): string;
    canonicalMimeType(): string;
}
export declare class ResourceCategory {
    title: () => Platform.UIString.LocalizedString;
    shortTitle: () => Platform.UIString.LocalizedString;
    constructor(title: () => Platform.UIString.LocalizedString, shortTitle: () => Platform.UIString.LocalizedString);
}
export declare const resourceCategories: {
    XHR: ResourceCategory;
    Script: ResourceCategory;
    Stylesheet: ResourceCategory;
    Image: ResourceCategory;
    Media: ResourceCategory;
    Font: ResourceCategory;
    Document: ResourceCategory;
    WebSocket: ResourceCategory;
    Wasm: ResourceCategory;
    Manifest: ResourceCategory;
    Other: ResourceCategory;
};
/**
 * This enum is a superset of all types defined in WebCore::InspectorPageAgent::resourceTypeJson
 * For DevTools-only types that are based on MIME-types that are backed by other request types
 * (for example Wasm that is based on Fetch), additional types are added here.
 * For these types, make sure to update `fromMimeTypeOverride` to implement the custom logic.
 */
export declare const resourceTypes: {
    Document: ResourceType;
    Stylesheet: ResourceType;
    Image: ResourceType;
    Media: ResourceType;
    Font: ResourceType;
    Script: ResourceType;
    TextTrack: ResourceType;
    XHR: ResourceType;
    Fetch: ResourceType;
    EventSource: ResourceType;
    WebSocket: ResourceType;
    WebTransport: ResourceType;
    Wasm: ResourceType;
    Manifest: ResourceType;
    SignedExchange: ResourceType;
    Ping: ResourceType;
    CSPViolationReport: ResourceType;
    Other: ResourceType;
    Preflight: ResourceType;
    SourceMapScript: ResourceType;
    SourceMapStyleSheet: ResourceType;
    WebBundle: ResourceType;
};
export declare const _mimeTypeByName: Map<string, string>;
export declare const _resourceTypeByExtension: Map<string, ResourceType>;
export declare const _mimeTypeByExtension: Map<string, string>;
