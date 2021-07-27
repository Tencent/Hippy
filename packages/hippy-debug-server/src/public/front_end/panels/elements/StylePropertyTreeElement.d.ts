import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { StylePropertiesSection } from './StylesSidebarPane.js';
import { CSSPropertyPrompt, StylesSidebarPane } from './StylesSidebarPane.js';
export declare class StylePropertyTreeElement extends UI.TreeOutline.TreeElement {
    _style: SDK.CSSStyleDeclaration.CSSStyleDeclaration;
    _matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles;
    property: SDK.CSSProperty.CSSProperty;
    _inherited: boolean;
    _overloaded: boolean;
    _parentPane: StylesSidebarPane;
    isShorthand: boolean;
    _applyStyleThrottler: Common.Throttler.Throttler;
    _newProperty: boolean;
    _expandedDueToFilter: boolean;
    valueElement: HTMLElement | null;
    nameElement: HTMLElement | null;
    _expandElement: UI.Icon.Icon | null;
    _originalPropertyText: string;
    _hasBeenEditedIncrementally: boolean;
    _prompt: CSSPropertyPrompt | null;
    _lastComputedValue: string | null;
    _contextForTest: Context | undefined;
    constructor(stylesPane: StylesSidebarPane, matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, property: SDK.CSSProperty.CSSProperty, isShorthand: boolean, inherited: boolean, overloaded: boolean, newProperty: boolean);
    matchedStyles(): SDK.CSSMatchedStyles.CSSMatchedStyles;
    _editable(): boolean;
    inherited(): boolean;
    overloaded(): boolean;
    setOverloaded(x: boolean): void;
    get name(): string;
    get value(): string;
    updateFilter(): boolean;
    _processColor(text: string, valueChild?: Node | null): Node;
    _processVar(text: string): Node;
    _handleVarDefinitionActivate(variableName: string): void;
    _addColorContrastInfo(swatch: InlineEditor.ColorSwatch.ColorSwatch): Promise<void>;
    renderedPropertyText(): string;
    _processBezier(text: string): Node;
    _processFont(text: string): Node;
    _processShadow(propertyValue: string, propertyName: string): Node;
    _processGrid(propertyValue: string, _propertyName: string): Node;
    _processAngle(angleText: string): Text | InlineEditor.CSSAngle.CSSAngle;
    _updateState(): void;
    node(): SDK.DOMModel.DOMNode | null;
    parentPane(): StylesSidebarPane;
    section(): StylePropertiesSection | null;
    _updatePane(): void;
    _toggleDisabled(disabled: boolean): Promise<void>;
    onpopulate(): Promise<void>;
    onattach(): void;
    onexpand(): void;
    oncollapse(): void;
    _updateExpandElement(): void;
    updateTitleIfComputedValueChanged(): void;
    updateTitle(): void;
    _innerUpdateTitle(): void;
    _updateFontVariationSettingsWarning(): Promise<void>;
    _mouseUp(event: Event): void;
    _handleContextMenuEvent(context: Context, event: Event): void;
    _handleCopyContextMenuEvent(event: Event): void;
    _viewComputedValue(): Promise<void>;
    _navigateToSource(element: Element, omitFocus?: boolean): void;
    startEditing(selectElement?: Element | null): void;
    _editingNameValueKeyDown(context: Context, event: Event): void;
    _editingNameValueKeyPress(context: Context, event: Event): void;
    _applyFreeFlowStyleTextEdit(context: Context): Promise<void>;
    kickFreeFlowStyleEditForTest(): Promise<void>;
    editingEnded(context: Context): void;
    editingCancelled(element: Element | null, context: Context): void;
    _applyOriginalStyle(context: Context): Promise<void>;
    _findSibling(moveDirection: string): StylePropertyTreeElement | null;
    _editingCommitted(userInput: string, context: Context, moveDirection: string): Promise<void>;
    _removePrompt(): void;
    styleTextAppliedForTest(): void;
    applyStyleText(styleText: string, majorChange: boolean, property?: SDK.CSSProperty.CSSProperty | null): Promise<void>;
    _innerApplyStyleText(styleText: string, majorChange: boolean, property?: SDK.CSSProperty.CSSProperty | null): Promise<void>;
    ondblclick(): boolean;
    isEventWithinDisclosureTriangle(event: Event): boolean;
}
export interface Context {
    expanded: boolean;
    hasChildren: boolean;
    isEditingName: boolean;
    originalProperty?: SDK.CSSProperty.CSSProperty;
    originalName?: string;
    originalValue?: string;
    previousContent: string;
}
