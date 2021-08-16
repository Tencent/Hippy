import type * as Common from '../../../core/common/common.js';
export interface BaseSettingOption {
    title: string;
}
export interface BooleanSettingOption extends BaseSettingOption {
    value: boolean;
}
export interface EnumSettingOption extends BaseSettingOption {
    value: string;
}
export interface BaseSetting {
    name: string;
    type: Common.Settings.SettingType.BOOLEAN | Common.Settings.SettingType.ENUM;
    title: string;
}
export declare type BooleanSetting = BaseSetting & {
    options: BooleanSettingOption[];
    value: boolean;
};
export declare type EnumSetting = BaseSetting & {
    options: EnumSettingOption[];
    value: string;
};
export declare type Setting = EnumSetting | BooleanSetting;
export interface LayoutElement {
    id: number;
    color: string;
    name: string;
    domId?: string;
    domClasses?: string[];
    enabled: boolean;
    reveal: () => void;
    toggle: (value: boolean) => void;
    setColor: (value: string) => void;
    highlight: () => void;
    hideHighlight: () => void;
}
