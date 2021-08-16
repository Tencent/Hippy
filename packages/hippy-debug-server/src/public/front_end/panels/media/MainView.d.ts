import type * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import type { PlayerEvent } from './MediaModel.js';
import { MediaModel } from './MediaModel.js';
import { PlayerDetailView } from './PlayerDetailView.js';
import { PlayerListView } from './PlayerListView.js';
export interface TriggerHandler {
    onProperty(property: Protocol.Media.PlayerProperty): void;
    onError(error: Protocol.Media.PlayerError): void;
    onMessage(message: Protocol.Media.PlayerMessage): void;
    onEvent(event: PlayerEvent): void;
}
export interface TriggerDispatcher {
    onProperty(playerID: string, property: Protocol.Media.PlayerProperty): void;
    onError(playerID: string, error: Protocol.Media.PlayerError): void;
    onMessage(playerID: string, message: Protocol.Media.PlayerMessage): void;
    onEvent(playerID: string, event: PlayerEvent): void;
}
declare class PlayerDataCollection implements TriggerHandler {
    _properties: Map<string, string>;
    _messages: Protocol.Media.PlayerMessage[];
    _events: PlayerEvent[];
    _errors: Protocol.Media.PlayerError[];
    constructor();
    onProperty(property: Protocol.Media.PlayerProperty): void;
    onError(error: Protocol.Media.PlayerError): void;
    onMessage(message: Protocol.Media.PlayerMessage): void;
    onEvent(event: PlayerEvent): void;
    export(): {
        properties: Map<string, string>;
        messages: Protocol.Media.PlayerMessage[];
        events: PlayerEvent[];
        errors: Protocol.Media.PlayerError[];
    };
}
declare class PlayerDataDownloadManager implements TriggerDispatcher {
    _playerDataCollection: Map<string, PlayerDataCollection>;
    constructor();
    addPlayer(playerID: string): void;
    onProperty(playerID: string, property: Protocol.Media.PlayerProperty): void;
    onError(playerID: string, error: Protocol.Media.PlayerError): void;
    onMessage(playerID: string, message: Protocol.Media.PlayerMessage): void;
    onEvent(playerID: string, event: PlayerEvent): void;
    exportPlayerData(playerID: string): {
        properties: Map<string, string>;
        messages: Protocol.Media.PlayerMessage[];
        events: PlayerEvent[];
        errors: Protocol.Media.PlayerError[];
    };
    deletePlayer(playerID: string): void;
}
export declare class MainView extends UI.Panel.PanelWithSidebar implements SDK.TargetManager.SDKModelObserver<MediaModel> {
    _detailPanels: Map<string, PlayerDetailView>;
    _deletedPlayers: Set<string>;
    _downloadStore: PlayerDataDownloadManager;
    _sidebar: PlayerListView;
    constructor();
    static instance(opts?: {
        forceNew: null;
    }): MainView;
    renderMainPanel(playerID: string): void;
    wasShown(): void;
    willHide(): void;
    modelAdded(model: MediaModel): void;
    modelRemoved(model: MediaModel): void;
    _addEventListeners(mediaModel: MediaModel): void;
    _removeEventListeners(mediaModel: MediaModel): void;
    _onPlayerCreated(playerID: string): void;
    _propertiesChanged(event: Common.EventTarget.EventTargetEvent): void;
    _eventsAdded(event: Common.EventTarget.EventTargetEvent): void;
    _messagesLogged(event: Common.EventTarget.EventTargetEvent): void;
    _errorsRaised(event: Common.EventTarget.EventTargetEvent): void;
    _shouldPropagate(playerID: string): boolean;
    onProperty(playerID: string, property: Protocol.Media.PlayerProperty): void;
    onError(playerID: string, error: Protocol.Media.PlayerError): void;
    onMessage(playerID: string, message: Protocol.Media.PlayerMessage): void;
    onEvent(playerID: string, event: PlayerEvent): void;
    _playersCreated(event: Common.EventTarget.EventTargetEvent): void;
    markPlayerForDeletion(playerID: string): void;
    markOtherPlayersForDeletion(playerID: string): void;
    exportPlayerData(playerID: string): void;
}
export {};
