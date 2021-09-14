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
package com.tencent.mtt.hippy;

import android.content.Context;
import android.os.Build;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.WindowManager;
import android.widget.FrameLayout;

import com.tencent.mtt.hippy.adapter.device.HippyDeviceAdapter;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.HippyTag;
import com.tencent.mtt.hippy.devsupport.DevFloatButton;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.javascriptmodules.Dimensions;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.TimeMonitor;

import java.lang.reflect.Method;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static android.content.res.Configuration.ORIENTATION_UNDEFINED;

@SuppressWarnings({"deprecation", "unused"})
public class HippyRootView extends FrameLayout {

  private static final int ROOT_VIEW_TAG_INCREMENT = 10;

  private static final AtomicInteger ID_COUNTER = new AtomicInteger(0);

  OnSizeChangedListener mSizeChangListener;

  private final int mInstanceId;

  private final HippyEngine.ModuleLoadParams mLoadParams;

  private HippyEngineContext mEngineContext;

  private GlobalLayoutListener mGlobalLayoutListener;

  private OnResumeAndPauseListener mOnResumeAndPauseListener;

  private OnLoadCompleteListener mOnLoadCompleteListener;

  private TimeMonitor mTimeMonitor;

  protected boolean mLoadCompleted = false;

  public HippyRootView(HippyEngine.ModuleLoadParams loadParams) {
    super(loadParams.hippyContext != null ? loadParams.hippyContext
        : new HippyInstanceContext(loadParams.context, loadParams));

    mLoadParams = loadParams;
    mInstanceId = ID_COUNTER.addAndGet(ROOT_VIEW_TAG_INCREMENT);

    setId(mInstanceId);
    setClipChildren(false);
    HippyMap tagMap = HippyTag.createTagMap(NodeProps.ROOT_NODE, null);
    setTag(tagMap);
    getViewTreeObserver().addOnGlobalLayoutListener(getGlobalLayoutListener());
    setOnSystemUiVisibilityChangeListener(getGlobalLayoutListener());
  }

  public void attachEngineManager(HippyEngine hippyEngineManager) {
    HippyInstanceContext hippyInstanceContext = (HippyInstanceContext) getContext();
    hippyInstanceContext.attachEngineManager(hippyEngineManager);

  }

  // HippyRootView上添加View了，说明jsbundle正常工作了
  @Override
  public void onViewAdded(View child) {
    // 若HippyRootView所依赖的Context不是Activity，则调试模式下的那个按钮会先添加到HippyRootView上，从而触发此处的onViewAdded
    if (!mLoadCompleted && !(child instanceof DevFloatButton)) {
      mLoadCompleted = true;
      if (mTimeMonitor != null) {
        mTimeMonitor.end();
        if (mOnLoadCompleteListener != null) {
          mOnLoadCompleteListener
              .onLoadComplete(mTimeMonitor.getTotalTime(), mTimeMonitor.getEvents());
        }
        mEngineContext.getGlobalConfigs().getEngineMonitorAdapter()
            .reportModuleLoadComplete(this, mTimeMonitor.getTotalTime(), mTimeMonitor.getEvents());
      }
    }
  }

  public String getName() {
    return mLoadParams.componentName;
  }

  public int getId() {
    return mInstanceId;
  }

  public Context getHost() {
    return mLoadParams.context;
  }

  public HippyMap getLaunchParams() {
    return mLoadParams.jsParams;
  }

  public HippyEngineContext getEngineContext() {
    return mEngineContext;
  }

  public void setOnSizeChangedListener(OnSizeChangedListener listener) {
    this.mSizeChangListener = listener;
  }

  public void setOnResumeAndPauseListener(OnResumeAndPauseListener listener) {
    this.mOnResumeAndPauseListener = listener;
  }

  public void setOnLoadCompleteListener(OnLoadCompleteListener listener) {
    this.mOnLoadCompleteListener = listener;
  }

  @Override
  protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
    // No-op since UIManagerModule handles actually laying out children.
  }

  @Override
  protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec),
        MeasureSpec.getSize(heightMeasureSpec));
    //		super.onMeasure(widthMeasureSpec, heightMeasureSpec);
  }

  @Override
  protected void onSizeChanged(int w, int h, int oldw, int oldh) {
    super.onSizeChanged(w, h, oldw, oldh);

    if (w != oldw || h != oldh) {
      getGlobalLayoutListener().checkUpdateDimension(w, h, false, false);
      if (mEngineContext != null) {
        HippyModuleManager manager = mEngineContext.getModuleManager();
        if (manager != null) {
          HippyMap hippyMap = new HippyMap();
          hippyMap.pushDouble("width", PixelUtil.px2dp(w));
          hippyMap.pushDouble("height", PixelUtil.px2dp(h));
          hippyMap.pushDouble("oldWidth", PixelUtil.px2dp(oldw));
          hippyMap.pushDouble("oldHeight", PixelUtil.px2dp(oldh));
          manager.getJavaScriptModule(EventDispatcher.class)
              .receiveNativeEvent("onSizeChanged", hippyMap);
        }
      }
      if (mSizeChangListener != null) {
        mSizeChangListener.onSizeChanged(this, w, h, oldw, oldh);
      }
    }
  }

  public void attachToEngine(HippyEngineContext context) {
    mEngineContext = context;
    ((HippyInstanceContext) getContext()).setEngineContext(context);
    getGlobalLayoutListener().checkUpdateDimension(false, false);
  }

  public void onResume() {
    if (mOnResumeAndPauseListener != null) {
      mOnResumeAndPauseListener.onInstanceResume(getId());
    }
  }

  public void onPause() {
    if (mOnResumeAndPauseListener != null) {
      mOnResumeAndPauseListener.onInstancePause(getId());
    }
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    try {
      getViewTreeObserver().removeGlobalOnLayoutListener(getGlobalLayoutListener());

      //java.lang.ArrayIndexOutOfBoundsException
    } catch (Throwable e) {
      e.printStackTrace();
    }
    getViewTreeObserver().addOnGlobalLayoutListener(getGlobalLayoutListener());
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    try {
      getViewTreeObserver().removeGlobalOnLayoutListener(getGlobalLayoutListener());
    } catch (Throwable e) {
      e.printStackTrace();
    }
  }

  void destroy() {
    if (getContext() instanceof HippyInstanceContext) {
      ((HippyInstanceContext) getContext()).notifyInstanceDestroy();
    }
  }

  private GlobalLayoutListener getGlobalLayoutListener() {
    if (mGlobalLayoutListener == null) {
      mGlobalLayoutListener = new GlobalLayoutListener();
    }
    return mGlobalLayoutListener;
  }

  public void startMonitorEvent(String eventName) {
    if (mTimeMonitor != null) {
      mTimeMonitor.startEvent(eventName);
    }
  }

  public TimeMonitor getTimeMonitor() {
    return mTimeMonitor;
  }

  public void setTimeMonitor(TimeMonitor timeMonitor) {
    this.mTimeMonitor = timeMonitor;
  }

  public interface OnSizeChangedListener {

    void onSizeChanged(HippyRootView rootView, int width, int height, int oldWidth, int oldHeight);
  }

  public interface OnResumeAndPauseListener {

    void onInstanceResume(int id);

    void onInstancePause(int id);
  }

  public interface OnLoadCompleteListener {

    void onLoadComplete(int loadTime, List<HippyEngineMonitorEvent> loadEvents);
  }

  private class GlobalLayoutListener implements ViewTreeObserver.OnGlobalLayoutListener,
      OnSystemUiVisibilityChangeListener {

    private int mOrientation = ORIENTATION_UNDEFINED;

    @SuppressWarnings("RedundantIfStatement")
    @Override
    public void onSystemUiVisibilityChange(int visibility) {
      if ((visibility & View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) == 0) {
        checkUpdateDimension(false, true);
      } else {
        checkUpdateDimension(true, true);
      }
    }

    @Override
    public void onGlobalLayout() {
      if (getContext() != null) {
        int orientation = getContext().getResources().getConfiguration().orientation;
        if (orientation != mOrientation) {
          mOrientation = orientation;
          sendOrientationChangeEvent(mOrientation);
          checkUpdateDimension(false, false);
        }
      }
    }

    private void sendOrientationChangeEvent(int orientation) {
      LogUtils.d("HippyRootView", "sendOrientationChangeEvent: orientation=" + orientation);
    }

    private void checkUpdateDimension(boolean shouldUseScreenDisplay,
        boolean systemUiVisibilityChanged) {
      checkUpdateDimension(-1, -1, false, false);
    }

    @SuppressWarnings("SameParameterValue")
    private void checkUpdateDimension(int windowWidth, int windowHeight,
        boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged) {
      if (mEngineContext == null) {
        return;
      }
      DisplayMetrics windowDisplayMetrics = getContext().getResources().getDisplayMetrics();
      DisplayMetrics screenDisplayMetrics = new DisplayMetrics();
      screenDisplayMetrics.setTo(windowDisplayMetrics);
      WindowManager windowManager = (WindowManager) getContext()
          .getSystemService(Context.WINDOW_SERVICE);
      Display defaultDisplay = windowManager.getDefaultDisplay();
      try {
        if (Build.VERSION.SDK_INT >= 17) {
          defaultDisplay.getRealMetrics(screenDisplayMetrics);
        } else {
          //noinspection JavaReflectionMemberAccess
          Method mGetRawH = Display.class.getMethod("getRawHeight");
          //noinspection JavaReflectionMemberAccess
          Method mGetRawW = Display.class.getMethod("getRawWidth");

          Object width = mGetRawW.invoke(defaultDisplay);
          screenDisplayMetrics.widthPixels = width != null ? (Integer) width : 0;

          Object height = mGetRawH.invoke(defaultDisplay);
          screenDisplayMetrics.heightPixels = height != null ? (Integer) height : 0;
        }

      } catch (Throwable throwable) {
        throwable.printStackTrace();
      }

      HippyMap dimensionMap = DimensionsUtil
          .getDimensions(windowWidth, windowHeight, mEngineContext.getGlobalConfigs().getContext(),
              shouldUseScreenDisplay);
      int dimensionW = 0;
      int dimensionH = 0;
      if (dimensionMap != null) {
        HippyMap windowMap = dimensionMap.getMap("windowPhysicalPixels");
        dimensionW = windowMap.getInt("width");
        dimensionH = windowMap.getInt("height");
      }
      // 如果windowHeight是无效值，则允许客户端定制
      if ((windowHeight < 0 || dimensionW == dimensionH)
          && mEngineContext.getGlobalConfigs() != null) {
        HippyDeviceAdapter deviceAdapter = mEngineContext.getGlobalConfigs().getDeviceAdapter();
        if (deviceAdapter != null) {
          deviceAdapter.reviseDimensionIfNeed(getContext(), dimensionMap, shouldUseScreenDisplay,
              systemUiVisibilityChanged);
        }
      }
      if (mEngineContext.getModuleManager() != null) {
        mEngineContext.getModuleManager().getJavaScriptModule(Dimensions.class).set(dimensionMap);
      }
    }
  }
}
