export declare const FontPropertiesRegex: RegExp;
export declare const FontFamilyRegex: RegExp;
export declare const GlobalValues: string[];
export declare const FontSizeStaticParams: {
    regex: RegExp;
    units: Set<string>;
    keyValues: Set<string>;
    rangeMap: Map<string, {
        min: number;
        max: number;
        step: number;
    }>;
    defaultUnit: string;
};
export declare const LineHeightStaticParams: {
    regex: RegExp;
    units: Set<string>;
    keyValues: Set<string>;
    rangeMap: Map<string, {
        min: number;
        max: number;
        step: number;
    }>;
    defaultUnit: string;
};
export declare const FontWeightStaticParams: {
    regex: RegExp;
    units: null;
    keyValues: Set<string>;
    rangeMap: Map<string, {
        min: number;
        max: number;
        step: number;
    }>;
    defaultUnit: null;
};
export declare const LetterSpacingStaticParams: {
    regex: RegExp;
    units: Set<string>;
    keyValues: Set<string>;
    rangeMap: Map<string, {
        min: number;
        max: number;
        step: number;
    }>;
    defaultUnit: string;
};
export declare const SystemFonts: string[];
export declare const GenericFonts: string[];
export declare function generateComputedFontArray(): Promise<string[]>;
export declare function getRoundingPrecision(step: number): 0 | 1 | 2 | 3;
