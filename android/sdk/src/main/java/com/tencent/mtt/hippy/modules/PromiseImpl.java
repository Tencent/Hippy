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

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.HippyEngine.BridgeTransferType;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.runtime.builtins.JSMap;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;
import java.util.HashMap;

@SuppressWarnings({"deprecation", "unused"})
public class PromiseImpl implements Promise {

    public static final int PROMISE_CODE_SUCCESS = 0;
    public static final int PROMISE_CODE_NORMAN_ERROR = 1;
    public static final int PROMISE_CODE_OTHER_ERROR = 2;
    private static final String CALL_ID_NO_CALLBACK = "-1";
    private HippyEngineContext mContext;
    private final String mModuleName;
    private final String mModuleFunc;
    private final String mCallId;
    private boolean mNeedResolveBySelf = true;
    private BridgeTransferType transferType = BridgeTransferType.BRIDGE_TRANSFER_TYPE_NORMAL;

    public PromiseImpl(HippyEngineContext context, String moduleName, String moduleFunc,
            String callId) {
        this.mContext = context;
        this.mModuleName = moduleName;
        this.mModuleFunc = moduleFunc;
        this.mCallId = callId;
    }

    public void setContext(HippyEngineContext context) {
        mContext = context;
    }

    public String getCallId() {
        return mCallId;
    }

    public boolean isCallback() {
        return !TextUtils.equals(mCallId, CALL_ID_NO_CALLBACK);
    }

    @Override
    public void setTransferType(BridgeTransferType type) {
        transferType = type;
    }

    @Override
    public void resolve(Object value) {
        doCallback(PROMISE_CODE_SUCCESS, value);
    }

    @Override
    public void reject(Object error) {
        doCallback(PROMISE_CODE_OTHER_ERROR, error);
    }

    public void setNeedResolveBySelf(boolean falg) {
        mNeedResolveBySelf = falg;
    }

    public boolean needResolveBySelf() {
        return mNeedResolveBySelf;
    }

    private boolean onInterceptPromiseCallBack(Object resultObject) {
        HippyEngineMonitorAdapter adapter = mContext.getGlobalConfigs().getEngineMonitorAdapter();
        if (adapter == null) {
            return false;
        }
        return adapter
                .onInterceptPromiseCallback(mContext.getComponentName(), mModuleName, mModuleFunc,
                        mCallId, resultObject);
    }

    public void doCallback(int code, Object resultObject) {
        if (onInterceptPromiseCallBack(resultObject) || TextUtils
                .equals(CALL_ID_NO_CALLBACK, mCallId)) {
            return;
        }
        if (resultObject instanceof JSValue) {
            JSObject jsObject = new JSObject();
            jsObject.set("result", code);
            jsObject.set("moduleName", mModuleName);
            jsObject.set("moduleFunc", mModuleFunc);
            jsObject.set("callId", mCallId);
            jsObject.set("params", resultObject);
            mContext.getBridgeManager().execCallback(jsObject, transferType);
        } else {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushInt("result", code);
            hippyMap.pushString("moduleName", mModuleName);
            hippyMap.pushString("moduleFunc", mModuleFunc);
            hippyMap.pushString("callId", mCallId);
            hippyMap.pushObject("params", resultObject);
            mContext.getBridgeManager().execCallback(hippyMap, transferType);
        }
    }
}
