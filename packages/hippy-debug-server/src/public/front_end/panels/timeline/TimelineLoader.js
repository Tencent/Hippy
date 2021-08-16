// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
const UIStrings = {
    /**
    *@description Text in Timeline Loader of the Performance panel
    */
    malformedTimelineDataUnknownJson: 'Malformed timeline data: Unknown JSON format',
    /**
    *@description Text in Timeline Loader of the Performance panel
    */
    malformedTimelineInputWrongJson: 'Malformed timeline input, wrong JSON brackets balance',
    /**
    *@description Text in Timeline Loader of the Performance panel
    *@example {Unknown JSON format} PH1
    */
    malformedTimelineDataS: 'Malformed timeline data: {PH1}',
    /**
    *@description Text in Timeline Loader of the Performance panel
    */
    legacyTimelineFormatIsNot: 'Legacy Timeline format is not supported.',
    /**
    *@description Text in Timeline Loader of the Performance panel
    */
    malformedCpuProfileFormat: 'Malformed CPU profile format',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineLoader.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineLoader {
    _client;
    _backingStorage;
    _tracingModel;
    _canceledCallback;
    _state;
    _buffer;
    _firstRawChunk;
    _firstChunk;
    _loadedBytes;
    _totalSize;
    _jsonTokenizer;
    constructor(client) {
        this._client = client;
        this._backingStorage = new Bindings.TempFile.TempFileBackingStorage();
        this._tracingModel = new SDK.TracingModel.TracingModel(this._backingStorage);
        this._canceledCallback = null;
        this._state = State.Initial;
        this._buffer = '';
        this._firstRawChunk = true;
        this._firstChunk = true;
        this._loadedBytes = 0;
        this._jsonTokenizer = new TextUtils.TextUtils.BalancedJSONTokenizer(this._writeBalancedJSON.bind(this), true);
    }
    static loadFromFile(file, client) {
        const loader = new TimelineLoader(client);
        const fileReader = new Bindings.FileUtils.ChunkedFileReader(file, TransferChunkLengthBytes);
        loader._canceledCallback = fileReader.cancel.bind(fileReader);
        loader._totalSize = file.size;
        fileReader.read(loader).then(success => {
            if (!success && fileReader.error()) {
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                loader._reportErrorAndCancelLoading(fileReader.error().message);
            }
        });
        return loader;
    }
    static loadFromEvents(events, client) {
        const loader = new TimelineLoader(client);
        setTimeout(async () => {
            const eventsPerChunk = 5000;
            client.loadingStarted();
            for (let i = 0; i < events.length; i += eventsPerChunk) {
                const chunk = events.slice(i, i + eventsPerChunk);
                loader._tracingModel.addEvents(chunk);
                client.loadingProgress((i + chunk.length) / events.length);
                await new Promise(r => setTimeout(r)); // Yield event loop to paint.
            }
            loader.close();
        });
        return loader;
    }
    static loadFromURL(url, client) {
        const loader = new TimelineLoader(client);
        Host.ResourceLoader.loadAsStream(url, null, loader);
        return loader;
    }
    cancel() {
        this._tracingModel = null;
        this._backingStorage.reset();
        if (this._client) {
            this._client.loadingComplete(null);
            this._client = null;
        }
        if (this._canceledCallback) {
            this._canceledCallback();
        }
    }
    async write(chunk) {
        if (!this._client) {
            return Promise.resolve();
        }
        this._loadedBytes += chunk.length;
        if (this._firstRawChunk) {
            await this._client.loadingStarted();
            // Ensure we paint the loading dialog before continuing
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }
        else {
            let progress = undefined;
            if (this._totalSize) {
                progress = this._loadedBytes / this._totalSize;
                // For compressed traces, we can't provide a definite progress percentage. So, just keep it moving.
                progress = progress > 1 ? progress - Math.floor(progress) : progress;
            }
            await this._client.loadingProgress(progress);
        }
        this._firstRawChunk = false;
        if (this._state === State.Initial) {
            if (chunk.startsWith('{"nodes":[')) {
                this._state = State.LoadingCPUProfileFormat;
            }
            else if (chunk[0] === '{') {
                this._state = State.LookingForEvents;
            }
            else if (chunk[0] === '[') {
                this._state = State.ReadingEvents;
            }
            else {
                this._reportErrorAndCancelLoading(i18nString(UIStrings.malformedTimelineDataUnknownJson));
                return Promise.resolve();
            }
        }
        if (this._state === State.LoadingCPUProfileFormat) {
            this._buffer += chunk;
            return Promise.resolve();
        }
        if (this._state === State.LookingForEvents) {
            const objectName = '"traceEvents":';
            const startPos = this._buffer.length - objectName.length;
            this._buffer += chunk;
            const pos = this._buffer.indexOf(objectName, startPos);
            if (pos === -1) {
                return Promise.resolve();
            }
            chunk = this._buffer.slice(pos + objectName.length);
            this._state = State.ReadingEvents;
        }
        if (this._state !== State.ReadingEvents) {
            return Promise.resolve();
        }
        if (this._jsonTokenizer.write(chunk)) {
            return Promise.resolve();
        }
        this._state = State.SkippingTail;
        if (this._firstChunk) {
            this._reportErrorAndCancelLoading(i18nString(UIStrings.malformedTimelineInputWrongJson));
        }
        return Promise.resolve();
    }
    _writeBalancedJSON(data) {
        let json = data + ']';
        if (!this._firstChunk) {
            const commaIndex = json.indexOf(',');
            if (commaIndex !== -1) {
                json = json.slice(commaIndex + 1);
            }
            json = '[' + json;
        }
        let items;
        try {
            items = JSON.parse(json);
        }
        catch (e) {
            this._reportErrorAndCancelLoading(i18nString(UIStrings.malformedTimelineDataS, { PH1: e.toString() }));
            return;
        }
        if (this._firstChunk) {
            this._firstChunk = false;
            if (this._looksLikeAppVersion(items[0])) {
                this._reportErrorAndCancelLoading(i18nString(UIStrings.legacyTimelineFormatIsNot));
                return;
            }
        }
        try {
            this._tracingModel.addEvents(items);
        }
        catch (e) {
            this._reportErrorAndCancelLoading(i18nString(UIStrings.malformedTimelineDataS, { PH1: e.toString() }));
        }
    }
    _reportErrorAndCancelLoading(message) {
        if (message) {
            Common.Console.Console.instance().error(message);
        }
        this.cancel();
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _looksLikeAppVersion(item) {
        return typeof item === 'string' && item.indexOf('Chrome') !== -1;
    }
    async close() {
        if (!this._client) {
            return;
        }
        this._client.processingStarted();
        setTimeout(() => this._finalizeTrace(), 0);
    }
    _finalizeTrace() {
        if (this._state === State.LoadingCPUProfileFormat) {
            this._parseCPUProfileFormat(this._buffer);
            this._buffer = '';
        }
        this._tracingModel.tracingComplete();
        this._client.loadingComplete(this._tracingModel);
    }
    _parseCPUProfileFormat(text) {
        let traceEvents;
        try {
            const profile = JSON.parse(text);
            traceEvents = TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.buildTraceProfileFromCpuProfile(profile, /* tid */ 1, /* injectPageEvent */ true);
        }
        catch (e) {
            this._reportErrorAndCancelLoading(i18nString(UIStrings.malformedCpuProfileFormat));
            return;
        }
        this._tracingModel.addEvents(traceEvents);
    }
}
export const TransferChunkLengthBytes = 5000000;
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var State;
(function (State) {
    State["Initial"] = "Initial";
    State["LookingForEvents"] = "LookingForEvents";
    State["ReadingEvents"] = "ReadingEvents";
    State["SkippingTail"] = "SkippingTail";
    State["LoadingCPUProfileFormat"] = "LoadingCPUProfileFormat";
})(State || (State = {}));
//# sourceMappingURL=TimelineLoader.js.map