import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AccessibilitySubPane } from './AccessibilitySubPane.js';
export declare class ARIAAttributesPane extends AccessibilitySubPane {
    _noPropertiesInfo: Element;
    _treeOutline: UI.TreeOutline.TreeOutline;
    constructor();
    setNode(node: SDK.DOMModel.DOMNode | null): void;
    _isARIAAttribute(attribute: SDK.DOMModel.Attribute): boolean;
}
export declare class ARIAAttributesTreeElement extends UI.TreeOutline.TreeElement {
    _parentPane: ARIAAttributesPane;
    _attribute: SDK.DOMModel.Attribute;
    _nameElement?: HTMLSpanElement;
    _valueElement?: Element;
    _prompt?: ARIAAttributePrompt;
    constructor(parentPane: ARIAAttributesPane, attribute: SDK.DOMModel.Attribute, _target: SDK.Target.Target);
    static createARIAValueElement(value: string): Element;
    onattach(): void;
    _populateListItem(): void;
    appendNameElement(name: string): void;
    appendAttributeValueElement(value: string): void;
    _mouseClick(event: Event): void;
    _startEditing(): void;
    _removePrompt(): void;
    _editingCommitted(userInput: string, previousContent: string): void;
    _editingCancelled(): void;
    _editingValueKeyDown(previousContent: string, event: KeyboardEvent): void;
}
export declare class ARIAAttributePrompt extends UI.TextPrompt.TextPrompt {
    _ariaCompletions: string[];
    _treeElement: ARIAAttributesTreeElement;
    constructor(ariaCompletions: string[], treeElement: ARIAAttributesTreeElement);
    _buildPropertyCompletions(expression: string, prefix: string, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
}
