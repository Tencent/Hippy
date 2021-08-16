import type * as UI from '../../legacy.js';
import type { Provider } from './FilteredListWidget.js';
import { FilteredListWidget } from './FilteredListWidget.js';
export declare const history: string[];
export declare class QuickOpenImpl {
    _prefix: string | null;
    _query: string;
    _providers: Map<string, () => Promise<Provider>>;
    _prefixes: string[];
    _filteredListWidget: FilteredListWidget | null;
    constructor();
    static show(query: string): void;
    _addProvider(extension: {
        prefix: string;
        provider: () => Promise<Provider>;
    }): void;
    _queryChanged(query: string): void;
    _providerLoadedForTest(_provider: Provider): void;
}
export declare class ShowActionDelegate implements UI.ActionRegistration.ActionDelegate {
    static instance(opts?: {
        forceNew: boolean | null;
    }): ShowActionDelegate;
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
