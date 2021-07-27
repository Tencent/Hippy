import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ElementsTreeElement } from './ElementsTreeElement.js';
import { ImagePreviewPopover } from './ImagePreviewPopover.js';
import type { MarkerDecoratorRegistration } from './MarkerDecorator.js';
export declare class ElementsTreeOutline extends UI.TreeOutline.TreeOutline {
    treeElementByNode: WeakMap<SDK.DOMModel.DOMNode, ElementsTreeElement>;
    _shadowRoot: ShadowRoot;
    _element: HTMLElement;
    _includeRootDOMNode: boolean;
    _selectEnabled: boolean | undefined;
    _rootDOMNode: SDK.DOMModel.DOMNode | null;
    _selectedDOMNode: SDK.DOMModel.DOMNode | null;
    _visible: boolean;
    _imagePreviewPopover: ImagePreviewPopover;
    _updateRecords: Map<SDK.DOMModel.DOMNode, UpdateRecord>;
    _treeElementsBeingUpdated: Set<ElementsTreeElement>;
    decoratorExtensions: MarkerDecoratorRegistration[] | null;
    _showHTMLCommentsSetting: Common.Settings.Setting<boolean>;
    _multilineEditing?: MultilineEditorController | null;
    _visibleWidth?: number;
    _clipboardNodeData?: ClipboardData;
    _isXMLMimeType?: boolean | null;
    _suppressRevealAndSelect?: boolean;
    _previousHoveredElement?: UI.TreeOutline.TreeElement;
    _treeElementBeingDragged?: ElementsTreeElement;
    _dragOverTreeElement?: ElementsTreeElement;
    _updateModifiedNodesTimeout?: number;
    constructor(omitRootDOMNode?: boolean, selectEnabled?: boolean, hideGutter?: boolean);
    static forDOMModel(domModel: SDK.DOMModel.DOMModel): ElementsTreeOutline | null;
    _onShowHTMLCommentsChange(): void;
    setWordWrap(wrap: boolean): void;
    setMultilineEditing(multilineEditing: MultilineEditorController | null): void;
    visibleWidth(): number;
    setVisibleWidth(width: number): void;
    _setClipboardData(data: ClipboardData | null): void;
    resetClipboardIfNeeded(removedNode: SDK.DOMModel.DOMNode): void;
    _onBeforeCopy(event: Event): void;
    _onCopyOrCut(isCut: boolean, event: Event): void;
    performCopyOrCut(isCut: boolean, node: SDK.DOMModel.DOMNode | null): void;
    canPaste(targetNode: SDK.DOMModel.DOMNode): boolean;
    pasteNode(targetNode: SDK.DOMModel.DOMNode): void;
    duplicateNode(targetNode: SDK.DOMModel.DOMNode): void;
    _onPaste(event: Event): void;
    _performPaste(targetNode: SDK.DOMModel.DOMNode): void;
    _performDuplicate(targetNode: SDK.DOMModel.DOMNode): void;
    setVisible(visible: boolean): void;
    get rootDOMNode(): SDK.DOMModel.DOMNode | null;
    set rootDOMNode(x: SDK.DOMModel.DOMNode | null);
    get isXMLMimeType(): boolean;
    selectedDOMNode(): SDK.DOMModel.DOMNode | null;
    selectDOMNode(node: SDK.DOMModel.DOMNode | null, focus?: boolean): void;
    editing(): boolean;
    update(): void;
    _selectedNodeChanged(focus: boolean): void;
    _fireElementsTreeUpdated(nodes: SDK.DOMModel.DOMNode[]): void;
    findTreeElement(node: SDK.DOMModel.DOMNode): ElementsTreeElement | null;
    _lookUpTreeElement(node: SDK.DOMModel.DOMNode | null): UI.TreeOutline.TreeElement | null;
    createTreeElementFor(node: SDK.DOMModel.DOMNode): ElementsTreeElement | null;
    set suppressRevealAndSelect(x: boolean);
    _revealAndSelectNode(node: SDK.DOMModel.DOMNode | null, omitFocus: boolean): void;
    _treeElementFromEvent(event: MouseEvent): UI.TreeOutline.TreeElement | null;
    _onfocusout(_event: Event): void;
    _onmousedown(event: MouseEvent): void;
    setHoverEffect(treeElement: UI.TreeOutline.TreeElement | null): void;
    _onmousemove(event: MouseEvent): void;
    _highlightTreeElement(element: UI.TreeOutline.TreeElement, showInfo: boolean): void;
    _onmouseleave(_event: MouseEvent): void;
    _ondragstart(event: DragEvent): boolean | undefined;
    _ondragover(event: DragEvent): boolean;
    _ondragleave(event: DragEvent): boolean;
    _validDragSourceOrTarget(treeElement: UI.TreeOutline.TreeElement | null): ElementsTreeElement | null;
    _ondrop(event: DragEvent): void;
    _doMove(treeElement: ElementsTreeElement): void;
    _ondragend(event: DragEvent): void;
    _clearDragOverTreeElementMarker(): void;
    _contextMenuEventFired(event: MouseEvent): void;
    showContextMenu(treeElement: ElementsTreeElement, event: Event): void;
    _saveNodeToTempVariable(node: SDK.DOMModel.DOMNode): Promise<void>;
    runPendingUpdates(): void;
    _onKeyDown(event: Event): void;
    toggleEditAsHTML(node: SDK.DOMModel.DOMNode, startEditing?: boolean, callback?: (() => void)): void;
    selectNodeAfterEdit(wasExpanded: boolean, error: string | null, newNode: SDK.DOMModel.DOMNode | null): ElementsTreeElement | null;
    /**
     * Runs a script on the node's remote object that toggles a class name on
     * the node and injects a stylesheet into the head of the node's document
     * containing a rule to set "visibility: hidden" on the class and all it's
     * ancestors.
     */
    toggleHideElement(node: SDK.DOMModel.DOMNode): Promise<void>;
    isToggledToHidden(node: SDK.DOMModel.DOMNode): boolean;
    _reset(): void;
    wireToDOMModel(domModel: SDK.DOMModel.DOMModel): void;
    unwireFromDOMModel(domModel: SDK.DOMModel.DOMModel): void;
    _addUpdateRecord(node: SDK.DOMModel.DOMNode): UpdateRecord;
    _updateRecordForHighlight(node: SDK.DOMModel.DOMNode): UpdateRecord | null;
    _documentUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _attributeModified(event: Common.EventTarget.EventTargetEvent): void;
    _attributeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _characterDataModified(event: Common.EventTarget.EventTargetEvent): void;
    _nodeInserted(event: Common.EventTarget.EventTargetEvent): void;
    _nodeRemoved(event: Common.EventTarget.EventTargetEvent): void;
    _childNodeCountUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _distributedNodesChanged(event: Common.EventTarget.EventTargetEvent): void;
    _updateModifiedNodesSoon(): void;
    _updateModifiedNodes(): void;
    _updateModifiedNode(node: SDK.DOMModel.DOMNode): void;
    _updateModifiedParentNode(node: SDK.DOMModel.DOMNode): void;
    populateTreeElement(treeElement: ElementsTreeElement): Promise<void>;
    _createElementTreeElement(node: SDK.DOMModel.DOMNode, isClosingTag?: boolean): ElementsTreeElement;
    _showChild(treeElement: ElementsTreeElement, child: SDK.DOMModel.DOMNode): ElementsTreeElement | null;
    _visibleChildren(node: SDK.DOMModel.DOMNode): SDK.DOMModel.DOMNode[];
    _hasVisibleChildren(node: SDK.DOMModel.DOMNode): boolean;
    _createExpandAllButtonTreeElement(treeElement: ElementsTreeElement): UI.TreeOutline.TreeElement;
    setExpandedChildrenLimit(treeElement: ElementsTreeElement, expandedChildrenLimit: number): void;
    _updateChildren(treeElement: ElementsTreeElement): void;
    insertChildElement(treeElement: ElementsTreeElement, child: SDK.DOMModel.DOMNode, index: number, isClosingTag?: boolean): ElementsTreeElement;
    _moveChild(treeElement: ElementsTreeElement, child: ElementsTreeElement, targetIndex: number): void;
    _innerUpdateChildren(treeElement: ElementsTreeElement): void;
    _markersChanged(event: Common.EventTarget.EventTargetEvent): void;
    static _treeOutlineSymbol: symbol;
}
export declare namespace ElementsTreeOutline {
    enum Events {
        SelectedNodeChanged = "SelectedNodeChanged",
        ElementsTreeUpdated = "ElementsTreeUpdated"
    }
}
export declare const MappedCharToEntity: Map<string, string>;
export declare class UpdateRecord {
    _modifiedAttributes?: Set<string>;
    _removedAttributes?: Set<string>;
    _hasChangedChildren?: boolean;
    _hasRemovedChildren?: boolean;
    _charDataModified?: boolean;
    attributeModified(attrName: string): void;
    attributeRemoved(attrName: string): void;
    nodeInserted(_node: SDK.DOMModel.DOMNode): void;
    nodeRemoved(_node: SDK.DOMModel.DOMNode): void;
    charDataModified(): void;
    childrenModified(): void;
    isAttributeModified(attributeName: string): boolean;
    hasRemovedAttributes(): boolean;
    isCharDataModified(): boolean;
    hasChangedChildren(): boolean;
    hasRemovedChildren(): boolean;
}
export declare class Renderer implements UI.UIUtils.Renderer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): Renderer;
    render(object: Object): Promise<{
        node: Node;
        tree: UI.TreeOutline.TreeOutline | null;
    } | null>;
}
export declare class ShortcutTreeElement extends UI.TreeOutline.TreeElement {
    _nodeShortcut: SDK.DOMModel.DOMNodeShortcut;
    _hovered?: boolean;
    constructor(nodeShortcut: SDK.DOMModel.DOMNodeShortcut);
    get hovered(): boolean;
    set hovered(x: boolean);
    deferredNode(): SDK.DOMModel.DeferredDOMNode;
    domModel(): SDK.DOMModel.DOMModel;
    onselect(selectedByUser?: boolean): boolean;
}
export interface MultilineEditorController {
    cancel: () => void;
    commit: () => void;
    resize: () => void;
    editor: UI.TextEditor.TextEditor;
}
export interface ClipboardData {
    node: SDK.DOMModel.DOMNode;
    isCut: boolean;
}
