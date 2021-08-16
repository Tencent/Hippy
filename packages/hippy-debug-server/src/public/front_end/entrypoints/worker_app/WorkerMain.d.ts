import * as Common from '../../core/common/common.js';
export declare class WorkerMainImpl extends Common.ObjectWrapper.ObjectWrapper implements Common.Runnable.Runnable {
    static instance(opts?: {
        forceNew: boolean | null;
    }): WorkerMainImpl;
    run(): Promise<void>;
}
