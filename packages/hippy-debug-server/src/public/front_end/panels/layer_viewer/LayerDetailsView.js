/*
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
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ScrollRectSelection } from './LayerViewHost.js';
const UIStrings = {
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    selectALayerToSeeItsDetails: 'Select a layer to see its details',
    /**
    *@description Element text content in Layer Details View of the Layers panel
    *@example {Touch event handler} PH1
    *@example {10} PH2
    *@example {10} PH3
    *@example {10} PH4
    *@example {10} PH5
    */
    scrollRectangleDimensions: '{PH1} {PH2} × {PH3} (at {PH4}, {PH5})',
    /**
    * @description Text in Layer Details View of the Layers panel. Used to indicate that a particular
    * layer of the website is unnamed (was not given a name/doesn't have one).
    */
    unnamed: '<unnamed>',
    /**
    *@description Text in Layer Details View of the Layers panel
    *@example {Nearest Layer Shifting Sticky Box} PH1
    *@example {&lt;unnamed&gt;} PH2
    *@example {5} PH3
    */
    stickyAncenstorLayersS: '{PH1}: {PH2} ({PH3})',
    /**
    *@description Sticky box rect element text content in Layer Details View of the Layers panel
    *@example {10} PH1
    *@example {10} PH2
    *@example {10} PH3
    *@example {10} PH4
    */
    stickyBoxRectangleDimensions: 'Sticky Box {PH1} × {PH2} (at {PH3}, {PH4})',
    /**
    * @description Containing block rect element text content in Layer Details View of the Layers panel.
    * The placeholder are width, height, x position, and y position respectively.
    *@example {10} PH1
    *@example {10} PH2
    *@example {10} PH3
    *@example {10} PH4
    */
    containingBlocRectangleDimensions: 'Containing Block {PH1} × {PH2} (at {PH3}, {PH4})',
    /**
    * @description Text in Layer Details View of the Layers panel. This also means "The nearest sticky
    * box that causes a layer shift".
    */
    nearestLayerShiftingStickyBox: 'Nearest Layer Shifting Sticky Box',
    /**
    * @description Text in Layer Details View of the Layers panel. This also means "The nearest block
    * that causes a layer shift".
    */
    nearestLayerShiftingContaining: 'Nearest Layer Shifting Containing Block',
    /**
    *@description Size cell text content in Layer Details View of the Layers panel
    *@example {10} PH1
    *@example {10} PH2
    *@example {10} PH3
    *@example {10} PH4
    */
    updateRectangleDimensions: '{PH1} × {PH2} (at {PH3}, {PH4})',
    /**
    *@description Text for the size of something
    */
    size: 'Size',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    compositingReasons: 'Compositing Reasons',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    memoryEstimate: 'Memory estimate',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    paintCount: 'Paint count',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    slowScrollRegions: 'Slow scroll regions',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    stickyPositionConstraint: 'Sticky position constraint',
    /**
    *@description Title of the paint profiler, old name of the performance pane
    */
    paintProfiler: 'Paint Profiler',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    nonFastScrollable: 'Non fast scrollable',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    touchEventHandler: 'Touch event handler',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    wheelEventHandler: 'Wheel event handler',
    /**
    * @description Text in Layer Details View of the Layers panel. Means that this rectangle needs to
    * be repainted when the webpage is scrolled. 'repaints' means that the browser engine needs to
    * draw the pixels for this rectangle to the user's monitor again.
    */
    repaintsOnScroll: 'Repaints on scroll',
    /**
    *@description Text in Layer Details View of the Layers panel
    */
    mainThreadScrollingReason: 'Main thread scrolling reason',
};
const str_ = i18n.i18n.registerUIStrings('panels/layer_viewer/LayerDetailsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class LayerDetailsView extends UI.Widget.Widget {
    _layerViewHost;
    _emptyWidget;
    _layerSnapshotMap;
    _tableElement;
    _tbodyElement;
    _sizeCell;
    _compositingReasonsCell;
    _memoryEstimateCell;
    _paintCountCell;
    _scrollRectsCell;
    _stickyPositionConstraintCell;
    _paintProfilerLink;
    _selection;
    constructor(layerViewHost) {
        super(true);
        this.registerRequiredCSS('panels/layer_viewer/layerDetailsView.css', { enableLegacyPatching: false });
        this._layerViewHost = layerViewHost;
        this._layerViewHost.registerView(this);
        this._emptyWidget = new UI.EmptyWidget.EmptyWidget(i18nString(UIStrings.selectALayerToSeeItsDetails));
        this._layerSnapshotMap = this._layerViewHost.getLayerSnapshotMap();
        this._buildContent();
        this._selection = null;
    }
    hoverObject(_selection) {
    }
    selectObject(selection) {
        this._selection = selection;
        if (this.isShowing()) {
            this.update();
        }
    }
    setLayerTree(_layerTree) {
    }
    wasShown() {
        super.wasShown();
        this.update();
    }
    _onScrollRectClicked(index, event) {
        if (event.which !== 1) {
            return;
        }
        if (!this._selection) {
            return;
        }
        this._layerViewHost.selectObject(new ScrollRectSelection(this._selection.layer(), index));
    }
    _invokeProfilerLink() {
        if (!this._selection) {
            return;
        }
        const snapshotSelection = this._selection.type() === "Snapshot" /* Snapshot */ ?
            this._selection :
            this._layerSnapshotMap.get(this._selection.layer());
        if (snapshotSelection) {
            this.dispatchEventToListeners(Events.PaintProfilerRequested, snapshotSelection);
        }
    }
    _createScrollRectElement(scrollRect, index) {
        if (index) {
            UI.UIUtils.createTextChild(this._scrollRectsCell, ', ');
        }
        const element = this._scrollRectsCell.createChild('span', 'scroll-rect');
        if (this._selection && this._selection.scrollRectIndex === index) {
            element.classList.add('active');
        }
        element.textContent = i18nString(UIStrings.scrollRectangleDimensions, {
            PH1: slowScrollRectNames.get(scrollRect.type)?.(),
            PH2: scrollRect.rect.width,
            PH3: scrollRect.rect.height,
            PH4: scrollRect.rect.x,
            PH5: scrollRect.rect.y,
        });
        element.addEventListener('click', this._onScrollRectClicked.bind(this, index), false);
    }
    _formatStickyAncestorLayer(title, layer) {
        if (!layer) {
            return '';
        }
        const node = layer.nodeForSelfOrAncestor();
        const name = node ? node.simpleSelector() : i18nString(UIStrings.unnamed);
        return i18nString(UIStrings.stickyAncenstorLayersS, { PH1: title, PH2: name, PH3: layer.id() });
    }
    _createStickyAncestorChild(title, layer) {
        if (!layer) {
            return;
        }
        UI.UIUtils.createTextChild(this._stickyPositionConstraintCell, ', ');
        const child = this._stickyPositionConstraintCell.createChild('span');
        child.textContent = this._formatStickyAncestorLayer(title, layer);
    }
    _populateStickyPositionConstraintCell(constraint) {
        this._stickyPositionConstraintCell.removeChildren();
        if (!constraint) {
            return;
        }
        const stickyBoxRect = constraint.stickyBoxRect();
        const stickyBoxRectElement = this._stickyPositionConstraintCell.createChild('span');
        stickyBoxRectElement.textContent = i18nString(UIStrings.stickyBoxRectangleDimensions, { PH1: stickyBoxRect.width, PH2: stickyBoxRect.height, PH3: stickyBoxRect.x, PH4: stickyBoxRect.y });
        UI.UIUtils.createTextChild(this._stickyPositionConstraintCell, ', ');
        const containingBlockRect = constraint.containingBlockRect();
        const containingBlockRectElement = this._stickyPositionConstraintCell.createChild('span');
        containingBlockRectElement.textContent = i18nString(UIStrings.containingBlocRectangleDimensions, {
            PH1: containingBlockRect.width,
            PH2: containingBlockRect.height,
            PH3: containingBlockRect.x,
            PH4: containingBlockRect.y,
        });
        this._createStickyAncestorChild(i18nString(UIStrings.nearestLayerShiftingStickyBox), constraint.nearestLayerShiftingStickyBox());
        this._createStickyAncestorChild(i18nString(UIStrings.nearestLayerShiftingContaining), constraint.nearestLayerShiftingContainingBlock());
    }
    update() {
        const layer = this._selection && this._selection.layer();
        if (!layer) {
            this._tableElement.remove();
            this._paintProfilerLink.remove();
            this._emptyWidget.show(this.contentElement);
            return;
        }
        this._emptyWidget.detach();
        this.contentElement.appendChild(this._tableElement);
        this.contentElement.appendChild(this._paintProfilerLink);
        this._sizeCell.textContent = i18nString(UIStrings.updateRectangleDimensions, { PH1: layer.width(), PH2: layer.height(), PH3: layer.offsetX(), PH4: layer.offsetY() });
        if (this._paintCountCell.parentElement) {
            this._paintCountCell.parentElement.classList.toggle('hidden', !layer.paintCount());
        }
        this._paintCountCell.textContent = String(layer.paintCount());
        this._memoryEstimateCell.textContent = Platform.NumberUtilities.bytesToString(layer.gpuMemoryUsage());
        layer.requestCompositingReasonIds().then(this._updateCompositingReasons.bind(this));
        this._scrollRectsCell.removeChildren();
        layer.scrollRects().forEach(this._createScrollRectElement.bind(this));
        this._populateStickyPositionConstraintCell(layer.stickyPositionConstraint());
        const snapshot = this._selection && this._selection.type() === "Snapshot" /* Snapshot */ ?
            this._selection.snapshot() :
            null;
        this._paintProfilerLink.classList.toggle('hidden', !(this._layerSnapshotMap.has(layer) || snapshot));
    }
    _buildContent() {
        this._tableElement = this.contentElement.createChild('table');
        this._tbodyElement = this._tableElement.createChild('tbody');
        this._sizeCell = this._createRow(i18nString(UIStrings.size));
        this._compositingReasonsCell = this._createRow(i18nString(UIStrings.compositingReasons));
        this._memoryEstimateCell = this._createRow(i18nString(UIStrings.memoryEstimate));
        this._paintCountCell = this._createRow(i18nString(UIStrings.paintCount));
        this._scrollRectsCell = this._createRow(i18nString(UIStrings.slowScrollRegions));
        this._stickyPositionConstraintCell = this._createRow(i18nString(UIStrings.stickyPositionConstraint));
        this._paintProfilerLink =
            this.contentElement.createChild('span', 'hidden devtools-link link-margin');
        UI.ARIAUtils.markAsLink(this._paintProfilerLink);
        this._paintProfilerLink.textContent = i18nString(UIStrings.paintProfiler);
        this._paintProfilerLink.tabIndex = 0;
        this._paintProfilerLink.addEventListener('click', e => {
            e.consume(true);
            this._invokeProfilerLink();
        });
        this._paintProfilerLink.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.consume();
                this._invokeProfilerLink();
            }
        });
    }
    _createRow(title) {
        const tr = this._tbodyElement.createChild('tr');
        const titleCell = tr.createChild('td');
        titleCell.textContent = title;
        return tr.createChild('td');
    }
    _updateCompositingReasons(compositingReasonIds) {
        if (!compositingReasonIds || !compositingReasonIds.length) {
            this._compositingReasonsCell.textContent = 'n/a';
            return;
        }
        this._compositingReasonsCell.removeChildren();
        const list = this._compositingReasonsCell.createChild('ul');
        const compositingReasons = LayerDetailsView.getCompositingReasons(compositingReasonIds);
        for (const compositingReason of compositingReasons) {
            list.createChild('li').textContent = compositingReason;
        }
    }
    static getCompositingReasons(compositingReasonIds) {
        const compositingReasons = [];
        for (const compositingReasonId of compositingReasonIds) {
            const compositingReason = compositingReasonIdToReason.get(compositingReasonId);
            if (compositingReason) {
                compositingReasons.push(compositingReason);
            }
            else {
                console.error(`Compositing reason id '${compositingReasonId}' is not recognized.`);
            }
        }
        return compositingReasons;
    }
}
// The compositing reason IDs are defined in third_party/blink/renderer/platform/graphics/compositing_reasons.cc
// These strings are not translated because they are implementation details from chromium that are hard to translate.
const compositingReasonIdToReason = new Map([
    ['transform3D', 'Has a 3D transform.'],
    ['video', 'Is an accelerated video.'],
    [
        'canvas',
        'Is an accelerated canvas, or is a display list backed canvas that was promoted to a layer based on a performance heuristic.',
    ],
    ['plugin', 'Is an accelerated plugin.'],
    ['iFrame', 'Is an accelerated iFrame.'],
    ['backfaceVisibilityHidden', 'Has backface-visibility: hidden.'],
    ['activeTransformAnimation', 'Has an active accelerated transform animation or transition.'],
    ['activeOpacityAnimation', 'Has an active accelerated opacity animation or transition.'],
    ['activeFilterAnimation', 'Has an active accelerated filter animation or transition.'],
    ['activeBackdropFilterAnimation', 'Has an active accelerated backdrop filter animation or transition.'],
    ['immersiveArOverlay', 'Is DOM overlay for WebXR immersive-ar mode.'],
    ['scrollDependentPosition', 'Is fixed or sticky position.'],
    ['overflowScrolling', 'Is a scrollable overflow element.'],
    ['overflowScrollingParent', 'Scroll parent is not an ancestor.'],
    ['outOfFlowClipping', 'Has clipping ancestor.'],
    ['videoOverlay', 'Is overlay controls for video.'],
    ['willChangeTransform', 'Has a will-change: transform compositing hint.'],
    ['willChangeOpacity', 'Has a will-change: opacity compositing hint.'],
    ['willChangeOther', 'Has a will-change compositing hint other than transform and opacity.'],
    ['backdropFilter', 'Has a backdrop filter.'],
    ['rootScroller', 'Is the document.rootScroller.'],
    ['assumedOverlap', 'Might overlap other composited content.'],
    ['overlap', 'Overlaps other composited content.'],
    ['negativeZIndexChildren', 'Parent with composited negative z-index content.'],
    ['squashingDisallowed', 'Layer was separately composited because it could not be squashed.'],
    [
        'opacityWithCompositedDescendants',
        'Has opacity that needs to be applied by the compositor because of composited descendants.',
    ],
    [
        'maskWithCompositedDescendants',
        'Has a mask that needs to be known by the compositor because of composited descendants.',
    ],
    [
        'reflectionWithCompositedDescendants',
        'Has a reflection that needs to be known by the compositor because of composited descendants.',
    ],
    [
        'filterWithCompositedDescendants',
        'Has a filter effect that needs to be known by the compositor because of composited descendants.',
    ],
    [
        'blendingWithCompositedDescendants',
        'Has a blending effect that needs to be known by the compositor because of composited descendants.',
    ],
    [
        'clipsCompositingDescendants',
        'Has a clip that needs to be known by the compositor because of composited descendants.',
    ],
    [
        'perspectiveWith3DDescendants',
        'Has a perspective transform that needs to be known by the compositor because of 3D descendants.',
    ],
    [
        'preserve3DWith3DDescendants',
        'Has a preserves-3D property that needs to be known by the compositor because of 3D descendants.',
    ],
    ['isolateCompositedDescendants', 'Should isolate descendants to apply a blend effect.'],
    ['positionFixedWithCompositedDescendants', 'Is a position:fixed element with composited descendants.'],
    ['root', 'Is the root layer.'],
    ['layerForHorizontalScrollbar', 'Secondary layer, the horizontal scrollbar layer.'],
    ['layerForVerticalScrollbar', 'Secondary layer, the vertical scrollbar layer.'],
    ['layerForOverflowControlsHost', 'Secondary layer, the overflow controls host layer.'],
    ['layerForScrollCorner', 'Secondary layer, the scroll corner layer.'],
    ['layerForScrollingContents', 'Secondary layer, to house contents that can be scrolled.'],
    ['layerForScrollingContainer', 'Secondary layer, used to position the scrolling contents while scrolling.'],
    ['layerForSquashingContents', 'Secondary layer, home for a group of squashable content.'],
    [
        'layerForSquashingContainer',
        'Secondary layer, no-op layer to place the squashing layer correctly in the composited layer tree.',
    ],
    [
        'layerForForeground',
        'Secondary layer, to contain any normal flow and positive z-index contents on top of a negative z-index layer.',
    ],
    ['layerForMask', 'Secondary layer, to contain the mask contents.'],
    ['layerForDecoration', 'Layer painted on top of other layers as decoration.'],
    ['layerForOther', 'Layer for link highlight, frame overlay, etc.'],
]);
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["PaintProfilerRequested"] = "PaintProfilerRequested";
})(Events || (Events = {}));
export const slowScrollRectNames = new Map([
    [SDK.LayerTreeBase.Layer.ScrollRectType.NonFastScrollable, i18nLazyString(UIStrings.nonFastScrollable)],
    [SDK.LayerTreeBase.Layer.ScrollRectType.TouchEventHandler, i18nLazyString(UIStrings.touchEventHandler)],
    [SDK.LayerTreeBase.Layer.ScrollRectType.WheelEventHandler, i18nLazyString(UIStrings.wheelEventHandler)],
    [SDK.LayerTreeBase.Layer.ScrollRectType.RepaintsOnScroll, i18nLazyString(UIStrings.repaintsOnScroll)],
    [
        SDK.LayerTreeBase.Layer.ScrollRectType.MainThreadScrollingReason,
        i18nLazyString(UIStrings.mainThreadScrollingReason),
    ],
]);
//# sourceMappingURL=LayerDetailsView.js.map