import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class AccessibilitySubPane extends UI.View.SimpleView {
    _axNode: SDK.AccessibilityModel.AccessibilityNode | null;
    _node?: SDK.DOMModel.DOMNode | null;
    constructor(name: string);
    setAXNode(_axNode: SDK.AccessibilityModel.AccessibilityNode | null): void;
    node(): SDK.DOMModel.DOMNode | null;
    setNode(node: SDK.DOMModel.DOMNode | null): void;
    createInfo(textContent: string, className?: string): Element;
    createTreeOutline(): UI.TreeOutline.TreeOutline;
}
