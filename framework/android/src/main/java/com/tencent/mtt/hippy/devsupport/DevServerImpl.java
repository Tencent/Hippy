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

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Application;
import android.content.Context;
import android.content.DialogInterface;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.openhippy.framework.BuildConfig;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import java.util.HashMap;
import java.util.Stack;

public class DevServerImpl implements DevServerInterface, View.OnClickListener,
        DevExceptionDialog.OnReloadListener, LiveReloadController.LiveReloadCallback {

    private static final String TAG = "DevServerImpl";
    private final boolean mDebugMode;
    @NonNull
    private final DevServerHelper mFetchHelper;
    @NonNull
    private Stack<DevFloatButton> mDevButtonStack = new Stack<>();
    @NonNull
    private HashMap<Integer, DevFloatButton> mDevButtonMaps = new HashMap<>();
    DevServerCallBack mServerCallBack;
    DevExceptionDialog mExceptionDialog;
    @Nullable
    private DevServerConfig mServerConfig;

    DevServerImpl(HippyGlobalConfigs configs, String serverHost, String bundleName,
            String remoteServerUrl, boolean debugMode) {
        mDebugMode = debugMode;
        mFetchHelper = new DevServerHelper(configs, serverHost, remoteServerUrl);
        if (mDebugMode) {
            mServerConfig = new DevServerConfig(serverHost, bundleName);
        }
    }

    private void handleItemsClick(int which) {
        switch (which) {
            case 0:
                if (mDebugMode) {
                    reload();
                } else {

                }
                break;
            case 1:
                if (!mDebugMode) {
                    reload();
                }
                break;
            default:
                LogUtils.w(TAG, "handleItemsClick: Unexpected item index " + which);
        }

    }

    @Override
    public void onClick(final View v) {
        if (v.getContext() instanceof Application) {
            LogUtils.e(TAG, "Hippy context is an Application, so can not show a dialog!");
        } else {
            String[] debugItems = {"Reload"};
            //String[] developItems = {"Destroy", "Create"};
            new AlertDialog.Builder(v.getContext()).setItems (
                    debugItems,
                    new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            if (which == 0) {
                                reload();
                            }
                        }
                    }).show();
        }
    }

    private void attachToHostImpl(Context context, int rootId) {
        if (!mDebugMode) {
            return;
        }
        if (mDevButtonMaps == null) {
            mDevButtonMaps = new HashMap<>();
        }
        if (mDevButtonMaps.get(rootId) != null) {
            return;
        }
        DevFloatButton devButton = new DevFloatButton(context);
        devButton.setOnClickListener(this);
        if (context instanceof Activity) {
            ViewGroup decorView = (ViewGroup) ((Activity) context).getWindow().getDecorView();
            decorView.addView(devButton);
        }
        mDevButtonMaps.put(rootId, devButton);
        mDevButtonStack.add(devButton);
    }

    @Override
    public void attachToHost(final Context context, final int rootId) {
        if (UIThreadUtils.isOnUiThread()) {
            attachToHostImpl(context, rootId);
        } else {
            UIThreadUtils.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    attachToHostImpl(context, rootId);
                }
            });
        }
    }

    @Override
    public void detachFromHost(Context context, int rootId) {
        if (!BuildConfig.DEBUG || mDevButtonMaps == null) {
            return;
        }
        DevFloatButton button = mDevButtonMaps.get(rootId);
        if (button != null) {
            if (mDevButtonStack != null) {
                mDevButtonStack.remove(rootId);
            }
            ViewParent parent = button.getParent();
            if (parent instanceof ViewGroup) {
                ((ViewGroup) parent).removeView(button);
            }
        }
    }

    @Override
    public View getDevButton(int rootId) {
        if (mDevButtonMaps != null) {
            return mDevButtonMaps.get(rootId);
        }
        return null;
    }

    @Override
    @Nullable
    public String createResourceUrl(String resName) {
        if (mDebugMode) {
            assert mServerConfig != null;
            return mFetchHelper.createBundleURL(mServerConfig.getServerHost(), resName,
                    mServerConfig.enableRemoteDebug(), false, false);
        }
        return null;
    }

    @Override
    public void onLoadResourceFailed(@NonNull String url, @Nullable String errorMessage) {
        DevServerException exception = new DevServerException(
                "Could not connect to development server." + "URL: " + url
                        + "  try to :adb reverse tcp:38989 tcp:38989 , message : " + errorMessage);
        if (mDevButtonStack.isEmpty()) {
            mServerCallBack.onInitDevError(exception);
        } else {
            handleException(exception);
        }
    }

    @Override
    @Nullable
    public String createDebugUrl(String host, String componentName, String debugClientId) {
        if (mDebugMode) {
            assert mServerConfig != null;
            if (TextUtils.isEmpty(componentName)) {
                componentName = mServerConfig.getBundleName();
            }
            return mFetchHelper.createDebugURL(host, componentName, debugClientId);
        }
        return null;
    }

    @Override
    public void reload() {
        if (mServerCallBack != null) {
            mServerCallBack.onDebugReLoad();
        }
    }

    @Override
    public void setDevServerCallback(DevServerCallBack devServerCallback) {
        this.mServerCallBack = devServerCallback;
    }

    @Override
    public void handleException(final Throwable throwable) {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (mExceptionDialog != null && mExceptionDialog.isShowing()) {
                    return;
                }
                DevFloatButton button = mDevButtonStack.peek();
                if (button != null) {
                    mExceptionDialog = new DevExceptionDialog(button.getContext());
                    mExceptionDialog.handleException(throwable);
                    mExceptionDialog.setOnReloadListener(DevServerImpl.this);
                    mExceptionDialog.show();
                }
            }
        });
    }

    @Override
    public void onReload() {
        reload();
    }

    @Override
    public void onCompileSuccess() {
        reload();
    }

    @Override
    public void onLiveReloadReady() {
        reload();
    }
}
