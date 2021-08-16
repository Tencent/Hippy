import * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
declare type TabData = {
    [x: string]: string;
};
export declare const enum PlayerPropertyKeys {
    Resolution = "kResolution",
    TotalBytes = "kTotalBytes",
    Bitrate = "kBitrate",
    MaxDuration = "kMaxDuration",
    StartTime = "kStartTime",
    IsVideoEncrypted = "kIsVideoEncrypted",
    IsStreaming = "kIsStreaming",
    FrameUrl = "kFrameUrl",
    FrameTitle = "kFrameTitle",
    IsSingleOrigin = "kIsSingleOrigin",
    IsRangeHeaderSupported = "kIsRangeHeaderSupported",
    VideoDecoderName = "kVideoDecoderName",
    AudioDecoderName = "kAudioDecoderName",
    IsPlatformVideoDecoder = "kIsPlatformVideoDecoder",
    IsPlatformAudioDecoder = "kIsPlatformAudioDecoder",
    VideoEncoderName = "kVideoEncoderName",
    IsPlatformVideoEncoder = "kIsPlatformVideoEncoder",
    IsVideoDecryptingDemuxerStream = "kIsVideoDecryptingDemuxerStream",
    IsAudioDecryptingDemuxerStream = "kIsAudioDecryptingDemuxerStream",
    AudioTracks = "kAudioTracks",
    TextTracks = "kTextTracks",
    VideoTracks = "kVideoTracks",
    Framerate = "kFramerate",
    VideoPlaybackRoughness = "kVideoPlaybackRoughness",
    VideoPlaybackFreezing = "kVideoPlaybackFreezing"
}
export declare class PropertyRenderer extends UI.Widget.VBox {
    _title: string;
    _contents: HTMLElement;
    _value: string | null;
    _pseudoColorProtectionElement: HTMLDivElement | null;
    constructor(title: string);
    updateData(propname: string, propvalue: string): void;
    _updateData(propname: string, propvalue: string | null): void;
    changeContents(value: string | null): void;
}
export declare class FormattedPropertyRenderer extends PropertyRenderer {
    _formatfunction: (arg0: string) => string;
    constructor(title: string, formatfunction: (arg0: string) => string);
    _updateData(propname: string, propvalue: string | null): void;
}
export declare class DefaultPropertyRenderer extends PropertyRenderer {
    constructor(title: string, defaultText: string);
}
export declare class DimensionPropertyRenderer extends PropertyRenderer {
    _width: number;
    _height: number;
    constructor(title: string);
    _updateData(propname: string, propvalue: string | null): void;
}
export declare class AttributesView extends UI.Widget.VBox {
    _contentHash: number;
    constructor(elements: UI.Widget.Widget[]);
    getContentHash(): number;
}
export declare class TrackManager {
    _type: string;
    _view: PlayerPropertiesView;
    constructor(propertiesView: PlayerPropertiesView, type: string);
    updateData(_name: string, value: string): void;
    addNewTab(tabs: GenericTrackMenu | NoTracksPlaceholderMenu, tabData: TabData, tabNumber: number): void;
}
export declare class VideoTrackManager extends TrackManager {
    constructor(propertiesView: PlayerPropertiesView);
}
export declare class TextTrackManager extends TrackManager {
    constructor(propertiesView: PlayerPropertiesView);
}
export declare class AudioTrackManager extends TrackManager {
    constructor(propertiesView: PlayerPropertiesView);
}
declare class GenericTrackMenu extends UI.TabbedPane.TabbedPane {
    _decoderName: string;
    _trackName: string;
    constructor(decoderName: string, trackName?: string);
    addNewTab(trackNumber: number, element: AttributesView): void;
}
declare class DecoderTrackMenu extends GenericTrackMenu {
    constructor(decoderName: string, informationalElement: UI.Widget.Widget);
}
declare class NoTracksPlaceholderMenu extends UI.Widget.VBox {
    _isPlaceholder: boolean;
    _wrapping: GenericTrackMenu;
    constructor(wrapping: GenericTrackMenu, placeholderText: string);
    addNewTab(trackNumber: number, element: AttributesView): void;
}
export declare class PlayerPropertiesView extends UI.Widget.VBox {
    _mediaElements: PropertyRenderer[];
    _videoDecoderElements: PropertyRenderer[];
    _audioDecoderElements: PropertyRenderer[];
    _textTrackElements: PropertyRenderer[];
    _attributeMap: Map<string, PropertyRenderer | TrackManager>;
    _videoProperties: AttributesView;
    _videoDecoderProperties: AttributesView;
    _audioDecoderProperties: AttributesView;
    _videoDecoderTabs: DecoderTrackMenu;
    _audioDecoderTabs: DecoderTrackMenu;
    _textTracksTabs: GenericTrackMenu | NoTracksPlaceholderMenu | null;
    constructor();
    _lazyCreateTrackTabs(): GenericTrackMenu | NoTracksPlaceholderMenu;
    getTabs(type: string): GenericTrackMenu | NoTracksPlaceholderMenu;
    onProperty(property: Protocol.Media.PlayerProperty): void;
    formatKbps(bitsPerSecond: string | number): string;
    formatTime(seconds: string | number): string;
    formatFileSize(bytes: string): string;
    populateAttributesAndElements(): void;
}
export {};
