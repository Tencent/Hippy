import type * as Protocol from '../../../generated/protocol.js';
export declare const i18nString: (id: string, values?: Object | undefined) => import("../../../core/platform/UIString.js").LocalizedString;
export interface TrustTokensViewData {
    tokens: Protocol.Storage.TrustTokens[];
    deleteClickHandler: (issuerOrigin: string) => void;
}
export declare class TrustTokensView extends HTMLElement {
    private readonly shadow;
    private tokens;
    private deleteClickHandler;
    connectedCallback(): void;
    set data(data: TrustTokensViewData);
    private render;
    private renderGridOrNoDataMessage;
    private buildRowsFromTokens;
    private deleteButtonRenderer;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-trust-tokens-storage-view': TrustTokensView;
    }
}
