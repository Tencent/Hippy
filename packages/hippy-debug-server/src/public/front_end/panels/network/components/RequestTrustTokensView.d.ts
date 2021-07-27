import * as SDK from '../../../core/sdk/sdk.js';
import * as Protocol from '../../../generated/protocol.js';
import * as UI from '../../../ui/legacy/legacy.js';
export declare class RequestTrustTokensView extends UI.Widget.VBox {
    private readonly reportView;
    private readonly request;
    constructor(request: SDK.NetworkRequest.NetworkRequest);
    wasShown(): void;
    willHide(): void;
    private refreshReportView;
}
export interface RequestTrustTokensReportData {
    params?: Readonly<Protocol.Network.TrustTokenParams>;
    result?: Readonly<Protocol.Network.TrustTokenOperationDoneEvent>;
}
export declare class RequestTrustTokensReport extends HTMLElement {
    private readonly shadow;
    private trustTokenData?;
    set data(data: RequestTrustTokensReportData);
    private render;
    private renderParameterSection;
    private renderRefreshPolicy;
    private renderIssuers;
    private renderIssuerAndTopLevelOriginFromResult;
    private renderResultSection;
    private renderIssuedTokenCount;
}
export declare function statusConsideredSuccess(status: Protocol.Network.TrustTokenOperationDoneEventStatus): boolean;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-trust-token-report': RequestTrustTokensReport;
    }
}
