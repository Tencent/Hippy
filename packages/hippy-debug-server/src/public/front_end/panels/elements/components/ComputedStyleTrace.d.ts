export interface ComputedStyleTraceData {
    selector: string;
    active: boolean;
    onNavigateToSource: (event?: Event) => void;
}
export declare class ComputedStyleTrace extends HTMLElement {
    private readonly shadow;
    private selector;
    private active;
    private onNavigateToSource;
    set data(data: ComputedStyleTraceData);
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-computed-style-trace': ComputedStyleTrace;
    }
}
