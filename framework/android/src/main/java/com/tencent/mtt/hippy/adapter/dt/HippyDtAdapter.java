package com.tencent.mtt.hippy.adapter.dt;

import android.view.View;
import com.tencent.mtt.hippy.common.HippyMap;

public interface HippyDtAdapter {
  /**
   * 设置页面及相关参数
   *
   * @param page   Page对象，支持View/Fragment/Activity
   * @param params Page参数
   */
  void setDtPageParams(Object page, HippyMap params);

  /**
   * 设置元素及其相关参数
   *
   * @param element 元素对象，支持View
   * @param params  元素参数
   */
  void setDtElementParams(Object element, HippyMap params);

  /**
   * 遍历当前页面的元素进行曝光
   */
  void traverseExposure();

  /**
   * 遍历检测页面并进行元素曝光
   */
  void traversePage(View view);
}
