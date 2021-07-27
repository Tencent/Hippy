import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AccessibilitySubPane } from './AccessibilitySubPane.js';
export declare class AXNodeSubPane extends AccessibilitySubPane {
    _axNode: SDK.AccessibilityModel.AccessibilityNode | null;
    _noNodeInfo: Element;
    _ignoredInfo: Element;
    _treeOutline: UI.TreeOutline.TreeOutline;
    _ignoredReasonsTree: UI.TreeOutline.TreeOutline;
    constructor();
    setAXNode(axNode: SDK.AccessibilityModel.AccessibilityNode | null): void;
    setNode(node: SDK.DOMModel.DOMNode | null): void;
}
export declare class AXNodePropertyTreeElement extends UI.TreeOutline.TreeElement {
    _axNode: SDK.AccessibilityModel.AccessibilityNode;
    constructor(axNode: SDK.AccessibilityModel.AccessibilityNode);
    static createSimpleValueElement(type: Protocol.Accessibility.AXValueType | null, value: string): Element;
    static createExclamationMark(tooltip: string): Element;
    appendNameElement(name: string): void;
    appendValueElement(value: Protocol.Accessibility.AXValue): void;
    appendRelatedNode(relatedNode: Protocol.Accessibility.AXRelatedNode, _index: number): void;
    appendRelatedNodeInline(relatedNode: Protocol.Accessibility.AXRelatedNode): void;
    appendRelatedNodeListValueElement(value: Protocol.Accessibility.AXValue): void;
}
export declare const TypeStyles: {
    [x: string]: string;
};
export declare const StringProperties: Set<Protocol.Accessibility.AXValueType>;
export declare class AXNodePropertyTreePropertyElement extends AXNodePropertyTreeElement {
    _property: SDK.AccessibilityModel.CoreOrProtocolAxProperty;
    toggleOnClick: boolean;
    constructor(property: SDK.AccessibilityModel.CoreOrProtocolAxProperty, axNode: SDK.AccessibilityModel.AccessibilityNode);
    onattach(): void;
    _update(): void;
}
export declare class AXValueSourceTreeElement extends AXNodePropertyTreeElement {
    _source: Protocol.Accessibility.AXValueSource;
    constructor(source: Protocol.Accessibility.AXValueSource, axNode: SDK.AccessibilityModel.AccessibilityNode);
    onattach(): void;
    appendRelatedNodeWithIdref(relatedNode: Protocol.Accessibility.AXRelatedNode, idref: string): void;
    appendIDRefValueElement(value: Protocol.Accessibility.AXValue): void;
    appendRelatedNodeListValueElement(value: Protocol.Accessibility.AXValue): void;
    appendSourceNameElement(source: Protocol.Accessibility.AXValueSource): void;
    _update(): void;
}
export declare class AXRelatedNodeSourceTreeElement extends UI.TreeOutline.TreeElement {
    _value: Protocol.Accessibility.AXRelatedNode | undefined;
    _axRelatedNodeElement: AXRelatedNodeElement;
    constructor(node: {
        deferredNode?: SDK.DOMModel.DeferredDOMNode;
        idref?: string;
    }, value?: Protocol.Accessibility.AXRelatedNode);
    onattach(): void;
    onenter(): boolean;
}
export declare class AXRelatedNodeElement {
    _deferredNode: SDK.DOMModel.DeferredDOMNode | undefined;
    _idref: string | undefined;
    _value: Protocol.Accessibility.AXRelatedNode | undefined;
    constructor(node: {
        deferredNode?: SDK.DOMModel.DeferredDOMNode;
        idref?: string;
    }, value?: Protocol.Accessibility.AXRelatedNode);
    render(): Element;
    /**
     * Attempts to cause the node referred to by the related node to be selected in the tree.
     */
    revealNode(): void;
}
export declare class AXNodeIgnoredReasonTreeElement extends AXNodePropertyTreeElement {
    _property: Protocol.Accessibility.AXProperty;
    _axNode: SDK.AccessibilityModel.AccessibilityNode;
    toggleOnClick: boolean;
    _reasonElement?: Element | null;
    constructor(property: Protocol.Accessibility.AXProperty, axNode: SDK.AccessibilityModel.AccessibilityNode);
    static createReasonElement(reason: string | null, axNode: SDK.AccessibilityModel.AccessibilityNode | null): Element | null;
    onattach(): void;
}
