import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DeveloperResourcesListView } from './DeveloperResourcesListView.js';
export declare class DeveloperResourcesView extends UI.Widget.VBox {
    _textFilterRegExp: RegExp | null;
    _filterInput: UI.Toolbar.ToolbarInput;
    _coverageResultsElement: HTMLElement;
    _listView: DeveloperResourcesListView;
    _statusToolbarElement: HTMLElement;
    _statusMessageElement: HTMLElement;
    _throttler: Common.Throttler.Throttler;
    _loader: SDK.PageResourceLoader.PageResourceLoader;
    private constructor();
    static instance(): DeveloperResourcesView;
    _onUpdate(): void;
    _update(): Promise<void>;
    _updateStats(): void;
    _isVisible(item: SDK.PageResourceLoader.PageResource): boolean;
    /**
     *
     */
    _onFilterChanged(): void;
}
