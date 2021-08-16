import * as UI from '../../ui/legacy/legacy.js';
export declare class RequestHTMLView extends UI.Widget.VBox {
    _dataURL: string;
    constructor(dataURL: string);
    wasShown(): void;
    willHide(): void;
    _createIFrame(): void;
}
