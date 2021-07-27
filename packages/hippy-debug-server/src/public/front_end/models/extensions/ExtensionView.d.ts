import * as UI from '../../ui/legacy/legacy.js';
import type { ExtensionServer } from './ExtensionServer.js';
export declare class ExtensionView extends UI.Widget.Widget {
    _server: ExtensionServer;
    _id: string;
    _iframe: HTMLIFrameElement;
    _frameIndex?: number;
    constructor(server: ExtensionServer, id: string, src: string, className: string);
    wasShown(): void;
    willHide(): void;
    _onLoad(): void;
}
export declare class ExtensionNotifierView extends UI.Widget.VBox {
    _server: ExtensionServer;
    _id: string;
    constructor(server: ExtensionServer, id: string);
    wasShown(): void;
    willHide(): void;
}
