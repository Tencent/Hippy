import * as Common from '../../core/common/common.js';
import { VBox } from './Widget.js';
export declare class ThrottledWidget extends VBox {
    _updateThrottler: Common.Throttler.Throttler;
    _updateWhenVisible: boolean;
    constructor(isWebComponent?: boolean, timeout?: number);
    protected doUpdate(): Promise<void>;
    update(): void;
    wasShown(): void;
}
