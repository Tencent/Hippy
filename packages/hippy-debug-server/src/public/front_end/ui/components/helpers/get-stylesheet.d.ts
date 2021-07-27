/**
 * Helper for importing a legacy stylesheet into a component.
 *
 * Given a path to a stylesheet, it returns a CSSStyleSheet that can then be
 * adopted by your component.
 */
export declare function getStyleSheets(path: string, { enableLegacyPatching }?: {
    enableLegacyPatching: false;
}): CSSStyleSheet[];
export declare const CSS_RESOURCES_TO_LOAD_INTO_RUNTIME: string[];
