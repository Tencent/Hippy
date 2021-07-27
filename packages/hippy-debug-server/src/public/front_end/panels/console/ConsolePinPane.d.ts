import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ConsolePinPane extends UI.ThrottledWidget.ThrottledWidget {
    _liveExpressionButton: UI.Toolbar.ToolbarButton;
    _pins: Set<ConsolePin>;
    _pinsSetting: Common.Settings.Setting<string[]>;
    constructor(liveExpressionButton: UI.Toolbar.ToolbarButton);
    willHide(): void;
    _savePins(): void;
    _contextMenuEventFired(event: Event): void;
    _removeAllPins(): void;
    _removePin(pin: ConsolePin): void;
    addPin(expression: string, userGesture?: boolean): void;
    _focusedPinAfterDeletion(deletedPin: ConsolePin): ConsolePin | null;
    doUpdate(): Promise<void>;
    _updatedForTest(): void;
}
export declare class ConsolePin extends Common.ObjectWrapper.ObjectWrapper {
    _pinElement: Element;
    _pinPreview: HTMLElement;
    _lastResult: SDK.RuntimeModel.EvaluationResult | null;
    _lastExecutionContext: SDK.RuntimeModel.ExecutionContext | null;
    _editor: UI.TextEditor.TextEditor | null;
    _committedExpression: string;
    _hovered: boolean;
    _lastNode: SDK.RemoteObject.RemoteObject | null;
    _editorPromise: Promise<UI.TextEditor.TextEditor>;
    private consolePinNumber;
    constructor(expression: string, pinPane: ConsolePinPane);
    setHovered(hovered: boolean): void;
    expression(): string;
    element(): Element;
    focus(): Promise<void>;
    appendToContextMenu(contextMenu: UI.ContextMenu.ContextMenu): void;
    updatePreview(): Promise<void>;
}
