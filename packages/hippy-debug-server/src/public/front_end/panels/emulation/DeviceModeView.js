// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
import { DeviceModeModel, MaxDeviceSize, MinDeviceSize, Type } from './DeviceModeModel.js';
import { DeviceModeToolbar } from './DeviceModeToolbar.js';
import { MediaQueryInspector } from './MediaQueryInspector.js';
const UIStrings = {
    /**
    *@description Bottom resizer element title in Device Mode View of the Device Toolbar
    */
    doubleclickForFullHeight: 'Double-click for full height',
    /**
     * @description Name of a device that the user can select to emulate. Small mobile device.
     * Translation of this phrase should be limited to 10 characters.
     */
    mobileS: 'Mobile S',
    /**
     * @description Name of a device that the user can select to emulate. Medium mobile device.
     * Translation of this phrase should be limited to 10 characters.
     */
    mobileM: 'Mobile M',
    /**
     * @description Name of a device that the user can select to emulate. Large mobile device.
     * Translation of this phrase should be limited to 10 characters.
     */
    mobileL: 'Mobile L',
    /**
     * @description Name of a device that the user can select to emulate. Tablet device.
     * Translation of this phrase should be limited to 10 characters.
     */
    tablet: 'Tablet',
    /**
     * @description Name of a device that the user can select to emulate. Laptop device.
     * Translation of this phrase should be limited to 10 characters.
     */
    laptop: 'Laptop',
    /**
     * @description Name of a device that the user can select to emulate. Large laptop device.
     * Translation of this phrase should be limited to 10 characters.
     */
    laptopL: 'Laptop L',
};
const str_ = i18n.i18n.registerUIStrings('panels/emulation/DeviceModeView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class DeviceModeView extends UI.Widget.VBox {
    wrapperInstance;
    blockElementToWidth;
    _model;
    _mediaInspector;
    _showMediaInspectorSetting;
    _showRulersSetting;
    _topRuler;
    _leftRuler;
    _presetBlocks;
    _responsivePresetsContainer;
    _screenArea;
    _pageArea;
    _outlineImage;
    _contentClip;
    _contentArea;
    _rightResizerElement;
    _leftResizerElement;
    _bottomResizerElement;
    _bottomRightResizerElement;
    _bottomLeftResizerElement;
    _cachedResizable;
    _mediaInspectorContainer;
    _screenImage;
    _toolbar;
    _slowPositionStart;
    _resizeStart;
    _cachedCssScreenRect;
    _cachedCssVisiblePageRect;
    _cachedOutlineRect;
    _cachedMediaInspectorVisible;
    _cachedShowRulers;
    _cachedScale;
    _handleWidth;
    _handleHeight;
    constructor() {
        super(true);
        this.blockElementToWidth = new WeakMap();
        this.setMinimumSize(150, 150);
        this.element.classList.add('device-mode-view');
        this.registerRequiredCSS('panels/emulation/deviceModeView.css', { enableLegacyPatching: false });
        UI.Tooltip.Tooltip.addNativeOverrideContainer(this.contentElement);
        this._model = DeviceModeModel.instance();
        this._model.addEventListener("Updated" /* Updated */, this._updateUI, this);
        this._mediaInspector =
            new MediaQueryInspector(() => this._model.appliedDeviceSize().width, this._model.setWidth.bind(this._model));
        this._showMediaInspectorSetting = Common.Settings.Settings.instance().moduleSetting('showMediaQueryInspector');
        this._showMediaInspectorSetting.addChangeListener(this._updateUI, this);
        this._showRulersSetting = Common.Settings.Settings.instance().moduleSetting('emulation.showRulers');
        this._showRulersSetting.addChangeListener(this._updateUI, this);
        this._topRuler = new Ruler(true, this._model.setWidthAndScaleToFit.bind(this._model));
        this._topRuler.element.classList.add('device-mode-ruler-top');
        this._leftRuler = new Ruler(false, this._model.setHeightAndScaleToFit.bind(this._model));
        this._leftRuler.element.classList.add('device-mode-ruler-left');
        this._createUI();
        UI.ZoomManager.ZoomManager.instance().addEventListener("ZoomChanged" /* ZoomChanged */, this._zoomChanged, this);
    }
    _createUI() {
        this._toolbar = new DeviceModeToolbar(this._model, this._showMediaInspectorSetting, this._showRulersSetting);
        this.contentElement.appendChild(this._toolbar.element());
        this._contentClip = this.contentElement.createChild('div', 'device-mode-content-clip vbox');
        this._responsivePresetsContainer =
            this._contentClip.createChild('div', 'device-mode-presets-container');
        this._populatePresetsContainer();
        this._mediaInspectorContainer =
            this._contentClip.createChild('div', 'device-mode-media-container');
        this._contentArea = this._contentClip.createChild('div', 'device-mode-content-area');
        this._outlineImage = this._contentArea.createChild('img', 'device-mode-outline-image hidden fill');
        this._outlineImage.addEventListener('load', this._onImageLoaded.bind(this, this._outlineImage, true), false);
        this._outlineImage.addEventListener('error', this._onImageLoaded.bind(this, this._outlineImage, false), false);
        this._screenArea = this._contentArea.createChild('div', 'device-mode-screen-area');
        this._screenImage = this._screenArea.createChild('img', 'device-mode-screen-image hidden');
        this._screenImage.addEventListener('load', this._onImageLoaded.bind(this, this._screenImage, true), false);
        this._screenImage.addEventListener('error', this._onImageLoaded.bind(this, this._screenImage, false), false);
        this._bottomRightResizerElement =
            this._screenArea.createChild('div', 'device-mode-resizer device-mode-bottom-right-resizer');
        this._bottomRightResizerElement.createChild('div', '');
        this._createResizer(this._bottomRightResizerElement, 2, 1);
        this._bottomLeftResizerElement =
            this._screenArea.createChild('div', 'device-mode-resizer device-mode-bottom-left-resizer');
        this._bottomLeftResizerElement.createChild('div', '');
        this._createResizer(this._bottomLeftResizerElement, -2, 1);
        this._rightResizerElement =
            this._screenArea.createChild('div', 'device-mode-resizer device-mode-right-resizer');
        this._rightResizerElement.createChild('div', '');
        this._createResizer(this._rightResizerElement, 2, 0);
        this._leftResizerElement =
            this._screenArea.createChild('div', 'device-mode-resizer device-mode-left-resizer');
        this._leftResizerElement.createChild('div', '');
        this._createResizer(this._leftResizerElement, -2, 0);
        this._bottomResizerElement =
            this._screenArea.createChild('div', 'device-mode-resizer device-mode-bottom-resizer');
        this._bottomResizerElement.createChild('div', '');
        this._createResizer(this._bottomResizerElement, 0, 1);
        this._bottomResizerElement.addEventListener('dblclick', this._model.setHeight.bind(this._model, 0), false);
        UI.Tooltip.Tooltip.install(this._bottomResizerElement, i18nString(UIStrings.doubleclickForFullHeight));
        this._pageArea = this._screenArea.createChild('div', 'device-mode-page-area');
        this._pageArea.createChild('slot');
    }
    _populatePresetsContainer() {
        const sizes = [320, 375, 425, 768, 1024, 1440, 2560];
        const titles = [
            i18nString(UIStrings.mobileS),
            i18nString(UIStrings.mobileM),
            i18nString(UIStrings.mobileL),
            i18nString(UIStrings.tablet),
            i18nString(UIStrings.laptop),
            i18nString(UIStrings.laptopL),
            '4K',
        ];
        this._presetBlocks = [];
        const inner = this._responsivePresetsContainer.createChild('div', 'device-mode-presets-container-inner');
        for (let i = sizes.length - 1; i >= 0; --i) {
            const outer = inner.createChild('div', 'fill device-mode-preset-bar-outer');
            const block = outer.createChild('div', 'device-mode-preset-bar');
            block.createChild('span').textContent = titles[i] + ' \u2013 ' + sizes[i] + 'px';
            block.addEventListener('click', applySize.bind(this, sizes[i]), false);
            this.blockElementToWidth.set(block, sizes[i]);
            this._presetBlocks.push(block);
        }
        function applySize(width, e) {
            this._model.emulate(Type.Responsive, null, null);
            this._model.setWidthAndScaleToFit(width);
            e.consume();
        }
    }
    _createResizer(element, widthFactor, heightFactor) {
        const resizer = new UI.ResizerWidget.ResizerWidget();
        resizer.addElement(element);
        let cursor = widthFactor ? 'ew-resize' : 'ns-resize';
        if (widthFactor * heightFactor > 0) {
            cursor = 'nwse-resize';
        }
        if (widthFactor * heightFactor < 0) {
            cursor = 'nesw-resize';
        }
        resizer.setCursor(cursor);
        resizer.addEventListener(UI.ResizerWidget.Events.ResizeStart, this._onResizeStart, this);
        resizer.addEventListener(UI.ResizerWidget.Events.ResizeUpdate, this._onResizeUpdate.bind(this, widthFactor, heightFactor));
        resizer.addEventListener(UI.ResizerWidget.Events.ResizeEnd, this._onResizeEnd, this);
        return resizer;
    }
    _onResizeStart() {
        this._slowPositionStart = null;
        this._resizeStart = this._model.screenRect().size();
    }
    _onResizeUpdate(widthFactor, heightFactor, event) {
        if (event.data.shiftKey !== Boolean(this._slowPositionStart)) {
            this._slowPositionStart = event.data.shiftKey ? { x: event.data.currentX, y: event.data.currentY } : null;
        }
        let cssOffsetX = event.data.currentX - event.data.startX;
        let cssOffsetY = event.data.currentY - event.data.startY;
        if (this._slowPositionStart) {
            cssOffsetX =
                (event.data.currentX - this._slowPositionStart.x) / 10 + this._slowPositionStart.x - event.data.startX;
            cssOffsetY =
                (event.data.currentY - this._slowPositionStart.y) / 10 + this._slowPositionStart.y - event.data.startY;
        }
        if (widthFactor && this._resizeStart) {
            const dipOffsetX = cssOffsetX * UI.ZoomManager.ZoomManager.instance().zoomFactor();
            let newWidth = this._resizeStart.width + dipOffsetX * widthFactor;
            newWidth = Math.round(newWidth / this._model.scale());
            if (newWidth >= MinDeviceSize && newWidth <= MaxDeviceSize) {
                this._model.setWidth(newWidth);
            }
        }
        if (heightFactor && this._resizeStart) {
            const dipOffsetY = cssOffsetY * UI.ZoomManager.ZoomManager.instance().zoomFactor();
            let newHeight = this._resizeStart.height + dipOffsetY * heightFactor;
            newHeight = Math.round(newHeight / this._model.scale());
            if (newHeight >= MinDeviceSize && newHeight <= MaxDeviceSize) {
                this._model.setHeight(newHeight);
            }
        }
    }
    exitHingeMode() {
        if (this._model) {
            this._model.exitHingeMode();
        }
    }
    _onResizeEnd() {
        delete this._resizeStart;
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.ResizedViewInResponsiveMode);
    }
    _updateUI() {
        function applyRect(element, rect) {
            element.style.left = rect.left + 'px';
            element.style.top = rect.top + 'px';
            element.style.width = rect.width + 'px';
            element.style.height = rect.height + 'px';
        }
        if (!this.isShowing()) {
            return;
        }
        const zoomFactor = UI.ZoomManager.ZoomManager.instance().zoomFactor();
        let callDoResize = false;
        const showRulers = this._showRulersSetting.get() && this._model.type() !== Type.None;
        let contentAreaResized = false;
        let updateRulers = false;
        const cssScreenRect = this._model.screenRect().scale(1 / zoomFactor);
        if (!this._cachedCssScreenRect || !cssScreenRect.isEqual(this._cachedCssScreenRect)) {
            applyRect(this._screenArea, cssScreenRect);
            updateRulers = true;
            callDoResize = true;
            this._cachedCssScreenRect = cssScreenRect;
        }
        const cssVisiblePageRect = this._model.visiblePageRect().scale(1 / zoomFactor);
        if (!this._cachedCssVisiblePageRect || !cssVisiblePageRect.isEqual(this._cachedCssVisiblePageRect)) {
            applyRect(this._pageArea, cssVisiblePageRect);
            callDoResize = true;
            this._cachedCssVisiblePageRect = cssVisiblePageRect;
        }
        const outlineRectFromModel = this._model.outlineRect();
        if (outlineRectFromModel) {
            const outlineRect = outlineRectFromModel.scale(1 / zoomFactor);
            if (!this._cachedOutlineRect || !outlineRect.isEqual(this._cachedOutlineRect)) {
                applyRect(this._outlineImage, outlineRect);
                callDoResize = true;
                this._cachedOutlineRect = outlineRect;
            }
        }
        this._contentClip.classList.toggle('device-mode-outline-visible', Boolean(this._model.outlineImage()));
        const resizable = this._model.type() === Type.Responsive;
        if (resizable !== this._cachedResizable) {
            this._rightResizerElement.classList.toggle('hidden', !resizable);
            this._leftResizerElement.classList.toggle('hidden', !resizable);
            this._bottomResizerElement.classList.toggle('hidden', !resizable);
            this._bottomRightResizerElement.classList.toggle('hidden', !resizable);
            this._bottomLeftResizerElement.classList.toggle('hidden', !resizable);
            this._cachedResizable = resizable;
        }
        const mediaInspectorVisible = this._showMediaInspectorSetting.get() && this._model.type() !== Type.None;
        if (mediaInspectorVisible !== this._cachedMediaInspectorVisible) {
            if (mediaInspectorVisible) {
                this._mediaInspector.show(this._mediaInspectorContainer);
            }
            else {
                this._mediaInspector.detach();
            }
            contentAreaResized = true;
            callDoResize = true;
            this._cachedMediaInspectorVisible = mediaInspectorVisible;
        }
        if (showRulers !== this._cachedShowRulers) {
            this._contentClip.classList.toggle('device-mode-rulers-visible', showRulers);
            if (showRulers) {
                this._topRuler.show(this._contentArea);
                this._leftRuler.show(this._contentArea);
            }
            else {
                this._topRuler.detach();
                this._leftRuler.detach();
            }
            contentAreaResized = true;
            callDoResize = true;
            this._cachedShowRulers = showRulers;
        }
        if (this._model.scale() !== this._cachedScale) {
            updateRulers = true;
            callDoResize = true;
            for (const block of this._presetBlocks) {
                const blockWidth = this.blockElementToWidth.get(block);
                if (!blockWidth) {
                    throw new Error('Could not get width for block.');
                }
                block.style.width = blockWidth * this._model.scale() + 'px';
            }
            this._cachedScale = this._model.scale();
        }
        this._toolbar.update();
        this._loadImage(this._screenImage, this._model.screenImage());
        this._loadImage(this._outlineImage, this._model.outlineImage());
        this._mediaInspector.setAxisTransform(this._model.scale());
        if (callDoResize) {
            this.doResize();
        }
        if (updateRulers) {
            this._topRuler.render(this._model.scale());
            this._leftRuler.render(this._model.scale());
            this._topRuler.element.positionAt(this._cachedCssScreenRect ? this._cachedCssScreenRect.left : 0, this._cachedCssScreenRect ? this._cachedCssScreenRect.top : 0);
            this._leftRuler.element.positionAt(this._cachedCssScreenRect ? this._cachedCssScreenRect.left : 0, this._cachedCssScreenRect ? this._cachedCssScreenRect.top : 0);
        }
        if (contentAreaResized) {
            this._contentAreaResized();
        }
    }
    _loadImage(element, srcset) {
        if (element.getAttribute('srcset') === srcset) {
            return;
        }
        element.setAttribute('srcset', srcset);
        if (!srcset) {
            element.classList.toggle('hidden', true);
        }
    }
    _onImageLoaded(element, success) {
        element.classList.toggle('hidden', !success);
    }
    setNonEmulatedAvailableSize(element) {
        if (this._model.type() !== Type.None) {
            return;
        }
        const zoomFactor = UI.ZoomManager.ZoomManager.instance().zoomFactor();
        const rect = element.getBoundingClientRect();
        const availableSize = new UI.Geometry.Size(Math.max(rect.width * zoomFactor, 1), Math.max(rect.height * zoomFactor, 1));
        this._model.setAvailableSize(availableSize, availableSize);
    }
    _contentAreaResized() {
        const zoomFactor = UI.ZoomManager.ZoomManager.instance().zoomFactor();
        const rect = this._contentArea.getBoundingClientRect();
        const availableSize = new UI.Geometry.Size(Math.max(rect.width * zoomFactor, 1), Math.max(rect.height * zoomFactor, 1));
        const preferredSize = new UI.Geometry.Size(Math.max((rect.width - 2 * (this._handleWidth || 0)) * zoomFactor, 1), Math.max((rect.height - (this._handleHeight || 0)) * zoomFactor, 1));
        this._model.setAvailableSize(availableSize, preferredSize);
    }
    _measureHandles() {
        const hidden = this._rightResizerElement.classList.contains('hidden');
        this._rightResizerElement.classList.toggle('hidden', false);
        this._bottomResizerElement.classList.toggle('hidden', false);
        this._handleWidth = this._rightResizerElement.offsetWidth;
        this._handleHeight = this._bottomResizerElement.offsetHeight;
        this._rightResizerElement.classList.toggle('hidden', hidden);
        this._bottomResizerElement.classList.toggle('hidden', hidden);
    }
    _zoomChanged() {
        delete this._handleWidth;
        delete this._handleHeight;
        if (this.isShowing()) {
            this._measureHandles();
            this._contentAreaResized();
        }
    }
    onResize() {
        if (this.isShowing()) {
            this._contentAreaResized();
        }
    }
    wasShown() {
        this._measureHandles();
        this._toolbar.restore();
    }
    willHide() {
        this._model.emulate(Type.None, null, null);
    }
    async captureScreenshot() {
        const screenshot = await this._model.captureScreenshot(false);
        if (screenshot === null) {
            return;
        }
        const pageImage = new Image();
        pageImage.src = 'data:image/png;base64,' + screenshot;
        pageImage.onload = async () => {
            const scale = pageImage.naturalWidth / this._model.screenRect().width;
            const outlineRectFromModel = this._model.outlineRect();
            if (!outlineRectFromModel) {
                throw new Error('Unable to take screenshot: no outlineRect available.');
            }
            const outlineRect = outlineRectFromModel.scale(scale);
            const screenRect = this._model.screenRect().scale(scale);
            const visiblePageRect = this._model.visiblePageRect().scale(scale);
            const contentLeft = screenRect.left + visiblePageRect.left - outlineRect.left;
            const contentTop = screenRect.top + visiblePageRect.top - outlineRect.top;
            const canvas = document.createElement('canvas');
            canvas.width = Math.floor(outlineRect.width);
            canvas.height = Math.floor(outlineRect.height);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get 2d context from canvas.');
            }
            ctx.imageSmoothingEnabled = false;
            if (this._model.outlineImage()) {
                await this._paintImage(ctx, this._model.outlineImage(), outlineRect.relativeTo(outlineRect));
            }
            if (this._model.screenImage()) {
                await this._paintImage(ctx, this._model.screenImage(), screenRect.relativeTo(outlineRect));
            }
            ctx.drawImage(pageImage, Math.floor(contentLeft), Math.floor(contentTop));
            this._saveScreenshot(canvas);
        };
    }
    async captureFullSizeScreenshot() {
        const screenshot = await this._model.captureScreenshot(true);
        if (screenshot === null) {
            return;
        }
        return this._saveScreenshotBase64(screenshot);
    }
    async captureAreaScreenshot(clip) {
        const screenshot = await this._model.captureScreenshot(false, clip);
        if (screenshot === null) {
            return;
        }
        return this._saveScreenshotBase64(screenshot);
    }
    _saveScreenshotBase64(screenshot) {
        const pageImage = new Image();
        pageImage.src = 'data:image/png;base64,' + screenshot;
        pageImage.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = pageImage.naturalWidth;
            canvas.height = pageImage.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get 2d context for base64 screenshot.');
            }
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(pageImage, 0, 0);
            this._saveScreenshot(canvas);
        };
    }
    _paintImage(ctx, src, rect) {
        return new Promise(resolve => {
            const image = new Image();
            image.crossOrigin = 'Anonymous';
            image.srcset = src;
            image.onerror = () => resolve();
            image.onload = () => {
                ctx.drawImage(image, rect.left, rect.top, rect.width, rect.height);
                resolve();
            };
        });
    }
    _saveScreenshot(canvas) {
        const url = this._model.inspectedURL();
        let fileName = '';
        if (url) {
            const withoutFragment = Platform.StringUtilities.removeURLFragment(url);
            fileName = Platform.StringUtilities.trimURL(withoutFragment);
        }
        const device = this._model.device();
        if (device && this._model.type() === Type.Device) {
            fileName += `(${device.title})`;
        }
        const link = document.createElement('a');
        link.download = fileName + '.png';
        canvas.toBlob(blob => {
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    }
}
export class Ruler extends UI.Widget.VBox {
    _contentElement;
    _horizontal;
    _scale;
    _count;
    _throttler;
    _applyCallback;
    _renderedScale;
    _renderedZoomFactor;
    constructor(horizontal, applyCallback) {
        super();
        this.element.classList.add('device-mode-ruler');
        this._contentElement =
            this.element.createChild('div', 'device-mode-ruler-content').createChild('div', 'device-mode-ruler-inner');
        this._horizontal = horizontal;
        this._scale = 1;
        this._count = 0;
        this._throttler = new Common.Throttler.Throttler(0);
        this._applyCallback = applyCallback;
    }
    render(scale) {
        this._scale = scale;
        this._throttler.schedule(this._update.bind(this));
    }
    onResize() {
        this._throttler.schedule(this._update.bind(this));
    }
    _update() {
        const zoomFactor = UI.ZoomManager.ZoomManager.instance().zoomFactor();
        const size = this._horizontal ? this._contentElement.offsetWidth : this._contentElement.offsetHeight;
        if (this._scale !== this._renderedScale || zoomFactor !== this._renderedZoomFactor) {
            this._contentElement.removeChildren();
            this._count = 0;
            this._renderedScale = this._scale;
            this._renderedZoomFactor = zoomFactor;
        }
        const dipSize = size * zoomFactor / this._scale;
        const count = Math.ceil(dipSize / 5);
        let step = 1;
        if (this._scale < 0.8) {
            step = 2;
        }
        if (this._scale < 0.6) {
            step = 4;
        }
        if (this._scale < 0.4) {
            step = 8;
        }
        if (this._scale < 0.2) {
            step = 16;
        }
        if (this._scale < 0.1) {
            step = 32;
        }
        for (let i = count; i < this._count; i++) {
            if (!(i % step)) {
                const lastChild = this._contentElement.lastChild;
                if (lastChild) {
                    lastChild.remove();
                }
            }
        }
        for (let i = this._count; i < count; i++) {
            if (i % step) {
                continue;
            }
            const marker = this._contentElement.createChild('div', 'device-mode-ruler-marker');
            if (i) {
                if (this._horizontal) {
                    marker.style.left = (5 * i) * this._scale / zoomFactor + 'px';
                }
                else {
                    marker.style.top = (5 * i) * this._scale / zoomFactor + 'px';
                }
                if (!(i % 20)) {
                    const text = marker.createChild('div', 'device-mode-ruler-text');
                    text.textContent = String(i * 5);
                    text.addEventListener('click', this._onMarkerClick.bind(this, i * 5), false);
                }
            }
            if (!(i % 10)) {
                marker.classList.add('device-mode-ruler-marker-large');
            }
            else if (!(i % 5)) {
                marker.classList.add('device-mode-ruler-marker-medium');
            }
        }
        this._count = count;
        return Promise.resolve();
    }
    _onMarkerClick(size) {
        this._applyCallback.call(null, size);
    }
}
//# sourceMappingURL=DeviceModeView.js.map