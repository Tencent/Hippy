import * as LitHtml from '../../third_party/lit-html/lit-html.js';
export interface Static {
    value: unknown;
    $$static$$: true;
}
declare type TemplateValues = Static | unknown;
declare type FlattenedTemplateValues = {
    strings: TemplateStringsArray;
    valueMap: boolean[];
};
export declare function flattenTemplate(strings: TemplateStringsArray, ...values: TemplateValues[]): FlattenedTemplateValues;
export declare function html(strings: TemplateStringsArray, ...values: TemplateValues[]): LitHtml.TemplateResult;
export declare function literal(value: TemplateStringsArray): Static;
export {};
