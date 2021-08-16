import type { PlayerEvent } from './MediaModel.js';
import type { Event } from './TickingFlameChart.js';
import { TickingFlameChart } from './TickingFlameChart.js';
declare type State = {
    [key: string]: string;
};
export declare class PlayerEventsTimeline extends TickingFlameChart {
    _normalizedTimestamp: number;
    _playbackStatusLastEvent: Event | null;
    _audioBufferingStateEvent: Event | null;
    _videoBufferingStateEvent: Event | null;
    constructor();
    _ensureNoPreviousPlaybackEvent(normalizedTime: number): void;
    /**
     * Playback events are {kPlay, kPause, kSuspended, kEnded, and kWebMediaPlayerDestroyed}
     * once destroyed, a player cannot recieve more events of any kind.
     */
    _onPlaybackEvent(event: PlayerEvent, normalizedTime: number): void;
    _bufferedEnough(state: State): boolean;
    _onBufferingStatus(event: PlayerEvent, normalizedTime: number): void;
    onEvent(event: PlayerEvent): void;
}
export {};
