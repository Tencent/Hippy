import * as Common from '../../../../core/common/common.js';
import type * as Components from '../utils/utils.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
export declare const getObjectPropertiesSectionFrom: (element: Element) => ObjectPropertiesSection | undefined;
export declare class ObjectPropertiesSection extends UI.TreeOutline.TreeOutlineInShadow {
    _object: SDK.RemoteObject.RemoteObject;
    _editable: boolean;
    _objectTreeElement: RootElement;
    titleElement: Element;
    _skipProto?: boolean;
    constructor(object: SDK.RemoteObject.RemoteObject, title?: string | Element | null, linkifier?: Components.Linkifier.Linkifier, emptyPlaceholder?: string | null, ignoreHasOwnProperty?: boolean, extraProperties?: SDK.RemoteObject.RemoteObjectProperty[], showOverflow?: boolean);
    static defaultObjectPresentation(object: SDK.RemoteObject.RemoteObject, linkifier?: Components.Linkifier.Linkifier, skipProto?: boolean, readOnly?: boolean): Element;
    static defaultObjectPropertiesSection(object: SDK.RemoteObject.RemoteObject, linkifier?: Components.Linkifier.Linkifier, skipProto?: boolean, readOnly?: boolean): ObjectPropertiesSection;
    static compareProperties(propertyA: SDK.RemoteObject.RemoteObjectProperty, propertyB: SDK.RemoteObject.RemoteObjectProperty): number;
    static createNameElement(name: string | null, isPrivate?: boolean): Element;
    static valueElementForFunctionDescription(description?: string | null, includePreview?: boolean, defaultName?: string): Element;
    static createPropertyValueWithCustomSupport(value: SDK.RemoteObject.RemoteObject, wasThrown: boolean, showPreview: boolean, parentElement?: Element, linkifier?: Components.Linkifier.Linkifier): ObjectPropertyValue;
    static appendMemoryIcon(element: Element, obj: SDK.RemoteObject.RemoteObject): void;
    static createPropertyValue(value: SDK.RemoteObject.RemoteObject, wasThrown: boolean, showPreview: boolean, parentElement?: Element, linkifier?: Components.Linkifier.Linkifier): ObjectPropertyValue;
    static formatObjectAsFunction(func: SDK.RemoteObject.RemoteObject, element: Element, linkify: boolean, includePreview?: boolean): Promise<void>;
    static _isDisplayableProperty(property: SDK.RemoteObject.RemoteObjectProperty, parentProperty?: SDK.RemoteObject.RemoteObjectProperty): boolean;
    skipProto(): void;
    expand(): void;
    setEditable(value: boolean): void;
    objectTreeElement(): UI.TreeOutline.TreeElement;
    enableContextMenu(): void;
    _contextMenuEventFired(event: Event): void;
    titleLessMode(): void;
}
export declare function setMaxRenderableStringLength(value: number): void;
export declare function getMaxRenderableStringLength(): number;
export declare class ObjectPropertiesSectionsTreeOutline extends UI.TreeOutline.TreeOutlineInShadow {
    _editable: boolean;
    constructor(options?: TreeOutlineOptions | null);
}
export declare class RootElement extends UI.TreeOutline.TreeElement {
    _object: SDK.RemoteObject.RemoteObject;
    _extraProperties: SDK.RemoteObject.RemoteObjectProperty[];
    _ignoreHasOwnProperty: boolean;
    _emptyPlaceholder: string | null | undefined;
    toggleOnClick: boolean;
    _linkifier: Components.Linkifier.Linkifier | undefined;
    constructor(object: SDK.RemoteObject.RemoteObject, linkifier?: Components.Linkifier.Linkifier, emptyPlaceholder?: string | null, ignoreHasOwnProperty?: boolean, extraProperties?: SDK.RemoteObject.RemoteObjectProperty[]);
    onexpand(): void;
    oncollapse(): void;
    ondblclick(_e: Event): boolean;
    private onContextMenu;
    onpopulate(): Promise<void>;
}
export declare const InitialVisibleChildrenLimit = 200;
export declare class ObjectPropertyTreeElement extends UI.TreeOutline.TreeElement {
    property: SDK.RemoteObject.RemoteObjectProperty;
    toggleOnClick: boolean;
    _highlightChanges: UI.UIUtils.HighlightChange[];
    _linkifier: Components.Linkifier.Linkifier | undefined;
    _maxNumPropertiesToShow: number;
    nameElement: HTMLElement;
    valueElement: HTMLElement;
    _rowContainer: HTMLElement;
    _readOnly: boolean;
    _prompt: ObjectPropertyPrompt | undefined;
    _editableDiv: HTMLElement;
    propertyValue?: ObjectPropertyValue;
    expandedValueElement?: Element | null;
    constructor(property: SDK.RemoteObject.RemoteObjectProperty, linkifier?: Components.Linkifier.Linkifier);
    static _populate(treeElement: UI.TreeOutline.TreeElement, value: SDK.RemoteObject.RemoteObject, skipProto: boolean, linkifier?: Components.Linkifier.Linkifier, emptyPlaceholder?: string | null, flattenProtoChain?: boolean, extraProperties?: SDK.RemoteObject.RemoteObjectProperty[], targetValue?: SDK.RemoteObject.RemoteObject): Promise<void>;
    static populateWithProperties(treeNode: UI.TreeOutline.TreeElement, properties: SDK.RemoteObject.RemoteObjectProperty[], internalProperties: SDK.RemoteObject.RemoteObjectProperty[] | null, skipProto: boolean, value: SDK.RemoteObject.RemoteObject | null, linkifier?: Components.Linkifier.Linkifier, emptyPlaceholder?: string | null): void;
    static _appendEmptyPlaceholderIfNeeded(treeNode: UI.TreeOutline.TreeElement, emptyPlaceholder?: string | null): void;
    static createRemoteObjectAccessorPropertySpan(object: SDK.RemoteObject.RemoteObject | null, propertyPath: string[], callback: (arg0: SDK.RemoteObject.CallFunctionResult) => void): HTMLElement;
    setSearchRegex(regex: RegExp, additionalCssClassName?: string): boolean;
    _applySearch(regex: RegExp, element: Element, cssClassName: string): void;
    _showAllPropertiesElementSelected(element: UI.TreeOutline.TreeElement): boolean;
    _createShowAllPropertiesButton(): void;
    revertHighlightChanges(): void;
    onpopulate(): Promise<void>;
    ondblclick(event: Event): boolean;
    onenter(): boolean;
    onattach(): void;
    onexpand(): void;
    oncollapse(): void;
    _showExpandedValueElement(value: boolean): void;
    _createExpandedValueElement(value: SDK.RemoteObject.RemoteObject): Element | null;
    update(): void;
    _updatePropertyPath(): void;
    _contextMenuFired(event: Event): void;
    _startEditing(): void;
    _editingEnded(): void;
    _editingCancelled(): void;
    _editingCommitted(originalContent: string): Promise<void>;
    _promptKeyDown(originalContent: string, event: Event): void;
    _applyExpression(expression: string): Promise<void>;
    _onInvokeGetterClick(result: SDK.RemoteObject.CallFunctionResult): void;
    _updateExpandable(): void;
    path(): string;
}
export declare class ArrayGroupingTreeElement extends UI.TreeOutline.TreeElement {
    toggleOnClick: boolean;
    _fromIndex: number;
    _toIndex: number;
    _object: SDK.RemoteObject.RemoteObject;
    _readOnly: boolean;
    _propertyCount: number;
    _linkifier: Components.Linkifier.Linkifier | undefined;
    constructor(object: SDK.RemoteObject.RemoteObject, fromIndex: number, toIndex: number, propertyCount: number, linkifier?: Components.Linkifier.Linkifier);
    static _populateArray(treeNode: UI.TreeOutline.TreeElement, object: SDK.RemoteObject.RemoteObject, fromIndex: number, toIndex: number, linkifier?: Components.Linkifier.Linkifier): Promise<void>;
    static _populateRanges(treeNode: UI.TreeOutline.TreeElement, object: SDK.RemoteObject.RemoteObject, fromIndex: number, toIndex: number, topLevel: boolean, linkifier?: Components.Linkifier.Linkifier): Promise<void>;
    static _populateAsFragment(this: ArrayGroupingTreeElement, treeNode: UI.TreeOutline.TreeElement, object: SDK.RemoteObject.RemoteObject, fromIndex: number, toIndex: number, linkifier?: Components.Linkifier.Linkifier): Promise<void>;
    static _populateNonIndexProperties(this: ArrayGroupingTreeElement, treeNode: UI.TreeOutline.TreeElement, object: SDK.RemoteObject.RemoteObject, skipGetOwnPropertyNames: boolean, linkifier?: Components.Linkifier.Linkifier): Promise<void>;
    onpopulate(): Promise<void>;
    onattach(): void;
    static _bucketThreshold: number;
    static _sparseIterationThreshold: number;
    static _getOwnPropertyNamesThreshold: number;
}
export declare class ObjectPropertyPrompt extends UI.TextPrompt.TextPrompt {
    constructor();
}
export declare class ObjectPropertiesSectionsTreeExpandController {
    _expandedProperties: Set<string>;
    constructor(treeOutline: UI.TreeOutline.TreeOutline);
    watchSection(id: string, section: RootElement): void;
    stopWatchSectionsWithId(id: string): void;
    _elementAttached(event: Common.EventTarget.EventTargetEvent): void;
    _elementExpanded(event: Common.EventTarget.EventTargetEvent): void;
    _elementCollapsed(event: Common.EventTarget.EventTargetEvent): void;
    _propertyPath(treeElement: UI.TreeOutline.TreeElement): string;
}
export declare class Renderer implements UI.UIUtils.Renderer {
    static instance(opts?: {
        forceNew: boolean;
    }): Renderer;
    render(object: Object, options?: UI.UIUtils.Options): Promise<{
        node: Node;
        tree: UI.TreeOutline.TreeOutline | null;
    } | null>;
}
export declare class ObjectPropertyValue implements UI.ContextMenu.Provider {
    element: Element;
    constructor(element: Element);
    appendApplicableItems(_event: Event, _contextMenu: UI.ContextMenu.ContextMenu, _object: Object): void;
}
export declare class ExpandableTextPropertyValue extends ObjectPropertyValue {
    _text: string;
    _maxLength: number;
    _expandElement: Element | null;
    _maxDisplayableTextLength: number;
    _expandElementText: Common.UIString.LocalizedString | undefined;
    _copyButtonText: Common.UIString.LocalizedString;
    constructor(element: Element, text: string, maxLength: number);
    appendApplicableItems(_event: Event, contextMenu: UI.ContextMenu.ContextMenu, _object: Object): void;
    _expandText(): void;
    _copyText(): void;
}
export interface TreeOutlineOptions {
    readOnly?: boolean;
}
