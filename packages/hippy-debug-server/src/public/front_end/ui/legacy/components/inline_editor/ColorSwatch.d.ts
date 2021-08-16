import * as Common from '../../../../core/common/common.js';
export declare class FormatChangedEvent extends Event {
    data: {
        format: string;
        text: string | null;
    };
    constructor(format: string, text: string | null);
}
export declare class ColorSwatch extends HTMLElement {
    private readonly shadow;
    private tooltip;
    private text;
    private color;
    private format;
    constructor();
    static isColorSwatch(element: Element): element is ColorSwatch;
    getColor(): Common.Color.Color | null;
    getFormat(): string | null;
    get anchorBox(): AnchorBox | null;
    /**
     * Render this swatch given a color object or text to be parsed as a color.
     * @param color The color object or string to use for this swatch.
     * @param formatOrUseUserSetting Either the format to be used as a string, or true to auto-detect the user-set format.
     * @param tooltip The tooltip to use on the swatch.
     */
    renderColor(color: Common.Color.Color | string, formatOrUseUserSetting?: string | boolean, tooltip?: string): void;
    private renderTextOnly;
    private render;
    private onClick;
    private consume;
    private toggleNextFormat;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-color-swatch': ColorSwatch;
    }
}
