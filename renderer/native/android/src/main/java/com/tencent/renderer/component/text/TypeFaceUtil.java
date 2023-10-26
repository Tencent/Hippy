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
import android.os.Build;
import android.text.TextUtils;

import android.util.SparseArray;
import androidx.annotation.ChecksSdkIntAtLeast;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.HashMap;
import java.util.Map;

public class TypeFaceUtil {

    public static final int WEIGHT_NORMAL = 400;
    public static final int WEIGHT_BOLE = 700;
    private static final String TAG = "TypeFaceUtil";
    private static final String[] EXTENSIONS = {"", "_bold", "_italic", "_bold_italic"};
    private static final String[] FONT_EXTENSIONS = {".ttf", ".otf"};
    private static final String FONTS_PATH = "fonts/";
    private static final Map<String, SparseArray<Typeface>> sFontCache = new HashMap<>();
    @ChecksSdkIntAtLeast(api = Build.VERSION_CODES.P)
    private static final boolean SUPPORT_FONT_WEIGHT = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P;

    /**
     * @deprecated use {@link #getTypeface(String, int, boolean, FontAdapter)} instead
     */
    @Deprecated
    public static Typeface getTypeface(String fontFamilyName, int style,
            @Nullable FontAdapter fontAdapter) {
        boolean italic = (style & Typeface.ITALIC) != 0;
        int weightNumber = (style & Typeface.BOLD) != 0 ? WEIGHT_BOLE : WEIGHT_NORMAL;
        return getTypeface(fontFamilyName, weightNumber, italic, fontAdapter);
    }

    public static Typeface getTypeface(String fontFamilyName, int weight, boolean italic,
            @Nullable FontAdapter fontAdapter) {
        final int style = toStyle(weight, italic);
        Typeface typeface = (fontAdapter != null) ? fontAdapter.getCustomTypeface(fontFamilyName, style) : null;
        if (typeface == null) {
            final int key = SUPPORT_FONT_WEIGHT ? ((weight << 1) | (italic ? 1 : 0)) : style;
            SparseArray<Typeface> cache = sFontCache.get(fontFamilyName);
            if (cache == null) {
                cache = new SparseArray<>(4);
                sFontCache.put(fontFamilyName, cache);
            } else {
                typeface = cache.get(key);
            }
            if (typeface == null) {
                typeface = createTypeface(fontFamilyName, weight, italic, fontAdapter);
                if (typeface != null) {
                    cache.put(key, typeface);
                }
            }
        }
        return typeface;
    }

    private static Typeface createTypeface(String fontFamilyName, int weight, boolean italic,
            @Nullable FontAdapter fontAdapter) {
        final int style = toStyle(weight, italic);
        final String extension = EXTENSIONS[style];
        final String[] familyNameList;
        if (fontFamilyName.indexOf(',') == -1) {
            familyNameList = new String[]{fontFamilyName};
        } else {
            familyNameList = fontFamilyName.split("\\s*,\\s*");
        }
        for (String splitName : familyNameList) {
            if (TextUtils.isEmpty(splitName)) {
                continue;
            }
            for (String fileExtension : FONT_EXTENSIONS) {
                String fileName = FONTS_PATH + splitName + extension + fileExtension;
                try {
                    Typeface typeface = Typeface.createFromAsset(ContextHolder.getAppContext().getAssets(), fileName);
                    if (typeface != null && !typeface.equals(Typeface.DEFAULT)) {
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
                fileName = FONTS_PATH + splitName + fileExtension;
                try {
                    Typeface typeface = Typeface.createFromAsset(ContextHolder.getAppContext().getAssets(), fileName);
                    if (typeface != null && !typeface.equals(Typeface.DEFAULT)) {
                        if (SUPPORT_FONT_WEIGHT) {
                            return Typeface.create(typeface, weight, italic);
                        }
                        // "bold" has no effect on api level < P, prefer to use `Paint.setFakeBoldText(boolean)`
                        return italic ? Typeface.create(typeface, Typeface.ITALIC) : typeface;
                    }
                } catch (Exception e) {
                    LogUtils.w(TAG, e.getMessage());
                }
            }
            if (fontAdapter != null) {
                final String filePath = fontAdapter.getCustomFontFilePath(splitName, style);
                if (!TextUtils.isEmpty(filePath)) {
                    try {
                        Typeface typeface = Typeface.createFromFile(filePath);
                        if (typeface != null && !typeface.equals(Typeface.DEFAULT)) {
                            return typeface;
                        }
                    } catch (Exception e) {
                        // If create type face from asset file, other builder can also be used
                        LogUtils.w(TAG, e.getMessage());
                    }
                }
            }
        }

        final Typeface systemDefault = Typeface.create(Typeface.DEFAULT, style);
        for (String splitName : familyNameList) {
            Typeface typeface = Typeface.create(splitName, style);
            if (typeface != null && !typeface.equals(systemDefault)) {
                return SUPPORT_FONT_WEIGHT ? Typeface.create(typeface, weight, italic) : typeface;
            }
        }
        return SUPPORT_FONT_WEIGHT ? Typeface.create(systemDefault, weight, italic) : systemDefault;
    }

    private static int toStyle(int weight, boolean italic) {
        return weight < WEIGHT_BOLE ?
                (italic ? Typeface.ITALIC : Typeface.NORMAL) :
                (italic ? Typeface.BOLD_ITALIC : Typeface.BOLD);
    }

    /**
     * @deprecated use {@link #apply(Paint, boolean, int, String, FontAdapter)} instead
     */
    @Deprecated
    public static void apply(Paint paint, int style, int weight, String family,
            @Nullable FontAdapter fontAdapter) {
        boolean italic = style == Typeface.ITALIC;
        int weightNumber = weight == Typeface.BOLD ? WEIGHT_BOLE : WEIGHT_NORMAL;
        apply(paint, italic, weightNumber, family, fontAdapter);
    }

    public static void apply(Paint paint, boolean italic, int weight, String familyName,
            @Nullable FontAdapter fontAdapter) {
        Typeface typeface;
        if (TextUtils.isEmpty(familyName)) {
            final Typeface base = paint.getTypeface();
            typeface = SUPPORT_FONT_WEIGHT
                    ? Typeface.create(base, weight, italic)
                    : Typeface.create(base, toStyle(weight, italic));
        } else {
            typeface = getTypeface(familyName, weight, italic, fontAdapter);
        }
        paint.setFakeBoldText(weight >= WEIGHT_BOLE && typeface != null && !typeface.isBold());
        paint.setTypeface(typeface);
    }
}
