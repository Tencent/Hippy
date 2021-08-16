import { Toolbar } from './Toolbar.js';
import { VBox } from './Widget.js';
/**
 * @deprecated Please consider using the web component version of this widget
 *             (`ui/components/report_view/ReportView.ts`) for new code.
 */
export declare class ReportView extends VBox {
    _contentBox: HTMLElement;
    _headerElement: HTMLElement;
    _titleElement: HTMLElement;
    _sectionList: HTMLElement;
    _subtitleElement?: HTMLElement;
    _urlElement?: HTMLElement;
    constructor(title?: string);
    setTitle(title: string): void;
    setSubtitle(subtitle: string): void;
    setURL(link: Element | null): void;
    createToolbar(): Toolbar;
    appendSection(title: string, className?: string): Section;
    sortSections(comparator: (arg0: Section, arg1: Section) => number): void;
    setHeaderVisible(visible: boolean): void;
    setBodyScrollable(scrollable: boolean): void;
}
export declare class Section extends VBox {
    _headerElement: HTMLElement;
    _titleElement: HTMLElement;
    _fieldList: HTMLElement;
    _fieldMap: Map<string, Element>;
    constructor(title: string, className?: string);
    title(): string;
    setTitle(title: string, tooltip?: string): void;
    /**
     * Declares the overall container to be a group and assigns a title.
     */
    setUiGroupTitle(groupTitle: string): void;
    createToolbar(): Toolbar;
    appendField(title: string, textValue?: string): HTMLElement;
    appendFlexedField(title: string, textValue?: string): Element;
    removeField(title: string): void;
    setFieldVisible(title: string, visible: boolean): void;
    fieldValue(title: string): Element | null;
    appendRow(): HTMLElement;
    appendSelectableRow(): HTMLElement;
    clearContent(): void;
    markFieldListAsGroup(): void;
    setIconMasked(masked: boolean): void;
}
