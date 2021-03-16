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

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteStatement;
import android.text.TextUtils;
import com.tencent.mtt.hippy.common.HippyArray;

import java.util.*;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DefaultStorageAdapter implements HippyStorageAdapter
{

	static final int			     MAX_SQL_KEYS = 999;
	private final IHippySQLiteHelper mSQLiteHelper;
	private Executor			     mExecutor;
	private ExecutorService 	     mExecutorService;

	public DefaultStorageAdapter(Context context)
	{
		mSQLiteHelper = new SQLiteHelper(context);
	}

	public DefaultStorageAdapter(Context context, Executor executor)
	{
		mSQLiteHelper = new SQLiteHelper(context);
		mExecutor = executor;
	}

	public DefaultStorageAdapter(Executor executor, IHippySQLiteHelper sqLiteHelper)
	{
		mSQLiteHelper = sqLiteHelper;
		mExecutor = executor;
	}

	static String buildKeySelection(int selectionCount)
	{
		String[] list = new String[selectionCount];
		Arrays.fill(list, "?");
		return IHippySQLiteHelper.COLUMN_KEY + " IN (" + TextUtils.join(", ", list) + ")";
	}

	static String[] buildKeySelectionArgs(HippyArray keys, int start, int count)
	{
		String[] selectionArgs = new String[count];
		for (int keyIndex = 0; keyIndex < count; keyIndex++)
		{
			selectionArgs[keyIndex] = keys.getString(start + keyIndex);
		}
		return selectionArgs;
	}

	@Override
	public void multiGet(final HippyArray keys, final Callback<List<HippyStorageKeyValue>> callback)
	{
		execute(new Runnable()
		{
			@Override
			public void run()
			{
				try
				{
					SQLiteDatabase database = mSQLiteHelper.getDatabase();
					if (database == null)
					{
						callback.onError("Database Error");
						return;
					}

					String[] columns = { IHippySQLiteHelper.COLUMN_KEY, IHippySQLiteHelper.COLUMN_VALUE };
					HashSet<String> keysRemaining = new HashSet<>();
					HashMap<String, HippyStorageKeyValue> data = new HashMap<String, HippyStorageKeyValue>();
					ArrayList finalData = new ArrayList();
					for (int keyStart = 0; keyStart < keys.size(); keyStart += MAX_SQL_KEYS)
					{
						int keyCount = Math.min(keys.size() - keyStart, MAX_SQL_KEYS);
						Cursor cursor = database.query(mSQLiteHelper.getTableName(), columns, buildKeySelection(keyCount),
								buildKeySelectionArgs(keys, keyStart, keyCount), null, null, null);
						keysRemaining.clear();
						try
						{
							if (cursor.getCount() != keys.size())
							{
								for (int keyIndex = keyStart; keyIndex < keyStart + keyCount; keyIndex++)
								{
									keysRemaining.add(keys.getString(keyIndex));
								}
							}
							if (cursor.moveToFirst())
							{
								do
								{
									HippyStorageKeyValue item = new HippyStorageKeyValue();
									item.key = cursor.getString(0);
									item.value = cursor.getString(1);
									data.put(item.key, item);
									keysRemaining.remove(item.key);
								}
								while (cursor.moveToNext());
							}
						}
						catch (Throwable e)
						{
							callback.onError(e.getMessage());
							return;
						}
						finally
						{
							cursor.close();
						}

						for (String key : keysRemaining)
						{
							HippyStorageKeyValue item = new HippyStorageKeyValue();
							item.key = key;
							item.value = "";
							data.put(item.key, item);
						}
						keysRemaining.clear();
					}
					int size = keys.size();
					int index;
					String key;
					for (index = 0; index < size; index++)
					{
						key = keys.getString(index);
						finalData.add(data.get(key));
					}
					data.clear();

					callback.onSuccess(finalData);
				}
				catch (Throwable e)
				{
					callback.onError(e.getMessage());
				}
			}
		});
	}

	@Override
	public void multiSet(final List<HippyStorageKeyValue> keyValues, final Callback<Void> callback)
	{
		execute(new Runnable()
		{
			@Override
			public void run()
			{
				try
				{
					SQLiteDatabase database = mSQLiteHelper.getDatabase();
					if (database == null)
					{
						callback.onError("Database Error");
						return;
					}
					String sql = "INSERT OR REPLACE INTO " + mSQLiteHelper.getTableName() + " VALUES (?, ?);";
					SQLiteStatement statement = database.compileStatement(sql);
					try
					{
						database.beginTransaction();
						for (HippyStorageKeyValue keyValue : keyValues)
						{
							statement.clearBindings();
							statement.bindString(1, keyValue.key);
							statement.bindString(2, keyValue.value);
							statement.execute();
						}
						database.setTransactionSuccessful();
						callback.onSuccess(null);
					}
					catch (Throwable e)
					{
						callback.onError(e.getMessage());
					}
					finally
					{
						database.endTransaction();
					}
				}
				catch (Throwable e)
				{
					callback.onError(e.getMessage());
				}
			}
		});
	}

	@Override
	public void multiRemove(final HippyArray keys, final Callback<Void> callback)
	{
		execute(new Runnable()
		{
			@Override
			public void run()
			{
				try
				{
					SQLiteDatabase database = mSQLiteHelper.getDatabase();
					if (database == null)
					{
						callback.onError("Database Error");
						return;
					}
					try
					{
						database.beginTransaction();
						for (int keyStart = 0; keyStart < keys.size(); keyStart += MAX_SQL_KEYS)
						{
							int keyCount = Math.min(keys.size() - keyStart, MAX_SQL_KEYS);
							database.delete(mSQLiteHelper.getTableName(), buildKeySelection(keyCount),
									buildKeySelectionArgs(keys, keyStart, keyCount));
						}
						database.setTransactionSuccessful();
						callback.onSuccess(null);
					}
					catch (Throwable e)
					{
						callback.onError(e.getMessage());
					}
					finally
					{
						database.endTransaction();
					}
				}
				catch (Throwable e)
				{
					callback.onError(e.getMessage());
				}
			}
		});
	}

	@Override
	public void getAllKeys(final Callback<HippyArray> callback)
	{
		execute(new Runnable()
		{
			@Override
			public void run()
			{
				try
				{
					SQLiteDatabase database = mSQLiteHelper.getDatabase();
					if (database == null)
					{
						callback.onError("Database Error");
						return;
					}

					HippyArray data = new HippyArray();
					String[] columns = { IHippySQLiteHelper.COLUMN_KEY };
					Cursor cursor = database.query(mSQLiteHelper.getTableName(), columns, null, null, null, null, null);
					try
					{
						if (cursor.moveToFirst())
						{
							do
							{
								data.pushString(cursor.getString(0));
							}
							while (cursor.moveToNext());
						}
					}
					catch (Exception e)
					{
						callback.onError(e.getMessage());
						return;
					}
					finally
					{
						cursor.close();
					}
					callback.onSuccess(data);
				}
				catch (Throwable e)
				{
					callback.onError(e.getMessage());
				}
			}
		});
	}

	private void execute(final Runnable runnable)
	{
		if (mExecutor == null)
		{
			if(mExecutorService == null)
			{
				mExecutorService = Executors.newSingleThreadExecutor();
			}
			mExecutor = mExecutorService;
		}

		if (runnable != null)
		{
			mExecutor.execute(runnable);
		}
	}

    public void destroyIfNeed()
	{
		if(mExecutorService != null && !mExecutorService.isShutdown())
		{
			mExecutorService.shutdown();
			mExecutorService = null;
		}

		if (mSQLiteHelper != null) {
			mSQLiteHelper.onDestroy();
		}
    }
}
