export interface IconWithTextData {
    iconName: string;
    iconColor?: string;
    iconWidth?: string;
    iconHeight?: string;
    text?: string;
}
export interface IconButtonData {
    clickHandler?: () => void;
    groups: IconWithTextData[];
    leadingText?: string;
    trailingText?: string;
}
export declare class IconButton extends HTMLElement {
    private readonly shadow;
    private clickHandler;
    private groups;
    private leadingText;
    private trailingText;
    set data(data: IconButtonData);
    setTexts(texts: (string | undefined)[]): void;
    private onClickHandler;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'icon-button': IconButton;
    }
}
