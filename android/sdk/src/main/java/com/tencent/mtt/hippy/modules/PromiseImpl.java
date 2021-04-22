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
package com.tencent.mtt.hippy.modules;


import android.text.TextUtils;

import com.tencent.mtt.hippy.HippyEngine.BridgeTransferType;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyMap;

/**
 * FileName: PromiseImpl
 * Description：
 * History：
 */
public class PromiseImpl implements Promise
{
	public static final int		PROMISE_CODE_SUCCESS		= 0;
	public static final int		PROMISE_CODE_NORMAN_ERROR	= 1;
	public static final int		PROMISE_CODE_OTHER_ERROR	= 2;
	private static final String	CALL_ID_NO_CALLBACK			= "-1";
	private final HippyEngineContext	mContext;
	private final String				mModuleName;
	private final String				mModuleFunc;
	private final String				mCallId;
	private boolean             mNeedResolveBySelf = true;
	private BridgeTransferType  transferType = BridgeTransferType.BRIDGE_TRANSFER_TYPE_NORMAL;

	public PromiseImpl(HippyEngineContext context, String moduleName, String moduleFunc, String callId)
	{
		this.mContext = context;
		this.mModuleName = moduleName;
		this.mModuleFunc = moduleFunc;
		this.mCallId = callId;
	}

	public String getCallId() {
		return mCallId;
	}

	public boolean isCallback()
	{
		return !TextUtils.equals(mCallId, CALL_ID_NO_CALLBACK);
	}

	@Override
	public void setTransferType(BridgeTransferType type) {
		transferType = type;
	}

	@Override
	public void resolve(Object value)
	{
		doCallback(PROMISE_CODE_SUCCESS, value);
	}

	@Override
	public void reject(Object error)
	{
		doCallback(PROMISE_CODE_OTHER_ERROR, error);
	}

	public void setNeedResolveBySelf(boolean falg)
	{
		mNeedResolveBySelf = falg;
	}

	public boolean needResolveBySelf()
	{
		return mNeedResolveBySelf;
	}

	public void doCallback(int code, Object obj)
	{
		if (TextUtils.equals(CALL_ID_NO_CALLBACK, mCallId))
		{
			return;
		}
		HippyMap map = new HippyMap();
		map.pushInt("result", code);
		map.pushString("moduleName", mModuleName);
		map.pushString("moduleFunc", mModuleFunc);
		map.pushString("callId", mCallId);
		map.pushObject("params", obj);
		mContext.getBridgeManager().execCallback(map, transferType);
	}
}
