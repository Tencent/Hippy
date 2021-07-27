export interface ComputedStylePropertyData {
    inherited: boolean;
    traceable: boolean;
    onNavigateToSource: (event?: Event) => void;
}
export declare class ComputedStyleProperty extends HTMLElement {
    private readonly shadow;
    private inherited;
    private traceable;
    private onNavigateToSource;
    set data(data: ComputedStylePropertyData);
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-computed-style-property': ComputedStyleProperty;
    }
}
