import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class AudioContextSelector extends Common.ObjectWrapper.ObjectWrapper implements UI.SoftDropDown.Delegate<Protocol.WebAudio.BaseAudioContext> {
    _placeholderText: Platform.UIString.LocalizedString;
    _items: UI.ListModel.ListModel<Protocol.WebAudio.BaseAudioContext>;
    _dropDown: UI.SoftDropDown.SoftDropDown<Protocol.WebAudio.BaseAudioContext>;
    _toolbarItem: UI.Toolbar.ToolbarItem;
    _selectedContext: Protocol.WebAudio.BaseAudioContext | null;
    constructor();
    _onListItemReplaced(): void;
    contextCreated(event: Common.EventTarget.EventTargetEvent): void;
    contextDestroyed(event: Common.EventTarget.EventTargetEvent): void;
    contextChanged(event: Common.EventTarget.EventTargetEvent): void;
    createElementForItem(item: Protocol.WebAudio.BaseAudioContext): Element;
    selectedContext(): Protocol.WebAudio.BaseAudioContext | null;
    highlightedItemChanged(from: Protocol.WebAudio.BaseAudioContext | null, to: Protocol.WebAudio.BaseAudioContext | null, fromElement: Element | null, toElement: Element | null): void;
    isItemSelectable(_item: Protocol.WebAudio.BaseAudioContext): boolean;
    itemSelected(item: Protocol.WebAudio.BaseAudioContext | null): void;
    reset(): void;
    titleFor(context: Protocol.WebAudio.BaseAudioContext): string;
    toolbarItem(): UI.Toolbar.ToolbarItem;
}
export declare const enum Events {
    ContextSelected = "ContextSelected"
}
