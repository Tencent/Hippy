import { VBox } from './Widget.js';
export declare class RootView extends VBox {
    _window?: (Window & typeof globalThis) | null;
    constructor();
    attachToDocument(document: Document): void;
    doResize(): void;
}
