import type { Step, ClickStep, StepWithFrameContext, ChangeStep, SubmitStep, UserFlow, EmulateNetworkConditionsStep, KeyDownStep, KeyUpStep, CloseStep, ViewportStep } from './Steps.js';
export declare class RecordingScriptWriter {
    private indentation;
    private script;
    private currentIndentation;
    constructor(indentation: string);
    appendLineToScript(line: string): void;
    appendTarget(target: string): void;
    appendFrame(path: number[]): void;
    appendContext(step: StepWithFrameContext): void;
    appendClickStep(step: ClickStep): void;
    appendChangeStep(step: ChangeStep): void;
    appendSubmitStep(step: SubmitStep): void;
    appendEmulateNetworkConditionsStep(step: EmulateNetworkConditionsStep): void;
    appendKeyDownStep(step: KeyDownStep): void;
    appendKeyUpStep(step: KeyUpStep): void;
    appendCloseStep(_step: CloseStep): void;
    appendViewportStep(step: ViewportStep): void;
    appendStepType(step: Step): void;
    appendStep(step: Step): void;
    getCurrentScript(): string;
    getScript(recording: UserFlow): string;
}
