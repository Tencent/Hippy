/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tencent.renderer.component.text;

import android.graphics.Paint;
import android.graphics.Typeface;
import android.text.TextUtils;

import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.HashMap;
import java.util.Map;

public class TypeFaceUtil {

    private static final String TAG = "TypeFaceUtil";
    private static final String[] EXTENSIONS = {"", "_bold", "_italic", "_bold_italic"};
    private static final String[] FONT_EXTENSIONS = {".ttf", ".otf"};
    private static final String FONTS_PATH = "fonts/";
    private static final Map<String, Typeface> sFontCache = new HashMap<>();

    public static Typeface getTypeface(String fontFamilyName, int style,
            @Nullable FontAdapter fontAdapter) {
        Typeface typeface =
                (fontAdapter != null) ? fontAdapter.getCustomTypeface(fontFamilyName, style) : null;
        if (typeface == null) {
            String cache = fontFamilyName + style;
            typeface = sFontCache.get(cache);
            if (typeface == null) {
                typeface = createTypeface(fontFamilyName, style, fontAdapter);
            }
            if (typeface != null) {
                sFontCache.put(cache, typeface);
            }
        }
        return typeface;
    }

    private static Typeface createTypeface(String fontFamilyName, int style,
            @Nullable FontAdapter fontAdapter) {
        Typeface typeface = null;
        final String extension = EXTENSIONS[style];
        for (String fileExtension : FONT_EXTENSIONS) {
            String fileName = FONTS_PATH + fontFamilyName + extension + fileExtension;
            try {
                typeface = Typeface.createFromAsset(ContextHolder.getAppContext().getAssets(),
                        fileName);
                if (typeface != null) {
                    return typeface;
                }
            } catch (Exception e) {
                // If create type face from asset failed, other builder can also be used
                LogUtils.w(TAG, e.getMessage());
            }
            if (style == Typeface.NORMAL) {
                continue;
            }
            // try to load font file without extension
            fileName = FONTS_PATH + fontFamilyName + fileExtension;
            try {
                typeface = Typeface.create(
                        Typeface.createFromAsset(ContextHolder.getAppContext().getAssets(),
                                fileName), style);
                if (typeface != null) {
                    return typeface;
                }
            } catch (Exception e) {
                LogUtils.w(TAG, e.getMessage());
            }
        }
        if (typeface == null && fontAdapter != null) {
            final String filePath = fontAdapter.getCustomFontFilePath(fontFamilyName, style);
            if (!TextUtils.isEmpty(filePath)) {
                try {
                    typeface = Typeface.createFromFile(filePath);
                } catch (Exception e) {
                    // If create type face from asset file, other builder can also be used
                    LogUtils.w(TAG, e.getMessage());
                }
            }
        }
        if (typeface == null) {
            typeface = Typeface.create(fontFamilyName, style);
        }
        return typeface;
    }

    public static void apply(Paint paint, int style, int weight, String family,
            @Nullable FontAdapter fontAdapter) {
        int oldStyle;
        Typeface typeface = paint.getTypeface();
        if (typeface == null) {
            oldStyle = 0;
        } else {
            oldStyle = typeface.getStyle();
        }
        int want = 0;
        if ((weight == Typeface.BOLD) || ((oldStyle & Typeface.BOLD) != 0)) {
            want |= Typeface.BOLD;
        }
        if ((style == Typeface.ITALIC) || ((oldStyle & Typeface.ITALIC) != 0)) {
            want |= Typeface.ITALIC;
        }
        if (family != null) {
            typeface = TypeFaceUtil.getTypeface(family, want, fontAdapter);
        } else if (typeface != null) {
            typeface = Typeface.create(typeface, want);
        }
        if (typeface != null) {
            paint.setTypeface(typeface);
        } else {
            paint.setTypeface(Typeface.defaultFromStyle(want));
        }
    }
}
