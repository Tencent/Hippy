import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
export interface PlayerEvent extends Protocol.Media.PlayerEvent {
    value: string;
    displayTimestamp: string;
    event: string;
}
export declare const enum ProtocolTriggers {
    PlayerPropertiesChanged = "PlayerPropertiesChanged",
    PlayerEventsAdded = "PlayerEventsAdded",
    PlayerMessagesLogged = "PlayerMessagesLogged",
    PlayerErrorsRaised = "PlayerErrorsRaised",
    PlayersCreated = "PlayersCreated"
}
export declare class MediaModel extends SDK.SDKModel.SDKModel implements ProtocolProxyApi.MediaDispatcher {
    _enabled: boolean;
    _agent: ProtocolProxyApi.MediaApi;
    constructor(target: SDK.Target.Target);
    resumeModel(): Promise<void>;
    ensureEnabled(): void;
    playerPropertiesChanged(event: Protocol.Media.PlayerPropertiesChangedEvent): void;
    playerEventsAdded(event: Protocol.Media.PlayerEventsAddedEvent): void;
    playerMessagesLogged(event: Protocol.Media.PlayerMessagesLoggedEvent): void;
    playerErrorsRaised(event: Protocol.Media.PlayerErrorsRaisedEvent): void;
    playersCreated({ players }: Protocol.Media.PlayersCreatedEvent): void;
}
