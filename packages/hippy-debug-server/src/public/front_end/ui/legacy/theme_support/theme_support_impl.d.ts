import * as Common from '../../../core/common/common.js';
export declare class ThemeSupport {
    _themeName: string;
    _themableProperties: Set<string>;
    _cachedThemePatches: Map<string, string>;
    _setting: Common.Settings.Setting<string>;
    _customSheets: Set<string>;
    _computedRoot: () => symbol | CSSStyleDeclaration;
    _injectingStyleSheet?: boolean;
    private constructor();
    static hasInstance(): boolean;
    static instance(opts?: {
        forceNew: boolean | null;
        setting: Common.Settings.Setting<string> | null;
    }): ThemeSupport;
    getComputedValue(variableName: string): string;
    hasTheme(): boolean;
    themeName(): string;
    injectHighlightStyleSheets(element: Element | ShadowRoot): void;
    /**
     * Note: this is a duplicate of the function in ui/utils. It exists here
     * so there is no circular dependency between ui/utils and theme_support.
     */
    _appendStyle(node: Node, cssFile: string, options?: {
        enableLegacyPatching: false;
    }): void;
    injectCustomStyleSheets(element: Element | ShadowRoot): void;
    isForcedColorsMode(): boolean;
    addCustomStylesheet(sheetText: string): void;
    applyTheme(document: Document): void;
    themeStyleSheet(id: string, text: string): string;
    _patchForTheme(id: string, styleSheet: CSSStyleSheet): string;
    /**
     * Theming API is primarily targeted at making dark theme look good.
     * - If rule has ".-theme-preserve" in selector, it won't be affected.
     * - One can create specializations for dark themes via body.-theme-with-dark-background selector in host context.
     */
    _patchProperty(selectorText: string, style: CSSStyleDeclaration, name: string, output: string[]): void;
    patchColorText(text: string, colorUsage: number): string;
    patchColor(color: Common.Color.Color, colorUsage: number): Common.Color.Color;
    _patchHSLA(hsla: number[], colorUsage: number): void;
}
export declare namespace ThemeSupport {
    enum ColorUsage {
        Unknown = 0,
        Foreground = 1,
        Background = 2
    }
}
