import type * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { AccessibilitySubPane } from './AccessibilitySubPane.js';
export declare class SourceOrderPane extends AccessibilitySubPane {
    _noNodeInfo: Element;
    _warning: Element;
    _checked: boolean;
    _checkboxLabel: UI.UIUtils.CheckboxLabel;
    _checkboxElement: HTMLInputElement;
    _node: SDK.DOMModel.DOMNode | null;
    _overlayModel: SDK.OverlayModel.OverlayModel | null;
    constructor();
    setNodeAsync(node: SDK.DOMModel.DOMNode | null): Promise<void>;
    _checkboxClicked(): void;
}
