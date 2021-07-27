import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class PerformanceMetricsModel extends SDKModel {
    _agent: ProtocolProxyApi.PerformanceApi;
    _metricModes: Map<string, MetricMode>;
    _metricData: Map<string, {
        lastValue: (number | undefined);
        lastTimestamp: (number | undefined);
    }>;
    constructor(target: Target);
    enable(): Promise<Object>;
    disable(): Promise<Object>;
    requestMetrics(): Promise<{
        metrics: Map<string, number>;
        timestamp: number;
    }>;
}
declare const enum MetricMode {
    CumulativeTime = "CumulativeTime",
    CumulativeCount = "CumulativeCount"
}
export {};
