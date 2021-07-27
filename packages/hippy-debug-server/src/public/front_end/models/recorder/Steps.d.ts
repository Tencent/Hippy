export declare type Selector = string & {
    __brand: 'selector';
};
export interface WaitForNavigationCondition {
    type: 'waitForNavigation';
    expectedUrl: string;
}
export declare type Condition = WaitForNavigationCondition;
export interface FrameContext {
    path: number[];
    target: string;
}
export interface StepWithFrameContext {
    context: FrameContext;
}
export interface ClickStep extends StepWithFrameContext, StepWithCondition {
    type: 'click';
    selector: Selector;
}
export interface NetworkConditions {
    download: number;
    upload: number;
    latency: number;
}
export interface EmulateNetworkConditionsStep {
    type: 'emulateNetworkConditions';
    conditions: NetworkConditions;
}
export interface ChangeStep extends StepWithFrameContext, StepWithCondition {
    type: 'change';
    selector: Selector;
    value: string;
}
export interface SubmitStep extends StepWithFrameContext, StepWithCondition {
    type: 'submit';
    selector: Selector;
}
export interface StepWithCondition {
    condition?: Condition;
}
export declare type Key = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'Power' | 'Eject' | 'Abort' | 'Help' | 'Backspace' | 'Tab' | 'Numpad5' | 'NumpadEnter' | 'Enter' | '\r' | '\n' | 'ShiftLeft' | 'ShiftRight' | 'ControlLeft' | 'ControlRight' | 'AltLeft' | 'AltRight' | 'Pause' | 'CapsLock' | 'Escape' | 'Convert' | 'NonConvert' | 'Space' | 'Numpad9' | 'PageUp' | 'Numpad3' | 'PageDown' | 'End' | 'Numpad1' | 'Home' | 'Numpad7' | 'ArrowLeft' | 'Numpad4' | 'Numpad8' | 'ArrowUp' | 'ArrowRight' | 'Numpad6' | 'Numpad2' | 'ArrowDown' | 'Select' | 'Open' | 'PrintScreen' | 'Insert' | 'Numpad0' | 'Delete' | 'NumpadDecimal' | 'Digit0' | 'Digit1' | 'Digit2' | 'Digit3' | 'Digit4' | 'Digit5' | 'Digit6' | 'Digit7' | 'Digit8' | 'Digit9' | 'KeyA' | 'KeyB' | 'KeyC' | 'KeyD' | 'KeyE' | 'KeyF' | 'KeyG' | 'KeyH' | 'KeyI' | 'KeyJ' | 'KeyK' | 'KeyL' | 'KeyM' | 'KeyN' | 'KeyO' | 'KeyP' | 'KeyQ' | 'KeyR' | 'KeyS' | 'KeyT' | 'KeyU' | 'KeyV' | 'KeyW' | 'KeyX' | 'KeyY' | 'KeyZ' | 'MetaLeft' | 'MetaRight' | 'ContextMenu' | 'NumpadMultiply' | 'NumpadAdd' | 'NumpadSubtract' | 'NumpadDivide' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'F9' | 'F10' | 'F11' | 'F12' | 'F13' | 'F14' | 'F15' | 'F16' | 'F17' | 'F18' | 'F19' | 'F20' | 'F21' | 'F22' | 'F23' | 'F24' | 'NumLock' | 'ScrollLock' | 'AudioVolumeMute' | 'AudioVolumeDown' | 'AudioVolumeUp' | 'MediaTrackNext' | 'MediaTrackPrevious' | 'MediaStop' | 'MediaPlayPause' | 'Semicolon' | 'Equal' | 'NumpadEqual' | 'Comma' | 'Minus' | 'Period' | 'Slash' | 'Backquote' | 'BracketLeft' | 'Backslash' | 'BracketRight' | 'Quote' | 'AltGraph' | 'Props' | 'Cancel' | 'Clear' | 'Shift' | 'Control' | 'Alt' | 'Accept' | 'ModeChange' | ' ' | 'Print' | 'Execute' | '\u0000' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'Meta' | '*' | '+' | '-' | '/' | ';' | '=' | ',' | '.' | '`' | '[' | '\\' | ']' | '\'' | 'Attn' | 'CrSel' | 'ExSel' | 'EraseEof' | 'Play' | 'ZoomOut' | ')' | '!' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | ':' | '<' | '_' | '>' | '?' | '~' | '{' | '|' | '}' | '"' | 'SoftLeft' | 'SoftRight' | 'Camera' | 'Call' | 'EndCall' | 'VolumeDown' | 'VolumeUp';
export interface KeyDownStep extends StepWithFrameContext, StepWithCondition {
    type: 'keydown';
    key: Key;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}
export interface KeyUpStep extends StepWithFrameContext, StepWithCondition {
    type: 'keyup';
    key: Key;
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
}
export interface ViewportStep {
    type: 'viewport';
    width: number;
    height: number;
}
export interface CloseStep {
    type: 'close';
    target: string;
}
export declare type Step = ClickStep | ChangeStep | SubmitStep | EmulateNetworkConditionsStep | KeyDownStep | KeyUpStep | CloseStep | ViewportStep;
export interface UserFlowSection {
    screenshot: string;
    title: string;
    url: string;
    steps: Step[];
    networkConditions?: NetworkConditions;
}
export interface UserFlow {
    title: string;
    description?: string;
    sections: UserFlowSection[];
}
export declare function assertAllStepTypesAreHandled(s: never): never;
export declare function createClickStep(context: FrameContext, selector: Selector): ClickStep;
export declare function createSubmitStep(context: FrameContext, selector: Selector): SubmitStep;
export declare function createChangeStep(context: FrameContext, selector: Selector, value: string): ChangeStep;
export declare function createEmulateNetworkConditionsStep(conditions: NetworkConditions): EmulateNetworkConditionsStep;
export declare function createKeyDownStep(context: FrameContext, key: Key): KeyDownStep;
export declare function createKeyUpStep(context: FrameContext, key: Key): KeyUpStep;
export declare function createViewportStep(viewport: {
    clientWidth: number;
    clientHeight: number;
}): ViewportStep;
export declare function hasFrameContext(step: Step): step is ClickStep | ChangeStep | SubmitStep | KeyDownStep | KeyUpStep;
export declare function hasCondition(step: Step): step is ClickStep | ChangeStep | SubmitStep | KeyDownStep | KeyUpStep;
