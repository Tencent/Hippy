import type * as SDK from '../../../../core/sdk/sdk.js';
import * as UI from '../../legacy.js';
export declare class FilmStripView extends UI.Widget.HBox {
    _statusLabel: HTMLElement;
    _zeroTime: number;
    _spanTime: number;
    _model: SDK.FilmStripModel.FilmStripModel;
    _mode?: string;
    constructor();
    static _setImageData(imageElement: HTMLImageElement, data: string | null): void;
    setMode(mode: string): void;
    setModel(filmStripModel: SDK.FilmStripModel.FilmStripModel, zeroTime: number, spanTime: number): void;
    createFrameElement(frame: SDK.FilmStripModel.Frame): Promise<Element>;
    frameByTime(time: number): SDK.FilmStripModel.Frame;
    update(): void;
    onResize(): void;
    _onMouseEvent(eventName: string | symbol, timestamp: number): void;
    _onDoubleClick(filmStripFrame: SDK.FilmStripModel.Frame): void;
    reset(): void;
    setStatusText(text: string): void;
}
export declare enum Events {
    FrameSelected = "FrameSelected",
    FrameEnter = "FrameEnter",
    FrameExit = "FrameExit"
}
export declare const Modes: {
    TimeBased: string;
    FrameBased: string;
};
export declare class Dialog {
    _fragment: UI.Fragment.Fragment;
    _widget: UI.XWidget.XWidget;
    _frames: SDK.FilmStripModel.Frame[];
    _index: number;
    _zeroTime: number;
    _dialog: UI.Dialog.Dialog | null;
    constructor(filmStripFrame: SDK.FilmStripModel.Frame, zeroTime?: number);
    _resize(): void;
    _keyDown(event: Event): void;
    _onPrevFrame(): void;
    _onNextFrame(): void;
    _onFirstFrame(): void;
    _onLastFrame(): void;
    _render(): Promise<void>;
}
