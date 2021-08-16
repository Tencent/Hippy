export declare class Progress {
    setTotalWork(totalWork: number): void;
    setTitle(title: string): void;
    setWorked(worked: number, title?: string): void;
    worked(worked?: number): void;
    done(): void;
    isCanceled(): boolean;
}
export declare class CompositeProgress {
    _parent: Progress;
    _children: SubProgress[];
    _childrenDone: number;
    constructor(parent: Progress);
    _childDone(): void;
    createSubProgress(weight?: number): SubProgress;
    _update(): void;
}
export declare class SubProgress implements Progress {
    _composite: CompositeProgress;
    _weight: number;
    _worked: number;
    _totalWork: number;
    constructor(composite: CompositeProgress, weight?: number);
    isCanceled(): boolean;
    setTitle(title: string): void;
    done(): void;
    setTotalWork(totalWork: number): void;
    setWorked(worked: number, title?: string): void;
    worked(worked?: number): void;
}
export declare class ProgressProxy implements Progress {
    _delegate: Progress | null | undefined;
    _doneCallback: (() => void) | undefined;
    constructor(delegate?: Progress | null, doneCallback?: (() => void));
    isCanceled(): boolean;
    setTitle(title: string): void;
    done(): void;
    setTotalWork(totalWork: number): void;
    setWorked(worked: number, title?: string): void;
    worked(worked?: number): void;
}
