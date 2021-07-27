// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { PlayerEventsView } from './EventDisplayTable.js';
import { PlayerEventsTimeline } from './EventTimelineView.js';
import { PlayerMessagesView } from './PlayerMessagesView.js';
import { PlayerPropertiesView } from './PlayerPropertiesView.js';
const UIStrings = {
    /**
    *@description Title of the 'Properties' tool in the sidebar of the elements tool
    */
    properties: 'Properties',
    /**
    *@description Button text for viewing properties.
    */
    playerProperties: 'Player properties',
    /**
    *@description Button text for viewing events.
    */
    events: 'Events',
    /**
    *@description Hover text for the Events button.
    */
    playerEvents: 'Player events',
    /**
    *@description Text in Network Item View of the Network panel
    */
    messages: 'Messages',
    /**
    *@description Column header for messages view.
    */
    playerMessages: 'Player messages',
    /**
    *@description Title for the timeline tab.
    */
    timeline: 'Timeline',
    /**
    *@description Hovertext for Timeline tab.
    */
    playerTimeline: 'Player timeline',
};
const str_ = i18n.i18n.registerUIStrings('panels/media/PlayerDetailView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class PlayerDetailView extends UI.TabbedPane.TabbedPane {
    _eventView;
    _propertyView;
    _messageView;
    _timelineView;
    constructor() {
        super();
        this._eventView = new PlayerEventsView();
        this._propertyView = new PlayerPropertiesView();
        this._messageView = new PlayerMessagesView();
        this._timelineView = new PlayerEventsTimeline();
        this.appendTab("properties" /* Properties */, i18nString(UIStrings.properties), this._propertyView, i18nString(UIStrings.playerProperties));
        this.appendTab("events" /* Events */, i18nString(UIStrings.events), this._eventView, i18nString(UIStrings.playerEvents));
        this.appendTab("messages" /* Messages */, i18nString(UIStrings.messages), this._messageView, i18nString(UIStrings.playerMessages));
        this.appendTab("timeline" /* Timeline */, i18nString(UIStrings.timeline), this._timelineView, i18nString(UIStrings.playerTimeline));
    }
    onProperty(property) {
        this._propertyView.onProperty(property);
    }
    onError(_error) {
    }
    onMessage(message) {
        this._messageView.addMessage(message);
    }
    onEvent(event) {
        this._eventView.onEvent(event);
        this._timelineView.onEvent(event);
    }
}
//# sourceMappingURL=PlayerDetailView.js.map