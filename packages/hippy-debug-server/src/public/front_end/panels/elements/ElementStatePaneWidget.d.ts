import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ElementStatePaneWidget extends UI.Widget.Widget {
    _inputs: HTMLInputElement[];
    _inputStates: WeakMap<HTMLInputElement, string>;
    _cssModel?: SDK.CSSModel.CSSModel | null;
    constructor();
    _updateModel(cssModel: SDK.CSSModel.CSSModel | null): void;
    wasShown(): void;
    _update(): void;
}
export declare class ButtonProvider implements UI.Toolbar.Provider {
    _button: UI.Toolbar.ToolbarToggle;
    _view: ElementStatePaneWidget;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ButtonProvider;
    _clicked(): void;
    item(): UI.Toolbar.ToolbarItem;
}
