import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class AccessibilityTreeView extends UI.Widget.VBox {
    private readonly accessibilityTreeComponent;
    private treeData;
    private readonly toggleButton;
    private accessibilityModel;
    private rootAXNode;
    private selectedTreeNode;
    private inspectedDOMNode;
    constructor(toggleButton: HTMLButtonElement);
    wasShown(): void;
    setAccessibilityModel(model: SDK.AccessibilityModel.AccessibilityModel | null): void;
    refreshAccessibilityTree(): Promise<void>;
    loadSubTreeIntoAccessibilityModel(selectedNode: SDK.DOMModel.DOMNode): Promise<void>;
    selectedNodeChanged(inspectedNode: SDK.DOMModel.DOMNode): Promise<void>;
}
