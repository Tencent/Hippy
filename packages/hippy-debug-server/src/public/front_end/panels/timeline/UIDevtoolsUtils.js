/*
 * Copyright (C) 2019 Google Inc. All rights reserved.
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
import * as Root from '../../core/root/root.js';
import { TimelineCategory, TimelineRecordStyle } from './TimelineUIUtils.js';
const UIStrings = {
    /**
    *@description Text in Timeline UIUtils of the Performance panel
    */
    frameStart: 'Frame Start',
    /**
    *@description Text in Timeline UIUtils of the Performance panel
    */
    drawFrame: 'Draw Frame',
    /**
    *@description Text in Timeline UIUtils of the Performance panel
    */
    layout: 'Layout',
    /**
    *@description Text in UIDevtools Utils of the Performance panel
    */
    rasterizing: 'Rasterizing',
    /**
    *@description Text in UIDevtools Utils of the Performance panel
    */
    drawing: 'Drawing',
    /**
    *@description Text in Timeline UIUtils of the Performance panel
    */
    painting: 'Painting',
    /**
    *@description Text in Timeline UIUtils of the Performance panel
    */
    system: 'System',
    /**
    *@description Text in Timeline UIUtils of the Performance panel
    */
    idle: 'Idle',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/UIDevtoolsUtils.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _eventStylesMap = null;
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
// eslint-disable-next-line @typescript-eslint/naming-convention
let _categories = null;
export class UIDevtoolsUtils {
    static isUiDevTools() {
        return Root.Runtime.Runtime.queryParam('uiDevTools') === 'true';
    }
    static categorizeEvents() {
        if (_eventStylesMap) {
            return _eventStylesMap;
        }
        const type = RecordType;
        const categories = UIDevtoolsUtils.categories();
        const drawing = categories['drawing'];
        const rasterizing = categories['rasterizing'];
        const layout = categories['layout'];
        const painting = categories['painting'];
        const other = categories['other'];
        const eventStyles = {};
        // Paint Categories
        eventStyles[type.ViewPaint] = new TimelineRecordStyle('View::Paint', painting);
        eventStyles[type.ViewOnPaint] = new TimelineRecordStyle('View::OnPaint', painting);
        eventStyles[type.ViewPaintChildren] = new TimelineRecordStyle('View::PaintChildren', painting);
        eventStyles[type.ViewOnPaintBackground] = new TimelineRecordStyle('View::OnPaintBackground', painting);
        eventStyles[type.ViewOnPaintBorder] = new TimelineRecordStyle('View::OnPaintBorder', painting);
        eventStyles[type.LayerPaintContentsToDisplayList] =
            new TimelineRecordStyle('Layer::PaintContentsToDisplayList', painting);
        // Layout Categories
        eventStyles[type.ViewLayout] = new TimelineRecordStyle('View::Layout', layout);
        eventStyles[type.ViewLayoutBoundsChanged] = new TimelineRecordStyle('View::Layout(bounds_changed)', layout);
        // Raster Categories
        eventStyles[type.RasterTask] = new TimelineRecordStyle('RasterTask', rasterizing);
        eventStyles[type.RasterizerTaskImplRunOnWorkerThread] =
            new TimelineRecordStyle('RasterizerTaskImpl::RunOnWorkerThread', rasterizing);
        // Draw Categories
        eventStyles[type.DirectRendererDrawFrame] = new TimelineRecordStyle('DirectRenderer::DrawFrame', drawing);
        eventStyles[type.BeginFrame] = new TimelineRecordStyle(i18nString(UIStrings.frameStart), drawing, true);
        eventStyles[type.DrawFrame] = new TimelineRecordStyle(i18nString(UIStrings.drawFrame), drawing, true);
        eventStyles[type.NeedsBeginFrameChanged] = new TimelineRecordStyle('NeedsBeginFrameChanged', drawing, true);
        // Other Categories
        eventStyles[type.ThreadControllerImplRunTask] = new TimelineRecordStyle('ThreadControllerImpl::RunTask', other);
        _eventStylesMap = eventStyles;
        return eventStyles;
    }
    static categories() {
        if (_categories) {
            return _categories;
        }
        _categories = {
            layout: new TimelineCategory('layout', i18nString(UIStrings.layout), true, 'hsl(214, 67%, 74%)', 'hsl(214, 67%, 66%)'),
            rasterizing: new TimelineCategory('rasterizing', i18nString(UIStrings.rasterizing), true, 'hsl(43, 83%, 72%)', 'hsl(43, 83%, 64%) '),
            drawing: new TimelineCategory('drawing', i18nString(UIStrings.drawing), true, 'hsl(256, 67%, 76%)', 'hsl(256, 67%, 70%)'),
            painting: new TimelineCategory('painting', i18nString(UIStrings.painting), true, 'hsl(109, 33%, 64%)', 'hsl(109, 33%, 55%)'),
            other: new TimelineCategory('other', i18nString(UIStrings.system), false, 'hsl(0, 0%, 87%)', 'hsl(0, 0%, 79%)'),
            idle: new TimelineCategory('idle', i18nString(UIStrings.idle), false, 'hsl(0, 0%, 98%)', 'hsl(0, 0%, 98%)'),
        };
        return _categories;
    }
    static getMainCategoriesList() {
        return ['idle', 'drawing', 'painting', 'rasterizing', 'layout', 'other'];
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var RecordType;
(function (RecordType) {
    RecordType["ViewPaint"] = "View::Paint";
    RecordType["ViewOnPaint"] = "View::OnPaint";
    RecordType["ViewPaintChildren"] = "View::PaintChildren";
    RecordType["ViewOnPaintBackground"] = "View::OnPaintBackground";
    RecordType["ViewOnPaintBorder"] = "View::OnPaintBorder";
    RecordType["ViewLayout"] = "View::Layout";
    RecordType["ViewLayoutBoundsChanged"] = "View::Layout(bounds_changed)";
    RecordType["LayerPaintContentsToDisplayList"] = "Layer::PaintContentsToDisplayList";
    RecordType["DirectRendererDrawFrame"] = "DirectRenderer::DrawFrame";
    RecordType["RasterTask"] = "RasterTask";
    RecordType["RasterizerTaskImplRunOnWorkerThread"] = "RasterizerTaskImpl::RunOnWorkerThread";
    RecordType["BeginFrame"] = "BeginFrame";
    RecordType["DrawFrame"] = "DrawFrame";
    RecordType["NeedsBeginFrameChanged"] = "NeedsBeginFrameChanged";
    RecordType["ThreadControllerImplRunTask"] = "ThreadControllerImpl::RunTask";
})(RecordType || (RecordType = {}));
//# sourceMappingURL=UIDevtoolsUtils.js.map