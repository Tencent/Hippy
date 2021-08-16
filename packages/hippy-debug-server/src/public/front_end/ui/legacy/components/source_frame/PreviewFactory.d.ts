import type * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as UI from '../../legacy.js';
export declare class PreviewFactory {
    static createPreview(provider: TextUtils.ContentProvider.ContentProvider, mimeType: string): Promise<UI.Widget.Widget | null>;
}
