package com.tencent.mtt.hippy.modules.nativemodules.clipboard;

import android.content.ClipData;
import android.content.Context;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import android.content.ClipboardManager;

/**
 * Clipboard Service.
 * Created by robinsli on 2019/5/31 0004.
 */

@HippyNativeModule(name = "ClipboardModule")
public class ClipboardModule extends HippyNativeModuleBase
{
    private final ClipboardManager mClipboardManager;
    public ClipboardModule(HippyEngineContext context)
    {
        super(context);
        mClipboardManager = (ClipboardManager) (mContext.getGlobalConfigs()).getContext().getSystemService(Context.CLIPBOARD_SERVICE);
    }


    private ClipboardManager getClipboardService() {
       return   mClipboardManager;
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "getString")
    public void getString(Promise promise) {
        try {
            ClipboardManager clipboard = getClipboardService();
            ClipData clipData = clipboard.getPrimaryClip();
            if (clipData != null && clipData.getItemCount() >= 1) {
                ClipData.Item firstItem = clipboard.getPrimaryClip().getItemAt(0);
                promise.resolve("" + firstItem.getText());
            } else {
                promise.resolve("");
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "setString")
    public void setString(String text) {
        ClipData clipdata = ClipData.newPlainText(null, text);
        ClipboardManager clipboard = getClipboardService();
        clipboard.setPrimaryClip(clipdata);
    }
}
