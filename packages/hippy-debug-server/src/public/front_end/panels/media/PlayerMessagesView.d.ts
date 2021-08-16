import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
declare const enum MessageLevelBitfield {
    Error = 1,
    Warning = 2,
    Info = 4,
    Debug = 8,
    Default = 7,
    All = 15,
    Custom = 0
}
interface SelectableLevel {
    title: string;
    value: MessageLevelBitfield;
    stringValue: string;
    selectable?: boolean;
    overwrite?: boolean;
}
declare class MessageLevelSelector extends Common.ObjectWrapper.ObjectWrapper implements UI.SoftDropDown.Delegate<SelectableLevel> {
    _items: UI.ListModel.ListModel<SelectableLevel>;
    _view: PlayerMessagesView;
    _itemMap: Map<number, SelectableLevel>;
    _hiddenLevels: string[];
    _bitFieldValue: MessageLevelBitfield;
    _savedBitFieldValue: MessageLevelBitfield;
    _defaultTitle: Common.UIString.LocalizedString;
    _customTitle: Common.UIString.LocalizedString;
    _allTitle: Common.UIString.LocalizedString;
    elementsForItems: WeakMap<SelectableLevel, HTMLElement>;
    constructor(items: UI.ListModel.ListModel<SelectableLevel>, view: PlayerMessagesView);
    defaultTitle(): Common.UIString.LocalizedString;
    setDefault(dropdown: UI.SoftDropDown.SoftDropDown<SelectableLevel>): void;
    populate(): void;
    _updateCheckMarks(): void;
    titleFor(item: SelectableLevel): string;
    createElementForItem(item: SelectableLevel): Element;
    isItemSelectable(_item: SelectableLevel): boolean;
    itemSelected(_item: SelectableLevel | null): void;
    highlightedItemChanged(_from: SelectableLevel | null, _to: SelectableLevel | null, _fromElement: Element | null, _toElement: Element | null): void;
}
export declare class PlayerMessagesView extends UI.Widget.VBox {
    _headerPanel: HTMLElement;
    _bodyPanel: HTMLElement;
    _messageLevelSelector?: MessageLevelSelector;
    constructor();
    _buildToolbar(): void;
    _createDropdown(): UI.Toolbar.ToolbarItem;
    _createFilterInput(): UI.Toolbar.ToolbarInput;
    regenerateMessageDisplayCss(hiddenLevels: string[]): void;
    _matchesHiddenLevels(element: Element, hiddenLevels: string[]): boolean;
    _filterByString(userStringData: {
        data: string;
    }): void;
    addMessage(message: Protocol.Media.PlayerMessage): void;
}
export {};
