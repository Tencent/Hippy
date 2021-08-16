import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class ClassesPaneWidget extends UI.Widget.Widget {
    _input: HTMLElement;
    _classesContainer: HTMLElement;
    _prompt: ClassNamePrompt;
    _mutatingNodes: Set<SDK.DOMModel.DOMNode>;
    _pendingNodeClasses: Map<SDK.DOMModel.DOMNode, string>;
    _updateNodeThrottler: Common.Throttler.Throttler;
    _previousTarget: SDK.DOMModel.DOMNode | null;
    constructor();
    _splitTextIntoClasses(text: string): string[];
    _onKeyDown(event: KeyboardEvent): void;
    _onTextChanged(): void;
    _onDOMMutated(event: Common.EventTarget.EventTargetEvent): void;
    _onSelectedNodeChanged(event: Common.EventTarget.EventTargetEvent): void;
    wasShown(): void;
    _update(): void;
    _onClick(className: string, event: Event): void;
    _nodeClasses(node: SDK.DOMModel.DOMNode): Map<string, boolean>;
    _toggleClass(node: SDK.DOMModel.DOMNode, className: string, enabled: boolean): void;
    _installNodeClasses(node: SDK.DOMModel.DOMNode): void;
    _flushPendingClasses(): Promise<void>;
}
export declare class ButtonProvider implements UI.Toolbar.Provider {
    _button: UI.Toolbar.ToolbarToggle;
    _view: ClassesPaneWidget;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ButtonProvider;
    _clicked(): void;
    item(): UI.Toolbar.ToolbarItem;
}
export declare class ClassNamePrompt extends UI.TextPrompt.TextPrompt {
    _nodeClasses: (arg0: SDK.DOMModel.DOMNode) => Map<string, boolean>;
    _selectedFrameId: string | null;
    _classNamesPromise: Promise<string[]> | null;
    constructor(nodeClasses: (arg0: SDK.DOMModel.DOMNode) => Map<string, boolean>);
    _getClassNames(selectedNode: SDK.DOMModel.DOMNode): Promise<string[]>;
    _buildClassNameCompletions(expression: string, prefix: string, force?: boolean): Promise<UI.SuggestBox.Suggestions>;
}
