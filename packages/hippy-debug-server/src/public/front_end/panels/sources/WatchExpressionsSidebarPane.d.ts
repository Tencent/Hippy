import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class WatchExpressionsSidebarPane extends UI.ThrottledWidget.ThrottledWidget implements UI.ActionRegistration.ActionDelegate, UI.Toolbar.ItemsProvider, UI.ContextMenu.Provider {
    _watchExpressions: WatchExpression[];
    _emptyElement: HTMLElement;
    _watchExpressionsSetting: Common.Settings.Setting<any>;
    _addButton: UI.Toolbar.ToolbarButton;
    _refreshButton: UI.Toolbar.ToolbarButton;
    _treeOutline: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeOutline;
    _expandController: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController;
    _linkifier: Components.Linkifier.Linkifier;
    private constructor();
    static instance(): WatchExpressionsSidebarPane;
    toolbarItems(): UI.Toolbar.ToolbarItem[];
    focus(): void;
    hasExpressions(): boolean;
    _saveExpressions(): void;
    _addButtonClicked(): Promise<void>;
    doUpdate(): Promise<any>;
    _createWatchExpression(expression: string | null): WatchExpression;
    _watchExpressionUpdated(event: Common.EventTarget.EventTargetEvent): void;
    _contextMenu(event: MouseEvent): void;
    _populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, event: MouseEvent): void;
    _deleteAllButtonClicked(): void;
    _focusAndAddExpressionToWatch(expression: string): Promise<void>;
    handleAction(_context: UI.Context.Context, _actionId: string): boolean;
    appendApplicableItems(event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Object): void;
}
export declare class WatchExpression extends Common.ObjectWrapper.ObjectWrapper {
    _treeElement: UI.TreeOutline.TreeElement;
    _nameElement: Element;
    _valueElement: Element;
    _expression: string | null;
    _expandController: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController;
    _element: HTMLDivElement;
    _editing: boolean;
    _linkifier: Components.Linkifier.Linkifier;
    _textPrompt?: ObjectUI.ObjectPropertiesSection.ObjectPropertyPrompt;
    _result?: SDK.RemoteObject.RemoteObject | null;
    _preventClickTimeout?: number;
    constructor(expression: string | null, expandController: ObjectUI.ObjectPropertiesSection.ObjectPropertiesSectionsTreeExpandController, linkifier: Components.Linkifier.Linkifier);
    treeElement(): UI.TreeOutline.TreeElement;
    expression(): string | null;
    update(): void;
    startEditing(): void;
    isEditing(): boolean;
    _finishEditing(event: Event, canceled?: boolean): void;
    _dblClickOnWatchExpression(event: Event): void;
    _updateExpression(newExpression: string | null): void;
    _deleteWatchExpression(event: Event): void;
    _createWatchExpression(result?: SDK.RemoteObject.RemoteObject, exceptionDetails?: Protocol.Runtime.ExceptionDetails): void;
    _createWatchExpressionHeader(expressionValue?: SDK.RemoteObject.RemoteObject, exceptionDetails?: Protocol.Runtime.ExceptionDetails): Element;
    _createWatchExpressionTreeElement(expressionValue?: SDK.RemoteObject.RemoteObject, exceptionDetails?: Protocol.Runtime.ExceptionDetails): void;
    _onSectionClick(event: Event): void;
    _promptKeyDown(event: KeyboardEvent): void;
    _populateContextMenu(contextMenu: UI.ContextMenu.ContextMenu, event: Event): void;
    _copyValueButtonClicked(): void;
    static readonly _watchObjectGroupId = "watch-group";
}
export declare namespace WatchExpression {
    const Events: {
        ExpressionUpdated: symbol;
    };
}
