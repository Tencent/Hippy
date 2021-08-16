export declare const enum AdornerCategories {
    SECURITY = "Security",
    LAYOUT = "Layout",
    DEFAULT = "Default"
}
export interface AdornerSetting {
    adorner: string;
    isEnabled: boolean;
}
export declare type AdornerSettingsMap = Map<string, boolean>;
export declare const AdornerRegistry: {
    readonly GRID: {
        readonly name: "grid";
        readonly category: AdornerCategories.LAYOUT;
        readonly enabledByDefault: true;
    };
    readonly FLEX: {
        readonly name: "flex";
        readonly category: AdornerCategories.LAYOUT;
        readonly enabledByDefault: true;
    };
    readonly AD: {
        readonly name: "ad";
        readonly category: AdornerCategories.SECURITY;
        readonly enabledByDefault: true;
    };
    readonly SCROLL_SNAP: {
        readonly name: "scroll-snap";
        readonly category: AdornerCategories.LAYOUT;
        readonly enabledByDefault: true;
    };
};
export declare const DefaultAdornerSettings: {
    adorner: "grid" | "flex" | "ad" | "scroll-snap";
    isEnabled: true;
}[];
interface SettingStore<Setting> {
    get(): Setting;
    set(setting: Setting): void;
}
export declare class AdornerManager {
    private adornerSettings;
    private settingStore;
    constructor(settingStore: SettingStore<AdornerSetting[]>);
    updateSettings(settings: AdornerSettingsMap): void;
    getSettings(): Readonly<AdornerSettingsMap>;
    isAdornerEnabled(adornerText: string): boolean;
    private persistCurrentSettings;
    private loadSettings;
    private syncSettings;
}
export {};
