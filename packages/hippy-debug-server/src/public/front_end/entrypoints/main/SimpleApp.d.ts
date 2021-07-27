import type * as Common from '../../core/common/common.js';
export declare class SimpleApp implements Common.App.App {
    presentUI(document: Document): void;
}
export declare class SimpleAppProvider implements Common.AppProvider.AppProvider {
    static instance(opts?: {
        forceNew: boolean | null;
    }): SimpleAppProvider;
    createApp(): Common.App.App;
}
