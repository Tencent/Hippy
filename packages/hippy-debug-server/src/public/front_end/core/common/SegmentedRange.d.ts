export declare class Segment<T = any> {
    begin: number;
    end: number;
    data: T;
    constructor(begin: number, end: number, data: T);
    intersects(that: Segment): boolean;
}
export declare class SegmentedRange<T = any> {
    _segments: Segment[];
    _mergeCallback: ((arg0: Segment<T>, arg1: Segment<T>) => Segment<T> | null) | undefined;
    constructor(mergeCallback?: ((arg0: Segment<T>, arg1: Segment<T>) => Segment<T> | null));
    append(newSegment: Segment<T>): void;
    appendRange(that: SegmentedRange<T>): void;
    segments(): Segment<T>[];
    _tryMerge(first: Segment<T>, second: Segment<T>): Segment<T> | null;
}
