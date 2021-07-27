import * as Common from '../../core/common/common.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { ResourcesPanel } from './ResourcesPanel.js';
export declare class ApplicationPanelTreeElement extends UI.TreeOutline.TreeElement {
    protected readonly resourcesPanel: ResourcesPanel;
    constructor(resourcesPanel: ResourcesPanel, title: string, expandable: boolean);
    get itemURL(): string;
    onselect(selectedByUser: boolean | undefined): boolean;
    showView(view: UI.Widget.Widget | null): void;
}
export declare class ExpandableApplicationPanelTreeElement extends ApplicationPanelTreeElement {
    protected readonly expandedSetting: Common.Settings.Setting<boolean>;
    protected readonly categoryName: string;
    protected categoryLink: string | null;
    constructor(resourcesPanel: ResourcesPanel, categoryName: string, settingsKey: string, settingsDefault?: boolean);
    get itemURL(): string;
    setLink(link: string): void;
    onselect(selectedByUser: boolean | undefined): boolean;
    onattach(): void;
    onexpand(): void;
    oncollapse(): void;
}
