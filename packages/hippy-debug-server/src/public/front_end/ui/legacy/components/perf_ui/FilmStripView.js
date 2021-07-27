// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as UI from '../../legacy.js';
const UIStrings = {
    /**
    *@description Element title in Film Strip View of the Performance panel
    */
    doubleclickToZoomImageClickTo: 'Doubleclick to zoom image. Click to view preceding requests.',
    /**
    *@description Aria label for captured screenshots in network panel.
    *@example {3ms} PH1
    */
    screenshotForSSelectToView: 'Screenshot for {PH1} - select to view preceding requests.',
    /**
    *@description Text for one or a group of screenshots
    */
    screenshot: 'Screenshot',
    /**
    *@description Prev button title in Film Strip View of the Performance panel
    */
    previousFrame: 'Previous frame',
    /**
    *@description Next button title in Film Strip View of the Performance panel
    */
    nextFrame: 'Next frame',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/perf_ui/FilmStripView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FilmStripView extends UI.Widget.HBox {
    _statusLabel;
    _zeroTime;
    _spanTime;
    _model;
    _mode;
    constructor() {
        super(true);
        this.registerRequiredCSS('ui/legacy/components/perf_ui/filmStripView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('film-strip-view');
        this._statusLabel = this.contentElement.createChild('div', 'label');
        this.reset();
        this.setMode(Modes.TimeBased);
    }
    static _setImageData(imageElement, data) {
        if (data) {
            imageElement.src = 'data:image/jpg;base64,' + data;
        }
    }
    setMode(mode) {
        this._mode = mode;
        this.contentElement.classList.toggle('time-based', mode === Modes.TimeBased);
        this.update();
    }
    setModel(filmStripModel, zeroTime, spanTime) {
        this._model = filmStripModel;
        this._zeroTime = zeroTime;
        this._spanTime = spanTime;
        const frames = filmStripModel.frames();
        if (!frames.length) {
            this.reset();
            return;
        }
        this.update();
    }
    createFrameElement(frame) {
        const time = frame.timestamp;
        const frameTime = i18n.i18n.millisToString(time - this._zeroTime);
        const element = document.createElement('div');
        element.classList.add('frame');
        UI.Tooltip.Tooltip.install(element, i18nString(UIStrings.doubleclickToZoomImageClickTo));
        element.createChild('div', 'time').textContent = frameTime;
        element.tabIndex = 0;
        element.setAttribute('aria-label', i18nString(UIStrings.screenshotForSSelectToView, { PH1: frameTime }));
        UI.ARIAUtils.markAsButton(element);
        const imageElement = element.createChild('div', 'thumbnail').createChild('img');
        imageElement.alt = i18nString(UIStrings.screenshot);
        element.addEventListener('mousedown', this._onMouseEvent.bind(this, Events.FrameSelected, time), false);
        element.addEventListener('mouseenter', this._onMouseEvent.bind(this, Events.FrameEnter, time), false);
        element.addEventListener('mouseout', this._onMouseEvent.bind(this, Events.FrameExit, time), false);
        element.addEventListener('dblclick', this._onDoubleClick.bind(this, frame), false);
        element.addEventListener('focusin', this._onMouseEvent.bind(this, Events.FrameEnter, time), false);
        element.addEventListener('focusout', this._onMouseEvent.bind(this, Events.FrameExit, time), false);
        element.addEventListener('keydown', event => {
            if (event.code === 'Enter' || event.code === 'Space') {
                this._onMouseEvent(Events.FrameSelected, time);
            }
        });
        return frame.imageDataPromise().then(FilmStripView._setImageData.bind(null, imageElement)).then(returnElement);
        function returnElement() {
            return element;
        }
    }
    frameByTime(time) {
        function comparator(time, frame) {
            return time - frame.timestamp;
        }
        // Using the first frame to fill the interval between recording start
        // and a moment the frame is taken.
        const frames = this._model.frames();
        const index = Math.max(Platform.ArrayUtilities.upperBound(frames, time, comparator) - 1, 0);
        return frames[index];
    }
    update() {
        if (!this._model) {
            return;
        }
        const frames = this._model.frames();
        if (!frames.length) {
            return;
        }
        if (this._mode === Modes.FrameBased) {
            Promise.all(frames.map(this.createFrameElement.bind(this))).then(appendElements.bind(this));
            return;
        }
        const width = this.contentElement.clientWidth;
        const scale = this._spanTime / width;
        this.createFrameElement(frames[0]).then(continueWhenFrameImageLoaded.bind(this)); // Calculate frame width basing on the first frame.
        function continueWhenFrameImageLoaded(element0) {
            const frameWidth = Math.ceil(UI.UIUtils.measurePreferredSize(element0, this.contentElement).width);
            if (!frameWidth) {
                return;
            }
            const promises = [];
            for (let pos = frameWidth; pos < width; pos += frameWidth) {
                const time = pos * scale + this._zeroTime;
                promises.push(this.createFrameElement(this.frameByTime(time)).then(fixWidth));
            }
            Promise.all(promises).then(appendElements.bind(this));
            function fixWidth(element) {
                element.style.width = frameWidth + 'px';
                return element;
            }
        }
        function appendElements(elements) {
            this.contentElement.removeChildren();
            for (let i = 0; i < elements.length; ++i) {
                this.contentElement.appendChild(elements[i]);
            }
        }
    }
    onResize() {
        if (this._mode === Modes.FrameBased) {
            return;
        }
        this.update();
    }
    _onMouseEvent(eventName, timestamp) {
        this.dispatchEventToListeners(eventName, timestamp);
    }
    _onDoubleClick(filmStripFrame) {
        new Dialog(filmStripFrame, this._zeroTime);
    }
    reset() {
        this._zeroTime = 0;
        this.contentElement.removeChildren();
        this.contentElement.appendChild(this._statusLabel);
    }
    setStatusText(text) {
        this._statusLabel.textContent = text;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["FrameSelected"] = "FrameSelected";
    Events["FrameEnter"] = "FrameEnter";
    Events["FrameExit"] = "FrameExit";
})(Events || (Events = {}));
export const Modes = {
    TimeBased: 'TimeBased',
    FrameBased: 'FrameBased',
};
export class Dialog {
    _fragment;
    _widget;
    _frames;
    _index;
    _zeroTime;
    _dialog;
    constructor(filmStripFrame, zeroTime) {
        const prevButton = UI.UIUtils.createTextButton('\u25C0', this._onPrevFrame.bind(this));
        UI.Tooltip.Tooltip.install(prevButton, i18nString(UIStrings.previousFrame));
        const nextButton = UI.UIUtils.createTextButton('\u25B6', this._onNextFrame.bind(this));
        UI.Tooltip.Tooltip.install(nextButton, i18nString(UIStrings.nextFrame));
        this._fragment = UI.Fragment.Fragment.build `
      <x-widget flex=none margin=12px>
        <x-hbox overflow=auto border='1px solid #ddd'>
          <img $='image' style="max-height: 80vh; max-width: 80vw;"></img>
        </x-hbox>
        <x-hbox x-center justify-content=center margin-top=10px>
          ${prevButton}
          <x-hbox $='time' margin=8px></x-hbox>
          ${nextButton}
        </x-hbox>
      </x-widget>
    `;
        this._widget = this._fragment.element();
        this._widget.tabIndex = 0;
        this._widget.addEventListener('keydown', this._keyDown.bind(this), false);
        this._frames = filmStripFrame.model().frames();
        this._index = filmStripFrame.index;
        this._zeroTime = zeroTime || filmStripFrame.model().zeroTime();
        this._dialog = null;
        this._render();
    }
    _resize() {
        if (!this._dialog) {
            this._dialog = new UI.Dialog.Dialog();
            this._dialog.contentElement.appendChild(this._widget);
            this._dialog.setDefaultFocusedElement(this._widget);
            // Dialog can take an undefined `where` param for show(), however its superclass (GlassPane)
            // requires a Document. TypeScript is unhappy that show() is not given a parameter here,
            // however, so marking it as an ignore.
            // @ts-ignore See above.
            this._dialog.show();
        }
        this._dialog.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);
    }
    _keyDown(event) {
        const keyboardEvent = event;
        switch (keyboardEvent.key) {
            case 'ArrowLeft':
                if (Host.Platform.isMac() && keyboardEvent.metaKey) {
                    this._onFirstFrame();
                }
                else {
                    this._onPrevFrame();
                }
                break;
            case 'ArrowRight':
                if (Host.Platform.isMac() && keyboardEvent.metaKey) {
                    this._onLastFrame();
                }
                else {
                    this._onNextFrame();
                }
                break;
            case 'Home':
                this._onFirstFrame();
                break;
            case 'End':
                this._onLastFrame();
                break;
        }
    }
    _onPrevFrame() {
        if (this._index > 0) {
            --this._index;
        }
        this._render();
    }
    _onNextFrame() {
        if (this._index < this._frames.length - 1) {
            ++this._index;
        }
        this._render();
    }
    _onFirstFrame() {
        this._index = 0;
        this._render();
    }
    _onLastFrame() {
        this._index = this._frames.length - 1;
        this._render();
    }
    _render() {
        const frame = this._frames[this._index];
        this._fragment.$('time').textContent = i18n.i18n.millisToString(frame.timestamp - this._zeroTime);
        return frame.imageDataPromise()
            .then(imageData => {
            const image = this._fragment.$('image');
            return FilmStripView._setImageData(image, imageData);
        })
            .then(this._resize.bind(this));
    }
}
//# sourceMappingURL=FilmStripView.js.map