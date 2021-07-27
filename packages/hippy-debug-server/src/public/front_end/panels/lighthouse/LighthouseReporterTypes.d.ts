import type * as SDK from '../../core/sdk/sdk.js';
export declare abstract class ReportRenderer {
    constructor(_dom: DOM);
    abstract renderReport(_report: ReportJSON, _container: Element): Element;
    setTemplateContext(_context: Element | Document): void;
}
export declare abstract class ReportUIFeatures {
    json: ReportJSON;
    _document: Document;
    constructor(_dom: DOM);
    setTemplateContext(_context: Element | Document): void;
    initFeatures(_report: ReportJSON): void;
    abstract addButton(_opts: {
        text: string;
        icon?: string;
        onClick: () => void;
    }): HTMLButtonElement;
    _resetUIState(): void;
    setBeforePrint(_beforePrint: (() => void) | null): void;
    setAfterPrint(_afterPrint: (() => void) | null): void;
}
export declare class CategoryRenderer {
    constructor(_dom: DOM, _detailsRenderer: DetailsRenderer);
}
export declare abstract class DetailsRenderer {
    constructor(_dom: DOM);
    abstract renderNode(_item: NodeDetailsJSON): Element;
}
export declare class LighthouseReportGenerator {
    generateReportHtml(_lhr: ReportJSON): string;
}
export interface AuditResultJSON {
    rawValue?: number | boolean;
    id: string;
    title: string;
    description: string;
    explanation?: string;
    errorMessage?: string;
    displayValue?: string | (string | number)[];
    scoreDisplayMode: string;
    error: boolean;
    score: number | null;
    details?: DetailsJSON;
}
export interface AuditJSON {
    id: string;
    score: number | null;
    weight: number;
    group?: string;
    result: AuditResultJSON;
}
export interface CategoryJSON {
    title: string;
    id: string;
    score: number | null;
    description?: string;
    manualDescription: string;
    auditRefs: AuditJSON[];
}
export interface GroupJSON {
    title: string;
    description?: string;
}
export interface ReportJSON {
    lighthouseVersion: string;
    userAgent: string;
    fetchTime: string;
    timing: {
        total: number;
    };
    requestedUrl: string;
    finalUrl: string;
    runWarnings?: string[];
    artifacts: {
        traces: {
            defaultPass: {
                traceEvents: Array<unknown>;
            };
        };
    };
    audits: {
        [x: string]: AuditResultJSON;
    };
    categories: {
        [x: string]: CategoryJSON;
    };
    categoryGroups: {
        [x: string]: GroupJSON;
    };
}
export interface DetailsJSON {
    type: string;
    value?: string | number;
    summary?: OpportunitySummary;
    granularity?: number;
    displayUnit?: string;
}
export interface RunnerResultArtifacts {
    traces: {
        defaultPass: {
            traceEvents: SDK.TracingManager.EventPayload[];
        };
    };
    settings: {
        throttlingMethod: string;
    };
}
export interface RunnerResult {
    lhr: ReportJSON;
    artifacts: RunnerResultArtifacts;
    report: string;
    stack: string;
    fatal: boolean;
    message?: string;
}
export interface NodeDetailsJSON {
    type: string;
    path?: string;
    selector?: string;
    snippet?: string;
}
export interface SourceLocationDetailsJSON {
    sourceUrl?: string;
    sourceLine?: string;
    sourceColumn?: string;
}
export interface OpportunitySummary {
    wastedMs?: number;
    wastedBytes?: number;
}
