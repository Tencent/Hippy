/*
 * Copyright (C) 2014 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
import { LayerSelection, Selection, SnapshotSelection, ScrollRectSelection } from './LayerViewHost.js';
import { Events as TransformControllerEvents, TransformController } from './TransformController.js';
const UIStrings = {
    /**
    *@description Text of a DOM element in DView of the Layers panel
    */
    layerInformationIsNotYet: 'Layer information is not yet available.',
    /**
    *@description Accessibility label for canvas view in Layers tool
    */
    dLayersView: '3D Layers View',
    /**
    *@description Text in DView of the Layers panel
    */
    cantDisplayLayers: 'Can\'t display layers,',
    /**
    *@description Text in DView of the Layers panel
    */
    webglSupportIsDisabledInYour: 'WebGL support is disabled in your browser.',
    /**
    *@description Text in DView of the Layers panel
    *@example {about:gpu} PH1
    */
    checkSForPossibleReasons: 'Check {PH1} for possible reasons.',
    /**
    *@description Text for a checkbox in the toolbar of the Layers panel to show the area of slow scroll rect
    */
    slowScrollRects: 'Slow scroll rects',
    /**
    * @description Text for a checkbox in the toolbar of the Layers panel. This is a noun, for a
    * setting meaning 'display paints in the layers viewer'. 'Paints' here means 'paint events' i.e.
    * when the browser draws pixels to the screen.
    */
    paints: 'Paints',
    /**
    *@description A context menu item in the DView of the Layers panel
    */
    resetView: 'Reset View',
    /**
    *@description A context menu item in the DView of the Layers panel
    */
    showPaintProfiler: 'Show Paint Profiler',
};
const str_ = i18n.i18n.registerUIStrings('panels/layer_viewer/Layers3DView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const vertexPositionAttributes = new Map();
const vertexColorAttributes = new Map();
const textureCoordAttributes = new Map();
const uniformMatrixLocations = new Map();
const uniformSamplerLocations = new Map();
const imageForTexture = new Map();
export class Layers3DView extends UI.Widget.VBox {
    _failBanner;
    _layerViewHost;
    _transformController;
    _canvasElement;
    _lastSelection;
    _layerTree;
    _textureManager;
    _chromeTextures;
    _rects;
    _snapshotLayers;
    _shaderProgram;
    _oldTextureScale;
    _depthByLayerId;
    _visibleLayers;
    _maxDepth;
    _scale;
    _layerTexture;
    _projectionMatrix;
    _whiteTexture;
    _gl;
    _dimensionsForAutoscale;
    _needsUpdate;
    _panelToolbar;
    _showSlowScrollRectsSetting;
    _showPaintsSetting;
    _mouseDownX;
    _mouseDownY;
    constructor(layerViewHost) {
        super(true);
        this.registerRequiredCSS('panels/layer_viewer/layers3DView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('layers-3d-view');
        this._failBanner = new UI.Widget.VBox();
        this._failBanner.element.classList.add('full-widget-dimmed-banner');
        UI.UIUtils.createTextChild(this._failBanner.element, i18nString(UIStrings.layerInformationIsNotYet));
        this._layerViewHost = layerViewHost;
        this._layerViewHost.registerView(this);
        this._transformController = new TransformController(this.contentElement);
        this._transformController.addEventListener(TransformControllerEvents.TransformChanged, this._update, this);
        this._initToolbar();
        this._canvasElement = this.contentElement.createChild('canvas');
        this._canvasElement.tabIndex = 0;
        this._canvasElement.addEventListener('dblclick', this._onDoubleClick.bind(this), false);
        this._canvasElement.addEventListener('mousedown', this._onMouseDown.bind(this), false);
        this._canvasElement.addEventListener('mouseup', this._onMouseUp.bind(this), false);
        this._canvasElement.addEventListener('mouseleave', this._onMouseMove.bind(this), false);
        this._canvasElement.addEventListener('mousemove', this._onMouseMove.bind(this), false);
        this._canvasElement.addEventListener('contextmenu', this._onContextMenu.bind(this), false);
        UI.ARIAUtils.setAccessibleName(this._canvasElement, i18nString(UIStrings.dLayersView));
        this._lastSelection = {};
        this._layerTree = null;
        this._textureManager = new LayerTextureManager(this._update.bind(this));
        this._chromeTextures = [];
        this._rects = [];
        this._snapshotLayers = new Map();
        this._layerViewHost.setLayerSnapshotMap(this._snapshotLayers);
        this._layerViewHost.showInternalLayersSetting().addChangeListener(this._update, this);
    }
    setLayerTree(layerTree) {
        this._layerTree = layerTree;
        this._layerTexture = null;
        delete this._oldTextureScale;
        if (this._showPaints()) {
            this._textureManager.setLayerTree(layerTree);
        }
        this._update();
    }
    showImageForLayer(layer, imageURL) {
        if (!imageURL) {
            this._layerTexture = null;
            this._update();
            return;
        }
        UI.UIUtils.loadImage(imageURL).then(image => {
            const texture = image && LayerTextureManager._createTextureForImage(this._gl || null, image);
            this._layerTexture = texture ? { layer: layer, texture: texture } : null;
            this._update();
        });
    }
    onResize() {
        this._resizeCanvas();
        this._update();
    }
    willHide() {
        this._textureManager.suspend();
    }
    wasShown() {
        this._textureManager.resume();
        if (!this._needsUpdate) {
            return;
        }
        this._resizeCanvas();
        this._update();
    }
    updateLayerSnapshot(layer) {
        this._textureManager.layerNeedsUpdate(layer);
    }
    _setOutline(type, selection) {
        this._lastSelection[type] = selection;
        this._update();
    }
    hoverObject(selection) {
        this._setOutline(OutlineType.Hovered, selection);
    }
    selectObject(selection) {
        this._setOutline(OutlineType.Hovered, null);
        this._setOutline(OutlineType.Selected, selection);
    }
    snapshotForSelection(selection) {
        if (selection.type() === "Snapshot" /* Snapshot */) {
            const snapshotWithRect = selection.snapshot();
            snapshotWithRect.snapshot.addReference();
            return /** @type {!Promise<?SDK.PaintProfiler.SnapshotWithRect>} */ Promise.resolve(snapshotWithRect);
        }
        if (selection.layer()) {
            const promise = selection.layer().snapshots()[0];
            if (promise !== undefined) {
                return promise;
            }
        }
        return /** @type {!Promise<?SDK.PaintProfiler.SnapshotWithRect>} */ Promise.resolve(null);
    }
    _initGL(canvas) {
        const gl = canvas.getContext('webgl');
        if (!gl) {
            return null;
        }
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.enable(gl.DEPTH_TEST);
        return /** @type {!WebGLRenderingContext} */ gl;
    }
    _createShader(type, script) {
        if (!this._gl) {
            return;
        }
        const shader = this._gl.createShader(type);
        if (shader && this._shaderProgram) {
            this._gl.shaderSource(shader, script);
            this._gl.compileShader(shader);
            this._gl.attachShader(this._shaderProgram, shader);
        }
    }
    _initShaders() {
        if (!this._gl) {
            return;
        }
        this._shaderProgram = this._gl.createProgram();
        if (!this._shaderProgram) {
            return;
        }
        this._createShader(this._gl.FRAGMENT_SHADER, FragmentShader);
        this._createShader(this._gl.VERTEX_SHADER, VertexShader);
        this._gl.linkProgram(this._shaderProgram);
        this._gl.useProgram(this._shaderProgram);
        const aVertexPositionAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aVertexPosition');
        this._gl.enableVertexAttribArray(aVertexPositionAttribute);
        vertexPositionAttributes.set(this._shaderProgram, aVertexPositionAttribute);
        const aVertexColorAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aVertexColor');
        this._gl.enableVertexAttribArray(aVertexColorAttribute);
        vertexColorAttributes.set(this._shaderProgram, aVertexColorAttribute);
        const aTextureCoordAttribute = this._gl.getAttribLocation(this._shaderProgram, 'aTextureCoord');
        this._gl.enableVertexAttribArray(aTextureCoordAttribute);
        textureCoordAttributes.set(this._shaderProgram, aTextureCoordAttribute);
        const uMatrixLocation = this._gl.getUniformLocation(this._shaderProgram, 'uPMatrix');
        uniformMatrixLocations.set(this._shaderProgram, uMatrixLocation);
        const uSamplerLocation = this._gl.getUniformLocation(this._shaderProgram, 'uSampler');
        uniformSamplerLocations.set(this._shaderProgram, uSamplerLocation);
    }
    _resizeCanvas() {
        this._canvasElement.width = this._canvasElement.offsetWidth * window.devicePixelRatio;
        this._canvasElement.height = this._canvasElement.offsetHeight * window.devicePixelRatio;
    }
    _updateTransformAndConstraints() {
        const paddingFraction = 0.1;
        const dimensionsForAutoscale = this._dimensionsForAutoscale || { width: 0, height: 0 };
        const viewport = this._layerTree ? this._layerTree.viewportSize() : null;
        const baseWidth = viewport ? viewport.width : dimensionsForAutoscale.width;
        const baseHeight = viewport ? viewport.height : dimensionsForAutoscale.height;
        const canvasWidth = this._canvasElement.width;
        const canvasHeight = this._canvasElement.height;
        const paddingX = canvasWidth * paddingFraction;
        const paddingY = canvasHeight * paddingFraction;
        const scaleX = (canvasWidth - 2 * paddingX) / baseWidth;
        const scaleY = (canvasHeight - 2 * paddingY) / baseHeight;
        const viewScale = Math.min(scaleX, scaleY);
        const minScaleConstraint = Math.min(baseWidth / dimensionsForAutoscale.width, baseHeight / dimensionsForAutoscale.width) / 2;
        this._transformController.setScaleConstraints(minScaleConstraint, 10 / viewScale); // 1/viewScale is 1:1 in terms of pixels, so allow zooming to 10x of native size
        const scale = this._transformController.scale();
        const rotateX = this._transformController.rotateX();
        const rotateY = this._transformController.rotateY();
        this._scale = scale * viewScale;
        const textureScale = Platform.NumberUtilities.clamp(this._scale, 0.1, 1);
        if (textureScale !== this._oldTextureScale) {
            this._oldTextureScale = textureScale;
            this._textureManager.setScale(textureScale);
            this.dispatchEventToListeners(Events.ScaleChanged, textureScale);
        }
        const scaleAndRotationMatrix = new WebKitCSSMatrix()
            .scale(scale, scale, scale)
            .translate(canvasWidth / 2, canvasHeight / 2, 0)
            .rotate(rotateX, rotateY, 0)
            .scale(viewScale, viewScale, viewScale)
            .translate(-baseWidth / 2, -baseHeight / 2, 0);
        let bounds;
        for (let i = 0; i < this._rects.length; ++i) {
            bounds = UI.Geometry.boundsForTransformedPoints(scaleAndRotationMatrix, this._rects[i].vertices, bounds);
        }
        if (bounds) {
            this._transformController.clampOffsets((paddingX - bounds.maxX) / window.devicePixelRatio, (canvasWidth - paddingX - bounds.minX) / window.devicePixelRatio, (paddingY - bounds.maxY) / window.devicePixelRatio, (canvasHeight - paddingY - bounds.minY) / window.devicePixelRatio);
        }
        const offsetX = this._transformController.offsetX() * window.devicePixelRatio;
        const offsetY = this._transformController.offsetY() * window.devicePixelRatio;
        // Multiply to translation matrix on the right rather than translate (which would implicitly multiply on the left).
        this._projectionMatrix = new WebKitCSSMatrix().translate(offsetX, offsetY, 0).multiply(scaleAndRotationMatrix);
        const glProjectionMatrix = new WebKitCSSMatrix()
            .scale(1, -1, -1)
            .translate(-1, -1, 0)
            .scale(2 / this._canvasElement.width, 2 / this._canvasElement.height, 1 / 1000000)
            .multiply(this._projectionMatrix);
        if (this._shaderProgram) {
            const pMatrixUniform = uniformMatrixLocations.get(this._shaderProgram);
            if (this._gl && pMatrixUniform) {
                this._gl.uniformMatrix4fv(pMatrixUniform, false, this._arrayFromMatrix(glProjectionMatrix));
            }
        }
    }
    _arrayFromMatrix(m) {
        return new Float32Array([
            m.m11,
            m.m12,
            m.m13,
            m.m14,
            m.m21,
            m.m22,
            m.m23,
            m.m24,
            m.m31,
            m.m32,
            m.m33,
            m.m34,
            m.m41,
            m.m42,
            m.m43,
            m.m44,
        ]);
    }
    _initWhiteTexture() {
        if (!this._gl) {
            return;
        }
        this._whiteTexture = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._whiteTexture);
        const whitePixel = new Uint8Array([255, 255, 255, 255]);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, 1, 1, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, whitePixel);
    }
    _initChromeTextures() {
        function loadChromeTexture(index, url) {
            UI.UIUtils.loadImage(url).then(image => {
                this._chromeTextures[index] =
                    image && LayerTextureManager._createTextureForImage(this._gl || null, image) || undefined;
            });
        }
        loadChromeTexture.call(this, 0 /* Left */, 'Images/chromeLeft.avif');
        loadChromeTexture.call(this, 1 /* Middle */, 'Images/chromeMiddle.avif');
        loadChromeTexture.call(this, 2 /* Right */, 'Images/chromeRight.avif');
    }
    _initGLIfNecessary() {
        if (this._gl) {
            return this._gl;
        }
        this._gl = this._initGL(this._canvasElement);
        if (!this._gl) {
            return null;
        }
        this._initShaders();
        this._initWhiteTexture();
        this._initChromeTextures();
        this._textureManager.setContext(this._gl);
        return this._gl;
    }
    _calculateDepthsAndVisibility() {
        /** @type {!Map<string, number>} */
        this._depthByLayerId = new Map();
        let depth = 0;
        const showInternalLayers = this._layerViewHost.showInternalLayersSetting().get();
        if (!this._layerTree) {
            return;
        }
        const root = showInternalLayers ? this._layerTree.root() : (this._layerTree.contentRoot() || this._layerTree.root());
        if (!root) {
            return;
        }
        const queue = [root];
        this._depthByLayerId.set(root.id(), 0);
        /** @type {!Set<!SDK.LayerTreeBase.Layer>} */
        this._visibleLayers = new Set();
        while (queue.length > 0) {
            const layer = queue.shift();
            if (!layer) {
                break;
            }
            if (showInternalLayers || layer.drawsContent()) {
                this._visibleLayers.add(layer);
            }
            const children = layer.children();
            for (let i = 0; i < children.length; ++i) {
                this._depthByLayerId.set(children[i].id(), ++depth);
                queue.push(children[i]);
            }
        }
        this._maxDepth = depth;
    }
    _depthForLayer(layer) {
        return (this._depthByLayerId.get(layer.id()) || 0) * LayerSpacing;
    }
    _calculateScrollRectDepth(layer, index) {
        return this._depthForLayer(layer) + index * ScrollRectSpacing + 1;
    }
    _updateDimensionsForAutoscale(layer) {
        // We don't want to be precise, but rather pick something least affected by
        // animationtransforms, so that we don't change scale too often. So let's
        // disregard transforms, scrolling and relative layer positioning and choose
        // the largest dimensions of all layers.
        if (!this._dimensionsForAutoscale) {
            this._dimensionsForAutoscale = { width: 0, height: 0 };
        }
        this._dimensionsForAutoscale.width = Math.max(layer.width(), this._dimensionsForAutoscale.width);
        this._dimensionsForAutoscale.height = Math.max(layer.height(), this._dimensionsForAutoscale.height);
    }
    _calculateLayerRect(layer) {
        if (!this._visibleLayers.has(layer)) {
            return;
        }
        const selection = new LayerSelection(layer);
        const rect = new Rectangle(selection);
        rect.setVertices(layer.quad(), this._depthForLayer(layer));
        this._appendRect(rect);
        this._updateDimensionsForAutoscale(layer);
    }
    _appendRect(rect) {
        const selection = rect.relatedObject;
        const isSelected = Selection.isEqual(this._lastSelection[OutlineType.Selected], selection);
        const isHovered = Selection.isEqual(this._lastSelection[OutlineType.Hovered], selection);
        if (isSelected) {
            rect.borderColor = SelectedBorderColor;
        }
        else if (isHovered) {
            rect.borderColor = HoveredBorderColor;
            const fillColor = rect.fillColor || [255, 255, 255, 1];
            const maskColor = HoveredImageMaskColor;
            rect.fillColor = [
                fillColor[0] * maskColor[0] / 255,
                fillColor[1] * maskColor[1] / 255,
                fillColor[2] * maskColor[2] / 255,
                fillColor[3] * maskColor[3],
            ];
        }
        else {
            rect.borderColor = BorderColor;
        }
        rect.lineWidth = isSelected ? SelectedBorderWidth : BorderWidth;
        this._rects.push(rect);
    }
    _calculateLayerScrollRects(layer) {
        const scrollRects = layer.scrollRects();
        for (let i = 0; i < scrollRects.length; ++i) {
            const selection = new ScrollRectSelection(layer, i);
            const rect = new Rectangle(selection);
            rect.calculateVerticesFromRect(layer, scrollRects[i].rect, this._calculateScrollRectDepth(layer, i));
            rect.fillColor = ScrollRectBackgroundColor;
            this._appendRect(rect);
        }
    }
    _calculateLayerTileRects(layer) {
        const tiles = this._textureManager.tilesForLayer(layer);
        for (let i = 0; i < tiles.length; ++i) {
            const tile = tiles[i];
            if (!tile.texture) {
                continue;
            }
            const selection = new SnapshotSelection(layer, { rect: tile.rect, snapshot: tile.snapshot });
            const rect = new Rectangle(selection);
            if (!this._snapshotLayers.has(layer)) {
                this._snapshotLayers.set(layer, selection);
            }
            rect.calculateVerticesFromRect(layer, tile.rect, this._depthForLayer(layer) + 1);
            rect.texture = tile.texture;
            this._appendRect(rect);
        }
    }
    _calculateRects() {
        this._rects = [];
        this._snapshotLayers.clear();
        this._dimensionsForAutoscale = { width: 0, height: 0 };
        if (this._layerTree) {
            this._layerTree.forEachLayer(this._calculateLayerRect.bind(this));
        }
        if (this._showSlowScrollRectsSetting && this._showSlowScrollRectsSetting.get() && this._layerTree) {
            this._layerTree.forEachLayer(this._calculateLayerScrollRects.bind(this));
        }
        if (this._layerTexture && this._visibleLayers.has(this._layerTexture.layer)) {
            const layer = this._layerTexture.layer;
            const selection = new LayerSelection(layer);
            const rect = new Rectangle(selection);
            rect.setVertices(layer.quad(), this._depthForLayer(layer));
            rect.texture = this._layerTexture.texture;
            this._appendRect(rect);
        }
        else if (this._showPaints() && this._layerTree) {
            this._layerTree.forEachLayer(this._calculateLayerTileRects.bind(this));
        }
    }
    _makeColorsArray(color) {
        let colors = [];
        const normalizedColor = [color[0] / 255, color[1] / 255, color[2] / 255, color[3]];
        for (let i = 0; i < 4; i++) {
            colors = colors.concat(normalizedColor);
        }
        return colors;
    }
    _setVertexAttribute(attribute, array, length) {
        const gl = this._gl;
        if (!gl) {
            return;
        }
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
        gl.vertexAttribPointer(attribute, length, gl.FLOAT, false, 0, 0);
    }
    _drawRectangle(vertices, mode, color, texture) {
        const gl = this._gl;
        const white = [255, 255, 255, 1];
        color = color || white;
        if (!this._shaderProgram) {
            return;
        }
        const vertexPositionAttribute = vertexPositionAttributes.get(this._shaderProgram);
        const textureCoordAttribute = textureCoordAttributes.get(this._shaderProgram);
        const vertexColorAttribute = vertexColorAttributes.get(this._shaderProgram);
        if (typeof vertexPositionAttribute !== 'undefined') {
            this._setVertexAttribute(vertexPositionAttribute, vertices, 3);
        }
        if (typeof textureCoordAttribute !== 'undefined') {
            this._setVertexAttribute(textureCoordAttribute, [0, 1, 1, 1, 1, 0, 0, 0], 2);
        }
        if (typeof vertexColorAttribute !== 'undefined') {
            this._setVertexAttribute(vertexColorAttribute, this._makeColorsArray(color), color.length);
        }
        if (!gl) {
            return;
        }
        const samplerUniform = uniformSamplerLocations.get(this._shaderProgram);
        if (texture) {
            if (samplerUniform) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.uniform1i(samplerUniform, 0);
            }
        }
        else if (this._whiteTexture) {
            gl.bindTexture(gl.TEXTURE_2D, this._whiteTexture);
        }
        const numberOfVertices = vertices.length / 3;
        gl.drawArrays(mode, 0, numberOfVertices);
    }
    _drawTexture(vertices, texture, color) {
        if (!this._gl) {
            return;
        }
        this._drawRectangle(vertices, this._gl.TRIANGLE_FAN, color, texture);
    }
    _drawViewportAndChrome() {
        if (!this._layerTree) {
            return;
        }
        const viewport = this._layerTree.viewportSize();
        if (!viewport) {
            return;
        }
        const drawChrome = !Common.Settings.Settings.instance().moduleSetting('frameViewerHideChromeWindow').get() &&
            this._chromeTextures.length >= 3 && this._chromeTextures.indexOf(undefined) < 0;
        const z = (this._maxDepth + 1) * LayerSpacing;
        const borderWidth = Math.ceil(ViewportBorderWidth * this._scale);
        let vertices = [viewport.width, 0, z, viewport.width, viewport.height, z, 0, viewport.height, z, 0, 0, z];
        if (!this._gl) {
            return;
        }
        this._gl.lineWidth(borderWidth);
        this._drawRectangle(vertices, drawChrome ? this._gl.LINE_STRIP : this._gl.LINE_LOOP, ViewportBorderColor);
        if (!drawChrome) {
            return;
        }
        const viewportSize = this._layerTree.viewportSize();
        if (!viewportSize) {
            return;
        }
        const borderAdjustment = ViewportBorderWidth / 2;
        const viewportWidth = viewportSize.width + 2 * borderAdjustment;
        if (this._chromeTextures[0] && this._chromeTextures[2]) {
            const chromeTextureImage = imageForTexture.get(this._chromeTextures[0]) || { naturalHeight: 0, naturalWidth: 0 };
            const chromeHeight = chromeTextureImage.naturalHeight;
            const middleTextureImage = imageForTexture.get(this._chromeTextures[2]) || { naturalHeight: 0, naturalWidth: 0 };
            const middleFragmentWidth = viewportWidth - chromeTextureImage.naturalWidth - middleTextureImage.naturalWidth;
            let x = -borderAdjustment;
            const y = -chromeHeight;
            for (let i = 0; i < this._chromeTextures.length; ++i) {
                const texture = this._chromeTextures[i];
                if (!texture) {
                    continue;
                }
                const image = imageForTexture.get(texture);
                if (!image) {
                    continue;
                }
                const width = i === 1 /* Middle */ ? middleFragmentWidth : image.naturalWidth;
                if (width < 0 || x + width > viewportWidth) {
                    break;
                }
                vertices = [x, y, z, x + width, y, z, x + width, y + chromeHeight, z, x, y + chromeHeight, z];
                this._drawTexture(vertices, this._chromeTextures[i]);
                x += width;
            }
        }
    }
    _drawViewRect(rect) {
        if (!this._gl) {
            return;
        }
        const vertices = rect.vertices;
        if (rect.texture) {
            this._drawTexture(vertices, rect.texture, rect.fillColor || undefined);
        }
        else if (rect.fillColor) {
            this._drawRectangle(vertices, this._gl.TRIANGLE_FAN, rect.fillColor);
        }
        this._gl.lineWidth(rect.lineWidth);
        if (rect.borderColor) {
            this._drawRectangle(vertices, this._gl.LINE_LOOP, rect.borderColor);
        }
    }
    _update() {
        if (!this.isShowing()) {
            this._needsUpdate = true;
            return;
        }
        if (!this._layerTree || !this._layerTree.root()) {
            this._failBanner.show(this.contentElement);
            return;
        }
        const gl = this._initGLIfNecessary();
        if (!gl) {
            this._failBanner.element.removeChildren();
            this._failBanner.element.appendChild(this._webglDisabledBanner());
            this._failBanner.show(this.contentElement);
            return;
        }
        this._failBanner.detach();
        const viewportWidth = this._canvasElement.width;
        const viewportHeight = this._canvasElement.height;
        this._calculateDepthsAndVisibility();
        this._calculateRects();
        this._updateTransformAndConstraints();
        gl.viewport(0, 0, viewportWidth, viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this._rects.forEach(this._drawViewRect.bind(this));
        this._drawViewportAndChrome();
    }
    _webglDisabledBanner() {
        const fragment = this.contentElement.ownerDocument.createDocumentFragment();
        fragment.createChild('div').textContent = i18nString(UIStrings.cantDisplayLayers);
        fragment.createChild('div').textContent = i18nString(UIStrings.webglSupportIsDisabledInYour);
        fragment.appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.checkSForPossibleReasons, { PH1: UI.XLink.XLink.create('about:gpu') }));
        return fragment;
    }
    _selectionFromEventPoint(event) {
        const mouseEvent = event;
        if (!this._layerTree) {
            return null;
        }
        let closestIntersectionPoint = Infinity;
        let closestObject = null;
        const projectionMatrix = new WebKitCSSMatrix().scale(1, -1, -1).translate(-1, -1, 0).multiply(this._projectionMatrix);
        const x0 = (mouseEvent.clientX - this._canvasElement.totalOffsetLeft()) * window.devicePixelRatio;
        const y0 = -(mouseEvent.clientY - this._canvasElement.totalOffsetTop()) * window.devicePixelRatio;
        function checkIntersection(rect) {
            if (!rect.relatedObject) {
                return;
            }
            const t = rect.intersectWithLine(projectionMatrix, x0, y0);
            if (t && t < closestIntersectionPoint) {
                closestIntersectionPoint = t;
                closestObject = rect.relatedObject;
            }
        }
        this._rects.forEach(checkIntersection);
        return closestObject;
    }
    _createVisibilitySetting(caption, name, value, toolbar) {
        const setting = Common.Settings.Settings.instance().createSetting(name, value);
        setting.setTitle(i18nString(caption));
        setting.addChangeListener(this._update, this);
        toolbar.appendToolbarItem(new UI.Toolbar.ToolbarSettingCheckbox(setting));
        return setting;
    }
    _initToolbar() {
        this._panelToolbar = this._transformController.toolbar();
        this.contentElement.appendChild(this._panelToolbar.element);
        this._showSlowScrollRectsSetting = this._createVisibilitySetting(i18nString(UIStrings.slowScrollRects), 'frameViewerShowSlowScrollRects', true, this._panelToolbar);
        this._showPaintsSetting =
            this._createVisibilitySetting(i18nString(UIStrings.paints), 'frameViewerShowPaints', true, this._panelToolbar);
        this._showPaintsSetting.addChangeListener(this._updatePaints, this);
        Common.Settings.Settings.instance()
            .moduleSetting('frameViewerHideChromeWindow')
            .addChangeListener(this._update, this);
    }
    _onContextMenu(event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.resetView), () => this._transformController.resetAndNotify(), false);
        const selection = this._selectionFromEventPoint(event);
        if (selection && selection.type() === "Snapshot" /* Snapshot */) {
            contextMenu.defaultSection().appendItem(i18nString(UIStrings.showPaintProfiler), this.dispatchEventToListeners.bind(this, Events.PaintProfilerRequested, selection), false);
        }
        this._layerViewHost.showContextMenu(contextMenu, selection);
    }
    _onMouseMove(event) {
        const mouseEvent = event;
        if (mouseEvent.which) {
            return;
        }
        this._layerViewHost.hoverObject(this._selectionFromEventPoint(event));
    }
    _onMouseDown(event) {
        const mouseEvent = event;
        this._mouseDownX = mouseEvent.clientX;
        this._mouseDownY = mouseEvent.clientY;
    }
    _onMouseUp(event) {
        const mouseEvent = event;
        const maxDistanceInPixels = 6;
        if (this._mouseDownX && Math.abs(mouseEvent.clientX - this._mouseDownX) < maxDistanceInPixels &&
            Math.abs(mouseEvent.clientY - (this._mouseDownY || 0)) < maxDistanceInPixels) {
            this._canvasElement.focus();
            this._layerViewHost.selectObject(this._selectionFromEventPoint(event));
        }
        delete this._mouseDownX;
        delete this._mouseDownY;
    }
    _onDoubleClick(event) {
        const selection = this._selectionFromEventPoint(event);
        if (selection && (selection.type() === "Snapshot" /* Snapshot */ || selection.layer())) {
            this.dispatchEventToListeners(Events.PaintProfilerRequested, selection);
        }
        event.stopPropagation();
    }
    _updatePaints() {
        if (this._showPaints()) {
            this._textureManager.setLayerTree(this._layerTree);
            this._textureManager.forceUpdate();
        }
        else {
            this._textureManager.reset();
        }
        this._update();
    }
    _showPaints() {
        return this._showPaintsSetting ? this._showPaintsSetting.get() : false;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var OutlineType;
(function (OutlineType) {
    OutlineType["Hovered"] = "hovered";
    OutlineType["Selected"] = "selected";
})(OutlineType || (OutlineType = {}));
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["PaintProfilerRequested"] = "PaintProfilerRequested";
    Events["ScaleChanged"] = "ScaleChanged";
})(Events || (Events = {}));
export const FragmentShader = '' +
    'precision mediump float;\n' +
    'varying vec4 vColor;\n' +
    'varying vec2 vTextureCoord;\n' +
    'uniform sampler2D uSampler;\n' +
    'void main(void)\n' +
    '{\n' +
    '    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) * vColor;\n' +
    '}';
export const VertexShader = '' +
    'attribute vec3 aVertexPosition;\n' +
    'attribute vec2 aTextureCoord;\n' +
    'attribute vec4 aVertexColor;\n' +
    'uniform mat4 uPMatrix;\n' +
    'varying vec2 vTextureCoord;\n' +
    'varying vec4 vColor;\n' +
    'void main(void)\n' +
    '{\n' +
    'gl_Position = uPMatrix * vec4(aVertexPosition, 1.0);\n' +
    'vColor = aVertexColor;\n' +
    'vTextureCoord = aTextureCoord;\n' +
    '}';
export const HoveredBorderColor = [0, 0, 255, 1];
export const SelectedBorderColor = [0, 255, 0, 1];
export const BorderColor = [0, 0, 0, 1];
export const ViewportBorderColor = [160, 160, 160, 1];
export const ScrollRectBackgroundColor = [178, 100, 100, 0.6];
export const HoveredImageMaskColor = [200, 200, 255, 1];
export const BorderWidth = 1;
export const SelectedBorderWidth = 2;
export const ViewportBorderWidth = 3;
export const LayerSpacing = 20;
export const ScrollRectSpacing = 4;
export class LayerTextureManager {
    _textureUpdatedCallback;
    _throttler;
    _scale;
    _active;
    _queue;
    _tilesByLayer;
    _gl;
    constructor(textureUpdatedCallback) {
        this._textureUpdatedCallback = textureUpdatedCallback;
        this._throttler = new Common.Throttler.Throttler(0);
        this._scale = 0;
        this._active = false;
        this.reset();
    }
    static _createTextureForImage(gl, image) {
        if (!gl) {
            throw new Error('WebGLRenderingContext not provided');
        }
        const texture = gl.createTexture();
        if (!texture) {
            throw new Error('Unable to create texture');
        }
        imageForTexture.set(texture, image);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }
    reset() {
        if (this._tilesByLayer) {
            this.setLayerTree(null);
        }
        /** @type {!Map<!SDK.LayerTreeBase.Layer, !Array<!Tile>>} */
        this._tilesByLayer = new Map();
        /** @type {!Array<!SDK.LayerTreeBase.Layer>} */
        this._queue = [];
    }
    setContext(glContext) {
        this._gl = glContext;
        if (this._scale) {
            this._updateTextures();
        }
    }
    suspend() {
        this._active = false;
    }
    resume() {
        this._active = true;
        if (this._queue.length) {
            this._update();
        }
    }
    setLayerTree(layerTree) {
        const newLayers = new Set();
        const oldLayers = Array.from(this._tilesByLayer.keys());
        if (layerTree) {
            layerTree.forEachLayer(layer => {
                if (!layer.drawsContent()) {
                    return;
                }
                newLayers.add(layer);
                if (!this._tilesByLayer.has(layer)) {
                    this._tilesByLayer.set(layer, []);
                    this.layerNeedsUpdate(layer);
                }
            });
        }
        if (!oldLayers.length) {
            this.forceUpdate();
        }
        for (const layer of oldLayers) {
            if (newLayers.has(layer)) {
                continue;
            }
            const tiles = this._tilesByLayer.get(layer);
            if (tiles) {
                tiles.forEach(tile => tile.dispose());
            }
            this._tilesByLayer.delete(layer);
        }
    }
    _setSnapshotsForLayer(layer, snapshots) {
        const oldSnapshotsToTiles = new Map((this._tilesByLayer.get(layer) || []).map(tile => [tile.snapshot, tile]));
        const newTiles = [];
        const reusedTiles = [];
        for (const snapshot of snapshots) {
            const oldTile = oldSnapshotsToTiles.get(snapshot.snapshot);
            if (oldTile) {
                reusedTiles.push(oldTile);
                oldSnapshotsToTiles.delete(snapshot.snapshot);
            }
            else {
                newTiles.push(new Tile(snapshot));
            }
        }
        this._tilesByLayer.set(layer, reusedTiles.concat(newTiles));
        for (const tile of oldSnapshotsToTiles.values()) {
            tile.dispose();
        }
        const gl = this._gl;
        if (!gl || !this._scale) {
            return Promise.resolve();
        }
        return Promise.all(newTiles.map(tile => tile.update(gl, this._scale))).then(this._textureUpdatedCallback);
    }
    setScale(scale) {
        if (this._scale && this._scale >= scale) {
            return;
        }
        this._scale = scale;
        this._updateTextures();
    }
    tilesForLayer(layer) {
        return this._tilesByLayer.get(layer) || [];
    }
    layerNeedsUpdate(layer) {
        if (this._queue.indexOf(layer) < 0) {
            this._queue.push(layer);
        }
        if (this._active) {
            this._throttler.schedule(this._update.bind(this));
        }
    }
    forceUpdate() {
        this._queue.forEach(layer => this._updateLayer(layer));
        this._queue = [];
        this._update();
    }
    _update() {
        const layer = this._queue.shift();
        if (!layer) {
            return Promise.resolve();
        }
        if (this._queue.length) {
            this._throttler.schedule(this._update.bind(this));
        }
        return this._updateLayer(layer);
    }
    _updateLayer(layer) {
        return Promise.all(layer.snapshots())
            .then(snapshots => this._setSnapshotsForLayer(layer, snapshots.filter(snapshot => snapshot !== null)));
    }
    _updateTextures() {
        if (!this._gl) {
            return;
        }
        if (!this._scale) {
            return;
        }
        for (const tiles of this._tilesByLayer.values()) {
            for (const tile of tiles) {
                const promise = tile.updateScale(this._gl, this._scale);
                if (promise) {
                    promise.then(this._textureUpdatedCallback);
                }
            }
        }
    }
}
export class Rectangle {
    relatedObject;
    lineWidth;
    borderColor;
    fillColor;
    texture;
    vertices;
    constructor(relatedObject) {
        this.relatedObject = relatedObject;
        this.lineWidth = 1;
        this.borderColor = null;
        this.fillColor = null;
        this.texture = null;
    }
    setVertices(quad, z) {
        this.vertices = [quad[0], quad[1], z, quad[2], quad[3], z, quad[4], quad[5], z, quad[6], quad[7], z];
    }
    /**
     * Finds coordinates of point on layer quad, having offsets (ratioX * width) and (ratioY * height)
     * from the left corner of the initial layer rect, where width and heigth are layer bounds.
     */
    _calculatePointOnQuad(quad, ratioX, ratioY) {
        const x0 = quad[0];
        const y0 = quad[1];
        const x1 = quad[2];
        const y1 = quad[3];
        const x2 = quad[4];
        const y2 = quad[5];
        const x3 = quad[6];
        const y3 = quad[7];
        // Point on the first quad side clockwise
        const firstSidePointX = x0 + ratioX * (x1 - x0);
        const firstSidePointY = y0 + ratioX * (y1 - y0);
        // Point on the third quad side clockwise
        const thirdSidePointX = x3 + ratioX * (x2 - x3);
        const thirdSidePointY = y3 + ratioX * (y2 - y3);
        const x = firstSidePointX + ratioY * (thirdSidePointX - firstSidePointX);
        const y = firstSidePointY + ratioY * (thirdSidePointY - firstSidePointY);
        return [x, y];
    }
    calculateVerticesFromRect(layer, rect, z) {
        const quad = layer.quad();
        const rx1 = rect.x / layer.width();
        const rx2 = (rect.x + rect.width) / layer.width();
        const ry1 = rect.y / layer.height();
        const ry2 = (rect.y + rect.height) / layer.height();
        const rectQuad = this._calculatePointOnQuad(quad, rx1, ry1)
            .concat(this._calculatePointOnQuad(quad, rx2, ry1))
            .concat(this._calculatePointOnQuad(quad, rx2, ry2))
            .concat(this._calculatePointOnQuad(quad, rx1, ry2));
        this.setVertices(rectQuad, z);
    }
    /**
     * Intersects quad with given transform matrix and line l(t) = (x0, y0, t)
     */
    intersectWithLine(matrix, x0, y0) {
        let i;
        // Vertices of the quad with transform matrix applied
        const points = [];
        for (i = 0; i < 4; ++i) {
            points[i] = UI.Geometry.multiplyVectorByMatrixAndNormalize(new UI.Geometry.Vector(this.vertices[i * 3], this.vertices[i * 3 + 1], this.vertices[i * 3 + 2]), matrix);
        }
        // Calculating quad plane normal
        const normal = UI.Geometry.crossProduct(UI.Geometry.subtract(points[1], points[0]), UI.Geometry.subtract(points[2], points[1]));
        // General form of the equation of the quad plane: A * x + B * y + C * z + D = 0
        const A = normal.x;
        const B = normal.y;
        const C = normal.z;
        const D = -(A * points[0].x + B * points[0].y + C * points[0].z);
        // Finding t from the equation
        const t = -(D + A * x0 + B * y0) / C;
        // Point of the intersection
        const pt = new UI.Geometry.Vector(x0, y0, t);
        // Vectors from the intersection point to vertices of the quad
        const tVects = points.map(UI.Geometry.subtract.bind(null, pt));
        // Intersection point lies inside of the polygon if scalar products of normal of the plane and
        // cross products of successive tVects are all nonstrictly above or all nonstrictly below zero
        for (i = 0; i < tVects.length; ++i) {
            const product = UI.Geometry.scalarProduct(normal, UI.Geometry.crossProduct(tVects[i], tVects[(i + 1) % tVects.length]));
            if (product < 0) {
                return undefined;
            }
        }
        return t;
    }
}
export class Tile {
    snapshot;
    rect;
    scale;
    texture;
    _gl;
    constructor(snapshotWithRect) {
        this.snapshot = snapshotWithRect.snapshot;
        this.rect = snapshotWithRect.rect;
        this.scale = 0;
        this.texture = null;
    }
    dispose() {
        this.snapshot.release();
        if (this.texture) {
            this._gl.deleteTexture(this.texture);
            this.texture = null;
        }
    }
    updateScale(glContext, scale) {
        if (this.texture && this.scale >= scale) {
            return null;
        }
        return this.update(glContext, scale);
    }
    async update(glContext, scale) {
        this._gl = glContext;
        this.scale = scale;
        const imageURL = await this.snapshot.replay(scale);
        const image = imageURL ? await UI.UIUtils.loadImage(imageURL) : null;
        this.texture = image ? LayerTextureManager._createTextureForImage(glContext, image) : null;
    }
}
//# sourceMappingURL=Layers3DView.js.map