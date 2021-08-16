import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class TimelineJSProfileProcessor {
    static generateTracingEventsFromCpuProfile(jsProfileModel: SDK.CPUProfileDataModel.CPUProfileDataModel, thread: SDK.TracingModel.Thread): SDK.TracingModel.Event[];
    static generateJSFrameEvents(events: SDK.TracingModel.Event[], config: {
        showAllEvents: boolean;
        showRuntimeCallStats: boolean;
        showNativeFunctions: boolean;
    }): SDK.TracingModel.Event[];
    static isNativeRuntimeFrame(frame: Protocol.Runtime.CallFrame): boolean;
    static nativeGroup(nativeName: string): string | null;
    static buildTraceProfileFromCpuProfile(profile: any, tid: number, injectPageEvent: boolean, name?: string | null): SDK.TracingManager.EventPayload[];
}
export declare namespace TimelineJSProfileProcessor {
    enum NativeGroups {
        Compile = "Compile",
        Parse = "Parse"
    }
}
