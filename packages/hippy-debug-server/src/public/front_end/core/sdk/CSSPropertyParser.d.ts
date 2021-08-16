/**
 * Extracts information about font variation settings assuming
 * value is valid according to the spec: https://drafts.csswg.org/css-fonts-4/#font-variation-settings-def
 */
export declare function parseFontVariationSettings(value: string): {
    tag: string;
    value: number;
}[];
/**
 * Extracts font families assuming the value is valid according to
 * the spec: https://drafts.csswg.org/css-fonts-4/#font-family-prop
 */
export declare function parseFontFamily(value: string): string[];
/**
 * Splits a list of values by comma and trims parts
 */
export declare function splitByComma(value: string): string[];
export declare function stripComments(value: string): string;
