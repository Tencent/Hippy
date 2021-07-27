import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class PaintProfilerModel extends SDKModel {
    _layerTreeAgent: ProtocolProxyApi.LayerTreeApi;
    constructor(target: Target);
    loadSnapshotFromFragments(tiles: Protocol.LayerTree.PictureTile[]): Promise<PaintProfilerSnapshot | null>;
    loadSnapshot(encodedPicture: Protocol.binary): Promise<PaintProfilerSnapshot | null>;
    makeSnapshot(layerId: Protocol.LayerTree.LayerId): Promise<PaintProfilerSnapshot | null>;
}
export declare class PaintProfilerSnapshot {
    _paintProfilerModel: PaintProfilerModel;
    _id: Protocol.LayerTree.SnapshotId;
    _refCount: number;
    constructor(paintProfilerModel: PaintProfilerModel, snapshotId: Protocol.LayerTree.SnapshotId);
    release(): void;
    addReference(): void;
    replay(scale?: number, fromStep?: number, toStep?: number): Promise<string | null>;
    profile(clipRect: Protocol.DOM.Rect | null): Promise<Protocol.LayerTree.PaintProfile[]>;
    commandLog(): Promise<PaintProfilerLogItem[] | null>;
}
export declare class PaintProfilerLogItem {
    method: string;
    params: RawPaintProfilerLogItemParams | null;
    commandIndex: number;
    constructor(rawEntry: RawPaintProfilerLogItem, commandIndex: number);
}
export declare type RawPaintProfilerLogItemParamValue = string | {
    [key: string]: RawPaintProfilerLogItemParamValue;
};
export declare type RawPaintProfilerLogItemParams = {
    [key: string]: RawPaintProfilerLogItemParamValue;
};
export interface SnapshotWithRect {
    rect: Protocol.DOM.Rect;
    snapshot: PaintProfilerSnapshot;
}
export interface PictureFragment {
    x: number;
    y: number;
    picture: string;
}
export interface RawPaintProfilerLogItem {
    method: string;
    params: RawPaintProfilerLogItemParams | null;
}
