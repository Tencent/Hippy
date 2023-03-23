/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.renderer.tdf.embed;

import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.serialization.Deserializer;

import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;

public class TDFEmbeddedViewUtil {

    private static final String PROPS_KEY = "props"; // 和 C++ 侧约定好通过这个 key 传递组件属性

    public static Map<String, Object> parsePropsStringToMap(Map<String, String> propsMap) {
        String propsStr = propsMap.get(PROPS_KEY);
        try {
            byte[] decodedBytes = android.util.Base64.decode(propsStr, android.util.Base64.DEFAULT);
            final BinaryReader binaryReader = new SafeHeapReader();
            binaryReader.reset(ByteBuffer.wrap(decodedBytes));
            Deserializer deserializer = new Deserializer(null, new InternalizedStringTable());
            deserializer.setReader(binaryReader);
            deserializer.reset();
            deserializer.readHeader();
            Object paramsObj = deserializer.readValue();
            deserializer.getStringTable().release();
            return (paramsObj instanceof HashMap) ? (HashMap<String, Object>) paramsObj : null;
        } catch (Exception e) {
            LogUtils.e("TDFEmbeddedViewUtil", "parsePropsStringToMap: " + e.getMessage());
            return new HashMap<String, Object>();
        }
    }
}
