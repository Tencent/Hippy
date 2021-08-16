import { VBox } from './Widget.js';
export declare class RemoteDebuggingTerminatedScreen extends VBox {
    constructor(reason: string);
    static show(reason: string): void;
}
