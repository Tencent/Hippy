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
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.text.TextUtils;

import android.util.Log;
import android.util.SparseArray;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class TypeFaceUtil {

    public static final int WEIGHT_NORMAL = 400;
    public static final int WEIGHT_BOLE = 700;
    public static final String TEXT_FONT_STYLE_ITALIC = "italic";
    public static final String TEXT_FONT_STYLE_BOLD = "bold";
    public static final String TEXT_FONT_STYLE_NORMAL = "normal";
    private static final String TAG = "TypeFaceUtil";
    private static final String[] EXTENSIONS = {"", "_bold", "_italic", "_bold_italic"};
    private static final String[] FONT_EXTENSIONS = {".ttf", ".otf", ""};
    private static final String FONTS_PATH = "fonts/";
    private static final Map<String, SparseArray<Typeface>> sFontCache = new HashMap<>();

    /**
     * @deprecated use {@link #getTypeface(String, String, boolean, FontAdapter)} instead
     */
    @Deprecated
    public static Typeface getTypeface(String fontFamilyName, int style,
            @Nullable FontAdapter fontAdapter) {
        boolean italic = (style & Typeface.ITALIC) != 0;
        String weight = (style & Typeface.BOLD) != 0 ? TEXT_FONT_STYLE_BOLD : TEXT_FONT_STYLE_NORMAL;
        return getTypeface(fontFamilyName, weight, italic, fontAdapter);
    }

    public static Typeface getTypeface(String fontFamilyName, String weight, boolean italic,
            @Nullable FontAdapter fontAdapter) {
        int weightNumber = getWeightNumber(weight);
        final int style = toStyle(weight, weightNumber, italic);
        Typeface typeface = (fontAdapter != null) ? fontAdapter.getCustomTypeface(fontFamilyName, style) : null;
        if (typeface == null) {
            final int key = (weightNumber > 0) ? ((weightNumber << 1) | (italic ? 1 : 0)) : style;
            SparseArray<Typeface> cache = sFontCache.get(fontFamilyName);
            if (cache == null) {
                cache = new SparseArray<>(4);
                sFontCache.put(fontFamilyName, cache);
            } else {
                typeface = cache.get(key);
            }
            if (typeface == null) {
                typeface = createTypeface(fontFamilyName, weightNumber, style, italic, fontAdapter);
                if (typeface != null) {
                    cache.put(key, typeface);
                }
            }
        }
        return typeface;
    }

    public static void clearFontCache(String fontFamilyName) {
        sFontCache.remove(fontFamilyName);
    }

    private static Typeface createExactTypeFace(String fileName) {
        // create from assets
        Typeface typeface = null;
        try {
            typeface = Typeface.createFromAsset(ContextHolder.getAppContext().getAssets(), fileName);
        } catch (Exception e) {
            LogUtils.w(TAG, e.getMessage());
        }
        // create from cache dir
        if (typeface == null || typeface.equals(Typeface.DEFAULT)) {
            try {
                File cacheDir = ContextHolder.getAppContext().getCacheDir();
                typeface = Typeface.createFromFile(new File(cacheDir, fileName));
            } catch (Exception e) {
                LogUtils.w(TAG, e.getMessage());
            }
        }
        return typeface;
    }

    private static Typeface createTypeface(String fontFamilyName, int weightNumber, int style, boolean italic,
            @Nullable FontAdapter fontAdapter) {
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
                Typeface typeface = createExactTypeFace(fileName);
                if (typeface != null && !typeface.equals(Typeface.DEFAULT)) {
                    return typeface;
                }
            }
            // try to load font file without extension
            if (style != Typeface.NORMAL) {
                for (String fileExtension : FONT_EXTENSIONS) {
                    String fileName = FONTS_PATH + splitName + fileExtension;
                    Typeface typeface = createExactTypeFace(fileName);
                    if (typeface != null && !typeface.equals(Typeface.DEFAULT)) {
                        if (VERSION.SDK_INT >= VERSION_CODES.P && weightNumber > 0) {
                            return Typeface.create(typeface, weightNumber, italic);
                        }
                        // "bold" has no effect on api level < P, prefer to use `Paint.setFakeBoldText(boolean)`
                        return italic ? Typeface.create(typeface, Typeface.ITALIC) : typeface;
                    }
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
                if (VERSION.SDK_INT >= VERSION_CODES.P && weightNumber > 0) {
                    return Typeface.create(typeface, weightNumber, italic);
                }
                return typeface;
            }
        }
        return (VERSION.SDK_INT >= VERSION_CODES.P && weightNumber > 0) ?
                Typeface.create(systemDefault, weightNumber, italic) : systemDefault;
    }

    private static int getWeightNumber(String weight) {
        int weightNumber = 0;
        try {
            weightNumber = Math.min(Math.max(1, Integer.parseInt(weight)), 1000);
        } catch (NumberFormatException ignored) {
            // Weight supports setting non numeric strings
        }
        return weightNumber;
    }

    private static int toStyle(String weight, int weightNumber, boolean italic) {
        if (weight.equals(TEXT_FONT_STYLE_NORMAL)) {
            return italic ? Typeface.ITALIC : Typeface.NORMAL;
        } else if (weight.equals(TEXT_FONT_STYLE_BOLD)) {
            return italic ? Typeface.BOLD_ITALIC : Typeface.BOLD;
        } else {
            return weightNumber < WEIGHT_BOLE ?
                    (italic ? Typeface.ITALIC : Typeface.NORMAL) :
                    (italic ? Typeface.BOLD_ITALIC : Typeface.BOLD);
        }
    }

    public static void apply(Paint paint, boolean italic, String weight, String familyName,
            @Nullable FontAdapter fontAdapter) {
        Typeface typeface;
        int weightNumber = getWeightNumber(weight);
        if (TextUtils.isEmpty(familyName)) {
            final Typeface base = paint.getTypeface();
            if (VERSION.SDK_INT >= VERSION_CODES.P && weightNumber > 0) {
                typeface = Typeface.create(base, weightNumber, italic);
            } else {
                typeface = Typeface.create(base, toStyle(weight, weightNumber, italic));
            }
        } else {
            typeface = getTypeface(familyName, weight, italic, fontAdapter);
        }
        if (weightNumber >= WEIGHT_BOLE && typeface != null && !typeface.isBold()) {
            paint.setFakeBoldText(true);
        }
        paint.setTypeface(typeface);
    }
}
