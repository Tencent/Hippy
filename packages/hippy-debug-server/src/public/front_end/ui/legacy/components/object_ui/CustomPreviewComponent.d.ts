import type * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
export declare class CustomPreviewSection {
    _sectionElement: HTMLSpanElement;
    _object: SDK.RemoteObject.RemoteObject;
    _expanded: boolean;
    _cachedContent: Node | null;
    _header: Node | undefined;
    _expandIcon: UI.Icon.Icon | undefined;
    constructor(object: SDK.RemoteObject.RemoteObject);
    element(): Element;
    _renderJSONMLTag(jsonML: any): Node;
    _renderElement(object: any[]): Node;
    _layoutObjectTag(objectTag: any[]): Node;
    _appendJsonMLTags(parentElement: Node, jsonMLTags: any[]): void;
    _onClick(event: Event): void;
    _toggleExpand(): void;
    _loadBody(): Promise<void>;
    static _allowedTags: Set<string>;
}
export declare class CustomPreviewComponent {
    _object: SDK.RemoteObject.RemoteObject;
    _customPreviewSection: CustomPreviewSection | null;
    element: HTMLSpanElement;
    constructor(object: SDK.RemoteObject.RemoteObject);
    expandIfPossible(): void;
    _contextMenuEventFired(event: Event): void;
    _disassemble(): void;
}
