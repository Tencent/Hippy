import * as SDK from '../../../../core/sdk/sdk.js';
import * as Bindings from '../../../../models/bindings/bindings.js';
import * as Workspace from '../../../../models/workspace/workspace.js';
import * as SourceFrame from '../source_frame/source_frame.js';
import type * as Protocol from '../../../../generated/protocol.js';
export declare class Performance {
    _helper: Helper;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): Performance;
    reset(): void;
    _appendLegacyCPUProfile(profile: SDK.CPUProfileDataModel.CPUProfileDataModel): void;
    appendCPUProfile(profile: SDK.CPUProfileDataModel.CPUProfileDataModel): void;
}
export declare class Memory {
    _helper: Helper;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): Memory;
    reset(): void;
    appendHeapProfile(profile: Protocol.HeapProfiler.SamplingHeapProfile, target: SDK.Target.Target | null): void;
}
export declare class Helper {
    _type: string;
    _locationPool: Bindings.LiveLocation.LiveLocationPool;
    _updateTimer: number | null;
    _lineData: Map<SDK.Target.Target | null, Map<string | number, Map<number, number>>>;
    constructor(type: string);
    reset(): void;
    addLineData(target: SDK.Target.Target | null, scriptIdOrUrl: string | number, line: number, data: number): void;
    scheduleUpdate(): void;
    _doUpdate(): void;
}
export declare class Presentation {
    _type: string;
    _time: number;
    _uiLocation: Workspace.UISourceCode.UILocation | null;
    constructor(rawLocation: SDK.DebuggerModel.Location, type: string, time: number, locationPool: Bindings.LiveLocation.LiveLocationPool);
    updateLocation(liveLocation: Bindings.LiveLocation.LiveLocation): Promise<void>;
}
export declare class LineDecorator implements SourceFrame.SourceFrame.LineDecorator {
    static instance(opts?: {
        forceNew: boolean | null;
    }): LineDecorator;
    decorate(uiSourceCode: Workspace.UISourceCode.UISourceCode, textEditor: SourceFrame.SourcesTextEditor.SourcesTextEditor, type: string): void;
    _createElement(type: string, value: number): Element;
}
