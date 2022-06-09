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
package com.tencent.mtt.hippy.adapter.font;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings({"unused"})
public class DefaultFontScaleAdapter implements HippyFontScaleAdapter {

  @Override
  public float getFontScale() {
    return 1;
  }

  @Override
  public CharSequence getEmoticonText(CharSequence text, int fontSize) {
    return text;
  }

  @Override
  @Nullable
  public String getCustomFontFilePath(String fontFamilyName, int style) {
    LogUtils.d("DefaultFontScaleAdapter",
        "getCustomFontFilePath fontFamilyName=" + fontFamilyName + ", style=" + style);
    return null;
  }

  @Override
  @Nullable
  public String getCustomDefaultFontFamily() {
    return null;
  }
}
