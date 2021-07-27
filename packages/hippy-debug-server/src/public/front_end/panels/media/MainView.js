// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { MediaModel } from './MediaModel.js';
import { PlayerDetailView } from './PlayerDetailView.js';
import { PlayerListView } from './PlayerListView.js';
class PlayerDataCollection {
    _properties;
    _messages;
    _events;
    _errors;
    constructor() {
        this._properties = new Map();
        this._messages = [];
        this._events = [];
        this._errors = [];
    }
    onProperty(property) {
        this._properties.set(property.name, property.value);
    }
    onError(error) {
        this._errors.push(error);
    }
    onMessage(message) {
        this._messages.push(message);
    }
    onEvent(event) {
        this._events.push(event);
    }
    export() {
        return { 'properties': this._properties, 'messages': this._messages, 'events': this._events, 'errors': this._errors };
    }
}
class PlayerDataDownloadManager {
    _playerDataCollection;
    constructor() {
        this._playerDataCollection = new Map();
    }
    addPlayer(playerID) {
        this._playerDataCollection.set(playerID, new PlayerDataCollection());
    }
    onProperty(playerID, property) {
        const playerProperty = this._playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onProperty(property);
    }
    onError(playerID, error) {
        const playerProperty = this._playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onError(error);
    }
    onMessage(playerID, message) {
        const playerProperty = this._playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onMessage(message);
    }
    onEvent(playerID, event) {
        const playerProperty = this._playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onEvent(event);
    }
    exportPlayerData(playerID) {
        const playerProperty = this._playerDataCollection.get(playerID);
        if (!playerProperty) {
            throw new Error('Unable to find player');
        }
        return playerProperty.export();
    }
    deletePlayer(playerID) {
        this._playerDataCollection.delete(playerID);
    }
}
let mainViewInstance;
export class MainView extends UI.Panel.PanelWithSidebar {
    _detailPanels;
    _deletedPlayers;
    _downloadStore;
    _sidebar;
    constructor() {
        super('Media');
        this._detailPanels = new Map();
        this._deletedPlayers = new Set();
        this._downloadStore = new PlayerDataDownloadManager();
        this._sidebar = new PlayerListView(this);
        this._sidebar.show(this.panelSidebarElement());
        SDK.TargetManager.TargetManager.instance().observeModels(MediaModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!mainViewInstance || forceNew) {
            mainViewInstance = new MainView();
        }
        return mainViewInstance;
    }
    renderMainPanel(playerID) {
        if (!this._detailPanels.has(playerID)) {
            return;
        }
        const mainWidget = this.splitWidget().mainWidget();
        if (mainWidget) {
            mainWidget.detachChildWidgets();
        }
        this._detailPanels.get(playerID)?.show(this.mainElement());
    }
    wasShown() {
        super.wasShown();
        for (const model of SDK.TargetManager.TargetManager.instance().models(MediaModel)) {
            this._addEventListeners(model);
        }
    }
    willHide() {
        for (const model of SDK.TargetManager.TargetManager.instance().models(MediaModel)) {
            this._removeEventListeners(model);
        }
    }
    modelAdded(model) {
        if (this.isShowing()) {
            this._addEventListeners(model);
        }
    }
    modelRemoved(model) {
        this._removeEventListeners(model);
    }
    _addEventListeners(mediaModel) {
        mediaModel.ensureEnabled();
        mediaModel.addEventListener("PlayerPropertiesChanged" /* PlayerPropertiesChanged */, this._propertiesChanged, this);
        mediaModel.addEventListener("PlayerEventsAdded" /* PlayerEventsAdded */, this._eventsAdded, this);
        mediaModel.addEventListener("PlayerMessagesLogged" /* PlayerMessagesLogged */, this._messagesLogged, this);
        mediaModel.addEventListener("PlayerErrorsRaised" /* PlayerErrorsRaised */, this._errorsRaised, this);
        mediaModel.addEventListener("PlayersCreated" /* PlayersCreated */, this._playersCreated, this);
    }
    _removeEventListeners(mediaModel) {
        mediaModel.removeEventListener("PlayerPropertiesChanged" /* PlayerPropertiesChanged */, this._propertiesChanged, this);
        mediaModel.removeEventListener("PlayerEventsAdded" /* PlayerEventsAdded */, this._eventsAdded, this);
        mediaModel.removeEventListener("PlayerMessagesLogged" /* PlayerMessagesLogged */, this._messagesLogged, this);
        mediaModel.removeEventListener("PlayerErrorsRaised" /* PlayerErrorsRaised */, this._errorsRaised, this);
        mediaModel.removeEventListener("PlayersCreated" /* PlayersCreated */, this._playersCreated, this);
    }
    _onPlayerCreated(playerID) {
        this._sidebar.addMediaElementItem(playerID);
        this._detailPanels.set(playerID, new PlayerDetailView());
        this._downloadStore.addPlayer(playerID);
    }
    _propertiesChanged(event) {
        for (const property of event.data.properties) {
            this.onProperty(event.data.playerId, property);
        }
    }
    _eventsAdded(event) {
        for (const ev of event.data.events) {
            this.onEvent(event.data.playerId, ev);
        }
    }
    _messagesLogged(event) {
        for (const message of event.data.messages) {
            this.onMessage(event.data.playerId, message);
        }
    }
    _errorsRaised(event) {
        for (const error of event.data.errors) {
            this.onError(event.data.playerId, error);
        }
    }
    _shouldPropagate(playerID) {
        return !this._deletedPlayers.has(playerID) && this._detailPanels.has(playerID);
    }
    onProperty(playerID, property) {
        if (!this._shouldPropagate(playerID)) {
            return;
        }
        this._sidebar.onProperty(playerID, property);
        this._downloadStore.onProperty(playerID, property);
        this._detailPanels.get(playerID)?.onProperty(property);
    }
    onError(playerID, error) {
        if (!this._shouldPropagate(playerID)) {
            return;
        }
        this._sidebar.onError(playerID, error);
        this._downloadStore.onError(playerID, error);
        this._detailPanels.get(playerID)?.onError(error);
    }
    onMessage(playerID, message) {
        if (!this._shouldPropagate(playerID)) {
            return;
        }
        this._sidebar.onMessage(playerID, message);
        this._downloadStore.onMessage(playerID, message);
        this._detailPanels.get(playerID)?.onMessage(message);
    }
    onEvent(playerID, event) {
        if (!this._shouldPropagate(playerID)) {
            return;
        }
        this._sidebar.onEvent(playerID, event);
        this._downloadStore.onEvent(playerID, event);
        this._detailPanels.get(playerID)?.onEvent(event);
    }
    _playersCreated(event) {
        const playerlist = event.data;
        for (const playerID of playerlist) {
            this._onPlayerCreated(playerID);
        }
    }
    markPlayerForDeletion(playerID) {
        // TODO(tmathmeyer): send this to chromium to save the storage space there too.
        this._deletedPlayers.add(playerID);
        this._detailPanels.delete(playerID);
        this._sidebar.deletePlayer(playerID);
        this._downloadStore.deletePlayer(playerID);
    }
    markOtherPlayersForDeletion(playerID) {
        for (const keyID of this._detailPanels.keys()) {
            if (keyID !== playerID) {
                this.markPlayerForDeletion(keyID);
            }
        }
    }
    exportPlayerData(playerID) {
        const dump = this._downloadStore.exportPlayerData(playerID);
        const uriContent = 'data:application/octet-stream,' + encodeURIComponent(JSON.stringify(dump, null, 2));
        const anchor = document.createElement('a');
        anchor.href = uriContent;
        anchor.download = playerID + '.json';
        anchor.click();
    }
}
//# sourceMappingURL=MainView.js.map