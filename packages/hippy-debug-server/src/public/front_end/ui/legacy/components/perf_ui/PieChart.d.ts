export interface Slice {
    value: number;
    color: string;
    title: string;
}
export interface PieChartData {
    chartName: string;
    size: number;
    formatter: (value: number) => string;
    showLegend: boolean;
    total: number;
    slices: Slice[];
}
export declare class PieChart extends HTMLElement {
    private readonly shadow;
    private chartName;
    private size;
    private formatter;
    private showLegend;
    private total;
    private slices;
    private totalSelected;
    private sliceSelected;
    private readonly innerR;
    private lastAngle;
    set data(data: PieChartData);
    private render;
    private onSliceClicked;
    private selectSlice;
    private selectTotal;
    private selectAndFocusTotal;
    private selectAndFocusSlice;
    private focusNextElement;
    private focusPreviousElement;
    private onKeyDown;
    private getPathStringForSlice;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-perf-piechart': PieChart;
    }
}
