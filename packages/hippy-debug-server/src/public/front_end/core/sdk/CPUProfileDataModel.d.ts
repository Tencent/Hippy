import type * as Protocol from '../../generated/protocol.js';
import { ProfileNode, ProfileTreeModel } from './ProfileTreeModel.js';
import type { Target } from './Target.js';
export declare class CPUProfileNode extends ProfileNode {
    id: number;
    self: number;
    positionTicks: Protocol.Profiler.PositionTickInfo[] | undefined;
    deoptReason: string | null;
    constructor(node: Protocol.Profiler.ProfileNode, sampleTime: number);
}
export declare class CPUProfileDataModel extends ProfileTreeModel {
    profileStartTime: number;
    profileEndTime: number;
    timestamps: number[];
    samples: number[] | undefined;
    lines: any;
    totalHitCount: number;
    profileHead: CPUProfileNode;
    _idToNode: Map<number, CPUProfileNode>;
    gcNode: CPUProfileNode;
    programNode?: ProfileNode;
    idleNode?: ProfileNode;
    _stackStartTimes?: Float64Array;
    _stackChildrenDuration?: Float64Array;
    constructor(profile: Protocol.Profiler.Profile, target: Target | null);
    _compatibilityConversionHeadToNodes(profile: Protocol.Profiler.Profile): void;
    _convertTimeDeltas(profile: Protocol.Profiler.Profile): number[];
    _translateProfileTree(nodes: Protocol.Profiler.ProfileNode[]): CPUProfileNode;
    _sortSamples(): void;
    _normalizeTimestamps(): void;
    _buildIdToNodeMap(): void;
    _extractMetaNodes(): void;
    _fixMissingSamples(): void;
    forEachFrame(openFrameCallback: (arg0: number, arg1: CPUProfileNode, arg2: number) => void, closeFrameCallback: (arg0: number, arg1: CPUProfileNode, arg2: number, arg3: number, arg4: number) => void, startTime?: number, stopTime?: number): void;
    nodeByIndex(index: number): CPUProfileNode | null;
}
