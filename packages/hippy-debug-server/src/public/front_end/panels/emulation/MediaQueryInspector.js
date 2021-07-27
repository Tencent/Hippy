// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    * @description A context menu item/command in the Media Query Inspector of the Device Toolbar.
    * Takes the user to the source code where this media query actually came from.
    */
    revealInSourceCode: 'Reveal in source code',
};
const str_ = i18n.i18n.registerUIStrings('panels/emulation/MediaQueryInspector.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class MediaQueryInspector extends UI.Widget.Widget {
    _mediaThrottler;
    _getWidthCallback;
    _setWidthCallback;
    _scale;
    elementsToMediaQueryModel;
    elementsToCSSLocations;
    _cssModel;
    _cachedQueryModels;
    constructor(getWidthCallback, setWidthCallback) {
        super(true);
        this.registerRequiredCSS('panels/emulation/mediaQueryInspector.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('media-inspector-view');
        this.contentElement.addEventListener('click', this._onMediaQueryClicked.bind(this), false);
        this.contentElement.addEventListener('contextmenu', this._onContextMenu.bind(this), false);
        this._mediaThrottler = new Common.Throttler.Throttler(0);
        this._getWidthCallback = getWidthCallback;
        this._setWidthCallback = setWidthCallback;
        this._scale = 1;
        this.elementsToMediaQueryModel = new WeakMap();
        this.elementsToCSSLocations = new WeakMap();
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.CSSModel.CSSModel, this);
        UI.ZoomManager.ZoomManager.instance().addEventListener("ZoomChanged" /* ZoomChanged */, this._renderMediaQueries.bind(this), this);
    }
    modelAdded(cssModel) {
        // FIXME: adapt this to multiple targets.
        if (this._cssModel) {
            return;
        }
        this._cssModel = cssModel;
        this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded, this._scheduleMediaQueriesUpdate, this);
        this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetRemoved, this._scheduleMediaQueriesUpdate, this);
        this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetChanged, this._scheduleMediaQueriesUpdate, this);
        this._cssModel.addEventListener(SDK.CSSModel.Events.MediaQueryResultChanged, this._scheduleMediaQueriesUpdate, this);
    }
    modelRemoved(cssModel) {
        if (cssModel !== this._cssModel) {
            return;
        }
        this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetAdded, this._scheduleMediaQueriesUpdate, this);
        this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetRemoved, this._scheduleMediaQueriesUpdate, this);
        this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetChanged, this._scheduleMediaQueriesUpdate, this);
        this._cssModel.removeEventListener(SDK.CSSModel.Events.MediaQueryResultChanged, this._scheduleMediaQueriesUpdate, this);
        delete this._cssModel;
    }
    setAxisTransform(scale) {
        if (Math.abs(this._scale - scale) < 1e-8) {
            return;
        }
        this._scale = scale;
        this._renderMediaQueries();
    }
    _onMediaQueryClicked(event) {
        const mediaQueryMarker = event.target.enclosingNodeOrSelfWithClass('media-inspector-bar');
        if (!mediaQueryMarker) {
            return;
        }
        const model = this.elementsToMediaQueryModel.get(mediaQueryMarker);
        if (!model) {
            return;
        }
        const modelMaxWidth = model.maxWidthExpression();
        const modelMinWidth = model.minWidthExpression();
        if (model.section() === 0 /* Max */) {
            this._setWidthCallback(modelMaxWidth ? modelMaxWidth.computedLength() || 0 : 0);
            return;
        }
        if (model.section() === 2 /* Min */) {
            this._setWidthCallback(modelMinWidth ? modelMinWidth.computedLength() || 0 : 0);
            return;
        }
        const currentWidth = this._getWidthCallback();
        if (modelMinWidth && currentWidth !== modelMinWidth.computedLength()) {
            this._setWidthCallback(modelMinWidth.computedLength() || 0);
        }
        else {
            this._setWidthCallback(modelMaxWidth ? modelMaxWidth.computedLength() || 0 : 0);
        }
    }
    _onContextMenu(event) {
        if (!this._cssModel || !this._cssModel.isEnabled()) {
            return;
        }
        const mediaQueryMarker = event.target.enclosingNodeOrSelfWithClass('media-inspector-bar');
        if (!mediaQueryMarker) {
            return;
        }
        const locations = this.elementsToCSSLocations.get(mediaQueryMarker) || [];
        const uiLocations = new Map();
        for (let i = 0; i < locations.length; ++i) {
            const uiLocation = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().rawLocationToUILocation(locations[i]);
            if (!uiLocation) {
                continue;
            }
            const descriptor = typeof uiLocation.columnNumber === 'number' ?
                Platform.StringUtilities.sprintf('%s:%d:%d', uiLocation.uiSourceCode.url(), uiLocation.lineNumber + 1, uiLocation.columnNumber + 1) :
                Platform.StringUtilities.sprintf('%s:%d', uiLocation.uiSourceCode.url(), uiLocation.lineNumber + 1);
            uiLocations.set(descriptor, uiLocation);
        }
        const contextMenuItems = [...uiLocations.keys()].sort();
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        const subMenuItem = contextMenu.defaultSection().appendSubMenuItem(i18nString(UIStrings.revealInSourceCode));
        for (let i = 0; i < contextMenuItems.length; ++i) {
            const title = contextMenuItems[i];
            subMenuItem.defaultSection().appendItem(title, this._revealSourceLocation.bind(this, uiLocations.get(title)));
        }
        contextMenu.show();
    }
    _revealSourceLocation(location) {
        Common.Revealer.reveal(location);
    }
    _scheduleMediaQueriesUpdate() {
        if (!this.isShowing()) {
            return;
        }
        this._mediaThrottler.schedule(this._refetchMediaQueries.bind(this));
    }
    _refetchMediaQueries() {
        if (!this.isShowing() || !this._cssModel) {
            return Promise.resolve();
        }
        return this._cssModel.mediaQueriesPromise().then(this._rebuildMediaQueries.bind(this));
    }
    _squashAdjacentEqual(models) {
        const filtered = [];
        for (let i = 0; i < models.length; ++i) {
            const last = filtered[filtered.length - 1];
            if (!last || !last.equals(models[i])) {
                filtered.push(models[i]);
            }
        }
        return filtered;
    }
    _rebuildMediaQueries(cssMedias) {
        let queryModels = [];
        for (let i = 0; i < cssMedias.length; ++i) {
            const cssMedia = cssMedias[i];
            if (!cssMedia.mediaList) {
                continue;
            }
            for (let j = 0; j < cssMedia.mediaList.length; ++j) {
                const mediaQuery = cssMedia.mediaList[j];
                const queryModel = MediaQueryUIModel.createFromMediaQuery(cssMedia, mediaQuery);
                if (queryModel) {
                    queryModels.push(queryModel);
                }
            }
        }
        queryModels.sort(compareModels);
        queryModels = this._squashAdjacentEqual(queryModels);
        let allEqual = this._cachedQueryModels && this._cachedQueryModels.length === queryModels.length;
        for (let i = 0; allEqual && i < queryModels.length; ++i) {
            allEqual = allEqual && this._cachedQueryModels && this._cachedQueryModels[i].equals(queryModels[i]);
        }
        if (allEqual) {
            return;
        }
        this._cachedQueryModels = queryModels;
        this._renderMediaQueries();
        function compareModels(model1, model2) {
            return model1.compareTo(model2);
        }
    }
    _renderMediaQueries() {
        if (!this._cachedQueryModels || !this.isShowing()) {
            return;
        }
        const markers = [];
        let lastMarker = null;
        for (let i = 0; i < this._cachedQueryModels.length; ++i) {
            const model = this._cachedQueryModels[i];
            if (lastMarker && lastMarker.model.dimensionsEqual(model)) {
                lastMarker.active = lastMarker.active || model.active();
            }
            else {
                lastMarker = {
                    active: model.active(),
                    model,
                    locations: [],
                };
                markers.push(lastMarker);
            }
            const rawLocation = model.rawLocation();
            if (rawLocation) {
                lastMarker.locations.push(rawLocation);
            }
        }
        this.contentElement.removeChildren();
        let container = null;
        for (let i = 0; i < markers.length; ++i) {
            if (!i || markers[i].model.section() !== markers[i - 1].model.section()) {
                container = this.contentElement.createChild('div', 'media-inspector-marker-container');
            }
            const marker = markers[i];
            const bar = this._createElementFromMediaQueryModel(marker.model);
            this.elementsToMediaQueryModel.set(bar, marker.model);
            this.elementsToCSSLocations.set(bar, marker.locations);
            bar.classList.toggle('media-inspector-marker-inactive', !marker.active);
            if (!container) {
                throw new Error('Could not find container to render media queries into.');
            }
            container.appendChild(bar);
        }
    }
    _zoomFactor() {
        return UI.ZoomManager.ZoomManager.instance().zoomFactor() / this._scale;
    }
    wasShown() {
        this._scheduleMediaQueriesUpdate();
    }
    _createElementFromMediaQueryModel(model) {
        const zoomFactor = this._zoomFactor();
        const minWidthExpression = model.minWidthExpression();
        const maxWidthExpression = model.maxWidthExpression();
        const minWidthValue = minWidthExpression ? (minWidthExpression.computedLength() || 0) / zoomFactor : 0;
        const maxWidthValue = maxWidthExpression ? (maxWidthExpression.computedLength() || 0) / zoomFactor : 0;
        const result = document.createElement('div');
        result.classList.add('media-inspector-bar');
        if (model.section() === 0 /* Max */) {
            result.createChild('div', 'media-inspector-marker-spacer');
            const markerElement = result.createChild('div', 'media-inspector-marker media-inspector-marker-max-width');
            markerElement.style.width = maxWidthValue + 'px';
            UI.Tooltip.Tooltip.install(markerElement, model.mediaText());
            appendLabel(markerElement, model.maxWidthExpression(), false, false);
            appendLabel(markerElement, model.maxWidthExpression(), true, true);
            result.createChild('div', 'media-inspector-marker-spacer');
        }
        if (model.section() === 1 /* MinMax */) {
            result.createChild('div', 'media-inspector-marker-spacer');
            const leftElement = result.createChild('div', 'media-inspector-marker media-inspector-marker-min-max-width');
            leftElement.style.width = (maxWidthValue - minWidthValue) * 0.5 + 'px';
            UI.Tooltip.Tooltip.install(leftElement, model.mediaText());
            appendLabel(leftElement, model.maxWidthExpression(), true, false);
            appendLabel(leftElement, model.minWidthExpression(), false, true);
            result.createChild('div', 'media-inspector-marker-spacer').style.flex = '0 0 ' + minWidthValue + 'px';
            const rightElement = result.createChild('div', 'media-inspector-marker media-inspector-marker-min-max-width');
            rightElement.style.width = (maxWidthValue - minWidthValue) * 0.5 + 'px';
            UI.Tooltip.Tooltip.install(rightElement, model.mediaText());
            appendLabel(rightElement, model.minWidthExpression(), true, false);
            appendLabel(rightElement, model.maxWidthExpression(), false, true);
            result.createChild('div', 'media-inspector-marker-spacer');
        }
        if (model.section() === 2 /* Min */) {
            const leftElement = result.createChild('div', 'media-inspector-marker media-inspector-marker-min-width media-inspector-marker-min-width-left');
            UI.Tooltip.Tooltip.install(leftElement, model.mediaText());
            appendLabel(leftElement, model.minWidthExpression(), false, false);
            result.createChild('div', 'media-inspector-marker-spacer').style.flex = '0 0 ' + minWidthValue + 'px';
            const rightElement = result.createChild('div', 'media-inspector-marker media-inspector-marker-min-width media-inspector-marker-min-width-right');
            UI.Tooltip.Tooltip.install(rightElement, model.mediaText());
            appendLabel(rightElement, model.minWidthExpression(), true, true);
        }
        function appendLabel(marker, expression, atLeft, leftAlign) {
            if (!expression) {
                return;
            }
            marker
                .createChild('div', 'media-inspector-marker-label-container ' +
                (atLeft ? 'media-inspector-marker-label-container-left' :
                    'media-inspector-marker-label-container-right'))
                .createChild('span', 'media-inspector-marker-label ' +
                (leftAlign ? 'media-inspector-label-left' : 'media-inspector-label-right'))
                .textContent = expression.value() + expression.unit();
        }
        return result;
    }
}
export class MediaQueryUIModel {
    _cssMedia;
    _minWidthExpression;
    _maxWidthExpression;
    _active;
    _section;
    _rawLocation;
    constructor(cssMedia, minWidthExpression, maxWidthExpression, active) {
        this._cssMedia = cssMedia;
        this._minWidthExpression = minWidthExpression;
        this._maxWidthExpression = maxWidthExpression;
        this._active = active;
        if (maxWidthExpression && !minWidthExpression) {
            this._section = 0 /* Max */;
        }
        else if (minWidthExpression && maxWidthExpression) {
            this._section = 1 /* MinMax */;
        }
        else {
            this._section = 2 /* Min */;
        }
    }
    static createFromMediaQuery(cssMedia, mediaQuery) {
        let maxWidthExpression = null;
        let maxWidthPixels = Number.MAX_VALUE;
        let minWidthExpression = null;
        let minWidthPixels = Number.MIN_VALUE;
        const expressions = mediaQuery.expressions();
        if (!expressions) {
            return null;
        }
        for (let i = 0; i < expressions.length; ++i) {
            const expression = expressions[i];
            const feature = expression.feature();
            if (feature.indexOf('width') === -1) {
                continue;
            }
            const pixels = expression.computedLength();
            if (feature.startsWith('max-') && pixels && pixels < maxWidthPixels) {
                maxWidthExpression = expression;
                maxWidthPixels = pixels;
            }
            else if (feature.startsWith('min-') && pixels && pixels > minWidthPixels) {
                minWidthExpression = expression;
                minWidthPixels = pixels;
            }
        }
        if (minWidthPixels > maxWidthPixels || (!maxWidthExpression && !minWidthExpression)) {
            return null;
        }
        return new MediaQueryUIModel(cssMedia, minWidthExpression, maxWidthExpression, mediaQuery.active());
    }
    equals(other) {
        return this.compareTo(other) === 0;
    }
    dimensionsEqual(other) {
        const thisMinWidthExpression = this.minWidthExpression();
        const otherMinWidthExpression = other.minWidthExpression();
        const thisMaxWidthExpression = this.maxWidthExpression();
        const otherMaxWidthExpression = other.maxWidthExpression();
        const sectionsEqual = this.section() === other.section();
        // If there isn't an other min width expression, they aren't equal, so the optional chaining operator is safe to use here.
        const minWidthEqual = !thisMinWidthExpression ||
            thisMinWidthExpression.computedLength() === otherMinWidthExpression?.computedLength();
        const maxWidthEqual = !thisMaxWidthExpression ||
            thisMaxWidthExpression.computedLength() === otherMaxWidthExpression?.computedLength();
        return sectionsEqual && minWidthEqual && maxWidthEqual;
    }
    compareTo(other) {
        if (this.section() !== other.section()) {
            return this.section() - other.section();
        }
        if (this.dimensionsEqual(other)) {
            const myLocation = this.rawLocation();
            const otherLocation = other.rawLocation();
            if (!myLocation && !otherLocation) {
                return Platform.StringUtilities.compare(this.mediaText(), other.mediaText());
            }
            if (myLocation && !otherLocation) {
                return 1;
            }
            if (!myLocation && otherLocation) {
                return -1;
            }
            if (this.active() !== other.active()) {
                return this.active() ? -1 : 1;
            }
            if (!myLocation || !otherLocation) {
                // This conditional never runs, because it's dealt with above, but
                // TypeScript can't follow that by this point both myLocation and
                // otherLocation must exist.
                return 0;
            }
            return Platform.StringUtilities.compare(myLocation.url, otherLocation.url) ||
                myLocation.lineNumber - otherLocation.lineNumber || myLocation.columnNumber - otherLocation.columnNumber;
        }
        const thisMaxWidthExpression = this.maxWidthExpression();
        const otherMaxWidthExpression = other.maxWidthExpression();
        const thisMaxLength = thisMaxWidthExpression ? thisMaxWidthExpression.computedLength() || 0 : 0;
        const otherMaxLength = otherMaxWidthExpression ? otherMaxWidthExpression.computedLength() || 0 : 0;
        const thisMinWidthExpression = this.minWidthExpression();
        const otherMinWidthExpression = other.minWidthExpression();
        const thisMinLength = thisMinWidthExpression ? thisMinWidthExpression.computedLength() || 0 : 0;
        const otherMinLength = otherMinWidthExpression ? otherMinWidthExpression.computedLength() || 0 : 0;
        if (this.section() === 0 /* Max */) {
            return otherMaxLength - thisMaxLength;
        }
        if (this.section() === 2 /* Min */) {
            return thisMinLength - otherMinLength;
        }
        return thisMinLength - otherMinLength || otherMaxLength - thisMaxLength;
    }
    section() {
        return this._section;
    }
    mediaText() {
        return this._cssMedia.text || '';
    }
    rawLocation() {
        if (!this._rawLocation) {
            this._rawLocation = this._cssMedia.rawLocation();
        }
        return this._rawLocation;
    }
    minWidthExpression() {
        return this._minWidthExpression;
    }
    maxWidthExpression() {
        return this._maxWidthExpression;
    }
    active() {
        return this._active;
    }
}
//# sourceMappingURL=MediaQueryInspector.js.map