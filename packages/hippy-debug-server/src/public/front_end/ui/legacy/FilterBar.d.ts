import * as Common from '../../core/common/common.js';
import type { Suggestions } from './SuggestBox.js';
import { TextPrompt } from './TextPrompt.js';
import type { ToolbarButton } from './Toolbar.js';
import { ToolbarSettingToggle } from './Toolbar.js';
import { CheckboxLabel } from './UIUtils.js';
import { HBox } from './Widget.js';
export declare class FilterBar extends HBox {
    _enabled: boolean;
    _stateSetting: Common.Settings.Setting<boolean>;
    _filterButton: ToolbarSettingToggle;
    _filters: FilterUI[];
    _alwaysShowFilters?: boolean;
    _showingWidget?: boolean;
    constructor(name: string, visibleByDefault?: boolean);
    filterButton(): ToolbarButton;
    addFilter(filter: FilterUI): void;
    setEnabled(enabled: boolean): void;
    forceShowFilterBar(): void;
    showOnce(): void;
    _filterChanged(_event: Common.EventTarget.EventTargetEvent): void;
    wasShown(): void;
    _updateFilterBar(): void;
    focus(): void;
    _updateFilterButton(): void;
    clear(): void;
    setting(): Common.Settings.Setting<boolean>;
    visible(): boolean;
}
export declare namespace FilterBar {
    enum Events {
        Changed = "Changed"
    }
}
export interface FilterUI extends Common.EventTarget.EventTarget {
    isActive(): boolean;
    element(): Element;
}
export declare namespace FilterUI {
    enum Events {
        FilterChanged = "FilterChanged"
    }
}
export declare class TextFilterUI extends Common.ObjectWrapper.ObjectWrapper implements FilterUI {
    _filterElement: HTMLDivElement;
    _filterInputElement: HTMLElement;
    _prompt: TextPrompt;
    _proxyElement: HTMLElement;
    _suggestionProvider: ((arg0: string, arg1: string, arg2?: boolean | undefined) => Promise<Suggestions>) | null;
    constructor();
    _completions(expression: string, prefix: string, force?: boolean): Promise<Suggestions>;
    isActive(): boolean;
    element(): Element;
    value(): string;
    setValue(value: string): void;
    focus(): void;
    setSuggestionProvider(suggestionProvider: (arg0: string, arg1: string, arg2?: boolean | undefined) => Promise<Suggestions>): void;
    _valueChanged(): void;
    _updateEmptyStyles(): void;
    clear(): void;
}
export declare class NamedBitSetFilterUI extends Common.ObjectWrapper.ObjectWrapper implements FilterUI {
    _filtersElement: HTMLDivElement;
    _typeFilterElementTypeNames: WeakMap<HTMLElement, string>;
    _allowedTypes: Set<string>;
    _typeFilterElements: HTMLElement[];
    _setting: Common.Settings.Setting<{
        [key: string]: boolean;
    }> | undefined;
    constructor(items: Item[], setting?: Common.Settings.Setting<{
        [key: string]: boolean;
    }>);
    reset(): void;
    isActive(): boolean;
    element(): Element;
    accept(typeName: string): boolean;
    _settingChanged(): void;
    _update(): void;
    _addBit(name: string, label: string, title?: string): void;
    _onTypeFilterClicked(event: Event): void;
    _onTypeFilterKeydown(ev: Event): void;
    _keyFocusNextBit(target: HTMLElement, selectPrevious: boolean): boolean;
    _toggleTypeFilter(typeName: string, allowMultiSelect: boolean): void;
    static readonly ALL_TYPES = "all";
}
export declare class CheckboxFilterUI extends Common.ObjectWrapper.ObjectWrapper implements FilterUI {
    _filterElement: HTMLDivElement;
    _activeWhenChecked: boolean;
    _label: CheckboxLabel;
    _checkboxElement: HTMLInputElement;
    constructor(className: string, title: string, activeWhenChecked?: boolean, setting?: Common.Settings.Setting<boolean>);
    isActive(): boolean;
    checked(): boolean;
    setChecked(checked: boolean): void;
    element(): HTMLDivElement;
    labelElement(): Element;
    _fireUpdated(): void;
    setColor(backgroundColor: string, borderColor: string): void;
}
export interface Item {
    name: string;
    label: () => string;
    title?: string;
}
