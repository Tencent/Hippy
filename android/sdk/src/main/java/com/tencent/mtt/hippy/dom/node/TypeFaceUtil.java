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
package com.tencent.mtt.hippy.dom.node;

import android.content.Context;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.text.TextUtils;
import android.util.Base64;

import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({"unused"})
public class TypeFaceUtil {

  final static private String TAG = "TypeFaceUtil";
  private static final String[] EXTENSIONS = {"", "_bold", "_italic", "_bold_italic"};
  private static final String[] FONT_EXTENSIONS = {".ttf", ".otf"};
  private static final String FONTS_PATH = "fonts/";

  private static final Map<String, Typeface> mFontCache = new HashMap<>();

  public static Typeface getTypeface(String fontFamilyName, int style,
      HippyFontScaleAdapter fontAdapter) {
    String cache = fontFamilyName + style;
    Typeface typeface = mFontCache.get(cache);
    if (typeface == null) {
      typeface = createTypeface(fontFamilyName, style, fontAdapter);
    }

    if (typeface != null) {
      mFontCache.put(cache, typeface);
    }

    return typeface;
  }

  private static Typeface createTypeface(String fontFamilyName, int style,
      HippyFontScaleAdapter fontAdapter) {
    Typeface typeface = null;
    String extension = EXTENSIONS[style];
    for (String fileExtension : FONT_EXTENSIONS) {
      String fileName = FONTS_PATH + fontFamilyName + extension + fileExtension;
      try {
        typeface = Typeface.createFromAsset(ContextHolder.getAppContext().getAssets(), fileName);
      } catch (Exception e) {
        LogUtils.e("TypeFaceUtil", "createTypeface: " + e.getMessage());
      }
    }

    if (typeface == null && fontAdapter != null) {
      String filePath = fontAdapter.getCustomFontFilePath(fontFamilyName, style);
      if (!TextUtils.isEmpty(filePath)) {
        try {
          typeface = Typeface.createFromFile(filePath);
        } catch (Exception e) {
          LogUtils.e("TypeFaceUtil", "createTypeface: " + e.getMessage());
        }
      }
    }

    if (typeface == null) {
      typeface = Typeface.create(fontFamilyName, style);
    }

    return typeface;
  }

  public static boolean checkFontExist(String fontFamilyName, int style) {
    String cache = fontFamilyName + style;
    Typeface typeface = mFontCache.get(cache);
    return typeface != null;
  }

  public static Typeface addTypeface(String fontFamilyName, String fontPath, int style) {
    String cache = fontFamilyName + style;
    Typeface typeface = mFontCache.get(cache);
    if (typeface != null) {
      return typeface;
    }
    try {
      typeface = Typeface.createFromFile(fontPath);
    } catch (RuntimeException e) {
      e.printStackTrace();
    }
    if (typeface != null) {
      mFontCache.put(cache, typeface);
    }
    return typeface;
  }

  public static Typeface addTypefaceWithBase64(String fontFamilyName, String fontBase64Data,
      int style) {
    String cache = fontFamilyName + style;
    Typeface typeface = mFontCache.get(cache);
    if (typeface != null) {
      return typeface;
    }
    byte[] fontData;
    if (TextUtils.isEmpty(fontBase64Data)) {
      return null;
    } else {
      String fontPath = getFontPath(ContextHolder.getAppContext(), cache);
      fontData = getRealTTFBase64(fontBase64Data);
      deleteFontFile(fontPath);
      saveFontFile(fontPath, fontData);
      typeface = TypeFaceUtil.addTypeface(fontFamilyName, fontPath, Typeface.NORMAL);
      deleteFontFile(fontPath);
    }
    return typeface;
  }

  public static void apply(Paint paint, int style, int weight, String family,
      HippyFontScaleAdapter fontAdapter) {
    int oldStyle;
    Typeface typeface = paint.getTypeface();
    if (typeface == null) {
      oldStyle = 0;
    } else {
      oldStyle = typeface.getStyle();
    }

    int want = 0;
    if ((weight == Typeface.BOLD) || ((oldStyle & Typeface.BOLD) != 0
        && weight == TextNode.UNSET)) {
      want |= Typeface.BOLD;
    }

    if ((style == Typeface.ITALIC) || ((oldStyle & Typeface.ITALIC) != 0
        && style == TextNode.UNSET)) {
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

  private static void deleteFontFile(String path) {
    if (TextUtils.isEmpty(path)) {
      return;
    }
    File file = new File(path);
    boolean exists = file.exists();
    if (exists) {
      //noinspection ResultOfMethodCallIgnored
      file.delete();
    }
  }

  private static void saveFontFile(String path, byte[] data) {
    File file = new File(path);
    BufferedOutputStream outStream = null;
    try {
      outStream = new BufferedOutputStream(new FileOutputStream(file));
      outStream.write(data);
      outStream.flush();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (null != outStream) {
        try {
          outStream.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
  }

  private static byte[] getRealTTFBase64(String base64Str) {
    LogUtils.d(TAG, "原始字库数据 base64Str：" + base64Str);
    if (TextUtils.isEmpty(base64Str)) {
      return null;
    }
    String tag = "base64,";
    int location = base64Str.indexOf(tag);
    String realBase64Str = base64Str;
    if (location > 0) {
      realBase64Str = base64Str.substring(location + tag.length());
    }
    return Base64.decode(realBase64Str, Base64.DEFAULT);
  }

  private static String getFontPath(Context context, String fileName) {
    return context.getCacheDir().getAbsolutePath() + File.separator + fileName + ".ttf";
  }
}
