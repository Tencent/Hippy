export declare type Step = {
    type: 'click';
    selector: string;
} | {
    type: 'submit';
    selector: string;
} | {
    type: 'change';
    selector: string;
    value: string;
} | {
    type: 'keydown';
    altKey: boolean;
    ctrlKey: boolean;
    key: string;
    metaKey: boolean;
    shiftKey: boolean;
} | {
    type: 'keyup';
    altKey: boolean;
    ctrlKey: boolean;
    key: string;
    metaKey: boolean;
    shiftKey: boolean;
};
declare global {
    interface HTMLElement {
        role: string;
        ariaLabel: string | null;
    }
    interface SubmitEvent extends Event {
        submitter: HTMLElement;
    }
    interface HTMLElementEventMap {
        'submit': SubmitEvent;
    }
    interface Window {
        _recorderEventListener?: (event: Event) => void;
        addStep(step: string): void;
    }
}
export interface Exports {
    createStepFromEvent?: (event: Event, target: EventTarget | null, isTrusted: boolean) => Step | undefined;
    getSelector?: (node: Node) => string;
    teardown?: () => void;
}
/**
 * This function is special because it gets injected into the target page.
 * All runtime code should be defined withing the function so that it can
 * be serialised.
 */
export declare function setupRecordingClient(bindings: {
    getAccessibleName: (node: Node) => string;
    getAccessibleRole: (node: Node) => string;
}, debug?: boolean, allowUntrustedEvents?: boolean, exports?: Exports): void;
