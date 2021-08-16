import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class NetworkConfigView extends UI.Widget.VBox {
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): NetworkConfigView;
    static createUserAgentSelectAndInput(title: string): {
        select: HTMLSelectElement;
        input: HTMLInputElement;
        error: HTMLElement;
    };
    _createSection(title: string, className?: string): Element;
    _createCacheSection(): void;
    _createNetworkThrottlingSection(): void;
    _createUserAgentSection(): void;
    _createAcceptedEncodingSection(): void;
}
interface UserAgentGroup {
    title: string;
    values: {
        title: string;
        value: string;
        metadata: Protocol.Emulation.UserAgentMetadata | null;
    }[];
}
export declare const userAgentGroups: UserAgentGroup[];
export {};
