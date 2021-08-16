import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
import { PlayerEventsView } from './EventDisplayTable.js';
import { PlayerEventsTimeline } from './EventTimelineView.js';
import type { TriggerHandler } from './MainView.js';
import type { PlayerEvent } from './MediaModel.js';
import { PlayerMessagesView } from './PlayerMessagesView.js';
import { PlayerPropertiesView } from './PlayerPropertiesView.js';
export declare const enum PlayerDetailViewTabs {
    Events = "events",
    Properties = "properties",
    Messages = "messages",
    Timeline = "timeline"
}
export declare class PlayerDetailView extends UI.TabbedPane.TabbedPane implements TriggerHandler {
    _eventView: PlayerEventsView;
    _propertyView: PlayerPropertiesView;
    _messageView: PlayerMessagesView;
    _timelineView: PlayerEventsTimeline;
    constructor();
    onProperty(property: Protocol.Media.PlayerProperty): void;
    onError(_error: Protocol.Media.PlayerError): void;
    onMessage(message: Protocol.Media.PlayerMessage): void;
    onEvent(event: PlayerEvent): void;
}
