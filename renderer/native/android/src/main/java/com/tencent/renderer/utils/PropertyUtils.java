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

package com.tencent.renderer.utils;

import static com.tencent.renderer.NativeRenderException.ExceptionCode.UPDATE_VIEW_PROPS_ERR;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.renderer.NativeRenderException;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PropertyUtils {

    public static class PropertyMethodHolder {

        public Method method;
        public String defaultType;
        public String defaultString;
        public double defaultNumber;
        public boolean defaultBoolean;
        public Class<?> hostClass;
        public Type[] paramTypes;
    }

    @NonNull
    public static NativeRenderException makePropertyConvertException(@Nullable Exception exception,
            @NonNull String key, @NonNull Method method) {
        String message = "";
        if (exception != null) {
            message += exception.getMessage();
        }
        message += " key=" + key
                + ", methodName=" + method.getName()
                + ", methodClassName=" + method.getDeclaringClass().getName();
        return new NativeRenderException(UPDATE_VIEW_PROPS_ERR, message);
    }

    /**
     * Convert object value to supported types according to class type
     *
     * @param paramCls {@link Type}
     * @param value object value of property
     * @throws IllegalArgumentException if the passed object is none of the support types
     */
    @SuppressWarnings({"deprecation", "unchecked"})
    @NonNull
    public static Object convertProperty(Type paramCls, Object value)
            throws IllegalArgumentException {
        if (paramCls == String.class) {
            return String.valueOf(value);
        }
        Object result = convertNumber(paramCls, value);
        if (result != null) {
            return result;
        }
        if (paramCls == boolean.class || paramCls == Boolean.class || paramCls == HashMap.class
                || paramCls == ArrayList.class || paramCls == Map.class || paramCls == List.class) {
            return value;
        }
        // Although HippyMap and HippyArray has been deprecated, we need to be compatible with
        // the old version, this is not very good, but there is no better way.
        if (paramCls == HippyMap.class && value instanceof HashMap) {
            return new HippyMap((Map<String, Object>) value);
        }
        if (paramCls == HippyArray.class && value instanceof ArrayList) {
            return new HippyArray((List<Object>) value);
        }
        throw new IllegalArgumentException("Unknown property class type!");
    }

    /**
     * Convert object value to number according to class type
     *
     * @param paramCls {@link Type}
     * @param value object value of property
     * @throws IllegalArgumentException if the passed object is none of the number types
     */
    @Nullable
    public static Object convertNumber(Type paramCls, Object value)
            throws IllegalArgumentException {
        if (paramCls == int.class || paramCls == Integer.class) {
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            if (value instanceof String) {
                return Integer.valueOf((String) value);
            }
            throw new IllegalArgumentException("Covert Integer number failed!");
        }
        if (paramCls == long.class || paramCls == Long.class) {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            if (value instanceof String) {
                return Long.valueOf((String) value);
            }
            throw new IllegalArgumentException("Covert Long number failed!");
        }
        if (paramCls == double.class || paramCls == Double.class) {
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            if (value instanceof String) {
                return Double.valueOf((String) value);
            }
            throw new IllegalArgumentException("Covert Double number failed!");
        }
        if (paramCls == float.class || paramCls == Float.class) {
            if (value instanceof Number) {
                return ((Number) value).floatValue();
            }
            if (value instanceof String) {
                return Float.valueOf((String) value);
            }
            throw new IllegalArgumentException("Covert Float number failed!");
        }
        return null;
    }
}
