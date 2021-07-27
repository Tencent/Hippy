export declare type FinishCallback = (err: Error) => void;
export declare class Throttler {
    _timeout: number;
    _isRunningProcess: boolean;
    _asSoonAsPossible: boolean;
    _process: (() => (Promise<unknown>)) | null;
    _lastCompleteTime: number;
    _schedulePromise: Promise<unknown>;
    _scheduleResolve: (value: unknown) => void;
    _processTimeout?: number;
    constructor(timeout: number);
    _processCompleted(): void;
    _processCompletedForTests(): void;
    _onTimeout(): void;
    schedule(process: () => (Promise<unknown>), asSoonAsPossible?: boolean): Promise<void>;
    _innerSchedule(forceTimerUpdate: boolean): void;
    _clearTimeout(timeoutId: number): void;
    _setTimeout(operation: () => void, timeout: number): number;
    _getTime(): number;
}
