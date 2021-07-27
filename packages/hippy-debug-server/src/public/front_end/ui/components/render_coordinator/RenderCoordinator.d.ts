/**
 * Components don't orchestrate their DOM updates in a wider context
 * (i.e. the host frame's document), which leads to interleaved reading
 * and writing of layout-centric values, e.g. clientHeight, scrollTop etc.
 *
 * This helper to ensure that we do reads, writes, and scrolls at the
 * correct point in the frame lifecycle. It groups reads to the start of a
 * frame, where we can assume layout-centric values are available on the
 * basis of the last completed frame, and then it runs all writes
 * afterwards. In the event that a read / write / scroll callback contains
 * calls for more read / write / scroll calls, such calls will be scheduled
 * for the next available frame.
 */
interface CoordinatorCallback {
    (): unknown;
}
interface CoordinatorLogEntry {
    time: number;
    value: string;
}
export declare class RenderCoordinatorQueueEmptyEvent extends Event {
    constructor();
}
export declare class RenderCoordinatorNewFrameEvent extends Event {
    constructor();
}
export declare class RenderCoordinator extends EventTarget {
    static instance({ forceNew }?: {
        forceNew?: boolean | undefined;
    }): RenderCoordinator;
    observe: boolean;
    recordStorageLimit: number;
    observeOnlyNamed: boolean;
    private readonly logInternal;
    private readonly pendingWorkFrames;
    private readonly resolvers;
    private readonly rejectors;
    private readonly labels;
    private scheduledWorkId;
    done(): Promise<void>;
    read<T extends unknown>(callback: CoordinatorCallback): Promise<T>;
    read<T extends unknown>(label: string, callback: CoordinatorCallback): Promise<T>;
    write<T extends unknown>(callback: CoordinatorCallback): Promise<T>;
    write<T extends unknown>(label: string, callback: CoordinatorCallback): Promise<T>;
    takeRecords(): CoordinatorLogEntry[];
    /**
     * We offer a convenience function for scroll-based activity, but often triggering a scroll
     * requires a layout pass, thus it is better handled as a read activity, i.e. we wait until
     * the layout-triggering work has been completed then it should be possible to scroll without
     * first forcing layout.
     */
    scroll<T extends unknown>(callback: CoordinatorCallback): Promise<T>;
    scroll<T extends unknown>(label: string, callback: CoordinatorCallback): Promise<T>;
    private enqueueHandler;
    private handleWork;
    private scheduleWork;
    private rejectAll;
    private logIfEnabled;
}
export {};
