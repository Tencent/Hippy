import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { LighthouseController } from './LighthouseController.js';
export declare class StatusView {
    _controller: LighthouseController;
    _statusView: Element | null;
    _statusHeader: Element | null;
    _progressWrapper: Element | null;
    _progressBar: Element | null;
    _statusText: Element | null;
    _cancelButton: HTMLButtonElement | null;
    _inspectedURL: string;
    _textChangedAt: number;
    _fastFactsQueued: Common.UIString.LocalizedString[];
    _currentPhase: StatusPhase | null;
    _scheduledTextChangeTimeout: number | null;
    _scheduledFastFactTimeout: number | null;
    _dialog: UI.Dialog.Dialog;
    constructor(controller: LighthouseController);
    _render(): void;
    _reset(): void;
    show(dialogRenderElement: Element): void;
    _renderStatusHeader(statusHeader?: string): void;
    hide(): void;
    setInspectedURL(url?: string): void;
    updateStatus(message: string | null): void;
    _cancel(): void;
    _getMessageForPhase(phase: StatusPhase): string;
    _getPhaseForMessage(message: string): StatusPhase | null;
    _resetProgressBarClasses(): void;
    _scheduleFastFactCheck(): void;
    _updateFastFactIfNecessary(): void;
    _commitTextChange(text: string): void;
    _scheduleTextChange(text: string): void;
    renderBugReport(err: Error): void;
    renderText(statusHeader: string, text: string): void;
    toggleCancelButton(show: boolean): void;
    _renderBugReportBody(err: Error, auditURL: string): void;
}
export declare const fastFactRotationInterval = 6000;
export declare const minimumTextVisibilityDuration = 3000;
export interface StatusPhase {
    id: string;
    progressBarClass: string;
    message: () => Common.UIString.LocalizedString;
    statusMessagePrefix: string;
}
export declare const StatusPhases: StatusPhase[];
