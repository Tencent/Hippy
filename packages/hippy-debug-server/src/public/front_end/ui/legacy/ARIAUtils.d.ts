export declare function nextId(prefix: string): string;
export declare function bindLabelToControl(label: Element, control: Element): void;
export declare function markAsAlert(element: Element): void;
export declare function markAsApplication(element: Element): void;
export declare function markAsButton(element: Element): void;
export declare function markAsCheckbox(element: Element): void;
export declare function markAsCombobox(element: Element): void;
export declare function markAsModalDialog(element: Element): void;
export declare function markAsGroup(element: Element): void;
export declare function markAsLink(element: Element): void;
export declare function markAsMenuButton(element: Element): void;
export declare function markAsProgressBar(element: Element, min?: number | undefined, max?: number | undefined): void;
export declare function markAsTab(element: Element): void;
export declare function markAsTablist(element: Element): void;
export declare function markAsTabpanel(element: Element): void;
export declare function markAsTree(element: Element): void;
export declare function markAsTreeitem(element: Element): void;
export declare function markAsTextBox(element: Element): void;
export declare function markAsMenu(element: Element): void;
export declare function markAsMenuItem(element: Element): void;
export declare function markAsMenuItemSubMenu(element: Element): void;
export declare function markAsList(element: Element): void;
export declare function markAsListitem(element: Element): void;
/**
 * Must contain children whose role is option.
 */
export declare function markAsListBox(element: Element): void;
export declare function markAsMultiSelectable(element: Element): void;
/**
 * Must be contained in, or owned by, an element with the role listbox.
 */
export declare function markAsOption(element: Element): void;
export declare function markAsRadioGroup(element: Element): void;
export declare function markAsHidden(element: Element): void;
export declare function markAsSlider(element: Element, min?: number | undefined, max?: number | undefined): void;
export declare function markAsHeading(element: Element, level: number): void;
export declare function markAsPoliteLiveRegion(element: Element, isAtomic: boolean): void;
export declare function markAsLog(element: Element): void;
export declare function hasRole(element: Element): boolean;
export declare function removeRole(element: Element): void;
export declare function setPlaceholder(element: Element, placeholder: string | null): void;
export declare function markAsPresentation(element: Element): void;
export declare function markAsStatus(element: Element): void;
export declare function ensureId(element: Element): void;
export declare function setAriaValueText(element: Element, valueText: string): void;
export declare function setAriaValueNow(element: Element, value: string): void;
export declare function setAriaValueMinMax(element: Element, min: string, max: string): void;
export declare function setControls(element: Element, controlledElement: Element | null): void;
export declare function setChecked(element: Element, value: boolean): void;
export declare function setCheckboxAsIndeterminate(element: Element): void;
export declare function setDisabled(element: Element, value: boolean): void;
export declare function setExpanded(element: Element, value: boolean): void;
export declare function unsetExpandable(element: Element): void;
export declare function setHidden(element: Element, value: boolean): void;
export declare function setLevel(element: Element, level: number): void;
export declare enum AutocompleteInteractionModel {
    inline = "inline",
    list = "list",
    both = "both",
    none = "none"
}
export declare function setAutocomplete(element: Element, interactionModel?: AutocompleteInteractionModel | undefined): void;
export declare function clearAutocomplete(element: Element): void;
export declare const enum PopupRole {
    False = "false",
    True = "true",
    Menu = "menu",
    ListBox = "listbox",
    Tree = "tree",
    Grid = "grid",
    Dialog = "dialog"
}
export declare function setHasPopup(element: Element, value?: PopupRole): void;
export declare function setSelected(element: Element, value: boolean): void;
export declare function clearSelected(element: Element): void;
export declare function setInvalid(element: Element, value: boolean): void;
export declare function setPressed(element: Element, value: boolean): void;
export declare function setValueNow(element: Element, value: number): void;
export declare function setValueText(element: Element, value: number): void;
export declare function setProgressBarValue(element: Element, valueNow: number, valueText?: string): void;
export declare function setAccessibleName(element: Element, name: string): void;
export declare function setDescription(element: Element, description: string): void;
export declare function setActiveDescendant(element: Element, activedescendant: Element | null): void;
export declare function setSetSize(element: Element, size: number): void;
export declare function setPositionInSet(element: Element, position: number): void;
/**
 * This function is used to announce a message with the screen reader.
 * Setting the textContent would allow the SR to access the offscreen element via browse mode
 */
export declare function alert(message: string): void;
