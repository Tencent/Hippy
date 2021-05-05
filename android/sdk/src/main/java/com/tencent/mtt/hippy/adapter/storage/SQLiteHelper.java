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
import android.database.sqlite.SQLiteException;
import android.database.sqlite.SQLiteOpenHelper;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.Objects;

public class SQLiteHelper extends SQLiteOpenHelper implements IHippySQLiteHelper
{

	private static final String	TABLE_STORAGE			= "hippy_engine_storage";
	private static final int	SLEEP_TIME_MS			= 30;
	private static final String	DATABASE_NAME			= "HippyStorage";
	private static final int	DATABASE_VERSION		= 1;
	@SuppressWarnings("SyntaxError")
	private static final String	STATEMENT_CREATE_TABLE	= "CREATE TABLE IF NOT EXISTS " + TABLE_STORAGE + " (" + COLUMN_KEY + " TEXT PRIMARY KEY,"
																+ COLUMN_VALUE + " TEXT NOT NULL)";
	private SQLiteDatabase		mDb;
	private final Context		mContext;

	public SQLiteHelper(Context context)
	{
		super(context, DATABASE_NAME, null, DATABASE_VERSION);
		mContext = context;
	}

	@Override
	public void onCreate(SQLiteDatabase db)
	{
		db.execSQL(STATEMENT_CREATE_TABLE);
	}

	@Override
	public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
		if (oldVersion != newVersion) {
			boolean ret = deleteDatabase();
			LogUtils.d("SQLiteHelper", "onUpgrade: deleteDatabase ret=" + ret);
			onCreate(db);
		}
	}

	@Override
	public synchronized SQLiteDatabase getDatabase()
	{
		ensureDatabase();
		return mDb;
	}

	@Override
	public String getTableName()
	{
		return TABLE_STORAGE;
	}

	@Override
	public void onDestroy() {
		closeDatabase();
	}

	synchronized void ensureDatabase()
	{
		if (mDb != null && mDb.isOpen())
		{
			return;
		}

		SQLiteException lastSQLiteException = null;
		for (int tries = 0; tries < 2; tries++)
		{
			try {
				if (tries > 0) {
					boolean ret = deleteDatabase();
					LogUtils.d("SQLiteHelper", "ensureDatabase: deleteDatabase ret=" + ret);
				}
				mDb = getWritableDatabase();
				break;
			}
			catch (SQLiteException e)
			{
				lastSQLiteException = e;
			}
			try
			{
				Thread.sleep(SLEEP_TIME_MS);
			}
			catch (InterruptedException ie)
			{
				Thread.currentThread().interrupt();
			}
		}
		if (mDb == null)
		{
			throw Objects.requireNonNull(lastSQLiteException);
		}
		createTableIfNotExists(mDb);
		long mMaximumDatabaseSize = 50L * 1024L * 1024L;
		mDb.setMaximumSize(mMaximumDatabaseSize);
	}

	private synchronized boolean deleteDatabase()
	{
		closeDatabase();
		return mContext.deleteDatabase(DATABASE_NAME);
	}

	private synchronized void closeDatabase()
	{
		if (mDb != null && mDb.isOpen())
		{
			mDb.close();
			mDb = null;
		}
	}

	private void createTableIfNotExists(SQLiteDatabase db)
	{
		try (Cursor cursor = db.rawQuery(
				"SELECT DISTINCT tbl_name FROM sqlite_master WHERE tbl_name = '" + TABLE_STORAGE
						+ "'", null)) {
			if (cursor != null && cursor.getCount() > 0) {
				return;
			}
			db.execSQL(STATEMENT_CREATE_TABLE);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
