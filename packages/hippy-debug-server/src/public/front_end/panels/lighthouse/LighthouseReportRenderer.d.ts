import type * as ReportRenderer from './LighthouseReporterTypes.js';
export declare class LighthouseReportRenderer extends self.ReportRenderer {
    constructor(dom: DOM);
    static addViewTraceButton(el: Element, reportUIFeatures: ReportRenderer.ReportUIFeatures, artifacts?: ReportRenderer.RunnerResultArtifacts): void;
    static linkifyNodeDetails(el: Element): Promise<void>;
    static linkifySourceLocationDetails(el: Element): Promise<void>;
    static handleDarkMode(el: Element): void;
}
export declare class LighthouseReportUIFeatures extends self.ReportUIFeatures {
    _beforePrint: (() => void) | null;
    _afterPrint: (() => void) | null;
    constructor(dom: DOM);
    setBeforePrint(beforePrint: (() => void) | null): void;
    setAfterPrint(afterPrint: (() => void) | null): void;
    /**
     * Returns the html that recreates this report.
     */
    getReportHtml(): string;
    /**
     * Downloads a file (blob) using the system dialog prompt.
     */
    _saveFile(blob: Blob | File): Promise<void>;
    _print(): Promise<void>;
    getDocument(): Document;
    resetUIState(): void;
}
