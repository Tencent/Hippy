import { ObjectWrapper } from './Object.js';
export declare class Console extends ObjectWrapper {
    _messages: Message[];
    /**
     * Instantiable via the instance() factory below.
     */
    private constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): Console;
    addMessage(text: string, level: MessageLevel, show?: boolean): void;
    log(text: string): void;
    warn(text: string): void;
    error(text: string): void;
    messages(): Message[];
    show(): void;
    showPromise(): Promise<void>;
}
export declare enum Events {
    MessageAdded = "messageAdded"
}
export declare enum MessageLevel {
    Info = "info",
    Warning = "warning",
    Error = "error"
}
export declare class Message {
    text: string;
    level: MessageLevel;
    timestamp: number;
    show: boolean;
    constructor(text: string, level: MessageLevel, timestamp: number, show: boolean);
}
