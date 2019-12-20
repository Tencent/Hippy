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
package com.tencent.mtt.hippy.adapter.storage;

import com.tencent.mtt.hippy.common.HippyArray;

import java.util.List;

/**
 * FileName: HippyStorageAdapter
 * Description：
 * History：
 */
public interface HippyStorageAdapter
{

    /**
     * Query value of the database
     * @param keys
     * @param callback
     */
    public void multiGet(HippyArray keys, Callback<List<HippyStorageKeyValue>> callback);

    /**
     * Insert value into the database
     * @param keyValues
     * @param callback
     */
    public void multiSet(List<HippyStorageKeyValue> keyValues, Callback<Void> callback);

    /**
     * Remove value from the database
     * @param keys
     * @param callback
     */
    public void multiRemove(HippyArray keys,Callback<Void> callback);

    public void getAllKeys(Callback<HippyArray> callback);

    void destroyIfNeed();

    interface Callback<T extends Object>
	{
		void onSuccess(T data);

		void onError(String mseeage);
	}
}
