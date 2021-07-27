// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import { OverlayColorGenerator } from './OverlayColorGenerator.js';
export class OverlayPersistentHighlighter {
    _model;
    _gridHighlights;
    _scrollSnapHighlights;
    _flexHighlights;
    _colors;
    _gridColorGenerator;
    _flexColorGenerator;
    _flexEnabled;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _showGridLineLabelsSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _extendGridLinesSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _showGridAreasSetting;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _showGridTrackSizesSetting;
    constructor(model, flexEnabled = true) {
        this._model = model;
        this._gridHighlights = new Map();
        this._scrollSnapHighlights = new Map();
        this._flexHighlights = new Map();
        this._colors = new Map();
        this._gridColorGenerator = new OverlayColorGenerator();
        this._flexColorGenerator = new OverlayColorGenerator();
        this._flexEnabled = flexEnabled;
        this._showGridLineLabelsSetting = Common.Settings.Settings.instance().moduleSetting('showGridLineLabels');
        this._showGridLineLabelsSetting.addChangeListener(this._onSettingChange, this);
        this._extendGridLinesSetting = Common.Settings.Settings.instance().moduleSetting('extendGridLines');
        this._extendGridLinesSetting.addChangeListener(this._onSettingChange, this);
        this._showGridAreasSetting = Common.Settings.Settings.instance().moduleSetting('showGridAreas');
        this._showGridAreasSetting.addChangeListener(this._onSettingChange, this);
        this._showGridTrackSizesSetting = Common.Settings.Settings.instance().moduleSetting('showGridTrackSizes');
        this._showGridTrackSizesSetting.addChangeListener(this._onSettingChange, this);
    }
    _onSettingChange() {
        this.resetOverlay();
    }
    _buildGridHighlightConfig(nodeId) {
        const mainColor = this.colorOfGrid(nodeId);
        const background = mainColor.setAlpha(0.1);
        const gapBackground = mainColor.setAlpha(0.3);
        const gapHatch = mainColor.setAlpha(0.8);
        const showGridExtensionLines = this._extendGridLinesSetting.get();
        const showPositiveLineNumbers = this._showGridLineLabelsSetting.get() === 'lineNumbers';
        const showNegativeLineNumbers = showPositiveLineNumbers;
        const showLineNames = this._showGridLineLabelsSetting.get() === 'lineNames';
        return {
            rowGapColor: gapBackground.toProtocolRGBA(),
            rowHatchColor: gapHatch.toProtocolRGBA(),
            columnGapColor: gapBackground.toProtocolRGBA(),
            columnHatchColor: gapHatch.toProtocolRGBA(),
            gridBorderColor: mainColor.toProtocolRGBA(),
            gridBorderDash: false,
            rowLineColor: mainColor.toProtocolRGBA(),
            columnLineColor: mainColor.toProtocolRGBA(),
            rowLineDash: true,
            columnLineDash: true,
            showGridExtensionLines,
            showPositiveLineNumbers,
            showNegativeLineNumbers,
            showLineNames,
            showAreaNames: this._showGridAreasSetting.get(),
            showTrackSizes: this._showGridTrackSizesSetting.get(),
            areaBorderColor: mainColor.toProtocolRGBA(),
            gridBackgroundColor: background.toProtocolRGBA(),
        };
    }
    _buildFlexContainerHighlightConfig(nodeId) {
        const mainColor = this.colorOfFlex(nodeId);
        return {
            containerBorder: { color: mainColor.toProtocolRGBA(), pattern: "dashed" /* Dashed */ },
            itemSeparator: { color: mainColor.toProtocolRGBA(), pattern: "dotted" /* Dotted */ },
            lineSeparator: { color: mainColor.toProtocolRGBA(), pattern: "dashed" /* Dashed */ },
            mainDistributedSpace: { hatchColor: mainColor.toProtocolRGBA() },
            crossDistributedSpace: { hatchColor: mainColor.toProtocolRGBA() },
        };
    }
    _buildScrollSnapContainerHighlightConfig(_nodeId) {
        return {
            snapAreaBorder: {
                color: Common.Color.PageHighlight.GridBorder.toProtocolRGBA(),
                pattern: "dashed" /* Dashed */,
            },
            snapportBorder: { color: Common.Color.PageHighlight.GridBorder.toProtocolRGBA() },
            scrollMarginColor: Common.Color.PageHighlight.Margin.toProtocolRGBA(),
            scrollPaddingColor: Common.Color.PageHighlight.Padding.toProtocolRGBA(),
        };
    }
    highlightGridInOverlay(nodeId) {
        this._gridHighlights.set(nodeId, this._buildGridHighlightConfig(nodeId));
        this._updateHighlightsInOverlay();
    }
    isGridHighlighted(nodeId) {
        return this._gridHighlights.has(nodeId);
    }
    colorOfGrid(nodeId) {
        let color = this._colors.get(nodeId);
        if (!color) {
            color = this._gridColorGenerator.next();
            this._colors.set(nodeId, color);
        }
        return color;
    }
    setColorOfGrid(nodeId, color) {
        this._colors.set(nodeId, color);
    }
    hideGridInOverlay(nodeId) {
        if (this._gridHighlights.has(nodeId)) {
            this._gridHighlights.delete(nodeId);
            this._updateHighlightsInOverlay();
        }
    }
    highlightScrollSnapInOverlay(nodeId) {
        this._scrollSnapHighlights.set(nodeId, this._buildScrollSnapContainerHighlightConfig(nodeId));
        this._updateHighlightsInOverlay();
    }
    isScrollSnapHighlighted(nodeId) {
        return this._scrollSnapHighlights.has(nodeId);
    }
    hideScrollSnapInOverlay(nodeId) {
        if (this._scrollSnapHighlights.has(nodeId)) {
            this._scrollSnapHighlights.delete(nodeId);
            this._updateHighlightsInOverlay();
        }
    }
    highlightFlexInOverlay(nodeId) {
        this._flexHighlights.set(nodeId, this._buildFlexContainerHighlightConfig(nodeId));
        this._updateHighlightsInOverlay();
    }
    isFlexHighlighted(nodeId) {
        return this._flexHighlights.has(nodeId);
    }
    colorOfFlex(nodeId) {
        let color = this._colors.get(nodeId);
        if (!color) {
            color = this._flexColorGenerator.next();
            this._colors.set(nodeId, color);
        }
        return color;
    }
    setColorOfFlex(nodeId, color) {
        this._colors.set(nodeId, color);
    }
    hideFlexInOverlay(nodeId) {
        if (this._flexHighlights.has(nodeId)) {
            this._flexHighlights.delete(nodeId);
            this._updateHighlightsInOverlay();
        }
    }
    hideAllInOverlay() {
        this._flexHighlights.clear();
        this._gridHighlights.clear();
        this._scrollSnapHighlights.clear();
        this._updateHighlightsInOverlay();
    }
    refreshHighlights() {
        const gridsNeedUpdate = this._updateHighlightsForDeletedNodes(this._gridHighlights);
        const flexboxesNeedUpdate = this._updateHighlightsForDeletedNodes(this._flexHighlights);
        const scrollSnapsNeedUpdate = this._updateHighlightsForDeletedNodes(this._scrollSnapHighlights);
        if (flexboxesNeedUpdate || gridsNeedUpdate || scrollSnapsNeedUpdate) {
            this._updateHighlightsInOverlay();
        }
    }
    _updateHighlightsForDeletedNodes(highlights) {
        let needsUpdate = false;
        for (const nodeId of highlights.keys()) {
            if (this._model.getDOMModel().nodeForId(nodeId) === null) {
                highlights.delete(nodeId);
                needsUpdate = true;
            }
        }
        return needsUpdate;
    }
    resetOverlay() {
        for (const nodeId of this._gridHighlights.keys()) {
            this._gridHighlights.set(nodeId, this._buildGridHighlightConfig(nodeId));
        }
        for (const nodeId of this._flexHighlights.keys()) {
            this._flexHighlights.set(nodeId, this._buildFlexContainerHighlightConfig(nodeId));
        }
        for (const nodeId of this._scrollSnapHighlights.keys()) {
            this._scrollSnapHighlights.set(nodeId, this._buildScrollSnapContainerHighlightConfig(nodeId));
        }
        this._updateHighlightsInOverlay();
    }
    _updateHighlightsInOverlay() {
        const hasNodesToHighlight = this._gridHighlights.size > 0 || this._flexHighlights.size > 0;
        this._model.setShowViewportSizeOnResize(!hasNodesToHighlight);
        this._updateGridHighlightsInOverlay();
        this._updateFlexHighlightsInOverlay();
        this._updateScrollSnapHighlightsInOverlay();
    }
    _updateGridHighlightsInOverlay() {
        const overlayModel = this._model;
        const gridNodeHighlightConfigs = [];
        for (const [nodeId, gridHighlightConfig] of this._gridHighlights.entries()) {
            gridNodeHighlightConfigs.push({ nodeId, gridHighlightConfig });
        }
        overlayModel.target().overlayAgent().invoke_setShowGridOverlays({ gridNodeHighlightConfigs });
    }
    _updateFlexHighlightsInOverlay() {
        if (!this._flexEnabled) {
            return;
        }
        const overlayModel = this._model;
        const flexNodeHighlightConfigs = [];
        for (const [nodeId, flexContainerHighlightConfig] of this._flexHighlights.entries()) {
            flexNodeHighlightConfigs.push({ nodeId, flexContainerHighlightConfig });
        }
        overlayModel.target().overlayAgent().invoke_setShowFlexOverlays({ flexNodeHighlightConfigs });
    }
    _updateScrollSnapHighlightsInOverlay() {
        const overlayModel = this._model;
        const scrollSnapHighlightConfigs = [];
        for (const [nodeId, scrollSnapContainerHighlightConfig] of this._scrollSnapHighlights.entries()) {
            scrollSnapHighlightConfigs.push({ nodeId, scrollSnapContainerHighlightConfig });
        }
        overlayModel.target().overlayAgent().invoke_setShowScrollSnapOverlays({ scrollSnapHighlightConfigs });
    }
}
//# sourceMappingURL=OverlayPersistentHighlighter.js.map