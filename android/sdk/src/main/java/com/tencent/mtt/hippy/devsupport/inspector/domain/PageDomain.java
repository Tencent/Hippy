package com.tencent.mtt.hippy.devsupport.inspector.domain;

import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Message;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.inspector.Inspector;
import com.tencent.mtt.hippy.devsupport.inspector.model.InspectEvent;
import com.tencent.mtt.hippy.devsupport.inspector.model.PageModel;
import com.tencent.mtt.hippy.utils.LogUtils;
import org.json.JSONObject;

public class PageDomain extends InspectorDomain implements Handler.Callback, PageModel.FrameUpdateListener {

  private static final String TAG = "PageDomain";

  public static final String PAGE_DOMAIN_NAME = "Page";

  private static final String METHOD_START_SCREEN_CAST = "startScreencast";
  private static final String METHOD_STOP_SCREEN_CAST = "stopScreencast";
  private static final String METHOD_SCREEN_FRAME_ACK = "screencastFrameAck";

  private static final int MSG_START_SCREEN_CAST = 0x01;
  private static final int MSG_SCREEN_CAST_ACK = 0x02;

  private static final long FRAME_CALLBACK_INTERVAL = 1000L;
  private static final long DELAY_FOR_FRAME_UPDATE = 100L;

  public static final String BUNDLE_KEY_PARAM = "params";

  private PageModel mPageModel;
  private ScreenCastHandlerThread mHandlerThread;
  private volatile boolean mIsFrameUpdate;
  private int mLastSessionId = -1;

  public PageDomain(Inspector inspector) {
    super(inspector);
    mPageModel = new PageModel();
  }

  @Override
  public String getDomainName() {
    return PAGE_DOMAIN_NAME;
  }

  @Override
  public boolean handleRequest(HippyEngineContext context, String method, int id,
    JSONObject paramsObj) {
    switch (method) {
      case METHOD_START_SCREEN_CAST:
        handleStartScreenCast(context, id, paramsObj);
        break;
      case METHOD_STOP_SCREEN_CAST:
        handleStopScreenCast(context);
        break;
      case METHOD_SCREEN_FRAME_ACK:
        handleScreenFrameAck(context, paramsObj);
        break;
      default:
        return false;
    }
    return true;
  }

  private void handleStartScreenCast(HippyEngineContext context, int id, JSONObject paramsObj) {
    mHandlerThread = new ScreenCastHandlerThread(this);
    Handler hander = mHandlerThread.getHandler();
    Message msg = hander.obtainMessage(MSG_START_SCREEN_CAST);
    msg.obj = context;
    if (paramsObj != null) {
      Bundle bundle = new Bundle();
      bundle.putString(BUNDLE_KEY_PARAM, paramsObj.toString());
      msg.setData(bundle);
    }
    hander.sendMessage(msg);
  }

  private void handleStopScreenCast(HippyEngineContext context) {
    mPageModel.stopScreenCast(context);
    if (mHandlerThread != null) {
      Handler hander = mHandlerThread.getHandler();
      hander.removeMessages(MSG_START_SCREEN_CAST);
      hander.removeMessages(MSG_SCREEN_CAST_ACK);
      mHandlerThread.quit();
      mHandlerThread = null;
    }
  }

  @Override
  public void onFrontendClosed(HippyEngineContext context) {
    handleStopScreenCast(context);
    mPageModel.clear();
  }

  private void handleScreenFrameAck(final HippyEngineContext context, final JSONObject paramsObj) {
    if (mHandlerThread != null && paramsObj != null) {
      if (!mPageModel.canListenFrameUpdate()) {
        Handler hander = mHandlerThread.getHandler();
        Message msg = hander.obtainMessage(MSG_SCREEN_CAST_ACK);
        msg.obj = context;
        msg.arg1 = paramsObj.optInt("sessionId");
        hander.removeMessages(MSG_SCREEN_CAST_ACK);
        hander.sendMessageDelayed(msg, FRAME_CALLBACK_INTERVAL);
      } else {
        int sessionId = paramsObj.optInt("sessionId");
        if (mIsFrameUpdate) {
          Handler hander = mHandlerThread.getHandler();
          Message msg = hander.obtainMessage(MSG_SCREEN_CAST_ACK);
          msg.obj = context;
          msg.arg1 = sessionId;
          hander.removeMessages(MSG_SCREEN_CAST_ACK);
          hander.sendMessageDelayed(msg, DELAY_FOR_FRAME_UPDATE);
          mIsFrameUpdate = false;
        } else {
          mLastSessionId = sessionId;
        }
      }
    }
  }

  @Override
  public boolean handleMessage(Message message) {
    switch (message.what) {
      case MSG_START_SCREEN_CAST: {
        HippyEngineContext context = (HippyEngineContext) message.obj;
        JSONObject paramsObj = null;
        Bundle bundle = message.getData();
        if (bundle != null) {
          try {
            paramsObj = new JSONObject(bundle.getString(BUNDLE_KEY_PARAM));
          } catch (Exception e) {
            LogUtils.e(TAG, "handleMessage, MSG_START_SCREEN_CAST paramObj parse exception=", e);
          }
        }
        JSONObject result = mPageModel.startScreenCast(context, paramsObj);
        InspectEvent event = new InspectEvent("Page.screencastFrame", result);
        sendEventToFrontend(event);
        if (mPageModel.canListenFrameUpdate()) {
          mPageModel.setFrameUpdateListener(this);
        }
        break;
      }
      case MSG_SCREEN_CAST_ACK: {
        HippyEngineContext context = (HippyEngineContext) message.obj;
        int sessionId = message.arg1;
        JSONObject result = mPageModel.screenFrameAck(context, sessionId);
        // 无数据不返回
        if (result != null) {
          InspectEvent event = new InspectEvent("Page.screencastFrame", result);
          sendEventToFrontend(event);
        }
        break;
      }
    }
    return false;
  }

  @Override
  public void onFrameUpdate(HippyEngineContext context) {
    mIsFrameUpdate = true;

    if (mHandlerThread != null && mLastSessionId != -1) {
        Handler hander = mHandlerThread.getHandler();
        Message msg = hander.obtainMessage(MSG_SCREEN_CAST_ACK);
        msg.obj = context;
        msg.arg1 = mLastSessionId;
        hander.removeMessages(MSG_SCREEN_CAST_ACK);
        hander.sendMessageDelayed(msg, DELAY_FOR_FRAME_UPDATE);
        mIsFrameUpdate = false;
      }
  }

  final static class ScreenCastHandlerThread extends HandlerThread {

    final Handler mHandler;

    public ScreenCastHandlerThread(Handler.Callback callback) {
      super("ScreenCastHandlerThread");
      setPriority(Thread.NORM_PRIORITY);
      start();
      mHandler = new Handler(getLooper(), callback);
    }

    public boolean isThreadAlive() {
      return (mHandler != null && getLooper() != null && isAlive());
    }

    @Override
    public boolean quit() {
      if (Build.VERSION.SDK_INT > Build.VERSION_CODES.JELLY_BEAN_MR2) {
        return super.quitSafely();
      } else {
        mHandler.post(new Runnable() {
          @Override
          public void run() {
            ScreenCastHandlerThread.super.quit();
          }
        });
      }
      return true;
    }

    public Handler getHandler() {
      return mHandler;
    }
  }

}
