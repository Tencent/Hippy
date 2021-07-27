import { TimelineCategory, TimelineRecordStyle } from './TimelineUIUtils.js';
export declare class UIDevtoolsUtils {
    static isUiDevTools(): boolean;
    static categorizeEvents(): {
        [x: string]: TimelineRecordStyle;
    };
    static categories(): {
        [x: string]: TimelineCategory;
    };
    static getMainCategoriesList(): string[];
}
export declare enum RecordType {
    ViewPaint = "View::Paint",
    ViewOnPaint = "View::OnPaint",
    ViewPaintChildren = "View::PaintChildren",
    ViewOnPaintBackground = "View::OnPaintBackground",
    ViewOnPaintBorder = "View::OnPaintBorder",
    ViewLayout = "View::Layout",
    ViewLayoutBoundsChanged = "View::Layout(bounds_changed)",
    LayerPaintContentsToDisplayList = "Layer::PaintContentsToDisplayList",
    DirectRendererDrawFrame = "DirectRenderer::DrawFrame",
    RasterTask = "RasterTask",
    RasterizerTaskImplRunOnWorkerThread = "RasterizerTaskImpl::RunOnWorkerThread",
    BeginFrame = "BeginFrame",
    DrawFrame = "DrawFrame",
    NeedsBeginFrameChanged = "NeedsBeginFrameChanged",
    ThreadControllerImplRunTask = "ThreadControllerImpl::RunTask"
}
