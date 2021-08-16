import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
import type { NetworkTimeCalculator } from './NetworkTimeCalculator.js';
export declare class RequestTimingView extends UI.Widget.VBox {
    _request: SDK.NetworkRequest.NetworkRequest;
    _calculator: NetworkTimeCalculator;
    _tableElement?: Element;
    constructor(request: SDK.NetworkRequest.NetworkRequest, calculator: NetworkTimeCalculator);
    static _timeRangeTitle(name: RequestTimeRangeNames): string;
    static calculateRequestTimeRanges(request: SDK.NetworkRequest.NetworkRequest, navigationStart: number): RequestTimeRange[];
    static createTimingTable(request: SDK.NetworkRequest.NetworkRequest, calculator: NetworkTimeCalculator): Element;
    _constructFetchDetailsView(): void;
    _getLocalizedResponseSourceForCode(swResponseSource: Protocol.Network.ServiceWorkerResponseSource): Common.UIString.LocalizedString;
    _onToggleFetchDetails(fetchDetailsElement: Element, event: Event): void;
    wasShown(): void;
    willHide(): void;
    _refresh(): void;
}
export declare enum RequestTimeRangeNames {
    Push = "push",
    Queueing = "queueing",
    Blocking = "blocking",
    Connecting = "connecting",
    DNS = "dns",
    Proxy = "proxy",
    Receiving = "receiving",
    ReceivingPush = "receiving-push",
    Sending = "sending",
    ServiceWorker = "serviceworker",
    ServiceWorkerPreparation = "serviceworker-preparation",
    ServiceWorkerRespondWith = "serviceworker-respondwith",
    SSL = "ssl",
    Total = "total",
    Waiting = "waiting"
}
export declare const ServiceWorkerRangeNames: Set<RequestTimeRangeNames>;
export declare const ConnectionSetupRangeNames: Set<RequestTimeRangeNames>;
export interface RequestTimeRange {
    name: RequestTimeRangeNames;
    start: number;
    end: number;
}
