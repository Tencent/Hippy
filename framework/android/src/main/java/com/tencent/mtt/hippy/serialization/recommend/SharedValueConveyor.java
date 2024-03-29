/*
 * Tencent is pleased to support the open source community by making Hippy available.
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
 *
 */
package com.tencent.mtt.hippy.serialization.recommend;

import java.util.ArrayList;
import java.util.List;

/**
 * The {@link SharedValueConveyor} keep shared values while serializing
 *
 * This class is not directly constructible and is always passed to
 * {@link Serializer} and {@link Deserializer}.
 *
 * The user must keep the SharedValueConveyor instance until the associated
 * serialized data will no longer be deserialized.
 */
public final class SharedValueConveyor {
    /**
     * All shared values MUST be implement ${@link SharedValue} interface.
     */
    public interface SharedValue {
    }

    private final List<SharedValue> sharedObjects = new ArrayList<>();

    SharedValueConveyor() {
    }

    SharedValue getPersisted(int index) {
        return sharedObjects.get(index);
    }

    int persist(SharedValue value) {
        sharedObjects.add(value);
        return sharedObjects.size() - 1;
    }
}
