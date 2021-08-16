import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { KeybindsSettingsTab } from './KeybindsSettingsTab.js';
export declare class SettingsScreen extends UI.Widget.VBox implements UI.View.ViewLocationResolver {
    _tabbedLocation: UI.View.TabbedViewLocation;
    _keybindsTab?: KeybindsSettingsTab;
    _reportTabOnReveal: boolean;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): SettingsScreen;
    static _revealSettingsScreen(): SettingsScreen;
    static _showSettingsScreen(options?: ShowSettingsScreenOptions | undefined): Promise<void>;
    resolveLocation(_locationName: string): UI.View.ViewLocation | null;
    _selectTab(name: string): void;
    _tabInvoked(event: Common.EventTarget.EventTargetEvent): void;
    _reportSettingsPanelShown(tabId: string): void;
    _onEscapeKeyPressed(event: Event): void;
}
declare class SettingsTab extends UI.Widget.VBox {
    containerElement: HTMLElement;
    constructor(name: string, id?: string);
    _appendSection(name?: string): HTMLElement;
}
export declare class GenericSettingsTab extends SettingsTab {
    private categoryToSection;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): GenericSettingsTab;
    static isSettingVisible(setting: Common.Settings.SettingRegistration): boolean;
    _addSettingUI(): void;
    _createSectionElement(category: Common.Settings.SettingCategory): Element;
    _sectionElement(category: Common.Settings.SettingCategory): Element | null;
}
export declare class ExperimentsSettingsTab extends SettingsTab {
    private experimentsSection;
    private unstableExperimentsSection;
    constructor();
    private renderExperiments;
    static instance(opts?: {
        forceNew: null;
    }): ExperimentsSettingsTab;
    _createExperimentsWarningSubsection(warningMessage: string): Element;
    _createExperimentCheckbox(experiment: Root.Runtime.Experiment): HTMLParagraphElement;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class Revealer implements Common.Revealer.Revealer {
    static instance(opts?: {
        forceNew: boolean;
    }): Revealer;
    reveal(object: Object): Promise<void>;
}
export interface ShowSettingsScreenOptions {
    name?: string;
    focusTabHeader?: boolean;
}
export {};
