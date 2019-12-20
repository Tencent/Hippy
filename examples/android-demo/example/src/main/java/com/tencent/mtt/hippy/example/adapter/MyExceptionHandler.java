package com.tencent.mtt.hippy.example.adapter;

import android.util.Log;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.example.MyActivity;
import com.tencent.mtt.hippy.example.MyActivityTiny;

/**
 * @Description:
 * @author: edsheng
 * @date: 2018/9/6 12:53
 * @version: V1.0
 * 2019/3/26 harryguo注释：
 * 老的异常捕获器。将被废弃
 * 请参见{@link MyActivity}
 * 和{@link MyActivityTiny}（最精简的代码）
 */
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
