import * as Common from '../../core/common/common.js';
import type * as TextUtils from '../../models/text_utils/text_utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { LevelsMask } from './ConsoleFilter.js';
import { ConsoleFilter } from './ConsoleFilter.js';
import type { ConsoleViewMessage } from './ConsoleViewMessage.js';
export declare class ConsoleSidebar extends UI.Widget.VBox {
    _tree: UI.TreeOutline.TreeOutlineInShadow;
    _selectedTreeElement: UI.TreeOutline.TreeElement | null;
    _treeElements: FilterTreeElement[];
    constructor();
    _appendGroup(name: string, parsedFilters: TextUtils.TextUtils.ParsedFilter[], levelsMask: LevelsMask, icon: UI.Icon.Icon, selectedFilterSetting: Common.Settings.Setting<string>): void;
    clear(): void;
    onMessageAdded(viewMessage: ConsoleViewMessage): void;
    shouldBeVisible(viewMessage: ConsoleViewMessage): boolean;
    _selectionChanged(event: Common.EventTarget.EventTargetEvent): void;
}
export declare const enum Events {
    FilterSelected = "FilterSelected"
}
declare class ConsoleSidebarTreeElement extends UI.TreeOutline.TreeElement {
    _filter: ConsoleFilter;
    constructor(title: string | Node, filter: ConsoleFilter);
    filter(): ConsoleFilter;
}
export declare class URLGroupTreeElement extends ConsoleSidebarTreeElement {
    _countElement: HTMLElement;
    _messageCount: number;
    constructor(filter: ConsoleFilter);
    incrementAndUpdateCounter(): void;
}
export declare class FilterTreeElement extends ConsoleSidebarTreeElement {
    _selectedFilterSetting: Common.Settings.Setting<string>;
    _urlTreeElements: Map<string | null, URLGroupTreeElement>;
    _messageCount: number;
    private uiStringForFilterCount;
    constructor(filter: ConsoleFilter, icon: UI.Icon.Icon, selectedFilterSetting: Common.Settings.Setting<string>);
    clear(): void;
    name(): string;
    onselect(selectedByUser?: boolean): boolean;
    _updateCounter(): void;
    _updateGroupTitle(messageCount: number): string;
    onMessageAdded(viewMessage: ConsoleViewMessage): void;
    _childElement(url?: string): URLGroupTreeElement;
}
export {};
