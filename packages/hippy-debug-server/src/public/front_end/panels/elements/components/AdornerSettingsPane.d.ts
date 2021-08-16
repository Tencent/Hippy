import type { AdornerSettingsMap } from './AdornerManager.js';
export declare class AdornerSettingUpdatedEvent extends Event {
    data: {
        adornerName: string;
        isEnabledNow: boolean;
        newSettings: AdornerSettingsMap;
    };
    constructor(adornerName: string, isEnabledNow: boolean, newSettings: AdornerSettingsMap);
}
export interface AdornerSettingsPaneData {
    settings: Readonly<AdornerSettingsMap>;
}
export declare class AdornerSettingsPane extends HTMLElement {
    private readonly shadow;
    private settings;
    set data(data: AdornerSettingsPaneData);
    show(): void;
    hide(): void;
    private onChange;
    private render;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-adorner-settings-pane': AdornerSettingsPane;
    }
}
