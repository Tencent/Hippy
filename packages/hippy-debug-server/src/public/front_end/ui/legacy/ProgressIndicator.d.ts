import type * as Common from '../../core/common/common.js';
export declare class ProgressIndicator implements Common.Progress.Progress {
    element: HTMLDivElement;
    _shadowRoot: ShadowRoot;
    _contentElement: Element;
    _labelElement: Element;
    _progressElement: HTMLProgressElement;
    _stopButton: Element;
    _isCanceled: boolean;
    _worked: number;
    _isDone?: boolean;
    constructor();
    show(parent: Element): void;
    done(): void;
    cancel(): void;
    isCanceled(): boolean;
    setTitle(title: string): void;
    setTotalWork(totalWork: number): void;
    setWorked(worked: number, title?: string): void;
    worked(worked?: number): void;
}
