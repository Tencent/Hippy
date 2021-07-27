import * as UI from '../../ui/legacy/legacy.js';
export declare class AddSourceMapURLDialog extends UI.Widget.HBox {
    _input: HTMLInputElement;
    _dialog: UI.Dialog.Dialog;
    _callback: (arg0: string) => void;
    constructor(callback: (arg0: string) => void);
    show(): void;
    _done(value: string): void;
    _apply(): void;
    _onKeyDown(event: KeyboardEvent): void;
}
