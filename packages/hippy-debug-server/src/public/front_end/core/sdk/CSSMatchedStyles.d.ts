import type * as Protocol from '../../generated/protocol.js';
import type { CSSModel } from './CSSModel.js';
import type { CSSProperty } from './CSSProperty.js';
import { CSSKeyframesRule, CSSStyleRule } from './CSSRule.js';
import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';
import type { DOMNode } from './DOMModel.js';
export declare class CSSMatchedStyles {
    _cssModel: CSSModel;
    _node: DOMNode;
    _addedStyles: Map<CSSStyleDeclaration, DOMNode>;
    _matchingSelectors: Map<number, Map<string, boolean>>;
    _keyframes: CSSKeyframesRule[];
    _nodeForStyle: Map<CSSStyleDeclaration, DOMNode | null>;
    _inheritedStyles: Set<CSSStyleDeclaration>;
    _mainDOMCascade: DOMInheritanceCascade;
    _pseudoDOMCascades: Map<Protocol.DOM.PseudoType, DOMInheritanceCascade>;
    _styleToDOMCascade: Map<CSSStyleDeclaration, DOMInheritanceCascade>;
    constructor(cssModel: CSSModel, node: DOMNode, inlinePayload: Protocol.CSS.CSSStyle | null, attributesPayload: Protocol.CSS.CSSStyle | null, matchedPayload: Protocol.CSS.RuleMatch[], pseudoPayload: Protocol.CSS.PseudoElementMatches[], inheritedPayload: Protocol.CSS.InheritedStyleEntry[], animationsPayload: Protocol.CSS.CSSKeyframesRule[]);
    _buildMainCascade(inlinePayload: Protocol.CSS.CSSStyle | null, attributesPayload: Protocol.CSS.CSSStyle | null, matchedPayload: Protocol.CSS.RuleMatch[], inheritedPayload: Protocol.CSS.InheritedStyleEntry[]): DOMInheritanceCascade;
    _buildPseudoCascades(pseudoPayload: Protocol.CSS.PseudoElementMatches[]): Map<Protocol.DOM.PseudoType, DOMInheritanceCascade>;
    _addMatchingSelectors(this: CSSMatchedStyles, node: DOMNode, rule: CSSStyleRule, matchingSelectorIndices: number[]): void;
    node(): DOMNode;
    cssModel(): CSSModel;
    hasMatchingSelectors(rule: CSSStyleRule): boolean;
    matchingSelectors(rule: CSSStyleRule): number[];
    recomputeMatchingSelectors(rule: CSSStyleRule): Promise<any>;
    addNewRule(rule: CSSStyleRule, node: DOMNode): Promise<any>;
    _setSelectorMatches(node: DOMNode, selectorText: string, value: boolean): void;
    mediaMatches(style: CSSStyleDeclaration): boolean;
    nodeStyles(): CSSStyleDeclaration[];
    keyframes(): CSSKeyframesRule[];
    pseudoStyles(pseudoType: Protocol.DOM.PseudoType): CSSStyleDeclaration[];
    pseudoTypes(): Set<Protocol.DOM.PseudoType>;
    _containsInherited(style: CSSStyleDeclaration): boolean;
    nodeForStyle(style: CSSStyleDeclaration): DOMNode | null;
    availableCSSVariables(style: CSSStyleDeclaration): string[];
    computeCSSVariable(style: CSSStyleDeclaration, variableName: string): string | null;
    computeValue(style: CSSStyleDeclaration, value: string): string | null;
    /**
     * Same as computeValue, but to be used for `var(--name [,...])` values only
     */
    computeSingleVariableValue(style: CSSStyleDeclaration, cssVariableValue: string): {
        computedValue: string | null;
        fromFallback: boolean;
    } | null;
    isInherited(style: CSSStyleDeclaration): boolean;
    propertyState(property: CSSProperty): PropertyState | null;
    resetActiveProperties(): void;
}
declare class NodeCascade {
    _matchedStyles: CSSMatchedStyles;
    _styles: CSSStyleDeclaration[];
    _isInherited: boolean;
    _propertiesState: Map<CSSProperty, PropertyState>;
    _activeProperties: Map<string, CSSProperty>;
    constructor(matchedStyles: CSSMatchedStyles, styles: CSSStyleDeclaration[], isInherited: boolean);
    _computeActiveProperties(): void;
}
declare class DOMInheritanceCascade {
    _nodeCascades: NodeCascade[];
    _propertiesState: Map<CSSProperty, PropertyState>;
    _availableCSSVariables: Map<NodeCascade, Map<string, string>>;
    _computedCSSVariables: Map<NodeCascade, Map<string, string | null>>;
    _initialized: boolean;
    _styleToNodeCascade: Map<CSSStyleDeclaration, NodeCascade>;
    constructor(nodeCascades: NodeCascade[]);
    availableCSSVariables(style: CSSStyleDeclaration): string[];
    computeCSSVariable(style: CSSStyleDeclaration, variableName: string): string | null;
    computeValue(style: CSSStyleDeclaration, value: string): string | null;
    computeSingleVariableValue(style: CSSStyleDeclaration, cssVariableValue: string): {
        computedValue: string | null;
        fromFallback: boolean;
    } | null;
    _getCSSVariableNameAndFallback(cssVariableValue: string): {
        variableName: string | null;
        fallback: string | null;
    };
    _innerComputeCSSVariable(availableCSSVariables: Map<string, string>, computedCSSVariables: Map<string, string | null>, variableName: string): string | null;
    _innerComputeValue(availableCSSVariables: Map<string, string>, computedCSSVariables: Map<string, string | null>, value: string): string | null;
    styles(): CSSStyleDeclaration[];
    propertyState(property: CSSProperty): PropertyState | null;
    reset(): void;
    _ensureInitialized(): void;
}
export declare enum PropertyState {
    Active = "Active",
    Overloaded = "Overloaded"
}
export {};
