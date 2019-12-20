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
package com.tencent.mtt.hippy.devsupport;

import android.app.ProgressDialog;
import android.content.Context;

import com.tencent.mtt.hippy.modules.nativemodules.HippySettableFuture;

/**
 * Copyright (C) 2005-2020 TENCENT Inc.All Rights Reserved.
 * FileName: DevRemoteDebugManager
 * Description：
 * History：
 */
public class DevRemoteDebugManager implements DevRemoteDebugProxy
{

	DevServerHelper				mFetchHelper;

	ProgressDialog				mProgressDialog;

	RemoteDebugExceptionHandler	mRemoteDebugExceptionHandler;

	Context						mContext;

	public DevRemoteDebugManager(Context context, DevServerHelper fetchHelper, RemoteDebugExceptionHandler handler)
	{
		this.mContext = context;
		this.mFetchHelper = fetchHelper;
		this.mRemoteDebugExceptionHandler = handler;
	}


	private void showProgressDialog(Context context)
	{
		if(context == null)
		{
			return;
		}

		if (mProgressDialog == null)
		{
			mProgressDialog = new ProgressDialog(context);
			mProgressDialog.setCancelable(true);
			mProgressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
		}
		mProgressDialog.show();
	}

	@Override
	public void destroy()
	{
		if (mProgressDialog != null)
		{
			mProgressDialog.dismiss();
		}
	}

	public void handleException(Throwable t)
	{
		if (mRemoteDebugExceptionHandler != null)
		{
			mRemoteDebugExceptionHandler.onHandleRemoteDebugException(t);
		}
	}

	public interface RemoteDebugExceptionHandler
	{
		public void onHandleRemoteDebugException(Throwable t);
	}
}
