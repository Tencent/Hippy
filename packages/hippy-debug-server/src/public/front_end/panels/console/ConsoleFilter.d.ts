import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import type { ConsoleViewMessage } from './ConsoleViewMessage.js';
export declare type LevelsMask = {
    [x: string]: boolean;
};
export declare class ConsoleFilter {
    name: string;
    parsedFilters: TextUtils.TextUtils.ParsedFilter[];
    executionContext: SDK.RuntimeModel.ExecutionContext | null;
    levelsMask: LevelsMask;
    constructor(name: string, parsedFilters: TextUtils.TextUtils.ParsedFilter[], executionContext: SDK.RuntimeModel.ExecutionContext | null, levelsMask?: LevelsMask);
    static allLevelsFilterValue(): LevelsMask;
    static defaultLevelsFilterValue(): LevelsMask;
    static singleLevelMask(level: string): LevelsMask;
    clone(): ConsoleFilter;
    shouldBeVisible(viewMessage: ConsoleViewMessage): boolean;
}
export declare enum FilterType {
    Context = "context",
    Source = "source",
    Url = "url"
}
