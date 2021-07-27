// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description The type of media, for example - video, audio, or text. Capitalized.
    */
    video: 'Video',
    /**
    *@description The type of media, for example - video, audio, or text. Capitalized.
    */
    audio: 'Audio',
    /**
    *@description A video or audio stream - but capitalized.
    */
    track: 'Track',
    /**
    *@description A device that converts media files into playable streams of audio or video.
    */
    decoder: 'Decoder',
    /**
    *@description Title of the 'Properties' tool in the sidebar of the elements tool
    */
    properties: 'Properties',
    /**
    *@description Menu label for text tracks, it is followed by a number, like 'Text Track #1'
    */
    textTrack: 'Text track',
    /**
    * @description Placeholder text stating that there are no text tracks on this player. A text track
    * is all of the text that accompanies a particular video.
    */
    noTextTracks: 'No text tracks',
    /**
    *@description Media property giving the width x height of the video
    */
    resolution: 'Resolution',
    /**
    *@description Media property giving the file size of the media
    */
    fileSize: 'File size',
    /**
    *@description Media property giving the media file bitrate
    */
    bitrate: 'Bitrate',
    /**
    *@description Text for the duration of something
    */
    duration: 'Duration',
    /**
    *@description The label for a timestamp when a video was started.
    */
    startTime: 'Start time',
    /**
    *@description Media property signaling whether the media is streaming
    */
    streaming: 'Streaming',
    /**
    *@description Media property describing where the media is playing from.
    */
    playbackFrameUrl: 'Playback frame URL',
    /**
    *@description Media property giving the title of the frame where the media is embedded
    */
    playbackFrameTitle: 'Playback frame title',
    /**
    *@description Media property describing whether the file is single or cross origin in nature
    */
    singleoriginPlayback: 'Single-origin playback',
    /**
    *@description Media property describing support for range http headers
    */
    rangeHeaderSupport: '`Range` header support',
    /**
    *@description Media property giving the media file frame rate
    */
    frameRate: 'Frame rate',
    /**
    * @description Media property giving the distance of the playback quality from the ideal playback.
    * Roughness is the opposite to smoothness, i.e. whether each frame of the video was played at the
    * right time so that the video looks smooth when it plays.
    */
    videoPlaybackRoughness: 'Video playback roughness',
    /**
    *@description A score describing how choppy the video playback is.
    */
    videoFreezingScore: 'Video freezing score',
    /**
    *@description Media property giving the name of the decoder being used
    */
    decoderName: 'Decoder name',
    /**
    *@description There is no decoder
    */
    noDecoder: 'No decoder',
    /**
    *@description Media property signaling whether a hardware decoder is being used
    */
    hardwareDecoder: 'Hardware decoder',
    /**
    *@description Media property signaling whether the content is encrypted. This is a noun phrase for
    *a demultiplexer that does decryption.
    */
    decryptingDemuxer: 'Decrypting demuxer',
    /**
    *@description Media property giving the name of the video encoder being used.
    */
    encoderName: 'Encoder name',
    /**
    *@description There is no encoder.
    */
    noEncoder: 'No encoder',
    /**
    *@description Media property signaling whether the encoder is hardware accelerated.
    */
    hardwareEncoder: 'Hardware encoder',
};
const str_ = i18n.i18n.registerUIStrings('panels/media/PlayerPropertiesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class PropertyRenderer extends UI.Widget.VBox {
    _title;
    _contents;
    _value;
    _pseudoColorProtectionElement;
    constructor(title) {
        super();
        this.contentElement.classList.add('media-property-renderer');
        const titleElement = this.contentElement.createChild('span', 'media-property-renderer-title');
        this._contents = this.contentElement.createChild('span', 'media-property-renderer-contents');
        UI.UIUtils.createTextChild(titleElement, title);
        this._title = title;
        this._value = null;
        this._pseudoColorProtectionElement = null;
        this.contentElement.classList.add('media-property-renderer-hidden');
    }
    updateData(propname, propvalue) {
        // convert all empty possibilities into nulls for easier handling.
        if (propvalue === '' || propvalue === null) {
            return this._updateData(propname, null);
        }
        try {
            propvalue = JSON.parse(propvalue);
        }
        catch (err) {
            // TODO(tmathmeyer) typecheck the type of propvalue against
            // something defined or sourced from the c++ definitions.
            // Do nothing, some strings just stay strings!
        }
        return this._updateData(propname, propvalue);
    }
    _updateData(propname, propvalue) {
        if (propvalue === null) {
            this.changeContents(null);
        }
        else if (this._value === propvalue) {
            return; // Don't rebuild element!
        }
        else {
            this._value = propvalue;
            this.changeContents(propvalue);
        }
    }
    changeContents(value) {
        if (value === null) {
            this.contentElement.classList.add('media-property-renderer-hidden');
            if (this._pseudoColorProtectionElement === null) {
                this._pseudoColorProtectionElement = document.createElement('div');
                this._pseudoColorProtectionElement.classList.add('media-property-renderer');
                this._pseudoColorProtectionElement.classList.add('media-property-renderer-hidden');
                this.contentElement.parentNode
                    .insertBefore(this._pseudoColorProtectionElement, this.contentElement);
            }
        }
        else {
            if (this._pseudoColorProtectionElement !== null) {
                this._pseudoColorProtectionElement.remove();
                this._pseudoColorProtectionElement = null;
            }
            this.contentElement.classList.remove('media-property-renderer-hidden');
            this._contents.removeChildren();
            const spanElement = document.createElement('span');
            spanElement.textContent = value;
            this._contents.appendChild(spanElement);
        }
    }
}
export class FormattedPropertyRenderer extends PropertyRenderer {
    _formatfunction;
    constructor(title, formatfunction) {
        super(i18nString(title));
        this._formatfunction = formatfunction;
    }
    _updateData(propname, propvalue) {
        if (propvalue === null) {
            this.changeContents(null);
        }
        else {
            this.changeContents(this._formatfunction(propvalue));
        }
    }
}
export class DefaultPropertyRenderer extends PropertyRenderer {
    constructor(title, defaultText) {
        super(i18nString(title));
        this.changeContents(defaultText);
    }
}
export class DimensionPropertyRenderer extends PropertyRenderer {
    _width;
    _height;
    constructor(title) {
        super(i18nString(title));
        this._width = 0;
        this._height = 0;
    }
    _updateData(propname, propvalue) {
        let needsUpdate = false;
        if (propname === 'width' && Number(propvalue) !== this._width) {
            this._width = Number(propvalue);
            needsUpdate = true;
        }
        if (propname === 'height' && Number(propvalue) !== this._height) {
            this._height = Number(propvalue);
            needsUpdate = true;
        }
        // If both properties arent set, don't bother updating, since
        // temporarily showing ie: 1920x0 is meaningless.
        if (this._width === 0 || this._height === 0) {
            this.changeContents(null);
        }
        else if (needsUpdate) {
            this.changeContents(`${this._width}×${this._height}`);
        }
    }
}
export class AttributesView extends UI.Widget.VBox {
    _contentHash;
    constructor(elements) {
        super();
        this._contentHash = 0;
        this.contentElement.classList.add('media-attributes-view');
        for (const element of elements) {
            element.show(this.contentElement);
            // We just need a really simple way to compare the topical equality
            // of the attributes views in order to avoid deleting and recreating
            // a node containing exactly the same data.
            const content = this.contentElement.textContent;
            if (content !== null) {
                this._contentHash += Platform.StringUtilities.hashCode(content);
            }
        }
    }
    getContentHash() {
        return this._contentHash;
    }
}
export class TrackManager {
    _type;
    _view;
    constructor(propertiesView, type) {
        this._type = type;
        this._view = propertiesView;
    }
    updateData(_name, value) {
        const tabs = this._view.getTabs(this._type);
        const newTabs = JSON.parse(value);
        let enumerate = 1;
        for (const tabData of newTabs) {
            this.addNewTab(tabs, tabData, enumerate);
            enumerate++;
        }
    }
    addNewTab(tabs, tabData, tabNumber) {
        const tabElements = [];
        for (const [name, data] of Object.entries(tabData)) {
            tabElements.push(new DefaultPropertyRenderer(name, data));
        }
        const newTab = new AttributesView(tabElements);
        tabs.addNewTab(tabNumber, newTab);
    }
}
export class VideoTrackManager extends TrackManager {
    constructor(propertiesView) {
        super(propertiesView, 'video');
    }
}
export class TextTrackManager extends TrackManager {
    constructor(propertiesView) {
        super(propertiesView, 'text');
    }
}
export class AudioTrackManager extends TrackManager {
    constructor(propertiesView) {
        super(propertiesView, 'audio');
    }
}
const TrackTypeLocalized = {
    Video: i18nLazyString(UIStrings.video),
    Audio: i18nLazyString(UIStrings.audio),
};
class GenericTrackMenu extends UI.TabbedPane.TabbedPane {
    _decoderName;
    _trackName;
    constructor(decoderName, trackName = i18nString(UIStrings.track)) {
        super();
        this._decoderName = decoderName;
        this._trackName = trackName;
    }
    addNewTab(trackNumber, element) {
        const localizedTrackLower = i18nString(UIStrings.track);
        const tabId = `Track${trackNumber}`;
        if (this.hasTab(tabId)) {
            const tabElement = this.tabView(tabId);
            if (tabElement === null) {
                return;
            }
            if (tabElement.getContentHash() === element.getContentHash()) {
                return;
            }
            this.closeTab(tabId, /* userGesture=*/ false);
        }
        this.appendTab(tabId, // No need for localizing, internal ID.
        `${this._trackName} #${trackNumber}`, element, `${this._decoderName} ${localizedTrackLower} #${trackNumber}`);
    }
}
class DecoderTrackMenu extends GenericTrackMenu {
    constructor(decoderName, informationalElement) {
        super(decoderName);
        const decoderLocalized = i18nString(UIStrings.decoder);
        const title = `${decoderName} ${decoderLocalized}`;
        const propertiesLocalized = i18nString(UIStrings.properties);
        const hoverText = `${title} ${propertiesLocalized}`;
        this.appendTab('DecoderProperties', title, informationalElement, hoverText);
    }
}
class NoTracksPlaceholderMenu extends UI.Widget.VBox {
    _isPlaceholder;
    _wrapping;
    constructor(wrapping, placeholderText) {
        super();
        this._isPlaceholder = true;
        this._wrapping = wrapping;
        this._wrapping.appendTab('_placeholder', placeholderText, new UI.Widget.VBox(), placeholderText);
        this._wrapping.show(this.contentElement);
    }
    addNewTab(trackNumber, element) {
        if (this._isPlaceholder) {
            this._wrapping.closeTab('_placeholder');
            this._isPlaceholder = false;
        }
        this._wrapping.addNewTab(trackNumber, element);
    }
}
export class PlayerPropertiesView extends UI.Widget.VBox {
    _mediaElements;
    _videoDecoderElements;
    _audioDecoderElements;
    _textTrackElements;
    _attributeMap;
    _videoProperties;
    _videoDecoderProperties;
    _audioDecoderProperties;
    _videoDecoderTabs;
    _audioDecoderTabs;
    _textTracksTabs;
    constructor() {
        super();
        this.contentElement.classList.add('media-properties-frame');
        this.registerRequiredCSS('panels/media/playerPropertiesView.css', { enableLegacyPatching: false });
        this._mediaElements = [];
        this._videoDecoderElements = [];
        this._audioDecoderElements = [];
        this._textTrackElements = [];
        this._attributeMap = new Map();
        this.populateAttributesAndElements();
        this._videoProperties = new AttributesView(this._mediaElements);
        this._videoDecoderProperties = new AttributesView(this._videoDecoderElements);
        this._audioDecoderProperties = new AttributesView(this._audioDecoderElements);
        this._videoProperties.show(this.contentElement);
        this._videoDecoderTabs = new DecoderTrackMenu(TrackTypeLocalized.Video(), this._videoDecoderProperties);
        this._videoDecoderTabs.show(this.contentElement);
        this._audioDecoderTabs = new DecoderTrackMenu(TrackTypeLocalized.Audio(), this._audioDecoderProperties);
        this._audioDecoderTabs.show(this.contentElement);
        this._textTracksTabs = null;
    }
    _lazyCreateTrackTabs() {
        let textTracksTabs = this._textTracksTabs;
        if (textTracksTabs === null) {
            const textTracks = new GenericTrackMenu(i18nString(UIStrings.textTrack));
            textTracksTabs = new NoTracksPlaceholderMenu(textTracks, i18nString(UIStrings.noTextTracks));
            textTracksTabs.show(this.contentElement);
            this._textTracksTabs = textTracksTabs;
        }
        return textTracksTabs;
    }
    getTabs(type) {
        if (type === 'audio') {
            return this._audioDecoderTabs;
        }
        if (type === 'video') {
            return this._videoDecoderTabs;
        }
        if (type === 'text') {
            return this._lazyCreateTrackTabs();
        }
        // There should be no other type allowed.
        throw new Error('Unreachable');
    }
    onProperty(property) {
        const renderer = this._attributeMap.get(property.name);
        if (!renderer) {
            throw new Error(`Player property "${property.name}" not supported.`);
        }
        renderer.updateData(property.name, property.value);
    }
    formatKbps(bitsPerSecond) {
        if (bitsPerSecond === '') {
            return '0 kbps';
        }
        const kbps = Math.floor(Number(bitsPerSecond) / 1000);
        return `${kbps} kbps`;
    }
    formatTime(seconds) {
        if (seconds === '') {
            return '0:00';
        }
        const date = new Date();
        date.setSeconds(Number(seconds));
        return date.toISOString().substr(11, 8);
    }
    formatFileSize(bytes) {
        if (bytes === '') {
            return '0 bytes';
        }
        const actualBytes = Number(bytes);
        if (actualBytes < 1000) {
            return `${bytes} bytes`;
        }
        const power = Math.floor(Math.log10(actualBytes) / 3);
        const suffix = ['bytes', 'kB', 'MB', 'GB', 'TB'][power];
        const bytesDecimal = (actualBytes / Math.pow(1000, power)).toFixed(2);
        return `${bytesDecimal} ${suffix}`;
    }
    populateAttributesAndElements() {
        /* Media properties */
        const resolution = new PropertyRenderer(i18nString(UIStrings.resolution));
        this._mediaElements.push(resolution);
        this._attributeMap.set("kResolution" /* Resolution */, resolution);
        const fileSize = new FormattedPropertyRenderer(i18nString(UIStrings.fileSize), this.formatFileSize);
        this._mediaElements.push(fileSize);
        this._attributeMap.set("kTotalBytes" /* TotalBytes */, fileSize);
        const bitrate = new FormattedPropertyRenderer(i18nString(UIStrings.bitrate), this.formatKbps);
        this._mediaElements.push(bitrate);
        this._attributeMap.set("kBitrate" /* Bitrate */, bitrate);
        const duration = new FormattedPropertyRenderer(i18nString(UIStrings.duration), this.formatTime);
        this._mediaElements.push(duration);
        this._attributeMap.set("kMaxDuration" /* MaxDuration */, duration);
        const startTime = new PropertyRenderer(i18nString(UIStrings.startTime));
        this._mediaElements.push(startTime);
        this._attributeMap.set("kStartTime" /* StartTime */, startTime);
        const streaming = new PropertyRenderer(i18nString(UIStrings.streaming));
        this._mediaElements.push(streaming);
        this._attributeMap.set("kIsStreaming" /* IsStreaming */, streaming);
        const frameUrl = new PropertyRenderer(i18nString(UIStrings.playbackFrameUrl));
        this._mediaElements.push(frameUrl);
        this._attributeMap.set("kFrameUrl" /* FrameUrl */, frameUrl);
        const frameTitle = new PropertyRenderer(i18nString(UIStrings.playbackFrameTitle));
        this._mediaElements.push(frameTitle);
        this._attributeMap.set("kFrameTitle" /* FrameTitle */, frameTitle);
        const singleOrigin = new PropertyRenderer(i18nString(UIStrings.singleoriginPlayback));
        this._mediaElements.push(singleOrigin);
        this._attributeMap.set("kIsSingleOrigin" /* IsSingleOrigin */, singleOrigin);
        const rangeHeaders = new PropertyRenderer(i18nString(UIStrings.rangeHeaderSupport));
        this._mediaElements.push(rangeHeaders);
        this._attributeMap.set("kIsRangeHeaderSupported" /* IsRangeHeaderSupported */, rangeHeaders);
        const frameRate = new PropertyRenderer(i18nString(UIStrings.frameRate));
        this._mediaElements.push(frameRate);
        this._attributeMap.set("kFramerate" /* Framerate */, frameRate);
        const roughness = new PropertyRenderer(i18nString(UIStrings.videoPlaybackRoughness));
        this._mediaElements.push(roughness);
        this._attributeMap.set("kVideoPlaybackRoughness" /* VideoPlaybackRoughness */, roughness);
        const freezingScore = new PropertyRenderer(i18nString(UIStrings.videoFreezingScore));
        this._mediaElements.push(freezingScore);
        this._attributeMap.set("kVideoPlaybackFreezing" /* VideoPlaybackFreezing */, freezingScore);
        /* Video Decoder Properties */
        const decoderName = new DefaultPropertyRenderer(i18nString(UIStrings.decoderName), i18nString(UIStrings.noDecoder));
        this._videoDecoderElements.push(decoderName);
        this._attributeMap.set("kVideoDecoderName" /* VideoDecoderName */, decoderName);
        const videoPlatformDecoder = new PropertyRenderer(i18nString(UIStrings.hardwareDecoder));
        this._videoDecoderElements.push(videoPlatformDecoder);
        this._attributeMap.set("kIsPlatformVideoDecoder" /* IsPlatformVideoDecoder */, videoPlatformDecoder);
        const encoderName = new DefaultPropertyRenderer(i18nString(UIStrings.encoderName), i18nString(UIStrings.noEncoder));
        this._videoDecoderElements.push(encoderName);
        this._attributeMap.set("kVideoEncoderName" /* VideoEncoderName */, encoderName);
        const videoPlatformEncoder = new PropertyRenderer(i18nString(UIStrings.hardwareEncoder));
        this._videoDecoderElements.push(videoPlatformEncoder);
        this._attributeMap.set("kIsPlatformVideoEncoder" /* IsPlatformVideoEncoder */, videoPlatformEncoder);
        const videoDDS = new PropertyRenderer(i18nString(UIStrings.decryptingDemuxer));
        this._videoDecoderElements.push(videoDDS);
        this._attributeMap.set("kIsVideoDecryptingDemuxerStream" /* IsVideoDecryptingDemuxerStream */, videoDDS);
        const videoTrackManager = new VideoTrackManager(this);
        this._attributeMap.set("kVideoTracks" /* VideoTracks */, videoTrackManager);
        /* Audio Decoder Properties */
        const audioDecoder = new DefaultPropertyRenderer(i18nString(UIStrings.decoderName), i18nString(UIStrings.noDecoder));
        this._audioDecoderElements.push(audioDecoder);
        this._attributeMap.set("kAudioDecoderName" /* AudioDecoderName */, audioDecoder);
        const audioPlatformDecoder = new PropertyRenderer(i18nString(UIStrings.hardwareDecoder));
        this._audioDecoderElements.push(audioPlatformDecoder);
        this._attributeMap.set("kIsPlatformAudioDecoder" /* IsPlatformAudioDecoder */, audioPlatformDecoder);
        const audioDDS = new PropertyRenderer(i18nString(UIStrings.decryptingDemuxer));
        this._audioDecoderElements.push(audioDDS);
        this._attributeMap.set("kIsAudioDecryptingDemuxerStream" /* IsAudioDecryptingDemuxerStream */, audioDDS);
        const audioTrackManager = new AudioTrackManager(this);
        this._attributeMap.set("kAudioTracks" /* AudioTracks */, audioTrackManager);
        const textTrackManager = new TextTrackManager(this);
        this._attributeMap.set("kTextTracks" /* TextTracks */, textTrackManager);
    }
}
//# sourceMappingURL=PlayerPropertiesView.js.map