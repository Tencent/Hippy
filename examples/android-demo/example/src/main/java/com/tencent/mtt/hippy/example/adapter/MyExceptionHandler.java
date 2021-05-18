package com.tencent.mtt.hippy.example.adapter;

import android.util.Log;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.common.HippyJsException;

@SuppressWarnings({"DeprecatedIsStillUsed", "deprecation", "unused"})
@Deprecated
public class MyExceptionHandler implements HippyExceptionHandlerAdapter {
    @Override
    public void handleJsException(HippyJsException exception) {
        Log.e("hippyerror",exception.getMessage()+exception.getStack());
    }

    @Override
    public void handleNativeException(Exception exception, boolean haveCaught) {

    }

    @Override
    public void handleBackgroundTracing(String details) {

    }
}
