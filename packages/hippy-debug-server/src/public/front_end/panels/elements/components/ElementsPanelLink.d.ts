export interface ElementsPanelLinkData {
    onElementRevealIconClick: (event?: Event) => void;
    onElementRevealIconMouseEnter: (event?: Event) => void;
    onElementRevealIconMouseLeave: (event?: Event) => void;
}
export declare class ElementsPanelLink extends HTMLElement {
    private readonly shadow;
    private onElementRevealIconClick;
    private onElementRevealIconMouseEnter;
    private onElementRevealIconMouseLeave;
    set data(data: ElementsPanelLinkData);
    private update;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-elements-panel-link': ElementsPanelLink;
    }
}
