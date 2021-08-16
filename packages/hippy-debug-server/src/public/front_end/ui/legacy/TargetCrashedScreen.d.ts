import { VBox } from './Widget.js';
export declare class TargetCrashedScreen extends VBox {
    _hideCallback: () => void;
    constructor(hideCallback: () => void);
    willHide(): void;
}
