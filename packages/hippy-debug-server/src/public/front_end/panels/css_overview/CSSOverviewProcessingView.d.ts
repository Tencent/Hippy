import * as UI from '../../ui/legacy/legacy.js';
import type { OverviewController } from './CSSOverviewController.js';
export declare class CSSOverviewProcessingView extends UI.Widget.Widget {
    _formatter: Intl.NumberFormat;
    _controller: OverviewController;
    fragment?: UI.Fragment.Fragment;
    constructor(controller: OverviewController);
    _render(): void;
}
