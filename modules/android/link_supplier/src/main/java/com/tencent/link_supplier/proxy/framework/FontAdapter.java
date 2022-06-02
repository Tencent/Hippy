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

package com.tencent.link_supplier.proxy.framework;

/**
 * Provide and implement by host
 */
public interface FontAdapter {

    /**
     * If enable font scale, should re setting font size by scale factor.
     *
     * @return The font scale factor.
     */
    float getFontScale();

    /**
     * Replace the word of emoticon in text.
     *
     * @param text the property of text node
     * @param fontSize the property of text node
     * @return a {@link CharSequence} that represents new text
     */
    CharSequence getEmoticonText(CharSequence text, int fontSize);

    /**
     * Get custom font file path when create type face.
     *
     * @param fontFamily the property of text node
     * @param style the typeface's intrinsic style attributes
     * @return a {@link String} that represents custom font file path
     */
    String getCustomFontFilePath(String fontFamily, int style);
}
