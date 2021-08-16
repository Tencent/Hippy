import * as Common from '../../core/common/common.js';
import type * as ReportRenderer from './LighthouseReporterTypes.js';
export declare class ProtocolService extends Common.ObjectWrapper.ObjectWrapper {
    private rawConnection?;
    private lighthouseWorkerPromise?;
    private lighthouseMessageUpdateCallback?;
    attach(): Promise<void>;
    getLocales(): readonly string[];
    startLighthouse(auditURL: string, categoryIDs: string[], flags: Object): Promise<ReportRenderer.RunnerResult>;
    detach(): Promise<void>;
    registerStatusCallback(callback: (arg0: string) => void): void;
    private dispatchProtocolMessage;
    private initWorker;
    private ensureWorkerExists;
    private sendProtocolMessage;
    private sendWithoutResponse;
    private sendWithResponse;
}
