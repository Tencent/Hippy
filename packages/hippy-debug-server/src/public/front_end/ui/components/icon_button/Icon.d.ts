export interface IconWithPath {
    iconPath: string;
    color: string;
    width?: string;
    height?: string;
}
export interface IconWithName {
    iconName: string;
    color: string;
    width?: string;
    height?: string;
}
export declare type IconData = IconWithPath | IconWithName;
export declare class Icon extends HTMLElement {
    static litTagName: import("../../lit-html/static.js").Static;
    private readonly shadow;
    private iconPath;
    private color;
    private width;
    private height;
    private iconName?;
    set data(data: IconData);
    get data(): IconData;
    private getStyles;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-icon': Icon;
    }
}
