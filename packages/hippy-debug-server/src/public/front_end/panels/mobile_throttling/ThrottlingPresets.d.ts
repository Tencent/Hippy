import * as SDK from '../../core/sdk/sdk.js';
export declare enum CPUThrottlingRates {
    NoThrottling = 1,
    MidTierMobile = 4,
    LowEndMobile = 6
}
export declare class ThrottlingPresets {
    static getNoThrottlingConditions(): Conditions;
    static getOfflineConditions(): Conditions;
    static getLowEndMobileConditions(): Conditions;
    static getMidTierMobileConditions(): Conditions;
    static getCustomConditions(): PlaceholderConditions;
    static getMobilePresets(): (Conditions | PlaceholderConditions)[];
    static getAdvancedMobilePresets(): Conditions[];
    static networkPresets: SDK.NetworkManager.Conditions[];
    static cpuThrottlingPresets: CPUThrottlingRates[];
}
export interface Conditions {
    title: string;
    description: string;
    network: SDK.NetworkManager.Conditions;
    cpuThrottlingRate: number;
}
export interface NetworkThrottlingConditionsGroup {
    title: string;
    items: SDK.NetworkManager.Conditions[];
}
export interface MobileThrottlingConditionsGroup {
    title: string;
    items: (Conditions | PlaceholderConditions)[];
}
export declare type ConditionsList = (Conditions | PlaceholderConditions | null)[];
export interface PlaceholderConditions {
    title: string;
    description: string;
}
