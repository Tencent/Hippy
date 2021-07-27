/**
 * @interface
 */
export interface Runnable {
    run(): Promise<void>;
}
export declare function registerLateInitializationRunnable(runnable: () => Runnable): void;
export declare function lateInitializationRunnables(): (() => Runnable)[];
export declare function registerEarlyInitializationRunnable(runnable: () => Runnable): void;
export declare function earlyInitializationRunnables(): (() => Runnable)[];
