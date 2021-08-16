/**
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as Root from '../../../../core/root/root.js';
import * as UI from '../../legacy.js';
import * as ThemeSupport from '../../theme_support/theme_support.js';
import { ChartViewport } from './ChartViewport.js'; // eslint-disable-line no-unused-vars
import { TimelineGrid } from './TimelineGrid.js'; // eslint-disable-line no-unused-vars
const UIStrings = {
    /**
    *@description Aria accessible name in Flame Chart of the Performance panel
    */
    flameChart: 'Flame Chart',
    /**
    *@description Text for the screen reader to announce a hovered group
    *@example {Network} PH1
    */
    sHovered: '{PH1} hovered',
    /**
    *@description Text for screen reader to announce a selected group.
    *@example {Network} PH1
    */
    sSelected: '{PH1} selected',
    /**
    *@description Text for screen reader to announce an expanded group
    *@example {Network} PH1
    */
    sExpanded: '{PH1} expanded',
    /**
    *@description Text for screen reader to announce a collapsed group
    *@example {Network} PH1
    */
    sCollapsed: '{PH1} collapsed',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/perf_ui/FlameChart.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class FlameChartDelegate {
    windowChanged(_startTime, _endTime, _animate) {
    }
    updateRangeSelection(_startTime, _endTime) {
    }
    updateSelectedGroup(_flameChart, _group) {
    }
}
export class FlameChart extends UI.Widget.VBox {
    _groupExpansionSetting;
    _groupExpansionState;
    _flameChartDelegate;
    _useWebGL;
    _chartViewport;
    _dataProvider;
    _candyStripeCanvas;
    _viewportElement;
    _canvasGL;
    _canvas;
    _entryInfo;
    _markerHighlighElement;
    _highlightElement;
    _selectedElement;
    _rulerEnabled;
    _rangeSelectionStart;
    _rangeSelectionEnd;
    _barHeight;
    _textBaseline;
    _textPadding;
    _markerRadius;
    _headerLeftPadding;
    _arrowSide;
    _expansionArrowIndent;
    _headerLabelXPadding;
    _headerLabelYPadding;
    _highlightedMarkerIndex;
    _highlightedEntryIndex;
    _selectedEntryIndex;
    _rawTimelineDataLength;
    _textWidth;
    _markerPositions;
    _lastMouseOffsetX;
    _selectedGroup;
    _keyboardFocusedGroup;
    _selectedGroupBackroundColor;
    _selectedGroupBorderColor;
    _offsetWidth;
    _offsetHeight;
    _dragStartX;
    _dragStartY;
    _lastMouseOffsetY;
    _minimumBoundary;
    _maxDragOffset;
    _shaderProgram;
    _vertexBuffer;
    _colorBuffer;
    _uScalingFactor;
    _uShiftVector;
    _aVertexPosition;
    _aVertexColor;
    _vertexCount;
    _prevTimelineData;
    _timelineLevels;
    _visibleLevelOffsets;
    _visibleLevels;
    _groupOffsets;
    _rawTimelineData;
    _forceDecorationCache;
    _entryColorsCache;
    _visibleLevelHeights;
    _totalTime;
    constructor(dataProvider, flameChartDelegate, groupExpansionSetting) {
        super(true);
        this.registerRequiredCSS('ui/legacy/components/perf_ui/flameChart.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('flame-chart-main-pane');
        this._groupExpansionSetting = groupExpansionSetting;
        this._groupExpansionState = groupExpansionSetting && groupExpansionSetting.get() || {};
        this._flameChartDelegate = flameChartDelegate;
        this._useWebGL = Root.Runtime.experiments.isEnabled('timelineWebGL');
        this._chartViewport = new ChartViewport(this);
        this._chartViewport.show(this.contentElement);
        this._dataProvider = dataProvider;
        this._candyStripeCanvas = document.createElement('canvas');
        this._createCandyStripePattern();
        this._viewportElement = this._chartViewport.viewportElement;
        if (this._useWebGL) {
            this._canvasGL = this._viewportElement.createChild('canvas', 'fill');
            this._initWebGL();
        }
        this._canvas = this._viewportElement.createChild('canvas', 'fill');
        this._canvas.tabIndex = 0;
        UI.ARIAUtils.setAccessibleName(this._canvas, i18nString(UIStrings.flameChart));
        UI.ARIAUtils.markAsTree(this._canvas);
        this.setDefaultFocusedElement(this._canvas);
        this._canvas.classList.add('flame-chart-canvas');
        this._canvas.addEventListener('mousemove', this._onMouseMove.bind(this), false);
        this._canvas.addEventListener('mouseout', this._onMouseOut.bind(this), false);
        this._canvas.addEventListener('click', this._onClick.bind(this), false);
        this._canvas.addEventListener('keydown', this._onKeyDown.bind(this), false);
        this._entryInfo = this._viewportElement.createChild('div', 'flame-chart-entry-info');
        this._markerHighlighElement = this._viewportElement.createChild('div', 'flame-chart-marker-highlight-element');
        this._highlightElement = this._viewportElement.createChild('div', 'flame-chart-highlight-element');
        this._selectedElement = this._viewportElement.createChild('div', 'flame-chart-selected-element');
        this._canvas.addEventListener('focus', () => {
            this.dispatchEventToListeners(Events.CanvasFocused);
        }, false);
        UI.UIUtils.installDragHandle(this._viewportElement, this._startDragging.bind(this), this._dragging.bind(this), this._endDragging.bind(this), null);
        this._rulerEnabled = true;
        this._rangeSelectionStart = 0;
        this._rangeSelectionEnd = 0;
        this._barHeight = 17;
        this._textBaseline = 5;
        this._textPadding = 5;
        this._markerRadius = 6;
        this._chartViewport.setWindowTimes(dataProvider.minimumBoundary(), dataProvider.minimumBoundary() + dataProvider.totalTime());
        this._headerLeftPadding = 6;
        this._arrowSide = 8;
        this._expansionArrowIndent = this._headerLeftPadding + this._arrowSide / 2;
        this._headerLabelXPadding = 3;
        this._headerLabelYPadding = 2;
        this._highlightedMarkerIndex = -1;
        this._highlightedEntryIndex = -1;
        this._selectedEntryIndex = -1;
        this._rawTimelineDataLength = 0;
        this._textWidth = new Map();
        this._markerPositions = new Map();
        this._lastMouseOffsetX = 0;
        this._selectedGroup = -1;
        // Keyboard focused group is used to navigate groups irrespective of whether they are selectable or not
        this._keyboardFocusedGroup = -1;
        this._selectedGroupBackroundColor = ThemeSupport.ThemeSupport.instance().patchColorText(Colors.SelectedGroupBackground, ThemeSupport.ThemeSupport.ColorUsage.Background);
        this._selectedGroupBorderColor = ThemeSupport.ThemeSupport.instance().patchColorText(Colors.SelectedGroupBorder, ThemeSupport.ThemeSupport.ColorUsage.Background);
    }
    willHide() {
        this.hideHighlight();
    }
    setBarHeight(value) {
        this._barHeight = value;
    }
    setTextBaseline(value) {
        this._textBaseline = value;
    }
    setTextPadding(value) {
        this._textPadding = value;
    }
    enableRuler(enable) {
        this._rulerEnabled = enable;
    }
    alwaysShowVerticalScroll() {
        this._chartViewport.alwaysShowVerticalScroll();
    }
    disableRangeSelection() {
        this._chartViewport.disableRangeSelection();
    }
    highlightEntry(entryIndex) {
        if (this._highlightedEntryIndex === entryIndex) {
            return;
        }
        if (!this._dataProvider.entryColor(entryIndex)) {
            return;
        }
        this._highlightedEntryIndex = entryIndex;
        this._updateElementPosition(this._highlightElement, this._highlightedEntryIndex);
        this.dispatchEventToListeners(Events.EntryHighlighted, entryIndex);
    }
    hideHighlight() {
        this._entryInfo.removeChildren();
        this._highlightedEntryIndex = -1;
        this._updateElementPosition(this._highlightElement, this._highlightedEntryIndex);
        this.dispatchEventToListeners(Events.EntryHighlighted, -1);
    }
    _createCandyStripePattern() {
        // Set the candy stripe pattern to 17px so it repeats well.
        const size = 17;
        this._candyStripeCanvas.width = size;
        this._candyStripeCanvas.height = size;
        const ctx = this._candyStripeCanvas.getContext('2d');
        if (!ctx) {
            return;
        }
        // Rotate the stripe by 45deg to the right.
        ctx.translate(size * 0.5, size * 0.5);
        ctx.rotate(Math.PI * 0.25);
        ctx.translate(-size * 0.5, -size * 0.5);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
        for (let x = -size; x < size * 2; x += 3) {
            ctx.fillRect(x, -size, 1, size * 3);
        }
    }
    _resetCanvas() {
        const ratio = window.devicePixelRatio;
        const width = Math.round(this._offsetWidth * ratio);
        const height = Math.round(this._offsetHeight * ratio);
        this._canvas.width = width;
        this._canvas.height = height;
        this._canvas.style.width = `${width / ratio}px`;
        this._canvas.style.height = `${height / ratio}px`;
        if (this._useWebGL) {
            this._canvasGL.width = width;
            this._canvasGL.height = height;
            this._canvasGL.style.width = `${width / ratio}px`;
            this._canvasGL.style.height = `${height / ratio}px`;
        }
    }
    windowChanged(startTime, endTime, animate) {
        this._flameChartDelegate.windowChanged(startTime, endTime, animate);
    }
    updateRangeSelection(startTime, endTime) {
        this._flameChartDelegate.updateRangeSelection(startTime, endTime);
    }
    setSize(width, height) {
        this._offsetWidth = width;
        this._offsetHeight = height;
    }
    _startDragging(event) {
        this.hideHighlight();
        this._maxDragOffset = 0;
        this._dragStartX = event.pageX;
        this._dragStartY = event.pageY;
        return true;
    }
    _dragging(event) {
        const dx = event.pageX - this._dragStartX;
        const dy = event.pageY - this._dragStartY;
        this._maxDragOffset = Math.max(this._maxDragOffset, Math.sqrt(dx * dx + dy * dy));
    }
    _endDragging(_event) {
        this._updateHighlight();
    }
    _timelineData() {
        if (!this._dataProvider) {
            return null;
        }
        const timelineData = this._dataProvider.timelineData();
        if (timelineData !== this._rawTimelineData ||
            (timelineData && timelineData.entryStartTimes.length !== this._rawTimelineDataLength)) {
            this._processTimelineData(timelineData);
        }
        return this._rawTimelineData || null;
    }
    _revealEntry(entryIndex) {
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        const timeLeft = this._chartViewport.windowLeftTime();
        const timeRight = this._chartViewport.windowRightTime();
        const entryStartTime = timelineData.entryStartTimes[entryIndex];
        const entryTotalTime = timelineData.entryTotalTimes[entryIndex];
        const entryEndTime = entryStartTime + entryTotalTime;
        let minEntryTimeWindow = Math.min(entryTotalTime, timeRight - timeLeft);
        const level = timelineData.entryLevels[entryIndex];
        this._chartViewport.setScrollOffset(this._levelToOffset(level), this._levelHeight(level));
        const minVisibleWidthPx = 30;
        const futurePixelToTime = (timeRight - timeLeft) / this._offsetWidth;
        minEntryTimeWindow = Math.max(minEntryTimeWindow, futurePixelToTime * minVisibleWidthPx);
        if (timeLeft > entryEndTime) {
            const delta = timeLeft - entryEndTime + minEntryTimeWindow;
            this.windowChanged(timeLeft - delta, timeRight - delta, /* animate */ true);
        }
        else if (timeRight < entryStartTime) {
            const delta = entryStartTime - timeRight + minEntryTimeWindow;
            this.windowChanged(timeLeft + delta, timeRight + delta, /* animate */ true);
        }
    }
    setWindowTimes(startTime, endTime, animate) {
        this._chartViewport.setWindowTimes(startTime, endTime, animate);
        this._updateHighlight();
    }
    _onMouseMove(event) {
        const mouseEvent = event;
        this._lastMouseOffsetX = mouseEvent.offsetX;
        this._lastMouseOffsetY = mouseEvent.offsetY;
        if (!this._enabled()) {
            return;
        }
        if (this._chartViewport.isDragging()) {
            return;
        }
        if (this._coordinatesToGroupIndex(mouseEvent.offsetX, mouseEvent.offsetY, true /* headerOnly */) >= 0) {
            this.hideHighlight();
            this._viewportElement.style.cursor = 'pointer';
            return;
        }
        this._updateHighlight();
    }
    _updateHighlight() {
        const entryIndex = this._coordinatesToEntryIndex(this._lastMouseOffsetX, this._lastMouseOffsetY);
        if (entryIndex === -1) {
            this.hideHighlight();
            const group = this._coordinatesToGroupIndex(this._lastMouseOffsetX, this._lastMouseOffsetY, false /* headerOnly */);
            if (group >= 0 && this._rawTimelineData && this._rawTimelineData.groups &&
                this._rawTimelineData.groups[group].selectable) {
                this._viewportElement.style.cursor = 'pointer';
            }
            else {
                this._viewportElement.style.cursor = 'default';
            }
            return;
        }
        if (this._chartViewport.isDragging()) {
            return;
        }
        this._updatePopover(entryIndex);
        this._viewportElement.style.cursor = this._dataProvider.canJumpToEntry(entryIndex) ? 'pointer' : 'default';
        this.highlightEntry(entryIndex);
    }
    _onMouseOut() {
        this._lastMouseOffsetX = -1;
        this._lastMouseOffsetY = -1;
        this.hideHighlight();
    }
    _updatePopover(entryIndex) {
        if (entryIndex === this._highlightedEntryIndex) {
            this._updatePopoverOffset();
            return;
        }
        this._entryInfo.removeChildren();
        const popoverElement = this._dataProvider.prepareHighlightedEntryInfo(entryIndex);
        if (popoverElement) {
            this._entryInfo.appendChild(popoverElement);
            this._updatePopoverOffset();
        }
    }
    _updatePopoverOffset() {
        const mouseX = this._lastMouseOffsetX;
        const mouseY = this._lastMouseOffsetY;
        const parentWidth = this._entryInfo.parentElement ? this._entryInfo.parentElement.clientWidth : 0;
        const parentHeight = this._entryInfo.parentElement ? this._entryInfo.parentElement.clientHeight : 0;
        const infoWidth = this._entryInfo.clientWidth;
        const infoHeight = this._entryInfo.clientHeight;
        const /** @const */ offsetX = 10;
        const /** @const */ offsetY = 6;
        let x;
        let y;
        for (let quadrant = 0; quadrant < 4; ++quadrant) {
            const dx = quadrant & 2 ? -offsetX - infoWidth : offsetX;
            const dy = quadrant & 1 ? -offsetY - infoHeight : offsetY;
            x = Platform.NumberUtilities.clamp(mouseX + dx, 0, parentWidth - infoWidth);
            y = Platform.NumberUtilities.clamp(mouseY + dy, 0, parentHeight - infoHeight);
            if (x >= mouseX || mouseX >= x + infoWidth || y >= mouseY || mouseY >= y + infoHeight) {
                break;
            }
        }
        this._entryInfo.style.left = x + 'px';
        this._entryInfo.style.top = y + 'px';
    }
    _onClick(event) {
        const mouseEvent = event;
        this.focus();
        // onClick comes after dragStart and dragEnd events.
        // So if there was drag (mouse move) in the middle of that events
        // we skip the click. Otherwise we jump to the sources.
        const clickThreshold = 5;
        if (this._maxDragOffset > clickThreshold) {
            return;
        }
        this._selectGroup(this._coordinatesToGroupIndex(mouseEvent.offsetX, mouseEvent.offsetY, false /* headerOnly */));
        this._toggleGroupExpand(this._coordinatesToGroupIndex(mouseEvent.offsetX, mouseEvent.offsetY, true /* headerOnly */));
        const timelineData = this._timelineData();
        if (mouseEvent.shiftKey && this._highlightedEntryIndex !== -1 && timelineData) {
            const start = timelineData.entryStartTimes[this._highlightedEntryIndex];
            const end = start + timelineData.entryTotalTimes[this._highlightedEntryIndex];
            this._chartViewport.setRangeSelection(start, end);
        }
        else {
            this._chartViewport.onClick(mouseEvent);
            this.dispatchEventToListeners(Events.EntryInvoked, this._highlightedEntryIndex);
        }
    }
    _selectGroup(groupIndex) {
        if (groupIndex < 0 || this._selectedGroup === groupIndex) {
            return;
        }
        if (!this._rawTimelineData) {
            return;
        }
        const groups = this._rawTimelineData.groups;
        if (!groups) {
            return;
        }
        this._keyboardFocusedGroup = groupIndex;
        this._scrollGroupIntoView(groupIndex);
        const groupName = groups[groupIndex].name;
        if (!groups[groupIndex].selectable) {
            this._deselectAllGroups();
            UI.ARIAUtils.alert(i18nString(UIStrings.sHovered, { PH1: groupName }));
        }
        else {
            this._selectedGroup = groupIndex;
            this._flameChartDelegate.updateSelectedGroup(this, groups[groupIndex]);
            this._resetCanvas();
            this._draw();
            UI.ARIAUtils.alert(i18nString(UIStrings.sSelected, { PH1: groupName }));
        }
    }
    _deselectAllGroups() {
        this._selectedGroup = -1;
        this._flameChartDelegate.updateSelectedGroup(this, null);
        this._resetCanvas();
        this._draw();
    }
    _deselectAllEntries() {
        this._selectedEntryIndex = -1;
        this._resetCanvas();
        this._draw();
    }
    _isGroupFocused(index) {
        return index === this._selectedGroup || index === this._keyboardFocusedGroup;
    }
    _scrollGroupIntoView(index) {
        if (index < 0) {
            return;
        }
        if (!this._rawTimelineData) {
            return;
        }
        const groups = this._rawTimelineData.groups;
        const groupOffsets = this._groupOffsets;
        if (!groupOffsets || !groups) {
            return;
        }
        const groupTop = groupOffsets[index];
        let nextOffset = groupOffsets[index + 1];
        if (index === groups.length - 1) {
            nextOffset += groups[index].style.padding;
        }
        // For the top group, scroll all the way to the top of the chart
        // to accommodate the bar with time markers
        const scrollTop = index === 0 ? 0 : groupTop;
        const scrollHeight = Math.min(nextOffset - scrollTop, this._chartViewport.chartHeight());
        this._chartViewport.setScrollOffset(scrollTop, scrollHeight);
    }
    _toggleGroupExpand(groupIndex) {
        if (groupIndex < 0 || !this._isGroupCollapsible(groupIndex)) {
            return;
        }
        if (!this._rawTimelineData || !this._rawTimelineData.groups) {
            return;
        }
        this._expandGroup(groupIndex, !this._rawTimelineData.groups[groupIndex].expanded /* setExpanded */);
    }
    _expandGroup(groupIndex, setExpanded = true, propagatedExpand = false) {
        if (groupIndex < 0 || !this._isGroupCollapsible(groupIndex)) {
            return;
        }
        if (!this._rawTimelineData) {
            return;
        }
        const groups = this._rawTimelineData.groups;
        if (!groups) {
            return;
        }
        const group = groups[groupIndex];
        group.expanded = setExpanded;
        this._groupExpansionState[group.name] = group.expanded;
        if (this._groupExpansionSetting) {
            this._groupExpansionSetting.set(this._groupExpansionState);
        }
        this._updateLevelPositions();
        this._updateHighlight();
        if (!group.expanded) {
            const timelineData = this._timelineData();
            if (timelineData) {
                const level = timelineData.entryLevels[this._selectedEntryIndex];
                if (this._selectedEntryIndex >= 0 && level >= group.startLevel &&
                    (groupIndex >= groups.length - 1 || groups[groupIndex + 1].startLevel > level)) {
                    this._selectedEntryIndex = -1;
                }
            }
        }
        this._updateHeight();
        this._resetCanvas();
        this._draw();
        this._scrollGroupIntoView(groupIndex);
        // We only want to read expanded/collapsed state on user inputted expand/collapse
        if (!propagatedExpand) {
            const groupName = groups[groupIndex].name;
            const content = group.expanded ? i18nString(UIStrings.sExpanded, { PH1: groupName }) :
                i18nString(UIStrings.sCollapsed, { PH1: groupName });
            UI.ARIAUtils.alert(content);
        }
    }
    _onKeyDown(e) {
        if (!UI.KeyboardShortcut.KeyboardShortcut.hasNoModifiers(e) || !this._timelineData()) {
            return;
        }
        const eventHandled = this._handleSelectionNavigation(e);
        // Handle keyboard navigation in groups
        if (!eventHandled && this._rawTimelineData && this._rawTimelineData.groups) {
            this._handleKeyboardGroupNavigation(e);
        }
    }
    bindCanvasEvent(eventName, onEvent) {
        this._canvas.addEventListener(eventName, onEvent);
    }
    _handleKeyboardGroupNavigation(event) {
        const keyboardEvent = event;
        let handled = false;
        let entrySelected = false;
        if (keyboardEvent.code === 'ArrowUp') {
            handled = this._selectPreviousGroup();
        }
        else if (keyboardEvent.code === 'ArrowDown') {
            handled = this._selectNextGroup();
        }
        else if (keyboardEvent.code === 'ArrowLeft') {
            if (this._keyboardFocusedGroup >= 0) {
                this._expandGroup(this._keyboardFocusedGroup, false /* setExpanded */);
                handled = true;
            }
        }
        else if (keyboardEvent.code === 'ArrowRight') {
            if (this._keyboardFocusedGroup >= 0) {
                this._expandGroup(this._keyboardFocusedGroup, true /* setExpanded */);
                this._selectFirstChild();
                handled = true;
            }
        }
        else if (keyboardEvent.key === 'Enter') {
            entrySelected = this._selectFirstEntryInCurrentGroup();
            handled = entrySelected;
        }
        if (handled && !entrySelected) {
            this._deselectAllEntries();
        }
        if (handled) {
            keyboardEvent.consume(true);
        }
    }
    _selectFirstEntryInCurrentGroup() {
        if (!this._rawTimelineData) {
            return false;
        }
        const allGroups = this._rawTimelineData.groups;
        if (this._keyboardFocusedGroup < 0 || !allGroups) {
            return false;
        }
        const group = allGroups[this._keyboardFocusedGroup];
        const startLevelInGroup = group.startLevel;
        // Return if no levels in this group
        if (startLevelInGroup < 0) {
            return false;
        }
        // Make sure this is the innermost nested group with this startLevel
        // This is because a parent group also contains levels of all its child groups
        // So check if the next group has the same level, if it does, user should
        // go to that child group to select this entry
        if (this._keyboardFocusedGroup < allGroups.length - 1 &&
            allGroups[this._keyboardFocusedGroup + 1].startLevel === startLevelInGroup) {
            return false;
        }
        if (!this._timelineLevels) {
            return false;
        }
        // Get first (default) entry in startLevel of selected group
        const firstEntryIndex = this._timelineLevels[startLevelInGroup][0];
        this._expandGroup(this._keyboardFocusedGroup, true /* setExpanded */);
        this.setSelectedEntry(firstEntryIndex);
        return true;
    }
    _selectPreviousGroup() {
        if (this._keyboardFocusedGroup <= 0) {
            return false;
        }
        const groupIndexToSelect = this._getGroupIndexToSelect(-1 /* offset */);
        this._selectGroup(groupIndexToSelect);
        return true;
    }
    _selectNextGroup() {
        if (!this._rawTimelineData || !this._rawTimelineData.groups) {
            return false;
        }
        if (this._keyboardFocusedGroup >= this._rawTimelineData.groups.length - 1) {
            return false;
        }
        const groupIndexToSelect = this._getGroupIndexToSelect(1 /* offset */);
        this._selectGroup(groupIndexToSelect);
        return true;
    }
    _getGroupIndexToSelect(offset) {
        if (!this._rawTimelineData || !this._rawTimelineData.groups) {
            throw new Error('No raw timeline data');
        }
        const allGroups = this._rawTimelineData.groups;
        let groupIndexToSelect = this._keyboardFocusedGroup;
        let groupName, groupWithSubNestingLevel;
        do {
            groupIndexToSelect += offset;
            groupName = this._rawTimelineData.groups[groupIndexToSelect].name;
            groupWithSubNestingLevel = this._keyboardFocusedGroup !== -1 &&
                allGroups[groupIndexToSelect].style.nestingLevel > allGroups[this._keyboardFocusedGroup].style.nestingLevel;
        } while (groupIndexToSelect > 0 && groupIndexToSelect < allGroups.length - 1 &&
            (!groupName || groupWithSubNestingLevel));
        return groupIndexToSelect;
    }
    _selectFirstChild() {
        if (!this._rawTimelineData || !this._rawTimelineData.groups) {
            return;
        }
        const allGroups = this._rawTimelineData.groups;
        if (this._keyboardFocusedGroup < 0 || this._keyboardFocusedGroup >= allGroups.length - 1) {
            return;
        }
        const groupIndexToSelect = this._keyboardFocusedGroup + 1;
        if (allGroups[groupIndexToSelect].style.nestingLevel > allGroups[this._keyboardFocusedGroup].style.nestingLevel) {
            this._selectGroup(groupIndexToSelect);
        }
    }
    _handleSelectionNavigation(event) {
        if (this._selectedEntryIndex === -1) {
            return false;
        }
        const timelineData = this._timelineData();
        if (!timelineData) {
            return false;
        }
        function timeComparator(time, entryIndex) {
            if (!timelineData) {
                throw new Error('No timeline data');
            }
            return time - timelineData.entryStartTimes[entryIndex];
        }
        function entriesIntersect(entry1, entry2) {
            if (!timelineData) {
                throw new Error('No timeline data');
            }
            const start1 = timelineData.entryStartTimes[entry1];
            const start2 = timelineData.entryStartTimes[entry2];
            const end1 = start1 + timelineData.entryTotalTimes[entry1];
            const end2 = start2 + timelineData.entryTotalTimes[entry2];
            return start1 < end2 && start2 < end1;
        }
        const keyboardEvent = event;
        const keys = UI.KeyboardShortcut.Keys;
        if (keyboardEvent.keyCode === keys.Left.code || keyboardEvent.keyCode === keys.Right.code) {
            const level = timelineData.entryLevels[this._selectedEntryIndex];
            const levelIndexes = this._timelineLevels ? this._timelineLevels[level] : [];
            let indexOnLevel = Platform.ArrayUtilities.lowerBound(levelIndexes, this._selectedEntryIndex, (a, b) => a - b);
            indexOnLevel += keyboardEvent.keyCode === keys.Left.code ? -1 : 1;
            event.consume(true);
            if (indexOnLevel >= 0 && indexOnLevel < levelIndexes.length) {
                this.dispatchEventToListeners(Events.EntrySelected, levelIndexes[indexOnLevel]);
            }
            return true;
        }
        if (keyboardEvent.keyCode === keys.Up.code || keyboardEvent.keyCode === keys.Down.code) {
            let level = timelineData.entryLevels[this._selectedEntryIndex];
            level += keyboardEvent.keyCode === keys.Up.code ? -1 : 1;
            if (level < 0 || (this._timelineLevels && level >= this._timelineLevels.length)) {
                this._deselectAllEntries();
                keyboardEvent.consume(true);
                return true;
            }
            const entryTime = timelineData.entryStartTimes[this._selectedEntryIndex] +
                timelineData.entryTotalTimes[this._selectedEntryIndex] / 2;
            const levelIndexes = this._timelineLevels ? this._timelineLevels[level] : [];
            let indexOnLevel = Platform.ArrayUtilities.upperBound(levelIndexes, entryTime, timeComparator) - 1;
            if (!entriesIntersect(this._selectedEntryIndex, levelIndexes[indexOnLevel])) {
                ++indexOnLevel;
                if (indexOnLevel >= levelIndexes.length ||
                    !entriesIntersect(this._selectedEntryIndex, levelIndexes[indexOnLevel])) {
                    if (keyboardEvent.code === 'ArrowDown') {
                        return false;
                    }
                    // Stay in the current group and give focus to the parent group instead of entries
                    this._deselectAllEntries();
                    keyboardEvent.consume(true);
                    return true;
                }
            }
            keyboardEvent.consume(true);
            this.dispatchEventToListeners(Events.EntrySelected, levelIndexes[indexOnLevel]);
            return true;
        }
        if (event.key === 'Enter') {
            event.consume(true);
            this.dispatchEventToListeners(Events.EntryInvoked, this._selectedEntryIndex);
            return true;
        }
        return false;
    }
    _coordinatesToEntryIndex(x, y) {
        if (x < 0 || y < 0) {
            return -1;
        }
        const timelineData = this._timelineData();
        if (!timelineData) {
            return -1;
        }
        y += this._chartViewport.scrollOffset();
        if (!this._visibleLevelOffsets) {
            throw new Error('No visible level offsets');
        }
        const cursorLevel = Platform.ArrayUtilities.upperBound(this._visibleLevelOffsets, y, Platform.ArrayUtilities.DEFAULT_COMPARATOR) -
            1;
        if (cursorLevel < 0 || (this._visibleLevels && !this._visibleLevels[cursorLevel])) {
            return -1;
        }
        const offsetFromLevel = y - this._visibleLevelOffsets[cursorLevel];
        if (offsetFromLevel > this._levelHeight(cursorLevel)) {
            return -1;
        }
        // Check markers first.
        for (const [index, pos] of this._markerPositions) {
            if (timelineData.entryLevels[index] !== cursorLevel) {
                continue;
            }
            if (pos.x <= x && x < pos.x + pos.width) {
                return /** @type {number} */ index;
            }
        }
        // Check regular entries.
        const entryStartTimes = timelineData.entryStartTimes;
        const entriesOnLevel = this._timelineLevels ? this._timelineLevels[cursorLevel] : [];
        if (!entriesOnLevel || !entriesOnLevel.length) {
            return -1;
        }
        const cursorTime = this._chartViewport.pixelToTime(x);
        const indexOnLevel = Math.max(Platform.ArrayUtilities.upperBound(entriesOnLevel, cursorTime, (time, entryIndex) => time - entryStartTimes[entryIndex]) -
            1, 0);
        function checkEntryHit(entryIndex) {
            if (entryIndex === undefined) {
                return false;
            }
            if (!timelineData) {
                return false;
            }
            const startTime = entryStartTimes[entryIndex];
            const duration = timelineData.entryTotalTimes[entryIndex];
            const startX = this._chartViewport.timeToPosition(startTime);
            const endX = this._chartViewport.timeToPosition(startTime + duration);
            const barThresholdPx = 3;
            return startX - barThresholdPx < x && x < endX + barThresholdPx;
        }
        let entryIndex = entriesOnLevel[indexOnLevel];
        if (checkEntryHit.call(this, entryIndex)) {
            return entryIndex;
        }
        entryIndex = entriesOnLevel[indexOnLevel + 1];
        if (checkEntryHit.call(this, entryIndex)) {
            return entryIndex;
        }
        return -1;
    }
    _coordinatesToGroupIndex(x, y, headerOnly) {
        if (!this._rawTimelineData || !this._rawTimelineData.groups || !this._groupOffsets) {
            return -1;
        }
        if (x < 0 || y < 0) {
            return -1;
        }
        y += this._chartViewport.scrollOffset();
        const groups = this._rawTimelineData.groups || [];
        const group = Platform.ArrayUtilities.upperBound(this._groupOffsets, y, Platform.ArrayUtilities.DEFAULT_COMPARATOR) - 1;
        if (group < 0 || group >= groups.length) {
            return -1;
        }
        const height = headerOnly ? groups[group].style.height : this._groupOffsets[group + 1] - this._groupOffsets[group];
        if (y - this._groupOffsets[group] >= height) {
            return -1;
        }
        if (!headerOnly) {
            return group;
        }
        const context = this._canvas.getContext('2d');
        context.save();
        context.font = groups[group].style.font;
        const right = this._headerLeftPadding + this._labelWidthForGroup(context, groups[group]);
        context.restore();
        if (x > right) {
            return -1;
        }
        return group;
    }
    _markerIndexAtPosition(x) {
        const timelineData = this._timelineData();
        if (!timelineData) {
            return -1;
        }
        const markers = timelineData.markers;
        if (!markers) {
            return -1;
        }
        const /** @const */ accurracyOffsetPx = 4;
        const time = this._chartViewport.pixelToTime(x);
        const leftTime = this._chartViewport.pixelToTime(x - accurracyOffsetPx);
        const rightTime = this._chartViewport.pixelToTime(x + accurracyOffsetPx);
        const left = this._markerIndexBeforeTime(leftTime);
        let markerIndex = -1;
        let distance = Infinity;
        for (let i = left; i < markers.length && markers[i].startTime() < rightTime; i++) {
            const nextDistance = Math.abs(markers[i].startTime() - time);
            if (nextDistance < distance) {
                markerIndex = i;
                distance = nextDistance;
            }
        }
        return markerIndex;
    }
    _markerIndexBeforeTime(time) {
        const timelineData = this._timelineData();
        if (!timelineData) {
            throw new Error('No timeline data');
        }
        const markers = timelineData.markers;
        if (!markers) {
            throw new Error('No timeline markers');
        }
        return Platform.ArrayUtilities.lowerBound(timelineData.markers, time, (markerTimestamp, marker) => markerTimestamp - marker.startTime());
    }
    _draw() {
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        const visibleLevelOffsets = this._visibleLevelOffsets ? this._visibleLevelOffsets : new Uint32Array();
        const width = this._offsetWidth;
        const height = this._offsetHeight;
        const context = this._canvas.getContext('2d');
        context.save();
        const ratio = window.devicePixelRatio;
        const top = this._chartViewport.scrollOffset();
        context.scale(ratio, ratio);
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, width, height);
        context.translate(0, -top);
        const defaultFont = '11px ' + Host.Platform.fontFamily();
        context.font = defaultFont;
        const candyStripePattern = context.createPattern(this._candyStripeCanvas, 'repeat');
        const entryTotalTimes = timelineData.entryTotalTimes;
        const entryStartTimes = timelineData.entryStartTimes;
        const entryLevels = timelineData.entryLevels;
        const timeToPixel = this._chartViewport.timeToPixel();
        const titleIndices = [];
        const markerIndices = [];
        const textPadding = this._textPadding;
        const minTextWidth = 2 * textPadding + UI.UIUtils.measureTextWidth(context, '…');
        const minTextWidthDuration = this._chartViewport.pixelToTimeOffset(minTextWidth);
        const minVisibleBarLevel = Math.max(Platform.ArrayUtilities.upperBound(visibleLevelOffsets, top, Platform.ArrayUtilities.DEFAULT_COMPARATOR) - 1, 0);
        this._markerPositions.clear();
        let mainThreadTopLevel = -1;
        // Find the main thread so that we can mark tasks longer than 50ms.
        if ('groups' in timelineData && Array.isArray(timelineData.groups)) {
            const mainThread = timelineData.groups.find(group => {
                if (!group.track) {
                    return false;
                }
                return group.track.name === 'CrRendererMain';
            });
            if (mainThread) {
                mainThreadTopLevel = mainThread.startLevel;
            }
        }
        const colorBuckets = new Map();
        for (let level = minVisibleBarLevel; level < this._dataProvider.maxStackDepth(); ++level) {
            if (this._levelToOffset(level) > top + height) {
                break;
            }
            if (!this._visibleLevels || !this._visibleLevels[level]) {
                continue;
            }
            if (!this._timelineLevels) {
                continue;
            }
            // Entries are ordered by start time within a level, so find the last visible entry.
            const levelIndexes = this._timelineLevels[level];
            const rightIndexOnLevel = Platform.ArrayUtilities.lowerBound(levelIndexes, this._chartViewport.windowRightTime(), (time, entryIndex) => time - entryStartTimes[entryIndex]) -
                1;
            let lastDrawOffset = Infinity;
            for (let entryIndexOnLevel = rightIndexOnLevel; entryIndexOnLevel >= 0; --entryIndexOnLevel) {
                const entryIndex = levelIndexes[entryIndexOnLevel];
                const duration = entryTotalTimes[entryIndex];
                if (isNaN(duration)) {
                    markerIndices.push(entryIndex);
                    continue;
                }
                if (duration >= minTextWidthDuration ||
                    (this._forceDecorationCache && this._forceDecorationCache[entryIndex])) {
                    titleIndices.push(entryIndex);
                }
                const entryStartTime = entryStartTimes[entryIndex];
                const entryOffsetRight = entryStartTime + duration;
                if (entryOffsetRight <= this._chartViewport.windowLeftTime()) {
                    break;
                }
                if (this._useWebGL) {
                    continue;
                }
                const barX = this._timeToPositionClipped(entryStartTime);
                // Check if the entry entirely fits into an already drawn pixel, we can just skip drawing it.
                if (barX >= lastDrawOffset) {
                    continue;
                }
                lastDrawOffset = barX;
                if (this._entryColorsCache) {
                    const color = this._entryColorsCache[entryIndex];
                    let bucket = colorBuckets.get(color);
                    if (!bucket) {
                        bucket = { indexes: [] };
                        colorBuckets.set(color, bucket);
                    }
                    bucket.indexes.push(entryIndex);
                }
            }
        }
        if (this._useWebGL) {
            this._drawGL();
        }
        else {
            context.save();
            this._forEachGroupInViewport((offset, index, group, isFirst, groupHeight) => {
                if (this._isGroupFocused(index)) {
                    context.fillStyle = this._selectedGroupBackroundColor;
                    context.fillRect(0, offset, width, groupHeight - group.style.padding);
                }
            });
            context.restore();
            for (const [color, { indexes }] of colorBuckets) {
                context.beginPath();
                for (let i = 0; i < indexes.length; ++i) {
                    const entryIndex = indexes[i];
                    const duration = entryTotalTimes[entryIndex];
                    if (isNaN(duration)) {
                        continue;
                    }
                    const entryStartTime = entryStartTimes[entryIndex];
                    const barX = this._timeToPositionClipped(entryStartTime);
                    const barLevel = entryLevels[entryIndex];
                    const barHeight = this._levelHeight(barLevel);
                    const barY = this._levelToOffset(barLevel);
                    const barRight = this._timeToPositionClipped(entryStartTime + duration);
                    const barWidth = Math.max(barRight - barX, 1);
                    context.rect(barX, barY, barWidth - 0.4, barHeight - 1);
                }
                context.fillStyle = color;
                context.fill();
                // Draw long task regions.
                context.beginPath();
                for (let i = 0; i < indexes.length; ++i) {
                    const entryIndex = indexes[i];
                    const duration = entryTotalTimes[entryIndex];
                    const showLongDurations = entryLevels[entryIndex] === mainThreadTopLevel;
                    if (!showLongDurations) {
                        continue;
                    }
                    if (isNaN(duration) || duration < 50) {
                        continue;
                    }
                    const entryStartTime = entryStartTimes[entryIndex];
                    const barX = this._timeToPositionClipped(entryStartTime + 50);
                    const barLevel = entryLevels[entryIndex];
                    const barHeight = this._levelHeight(barLevel);
                    const barY = this._levelToOffset(barLevel);
                    const barRight = this._timeToPositionClipped(entryStartTime + duration);
                    const barWidth = Math.max(barRight - barX, 1);
                    context.rect(barX, barY, barWidth - 0.4, barHeight - 1);
                }
                if (candyStripePattern) {
                    context.fillStyle = candyStripePattern;
                    context.fill();
                }
            }
        }
        context.textBaseline = 'alphabetic';
        context.beginPath();
        let lastMarkerLevel = -1;
        let lastMarkerX = -Infinity;
        // Markers are sorted top to bottom, right to left.
        for (let m = markerIndices.length - 1; m >= 0; --m) {
            const entryIndex = markerIndices[m];
            const title = this._dataProvider.entryTitle(entryIndex);
            if (!title) {
                continue;
            }
            const entryStartTime = entryStartTimes[entryIndex];
            const level = entryLevels[entryIndex];
            if (lastMarkerLevel !== level) {
                lastMarkerX = -Infinity;
            }
            const x = Math.max(this._chartViewport.timeToPosition(entryStartTime), lastMarkerX);
            const y = this._levelToOffset(level);
            const h = this._levelHeight(level);
            const padding = 4;
            const width = Math.ceil(UI.UIUtils.measureTextWidth(context, title)) + 2 * padding;
            lastMarkerX = x + width + 1;
            lastMarkerLevel = level;
            this._markerPositions.set(entryIndex, { x, width });
            context.fillStyle = this._dataProvider.entryColor(entryIndex);
            context.fillRect(x, y, width, h - 1);
            context.fillStyle = 'white';
            context.fillText(title, x + padding, y + h - this._textBaseline);
        }
        context.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        context.stroke();
        for (let i = 0; i < titleIndices.length; ++i) {
            const entryIndex = titleIndices[i];
            const entryStartTime = entryStartTimes[entryIndex];
            const barX = this._timeToPositionClipped(entryStartTime);
            const barRight = Math.min(this._timeToPositionClipped(entryStartTime + entryTotalTimes[entryIndex]), width) + 1;
            const barWidth = barRight - barX;
            const barLevel = entryLevels[entryIndex];
            const barY = this._levelToOffset(barLevel);
            let text = this._dataProvider.entryTitle(entryIndex);
            if (text && text.length) {
                context.font = this._dataProvider.entryFont(entryIndex) || defaultFont;
                text = UI.UIUtils.trimTextMiddle(context, text, barWidth - 2 * textPadding);
            }
            const unclippedBarX = this._chartViewport.timeToPosition(entryStartTime);
            const barHeight = this._levelHeight(barLevel);
            if (this._dataProvider.decorateEntry(entryIndex, context, text, barX, barY, barWidth, barHeight, unclippedBarX, timeToPixel)) {
                continue;
            }
            if (!text || !text.length) {
                continue;
            }
            context.fillStyle = this._dataProvider.textColor(entryIndex);
            context.fillText(text, barX + textPadding, barY + barHeight - this._textBaseline);
        }
        context.restore();
        this._drawGroupHeaders(width, height);
        this._drawFlowEvents(context, width, height);
        this._drawMarkers();
        const dividersData = TimelineGrid.calculateGridOffsets(this);
        const navStartTimes = Array.from(this._dataProvider.navStartTimes().values());
        let navStartTimeIndex = 0;
        const drawAdjustedTime = (time) => {
            if (navStartTimes.length === 0) {
                return this.formatValue(time, dividersData.precision);
            }
            // Track when the time crosses the boundary to the next nav start record,
            // and when it does, move the nav start array index accordingly.
            const hasNextNavStartTime = navStartTimes.length > navStartTimeIndex + 1;
            if (hasNextNavStartTime && time > navStartTimes[navStartTimeIndex + 1].startTime) {
                navStartTimeIndex++;
            }
            // Adjust the time by the nearest nav start marker's value.
            const nearestMarker = navStartTimes[navStartTimeIndex];
            if (nearestMarker) {
                time -= nearestMarker.startTime - this.zeroTime();
            }
            return this.formatValue(time, dividersData.precision);
        };
        TimelineGrid.drawCanvasGrid(context, dividersData);
        if (this._rulerEnabled) {
            TimelineGrid.drawCanvasHeaders(context, dividersData, drawAdjustedTime, 3, HeaderHeight);
        }
        this._updateElementPosition(this._highlightElement, this._highlightedEntryIndex);
        this._updateElementPosition(this._selectedElement, this._selectedEntryIndex);
        this._updateMarkerHighlight();
    }
    _initWebGL() {
        const gl = this._canvasGL.getContext('webgl');
        if (!gl) {
            console.error('Failed to obtain WebGL context.');
            this._useWebGL = false; // Fallback to use canvas.
            return;
        }
        const vertexShaderSource = `
  attribute vec2 aVertexPosition;
  attribute float aVertexColor;

  uniform vec2 uScalingFactor;
  uniform vec2 uShiftVector;

  varying mediump vec2 vPalettePosition;

  void main() {
  vec2 shiftedPosition = aVertexPosition - uShiftVector;
  gl_Position = vec4(shiftedPosition * uScalingFactor + vec2(-1.0, 1.0), 0.0, 1.0);
  vPalettePosition = vec2(aVertexColor, 0.5);
  }`;
        const fragmentShaderSource = `
  varying mediump vec2 vPalettePosition;
  uniform sampler2D uSampler;

  void main() {
  gl_FragColor = texture2D(uSampler, vPalettePosition);
  }`;
        function loadShader(gl, type, source) {
            const shader = gl.createShader(type);
            if (!shader) {
                return null;
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            }
            console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const shaderProgram = gl.createProgram();
        if (!shaderProgram || !vertexShader || !fragmentShader) {
            return;
        }
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            this._shaderProgram = shaderProgram;
            gl.useProgram(shaderProgram);
        }
        else {
            this._shaderProgram = null;
            throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        }
        this._vertexBuffer = gl.createBuffer();
        this._colorBuffer = gl.createBuffer();
        this._uScalingFactor = gl.getUniformLocation(shaderProgram, 'uScalingFactor');
        this._uShiftVector = gl.getUniformLocation(shaderProgram, 'uShiftVector');
        const uSampler = gl.getUniformLocation(shaderProgram, 'uSampler');
        gl.uniform1i(uSampler, 0);
        this._aVertexPosition = gl.getAttribLocation(this._shaderProgram, 'aVertexPosition');
        this._aVertexColor = gl.getAttribLocation(this._shaderProgram, 'aVertexColor');
        gl.enableVertexAttribArray(this._aVertexPosition);
        gl.enableVertexAttribArray(this._aVertexColor);
    }
    _setupGLGeometry() {
        const gl = this._canvasGL.getContext('webgl');
        if (!gl) {
            return;
        }
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        const entryTotalTimes = timelineData.entryTotalTimes;
        const entryStartTimes = timelineData.entryStartTimes;
        const entryLevels = timelineData.entryLevels;
        const verticesPerBar = 6;
        const vertexArray = new Float32Array(entryTotalTimes.length * verticesPerBar * 2);
        let colorArray = new Uint8Array(entryTotalTimes.length * verticesPerBar);
        let vertex = 0;
        const parsedColorCache = new Map();
        const colors = [];
        const visibleLevels = this._visibleLevels || [];
        const rawTimelineData = this._rawTimelineData || { groups: [] };
        const collapsedOverviewLevels = new Array(visibleLevels.length);
        const groups = rawTimelineData.groups || [];
        this._forEachGroup((offset, index, group) => {
            if (group.style.useFirstLineForOverview || !this._isGroupCollapsible(index) || group.expanded) {
                return;
            }
            let nextGroup = index + 1;
            while (nextGroup < groups.length && groups[nextGroup].style.nestingLevel > group.style.nestingLevel) {
                ++nextGroup;
            }
            const endLevel = nextGroup < groups.length ? groups[nextGroup].startLevel : this._dataProvider.maxStackDepth();
            for (let i = group.startLevel; i < endLevel; ++i) {
                collapsedOverviewLevels[i] = offset;
            }
        });
        for (let i = 0; i < entryTotalTimes.length; ++i) {
            const level = entryLevels[i];
            const collapsedGroupOffset = collapsedOverviewLevels[level];
            if (!visibleLevels[level] && !collapsedGroupOffset) {
                continue;
            }
            if (!this._entryColorsCache) {
                continue;
            }
            const color = this._entryColorsCache[i];
            if (!color) {
                continue;
            }
            let colorIndex = parsedColorCache.get(color);
            if (colorIndex === undefined) {
                const parsedColor = Common.Color.Color.parse(color);
                if (parsedColor) {
                    const rgba = parsedColor.canonicalRGBA();
                    rgba[3] = Math.round(rgba[3] * 255);
                    colorIndex = colors.length / 4;
                    colors.push(...rgba);
                    if (colorIndex === 256) {
                        colorArray = new Uint8Array(colorArray);
                    }
                }
                if (colorIndex) {
                    parsedColorCache.set(color, colorIndex);
                }
            }
            for (let j = 0; j < verticesPerBar; ++j) {
                if (colorIndex) {
                    colorArray[vertex + j] = colorIndex;
                }
            }
            const vpos = vertex * 2;
            const x0 = entryStartTimes[i] - this._minimumBoundary;
            const x1 = x0 + entryTotalTimes[i];
            const y0 = collapsedGroupOffset || this._levelToOffset(level);
            const y1 = y0 + this._levelHeight(level) - 1;
            vertexArray[vpos + 0] = x0;
            vertexArray[vpos + 1] = y0;
            vertexArray[vpos + 2] = x1;
            vertexArray[vpos + 3] = y0;
            vertexArray[vpos + 4] = x0;
            vertexArray[vpos + 5] = y1;
            vertexArray[vpos + 6] = x0;
            vertexArray[vpos + 7] = y1;
            vertexArray[vpos + 8] = x1;
            vertexArray[vpos + 9] = y0;
            vertexArray[vpos + 10] = x1;
            vertexArray[vpos + 11] = y1;
            vertex += verticesPerBar;
        }
        this._vertexCount = vertex;
        const paletteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, paletteTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.activeTexture(gl.TEXTURE0);
        const numColors = colors.length / 4;
        const useShortForColors = numColors >= 256;
        const width = !useShortForColors ? 256 : Math.min(1 << 16, gl.getParameter(gl.MAX_TEXTURE_SIZE));
        console.assert(numColors <= width, 'Too many colors');
        const height = 1;
        const colorIndexType = useShortForColors ? gl.UNSIGNED_SHORT : gl.UNSIGNED_BYTE;
        if (useShortForColors) {
            const factor = (1 << 16) / width;
            for (let i = 0; i < vertex; ++i) {
                colorArray[i] *= factor;
            }
        }
        const pixels = new Uint8Array(width * 4);
        pixels.set(colors);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        if (this._vertexBuffer && this._aVertexPosition) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this._aVertexPosition, /* vertexComponents */ 2, gl.FLOAT, false, 0, 0);
        }
        if (this._colorBuffer && this._aVertexColor) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
            gl.vertexAttribPointer(this._aVertexColor, /* colorComponents */ 1, colorIndexType, true, 0, 0);
        }
    }
    _drawGL() {
        const gl = this._canvasGL.getContext('webgl');
        if (!gl) {
            return;
        }
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        if (!this._prevTimelineData || timelineData.entryTotalTimes !== this._prevTimelineData.entryTotalTimes) {
            this._prevTimelineData = timelineData;
            this._setupGLGeometry();
        }
        gl.viewport(0, 0, this._canvasGL.width, this._canvasGL.height);
        if (!this._vertexCount) {
            return;
        }
        const viewportScale = [2.0 / this.boundarySpan(), -2.0 * window.devicePixelRatio / this._canvasGL.height];
        const viewportShift = [this.minimumBoundary() - this.zeroTime(), this._chartViewport.scrollOffset()];
        if (this._uScalingFactor) {
            gl.uniform2fv(this._uScalingFactor, viewportScale);
        }
        if (this._uShiftVector) {
            gl.uniform2fv(this._uShiftVector, viewportShift);
        }
        gl.drawArrays(gl.TRIANGLES, 0, this._vertexCount);
    }
    _drawGroupHeaders(width, height) {
        const context = this._canvas.getContext('2d');
        const top = this._chartViewport.scrollOffset();
        const ratio = window.devicePixelRatio;
        if (!this._rawTimelineData) {
            return;
        }
        const groups = this._rawTimelineData.groups || [];
        if (!groups.length) {
            return;
        }
        const groupOffsets = this._groupOffsets;
        if (groupOffsets === null || groupOffsets === undefined) {
            return;
        }
        const lastGroupOffset = groupOffsets[groupOffsets.length - 1];
        const colorUsage = ThemeSupport.ThemeSupport.ColorUsage;
        context.save();
        context.scale(ratio, ratio);
        context.translate(0, -top);
        const defaultFont = '11px ' + Host.Platform.fontFamily();
        context.font = defaultFont;
        context.fillStyle = ThemeSupport.ThemeSupport.instance().patchColorText('#fff', colorUsage.Background);
        this._forEachGroupInViewport((offset, index, group) => {
            const paddingHeight = group.style.padding;
            if (paddingHeight < 5) {
                return;
            }
            context.fillRect(0, offset - paddingHeight + 2, width, paddingHeight - 4);
        });
        if (groups.length && lastGroupOffset < top + height) {
            context.fillRect(0, lastGroupOffset + 2, width, top + height - lastGroupOffset);
        }
        context.strokeStyle = ThemeSupport.ThemeSupport.instance().patchColorText('#eee', colorUsage.Background);
        context.beginPath();
        this._forEachGroupInViewport((offset, index, group, isFirst) => {
            if (isFirst || group.style.padding < 4) {
                return;
            }
            hLine(offset - 2.5);
        });
        hLine(lastGroupOffset + 1.5);
        context.stroke();
        this._forEachGroupInViewport((offset, index, group) => {
            if (group.style.useFirstLineForOverview) {
                return;
            }
            if (!this._isGroupCollapsible(index) || group.expanded) {
                if (!group.style.shareHeaderLine && this._isGroupFocused(index)) {
                    context.fillStyle = group.style.backgroundColor;
                    context.fillRect(0, offset, width, group.style.height);
                }
                return;
            }
            if (this._useWebGL) {
                return;
            }
            let nextGroup = index + 1;
            while (nextGroup < groups.length && groups[nextGroup].style.nestingLevel > group.style.nestingLevel) {
                nextGroup++;
            }
            const endLevel = nextGroup < groups.length ? groups[nextGroup].startLevel : this._dataProvider.maxStackDepth();
            this._drawCollapsedOverviewForGroup(group, offset, endLevel);
        });
        context.save();
        this._forEachGroupInViewport((offset, index, group) => {
            context.font = group.style.font;
            if (this._isGroupCollapsible(index) && !group.expanded || group.style.shareHeaderLine) {
                const width = this._labelWidthForGroup(context, group) + 2;
                if (this._isGroupFocused(index)) {
                    context.fillStyle = this._selectedGroupBackroundColor;
                }
                else {
                    const parsedColor = Common.Color.Color.parse(group.style.backgroundColor);
                    if (parsedColor) {
                        context.fillStyle = parsedColor.setAlpha(0.8).asString(null);
                    }
                }
                context.fillRect(this._headerLeftPadding - this._headerLabelXPadding, offset + this._headerLabelYPadding, width, group.style.height - 2 * this._headerLabelYPadding);
            }
            context.fillStyle = group.style.color;
            context.fillText(group.name, Math.floor(this._expansionArrowIndent * (group.style.nestingLevel + 1) + this._arrowSide), offset + group.style.height - this._textBaseline);
        });
        context.restore();
        context.fillStyle = ThemeSupport.ThemeSupport.instance().patchColorText('#6e6e6e', colorUsage.Foreground);
        context.beginPath();
        this._forEachGroupInViewport((offset, index, group) => {
            if (this._isGroupCollapsible(index)) {
                drawExpansionArrow.call(this, this._expansionArrowIndent * (group.style.nestingLevel + 1), offset + group.style.height - this._textBaseline - this._arrowSide / 2, Boolean(group.expanded));
            }
        });
        context.fill();
        context.strokeStyle = ThemeSupport.ThemeSupport.instance().patchColorText('#ddd', colorUsage.Background);
        context.beginPath();
        context.stroke();
        this._forEachGroupInViewport((offset, index, group, isFirst, groupHeight) => {
            if (this._isGroupFocused(index)) {
                const lineWidth = 2;
                const bracketLength = 10;
                context.fillStyle = this._selectedGroupBorderColor;
                context.fillRect(0, offset - lineWidth, lineWidth, groupHeight - group.style.padding + 2 * lineWidth);
                context.fillRect(0, offset - lineWidth, bracketLength, lineWidth);
                context.fillRect(0, offset + groupHeight - group.style.padding, bracketLength, lineWidth);
            }
        });
        context.restore();
        function hLine(y) {
            context.moveTo(0, y);
            context.lineTo(width, y);
        }
        function drawExpansionArrow(x, y, expanded) {
            const arrowHeight = this._arrowSide * Math.sqrt(3) / 2;
            const arrowCenterOffset = Math.round(arrowHeight / 2);
            context.save();
            context.translate(x, y);
            context.rotate(expanded ? Math.PI / 2 : 0);
            context.moveTo(-arrowCenterOffset, -this._arrowSide / 2);
            context.lineTo(-arrowCenterOffset, this._arrowSide / 2);
            context.lineTo(arrowHeight - arrowCenterOffset, 0);
            context.restore();
        }
    }
    _forEachGroup(callback) {
        if (!this._rawTimelineData) {
            return;
        }
        const groups = this._rawTimelineData.groups || [];
        if (!groups.length) {
            return;
        }
        const groupOffsets = this._groupOffsets;
        if (!groupOffsets) {
            return;
        }
        const groupStack = [{ nestingLevel: -1, visible: true }];
        for (let i = 0; i < groups.length; ++i) {
            const groupTop = groupOffsets[i];
            const group = groups[i];
            let firstGroup = true;
            let last = groupStack[groupStack.length - 1];
            while (last && last.nestingLevel >= group.style.nestingLevel) {
                groupStack.pop();
                firstGroup = false;
                last = groupStack[groupStack.length - 1];
            }
            last = groupStack[groupStack.length - 1];
            const parentGroupVisible = last ? last.visible : false;
            const thisGroupVisible = parentGroupVisible && (!this._isGroupCollapsible(i) || group.expanded);
            groupStack.push({ nestingLevel: group.style.nestingLevel, visible: Boolean(thisGroupVisible) });
            const nextOffset = i === groups.length - 1 ? groupOffsets[i + 1] + group.style.padding : groupOffsets[i + 1];
            if (!parentGroupVisible) {
                continue;
            }
            callback(groupTop, i, group, firstGroup, nextOffset - groupTop);
        }
    }
    _forEachGroupInViewport(callback) {
        const top = this._chartViewport.scrollOffset();
        this._forEachGroup((groupTop, index, group, firstGroup, height) => {
            if (groupTop - group.style.padding > top + this._offsetHeight) {
                return;
            }
            if (groupTop + height < top) {
                return;
            }
            callback(groupTop, index, group, firstGroup, height);
        });
    }
    _labelWidthForGroup(context, group) {
        return UI.UIUtils.measureTextWidth(context, group.name) +
            this._expansionArrowIndent * (group.style.nestingLevel + 1) + 2 * this._headerLabelXPadding;
    }
    _drawCollapsedOverviewForGroup(group, y, endLevel) {
        const range = new Common.SegmentedRange.SegmentedRange(mergeCallback);
        const timeWindowLeft = this._chartViewport.windowLeftTime();
        const timeWindowRight = this._chartViewport.windowRightTime();
        const context = this._canvas.getContext('2d');
        const barHeight = group.style.height;
        if (!this._rawTimelineData) {
            return;
        }
        const entryStartTimes = this._rawTimelineData.entryStartTimes;
        const entryTotalTimes = this._rawTimelineData.entryTotalTimes;
        const timeToPixel = this._chartViewport.timeToPixel();
        for (let level = group.startLevel; level < endLevel; ++level) {
            const levelIndexes = this._timelineLevels ? this._timelineLevels[level] : [];
            const rightIndexOnLevel = Platform.ArrayUtilities.lowerBound(levelIndexes, timeWindowRight, (time, entryIndex) => time - entryStartTimes[entryIndex]) -
                1;
            let lastDrawOffset = Infinity;
            for (let entryIndexOnLevel = rightIndexOnLevel; entryIndexOnLevel >= 0; --entryIndexOnLevel) {
                const entryIndex = levelIndexes[entryIndexOnLevel];
                const entryStartTime = entryStartTimes[entryIndex];
                const barX = this._timeToPositionClipped(entryStartTime);
                const entryEndTime = entryStartTime + entryTotalTimes[entryIndex];
                if (isNaN(entryEndTime) || barX >= lastDrawOffset) {
                    continue;
                }
                if (entryEndTime <= timeWindowLeft) {
                    break;
                }
                lastDrawOffset = barX;
                const color = this._entryColorsCache ? this._entryColorsCache[entryIndex] : '';
                const endBarX = this._timeToPositionClipped(entryEndTime);
                if (group.style.useDecoratorsForOverview && this._dataProvider.forceDecoration(entryIndex)) {
                    const unclippedBarX = this._chartViewport.timeToPosition(entryStartTime);
                    const barWidth = endBarX - barX;
                    context.beginPath();
                    context.fillStyle = color;
                    context.fillRect(barX, y, barWidth, barHeight - 1);
                    this._dataProvider.decorateEntry(entryIndex, context, '', barX, y, barWidth, barHeight, unclippedBarX, timeToPixel);
                    continue;
                }
                range.append(new Common.SegmentedRange.Segment(barX, endBarX, color));
            }
        }
        const segments = range.segments().slice().sort((a, b) => a.data.localeCompare(b.data));
        let lastColor;
        context.beginPath();
        for (let i = 0; i < segments.length; ++i) {
            const segment = segments[i];
            if (lastColor !== segments[i].data) {
                context.fill();
                context.beginPath();
                lastColor = segments[i].data;
                context.fillStyle = lastColor;
            }
            context.rect(segment.begin, y, segment.end - segment.begin, barHeight);
        }
        context.fill();
        function mergeCallback(a, b) {
            return a.data === b.data && a.end + 0.4 > b.end ? a : null;
        }
    }
    _drawFlowEvents(context, _width, _height) {
        context.save();
        const ratio = window.devicePixelRatio;
        const top = this._chartViewport.scrollOffset();
        const arrowWidth = 6;
        context.scale(ratio, ratio);
        context.translate(0, -top);
        context.fillStyle = '#7f5050';
        context.strokeStyle = '#7f5050';
        const td = this._timelineData();
        if (!td) {
            return;
        }
        const endIndex = Platform.ArrayUtilities.lowerBound(td.flowStartTimes, this._chartViewport.windowRightTime(), Platform.ArrayUtilities.DEFAULT_COMPARATOR);
        context.lineWidth = 0.5;
        for (let i = 0; i < endIndex; ++i) {
            if (!td.flowEndTimes[i] || td.flowEndTimes[i] < this._chartViewport.windowLeftTime()) {
                continue;
            }
            const startX = this._chartViewport.timeToPosition(td.flowStartTimes[i]);
            const endX = this._chartViewport.timeToPosition(td.flowEndTimes[i]);
            const startLevel = td.flowStartLevels[i];
            const endLevel = td.flowEndLevels[i];
            const startY = this._levelToOffset(startLevel) + this._levelHeight(startLevel) / 2;
            const endY = this._levelToOffset(endLevel) + this._levelHeight(endLevel) / 2;
            const segment = Math.min((endX - startX) / 4, 40);
            const distanceTime = td.flowEndTimes[i] - td.flowStartTimes[i];
            const distanceY = (endY - startY) / 10;
            const spread = 30;
            const lineY = distanceTime < 1 ? startY : spread + Math.max(0, startY + distanceY * (i % spread));
            const p = [];
            p.push({ x: startX, y: startY });
            p.push({ x: startX + arrowWidth, y: startY });
            p.push({ x: startX + segment + 2 * arrowWidth, y: startY });
            p.push({ x: startX + segment, y: lineY });
            p.push({ x: startX + segment * 2, y: lineY });
            p.push({ x: endX - segment * 2, y: lineY });
            p.push({ x: endX - segment, y: lineY });
            p.push({ x: endX - segment - 2 * arrowWidth, y: endY });
            p.push({ x: endX - arrowWidth, y: endY });
            context.beginPath();
            context.moveTo(p[0].x, p[0].y);
            context.lineTo(p[1].x, p[1].y);
            context.bezierCurveTo(p[2].x, p[2].y, p[3].x, p[3].y, p[4].x, p[4].y);
            context.lineTo(p[5].x, p[5].y);
            context.bezierCurveTo(p[6].x, p[6].y, p[7].x, p[7].y, p[8].x, p[8].y);
            context.stroke();
            context.beginPath();
            context.arc(startX, startY, 2, -Math.PI / 2, Math.PI / 2, false);
            context.fill();
            context.beginPath();
            context.moveTo(endX, endY);
            context.lineTo(endX - arrowWidth, endY - 3);
            context.lineTo(endX - arrowWidth, endY + 3);
            context.fill();
        }
        context.restore();
    }
    _drawMarkers() {
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        const markers = timelineData.markers;
        const left = this._markerIndexBeforeTime(this.minimumBoundary());
        const rightBoundary = this.maximumBoundary();
        const timeToPixel = this._chartViewport.timeToPixel();
        const context = this._canvas.getContext('2d');
        context.save();
        const ratio = window.devicePixelRatio;
        context.scale(ratio, ratio);
        context.translate(0, 3);
        const height = HeaderHeight - 1;
        for (let i = left; i < markers.length; i++) {
            const timestamp = markers[i].startTime();
            if (timestamp > rightBoundary) {
                break;
            }
            markers[i].draw(context, this._chartViewport.timeToPosition(timestamp), height, timeToPixel);
        }
        context.restore();
    }
    _updateMarkerHighlight() {
        const element = this._markerHighlighElement;
        if (element.parentElement) {
            element.remove();
        }
        const markerIndex = this._highlightedMarkerIndex;
        if (markerIndex === -1) {
            return;
        }
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        const marker = timelineData.markers[markerIndex];
        const barX = this._timeToPositionClipped(marker.startTime());
        UI.Tooltip.Tooltip.install(element, marker.title() || '');
        const style = element.style;
        style.left = barX + 'px';
        style.backgroundColor = marker.color();
        this._viewportElement.appendChild(element);
    }
    _processTimelineData(timelineData) {
        if (!timelineData) {
            this._timelineLevels = null;
            this._visibleLevelOffsets = null;
            this._visibleLevels = null;
            this._groupOffsets = null;
            this._rawTimelineData = null;
            this._forceDecorationCache = null;
            this._entryColorsCache = null;
            this._rawTimelineDataLength = 0;
            this._selectedGroup = -1;
            this._keyboardFocusedGroup = -1;
            this._flameChartDelegate.updateSelectedGroup(this, null);
            return;
        }
        this._rawTimelineData = timelineData;
        this._rawTimelineDataLength = timelineData.entryStartTimes.length;
        this._forceDecorationCache = new Int8Array(this._rawTimelineDataLength);
        this._entryColorsCache = new Array(this._rawTimelineDataLength);
        for (let i = 0; i < this._rawTimelineDataLength; ++i) {
            this._forceDecorationCache[i] = this._dataProvider.forceDecoration(i) ? 1 : 0;
            this._entryColorsCache[i] = this._dataProvider.entryColor(i);
        }
        const entryCounters = new Uint32Array(this._dataProvider.maxStackDepth() + 1);
        for (let i = 0; i < timelineData.entryLevels.length; ++i) {
            ++entryCounters[timelineData.entryLevels[i]];
        }
        const levelIndexes = new Array(entryCounters.length);
        for (let i = 0; i < levelIndexes.length; ++i) {
            levelIndexes[i] = new Uint32Array(entryCounters[i]);
            entryCounters[i] = 0;
        }
        for (let i = 0; i < timelineData.entryLevels.length; ++i) {
            const level = timelineData.entryLevels[i];
            levelIndexes[level][entryCounters[level]++] = i;
        }
        this._timelineLevels = levelIndexes;
        const groups = this._rawTimelineData.groups || [];
        for (let i = 0; i < groups.length; ++i) {
            const expanded = this._groupExpansionState[groups[i].name];
            if (expanded !== undefined) {
                groups[i].expanded = expanded;
            }
        }
        this._updateLevelPositions();
        this._updateHeight();
        this._selectedGroup = timelineData.selectedGroup ? groups.indexOf(timelineData.selectedGroup) : -1;
        this._keyboardFocusedGroup = this._selectedGroup;
        this._flameChartDelegate.updateSelectedGroup(this, timelineData.selectedGroup);
    }
    _updateLevelPositions() {
        const levelCount = this._dataProvider.maxStackDepth();
        const groups = this._rawTimelineData ? (this._rawTimelineData.groups || []) : [];
        this._visibleLevelOffsets = new Uint32Array(levelCount + 1);
        this._visibleLevelHeights = new Uint32Array(levelCount);
        this._visibleLevels = new Uint16Array(levelCount);
        this._groupOffsets = new Uint32Array(groups.length + 1);
        let groupIndex = -1;
        let currentOffset = this._rulerEnabled ? HeaderHeight + 2 : 2;
        let visible = true;
        const groupStack = [{ nestingLevel: -1, visible: true }];
        const lastGroupLevel = Math.max(levelCount, groups.length ? groups[groups.length - 1].startLevel + 1 : 0);
        let level;
        for (level = 0; level < lastGroupLevel; ++level) {
            let parentGroupIsVisible = true;
            let style;
            while (groupIndex < groups.length - 1 && level === groups[groupIndex + 1].startLevel) {
                ++groupIndex;
                style = groups[groupIndex].style;
                let nextLevel = true;
                let last = groupStack[groupStack.length - 1];
                while (last && last.nestingLevel >= style.nestingLevel) {
                    groupStack.pop();
                    nextLevel = false;
                    last = groupStack[groupStack.length - 1];
                }
                const thisGroupIsVisible = groupIndex >= 0 && this._isGroupCollapsible(groupIndex) ? groups[groupIndex].expanded : true;
                last = groupStack[groupStack.length - 1];
                parentGroupIsVisible = last ? last.visible : false;
                visible = Boolean(thisGroupIsVisible) && parentGroupIsVisible;
                groupStack.push({ nestingLevel: style.nestingLevel, visible: visible });
                if (parentGroupIsVisible) {
                    currentOffset += nextLevel ? 0 : style.padding;
                }
                this._groupOffsets[groupIndex] = currentOffset;
                if (parentGroupIsVisible && !style.shareHeaderLine) {
                    currentOffset += style.height;
                }
            }
            if (level >= levelCount) {
                continue;
            }
            const isFirstOnLevel = groupIndex >= 0 && level === groups[groupIndex].startLevel;
            const thisLevelIsVisible = parentGroupIsVisible && (visible || isFirstOnLevel && groups[groupIndex].style.useFirstLineForOverview);
            let height;
            if (groupIndex >= 0) {
                const group = groups[groupIndex];
                const styleB = group.style;
                height = isFirstOnLevel && !styleB.shareHeaderLine || (styleB.collapsible && !group.expanded) ?
                    styleB.height :
                    (styleB.itemsHeight || this._barHeight);
            }
            else {
                height = this._barHeight;
            }
            this._visibleLevels[level] = thisLevelIsVisible ? 1 : 0;
            this._visibleLevelOffsets[level] = currentOffset;
            this._visibleLevelHeights[level] = height;
            if (thisLevelIsVisible || (parentGroupIsVisible && style && style.shareHeaderLine && isFirstOnLevel)) {
                currentOffset += this._visibleLevelHeights[level];
            }
        }
        if (groupIndex >= 0) {
            this._groupOffsets[groupIndex + 1] = currentOffset;
        }
        this._visibleLevelOffsets[level] = currentOffset;
        if (this._useWebGL) {
            this._setupGLGeometry();
        }
    }
    _isGroupCollapsible(index) {
        if (!this._rawTimelineData) {
            return;
        }
        const groups = this._rawTimelineData.groups || [];
        const style = groups[index].style;
        if (!style.shareHeaderLine || !style.collapsible) {
            return Boolean(style.collapsible);
        }
        const isLastGroup = index + 1 >= groups.length;
        if (!isLastGroup && groups[index + 1].style.nestingLevel > style.nestingLevel) {
            return true;
        }
        const nextGroupLevel = isLastGroup ? this._dataProvider.maxStackDepth() : groups[index + 1].startLevel;
        if (nextGroupLevel !== groups[index].startLevel + 1) {
            return true;
        }
        // For groups that only have one line and share header line, pretend these are not collapsible
        // unless the itemsHeight does not match the headerHeight
        return style.height !== style.itemsHeight;
    }
    setSelectedEntry(entryIndex) {
        if (this._selectedEntryIndex === entryIndex) {
            return;
        }
        if (entryIndex !== -1) {
            this._chartViewport.hideRangeSelection();
        }
        this._selectedEntryIndex = entryIndex;
        this._revealEntry(entryIndex);
        this._updateElementPosition(this._selectedElement, this._selectedEntryIndex);
    }
    _updateElementPosition(element, entryIndex) {
        const elementMinWidthPx = 2;
        element.classList.add('hidden');
        if (entryIndex === -1) {
            return;
        }
        const timelineData = this._timelineData();
        if (!timelineData) {
            return;
        }
        const startTime = timelineData.entryStartTimes[entryIndex];
        const duration = timelineData.entryTotalTimes[entryIndex];
        let barX = 0;
        let barWidth = 0;
        let visible = true;
        if (Number.isNaN(duration)) {
            const position = this._markerPositions.get(entryIndex);
            if (position) {
                barX = position.x;
                barWidth = position.width;
            }
            else {
                visible = false;
            }
        }
        else {
            barX = this._chartViewport.timeToPosition(startTime);
            barWidth = duration * this._chartViewport.timeToPixel();
        }
        if (barX + barWidth <= 0 || barX >= this._offsetWidth) {
            return;
        }
        const barCenter = barX + barWidth / 2;
        barWidth = Math.max(barWidth, elementMinWidthPx);
        barX = barCenter - barWidth / 2;
        const entryLevel = timelineData.entryLevels[entryIndex];
        const barY = this._levelToOffset(entryLevel) - this._chartViewport.scrollOffset();
        const barHeight = this._levelHeight(entryLevel);
        const style = element.style;
        style.left = barX + 'px';
        style.top = barY + 'px';
        style.width = barWidth + 'px';
        style.height = barHeight - 1 + 'px';
        element.classList.toggle('hidden', !visible);
        this._viewportElement.appendChild(element);
    }
    _timeToPositionClipped(time) {
        return Platform.NumberUtilities.clamp(this._chartViewport.timeToPosition(time), 0, this._offsetWidth);
    }
    _levelToOffset(level) {
        if (!this._visibleLevelOffsets) {
            throw new Error('No visible level offsets');
        }
        return this._visibleLevelOffsets[level];
    }
    _levelHeight(level) {
        if (!this._visibleLevelHeights) {
            throw new Error('No visible level heights');
        }
        return this._visibleLevelHeights[level];
    }
    _updateBoundaries() {
        this._totalTime = this._dataProvider.totalTime();
        this._minimumBoundary = this._dataProvider.minimumBoundary();
        this._chartViewport.setBoundaries(this._minimumBoundary, this._totalTime);
    }
    _updateHeight() {
        const height = this._levelToOffset(this._dataProvider.maxStackDepth()) + 2;
        this._chartViewport.setContentHeight(height);
    }
    onResize() {
        this.scheduleUpdate();
    }
    update() {
        if (!this._timelineData()) {
            return;
        }
        this._resetCanvas();
        this._updateHeight();
        this._updateBoundaries();
        this._draw();
        if (!this._chartViewport.isDragging()) {
            this._updateHighlight();
        }
    }
    reset() {
        this._chartViewport.reset();
        this._rawTimelineData = null;
        this._rawTimelineDataLength = 0;
        this._highlightedMarkerIndex = -1;
        this._highlightedEntryIndex = -1;
        this._selectedEntryIndex = -1;
        /** @type {!Map<string,!Map<string,number>>} */
        this._textWidth = new Map();
        this._chartViewport.scheduleUpdate();
    }
    scheduleUpdate() {
        this._chartViewport.scheduleUpdate();
    }
    _enabled() {
        return this._rawTimelineDataLength !== 0;
    }
    computePosition(time) {
        return this._chartViewport.timeToPosition(time);
    }
    formatValue(value, precision) {
        return this._dataProvider.formatValue(value - this.zeroTime(), precision);
    }
    maximumBoundary() {
        return this._chartViewport.windowRightTime();
    }
    minimumBoundary() {
        return this._chartViewport.windowLeftTime();
    }
    zeroTime() {
        return this._dataProvider.minimumBoundary();
    }
    boundarySpan() {
        return this.maximumBoundary() - this.minimumBoundary();
    }
}
export const HeaderHeight = 15;
export const MinimalTimeWindowMs = 0.5;
export class TimelineData {
    entryLevels;
    entryTotalTimes;
    entryStartTimes;
    groups;
    markers;
    flowStartTimes;
    flowStartLevels;
    flowEndTimes;
    flowEndLevels;
    selectedGroup;
    constructor(entryLevels, entryTotalTimes, entryStartTimes, groups) {
        this.entryLevels = entryLevels;
        this.entryTotalTimes = entryTotalTimes;
        this.entryStartTimes = entryStartTimes;
        this.groups = groups || [];
        this.markers = [];
        this.flowStartTimes = [];
        this.flowStartLevels = [];
        this.flowEndTimes = [];
        this.flowEndLevels = [];
        this.selectedGroup = null;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["CanvasFocused"] = "CanvasFocused";
    Events["EntryInvoked"] = "EntryInvoked";
    Events["EntrySelected"] = "EntrySelected";
    Events["EntryHighlighted"] = "EntryHighlighted";
})(Events || (Events = {}));
export const Colors = {
    SelectedGroupBackground: 'hsl(215, 85%, 98%)',
    SelectedGroupBorder: 'hsl(216, 68%, 54%)',
};
//# sourceMappingURL=FlameChart.js.map