import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
export declare class FontView extends UI.View.SimpleView {
    _url: string;
    _mimeType: string;
    _contentProvider: TextUtils.ContentProvider.ContentProvider;
    _mimeTypeLabel: UI.Toolbar.ToolbarText;
    fontPreviewElement: HTMLElement | null;
    _dummyElement: HTMLElement | null;
    fontStyleElement: HTMLStyleElement | null;
    _inResize: boolean | null;
    constructor(mimeType: string, contentProvider: TextUtils.ContentProvider.ContentProvider);
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    _onFontContentLoaded(uniqueFontName: string, deferredContent: TextUtils.ContentProvider.DeferredContent): void;
    _createContentIfNeeded(): void;
    wasShown(): void;
    onResize(): void;
    _measureElement(): {
        width: number;
        height: number;
    };
    updateFontPreviewSize(): void;
}
