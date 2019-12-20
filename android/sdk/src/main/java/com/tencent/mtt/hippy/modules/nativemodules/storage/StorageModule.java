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
package com.tencent.mtt.hippy.modules.nativemodules.storage;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.storage.HippyStorageAdapter;
import com.tencent.mtt.hippy.adapter.storage.HippyStorageKeyValue;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

import java.util.ArrayList;
import java.util.List;

/**
 * FileName: StorageModule
 * Description：
 * History：
 */
@HippyNativeModule(name = "StorageModule")
public class StorageModule extends HippyNativeModuleBase
{

	private HippyStorageAdapter	mStorageAdapter;

	public StorageModule(HippyEngineContext context)
	{
		super(context);
		mStorageAdapter = context.getGlobalConfigs().getStorageAdapter();
	}

	@HippyMethod(name = "multiGet")
	public void multiGet(HippyArray keys, final Promise promise)
	{
		if (keys == null || keys.size() <= 0)
		{
			promise.reject("Invalid Key");
			return;
		}
		if (mStorageAdapter == null)
		{
			promise.reject("Database Null");
			return;
		}
		mStorageAdapter.multiGet(keys, new HippyStorageAdapter.Callback<List<HippyStorageKeyValue>>()
		{
			@Override
			public void onSuccess(List<HippyStorageKeyValue> datas)
			{
				if (datas == null || datas.size() <= 0)
				{
					promise.resolve(null);
					return;
				}
				HippyArray data = new HippyArray();
				HippyArray item;
				for (HippyStorageKeyValue value : datas)
				{
					item = new HippyArray();
					item.pushString(value.key);
					item.pushString(value.value);
					data.pushArray(item);
				}
				promise.resolve(data);
			}

			@Override
			public void onError(String mseeage)
			{
				promise.reject(mseeage);
			}
		});
	}

	@HippyMethod(name = "multiSet")
	public void multiSet(HippyArray keyValues, final Promise promise)
	{
		if (keyValues == null || keyValues.size() <= 0)
		{
			promise.reject("Invalid Value");
			return;
		}

		if (mStorageAdapter == null)
		{
			promise.reject("Database Null");
			return;
		}

		try
		{
			ArrayList<HippyStorageKeyValue> datas = new ArrayList<>();
			HippyStorageKeyValue keyValue;
			HippyArray array;
			String key;
			String value;
			for (int idx = 0; idx < keyValues.size(); idx++)
			{
				array = keyValues.getArray(idx);
				if(array == null)
				{
					promise.reject("Invalid Value");
					return;
				}
				if (array.size() != 2)
				{
					promise.reject("Invalid Value");
					return;
				}
				key = array.getString(0);
				if (key == null)
				{
					promise.reject("Invalid key");
					return;
				}
				value = array.getString(1);
				if (value == null)
				{
					promise.reject("Invalid Value");
					return;
				}

				keyValue = new HippyStorageKeyValue();
				keyValue.key = key;
				keyValue.value = value;
				datas.add(keyValue);
			}

			mStorageAdapter.multiSet(datas, new HippyStorageAdapter.Callback<Void>()
			{
				@Override
				public void onSuccess(Void data)
				{
					promise.resolve("success");
				}

				@Override
				public void onError(String mseeage)
				{
					promise.reject(mseeage);
				}
			});
		}
		catch (Throwable e)
		{
			promise.reject(e.getMessage());
		}

	}

	@HippyMethod(name = "multiRemove")
	public void multiRemove(HippyArray keys, final Promise promise)
	{
		if (keys == null || keys.size() == 0)
		{
			promise.reject("Invalid key");
			return;
		}

		if (mStorageAdapter == null)
		{
			promise.reject("Database Null");
			return;
		}

		mStorageAdapter.multiRemove(keys, new HippyStorageAdapter.Callback<Void>()
		{
			@Override
			public void onSuccess(Void data)
			{
				promise.resolve("success");
			}

			@Override
			public void onError(String mseeage)
			{
				promise.reject(mseeage);
			}
		});
	}

	@HippyMethod(name = "getAllKeys")
	public void getAllKeys(final Promise promise)
	{
		if (mStorageAdapter == null)
		{
			promise.reject("Database Null");
			return;
		}
		mStorageAdapter.getAllKeys(new HippyStorageAdapter.Callback<HippyArray>()
		{
			@Override
			public void onSuccess(HippyArray data)
			{
				promise.resolve(data);
			}

			@Override
			public void onError(String mseeage)
			{
				promise.reject(mseeage);
			}
		});
	}

}
