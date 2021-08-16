import { VBox } from './Widget.js';
export declare class EmptyWidget extends VBox {
    _contentElement: HTMLElement;
    _textElement: HTMLElement;
    constructor(text: string);
    appendParagraph(): Element;
    appendLink(link: string): HTMLElement;
    set text(text: string);
}
