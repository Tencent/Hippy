import type { Event, ObjectSnapshot } from './TracingModel.js';
import { TracingModel } from './TracingModel.js';
export declare class FilmStripModel {
    _frames: Frame[];
    _zeroTime: number;
    _spanTime: number;
    constructor(tracingModel: TracingModel, zeroTime?: number);
    reset(tracingModel: TracingModel, zeroTime?: number): void;
    frames(): Frame[];
    zeroTime(): number;
    spanTime(): number;
    frameByTimestamp(timestamp: number): Frame | null;
}
export declare class Frame {
    _model: FilmStripModel;
    timestamp: number;
    index: number;
    _imageData: string | null;
    _snapshot: ObjectSnapshot | null;
    constructor(model: FilmStripModel, timestamp: number, index: number);
    static _fromEvent(model: FilmStripModel, event: Event, index: number): Frame;
    static _fromSnapshot(model: FilmStripModel, snapshot: ObjectSnapshot, index: number): Frame;
    model(): FilmStripModel;
    imageDataPromise(): Promise<string | null>;
}
