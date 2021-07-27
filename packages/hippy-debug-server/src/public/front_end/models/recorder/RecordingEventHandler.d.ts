import * as SDK from '../../core/sdk/sdk.js';
import type { RecordingSession } from './RecordingSession.js';
import type { Condition, FrameContext, Step } from './Steps.js';
export declare class RecordingEventHandler {
    private target;
    private session;
    private resourceTreeModel;
    private lastStep;
    private lastStepTimeout;
    constructor(session: RecordingSession, target: SDK.Target.Target);
    getTarget(): string;
    getContextForFrame(frame: SDK.ResourceTreeModel.ResourceTreeFrame): FrameContext;
    bindingCalled(frameId: string, step: Step): void;
    appendStep(step: Step): Promise<void>;
    addConditionToLastStep(condition: Condition): void;
    targetDestroyed(): void;
    targetInfoChanged(url: string): void;
}
