import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { FontEditorSectionManager } from './ColorSwatchPopoverIcon.js';
import { ComputedStyleModel } from './ComputedStyleModel.js';
import { ElementsSidebarPane } from './ElementsSidebarPane.js';
import { ImagePreviewPopover } from './ImagePreviewPopover.js';
import { StylePropertyHighlighter } from './StylePropertyHighlighter.js';
import type { Context } from './StylePropertyTreeElement.js';
import { StylePropertyTreeElement } from './StylePropertyTreeElement.js';
export declare class StylesSidebarPane extends ElementsSidebarPane {
    _currentToolbarPane: UI.Widget.Widget | null;
    _animatedToolbarPane: UI.Widget.Widget | null;
    _pendingWidget: UI.Widget.Widget | null;
    _pendingWidgetToggle: UI.Toolbar.ToolbarToggle | null;
    _toolbar: UI.Toolbar.Toolbar | null;
    _toolbarPaneElement: HTMLElement;
    _computedStyleModel: ComputedStyleModel;
    _noMatchesElement: HTMLElement;
    _sectionsContainer: HTMLElement;
    sectionByElement: WeakMap<Node, StylePropertiesSection>;
    _swatchPopoverHelper: InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    _linkifier: Components.Linkifier.Linkifier;
    _decorator: StylePropertyHighlighter;
    _lastRevealedProperty: SDK.CSSProperty.CSSProperty | null;
    _userOperation: boolean;
    _isEditingStyle: boolean;
    _filterRegex: RegExp | null;
    _isActivePropertyHighlighted: boolean;
    _initialUpdateCompleted: boolean;
    hasMatchedStyles: boolean;
    _sectionBlocks: SectionBlock[];
    _idleCallbackManager: IdleCallbackManager | null;
    _needsForceUpdate: boolean;
    _resizeThrottler: Common.Throttler.Throttler;
    _imagePreviewPopover: ImagePreviewPopover;
    activeCSSAngle: InlineEditor.CSSAngle.CSSAngle | null;
    static instance(): StylesSidebarPane;
    private constructor();
    swatchPopoverHelper(): InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    setUserOperation(userOperation: boolean): void;
    static createExclamationMark(property: SDK.CSSProperty.CSSProperty, title: string | null): Element;
    static ignoreErrorsForProperty(property: SDK.CSSProperty.CSSProperty): boolean;
    static createPropertyFilterElement(placeholder: string, container: Element, filterCallback: (arg0: RegExp | null) => void): Element;
    static formatLeadingProperties(section: StylePropertiesSection): {
        allDeclarationText: string;
        ruleText: string;
    };
    revealProperty(cssProperty: SDK.CSSProperty.CSSProperty): void;
    jumpToProperty(propertyName: string): void;
    forceUpdate(): void;
    _sectionsContainerKeyDown(event: Event): void;
    _sectionsContainerFocusChanged(): void;
    resetFocus(): void;
    _onAddButtonLongClick(event: Event): void;
    _onFilterChanged(regex: RegExp | null): void;
    _refreshUpdate(editedSection: StylePropertiesSection, editedTreeElement?: StylePropertyTreeElement): void;
    doUpdate(): Promise<void>;
    onResize(): void;
    _innerResize(): Promise<void>;
    _resetCache(): void;
    _fetchMatchedCascade(): Promise<SDK.CSSMatchedStyles.CSSMatchedStyles | null>;
    setEditingStyle(editing: boolean, _treeElement?: StylePropertyTreeElement): void;
    _setActiveProperty(treeElement: StylePropertyTreeElement | null): void;
    onCSSModelChanged(event?: Common.EventTarget.EventTargetEvent): void;
    focusedSectionIndex(): number;
    continueEditingElement(sectionIndex: number, propertyIndex: number): void;
    _innerRebuildUpdate(matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles | null): Promise<void>;
    _nodeStylesUpdatedForTest(_node: SDK.DOMModel.DOMNode, _rebuild: boolean): void;
    _rebuildSectionsForMatchedStyleRules(matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles): Promise<SectionBlock[]>;
    _createNewRuleInViaInspectorStyleSheet(): Promise<void>;
    _createNewRuleInStyleSheet(styleSheetHeader: SDK.CSSStyleSheetHeader.CSSStyleSheetHeader | null): Promise<void>;
    _addBlankSection(insertAfterSection: StylePropertiesSection, styleSheetId: string, ruleLocation: TextUtils.TextRange.TextRange): void;
    removeSection(section: StylePropertiesSection): void;
    filterRegex(): RegExp | null;
    _updateFilter(): void;
    willHide(): void;
    hideAllPopovers(): void;
    allSections(): StylePropertiesSection[];
    _clipboardCopy(_event: Event): void;
    _createStylesSidebarToolbar(): HTMLElement;
    showToolbarPane(widget: UI.Widget.Widget | null, toggle: UI.Toolbar.ToolbarToggle | null): void;
    appendToolbarItem(item: UI.Toolbar.ToolbarItem): void;
    _startToolbarPaneAnimation(widget: UI.Widget.Widget | null): void;
}
export declare const enum Events {
    InitialUpdateCompleted = "InitialUpdateCompleted",
    StylesUpdateCompleted = "StylesUpdateCompleted"
}
export declare const _maxLinkLength = 23;
export declare class SectionBlock {
    _titleElement: Element | null;
    sections: StylePropertiesSection[];
    constructor(titleElement: Element | null);
    static createPseudoTypeBlock(pseudoType: Protocol.DOM.PseudoType): SectionBlock;
    static createKeyframesBlock(keyframesName: string): SectionBlock;
    static _createInheritedNodeBlock(node: SDK.DOMModel.DOMNode): Promise<SectionBlock>;
    updateFilter(): boolean;
    titleElement(): Element | null;
}
export declare class IdleCallbackManager {
    _discarded: boolean;
    _promises: Promise<void>[];
    constructor();
    discard(): void;
    schedule(fn: () => void, timeout?: number): void;
    awaitDone(): Promise<void[]>;
}
export declare class StylePropertiesSection {
    _parentPane: StylesSidebarPane;
    _style: SDK.CSSStyleDeclaration.CSSStyleDeclaration;
    _matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles;
    editable: boolean;
    _hoverTimer: number | null;
    _willCauseCancelEditing: boolean;
    _forceShowAll: boolean;
    _originalPropertiesCount: number;
    element: HTMLDivElement;
    _innerElement: HTMLElement;
    _titleElement: HTMLElement;
    propertiesTreeOutline: UI.TreeOutline.TreeOutlineInShadow;
    _showAllButton: HTMLButtonElement;
    _selectorElement: HTMLSpanElement;
    _newStyleRuleToolbar: UI.Toolbar.Toolbar | undefined;
    _fontEditorToolbar: UI.Toolbar.Toolbar | undefined;
    _fontEditorSectionManager: FontEditorSectionManager | undefined;
    _fontEditorButton: UI.Toolbar.ToolbarButton | undefined;
    _selectedSinceMouseDown: boolean;
    _elementToSelectorIndex: WeakMap<Element, number>;
    navigable: boolean | null | undefined;
    _mediaListElement: HTMLElement;
    _selectorRefElement: HTMLElement;
    _selectorContainer: HTMLDivElement;
    _fontPopoverIcon: FontEditorSectionManager | null;
    _hoverableSelectorsMode: boolean;
    _isHidden: boolean;
    constructor(parentPane: StylesSidebarPane, matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, style: SDK.CSSStyleDeclaration.CSSStyleDeclaration);
    registerFontProperty(treeElement: StylePropertyTreeElement): void;
    resetToolbars(): void;
    static createRuleOriginNode(matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, linkifier: Components.Linkifier.Linkifier, rule: SDK.CSSRule.CSSRule | null): Node;
    static _getRuleLocationFromCSSRule(rule: SDK.CSSRule.CSSRule): TextUtils.TextRange.TextRange | null | undefined;
    static tryNavigateToRuleLocation(matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, rule: SDK.CSSRule.CSSRule | null): void;
    static _linkifyRuleLocation(cssModel: SDK.CSSModel.CSSModel, linkifier: Components.Linkifier.Linkifier, styleSheetId: string, ruleLocation: TextUtils.TextRange.TextRange): Node;
    static _getCSSSelectorLocation(cssModel: SDK.CSSModel.CSSModel, styleSheetId: string, ruleLocation: TextUtils.TextRange.TextRange): SDK.CSSModel.CSSLocation;
    _getFocused(): HTMLElement | null;
    _focusNext(element: HTMLElement): void;
    _ruleNavigation(keyboardEvent: KeyboardEvent): void;
    _onKeyDown(event: Event): void;
    _setSectionHovered(isHovered: boolean): void;
    _onMouseLeave(_event: Event): void;
    _onMouseMove(event: MouseEvent): void;
    _onFontEditorButtonClicked(): void;
    style(): SDK.CSSStyleDeclaration.CSSStyleDeclaration;
    _headerText(): string;
    _onMouseOutSelector(): void;
    _onMouseEnterSelector(): void;
    _highlight(mode?: string | undefined): void;
    firstSibling(): StylePropertiesSection | null;
    findCurrentOrNextVisible(willIterateForward: boolean, originalSection?: StylePropertiesSection): StylePropertiesSection | null;
    lastSibling(): StylePropertiesSection | null;
    nextSibling(): StylePropertiesSection | undefined;
    previousSibling(): StylePropertiesSection | undefined;
    _onNewRuleClick(event: Common.EventTarget.EventTargetEvent): void;
    _styleSheetEdited(edit: SDK.CSSModel.Edit): void;
    _createMediaList(mediaRules: SDK.CSSMedia.CSSMedia[]): void;
    _updateMediaList(): void;
    isPropertyInherited(propertyName: string): boolean;
    nextEditableSibling(): StylePropertiesSection | null;
    previousEditableSibling(): StylePropertiesSection | null;
    refreshUpdate(editedTreeElement: StylePropertyTreeElement): void;
    _updateVarFunctions(editedTreeElement: StylePropertyTreeElement): void;
    update(full: boolean): void;
    _showAllItems(event?: Event): void;
    onpopulate(): void;
    _isPropertyOverloaded(property: SDK.CSSProperty.CSSProperty): boolean;
    _updateFilter(): boolean;
    isHidden(): boolean;
    _markSelectorMatches(): void;
    _renderHoverableSelectors(selectors: string[], matchingSelectors: boolean[]): DocumentFragment;
    _createSelectorElement(text: string, isMatching: boolean, navigationIndex?: number): Element;
    _renderSimplifiedSelectors(selectors: string[], matchingSelectors: boolean[]): DocumentFragment;
    _markSelectorHighlights(): void;
    _checkWillCancelEditing(): boolean;
    _handleSelectorContainerClick(event: Event): void;
    addNewBlankProperty(index?: number | undefined): StylePropertyTreeElement;
    _handleEmptySpaceMouseDown(): void;
    _handleEmptySpaceClick(event: Event): void;
    _handleMediaRuleClick(media: SDK.CSSMedia.CSSMedia, element: Element, event: Event): void;
    _editingMediaFinished(element: Element): void;
    _editingMediaCancelled(element: Element): void;
    _editingMediaBlurHandler(): boolean;
    _editingMediaCommitted(media: SDK.CSSMedia.CSSMedia, element: Element, newContent: string, _oldContent: string, _context: Context | undefined, _moveDirection: string): void;
    _editingMediaTextCommittedForTest(): void;
    _handleSelectorClick(event: Event): void;
    _handleContextMenuEvent(event: Event): void;
    _navigateToSelectorSource(index: number, focus: boolean): void;
    static _revealSelectorSource(rawLocation: SDK.CSSModel.CSSLocation, focus: boolean): void;
    _startEditingAtFirstPosition(): void;
    startEditingSelector(): void;
    moveEditorFromSelector(moveDirection: string): void;
    editingSelectorCommitted(element: Element, newContent: string, oldContent: string, context: Context | undefined, moveDirection: string): void;
    _setHeaderText(rule: SDK.CSSRule.CSSRule, newContent: string): Promise<void>;
    _editingSelectorCommittedForTest(): void;
    _updateRuleOrigin(): void;
    _editingSelectorEnded(): void;
    editingSelectorCancelled(): void;
    /**
     * A property at or near an index and suitable for subsequent editing.
     * Either the last property, if index out-of-upper-bound,
     * or property at index, if such a property exists,
     * or otherwise, null.
     */
    closestPropertyForEditing(propertyIndex: number): UI.TreeOutline.TreeElement | null;
    static MaxProperties: number;
}
export declare class BlankStylePropertiesSection extends StylePropertiesSection {
    _normal: boolean;
    _ruleLocation: TextUtils.TextRange.TextRange;
    _styleSheetId: string;
    constructor(stylesPane: StylesSidebarPane, matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, defaultSelectorText: string, styleSheetId: string, ruleLocation: TextUtils.TextRange.TextRange, insertAfterStyle: SDK.CSSStyleDeclaration.CSSStyleDeclaration);
    _actualRuleLocation(): TextUtils.TextRange.TextRange;
    _rulePrefix(): string;
    get isBlank(): boolean;
    editingSelectorCommitted(element: Element, newContent: string, oldContent: string, context: Context | undefined, moveDirection: string): void;
    editingSelectorCancelled(): void;
    _makeNormal(newRule: SDK.CSSRule.CSSRule): void;
}
export declare class KeyframePropertiesSection extends StylePropertiesSection {
    constructor(stylesPane: StylesSidebarPane, matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, style: SDK.CSSStyleDeclaration.CSSStyleDeclaration);
    _headerText(): string;
    _setHeaderText(rule: SDK.CSSRule.CSSRule, newContent: string): Promise<void>;
    isPropertyInherited(_propertyName: string): boolean;
    _isPropertyOverloaded(_property: SDK.CSSProperty.CSSProperty): boolean;
    _markSelectorHighlights(): void;
    _markSelectorMatches(): void;
    _highlight(): void;
}
export declare function quoteFamilyName(familyName: string): string;
export declare class CSSPropertyPrompt extends UI.TextPrompt.TextPrompt {
    _isColorAware: boolean;
    _cssCompletions: string[];
    _selectedNodeComputedStyles: Map<string, string> | null;
    _parentNodeComputedStyles: Map<string, string> | null;
    _treeElement: StylePropertyTreeElement;
    _isEditingName: boolean;
    _cssVariables: string[];
    constructor(treeElement: StylePropertyTreeElement, isEditingName: boolean);
    onKeyDown(event: Event): void;
    onMouseWheel(event: Event): void;
    tabKeyPressed(): boolean;
    _handleNameOrValueUpDown(event: Event): boolean;
    _isValueSuggestion(word: string): boolean;
    _buildPropertyCompletions(expression: string, query: string, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
}
export declare function unescapeCssString(input: string): string;
export declare class StylesSidebarPropertyRenderer {
    _rule: SDK.CSSRule.CSSRule | null;
    _node: SDK.DOMModel.DOMNode | null;
    _propertyName: string;
    _propertyValue: string;
    _colorHandler: ((arg0: string) => Node) | null;
    _bezierHandler: ((arg0: string) => Node) | null;
    _fontHandler: ((arg0: string) => Node) | null;
    _shadowHandler: ((arg0: string, arg1: string) => Node) | null;
    _gridHandler: ((arg0: string, arg1: string) => Node) | null;
    _varHandler: ((arg0: string) => Node) | null;
    _angleHandler: ((arg0: string) => Node) | null;
    constructor(rule: SDK.CSSRule.CSSRule | null, node: SDK.DOMModel.DOMNode | null, name: string, value: string);
    setColorHandler(handler: (arg0: string) => Node): void;
    setBezierHandler(handler: (arg0: string) => Node): void;
    setFontHandler(handler: (arg0: string) => Node): void;
    setShadowHandler(handler: (arg0: string, arg1: string) => Node): void;
    setGridHandler(handler: (arg0: string, arg1: string) => Node): void;
    setVarHandler(handler: (arg0: string) => Node): void;
    setAngleHandler(handler: (arg0: string) => Node): void;
    renderName(): Element;
    renderValue(): Element;
    _processURL(text: string): Node;
}
export declare class ButtonProvider implements UI.Toolbar.Provider {
    _button: UI.Toolbar.ToolbarButton;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ButtonProvider;
    _clicked(_event: Common.EventTarget.EventTargetEvent): void;
    _longClicked(event: Event): void;
    item(): UI.Toolbar.ToolbarItem;
}
