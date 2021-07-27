export declare class CSSMetadata {
    _values: string[];
    _longhands: Map<string, string[]>;
    _shorthands: Map<string, string[]>;
    _inherited: Set<string>;
    _svgProperties: Set<string>;
    _propertyValues: Map<string, string[]>;
    _aliasesFor: Map<string, string>;
    _valuesSet: Set<string>;
    _nameValuePresets: string[];
    _nameValuePresetsIncludingSVG: string[];
    constructor(properties: CSSPropertyDefinition[], aliasesFor: Map<string, string>);
    static _sortPrefixesToEnd(a: string, b: string): 1 | -1 | 0;
    allProperties(): string[];
    nameValuePresets(includeSVG?: boolean): string[];
    isSVGProperty(name: string): boolean;
    longhands(shorthand: string): string[] | null;
    shorthands(longhand: string): string[] | null;
    isColorAwareProperty(propertyName: string): boolean;
    isFontFamilyProperty(propertyName: string): boolean;
    isAngleAwareProperty(propertyName: string): boolean;
    isGridAreaDefiningProperty(propertyName: string): boolean;
    isLengthProperty(propertyName: string): boolean;
    isBezierAwareProperty(propertyName: string): boolean;
    isFontAwareProperty(propertyName: string): boolean;
    isCustomProperty(propertyName: string): boolean;
    isShadowProperty(propertyName: string): boolean;
    isStringProperty(propertyName: string): boolean;
    canonicalPropertyName(name: string): string;
    isCSSPropertyName(propertyName: string): boolean;
    isPropertyInherited(propertyName: string): boolean;
    _specificPropertyValues(propertyName: string): string[];
    propertyValues(propertyName: string): string[];
    propertyUsageWeight(property: string): number;
    getValuePreset(key: string, value: string): {
        text: string;
        startColumn: number;
        endColumn: number;
    } | null;
}
export declare const VariableRegex: RegExp;
export declare const CustomVariableRegex: RegExp;
export declare const URLRegex: RegExp;
/**
 * Matches an instance of a grid area 'row' definition.
 * 'grid-template-areas', e.g.
 *    "a a ."
 *
 * 'grid', 'grid-template', e.g.
 *    [track-name] "a a ." minmax(50px, auto) [track-name]
 */
export declare const GridAreaRowRegex: RegExp;
export declare function cssMetadata(): CSSMetadata;
export interface CSSPropertyDefinition {
    name: string;
    longhands: string[] | null;
    inherited: boolean | null;
    svg: boolean | null;
}
